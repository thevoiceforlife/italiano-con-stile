#!/usr/bin/env python3
"""
Test anti-regressione shuffle opzioni MCQ.

Check 1 (sintattico): ogni componente Domanda* che itera q.opzioni in
app/lesson/[livello]/[unita]/[lezione]/page.js deve chiamare stableShuffle,
salvo whitelist esplicita per componenti a posizione semantica intenzionale.

Check 2 (statistico): simula lo stableShuffle del runtime sui JSON A1
reali, verifica che la distribuzione della posizione della risposta
corretta post-shuffle non sia concentrata in pos 0 oltre il 45%.

Previene:
- Check 1 fallisce se aggiungi un componente nuovo senza shuffle
- Check 2 fallisce se lo shuffle gira ma con seed degenere
"""
import json
import re
import sys
from glob import glob
from pathlib import Path

# ───────── Configurazione ─────────

COMPONENTS_FILE = "app/lesson/[livello]/[unita]/[lezione]/page.js"

WHITELIST = {
    "DomandaVeroFalso":      "binaria 2-opzioni, posizione semantica (Vero sx / Falso dx)",
    "DomandaGiustoONo":      "binaria 2-opzioni, posizione semantica (Giusto sx / Sbagliato dx)",
    "DomandaAscoltoGiudica": "True/False su singolo stimolo (selected è boolean, non indice)",
}

NO_OPTIONS = {
    "DomandaWordBank": "word bank, ordine parole intenzionale",
    "DomandaAbbina":   "match pairs, gestione separata",
    "DomandaDialogo":  "dialogo multi-turn, non MCQ",
    "DomandaRouter":   "dispatcher, non renderizza opzioni",
}

# Seed derivation per tipo — REPLICA ESATTA di page.js post-fix 8eee43b
SEED_FIELD_BY_TIPO = {
    "tap_right":         lambda q: q.get("domanda", {}).get("it", "") or q.get("contesto_it", ""),
    "fill_blank":        lambda q: q.get("frase_it", ""),
    "completa_risposta": lambda q: q.get("risposta_it", "") or q.get("domanda", {}).get("it", ""),
    "ascolta_ripeti":    lambda q: q.get("audio_it", "") or q.get("domanda", {}).get("it", ""),
    "multipla":          lambda q: q.get("domanda", {}).get("it", "") or q.get("contesto_it", ""),
    "ascolta_scegli":    lambda q: q.get("domanda", {}).get("it", "") or q.get("contesto_it", ""),
}

POS_0_THRESHOLD = 0.45
MIN_SAMPLE_SIZE = 50

# ───────── Simulazione shuffle ─────────

def stable_shuffle(options, seed):
    """Replica ESATTA dello stableShuffle di page.js. LCG Numerical Recipes."""
    arr = [{"i": i, "o": o} for i, o in enumerate(options)]
    s = seed
    for i in range(len(arr) - 1, 0, -1):
        s = (s * 1664525 + 1013904223) & 0x7fffffff
        j = s % (i + 1)
        arr[i], arr[j] = arr[j], arr[i]
    return arr

def seed_from(text):
    return sum(ord(c) for c in (text or ""))

# ───────── Check 1: sintattico ─────────

def check_syntactic():
    """Scansiona il file componenti, enforca presenza stableShuffle."""
    print("=== Check 1: sintattico ===")

    source = Path(COMPONENTS_FILE).read_text(encoding="utf-8")

    # Estrai tutti i function DomandaXxx(...) e il loro body (fino alla prossima function o fine)
    pattern = re.compile(r'function\s+(Domanda\w+)\s*\(', re.M)
    matches = list(pattern.finditer(source))

    components = []
    for i, m in enumerate(matches):
        name = m.group(1)
        start = m.start()
        end = matches[i+1].start() if i+1 < len(matches) else len(source)
        body = source[start:end]
        components.append((name, body))

    passed, skipped, failed = 0, 0, 0

    for name, body in components:
        if name in WHITELIST:
            print(f"  ⏭  {name} — whitelisted: {WHITELIST[name]}")
            skipped += 1
            continue
        if name in NO_OPTIONS:
            print(f"  —  {name} — no options: {NO_OPTIONS[name]}")
            skipped += 1
            continue

        iterates_options = bool(re.search(r'(shuffled|shuffledOpts|q\.opzioni)\s*\.map\s*\(', body))
        calls_shuffle = 'stableShuffle(' in body

        if iterates_options and calls_shuffle:
            print(f"  ✓  {name} — shuffle presente")
            passed += 1
        elif iterates_options and not calls_shuffle:
            print(f"  ✗  {name} — ITERA OPZIONI MA NO stableShuffle")
            failed += 1
        elif not iterates_options:
            print(f"  ?  {name} — non classificato: non itera opzioni né è in liste note")
            print(f"     → aggiungere a WHITELIST, NO_OPTIONS, o garantire shuffle")
            failed += 1

    print(f"\n  Totale: {passed} pass, {skipped} skipped, {failed} failed\n")
    return failed == 0

# ───────── Check 2: statistico ─────────

def check_statistical():
    """Simula shuffle su tutto A1, verifica distribuzione posizione corretta."""
    print("=== Check 2: statistico ===")

    files = sorted(glob("public/data/lessons/a1/**/*.json", recursive=True))
    print(f"  Files scansionati: {len(files)}")

    distribution = [0] * 8  # pos 0..7
    total = 0
    skipped_no_opts = 0

    for path in files:
        try:
            data = json.load(open(path, encoding="utf-8"))
        except Exception as e:
            print(f"  ⚠ Errore lettura {path}: {e}")
            continue

        questions = data.get("questions") or data.get("domande") or []

        for q in questions:
            tipo = q.get("tipo")
            opzioni = q.get("opzioni")
            correct = q.get("correct")

            if tipo not in SEED_FIELD_BY_TIPO:
                continue
            if not opzioni or correct is None:
                skipped_no_opts += 1
                continue

            seed = seed_from(SEED_FIELD_BY_TIPO[tipo](q))
            shuffled = stable_shuffle(opzioni, seed)
            new_pos = next(i for i, x in enumerate(shuffled) if x["i"] == correct)

            if new_pos < len(distribution):
                distribution[new_pos] += 1
                total += 1

    print(f"  Domande shuffle-eligible: {total}")
    print(f"  (skip per mancanza opzioni/correct: {skipped_no_opts})")

    if total < MIN_SAMPLE_SIZE:
        print(f"\n  ✗ CAMPIONE INSUFFICIENTE ({total} < {MIN_SAMPLE_SIZE}) — verificare glob o shape JSON")
        return False

    print(f"\n  Distribuzione posizione corretta post-shuffle:")
    for i, count in enumerate(distribution):
        if count:
            pct = 100 * count / total
            bar = "█" * int(pct / 2)
            print(f"    Pos {i}: {count:3d} ({pct:5.1f}%)  {bar}")

    pos0_ratio = distribution[0] / total
    threshold_pct = POS_0_THRESHOLD * 100

    if pos0_ratio > POS_0_THRESHOLD:
        print(f"\n  ✗ BIAS: pos 0 = {pos0_ratio*100:.1f}% > soglia {threshold_pct:.0f}%")
        return False

    print(f"\n  ✓ pos 0 = {pos0_ratio*100:.1f}% ≤ soglia {threshold_pct:.0f}%")
    return True

# ───────── Main ─────────

if __name__ == "__main__":
    syntactic_ok = check_syntactic()
    statistical_ok = check_statistical()

    print("\n=== RIEPILOGO ===")
    print(f"  Sintattico: {'PASS' if syntactic_ok else 'FAIL'}")
    print(f"  Statistico: {'PASS' if statistical_ok else 'FAIL'}")

    overall = syntactic_ok and statistical_ok
    print(f"  Esito: {'PASS' if overall else 'FAIL'}")
    sys.exit(0 if overall else 1)
