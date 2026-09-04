from typing import Literal, Optional
from pydantic import BaseModel, Field


class ExecutionResult(BaseModel):
    """
    Structured response returned after attempting recovery action execution.
    Tracks execution status, provider details, external references, and status messages.
    Does NOT indicate that payment revenue has been recovered.
    """
    status: Literal["executed", "failed", "skipped", "not_implemented"] = Field(
        ...,
        description="Outcome status of the execution request."
    )

    action: Literal["retry", "payment_link", "reminder", "wait", "stop"] = Field(
        ...,
        description="The recovery action that was processed."
    )

    provider: str = Field(
        ...,
        description="The execution provider used (e.g. 'razorpay', 'simulation', 'none')."
    )

    reference_id: Optional[str] = Field(
        default=None,
        description="External reference identifier (e.g. Razorpay payment link ID)."
    )

    url: Optional[str] = Field(
        default=None,
        description="External URL associated with the executed action (e.g. payment link URL)."
    )

    message: Optional[str] = Field(
        default=None,
        description="Human-readable notification text or message payload generated."
    )

    error: Optional[str] = Field(
        default=None,
        description="Safe error description if execution failed."
    )

    reason: Optional[str] = Field(
        default=None,
        description="Reason or rationale for skipped or un-implemented actions."
    )
