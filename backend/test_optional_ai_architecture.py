import os
import sys
import json
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.database import SessionLocal, Base, engine
from app.models import Payment, RecoveryEvent
from app.ai.diagnosis import (
    get_deterministic_diagnosis,
    get_diagnosis_with_fallback,
    calculate_customer_history,
)
from app.ai.schemas import DiagnosisResult
from app.recovery.decision import determine_candidate_action
from app.recovery.policy import evaluate_policy
from app.recovery.execution import execute_recovery
from app.recovery.batch import run_batch_recovery
from app.webhooks.service import process_razorpay_webhook
import hmac
import hashlib


def test_all_optional_ai_requirements():
    print("=" * 70)
    print("TESTING OPTIONAL AI ARCHITECTURE & LOCAL DETERMINISTIC DIAGNOSIS")
    print("=" * 70)

    db = SessionLocal()
    now = datetime.now(timezone.utc)

    try:
        # Clean up prior test records
        db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.like("pay_opt_ai_%")).delete(synchronize_session=False)
        db.query(Payment).filter(Payment.payment_id.like("pay_opt_ai_%")).delete(synchronize_session=False)
        db.commit()

        # =============================================================
        # 1. No ANTHROPIC_API_KEY Configured
        # =============================================================
        print("\n[TEST 1] Verifying diagnosis works with NO ANTHROPIC_API_KEY...")
        saved_key = settings.ANTHROPIC_API_KEY
        settings.ANTHROPIC_API_KEY = None

        p1 = Payment(
            payment_id="pay_opt_ai_001",
            customer_id="cust_opt_001",
            amount=50000,
            payment_method="card",
            status="failed",
            failure_code="GATEWAY_ERROR",
            failure_message="Gateway connection error",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        db.add(p1)
        db.commit()

        diag1 = get_diagnosis_with_fallback(p1)
        assert diag1 is not None
        assert diag1.source == "local", f"Expected source 'local', got {diag1.source}"
        print(f"  [OK] Test 1 passed: source={diag1.source}, root_cause={diag1.root_cause}, action={diag1.recommended_action}")

        # =============================================================
        # 2. GATEWAY_ERROR Local Diagnosis
        # =============================================================
        print("\n[TEST 2] Verifying GATEWAY_ERROR local deterministic diagnosis...")
        p_gw = Payment(
            payment_id="pay_opt_ai_gw",
            customer_id="cust_opt_gw",
            amount=250000,
            payment_method="card",
            status="failed",
            failure_code="GATEWAY_ERROR",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        diag_gw = get_deterministic_diagnosis(p_gw)
        assert diag_gw.root_cause == "gateway_error"
        assert diag_gw.recommended_action == "retry"
        assert "gateway" in diag_gw.reason.lower()
        assert diag_gw.source == "local"
        print(f"  [OK] Test 2 passed: root_cause={diag_gw.root_cause}, action={diag_gw.recommended_action}, reason='{diag_gw.reason}'")

        # =============================================================
        # 3. TIMEOUT & BANK_TIMEOUT Local Diagnosis
        # =============================================================
        print("\n[TEST 3] Verifying TIMEOUT & BANK_TIMEOUT local deterministic diagnosis...")
        p_to = Payment(
            payment_id="pay_opt_ai_to",
            customer_id="cust_opt_to",
            amount=100000,
            payment_method="upi",
            status="failed",
            failure_code="TIMEOUT",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        diag_to = get_deterministic_diagnosis(p_to)
        assert diag_to.root_cause == "timeout"
        assert diag_to.recommended_action == "retry"
        assert diag_to.source == "local"

        p_bto = Payment(
            payment_id="pay_opt_ai_bto",
            customer_id="cust_opt_bto",
            amount=120000,
            payment_method="netbanking",
            status="failed",
            failure_code="BANK_TIMEOUT",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        diag_bto = get_deterministic_diagnosis(p_bto)
        assert diag_bto.root_cause == "bank_timeout"
        assert diag_bto.recommended_action == "retry"
        assert diag_bto.source == "local"
        print(f"  [OK] Test 3 passed: TIMEOUT -> root_cause={diag_to.root_cause}, BANK_TIMEOUT -> root_cause={diag_bto.root_cause}")

        # =============================================================
        # 4. INSUFFICIENT_FUNDS Local Diagnosis
        # =============================================================
        print("\n[TEST 4] Verifying INSUFFICIENT_FUNDS local deterministic diagnosis...")
        p_funds = Payment(
            payment_id="pay_opt_ai_funds",
            customer_id="cust_opt_funds",
            amount=75000,
            payment_method="card",
            status="failed",
            failure_code="INSUFFICIENT_FUNDS",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        diag_funds = get_deterministic_diagnosis(p_funds)
        assert diag_funds.root_cause == "insufficient_funds"
        assert diag_funds.recommended_action == "payment_link"
        assert diag_funds.source == "local"
        print(f"  [OK] Test 4 passed: root_cause={diag_funds.root_cause}, action={diag_funds.recommended_action}")

        # =============================================================
        # 5. Unknown Failure Local Diagnosis
        # =============================================================
        print("\n[TEST 5] Verifying Unknown Failure local deterministic diagnosis...")
        p_unk = Payment(
            payment_id="pay_opt_ai_unk",
            customer_id="cust_opt_unk",
            amount=99000,
            payment_method="wallet",
            status="failed",
            failure_code="STRANGE_RANDOM_CODE_999",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        diag_unk = get_deterministic_diagnosis(p_unk)
        assert diag_unk.root_cause == "unknown"
        assert diag_unk.recommended_action == "wait"
        assert diag_unk.source == "local"
        print(f"  [OK] Test 5 passed: root_cause={diag_unk.root_cause}, action={diag_unk.recommended_action}")

        # =============================================================
        # 6. AI Recommendation CANNOT Bypass Policy
        # =============================================================
        print("\n[TEST 6] Verifying AI recommendation CANNOT bypass Authoritative Policy Gate...")
        # Scenario: Payment with opted_out=True where AI diagnoses GATEWAY_ERROR and recommends 'retry'
        p_opted_out = Payment(
            payment_id="pay_opt_ai_bypass",
            customer_id="cust_opt_bypass",
            amount=500000,
            payment_method="card",
            status="failed",
            failure_code="GATEWAY_ERROR",
            retry_count=0,
            opted_out=True, # Hard policy block
            created_at=now
        )
        db.add(p_opted_out)
        db.commit()

        # Create advisory diagnosis recommending retry
        advisory_diag = DiagnosisResult(
            root_cause="gateway_error",
            recoverability=0.90,
            recommended_action="retry",
            reason="Advisory engine recommends retry",
            confidence=0.95,
            source="anthropic" # Even if Claude recommends retry
        )
        decision = determine_candidate_action(advisory_diag, p_opted_out)
        policy_verdict = evaluate_policy(
            payment=p_opted_out,
            diagnosis=advisory_diag,
            candidate_action=decision.candidate_action,
            db=db
        )

        assert policy_verdict.decision == "block", "Policy must BLOCK opted-out customer despite AI recommendation!"
        assert policy_verdict.rule == "customer_opted_out"
        assert policy_verdict.action == "stop"

        # Attempt execution on blocked policy
        exec_attempt = execute_recovery(
            payment=p_opted_out,
            diagnosis=advisory_diag,
            decision=decision,
            policy=policy_verdict,
            db=db
        )
        assert exec_attempt.status == "skipped"
        print("  [OK] Test 6 passed: AI advised RETRY -> Policy enforced BLOCK (customer_opted_out) -> Execution SKIPPED.")

        # =============================================================
        # 7. Dry Run Does NOT Mutate Recovery State
        # =============================================================
        print("\n[TEST 7] Verifying Dry Run does NOT mutate recovery state...")
        p_dry = Payment(
            payment_id="pay_opt_ai_dry",
            customer_id="cust_opt_dry",
            amount=300000,
            payment_method="card",
            status="failed",
            failure_code="GATEWAY_ERROR",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        db.add(p_dry)
        db.commit()

        # Run batch in dry run mode
        batch_res = run_batch_recovery(db=db, mode="dry_run")
        assert batch_res.mode == "dry_run"
        assert batch_res.executed == 0

        db.refresh(p_dry)
        assert p_dry.status == "failed", "Payment status must NOT change during dry run"
        assert p_dry.retry_count == 0, "Retry count must NOT change during dry run"
        print(f"  [OK] Test 7 passed: Dry run scanned {batch_res.total_scanned}, executed 0, payment status remains 'failed', retry_count=0.")

        # =============================================================
        # 8. Allowed Live Execution Still Works
        # =============================================================
        print("\n[TEST 8] Verifying Allowed live execution still works...")
        p_allow = Payment(
            payment_id="pay_opt_ai_allow",
            customer_id="cust_opt_allow",
            amount=150000,
            payment_method="card",
            status="failed",
            failure_code="GATEWAY_ERROR",
            retry_count=0,
            opted_out=False,
            created_at=now
        )
        db.add(p_allow)
        db.commit()

        diag_allow = get_diagnosis_with_fallback(p_allow)
        decision_allow = determine_candidate_action(diag_allow, p_allow)
        policy_allow = evaluate_policy(payment=p_allow, diagnosis=diag_allow, candidate_action=decision_allow.candidate_action, db=db)
        assert policy_allow.decision == "allow"

        exec_allow = execute_recovery(
            payment=p_allow,
            diagnosis=diag_allow,
            decision=decision_allow,
            policy=policy_allow,
            db=db
        )
        assert exec_allow.status == "executed"
        db.refresh(p_allow)
        # Payment remains failed until verified webhook
        assert p_allow.status == "failed"
        assert p_allow.retry_count == 1

        # Now simulate verified webhook with valid HMAC-SHA256 signature
        secret = "test_webhook_secret_key_12345"
        wh_payload = {
            "id": "evt_opt_wh_001",
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_rzp_opt_001",
                        "amount": p_allow.amount,
                        "notes": {"payment_id": p_allow.payment_id}
                    }
                }
            }
        }
        wh_raw = json.dumps(wh_payload, separators=(',', ':')).encode('utf-8')
        wh_sig = hmac.new(secret.encode('utf-8'), wh_raw, hashlib.sha256).hexdigest()

        wh_res = process_razorpay_webhook(
            raw_body=wh_raw,
            signature=wh_sig,
            payload=wh_payload,
            db=db
        )
        assert wh_res.status == "recovered"
        db.refresh(p_allow)
        assert p_allow.status == "recovered"
        print("  [OK] Test 8 passed: Gated ALLOW -> Executed -> HMAC Webhook Verified -> Recovered.")

        # =============================================================
        # 9. Blocked Execution Still Does NOT Execute
        # =============================================================
        print("\n[TEST 9] Verifying Blocked execution still does NOT execute...")
        p_blocked = Payment(
            payment_id="pay_opt_ai_blocked",
            customer_id="cust_opt_blocked",
            amount=200000,
            payment_method="card",
            status="failed",
            failure_code="BANK_TIMEOUT",
            retry_count=3, # Exhausted touches
            opted_out=False,
            created_at=now
        )
        db.add(p_blocked)
        db.commit()

        diag_blocked = get_diagnosis_with_fallback(p_blocked)
        decision_blocked = determine_candidate_action(diag_blocked, p_blocked)
        policy_blocked = evaluate_policy(payment=p_blocked, diagnosis=diag_blocked, candidate_action=decision_blocked.candidate_action, db=db)
        assert policy_blocked.decision == "block"
        assert policy_blocked.rule == "max_touches_reached"

        exec_blocked = execute_recovery(
            payment=p_blocked,
            diagnosis=diag_blocked,
            decision=decision_blocked,
            policy=policy_blocked,
            db=db
        )
        assert exec_blocked.status == "skipped"
        db.refresh(p_blocked)
        assert p_blocked.status == "failed"
        assert p_blocked.retry_count == 3
        print("  [OK] Test 9 passed: Blocked payment (max_touches_reached) skipped execution without state mutation.")

        # Restore key setting
        settings.ANTHROPIC_API_KEY = saved_key

        # Clean up test payments
        db.query(RecoveryEvent).filter(RecoveryEvent.payment_id.like("pay_opt_ai_%")).delete(synchronize_session=False)
        db.query(Payment).filter(Payment.payment_id.like("pay_opt_ai_%")).delete(synchronize_session=False)
        db.commit()

    finally:
        db.close()

    print("\n" + "=" * 70)
    print("ALL 9 OPTIONAL AI ARCHITECTURE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    success = test_all_optional_ai_requirements()
    sys.exit(0 if success else 1)
