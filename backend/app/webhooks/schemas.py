from pydantic import BaseModel
from typing import Optional, Dict, Any


class WebhookResponse(BaseModel):
    """
    Standard response payload returned by the Razorpay webhook handler endpoint.
    """
    status: str  # e.g., "recovered", "ignored", "failed", "already_processed", "already_recovered", "unmatched"
    event: Optional[str] = None
    payment_id: Optional[str] = None
    rzp_payment_id: Optional[str] = None
    reason: Optional[str] = None
    amount_received: Optional[int] = None
    amount_expected: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
