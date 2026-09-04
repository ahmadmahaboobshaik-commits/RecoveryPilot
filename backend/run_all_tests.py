import subprocess
import sys
import os

TEST_FILES = [
    "backend/test_models_verification.py",
    "backend/test_phase2_verification.py",
    "backend/test_phase3_verification.py",
    "backend/test_phase4_verification.py",
    "backend/test_phase5_verification.py",
    "backend/test_phase6_verification.py",
    "backend/test_phase7_verification.py",
    "backend/test_all_endpoints.py",
    "backend/test_e2e_recovery_lifecycle.py",
    "backend/test_final_comprehensive_verification.py",
]

def main():
    py_exec = sys.executable
    results = []
    print("=" * 70)
    print("RECOVERYPILOT FULL TEST SUITE RUNNER")
    print("=" * 70)

    for test_file in TEST_FILES:
        print(f"\n---> Running {test_file}...")
        proc = subprocess.run(
            [py_exec, "-X", "utf8", test_file],
            cwd=os.getcwd(),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace"
        )
        if proc.returncode == 0:
            print(f"[PASS] {test_file}")
            results.append((test_file, "PASS", proc.stdout[-300:] if proc.stdout else ""))
        else:
            print(f"[FAIL] {test_file}")
            print(f"Error output:\n{proc.stderr}\n{proc.stdout[-500:]}")
            results.append((test_file, "FAIL", proc.stderr))

    print("\n" + "=" * 70)
    print("TEST SUITE EXECUTION SUMMARY")
    print("=" * 70)
    passed_count = sum(1 for _, status, _ in results if status == "PASS")
    failed_count = sum(1 for _, status, _ in results if status == "FAIL")

    for file, status, _ in results:
        indicator = "✅" if status == "PASS" else "❌"
        print(f"  {indicator} {status:4s} : {file}")

    print("-" * 70)
    print(f"TOTAL TESTS: {len(results)} | PASSED: {passed_count} | FAILED: {failed_count}")
    print("=" * 70)

    if failed_count > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
