import uuid
from typing import Dict, Any
from app.models import Payment
from app.recovery.execution.base import BaseRecoveryExecutor
from app.recovery.execution.schemas import ExecutionResult


class RetryExecutor(BaseRecoveryExecutor):
    """
    Mock Gateway executor for automated payment retries.
    Simulates a deterministic payment retry attempt without real money movement.
    Does NOT mark payment recovered or mutate payment status.
    """

    def execute(self, payment: Payment, context: Dict[str, Any]) -> ExecutionResult:
        ref_id = f"m_retry_{uuid.uuid4().hex[:8]}"
        amount_inr = payment.amount / 100.0
        msg = f"Mock Gateway: Automated retry attempt initiated for payment {payment.payment_id} (Rs. {amount_inr:,.2f})."
        
        return ExecutionResult(
            status="executed",
            action="retry",
            provider="mock_gateway",
            reference_id=ref_id,
            message=msg,
            reason="Mock Gateway: Automated payment retry executed successfully."
        )
