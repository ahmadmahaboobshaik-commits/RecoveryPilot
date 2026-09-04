import sys
import os
from sqlalchemy import inspect

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Payment, RecoveryEvent
from app.main import app
from app.api.health import health_check


def test_database_and_models():
    print("=" * 60)
    print("1. VERIFYING DATABASE CREATION AND SCHEMAS")
    print("=" * 60)

    # Ensure tables are created in SQLite
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    print(f"Tables found in SQLite database: {tables}")

    assert "payments" in tables, "ERROR: 'payments' table missing!"
    print("[OK] 'payments' table exists.")

    assert "recovery_events" in tables, "ERROR: 'recovery_events' table missing!"
    print("[OK] 'recovery_events' table exists.")

    # Foreign key inspection
    fk_list = inspector.get_foreign_keys("recovery_events")
    print(f"Foreign keys on 'recovery_events': {fk_list}")

    has_fk_to_payments = any(
        fk['referred_table'] == 'payments' and 'payment_id' in fk['referred_columns']
        for fk in fk_list
    )
    assert has_fk_to_payments, "ERROR: Foreign key referencing payments.payment_id not found!"
    print("[OK] Foreign key constraint referencing payments.payment_id verified.")

    print("\n" + "=" * 60)
    print("2. VERIFYING INSERTION, ORM RELATIONSHIPS, AND RETRIEVAL")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Test identifiers
        test_payment_id = "pay_test_9999"
        test_event_id = "evt_test_1111"

        # Cleanup existing test data if re-running
        db.query(RecoveryEvent).filter(RecoveryEvent.event_id == test_event_id).delete()
        db.query(Payment).filter(Payment.payment_id == test_payment_id).delete()
        db.commit()

        # Insert Payment
        payment = Payment(
            payment_id=test_payment_id,
            amount=50000,  # 500.00 INR in paise
            failure_code="BAD_REQUEST",
            failure_message="Payment failed due to insufficient funds",
            payment_method="card",
            customer_id="cust_8888",
            status="failed"
        )
        db.add(payment)
        db.commit()
        print(f"Inserted Payment: {payment}")

        # Insert RecoveryEvent linked to Payment
        event = RecoveryEvent(
            event_id=test_event_id,
            payment_id=test_payment_id,
            stage="detected",
            reason="Card payment declined by issuer",
            action="retry",
            touch_number=1,
            outcome=None
        )
        db.add(event)
        db.commit()
        print(f"Inserted RecoveryEvent: {event}")

        # Read back payment and verify relationship
        fetched_payment = db.query(Payment).filter(Payment.payment_id == test_payment_id).first()
        assert fetched_payment is not None, "ERROR: Payment not found!"
        print(f"\nFetched Payment from DB: {fetched_payment}")
        print(f"  - Amount (paise): {fetched_payment.amount}")
        print(f"  - Status: {fetched_payment.status}")
        print(f"  - Failure Code: {fetched_payment.failure_code}")
        print(f"  - Failure Message: {fetched_payment.failure_message}")
        print(f"  - Retry Count: {fetched_payment.retry_count}")
        print(f"  - Opted Out: {fetched_payment.opted_out}")

        # Access relationship
        events = fetched_payment.recovery_events
        assert len(events) == 1, "ERROR: Expected 1 recovery event associated with payment!"
        fetched_event = events[0]
        print(f"\nFetched RecoveryEvent via relationship (payment.recovery_events): {fetched_event}")
        print(f"  - Event ID: {fetched_event.event_id}")
        print(f"  - Stage: {fetched_event.stage}")
        print(f"  - Action: {fetched_event.action}")
        print(f"  - Touch Number: {fetched_event.touch_number}")

        # Access back-populates relationship (event.payment)
        assert fetched_event.payment.payment_id == test_payment_id, "ERROR: Back-reference event.payment failed!"
        print(f"\nVerified back-populates (event.payment.payment_id): {fetched_event.payment.payment_id}")

        # Clean up test data
        db.delete(fetched_payment)  # Should delete recovery_event via cascade
        db.commit()
        print("\nCleaned up test data.")

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("3. VERIFYING HEALTH ENDPOINT (/health)")
    print("=" * 60)

    res = health_check()
    print(f"health_check() result: {res}")
    assert res.status == "ok", "ERROR: Health status is not 'ok'!"
    print("[OK] Health endpoint function verified working properly.")

    # Verify /health route via direct ASGI app invocation (no external HTTP server needed)
    import asyncio

    async def call_health_asgi():
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

    status_code, body = asyncio.run(call_health_asgi())
    print(f"GET /health ASGI response status: {status_code}")
    print(f"GET /health ASGI response body: {body.decode('utf-8')}")

    assert status_code == 200, f"ERROR: Health endpoint returned HTTP {status_code}"
    assert '"status":"ok"' in body.decode('utf-8'), "ERROR: Health response body missing 'status':'ok'"
    print("[OK] '/health' endpoint verified successfully via FastAPI ASGI pipeline.")

    print("\n" + "=" * 60)
    print("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_database_and_models()
