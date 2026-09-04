from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base


class Payment(Base):
    """
    Represents a payment transaction tracked by RecoveryPilot.
    Stores initial payment details, gateway failure codes, and recovery status.
    """
    __tablename__ = "payments"

    # Unique payment identifier (e.g. pay_12345)
    payment_id = Column(String, primary_key=True, index=True)

    # Payment amount stored in paise (1 INR = 100 paise)
    amount = Column(Integer, nullable=False)

    # Optional failure classification from gateway
    failure_code = Column(String, nullable=True)
    failure_message = Column(String, nullable=True)

    # Payment method (e.g. card, upi, netbanking)
    payment_method = Column(String, nullable=False)

    # Unique identifier for the customer
    customer_id = Column(String, nullable=False, index=True)

    # Creation timestamp in UTC
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Track how many recovery attempts have been made
    retry_count = Column(Integer, default=0, nullable=False)

    # Flag for customer opt-out from communications
    opted_out = Column(Boolean, default=False, nullable=False)

    # Current payment recovery status (failed, abandoned, recovered, exhausted)
    status = Column(String, nullable=False, default="failed")

    # One-to-many relationship: One Payment has many RecoveryEvents
    recovery_events = relationship(
        "RecoveryEvent",
        back_populates="payment",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Payment(payment_id='{self.payment_id}', status='{self.status}', amount={self.amount})>"


class RecoveryEvent(Base):
    """
    Represents an event or action in the recovery workflow of a failed payment.
    Tracks each touchpoint and stage transition.
    """
    __tablename__ = "recovery_events"

    # Unique event identifier (e.g. evt_12345)
    event_id = Column(String, primary_key=True, index=True)

    # Foreign key referencing payments.payment_id
    payment_id = Column(String, ForeignKey("payments.payment_id"), nullable=False, index=True)

    # Recovery stage (detected, diagnosed, action_taken, outcome, stopped)
    stage = Column(String, nullable=False)

    # Diagnostic context or reasoning
    reason = Column(String, nullable=True)

    # Action executed (retry, payment_link, reminder, wait, stop)
    action = Column(String, nullable=True)

    # Number of communications/touches sent to customer
    touch_number = Column(Integer, default=0, nullable=False)

    # Event timestamp in UTC
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Outcome of the recovery action (recovered, no_response, failed, opted_out, stopped)
    outcome = Column(String, nullable=True)

    # Optional reference ID (e.g. Razorpay Payment Link ID or Razorpay Webhook Event ID)
    reference_id = Column(String, nullable=True, index=True)

    # Many-to-one relationship back to Payment
    payment = relationship("Payment", back_populates="recovery_events")

    def __repr__(self):
        return f"<RecoveryEvent(event_id='{self.event_id}', stage='{self.stage}', action='{self.action}')>"


class BatchRun(Base):
    """
    Represents a batch recovery orchestration run executed by RecoveryPilot.
    Stores summary statistics and execution mode for audit and API querying.
    """
    __tablename__ = "batch_runs"

    # Unique batch run identifier (e.g. batch_12345)
    batch_id = Column(String, primary_key=True, index=True)

    # Mode of execution: 'dry_run' or 'execute'
    mode = Column(String, nullable=False)

    # Run timestamps in UTC
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Summary payment metrics
    total_scanned = Column(Integer, default=0, nullable=False)
    eligible = Column(Integer, default=0, nullable=False)
    skipped = Column(Integer, default=0, nullable=False)
    blocked = Column(Integer, default=0, nullable=False)
    diagnosed = Column(Integer, default=0, nullable=False)

    # Policy and execution counts
    actions_allowed = Column(Integer, default=0, nullable=False)
    actions_blocked = Column(Integer, default=0, nullable=False)
    executed = Column(Integer, default=0, nullable=False)
    execution_failed = Column(Integer, default=0, nullable=False)
    pending_recovery = Column(Integer, default=0, nullable=False)
    recovered = Column(Integer, default=0, nullable=False)

    # Monetary metrics at run completion (in paise)
    total_at_risk = Column(Integer, default=0, nullable=False)
    total_recovered = Column(Integer, default=0, nullable=False)
    recovery_rate = Column(Float, default=0.0, nullable=False)

    def __repr__(self):
        return f"<BatchRun(batch_id='{self.batch_id}', mode='{self.mode}', scanned={self.total_scanned})>"

