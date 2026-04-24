#!/usr/bin/env python3
"""
Pre-commit validator per Italiano con Stile
Controlla coerenza JSON lezioni prima di ogni commit
"""
import json, glob, sys, os, re, yaml
from pathlib import Path

errors = []
warnings = []

def err(msg): errors.append(f"❌ {msg}")
def warn(msg): warnings.append(f"⚠️  {msg}")

# ── Semantic taxonomy ────────────────────────────────────────────────────
def load_semantic_taxonomy(level="A1"):
    path = Path(f"data/taxonomy/semantic-coherence-{level}.yaml")
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)

def strict_category_check(question, taxonomy):
    """
    BLOCKING check per mismatch categoriale context↔answer.
    Fires SOLO quando entrambe le classificazioni sono forti
    (exact match su trigger_patterns / members / member_patterns)
    E i due tipi risultano incompatibili per la taxonomy.

    Zero falsi positivi sui needs_review (content narrativo senza
    trigger match skippato silenziosamente).
    """
    context_text = (
        question.get("context", "") + " " + question.get("prompt", "")
    ).lower()

    # 1. Strong match sul context_type
    matched_ctx = None
    for ctx_name, ctx_def in taxonomy["context_types"].items():
        for pat in ctx_def.get("trigger_patterns", []):
            if re.search(pat.lower(), context_text):
                matched_ctx = ctx_name
                break
        if matched_ctx:
            break

    if not matched_ctx:
        return None  # no strong context → skip

    # 2. Strong match sull'answer_type di options[0]
    opts = question.get("options", [])
    if not opts:
        return None
    opt0 = opts[0]
    opt0_clean = opt0.rstrip("!.?").strip()

    matched_ans = None
    for ans_name, ans_def in taxonomy["answer_types"].items():
        members = ans_def.get("members", [])
        if opt0_clean in members or opt0 in members:
            matched_ans = ans_name
            break
        for pat in ans_def.get("member_patterns", []):
            if re.match(pat, opt0):
                matched_ans = ans_name
                break
        if matched_ans:
            break

    if not matched_ans:
        return None  # no strong answer → skip

    # 3. Verifica compatibilità (con pedagogical_adjacency)
    allowed = taxonomy["context_types"][matched_ctx].get(
        "allowed_answer_types", []
    )
    if matched_ans in allowed:
        return None

    # Check pedagogical adjacency: if matched_ans is adjacent to any allowed type
    for at in allowed:
        adj = taxonomy["answer_types"].get(at, {}).get("pedagogical_adjacency", [])
        if matched_ans in adj:
            return None
    # Check reverse adjacency
    own_adj = taxonomy["answer_types"].get(matched_ans, {}).get("pedagogical_adjacency", [])
    for at in allowed:
        if at in own_adj:
            return None

    return {
        "severity": "BLOCKING",
        "rule": "strict_category_match",
        "context_type": matched_ctx,
        "answer_type_found": matched_ans,
        "allowed": allowed,
        "context": question.get("context", "")[:80],
        "option_0": opt0,
    }

# Carica taxonomy per i check semantici
try:
    _taxonomy = load_semantic_taxonomy("A1")
except Exception:
    _taxonomy = None


# ── v2 shape validators ─────────────────────────────────────────────────
# Emoji decorative in campi EN: stessa regex del check 6 legacy,
# ma esclude ❌ (U+274C) e ✅ (U+2705) che sono strutturali.
_EMOJI_FULL = re.compile(r'[\U0001F000-\U0001FFFF\U00002600-\U000027FF]')

def _has_decorative_emoji_en(text):
    """True if text contains emoji other than structural ❌/✅."""
    if not text:
        return False
    for m in _EMOJI_FULL.finditer(text):
        ch = m.group()
        if ch not in ('\u274c', '\u2705'):  # ❌, ✅
            return True
    return False


def _check_bilingual(obj, field_name, ref):
    """Check that obj has non-empty .it and .en strings. Returns list of errors."""
    errs = []
    if not isinstance(obj, dict):
        return [f"{ref}: {field_name} deve essere un oggetto con it/en"]
    if not obj.get("it"):
        errs.append(f"{ref}: {field_name}.it mancante o vuoto")
    if not obj.get("en"):
        errs.append(f"{ref}: {field_name}.en mancante o vuoto")
    return errs


def _check_en_no_decorative_emoji(text, field_name, ref):
    """Check EN text has no decorative emoji (❌/✅ structural allowed)."""
    if _has_decorative_emoji_en(text):
        return [f"{ref}: {field_name} contiene emoji decorative in campo EN"]
    return []


def validate_v2_decision(data, ref):
    """Validate the 'data' field of a v2 decision activity."""
    errs = []
    if not isinstance(data, dict):
        return [f"{ref}: data deve essere un oggetto"]

    # scenario + prompt bilingui
    errs += _check_bilingual(data.get("scenario", {}), "scenario", ref)
    errs += _check_bilingual(data.get("prompt", {}), "prompt", ref)

    # branches
    branches = data.get("branches", [])
    if not isinstance(branches, list) or len(branches) not in (2, 3):
        errs.append(f"{ref}: branches.length deve essere 2 o 3 (trovato {len(branches) if isinstance(branches, list) else 'non-array'})")
    else:
        for i, b in enumerate(branches):
            bref = f"{ref} branch[{i}]"
            action = b.get("action", {})
            errs += _check_bilingual(action, f"action", bref)
            # action.emoji opzionale (null ammesso) — no check
            outcome = b.get("outcome", {})
            errs += _check_bilingual(outcome, f"outcome", bref)
            # outcome.en: no decorative emoji
            errs += _check_en_no_decorative_emoji(
                outcome.get("en", ""), "outcome.en", bref
            )

    # correct_branch_index
    if data.get("correct_branch_index") != 0:
        errs.append(f"{ref}: correct_branch_index deve essere 0 (trovato {data.get('correct_branch_index')})")

    # context_type + expected_answer_type vs taxonomy
    ctx_type = data.get("context_type")
    eat = data.get("expected_answer_type")
    if not ctx_type:
        errs.append(f"{ref}: context_type mancante")
    elif _taxonomy:
        known_ctx = _taxonomy.get("context_types", {})
        if ctx_type not in known_ctx:
            errs.append(f"{ref}: context_type '{ctx_type}' non presente nella taxonomy")
        else:
            allowed = known_ctx[ctx_type].get("allowed_answer_types", [])
            if eat and eat not in allowed:
                errs.append(f"{ref}: expected_answer_type '{eat}' non in allowed_answer_types di '{ctx_type}' ({allowed})")
    if not eat:
        errs.append(f"{ref}: expected_answer_type mancante")

    return errs


def validate_v2_why(data, ref):
    """Validate the 'data' field of a v2 why activity."""
    errs = []
    if not isinstance(data, dict):
        return [f"{ref}: data deve essere un oggetto"]

    # pattern_examples: esattamente 2 gruppi
    pe = data.get("pattern_examples", [])
    if not isinstance(pe, list) or len(pe) != 2:
        errs.append(f"{ref}: pattern_examples.length deve essere 2 (trovato {len(pe) if isinstance(pe, list) else 'non-array'})")
    else:
        for gi, group in enumerate(pe):
            gref = f"{ref} group[{gi}]"
            # group_label: bilingue opzionale (null ammesso)
            gl = group.get("group_label")
            if gl is not None:
                errs += _check_bilingual(gl, "group_label", gref)
            # items: 2-4 con it/en
            items = group.get("items", [])
            if not isinstance(items, list) or len(items) < 2 or len(items) > 4:
                errs.append(f"{gref}: items.length deve essere 2-4 (trovato {len(items) if isinstance(items, list) else 'non-array'})")
            else:
                for ii, item in enumerate(items):
                    errs += _check_bilingual(item, f"items[{ii}]", gref)

    # prompt bilingue
    errs += _check_bilingual(data.get("prompt", {}), "prompt", ref)

    # hypotheses: 2 o 3
    hyps = data.get("hypotheses", [])
    if not isinstance(hyps, list) or len(hyps) not in (2, 3):
        errs.append(f"{ref}: hypotheses.length deve essere 2 o 3 (trovato {len(hyps) if isinstance(hyps, list) else 'non-array'})")
    else:
        for hi, h in enumerate(hyps):
            href = f"{ref} hypothesis[{hi}]"
            errs += _check_bilingual(h.get("text", {}), "text", href)
            if hi == 0:
                # correct hypothesis: nudge MUST be null
                if h.get("nudge") is not None:
                    errs.append(f"{href}: nudge deve essere null per l'ipotesi corretta (index 0)")
            else:
                # wrong hypothesis: nudge must be bilingue non vuoto
                nudge = h.get("nudge")
                if nudge is None:
                    errs.append(f"{href}: nudge mancante per ipotesi sbagliata (index {hi})")
                else:
                    errs += _check_bilingual(nudge, "nudge", href)

    # correct_hypothesis_index
    if data.get("correct_hypothesis_index") != 0:
        errs.append(f"{ref}: correct_hypothesis_index deve essere 0 (trovato {data.get('correct_hypothesis_index')})")

    # rule_reveal + english_analogy bilingui
    errs += _check_bilingual(data.get("rule_reveal", {}), "rule_reveal", ref)
    errs += _check_bilingual(data.get("english_analogy", {}), "english_analogy", ref)

    return errs


def validate_v2_dialogue(data, ref):
    """Validate the 'data' field of a v2 dialogue activity."""
    errs = []
    if not isinstance(data, dict):
        return [f"{ref}: data deve essere un oggetto"]

    # scenario_intro bilingue
    errs += _check_bilingual(data.get("scenario_intro", {}), "scenario_intro", ref)

    # turns
    turns = data.get("turns", [])
    if not isinstance(turns, list) or len(turns) < 2 or len(turns) > 7:
        errs.append(f"{ref}: turns.length deve essere 2-7 (trovato {len(turns) if isinstance(turns, list) else 'non-array'})")
        return errs  # can't validate further

    user_count = 0
    consec_char = 0
    max_consec_char = 0

    for ti, turn in enumerate(turns):
        tref = f"{ref} turn[{ti}]"
        speaker = turn.get("speaker")

        if speaker == "character":
            consec_char += 1
            max_consec_char = max(max_consec_char, consec_char)
            # character_id non vuoto
            if not turn.get("character_id"):
                errs.append(f"{tref}: character_id mancante o vuoto")
            # text bilingue
            errs += _check_bilingual(turn.get("text", {}), "text", tref)

        elif speaker == "user":
            consec_char = 0
            user_count += 1
            # prompt bilingue
            errs += _check_bilingual(turn.get("prompt", {}), "prompt", tref)
            # options: 2 o 3
            opts = turn.get("options", [])
            if not isinstance(opts, list) or len(opts) not in (2, 3):
                errs.append(f"{tref}: options.length deve essere 2 o 3 (trovato {len(opts) if isinstance(opts, list) else 'non-array'})")
            else:
                for oi, opt in enumerate(opts):
                    errs += _check_bilingual(opt, f"options[{oi}]", tref)
            # correct_index
            if turn.get("correct_index") != 0:
                errs.append(f"{tref}: correct_index deve essere 0 (trovato {turn.get('correct_index')})")
            # feedback_wrong bilingue
            fw = turn.get("feedback_wrong", {})
            errs += _check_bilingual(fw, "feedback_wrong", tref)
            errs += _check_en_no_decorative_emoji(
                fw.get("en", ""), "feedback_wrong.en", tref
            )
        else:
            consec_char = 0
            errs.append(f"{tref}: speaker deve essere 'character' o 'user' (trovato '{speaker}')")

    # user turn count: 1-3
    if user_count < 1:
        errs.append(f"{ref}: almeno 1 turno user richiesto (trovato {user_count})")
    if user_count > 3:
        errs.append(f"{ref}: massimo 3 turni user (trovato {user_count})")
    # max consecutive character turns: <=3
    if max_consec_char > 3:
        errs.append(f"{ref}: massimo 3 turni character consecutivi (trovato {max_consec_char})")

    return errs


def validate_v2_activity(activity, ref):
    """Dispatch v2 activity validation by type."""
    atype = activity.get("type", "")
    data = activity.get("data", {})
    aref = f"{ref} [{activity.get('activity_id', atype)}]"

    if atype == "decision":
        return validate_v2_decision(data, aref)
    elif atype == "why":
        return validate_v2_why(data, aref)
    elif atype == "dialogue":
        return validate_v2_dialogue(data, aref)
    else:
        # match/mcq/listen/build/fill — placeholder, future sessions
        return []


def main():
    global errors, warnings
    errors = []
    warnings = []

    # ── 1. Vocabolario per unità ──────────────────────────────────────────────
    all_vocab = {}
    for f in sorted(glob.glob('public/data/lessons/a1/unit*/lesson[12345].json')):
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
    for f in sorted(glob.glob('public/data/lessons/a1/unit*/lesson*.json') +
                    glob.glob('public/data/lessons/a1/unit*/boss.json')):
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

            # ── Check 8: coerenza semantica context↔answer (BLOCKING) ────
            if _taxonomy and tipo in ('multipla', 'tap_right', 'ascolta_scegli'):
                ctx = q.get('contesto_it', '') + ' ' + q.get('frase_it', '')
                prm = q.get('domanda', {}).get('it', '') if isinstance(q.get('domanda'), dict) else ''
                opt_texts = [o.get('it', '') if isinstance(o, dict) else str(o) for o in opzioni]
                sc_question = {"context": ctx.strip(), "prompt": prm, "options": opt_texts}
                sc_result = strict_category_check(sc_question, _taxonomy)
                if sc_result and sc_result["severity"] == "BLOCKING":
                    err(f"{ref}: MISMATCH semantico — context={sc_result['context_type']}, "
                        f"options[0]={sc_result['option_0']} ({sc_result['answer_type_found']}), "
                        f"allowed={sc_result['allowed']}")

    # ── 3. Valida contenuto v2 ──────────────────────────────────────────────
    # 3a. Lesson files — activity shape checks (existing) + field checks (new)
    v2_lessons = sorted(glob.glob('public/data/lessons/*/theme*-*/unit*/lesson*.json'))
    for f in v2_lessons:
        label = '/'.join(f.split('/')[-4:])
        try:
            data = json.load(open(f, encoding='utf-8'))
        except json.JSONDecodeError as e:
            err(f"v2 {label}: JSON non valido — {e}")
            continue
        if data.get('$schema') != 'v2':
            continue
        # Existing activity shape checks (decision/why/dialogue)
        for act in data.get('activities', []):
            act_errs = validate_v2_activity(act, f"v2 {label}")
            for e in act_errs:
                err(e)
            # C-V6: character_layout_override if present must be string in enum or null
            clo = act.get('character_layout_override')
            if clo is not None and clo != "compact_corner":
                warn(f"v2 {label} [{act.get('activity_id','')}]: character_layout_override='{clo}' — deve essere 'compact_corner' o null")
        # C-V5: cultural_insights at lesson level — optional, len ≤ 1
        ci = data.get('cultural_insights')
        if ci is not None:
            if not isinstance(ci, list):
                warn(f"v2 {label}: cultural_insights deve essere lista")
            elif len(ci) > 1:
                warn(f"v2 {label}: cultural_insights.length={len(ci)} > 1")
            else:
                for idx, item in enumerate(ci):
                    if not isinstance(item, dict):
                        warn(f"v2 {label}: cultural_insights[{idx}] non è dict")
                    elif not all(item.get(k) for k in ('id', 'title', 'body')):
                        warn(f"v2 {label}: cultural_insights[{idx}] manca id/title/body")

    # 3b. Theme-meta files
    v2_themes = sorted(glob.glob('public/data/lessons/*/theme*-*/theme-meta.json'))
    for f in v2_themes:
        label = '/'.join(f.split('/')[-3:])
        try:
            data = json.load(open(f, encoding='utf-8'))
        except json.JSONDecodeError as e:
            err(f"v2 {label}: JSON non valido — {e}")
            continue
        if data.get('$schema') != 'v2':
            continue
        # C-V1: anglo_traps — list of dicts with id, trap, tip
        at = data.get('anglo_traps')
        if at is not None:
            if not isinstance(at, list):
                warn(f"v2 {label}: anglo_traps deve essere lista")
            else:
                for idx, item in enumerate(at):
                    if not isinstance(item, dict):
                        warn(f"v2 {label}: anglo_traps[{idx}] non è dict")
                    elif not all(item.get(k) for k in ('id', 'trap', 'tip')):
                        warn(f"v2 {label}: anglo_traps[{idx}] manca id/trap/tip")
        # C-V2: cultural_insights — list of dicts with id, title, body
        ci = data.get('cultural_insights')
        if ci is not None:
            if not isinstance(ci, list):
                warn(f"v2 {label}: cultural_insights deve essere lista")
            else:
                for idx, item in enumerate(ci):
                    if not isinstance(item, dict):
                        warn(f"v2 {label}: cultural_insights[{idx}] non è dict")
                    elif not all(item.get(k) for k in ('id', 'title', 'body')):
                        warn(f"v2 {label}: cultural_insights[{idx}] manca id/title/body")

    # 3c. Unit-meta files
    v2_units = sorted(glob.glob('public/data/lessons/*/theme*-*/unit*/unit-meta.json'))
    for f in v2_units:
        label = '/'.join(f.split('/')[-4:])
        try:
            data = json.load(open(f, encoding='utf-8'))
        except json.JSONDecodeError as e:
            err(f"v2 {label}: JSON non valido — {e}")
            continue
        if data.get('$schema') != 'v2':
            continue
        # C-V3: cultural_insights — same as C-V2
        ci = data.get('cultural_insights')
        if ci is not None:
            if not isinstance(ci, list):
                warn(f"v2 {label}: cultural_insights deve essere lista")
            else:
                for idx, item in enumerate(ci):
                    if not isinstance(item, dict):
                        warn(f"v2 {label}: cultural_insights[{idx}] non è dict")
                    elif not all(item.get(k) for k in ('id', 'title', 'body')):
                        warn(f"v2 {label}: cultural_insights[{idx}] manca id/title/body")
        # C-V4: context_override if present must be dict
        co = data.get('context_override')
        if co is not None and not isinstance(co, dict):
            warn(f"v2 {label}: context_override deve essere dict")

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


if __name__ == "__main__":
    main()
