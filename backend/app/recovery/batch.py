import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models import Payment, RecoveryEvent, BatchRun
from app.ai import (
    get_diagnosis_with_fallback,
    calculate_customer_history,
    DiagnosisResult
)
from app.recovery.decision import determine_candidate_action
from app.recovery.policy import evaluate_policy
from app.recovery.execution import execute_recovery
from app.recovery.eligibility import check_payment_eligibility, EligibilityResult
from app.recovery.revenue import calculate_revenue_metrics


class PaymentBatchItemResult(BaseModel):
    """Structured result for an individual payment processed within a batch run."""
    payment_id: str
    amount: int
    original_status: str
    eligibility: str
    root_cause: Optional[str] = None
    confidence: Optional[float] = None
    recoverability: Optional[float] = None
    recommended_action: Optional[str] = None
    policy_decision: Optional[str] = None
    policy_reason: Optional[str] = None
    execution_status: str
    outcome: Optional[str] = None
    reason: Optional[str] = None


class BatchResult(BaseModel):
    """Structured response payload for a batch recovery orchestration run."""
    batch_id: str
    mode: str
    started_at: str
    completed_at: str
    total_scanned: int
    eligible: int
    skipped: int
    blocked: int
    diagnosed: int
    actions_allowed: int
    actions_blocked: int
    executed: int
    execution_failed: int
    pending_recovery: int
    recovered: int
    total_at_risk: int
    total_recovered: int
    recovery_rate: float
    results: List[PaymentBatchItemResult]


def run_batch_recovery(db: Session, mode: str = "dry_run") -> BatchResult:
    """
    Central Batch Recovery Orchestrator Service:
    1. Scans all payments in SQLite database.
    2. Applies deterministic eligibility filtering (filters recovered, opted-out, exhausted, expired, cooldown).
    3. Diagnoses eligible payments using Claude AI or reusable/deterministic fallback.
    4. Evaluates candidate actions against Decision Engine & Policy Engine guardrails.
    5. In 'execute' mode, calls Safe Recovery Execution Layer ONLY when policy.decision == 'allow'.
    6. Enforces strict idempotency and stops double-execution.
    7. Computes dynamic revenue metrics and persists BatchRun audit record in SQLite.
    """
    started_at = datetime.now(timezone.utc)
    batch_id = f"batch_{uuid.uuid4().hex[:8]}"

    # Query all payments
    payments = db.query(Payment).order_by(Payment.created_at.asc()).all()

    total_scanned = len(payments)
    eligible_cnt = 0
    skipped_cnt = 0
    blocked_cnt = 0
    diagnosed_cnt = 0
    actions_allowed_cnt = 0
    actions_blocked_cnt = 0
    executed_cnt = 0
    execution_failed_cnt = 0
    pending_recovery_cnt = 0

    item_results: List[PaymentBatchItemResult] = []

    for payment in payments:
        # 1. Eligibility Check
        eligibility_res: EligibilityResult = check_payment_eligibility(payment, db)

        if not eligibility_res.is_eligible:
            if eligibility_res.eligibility == "recovered":
                skipped_cnt += 1
                pol_decision = "skip"
            else:
                blocked_cnt += 1
                pol_decision = "block"

                # Log stopping event in audit trail if not already logged (EXECUTE MODE ONLY)
                if mode == "execute":
                    existing_stopped = db.query(RecoveryEvent).filter(
                        RecoveryEvent.payment_id == payment.payment_id,
                        RecoveryEvent.stage == "stopped"
                    ).first()

                    if not existing_stopped:
                        stop_evt = RecoveryEvent(
                            event_id=f"evt_stop_{uuid.uuid4().hex[:8]}",
                            payment_id=payment.payment_id,
                            stage="stopped",
                            reason=eligibility_res.reason,
                            action="stop",
                            touch_number=payment.retry_count,
                            timestamp=datetime.now(timezone.utc),
                            outcome="stopped"
                        )
                        db.add(stop_evt)
                        db.commit()

            item_results.append(PaymentBatchItemResult(
                payment_id=payment.payment_id,
                amount=payment.amount,
                original_status=payment.status,
                eligibility=eligibility_res.eligibility,
                policy_decision=pol_decision,
                policy_reason=eligibility_res.reason,
                execution_status="skipped" if pol_decision == "skip" else "blocked",
                outcome="stopped" if pol_decision == "block" else "recovered",
                reason=eligibility_res.reason
            ))
            continue

        # Payment is eligible
        eligible_cnt += 1

        # 2. Diagnosis (Claude AI or Fallback)
        customer_history = calculate_customer_history(db, payment)
        diagnosis: DiagnosisResult = get_diagnosis_with_fallback(payment, customer_history)
        diagnosed_cnt += 1

        # 3. Decision Engine
        decision_result = determine_candidate_action(diagnosis, payment)

        # 4. Policy Engine
        policy_decision = evaluate_policy(
            payment=payment,
            diagnosis=diagnosis,
            candidate_action=decision_result.candidate_action,
            db=db
        )

        exec_status = "simulated"
        outcome_val = "simulated"
        exec_reason = policy_decision.reason

        if policy_decision.decision == "allow":
            actions_allowed_cnt += 1

            if mode == "execute":
                # 5. Execution Service (Safe Recovery Execution Layer)
                exec_result = execute_recovery(
                    payment=payment,
                    diagnosis=diagnosis,
                    decision=decision_result,
                    policy=policy_decision,
                    db=db
                )

                if exec_result.status == "executed":
                    executed_cnt += 1
                    pending_recovery_cnt += 1
                    exec_status = "executed"
                    outcome_val = "pending"
                    exec_reason = exec_result.reason or "Action executed successfully."
                elif exec_result.status == "skipped":
                    exec_status = "skipped"
                    outcome_val = "skipped"
                    exec_reason = exec_result.reason or "Execution skipped by idempotency guard."
                elif exec_result.status == "failed":
                    execution_failed_cnt += 1
                    exec_status = "failed"
                    outcome_val = "failed"
                    exec_reason = exec_result.error or "Execution failed."
                else:
                    exec_status = exec_result.status
                    outcome_val = exec_result.status
                    exec_reason = exec_result.reason
            else:
                # Dry run mode
                exec_status = "simulated"
                outcome_val = "none"
                exec_reason = "Dry run mode: action evaluated as permitted but not executed."

        else: # policy_decision != "allow"
            actions_blocked_cnt += 1
            exec_status = "blocked"
            outcome_val = "stopped"

            # Record blocked event in DB (EXECUTE MODE ONLY)
            if mode == "execute":
                existing_stop = db.query(RecoveryEvent).filter(
                    RecoveryEvent.payment_id == payment.payment_id,
                    RecoveryEvent.stage == "stopped"
                ).first()

                if not existing_stop:
                    stop_evt = RecoveryEvent(
                        event_id=f"evt_stop_{uuid.uuid4().hex[:8]}",
                        payment_id=payment.payment_id,
                        stage="stopped",
                        reason=policy_decision.reason,
                        action=policy_decision.action,
                        touch_number=payment.retry_count,
                        timestamp=datetime.now(timezone.utc),
                        outcome="stopped"
                    )
                    db.add(stop_evt)
                    db.commit()

        item_results.append(PaymentBatchItemResult(
            payment_id=payment.payment_id,
            amount=payment.amount,
            original_status=payment.status,
            eligibility="eligible",
            root_cause=diagnosis.root_cause,
            confidence=diagnosis.confidence,
            recoverability=diagnosis.recoverability,
            recommended_action=diagnosis.recommended_action,
            policy_decision=policy_decision.decision,
            policy_reason=policy_decision.reason,
            execution_status=exec_status,
            outcome=outcome_val,
            reason=exec_reason
        ))

    completed_at = datetime.now(timezone.utc)

    # 6. Calculate dynamic revenue metrics from SQLite
    rev_metrics = calculate_revenue_metrics(db)

    # 7. Persist BatchRun record in SQLite
    batch_run = BatchRun(
        batch_id=batch_id,
        mode=mode,
        started_at=started_at,
        completed_at=completed_at,
        total_scanned=total_scanned,
        eligible=eligible_cnt,
        skipped=skipped_cnt,
        blocked=blocked_cnt,
        diagnosed=diagnosed_cnt,
        actions_allowed=actions_allowed_cnt,
        actions_blocked=actions_blocked_cnt,
        executed=executed_cnt,
        execution_failed=execution_failed_cnt,
        pending_recovery=pending_recovery_cnt,
        recovered=rev_metrics["recovered_payment_count"],
        total_at_risk=rev_metrics["total_at_risk"],
        total_recovered=rev_metrics["total_recovered"],
        recovery_rate=rev_metrics["recovery_rate"]
    )

    db.add(batch_run)
    db.commit()

    return BatchResult(
        batch_id=batch_id,
        mode=mode,
        started_at=started_at.isoformat(),
        completed_at=completed_at.isoformat(),
        total_scanned=total_scanned,
        eligible=eligible_cnt,
        skipped=skipped_cnt,
        blocked=blocked_cnt,
        diagnosed=diagnosed_cnt,
        actions_allowed=actions_allowed_cnt,
        actions_blocked=actions_blocked_cnt,
        executed=executed_cnt,
        execution_failed=execution_failed_cnt,
        pending_recovery=pending_recovery_cnt,
        recovered=rev_metrics["recovered_payment_count"],
        total_at_risk=rev_metrics["total_at_risk"],
        total_recovered=rev_metrics["total_recovered"],
        recovery_rate=rev_metrics["recovery_rate"],
        results=item_results
    )
