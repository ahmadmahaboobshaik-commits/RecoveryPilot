import sys
import os
import argparse
import random
from datetime import datetime, timedelta, timezone

# Add parent directory (backend) to sys.path to enable importing app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, engine, Base
from app.models import Payment, RecoveryEvent

# Failure configurations mapping: code -> (message, valid payment methods)
FAILURE_CONFIGS = {
    "INSUFFICIENT_FUNDS": (
        "Payment failed due to insufficient funds.",
        ["card", "upi", "netbanking"]
    ),
    "BANK_TIMEOUT": (
        "Bank did not respond within the expected time.",
        ["card", "upi", "netbanking"]
    ),
    "CARD_EXPIRED": (
        "Card used for the payment has expired.",
        ["card"]
    ),
    "3DS_AUTH_FAILED": (
        "3-D Secure authentication was not completed successfully.",
        ["card"]
    ),
    "GATEWAY_ERROR": (
        "Temporary payment gateway error.",
        ["card", "upi", "netbanking"]
    ),
    "CHECKOUT_ABANDONED": (
        "Customer closed payment session without completion.",
        ["card", "upi", "netbanking"]
    ),
    "UNKNOWN": (
        "Payment failed due to an unknown gateway error.",
        ["card", "upi", "netbanking"]
    )
}

# Common realistic price points in INR
PRICE_POINTS_INR = [
    199, 499, 799, 999, 1499, 1999, 2499, 3999, 4999, 7500, 9999, 12500, 15000, 24999
]


def generate_synthetic_payments(count: int = 100):
    """
    Generates synthetic payment records for RecoveryPilot demo/testing.
    Clears previous demo records (starting with 'pay_demo_') to ensure idempotency.
    """
    print("=" * 60)
    print("RecoveryPilot Synthetic Payment Generator")
    print("=" * 60)
    print(f"Target count: {count} records")
    print("Idempotency strategy: Deleting previous demo records starting with 'pay_demo_' to prevent duplicates.")

    # Initialize tables if not present
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Step 1: Safe Cleanup of previous demo records
        deleted_events = db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.like("pay_demo_%")).delete(synchronize_session=False)
        deleted_payments = db.query(Payment).filter(Payment.payment_id.like("pay_demo_%")).delete(synchronize_session=False)
        db.commit()
        print(f"Cleared {deleted_payments} previous demo payment records (and {deleted_events} associated recovery events).")

        # Step 2: Create synthetic customer pool (~60 customers per 100 payments)
        num_customers = max(1, int(count * 0.6))
        customers = [f"cus_demo_{i:03d}" for i in range(1, num_customers + 1)]

        # Step 3: Determine failure category distribution counts
        # Target percentages:
        # INSUFFICIENT_FUNDS: 25%, BANK_TIMEOUT: 20%, CARD_EXPIRED: 15%, 3DS_AUTH_FAILED: 15%,
        # GATEWAY_ERROR: 10%, CHECKOUT_ABANDONED: 5%, UNKNOWN: 10%
        failure_codes_pool = []
        target_distribution = [
            ("INSUFFICIENT_FUNDS", 0.25),
            ("BANK_TIMEOUT", 0.20),
            ("CARD_EXPIRED", 0.15),
            ("3DS_AUTH_FAILED", 0.15),
            ("GATEWAY_ERROR", 0.10),
            ("UNKNOWN", 0.10),
            ("CHECKOUT_ABANDONED", 0.05),
        ]

        assigned_count = 0
        for code, weight in target_distribution:
            sub_count = int(round(count * weight))
            if code == target_distribution[-1][0]:
                sub_count = count - assigned_count
            failure_codes_pool.extend([code] * sub_count)
            assigned_count += sub_count

        random.shuffle(failure_codes_pool)

        # Step 3b: Ensure pay_demo_0013 (index 12) is deterministically GATEWAY_ERROR
        if count >= 13 and "GATEWAY_ERROR" in failure_codes_pool:
            gw_idx = failure_codes_pool.index("GATEWAY_ERROR")
            failure_codes_pool[12], failure_codes_pool[gw_idx] = failure_codes_pool[gw_idx], failure_codes_pool[12]

        # Step 4: Determine status distribution indices
        # We need special stop cases:
        # - ~5% abandoned (status='abandoned') -> assigned to CHECKOUT_ABANDONED
        # - ~12% recovered (status='recovered')
        # - ~8% exhausted (status='exhausted', retry_count >= 3)
        # - ~8% opted_out (opted_out = True)
        # - remaining ~67% failed (status='failed')

        # Exclude index 12 (pay_demo_0013) from special categories to ensure it remains an eligible ALLOW demo
        indices = [idx for idx in range(count) if idx != 12]
        random.shuffle(indices)

        # Assign indices for special categories
        recovered_indices = set(indices[:int(round(count * 0.12))])
        exhausted_indices = set(indices[int(round(count * 0.12)):int(round(count * 0.20))])
        opted_out_indices = set(indices[int(round(count * 0.20)):int(round(count * 0.28))])

        now = datetime.now(timezone.utc)

        # Step 5: Build Payment instances
        new_payments = []

        for i in range(count):
            payment_id = f"pay_demo_{i + 1:04d}"

            # Deterministic fixture for pay_demo_0013 (ALLOW Demo preset in Workbench)
            if payment_id == "pay_demo_0013":
                failure_code = "GATEWAY_ERROR"
                failure_msg, allowed_methods = FAILURE_CONFIGS["GATEWAY_ERROR"]
                payment_method = "card"
                customer_id = "cus_demo_013"
                amount_paise = 249900
                created_at = now - timedelta(hours=3)
                retry_count = 0
                opted_out = False
                status = "failed"
            else:
                failure_code = failure_codes_pool[i]
                failure_msg, allowed_methods = FAILURE_CONFIGS[failure_code]

                # Pick method compatible with failure type
                payment_method = random.choice(allowed_methods)

                # Assign customer
                customer_id = random.choice(customers)

                # Assign amount in paise (1 INR = 100 paise)
                base_inr = random.choice(PRICE_POINTS_INR)
                amount_paise = base_inr * 100

                # Timestamp: random distribution over past 30 days
                days_ago = random.uniform(0.1, 30.0)
                created_at = now - timedelta(days=days_ago)

                # Determine status, retry_count, opted_out
                opted_out = (i in opted_out_indices)

                if failure_code == "CHECKOUT_ABANDONED":
                    status = "abandoned"
                    retry_count = 0
                elif i in recovered_indices:
                    status = "recovered"
                    retry_count = random.randint(1, 3)
                elif i in exhausted_indices:
                    status = "exhausted"
                    retry_count = random.randint(3, 5)
                else:
                    status = "failed"
                    retry_count = random.choice([0, 0, 0, 1])  # Mostly 0, occasionally 1

            payment = Payment(
                payment_id=payment_id,
                amount=amount_paise,
                failure_code=failure_code,
                failure_message=failure_msg,
                payment_method=payment_method,
                customer_id=customer_id,
                created_at=created_at,
                retry_count=retry_count,
                opted_out=opted_out,
                status=status
            )
            new_payments.append(payment)

        # Insert batch into DB
        db.bulk_save_objects(new_payments)
        db.commit()

        # Step 6: Query back generated dataset for exact reporting breakdown
        all_demo = db.query(Payment).filter(Payment.payment_id.like("pay_demo_%")).all()

        total_count = len(all_demo)

        failure_counts = {}
        status_counts = {}
        opted_out_count = 0
        total_failed_paise = 0

        for p in all_demo:
            failure_counts[p.failure_code] = failure_counts.get(p.failure_code, 0) + 1
            status_counts[p.status] = status_counts.get(p.status, 0) + 1
            if p.opted_out:
                opted_out_count += 1
            if p.status in ["failed", "abandoned"]:
                total_failed_paise += p.amount

        total_failed_inr = total_failed_paise / 100.0

        # Print formatted summary output
        print("\n" + "=" * 50)
        print("RecoveryPilot Synthetic Dataset")
        print("=" * 50)
        print(f"Total payments: {total_count}")

        print("\nFailure breakdown:")
        for code in ["INSUFFICIENT_FUNDS", "BANK_TIMEOUT", "CARD_EXPIRED", "3DS_AUTH_FAILED", "GATEWAY_ERROR", "CHECKOUT_ABANDONED", "UNKNOWN"]:
            print(f"{code}: {failure_counts.get(code, 0)}")

        print("\nStatus breakdown:")
        for st in ["failed", "abandoned", "recovered", "exhausted"]:
            print(f"{st}: {status_counts.get(st, 0)}")

        print(f"\nOpted-out: {opted_out_count}")

        print(f"\nTotal amount at risk from failed payments: Rs. {total_failed_inr:,.2f}")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"ERROR: Failed to generate synthetic payment data: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic payment records for RecoveryPilot.")
    parser.add_argument(
        "--count",
        type=int,
        default=100,
        help="Number of synthetic payment records to generate (default: 100)"
    )
    args = parser.parse_args()
    generate_synthetic_payments(count=args.count)
