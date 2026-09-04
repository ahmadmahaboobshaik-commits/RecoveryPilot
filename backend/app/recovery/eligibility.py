from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models import Payment, RecoveryEvent


class EligibilityResult(BaseModel):
    """
    Result of evaluating payment eligibility prior to running AI diagnosis.
    """
    status: str  # 'eligible', 'skipped', 'blocked'
    eligibility: str  # 'eligible', 'recovered', 'opted_out', 'exhausted', 'expired', 'cooldown'
    reason: str
    is_eligible: bool


def _ensure_utc(dt: datetime) -> datetime:
    if dt is None:
        return datetime.now(timezone.utc)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def check_payment_eligibility(payment: Payment, db: Session) -> EligibilityResult:
    """
    Evaluates whether a payment record is eligible for recovery processing.
    Filters out already recovered, opted-out, exhausted, expired, or cooldown-active payments
    before calling AI diagnosis.
    """
    now = datetime.now(timezone.utc)

    # 1. Already Recovered
    if payment.status == "recovered":
        return EligibilityResult(
            status="skipped",
            eligibility="recovered",
            reason="Payment is already marked as recovered.",
            is_eligible=False
        )

    # 2. Customer Opted Out
    if payment.opted_out:
        return EligibilityResult(
            status="blocked",
            eligibility="opted_out",
            reason="Customer has opted out of recovery communications.",
            is_eligible=False
        )

    # 3. Maximum Touches Reached (retry_count >= 3)
    if payment.retry_count >= 3 or payment.status == "exhausted":
        return EligibilityResult(
            status="blocked",
            eligibility="exhausted",
            reason="Maximum recovery touches (3) reached.",
            is_eligible=False
        )

    # 4. Recovery Window Expired (> 7 days)
    created_at_utc = _ensure_utc(payment.created_at)
    if (now - created_at_utc) > timedelta(days=7):
        return EligibilityResult(
            status="blocked",
            eligibility="expired",
            reason="Payment is older than the 7-day recovery window.",
            is_eligible=False
        )

    # 5. Active Cooldown Window (< 24 hours since last action_taken event)
    action_events = db.query(RecoveryEvent).filter(
        RecoveryEvent.payment_id == payment.payment_id,
        RecoveryEvent.stage == "action_taken"
    ).all()

    if action_events:
        latest_event = max(action_events, key=lambda e: _ensure_utc(e.timestamp))
        latest_ts_utc = _ensure_utc(latest_event.timestamp)
        if (now - latest_ts_utc) < timedelta(hours=24):
            return EligibilityResult(
                status="blocked",
                eligibility="cooldown",
                reason="Cooldown active (24h period has not elapsed since latest recovery touchpoint).",
                is_eligible=False
            )

    # 6. Eligible for recovery
    return EligibilityResult(
        status="eligible",
        eligibility="eligible",
        reason="Payment is eligible for recovery processing.",
        is_eligible=True
    )
