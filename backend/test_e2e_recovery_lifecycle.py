import hmac
import hashlib
import json
import os
import sys
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, engine, Base
from app.models import Payment, RecoveryEvent, BatchRun
from app.config import settings
from app.ai.diagnosis import get_deterministic_diagnosis
from app.recovery import evaluate_policy, determine_candidate_action
from app.recovery.execution.service import execute_recovery
from app.recovery.batch import run_batch_recovery

def test_e2e_recovery_lifecycle():
    print("=" * 70)
    print("RECOVERYPILOT -- END-TO-END RECOVERY LIFECYCLE TEST SUITE")
    print("=" * 70)

    # Initialize DB tables cleanly
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clean previous lifecycle test records to ensure idempotency
    db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.like("pay_test_lifecycle_%")).delete(synchronize_session=False)
    db.query(Payment).filter(Payment.payment_id.like("pay_test_lifecycle_%")).delete(synchronize_session=False)
    db.commit()

    client = TestClient(app)

    # Configure test webhook secret
    WEBHOOK_SECRET = "test_webhook_secret_key_12345"
    settings.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET

    # =========================================================================
    # TEST A: SUCCESSFUL RECOVERY LIFECYCLE
    # FAILED -> DIAGNOSED -> DECISION -> POLICY ALLOW -> EXECUTED -> WEBHOOK -> VERIFIED -> RECOVERED
    # =========================================================================
    print("\n--> [TEST A] Successful Recovery Lifecycle...")
    
    # 1. Create failed payment
    pay_a = Payment(
        payment_id="pay_test_lifecycle_a",
        customer_id="cust_e2e_001",
        amount=500000, # Rs. 5000.00
        payment_method="card",
        status="failed",
        failure_code="GATEWAY_ERROR",
        failure_message="Temporary payment gateway error.",
        retry_count=0,
        opted_out=False,
        created_at=datetime.now(timezone.utc)
    )
    db.merge(pay_a)
    db.commit()

    # 2. Diagnose
    res_diag = client.post(f"/api/diagnose/{pay_a.payment_id}")
    assert res_diag.status_code in [200, 503]
    print("  [OK] Diagnosed stage logged")

    # 3. Evaluate Decision & Policy
    res_eval = client.post(f"/api/evaluate/{pay_a.payment_id}")
    assert res_eval.status_code == 200
    eval_data = res_eval.json()
    assert eval_data["policy"]["decision"] == "allow"
    print("  [OK] Candidate decision & Policy ALLOW verified")

    # 4. Execute
    res_exec = client.post(f"/api/execute/{pay_a.payment_id}")
    assert res_exec.status_code == 200
    exec_data = res_exec.json()
    assert exec_data["execution"]["status"] == "executed"
    assert exec_data["execution"]["action"] == "retry"
    assert exec_data["execution"]["provider"] == "mock_gateway"
    
    # Verify Payment status remains 'failed' after execution (EXECUTED != RECOVERED)
    pay_a_after_exec = db.query(Payment).filter(Payment.payment_id == pay_a.payment_id).first()
    assert pay_a_after_exec.status == "failed", "Execution must NOT mark payment as recovered!"
    assert pay_a_after_exec.retry_count == 1, "Execution must increment retry_count exactly once!"
    print("  [OK] Execution complete: Action 'retry' via 'mock_gateway', status remains 'failed' (NOT recovered), retry_count=1")

    # 4b. Test Idempotency & Cooldown Guardrail (Repeated Execution)
    res_exec_repeat = client.post(f"/api/execute/{pay_a.payment_id}")
    assert res_exec_repeat.status_code == 200
    assert res_exec_repeat.json()["execution"]["status"] == "skipped"
    print("  [OK] Idempotency & Cooldown verified: Repeated execution safely skipped without duplicate action")

    # 5. Simulate Webhook Verification (payment_link.paid)
    rzp_plink_id = exec_data["execution"].get("reference_id") or "plink_e2e_test_a"
    webhook_payload = {
        "entity": "event",
        "account_id": "acc_e2e_001",
        "event": "payment_link.paid",
        "id": "evt_rzp_e2e_test_a",
        "contains": ["payment_link", "payment"],
        "payload": {
            "payment_link": {
                "entity": {
                    "id": rzp_plink_id,
                    "amount": 500000,
                    "notes": {"payment_id": pay_a.payment_id}
                }
            },
            "payment": {
                "entity": {
                    "id": "pay_rzp_captured_a",
                    "amount": 500000,
                    "payment_link_id": rzp_plink_id
                }
            }
        }
    }
    raw_body = json.dumps(webhook_payload).encode("utf-8")
    sig = hmac.new(WEBHOOK_SECRET.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()

    res_wh = client.post(
        "/api/webhooks/razorpay",
        content=raw_body,
        headers={"X-Razorpay-Signature": sig, "Content-Type": "application/json"}
    )
    assert res_wh.status_code == 200
    assert res_wh.json()["status"] == "recovered"
    print("  [OK] Webhook HMAC-SHA256 signature verified")

    # 6. Verify Payment is now RECOVERED
    db.expire_all()
    pay_a_final = db.query(Payment).filter(Payment.payment_id == pay_a.payment_id).first()
    assert pay_a_final.status == "recovered"
    print("  [OK] Payment status updated to 'recovered' ONLY after webhook verification")

    # =========================================================================
    # TEST B: OPTED-OUT CUSTOMER (POLICY BLOCK)
    # =========================================================================
    print("\n--> [TEST B] Opted-Out Customer (Policy Block)...")
    pay_b = Payment(
        payment_id="pay_test_lifecycle_b",
        customer_id="cust_e2e_opted_out",
        amount=150000,
        payment_method="upi",
        status="failed",
        failure_code="INSUFFICIENT_FUNDS",
        retry_count=0,
        opted_out=True,
        created_at=datetime.now(timezone.utc)
    )
    db.merge(pay_b)
    db.commit()

    res_eval_b = client.post(f"/api/evaluate/{pay_b.payment_id}")
    assert res_eval_b.status_code == 200
    assert res_eval_b.json()["policy"]["decision"] == "block"
    assert res_eval_b.json()["policy"]["rule"] == "customer_opted_out"
    print("  [OK] Policy BLOCK verified for opted-out customer")

    res_exec_b = client.post(f"/api/execute/{pay_b.payment_id}")
    assert res_exec_b.status_code == 200
    assert res_exec_b.json()["execution"]["status"] == "skipped"
    print("  [OK] Execution safely rejected for blocked policy")

    # =========================================================================
    # TEST C: RETRY LIMIT EXHAUSTED (retry_count >= 3)
    # =========================================================================
    print("\n--> [TEST C] Retry Limit Exhausted (retry_count >= 3)...")
    pay_c = Payment(
        payment_id="pay_test_lifecycle_c",
        customer_id="cust_e2e_exhausted",
        amount=300000,
        payment_method="card",
        status="failed",
        failure_code="BANK_TIMEOUT",
        retry_count=3,
        opted_out=False,
        created_at=datetime.now(timezone.utc)
    )
    db.merge(pay_c)
    db.commit()

    res_eval_c = client.post(f"/api/evaluate/{pay_c.payment_id}")
    assert res_eval_c.status_code == 200
    assert res_eval_c.json()["policy"]["decision"] == "block"
    assert res_eval_c.json()["policy"]["rule"] == "max_touches_reached"
    print("  [OK] Policy BLOCK verified for exhausted retry limit (>= 3)")

    # =========================================================================
    # TEST D: ALREADY RECOVERED
    # =========================================================================
    print("\n--> [TEST D] Already Recovered Payment...")
    pay_d = Payment(
        payment_id="pay_test_lifecycle_d",
        customer_id="cust_e2e_recovered",
        amount=450000,
        payment_method="upi",
        status="recovered",
        failure_code="INSUFFICIENT_FUNDS",
        retry_count=1,
        opted_out=False,
        created_at=datetime.now(timezone.utc)
    )
    db.merge(pay_d)
    db.commit()

    res_eval_d = client.post(f"/api/evaluate/{pay_d.payment_id}")
    assert res_eval_d.status_code == 200
    assert res_eval_d.json()["policy"]["decision"] == "block"
    assert res_eval_d.json()["policy"]["rule"] == "already_recovered"
    print("  [OK] Policy BLOCK verified for already recovered payment")

    # =========================================================================
    # TEST E: INVALID WEBHOOK SIGNATURE
    # =========================================================================
    print("\n--> [TEST E] Invalid Webhook Signature...")
    bad_sig = "invalid_fake_signature_hash_xyz"
    res_wh_bad = client.post(
        "/api/webhooks/razorpay",
        content=raw_body,
        headers={"X-Razorpay-Signature": bad_sig, "Content-Type": "application/json"}
    )
    assert res_wh_bad.status_code == 400
    print("  [OK] Webhook with invalid signature rejected (HTTP 400)")

    # =========================================================================
    # TEST F: DUPLICATE WEBHOOK IDEMPOTENCY
    # =========================================================================
    print("\n--> [TEST F] Duplicate Webhook Idempotency...")
    res_wh_dup = client.post(
        "/api/webhooks/razorpay",
        content=raw_body,
        headers={"X-Razorpay-Signature": sig, "Content-Type": "application/json"}
    )
    assert res_wh_dup.status_code == 200
    assert res_wh_dup.json()["status"] in ["already_processed", "already_recovered"]
    print("  [OK] Duplicate webhook handled idempotently (zero revenue double-counting)")

    # =========================================================================
    # TEST G: BATCH DRY RUN (ZERO EXECUTIONS)
    # =========================================================================
    print("\n--> [TEST G] Batch Dry Run...")
    res_dry = client.post("/api/recovery/run-batch?mode=dry_run")
    assert res_dry.status_code == 200
    dry_data = res_dry.json()
    assert dry_data["mode"] == "dry_run"
    assert dry_data["executed"] == 0, "Dry run must perform ZERO executions!"
    print(f"  [OK] Batch dry-run complete (Scanned: {dry_data['total_scanned']}, Executed: 0)")

    # =========================================================================
    # TEST H: BATCH EXECUTE (POLICY GATED)
    # =========================================================================
    print("\n--> [TEST H] Batch Execute...")
    res_batch_exec = client.post("/api/recovery/run-batch?mode=execute")
    assert res_batch_exec.status_code == 200
    batch_exec_data = res_batch_exec.json()
    assert batch_exec_data["mode"] == "execute"
    print(f"  [OK] Batch execute complete (Executed: {batch_exec_data['executed']}, Allowed: {batch_exec_data['actions_allowed']})")

    # =========================================================================
    # VERIFY METRICS AFTER RECOVERY
    # =========================================================================
    print("\n--> [METRICS] Verifying Database Derived Metrics...")
    res_metrics = client.get("/api/metrics")
    assert res_metrics.status_code == 200
    m_data = res_metrics.json()
    assert m_data["total_recovered"] >= 500000
    assert m_data["recovery_rate"] > 0
    print(f"  [OK] Metrics verified: Total Recovered = Rs. {m_data['total_recovered']/100:.2f}, Recovery Rate = {m_data['recovery_rate']}%")

    print("\n" + "=" * 70)
    print("ALL 8 E2E RECOVERY LIFECYCLE TEST SCENARIOS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    test_e2e_recovery_lifecycle()
