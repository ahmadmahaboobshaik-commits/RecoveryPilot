import sys
import os
import asyncio
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Payment, RecoveryEvent
from app.main import app
from app.config import settings
from app.ai.schemas import DiagnosisResult
from app.recovery.schemas import DecisionResult, PolicyDecision
from app.recovery.execution.schemas import ExecutionResult
from app.recovery.execution.payment_link import PaymentLinkExecutor
from app.recovery.execution.reminder import ReminderExecutor
from app.recovery.execution.service import execute_recovery
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


def test_phase5_execution_layer():
    print("=" * 60)
    print("RUNNING PHASE 5 SAFE RECOVERY EXECUTION LAYER VERIFICATION CHECKS")
    print("=" * 60)

    now = datetime.now(timezone.utc)
    generate_synthetic_payments(count=100)
    db = SessionLocal()

    # Clean up previous custom test payments & events to ensure clean test environment
    db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.like("pay_test_exec_%")).delete(synchronize_session=False)
    db.query(Payment).filter(Payment.payment_id.like("pay_test_exec_%")).delete(synchronize_session=False)
    db.commit()

    try:
        # -------------------------------------------------------------
        # TEST A: Policy BLOCK (opted_out = True)
        # -------------------------------------------------------------
        print("\n[TEST A] Policy BLOCK (opted_out = True)...")
        p_block = Payment(
            payment_id="pay_test_exec_a",
            amount=50000,
            failure_code="INSUFFICIENT_FUNDS",
            payment_method="card",
            customer_id="cust_block",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=True,
            status="failed"
        )
        diag_a = DiagnosisResult(root_cause="insufficient_funds", recoverability=0.8, recommended_action="wait", reason="Insufficient funds", confidence=0.9)
        dec_a = DecisionResult(candidate_action="wait", reason="Wait", source="playbook")
        pol_a = PolicyDecision(decision="block", action="stop", reason="Opted out", rule="customer_opted_out")

        with patch.object(PaymentLinkExecutor, "execute") as mock_plink:
            res_a = execute_recovery(p_block, diag_a, dec_a, pol_a, db)
            print(f"  Result status: {res_a.status}, reason: {res_a.reason}")
            assert res_a.status == "skipped"
            assert mock_plink.call_count == 0
            print("  [OK] Test A passed (Policy BLOCK skipped, 0 executor calls).")

        # -------------------------------------------------------------
        # TEST B: Policy WAIT (cooldown active)
        # -------------------------------------------------------------
        print("\n[TEST B] Policy WAIT (cooldown active)...")
        p_wait = Payment(
            payment_id="pay_test_exec_b",
            amount=50000,
            failure_code="BANK_TIMEOUT",
            payment_method="card",
            customer_id="cust_wait",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        pol_b = PolicyDecision(decision="wait", action="wait", reason="Cooldown active", rule="cooldown_active")

        with patch.object(PaymentLinkExecutor, "execute") as mock_plink:
            res_b = execute_recovery(p_wait, diag_a, dec_a, pol_b, db)
            print(f"  Result status: {res_b.status}, reason: {res_b.reason}")
            assert res_b.status == "skipped"
            assert mock_plink.call_count == 0
            print("  [OK] Test B passed (Policy WAIT skipped, 0 executor calls).")

        # -------------------------------------------------------------
        # TEST C: ALLOW + payment_link (Mock PaymentLinkExecutor)
        # -------------------------------------------------------------
        print("\n[TEST C] ALLOW + payment_link (Mock PaymentLinkExecutor)...")
        p_allow_plink = Payment(
            payment_id="pay_test_exec_c",
            amount=50000,
            failure_code="CARD_EXPIRED",
            payment_method="card",
            customer_id="cust_allow_plink",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        db.add(p_allow_plink)
        db.commit()

        diag_c = DiagnosisResult(root_cause="expired_card", recoverability=0.9, recommended_action="payment_link", reason="Expired card", confidence=0.95)
        dec_c = DecisionResult(candidate_action="payment_link", reason="Use link", source="playbook")
        pol_c = PolicyDecision(decision="allow", action="payment_link", reason="Permitted", rule=None)

        mock_exec_res = ExecutionResult(
            status="executed",
            action="payment_link",
            provider="razorpay",
            reference_id="plink_mock_123",
            url="https://rzp.io/i/mock123"
        )

        with patch.object(PaymentLinkExecutor, "execute", return_value=mock_exec_res) as mock_plink:
            res_c = execute_recovery(p_allow_plink, diag_c, dec_c, pol_c, db)
            print(f"  Result status: {res_c.status}, reference_id: {res_c.reference_id}, url: {res_c.url}")
            assert res_c.status == "executed"
            assert res_c.reference_id == "plink_mock_123"
            assert mock_plink.call_count == 1
            print("  [OK] Test C passed (Executor called exactly once, returned executed with reference_id).")

        # -------------------------------------------------------------
        # TEST D: ALLOW + reminder (ReminderExecutor)
        # -------------------------------------------------------------
        print("\n[TEST D] ALLOW + reminder (ReminderExecutor)...")
        p_allow_rem = Payment(
            payment_id="pay_test_exec_d",
            amount=250000, # Rs. 2,500
            failure_code="CHECKOUT_ABANDONED",
            payment_method="upi",
            customer_id="cust_allow_rem",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="abandoned"
        )
        db.add(p_allow_rem)
        db.commit()

        diag_d = DiagnosisResult(root_cause="checkout_abandoned", recoverability=0.6, recommended_action="reminder", reason="Abandoned", confidence=0.8)
        dec_d = DecisionResult(candidate_action="reminder", reason="Remind customer", source="playbook")
        pol_d = PolicyDecision(decision="allow", action="reminder", reason="Permitted", rule=None)

        res_d = execute_recovery(p_allow_rem, diag_d, dec_d, pol_d, db)
        print(f"  Result status: {res_d.status}, message: {res_d.message}")
        assert res_d.status == "executed"
        assert res_d.provider == "simulation"
        assert "Rs. 2,500.00" in res_d.message
        print("  [OK] Test D passed (Simulated reminder returned successfully).")

        # -------------------------------------------------------------
        # TEST E: retry action (Not Implemented)
        # -------------------------------------------------------------
        print("\n[TEST E] Action 'retry' (Not Implemented)...")
        p_retry = Payment(
            payment_id="pay_test_exec_e",
            amount=50000,
            failure_code="BANK_TIMEOUT",
            payment_method="card",
            customer_id="cust_retry",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        pol_e = PolicyDecision(decision="allow", action="retry", reason="Permitted", rule=None)

        res_e = execute_recovery(p_retry, diag_a, dec_a, pol_e, db)
        print(f"  Result status: {res_e.status}, reason: {res_e.reason}")
        assert res_e.status in ["executed", "not_implemented"]
        print("  [OK] Test E passed (retry executed safely or returned not_implemented).")

        # -------------------------------------------------------------
        # TEST F: Duplicate execution (Idempotency Guard)
        # -------------------------------------------------------------
        print("\n[TEST F] Duplicate execution (Idempotency Guard)...")
        # p_allow_plink already has an action_taken RecoveryEvent logged in Test C!
        with patch.object(PaymentLinkExecutor, "execute") as mock_plink:
            res_f = execute_recovery(p_allow_plink, diag_c, dec_c, pol_c, db)
            print(f"  Result status: {res_f.status}, reason: {res_f.reason}")
            assert res_f.status == "skipped"
            assert "Execution already recorded" in res_f.reason
            assert mock_plink.call_count == 0
            print("  [OK] Test F passed (Duplicate execution skipped, Razorpay not called twice).")

        # -------------------------------------------------------------
        # TEST G: Failed Razorpay execution
        # -------------------------------------------------------------
        print("\n[TEST G] Failed Razorpay execution...")
        p_fail_plink = Payment(
            payment_id="pay_test_exec_g",
            amount=50000,
            failure_code="CARD_EXPIRED",
            payment_method="card",
            customer_id="cust_fail_plink",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        db.add(p_fail_plink)
        db.commit()

        mock_fail_res = ExecutionResult(
            status="failed",
            action="payment_link",
            provider="razorpay",
            error="Razorpay API call failed: Authentication failed"
        )

        with patch.object(PaymentLinkExecutor, "execute", return_value=mock_fail_res):
            res_g = execute_recovery(p_fail_plink, diag_c, dec_c, pol_c, db)
            print(f"  Result status: {res_g.status}, error: {res_g.error}")
            assert res_g.status == "failed"
            assert "Authentication failed" in res_g.error

            # Verify DB status & retry_count remain unchanged
            p_check_g = db.query(Payment).filter(Payment.payment_id == "pay_test_exec_g").first()
            assert p_check_g.status == "failed"
            assert p_check_g.retry_count == 0
            print("  [OK] Test G passed (status='failed', DB payment status and retry_count unchanged).")

        # -------------------------------------------------------------
        # TEST H: Successful payment-link creation (DB State Verification)
        # -------------------------------------------------------------
        print("\n[TEST H] Successful payment-link creation (DB State Verification)...")
        p_succ_plink = Payment(
            payment_id="pay_test_exec_h",
            amount=75000,
            failure_code="3DS_AUTH_FAILED",
            payment_method="card",
            customer_id="cust_succ_plink",
            created_at=now - timedelta(days=1),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        db.add(p_succ_plink)
        db.commit()

        mock_succ_res = ExecutionResult(
            status="executed",
            action="payment_link",
            provider="razorpay",
            reference_id="plink_mock_777",
            url="https://rzp.io/i/mock777"
        )

        with patch.object(PaymentLinkExecutor, "execute", return_value=mock_succ_res):
            res_h = execute_recovery(p_succ_plink, diag_c, dec_c, pol_c, db)
            assert res_h.status == "executed"
            assert res_h.reference_id == "plink_mock_777"

            # Check DB payment record
            p_check_h = db.query(Payment).filter(Payment.payment_id == "pay_test_exec_h").first()
            assert p_check_h.status == "failed", "ERROR: payment.status was mutated!"
            assert p_check_h.retry_count == 0, "ERROR: payment.retry_count was mutated!"

            # Check logged RecoveryEvent
            evt_h = db.query(RecoveryEvent).filter(RecoveryEvent.payment_id == "pay_test_exec_h", RecoveryEvent.stage == "action_taken").first()
            assert evt_h is not None, "ERROR: RecoveryEvent not logged in DB!"
            assert evt_h.action == "payment_link"
            assert evt_h.outcome == "pending"
            print("  [OK] Test H passed (executed status, reference_id & url present, payment.status & retry_count unchanged, outcome='pending').")

        # -------------------------------------------------------------
        # TEST I: Health endpoint stability
        # -------------------------------------------------------------
        print("\n[TEST I] Verifying /health endpoint...")
        h_status, h_resp = call_asgi(app, "GET", "/health")
        assert h_status == 200
        assert h_resp.get("status") == "ok"
        print("  [OK] Test I passed (/health returns 200 OK).")

        # -------------------------------------------------------------
        # TEST J: API Endpoint Integration (POST /api/execute/{payment_id})
        # -------------------------------------------------------------
        print("\n[TEST J] Verifying POST /api/execute/{payment_id} endpoint integration...")
        p_api = Payment(
            payment_id="pay_test_exec_j",
            amount=99900,
            failure_code="CARD_EXPIRED",
            payment_method="card",
            customer_id="cust_api_j",
            created_at=now - timedelta(days=2),
            retry_count=0,
            opted_out=False,
            status="failed"
        )
        db.add(p_api)
        db.commit()

        mock_api_diag = DiagnosisResult(root_cause="expired_card", recoverability=0.85, recommended_action="payment_link", reason="Card expired", confidence=0.90)

        with patch("app.api.execute.diagnose_payment", return_value=mock_api_diag):
            with patch.object(PaymentLinkExecutor, "execute", return_value=mock_succ_res):
                api_status, api_resp = call_asgi(app, "POST", f"/api/execute/{p_api.payment_id}")
                print(f"  POST /api/execute/{p_api.payment_id} status: {api_status}")
                print(f"  Response JSON: {api_resp}")

                assert api_status == 200
                assert api_resp.get("payment_id") == p_api.payment_id
                assert api_resp["policy"]["decision"] == "allow"
                assert api_resp["execution"]["status"] == "executed"
                assert api_resp["execution"]["provider"] == "razorpay"
                print("  [OK] Test J passed (POST /api/execute wiring and JSON structure verified).")

        # -------------------------------------------------------------
        # PART 3: REAL RAZORPAY TEST MODE EXECUTION (IF CREDENTIALS PRESENT)
        # -------------------------------------------------------------
        print("\n--> PART 3: Checking for Real Razorpay Test Mode credentials...")
        key_id = settings.RAZORPAY_KEY_ID
        key_secret = settings.RAZORPAY_KEY_SECRET

        has_keys = bool(
            key_id and key_secret and
            key_id != "your_razorpay_key_id_here" and
            key_secret != "your_razorpay_key_secret_here"
        )

        if has_keys:
            print(f"  Razorpay Test Mode credentials detected (KEY_ID: {key_id[:8]}...). Testing 1 real payment link creation...")
            real_p = db.query(Payment).filter(Payment.status == "failed", Payment.opted_out == False).first()
            real_p.created_at = now - timedelta(days=1)
            real_p.retry_count = 0
            db.commit()

            real_executor = PaymentLinkExecutor()
            real_res = real_executor.execute(real_p, {})

            print(f"  Real Razorpay Test Result: status={real_res.status}, reference_id={real_res.reference_id}, url={real_res.url}")

            if real_res.status == "executed":
                assert real_res.reference_id is not None
                assert real_res.url is not None
                assert real_p.status == "failed"
                assert real_p.retry_count == 0
                print(f"  [SUCCESS] Real Razorpay Payment Link Created! ID: {real_res.reference_id}")
            else:
                print(f"  [NOTICE] Real Razorpay test returned status '{real_res.status}': {real_res.error}")
        else:
            print("  [NOTICE] Real Razorpay credentials not configured in environment. Skipping real API call (mock tests passed cleanly).")

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("ALL PHASE 5 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_phase5_execution_layer()
