import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import anthropic

from app.config import settings
from app.models import Payment
from app.ai.schemas import DiagnosisResult


class AIConfigurationError(Exception):
    """Raised when ANTHROPIC_API_KEY is missing or invalid."""
    pass


class AIServiceError(Exception):
    """Raised when the Anthropic Claude API call fails."""
    pass


SYSTEM_PROMPT = """You are the RecoveryPilot payment recovery diagnosis engine.

Your job is to analyze a failed or abandoned payment and determine:
1. The most likely root cause.
2. How recoverable the payment appears (score between 0.0 and 1.0).
3. The most appropriate recovery action to recommend.
4. A concise explanation (reason).
5. Your confidence score (between 0.0 and 1.0).

Rules:
- Do not invent information not present in the input.
- Expired cards should generally not be recommended for blind retry (prefer payment_link or stop).
- Temporary bank/gateway failures may be candidates for retry.
- Insufficient funds may be candidates for a delayed retry/wait or reminder.
- 3DS failures may be candidates for a payment link or alternative payment flow.
- Abandoned checkouts may be candidates for one reminder.
- Unknown or low-confidence cases should prefer wait or stop.
- Never claim that money has been recovered.
- Never execute actions.
- Never bypass opt-out or retry limits.
- The final policy engine will decide whether the recommended action is actually allowed.
"""

DIAGNOSIS_TOOL_SCHEMA = {
    "name": "record_diagnosis",
    "description": "Record structured payment recovery diagnosis output.",
    "input_schema": {
        "type": "object",
        "properties": {
            "root_cause": {
                "type": "string",
                "description": "The primary identified root cause."
            },
            "recoverability": {
                "type": "number",
                "minimum": 0.0,
                "maximum": 1.0,
                "description": "Estimated probability score of recovery (0.0 to 1.0)."
            },
            "recommended_action": {
                "type": "string",
                "enum": [
                    "retry",
                    "payment_link",
                    "reminder",
                    "wait",
                    "stop"
                ],
                "description": "Recommended recovery action."
            },
            "reason": {
                "type": "string",
                "description": "Concise diagnostic explanation detailing why cause and action were chosen."
            },
            "confidence": {
                "type": "number",
                "minimum": 0.0,
                "maximum": 1.0,
                "description": "Confidence score of the diagnosis (0.0 to 1.0)."
            }
        },
        "required": ["root_cause", "recoverability", "recommended_action", "reason", "confidence"]
    }
}


def calculate_customer_history(db: Session, payment: Payment) -> Dict[str, Any]:
    """
    Calculates historical transaction metrics for the customer associated with the given payment.
    Does not use a separate customer table; aggregates directly from existing Payment records.
    """
    customer_payments = db.query(Payment).filter(
        Payment.customer_id == payment.customer_id
    ).all()

    # Separate previous payments from the current payment record
    prev_payments = [p for p in customer_payments if p.payment_id != payment.payment_id]

    prev_successful = sum(1 for p in prev_payments if p.status == "recovered")
    prev_failed = sum(1 for p in prev_payments if p.status in ["failed", "exhausted", "abandoned"])
    prev_total_amount_inr = sum(p.amount for p in prev_payments) / 100.0

    return {
        "customer_id": payment.customer_id,
        "total_previous_payments": len(prev_payments),
        "previous_successful_recovered_payments": prev_successful,
        "previous_failed_payments": prev_failed,
        "previous_total_amount_inr": prev_total_amount_inr,
        "current_payment": {
            "payment_id": payment.payment_id,
            "amount_inr": payment.amount / 100.0,
            "amount_paise": payment.amount,
            "failure_code": payment.failure_code,
            "failure_message": payment.failure_message,
            "payment_method": payment.payment_method,
            "retry_count": payment.retry_count,
            "opted_out": payment.opted_out,
            "status": payment.status,
            "created_at": payment.created_at.isoformat() if payment.created_at else None
        }
    }


def get_deterministic_diagnosis(payment: Payment, customer_history: Optional[Dict[str, Any]] = None) -> DiagnosisResult:
    """
    Deterministic Local Diagnosis Engine:
    Analyzes payment failure information and produces an advisory diagnosis based on deterministic rules.
    Used when ANTHROPIC_API_KEY is not configured or in testing environment.
    Guaranteed:
    - Never requires an external network call.
    - Never crashes on missing API keys.
    - Advisory only; never executes recovery actions.
    - Sets source='local'.
    """
    code = (payment.failure_code or "UNKNOWN").upper().strip()
    status_val = (payment.status or "failed").lower().strip()

    # Guard cases: Opted out, exhausted, or terminal state
    if payment.opted_out or payment.retry_count >= 3 or status_val == "exhausted":
        return DiagnosisResult(
            root_cause="unknown",
            recoverability=0.05,
            recommended_action="stop",
            reason="Customer has opted out or retry limit reached. Recommended action is stop.",
            confidence=0.95,
            source="local"
        )

    if code == "GATEWAY_ERROR":
        return DiagnosisResult(
            root_cause="gateway_error",
            recoverability=0.75,
            recommended_action="retry",
            reason="Transient gateway error. Candidate for automated retry.",
            confidence=0.85,
            source="local"
        )
    elif code == "TIMEOUT":
        return DiagnosisResult(
            root_cause="timeout",
            recoverability=0.85,
            recommended_action="retry",
            reason="Transient timeout error. Candidate for automated retry.",
            confidence=0.90,
            source="local"
        )
    elif code == "BANK_TIMEOUT":
        return DiagnosisResult(
            root_cause="bank_timeout",
            recoverability=0.85,
            recommended_action="retry",
            reason="Temporary bank server timeout. Safe candidate for immediate automated retry.",
            confidence=0.90,
            source="local"
        )
    elif code == "NETWORK_ERROR":
        return DiagnosisResult(
            root_cause="network_error",
            recoverability=0.75,
            recommended_action="retry",
            reason="Transient network error. Candidate for automated retry.",
            confidence=0.85,
            source="local"
        )
    elif code == "INSUFFICIENT_FUNDS":
        return DiagnosisResult(
            root_cause="insufficient_funds",
            recoverability=0.70,
            recommended_action="payment_link",
            reason="Insufficient customer account balance. Recommend sending payment link to settle.",
            confidence=0.85,
            source="local"
        )
    elif code == "CARD_DECLINED":
        return DiagnosisResult(
            root_cause="card_declined",
            recoverability=0.30,
            recommended_action="payment_link",
            reason="Card was declined by issuing bank. Recommend sending a payment link to update payment method.",
            confidence=0.90,
            source="local"
        )
    elif code == "CARD_EXPIRED":
        return DiagnosisResult(
            root_cause="expired_card",
            recoverability=0.30,
            recommended_action="payment_link",
            reason="Card used is expired. Recommend sending a payment link to update payment method.",
            confidence=0.95,
            source="local"
        )
    elif code == "3DS_AUTH_FAILED":
        return DiagnosisResult(
            root_cause="3ds_auth_failed",
            recoverability=0.60,
            recommended_action="payment_link",
            reason="3-D Secure authentication failed. Recommend payment link for customer authorization.",
            confidence=0.80,
            source="local"
        )
    elif code == "CHECKOUT_ABANDONED" or status_val == "abandoned":
        return DiagnosisResult(
            root_cause="checkout_abandoned",
            recoverability=0.65,
            recommended_action="reminder",
            reason="Customer abandoned checkout session. Recommend sending payment link or reminder.",
            confidence=0.85,
            source="local"
        )
    else:
        # Unknown / Unrecognized failure codes
        return DiagnosisResult(
            root_cause="unknown",
            recoverability=0.50,
            recommended_action="wait",
            reason="Unspecified or unknown failure reason. Recommend holding for review.",
            confidence=0.60,
            source="local"
        )


def diagnose_payment(payment: Payment, customer_history: Dict[str, Any]) -> DiagnosisResult:
    """
    Calls Anthropic Claude API using structured outputs (Tool Use) if ANTHROPIC_API_KEY is configured.
    Otherwise falls back cleanly to deterministic local diagnosis.
    """
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key or api_key.strip() == "" or api_key == "your_anthropic_api_key_here":
        return get_deterministic_diagnosis(payment, customer_history)

    try:
        client = anthropic.Anthropic(api_key=api_key)
        prompt_payload = json.dumps(customer_history, indent=2)

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=600,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Analyze this payment failure and customer transaction history:\n\n{prompt_payload}"
                }
            ],
            tools=[DIAGNOSIS_TOOL_SCHEMA],
            tool_choice={"type": "tool", "name": "record_diagnosis"}
        )

        tool_use = next((block for block in response.content if block.type == "tool_use"), None)
        if not tool_use or not tool_use.input:
            raise AIServiceError("Claude response did not return structured tool call output.")

        data = dict(tool_use.input)
        data["source"] = "anthropic"
        diagnosis = DiagnosisResult.model_validate(data)
        return diagnosis

    except anthropic.APIError as err:
        raise AIServiceError(f"Anthropic Claude API Error: {err.message}") from err
    except Exception as err:
        if isinstance(err, (AIConfigurationError, AIServiceError)):
            raise err
        raise AIServiceError(f"Failed to perform AI diagnosis: {str(err)}") from err


def get_diagnosis_with_fallback(payment: Payment, customer_history: Optional[Dict[str, Any]] = None) -> DiagnosisResult:
    """
    High-level Diagnosis Provider:
    - If ANTHROPIC_API_KEY is configured and valid, attempts Claude AI diagnosis (source='anthropic').
    - If ANTHROPIC_API_KEY is missing, empty, placeholder, or API fails, uses local deterministic diagnosis (source='local').
    - Never raises an unhandled exception for missing API keys.
    """
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key or api_key.strip() == "" or api_key == "your_anthropic_api_key_here":
        return get_deterministic_diagnosis(payment, customer_history)

    try:
        return diagnose_payment(payment, customer_history or {})
    except Exception:
        return get_deterministic_diagnosis(payment, customer_history)
