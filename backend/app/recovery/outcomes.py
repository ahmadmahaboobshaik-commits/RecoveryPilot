import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models import Payment, RecoveryEvent
from app.webhooks.schemas import WebhookResponse


def process_verified_outcome(
    payment: Payment,
    rzp_event_id: str,
    rzp_payment_id: Optional[str],
    amount_received: int,
    action_name: Optional[str],
    db: Session
) -> WebhookResponse:
    """
    Processes a verified successful payment outcome for RecoveryPilot:
    1. Validates payment state & amount.
    2. Updates Payment.status to 'recovered'.
    3. Records RecoveryEvent (stage='outcome', outcome='recovered').
    4. Does NOT increment retry_count.
    5. Guarantees recovered revenue is counted exactly once.
    """
    # 1. Check if payment is already recovered
    if payment.status == "recovered":
        # Log duplicate outcome event for audit
        dup_event = RecoveryEvent(
            event_id=f"evt_dup_{uuid.uuid4().hex[:8]}",
            payment_id=payment.payment_id,
            stage="outcome",
            action=action_name or "payment_link",
            reason="Duplicate payment outcome received for already recovered payment",
            touch_number=payment.retry_count,
            timestamp=datetime.now(timezone.utc),
            outcome="already_recovered",
            reference_id=rzp_event_id
        )
        db.add(dup_event)
        db.commit()

        return WebhookResponse(
            status="already_recovered",
            payment_id=payment.payment_id,
            rzp_payment_id=rzp_payment_id,
            reason="Payment is already marked as recovered.",
            amount_received=amount_received,
            amount_expected=payment.amount
        )

    # 2. Check amount match
    if amount_received != payment.amount:
        mismatch_event = RecoveryEvent(
            event_id=f"evt_mm_{uuid.uuid4().hex[:8]}",
            payment_id=payment.payment_id,
            stage="outcome",
            action=action_name or "payment_link",
            reason=f"Amount mismatch: expected {payment.amount} paise, received {amount_received} paise",
            touch_number=payment.retry_count,
            timestamp=datetime.now(timezone.utc),
            outcome="failed",
            reference_id=rzp_event_id
        )
        db.add(mismatch_event)
        db.commit()

        return WebhookResponse(
            status="failed",
            payment_id=payment.payment_id,
            rzp_payment_id=rzp_payment_id,
            reason="amount_mismatch",
            amount_received=amount_received,
            amount_expected=payment.amount
        )

    # 3. Look for previous action taken to associate with outcome
    if not action_name:
        last_action_event = db.query(RecoveryEvent).filter(
            RecoveryEvent.payment_id == payment.payment_id,
            RecoveryEvent.stage == "action_taken"
        ).order_by(RecoveryEvent.timestamp.desc()).first()

        action_name = last_action_event.action if last_action_event else "payment_link"

    # 4. Update Payment Status to recovered (retry_count NOT incremented)
    payment.status = "recovered"

    # 5. Create outcome RecoveryEvent
    outcome_event = RecoveryEvent(
        event_id=f"evt_out_{uuid.uuid4().hex[:8]}",
        payment_id=payment.payment_id,
        stage="outcome",
        action=action_name,
        reason="Verified successful Razorpay payment",
        touch_number=payment.retry_count,
        timestamp=datetime.now(timezone.utc),
        outcome="recovered",
        reference_id=rzp_event_id
    )

    db.add(outcome_event)
    db.commit()
    db.refresh(payment)

    return WebhookResponse(
        status="recovered",
        payment_id=payment.payment_id,
        rzp_payment_id=rzp_payment_id,
        reason="Verified successful Razorpay payment",
        amount_received=amount_received,
        amount_expected=payment.amount
    )
