from typing import Literal, Optional
from pydantic import BaseModel, Field


class DecisionResult(BaseModel):
    """
    Structured output from the Decision Engine representing the proposed candidate action.
    Derived from deterministic playbook mapping based on diagnosed root cause.
    """
    candidate_action: Literal["retry", "payment_link", "reminder", "wait", "stop"] = Field(
        ...,
        description="The candidate recovery action proposed by the Decision Engine."
    )
    reason: str = Field(
        ...,
        description="Deterministic justification for proposing this candidate action."
    )
    source: str = Field(
        default="deterministic_playbook",
        description="Source of the recommendation (e.g. 'deterministic_playbook' or 'ai_fallback')."
    )
    claude_recommendation: Optional[str] = Field(
        default=None,
        description="The original advisory recommendation from Claude LLM for audit transparency."
    )


class PolicyDecision(BaseModel):
    """
    Structured output from the Policy Engine representing the final permitted action and guardrail status.
    Strictly controls whether candidate actions are allowed, delayed (wait), or blocked.
    """
    decision: Literal["allow", "wait", "block"] = Field(
        ...,
        description="The final policy outcome: allow (proceed), wait (cooldown/delay), or block (stop permanently)."
    )
    action: Literal["retry", "payment_link", "reminder", "wait", "stop"] = Field(
        ...,
        description="The final enforced recovery action (retry, payment_link, reminder, wait, or stop)."
    )
    reason: str = Field(
        ...,
        description="Detailed policy reason explaining the guardrail rule applied."
    )
    rule: Optional[str] = Field(
        default=None,
        description="The identifier of the policy rule triggered (e.g. 'already_recovered', 'customer_opted_out', etc.)."
    )
