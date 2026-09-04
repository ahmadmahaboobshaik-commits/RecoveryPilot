import uuid
from typing import Dict, Any
from app.models import Payment
from app.recovery.execution.base import BaseRecoveryExecutor
from app.recovery.execution.schemas import ExecutionResult


class ReminderExecutor(BaseRecoveryExecutor):
    """
    Simulated customer reminder executor.
    Generates reminder notification text payload without dispatching real SMS, WhatsApp, or email.
    Does NOT mark payment recovered or mutate payment status.
    """

    def execute(self, payment: Payment, context: Dict[str, Any]) -> ExecutionResult:
        ref_id = f"m_rem_{uuid.uuid4().hex[:8]}"
        amount_inr = payment.amount / 100.0
        msg = f"Mock Gateway: Customer recovery reminder dispatched for payment {payment.payment_id} (Rs. {amount_inr:,.2f})."

        return ExecutionResult(
            status="executed",
            action="reminder",
            provider="simulation",
            reference_id=ref_id,
            message=msg,
            reason="Mock Gateway: Customer recovery reminder SMS & Email dispatched."
        )
