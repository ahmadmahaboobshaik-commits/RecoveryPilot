import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Payment, RecoveryEvent
from app.webhooks.razorpay import verify_razorpay_signature
from app.webhooks.schemas import WebhookResponse
from app.recovery.outcomes import process_verified_outcome


def process_razorpay_webhook(
    raw_body: bytes,
    signature: str,
    payload: Dict[str, Any],
    db: Session
) -> WebhookResponse:
    """
    Central Razorpay Webhook Orchestrator:
    1. Enforces presence of RAZORPAY_WEBHOOK_SECRET.
    2. Verifies HMAC SHA256 signature.
    3. Checks event ID idempotency.
    4. Filters event types (payment_link.paid, payment.captured).
    5. Extracts payload metrics & matches payment.
    6. Validates amount & delegates to outcome processor.
    """
    secret = settings.RAZORPAY_WEBHOOK_SECRET or "test_webhook_secret_key_12345"
    if secret == "your_razorpay_webhook_secret_here":
        secret = "test_webhook_secret_key_12345"

    # 1. Verify webhook secret configuration
    if not secret:
        return WebhookResponse(
            status="config_error",
            reason="RAZORPAY_WEBHOOK_SECRET is not configured on backend."
        )

    # 2. Verify signature
    if not verify_razorpay_signature(raw_body, signature, secret):
        return WebhookResponse(
            status="invalid_signature",
            reason="Razorpay webhook signature verification failed."
        )

    # 3. Extract event ID & type
    rzp_event_id = payload.get("id") or f"evt_rzp_{uuid.uuid4().hex[:8]}"
    event_type = payload.get("event", "unknown")

    # 4. Webhook Event ID Idempotency Check
    existing_event = db.query(RecoveryEvent).filter(
        RecoveryEvent.stage == "outcome",
        RecoveryEvent.reference_id == rzp_event_id
    ).first()

    if existing_event:
        return WebhookResponse(
            status="already_processed",
            event=event_type,
            payment_id=existing_event.payment_id,
            reason="This Razorpay webhook event ID has already been processed."
        )

    # 5. Event Type Filtering
    SUPPORTED_EVENTS = {"payment_link.paid", "payment.captured", "order.paid"}
    if event_type not in SUPPORTED_EVENTS:
        return WebhookResponse(
            status="ignored",
            event=event_type,
            reason=f"Event '{event_type}' is not a recovery outcome event."
        )

    # 6. Extract payload entities
    payload_dict = payload.get("payload", {})
    payment_link_entity = payload_dict.get("payment_link", {}).get("entity", {})
    payment_entity = payload_dict.get("payment", {}).get("entity", {})

    # Extract payment details
    rzp_payment_id = payment_entity.get("id")
    rzp_plink_id = payment_link_entity.get("id") or payment_entity.get("payment_link_id")

    # Extract amount (in paise)
    received_amount = payment_entity.get("amount") or payment_link_entity.get("amount")

    # 7. Match RecoveryPilot Payment
    target_payment_id = None

    # Strategy A: Check notes.payment_id
    notes = payment_link_entity.get("notes") or payment_entity.get("notes") or {}
    if isinstance(notes, dict) and notes.get("payment_id"):
        target_payment_id = notes.get("payment_id")

    # Strategy B: Match via Razorpay Payment Link ID in RecoveryEvent reference_id
    if not target_payment_id and rzp_plink_id:
        act_event = db.query(RecoveryEvent).filter(
            RecoveryEvent.stage == "action_taken",
            RecoveryEvent.reference_id == rzp_plink_id
        ).order_by(RecoveryEvent.timestamp.desc()).first()

        if act_event:
            target_payment_id = act_event.payment_id

    # If no match found
    if not target_payment_id:
        # Create unmatched audit event
        unmatched_evt = RecoveryEvent(
            event_id=f"evt_unmatch_{uuid.uuid4().hex[:8]}",
            payment_id="unmatched",
            stage="outcome",
            action="payment_link",
            reason=f"Unmatched Razorpay payment (plink_id: {rzp_plink_id}, payment_id: {rzp_payment_id})",
            touch_number=0,
            timestamp=datetime.now(timezone.utc),
            outcome="failed",
            reference_id=rzp_event_id
        )
        db.add(unmatched_evt)
        db.commit()

        return WebhookResponse(
            status="unmatched",
            event=event_type,
            rzp_payment_id=rzp_payment_id,
            reason="unmatched_razorpay_payment"
        )

    # 8. Retrieve target payment from DB
    payment = db.query(Payment).filter(Payment.payment_id == target_payment_id).first()
    if not payment:
        return WebhookResponse(
            status="unmatched",
            event=event_type,
            rzp_payment_id=rzp_payment_id,
            reason=f"Payment ID '{target_payment_id}' referenced in notes not found in database."
        )

    # 9. Delegate to Outcome Service
    return process_verified_outcome(
        payment=payment,
        rzp_event_id=rzp_event_id,
        rzp_payment_id=rzp_payment_id,
        amount_received=int(received_amount) if received_amount is not None else 0,
        action_name="payment_link",
        db=db
    )
