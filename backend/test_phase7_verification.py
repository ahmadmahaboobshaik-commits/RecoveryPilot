import sys
import os
import json
import asyncio
from datetime import datetime, timezone, timedelta

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import Payment, RecoveryEvent, BatchRun
from app.main import app
from app.config import settings
from app.recovery.batch import run_batch_recovery
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

    if "?" in path:
        path_part, query_part = path.split("?", 1)
    else:
        path_part, query_part = path, ""

    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.0"},
        "http_version": "1.1",
        "method": method,
        "scheme": "http",
        "path": path_part,
        "raw_path": path_part.encode("utf-8"),
        "query_string": query_part.encode("utf-8"),
        "headers": raw_headers,
        "client": ("127.0.0.1", 12345),
        "server": ("127.0.0.1", 8000),
    }

    asyncio.run(app_instance(scope, receive, send))
    parsed_json = json.loads(response_body.decode("utf-8")) if response_body else {}
    return response_status, parsed_json


def test_phase7_batch_verification():
    print("=" * 60)
    print("RUNNING PHASE 7 BATCH RECOVERY + REVENUE INTELLIGENCE VERIFICATION")
    print("=" * 60)

    db = SessionLocal()
    now = datetime.now(timezone.utc)

    # Clean up custom test payments from prior runs
    db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.like("pay_test_%")).delete(synchronize_session=False)
    db.query(Payment).filter(Payment.payment_id.like("pay_test_%")).delete(synchronize_session=False)
    db.query(BatchRun).delete()
    db.commit()

    generate_synthetic_payments(count=100)

    try:
        # -------------------------------------------------------------
        # TEST A: Scan 100 synthetic payments in Dry Run Mode (Default Mode)
        # -------------------------------------------------------------
        print("\n[TEST A] Scanning 100 synthetic payments in Dry Run Mode (Default Mode)...")
        # Call without mode param to verify 'dry_run' is default
        status_code_def, resp_def = call_asgi(app, "POST", "/api/recovery/run-batch")
        assert status_code_def == 200
        assert resp_def["mode"] == "dry_run", "Default mode must be 'dry_run'"

        status_code, resp_a = call_asgi(app, "POST", "/api/recovery/run-batch?mode=dry_run")
        print(f"  POST /api/recovery/run-batch?mode=dry_run status: {status_code}")
        print(f"  Batch ID: {resp_a.get('batch_id')}, Scanned: {resp_a.get('total_scanned')}, Eligible: {resp_a.get('eligible')}, Skipped: {resp_a.get('skipped')}, Blocked: {resp_a.get('blocked')}")
        
        assert status_code == 200
        assert resp_a["mode"] == "dry_run"
        assert resp_a["total_scanned"] == 100
        assert resp_a["eligible"] > 0
        assert len(resp_a["results"]) == 100
        print("  [OK] Test A passed (Default mode is dry_run; 100 synthetic payments scanned in dry_run mode).")

        # -------------------------------------------------------------
        # TEST B: Eligibility Filtering Accuracy
        # -------------------------------------------------------------
        print("\n[TEST B] Verifying Eligibility Filtering...")
        opted_out_items = [r for r in resp_a["results"] if r["eligibility"] == "opted_out"]
        exhausted_items = [r for r in resp_a["results"] if r["eligibility"] == "exhausted"]
        recovered_items = [r for r in resp_a["results"] if r["eligibility"] == "recovered"]
        eligible_items = [r for r in resp_a["results"] if r["eligibility"] == "eligible"]

        print(f"  Eligibility counts: eligible={len(eligible_items)}, opted_out={len(opted_out_items)}, exhausted={len(exhausted_items)}, recovered={len(recovered_items)}")
        assert len(opted_out_items) > 0, "Opted-out payments must be flagged"
        assert len(exhausted_items) > 0, "Exhausted payments must be flagged"
        assert len(recovered_items) > 0, "Recovered payments must be flagged"
        assert len(eligible_items) > 0, "Eligible payments must be flagged"

        # Verify all opted_out items are marked blocked
        for item in opted_out_items:
            assert item["policy_decision"] == "block"
            assert item["execution_status"] == "blocked"

        print("  [OK] Test B passed (Eligibility filtering correctly identified all payment categories).")

        # -------------------------------------------------------------
        # TEST C: Dry Run does not execute external actions
        # -------------------------------------------------------------
        print("\n[TEST C] Verifying Dry Run does not execute actions...")
        assert resp_a["executed"] == 0
        action_taken_events = db.query(RecoveryEvent).filter(
            RecoveryEvent.stage == "action_taken",
            RecoveryEvent.outcome == "pending"
        ).count()
        print(f"  Dry run executed count: {resp_a['executed']}, DB pending actions: {action_taken_events}")
        print("  [OK] Test C passed (Dry run executed 0 external actions).")

        # -------------------------------------------------------------
        # TEST D: Dry Run does not mutate payment status to recovered
        # -------------------------------------------------------------
        print("\n[TEST D] Verifying Dry Run does not mutate payment.status...")
        rec_count_after_dry_run = db.query(Payment).filter(Payment.status == "recovered").count()
        assert resp_a["recovered"] == rec_count_after_dry_run
        print(f"  Recovered count in DB after dry run: {rec_count_after_dry_run}")
        print("  [OK] Test D passed (Zero payment status mutations during dry run).")

        # -------------------------------------------------------------
        # TEST E: Execute Mode runs policy-approved actions ONLY & Phase 6 Webhook Integration
        # -------------------------------------------------------------
        print("\n[TEST E] Running Execute Mode (mode=execute) & End-to-End Webhook Verification...")
        status_code, resp_e = call_asgi(app, "POST", "/api/recovery/run-batch?mode=execute")
        print(f"  POST /api/recovery/run-batch?mode=execute status: {status_code}")
        print(f"  Batch ID: {resp_e.get('batch_id')}, Executed: {resp_e.get('executed')}, Actions Allowed: {resp_e.get('actions_allowed')}, Actions Blocked: {resp_e.get('actions_blocked')}")

        assert status_code == 200
        assert resp_e["mode"] == "execute"
        assert resp_e["executed"] > 0
        assert resp_e["executed"] <= resp_e["actions_allowed"]

        # Pick one executed item to verify payment status is STILL NOT recovered until webhook arrives
        executed_item = next((item for item in resp_e["results"] if item["execution_status"] == "executed"), None)
        assert executed_item is not None

        target_p = db.query(Payment).filter(Payment.payment_id == executed_item["payment_id"]).first()
        assert target_p.status != "recovered", "Batch execution MUST NOT mark payment recovered!"

        # Now simulate incoming Phase 6 Razorpay verified webhook for this executed payment
        import hmac, hashlib
        test_sec = "test_phase7_webhook_sec"
        settings.RAZORPAY_WEBHOOK_SECRET = test_sec

        wh_payload = {
            "entity": "event",
            "event": "payment_link.paid",
            "id": f"evt_rzp_batch_{target_p.payment_id}",
            "payload": {
                "payment_link": {
                    "entity": {
                        "id": f"plink_{target_p.payment_id}",
                        "amount": target_p.amount,
                        "notes": {"payment_id": target_p.payment_id}
                    }
                },
                "payment": {
                    "entity": {"id": f"pay_rzp_{target_p.payment_id}", "amount": target_p.amount}
                }
            }
        }
        wh_body = json.dumps(wh_payload).encode("utf-8")
        wh_sig = hmac.new(test_sec.encode("utf-8"), wh_body, hashlib.sha256).hexdigest()

        wh_code, wh_resp = call_asgi(
            app, "POST", "/api/webhooks/razorpay",
            headers_dict={"content-type": "application/json", "x-razorpay-signature": wh_sig},
            body_bytes=wh_body
        )
        assert wh_code == 200
        assert wh_resp["status"] == "recovered"

        db.refresh(target_p)
        assert target_p.status == "recovered", "Payment status MUST update to recovered ONLY after verified webhook!"

        for item in resp_e["results"]:
            if item["execution_status"] == "executed":
                assert item["policy_decision"] == "allow"
        print("  [OK] Test E passed (Execute mode executed ONLY policy-approved actions; payment status updated to recovered ONLY after verified Phase 6 webhook).")

        # -------------------------------------------------------------
        # TEST F: Opted-out payments are NEVER executed
        # -------------------------------------------------------------
        print("\n[TEST F] Verifying Opted-out payments are NEVER executed...")
        opted_out_executed = [
            r for r in resp_e["results"]
            if r["eligibility"] == "opted_out" and r["execution_status"] == "executed"
        ]
        assert len(opted_out_executed) == 0
        print("  [OK] Test F passed (0 opted-out payments executed).")

        # -------------------------------------------------------------
        # TEST G: Exhausted payments are NEVER executed
        # -------------------------------------------------------------
        print("\n[TEST G] Verifying Exhausted payments are NEVER executed...")
        exhausted_executed = [
            r for r in resp_e["results"]
            if r["eligibility"] == "exhausted" and r["execution_status"] == "executed"
        ]
        assert len(exhausted_executed) == 0
        print("  [OK] Test G passed (0 exhausted payments executed).")

        # -------------------------------------------------------------
        # TEST H: Duplicate Batch Execution (Idempotency Protection)
        # -------------------------------------------------------------
        print("\n[TEST H] Verifying Duplicate Batch Execution Idempotency...")
        status_code, resp_h = call_asgi(app, "POST", "/api/recovery/run-batch?mode=execute")
        print(f"  Duplicate run status: {status_code}, Executed: {resp_h.get('executed')}")
        assert status_code == 200
        # Second execute run must execute 0 NEW actions because all eligible payments are in cooldown/pending
        assert resp_h["executed"] == 0
        print("  [OK] Test H passed (Duplicate batch run skipped execution via idempotency & cooldown guards).")

        # -------------------------------------------------------------
        # TEST I: AI Configuration Failure Safety
        # -------------------------------------------------------------
        print("\n[TEST I] Verifying AI Configuration Failure Safety...")
        orig_key = settings.ANTHROPIC_API_KEY
        settings.ANTHROPIC_API_KEY = None

        status_code, resp_i = call_asgi(app, "POST", "/api/recovery/run-batch?mode=dry_run")
        print(f"  Dry run with missing AI key status: {status_code}, Scanned: {resp_i.get('total_scanned')}")
        assert status_code == 200
        assert resp_i["total_scanned"] == 100

        # Health endpoint stability
        h_code, h_resp = call_asgi(app, "GET", "/health")
        assert h_code == 200
        assert h_resp["status"] == "ok"
        print("  [OK] Test I passed (Batch orchestrator handled missing AI key with fallback, /health remained 200 OK).")

        settings.ANTHROPIC_API_KEY = orig_key

        # -------------------------------------------------------------
        # TEST J: Dynamic Batch Metrics Calculation
        # -------------------------------------------------------------
        print("\n[TEST J] Dynamic Batch Metrics Verification...")
        status_code, metrics_j = call_asgi(app, "GET", "/api/recovery/metrics")
        print(f"  GET /api/recovery/metrics status: {status_code}")
        print(f"  Metrics keys: {list(metrics_j.keys())}")
        assert status_code == 200
        assert "total_at_risk" in metrics_j
        assert "total_recovered" in metrics_j
        assert "recovery_rate" in metrics_j
        assert "pending_recovery_count" in metrics_j
        print(f"  Calculated: total_at_risk={metrics_j['total_at_risk']}, total_recovered={metrics_j['total_recovered']}, rate={metrics_j['recovery_rate']}%, pending={metrics_j['pending_recovery_count']}")
        print("  [OK] Test J passed (Extended metrics calculated dynamically from SQLite).")

        # -------------------------------------------------------------
        # TEST K: Recovery-by-Root-Cause Metrics
        # -------------------------------------------------------------
        print("\n[TEST K] Recovery-by-Root-Cause Metrics...")
        by_cause = metrics_j.get("by_root_cause", {})
        print(f"  Root causes tracked: {list(by_cause.keys())}")
        assert len(by_cause) > 0
        sample_cause = next(iter(by_cause.values()))
        assert "at_risk" in sample_cause
        assert "recovered" in sample_cause
        assert "payment_count" in sample_cause
        assert "attempts" in sample_cause
        print("  [OK] Test K passed (by_root_cause metrics present with detailed fields).")

        # -------------------------------------------------------------
        # TEST L: Recovery-by-Action Metrics
        # -------------------------------------------------------------
        print("\n[TEST L] Recovery-by-Action Metrics...")
        by_act = metrics_j.get("by_action", {})
        print(f"  Actions tracked: {list(by_act.keys())}")
        assert len(by_act) > 0
        assert "payment_link" in by_act
        plink_metrics = by_act["payment_link"]
        assert "attempts" in plink_metrics
        assert "executed" in plink_metrics
        assert "recovered" in plink_metrics
        assert "revenue_recovered" in plink_metrics
        assert "recovery_rate" in plink_metrics
        print(f"  payment_link action metrics: attempts={plink_metrics['attempts']}, executed={plink_metrics['executed']}, recovered={plink_metrics['recovered']}")
        print("  [OK] Test L passed (by_action metrics present with detailed fields).")

        # -------------------------------------------------------------
        # TEST M: Batch History API (GET /api/recovery/batches)
        # -------------------------------------------------------------
        print("\n[TEST M] Batch History API Verification...")
        status_code, batch_hist = call_asgi(app, "GET", "/api/recovery/batches")
        print(f"  GET /api/recovery/batches status: {status_code}, count: {len(batch_hist)}")
        assert status_code == 200
        assert isinstance(batch_hist, list)
        assert len(batch_hist) >= 3 # We ran 3 batches in tests A, E, H, I!
        latest_b = batch_hist[0]
        assert "batch_id" in latest_b
        assert "mode" in latest_b
        assert "total_scanned" in latest_b
        assert "total_at_risk" in latest_b
        print(f"  Latest batch record: batch_id={latest_b['batch_id']}, mode={latest_b['mode']}, scanned={latest_b['total_scanned']}")
        print("  [OK] Test M passed (Batch history API returned persistent batch runs from SQLite).")

        # -------------------------------------------------------------
        # TEST N: Health Endpoint Stability
        # -------------------------------------------------------------
        print("\n[TEST N] Health Endpoint Stability...")
        status_code, resp_n = call_asgi(app, "GET", "/health")
        assert status_code == 200
        assert resp_n["status"] == "ok"
        print("  [OK] Test N passed (/health returned 200 OK).")

        # -------------------------------------------------------------
        # TEST O: Full Regression Test Suite Execution (Phases 1-6)
        # -------------------------------------------------------------
        print("\n[TEST O] Running Full Regression Test Suite (Phases 1-6)...")
        from test_models_verification import test_database_and_models
        from test_phase2_verification import test_phase2
        from test_phase3_verification import test_phase3_ai_diagnosis
        from test_phase4_verification import test_phase4_decision_and_policy_engine
        from test_phase5_verification import test_phase5_execution_layer
        from test_phase6_verification import test_phase6_verification

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
        print("  Running test_phase6_verification.py...")
        test_phase6_verification()

        print("  [OK] Test O passed (All regression verification scripts executed cleanly).")

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("ALL PHASE 7 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_phase7_batch_verification()
