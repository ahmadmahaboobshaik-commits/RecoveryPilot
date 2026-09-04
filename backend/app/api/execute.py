from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Payment
from app.ai import (
    get_diagnosis_with_fallback,
    calculate_customer_history,
    DiagnosisResult,
    diagnose_payment
)
from app.recovery import determine_candidate_action, evaluate_policy
from app.recovery.execution import execute_recovery, ExecutionResult

router = APIRouter(prefix="/api", tags=["Execution"])


@router.post("/execute/{payment_id}")
def execute_payment_pipeline(payment_id: str, db: Session = Depends(get_db)):
    """
    Evaluates and safely executes recovery action for a payment:
    1. Fetches payment & calculates customer history
    2. Runs AI Diagnosis (advisory, with fallback)
    3. Runs Decision Engine playbook
    4. Runs Policy Engine guardrails (authoritative)
    5. Executes action ONLY IF policy decision is 'allow'
    6. Logs execution audit event to database

    Returns diagnosis, decision, policy, and execution result.
    Does NOT mark payment.status = 'recovered' or mutate payment state.
    """
    # 1. Fetch payment from database
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID '{payment_id}' not found."
        )

    # 2. Calculate customer history context
    customer_history = calculate_customer_history(db, payment)

    # 3. Run AI Diagnosis Engine
    diagnosis: DiagnosisResult = get_diagnosis_with_fallback(payment, customer_history)

    # 4. Run Decision Engine
    decision_result = determine_candidate_action(diagnosis, payment)

    # 5. Run Policy Engine
    policy_decision = evaluate_policy(
        payment=payment,
        diagnosis=diagnosis,
        candidate_action=decision_result.candidate_action,
        db=db
    )

    # 6. Run Safe Recovery Execution Service
    execution_result: ExecutionResult = execute_recovery(
        payment=payment,
        diagnosis=diagnosis,
        decision=decision_result,
        policy=policy_decision,
        db=db
    )

    return {
        "payment_id": payment.payment_id,
        "diagnosis": diagnosis.model_dump(),
        "decision": decision_result.model_dump(),
        "policy": policy_decision.model_dump(),
        "execution": execution_result.model_dump()
    }
