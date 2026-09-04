from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models import RecoveryEvent

router = APIRouter(prefix="/api/recovery", tags=["Activity"])


@router.get("/activity", response_model=List[Dict[str, Any]])
def get_recovery_activity(
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Returns recent recovery events ordered newest first for the activity dashboard feed.
    """
    events = db.query(RecoveryEvent).order_by(
        RecoveryEvent.timestamp.desc()
    ).limit(limit).all()

    activity_feed = []
    for evt in events:
        activity_feed.append({
            "event_id": evt.event_id,
            "payment_id": evt.payment_id,
            "stage": evt.stage,
            "action": evt.action,
            "reason": evt.reason,
            "outcome": evt.outcome,
            "touch_number": evt.touch_number,
            "timestamp": evt.timestamp.isoformat() if evt.timestamp else None,
            "reference_id": evt.reference_id
        })

    return activity_feed
