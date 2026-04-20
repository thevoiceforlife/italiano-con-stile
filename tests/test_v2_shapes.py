"""Tests for v2 shape validators: decision, why, dialogue.
Follows the pattern of test_strict_category.py."""
import sys
sys.path.insert(0, ".")
from scripts.validate_lessons import (
    validate_v2_decision,
    validate_v2_why,
    validate_v2_dialogue,
    validate_v2_activity,
)

REF = "test"

# ═══════════════════════════════════════════════════════════════════════
# DECISION
# ═══════════════════════════════════════════════════════════════════════

VALID_DECISION = {
    "scenario": {"it": "Sono le 19. Entri al bar.", "en": "It's 7 PM. You walk into the bar."},
    "prompt": {"it": "Cosa dici?", "en": "What do you say?"},
    "branches": [
        {
            "action": {"it": "Buonasera!", "en": "Good evening!", "emoji": "🌆"},
            "outcome": {"it": "✅ Perfetto. Dopo le 18 è buonasera.", "en": "✅ Perfect. After 6 PM it's buonasera."}
        },
        {
            "action": {"it": "Ciao!", "en": "Hi!", "emoji": "👋"},
            "outcome": {"it": "❌ Ciao è informale.", "en": "❌ Ciao is informal. ✅ Better: Buonasera."}
        },
        {
            "action": {"it": "Buongiorno!", "en": "Good morning!", "emoji": "☀️"},
            "outcome": {"it": "❌ Buongiorno è prima delle 18.", "en": "❌ Buongiorno is before 6 PM."}
        }
    ],
    "correct_branch_index": 0,
    "context_type": "saluto_contestuale",
    "expected_answer_type": "saluto"
}


def test_decision_valid():
    errs = validate_v2_decision(VALID_DECISION, REF)
    assert errs == [], f"Valid decision should pass, got: {errs}"


def test_decision_branches_4():
    d = {**VALID_DECISION, "branches": VALID_DECISION["branches"] + [VALID_DECISION["branches"][1]]}
    errs = validate_v2_decision(d, REF)
    assert any("branches.length" in e for e in errs), f"4 branches should fail: {errs}"


def test_decision_correct_index_not_0():
    d = {**VALID_DECISION, "correct_branch_index": 1}
    errs = validate_v2_decision(d, REF)
    assert any("correct_branch_index" in e for e in errs), f"index!=0 should fail: {errs}"


def test_decision_missing_outcome_en():
    import copy
    d = copy.deepcopy(VALID_DECISION)
    d["branches"][0]["outcome"]["en"] = ""
    errs = validate_v2_decision(d, REF)
    assert any("outcome.en" in e for e in errs), f"Empty outcome.en should fail: {errs}"


# ═══════════════════════════════════════════════════════════════════════
# WHY
# ═══════════════════════════════════════════════════════════════════════

VALID_WHY = {
    "pattern_examples": [
        {
            "group_label": {"it": "Gruppo 1", "en": "Group 1"},
            "items": [
                {"it": "Ciao Sofia!", "en": "Hi Sofia!"},
                {"it": "Ciao Marco!", "en": "Hi Marco!"}
            ]
        },
        {
            "group_label": None,
            "items": [
                {"it": "Buongiorno signor Rossi", "en": "Good morning Mr. Rossi"},
                {"it": "Buongiorno dottoressa", "en": "Good morning Dr."}
            ]
        }
    ],
    "prompt": {"it": "Perché cambiamo?", "en": "Why does it change?"},
    "hypotheses": [
        {"text": {"it": "Per conoscenza", "en": "Based on familiarity"}, "nudge": None},
        {
            "text": {"it": "Per l'ora", "en": "Based on time"},
            "nudge": {"it": "Riguarda: non si parla di orari.", "en": "Look again: no times mentioned."}
        }
    ],
    "correct_hypothesis_index": 0,
    "rule_reveal": {"it": "Amici → ciao. Sconosciuti → buongiorno.", "en": "Friends → ciao. Strangers → buongiorno."},
    "english_analogy": {"it": "Come hey vs hello sir.", "en": "Like hey vs hello sir."}
}


def test_why_valid():
    errs = validate_v2_why(VALID_WHY, REF)
    assert errs == [], f"Valid why should pass, got: {errs}"


def test_why_3_groups():
    import copy
    d = copy.deepcopy(VALID_WHY)
    d["pattern_examples"].append(d["pattern_examples"][0])
    errs = validate_v2_why(d, REF)
    assert any("pattern_examples.length" in e for e in errs), f"3 groups should fail: {errs}"


def test_why_correct_nudge_not_null():
    import copy
    d = copy.deepcopy(VALID_WHY)
    d["hypotheses"][0]["nudge"] = {"it": "Non dovrebbe esserci", "en": "Should not be here"}
    errs = validate_v2_why(d, REF)
    assert any("nudge deve essere null" in e for e in errs), f"Non-null nudge[0] should fail: {errs}"


def test_why_wrong_nudge_missing():
    import copy
    d = copy.deepcopy(VALID_WHY)
    d["hypotheses"][1]["nudge"] = None
    errs = validate_v2_why(d, REF)
    assert any("nudge mancante" in e for e in errs), f"Missing nudge[1] should fail: {errs}"


# ═══════════════════════════════════════════════════════════════════════
# DIALOGUE
# ═══════════════════════════════════════════════════════════════════════

VALID_DIALOGUE = {
    "scenario_intro": {"it": "Sei al bar.", "en": "You're at the bar."},
    "turns": [
        {
            "speaker": "character",
            "character_id": "mario",
            "text": {"it": "Buongiorno! Cosa prende?", "en": "Good morning! What will you have?"}
        },
        {
            "speaker": "user",
            "prompt": {"it": "Cosa rispondi?", "en": "What do you say?"},
            "options": [
                {"it": "Un caffè, per favore", "en": "A coffee, please"},
                {"it": "Dammi un caffè", "en": "Give me a coffee"}
            ],
            "correct_index": 0,
            "feedback_wrong": {
                "it": "❌ Dammi è sgarbato. ✅ Per favore!",
                "en": "❌ Dammi is rude. ✅ Per favore!"
            }
        },
        {
            "speaker": "character",
            "character_id": "mario",
            "text": {"it": "Subito!", "en": "Right away!"}
        }
    ]
}


def test_dialogue_valid():
    errs = validate_v2_dialogue(VALID_DIALOGUE, REF)
    assert errs == [], f"Valid dialogue should pass, got: {errs}"


def test_dialogue_no_user_turn():
    import copy
    d = copy.deepcopy(VALID_DIALOGUE)
    # Replace user turn with character turn
    d["turns"][1] = {
        "speaker": "character",
        "character_id": "mario",
        "text": {"it": "Ancora io!", "en": "Me again!"}
    }
    errs = validate_v2_dialogue(d, REF)
    assert any("almeno 1 turno user" in e for e in errs), f"No user turn should fail: {errs}"


def test_dialogue_4_consecutive_character():
    import copy
    d = copy.deepcopy(VALID_DIALOGUE)
    char_turn = {"speaker": "character", "character_id": "mario", "text": {"it": "Sì", "en": "Yes"}}
    # 4 consecutive character turns
    d["turns"] = [char_turn, char_turn, char_turn, char_turn,
                  VALID_DIALOGUE["turns"][1]]  # then one user turn
    errs = validate_v2_dialogue(d, REF)
    assert any("3 turni character consecutivi" in e for e in errs), f"4 consec char should fail: {errs}"


def test_dialogue_correct_index_not_0():
    import copy
    d = copy.deepcopy(VALID_DIALOGUE)
    d["turns"][1]["correct_index"] = 1
    errs = validate_v2_dialogue(d, REF)
    assert any("correct_index deve essere 0" in e for e in errs), f"index!=0 should fail: {errs}"


# ═══════════════════════════════════════════════════════════════════════
# DISPATCHER
# ═══════════════════════════════════════════════════════════════════════

def test_dispatcher_unknown_type_passes():
    act = {"type": "mcq", "data": {"whatever": True}}
    errs = validate_v2_activity(act, REF)
    assert errs == [], f"Unknown type should pass silently: {errs}"


if __name__ == "__main__":
    tests = [
        test_decision_valid,
        test_decision_branches_4,
        test_decision_correct_index_not_0,
        test_decision_missing_outcome_en,
        test_why_valid,
        test_why_3_groups,
        test_why_correct_nudge_not_null,
        test_why_wrong_nudge_missing,
        test_dialogue_valid,
        test_dialogue_no_user_turn,
        test_dialogue_4_consecutive_character,
        test_dialogue_correct_index_not_0,
        test_dispatcher_unknown_type_passes,
    ]
    for t in tests:
        t()
        print(f"  ✓ {t.__name__}")
    print(f"\n✅ Tutti i {len(tests)} test passano")
