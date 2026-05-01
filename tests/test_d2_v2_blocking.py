#!/usr/bin/env python3
"""Test D2: verifica che i 6 check v2 siano bloccanti (err, non warn).
Ogni check ha fixture valide (exit 0) e invalide (exit 1 + keyword)."""
import os
import subprocess
import sys

FIXTURES = "tests/fixtures/d2"


def _run(fixture_dir, basename):
    path = os.path.join(FIXTURES, fixture_dir, basename)
    return subprocess.run(
        [sys.executable, "scripts/validate-lessons.py", path],
        capture_output=True, text=True
    )


def _assert_valid(fixture_dir, basename):
    r = _run(fixture_dir, basename)
    assert r.returncode == 0, f"FAIL valid {fixture_dir}: exit {r.returncode}\n{r.stdout}"


def _assert_invalid(fixture_dir, basename, keyword):
    r = _run(fixture_dir, basename)
    output = r.stdout + r.stderr
    assert r.returncode != 0, f"FAIL invalid {fixture_dir}: expected exit!=0, got 0"
    assert keyword in output, f"FAIL invalid {fixture_dir}: '{keyword}' not in output:\n{output}"


def test_cv1_anglo_traps():
    _assert_valid("cv1_valid", "theme-meta.json")
    _assert_invalid("cv1_not_list", "theme-meta.json", "anglo_traps")
    _assert_invalid("cv1_missing_id", "theme-meta.json", "anglo_traps")
    _assert_invalid("cv1_missing_trap", "theme-meta.json", "anglo_traps")


def test_cv2_cultural_insights_theme():
    _assert_valid("cv2_valid", "theme-meta.json")
    _assert_invalid("cv2_not_list", "theme-meta.json", "cultural_insights")
    _assert_invalid("cv2_missing_title", "theme-meta.json", "cultural_insights")
    _assert_invalid("cv2_missing_body", "theme-meta.json", "cultural_insights")


def test_cv3_cultural_insights_unit():
    _assert_valid("cv3_valid", "unit-meta.json")
    _assert_invalid("cv3_not_list", "unit-meta.json", "cultural_insights")
    _assert_invalid("cv3_missing_id", "unit-meta.json", "cultural_insights")


def test_cv4_context_override():
    _assert_valid("cv4_valid_present", "unit-meta.json")
    _assert_valid("cv4_valid_absent", "unit-meta.json")
    _assert_invalid("cv4_not_dict", "unit-meta.json", "context_override")


def test_cv5_cultural_insights_lesson():
    _assert_valid("cv5_valid_empty", "lesson1.json")
    _assert_valid("cv5_valid_one", "lesson1.json")
    _assert_invalid("cv5_too_many", "lesson1.json", "cultural_insights")
    _assert_invalid("cv5_not_list", "lesson1.json", "cultural_insights")


def test_cv6_character_layout_override():
    _assert_valid("cv6_valid_compact", "lesson1.json")
    _assert_valid("cv6_valid_null", "lesson1.json")
    _assert_invalid("cv6_invalid_string", "lesson1.json", "character_layout_override")


if __name__ == "__main__":
    tests = [
        test_cv1_anglo_traps,
        test_cv2_cultural_insights_theme,
        test_cv3_cultural_insights_unit,
        test_cv4_context_override,
        test_cv5_cultural_insights_lesson,
        test_cv6_character_layout_override,
    ]
    total_fixtures = 0
    for t in tests:
        t()
        print(f"  ✓ {t.__name__}")
    # Count fixtures
    for d in os.listdir(FIXTURES):
        if os.path.isdir(os.path.join(FIXTURES, d)):
            total_fixtures += 1
    print(f"\n✅ D2 — 6 check coperti, {total_fixtures} fixture verificate")
