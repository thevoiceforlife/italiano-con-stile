# Audit Completo — 20 Aprile 2026

Commit base: 6027f42

---

## PARTE 2 — Emoji duplicate (AGGIORNAMENTO)

### Trovato: opzioni emoji 🏛️ duplicata in unit5

Il campo `emoji` nel **vocabolario** e corretto:
- ⛲ La piazza
- ⛪ La chiesa
- 🏛️ Il museo

Ma nelle **opzioni tap_right/multipla** (campo `emoji` nelle options), 🏛️ e usata per ENTRAMBI "La piazza" e "Il museo":

| File | Question | Emoji | Testo |
|---|---|---|---|
| boss.json q1 | 🏛️ | La piazza |
| boss.json q1 | 🏛️ | Il museo |
| boss.json q4 | 🏛️ | La piazza |
| boss.json q7 | 🏛️ | La piazza |
| boss.json q7 | 🏛️ | Il museo |
| lesson1 q7 | 🏛️ | Al museo |
| lesson1 q8 | 🏛️ | Al museo |
| lesson3 q1 | 🏛️ | La piazza |
| lesson3 q1 | 🏛️ | Il museo |
| lesson5 q4 | 🏛️ | La piazza |
| lesson5 q8 | 🏛️ | La piazza |
| lesson5 q8 | 🏛️ | Il museo |

**Root cause**: il fix fontana (commit 22e8e8d) ha corretto il campo `emoji` nel vocabolario ma non ha propagato ⛲ nelle opzioni delle domande.

**Fix necessario**: sostituire `emoji: "🏛️"` con `emoji: "⛲"` per tutte le opzioni dove `it` contiene "piazza" in unit5.

**Severity: HIGH** — l'utente vede la stessa icona per due parole diverse, creando confusione visiva.

---

## PARTE 3 — Sette check di contenuto

### Tabella riassuntiva

| Classe | Descrizione | Count | Unit colpite | Severity |
|---|---|---|---|---|
| C2 | Fill blank senza hint EN | 0 | nessuna | NONE |
| C3 | Bias options[0] (stessa stringa >=3x) | 58 lezioni | unit3-15 | MEDIUM |
| C4 | Placeholder generico introIT | 436 (59%) | tutte | LOW |
| C5 | Incoerenza feedback vs risposta | 421 | unit3-15 | MEDIUM |
| C6 | Traduzione monolingue (bug) | 0 | nessuna | NONE |
| C8 | CTA assente | 1 (DomandaRouter) | N/A | LOW |
| C9 | Struttura TopBar/Body/Bottom | 13/13 OK | nessuna | NONE |

### C2 — Fill blank senza hint EN
**Count: 0** — Tutte le 79 domande fill_blank hanno `frase_en` con la traduzione inglese di riferimento (es. `= My name is Sofia.`).

### C3 — Bias options[0]
**Count: 58 lezioni con bias** — Nelle unit generate (3-15), la stessa parola appare come options[0] in >=3 domande della stessa lezione. Il problema e strutturale: il template assegna la prima parola del vocabolario come risposta corretta per la maggior parte delle domande.

Esempi:
- unit10/lesson3: "La mamma" e options[0] in 7 domande su 8
- unit11/lesson3: "Rosso" e options[0] in 7 domande su 8
- unit12/lesson3: "Pronto" e options[0] in 7 domande su 8
- unit13/lesson3: "Il mercato" e options[0] in 7 domande su 8
- unit14/lesson3: "Fa caldo" e options[0] in 7 domande su 8

**Root cause**: il template generatore ha usato la prima parola del vocabolario come risposta corretta per quasi tutte le domande lesson3. `stableShuffle` randomizza l'ordine a runtime, ma l'utente vedrebbe la stessa parola come risposta corretta ripetutamente.

**Severity: MEDIUM** — l'utente impara una parola e ignora le altre 5.

### C4 — Placeholder generico introIT
**Count: 436 (59%)** — La maggior parte delle domande usa placeholder generici come bubble intro.

| Categoria | Count | % |
|---|---|---|
| Placeholder generico | 436 | 59% |
| Tipo-specifica | 171 | 23% |
| Altro (contesto specifico) | 131 | 18% |
| Assente | 0 | 0% |

Esempi placeholder: "Veloce!" (117x), "Ascolta!" (98x), "Situazione!" (93x), "Pratica!" (88x), "La Nonna testa!" (68x).

**Severity: LOW** — funzionali a livello A1. Il fix `getIntroBilingual` gia sovrascrive per domande traduzione.

### C5 — Incoerenza feedback vs risposta
**Count: 421** — Il feedbackOk.it non menziona la parola della risposta corretta. Prevalentemente nelle unit generate dove il feedback e generico ("Bravo! La Nonna sorride!") invece di specifico ("Bravo! La mamma = the mum!").

Esempi:
- unit10/boss q1: opt0="Il papa" feedbackOk="Bravo! La Nonna sorride!"
- unit10/boss q3: opt0="La mamma" feedbackOk="Bravo! La Nonna sorride!"
- unit11/boss q1: opt0="Rosso" feedbackOk="Bravo! La Nonna sorride!"
- unit12/boss q1: opt0="Pronto" feedbackOk="Bravo! La Nonna sorride!"

**Root cause**: il template generatore ha usato feedback generico "Bravo! La Nonna sorride!" per i boss e "Bravo!" per le lesson, senza includere la parola corretta nel feedback.

**Severity: MEDIUM** — il feedback non rinforza l'apprendimento. Viola il principio "Finally someone explains why".

### C6 — Traduzione monolingue
**Count: 0** — Tutte le 216 domande traduzione hanno opzioni bilingue (it + en). Nessun bug.

### C8 — CTA assente

| Componente | CTA | Tipo |
|---|---|---|
| DomandaMultipla | OK | FeedbackBar |
| DomandaVeroFalso | OK | FeedbackBar |
| DomandaAscolta | OK | FeedbackBar |
| DomandaWordBank | OK | AVANTI inline |
| DomandaAbbina | OK | onComplete auto |
| DomandaFillBlank | OK | btn-cta custom |
| DomandaDialogo | OK | onComplete auto |
| DomandaAscoltoGiudica | OK | FeedbackBar |
| DomandaTapRight | OK | FeedbackBar |
| DomandaGiustoONo | OK | FeedbackBar |
| DomandaCompletaRisposta | OK | FeedbackBar |
| DomandaAscoltaRipeti | OK | FeedbackBar |
| **DomandaRouter** | **MISS** | N/A — e un router, non un componente visuale |

DomandaRouter e un dispatcher che delega ai componenti specifici — non renderizza UI direttamente. Il "MISS" e atteso e non e un bug.

### C9 — Struttura TopBar/Body/Bottom

Tutti i 13 componenti hanno `app-body` + `app-bottom` (o equivalente). TopBar e renderizzata a livello superiore in `QuizFase` (TricoloreBar + LessonTopbar + BarraSecondaria), non nei singoli componenti domanda. Pattern corretto e uniforme.

---

## PARTE 4 — Dashboard icon in topbar (investigation)

### Componente attuale

**File**: `app/components/LessonTopbar.js`
**Props**: `{ unita, lezione, confirmMsg }`

**Layout attuale** (3 elementi in riga):
```
[🏠 Home]  [Titolo lezione]  [🔊/🔕 Audio]
```

- Sinistra: bottone 🏠 (32x32, border-radius 50%, bg-el) — naviga a `/` con conferma
- Centro: titolo bilingue (mobile: `U1 · L1`, desktop: `Unita 1 · Lezione 1`)
- Destra: bottone 🔊/🔕 (32x32, stesso stile) — toggle `localStorage ics_audio`

### Dove aggiungere l'icona dashboard

**Posizione suggerita**: a destra, PRIMA del bottone audio. Layout diventerebbe:
```
[🏠 Home]  [Titolo]  [📊 Dashboard]  [🔊 Audio]
```

Oppure, su mobile dove lo spazio e limitato, sostituire il testo titolo con solo icona e mettere dashboard accanto.

### Destinazione del bottone

Due opzioni:
1. **Dashboard generale** (`/dashboard`) — mostra statistiche globali
2. **Dashboard unit-specifica** — non esiste attualmente, servirebbe crearla

Dato che `unita` e gia disponibile come prop, il bottone potrebbe navigare a `/dashboard?unit=${unita}` o semplicemente `/dashboard`.

### Implementazione (da fare dopo decisione)

Nel file `LessonTopbar.js`:
- Aggiungere un terzo `<button>` con `style={iconBtnStyle}` tra il titolo e il bottone audio
- `onClick` → `router.push("/dashboard")`
- Emoji: 📊 o 📈 o la custom icon del progetto
- Conferma non necessaria (il progresso e gia salvato per domanda)

### Note

- Il componente e usato sia in `QuizFase` (lezioni normali) che in `VocabMatch`
- Non e usato nella pagina boss standalone (`app/lesson/boss/page.js`) — quella ha una topbar diversa
- Il bottone home gia ha conferma; il dashboard non dovrebbe averne (navigazione non distruttiva perche il progresso e per-domanda, non per-lezione)
