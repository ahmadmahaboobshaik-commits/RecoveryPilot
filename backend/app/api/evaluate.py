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
from app.recovery import evaluate_payment_recovery

router = APIRouter(prefix="/api", tags=["Evaluation"])


@router.post("/evaluate/{payment_id}")
def evaluate_payment_pipeline(payment_id: str, db: Session = Depends(get_db)):
    """
    Evaluates a failed payment through the full pipeline:
    1. Fetches payment & calculates customer history
    2. Runs AI Diagnosis (advisory, with fallback)
    3. Runs deterministic Decision Engine playbook
    4. Runs Policy Engine guardrails (authoritative)

    Returns candidate action and final policy decision. Does NOT execute payment actions.
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

    # 4. Run Decision Engine & Policy Engine Evaluation
    decision_result, policy_decision = evaluate_payment_recovery(
        payment=payment,
        diagnosis=diagnosis,
        db=db
    )

    return {
        "payment_id": payment.payment_id,
        "diagnosis": diagnosis.model_dump(),
        "decision": decision_result.model_dump(),
        "policy": policy_decision.model_dump()
    }
