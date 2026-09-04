from typing import Dict, Any
import razorpay

from app.config import settings
from app.models import Payment
from app.recovery.execution.base import BaseRecoveryExecutor
from app.recovery.execution.schemas import ExecutionResult


class PaymentLinkExecutor(BaseRecoveryExecutor):
    """
    Executes Razorpay Test Mode Payment Link creation.
    Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in settings.
    Does NOT mark payment recovered or mutate payment status.
    """

    def execute(self, payment: Payment, context: Dict[str, Any]) -> ExecutionResult:
        key_id = settings.RAZORPAY_KEY_ID
        key_secret = settings.RAZORPAY_KEY_SECRET

        if not key_id or not key_secret or key_id == "your_razorpay_key_id_here" or key_secret == "your_razorpay_key_secret_here":
            plink_id = f"plink_mock_{payment.payment_id[-8:] if len(payment.payment_id) >= 8 else payment.payment_id}"
            return ExecutionResult(
                status="executed",
                action="payment_link",
                provider="mock_gateway",
                reference_id=plink_id,
                url=f"https://pay.razorpay.com/mock/{plink_id}",
                message=f"Mock Gateway: Simulated payment link generated for payment {payment.payment_id}.",
                reason="Mock Gateway: Payment link generated successfully (Simulated Test Mode)."
            )

        try:
            client = razorpay.Client(auth=(key_id, key_secret))

            # Build synthetic payment link payload
            payload = {
                "amount": payment.amount,  # amount in paise
                "currency": "INR",
                "accept_partial": False,
                "description": f"Payment recovery link for payment {payment.payment_id}",
                "customer": {
                    "name": f"Demo Customer {payment.customer_id}",
                    "contact": "+919999999999",
                    "email": f"{payment.customer_id}@demo.recoverypilot.internal"
                },
                "notify": {
                    "sms": False,
                    "email": False
                },
                "reminder_enable": False,
                "notes": {
                    "payment_id": payment.payment_id,
                    "customer_id": payment.customer_id,
                    "app": "RecoveryPilot"
                }
            }

            res = client.payment_link.create(payload)

            plink_id = res.get("id")
            short_url = res.get("short_url")

            return ExecutionResult(
                status="executed",
                action="payment_link",
                provider="razorpay",
                reference_id=plink_id,
                url=short_url,
                reason="Razorpay Test Mode payment link created successfully."
            )

        except Exception as err:
            return ExecutionResult(
                status="failed",
                action="payment_link",
                provider="razorpay",
                error=f"Razorpay API call failed: {str(err)}"
            )
