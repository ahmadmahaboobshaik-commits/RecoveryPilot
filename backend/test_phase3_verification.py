import sys
import os
import asyncio
from unittest.mock import patch

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Payment, RecoveryEvent
from app.main import app
from app.config import settings
from app.ai.schemas import DiagnosisResult
from scripts.generate_payments import generate_synthetic_payments


def call_asgi(app_instance, method, path, body_bytes=b""):
    """Helper to execute direct ASGI requests against FastAPI app without external HTTP server."""
    response_status = None
    response_headers = []
    response_body = b""

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
        "headers": [(b"content-type", b"application/json")],
        "client": ("127.0.0.1", 12345),
        "server": ("127.0.0.1", 8000),
    }

    asyncio.run(app_instance(scope, receive, send))
    import json
    parsed_json = json.loads(response_body.decode("utf-8")) if response_body else {}
    return response_status, parsed_json


def test_phase3_ai_diagnosis():
    print("=" * 60)
    print("RUNNING PHASE 3 AI DIAGNOSIS VERIFICATION CHECKS")
    print("=" * 60)

    # Step 0: Ensure dataset exists (100 synthetic payments)
    generate_synthetic_payments(count=100)

    # -------------------------------------------------------------
    # 1. VERIFY MISSING/UNCONFIGURED API KEY HANDLING & HEALTH
    # -------------------------------------------------------------
    print("\n--> Test 1: Testing missing API key handling and /health endpoint...")
    
    # Temporarily force API key to None/placeholder
    original_key = settings.ANTHROPIC_API_KEY
    settings.ANTHROPIC_API_KEY = None

    # Check /health still returns 200 OK
    health_status, health_resp = call_asgi(app, "GET", "/health")
    print(f"  GET /health status: {health_status}, response: {health_resp}")
    assert health_status == 200, "ERROR: /health failed when ANTHROPIC_API_KEY is unconfigured!"
    assert health_resp.get("status") == "ok", "ERROR: /health status != 'ok'"
    print("  [OK] /health endpoint works cleanly when ANTHROPIC_API_KEY is unconfigured.")

    # Check POST /api/diagnose/{payment_id} returns 503 error cleanly without server crash
    diag_status, diag_resp = call_asgi(app, "POST", "/api/diagnose/pay_demo_0001")
    print(f"  POST /api/diagnose/pay_demo_0001 status: {diag_status}, detail: {diag_resp.get('detail')}")
    assert diag_status in [200, 503], f"Expected HTTP 200 (fallback) or 503 when API key missing, got {diag_status}"
    print(f"  [OK] POST /api/diagnose handled unconfigured API key gracefully (HTTP {diag_status}).")

    # Restore key setting
    settings.ANTHROPIC_API_KEY = original_key

    # -------------------------------------------------------------
    # 2. SELECT 5 DISTINCT PAYMENTS COVERING TARGET FAILURE TYPES
    # -------------------------------------------------------------
    print("\n--> Test 2: Selecting 5 synthetic payments covering distinct failure scenarios...")
    db = SessionLocal()
    try:
        # Find 1 INSUFFICIENT_FUNDS
        p_funds = db.query(Payment).filter(Payment.failure_code == "INSUFFICIENT_FUNDS").first()
        # Find 1 CARD_EXPIRED
        p_card = db.query(Payment).filter(Payment.failure_code == "CARD_EXPIRED").first()
        # Find 1 BANK_TIMEOUT
        p_timeout = db.query(Payment).filter(Payment.failure_code == "BANK_TIMEOUT").first()
        # Find 1 3DS_AUTH_FAILED
        p_3ds = db.query(Payment).filter(Payment.failure_code == "3DS_AUTH_FAILED").first()
        # Find 1 Opted-out or Exhausted payment
        p_stop = db.query(Payment).filter((Payment.opted_out == True) | (Payment.status == "exhausted")).first()

        selected_payments = [
            ("INSUFFICIENT_FUNDS", p_funds),
            ("CARD_EXPIRED", p_card),
            ("BANK_TIMEOUT", p_timeout),
            ("3DS_AUTH_FAILED", p_3ds),
            ("OPTED_OUT_OR_EXHAUSTED", p_stop)
        ]

        for cat, p in selected_payments:
            assert p is not None, f"ERROR: Could not find payment for category {cat}"
            print(f"  - Selected [{cat}]: payment_id={p.payment_id}, method={p.payment_method}, status={p.status}, opted_out={p.opted_out}")

        # -------------------------------------------------------------
        # 3. RUN DIAGNOSIS ENDPOINT FOR THE 5 PAYMENTS
        # -------------------------------------------------------------
        print("\n--> Test 3: Running diagnosis endpoint for selected payments & verifying schema & RecoveryEvent...")

        # Mock diagnosis responses matching Claude structured output expectations
        mock_diagnoses = {
            p_funds.payment_id: DiagnosisResult(
                root_cause="insufficient_funds",
                recoverability=0.70,
                recommended_action="wait",
                reason="Insufficient customer account balance. Recommend brief wait before sending reminder or retry.",
                confidence=0.85
            ),
            p_card.payment_id: DiagnosisResult(
                root_cause="expired_card",
                recoverability=0.30,
                recommended_action="payment_link",
                reason="Card used is expired. Recommend sending a payment link to update payment method.",
                confidence=0.95
            ),
            p_timeout.payment_id: DiagnosisResult(
                root_cause="bank_timeout",
                recoverability=0.85,
                recommended_action="retry",
                reason="Temporary bank server timeout. Safe candidate for immediate automated retry.",
                confidence=0.90
            ),
            p_3ds.payment_id: DiagnosisResult(
                root_cause="3ds_auth_failed",
                recoverability=0.60,
                recommended_action="payment_link",
                reason="3-D Secure authentication failed. Recommend payment link for customer authorization.",
                confidence=0.80
            ),
            p_stop.payment_id: DiagnosisResult(
                root_cause="insufficient_funds" if p_stop.failure_code == "INSUFFICIENT_FUNDS" else "unknown",
                recoverability=0.05,
                recommended_action="stop",
                reason="Customer has opted out or retry limit reached. Recommended action is stop.",
                confidence=0.95
            )
        }

        def mock_diagnose_func(payment_obj, history):
            return mock_diagnoses[payment_obj.payment_id]

        # Patch diagnose_payment to verify API endpoint & database logging pipeline
        with patch("app.api.diagnose.diagnose_payment", side_effect=mock_diagnose_func):
            for cat, p in selected_payments:
                pid = p.payment_id
                status_code, resp = call_asgi(app, "POST", f"/api/diagnose/{pid}")

                print(f"\n  [Category: {cat} | payment_id: {pid}]")
                print(f"    HTTP Status: {status_code}")
                print(f"    Response JSON: {resp}")

                assert status_code == 200, f"ERROR: Endpoint returned status {status_code}"
                assert resp.get("payment_id") == pid

                # Verify DiagnosisResult Pydantic fields
                diag = resp.get("diagnosis", {})
                assert diag.get("root_cause") in [
                    "insufficient_funds", "expired_card", "bank_timeout",
                    "gateway_error", "3ds_auth_failed", "checkout_abandoned", "unknown"
                ], f"Invalid root_cause: {diag.get('root_cause')}"

                assert diag.get("recommended_action") in [
                    "retry", "payment_link", "reminder", "wait", "stop"
                ], f"Invalid recommended_action: {diag.get('recommended_action')}"

                assert 0.0 <= diag.get("recoverability", -1) <= 1.0, f"Invalid recoverability: {diag.get('recoverability')}"
                assert 0.0 <= diag.get("confidence", -1) <= 1.0, f"Invalid confidence: {diag.get('confidence')}"
                assert isinstance(diag.get("reason"), str) and len(diag.get("reason")) > 0

                print(f"    [OK] Diagnosis JSON schema valid: root_cause='{diag['root_cause']}', action='{diag['recommended_action']}', recoverability={diag['recoverability']}, confidence={diag['confidence']}")

                # Verify RecoveryEvent created in SQLite database
                created_event_id = resp.get("event_id")
                event_in_db = db.query(RecoveryEvent).filter(RecoveryEvent.event_id == created_event_id).first()
                assert event_in_db is not None, f"ERROR: RecoveryEvent '{created_event_id}' not found in SQLite DB!"
                assert event_in_db.payment_id == pid
                assert event_in_db.stage == "diagnosed"
                assert event_in_db.action == diag["recommended_action"]
                assert event_in_db.reason == diag["reason"]
                assert event_in_db.outcome is None

                print(f"    [OK] RecoveryEvent recorded in DB: event_id='{event_in_db.event_id}', stage='{event_in_db.stage}', action='{event_in_db.action}'")

                # Verify policy notes for special cases
                if p.opted_out or p.status == "exhausted" or p.status == "recovered":
                    assert resp.get("policy_note") is not None, f"Expected policy note for status={p.status}, opted_out={p.opted_out}"
                    print(f"    [OK] Policy note attached: '{resp['policy_note']}'")

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("ALL PHASE 3 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_phase3_ai_diagnosis()
