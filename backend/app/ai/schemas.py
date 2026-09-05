from typing import Literal
from pydantic import BaseModel, Field


class DiagnosisResult(BaseModel):
    """
    Pydantic schema representing the structured diagnosis result.
    Origin can be 'anthropic' (when ANTHROPIC_API_KEY is configured) or 'local' (deterministic fallback).
    All scores (recoverability, confidence) are assessments between 0.0 and 1.0.
    """

    root_cause: str = Field(
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
        description="Confidence score (0.0 to 1.0) of the diagnosis."
    )

    source: Literal["anthropic", "local"] = Field(
        default="local",
        description="Origin source of the diagnosis: 'anthropic' for Claude or 'local' for built-in deterministic rules."
    )
