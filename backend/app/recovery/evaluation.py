import uuid
from datetime import datetime, timezone
from typing import Tuple, Optional
from sqlalchemy.orm import Session

from app.models import Payment, RecoveryEvent
from app.ai.schemas import DiagnosisResult
from app.recovery.schemas import DecisionResult, PolicyDecision
from app.recovery.decision import determine_candidate_action
from app.recovery.policy import evaluate_policy


def evaluate_payment_recovery(
    payment: Payment,
    diagnosis: DiagnosisResult,
    db: Session
) -> Tuple[DecisionResult, PolicyDecision]:
    """
    Combined service function performing Decision Engine recommendation and Policy Engine evaluation.
    Logs BLOCK audit events to database when recovery is permanently stopped.
    Does NOT execute payment retries, modify payment status to recovered, or call Razorpay.
    """
    # 1. Run Decision Engine
    decision_result = determine_candidate_action(diagnosis, payment)

    # 2. Run Policy Engine
    policy_decision = evaluate_policy(
        payment=payment,
        diagnosis=diagnosis,
        candidate_action=decision_result.candidate_action,
        db=db
    )

    # 3. Perform Audit Logging for BLOCK decisions
    if policy_decision.decision == "block":
        event_id = f"evt_stop_{uuid.uuid4().hex[:8]}"
        stop_event = RecoveryEvent(
            event_id=event_id,
            payment_id=payment.payment_id,
            stage="stopped",
            reason=policy_decision.reason,
            action="stop",
            touch_number=payment.retry_count,
            timestamp=datetime.now(timezone.utc),
            outcome="stopped"
        )
        db.add(stop_event)
        db.commit()

    return decision_result, policy_decision
