from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models import Payment, RecoveryEvent

router = APIRouter(prefix="/api", tags=["Payments"])


@router.get("/payments", response_model=Dict[str, Any])
def list_payments(
    search: Optional[str] = Query(default=None, description="Search by payment_id or customer_id"),
    status_filter: Optional[str] = Query(default=None, alias="status", description="Filter by status (failed, abandoned, recovered, exhausted)"),
    failure_code: Optional[str] = Query(default=None, description="Filter by failure_code"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns paginated payment records from SQLite database with search and filtering support.
    """
    query = db.query(Payment)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Payment.payment_id.ilike(search_pattern),
                Payment.customer_id.ilike(search_pattern)
            )
        )

    if status_filter:
        query = query.filter(Payment.status == status_filter)

    if failure_code:
        query = query.filter(Payment.failure_code == failure_code)

    total_count = query.count()
    payments = query.order_by(Payment.created_at.desc()).offset(offset).limit(limit).all()

    payment_list = []
    for p in payments:
        # Fetch latest recovery event for context
        latest_evt = db.query(RecoveryEvent).filter(
            RecoveryEvent.payment_id == p.payment_id
        ).order_by(RecoveryEvent.timestamp.desc()).first()

        payment_list.append({
            "payment_id": p.payment_id,
            "amount": p.amount,
            "failure_code": p.failure_code,
            "failure_message": p.failure_message,
            "payment_method": p.payment_method,
            "customer_id": p.customer_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "retry_count": p.retry_count,
            "opted_out": p.opted_out,
            "status": p.status,
            "latest_stage": latest_evt.stage if latest_evt else None,
            "latest_action": latest_evt.action if latest_evt else None,
            "latest_reason": latest_evt.reason if latest_evt else None,
            "latest_outcome": latest_evt.outcome if latest_evt else None
        })

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "payments": payment_list
    }


@router.get("/payments/{payment_id}", response_model=Dict[str, Any])
def get_payment_details(payment_id: str, db: Session = Depends(get_db)):
    """
    Returns single payment record along with its full chronological RecoveryEvent timeline.
    """
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID '{payment_id}' not found."
        )

    events = db.query(RecoveryEvent).filter(
        RecoveryEvent.payment_id == payment_id
    ).order_by(RecoveryEvent.timestamp.asc()).all()

    timeline = []
    for evt in events:
        timeline.append({
            "event_id": evt.event_id,
            "stage": evt.stage,
            "action": evt.action,
            "reason": evt.reason,
            "touch_number": evt.touch_number,
            "timestamp": evt.timestamp.isoformat() if evt.timestamp else None,
            "outcome": evt.outcome,
            "reference_id": evt.reference_id
        })

    # Extract diagnosis and decision if available
    diag_event = next((e for e in reversed(events) if e.stage == "diagnosed"), None)
    action_event = next((e for e in reversed(events) if e.stage == "action_taken"), None)

    return {
        "payment": {
            "payment_id": payment.payment_id,
            "amount": payment.amount,
            "failure_code": payment.failure_code,
            "failure_message": payment.failure_message,
            "payment_method": payment.payment_method,
            "customer_id": payment.customer_id,
            "created_at": payment.created_at.isoformat() if payment.created_at else None,
            "retry_count": payment.retry_count,
            "opted_out": payment.opted_out,
            "status": payment.status
        },
        "latest_diagnosis": {
            "root_cause": (payment.failure_code or "UNKNOWN").lower(),
            "recommended_action": diag_event.action if diag_event else None,
            "reason": diag_event.reason if diag_event else None
        } if diag_event else None,
        "latest_execution": {
            "action": action_event.action if action_event else None,
            "outcome": action_event.outcome if action_event else None,
            "reference_id": action_event.reference_id if action_event else None,
            "reason": action_event.reason if action_event else None
        } if action_event else None,
        "timeline": timeline
    }
