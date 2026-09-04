from abc import ABC, abstractmethod
from typing import Dict, Any
from app.models import Payment
from app.recovery.execution.schemas import ExecutionResult


class BaseRecoveryExecutor(ABC):
    """
    Abstract base protocol interface for all recovery action executors.
    Concrete implementations must define execute(payment, context).
    """

    @abstractmethod
    def execute(self, payment: Payment, context: Dict[str, Any]) -> ExecutionResult:
        """
        Executes the recovery action for the given payment and context.
        Returns an ExecutionResult. Must NOT mutate payment.status or increment retry_count.
        """
        pass
