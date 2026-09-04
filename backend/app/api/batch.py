from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models import BatchRun
from app.recovery.batch import run_batch_recovery, BatchResult
from app.recovery.revenue import calculate_revenue_metrics

router = APIRouter(prefix="/api/recovery", tags=["Batch Recovery"])


@router.post("/run-batch", response_model=BatchResult)
def trigger_batch_recovery(
    mode: str = Query(default="dry_run", description="Execution mode: 'dry_run' or 'execute'"),
    db: Session = Depends(get_db)
):
    """
    Triggers batch recovery orchestration engine across all payments in SQLite:
    - mode='dry_run': Evaluates eligibility, diagnosis, decision, and policy without external execution.
    - mode='execute': Triggers safe recovery execution layer ONLY when policy.decision == 'allow'.
    """
    if mode not in ["dry_run", "execute"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mode. Must be 'dry_run' or 'execute'."
        )

    result = run_batch_recovery(db, mode=mode)
    return result


@router.get("/batches", response_model=List[Dict[str, Any]])
def get_batch_history(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns historical batch recovery runs ordered newest first for audit and UI feeds.
    """
    batch_records = db.query(BatchRun).order_by(
        BatchRun.started_at.desc()
    ).limit(limit).all()

    history = []
    for b in batch_records:
        history.append({
            "batch_id": b.batch_id,
            "mode": b.mode,
            "started_at": b.started_at.isoformat() if b.started_at else None,
            "completed_at": b.completed_at.isoformat() if b.completed_at else None,
            "total_scanned": b.total_scanned,
            "eligible": b.eligible,
            "skipped": b.skipped,
            "blocked": b.blocked,
            "diagnosed": b.diagnosed,
            "actions_allowed": b.actions_allowed,
            "actions_blocked": b.actions_blocked,
            "executed": b.executed,
            "execution_failed": b.execution_failed,
            "pending_recovery": b.pending_recovery,
            "recovered": b.recovered,
            "total_at_risk": b.total_at_risk,
            "total_recovered": b.total_recovered,
            "recovery_rate": b.recovery_rate
        })

    return history


@router.get("/metrics")
def get_extended_recovery_metrics(db: Session = Depends(get_db)):
    """
    Returns extended revenue recovery metrics and intelligence breakdowns directly from SQLite.
    """
    return calculate_revenue_metrics(db)
