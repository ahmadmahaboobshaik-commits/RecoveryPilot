from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Payment, RecoveryEvent


def calculate_revenue_metrics(db: Session) -> Dict[str, Any]:
    """
    Calculates deterministic revenue recovery metrics and extended intelligence directly from SQLite database states.

    Guarantees:
    - Base revenue calculation strictly on database records (no hard-coded numbers).
    - Internal money calculations in paise.
    """
    # 1. Total at risk (sum of amounts across all tracked payments)
    total_at_risk_res = db.query(func.sum(Payment.amount)).scalar()
    total_at_risk = int(total_at_risk_res) if total_at_risk_res else 0

    # 2. Total recovered (sum of amounts for payments with status == 'recovered')
    total_recovered_res = db.query(func.sum(Payment.amount)).filter(Payment.status == "recovered").scalar()
    total_recovered = int(total_recovered_res) if total_recovered_res else 0

    # 3. Recovery rate calculation
    if total_at_risk > 0:
        recovery_rate = round((total_recovered / total_at_risk) * 100.0, 2)
    else:
        recovery_rate = 0.0

    # 4. Payment counts
    recovered_payment_count = db.query(Payment).filter(Payment.status == "recovered").count()
    failed_payment_count = db.query(Payment).filter(Payment.status != "recovered").count()

    # Pending recovery count: payments with pending/executed action_taken events not yet settled
    pending_recovery_count = db.query(Payment).filter(
        Payment.status != "recovered",
        Payment.payment_id.in_(
            db.query(RecoveryEvent.payment_id).filter(
                RecoveryEvent.stage == "action_taken",
                RecoveryEvent.outcome.in_(["pending", "executed"])
            )
        )
    ).count()

    # 5. Breakdown by payment status
    status_counts = db.query(Payment.status, func.count(Payment.payment_id)).group_by(Payment.status).all()
    by_outcome = {status_str: count for status_str, count in status_counts}

    # 6. Breakdown by failure_code / root cause
    cause_rows = db.query(
        Payment.failure_code,
        func.sum(Payment.amount),
        func.count(Payment.payment_id)
    ).group_by(Payment.failure_code).all()

    by_root_cause = {}
    for code, amt_sum, count in cause_rows:
        code_key = (code or "unknown").lower()
        rec_sum = db.query(func.sum(Payment.amount)).filter(
            Payment.failure_code == code,
            Payment.status == "recovered"
        ).scalar() or 0

        code_at_risk = int(amt_sum or 0)
        code_recovered = int(rec_sum)
        rate = round((code_recovered / code_at_risk * 100.0), 2) if code_at_risk > 0 else 0.0

        # Attempts for this root cause
        attempts = db.query(RecoveryEvent).join(Payment).filter(
            Payment.failure_code == code,
            RecoveryEvent.stage == "action_taken"
        ).count()

        by_root_cause[code_key] = {
            "at_risk": code_at_risk,
            "recovered": code_recovered,
            "recovery_rate": rate,
            "payment_count": count,
            "attempts": attempts
        }

    # 7. Breakdown by recovery action
    known_actions = ["payment_link", "reminder", "retry", "wait", "stop"]
    by_action = {}

    for act in known_actions:
        # Total attempts evaluated or recommended
        attempts = db.query(RecoveryEvent).filter(
            RecoveryEvent.action == act
        ).count()

        # Total executed
        executed_cnt = db.query(RecoveryEvent).filter(
            RecoveryEvent.action == act,
            RecoveryEvent.stage == "action_taken"
        ).count()

        # Total recovered count via this action
        rec_cnt = db.query(RecoveryEvent).filter(
            RecoveryEvent.action == act,
            RecoveryEvent.stage == "outcome",
            RecoveryEvent.outcome == "recovered"
        ).count()

        # Total revenue recovered via this action
        rev_recovered_res = db.query(func.sum(Payment.amount)).filter(
            Payment.payment_id.in_(
                db.query(RecoveryEvent.payment_id).filter(
                    RecoveryEvent.action == act,
                    RecoveryEvent.stage == "outcome",
                    RecoveryEvent.outcome == "recovered"
                )
            )
        ).scalar()
        revenue_recovered = int(rev_recovered_res) if rev_recovered_res else 0

        rate = round((rec_cnt / executed_cnt * 100.0), 2) if executed_cnt > 0 else 0.0

        by_action[act] = {
            "attempts": attempts,
            "executed": executed_cnt,
            "recovered": rec_cnt,
            "revenue_recovered": revenue_recovered,
            "recovery_rate": rate
        }

    return {
        "total_at_risk": total_at_risk,
        "total_recovered": total_recovered,
        "recovery_rate": recovery_rate,
        "recovered_payment_count": recovered_payment_count,
        "failed_payment_count": failed_payment_count,
        "pending_recovery_count": pending_recovery_count,
        "by_root_cause": by_root_cause,
        "by_action": by_action,
        "by_outcome": by_outcome
    }
