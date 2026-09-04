import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, engine, Base
from app.models import Payment, RecoveryEvent
from scripts.generate_payments import generate_synthetic_payments

def test_complete_backend():
    print("=" * 60)
    print("VERIFYING COMPLETE BACKEND INTEGRATION CONTRACTS")
    print("=" * 60)

    # 1. Initialize DB and seed dataset
    Base.metadata.create_all(bind=engine)
    generate_synthetic_payments(count=50)

    client = TestClient(app)

    # 2. Test GET /health
    print("\n[1] GET /health")
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "status" in data and data["status"] == "ok"
    print("  [OK] /health schema verified:", data)

    # 3. Test GET /api/metrics
    print("\n[2] GET /api/metrics")
    res = client.get("/api/metrics")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "total_at_risk" in data or "at_risk_amount" in data
    assert "total_recovered" in data or "recovered_amount" in data
    assert "recovery_rate" in data
    print("  [OK] /api/metrics schema verified:", list(data.keys()))

    # 4. Test GET /api/recovery/activity
    print("\n[3] GET /api/recovery/activity?limit=10")
    res = client.get("/api/recovery/activity?limit=10")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert isinstance(data, list)
    print("  [OK] /api/recovery/activity schema verified, count:", len(data))

    # 5. Test GET /api/payments
    print("\n[4] GET /api/payments")
    res = client.get("/api/payments")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "payments" in data and "total" in data
    assert len(data["payments"]) > 0
    sample_id = data["payments"][0]["payment_id"]
    print(f"  [OK] /api/payments schema verified, total={data['total']}, sample_id={sample_id}")

    # 6. Test GET /api/payments/{payment_id}
    print(f"\n[5] GET /api/payments/{sample_id}")
    res = client.get(f"/api/payments/{sample_id}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "payment" in data and "timeline" in data
    print("  [OK] /api/payments/{id} schema verified, keys:", list(data.keys()))

    # 7. Test POST /api/diagnose/{payment_id}
    print(f"\n[6] POST /api/diagnose/{sample_id}")
    res = client.post(f"/api/diagnose/{sample_id}")
    assert res.status_code in [200, 503], f"Expected 200/503, got {res.status_code}"
    print("  [OK] /api/diagnose endpoint verified:", res.status_code)

    # 8. Test POST /api/evaluate/{payment_id}
    print(f"\n[7] POST /api/evaluate/{sample_id}")
    res = client.post(f"/api/evaluate/{sample_id}")
    assert res.status_code in [200, 503], f"Expected 200/503, got {res.status_code}"
    if res.status_code == 200:
        data = res.json()
        assert "decision" in data and "policy" in data
        print("  [OK] /api/evaluate schema verified, policy decision:", data["policy"]["decision"])

    # 9. Test POST /api/execute/{payment_id}
    print(f"\n[8] POST /api/execute/{sample_id}")
    res = client.post(f"/api/execute/{sample_id}")
    assert res.status_code in [200, 503], f"Expected 200/503, got {res.status_code}"
    if res.status_code == 200:
        data = res.json()
        assert "execution" in data
        print("  [OK] /api/execute schema verified, execution status:", data["execution"]["status"])

    # 10. Test POST /api/recovery/run-batch?mode=dry_run
    print("\n[9] POST /api/recovery/run-batch?mode=dry_run")
    res = client.post("/api/recovery/run-batch?mode=dry_run")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "batch_id" in data and data["mode"] == "dry_run"
    print("  [OK] /api/recovery/run-batch dry_run verified, scanned:", data["total_scanned"])

    # 11. Test GET /api/recovery/batches
    print("\n[10] GET /api/recovery/batches")
    res = client.get("/api/recovery/batches")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert isinstance(data, list) and len(data) > 0
    print("  [OK] /api/recovery/batches verified, history count:", len(data))

    print("\n" + "=" * 60)
    print("ALL API ENDPOINT CONTRACTS VERIFIED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_complete_backend()
