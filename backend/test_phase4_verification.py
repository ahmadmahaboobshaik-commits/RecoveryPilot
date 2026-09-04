import sys
import os
import asyncio
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import Payment, RecoveryEvent
from app.main import app
from app.ai.schemas import DiagnosisResult
from app.recovery.schemas import DecisionResult, PolicyDecision
from app.recovery.decision import determine_candidate_action
from app.recovery.policy import evaluate_policy
from app.recovery.evaluation import evaluate_payment_recovery
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


def test_phase4_decision_and_policy_engine():
    print("=" * 60)
    print("RUNNING PHASE 4 DECISION & POLICY ENGINE VERIFICATION CHECKS")
    print("=" * 60)

    now = datetime.now(timezone.utc)

    # -------------------------------------------------------------
    # PART 1: DETERMINISTIC UNIT TESTS (TESTS A through K)
    # -------------------------------------------------------------
    print("\n--> PART 1: Running deterministic unit tests A through K...")

    # TEST A: Normal expired card
    print("\n[TEST A] Normal expired card...")
    payment_a = Payment(
        payment_id="test_pay_a",
        amount=50000,
        failure_code="CARD_EXPIRED",
        payment_method="card",
        customer_id="cust_a",
        created_at=now - timedelta(days=1),
        retry_count=0,
        opted_out=False,
        status="failed"
    )
    diag_a = DiagnosisResult(
        root_cause="expired_card",
        recoverability=0.90,
        recommended_action="payment_link",
        reason="Card expired.",
        confidence=0.95
    )
    dec_a = determine_candidate_action(diag_a, payment_a)
    pol_a = evaluate_policy(payment_a, diag_a, dec_a.candidate_action)
    print(f"  Candidate: {dec_a.candidate_action} | Policy: decision={pol_a.decision}, action={pol_a.action}, rule={pol_a.rule}")
    assert dec_a.candidate_action == "payment_link"
    assert pol_a.decision == "allow"
    assert pol_a.action == "payment_link"
    assert pol_a.rule is None
    print("  [OK] Test A passed (allow / payment_link).")

    # TEST B: Opted out
    print("\n[TEST B] Customer opted out...")
    payment_b = Payment(
        payment_id="test_pay_b",
        amount=50000,
        failure_code="INSUFFICIENT_FUNDS",
        payment_method="card",
        customer_id="cust_b",
        created_at=now - timedelta(days=1),
        retry_count=0,
        opted_out=True,
        status="failed"
    )
    diag_b = DiagnosisResult(
        root_cause="insufficient_funds",
        recoverability=0.80,
        recommended_action="retry",
        reason="Insufficient funds.",
        confidence=0.90
    )
    dec_b = determine_candidate_action(diag_b, payment_b)
    pol_b = evaluate_policy(payment_b, diag_b, dec_b.candidate_action)
    print(f"  Candidate: {dec_b.candidate_action} | Policy: decision={pol_b.decision}, action={pol_b.action}, rule={pol_b.rule}")
    assert pol_b.decision == "block"
    assert pol_b.action == "stop"
    assert pol_b.rule == "customer_opted_out"
    print("  [OK] Test B passed (block / stop / customer_opted_out).")

    # TEST C: Already recovered
    print("\n[TEST C] Already recovered payment...")
    payment_c = Payment(
        payment_id="test_pay_c",
        amount=50000,
        failure_code="BANK_TIMEOUT",
        payment_method="card",
        customer_id="cust_c",
        created_at=now - timedelta(days=1),
        retry_count=0,
        opted_out=False,
        status="recovered"
    )
    diag_c = DiagnosisResult(
        root_cause="bank_timeout",
        recoverability=0.90,
        recommended_action="retry",
        reason="Bank timeout.",
        confidence=0.95
    )
    dec_c = determine_candidate_action(diag_c, payment_c)
    pol_c = evaluate_policy(payment_c, diag_c, dec_c.candidate_action)
    print(f"  Candidate: {dec_c.candidate_action} | Policy: decision={pol_c.decision}, action={pol_c.action}, rule={pol_c.rule}")
    assert pol_c.decision == "block"
    assert pol_c.action == "stop"
    assert pol_c.rule == "already_recovered"
    print("  [OK] Test C passed (block / stop / already_recovered).")

    # TEST D: Maximum touches
    print("\n[TEST D] Maximum touches reached (retry_count = 3)...")
    payment_d = Payment(
        payment_id="test_pay_d",
        amount=50000,
        failure_code="BANK_TIMEOUT",
        payment_method="card",
        customer_id="cust_d",
        created_at=now - timedelta(days=1),
        retry_count=3,
        opted_out=False,
        status="exhausted"
    )
    diag_d = DiagnosisResult(
        root_cause="bank_timeout",
        recoverability=0.80,
        recommended_action="retry",
        reason="Bank timeout.",
        confidence=0.90
    )
    dec_d = determine_candidate_action(diag_d, payment_d)
    pol_d = evaluate_policy(payment_d, diag_d, dec_d.candidate_action)
    print(f"  Candidate: {dec_d.candidate_action} | Policy: decision={pol_d.decision}, action={pol_d.action}, rule={pol_d.rule}")
    assert pol_d.decision == "block"
    assert pol_d.action == "stop"
    assert pol_d.rule == "max_touches_reached"
    print("  [OK] Test D passed (block / stop / max_touches_reached).")

    # TEST E: Recovery window expired
    print("\n[TEST E] Recovery window expired (payment age > 7 days)...")
    payment_e = Payment(
        payment_id="test_pay_e",
        amount=50000,
        failure_code="INSUFFICIENT_FUNDS",
        payment_method="card",
        customer_id="cust_e",
        created_at=now - timedelta(days=8),
        retry_count=0,
        opted_out=False,
        status="failed"
    )
    diag_e = DiagnosisResult(
        root_cause="insufficient_funds",
        recoverability=0.80,
        recommended_action="wait",
        reason="Insufficient funds.",
        confidence=0.90
    )
    dec_e = determine_candidate_action(diag_e, payment_e)
    pol_e = evaluate_policy(payment_e, diag_e, dec_e.candidate_action)
    print(f"  Candidate: {dec_e.candidate_action} | Policy: decision={pol_e.decision}, action={pol_e.action}, rule={pol_e.rule}")
    assert pol_e.decision == "block"
    assert pol_e.action == "stop"
    assert pol_e.rule == "recovery_window_expired"
    print("  [OK] Test E passed (block / stop / recovery_window_expired).")

    # TEST F: Cooldown active
    print("\n[TEST F] Cooldown active (latest event < 24 hours ago)...")
    payment_f = Payment(
        payment_id="test_pay_f",
        amount=50000,
        failure_code="BANK_TIMEOUT",
        payment_method="card",
        customer_id="cust_f",
        created_at=now - timedelta(days=2),
        retry_count=1,
        opted_out=False,
        status="failed"
    )
    diag_f = DiagnosisResult(
        root_cause="bank_timeout",
        recoverability=0.80,
        recommended_action="retry",
        reason="Bank timeout.",
        confidence=0.90
    )
    recent_event_f = RecoveryEvent(
        event_id="evt_cooldown_1",
        payment_id="test_pay_f",
        stage="action_taken",
        action="retry",
        touch_number=1,
        timestamp=now - timedelta(hours=2),
        outcome=None
    )
    dec_f = determine_candidate_action(diag_f, payment_f)
    pol_f = evaluate_policy(payment_f, diag_f, dec_f.candidate_action, events_override=[recent_event_f])
    print(f"  Candidate: {dec_f.candidate_action} | Policy: decision={pol_f.decision}, action={pol_f.action}, rule={pol_f.rule}")
    assert pol_f.decision == "wait"
    assert pol_f.action == "wait"
    assert pol_f.rule == "cooldown_active"
    print("  [OK] Test F passed (wait / wait / cooldown_active).")

    # TEST G: Low AI confidence
    print("\n[TEST G] Low AI confidence (confidence = 0.40)...")
    payment_g = Payment(
        payment_id="test_pay_g",
        amount=50000,
        failure_code="UNKNOWN",
        payment_method="card",
        customer_id="cust_g",
        created_at=now - timedelta(days=1),
        retry_count=0,
        opted_out=False,
        status="failed"
    )
    diag_g = DiagnosisResult(
        root_cause="unknown",
        recoverability=0.70,
        recommended_action="wait",
        reason="Low confidence analysis.",
        confidence=0.40
    )
    dec_g = determine_candidate_action(diag_g, payment_g)
    pol_g = evaluate_policy(payment_g, diag_g, dec_g.candidate_action)
    print(f"  Candidate: {dec_g.candidate_action} | Policy: decision={pol_g.decision}, action={pol_g.action}, rule={pol_g.rule}")
    assert pol_g.decision == "block"
    assert pol_g.action == "stop"
    assert pol_g.rule == "low_ai_confidence"
    print("  [OK] Test G passed (block / stop / low_ai_confidence).")

    # TEST H: Low recoverability
    print("\n[TEST H] Low recoverability (recoverability = 0.20)...")
    payment_h = Payment(
        payment_id="test_pay_h",
        amount=50000,
        failure_code="CARD_EXPIRED",
        payment_method="card",
        customer_id="cust_h",
        created_at=now - timedelta(days=1),
        retry_count=0,
        opted_out=False,
        status="failed"
    )
    diag_h = DiagnosisResult(
        root_cause="expired_card",
        recoverability=0.20,
        recommended_action="payment_link",
        reason="Low recoverability.",
        confidence=0.85
    )
    dec_h = determine_candidate_action(diag_h, payment_h)
    pol_h = evaluate_policy(payment_h, diag_h, dec_h.candidate_action)
    print(f"  Candidate: {dec_h.candidate_action} | Policy: decision={pol_h.decision}, action={pol_h.action}, rule={pol_h.rule}")
    assert pol_h.decision == "block"
    assert pol_h.action == "stop"
    assert pol_h.rule == "low_recoverability"
    print("  [OK] Test H passed (block / stop / low_recoverability).")

    # TEST I: Bank timeout candidate action
    print("\n[TEST I] Bank timeout candidate action...")
    diag_i = DiagnosisResult(
        root_cause="bank_timeout",
        recoverability=0.80,
        recommended_action="retry",
        reason="Bank timeout.",
        confidence=0.90
    )
    dec_i = determine_candidate_action(diag_i, payment_a)
    print(f"  Root cause: bank_timeout -> Candidate Action: {dec_i.candidate_action}")
    assert dec_i.candidate_action == "retry"
    print("  [OK] Test I passed (candidate_action = retry).")

    # TEST J: 3DS failure candidate action
    print("\n[TEST J] 3DS failure candidate action...")
    diag_j = DiagnosisResult(
        root_cause="3ds_auth_failed",
        recoverability=0.70,
        recommended_action="payment_link",
        reason="3DS failure.",
        confidence=0.85
    )
    dec_j = determine_candidate_action(diag_j, payment_a)
    print(f"  Root cause: 3ds_auth_failed -> Candidate Action: {dec_j.candidate_action}")
    assert dec_j.candidate_action == "payment_link"
    print("  [OK] Test J passed (candidate_action = payment_link).")

    # TEST K: Checkout abandoned candidate action
    print("\n[TEST K] Checkout abandoned candidate action...")
    diag_k = DiagnosisResult(
        root_cause="checkout_abandoned",
        recoverability=0.60,
        recommended_action="reminder",
        reason="Checkout abandoned.",
        confidence=0.80
    )
    dec_k = determine_candidate_action(diag_k, payment_a)
    print(f"  Root cause: checkout_abandoned -> Candidate Action: {dec_k.candidate_action}")
    assert dec_k.candidate_action == "reminder"
    print("  [OK] Test K passed (candidate_action = reminder).")

    # -------------------------------------------------------------
    # PART 2: API ENDPOINT INTEGRATION & AUDIT LOGGING VERIFICATION
    # -------------------------------------------------------------
    print("\n--> PART 2: Running API Integration & Audit Logging tests...")

    # Ensure synthetic dataset is generated
    generate_synthetic_payments(count=100)

    # Test /health endpoint
    health_status, health_resp = call_asgi(app, "GET", "/health")
    assert health_status == 200, "ERROR: /health endpoint failed!"
    # Ensure synthetic dataset is generated
    generate_synthetic_payments(count=100)

    db = SessionLocal()
    try:
        # Clean up previous custom test payments & events to ensure clean test environment
        db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.like("pay_test_exec_%")).delete(synchronize_session=False)
        db.query(Payment).filter(Payment.payment_id.like("pay_test_exec_%")).delete(synchronize_session=False)
        db.commit()

        # Find 1 payment for ALLOW integration test (CARD_EXPIRED, age < 7 days, retry_count < 3, opted_out=False)
        seven_days_ago = now - timedelta(days=6)
        p_allow = db.query(Payment).filter(
            Payment.payment_id.like("pay_demo_%"),
            Payment.failure_code == "CARD_EXPIRED",
            Payment.opted_out == False,
            Payment.status == "failed"
        ).first()

        if p_allow:
            p_allow.created_at = now - timedelta(days=2)
            p_allow.retry_count = 0
            db.query(RecoveryEvent).filter(RecoveryEvent.payment_id == p_allow.payment_id).delete(synchronize_session='fetch')
            db.commit()

        assert p_allow is not None, "ERROR: No candidate payment found for ALLOW integration test!"

        mock_diag_allow = DiagnosisResult(
            root_cause="expired_card",
            recoverability=0.85,
            recommended_action="payment_link",
            reason="Expired card requires payment link update.",
            confidence=0.90
        )

        with patch("app.api.evaluate.diagnose_payment", return_value=mock_diag_allow):
            status_code, resp_json = call_asgi(app, "POST", f"/api/evaluate/{p_allow.payment_id}")
            print(f"\n  POST /api/evaluate/{p_allow.payment_id} [ALLOW Case]:")
            print(f"    HTTP Status: {status_code}")
            print(f"    Response JSON: {resp_json}")

            assert status_code == 200
            assert resp_json.get("payment_id") == p_allow.payment_id
            assert resp_json["decision"]["candidate_action"] == "payment_link"
            assert resp_json["policy"]["decision"] == "allow"
            assert resp_json["policy"]["action"] == "payment_link"
            print("  [OK] API evaluation endpoint [ALLOW case] verified.")

        # Find 1 payment for BLOCK integration test (e.g. opted_out)
        p_block = db.query(Payment).filter(Payment.opted_out == True).first()
        assert p_block is not None, "ERROR: No candidate payment found for BLOCK integration test!"

        mock_diag_block = DiagnosisResult(
            root_cause="insufficient_funds",
            recoverability=0.80,
            recommended_action="retry",
            reason="Insufficient funds.",
            confidence=0.90
        )

        with patch("app.api.evaluate.diagnose_payment", return_value=mock_diag_block):
            status_code, resp_json = call_asgi(app, "POST", f"/api/evaluate/{p_block.payment_id}")
            print(f"\n  POST /api/evaluate/{p_block.payment_id} [BLOCK Case - Opted Out]:")
            print(f"    HTTP Status: {status_code}")
            print(f"    Response JSON: {resp_json}")

            assert status_code == 200
            assert resp_json["policy"]["decision"] == "block"
            assert resp_json["policy"]["action"] == "stop"
            assert resp_json["policy"]["rule"] == "customer_opted_out"
            print("  [OK] API evaluation endpoint [BLOCK case] verified.")

            # Verify RecoveryEvent with stage="stopped" logged in DB for BLOCK case
            stop_event = db.query(RecoveryEvent).filter(
                RecoveryEvent.payment_id == p_block.payment_id,
                RecoveryEvent.stage == "stopped"
            ).first()
            assert stop_event is not None, f"ERROR: RecoveryEvent with stage='stopped' not created for payment {p_block.payment_id}"
            assert stop_event.action == "stop"
            assert stop_event.outcome == "stopped"
            print(f"  [OK] DB Audit Logging verified: RecoveryEvent logged for BLOCK case (event_id='{stop_event.event_id}', stage='{stop_event.stage}').")

        # Verify DB integrity: No payment was marked recovered and retry_count was unchanged
        p_allow_check = db.query(Payment).filter(Payment.payment_id == p_allow.payment_id).first()
        assert p_allow_check.status != "recovered", "ERROR: Payment status was incorrectly marked recovered!"
        assert p_allow_check.retry_count == p_allow.retry_count, "ERROR: Payment retry_count was incorrectly mutated!"
        print("  [OK] DB Integrity verified: Zero payment status mutations, zero retry_count increments.")

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("ALL PHASE 4 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_phase4_decision_and_policy_engine()
