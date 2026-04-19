"""Sanity test: il check bloccante deve catturare il 'bug del dolce'
  e non deve fare falsi positivi su casi corretti o ambigui."""
import sys
sys.path.insert(0, ".")
from scripts.validate_lessons import (
    strict_category_check,
    load_semantic_taxonomy,
)

TAX = load_semantic_taxonomy("A1")

def test_dolce_blocks():
    q = {
        "context": "La Nonna ti offre il dolce.",
        "prompt": "Cosa fai?",
        "options": ["Piacere!", "Buongiorno!", "Ciao!", "Arrivederci!"],
    }
    r = strict_category_check(q, TAX)
    assert r is not None, "dolce-pattern deve fire BLOCKING"
    assert r["severity"] == "BLOCKING"
    assert r["context_type"] == "offerta"

def test_saluto_mattutino_passes():
    q = {
        "context": "Sono le 9 di mattina. Incontri la Nonna.",
        "prompt": "Cosa dici?",
        "options": ["Buongiorno!", "Buonasera!", "Arrivederci!", "Ciao!"],
    }
    assert strict_category_check(q, TAX) is None

def test_narrative_no_trigger_skipped():
    q = {
        "context": "Mario pensa alla giornata.",
        "prompt": "Cosa prova?",
        "options": ["Felice", "Triste", "Annoiato", "Stressato"],
    }
    assert strict_category_check(q, TAX) is None, \
        "Context narrativo senza trigger deve essere skippato"

if __name__ == "__main__":
    test_dolce_blocks()
    test_saluto_mattutino_passes()
    test_narrative_no_trigger_skipped()
    print("✅ Tutti e 3 i test passano")
