from fastapi import APIRouter, Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.config import settings
from app.webhooks.schemas import WebhookResponse
from app.webhooks.service import process_razorpay_webhook

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])


@router.post("/razorpay", response_model=WebhookResponse)
async def razorpay_webhook_endpoint(request: Request, db: Session = Depends(get_db)):
    """
    Receives and processes incoming Razorpay webhooks:
    1. Reads raw body & X-Razorpay-Signature header.
    2. Validates HMAC signature against RAZORPAY_WEBHOOK_SECRET.
    3. Matches payment, validates amount, & checks idempotency.
    4. Marks payment recovered & logs outcome audit event.
    """
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not secret or secret == "your_razorpay_webhook_secret_here":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay webhook secret (RAZORPAY_WEBHOOK_SECRET) is not configured on server."
        )

    signature = request.headers.get("X-Razorpay-Signature")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'X-Razorpay-Signature' header."
        )

    raw_body = await request.body()

    try:
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload in webhook request."
        )

    result = process_razorpay_webhook(
        raw_body=raw_body,
        signature=signature,
        payload=payload,
        db=db
    )

    if result.status == "invalid_signature":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature."
        )

    return result


@router.post("/simulate/{payment_id}", response_model=WebhookResponse)
def simulate_webhook_settlement(payment_id: str, db: Session = Depends(get_db)):
    """
    Simulates an incoming Razorpay payment success webhook with valid HMAC-SHA256 signature:
    1. Fetches Payment record from SQLite.
    2. Constructs Razorpay payment.captured event payload.
    3. Signs payload with HMAC-SHA256 using server RAZORPAY_WEBHOOK_SECRET.
    4. Passes raw payload and signature into process_razorpay_webhook service.
    5. Signature is verified, payment.status becomes 'recovered', and outcome audit event is recorded.
    """
    secret = settings.RAZORPAY_WEBHOOK_SECRET or "test_webhook_secret_key_12345"

    from app.models import Payment, RecoveryEvent
    import hmac
    import hashlib
    import uuid

    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID '{payment_id}' not found."
        )

    # Find reference_id from latest action_taken event if available
    act_event = db.query(RecoveryEvent).filter(
        RecoveryEvent.payment_id == payment_id,
        RecoveryEvent.stage == "action_taken"
    ).order_by(RecoveryEvent.timestamp.desc()).first()

    plink_ref = act_event.reference_id if act_event else f"plink_sim_{payment_id}"
    rzp_pay_id = f"pay_rzp_{uuid.uuid4().hex[:8]}"
    rzp_evt_id = f"evt_rzp_{uuid.uuid4().hex[:8]}"

    payload = {
        "id": rzp_evt_id,
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": rzp_pay_id,
                    "amount": payment.amount,
                    "payment_link_id": plink_ref,
                    "notes": {
                        "payment_id": payment.payment_id,
                        "customer_id": payment.customer_id
                    }
                }
            }
        }
    }

    raw_body = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    signature = hmac.new(secret.encode('utf-8'), raw_body, hashlib.sha256).hexdigest()

    result = process_razorpay_webhook(
        raw_body=raw_body,
        signature=signature,
        payload=payload,
        db=db
    )
    return result


@router.post("/simulate-invalid/{payment_id}", response_model=WebhookResponse)
def simulate_invalid_webhook(payment_id: str, db: Session = Depends(get_db)):
    """
    Simulates a webhook attempt with an INVALID HMAC-SHA256 signature to verify signature rejection.
    """
    secret = settings.RAZORPAY_WEBHOOK_SECRET or "test_webhook_secret_key_12345"

    from app.models import Payment
    import hmac
    import hashlib
    import uuid

    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID '{payment_id}' not found."
        )

    payload = {
        "id": f"evt_rzp_{uuid.uuid4().hex[:8]}",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": f"pay_rzp_{uuid.uuid4().hex[:8]}",
                    "amount": payment.amount,
                    "notes": {
                        "payment_id": payment.payment_id
                    }
                }
            }
        }
    }

    raw_body = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    invalid_signature = "invalid_hmac_sha256_signature_hash_value"

    result = process_razorpay_webhook(
        raw_body=raw_body,
        signature=invalid_signature,
        payload=payload,
        db=db
    )
    return result
