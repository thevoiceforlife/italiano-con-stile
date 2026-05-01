# Schema Lezione v2 — Italiano con Stile

**Status**: P1 + P2 deliverable — v2 checks bloccanti
**Data**: 20 Aprile 2026 · esteso 24 Aprile 2026 (P2.b)
**Fonte di decisione**: `docs/decisioni-architettura-v2.md` · `docs/P2-roadmap.md`
**Commit base di riferimento**: `6027f42`

---

## Scopo di questo documento

Questo è il **contratto strutturale** per tutto il contenuto scritto sotto la matrice v2
(50 temi × 5 unità × 6 lezioni × 8 attività + 1 sfida per unità).

Serve a:

- Claude Code e gli agenti di generazione contenuto per produrre JSON conformi
- Il validator pre-commit (`scripts/validate-lessons.py`) per enforzare le regole strutturali
- L'editor umano per scrivere/rivedere contenuto senza doversi inventare convenzioni
- Il loader Next.js per sapere cosa aspettarsi dai file letti

Questo documento **non copre**:

- Il design UX delle 3 attività nuove (`decision`, `why`, `dialogue`) — responsabilità di P2.c/P2.e
- Il contenuto delle lezioni (copy, vocab specifici per tema) — responsabilità di S4 e successive
- La migrazione del contenuto A1 esistente — decisione separata
- L'implementazione dei componenti React per le attività nuove — il contratto dati è qui, il codice segue in fase separata
- Il contenuto testuale delle pillole culturali e delle trappole anglofono — responsabilità di P2.f

---

## Indice

1. [Gerarchia file](#1-gerarchia-file)
2. [Convenzione ID](#2-convenzione-id)
3. [Enum globali](#3-enum-globali)
4. [Schema `theme-meta.json`](#4-schema-theme-metajson)
5. [Schema `unit-meta.json`](#5-schema-unit-metajson)
6. [Schema `lesson.json`](#6-schema-lessonjson)
7. [Blocco attività — campi comuni](#7-blocco-attivit-campi-comuni)
8. [Shape `data` per le 8 attività](#8-shape-data-per-le-8-attivit)
9. [Schema `challenge.json`](#9-schema-challengejson)
10. [Reward a 3 livelli](#10-reward-a-3-livelli)
11. [Mapping 13 componenti → 8 activity_type](#11-mapping-13-componenti--8-activity_type)
12. [Esempio canonico compilato](#12-esempio-canonico-compilato)
13. [Checklist validator](#13-checklist-validator)
14. [Estensioni future possibili](#14-estensioni-future-possibili)
15. [Riferimenti P2](#15-riferimenti-p2)

---

## 1. Gerarchia file

Ogni tema vive in una cartella dedicata. Ogni unità ha 8 file: 1 meta + 6 lezioni + 1 sfida.

```
data/lessons/{level}/theme{NN}-{slug}/
├── theme-meta.json                    ← metadati tema, personaggi, distribution_version
├── unit1/
│   ├── unit-meta.json                 ← vocab 6 parole, reward unità
│   ├── lesson1.json                   ← format=onboarding
│   ├── lesson2.json                   ← format=memory_build
│   ├── lesson3.json                   ← format=story
│   ├── lesson4.json                   ← format=simulation
│   ├── lesson5.json                   ← format=why_focus
│   ├── lesson6.json                   ← format=challenge_prep
│   └── challenge.json                 ← sfida U1
├── unit2/
├── unit3/
├── unit4/
└── unit5/
```

Il vocabolario vive **solo** in `unit-meta.json` (single source of truth). Le lezioni lo referenziano via `vocab_ref` — mai duplicato.

I file vivono **anche** in `public/data/lessons/...` per essere serviti dal browser. Claude Code gestisce la doppia copia.

---

## 2. Convenzione ID

Tutti gli ID sono leggibili, ordinabili alfabeticamente, senza ambiguità cross-tema.

| Entità | Pattern | Esempio |
|---|---|---|
| Tema | `{level}_t{NN}_{slug}` | `a1_t01_saluti` |
| Unità | `{level}_t{NN}_u{N}` | `a1_t01_u1` |
| Lezione | `{level}_t{NN}_u{N}_l{N}` | `a1_t01_u1_l1` |
| Sfida | `{level}_t{NN}_u{N}_challenge` | `a1_t01_u1_challenge` |
| Vocab | `{level}_t{NN}_u{N}_{slug}` | `a1_t01_u1_ciao` |
| Attività | `{lesson_id}_a{N}` | `a1_t01_u1_l1_a1` |

**Regole:**

- Il level è sempre lowercase (`a1` non `A1`).
- Il theme number è sempre 2 cifre (`t01` non `t1`).
- Lo slug è lowercase con underscore (`per_favore` non `perFavore`).
- Il vocab_id include l'unità di introduzione — una parola introdotta in U1 resta `a1_t01_u1_ciao` anche quando viene riusata in U3.

---

## 3. Enum globali

Tutti gli enum qui sotto sono vincoli di validazione. Valori fuori enum = errore bloccante.

```typescript
type Level = "a1" | "a2" | "b1" | "b2" | "c1" | "c2"

type DistributionVersion = "soft" | "standard" | "advanced"
// soft     → temi 1-10
// standard → temi 11-30
// advanced → temi 31-50

type UnitFocus =
  | "vocab_intro"        // U1
  | "sentence_build"     // U2
  | "context_use"        // U3
  | "simulation"         // U4
  | "consolidation_why"  // U5

type LessonFormat =
  | "onboarding"       // L1
  | "memory_build"     // L2
  | "story"            // L3
  | "simulation"       // L4
  | "why_focus"        // L5
  | "challenge_prep"   // L6

type ActivityType =
  | "match"      // abbina IT↔EN — componente: VocabMatch/DomandaAbbina
  | "mcq"        // scelta multipla — componente: DomandaMultipla (+ mode:binary)
  | "listen"     // ascolta e scegli/giudica — componente: DomandaAscolta (+ mode:judge)
  | "build"      // word bank componi frase — componente: DomandaWordBank
  | "fill"       // fill blank con EN completa — componente: DomandaFillBlank
  | "decision"   // scelta narrativa — componente: da ridisegnare in P2
  | "why"        // pattern/regola interattiva — componente: NUOVO, P2
  | "dialogue"   // conversazione multi-turn — componente: da potenziare P2

type CharacterRole =
  | "protagonist"      // Mario (sempre, tutta U1)
  | "co_protagonist"   // uno per unità U2-U5
  | "final_boss"       // Mario nella sfida U5

type Register = "formal" | "informal" | "neutral"  // opzionale nel vocab

type RewardKind = "ingredient" | "dish" | "experience"

type IngredientSlot =
  | "colazione"
  | "fine_colazione"
  | "pranzo"
  | "aperitivo"
  | "cena"
  | "dolce"
```

**Mapping fisso format ↔ lezione**: `l1→onboarding`, `l2→memory_build`, `l3→story`, `l4→simulation`, `l5→why_focus`, `l6→challenge_prep`. Il validator enforca.

---

## 4. Schema `theme-meta.json`

Definisce il tema, i 5 personaggi coinvolti e la reward finale del tema.

```json
{
  "$schema": "v2",
  "theme_id": "a1_t01_saluti",
  "theme_number": 1,
  "level": "a1",
  "slug": "saluti",
  "title": {
    "it": "Saluti e presentazioni",
    "en": "Greetings and introductions"
  },
  "description": {
    "it": "Impara a salutare, presentarti e riconoscere i registri formali e informali.",
    "en": "Learn to greet, introduce yourself, and recognize formal vs informal register."
  },
  "distribution_version": "soft",
  "context": {
    "emoji": "☕",
    "place": { "it": "Al Bar di Mario", "en": "Mario's Bar" },
    "city":  { "it": "Napoli",          "en": "Naples" },
    "time":  { "it": "mattina",         "en": "morning" }
  },
  "anglo_traps": [
    {
      "id": "good_morning_vs_buongiorno",
      "trap": { "en": "Good morning works only until ~12:00-13:00 in Italy" },
      "tip": {
        "it": "Dopo pranzo è già Buon pomeriggio o Buonasera",
        "en": "After lunch, it's already Buon pomeriggio or Buonasera"
      },
      "trigger_contexts": ["saluto_contestuale"]
    }
  ],
  "characters": [
    {
      "id": "mario",
      "role": "protagonist",
      "unit_lead": [1, 2, 3, 4, 5],
      "teaser_in_challenge": null,
      "activity_restriction": null
    },
    {
      "id": "sofia",
      "role": "co_protagonist",
      "unit_lead": [2],
      "teaser_in_challenge": "u1",
      "activity_restriction": ["listen", "build", "fill", "decision", "why", "dialogue"]
    },
    {
      "id": "emma",
      "role": "co_protagonist",
      "unit_lead": [3],
      "teaser_in_challenge": "u2",
      "activity_restriction": ["listen", "build", "fill", "decision", "why", "dialogue"]
    },
    {
      "id": "hans",
      "role": "co_protagonist",
      "unit_lead": [4],
      "teaser_in_challenge": "u3",
      "activity_restriction": ["listen", "build", "fill", "decision", "why", "dialogue"]
    },
    {
      "id": "yuki",
      "role": "co_protagonist",
      "unit_lead": [5],
      "teaser_in_challenge": "u4",
      "activity_restriction": ["listen", "build", "fill", "decision", "why", "dialogue"]
    },
    {
      "id": "mario",
      "role": "final_boss",
      "unit_lead": [],
      "teaser_in_challenge": "u5",
      "activity_restriction": null
    }
  ],
  "reward_theme_complete": {
    "kind": "experience",
    "id": "esperienza_caffe_napoletano",
    "label": {
      "it": "Esperienza: Caffè al bar di Mario",
      "en": "Experience: Coffee at Mario's bar"
    },
    "emoji": "☕",
    "credits": 50
  }
}
```

**Campi obbligatori**: tutti tranne `activity_restriction` (null per `protagonist` e `final_boss`) e `teaser_in_challenge` (null per `protagonist`).

**Regole enforced**:

- Esattamente 1 entry con `role: "protagonist"` (sempre `mario`).
- Esattamente 1 entry con `role: "final_boss"` (sempre `mario`).
- Esattamente 4 entries con `role: "co_protagonist"`.
- Il `teaser_in_challenge` del co-protagonist di U`N` è sempre `"u{N-1}"`.
- `activity_restriction` di un `co_protagonist` è sempre il complemento di `["match", "mcq"]` (regola "Mario conduce match+mcq ovunque").
- `distribution_version` deriva da `theme_number`: 1-10 soft, 11-30 standard, 31-50 advanced.

**Regole enforced (P2)**:

- `context.emoji`, `context.place.it/en`, `context.time.it/en` presenti e non vuoti.
- `context.city` nullable (es. T12 "Al telefono" non ha luogo fisico). Se presente, `city.it/en` entrambi non vuoti.
- `anglo_traps.length >= 1`.
- Ogni trap ha `id` snake_case unico entro il tema, `trap.en` non vuoto, `tip.it`+`tip.en` non vuoti.
- `trigger_contexts` di ogni trap è array non vuoto di `context_type` esistenti nella taxonomy (`data/taxonomy/semantic-coherence-A1.yaml`). Context non validi → warning.

---

## 5. Schema `unit-meta.json`

Definisce il vocabolario dell'unità (6 parole) e la reward di completamento.

```json
{
  "$schema": "v2",
  "unit_id": "a1_t01_u1",
  "unit_number": 1,
  "theme_id": "a1_t01_saluti",
  "focus": "vocab_intro",
  "title": {
    "it": "Primi saluti al bar",
    "en": "First greetings at the bar"
  },
  "vocabulary": [
    {
      "id": "a1_t01_u1_ciao",
      "it": "Ciao",
      "en": "Hi / Bye",
      "audio_text": "Ciao",
      "emoji": "👋",
      "introduced_in_lesson": 1,
      "register": "informal"
    },
    {
      "id": "a1_t01_u1_buongiorno",
      "it": "Buongiorno",
      "en": "Good morning",
      "audio_text": "Buongiorno",
      "emoji": "☀️",
      "introduced_in_lesson": 1,
      "register": "formal"
    },
    {
      "id": "a1_t01_u1_buonasera",
      "it": "Buonasera",
      "en": "Good evening",
      "audio_text": "Buonasera",
      "emoji": "🌆",
      "introduced_in_lesson": 1,
      "register": "formal"
    },
    {
      "id": "a1_t01_u1_arrivederci",
      "it": "Arrivederci",
      "en": "Goodbye",
      "audio_text": "Arrivederci",
      "emoji": "🚪",
      "introduced_in_lesson": 2,
      "register": "neutral"
    },
    {
      "id": "a1_t01_u1_grazie",
      "it": "Grazie",
      "en": "Thank you",
      "audio_text": "Grazie",
      "emoji": "🙏",
      "introduced_in_lesson": 2,
      "register": "neutral"
    },
    {
      "id": "a1_t01_u1_per_favore",
      "it": "Per favore",
      "en": "Please",
      "audio_text": "Per favore",
      "emoji": "🤲",
      "introduced_in_lesson": 2,
      "register": "neutral"
    }
  ],
  "inherited_vocab": [],
  "context_override": {
    "time": { "it": "mattina presto", "en": "early morning" }
  },
  "cultural_insights": [
    {
      "id": "per_favore_al_bar",
      "emoji": "☕",
      "title": {
        "it": "Al bar italiano, «per favore» crea cliente abituale.",
        "en": "At the Italian bar, «per favore» creates a regular."
      },
      "body": {
        "it": "Se entri e dici solo «Un caffè», il barista te lo fa. Se aggiungi «per favore», la seconda volta ti riconosce. In Italia la cortesia al bar non è formalità — è il modo in cui si diventa abituali.",
        "en": "If you walk in and just say «Un caffè», the barista makes it. If you add «per favore», the second time he recognizes you. In Italy, politeness at the bar isn't formality — it's how you become a regular."
      },
      "trigger_vocab_refs": ["a1_t01_u1_per_favore"],
      "trigger_contexts": []
    }
  ],
  "reward_unit_complete": {
    "kind": "dish",
    "id": "pizza_margherita",
    "label": {
      "it": "Pizza Margherita",
      "en": "Margherita pizza"
    },
    "emoji": "🍕",
    "credits": 20
  }
}
```

**Campi obbligatori**: `unit_id`, `unit_number`, `theme_id`, `focus`, `title`, `vocabulary`, `inherited_vocab`, `reward_unit_complete`, `cultural_insights` (P2 extension).

**Campi opzionali**: `register` nel singolo vocab, `context_override`.

**Regole enforced**:

- `vocabulary.length === 6`.
- `introduced_in_lesson ∈ {1, 2}` per ogni vocab.
- Esattamente 3 parole con `introduced_in_lesson: 1`, esattamente 3 con `introduced_in_lesson: 2`.
- Ogni `emoji` unica all'interno della stessa unità.
- Tutti i `vocab_id` seguono il pattern `{theme_id}_u{N}_{slug}`.
- `inherited_vocab` è array di `unit_id`: U1=`[]`, U2=`["a1_t01_u1"]`, ..., U5=`["a1_t01_u1", ..., "a1_t01_u4"]`.

**Regole enforced (P2)**:

- `context_override`, se presente, è subset di `{emoji, place, city, time}`. Nessun altro campo ammesso.
- Ogni campo presente in `context_override` rispetta la stessa shape del corrispondente in `theme-meta.context` (bilingue `{it, en}` per `place`/`city`/`time`, stringa per `emoji`).
- `cultural_insights.length >= 1`.
- Ogni insight ha `id` snake_case unico entro l'unità, `title.it`+`title.en` + `body.it`+`body.en` non vuoti.
- `emoji` opzionale sulla singola insight.
- Almeno uno tra `trigger_vocab_refs` e `trigger_contexts` non vuoto. Se entrambi vuoti → warning (insight senza trigger).
- Tutti i `trigger_vocab_refs` esistono in `vocabulary` o in `inherited_vocab`.
- Tutti i `trigger_contexts` esistono nella taxonomy.

---

## 6. Schema `lesson.json`

Una lezione = un guscio + 8 attività + reward.

```json
{
  "$schema": "v2",
  "lesson_id": "a1_t01_u1_l1",
  "lesson_number": 1,
  "unit_id": "a1_t01_u1",
  "theme_id": "a1_t01_saluti",
  "format": "onboarding",
  "title": {
    "it": "Mario apre il bar",
    "en": "Mario opens the bar"
  },
  "intro_narrative": {
    "character_id": "mario",
    "first_appearance": true,
    "text": {
      "it": "Ciao, sono Mario. Qui al mio bar a Napoli impari l'italiano con me.",
      "en": "Hi, I'm Mario. Here at my bar in Naples you learn Italian with me."
    }
  },
  "activities": [ /* esattamente 8 */ ],
  "cultural_insights": [],
  "reward_lesson_complete": {
    "kind": "ingredient",
    "slot": "colazione",
    "pool": [
      { "id": "caffe",      "it": "Caffè espresso",     "en": "Espresso",     "emoji": "☕" },
      { "id": "cappuccino", "it": "Cappuccino",         "en": "Cappuccino",   "emoji": "☕" },
      { "id": "spremuta",   "it": "Spremuta d'arancia", "en": "Orange juice", "emoji": "🍊" }
    ],
    "credits": 5
  }
}
```

**Campi obbligatori**: tutti tranne `intro_narrative`.

**`intro_narrative` è opzionale**: presente solo alla prima apparizione di un personaggio nella lezione (tipicamente L1 di ogni unità). `first_appearance: true` triggera animazione dedicata (figura intera, tricolore, ecc. — dettaglio UI in P2).

**Regole enforced**:

- `activities.length === 8`.
- `format` coerente con `lesson_number` (mapping fisso da enum).
- Distribuzione degli 8 `activity.type` coerente con la tabella della `distribution_version` del tema (vedi sotto).
- `why` e `dialogue` **non possono** comparire in L1.
- `why` non può comparire in L2.
- `reward_lesson_complete.slot` segue progressione L1→L6: `colazione` / `fine_colazione` / `pranzo` / `aperitivo` / `cena` / `dolce`.
- `cultural_insights` opzionale. Se presente, `length ≤ 1` (P2). Payload identico agli insights di unit-meta.

### 6.1 Distribuzione attività per lezione

Le 3 versioni (soft/standard/advanced) determinano la composizione delle 8 attività per ogni lezione. Il validator controlla che ogni `lesson.json` rispetti la riga corrispondente.

**SOFT (temi 1-10)**

| Lezione | Match | MCQ | Listen | Build | Fill | Decision | WHY | Dialogue |
|---|---|---|---|---|---|---|---|---|
| L1 Onboarding | 4 | 2 | 1 | 1 | 0 | 0 | 0 | 0 |
| L2 Memory+Build | 2 | 2 | 1 | 2 | 1 | 0 | 0 | 0 |
| L3 Story | 2 | 1 | 2 | 1 | 1 | 0 | 0 | 1 |
| L4 Simulation | 1 | 1 | 1 | 1 | 1 | 2 | 0 | 1 |
| L5 WHY Focus | 0 | 1 | 1 | 1 | 1 | 1 | 2 | 1 |
| L6 Challenge Prep | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

**STANDARD (temi 11-30)**

| Lezione | Match | MCQ | Listen | Build | Fill | Decision | WHY | Dialogue |
|---|---|---|---|---|---|---|---|---|
| L1 | 3 | 2 | 1 | 1 | 1 | 0 | 0 | 0 |
| L2 | 2 | 1 | 1 | 2 | 2 | 0 | 0 | 0 |
| L3 | 1 | 1 | 2 | 1 | 1 | 1 | 0 | 1 |
| L4 | 1 | 1 | 1 | 1 | 0 | 2 | 0 | 2 |
| L5 | 0 | 1 | 1 | 1 | 1 | 1 | 2 | 1 |
| L6 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

**ADVANCED (temi 31-50)**

| Lezione | Match | MCQ | Listen | Build | Fill | Decision | WHY | Dialogue |
|---|---|---|---|---|---|---|---|---|
| L1 | 3 | 1 | 1 | 1 | 1 | 1 | 0 | 0 |
| L2 | 1 | 1 | 1 | 2 | 2 | 1 | 0 | 0 |
| L3 | 1 | 1 | 2 | 1 | 0 | 1 | 0 | 2 |
| L4 | 0 | 1 | 1 | 1 | 0 | 2 | 1 | 2 |
| L5 | 0 | 0 | 1 | 1 | 1 | 1 | 3 | 1 |
| L6 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

---

## 7. Blocco attività — campi comuni

Tutti gli 8 tipi di attività condividono questo guscio. La parte type-specifica vive in `data` (discriminated union su `type`).

```json
{
  "activity_id": "a1_t01_u1_l1_a1",
  "activity_number": 1,
  "type": "match",
  "character_id": "mario",
  "character_layout_override": null,
  "vocab_focus": ["a1_t01_u1_ciao", "a1_t01_u1_buongiorno"],
  "intro": {
    "it": "Abbina le parole!",
    "en": "Match the words!"
  },
  "feedback_ok": {
    "it": "Perfetto! Ciao e Buongiorno — già li sai.",
    "en": "Perfect! You already know Ciao and Buongiorno."
  },
  "feedback_err": {
    "it": "❌ Ciao = ✅ Hi (informale). Buongiorno è prima delle 18.",
    "en": "❌ Ciao = ✅ Hi (informal). Buongiorno is before 6 PM."
  },
  "data": { /* shape specifica per type — vedi §8 */ }
}
```

**Campi obbligatori**: tutti tranne `character_layout_override` (opzionale).

**Eccezione feedback**: `match`, `decision`, `why` e `dialogue` possono avere feedback a granularità più fine dentro `data` (per branch, per ipotesi, per turno, per coppia). In quel caso `feedback_ok`/`feedback_err` del guscio sono comunque obbligatori come fallback. Per `mcq`, `listen`, `build`, `fill` il feedback vive solo nel guscio.

**Regole enforced**:

- `character_id` deve esistere nel `theme-meta.json` del tema.
- `character_id` deve rispettare la regola personaggi per `(unit_number, type)`:
  - U1: sempre `mario`.
  - U2-U5: `mario` se `type ∈ {match, mcq}`, altrimenti il co-protagonist dell'unità.
- `vocab_focus` contiene solo `vocab_id` definiti nell'unità corrente o in `inherited_vocab`.
- `intro.it` e `intro.en` non vuoti.
- `feedback_err.en` non contiene emoji (regola bibbia, ereditata).
- `activity_number` univoco all'interno della lezione, da 1 a 8.

**Regole enforced (P2)**:

- `character_layout_override`, se presente, appartiene all'enum `{"compact_corner"}` (unico valore per ora, previsto per `build`). `null` esplicito ammesso.
- Raccomandato (warning se violato): `character_layout_override: "compact_corner"` per tutte le attività con `type: "build"` per coerenza UX con la regola roadmap P2 §3.

---

## 8. Shape `data` per le 8 attività

### 8.1 `match`

```json
{
  "type": "match",
  "data": {
    "pairs": [
      { "it_vocab_ref": "a1_t01_u1_ciao",       "en_override": null },
      { "it_vocab_ref": "a1_t01_u1_buongiorno", "en_override": null }
    ],
    "rounds": 2
  }
}
```

- `it_vocab_ref` referenzia vocab in `unit-meta.json`. IT + audio vengono da lì.
- `en_override`: normalmente `null` (usa EN di unit-meta). Forzato solo se in questo match serve una traduzione specifica.
- `rounds`: 1 (solo IT→EN) o 2 (IT→EN + EN→IT, comportamento VocabMatch attuale).

### 8.2 `mcq`

```json
{
  "type": "mcq",
  "data": {
    "mode": "standard",
    "context": {
      "it": "Sono le 9 del mattino. Entri al bar di Mario.",
      "en": "It's 9 AM. You walk into Mario's bar."
    },
    "prompt": {
      "it": "Cosa dici?",
      "en": "What do you say?"
    },
    "options": [
      { "it": "Buongiorno!", "en": "Good morning!", "emoji": "☀️" },
      { "it": "Buonasera!",  "en": "Good evening!", "emoji": "🌆" },
      { "it": "Ciao!",       "en": "Hi!",           "emoji": "👋" }
    ],
    "correct": 0,
    "context_type": "saluto_contestuale",
    "expected_answer_type": "saluto"
  }
}
```

- `mode`: `"standard"` (3-4 opzioni) | `"binary"` (2 opzioni fisse — sostituisce VeroFalso + GiustoONo).
- `correct: 0` sempre (shuffle a runtime).
- `emoji` nelle opzioni: nullable.
- `context` opzionale.
- `context_type` + `expected_answer_type` **obbligatori v2**, enforced dal validator semantico come bloccante sul contenuto nuovo (warning sul contenuto A1 legacy).

### 8.3 `listen`

```json
{
  "type": "listen",
  "data": {
    "mode": "choose",
    "audio": {
      "source": "tts",
      "text_it": "Buongiorno! Un caffè per favore.",
      "text_en_reference": "Good morning! A coffee please."
    },
    "prompt": {
      "it": "Cosa hai sentito?",
      "en": "What did you hear?"
    },
    "options": [
      { "it": "Un caffè per favore",     "en": "A coffee please" },
      { "it": "Un cappuccino per favore","en": "A cappuccino please" },
      { "it": "Un tè per favore",        "en": "A tea please" }
    ],
    "correct": 0
  }
}
```

- `mode`: `"choose"` (ascolta e scegli) | `"judge"` (ascolta e decidi se corretto — sostituisce AscoltoGiudica).
- `audio.source`: `"tts"` (unico valore oggi; prepara per `"recorded"` futuro).
- `text_en_reference` non viene pronunciato, solo di riferimento.

### 8.4 `build`

```json
{
  "type": "build",
  "data": {
    "target": {
      "it": "Mi chiamo Mario.",
      "en": "My name is Mario."
    },
    "word_bank": ["Mi", "chiamo", "Mario", "sono", "tu", "il"],
    "fixed_punctuation": ".",
    "audio_on_complete": true
  }
}
```

- `word_bank` include distrattori (qui `sono`, `tu`, `il`). Il validator controlla che tutte le parole di `target.it` siano presenti.
- `fixed_punctuation` appare fissa a video, non selezionabile.
- `audio_on_complete: true` → TTS legge `target.it` solo dopo composizione corretta.

### 8.5 `fill`

```json
{
  "type": "fill",
  "data": {
    "sentence_it": "Mi ___ Mario.",
    "sentence_en_complete": "My name is Mario.",
    "answer": "chiamo",
    "distractors": ["chiama", "chiami", "chiamano"]
  }
}
```

- `sentence_it` contiene il buco (`___`).
- `sentence_en_complete` è **sempre** la frase EN intera, mai bucata (regola v2 esplicita).
- `answer` è testo esatto. Validator controlla che `answer` non compaia in `distractors`.
- Nessun `correct: 0` — la risposta è testuale, non indicizzata.

### 8.6 `decision`

Scelta narrativa one-shot: lo scenario inquadra la scena, l'utente sceglie fra 2 o 3 azioni, ogni scelta mostra il proprio outcome (reazione del personaggio + regola). La corretta è culturalmente/pragmaticamente appropriata; le sbagliate mostrano perché non funzionano. Dopo la scelta si avanza — non c'è retry loop.

```json
{
  "type": "decision",
  "data": {
    "scenario": {
      "it": "Sono le 19. Entri al bar di Mario per la prima volta. Mario è al bancone.",
      "en": "It's 7 PM. You walk into Mario's bar for the first time. Mario is at the counter."
    },
    "prompt": {
      "it": "Cosa dici?",
      "en": "What do you say?"
    },
    "branches": [
      {
        "action":  { "it": "Buonasera!", "en": "Good evening!", "emoji": "🌆" },
        "outcome": {
          "it": "✅ Perfetto. Dopo le 18 è buonasera, e formale con chi non conosci. Mario ti accoglie con un sorriso.",
          "en": "✅ Perfect. After 6 PM it's buonasera, and formal with strangers. Mario welcomes you with a smile."
        }
      },
      {
        "action":  { "it": "Ciao!", "en": "Hi!", "emoji": "👋" },
        "outcome": {
          "it": "❌ \"Ciao\" è informale — non conosci Mario. ✅ Meglio \"Buonasera\". Come dire \"hey\" al capo al primo incontro.",
          "en": "❌ \"Ciao\" is informal — you don't know Mario. ✅ Better: \"Buonasera\". Like saying \"hey\" to the boss on day one."
        }
      },
      {
        "action":  { "it": "Buongiorno!", "en": "Good morning!", "emoji": "☀️" },
        "outcome": {
          "it": "❌ \"Buongiorno\" è prima delle 18. ✅ Alle 19 si passa a \"Buonasera\".",
          "en": "❌ \"Buongiorno\" is before 6 PM. ✅ At 7 PM you switch to \"Buonasera\"."
        }
      }
    ],
    "correct_branch_index": 0,
    "context_type": "saluto_contestuale",
    "expected_answer_type": "saluto"
  }
}
```

- `scenario` e `prompt`: bilingui, obbligatori.
- `branches`: array di 2 o 3 elementi. `branches[0]` è sempre la corretta; la UI le mescola a runtime (stessa convenzione `correct: 0` di `mcq`).
- `action`: bilingue obbligatoria, `emoji` opzionale e IT-only (appare sulla card).
- `outcome`: reazione del personaggio + regola. Segue il template bibbia: per la corretta `✅ + regola + (opz.) dettaglio narrativo`; per le sbagliate `❌ motivo → ✅ alternativa + analogia inglese`. I simboli `❌`/`✅` sono strutturali (ammessi anche in `.en`), emoji decorative vietate in `.en`.
- `correct_branch_index`: sempre `0`.
- `context_type` + `expected_answer_type`: obbligatori, stessa taxonomy di `mcq` (bloccante sul contenuto v2).
- Gli `outcome` sostituiscono il feedback del guscio a runtime (§7 eccezione); `feedback_ok`/`feedback_err` del guscio restano come fallback.

### 8.7 `why`

Attività "finally someone explains why". L'utente vede due gruppi di esempi che contrastano un pattern, sceglie fra 2-3 ipotesi sulla regola sottostante, e solo quando indovina riceve la rivelazione della regola + analogia inglese. Se sbaglia riceve un mini-suggerimento che rimanda agli esempi e riprova — la regola non si svela finché non ci arriva lui.

```json
{
  "type": "why",
  "data": {
    "pattern_examples": [
      {
        "group_label": { "it": "Gruppo 1", "en": "Group 1" },
        "items": [
          { "it": "Ciao Sofia!", "en": "Hi Sofia!" },
          { "it": "Ciao Marco!", "en": "Hi Marco!" }
        ]
      },
      {
        "group_label": { "it": "Gruppo 2", "en": "Group 2" },
        "items": [
          { "it": "Buongiorno signor Rossi",     "en": "Good morning Mr. Rossi" },
          { "it": "Buongiorno dottoressa Bianchi","en": "Good morning Dr. Bianchi" }
        ]
      }
    ],
    "prompt": {
      "it": "Perché cambiamo parola?",
      "en": "Why does the word change?"
    },
    "hypotheses": [
      {
        "text":  { "it": "Per quanto conosci la persona", "en": "Based on how well you know the person" },
        "nudge": null
      },
      {
        "text":  { "it": "Per l'ora del giorno", "en": "Based on the time of day" },
        "nudge": {
          "it": "Riguarda bene: nel gruppo 2 non si parla di orari, ma di persone. Riprova.",
          "en": "Look again: group 2 isn't about time, it's about people. Try again."
        }
      },
      {
        "text":  { "it": "Per il genere della persona", "en": "Based on the person's gender" },
        "nudge": {
          "it": "Nel gruppo 2 un uomo e una donna ricevono la stessa parola. Non è il genere.",
          "en": "In group 2 a man and a woman get the same word. It's not gender."
        }
      }
    ],
    "correct_hypothesis_index": 0,
    "rule_reveal": {
      "it": "Con amici e giovani → ciao. Con chi non conosci o ha un ruolo → buongiorno.",
      "en": "With friends and young people → ciao. With strangers or people with a role → buongiorno."
    },
    "english_analogy": {
      "it": "Come \"hey\" a un amico vs \"hello, sir/madam\" a chi ha autorità.",
      "en": "Like \"hey\" to a friend vs \"hello, sir/madam\" to someone with authority."
    }
  }
}
```

- `pattern_examples`: **esattamente 2 gruppi**, per forzare una cornice di contrasto. Ogni gruppo ha 2-4 `items` bilingui. `group_label` bilingue opzionale (può essere `null` se i gruppi sono puramente visuali e non etichettati).
- `prompt`: la domanda "perché?" bilingue.
- `hypotheses`: 2 o 3 opzioni. `hypotheses[0]` è sempre la corretta (shuffle a runtime).
- `hypotheses[i].text`: bilingue obbligatoria.
- `hypotheses[i].nudge`: bilingue obbligatoria per le ipotesi sbagliate (`i > 0`), `null` per la corretta. È il mini-suggerimento mostrato quando l'utente la sceglie per errore, poi la UI gli permette di riprovare.
- `correct_hypothesis_index`: sempre `0`.
- `rule_reveal`: la regola in parole piane (non grammaticalese), mostrata **solo** dopo che l'utente ha scelto la corretta.
- `english_analogy`: analogia in inglese che ancora la regola alla L1 dell'utente. Bilingue (la versione EN può essere l'analogia stessa, la versione IT può essere la sua spiegazione in italiano).
- Il template bibbia del feedback (`❌ → ✅ + REGOLA + analogia EN`) si realizza così: `nudge` fa il ruolo del `❌ → suggerimento`, `rule_reveal` + `english_analogy` fanno il ruolo di `✅ + REGOLA + analogia`.
- `vocab_focus` del guscio: può essere array vuoto se l'attività è puramente grammaticale e non verte su parole specifiche, ma di norma riferisce le parole chiave del pattern.

### 8.8 `dialogue`

Conversazione a 2-7 turni, alternati fra personaggio e utente. Il personaggio parla a copione; ai suoi turni l'utente sceglie fra 2 o 3 risposte, solo una appropriata. Se sbaglia, riceve feedback bibbia e il dialogo prosegue come se avesse detto la corretta — nessuna interruzione del filo narrativo.

Non c'è un enum `mode` esplicito: `complete_reply` emerge quando `turns[]` contiene 1 solo user-turn, `multi_turn` quando ne contiene 2 o 3.

```json
{
  "type": "dialogue",
  "data": {
    "scenario_intro": {
      "it": "Sei al bar di Mario la mattina. Ordini e vai via.",
      "en": "You're at Mario's bar in the morning. You order and leave."
    },
    "turns": [
      {
        "speaker": "character",
        "character_id": "mario",
        "text": { "it": "Buongiorno! Cosa prende?", "en": "Good morning! What will you have?" }
      },
      {
        "speaker": "user",
        "prompt": { "it": "Cosa rispondi?", "en": "What do you say?" },
        "options": [
          { "it": "Un caffè, per favore", "en": "A coffee, please" },
          { "it": "Dammi un caffè",       "en": "Give me a coffee" },
          { "it": "Voglio un caffè",      "en": "I want a coffee" }
        ],
        "correct_index": 0,
        "feedback_wrong": {
          "it": "❌ \"Dammi\"/\"Voglio\" sono sgarbati con chi non conosci. ✅ \"Un caffè, per favore\" — aggiungi per favore per essere cortese.",
          "en": "❌ \"Dammi\"/\"Voglio\" are rude with strangers. ✅ \"Un caffè, per favore\" — add per favore to be polite."
        }
      },
      {
        "speaker": "character",
        "character_id": "mario",
        "text": { "it": "Subito!", "en": "Right away!" }
      },
      {
        "speaker": "character",
        "character_id": "mario",
        "text": { "it": "Ecco il suo caffè.", "en": "Here's your coffee." }
      },
      {
        "speaker": "user",
        "prompt": { "it": "Come saluti?", "en": "How do you say goodbye?" },
        "options": [
          { "it": "Grazie, arrivederci!", "en": "Thanks, goodbye!" },
          { "it": "Ciao!",                "en": "Bye!" },
          { "it": "Addio!",               "en": "Farewell!" }
        ],
        "correct_index": 0,
        "feedback_wrong": {
          "it": "❌ \"Ciao\" è troppo informale con un cameriere che non conosci; \"Addio\" è drammatico, da romanzo. ✅ \"Grazie, arrivederci!\" è formale e cortese.",
          "en": "❌ \"Ciao\" is too informal with a waiter you don't know; \"Addio\" is dramatic, novelistic. ✅ \"Grazie, arrivederci!\" is formal and polite."
        }
      },
      {
        "speaker": "character",
        "character_id": "mario",
        "text": { "it": "Arrivederci, a presto!", "en": "Goodbye, see you soon!" }
      }
    ]
  }
}
```

- `scenario_intro`: bilingue obbligatoria, inquadra la scena prima del primo turno.
- `turns`: array di **2-7 elementi**. Ogni turno ha `speaker ∈ {"character", "user"}`.
- **Turno character**:
  - `character_id`: id di un personaggio dichiarato in `theme-meta.json` (può essere il "guscio" o un altro personaggio del tema — utile per scene a più voci).
  - `text`: bilingue obbligatoria.
- **Turno user**:
  - `prompt`: bilingue, breve cornice della scelta (es. "Cosa rispondi?", "Come saluti?").
  - `options`: array di 2 o 3 alternative bilingui.
  - `correct_index`: sempre `0` (shuffle a runtime).
  - `feedback_wrong`: bilingue, mostrato solo se l'utente sbaglia. Template bibbia `❌ → ✅ + REGOLA + analogia inglese`. Dopo il feedback il dialogo prosegue come se avesse scelto la corretta.
- Vincoli sulla sequenza:
  - Almeno 1 turno con `speaker === "user"`.
  - Al massimo 3 turni con `speaker === "user"`.
  - Non più di 3 turni `"character"` consecutivi.
  - Il primo turno è quasi sempre `"character"` (apre la scena); non è un vincolo hard ma è la convenzione pedagogica.
- Il `character_id` del guscio è la "voce ospite" dell'attività — rispetta la regola personaggi (§7). I `character_id` all'interno dei turni possono includere altri personaggi del tema per arricchire la scena.

### 8.9 Tipi con feedback dentro `data`

Per `decision`, `why`, `dialogue` (e `match`, che aveva già feedback fine dentro `data`) il feedback visibile all'utente vive nei campi type-specifici (`outcome`, `nudge` + `rule_reveal`, `feedback_wrong`). I campi `feedback_ok`/`feedback_err` del guscio sono comunque obbligatori come fallback (§7) e il validator li richiede non vuoti anche per questi tipi.

---

## 9. Schema `challenge.json`

La sfida di fine unità. Non-failable per design. Teaser del prossimo co-protagonist.

```json
{
  "$schema": "v2",
  "challenge_id": "a1_t01_u1_challenge",
  "unit_id": "a1_t01_u1",
  "theme_id": "a1_t01_saluti",
  "teaser_character_id": "sofia",
  "title": {
    "it": "Sofia entra al bar",
    "en": "Sofia walks into the bar"
  },
  "intro_narrative": {
    "character_id": "sofia",
    "first_appearance": true,
    "text": {
      "it": "Ciao! Sono Sofia, studio a Bologna. Mario mi ha detto che state imparando i saluti...",
      "en": "Hi! I'm Sofia, I study in Bologna. Mario told me you're learning greetings..."
    }
  },
  "activities": [ /* esattamente 10, stesso schema delle lezioni */ ],
  "scoring": {
    "pass_always": true,
    "credits_tiers": [
      { "max_errors": 0,   "credits": 50, "label": { "it": "Perfetto!",        "en": "Perfect!" } },
      { "max_errors": 2,   "credits": 35, "label": { "it": "Bravo!",           "en": "Great!" } },
      { "max_errors": 5,   "credits": 20, "label": { "it": "Passato!",        "en": "Passed!" } },
      { "max_errors": 999, "credits": 10, "label": { "it": "Ce l'hai fatta!", "en": "You made it!" } }
    ]
  },
  "reward_challenge_complete": {
    "kind": "dish",
    "id": "pizza_margherita",
    "label": { "it": "Pizza Margherita", "en": "Margherita pizza" },
    "emoji": "🍕"
  }
}
```

**Campi obbligatori**: tutti tranne `intro_narrative` (presente sempre per la sfida — il teaser si presenta).

**Regole enforced**:

- `activities.length === 10`.
- `teaser_character_id` deve combaciare con il `co_protagonist` di `u{N+1}` nel theme-meta (eccezione: sfida U5 → `mario`).
- `scoring.pass_always` è sempre `true`.
- L'ultimo tier di `credits_tiers` ha `max_errors: 999` (fondo garantito).
- `reward_challenge_complete` deve combaciare con `reward_unit_complete` del `unit-meta.json` corrispondente (id + emoji + label).
- Le 10 attività seguono le stesse regole personaggi delle lezioni dell'unità (U1: Mario ovunque; U2-U5: mario per match+mcq, co-protagonist per il resto — il co-protagonist qui è **il teaser**, non quello dell'unità corrente).

---

## 10. Reward a 3 livelli

Sistema unificato discriminato da `kind`.

```typescript
type Reward = IngredientReward | DishReward | ExperienceReward

type IngredientReward = {
  kind: "ingredient"
  slot: IngredientSlot
  pool: Array<{ id: string, it: string, en: string, emoji: string }>  // scelto random a runtime
  credits: number
}

type DishReward = {
  kind: "dish"
  id: string
  label: { it: string, en: string }
  emoji: string
  credits?: number   // opzionale: la sfida usa credits_tiers
}

type ExperienceReward = {
  kind: "experience"
  id: string
  label: { it: string, en: string }
  emoji: string
  credits: number
}
```

**Mappatura livello → file**:

| Kind | File | Campo |
|---|---|---|
| `ingredient` | `lesson.json` | `reward_lesson_complete` |
| `dish` | `unit-meta.json` + `challenge.json` | `reward_unit_complete` + `reward_challenge_complete` |
| `experience` | `theme-meta.json` | `reward_theme_complete` |

**Progressione slot degli ingredienti** (L1→L6):

`colazione` → `fine_colazione` → `pranzo` → `aperitivo` → `cena` → `dolce`

**Regola consistency**: il `dish` di `unit-meta.json` deve avere `id` + `emoji` + `label` identici a quelli di `challenge.json` della stessa unità.

---

## 11. Mapping 13 componenti → 8 activity_type

Consolidamento del codice esistente:

| Componente React attuale | → activity_type | Azione |
|---|---|---|
| VocabMatch + DomandaAbbina | `match` | Riuso |
| DomandaMultipla | `mcq` (mode: standard) | Riuso |
| DomandaVeroFalso | `mcq` (mode: binary) | Collasso |
| DomandaGiustoONo | `mcq` (mode: binary) | Collasso |
| DomandaAscolta | `listen` (mode: choose) | Riuso |
| DomandaAscoltoGiudica | `listen` (mode: judge) | Collasso |
| DomandaAscoltaRipeti | — | Sospeso (pronuncia TTS inadeguata; riattivabile con Whisper) |
| DomandaWordBank | `build` | Riuso |
| DomandaFillBlank | `fill` | Riuso (con modifica: EN sempre completa) |
| DomandaTapRight | `decision` | Da ridisegnare in P2 |
| DomandaCompletaRisposta | `dialogue` (mode: complete_reply) | Collasso |
| DomandaDialogo | `dialogue` (mode: multi_turn) | Da potenziare in P2 |
| DomandaRouter | — | Resta come dispatcher runtime |

**Post-pilota**: i componenti DomandaVeroFalso, DomandaGiustoONo, DomandaAscoltoGiudica, DomandaCompletaRisposta, DomandaAscoltaRipeti si eliminano (codice morto).

---

## 12. Esempio canonico compilato

**File**: `data/lessons/a1/theme01-saluti/unit1/lesson1.json`
**Lezione**: L1 Onboarding, Tema 1 Saluti, Unità 1
**Distribuzione SOFT L1**: 4 match + 2 mcq + 1 listen + 1 build

```json
{
  "$schema": "v2",
  "lesson_id": "a1_t01_u1_l1",
  "lesson_number": 1,
  "unit_id": "a1_t01_u1",
  "theme_id": "a1_t01_saluti",
  "format": "onboarding",
  "title": {
    "it": "Mario apre il bar",
    "en": "Mario opens the bar"
  },
  "intro_narrative": {
    "character_id": "mario",
    "first_appearance": true,
    "text": {
      "it": "Ciao, sono Mario. Qui al mio bar a Napoli impari l'italiano con me. Iniziamo dai saluti!",
      "en": "Hi, I'm Mario. Here at my bar in Naples you learn Italian with me. Let's start with greetings!"
    }
  },
  "activities": [
    {
      "activity_id": "a1_t01_u1_l1_a1",
      "activity_number": 1,
      "type": "match",
      "character_id": "mario",
      "vocab_focus": ["a1_t01_u1_ciao", "a1_t01_u1_buongiorno"],
      "intro": {
        "it": "Abbiniamo le prime due parole!",
        "en": "Let's match the first two words!"
      },
      "feedback_ok": {
        "it": "I primi due saluti sono tuoi.",
        "en": "Your first two greetings are yours."
      },
      "feedback_err": {
        "it": "Ciao è informale, Buongiorno formale.",
        "en": "Ciao is informal, Buongiorno is formal."
      },
      "data": {
        "pairs": [
          { "it_vocab_ref": "a1_t01_u1_ciao",       "en_override": null },
          { "it_vocab_ref": "a1_t01_u1_buongiorno", "en_override": null }
        ],
        "rounds": 1
      }
    },
    {
      "activity_id": "a1_t01_u1_l1_a2",
      "activity_number": 2,
      "type": "match",
      "character_id": "mario",
      "vocab_focus": ["a1_t01_u1_ciao", "a1_t01_u1_buongiorno", "a1_t01_u1_buonasera"],
      "intro": {
        "it": "Ora tutti e tre insieme!",
        "en": "Now all three together!"
      },
      "feedback_ok": {
        "it": "Sai già i tre saluti base.",
        "en": "You already know the three basic greetings."
      },
      "feedback_err": {
        "it": "❌ → ✅ Buonasera dopo le 18, Buongiorno prima.",
        "en": "❌ → ✅ Buonasera after 6 PM, Buongiorno before."
      },
      "data": {
        "pairs": [
          { "it_vocab_ref": "a1_t01_u1_ciao",       "en_override": null },
          { "it_vocab_ref": "a1_t01_u1_buongiorno", "en_override": null },
          { "it_vocab_ref": "a1_t01_u1_buonasera",  "en_override": null }
        ],
        "rounds": 2
      }
    },
    {
      "activity_id": "a1_t01_u1_l1_a3",
      "activity_number": 3,
      "type": "mcq",
      "character_id": "mario",
      "vocab_focus": ["a1_t01_u1_buongiorno"],
      "intro": {
        "it": "Mattina al bar!",
        "en": "Morning at the bar!"
      },
      "feedback_ok": {
        "it": "Buongiorno fino alle 18.",
        "en": "Buongiorno until 6 PM."
      },
      "feedback_err": {
        "it": "❌ → ✅ Di mattina si dice Buongiorno. Buonasera è per la sera!",
        "en": "❌ → ✅ In the morning say Buongiorno. Buonasera is for evening!"
      },
      "data": {
        "mode": "standard",
        "context": {
          "it": "Sono le 9 del mattino. Entri al bar di Mario.",
          "en": "It's 9 AM. You walk into Mario's bar."
        },
        "prompt": {
          "it": "Cosa dici?",
          "en": "What do you say?"
        },
        "options": [
          { "it": "Buongiorno!", "en": "Good morning!", "emoji": "☀️" },
          { "it": "Buonasera!",  "en": "Good evening!", "emoji": "🌆" },
          { "it": "Ciao!",       "en": "Hi!",           "emoji": "👋" }
        ],
        "correct": 0,
        "context_type": "saluto_contestuale",
        "expected_answer_type": "saluto"
      }
    },
    {
      "activity_id": "a1_t01_u1_l1_a4",
      "activity_number": 4,
      "type": "match",
      "character_id": "mario",
      "vocab_focus": ["a1_t01_u1_ciao", "a1_t01_u1_buongiorno", "a1_t01_u1_buonasera"],
      "intro": {
        "it": "Ancora una volta, per fissarli.",
        "en": "One more time, to lock them in."
      },
      "feedback_ok": {
        "it": "Li hai nel cervello adesso.",
        "en": "They're in your brain now."
      },
      "feedback_err": {
        "it": "Indizio: -sera = sera, -giorno = giorno.",
        "en": "Hint: -sera = evening, -giorno = day."
      },
      "data": {
        "pairs": [
          { "it_vocab_ref": "a1_t01_u1_ciao",       "en_override": null },
          { "it_vocab_ref": "a1_t01_u1_buongiorno", "en_override": null },
          { "it_vocab_ref": "a1_t01_u1_buonasera",  "en_override": null }
        ],
        "rounds": 2
      }
    },
    {
      "activity_id": "a1_t01_u1_l1_a5",
      "activity_number": 5,
      "type": "listen",
      "character_id": "mario",
      "vocab_focus": ["a1_t01_u1_buonasera"],
      "intro": {
        "it": "Ascolta bene!",
        "en": "Listen carefully!"
      },
      "feedback_ok": {
        "it": "Sì! Hai sentito Buonasera.",
        "en": "Yes! You heard Buonasera."
      },
      "feedback_err": {
        "it": "❌ → ✅ Era Buonasera (Good evening), non Buongiorno.",
        "en": "❌ → ✅ It was Buonasera (Good evening), not Buongiorno."
      },
      "data": {
        "mode": "choose",
        "audio": {
          "source": "tts",
          "text_it": "Buonasera!",
          "text_en_reference": "Good evening!"
        },
        "prompt": {
          "it": "Cosa hai sentito?",
          "en": "What did you hear?"
        },
        "options": [
          { "it": "Buonasera!",  "en": "Good evening!" },
          { "it": "Buongiorno!", "en": "Good morning!" },
          { "it": "Ciao!",       "en": "Hi!" }
        ],
        "correct": 0
      }
    },
    {
      "activity_id": "a1_t01_u1_l1_a6",
      "activity_number": 6,
      "type": "mcq",
      "character_id": "mario",
      "vocab_focus": ["a1_t01_u1_buonasera"],
      "intro": {
        "it": "Sera al bar!",
        "en": "Evening at the bar!"
      },
      "feedback_ok": {
        "it": "Esatto! Buonasera dopo le 18.",
        "en": "Exact! Buonasera after 6 PM."
      },
      "feedback_err": {
        "it": "❌ → ✅ Alle 19 è già sera: Buonasera.",
        "en": "❌ → ✅ At 7 PM it's already evening: Buonasera."
      },
      "data": {
        "mode": "standard",
        "context": {
          "it": "Sono le 19. Incontri Mario per strada.",
          "en": "It's 7 PM. You meet Mario on the street."
        },
        "prompt": {
          "it": "Cosa dici?",
          "en": "What do you say?"
        },
        "options": [
          { "it": "Buonasera!",  "en": "Good evening!", "emoji": "🌆" },
          { "it": "Buongiorno!", "en": "Good morning!", "emoji": "☀️" },
          { "it": "Ciao!",       "en": "Hi!",           "emoji": "👋" }
        ],
        "correct": 0,
        "context_type": "saluto_contestuale",
        "expected_answer_type": "saluto"
      }
    },
    {
      "activity_id": "a1_t01_u1_l1_a7",
      "activity_number": 7,
      "type": "build",
      "character_id": "mario",
      "vocab_focus": ["a1_t01_u1_buongiorno"],
      "intro": {
        "it": "Componi il saluto!",
        "en": "Build the greeting!"
      },
      "feedback_ok": {
        "it": "Buongiorno, Mario!",
        "en": "Good morning, Mario!"
      },
      "feedback_err": {
        "it": "Prima il saluto, poi il nome.",
        "en": "Greeting first, then the name."
      },
      "data": {
        "target": {
          "it": "Buongiorno Mario",
          "en": "Good morning Mario"
        },
        "word_bank": ["Buongiorno", "Mario", "Ciao", "Buonasera"],
        "fixed_punctuation": "!",
        "audio_on_complete": true
      }
    },
    {
      "activity_id": "a1_t01_u1_l1_a8",
      "activity_number": 8,
      "type": "match",
      "character_id": "mario",
      "vocab_focus": ["a1_t01_u1_ciao", "a1_t01_u1_buongiorno", "a1_t01_u1_buonasera"],
      "intro": {
        "it": "Ultimo ripasso — tutti e tre!",
        "en": "Last review — all three!"
      },
      "feedback_ok": {
        "it": "Lezione finita. Hai imparato 3 saluti.",
        "en": "Lesson done. You learned 3 greetings."
      },
      "feedback_err": {
        "it": "Concentrati — sei a un passo dalla fine.",
        "en": "Focus — you're one step from the end."
      },
      "data": {
        "pairs": [
          { "it_vocab_ref": "a1_t01_u1_ciao",       "en_override": null },
          { "it_vocab_ref": "a1_t01_u1_buongiorno", "en_override": null },
          { "it_vocab_ref": "a1_t01_u1_buonasera",  "en_override": null }
        ],
        "rounds": 2
      }
    }
  ],
  "reward_lesson_complete": {
    "kind": "ingredient",
    "slot": "colazione",
    "pool": [
      { "id": "caffe",      "it": "Caffè espresso",     "en": "Espresso",     "emoji": "☕" },
      { "id": "cappuccino", "it": "Cappuccino",         "en": "Cappuccino",   "emoji": "☕" },
      { "id": "spremuta",   "it": "Spremuta d'arancia", "en": "Orange juice", "emoji": "🍊" }
    ],
    "credits": 5
  }
}
```

---

## 13. Checklist validator

Check strutturali che il validator deve enforzare quando la v2 entra in produzione. Quelli marcati `esistente` sono già nel validator attuale e restano validi.

### 13.1 File e gerarchia

- [ ] Ogni tema ha esattamente: 1 `theme-meta.json` + 5 cartelle `unitN/`.
- [ ] Ogni unità ha esattamente: 1 `unit-meta.json` + 6 `lessonN.json` + 1 `challenge.json`.
- [ ] File copiato sia in `data/lessons/...` che in `public/data/lessons/...`.

### 13.2 ID e referenze

- [ ] Tutti gli ID seguono i pattern di §2.
- [ ] Ogni `vocab_ref` / `vocab_focus` esiste in `unit-meta.json` o `inherited_vocab`.
- [ ] `character_id` esiste in `theme-meta.json`.

### 13.3 theme-meta

- [ ] 1 protagonist + 1 final_boss (entrambi mario) + 4 co_protagonist.
- [ ] `distribution_version` coerente con `theme_number`.
- [ ] `teaser_in_challenge` di co-protagonist U`N` = `"u{N-1}"`.
- [ ] `activity_restriction` co-protagonist = complemento di `["match", "mcq"]`.
- [ ] `context` presente: `emoji`, `place.it/en`, `time.it/en` non vuoti; `city` nullable ma se presente bilingue non vuoto. **[P2]**
- [ ] `anglo_traps.length >= 1`; ogni trap ha `id` unico, `trap.en` non vuoto, `tip.it/en` non vuoti, `trigger_contexts` tutti validi in taxonomy. **[P2]**

### 13.4 unit-meta

- [ ] `vocabulary.length === 6`.
- [ ] 3 parole con `introduced_in_lesson: 1`, 3 con `: 2`.
- [ ] Emoji uniche entro l'unità.
- [ ] `inherited_vocab` coerente con `unit_number`.
- [ ] `context_override`, se presente, è subset di `{emoji, place, city, time}` con stessa shape di `theme-meta.context`. **[P2]**
- [ ] `cultural_insights.length >= 1`; ogni insight ha `id` unico entro unità, `title.it/en` + `body.it/en` non vuoti, trigger refs validi. **[P2]**

### 13.5 lesson.json

- [ ] `activities.length === 8`.
- [ ] `format` coerente con `lesson_number` (mapping fisso).
- [ ] Distribuzione dei 8 `type` coerente con la tabella della `distribution_version`.
- [ ] `why` assente in L1 e L2. `dialogue` assente in L1.
- [ ] `reward_lesson_complete.slot` coerente con `lesson_number`.
- [ ] Regola personaggi: U1 → tutti mario; U2-U5 → mario per match/mcq, co-protagonist per il resto.
- [ ] `cultural_insights` a livello lesson: opzionale, `length ≤ 1` se presente. Payload identico a unit-meta. **[P2]**

### 13.6 attività

- [ ] `correct: 0` sempre nei type che lo usano (mcq, listen). **[esistente]**
- [ ] `feedback_err.en` senza emoji (eccetto i simboli strutturali `❌`/`✅`). **[esistente]**
- [ ] Campi IT/EN non vuoti. **[esistente]**
- [ ] `mcq` standard: `context_type` + `expected_answer_type` presenti e validi nella taxonomy. **[esistente, warning → bloccante su v2]**
- [ ] `build.word_bank` contiene tutte le parole di `build.target.it`.
- [ ] `fill.answer` non è in `fill.distractors`.
- [ ] `fill.sentence_en_complete` senza `___`.
- [ ] `decision`: `branches.length ∈ {2, 3}`; `correct_branch_index === 0`; ogni branch ha `action.it/en` e `outcome.it/en` non vuoti; `action.emoji` opzionale (null ammesso) e solo IT; `context_type` + `expected_answer_type` validi nella taxonomy; `outcome.en` senza emoji decorativi (❌/✅ strutturali ammessi).
- [ ] `why`: `pattern_examples.length === 2`; ogni gruppo ha `items.length ∈ [2, 4]` con `it/en` non vuoti; `hypotheses.length ∈ {2, 3}`; `correct_hypothesis_index === 0`; `hypotheses[0].nudge === null`; per ogni `i > 0` `hypotheses[i].nudge.it/en` non vuoti; `rule_reveal.it/en` e `english_analogy.it/en` non vuoti.
- [ ] `dialogue`: `turns.length ∈ [2, 7]`; almeno 1 turno `"user"`, al massimo 3; non più di 3 turni `"character"` consecutivi; ogni turno `"character"` ha `character_id` valido in `theme-meta.json` e `text.it/en` non vuoti; ogni turno `"user"` ha `prompt.it/en`, `options.length ∈ {2, 3}` con `it/en` non vuoti, `correct_index === 0`, `feedback_wrong.it/en` non vuoti; `feedback_wrong.en` senza emoji decorativi.
- [ ] `character_layout_override`, se presente, ∈ `{"compact_corner"}` o `null`. **[P2]**
- [ ] Attività `build` dovrebbero avere `character_layout_override: "compact_corner"` (raccomandazione). **[P2, raccomandazione]**

### 13.7 challenge.json

- [ ] `activities.length === 10`.
- [ ] `scoring.pass_always === true`.
- [ ] Ultimo tier con `max_errors: 999`.
- [ ] `reward_challenge_complete` combacia con `unit-meta.json.reward_unit_complete`.
- [ ] `teaser_character_id` combacia con co-protagonist di U`N+1` (o `mario` per U5).

### 13.8 Shape congelate P2

- [ ] Nessuna attività di tipo `decision`, `why`, `dialogue` contiene più il marker `data.__schema_status`. La shape strict di §8.6/§8.7/§8.8 è enforzata pienamente. Un `__schema_status` residuo in contenuto v2 è errore bloccante.

---

## 14. Estensioni future possibili

Elementi non inclusi nella v2 iniziale, retrocompatibili quando aggiunti.

### 14.1 Feedback per-opzione (MCQ/listen)

Oggi `feedback_err` è unico per attività. Estensione naturale:

```json
{
  "feedback_err_per_option": [
    null,
    { "it": "Buonasera è dopo le 18.", "en": "Buonasera is after 6 PM." },
    { "it": "Ciao è informale, serve formale qui.", "en": "Ciao is informal, you need formal here." }
  ]
}
```

L'indice corrisponde a `options[]`. `null` significa "usa `feedback_err` generico". Se l'utente sceglie option 1 riceve feedback mirato. Da introdurre dopo il pilota se risulta utile pedagogicamente.

### 14.2 Audio recorded

`listen.audio.source = "recorded"` con `recorded_url` per pronuncia umana (non TTS). Utile quando la qualità TTS è marginale su frasi complesse.

### 14.3 Pronuncia utente (Whisper)

Riattivare il type `speak` (ex-AscoltaRipeti) con backend Whisper. Tolto dalla v2 iniziale perché Web Speech API insufficiente.

### 14.4 Taxonomy estesa

Espandere `data/taxonomy/semantic-coherence-A1.yaml` per coprire i temi 3-15 (attualmente solo 1-2 hanno coverage piena — vedi audit-motore). Riduce i context_type=unknown da ~66% a ~5%.

### 14.5 Template generator Python

Script riutilizzabile che legge theme-meta + unit-meta e genera scheletri lesson.json conformi. Oggi assente — le unit5-15 legacy furono generate one-shot senza template persistito. Da recuperare per scalare alla v2.

---

## 15. Riferimenti P2

- Roadmap completa P2.a → P2.f: `docs/P2-roadmap.md`
- Rationale posizionamento (cultura radicata, trappole anglofono): `docs/P2-roadmap.md` §1
- Rationale UX personaggio persistente + pillole: `docs/P2-roadmap.md` §2-3

---

## Firma documento

**Deliverable**: P1 (schema strutturale) + P2 (shape `decision`, `why`, `dialogue` congelate).
**Risposte a**: `docs/decisioni-architettura-v2.md` sezione 12, checklist pre-pilota.
**Decisioni P2 prese in questa sessione** (21 Apr 2026):
1. `decision` = one-shot (scenario → 1 scelta fra 2-3 → outcome → avanti).
2. `why` = osserva → indovina → rivela, con retry e mini-hint per ogni ipotesi sbagliata.
3. `dialogue` = sequenza di turni character/user, sbaglio → feedback + dialogo prosegue (no retry).
4. Modalità `complete_reply` vs `multi_turn` del dialogue non sono un enum: si discriminano dal numero di user-turn.

**Prossima sessione**: S4 — scrittura pilota L1 U1 Tema 1 Saluti.
**Commit suggerito**: `docs(schema): P2 congela shape decision/why/dialogue + validator rules`.
