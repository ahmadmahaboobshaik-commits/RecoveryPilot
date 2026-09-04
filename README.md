# RecoveryPilot — AI Revenue Recovery Agent

## Hackathon Context
* **Hackathon:** Razorpay AI Buildathon
* **Track:** Track 3 — AI Revenue Recovery
* **Project Name:** RecoveryPilot

---

## Overview
**RecoveryPilot** is an intelligent revenue recovery system designed to diagnose payment failures, estimate recoverability, and perform bounded recovery actions while strictly obeying deterministic policy guardrails.

### Critical Safety Rule
> **The LLM must NEVER directly execute payment actions.**
> All actions recommended by the AI agent pass through a deterministic Policy Engine enforce guardrails (touch limits, cooldowns, opt-outs, and expiration windows) prior to execution.

---

## Product Capabilities & MVP Flow
1. **Ingest Payment Records:** Process synthetic / test payment failure data.
2. **Failure Diagnosis:** Analyze root causes (e.g., insufficient funds, bank downtime, expired instruments).
3. **Recoverability Estimation:** Score recovery probability.
4. **Action Recommendation:** Suggest bounded recovery strategies (`retry`, `payment_link`, `reminder`, `wait`, `stop`).
5. **Deterministic Guardrails:** Apply stopping rules and strict cooldowns via Policy Engine.
6. **Razorpay Integration:** Execute permitted Razorpay Test Mode actions.
7. **Customer Nudges:** Simulate customer notifications and reminders.
8. **Outcome Processing:** Handle webhooks and payment state updates idempotently.
9. **Analytics:** Calculate recovered revenue and overall recovery success rate.
10. **Dashboard:** Interactive visualization via React dashboard.

---

## Allowed AI Actions & Guardrails

### Permitted Actions
- `retry`: Re-attempt payment charge via gateway API.
- `payment_link`: Generate and dispatch a Razorpay payment link.
- `reminder`: Send customer nudge notification.
- `wait`: Pause action until cooldown or schedule window opens.
- `stop`: Terminate recovery attempts for the payment.

### Policy Guardrails
- **Max Touches:** Maximum 3 recovery touches per payment record.
- **Cooldown Window:** Mandatory waiting period between consecutive actions.
- **Opt-Out Handling:** Immediate stop upon receiving a customer opt-out signal.
- **Window Expiration:** Stop action when payment recovery window has expired.
- **Already Recovered:** Stop immediately if payment is verified as settled/recovered.
- **Confidence Gate:** Reject low-confidence or overly aggressive AI recommendations.
- **Idempotency:** Strict idempotent processing for webhooks and API triggers.

---

## Decision Engine & Policy Engine Architecture (Phase 4)

RecoveryPilot separates recovery planning into two distinct, deterministic engine components:

### 1. Decision Engine ("What recovery action should we propose?")
- Uses a **deterministic recovery playbook** mapping failure root causes directly to candidate actions (e.g. `expired_card` $\rightarrow$ `payment_link`, `bank_timeout` $\rightarrow$ `retry`, `insufficient_funds` $\rightarrow$ `wait`).
- LLM recommendations are **advisory only**. For known failure modes, the deterministic playbook overrides AI suggestions while preserving AI context for audit logs.

### 2. Policy Engine ("Are we actually allowed to take that action?")
- Enforces strict, non-bypassable guardrails in prioritized order:
  1. **Already Recovered**: Block & stop if payment status is settled (`already_recovered`).
  2. **Opt-Out Control**: Block & stop immediately if customer opted out (`customer_opted_out`).
  3. **Recovery Window**: Block & stop if payment is older than 7 days (`recovery_window_expired`).
  4. **Max Touches**: Block & stop if retry count $\ge 3$ (`max_touches_reached`).
  5. **Cooldown Window**: Wait/delay if previous event occurred $< 24$ hours ago (`cooldown_active`).
  6. **Confidence Gate**: Block & stop if AI confidence score $< 0.60$ (`low_ai_confidence`).
  7. **Recoverability Gate**: Block & stop if recoverability score $< 0.30$ (`low_recoverability`).

> **Key Phase 4 Safety Principles:**
> - Deterministic policy rules control execution — LLM outputs never directly trigger actions.
> - Policy guardrails prevent unwanted customer communications and illegal state transitions.
> - Blocked actions create audit records (`stage="stopped"`) in the database.
> - **Zero Action Execution**: No payment actions, retries, payment links, or Razorpay API calls are executed in Phase 4.

---

## Safe Recovery Execution Layer & Lifecycle States (Phase 5)

RecoveryPilot enforces strict separation between recovery planning, execution, and revenue settlement across four distinct lifecycle states:

```
[1] Recommended  ──>  [2] Approved  ──>  [3] Executed  ──>  [4] Recovered
 (Claude AI Agent)     (Policy Engine)     (Execution Service)   (Outcome Webhooks)
```

### State Definitions:
1. **Recommended**: Claude AI analyzes diagnostic context and proposes an advisory action.
2. **Approved**: The Policy Engine evaluates candidate actions against deterministic guardrails (`allow`).
3. **Executed**: The Execution Service triggers external APIs (e.g. Razorpay Payment Link) or customer reminders (`stage="action_taken"`, `outcome="pending"`).
4. **Recovered**: Settled state when payment recovery is confirmed by gateway webhooks or settlement verification.

> **Critical Execution Principles:**
> - **Payment Link creation $\neq$ Payment Recovered**: Initiating an action or creating a payment link records execution progress, but does **NOT** mark `payment.status = "recovered"` and does **NOT** increment `retry_count`.
> - **Revenue Settlement**: Revenue is counted as recovered **ONLY** after a later, verified payment outcome.
> - **Idempotency Guard**: Repeated execution calls for the same recovery event return `status="skipped"` to prevent duplicate payment links.
> - **Strict Policy Gate**: Execution handlers are invoked **ONLY** when `policy.decision == "allow"`.

---

## Outcome, Razorpay Webhooks & Revenue Measurement (Phase 6)

RecoveryPilot closes the financial recovery lifecycle through verified gateway webhooks and deterministic database-backed revenue analytics:

```
[Payment Link / Action Executed]
               ↓
    [Customer Payment (TEST MODE)]
               ↓
     [Razorpay Webhook POST /api/webhooks/razorpay]
               ↓
    [HMAC SHA256 Signature Verification]
               ↓
      [Payment Matching & Validation]
               ↓
    [Amount Check (exact paise equality)]
               ↓
     [Idempotency Guard (Event ID)]
               ↓
  [Mark Payment Recovered & Record Revenue]
```

### Critical Financial Safety Principles:
1. **Gateway Settlement Required**: Payment status is updated to `recovered` **ONLY** after a verified successful Razorpay payment event (`payment_link.paid` or `payment.captured`). Neither Payment Link creation nor Claude recommendations can mark a payment recovered.
2. **HMAC Signature Verification**: Every incoming webhook is verified against `RAZORPAY_WEBHOOK_SECRET` using HMAC SHA256 (`X-Razorpay-Signature`). Unsigned or invalid webhooks are rejected with HTTP 400 Bad Request.
3. **Strict Amount Validation**: The webhook amount must equal expected `payment.amount` (both in paise). Any mismatch rejects recovery and records an `amount_mismatch` outcome event (`payment.status` remains `failed`).
4. **Idempotency Safeguards**:
   - Duplicate Razorpay webhook event IDs return `already_processed` without double-counting revenue.
   - Subsequent events for already recovered payments return `already_recovered` without double-counting revenue.
5. **Deterministic Revenue Measurement**: Revenue metrics (`total_at_risk`, `total_recovered`, `recovery_rate`) are computed directly from SQLite database states, avoiding hardcoded values or LLM inferences.

### API Endpoints Added:
- `POST /api/webhooks/razorpay`: Ingests and verifies Razorpay webhook events.
- `GET /api/metrics`: Calculates dynamic revenue metrics and failure breakdowns from SQLite.
- `GET /api/recovery/activity`: Returns chronological recovery activity feed.

---

## Batch Recovery & Revenue Intelligence (Phase 7)

RecoveryPilot Phase 7 orchestrates the complete payment recovery lifecycle across synthetic datasets in batch mode:

```
[100 Synthetic Payments in SQLite]
               ↓
    [Deterministic Eligibility Filter]
   (Filter recovered, opted_out, exhausted, expired, cooldown)
               ↓
    [Claude AI / Fallback Diagnosis]
               ↓
    [Deterministic Decision Playbook]
               ↓
    [Authoritative Policy Engine]
               ↓
      ├──> Dry Run Mode (mode=dry_run): Simulation, zero external actions
      └──> Execute Mode (mode=execute): Invokes Safe Execution ONLY IF policy == allow
               ↓
  [Outcome Webhook Ingestion & Revenue Intelligence Analytics]
```

### Key Phase 7 Features & Safety Rules:
1. **Deterministic Eligibility Filtering**: Payment records are evaluated for eligibility before invoking AI diagnosis. Payments that are already recovered, opted-out (`opted_out == True`), exhausted (`retry_count >= 3`), expired (> 7 days), or in active cooldown ($< 24$h) are blocked/skipped prior to LLM calls.
2. **Dry Run Default (`mode=dry_run`)**: Performs batch scanning, eligibility, diagnosis, decision, and policy evaluation without invoking external APIs, sending messages, or mutating database payment statuses.
3. **Execute Mode (`mode=execute`)**: Calls the safe execution layer ONLY when `policy.decision == "allow"`.
4. **Idempotency Guard**: Repeated batch execution calls skip already-executed actions via Phase 5 idempotency protection, preventing duplicate Payment Links.
5. **Persistent Batch History**: Tracks summary metrics for every batch run in SQLite (`BatchRun` table).
6. **Extended Revenue Intelligence**: Provides real-time metrics including `pending_recovery_count`, attempts/executed counts, and revenue recovery rates grouped by failure root cause and action.

### New API Endpoints:
- `POST /api/recovery/run-batch?mode=dry_run`: Executes batch recovery orchestration in `dry_run` or `execute` mode.
- `GET /api/recovery/batches`: Exposes persistent batch run history for UI feeds.
- `GET /api/recovery/metrics`: Exposes extended revenue metrics and failure breakdowns.

---

## Architecture Overview

```
React Frontend
    └──> FastAPI Backend
            ├──> SQLite Database
            ├──> AI Recovery Agent (Claude API — Advisory Diagnosis)
            ├──> Decision Engine (Deterministic Playbook Selection)
            ├──> Policy Engine (Authoritative Guardrail Enforcement)
            ├──> Safe Recovery Execution Layer
            │       ├──> PaymentLinkExecutor (Razorpay Test Mode APIs)
            │       └──> ReminderExecutor (Simulated Customer Nudges)
            ├──> Webhook Ingestion & Verification (Razorpay Webhooks)
            ├──> Outcome Service (Verified Recovery Settlement)
            ├──> Revenue Measurement Service (Deterministic Metrics)
            └──> Batch Recovery Orchestrator & History Engine
```

---

## Getting Started

### Prerequisites
- Python 3.10+ installed

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env`:
   ```bash
   cp ../.env.example .env
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. Check API Health:
   Visit `http://localhost:8000/health` or access OpenAPI documentation at `http://localhost:8000/docs`.
