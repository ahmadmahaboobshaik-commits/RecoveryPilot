from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.recovery.revenue import calculate_revenue_metrics

router = APIRouter(prefix="/api", tags=["Metrics"])


@router.get("/metrics")
def get_recovery_metrics(db: Session = Depends(get_db)):
    """
    Returns calculated revenue recovery metrics directly from SQLite database:
    - total_at_risk (in paise)
    - total_recovered (in paise)
    - recovery_rate (percentage)
    - recovered_payment_count
    - failed_payment_count
    - breakdowns by root cause, action, and status
    """
    metrics = calculate_revenue_metrics(db)
    return metrics
