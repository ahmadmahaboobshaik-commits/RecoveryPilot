import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.models import Payment, RecoveryEvent
from app.ai.schemas import DiagnosisResult
from app.recovery.schemas import DecisionResult, PolicyDecision
from app.recovery.execution.schemas import ExecutionResult
from app.recovery.execution.payment_link import PaymentLinkExecutor
from app.recovery.execution.reminder import ReminderExecutor
from app.recovery.execution.retry import RetryExecutor


def execute_recovery(
    payment: Payment,
    diagnosis: DiagnosisResult,
    decision: DecisionResult,
    policy: PolicyDecision,
    db: Session
) -> ExecutionResult:
    """
    Central recovery execution service.
    Verifies policy approval ('allow'), enforces idempotency, routes to concrete executors,
    increments payment retry_count, and logs execution audit events to the database.

    CRITICAL GUARANTEES:
    - Never calls live Razorpay if policy decision is not 'allow'.
    - Never sets payment.status = 'recovered' directly upon execution.
    - Payment status changes to 'recovered' ONLY via verified webhook signature.
    """
    # 1. Verify policy decision is "allow"
    if policy.decision != "allow":
        return ExecutionResult(
            status="skipped",
            action=policy.action,
            provider="none",
            reason=f"Execution skipped: policy decision is '{policy.decision}' ({policy.reason})."
        )

    # 2. Already Recovered Check
    if payment.status == "recovered":
        return ExecutionResult(
            status="skipped",
            action=policy.action,
            provider="none",
            reason="Execution skipped: payment is already marked as recovered."
        )

    action_to_execute = policy.action

    # 3. Idempotency Check: inspect existing RecoveryEvents for duplicate execution
    existing_executions = db.query(RecoveryEvent).filter(
        RecoveryEvent.payment_id == payment.payment_id,
        RecoveryEvent.stage == "action_taken",
        RecoveryEvent.action == action_to_execute,
        RecoveryEvent.outcome.in_(["pending", "simulated", "executed"])
    ).all()

    if existing_executions:
        return ExecutionResult(
            status="skipped",
            action=action_to_execute,
            provider="none",
            reason="Execution already recorded for this recovery event."
        )

    # 4. Route to Action Executor
    context: Dict[str, Any] = {
        "diagnosis": diagnosis,
        "decision": decision,
        "policy": policy
    }

    if action_to_execute == "retry":
        executor = RetryExecutor()
        result = executor.execute(payment, context)

    elif action_to_execute == "payment_link":
        executor = PaymentLinkExecutor()
        result = executor.execute(payment, context)

    elif action_to_execute == "reminder":
        executor = ReminderExecutor()
        result = executor.execute(payment, context)

    elif action_to_execute in ["wait", "stop"]:
        result = ExecutionResult(
            status="skipped",
            action=action_to_execute,
            provider="none",
            reason=f"Action '{action_to_execute}' requires no external execution."
        )

    else:
        result = ExecutionResult(
            status="skipped",
            action="stop",
            provider="none",
            reason=f"Unrecognized action '{action_to_execute}'."
        )

    if result.status == "executed":
        # Increment payment retry_count on automated retry execution
        if result.action == "retry":
            payment.retry_count += 1
            db.add(payment)

        event_id = f"evt_act_{uuid.uuid4().hex[:8]}"
        outcome_val = "executed" if result.action in ["retry", "reminder"] else "pending"
        
        act_event = RecoveryEvent(
            event_id=event_id,
            payment_id=payment.payment_id,
            stage="action_taken",
            action=result.action,
            reason=result.reason or f"Action executed via {result.provider}",
            touch_number=payment.retry_count,
            timestamp=datetime.now(timezone.utc),
            outcome=outcome_val,
            reference_id=result.reference_id
        )
        db.add(act_event)
        db.commit()
        db.refresh(payment)

    elif result.status == "failed":
        event_id = f"evt_fail_{uuid.uuid4().hex[:8]}"
        fail_event = RecoveryEvent(
            event_id=event_id,
            payment_id=payment.payment_id,
            stage="action_taken",
            action=result.action,
            reason=result.error or "Execution failed",
            touch_number=payment.retry_count + 1,
            timestamp=datetime.now(timezone.utc),
            outcome="failed"
        )
        db.add(fail_event)
        db.commit()

    return result
