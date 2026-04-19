#!/usr/bin/env python3
"""
Pre-commit validator per Italiano con Stile
Controlla coerenza JSON lezioni prima di ogni commit
"""
import json, glob, sys, os, re

errors = []
warnings = []

def err(msg): errors.append(f"❌ {msg}")
def warn(msg): warnings.append(f"⚠️  {msg}")

# ── 1. Vocabolario per unità ──────────────────────────────────────────────
all_vocab = {}
for f in sorted(glob.glob('public/data/lessons/A1/unit*/lesson[12345].json')):
    unit = f.split('/')[-2]
    data = json.load(open(f, encoding='utf-8'))
    if unit not in all_vocab:
        all_vocab[unit] = set()
    for v in data.get('vocab', []):
        all_vocab[unit].add(v['it'].lower().strip('.,!? '))
    for q in data.get('questions', []):
        for o in q.get('opzioni', []):
            it = o.get('it','').lower().strip('.,!? ')
            if it: all_vocab[unit].add(it)

stopwords = {'il','la','lo','le','gli','i','un','una','di','da','in','a','e','o','ma',
             'che','per','con','su','non','mi','ti','si','ci','vi','li','ne','è','sono',
             'ho','ha','hai','hanno','sei','siete','del','della','dello','dei','delle',
             'al','alla','allo','ai','alle','nel','nella','nelle','nei'}

# ── 2. Valida ogni file JSON ──────────────────────────────────────────────
for f in sorted(glob.glob('public/data/lessons/A1/unit*/lesson*.json') +
                glob.glob('public/data/lessons/A1/unit*/boss.json')):
    unit = f.split('/')[-2]
    label = '/'.join(f.split('/')[-2:])
    
    try:
        data = json.load(open(f, encoding='utf-8'))
    except json.JSONDecodeError as e:
        err(f"{label}: JSON non valido — {e}")
        continue

    known = all_vocab.get(unit, set())

    for q in data.get('questions', []):
        qid = q.get('id', '?')
        tipo = q.get('tipo', '')
        ref = f"{label} {qid}"

        # ── Check 1: correct=0 sempre nel JSON ───────────────────────────
        if tipo in ('multipla','tap_right','ascolta_scegli','fill_blank'):
            if q.get('correct', 0) != 0:
                err(f"{ref}: correct={q['correct']} — deve essere sempre 0 nel JSON (shuffle avviene a runtime)")

        # ── Check 2: feedback non vuoto e non generico ────────────────────
        for fb_key in ('feedbackOk', 'feedbackErr'):
            fb = q.get(fb_key, {})
            it = fb.get('it', '')
            en = fb.get('en', '')
            if tipo in ('multipla','tap_right','ascolta_scegli') and not it:
                err(f"{ref}: {fb_key}.it mancante")
            if it and len(it) < 10:
                warn(f"{ref}: {fb_key}.it troppo corto ({len(it)} chars): '{it}'")
            if it in ('Riprova!', 'Quasi!', 'Sbagliato!', 'Wrong!', 'Try again!'):
                err(f"{ref}: {fb_key}.it generico inutile: '{it}'")
            # Emoji nei campi EN — vietate
            if en:
                if re.search(r'[\U0001F000-\U0001FFFF\U00002600-\U000027FF]', en):
                    err(f"{ref}: {fb_key}.en contiene emoji — vietate nei campi EN")

        # ── Check 3: opzioni non vuote ────────────────────────────────────
        opzioni = q.get('opzioni', [])
        if tipo in ('multipla','tap_right') and len(opzioni) < 2:
            err(f"{ref}: meno di 2 opzioni")

        # ── Check 4: boss — parole non insegnate ─────────────────────────
        if 'boss' in f:
            for o in opzioni:
                it = o.get('it','').lower().strip('.,!? ')
                words = it.split()
                for w in words:
                    w = w.strip('.,!?\'\"')
                    if len(w) > 3 and w not in stopwords and w not in known:
                        warn(f"{ref}: boss usa '{w}' non nel vocabolario dell'unità")

        # ── Check 5: Q7/Q8 produzione non devono essere traduzione ────────
        if qid in ('q7','q8') and tipo == 'tap_right':
            dom_it = q.get('domanda',{}).get('it','')
            if '= ?' in dom_it or 'significa?' in dom_it.lower():
                err(f"{ref}: Q7/Q8 è traduzione pura — deve essere situazione narrativa")

        # ── Check 6: emoji nei campi EN delle domande ─────────────────────
        for field in ('contesto_en', 'intro_en'):
            val = q.get(field, '')
            if val and re.search(r'[\U0001F000-\U0001FFFF\U00002600-\U000027FF]', val):
                err(f"{ref}: {field} contiene emoji — vietate nei campi EN")

        # ── Check 7: domanda bilingue presente ───────────────────────────
        if tipo in ('multipla','tap_right'):
            dom = q.get('domanda', {})
            if not dom.get('it') and not q.get('frase_it'):
                warn(f"{ref}: domanda.it mancante")
            if not dom.get('en') and not q.get('frase_en'):
                warn(f"{ref}: domanda.en mancante")

# ── Report ────────────────────────────────────────────────────────────────
print(f"\n{'='*55}")
print(f"VALIDATOR — Italiano con Stile")
print(f"{'='*55}")

if warnings:
    print(f"\n{len(warnings)} WARNING:")
    for w in warnings[:20]:
        print(f"  {w}")
    if len(warnings) > 20:
        print(f"  ... e altri {len(warnings)-20}")

if errors:
    print(f"\n{len(errors)} ERRORI BLOCCANTI:")
    for e in errors:
        print(f"  {e}")
    print(f"\n🚫 Commit bloccato — correggi gli errori prima di procedere")
    sys.exit(1)
else:
    print(f"\n✅ Tutti i check superati — {len(warnings)} warning non bloccanti")
    sys.exit(0)
