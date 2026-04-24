# Componenti P2 — Design

**Status**: P2.c deliverable — design dei componenti React nuovi per P2
**Data**: 24 Aprile 2026
**Fonte di decisione**: `docs/P2-roadmap.md` §3, `docs/schema-lezione-v2.md` §15 (estensione P2)
**Commit base**: `c9b6578`

---

## Scopo di questo documento

Design dei componenti React introdotti da P2 per supportare:

- Personaggio persistente con 4 pose dinamiche (roadmap §3)
- Contesto geotemporale come header di lezione (roadmap §4)
- Pillole culturali attivabili via tap "Perché?" (roadmap §2)
- Trappole anglofono nei feedback_err (roadmap §5)

Il documento è **struttura, non implementazione**. Definisce:

- Gerarchia componenti
- Props API di ciascuno
- Stato e hook
- Integrazione con lesson page
- Ordine di implementazione raccomandato per P2.e

Non contiene codice JSX completo — quello è P2.e.

---

## Indice

1. [Gerarchia componenti](#1-gerarchia-componenti)
2. [CharacterStage](#2-characterstage)
3. [LessonHeader (wrapper)](#3-lessonheader-wrapper)
4. [CulturalInsightModal](#4-culturalinsightmodal)
5. [Hook `useAngloTrapSelector`](#5-hook-useanglotrapselector)
6. [Integrazione in lesson page.js](#6-integrazione-in-lesson-pagejs)
7. [File structure](#7-file-structure)
8. [Ordine implementazione P2.e](#8-ordine-implementazione-p2e)
9. [Test sintetici raccomandati](#9-test-sintetici-raccomandati)

---

## 1. Gerarchia componenti

Tree finale della lesson page dopo refactor P2:

```
LessonPage (app/lesson/[livello]/[unita]/[lezione]/page.js)
│
├── LessonHeader
│   ├── LessonTopBar      (close, progress, crediti, audio)
│   └── LessonContextBar  (emoji + place + city + time)
│
├── LessonBody (existing wrapper, renamed if needed)
│   │
│   ├── CharacterStage
│   │   └── <img> pose corrente  (1|2|3|4)
│   │
│   └── ActivityArea
│       └── DomandaRouter → uno degli 8 componenti attività
│
├── FeedbackArea (existing, extended)
│   ├── feedback_ok / feedback_err + (opz) anglo_trap tip
│   └── Button "Perché?" / "Why?"  →  apre CulturalInsightModal
│
├── CulturalInsightModal (portale, hidden by default)
│
└── CTAArea (existing)  [Continue] / [Check]
```

**Stato posseduto da LessonPage:**

- `currentActivity` (number, 0-7)
- `characterPose` (1|2|3|4)
- `lastFeedbackKind` ('ok' | 'err' | null)
- `insightModalOpen` (boolean)
- `currentInsight` (insight object | null)
- `angloTrapSelector` (hook state)
- `seenInsightIds` (Set<string>, per lesson scope — persist in sessionStorage)

---

## 2. CharacterStage

### Scope

Render del personaggio conduttore dell'attività corrente. Polimorfico: gestisce Mario e in futuro Sofia / Emma / Hans / Yuki con stesso codice.

### Props API

```typescript
interface CharacterStageProps {
  characterId: string;              // "mario" | "sofia" | ...
  pose: 1 | 2 | 3 | 4;              // stato emotivo corrente
  layoutMode: "default" | "compact_corner";  // da activity.character_layout_override
  characterName?: string;           // opzionale, per aria-label
}
```

### Pose mapping (roadmap §3)

| Pose | Nome | Trigger esterno |
|---|---|---|
| 1 | idle | Lettura prompt, scelta opzione, prima apparizione |
| 2 | serious | Errore dal 2° tentativo in poi |
| 3 | celebrate | Risposta corretta, fine lezione |
| 4 | surprise | Primo errore, pillola disponibile, inizio sfida |

**Il trigger è esterno — CharacterStage è presentational.** La lesson page calcola quale pose passare in base agli eventi.

### Path asset (convenzione)

```
public/images/characters/{characterId}/{characterId}-pose-{N}-{slotName}.png
```

Slot names fissi: `idle`, `serious`, `celebrate`, `surprise`.

Esempio Mario:
```
public/images/characters/mario/mario-pose-1-idle.png
public/images/characters/mario/mario-pose-2-serious.png
public/images/characters/mario/mario-pose-3-celebrate.png
public/images/characters/mario/mario-pose-4-surprise.png
```

### Fallback asset mancante

Se l'asset per `(characterId, pose)` non esiste (es. Sofia oggi non ha pose ancora ritagliate), il componente mostra un **placeholder emoji** centrato in un cerchio colorato:

- Mario → ☕
- Sofia → 🎓 (studentessa)
- Emma → 🌴 (Miami/tropicale)
- Hans → 📚 (formale europeo)
- Yuki → 🗾 (Giappone)

La mappatura `characterId → emoji` vive in `data/config/personaggi.json` (già esistente). Il componente la legge all'init.

**Non rompe** se asset mancante — log warning in dev, render fallback in prod.

### Normalizzazione aspect ratio

Gli asset Mario ritagliati da rembg (commit `c9b6578`) hanno larghezze diverse (125px-212px) ma altezze uniformi (~283px). Render naïve con `width` fisso causerebbe "salto" orizzontale tra pose.

**Soluzione CSS** (nessun ri-ritaglio asset):

```
.character-stage {
  width: 150px;        /* default mode: colonna sinistra */
  height: 300px;       /* altezza fissa */
  display: flex;
  justify-content: center;
  align-items: flex-end;  /* piedi allineati in basso */
}

.character-stage img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: bottom center;
}

.character-stage.compact-corner {
  width: 70px;
  height: 140px;
  position: absolute;
  bottom: 8px;
  right: 8px;
  opacity: 0.9;
  z-index: 10;
  pointer-events: none;
}
```

Il contenitore tiene dimensione stabile, l'immagine cambia senza shift visibile. Desktop: `width: 160px` al posto di 150px (layout desktop è lo stesso frame, più grande).

### Layout override

Quando `layoutMode === "compact_corner"` (settato via `activity.character_layout_override` sul JSON attività, oggi valorizzato solo per `build`):

- Il personaggio si sposta in basso a destra
- Non ruba spazio orizzontale al word bank / drag-and-drop
- Size ridotto a 70×140

In tutti gli altri casi: `layoutMode === "default"` → colonna sinistra dentro ActivityArea.

### Comportamento transizione pose

Al cambio di `pose`, il componente applica una breve crossfade CSS (150ms) tra la pose vecchia e la nuova. Non animazioni complesse — la roadmap non le chiede. Una semplice `opacity` transition basta.

### Accessibilità

- `alt` dell'immagine: `"{characterName} — {poseName}"` (es. "Mario — idle")
- Decorativo? No: il personaggio è parte del contesto narrativo. Ma il contenuto informativo principale è testuale (prompt, options), quindi screen reader può ignorarlo se l'utente preferisce. Mettiamo `aria-hidden="false"` ma con alt descrittivo conciso.

---

## 3. LessonHeader (wrapper)

### Scope

Sostituisce/avvolge la top bar esistente della lesson page. Include:

1. `LessonTopBar` — esistente, eventualmente refactorato: close button, progress bar, crediti, audio toggle
2. `LessonContextBar` — nuovo, render del contesto geotemporale

### Props API del wrapper

```typescript
interface LessonHeaderProps {
  // pass-through a LessonTopBar
  progress: number;              // 0-100
  credits: number;
  audioEnabled: boolean;
  onClose: () => void;
  onToggleAudio: () => void;

  // props per LessonContextBar
  context: MergedContext;        // risultato del merge theme.context + unit.context_override
}
```

### `LessonContextBar` — rendering

Input: `MergedContext` già risolto dal chiamante.

```typescript
interface MergedContext {
  emoji: string;                 // obbligatorio
  place: { it: string; en: string };     // obbligatorio
  city: { it: string; en: string } | null;   // nullable (T12 "Al telefono")
  time: { it: string; en: string };      // obbligatorio
}
```

**Rendering**:

```
{emoji} {place[lang]} — {city[lang]}, {time[lang]}
```

Se `city === null`:

```
{emoji} {place[lang]} — {time[lang]}
```

**Esempi render** (lang resolution gestita da `shouldRenderEN` utility esistente):

```
☕ Al Bar di Mario — Napoli, mattina presto
💰 Al mercato di Forcella — Napoli, fine settimana
📞 Da qualche parte — un pomeriggio qualsiasi
```

**Stile**: riga sottile, padding verticale 8px, font-size leggermente più piccolo della top bar, color muted. Non deve rubare attenzione al prompt dell'attività.

### Merge logic (vive in LessonPage, non nel componente)

```
function mergeContext(themeContext, unitContextOverride) {
  if (!unitContextOverride) return themeContext;
  return {
    emoji: unitContextOverride.emoji ?? themeContext.emoji,
    place: unitContextOverride.place ?? themeContext.place,
    city:  unitContextOverride.city  !== undefined ? unitContextOverride.city : themeContext.city,
    time:  unitContextOverride.time  ?? themeContext.time,
  };
}
```

Nota sul `city`: il `??` non va bene perché `null` è un valore valido (non "assente"). Serve `!== undefined` per distinguere "non sovrascritto" da "sovrascritto a null".

Funzione di merge sta in `lib/context.js` — riusabile da altre pagine (es. unit-complete screen se mostra il contesto).

### `LessonTopBar` — refactor minimale

Se il componente attuale esiste come blocco dentro `page.js`, lo estraiamo in `components/lesson/LessonTopBar.jsx` senza cambiare logica. Se è già un componente separato, rinominazione opzionale per coerenza.

**Principio**: P2.c tocca il minimo indispensabile dell'esistente. Non riscriviamo la top bar.

---

## 4. CulturalInsightModal

### Scope

Modal che mostra una pillola culturale quando l'utente tappa "Perché?" nel feedback. Chiusura solo con tap esplicito su "Got it" / "Capito" (roadmap §2).

### Props API

```typescript
interface CulturalInsightModalProps {
  insight: CulturalInsight | null;    // null = chiuso
  onClose: () => void;
  lang: 'it' | 'en' | 'both';        // da user preference, esistente
}

interface CulturalInsight {
  id: string;
  emoji?: string;
  title: { it: string; en: string };
  body: { it: string; en: string };
  trigger_vocab_refs: string[];
  trigger_contexts: string[];
}
```

### Rendering

Layout modal centrato (mobile: bottom sheet, desktop: dialog):

```
┌────────────────────────────────────────┐
│                                        │
│  {emoji}  {title.it}                   │
│           {title.en}                   │
│                                        │
│  ───────────────────────                │
│                                        │
│  {body.it}                             │
│                                        │
│  {body.en}                             │
│                                        │
│                                        │
│  [       Got it →                  ]   │
└────────────────────────────────────────┘
```

- Bilingue: IT e EN entrambi renderizzati, separati da linea o spacing. La regola `shouldRenderEN` esistente gestisce il caso `it === en` (improbabile ma possibile per titoli brevi).
- Highlighting `«termine»` → `<u>termine</u>`: il componente usa la utility `renderText` esistente (citata in bibbia-tecnica).
- Nessuna X di chiusura in alto a destra. Solo "Got it →" in basso. Design intenzionale (roadmap §2).
- Backdrop click: **non chiude**. Solo il button chiude. (Coerente con "Got it" esplicito.)

### Stile

- Bottom sheet su mobile (width 100%, bordi superiori arrotondati, appare con slide-up)
- Dialog centrato su desktop (max-width 500px, bordi arrotondati, backdrop scuro)
- Body text 15-16px, leggibile
- `body` può contenere 3-5 righe — max ~400 caratteri per lingua, enforced via validator o content review

### Stato in LessonPage

La modal è controllata da `insightModalOpen` + `currentInsight`. Quando chiusa, `insight` è `null` e il render è `null` (non renderizza nulla nel DOM).

### Selezione `currentInsight` (logica)

Quando l'utente tappa "Perché?" nel feedback, LessonPage chiama:

```
function selectInsight(activity, unitMeta, seenInsightIds) {
  const insights = unitMeta.cultural_insights;

  // 1. Match esatto su vocab o context
  const matchVocab = insights.find(i =>
    i.trigger_vocab_refs.some(ref => activity.vocab_focus.includes(ref))
  );
  if (matchVocab) return matchVocab;

  const matchContext = insights.find(i =>
    activity.data.context_type && i.trigger_contexts.includes(activity.data.context_type)
  );
  if (matchContext) return matchContext;

  // 2. Fallback (a): prima insight non ancora vista
  const unseen = insights.find(i => !seenInsightIds.has(i.id));
  if (unseen) return unseen;

  // 3. Tutte già viste: prima dell'unità (repeat)
  return insights[0];
}
```

Dopo render, LessonPage aggiunge `insight.id` a `seenInsightIds`. Persistenza: `sessionStorage` chiavato per `unit_id` (non per lezione — scope unità).

**Perché scope unità**: insight che vale per `per_favore` deve comparire una sola volta in tutta l'unità, non rifarla ogni lezione. Reset al cambio unità.

---

## 5. Hook `useAngloTrapSelector`

### Scope

Selettore runtime per l'arricchimento del `feedback_err` con il `tip` di una trappola anglofono. Enforce densità max 1 trap-feedback per lezione (roadmap §5).

### API

```typescript
function useAngloTrapSelector(
  lessonId: string,
  themeAngloTraps: AngloTrap[]
): {
  getTipForContext: (contextType: string) => AngloTrap | null;
  hasTrapFired: boolean;
}
```

### Comportamento

- Stato interno: `hasTrapFired` per `lessonId`. Persistenza: `sessionStorage[`trap_fired:${lessonId}`]`.
- `getTipForContext(contextType)`:
  - Se `hasTrapFired === true` → ritorna `null` (già sparata una in questa lezione)
  - Altrimenti cerca in `themeAngloTraps` la prima trap il cui `trigger_contexts` include `contextType`
  - Se trova: marca `hasTrapFired = true`, ritorna la trap
  - Se non trova: ritorna `null` (senza marcare)

### Uso in LessonPage

Al render del feedback_err:

```jsx
const { getTipForContext } = useAngloTrapSelector(lessonId, themeMeta.anglo_traps);

const trap = activity.data.context_type ? getTipForContext(activity.data.context_type) : null;

<FeedbackArea kind="err">
  {feedback_err.it}
  {feedback_err.en}
  {trap && <AngloTrapNote tip={trap.tip} />}
</FeedbackArea>
```

### AngloTrapNote (sotto-componente interno a FeedbackArea)

Semplice render bilingue del `tip`, stile "nota pedagogica" leggermente distinto dal feedback principale (es. border-left, icona 💡).

### Reset

Al cambio lezione, il `sessionStorage` key cambia automaticamente (diverso `lessonId`) → nuovo stato, `hasTrapFired = false`. Nessun cleanup manuale richiesto.

---

## 6. Integrazione in lesson page.js

### Refactor minimal

Prima di P2:

```
export default function LessonPage({params}) {
  // fetch lesson
  // stato esercizio
  // render attività + feedback
}
```

Dopo P2:

```
export default function LessonPage({params}) {
  // fetch lesson + unit-meta + theme-meta (già presente)
  // stato esercizio (come prima)

  // NUOVO: stato pose
  const [characterPose, setCharacterPose] = useState(1);

  // NUOVO: stato insight modal
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(null);

  // NUOVO: set insight visti (persistito in sessionStorage keyed by unit_id)
  const seenInsightIds = useSeenInsights(unitId);

  // NUOVO: hook trap selector
  const { getTipForContext } = useAngloTrapSelector(lessonId, themeMeta.anglo_traps);

  // NUOVO: merge context
  const mergedContext = mergeContext(themeMeta.context, unitMeta.context_override);

  // event handlers
  function handleAnswer(correct) {
    if (correct) setCharacterPose(3);       // celebrate
    else {
      setCharacterPose(attemptCount === 0 ? 4 : 2);  // surprise / serious
    }
  }

  function handleWhyTap() {
    const insight = selectInsight(currentActivity, unitMeta, seenInsightIds);
    setCurrentInsight(insight);
    setInsightModalOpen(true);
    seenInsightIds.add(insight.id);
  }

  function handleInsightClose() {
    setInsightModalOpen(false);
    setCurrentInsight(null);
  }

  return (
    <>
      <LessonHeader
        progress={progress}
        credits={credits}
        audioEnabled={audio}
        onClose={onClose}
        onToggleAudio={onToggleAudio}
        context={mergedContext}
      />

      <LessonBody>
        <CharacterStage
          characterId={currentActivity.character_id}
          pose={characterPose}
          layoutMode={currentActivity.character_layout_override || "default"}
          characterName={resolveCharacterName(currentActivity.character_id)}
        />
        <ActivityArea>
          <DomandaRouter activity={currentActivity} onAnswer={handleAnswer} />
        </ActivityArea>
      </LessonBody>

      <FeedbackArea
        kind={lastFeedbackKind}
        feedback={currentActivity.feedback_err}
        trapTip={lastFeedbackKind === 'err' ? getTipForContext(currentActivity.data.context_type) : null}
        onWhyTap={handleWhyTap}
      />

      <CulturalInsightModal
        insight={insightModalOpen ? currentInsight : null}
        onClose={handleInsightClose}
        lang={userLangPref}
      />

      <CTAArea ... />
    </>
  );
}
```

### Deltas rispetto al pre-P2

1. `LessonHeader` wrappa la top bar esistente → refactor minimo
2. `CharacterStage` è nuovo → aggiunta pura
3. `CulturalInsightModal` è nuovo → aggiunta pura
4. `FeedbackArea` estesa con `trapTip` prop e `onWhyTap` callback → modifica esistente
5. Nuovi stati: `characterPose`, `insightModalOpen`, `currentInsight`, `seenInsightIds`
6. Nuovi hook: `useSeenInsights`, `useAngloTrapSelector`
7. Merge context preprocessato una volta, passato a `LessonHeader`

**Nessuna modifica a**: `DomandaRouter`, gli 8 componenti attività, la logica di scoring, il flusso CTA.

---

## 7. File structure

```
app/lesson/[livello]/[unita]/[lezione]/
└── page.js                                   (modificato)

components/lesson/
├── LessonHeader/
│   ├── index.jsx                             (wrapper)
│   ├── LessonTopBar.jsx                      (estratto da page.js se non esiste già)
│   └── LessonContextBar.jsx                  (nuovo)
│
├── CharacterStage/
│   ├── index.jsx                             (nuovo)
│   ├── CharacterStage.module.css             (stili pose + layout)
│   └── resolveAsset.js                       (utility path + fallback)
│
├── CulturalInsightModal/
│   ├── index.jsx                             (nuovo)
│   └── CulturalInsightModal.module.css
│
└── FeedbackArea/
    ├── index.jsx                             (modificato: +trapTip, +onWhyTap)
    └── AngloTrapNote.jsx                     (nuovo, interno)

lib/
├── context.js                                (nuovo: mergeContext)
├── insights.js                               (nuovo: selectInsight)
└── hooks/
    ├── useSeenInsights.js                    (nuovo)
    └── useAngloTrapSelector.js               (nuovo)

data/config/
└── personaggi.json                           (esistente: già usato, leggiamo da qui emoji fallback)
```

### Note path

- Coerente con Next.js app router esistente (controllare `app/` vs `src/app/` — probabilmente `app/` root)
- Nessuna nuova dipendenza npm: tutti componenti built-in React, CSS modules, session storage nativo
- `components/lesson/` potrebbe già esistere — da verificare in P2.e. Se no, si crea.

---

## 8. Ordine implementazione P2.e

Sequenza raccomandata per ridurre conflitti e permettere commit atomici. Ogni step è un commit.

### P2.e.1 — Utility & hooks (30 min)

- `lib/context.js` (mergeContext)
- `lib/insights.js` (selectInsight)
- `lib/hooks/useAngloTrapSelector.js`
- `lib/hooks/useSeenInsights.js`
- Unit test sintetici per ciascuno in `tests/`

**Commit**: `feat(p2): utility merge context + insight selector + hook trap`

### P2.e.2 — CharacterStage (45 min)

- `components/lesson/CharacterStage/` completo
- Testato in isolamento con Mario (asset disponibili) e Sofia (fallback emoji)
- Tutte 4 pose
- Layout compact_corner

**Commit**: `feat(p2): CharacterStage polimorfico con 4 pose + fallback emoji`

### P2.e.3 — LessonHeader (30 min)

- `components/lesson/LessonHeader/` + sottocomponenti
- Extract LessonTopBar da page.js se necessario
- LessonContextBar nuovo

**Commit**: `feat(p2): LessonHeader con context bar geotemporale`

### P2.e.4 — CulturalInsightModal + FeedbackArea extension (45 min)

- Modal completo
- FeedbackArea estesa con button "Perché?" e AngloTrapNote
- Wiring con stato LessonPage via props

**Commit**: `feat(p2): CulturalInsightModal + trap note nel feedback`

### P2.e.5 — Integrazione LessonPage (60 min)

- Refactor `app/lesson/.../page.js`
- Stati nuovi, handler, merge context, wiring completo
- Test manuale end-to-end su Tema 1 Saluti L1+L2 (anche se meta ancora senza context/insight — verrà fatto in P2.d)

**Commit**: `feat(p2): LessonPage integrata con CharacterStage + header + modal`

### P2.e.6 — CSS polish e responsive check (30 min)

- Desktop vs mobile
- Dark mode (se attivo nel progetto, altrimenti rimandare)
- Transizioni pose

**Commit**: `style(p2): polish layout + responsive check`

**Totale P2.e**: ~4 ore, 6 commit. Coerente con stima roadmap (3-4 ore).

### Blocco attività `build` (eccezione layout)

Durante P2.e.5, il `character_layout_override: "compact_corner"` sulle attività `build` va validato visivamente. Se il word bank rende male con il personaggio a 70×140 in basso a destra → adjustment CSS in P2.e.6.

---

## 9. Test sintetici raccomandati

Tutti in `tests/p2/`. Usiamo il pattern esistente (vedi `test_strict_category.py`).

### Test 1 — `test_merge_context.js`

- theme.context senza unit_override → identity
- theme.context con unit_override parziale (solo `time`) → merge shallow
- theme.context con unit_override che sovrascrive `city` a null → null vince
- theme.context con unit_override che omette `city` → theme.city persiste

### Test 2 — `test_insight_selector.js`

- Match su vocab_ref → insight corrispondente
- Match su context_type → insight corrispondente
- Nessun match, seen vuoto → prima insight dell'unità
- Nessun match, seen completo → prima insight (repeat)
- Priorità vocab > context quando entrambi matchano

### Test 3 — `test_anglo_trap_selector.js`

- Primo match in lezione → ritorna trap, marca fired
- Secondo match stessa lezione → ritorna null
- Cambio lesson_id → ritorna trap di nuovo
- Context non in nessun trigger → null, non marca fired

### Test 4 — asset resolver

- `resolveAsset('mario', 1)` → path corretto
- `resolveAsset('sofia', 1)` → path teorico, ma asset non esiste → fallback emoji
- `resolveAsset('nonexistent', 1)` → fallback neutro

### Test 5 — presenza file asset

Check che il file esiste su disco per Mario tutte 4 pose (dopo P2.a). Può essere un check pre-commit nel validator.

---

## 10. Decisioni aperte (piccole)

Punti non critici che vale la pena esplicitare per evitare ambiguità in P2.e:

1. **Animazione pose**: crossfade 150ms CSS puro, nessuna libreria (no framer-motion ecc.)
2. **Backdrop modal click**: non chiude (coerente con "Got it" esplicito)
3. **Tasto ESC sul modal**: chiude (accessibilità minima) — OK deviare leggermente dalla roadmap
4. **Modal focus trap**: non richiesto per v1, aggiungibile dopo test utenti
5. **Sound effect sulla pose change**: out of scope P2
6. **Persistenza trap_fired**: sessionStorage. Refresh pagina → trap può sparare di nuovo. Accettabile per v1.
7. **i18n lang resolution**: usa la utility `shouldRenderEN` esistente, non reimplementare

Se uno di questi contraddice decisioni già prese altrove, lo allineo su segnalazione.

---

## Firma documento

**Deliverable**: P2.c — Design componenti React P2.
**Risposte a**: `docs/P2-roadmap.md` §3-6, `docs/schema-lezione-v2.md` §15.
**Prossima sessione**: P2.d (retrofit L1+L2 Saluti con nuovi meta) oppure P2.e.1 (implementazione utility + hooks).
**Dopo P2.d+e**: switch warning → bloccante nel validator + P2.f (scrittura contenuti).
**Commit suggerito**: `docs(p2): design componenti React — CharacterStage + LessonHeader + CulturalInsightModal + hook trap`.
