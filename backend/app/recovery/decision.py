from typing import Dict, Tuple
from app.models import Payment
from app.ai.schemas import DiagnosisResult
from app.recovery.schemas import DecisionResult

# Deterministic playbook mapping: root_cause -> (candidate_action, reason)
PLAYBOOK_MAPPING: Dict[str, Tuple[str, str]] = {
    "insufficient_funds": (
        "wait",
        "Insufficient funds detected; recommend waiting for funds availability before retry."
    ),
    "expired_card": (
        "payment_link",
        "Expired cards should not be blindly retried; use a payment link."
    ),
    "card_declined": (
        "payment_link",
        "Card was declined; send payment link for customer to provide an alternate card."
    ),
    "bank_timeout": (
        "retry",
        "Bank timeout is a temporary infrastructure issue; safe candidate for retry."
    ),
    "timeout": (
        "retry",
        "Timeout is a temporary infrastructure issue; safe candidate for retry."
    ),
    "network_error": (
        "retry",
        "Network error is a transient failure; safe candidate for retry."
    ),
    "gateway_error": (
        "retry",
        "Gateway error is a transient failure; safe candidate for retry."
    ),
    "3ds_auth_failed": (
        "payment_link",
        "3DS authentication failed; send payment link for user re-authorization."
    ),
    "checkout_abandoned": (
        "reminder",
        "Checkout session was abandoned; send customer reminder nudge."
    ),
    "unknown": (
        "wait",
        "Unrecognized or unknown root cause; prefer wait for safety."
    )
}


def determine_candidate_action(diagnosis: DiagnosisResult, payment: Payment) -> DecisionResult:
    """
    Determines the candidate recovery action using a deterministic recovery playbook.
    Overrides AI action recommendations with strict playbook logic for known root causes,
    while preserving the Claude LLM recommendation for audit transparency.
    """
    root_cause = diagnosis.root_cause
    claude_action = diagnosis.recommended_action

    if root_cause in PLAYBOOK_MAPPING:
        action, reason = PLAYBOOK_MAPPING[root_cause]
        source = "deterministic_playbook"
    else:
        # Fallback to Claude's recommendation for any unmapped cause
        action = claude_action if claude_action in ["retry", "payment_link", "reminder", "wait", "stop"] else "wait"
        reason = f"Unmapped root cause '{root_cause}'. Using advisory recommendation from AI."
        source = "ai_fallback"

    return DecisionResult(
        candidate_action=action,
        reason=reason,
        source=source,
        claude_recommendation=claude_action
    )
