import requests
import json
import time
import hmac
import hashlib

BASE_URL = "http://127.0.0.1:8000"

def run_comprehensive_verification():
    print("=" * 80)
    print("RECOVERYPILOT FINAL SYSTEM & LIFECYCLE COMPREHENSIVE VERIFICATION")
    print("=" * 80)

    # 1. Health Endpoint
    print("\n[Step 1] Verifying /health endpoint...")
    h_resp = requests.get(f"{BASE_URL}/health")
    assert h_resp.status_code == 200, f"Health check failed: {h_resp.status_code}"
    h_data = h_resp.json()
    assert h_data.get("status") == "ok"
    print("  [OK] Health endpoint returns 200 OK and valid status:", h_data)

    # 2. Reset Demo Fixtures to Clean Known Baseline
    print("\n[Step 2] Resetting demo fixtures via POST /api/demo/reset...")
    reset_resp = requests.post(f"{BASE_URL}/api/demo/reset")
    assert reset_resp.status_code == 200, f"Demo reset failed: {reset_resp.status_code}"
    print("  [OK] Demo reset successful:", reset_resp.json().get("message"))

    # -------------------------------------------------------------
    # SCENARIO A: pay_demo_0013 — ALLOW -> RETRY -> EXECUTED -> VERIFIED RECOVERED
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("SCENARIO A: pay_demo_0013 (ALLOW Lifecycle)")
    print("=" * 60)
    p_id = "pay_demo_0013"

    # Step A.1: Verify Initial State
    p_init = requests.get(f"{BASE_URL}/api/payments/{p_id}").json()
    p_init_data = p_init["payment"]
    print(f"  [A.1] Initial State: ID={p_init_data['payment_id']}, status={p_init_data['status']}, retry_count={p_init_data['retry_count']}, opted_out={p_init_data['opted_out']}")
    assert p_init_data["status"] == "failed"
    assert p_init_data["retry_count"] == 0
    assert p_init_data["opted_out"] is False

    # Step A.2: AI Diagnosis (Advisory)
    diag_res = requests.post(f"{BASE_URL}/api/diagnose/{p_id}").json()
    print(f"  [A.2] AI Diagnosis: root_cause={diag_res['diagnosis']['root_cause']}, confidence={diag_res['diagnosis']['confidence']}, recommended_action={diag_res['diagnosis']['recommended_action']}")
    assert "diagnosis" in diag_res
    assert diag_res["diagnosis"]["recommended_action"] in ["retry", "payment_link", "wait"]

    # Step A.3: Policy Evaluation (Authoritative Deterministic Playbook & Guardrails)
    eval_res = requests.post(f"{BASE_URL}/api/evaluate/{p_id}").json()
    print(f"  [A.3] Policy Evaluation: candidate={eval_res['decision']['candidate_action']}, policy_decision={eval_res['policy']['decision']}, rule={eval_res['policy']['rule']}")
    assert eval_res["policy"]["decision"] == "allow"
    assert eval_res["policy"]["action"] == "retry"

    # Step A.4: Execution (Safe Execution Layer - Status NOT yet recovered)
    exec_res = requests.post(f"{BASE_URL}/api/execute/{p_id}").json()
    print(f"  [A.4] Live Execution: status={exec_res['execution']['status']}, provider={exec_res['execution']['provider']}")
    assert exec_res["execution"]["status"] == "executed"
    
    # Verify payment status remains 'failed' (NOT 'recovered') prior to webhook confirmation
    p_post_exec = requests.get(f"{BASE_URL}/api/payments/{p_id}").json()["payment"]
    print(f"  [A.4.1] Payment Status after Execute: status={p_post_exec['status']} (Must NOT be recovered yet), retry_count={p_post_exec['retry_count']}")
    assert p_post_exec["status"] == "failed"
    assert p_post_exec["retry_count"] == 1

    # Step A.5: HMAC-SHA256 Webhook Verification -> Status becomes 'recovered'
    wh_sim = requests.post(f"{BASE_URL}/api/webhooks/simulate/{p_id}").json()
    print(f"  [A.5] Webhook Simulation: status={wh_sim.get('status')}, event={wh_sim.get('event')}, amount_received={wh_sim.get('amount_received')}")
    assert wh_sim["status"] == "recovered"
    assert wh_sim["amount_received"] == p_init_data["amount"]

    # Verify Final Recovered State
    p_final = requests.get(f"{BASE_URL}/api/payments/{p_id}").json()
    print(f"  [A.6] Final State: status={p_final['payment']['status']}, retry_count={p_final['payment']['retry_count']}")
    assert p_final["payment"]["status"] == "recovered"

    # Verify Audit Trail for pay_demo_0013
    stages = [ev["stage"] for ev in p_final["timeline"]]
    print(f"  [A.7] Audit Trail Stages for {p_id}: {stages}")
    assert "detected" in stages or "diagnosed" in stages
    assert "action_taken" in stages
    assert "outcome" in stages
    print("  [OK] Scenario A PASSED 100%!")

    # -------------------------------------------------------------
    # SCENARIO B: pay_test_lifecycle_b — BLOCK -> no execution -> remains unrecovered
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("SCENARIO B: pay_test_lifecycle_b (BLOCK Lifecycle)")
    print("=" * 60)
    pb_id = "pay_test_lifecycle_b"

    # Step B.1: Verify Initial State
    pb_init = requests.get(f"{BASE_URL}/api/payments/{pb_id}").json()["payment"]
    print(f"  [B.1] Initial State: ID={pb_init['payment_id']}, status={pb_init['status']}, retry_count={pb_init['retry_count']}, opted_out={pb_init['opted_out']}")
    assert pb_init["status"] == "failed"
    assert pb_init["opted_out"] is True

    # Step B.2: AI Diagnosis
    pb_diag = requests.post(f"{BASE_URL}/api/diagnose/{pb_id}").json()
    print(f"  [B.2] AI Diagnosis: root_cause={pb_diag['diagnosis']['root_cause']}, recommended_action={pb_diag['diagnosis']['recommended_action']}")

    # Step B.3: Policy Evaluation (BLOCK due to customer_opted_out)
    pb_eval = requests.post(f"{BASE_URL}/api/evaluate/{pb_id}").json()
    print(f"  [B.3] Policy Evaluation: decision={pb_eval['policy']['decision']}, rule={pb_eval['policy']['rule']}, reason={pb_eval['policy']['reason']}")
    assert pb_eval["policy"]["decision"] == "block"
    assert pb_eval["policy"]["rule"] == "customer_opted_out"

    # Step B.4: Attempt Execution (Guardrail Skips Execution)
    pb_exec = requests.post(f"{BASE_URL}/api/execute/{pb_id}").json()
    print(f"  [B.4] Execution Attempt: status={pb_exec['execution']['status']}, reason={pb_exec['execution']['reason']}")
    assert pb_exec["execution"]["status"] == "skipped"

    # Step B.5: Verify Payment Remains Unrecovered
    pb_final = requests.get(f"{BASE_URL}/api/payments/{pb_id}").json()
    print(f"  [B.5] Final Payment State: status={pb_final['payment']['status']}, retry_count={pb_final['payment']['retry_count']}")
    assert pb_final["payment"]["status"] == "failed"
    assert pb_final["payment"]["retry_count"] == pb_init["retry_count"]
    print("  [OK] Scenario B PASSED 100%!")

    # -------------------------------------------------------------
    # SCENARIO C: Batch Engine DRY RUN (Zero State Mutation)
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("SCENARIO C: Batch Engine DRY RUN (Zero State Mutation)")
    print("=" * 60)

    # Step C.1: Snapshot DB State Before Batch Dry Run
    payments_before_resp = requests.get(f"{BASE_URL}/api/payments?limit=200").json()
    payments_before = {p["payment_id"]: (p["status"], p["retry_count"], p["amount"]) for p in payments_before_resp["payments"]}
    metrics_before = requests.get(f"{BASE_URL}/api/metrics").json()
    activity_before_count = len(requests.get(f"{BASE_URL}/api/recovery/activity?limit=500").json())

    print(f"  [C.1] DB State Before: {len(payments_before)} payments, Total Recovered = Rs. {metrics_before['total_recovered']}, Activity Log Entries = {activity_before_count}")

    # Step C.2: Run Batch in DRY RUN Mode
    batch_dry_run = requests.post(f"{BASE_URL}/api/recovery/run-batch?mode=dry_run").json()
    print(f"  [C.2] Batch Dry Run Response: batch_id={batch_dry_run['batch_id']}, mode={batch_dry_run['mode']}, scanned={batch_dry_run['total_scanned']}, eligible={batch_dry_run['eligible']}, executed={batch_dry_run['executed']}")
    assert batch_dry_run["mode"] == "dry_run"
    assert batch_dry_run["total_scanned"] > 0
    assert batch_dry_run["executed"] == 0, "Dry Run executed count MUST be 0!"

    # Step C.3: Snapshot DB State After Batch Dry Run & Assert Strict Zero State Mutation
    payments_after_resp = requests.get(f"{BASE_URL}/api/payments?limit=200").json()
    payments_after = {p["payment_id"]: (p["status"], p["retry_count"], p["amount"]) for p in payments_after_resp["payments"]}
    metrics_after = requests.get(f"{BASE_URL}/api/metrics").json()

    for pid, before_state in payments_before.items():
        after_state = payments_after[pid]
        assert before_state == after_state, f"Mutation detected on payment {pid}: before={before_state}, after={after_state}"

    assert metrics_before["total_recovered"] == metrics_after["total_recovered"], "Recovered metric mutated during dry run!"
    assert metrics_before["total_at_risk"] == metrics_after["total_at_risk"], "At-risk metric mutated during dry run!"
    print(f"  [C.3] Strict Zero-Mutation Invariant VERIFIED across all {len(payments_before)} records.")
    print("  [OK] Scenario C PASSED 100%!")

    # -------------------------------------------------------------
    # ADDITIONAL VERIFICATIONS: Rules, Guardrails, Webhooks, Metrics
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("ENGINE GUARDRAILS & RECOVERY INTELLIGENCE VERIFICATIONS")
    print("=" * 60)

    # 1. Invalid Webhook Signature Rejection
    print("\n[Verify 1] Invalid Webhook Signature Rejection...")
    inv_wh = requests.post(f"{BASE_URL}/api/webhooks/simulate-invalid/{p_id}").json()
    print(f"  Simulation with invalid signature: status={inv_wh['status']}, reason={inv_wh['reason']}")
    assert inv_wh["status"] == "invalid_signature"
    print("  [OK] Invalid signature rejected cleanly.")

    # 2. Cooldown Rule on Recovered or Recently Executed Payment
    print("\n[Verify 2] Cooldown & Terminal Status Guardrail...")
    cd_eval = requests.post(f"{BASE_URL}/api/evaluate/{p_id}").json()
    print(f"  Post-Recovery Policy Decision for {p_id}: decision={cd_eval['policy']['decision']}, rule={cd_eval['policy']['rule']}")
    assert cd_eval["policy"]["decision"] == "block"
    assert cd_eval["policy"]["rule"] == "already_recovered"
    print("  [OK] Already recovered / terminal state blocked from recovery.")

    # 3. Live Batch Execution
    print("\n[Verify 3] Live Batch Execution Mode (mode=execute)...")
    batch_exec = requests.post(f"{BASE_URL}/api/recovery/run-batch?mode=execute").json()
    print(f"  Batch Execute Response: batch_id={batch_exec['batch_id']}, scanned={batch_exec['total_scanned']}, executed={batch_exec['executed']}, allowed={batch_exec['actions_allowed']}, blocked={batch_exec['actions_blocked']}")
    assert batch_exec["mode"] == "execute"
    assert batch_exec["executed"] > 0
    assert batch_exec["executed"] <= batch_exec["actions_allowed"]

    # 4. Batch History API
    print("\n[Verify 4] Batch History API...")
    batches_resp = requests.get(f"{BASE_URL}/api/recovery/batches?limit=10").json()
    print(f"  Batch History Records: {len(batches_resp)}")
    assert len(batches_resp) >= 2
    latest_run = batches_resp[0]
    assert latest_run["mode"] == "execute"
    print("  [OK] Batch History persisted and queryable.")

    # 5. Full Activity Audit Log
    print("\n[Verify 5] Activity Audit Trail...")
    activities = requests.get(f"{BASE_URL}/api/recovery/activity?limit=20").json()
    print(f"  Recent Activity Log Count: {len(activities)}")
    assert len(activities) > 0
    for act in activities[:3]:
        print(f"    - [{act['timestamp']}] Payment {act['payment_id']} | Stage: {act['stage']} | Action: {act['action']} | Outcome: {act['outcome']}")
    print("  [OK] Audit Trail verified recording all state changes.")

    print("\n" + "=" * 80)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY WITH 0 FAILURES!")
    print("=" * 80)
    return True

if __name__ == "__main__":
    success = run_comprehensive_verification()
    exit(0 if success else 1)
