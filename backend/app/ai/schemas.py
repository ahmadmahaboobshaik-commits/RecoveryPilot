from typing import Literal
from pydantic import BaseModel, Field


class DiagnosisResult(BaseModel):
    """
    Pydantic schema representing the structured AI diagnosis result from Claude.
    All scores (recoverability, confidence) are prototype AI assessments between 0.0 and 1.0.
    """

    root_cause: Literal[
        "insufficient_funds",
        "expired_card",
        "bank_timeout",
        "gateway_error",
        "3ds_auth_failed",
        "checkout_abandoned",
        "unknown"
    ] = Field(
        ...,
        description="The primary identified root cause of the payment failure or abandonment."
    )

    recoverability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Estimated probability score (0.0 to 1.0) of successfully recovering this payment."
    )

    recommended_action: Literal[
        "retry",
        "payment_link",
        "reminder",
        "wait",
        "stop"
    ] = Field(
        ...,
        description="The recommended recovery action to attempt next."
    )

    reason: str = Field(
        ...,
        description="Concise diagnostic explanation detailing why the root cause and action were chosen."
    )

    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0 to 1.0) of the AI in this diagnosis."
    )
