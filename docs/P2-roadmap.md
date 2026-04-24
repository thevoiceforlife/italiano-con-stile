# P2 Roadmap — Design attività nuove + integrazione personaggi + cultura radicata

> **Stato**: documento di roadmap scritto il 2026-04-24 a fine sessione F2.1. Sintetizza decisioni di posizionamento e UX prese in quella sessione.
>
> **Scope**: preparazione per l'apertura di P2 (Fase post-audit che sblocca le attività `decision` / `why` / `dialogue`, oggi placeholder nello schema v2).
>
> **Non ancora implementato**: nessuna delle decisioni qui sotto è in codice o in schema. Il repo al momento ha L1+L2 Saluti v2 live, ma senza pillole culturali né contesto geotemporale né personaggio persistente. Queste lezioni andranno aggiornate prima del rilascio del nuovo UI.

---

## 1. Posizionamento — bandiera di prodotto

### Decisione

**Bandiera principale**: cultura radicata. Non "spiegare il perché" come fa Duolingo Max via GPT-4, ma *insegnare l'Italia mentre si impara l'italiano*. Napoli come laboratorio fisso. Luoghi specifici, persone con biografie, ragioni sociali del perché diciamo così.

**Bandiera di supporto**: trappole per anglofoni. Didattica predittiva per un pubblico specifico (anglofoni), dove Duolingo è universale e quindi generico. Falsi amici EN↔IT, differenze di registro, errori classici che gli inglesi fanno in italiano.

**Claim**: *"Duolingo ti insegna le parole. Italiano con Stile ti insegna quando dirle, a chi, e perché."*

### Cosa NON competiamo

- Non replichiamo AI conversational (Duolingo Max ha GPT-4, investimenti milionari — perderemmo)
- Non replichiamo Streaks/Hearts/Leaderboard (abbiamo già energia/crediti, diverso e più originale)
- Non facciamo pillole *grammaticali pure* — quelle Duolingo Max le fa meglio. Le nostre pillole sono *culturali/relazionali*.

### Test di qualità per ogni pillola

Il **sorpresa test**: un italiano adulto che legge la pillola deve dire "vero, non ci avevo pensato". Se dice "ovvio" → banale, riscrivere. Se dice "è retorica" → cliché, scartare.

Evitare deliberatamente: pizza, mandolino, mamma-come-icona, "amore" come stereotipo, "la dolce vita". Se Mario non li cita, Mario resta un italiano vero e non una macchietta.

---

## 2. Pillole culturali — meccanica UX

### Decisione

Le pillole culturali non sono forzate a ogni esercizio. Sono **opzionali** ma **tracciate**: l'utente le apre se vuole, e quando le legge deve dare un **"Got it"** esplicito per chiuderle (analogo all'Explain My Answer di Duolingo Max).

### Comportamento

- Dopo un feedback (ok o err), appare un bottone opzionale **"Perché?"** / **"Why?"** accanto alla CTA "Continue"
- Tap → modal con pillola culturale di 3-5 righe bilingue
- Chiusura solo via tap esplicito su **"Got it →"** / **"Capito →"**
- La pillola è sempre collegata al vocabolario/situazione dell'esercizio appena fatto

### Vincoli

- Massimo 3-5 righe per pillola. Oltre diventa libro.
- Bilingue (IT + EN) rispettando la regola universale del progetto.
- Tono asciutto, sorprendente, non accademico. Riferimento stilistico: voce narrativa di Lonely Planet o Atlas Obscura, non libro di grammatica.
- Ancorata a un dettaglio specifico (un gesto, un'abitudine, un orario, un luogo), non alla "cultura italiana in generale".

### Esempio

> **Cosa dici a Mario?** → *Un caffè, per favore!* ✅
>
> [Perché?] [Continue →]
>
> Tap su [Perché?]:
>
> ---
>
> ☕ **Al bar italiano, "per favore" crea cliente abituale.**
>
> Se entri e dici solo "Un caffè", il barista te lo fa. Se aggiungi "per favore", la seconda volta ti riconosce. In Italia la cortesia al bar non è formalità — è il modo in cui si diventa abituali.
>
> [Got it →]

---

## 3. Personaggio — presenza persistente

### Decisione

Il personaggio **resta sempre in vista** durante la lezione, contro il pattern Duolingo (che mostra/nasconde). Ragione: Mario, Sofia, Vittoria ecc. hanno biografie specifiche e valgono come identità continua. Toglierli dalla scena vanifica il loro peso narrativo.

### Layout proposto (mobile 380px)

```
┌────────────────────────────────────┐
│ X   ━━━━░░░░   💰 42  🔊           │  top bar sottile
├────────────────────────────────────┤
│  ☕ Al Bar di Mario                 │  contesto geotemporale
│     Napoli, mattina presto          │
├────────────────────────────────────┤
│                                    │
│  Cosa dici a Mario?                │  prompt bilingue
│  What do you say to Mario?         │
│                                    │
│  ┌──────┐ ┌─────────────────────┐ │
│  │      │ │ ☕ Un caffè,          │ │  personaggio 110px
│  │ 🧔  │ │    per favore         │ │  colonna sx ~30%
│  │ pose│ └─────────────────────┘ │
│  │  1  │ ┌─────────────────────┐ │  opzioni colonna dx ~70%
│  │     │ │ 🙏 Un caffè, grazie  │ │
│  └──────┘ └─────────────────────┘ │
│           ┌─────────────────────┐ │
│           │ ☀️ Un caffè,         │ │
│           │    buongiorno        │ │
│           └─────────────────────┘ │
│                                    │
├────────────────────────────────────┤
│  [       CHECK  (disabled)      ] │  CTA full-width bottom
└────────────────────────────────────┘
```

### Layout desktop

Identico al mobile, centrato, `max-width: 680px`. Personaggio 140px a mantenere proporzione. NO layout 3-colonne alla Duolingo desktop — stesso frame del mobile, più grande.

### Mapping 4 pose → stati

| Pose | Nome | Trigger |
|---|---|---|
| 1 | Saluto (mano alzata) | Idle: lettura prompt, scelta opzione, prima apparizione lezione |
| 2 | Braccia conserte (serio) | Errore dal 2° tentativo in poi |
| 3 | Esulta (braccia in alto, caffè) | Risposta corretta + fine lezione |
| 4 | Stupore (mano sull'orecchio) | Primo errore, pillola culturale disponibile, inizio sfida |

### Eccezione attività `build` (word bank drag&drop)

Word bank ha bisogno di spazio orizzontale. Qui il personaggio si riduce a ~70px e va in **basso a destra**, non a sinistra. Non ruba spazio al drag & drop. Questa eccezione va dichiarata nello schema v2 a livello di tipo attività (`character_layout_override: "compact_corner"` o simile).

---

## 4. Contesto geotemporale — ancoraggio scenografico

### Decisione

Ogni lezione mostra in testa un contesto del tipo *"Al Bar di Mario — Napoli, mattina presto"*. Non è generato dinamicamente: vive nei meta file.

### Struttura dati

**theme-meta** (sempre presente, obbligatorio):
```json
{
  "context": {
    "place_it": "Al Bar di Mario",
    "place_en": "Mario's Bar",
    "city_it": "Napoli",
    "city_en": "Naples",
    "emoji": "☕"
  }
}
```

**unit-meta** (override opzionale):
```json
{
  "context_override": {
    "time_it": "mattina presto",
    "time_en": "early morning"
  }
}
```

**lesson.json**: nessun campo. La lezione eredita da unit → theme.

### Esempi di verifica (test coerenza)

| Tema | Rendering contesto |
|---|---|
| T1 Saluti / U1 | ☕ Al Bar di Mario — Napoli, mattina presto |
| T6 Numeri / U1 | 💰 Al mercato di Forcella — Napoli, fine settimana |
| T10 Famiglia / U3 | 🏠 A casa di Nonna Vittoria — Napoli, domenica a pranzo |
| T10 Famiglia / U4 | 🏠 A casa di Nonna Vittoria — Natale, tavola di 12 |
| T12 Al telefono / U1 | 📞 Da qualche parte — un pomeriggio qualsiasi |

Il caso T12 è deliberatamente non-luogo perché "al telefono" è non-luogo per natura. Onesto, non cliché.

---

## 5. Trappole anglofono — `anglo_traps`

### Decisione

Ogni theme-meta ha una lista `anglo_traps` con 1-3 errori classici che gli anglofoni fanno in quel tema. Emergono nei feedback_err delle unità come nota ricorrente.

### Struttura dati

**theme-meta**:
```json
{
  "anglo_traps": [
    {
      "id": "good_morning_vs_buongiorno",
      "trap_en": "Good morning works only until ~12:00-13:00 in Italy",
      "tip_it": "Dopo pranzo è già Buon pomeriggio o Buonasera",
      "tip_en": "After lunch, it's already Buon pomeriggio or Buonasera",
      "trigger_contexts": ["saluto_contestuale"]
    }
  ]
}
```

### Comportamento

Quando un utente sbaglia in un esercizio il cui context_type è in `trigger_contexts` di una trappola, il feedback_err include automaticamente il `tip` della trappola. Non ogni volta — con densità max 1 trappola-feedback per lezione per non martellare.

### Esempi

| Tema | Trappola tipica |
|---|---|
| T1 Saluti | good_morning_vs_buongiorno |
| T3 Pagare | bill_vs_conto_not_check |
| T6 Numeri | avere_per_età (I AM 30 vs I HAVE 30) |
| T10 Famiglia | possessivi_senza_articolo (mia mamma vs la mia amica) |

---

## 6. Impatti operativi

### Su schema v2 (`docs/schema-lezione-v2.md`)

Da estendere con:
- `theme-meta`: nuovi campi `context` (obbligatorio), `anglo_traps` (obbligatorio, min 1 elemento)
- `unit-meta`: nuovo campo `context_override` (opzionale), nuovo campo `cultural_insight` (obbligatorio, min 1 per unità)
- Schema attività: nuovo campo `character_layout_override` opzionale (per eccezione build)
- Attività `why` (placeholder P2) esce dallo stato placeholder e diventa wrapper UI della pillola culturale ereditata da unit-meta

### Su componenti React (da creare)

- `CharacterStage` — componente persistente che gestisce personaggio + 4 pose + override layout per tipo attività
- `LessonHeader` — contesto geotemporale + progress bar + crediti
- `CulturalInsightModal` — pillola con "Got it"
- Refactor `app/lesson/[livello]/[unita]/[lezione]/page.js` per integrare i tre componenti sopra

### Su dati esistenti (L1 + L2 Saluti già live)

Le due lezioni v2 in produzione **non hanno** ancora: theme-meta con context, unit-meta con cultural_insight, anglo_traps. Vanno aggiornate prima del rilascio UI nuovo, altrimenti il primo tema del pilota appare incompleto rispetto agli altri.

Ordine di lavoro:
1. Aggiornare theme-meta a1_t01_saluti con `context` + `anglo_traps`
2. Aggiornare unit-meta a1_t01_u1 con `cultural_insight` + eventuale `context_override`
3. Verificare che lesson1.json e lesson2.json siano compatibili (non serve modifica, solo verifica)

### Su asset (pose personaggi)

1. Ritaglio 8 PNG dal file `Mario_a_figura_intera.png` (4 pose × 2 sfondi) → scegliere set sfondo chiaro o trasparente
2. Naming convention: `mario-pose-1-idle.png`, `mario-pose-2-serious.png`, `mario-pose-3-celebrate.png`, `mario-pose-4-surprise.png`
3. Path: `public/images/characters/mario/`
4. Preload strategy: tutte 4 pose caricate all'entrata in lezione (size totale ~200KB, accettabile)

---

## 7. Sequenza P2 operativa

Quando P2 sarà aperto come lavoro attivo:

| Step | Titolo | Durata stimata | Output |
|---|---|---|---|
| P2.a | Ritaglio 4 pose Mario + naming | 30 min | 4 PNG trasparenti in `public/images/characters/mario/` |
| P2.b | Estensione schema v2 | 60 min | Update `schema-lezione-v2.md` + `decisioni-architettura-v2.md` |
| P2.c | Design componenti React (struttura, non implementazione) | 60 min | Doc `docs/components-p2.md` |
| P2.d | Aggiornamento L1+L2 Saluti con nuovi meta | 45 min | Theme-meta + unit-meta aggiornati, L1/L2 invariate |
| P2.e | Implementazione React (sessione separata) | 3-4 ore | CharacterStage + LessonHeader + CulturalInsightModal + page.js refactor |
| P2.f | Scrittura prime 3 pillole + 1 trappola (pilota Saluti) | 60 min | Contenuto culturale su theme-meta + unit-meta Saluti |

**Dipendenza**: P2.e (implementazione) non può partire prima di P2.b e P2.c. P2.f può iniziare in parallelo a P2.e.

---

## 8. Cosa NON è deciso

Alcune cose sono state toccate in discussione ma non congelate:

- **Audio native registrati** — archiviati per ora, TTS resta standard. Rivisitabile quando budget lo consente.
- **Progressione geografica (Viaggio 20 regioni)** — feature del concept v5, al momento silente. Potenzialmente forte ma fuori scope P2.
- **Dialogue** come attività AI-powered — **escluso**. Dialogue resta scripted per evitare competizione con Duolingo Max.
- **Densità trappole per lezione** — fissata a max 1 per lezione, ma da validare con test utenti reali.
- **Nonna Vittoria nel roster 15** — confermata come personaggio attivo che alterna come boss dei temi dove pertinente (famiglia, cucina, tradizioni). Non nel casting Tema 1 Saluti.

---

## 9. Principi da preservare durante P2

Nessuna delle decisioni P2 deve violare queste regole pre-esistenti:

- Bilinguismo universale (IT + EN sempre, senza eccezioni)
- `correct: 0` nei JSON, shuffle a runtime
- Emoji solo nei campi IT
- Feedback template `❌ → ✅ + regola + analogia EN`
- Boss usa solo lessico lesson1-5 dell'unità
- `shouldRenderEN` per dedup bilingue runtime
- Schema path lowercase per contenuto v2
- Protocollo Claude Code (ruoli, stop, verifica fisica)
- Validator pre-commit attivo (quando esteso per schema v2)

---

*Documento chiuso al 2026-04-24. Revisione prevista all'apertura di P2.*
