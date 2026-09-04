import sys
import os
import hmac
import hashlib
import json
import asyncio
from datetime import datetime, timezone, timedelta

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import Payment, RecoveryEvent
from app.main import app
from app.config import settings
from app.webhooks.razorpay import verify_razorpay_signature
from app.recovery.revenue import calculate_revenue_metrics
from scripts.generate_payments import generate_synthetic_payments


def call_asgi(app_instance, method, path, headers_dict=None, body_bytes=b""):
    """Helper to execute direct ASGI requests against FastAPI app without external HTTP server."""
    response_status = None
    response_headers = []
    response_body = b""

    if headers_dict is None:
        headers_dict = {"content-type": "application/json"}

    raw_headers = [(k.lower().encode("utf-8"), v.encode("utf-8")) for k, v in headers_dict.items()]

    async def receive():
        return {"type": "http.request", "body": body_bytes}

    async def send(message):
        nonlocal response_status, response_headers, response_body
        if message["type"] == "http.response.start":
            response_status = message["status"]
            response_headers = message.get("headers", [])
        elif message["type"] == "http.response.body":
            response_body += message.get("body", b"")

    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.0"},
        "http_version": "1.1",
        "method": method,
        "scheme": "http",
        "path": path,
        "raw_path": path.encode("utf-8"),
        "query_string": b"",
        "headers": raw_headers,
        "client": ("127.0.0.1", 12345),
        "server": ("127.0.0.1", 8000),
    }

    asyncio.run(app_instance(scope, receive, send))
    parsed_json = json.loads(response_body.decode("utf-8")) if response_body else {}
    return response_status, parsed_json


def generate_hmac_signature(body_bytes: bytes, secret: str) -> str:
    """Generates valid Razorpay HMAC SHA256 signature for test payloads."""
    return hmac.new(secret.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()


def test_phase6_verification():
    print("=" * 60)
    print("RUNNING PHASE 6 OUTCOME + WEBHOOKS + REVENUE VERIFICATION")
    print("=" * 60)

    test_secret = "test_phase6_webhook_secret_777"
    original_secret = settings.RAZORPAY_WEBHOOK_SECRET
    settings.RAZORPAY_WEBHOOK_SECRET = test_secret

    generate_synthetic_payments(count=100)
    db = SessionLocal()
    now = datetime.now(timezone.utc)

    # Clean up old test payments
    db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.like("pay_test_p6_%")).delete(synchronize_session=False)
    db.query(Payment).filter(Payment.payment_id.like("pay_test_p6_%")).delete(synchronize_session=False)
    db.commit()

    try:
        # -------------------------------------------------------------
        # TEST A: Valid Successful Webhook
        # -------------------------------------------------------------
        print("\n[TEST A] Valid Successful Webhook...")
        p_a = Payment(
            payment_id="pay_test_p6_a",
            amount=500000, # Rs 5,000
            failure_code="BANK_TIMEOUT",
            payment_method="card",
            customer_id="cust_p6_a",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        db.add(p_a)
        db.commit()

        initial_metrics = calculate_revenue_metrics(db)
        initial_recovered_rev = initial_metrics["total_recovered"]

        payload_a = {
            "entity": "event",
            "account_id": "acc_test_123",
            "event": "payment_link.paid",
            "id": "evt_rzp_test_a_101",
            "payload": {
                "payment_link": {
                    "entity": {
                        "id": "plink_test_a_999",
                        "amount": 500000,
                        "notes": {
                            "payment_id": "pay_test_p6_a",
                            "customer_id": "cust_p6_a",
                            "app": "RecoveryPilot"
                        }
                    }
                },
                "payment": {
                    "entity": {
                        "id": "pay_rzp_succ_101",
                        "amount": 500000,
                        "status": "captured"
                    }
                }
            }
        }
        body_a = json.dumps(payload_a).encode("utf-8")
        sig_a = generate_hmac_signature(body_a, test_secret)

        status_code, resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": sig_a},
            body_bytes=body_a
        )

        print(f"  Webhook status code: {status_code}, response: {resp}")
        assert status_code == 200
        assert resp["status"] == "recovered"
        assert resp["payment_id"] == "pay_test_p6_a"

        # Check DB state
        p_a_db = db.query(Payment).filter(Payment.payment_id == "pay_test_p6_a").first()
        assert p_a_db.status == "recovered"
        assert p_a_db.retry_count == 0, "retry_count should not increment on payment recovery"

        # Check audit event
        evt_a = db.query(RecoveryEvent).filter(
            RecoveryEvent.payment_id == "pay_test_p6_a",
            RecoveryEvent.stage == "outcome"
        ).first()
        assert evt_a is not None
        assert evt_a.outcome == "recovered"
        assert evt_a.reference_id == "evt_rzp_test_a_101"

        new_metrics = calculate_revenue_metrics(db)
        assert new_metrics["total_recovered"] == initial_recovered_rev + 500000
        print("  [OK] Test A passed (Verified webhook marked payment recovered and revenue increased by exactly 500,000 paise).")

        # -------------------------------------------------------------
        # TEST B: Invalid Signature
        # -------------------------------------------------------------
        print("\n[TEST B] Invalid Webhook Signature...")
        p_b = Payment(
            payment_id="pay_test_p6_b",
            amount=300000,
            failure_code="CARD_EXPIRED",
            payment_method="card",
            customer_id="cust_p6_b",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        db.add(p_b)
        db.commit()

        payload_b = payload_a.copy()
        payload_b["payload"]["payment_link"]["entity"]["notes"]["payment_id"] = "pay_test_p6_b"
        body_b = json.dumps(payload_b).encode("utf-8")

        status_code, resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": "bogus_signature_abc"},
            body_bytes=body_b
        )

        print(f"  Webhook status code: {status_code}, response: {resp}")
        assert status_code == 400
        assert "Invalid webhook signature" in resp.get("detail", "")

        p_b_db = db.query(Payment).filter(Payment.payment_id == "pay_test_p6_b").first()
        assert p_b_db.status == "failed"
        print("  [OK] Test B passed (Invalid signature rejected with 400, payment remains failed).")

        # -------------------------------------------------------------
        # TEST C: Missing Webhook Secret
        # -------------------------------------------------------------
        print("\n[TEST C] Missing Webhook Secret...")
        settings.RAZORPAY_WEBHOOK_SECRET = None

        status_code, resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": "sig123"},
            body_bytes=b"{}"
        )
        print(f"  Webhook status code: {status_code}, response: {resp}")
        assert status_code == 503
        assert "not configured" in resp.get("detail", "")

        # Verify /health still 200 OK
        h_code, h_resp = call_asgi(app, "GET", "/health")
        assert h_code == 200
        assert h_resp["status"] == "ok"
        print("  [OK] Test C passed (Unconfigured secret returns 503 configuration error, /health remains 200 OK).")

        # Restore test secret
        settings.RAZORPAY_WEBHOOK_SECRET = test_secret

        # -------------------------------------------------------------
        # TEST D: Wrong Amount
        # -------------------------------------------------------------
        print("\n[TEST D] Wrong Amount Validation...")
        p_d = Payment(
            payment_id="pay_test_p6_d",
            amount=500000, # Expected 500,000 paise
            failure_code="INSUFFICIENT_FUNDS",
            payment_method="card",
            customer_id="cust_p6_d",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        db.add(p_d)
        db.commit()

        payload_d = {
            "entity": "event",
            "event": "payment_link.paid",
            "id": "evt_rzp_test_d_202",
            "payload": {
                "payment_link": {
                    "entity": {
                        "id": "plink_test_d",
                        "amount": 400000, # Mismatched: received 400,000 paise
                        "notes": {"payment_id": "pay_test_p6_d"}
                    }
                },
                "payment": {
                    "entity": {
                        "id": "pay_rzp_mismatch",
                        "amount": 400000
                    }
                }
            }
        }
        body_d = json.dumps(payload_d).encode("utf-8")
        sig_d = generate_hmac_signature(body_d, test_secret)

        status_code, resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": sig_d},
            body_bytes=body_d
        )
        print(f"  Webhook status code: {status_code}, response: {resp}")
        assert status_code == 200
        assert resp["status"] == "failed"
        assert resp["reason"] == "amount_mismatch"

        p_d_db = db.query(Payment).filter(Payment.payment_id == "pay_test_p6_d").first()
        assert p_d_db.status == "failed"

        evt_d = db.query(RecoveryEvent).filter(
            RecoveryEvent.payment_id == "pay_test_p6_d",
            RecoveryEvent.stage == "outcome"
        ).first()
        assert evt_d is not None
        assert evt_d.outcome == "failed"
        assert "Amount mismatch" in evt_d.reason
        print("  [OK] Test D passed (Amount mismatch rejected, payment remains failed, mismatch logged).")

        # -------------------------------------------------------------
        # TEST E: Unknown Razorpay Payment
        # -------------------------------------------------------------
        print("\n[TEST E] Unknown Razorpay Payment...")
        payload_e = {
            "entity": "event",
            "event": "payment_link.paid",
            "id": "evt_rzp_test_e_303",
            "payload": {
                "payment_link": {
                    "entity": {
                        "id": "plink_unknown",
                        "amount": 100000,
                        "notes": {"payment_id": "pay_non_existent_999"}
                    }
                },
                "payment": {
                    "entity": {"id": "pay_rzp_unknown", "amount": 100000}
                }
            }
        }
        body_e = json.dumps(payload_e).encode("utf-8")
        sig_e = generate_hmac_signature(body_e, test_secret)

        status_code, resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": sig_e},
            body_bytes=body_e
        )
        print(f"  Webhook status code: {status_code}, response: {resp}")
        assert status_code == 200
        assert resp["status"] == "unmatched"
        print("  [OK] Test E passed (Unknown payment link safely returned unmatched status).")

        # -------------------------------------------------------------
        # TEST F: Duplicate Webhook Event (Idempotency)
        # -------------------------------------------------------------
        print("\n[TEST F] Duplicate Webhook Event Idempotency...")
        rec_before_f = calculate_revenue_metrics(db)["total_recovered"]

        # Resend exact body_a with signature sig_a (evt_rzp_test_a_101 was already processed in TEST A!)
        status_code, resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": sig_a},
            body_bytes=body_a
        )
        print(f"  Duplicate webhook status code: {status_code}, response: {resp}")
        assert status_code == 200
        assert resp["status"] == "already_processed"

        rec_after_f = calculate_revenue_metrics(db)["total_recovered"]
        assert rec_after_f == rec_before_f, "Revenue must NOT be added twice for duplicate webhook!"
        print("  [OK] Test F passed (Duplicate event returned already_processed, revenue unchanged).")

        # -------------------------------------------------------------
        # TEST G: Already Recovered Payment (Different Webhook)
        # -------------------------------------------------------------
        print("\n[TEST G] Already Recovered Payment...")
        # Send a NEW event ID for pay_test_p6_a (which is already recovered!)
        payload_g = {
            "entity": "event",
            "event": "payment_link.paid",
            "id": "evt_rzp_test_g_404", # New Event ID
            "payload": {
                "payment_link": {
                    "entity": {
                        "id": "plink_test_g",
                        "amount": 500000,
                        "notes": {"payment_id": "pay_test_p6_a"}
                    }
                },
                "payment": {
                    "entity": {"id": "pay_rzp_g", "amount": 500000}
                }
            }
        }
        body_g = json.dumps(payload_g).encode("utf-8")
        sig_g = generate_hmac_signature(body_g, test_secret)

        status_code, resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": sig_g},
            body_bytes=body_g
        )
        print(f"  Already recovered webhook status code: {status_code}, response: {resp}")
        assert status_code == 200
        assert resp["status"] == "already_recovered"

        rec_after_g = calculate_revenue_metrics(db)["total_recovered"]
        assert rec_after_g == rec_before_f, "Revenue must NOT be added twice for already recovered payment!"
        print("  [OK] Test G passed (Event for already recovered payment returned already_recovered, revenue unchanged).")

        # -------------------------------------------------------------
        # TEST H: Unsupported Webhook Event
        # -------------------------------------------------------------
        print("\n[TEST H] Unsupported Webhook Event...")
        payload_h = {
            "entity": "event",
            "event": "refund.created",
            "id": "evt_rzp_test_h_505",
            "payload": {}
        }
        body_h = json.dumps(payload_h).encode("utf-8")
        sig_h = generate_hmac_signature(body_h, test_secret)

        status_code, resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": sig_h},
            body_bytes=body_h
        )
        print(f"  Unsupported event status code: {status_code}, response: {resp}")
        assert status_code == 200
        assert resp["status"] == "ignored"
        assert resp["event"] == "refund.created"
        print("  [OK] Test H passed (Unsupported event safely ignored).")

        # -------------------------------------------------------------
        # TEST I: Revenue Metrics API (GET /api/metrics)
        # -------------------------------------------------------------
        print("\n[TEST I] Metrics API Verification...")
        status_code, resp = call_asgi(app, "GET", "/api/metrics")
        print(f"  GET /api/metrics status code: {status_code}, keys: {list(resp.keys())}")
        assert status_code == 200
        assert "total_at_risk" in resp
        assert "total_recovered" in resp
        assert "recovery_rate" in resp
        assert "recovered_payment_count" in resp
        assert "failed_payment_count" in resp
        assert resp["total_recovered"] >= 500000
        assert isinstance(resp["recovery_rate"], float)
        print(f"  Calculated Metrics: total_at_risk={resp['total_at_risk']}, total_recovered={resp['total_recovered']}, rate={resp['recovery_rate']}%")
        print("  [OK] Test I passed (Metrics API returns dynamic metrics from SQLite).")

        # -------------------------------------------------------------
        # TEST J: Recovery Activity API (GET /api/recovery/activity)
        # -------------------------------------------------------------
        print("\n[TEST J] Recovery Activity API Verification...")
        status_code, resp = call_asgi(app, "GET", "/api/recovery/activity")
        print(f"  GET /api/recovery/activity status code: {status_code}, event_count: {len(resp)}")
        assert status_code == 200
        assert isinstance(resp, list)
        assert len(resp) > 0
        first_evt = resp[0]
        assert "event_id" in first_evt
        assert "payment_id" in first_evt
        assert "stage" in first_evt
        assert "timestamp" in first_evt
        print(f"  Latest Activity Event: {first_evt['event_id']} (stage={first_evt['stage']}, outcome={first_evt.get('outcome')})")
        print("  [OK] Test J passed (Recovery Activity API returns chronological events feed).")

        # -------------------------------------------------------------
        # TEST K: Health Endpoint Stability
        # -------------------------------------------------------------
        print("\n[TEST K] Health Endpoint Stability...")
        status_code, resp = call_asgi(app, "GET", "/health")
        assert status_code == 200
        assert resp.get("status") == "ok"
        print("  [OK] Test K passed (/health endpoint returns 200 OK).")

        # -------------------------------------------------------------
        # TEST L: Full Regression Test Suite Execution
        # -------------------------------------------------------------
        print("\n[TEST L] Running Regression Test Suite (Phases 1-5)...")
        from test_models_verification import test_database_and_models
        from test_phase2_verification import test_phase2
        from test_phase3_verification import test_phase3_ai_diagnosis
        from test_phase4_verification import test_phase4_decision_and_policy_engine
        from test_phase5_verification import test_phase5_execution_layer

        print("  Running test_models_verification.py...")
        test_database_and_models()
        print("  Running test_phase2_verification.py...")
        test_phase2()
        print("  Running test_phase3_verification.py...")
        test_phase3_ai_diagnosis()
        print("  Running test_phase4_verification.py...")
        test_phase4_decision_and_policy_engine()
        print("  Running test_phase5_verification.py...")
        test_phase5_execution_layer()

        print("  [OK] Test L passed (All regression verification scripts executed cleanly).")

        # Restore original secret setting
        settings.RAZORPAY_WEBHOOK_SECRET = original_secret

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("ALL PHASE 6 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_phase6_verification()
