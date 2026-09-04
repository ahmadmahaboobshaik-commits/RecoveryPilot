import sys
import os
from collections import Counter

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Payment, RecoveryEvent
from app.main import app
from scripts.generate_payments import generate_synthetic_payments


def test_phase2():
    print("=" * 60)
    print("RUNNING PHASE 2 VERIFICATION CHECKS")
    print("=" * 60)

    # 1. Run generator once
    print("\n--> Test 1: Running generate_synthetic_payments(count=100)...")
    generate_synthetic_payments(count=100)

    db = SessionLocal()
    try:
        demo_payments = db.query(Payment).filter(Payment.payment_id.like("pay_demo_%")).all()

        # 2. Verify exactly 100 demo payment records exist
        print(f"\n--> Test 2: Checking record count: {len(demo_payments)}")
        assert len(demo_payments) == 100, f"Expected 100 records, got {len(demo_payments)}"
        print("[OK] Exactly 100 demo payment records exist in DB.")

        # 3. Verify all failure categories appear
        print("\n--> Test 3: Checking failure categories...")
        failure_codes = set(p.failure_code for p in demo_payments)
        expected_failures = {
            "INSUFFICIENT_FUNDS", "BANK_TIMEOUT", "CARD_EXPIRED",
            "3DS_AUTH_FAILED", "GATEWAY_ERROR", "CHECKOUT_ABANDONED", "UNKNOWN"
        }
        print(f"Categories found: {failure_codes}")
        assert expected_failures.issubset(failure_codes), f"Missing failure categories: {expected_failures - failure_codes}"
        print("[OK] All 7 failure categories appear in the dataset.")

        # Check internal consistency (e.g. CARD_EXPIRED and 3DS_AUTH_FAILED use card)
        for p in demo_payments:
            if p.failure_code in ["CARD_EXPIRED", "3DS_AUTH_FAILED"]:
                assert p.payment_method == "card", f"Inconsistent method '{p.payment_method}' for {p.failure_code}"
        print("[OK] Internal consistency between payment methods and failure types verified.")

        # 4. Verify multiple customers have multiple payments
        print("\n--> Test 4: Checking customer payment counts...")
        cust_counts = Counter(p.customer_id for p in demo_payments)
        multi_custs = {c: count for c, count in cust_counts.items() if count > 1}
        print(f"Total unique customers: {len(cust_counts)}")
        print(f"Customers with multiple payments: {len(multi_custs)}")
        assert len(multi_custs) > 0, "No customers with multiple payments found!"
        print("[OK] Multiple customers have multiple payments.")

        # 5. Verify opted-out cases exist
        opted_out_list = [p for p in demo_payments if p.opted_out]
        print(f"\n--> Test 5: Checking opted-out cases: {len(opted_out_list)}")
        assert len(opted_out_list) > 0, "No opted-out payments found!"
        print("[OK] Opted-out payments exist.")

        # 6. Verify exhausted cases exist
        exhausted_list = [p for p in demo_payments if p.status == "exhausted"]
        print(f"\n--> Test 6: Checking exhausted cases: {len(exhausted_list)}")
        assert len(exhausted_list) > 0, "No exhausted payments found!"
        for p in exhausted_list:
            assert p.retry_count >= 3, f"Exhausted payment {p.payment_id} has retry_count={p.retry_count} (< 3)"
        print("[OK] Exhausted payments exist and have retry_count >= 3.")

        # 7. Verify recovered cases exist
        recovered_list = [p for p in demo_payments if p.status == "recovered"]
        print(f"\n--> Test 7: Checking recovered cases: {len(recovered_list)}")
        assert len(recovered_list) > 0, "No recovered payments found!"
        print("[OK] Recovered payments exist.")

        # 8. Verify abandoned cases exist
        abandoned_list = [p for p in demo_payments if p.status == "abandoned"]
        print(f"\n--> Test 8: Checking abandoned cases: {len(abandoned_list)}")
        assert len(abandoned_list) > 0, "No abandoned payments found!"
        print("[OK] Abandoned payments exist.")

        # 9. Verify amounts are stored in paise (positive integers)
        print("\n--> Test 9: Checking amounts (paise)...")
        for p in demo_payments:
            assert isinstance(p.amount, int), f"Amount {p.amount} is not integer!"
            assert p.amount >= 10000, f"Amount {p.amount} seems unrealistically low for paise!"
        print("[OK] All payment amounts are stored as integers in paise.")

        # 10. Verify idempotency (run generator a 2nd time, no duplicate keys, count remains 100)
        print("\n--> Test 10: Running generator a second time to verify idempotency...")
        generate_synthetic_payments(count=100)
        demo_payments_2nd = db.query(Payment).filter(Payment.payment_id.like("pay_demo_%")).all()
        print(f"Record count after second run: {len(demo_payments_2nd)}")
        assert len(demo_payments_2nd) == 100, f"Expected 100 records after 2nd run, got {len(demo_payments_2nd)}"
        print("[OK] Second run completed successfully with zero duplicate key errors and exactly 100 records.")

    finally:
        db.close()

    # 11. Verify health endpoint works
    print("\n--> Test 11: Verifying health endpoint...")
    import asyncio
    async def call_health():
        response_status = None
        response_body = b""
        async def receive():
            return {"type": "http.request"}
        async def send(message):
            nonlocal response_status, response_body
            if message["type"] == "http.response.start":
                response_status = message["status"]
            elif message["type"] == "http.response.body":
                response_body += message.get("body", b"")
        scope = {
            "type": "http",
            "asgi": {"version": "3.0", "spec_version": "2.0"},
            "http_version": "1.1",
            "method": "GET",
            "scheme": "http",
            "path": "/health",
            "raw_path": b"/health",
            "query_string": b"",
            "headers": [],
            "client": ("127.0.0.1", 12345),
            "server": ("127.0.0.1", 8000),
        }
        await app(scope, receive, send)
        return response_status, response_body

    status_code, body = asyncio.run(call_health())
    assert status_code == 200, f"Health endpoint returned HTTP {status_code}"
    print("[OK] Health endpoint verified working properly.")

    print("\n" + "=" * 60)
    print("ALL PHASE 2 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_phase2()
