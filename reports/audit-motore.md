# Audit Motore — Stato reale vs atteso

Data: 2026-04-19
Commit base: 4d9a61c

## Executive summary

738 domande su 15 unit A1. Il motore funziona e il validator blocca i bug critici (9 check attivi). I problemi principali sono: (1) **391 feedbackErr con IT==EN** nelle unit5-15 generate — risolti a runtime da `shouldRenderEN` ma i dati restano degradati; (2) **490/738 domande (66%) con context_type=unknown** nella taxonomy — il classifier copre solo i primi 4 temi, unit5-15 sono quasi tutte non classificate; (3) **5 regole della bibbia non enforce dal validator** (feedback template, emoji uniche, max righe, max parole, distrattori). Raccomandazione: estendere la taxonomy a tutti i temi A1, poi attivare i check mancanti.

## Numeri chiave

| Metrica | Valore |
|---|---|
| Unit A1 | 15 |
| Domande totali | 738 |
| feedbackErr IT==EN (dato degradato) | 391 (53%) |
| context_type=unknown nella taxonomy | 490 (66%) |
| Check validator attivi | 9 (5 BLOCKING, 4 WARNING) |
| Regole bibbia non nel validator | 5 |
| Emoji duplicate nel vocabolario | 0 (risolte) |
| Template generator Python | non presente (generazione one-shot) |

---

## Sezione 1 — Contenuto

### 1.1 Census

- A1: 15 unit, ciascuna con 5 lesson + 1 boss = 90 file JSON
- 738 domande totali (49 per unit, eccetto unit2 con 52)
- Unit1-2: scritte manualmente, alta qualita
- Unit3-4: scritte con assistenza, qualita buona
- Unit5-15: generate da template one-shot, qualita variabile
- Fasi: unit1-2 hanno distribuzione personalizzata; unit3-15 seguono pattern fisso (19 riconoscimento, 17 comprensione, 13 produzione)

**Severity: LOW** — la struttura e completa e coerente.

### 1.2 Top introIT placeholder

I 5 introIT piu frequenti coprono il 65% delle domande:
- "Veloce!" (117), "Ascolta!" (98), "Situazione!" (93), "Pratica!" (88), "La Nonna testa!" (68)

Questi sono generici ma funzionali a livello A1. Il fix `getIntroBilingual` gia sovrascrive per domande traduzione (`= ?` → "Traduzione!").

**Severity: LOW** — funzionali, migliorabili in futuro.

### 1.3 Emoji duplicate vocabolario

Zero duplicati trovati. Il fix precedente (commit eeed9bd) ha risolto tutti i 26 duplicati originali.

**Severity: NONE** — risolto.

### 1.4 Q7/Q8 produzione vs traduzione (unit5-15)

| Categoria | Count |
|---|---|
| Produzione narrativa (corretto) | 77 |
| Traduzione pura `«X» = ?` (lesson4 only) | 22 |
| Fill_blank (neutro) | 22 |

Le 22 traduzioni pure sono tutte in lesson4 (ascolto) — `multipla` con `«parola» = ?`. Il validator Check 5 blocca `tap_right` con `= ?` ma non `multipla`. Queste non sono violazioni della matrice (L4 e di ascolto/comprensione, non produzione).

**Severity: LOW** — pattern coerente con la matrice, non e un bug.

### 1.5 Campi IT == EN

| Campo | Count | Gravita |
|---|---|---|
| feedbackErr IT==EN | 391 | **HIGH** — dato degradato, gestito a runtime da shouldRenderEN |
| domanda traduzione `«...» = ?` | 215 | OK — by design |
| domanda NON traduzione | 0 | OK |
| feedbackOk IT==EN | 0 | OK |
| introIT==intro_en | 0 | OK |

Il problema reale e concentrato su `feedbackErr`: 391 domande (53%) nelle unit5-15 hanno feedbackErr.it identico a feedbackErr.en. Questo e un artefatto della generazione batch. Il fix runtime (`shouldRenderEN`) nasconde la riga EN quando identica, ma i dati restano non tradotti.

**Severity: HIGH** — 391 feedback non tradotti. Impatto UX ridotto da shouldRenderEN ma il dato e degradato.

### 1.6 Icona piazza

`⛲ La piazza = The square` in unit5/lesson1. Fontana presente e corretta (fix commit 22e8e8d).

**Severity: NONE** — risolto.

### 1.7 Taxonomy coverage

490/738 domande (66%) hanno `context_type=unknown`. Distribuzione:

| Unit | Unknown | Causa |
|---|---|---|
| unit1 | 18 | Contesti narrativi non triggerati (es. "Mario apre il bar") |
| unit2 | 19 | "Matilde chiede...", "La Nonna presenta..." |
| unit3 | 32 | Cortesia (Prego, Per favore, Ecco a lei) non in taxonomy |
| unit4 | 37 | Direzioni (Dov'e?, A destra) non in taxonomy |
| unit5-15 | 384 | Temi non coperti (luoghi, numeri, tempo, cibo, descrizioni, famiglia, colori, telefono, mercato, meteo, emozioni) |

**Severity: MEDIUM** — la taxonomy funziona per unit1-2, serve estensione per unit3-15.

---

## Sezione 2 — Codice

### 2.1 Scripts Python

| File | Scopo |
|---|---|
| `scripts/validate-lessons.py` | Pre-commit validator (8 check + strict category) |
| `scripts/validate_lessons.py` | Symlink a validate-lessons.py (per import Python) |
| `tests/test_strict_category.py` | 3 sanity test per strict_category_check |

**Nessun template generator Python presente.** Le unit5-15 sono state generate in una sessione one-shot (commit b2a10f9) senza script riutilizzabile.

**Severity: MEDIUM** — manca lo strumento per rigenerare/aggiornare contenuto batch.

### 2.2 View components

13 componenti domanda, tutti in `app/lesson/[livello]/[unita]/[lezione]/page.js` (file monolitico, ~1845 righe):

| Componente | Righe | Bubble | Intro | QBox | Feedback |
|---|---|---|---|---|---|
| DomandaMultipla | 107 | si | si | si | si |
| DomandaVeroFalso | 64 | si | si | — | si |
| DomandaAscolta | 149 | si | si | — | si |
| DomandaWordBank | 196 | si | — | — | — |
| DomandaAbbina | 253 | si | si | — | — |
| DomandaFillBlank | 192 | si | — | — | — |
| DomandaDialogo | 106 | si | si | — | — |
| DomandaAscoltoGiudica | 72 | si | si | — | si |
| DomandaTapRight | 76 | si | si | — | si |
| DomandaGiustoONo | 72 | si | si | — | si |
| DomandaCompletaRisposta | 80 | si | si | — | si |
| DomandaAscoltaRipeti | 75 | si | si | — | si |
| DomandaRouter | 135 | — | si | — | — |

DomandaWordBank e DomandaFillBlank gestiscono il feedback internamente (non usano FeedbackBar).

**Severity: LOW** — funzionale ma il file monolitico potrebbe beneficiare di code splitting futuro.

### 2.3 Campo `fase`

Dual use:
1. **Stato UI** della pagina lezione: `intro` → `quiz` → `popup` → `done` (determina quale schermata mostrare)
2. **Campo JSON** delle domande (`q.fase`): `riconoscimento` / `comprensione` / `produzione` — usato come badge decorativo nella BarraSecondaria, non guida logica

**Severity: NONE** — la nomenclatura e confusa ma non causa bug.

---

## Sezione 3 — Validator

### 3.1 Check attivi

| # | Cosa verifica | Severity |
|---|---|---|
| 1 | correct=0 sempre nel JSON | BLOCKING |
| 2 | Feedback non vuoto + non generico + no emoji EN | BLOCKING |
| 3 | Almeno 2 opzioni | BLOCKING |
| 4 | Boss: parole dal vocabolario lesson1-5 | WARNING |
| 5 | Q7/Q8 tap_right non traduzione pura | BLOCKING |
| 6 | No emoji in contesto_en / intro_en | BLOCKING |
| 7 | Domanda bilingue presente (it + en) | WARNING |
| 8 | Coerenza semantica context↔answer (strict) | BLOCKING |

### 3.2 Gap: regole in bibbia non nel validator

| Regola documentata | Enforce | Severity suggerita |
|---|---|---|
| Feedback template ❌→✅ + REGOLA + analogia EN | NO | WARNING (regex heuristic) |
| Emoji uniche per unit (vocabolario) | NO | BLOCKING |
| Max 2 righe feedback | NO | WARNING |
| Frasi max N parole per livello A1.x | NO | WARNING |
| Distrattori plausibili | NO | Non automatizzabile |

**Severity: MEDIUM** — 5 regole dichiarate ma non enforce. Le prime 4 sono automatizzabili.

---

## Sezione 4 — Git

### 4.1 Fix fontana

Presente nella storia: commit `22e8e8d` ("fix: la piazza → ⛲ fontana"). Ha raggiunto main. Confermato nei dati attuali (unit5/lesson1: ⛲ La piazza).

### 4.2 Timeline recente (ultimi 15 commit)

```
4d9a61c fix(ui): rimuove duplicazioni bilingue strutturali
8b49083 fix(ui): 4 bug UX dal secondo test utente
046c73c fix(ui): 6 bug UX post test utente
1b208fc fix(a1 boss): 2 MISMATCH bloccanti + attiva validator strict
6c299fe feat(taxonomy): v3 + migration report A1
9cb296b feat(taxonomy): primo_incontro + abbina_coppia
1b31729 docs: taxonomy coerenza semantica
d486ad7 feat: validator pre-commit + fix 56 errori JSON
8f38a25 fix: boss unit2+unit4 — rimossi distrattori non insegnati
4dafdae fix: feedback q8 lesson5 — placeholder rimosso
31b592b feat: feedback unit1/lesson5 q8 rigenerato
16d1a1d feat: 15 feedback rigenerati con template
35896f9 fix: DomandaAscolta box dimensione fissa
8e72dbe fix: rimosso placeholder Clicca per ascoltare
3f1aff6 fix: strip emoji dalla riga EN dei feedback
```

Pattern: sessione intensiva di quality fix (19 aprile 2026), validazione progressiva, taxonomy semantica.

### 4.3 Generazione batch

Commit `b2a10f9`: "feat: A1 completo — Unit5-15 generate (11 unita x 6 file = 66 lezioni, 90 parole)". Generazione one-shot senza script riutilizzabile salvato.

---

## Sezione 5 — Bibbia

### 5.1 Struttura

1773 righe, 120+ heading. Copre: regole pedagogiche (5 principi), architettura, sistema XP/energia/crediti, personaggi, matrice A1, 10 regole strutturali, temi Napoli, sessioni di lavoro (5-10 aprile), grammatica invisibile, taxonomy semantica.

### 5.2 Copertura regole note

| Regola | In bibbia | Note |
|---|---|---|
| Sistema reward foods | ✓ | Sessione 10, pool random per slot |
| Iconografia piazza=⛲ | ✗ | Decisione 19 aprile non documentata |
| Q7/Q8 produzione narrativa | ✓ | Sezione dedicata con template |
| shouldRenderEN | ✗ | Regola runtime non documentata |
| correct=0 + shuffle | ✓ | Sezione REGOLA STRUTTURALE |
| Feedback template | ✓ | Template con esempi per tipo |
| Lessico boss | ✓ | Sezione dedicata + checklist |
| Emoji solo IT mai EN | ✓ | REGOLA EMOJI NEI JSON |
| Coerenza semantica | ✓ | Sezione completa con taxonomy |

**2 regole non documentate**: iconografia piazza e shouldRenderEN.

---

## Raccomandazioni prioritizzate

### P1 — Rigenerare 391 feedbackErr IT==EN (HIGH)
Script batch che chiama Claude via OpenRouter per tradurre feedbackErr.en nelle unit5-15. Template gia testato nella sessione (15/16 successi). Dipendenza: nessuna.

### P2 — Estendere taxonomy a tutti i temi A1 (MEDIUM)
Aggiungere context_types e answer_types per: cortesia, direzioni, luoghi, numeri, tempo, cibo, descrizioni, famiglia, colori, telefono, mercato, meteo, emozioni. Ridurra context_type=unknown da 490 a ~50. Dipendenza: nessuna.

### P3 — Aggiungere check validator mancanti (MEDIUM)
- Emoji uniche per unit (BLOCKING): gia calcolabile con il codice in validate-lessons.py
- Max 2 righe feedback (WARNING): conta `\n` nei campi feedbackOk/Err
- Feedback template heuristic (WARNING): regex per `❌.*→.*✅` nei feedbackErr
Dipendenza: P1 (i 391 feedbackErr degradati fallirebbero il template check).

### P4 — Documentare regole mancanti in bibbia (LOW)
- Iconografia piazza=⛲ fontana
- shouldRenderEN: hide EN se identico a IT normalizzato
Dipendenza: nessuna.

### P5 — Creare template generator riutilizzabile (LOW)
Script Python per generare/aggiornare unit da template + taxonomy + matrice. Evita rigenerazione one-shot non replicabile. Dipendenza: P2.

### P6 — Code splitting page.js (LOW)
Il file monolitico (1845 righe, 13 componenti) funziona ma potrebbe beneficiare di estrazione dei componenti domanda in file separati. Nessun impatto funzionale. Dipendenza: nessuna.
