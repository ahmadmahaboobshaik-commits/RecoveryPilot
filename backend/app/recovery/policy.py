from datetime import datetime, timezone, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session

from app.models import Payment, RecoveryEvent
from app.ai.schemas import DiagnosisResult
from app.recovery.schemas import PolicyDecision


def _ensure_utc(dt: datetime) -> datetime:
    """Helper to ensure a datetime instance is UTC timezone-aware."""
    if dt is None:
        return datetime.now(timezone.utc)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def evaluate_policy(
    payment: Payment,
    diagnosis: DiagnosisResult,
    candidate_action: str,
    db: Optional[Session] = None,
    events_override: Optional[List[RecoveryEvent]] = None
) -> PolicyDecision:
    """
    Evaluates a candidate recovery action against non-bypassable policy guardrails.
    Rules are evaluated sequentially in strict priority order.

    Rule Priority:
    1. Already Recovered -> block / stop / already_recovered
    2. Customer Opted Out -> block / stop / customer_opted_out
    3. Recovery Window (7 days) -> block / stop / recovery_window_expired
    4. Max Touches (retry_count >= 3) -> block / stop / max_touches_reached
    5. Cooldown Active (24h since latest action_taken event) -> wait / wait / cooldown_active
    6. Low AI Confidence (< 0.60) -> block / stop / low_ai_confidence
    7. Low Recoverability (< 0.30) -> block / stop / low_recoverability
    8. Default -> allow / candidate_action / None
    """
    now = datetime.now(timezone.utc)

    # -------------------------------------------------------------
    # RULE 1 — ALREADY RECOVERED
    # -------------------------------------------------------------
    if payment.status == "recovered":
        return PolicyDecision(
            decision="block",
            action="stop",
            reason="Payment is already recovered.",
            rule="already_recovered"
        )

    # -------------------------------------------------------------
    # RULE 2 — CUSTOMER OPTED OUT
    # -------------------------------------------------------------
    if payment.opted_out:
        return PolicyDecision(
            decision="block",
            action="stop",
            reason="Customer has opted out of recovery communications.",
            rule="customer_opted_out"
        )

    # -------------------------------------------------------------
    # RULE 3 — RECOVERY WINDOW (7 days)
    # -------------------------------------------------------------
    created_at_utc = _ensure_utc(payment.created_at)
    if (now - created_at_utc) > timedelta(days=7):
        return PolicyDecision(
            decision="block",
            action="stop",
            reason="Payment is older than the 7-day recovery window.",
            rule="recovery_window_expired"
        )

    # -------------------------------------------------------------
    # RULE 4 — MAXIMUM TOUCHES (>= 3)
    # -------------------------------------------------------------
    if payment.retry_count >= 3:
        return PolicyDecision(
            decision="block",
            action="stop",
            reason="Maximum recovery touches (3) reached.",
            rule="max_touches_reached"
        )

    # -------------------------------------------------------------
    # RULE 5 — COOLDOWN (24 hours since last action_taken event)
    # -------------------------------------------------------------
    recent_events = []
    if events_override is not None:
        recent_events = events_override
    elif db is not None:
        recent_events = db.query(RecoveryEvent).filter(
            RecoveryEvent.payment_id == payment.payment_id
        ).all()
    elif hasattr(payment, "recovery_events") and payment.recovery_events:
        recent_events = payment.recovery_events

    action_events = [e for e in recent_events if e.stage == "action_taken" and e.action in ["retry", "payment_link", "reminder"]]
    if action_events:
        latest_event = max(action_events, key=lambda e: _ensure_utc(e.timestamp))
        latest_ts_utc = _ensure_utc(latest_event.timestamp)
        if (now - latest_ts_utc) < timedelta(hours=24):
            return PolicyDecision(
                decision="wait",
                action="wait",
                reason="Cooldown active (24h period has not elapsed since latest recovery touchpoint).",
                rule="cooldown_active"
            )

    # -------------------------------------------------------------
    # RULE 6 — LOW AI CONFIDENCE (< 0.60)
    # -------------------------------------------------------------
    if diagnosis.confidence < 0.60:
        return PolicyDecision(
            decision="block",
            action="stop",
            reason=f"AI diagnosis confidence score ({diagnosis.confidence:.2f}) is below minimum threshold (0.60).",
            rule="low_ai_confidence"
        )

    # -------------------------------------------------------------
    # RULE 7 — LOW RECOVERABILITY (< 0.30)
    # -------------------------------------------------------------
    if diagnosis.recoverability < 0.30:
        return PolicyDecision(
            decision="block",
            action="stop",
            reason=f"Recoverability score ({diagnosis.recoverability:.2f}) is below minimum threshold (0.30).",
            rule="low_recoverability"
        )

    # -------------------------------------------------------------
    # RULE 8 — OTHERWISE (PERMITTED)
    # -------------------------------------------------------------
    return PolicyDecision(
        decision="allow",
        action=candidate_action if candidate_action in ["retry", "payment_link", "reminder", "wait", "stop"] else "wait",
        reason=f"Candidate action '{candidate_action}' permitted by policy guardrails.",
        rule=None
    )
