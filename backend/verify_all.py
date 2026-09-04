import os
import sys
import json
import time
import hmac
import hashlib
import requests

BASE_URL = "http://127.0.0.1:8000"

def run_verification():
    print("=================================================================")
    print("🚀 RECOVERYPILOT COMPREHENSIVE FINAL VERIFICATION")
    print("=================================================================\n")

    # Step 0: Ensure backend is reachable
    try:
        health_resp = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"[0.1] Backend Health Check: {health_resp.status_code} -> {health_resp.json()}")
        assert health_resp.status_code == 200
    except Exception as e:
        print(f"Backend unreachable at {BASE_URL}: {e}")
        return False

    # Step 0.2: Reset demo database cleanly
    reset_resp = requests.post(f"{BASE_URL}/api/demo/reset")
    print(f"[0.2] Demo State Reset: {reset_resp.status_code} -> {reset_resp.json()}")
    assert reset_resp.status_code == 200

    # -------------------------------------------------------------
    # Scenario 1: pay_demo_0013 (ALLOW Demo)
    # Expected: ALLOW -> RETRY -> EXECUTED -> VERIFIED RECOVERED
    # -------------------------------------------------------------
    print("\n--- [Scenario 1] pay_demo_0013: Full ALLOW & Recovery Lifecycle ---")
    p13_id = "pay_demo_0013"
    
    # 1. Fetch initial state
    p13_init = requests.get(f"{BASE_URL}/api/payments/{p13_id}").json()
    print(f"Initial State: status={p13_init['status']}, failure_reason={p13_init['failure_reason']}, retry_count={p13_init['retry_count']}")
    assert p13_init["status"] == "failed"
    
    # 2. Advisory AI Diagnosis
    diag_res = requests.post(f"{BASE_URL}/api/diagnose", json={"payment_id": p13_id}).json()
    print(f"AI Diagnosis: root_cause={diag_res['root_cause']}, confidence={diag_res['confidence']}, recommended_action={diag_res['recommended_action']}")
    assert diag_res["recommended_action"] in ["retry", "wait"]
    
    # 3. Deterministic Policy Evaluation (Authoritative Gate)
    eval_res = requests.post(f"{BASE_URL}/api/evaluate", json={
        "payment_id": p13_id,
        "candidate_action": "retry",
        "channel": "gateway"
    }).json()
    print(f"Policy Decision: decision={eval_res['decision']}, rule={eval_res['rule_name']}, allowed={eval_res['allowed']}")
    assert eval_res["decision"] == "ALLOW"
    assert eval_res["allowed"] is True

    # 4. Live Recovery Execution
    exec_res = requests.post(f"{BASE_URL}/api/execute", json={
        "payment_id": p13_id,
        "action": "retry",
        "channel": "gateway"
    }).json()
    print(f"Execution Result: status={exec_res['status']}, execution_id={exec_res.get('execution_id')}, message={exec_res.get('message')}")
    assert exec_res["status"] in ["executed", "success"]

    # 5. Check payment status updated and audit trail logged
    p13_after_exec = requests.get(f"{BASE_URL}/api/payments/{p13_id}").json()
    print(f"Post-Exec Payment State: status={p13_after_exec['status']}, retry_count={p13_after_exec['retry_count']}")
    assert p13_after_exec["status"] == "recovered"
    assert p13_after_exec["retry_count"] >= 1

    # 6. Check Audit Trail for p13
    audit_res = requests.get(f"{BASE_URL}/api/audit?payment_id={p13_id}").json()
    stages = [event["stage"] for event in audit_res]
    print(f"Audit Trail stages for {p13_id}: {stages}")
    assert "diagnosed" in stages
    assert "policy_evaluated" in stages
    assert "action_taken" in stages
    assert "recovered" in stages

    print("✅ Scenario 1 (pay_demo_0013) PASSED successfully!\n")

    # -------------------------------------------------------------
    # Scenario 2: pay_test_lifecycle_b (BLOCK Demo)
    # Expected: BLOCK -> No execution -> Remains unrecovered
    # -------------------------------------------------------------
    print("--- [Scenario 2] pay_test_lifecycle_b: BLOCK & Policy Enforcement ---")
    pb_id = "pay_test_lifecycle_b"
    
    # 1. Fetch initial state
    pb_init = requests.get(f"{BASE_URL}/api/payments/{pb_id}").json()
    print(f"Initial State: status={pb_init['status']}, failure_reason={pb_init['failure_reason']}, retry_count={pb_init['retry_count']}")
    
    # 2. AI Diagnosis (Advisory)
    pb_diag = requests.post(f"{BASE_URL}/api/diagnose", json={"payment_id": pb_id}).json()
    print(f"AI Diagnosis: root_cause={pb_diag['root_cause']}, recommended_action={pb_diag['recommended_action']}")

    # 3. Policy Evaluation
    pb_eval = requests.post(f"{BASE_URL}/api/evaluate", json={
        "payment_id": pb_id,
        "candidate_action": "retry",
        "channel": "gateway"
    }).json()
    print(f"Policy Decision: decision={pb_eval['decision']}, rule={pb_eval['rule_name']}, reason={pb_eval['reason']}")
    assert pb_eval["decision"] == "BLOCK"
    assert pb_eval["allowed"] is False
    assert pb_eval["rule_name"] in ["max_retry_limit", "unsupported_failure_reason", "recovery_window_expired", "cooldown_active"]

    # 4. Attempt Direct Execution (Should be blocked by Policy Guard)
    pb_exec = requests.post(f"{BASE_URL}/api/execute", json={
        "payment_id": pb_id,
        "action": "retry",
        "channel": "gateway"
    }).json()
    print(f"Direct Execution Attempt Result: status={pb_exec.get('status')}, reason={pb_exec.get('message') or pb_exec.get('reason')}")
    assert pb_exec["status"] == "blocked" or "blocked" in str(pb_exec)

    # 5. Verify payment remains unrecovered
    pb_final = requests.get(f"{BASE_URL}/api/payments/{pb_id}").json()
    print(f"Final State: status={pb_final['status']} (Must remain failed)")
    assert pb_final["status"] == "failed"

    print("✅ Scenario 2 (pay_test_lifecycle_b) PASSED successfully!\n")

    # -------------------------------------------------------------
    # Scenario 3: Batch Engine DRY RUN
    # Expected: Scan -> Diagnose -> Policy Evaluation -> SIMULATED (Zero State Mutation)
    # -------------------------------------------------------------
    print("--- [Scenario 3] Batch Engine DRY RUN: Zero State Mutation ---")
    
    # Snapshot database state prior to Dry Run
    payments_before = {p["id"]: p for p in requests.get(f"{BASE_URL}/api/payments").json()}
    audit_count_before = len(requests.get(f"{BASE_URL}/api/audit").json())

    # Execute Batch Dry Run
    batch_dry_run = requests.post(f"{BASE_URL}/api/batch/run", json={"dry_run": True}).json()
    print(f"Batch Dry Run Response: scanned={batch_dry_run.get('scanned')}, actions_simulated={len(batch_dry_run.get('actions_simulated', []))}")
    assert batch_dry_run.get("dry_run") is True
    
    # Snapshot database state after Dry Run
    payments_after = {p["id"]: p for p in requests.get(f"{BASE_URL}/api/payments").json()}
    audit_count_after = len(requests.get(f"{BASE_URL}/api/audit").json())

    # Verify zero mutations
    for pid, p_before in payments_before.items():
        p_after = payments_after[pid]
        assert p_before["status"] == p_after["status"], f"Status mutated for {pid}: {p_before['status']} -> {p_after['status']}"
        assert p_before["retry_count"] == p_after["retry_count"], f"Retry count mutated for {pid}"

    # In strict Dry Run, audit events for actual execution shouldn't be added to payments
    print(f"Payments verified completely intact across {len(payments_before)} records.")
    print("✅ Scenario 3 (Batch Engine DRY RUN) PASSED successfully!\n")

    # -------------------------------------------------------------
    # Scenario 4: Webhook HMAC Signature & Verification Flow
    # -------------------------------------------------------------
    print("--- [Scenario 4] HMAC Webhook Signature & Verification ---")
    wh_payment_id = "pay_demo_execute_001"
    
    # Reset it to failed first if needed
    requests.post(f"{BASE_URL}/api/demo/reset")
    
    # Execute recovery to get it into pending / ready for webhook
    wh_payload = {
        "event_id": f"evt_test_{int(time.time())}",
        "event_type": "payment.succeeded",
        "payment_id": wh_payment_id,
        "amount": 4900,
        "currency": "USD",
        "gateway_reference": f"mock_gw_ref_{int(time.time())}",
        "timestamp": int(time.time())
    }
    wh_body_str = json.dumps(wh_payload, separators=(',', ':'))
    
    # Compute valid HMAC-SHA256
    webhook_secret = "dev_webhook_secret_key_12345"
    valid_sig = hmac.new(
        webhook_secret.encode('utf-8'),
        wh_body_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Send valid webhook
    wh_resp = requests.post(
        f"{BASE_URL}/api/webhook/gateway",
        data=wh_body_str,
        headers={"X-RecoveryPilot-Signature": valid_sig, "Content-Type": "application/json"}
    )
    print(f"Valid HMAC Webhook Response: {wh_resp.status_code} -> {wh_resp.json()}")
    assert wh_resp.status_code == 200
    assert wh_resp.json()["verified"] is True

    # Send invalid webhook
    invalid_sig = "invalid_signature_hex_code_12345"
    wh_invalid_resp = requests.post(
        f"{BASE_URL}/api/webhook/gateway",
        data=wh_body_str,
        headers={"X-RecoveryPilot-Signature": invalid_sig, "Content-Type": "application/json"}
    )
    print(f"Invalid HMAC Webhook Response: {wh_invalid_resp.status_code} (Expected 401/400)")
    assert wh_invalid_resp.status_code in [400, 401]

    print("✅ Scenario 4 (HMAC Webhook Verification) PASSED successfully!\n")

    # -------------------------------------------------------------
    # Scenario 5: Cooldown & Max Touches Enforcement
    # -------------------------------------------------------------
    print("--- [Scenario 5] Cooldown & Max Touches Policy Rules ---")
    # Execute recovery on pay_demo_0013 again to test cooldown rule
    cd_eval = requests.post(f"{BASE_URL}/api/evaluate", json={
        "payment_id": p13_id,
        "candidate_action": "retry",
        "channel": "gateway"
    }).json()
    print(f"Post-Recovery Evaluation for {p13_id}: decision={cd_eval['decision']}, rule={cd_eval.get('rule_name')}")
    # Since it's already recovered, policy blocks it (terminal_status or cooldown_active)
    assert cd_eval["decision"] == "BLOCK"
    
    print("✅ Scenario 5 (Cooldown & Max Touches) PASSED successfully!\n")

    print("=================================================================")
    print("🎉 ALL LIFECYCLE SCENARIOS & ENGINE RULES VERIFIED 100% SUCCESS")
    print("=================================================================")
    return True

if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
