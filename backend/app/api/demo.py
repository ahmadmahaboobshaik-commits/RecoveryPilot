from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models import Payment, RecoveryEvent

router = APIRouter(prefix="/api/demo", tags=["Demo Orchestration"])


def ensure_demo_fixtures(db: Session, force_reset_state: bool = True):
    """
    Ensures all 3 demo presets exist and are within the valid recovery window:
    - pay_demo_0013: GATEWAY_ERROR, Rs 2499.00, retry_count=0, opted_out=False (ALLOW)
    - pay_demo_execute_001: GATEWAY_ERROR, Rs 2499.00, retry_count=0, opted_out=False (ALLOW/EXECUTE)
    - pay_test_lifecycle_b: BANK_TIMEOUT, Rs 799.00, retry_count=1, opted_out=True (BLOCK)
    
    If force_reset_state is True, also clears recovery events and resets status to failed.
    If force_reset_state is False (e.g. startup sanity check), only updates timestamps if older than 3 days
    and ensures missing fixtures exist.
    """
    now = datetime.now(timezone.utc)

    # 1. ALLOW Demo Preset: pay_demo_0013
    p_13 = db.query(Payment).filter(Payment.payment_id == "pay_demo_0013").first()
    if not p_13:
        p_13 = Payment(
            payment_id="pay_demo_0013",
            customer_id="cus_demo_013",
            amount=249900,
            payment_method="card",
            status="failed",
            failure_code="GATEWAY_ERROR",
            failure_message="Temporary payment gateway error.",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        db.add(p_13)
    else:
        created_at_utc = p_13.created_at.replace(tzinfo=timezone.utc) if p_13.created_at and p_13.created_at.tzinfo is None else (p_13.created_at or now)
        is_expired = (now - created_at_utc) > timedelta(days=3)
        if force_reset_state or is_expired or p_13.failure_code != "GATEWAY_ERROR":
            p_13.failure_code = "GATEWAY_ERROR"
            p_13.failure_message = "Temporary payment gateway error."
            p_13.payment_method = "card"
            p_13.amount = 249900
            p_13.customer_id = "cus_demo_013"
            p_13.created_at = now
            if force_reset_state:
                p_13.status = "failed"
                p_13.retry_count = 0
                p_13.opted_out = False
                db.query(RecoveryEvent).filter(RecoveryEvent.payment_id == "pay_demo_0013").delete(synchronize_session=False)
            db.add(p_13)

    # 2. ALLOW/EXECUTE Demo Preset: pay_demo_execute_001
    p_exec = db.query(Payment).filter(Payment.payment_id == "pay_demo_execute_001").first()
    if not p_exec:
        p_exec = Payment(
            payment_id="pay_demo_execute_001",
            customer_id="cus_demo_001",
            amount=249900,
            payment_method="card",
            status="failed",
            failure_code="GATEWAY_ERROR",
            failure_message="Temporary payment gateway error.",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        db.add(p_exec)
    else:
        created_at_utc = p_exec.created_at.replace(tzinfo=timezone.utc) if p_exec.created_at and p_exec.created_at.tzinfo is None else (p_exec.created_at or now)
        is_expired = (now - created_at_utc) > timedelta(days=3)
        if force_reset_state or is_expired or p_exec.failure_code != "GATEWAY_ERROR":
            p_exec.failure_code = "GATEWAY_ERROR"
            p_exec.failure_message = "Temporary payment gateway error."
            p_exec.payment_method = "card"
            p_exec.amount = 249900
            p_exec.customer_id = "cus_demo_001"
            p_exec.created_at = now
            if force_reset_state:
                p_exec.status = "failed"
                p_exec.retry_count = 0
                p_exec.opted_out = False
                db.query(RecoveryEvent).filter(RecoveryEvent.payment_id == "pay_demo_execute_001").delete(synchronize_session=False)
            db.add(p_exec)

    # 3. BLOCK Demo Preset: pay_test_lifecycle_b
    p_block = db.query(Payment).filter(Payment.payment_id == "pay_test_lifecycle_b").first()
    if not p_block:
        p_block = Payment(
            payment_id="pay_test_lifecycle_b",
            customer_id="cus_test_opted_out",
            amount=79900,
            payment_method="card",
            status="failed",
            failure_code="BANK_TIMEOUT",
            failure_message="Bank did not respond within expected time.",
            retry_count=1,
            opted_out=True,
            created_at=now
        )
        db.add(p_block)
    else:
        created_at_utc = p_block.created_at.replace(tzinfo=timezone.utc) if p_block.created_at and p_block.created_at.tzinfo is None else (p_block.created_at or now)
        is_expired = (now - created_at_utc) > timedelta(days=3)
        if force_reset_state or is_expired or not p_block.opted_out:
            p_block.failure_code = "BANK_TIMEOUT"
            p_block.failure_message = "Bank did not respond within expected time."
            p_block.created_at = now
            p_block.opted_out = True
            if force_reset_state:
                p_block.status = "failed"
                p_block.retry_count = 1
                db.query(RecoveryEvent).filter(RecoveryEvent.payment_id == "pay_test_lifecycle_b").delete(synchronize_session=False)
            db.add(p_block)

    db.commit()


@router.post("/reset")
def reset_demo_payment(db: Session = Depends(get_db)):
    """
    Resets the dedicated demo payments ('pay_demo_0013', 'pay_demo_execute_001', 'pay_test_lifecycle_b') to clean states:
    - Clears all previous recovery_events (removing cooldown & touch history).
    - Sets payment.status = 'failed'.
    - Sets failure_code = 'GATEWAY_ERROR' (or BANK_TIMEOUT for block demo).
    - Sets retry_count = 0 (1 for block demo).
    - Sets opted_out = False (True for block demo).
    - Sets created_at = current time (within 7-day recovery window).
    """
    ensure_demo_fixtures(db, force_reset_state=True)

    return {
        "status": "ok",
        "message": "Demo payments (pay_demo_0013, pay_demo_execute_001, pay_test_lifecycle_b) reset cleanly for presentation.",
        "presets": {
            "pay_demo_0013": {"status": "failed", "failure_code": "GATEWAY_ERROR", "expected_policy": "allow", "expected_action": "retry"},
            "pay_demo_execute_001": {"status": "failed", "failure_code": "GATEWAY_ERROR", "expected_policy": "allow", "expected_action": "retry"},
            "pay_test_lifecycle_b": {"status": "failed", "failure_code": "BANK_TIMEOUT", "expected_policy": "block", "expected_action": "stop", "opted_out": True}
        }
    }
