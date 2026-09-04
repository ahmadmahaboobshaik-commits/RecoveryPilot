# BACKEND_INTEGRATION_MAP.md
## RecoveryPilot — Complete Frontend → Backend Integration Architecture

> **FRONTEND STATUS:** COMPLETE & FROZEN  
> **TARGET BACKEND URL:** `http://localhost:8000`  
> **DATE:** September 2, 2026

---

## 1. Executive Summary & Audit Overview

The RecoveryPilot React/Vite frontend communicates with the FastAPI backend through a unified API client module ([`frontend/src/services/api.js`](file:///c:/Users/hp/Desktop/RecoveryPilot/frontend/src/services/api.js)). 

All operational components (`VesperLanding`, `CommandCenterView`, `PaymentsExplorerView`, `PaymentDetailModal`, `DecisionWorkbenchView`, `BatchRecoveryView`, `AuditTrailView`, `SystemStatusView`) are fully wired to API endpoints via `async/await` request hooks, featuring real-time data binding, loading state spinners, error state dismissals, and confirm modals.

---

## 2. Frontend → API Dependency Map

| Component / View | API Service Function | Endpoint Path | Method | Purpose / Action |
| :--- | :--- | :--- | :---: | :--- |
| `RecoveryApp`, `FloatingNav`, `SystemStatusView` | `api.getHealth()` | `/health` | `GET` | Health check & connection telemetry |
| `RecoveryApp`, `VesperLanding`, `VesperTelemetryShowcase`, `CommandCenterView` | `api.getMetrics()` | `/api/metrics` | `GET` | Portfolio KPI metrics, at-risk/recovered totals, distributions |
| `RecoveryApp`, `AuditTrailView`, `CommandCenterView` | `api.getActivity(limit)` | `/api/recovery/activity?limit={limit}` | `GET` | Forensic flight recorder stream & audit events |
| `PaymentsExplorerView` | `api.getPayments(params)` | `/api/payments?...` | `GET` | Paginated transaction explorer with search/status filters |
| `PaymentDetailModal` | `api.getPaymentDetails(id)` | `/api/payments/{id}` | `GET` | Deep inspection drawer: payment, diagnosis, policy, execution |
| `DecisionWorkbenchView`, `PaymentDetailModal` | `api.diagnosePayment(id)` | `/api/diagnose/{id}` | `POST` | Triggers Claude AI Diagnosis Engine (non-binding advisory) |
| `DecisionWorkbenchView`, `PaymentDetailModal` | `api.evaluatePayment(id)` | `/api/evaluate/{id}` | `POST` | Evaluates deterministic Decision Matrix & Policy Engine gates |
| `DecisionWorkbenchView`, `PaymentDetailModal` | `api.executePayment(id)` | `/api/execute/{id}` | `POST` | Dispatches Razorpay recovery action / payment link |
| `BatchRecoveryView` | `api.runBatch(mode)` | `/api/recovery/run-batch?mode={mode}` | `POST` | Portfolio-wide dry-run or live gated batch execution |
| `BatchRecoveryView` | `api.getBatches(limit)` | `/api/recovery/batches?limit={limit}` | `GET` | Historical batch execution ledger |
| Razorpay Gateway (External) | N/A | `/api/webhooks/razorpay` | `POST` | Cryptographic signature HMAC-SHA256 webhook ingestion |

---

## 3. Detailed Endpoint Contracts & Response Schemas

### 1. `GET /health`
* **Response Schema:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-02T09:21:00Z"
  }
  ```
* **UI Display:** `FloatingNav` status indicator (Emerald dot `● RECOVERY ENGINE ACTIVE`), `SystemStatusView` component health badge.

---

### 2. `GET /api/metrics`
* **Response Schema:**
  ```json
  {
    "at_risk_amount": 24800000,
    "total_at_risk": 24800000,
    "recovered_amount": 13200000,
    "total_recovered": 13200000,
    "recovery_rate": 53.2,
    "failed_payment_count": 142,
    "recovered_payment_count": 89,
    "pending_recovery_count": 53,
    "by_root_cause": {
      "insufficient_funds": 48,
      "bank_timeout": 32,
      "card_expired": 20,
      "3ds_auth_failed": 18
    },
    "by_action": {
      "payment_link": 65,
      "auto_retry": 42,
      "cooldown": 12
    }
  }
  ```
* **UI Display:** `VesperTelemetryShowcase` metric counters, `CommandCenterView` KPI cards & progress bar breakdowns.

---

### 3. `GET /api/recovery/activity?limit={limit}`
* **Query Parameters:** `limit` (integer, default `50` or `200`)
* **Response Schema:** Array of activity objects:
  ```json
  [
    {
      "event_id": "evt_908124",
      "payment_id": "PAY_TEST_9042",
      "stage": "action_taken",
      "outcome": "allowed",
      "action": "payment_link",
      "reason": "Policy allowed payment link dispatch for insufficient funds.",
      "reference_id": "plink_890123",
      "timestamp": "2026-09-02T09:15:30Z"
    }
  ]
  ```
* **UI Display:** `AuditTrailView` stream rows, `CommandCenterView` live flight recorder stream.

---

### 4. `GET /api/payments`
* **Query Parameters:** `search` (string), `status` (string), `failure_code` (string), `limit` (int), `offset` (int)
* **Response Schema:**
  ```json
  {
    "payments": [
      {
        "payment_id": "PAY_TEST_9042",
        "customer_id": "cust_88210",
        "amount": 24999,
        "currency": "INR",
        "payment_method": "upi",
        "status": "failed",
        "failure_code": "INSUFFICIENT_FUNDS",
        "failure_message": "Customer account balance below order amount.",
        "retry_count": 1,
        "latest_action": "payment_link",
        "opted_out": false,
        "created_at": "2026-09-02T08:00:00Z"
      }
    ],
    "total": 142
  }
  ```
* **UI Display:** `PaymentsExplorerView` portfolio table & pagination status.

---

### 5. `GET /api/payments/{payment_id}`
* **Path Parameter:** `payment_id` (string)
* **Response Schema:**
  ```json
  {
    "payment": {
      "payment_id": "PAY_TEST_9042",
      "customer_id": "cust_88210",
      "amount": 24999,
      "currency": "INR",
      "payment_method": "upi",
      "status": "failed",
      "failure_code": "INSUFFICIENT_FUNDS",
      "failure_message": "Customer account balance below order amount.",
      "retry_count": 1,
      "opted_out": false,
      "created_at": "2026-09-02T08:00:00Z"
    },
    "latest_diagnosis": {
      "root_cause": "insufficient_funds",
      "recoverability": 0.85,
      "confidence": 0.92,
      "reason": "Temporary liquidity drop; customer historically settles within 24 hours.",
      "created_at": "2026-09-02T08:05:00Z"
    },
    "latest_decision": {
      "candidate_action": "payment_link",
      "source": "playbook_matrix",
      "reason": "High recoverability score maps to direct payment link dispatch."
    },
    "latest_policy": {
      "decision": "allow",
      "rule": "standard_policy",
      "reason": "Retry count 1 is below maximum cap 3; customer opted-out: false."
    },
    "latest_execution": {
      "status": "executed",
      "action": "payment_link",
      "reference_id": "plink_890123",
      "message": "Razorpay payment link generated and dispatched to customer."
    },
    "timeline": [
      {
        "stage": "detected",
        "timestamp": "2026-09-02T08:00:00Z",
        "details": "Gateway payment failure ingested."
      }
    ]
  }
  ```
* **UI Display:** `PaymentDetailModal` slide-over drawer tabs, root cause badges, and timeline.

---

### 6. `POST /api/diagnose/{payment_id}`
* **Path Parameter:** `payment_id` (string)
* **Response Schema:**
  ```json
  {
    "payment_id": "PAY_TEST_9042",
    "diagnosis": {
      "root_cause": "insufficient_funds",
      "recoverability": 0.85,
      "confidence": 0.92,
      "reason": "Temporary liquidity drop; high likelihood of resolution upon reminder."
    }
  }
  ```
* **UI Display:** `DecisionWorkbenchView` Tier 1 AI Advisory panel, `PaymentDetailModal`.

---

### 7. `POST /api/evaluate/{payment_id}`
* **Path Parameter:** `payment_id` (string)
* **Response Schema:**
  ```json
  {
    "payment_id": "PAY_TEST_9042",
    "diagnosis": { ... },
    "decision": {
      "candidate_action": "payment_link",
      "source": "playbook_matrix",
      "reason": "Mapped via deterministic playbook."
    },
    "policy": {
      "decision": "allow",
      "rule": "standard_policy",
      "reason": "All policy guardrails satisfied."
    }
  }
  ```
* **UI Display:** `DecisionWorkbenchView` Tier 2 & Tier 3 panels.

---

### 8. `POST /api/execute/{payment_id}`
* **Path Parameter:** `payment_id` (string)
* **Response Schema:**
  ```json
  {
    "payment_id": "PAY_TEST_9042",
    "execution": {
      "status": "executed",
      "action": "payment_link",
      "reference_id": "plink_890123",
      "message": "Payment link generated via Razorpay API."
    }
  }
  ```
* **UI Display:** `DecisionWorkbenchView` Tier 4 Execution panel, `PaymentDetailModal`.

---

### 9. `POST /api/recovery/run-batch?mode={mode}`
* **Query Parameters:** `mode` (`dry_run` | `execute`)
* **Response Schema:**
  ```json
  {
    "batch_id": "batch_run_8820",
    "mode": "dry_run",
    "total_scanned": 142,
    "eligible": 89,
    "blocked": 12,
    "diagnosed": 89,
    "actions_allowed": 77,
    "executed": 0,
    "total_at_risk": 1250000,
    "total_recovered": 850000,
    "results": [
      {
        "payment_id": "PAY_TEST_9042",
        "eligibility": "eligible",
        "root_cause": "insufficient_funds",
        "candidate_action": "payment_link",
        "policy_decision": "allow",
        "execution_status": "simulated",
        "reason": "Simulated dry-run completed."
      }
    ]
  }
  ```
* **UI Display:** `BatchRecoveryView` summary metrics grid & per-transaction outcome table.

---

### 10. `GET /api/recovery/batches?limit={limit}`
* **Query Parameters:** `limit` (int, default `20`)
* **Response Schema:**
  ```json
  [
    {
      "batch_id": "batch_run_8820",
      "mode": "dry_run",
      "total_scanned": 142,
      "eligible": 89,
      "executed": 0,
      "total_at_risk": 1250000,
      "total_recovered": 850000,
      "started_at": "2026-09-02T09:00:00Z"
    }
  ]
  ```
* **UI Display:** `BatchRecoveryView` historical batch execution ledger.

---

## 4. Required Database Entities (SQLite `recovery_pilot.db`)

1. **`Payment`**: `payment_id` (PK), `customer_id`, `amount`, `currency`, `payment_method`, `status`, `failure_code`, `failure_message`, `retry_count`, `latest_action`, `opted_out`, `created_at`, `updated_at`.
2. **`Diagnosis`**: `id` (PK), `payment_id` (FK), `root_cause`, `recoverability` (float), `confidence` (float), `reason`, `created_at`.
3. **`Decision`**: `id` (PK), `payment_id` (FK), `candidate_action`, `source`, `reason`, `created_at`.
4. **`PolicyEvaluation`**: `id` (PK), `payment_id` (FK), `decision` (`allow`|`block`), `rule`, `reason`, `created_at`.
5. **`Execution`**: `id` (PK), `payment_id` (FK), `action`, `status`, `reference_id`, `message`, `error`, `created_at`.
6. **`AuditEvent`**: `event_id` (PK), `payment_id`, `stage`, `outcome`, `action`, `reason`, `reference_id`, `timestamp`.
7. **`BatchRun`**: `batch_id` (PK), `mode`, `total_scanned`, `eligible`, `blocked`, `diagnosed`, `actions_allowed`, `executed`, `total_at_risk`, `total_recovered`, `started_at`, `completed_at`.

---

## 5. Mock / Demo Data Locations in Codebase

- [`RecoveryNetwork3D.jsx`](file:///c:/Users/hp/Desktop/RecoveryPilot/frontend/src/components/3d/RecoveryNetwork3D.jsx): Static `SAMPLE_NODES` array used strictly for ambient WebGL Canvas presentation.
- All functional UI views retrieve live dynamic payloads from `api.js`.

---

## 6. Implementation Order Recommendation

1. Verify SQLite schema & migrations in `backend/app/models.py`.
2. Ensure test payment generator populates sample transactions (`PAY_TEST_9042`, etc.).
3. Validate Claude AI Diagnosis prompt service (`backend/app/ai/diagnosis.py`).
4. Validate Policy Engine guardrails (`backend/app/recovery/policy.py`).
5. Validate Razorpay payment link integration & webhook signature verification (`backend/app/webhooks/service.py`).
6. Execute FastAPI server on `http://localhost:8000`.
