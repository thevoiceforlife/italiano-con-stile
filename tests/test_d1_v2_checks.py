#!/usr/bin/env python3
"""Smoke test D1: il validator gira pulito (exit 0) sullo stato HEAD,
inclusi i 6 nuovi check v2 warning-mode."""
import subprocess
import sys

def test_validator_exit_zero():
    result = subprocess.run(
        [sys.executable, "scripts/validate-lessons.py"],
        capture_output=True, text=True
    )
    assert result.returncode == 0, (
        f"Validator exit {result.returncode}\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )

if __name__ == "__main__":
    test_validator_exit_zero()
    print("✅ D1 smoke test passato")
