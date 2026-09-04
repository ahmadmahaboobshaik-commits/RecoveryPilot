import sys
import os
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, Base, engine
from app.models import Payment, RecoveryEvent


def reset_demo_data():
    """
    Resets the dedicated demo payments ('pay_demo_0013', 'pay_demo_execute_001', 'pay_test_lifecycle_b')
    to their clean, deterministic fixture states for presentation and testing.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    now = datetime.now(timezone.utc)

    try:
        # ALLOW Presets: pay_demo_0013 and pay_demo_execute_001
        allow_targets = [
            ("pay_demo_0013", "cus_demo_013"),
            ("pay_demo_execute_001", "cus_demo_001")
        ]
        target_ids = [t[0] for t in allow_targets]

        # Clean all associated recovery events to clear touch counts and cooldowns
        db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.in_(target_ids)).delete(synchronize_session=False)

        for pid, cid in allow_targets:
            p = db.query(Payment).filter(Payment.payment_id == pid).first()
            if not p:
                p = Payment(
                    payment_id=pid,
                    customer_id=cid,
                    amount=249900,
                    payment_method="card",
                    status="failed",
                    failure_code="GATEWAY_ERROR",
                    failure_message="Temporary payment gateway error.",
                    retry_count=0,
                    opted_out=False,
                    created_at=now
                )
                db.add(p)
            else:
                p.customer_id = cid
                p.amount = 249900
                p.payment_method = "card"
                p.status = "failed"
                p.failure_code = "GATEWAY_ERROR"
                p.failure_message = "Temporary payment gateway error."
                p.retry_count = 0
                p.opted_out = False
                p.created_at = now
                db.add(p)

        # BLOCK Preset: pay_test_lifecycle_b
        db.query(RecoveryEvent).filter(RecoveryEvent.payment_id == "pay_test_lifecycle_b").delete(synchronize_session=False)
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
            p_block.status = "failed"
            p_block.failure_code = "BANK_TIMEOUT"
            p_block.failure_message = "Bank did not respond within expected time."
            p_block.retry_count = 1
            p_block.opted_out = True
            p_block.created_at = now
            db.add(p_block)

        db.commit()
        print("=" * 60)
        print("RecoveryPilot Demo Presets Reset Successfully:")
        print("  - pay_demo_0013: GATEWAY_ERROR, Rs 2499.00, failed, retry_count=0, opted_out=False (ALLOW)")
        print("  - pay_demo_execute_001: GATEWAY_ERROR, Rs 2499.00, failed, retry_count=0, opted_out=False (ALLOW)")
        print("  - pay_test_lifecycle_b: BANK_TIMEOUT, Rs 799.00, failed, retry_count=1, opted_out=True (BLOCK)")
        print("=" * 60)
    except Exception as e:
        db.rollback()
        print(f"Error resetting demo fixtures: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    reset_demo_data()
