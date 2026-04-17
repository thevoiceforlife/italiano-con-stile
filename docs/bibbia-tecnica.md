# ⚠️ REGOLE PEDAGOGICHE FONDAMENTALI

## Principio 1 — Il boss non introduce nulla di nuovo
Il boss testa SOLO vocabolario e strutture
già viste nelle 5 lezioni precedenti.
MAI concetti, parole o strutture nuove.
Prima di scrivere il boss, verifica
lesson1-5 della stessa unità.

## Principio 2 — L'utente deve vincere
Target successo per domanda:
Q1-Q2: 95% corretto (quasi impossibile sbagliare)
Q3-Q5: 80% corretto
Q6-Q7: 70% corretto
Q8+:   65% corretto
Se l'utente sbaglia spesso → abbandona.

## Principio 3 — A1 = zero grammatica esplicita
Le regole grammaticali emergono dall'uso
ripetuto — non dalla spiegazione.
La grammatica va SOLO nelle pillole
culturali opzionali — mai negli esercizi.
Feedback OK: max 1 riga celebrativa.
Feedback ERR: max 1 riga semplice.

## Principio 4 — Complessità per fase
A1.1 (Temi 1-3): max 4 parole nuove/lezione
  frasi max 4 parole, solo multipla+tap
A1.2 (Temi 4-8): max 5 parole nuove/lezione
  frasi max 6 parole, introduce fill_blank
A1.3 (Temi 9-15): max 6 parole nuove/lezione
  frasi max 8 parole, introduce word_bank

## Principio 5 — Finally someone explains why
Le spiegazioni culturali e grammaticali
vanno DOPO il successo, nelle pillole.
Durante l'esercizio: solo FARE.
Nella pillola: capire PERCHÉ.

## Principio 6 — Il boss è identico alle lezioni
Stesso vocabolario, stesse strutture,
stessi tipi di domanda già visti.
Cambia solo: il personaggio (boss character)
e il contesto narrativo.

---

## STATO ATTUALE — Aprile 2026

### Completato ✅
- Unit1 completa (L1-L5 + Boss) — matrice v2
- Unit2 completa (L1-L5 + Boss) — matrice v2
- Design system unificato implementato
- VocabMatch ridisegnato (Round 1+2)
- DomandaFillBlank nuovo design
- DomandaAbbinaCoppia bilingue + audio on demand
- DomandaAscoltaScegli — testo visibile anche con audio OFF
- LessonCompletePopup
- BossIntroPopup
- Sistema reward (gelato Nonna, slot food)
- Audio TTS con toggle 🔊/🔕
- Bilingue completo IT+EN verificato
- Deploy su Vercel: italiano-con-stile.vercel.app
- Repo: github.com/thevoiceforlife/italiano-con-stile
- Ultimo commit: main

### Da fare ❌
- Unit3 A1.1 — Tema 3 (Al bar — pagare)
- Unit4 A1.2 — Tema 4 (In giro — indicazioni)
- Unit5 A1.2 — Tema 5 (In giro — luoghi)
- Unit6-15 — Temi 6-15 Napoli
- Generatore JSON automatico
- Avatar chibi 15 personaggi
- Sistema freemium + Stripe
- Landing page
- Test su utenti reali

### Prossimo tema da scrivere
TEMA 3 — Al bar: pagare e chiedere
Vocabolario 6 parole:
1. Il conto → The bill
2. Quanto costa? → How much is it?
3. Per favore → Please
4. Grazie → Thank you
5. Prego → You are welcome
6. Ecco a lei → Here you are

### Personaggi attivi Unit3
Fisso: Mario
L1: Mario + Patricia (prima volta al bar)
L2: Mario + Hans (vuole pagare)
L3: Mario + Oliver (non capisce il coperto)
L4: Mario + Patricia (ascolta i prezzi)
L5: Mario solo (speedround)
Boss: Nonna Vittoria

### Note tecniche importanti
- Stack: Next.js 16, React 19, Vercel
- Dev: cd ~/Desktop/italiano-con-stile && npm run dev
- JSON path: data/lessons/A1/unit{N}/lesson{N}.json
- Copia sempre anche in public/data/lessons/
- Build check: npx next build — zero errori
- Commit sempre dopo ogni modifica

---

# Italiano con Stile — Bibbia Tecnica

## Progetto
- **Repo**: https://github.com/thevoiceforlife/italiano-con-stile
- **Prod**: https://italiano-con-stile.vercel.app
- **Stack**: Next.js 16, React 19, Vercel, localStorage, Web Speech API
- **Locale**: `~/Desktop/italiano-con-stile` → `npm run dev` → http://localhost:3000
- **Lingua**: tutto bilingue IT/EN senza eccezioni
- **Città di riferimento**: Napoli (non Roma)

---

## Architettura File Chiave

```
app/page.js                          — Home: pill dashboard, accordion unità, mini-game personaggi
app/dashboard/page.js                — Dashboard completa
app/components/XPBar.js              — Barra energia (streak/crediti rimossi dalla barra)
app/components/LevelBadge.js         — Livelli CEFR + categorie narrative
app/components/saveProgress.js       — Sistema reward + streak
app/components/ItalyTravelModal.js   — Modal viaggi (Capitali/Città/Mete)
app/components/CharacterBubble.js    — CHARACTERS (merge JSON config + voice), TTS parla()
app/components/PersonaggioBubble.js  — Fumetto personaggio con TTS/typewriter
app/components/VocabMatch.js         — Round 1/2 abbinamento vocaboli
app/components/games/MarioDialog.js  — Dialogo AI Claude Haiku
app/components/games/DiegoGesti.js   — Flash Gesti
app/components/games/SofiaSlang.js   — Speed Round slang
app/components/games/GinoStoria.js   — Gesto + Storia
app/components/games/MatildeEmail.js — Email Challenge AI
app/lesson/[id]/page.js              — Lezioni con FraseAnnotata in VocabIntro
public/images/italia-map.png         — Mappa PNG statica (usata nel modal)
public/images/italia-map.svg         — Mappa SVG (non ancora integrata)

data/config/personaggi.json          — Config centralizzata personaggi (nome, avatar, colore, ruolo)
data/config/unita.json               — Config centralizzata unità (titoli, personaggi, lezioni)
lib/getConfig.js                     — API: getPersonaggio(id), getUnitaConfig(livello, unita)
```

---

## Configurazione Centralizzata

### Personaggi — `data/config/personaggi.json`
Single source of truth per nome, avatar, colore e ruolo di ogni personaggio.
`CharacterBubble.js` importa questo JSON e ci aggiunge i parametri TTS runtime
(voice, rate, pitch) per costruire l'export `CHARACTERS` usato ovunque nell'app.

```
Flusso: personaggi.json → CharacterBubble.js:CHARACTERS → PersonaggioBubble, page.js, VocabMatch
```

### Unità — `data/config/unita.json`
Config per ogni unità: titoli bilingui, tipo (esplorazione/consolidamento),
personaggi coinvolti, lista lezioni, boss.

### API — `lib/getConfig.js`
```js
import { getPersonaggio } from '@/lib/getConfig'
const p = getPersonaggio('mario')  // → { nome, avatar, colore, ruolo_it, ruolo_en }
```

---

## Sistema XP / Energia / Crediti

```
Energia (XP bar):     lezioni completate → barra 0-100%
Crediti:              reward domenicale +30cr, mini-game, streak
Streak settimanale:   Lun→Dom, giorno attivo = ≥2 lezioni
```

### Fix streak (Sprint 7)
- `getDay()` restituisce 0=Dom, array parte da Lun → formula: `(new Date().getDay() + 6) % 7`
- `getMondayISO()` calcola sempre il lunedì della settimana corrente
- Reset streak su nuova settimana, `totalDays` sempre 7

### travelAccess (accesso viaggi per energia)
```
energy >= 90% → 'all'    (Capitali + Città + Mete)
energy >= 60% → 'citta'  (Città + Mete)
energy >= 25% → 'mete'   (solo Mete)
energy < 25%  → 'none'
```

---

## Sistema Livelli CEFR — LevelBadge.js

| Livello | Categoria IT | Categoria EN | Emoji | Fase |
|---------|-------------|--------------|-------|------|
| A1 | Il Turista | The Tourist | 🧳 | Scintilla |
| A2 | Il Viaggiatore | The Traveller | 🛵 | Incontro |
| B1 | L'Esploratore | The Explorer | 🗺️ | Avventura |
| B2 | L'Appassionato | The Passionate | ❤️ | Complicità |
| C1 | L'Esperto | The Expert | 🎭 | Passione |
| C2 | Il Maestro | The Master | 👑 | Essenza |

---

## Home — app/page.js

### Pill Dashboard (in alto a destra)
```
Dashboard / 🍕 Turista_4821 →
```

### Accordion Unità — Design Proposta B+A
- **Barra laterale sinistra** colorata per stato: verde=fatto, blu=attiva, grigio=bloccata
- **Cerchio col numero** dell'unità (verde ✓ se fatto, blu N se attiva, 🔒 se bloccata)
- **Progress bar** sottile sotto il titolo unità
- **Lezioni**: "Lezione N · Titolo IT / Titolo EN" + emoji nel cerchio colorato
- **Separatori tra lezioni**: tratteggiato argento `1.5px dashed #B4B2A966`
- **Separatore prima del boss**: tratteggiato dorato `1.5px dashed #E5B700AA`
- **Boss**: sempre 🍦 nel cerchio, 🔒 solo a destra se bloccato (mai a sinistra)
- **Lucchetti**: SOLO a destra per lezioni bloccate, MAI a sinistra

### Struttura UNITS (hardcoded per ora)
```js
{n:1, titleIT:'Il primo giorno a Napoli', titleEN:'First day in Naples',  lessons:[1,2,3,4], comingSoon:false}
{n:2, titleIT:'Fare conoscenza',          titleEN:'Making friends',        lessons:[],        comingSoon:true}
{n:3, titleIT:'La giornata napoletana',   titleEN:'Daily Neapolitan life', lessons:[],        comingSoon:true}
```

### Mini-game Personaggi (Sprint 8)
- Import dinamici con `ssr: false` per evitare hydration errors
- Tap → mini-game, long press → bio modale
- Tutti in `app/components/games/`

---

## Dashboard — app/dashboard/page.js

### Sezioni in ordine
1. **Profilo**: avatar emoji (set fisso), nickname default `NickPrefix_seed`
2. **Energia**: barra XP
3. **Streak settimanale**: Lun→Dom, oggi evidenziato, Dom +30cr
4. **Crediti + Viaggi**: contatore crediti, bottone Viaggia, box Capitali/Città/Mete
5. **Statistiche**: 4 card
6. **Percorso A1**: unità con stato dinamico da localStorage
7. **Raccomandazioni**: rimosso "Continua da qui" — unità attiva ha icona → e va alla home

### Box Capitali/Città/Mete in dashboard
```
🏛️ Capitali / Capitals   → fucsia  #E91E8C  (energia ≥90%)
🏙️ Città    / Cities      → arancio #E67E22  (energia ≥60%)
🗺️ Mete     / Destinations → ciano  #00BCD4  (energia ≥25%)
```
- Griglia 3 colonne con bordi neon e box-shadow colorato
- Pallini progressione colorati
- Badge "✓ aperto / open" o "🔒 ≥N% ⚡"

### Percorso in dashboard
- Unità attiva → cliccabile → `router.push('/')` con icona `→`
- Unità in arrivo → `🔒 in arrivo`
- NO "Continua da qui" (rimosso — ridondante)

---

## ItalyTravelModal — app/components/ItalyTravelModal.js

### Colori sistema (NON sovrapposti ai cluster)
```
🏛️ Capitali / Capitals     → fucsia  #E91E8C
🏙️ Città    / Cities        → arancio #E67E22
🗺️ Mete     / Destinations  → ciano   #00BCD4

🔴 Icone / Icons        → 500 cr  (turismo di massa)
🟡 Tesori / Treasures   → 350 cr  (interesse crescente)
🟢 Scoperte / Discoveries → 200 cr (perla autentica)
```

**Regola costi**: cluster determina il costo, MA tutte le Capitali costano sempre 500 cr indipendentemente dal cluster.

### Layout Modal (bottom sheet mobile)
1. Header + ✕
2. Mappa PNG semplice statica (`/images/italia-map.png`) — nessun pin, nessuna interazione
3. Crediti + legenda costi cluster (🔴🟡🟢)
4. Box 3 colonne Capitali/Città/Mete con colori neon
5. Scheda città selezionata (appare dopo selezione)
6. Barra ricerca per nome/regione
7. Tab Capitali | Città | Mete
8. Lista per regione:
   - **Campania sempre prima**
   - Napoli ☀️ speciale in cima a Campania nel tab Capitali
   - Poi tutte le regioni in ordine alfabetico
   - Dentro ogni regione: città ordinate 🔴→🟡→🟢
   - Pallino cluster colorato + badge costo a destra

### Database (~145 destinazioni)
Basato sulla tabella turismo straniero ufficiale con:
- 20 Capitali di regione (tutte 🔴, 500 cr)
- ~80 Città (capoluoghi di provincia, costo per cluster)
- ~45 Mete (borghi, parchi, laghi, vulcani, coste)
- Campo `regione` per ogni città
- Campo `cluster` 🔴/🟡/🟢
- Campo `fact` con curiosità bilingue IT/EN
- Campo `desc` + `descEn`
- "Rivedi il ricordo" per città già visitate (frase poetica)

### travelAccess mapping (aggiornato)
```js
energy >= 90% → 'all'    // Capitali + Città + Mete
energy >= 60% → 'citta'  // Città + Mete
energy >= 25% → 'mete'   // solo Mete
energy < 25%  → 'none'
```

---

## XPBar — app/components/XPBar.js

- Mostra solo barra energia (streak e crediti rimossi dalla barra)
- Milestone labels aggiornate: `Mete` (25%) · `Città` (60%) · `Capitali` (90%)
- Label access: `'🇮🇹 Solo Mete / Destinations only'` | `'🇮🇹 Mete + Città / Destinations + Cities'` | `'🇮🇹 Tutto / All Italy'`

---

## Terminologia Uniforme (ovunque nell'app)

| IT | EN | Colore | Energia |
|----|----|----|---------|
| Capitali | Capitals | Fucsia #E91E8C | ≥90% |
| Città | Cities | Arancio #E67E22 | ≥60% |
| Mete | Destinations | Ciano #00BCD4 | ≥25% |
| 🔴 Icone | Icons | rosso | 500 cr |
| 🟡 Tesori | Treasures | giallo | 350 cr |
| 🟢 Scoperte | Discoveries | verde | 200 cr |

---

## Sprint Completati

| Sprint | Cosa | Stato |
|--------|------|-------|
| 7 | Fix streak, FraseAnnotata in VocabIntro | ✅ |
| 8 | Mini-game 5 personaggi (AI + Flash + Speed + Storia + Email) | ✅ |
| 9 | Dashboard, ItalyTravelModal, design sistema Capitali/Città/Mete | ✅ |

---

## Roadmap Sprint

| Sprint | Cosa | Dettagli |
|--------|------|---------|
| 10 | Biblioteca / Approfondimenti | Schede grammatica, vocabolario tematico, errori frequenti → biblioteca |
| **11** | **Router Unità** `/lesson/A1/1/1` | Struttura completa livello/unità/lezione, dati da JSON |
| 12 | Supabase Auth | Login, registrazione, profilo persistente |
| 13 | Migrazione localStorage → DB | Dati sicuri multi-device |
| 14 | Assessment A1→A2 | Gate reale al 75%, unità recupero se 60-74% |

---

## Sprint 11 — Da fare: Router Unità

### Struttura URL target
```
/lesson/A1/1/1  → Livello A1, Unità 1, Lezione 1
/lesson/A1/1/2  → Livello A1, Unità 1, Lezione 2
/lesson/A1/2/1  → Livello A1, Unità 2, Lezione 1
```

### Struttura file dati
```
/data/lessons/A1/unit1/lesson1.json
/data/lessons/A1/unit1/lesson2.json
/data/lessons/A1/unit1/boss.json
```

### Regole unità
- Unità dispari = Esplorazione (nuovi contenuti)
- Unità pari = Consolidamento (ripasso + pratica)
- 120 unità totali per livello A1/A2/B1
- Assessment gate al 75% per passare al livello successivo
- Unità recupero se 60-74%

### Decisioni architetturali
- Auth: Supabase (free tier: 50k utenti/mese)
- Beta: tutto gratis
- Soft launch: Unità 1 gratis, resto Premium
- Avatar: emoji da set predefinito ['🍕','🤌','☕','🎵','🌊','🏺','🍋','👒']
- Nickname default: `NickPrefix_seed` aggiornato al cambio livello

---

## Note Tecniche

### Mappa Italia
- PNG statica: `/public/images/italia-map.png` — usata nel modal, funziona
- SVG disponibile: `/public/images/italia-map.svg` — non integrata, da riprendere
- Calibrazione SVG (per uso futuro): `LON_OFF=6.238, LAT_OFF=47.367, PX_LON=81.6, PX_LAT=106.9`
- Coordinate testate su: Aosta, Trieste, Bari, Napoli, Palermo, Cagliari

### Claude API nei mini-game
- Modello: `claude-sonnet-4-20250514` (sempre Sonnet 4)
- Max tokens: 1000
- Costo per dialogo MarioDialog: ~$0.002
- L'API key viene gestita automaticamente — non passarla nel codice client

### localStorage keys
```
progress_v2        — progresso lezioni
tickets            — città visitate (id città → boolean)
energy             — energia attuale
credits            — crediti
streak_v2          — streak settimanale
profile            — avatar, nickname
```

---

## Sprint 11 — Completato: Router Unità

### Struttura URL implementata
```
/lesson/A1/1/1  → Livello A1, Unità 1, Lezione 1
/lesson/A1/1/2  → Livello A1, Unità 1, Lezione 2
/lesson/A1/1/boss → Boss Unità 1
```

### File creati/modificati
```
app/lesson/[livello]/[unita]/[lezione]/page.js  — nuovo router (rimpiazza [id])
app/components/LessonButton.js                  — aggiornato (livello/unita/lezione)
public/data/lessons/A1/unit1/lesson1-4.json     — JSON copiati in public/
public/data/lessons/A1/unit1/boss.json          — placeholder boss
data/lessons/A1/unit1/                          — copia locale (source of truth)
```

### Regole implementate
- Unità dispari = Esplorazione (🗺️ nuovi contenuti)
- Unità pari = Consolidamento (🔁 ripasso)
- Header lezione: "Unità N · Lezione N / Unit N · Lesson N"
- Bottone 🏠 Home con window.confirm() per evitare uscite accidentali
- Boss: salta VocabIntro se vocab è vuoto

### Note importanti
- I JSON delle lezioni vanno in ENTRAMBE le cartelle:
  - `data/lessons/[livello]/unit[N]/` — source of truth per sviluppo
  - `public/data/lessons/[livello]/unit[N]/` — serviti dal browser (obbligatorio)
- Il vecchio router `app/lesson/[id]/` è stato eliminato (conflitto slug Next.js)
- Il progresso a metà lezione NON viene salvato — uscire = ricominciare da zero (fix previsto Sprint 12 con Supabase)
- LessonButton mostra sempre "Inizia →" anche se lezione già vista (non è un bug, è by design pre-auth)

---

## Sprint 10 — Completato: Biblioteca

### Struttura
```
app/biblioteca/page.js                    — lista schede, tab Grammatica/Vocabolario
app/biblioteca/[scheda]/page.js           — scheda singola
public/data/biblioteca/index.json         — indice completo tutte le schede
public/data/biblioteca/schede/*.json      — contenuto schede (3 completate)
```

### Schede completate
- `articoli-determinativi` — Grammatica A1
- `numeri` — Vocabolario A1
- `saluti` — Vocabolario A1

### Principi della Biblioteca
- **Accesso libero per tutti i livelli** — il badge A1/A2/B1 è informativo, non restrittivo
- **Schede bloccate = comingSoon:true** nell'index.json — significa JSON non ancora scritto, non livello insufficiente
- **Tono "Finally someone explains why"** — ogni scheda ha sezione 💡 Perché/Why con spiegazione onesta
- **Struttura ogni scheda**: Mario intro → Perché → Spiegazione → Tabella → Esempi audio → Nota napoletana → Esercizi sequenziali
- **Esercizi**: multipla + vero/falso + word bank — tutto istantaneo, niente AI
- **Bottone** in dashboard con bordoSX dorato #E5B700

### Per aggiungere una nuova scheda
1. Scrivi il JSON in `public/data/biblioteca/schede/[id].json`
2. In `public/data/biblioteca/index.json` togli `comingSoon:true` dalla scheda corrispondente

### Lezioni apprese Sprint 10
- I 60 esercizi per scheda si generano qui in chat (non serve API key) — io li scrivo, tu incolla il node script
- Le word bank richiedono traduzione EN separata — NON copiare la frase IT nella EN
- Lo script di generazione automatica (`scripts/genera-esercizi.js`) esiste ma richiede chiave Anthropic diretta (`sk-ant-api03-...`) — la chiave OpenRouter (`sk-or-v1-...`) non funziona
- Flusso corretto per nuova scheda:
  1. Scrivi JSON base (titolo, perche, spiegazione, tabella, esempi, nota)
  2. Chiedi a Claude in chat i 60 esercizi
  3. Incolla il node script nel terminale
  4. Togli comingSoon dall'index.json

### Stato schede Biblioteca (aggiornato)

**Blocco 1 — A1 base ✅ COMPLETO**
- articoli-determinativi — 60 esercizi ✅
- genere-numero — 60 esercizi ✅
- articoli-indeterminativi — 60 esercizi ✅
- presente-indicativo — 60 esercizi ✅
- pronomi-soggetto — 60 esercizi ✅
- preposizioni — 60 esercizi ✅
- numeri — 0 esercizi (da fare)
- saluti — 0 esercizi (da fare)

**Blocco 2 — A2 (da fare)**
- aggettivi
- ausiliari (essere vs avere)
- verbi-modali
- verbi-riflessivi
- passato-prossimo
- imperativo
- pronomi-diretti

**Blocco 3 — B1 (da fare)**
- imperfetto
- futuro-semplice
- condizionale
- gerundio
- congiuntivo-presente
- (e altri tempi avanzati)

### Stato schede aggiornato — Blocco 1 completo ✅
- articoli-determinativi — 60 esercizi ✅
- genere-numero — 60 esercizi ✅
- articoli-indeterminativi — 60 esercizi ✅
- presente-indicativo — 60 esercizi ✅
- pronomi-soggetto — 60 esercizi ✅
- preposizioni — 60 esercizi ✅
- numeri — 60 esercizi ✅
- saluti — 60 esercizi ✅

**Blocco 2 A2 — prossimo**
aggettivi, ausiliari, verbi-modali, verbi-riflessivi, passato-prossimo, imperativo, pronomi-diretti

---

## Sprint Biblioteca — Completato (Aprile 2025)

### Stato finale
- **30 schede** totali — tutte 60/60 (20M/20VF/20WB)
- **1800 esercizi** totali
- **0 schede incomplete**

### Grammatica (23 schede)
A1: articoli-determinativi · articoli-indeterminativi · genere-numero · pronomi-soggetto · preposizioni · presente-indicativo · aggettivi · ausiliari · verbi-modali · verbi-riflessivi · imperativo
A2: pronomi-diretti · passato-prossimo · imperfetto · futuro-semplice · condizionale · condizionale-passato
B1: congiuntivo-presente · congiuntivo (tutti i tempi + congiunzioni) · periodo-ipotetico · gerundio

### Vocabolario (9 schede — incluse le 2 già esistenti)
A1: numeri · saluti · orari · direzioni · colori · famiglia
A2: cibo-bar · emozioni · falsi-amici

### Decisioni architetturali prese
- congiuntivo → scheda unica con tutti e 4 i tempi + tavola congiunzioni (campo JSON `congiunzioni`)
- condizionale-passato → NO SE ipotetico, solo rimpianto + discorso indiretto + SE whether
- periodo-ipotetico → tavola SE completa (tipo 1/2/3/misto + SE whether + colloquiale + errori)
- falsi-amici → struttura "Finally someone explains why" applicata alle trappole lessicali
- Biblioteca = accesso libero per tutti i livelli (badge A1/A2/B1 solo informativo)
- Check preventivo integrato in ogni script di generazione — se fallisce non salva

### Per aggiungere nuove schede
1. Scrivi il JSON con struttura standard in `public/data/biblioteca/schede/[id].json`
2. Genera i 60 esercizi con check preventivo (20M/20VF/20WB)
3. Togli `comingSoon` dall'`index.json`
4. La scheda è live automaticamente su Vercel


---

## Sessione 5 Aprile 2026 — Fix e Completamenti

### Bug risolti
- **Tabella formato misto** (`[scheda]/page.js`): fix `isOldFormat` per supportare sia `{headers, rows}` che array di oggetti
- **Biblioteca hidden**: aggiunto `filter(s => !s.hidden)` in `page.js` per nascondere schede duplicate
- **q undefined crash**: guard `if (!q) return null` in `DomandaRouter` — evita crash fine lezione
- **Sfida la Nonna**: `boss.json` era vuoto — popolato con 10 domande Unit1

### Pagina congiuntivo-condizionale
- Route: `/biblioteca/congiuntivo-condizionale`
- 3 tab: Tempi verbali (6 accordion) · Congiunzioni (8 categorie) · Schema SE (9 righe + raccordo + eccezioni)
- Fix colori dark theme (#15212a per sfondi espansi, #88DDAA per verde, #E5B700 per giallo)
- Fix grammaticale: studiassi → studiasse (3a persona)
- Fix raccordo: Tipo II separato da consecutio temporum (ora 6 righe)
- Fix congiunzione "anche se": chiarita distinzione indicativo (reale) vs congiuntivo (ipotetico)

### Struttura biblioteca
- congiuntivo-condizionale → sottocategoria "Congiuntivo & Condizionale", posizione dopo futuro-semplice
- condizionale, condizionale-passato, congiuntivo-presente, congiuntivo → hidden: true (raggiungibili solo dagli esercizi)

### Stato lezioni
- Sfida la Nonna Unit1: 10 domande (multipla + vero_falso), 50 XP, reward con badge 🏆


---

## Sessione 6 Aprile 2026 — Responsive Layout

### Problema risolto
- Repo aveva due cartelle annidate: `~/Desktop/italiano-con-stile/` (originale ✅) e `~/Desktop/italiano-con-stile/italiano-con-stile/` (clone errato ❌)
- Tutto il lavoro va fatto sempre da `~/Desktop/italiano-con-stile/`

### Fix critici
- Eliminato `app/lesson/[id]/page.js` — conflitto slug Next.js con `[livello]`
- Creato `app/components/LevelBadge.js` — mancante, causava build error su Vercel
- Dashboard `app/dashboard/page.js` esiste ed è funzionante — non era mai stata committata

### Sistema responsive implementato
```css
.page-narrow { max-width: 520px; margin: 0 auto; }          /* Home, Lezioni, Boss */
.page-wide   { max-width: 860px; margin: 0 auto; }          /* Dashboard, Biblioteca */
.app-shell   { width: 100%; }                                /* Layout radice */
```

### Classi applicate
```
page-narrow → app/page.js, lesson/[livello]/[unita]/[lezione]/page.js, lesson/boss/page.js
page-wide   → app/dashboard/page.js, app/biblioteca/page.js, app/biblioteca/[scheda]/page.js
page-wide   → app/biblioteca/congiuntivo-condizionale/page.js (su <div> root, non <main>)
```

### Prossimo Sprint — Layout Desktop
Tre alternative valutate (mockup in sessione):

**A — Sidebar fissa** (1100px: sidebar 220px + contenuto 880px)
**B — 2 colonne senza sidebar** (1024px: col-sx 440px + col-dx 560px) ← preferita
**C — Top bar + hero orizzontale** (960px: hero full + 3 colonne 300px)

Breakpoint unico: 768px
- Mobile < 768px → colonna unica, layout attuale invariato
- Desktop ≥ 768px → layout scelto

### Da fare prossima sessione
1. Scegliere layout desktop (A/B/C)
2. Implementare top bar navigazione desktop
3. Fix bug dashboard: badge livello sotto nickname mostra `""` vuoto
4. Verificare URL `/lesson/A1/1/1` funziona in produzione

---

## Sessione 6 Aprile 2026 — VocabMatch + Layout Desktop

### Nuovo componente: VocabMatch
- File: `app/components/VocabMatch.js`
- Sostituisce `VocabIntro` nella lezione — attività interattiva invece di lettura passiva
- Meccanica: 2x2 card italiane (emoji + parola) + 1x4 traduzioni EN da abbinare
- Batch dinamici: `computeBatches()` — se ultimo round < 2 parole fa merge col precedente
- Personaggio: immagine reale `/images/mario.png` con colore `#FF9B42`
- Colori neon: cyan `#00BCD4` per card IT, oro `#E5B700` per card EN
- Background scuro `#0f1923` — stile dark/neon
- Intro: icona pulsa → click → parla + testo si illumina parola per parola → carte si attivano
- Gioco: fumetto muto cambia stato (ok/err), audio solo sulla parola abbinata
- Animazioni icona: idle → bounce (ok) → shake (err) → spin (round done)
- Fumetto: altezza fissa 62px, reset timer annullabile su round completato

### Layout desktop full-width
- Problema: `app-shell` aveva `max-width: 480px` che strozzava tutto
- Soluzione: rimosso `max-width` da `.app-shell` in `globals.css`
- Ogni pagina gestisce il proprio max-width via `page-narrow`/`page-wide`
- VocabMatch usa `className="full-bleed"` + CSS `:has()` per uscire dal max-width
- Top bar e bottom bar ora full-width su desktop, contenuto centrato max 540px
- Pattern Duolingo: top/bottom full width, contenuto centrato, personaggio tra i due

### Fix applicati
- Rimossi file spuri dal repo (`=`, `{`, `~$iave per website.docx`)
- Aggiunto `.gitignore` per cartella annidata `italiano-con-stile/` e file Office temporanei
- Colori personaggi allineati a `CharacterBubble.js` (mario: `#FF9B42`, sofia: `#C8A0E8`, ecc.)

---

## Sessione 7 Aprile 2026 — Home Narrativa + Layout Desktop

### Home narrativa — due versioni
- **Non autenticato**: landing con hero Bar di Mario, personaggi, come funziona (Impara→Energia→Esplora), barra energia con cibo, tagline + CTA
- **Autenticato**: topbar Logo + avatar grande + Dashboard, personaggi cliccabili con hover glow, frame lezione unificato
- Distinzione: `hasProgress = !!(data && data.onboardingDone)` da localStorage

### Testi definitivi
- Hero headline: "Benvenuto al Bar di Mario / Welcome to Mario's Bar"
- Sottotitolo: "Impara da Napoli. Parla ovunque. / Learn from Naples. Speak anywhere."
- Tagline: "L'italiano inizia qui. / Italian starts here."
- CTA landing: "Siediti al bar / Take a seat →"
- CTA lezione prima volta: "Inizia / Start →"
- CTA lezione successiva: "Continua / Continue →"
- Pulsante dashboard: "Il tuo percorso / Your learning path →"
- Logo top bar: invariato "Italian for English Speakers / Finally, someone explains why."

### Frame lezione unificato
- Bordo verde neon `#27AE60` con `frame-glow` animation
- Card lezione: avatar Mario + titolo bilingue + meta
- Divisore sottile verde
- Pulsante verde pieno `#27AE60` con scritta bianca, animazione `btn-breathe` (respiro)
- Sotto: pulsante scuro bordo cyan `#00BCD4` → dashboard

### CSS animazioni aggiunte a globals.css
```css
@keyframes text-breathe { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.75;transform:scale(0.98)} }
@keyframes frame-glow   { 0%,100%{box-shadow:0 0 12px rgba(39,174,96,0.4)} 50%{box-shadow:0 0 28px rgba(39,174,96,0.75)} }
@keyframes btn-pulse    { 0%,100%{box-shadow:0 0 10px rgba(39,174,96,0.35)} 50%{box-shadow:0 0 24px rgba(39,174,96,0.75)} }
.btn-breathe { animation: text-breathe 2.5s ease-in-out infinite; }
.frame-glow  { animation: frame-glow  2.5s ease-in-out infinite; }
.btn-pulse   { animation: btn-pulse   2s ease-in-out infinite; }
```

### Personaggi nella home
- Immagini reali `/images/[id].png` con fallback emoji
- Hover glow colorato con `onMouseEnter/Leave` inline
- Click → mini-game, long press → bio modale (invariato)
- Avatar utente nella topbar: stessa dimensione dei personaggi `clamp(44px,6vw,56px)`

### Layout full-width
- `app-shell` senza max-width — ogni pagina gestisce il proprio
- Home usa `full-bleed` className
- Top bar e contenuto usano `clamp(16px,5vw,48px)` per padding orizzontale responsivo
- Contenuto centrato `maxWidth:640` dentro il padding

### Da fare prossima sessione
- Testare landing non autenticata (aprire in finestra anonima)
- Badge livello vuoto in dashboard (`""`) — bug aperto
- Fix UNDEFINED_0000 nel nickname quando non c'è profilo

---

## Sessione 8 Aprile 2026 — Landing Narrativa Finale

### Struttura landing non autenticata
1. Immagine Bar di Mario — full width, bordi squadrati, `height: clamp(200px,45vw,420px)`
2. Tricolore italiano — 2px, verde/bianco/rosso `#009246 / #fff / #CE2B37`
3. Logo componente `<Logo />` — "Italian for English Speakers / Finally, someone explains why."
4. Caption narrativa — "Benvenuto al Bar di Mario · Welcome to Mario's Bar" stesso rigo
5. Pulsante verde `#58cc02` — "L'italiano inizia qui / Italian starts here →" su un rigo
6. Hint — "Gratis · Nessuna carta / Free · No credit card"

### Video animato (futuro)
- Generare con Kling AI, Pika Labs o Runway ML
- Formato MP4 (non GIF — troppo pesante)
- Codice già pronto con fallback immagine statica
- File da copiare in `/public/images/bar-di-mario.mp4`
- `poster="/images/bar-di-mario.png"` per caricamento istantaneo

### Colori sistema aggiornati
- Verde primario CTA: `#58cc02` = `var(--primary)` — stesso del logo
- Frame lezione: bordo + glow `#58cc02`
- Tricolore: `#009246` / `#fff` / `#CE2B37`

---

## Sessione 9 Aprile 2026 — Mobile, Topbar, Fix

### Topbar home autenticata — decisione finale
- Solo `<Logo />` centrato — nessun avatar, nessun nickname
- Accesso dashboard tramite pulsante "Il tuo percorso / Your learning path →"
- Avatar e nickname rimangono solo nella dashboard

### Tricolore
- Componente `app/components/Tricolore.js` — `height` prop default 2px
- Inserito in `app/layout.js` — appare su tutte le pagine in cima
- Inserito anche sotto la topbar nella home autenticata

### Fix nickname UNDEFINED_0000
- Causa: `getLevelData()` non aveva `nickPrefix` nella struttura
- Fix: aggiunto `nickPrefix` per tutti i livelli A1→C2 in `LevelBadge.js`
- Fallback: `(lv.nickPrefix || 'Turista') + '_' + seed`

### Fix logo mobile
- Logo component non si ridimensiona con `overflow:hidden`
- Soluzione finale: topbar mostra solo Logo, nessun elemento competitivo

### Landing non autenticata — struttura finale
1. Immagine Bar di Mario full width `height: clamp(200px,45vw,420px)`
2. Tricolore 2px (dal layout)
3. `<Logo size={110} />` centrato
4. Caption "Benvenuto al Bar di Mario · Welcome to Mario's Bar" stesso rigo
5. Pulsante verde `#58cc02` — "L'italiano inizia qui / Italian starts here →"
6. Hint gratis

---

## Sessione 9 Aprile 2026 — Navigazione e Hub Dashboard

### Home autenticata — struttura finale
1. Logo centrato nella topbar
2. Tricolore sopra e sotto la topbar
3. Personaggi cliccabili con hover glow
4. Frame lezione verde neon con pulsante breathe
5. Pulsante discreto solo EN: "👤 Profile & Learning Path →" — trasparente, basso

### Dashboard — hub navigazione in cima
- Percorso: rettangolo grande verde `#58cc02` → scroll a sezione percorso
- Biblioteca: quadrato oro `#E5B700` → `/biblioteca`
- Esplora: quadrato cyan `#00BCD4` → scroll a sezione viaggi
- Sotto l'hub: profilo, energia, streak, statistiche esistenti

### Prossimo sprint — Ridisegno dashboard
- La dashboard attuale è densa e va ristrutturata
- Hub in cima già fatto
- Da ridisegnare: profilo, energia, percorso, streak, viaggi
- Obiettivo: zero scroll inutile, tutto visibile above the fold su mobile

### Decisioni navigazione
- NO bottom nav (troppo invasiva)
- NO sidebar desktop
- Home: 1 solo pulsante discreto per dashboard
- Dashboard: hub con 3 card come entry point
- Biblioteca e Viaggi accessibili solo dalla dashboard

---

## Sessione 10 Aprile 2026 — Sistema Pasti + Lezioni + Prize

### Struttura unità — 5 lezioni + boss (aggiornato)
Ogni unità passa da 4 a 5 lezioni. Il boss rimane separato.
`lessons:[1,2,3,4,5]` in tutti i file JSON e componenti.

### Icone e tipi lezione

**Unità dispari — Esplorazione 🗺️**
| Slot | Icona | Tipo | Reward cibo | Crediti |
|------|-------|------|-------------|---------|
| L1 | ⭐ | Vocabolario nuovo | ☕ Caffè/Cappuccino/Spremuta | +5 cr |
| L2 | 📖 | Lettura + contesto | 🥐 Fine colazione (random) | +5 cr |
| L3 | 💪 | VocabMatch pratica | 🍝 Pranzo (random) | +8 cr |
| L4 | 🎧 | Ascolto personaggio | 🍹 Aperitivo (random) | +8 cr |
| L5 | 🎯 | Speed Round | 🍽️ Cena (random) | +10 cr |
| Boss | 🏆 | Sfida la Nonna | 🍦 Dolce random + crediti | +30 cr |

**Unità pari — Consolidamento 🔁**
| Slot | Icona | Tipo | Reward cibo | Crediti |
|------|-------|------|-------------|---------|
| L1 | 🔁 | Ripasso vocabolario | ☕ Caffè/Cappuccino/Spremuta | +5 cr |
| L2 | ✍️ | Scrittura + traduzione | 🥐 Fine colazione (random) | +5 cr |
| L3 | 💪 | Esercizi grammatica | 🍝 Pranzo (random) | +8 cr |
| L4 | 🎭 | Mini-game personaggio | 🍹 Aperitivo (random) | +8 cr |
| L5 | 🎯 | Speed Round misto | 🍽️ Cena (random) | +10 cr |
| Boss | 🏆 | Assessment parziale | 🍦 Dolce random | +50 cr |

**Totale crediti per unità dispari completa: 66 cr**
**Totale crediti per unità pari completa: 86 cr**

### Sistema reward cibo — pool random per slot

**Slot colazione (L1)** — sempre random tra:
- ☕ Caffè espresso
- Cappuccino
- 🍊 Spremuta d'arancia

Nota: anche la prima lezione della prima unità è random — non esiste un cibo fisso.

**Slot fine colazione (L2)** — random
- 🥐 Cornetto alla crema
- 🧇 Brioche col tuppo
- 🍫 Cioccolata calda
- 🥐 Sfogliatella

**Slot pranzo (L3)** — random
- 🍝 Spaghetti al pomodoro
- 🍜 Pasta e fagioli
- 🍝 Pasta al ragù
- 🫙 Minestra napoletana

**Slot aperitivo (L4)** — random
- 🍹 Aperol Spritz
- 🍋 Limoncello
- 🥂 Prosecco
- 🍷 Negroni

**Slot cena (L5)** — random
- 🍕 Pizza margherita
- 🐟 Branzino al forno
- 🍖 Secondi napoletani
- 🥗 Insalata di mare

**Slot dolce boss** — random, assegnato dalla Nonna
- 🍦 Gelato alla crema
- 🍮 Babà napoletano
- 🥐 Cannolo siciliano
- 🍰 Tiramisù
- 🍮 Panna cotta

### Popup narrativi — regole

1. **Popup PRE-lezione 1** — appare PRIMA di ogni L1 di ogni nuova unità
   - Prima unità in assoluto: sempre ☕ caffè + testo "Si comincia con un caffè al Bar di Mario!"
   - Unità successive: random tra caffè/cappuccino/spremuta
   - Contiene: emoji grande + testo bilingue + animazione energia che sale + CTA "Inizia!"

2. **Popup POST-lezione** — appare DOPO ogni lezione completata (tra una lezione e la successiva)
   - Emoji cibo grande con animazione bounce/esplosione stile Duolingo
   - Testo bilingue celebrativo
   - Barra energia che si anima e sale visibilmente
   - Crediti guadagnati in evidenza
   - CTA "Continua!" per la prossima lezione

3. **Popup POST-boss** — appare dopo il boss
   - "La Nonna ti premia!" con dolce random
   - Animazione più elaborata (confetti o shimmer)
   - Mostra: dolce conquistato + crediti totali unità + energia raggiunta
   - CTA "Esplora l'Italia!" se energia sufficiente, "Continua a studiare!" altrimenti

### Energia — comportamento popup
- L'energia sale CON ANIMAZIONE nel popup (barra che si riempie in 1.5s)
- Non silenziosamente — l'utente deve vedere il progresso in tempo reale
- Il valore numerico % conta su durante l'animazione

### Lezioni — decisione architetturale
- Tutti i JSON delle lezioni esistenti (lesson1-4.json) vengono riscritti da zero
- Nuova struttura: 5 lezioni + boss per unità
- Ogni lezione ha campo `type`: 'vocabolario' | 'lettura' | 'pratica' | 'ascolto' | 'speedround'
- Unità dispari: tipi [vocabolario, lettura, pratica, ascolto, speedround]
- Unità pari: tipi [ripasso, scrittura, pratica, minigame, speedround]

### Sistema Prize Made in Italy (Sprint 15)
- 120 prize totali A1→C2
- Separati dai cibi energia — nessuna sovrapposizione
- Assegnati dai personaggi in base alla loro personalità:
  - Mario → cibi e bevande napoletane
  - Sofia → oggetti culturali, musica
  - Diego → piatti regionali italiani
  - Gino → libri, arte, architettura
  - Matilde → made in Italy, moda, design
- Nomi evocativi senza brand registrati ("La Rossa di Maranello" non "Ferrari")
- Collezione visibile in dashboard come album figurine
- Richiede Supabase per persistenza — Sprint 15

### Pronuncia (sospesa)
- Web Speech API: qualità insufficiente per italiano
- Alternativa futura: Whisper API server-side (Sprint 16)
- Per ora L5 = Speed Round in entrambi i tipi di unità
- Toggle "Abilita pronuncia beta" nelle impostazioni dashboard per chi vuole testare

### Da fare prossima sessione
1. ✅ Riscrivere lesson1.json → lesson5.json + boss.json per Unità 1 (dispari)
2. ✅ Aggiungere campo `type` ai JSON lezioni
3. ✅ Aggiungere campo `reward` ai JSON (slot cibo + crediti)
4. ✅ Implementare popup reward tra lezioni in lesson/[livello]/[unita]/[lezione]/page.js
5. ✅ Aggiornare saveProgress.js per gestire crediti per lezione
6. ✅ Aggiornare UNITS in dashboard e home da lessons:[1,2,3,4] a lessons:[1,2,3,4,5]

---

## DECISIONI SESSIONE 2

### Bilinguismo universale
- Ogni testo visibile ha **sempre due righe**: italiano prima, inglese dopo
- Mai affiancati, mai su una riga sola — sempre su righe separate
- Vale per: fumetti, domande, opzioni di risposta, reazioni della Nonna, feedback, hint — **tutto**
- I personaggi pronunciano via TTS **solo la parte italiana**, anche se il fumetto mostra entrambe le lingue

### Vocabolario (3 parole per lezione)
- **Round 1**: mostra parola italiana → studente sceglie traduzione inglese → TTS pronuncia la parola italiana
- **Round 2**: mostra parola inglese → studente sceglie/scrive la parola italiana
- Ogni vocab item ha campo `audio_text` per il TTS (può differire dalla forma scritta)

### Word Bank
- Punteggiatura finale **fissa a video** (non selezionabile, non nelle parole da trascinare)
- Parole mostrate in case normali (maiuscole/minuscole rispettate)
- Quando la frase è composta correttamente → TTS legge la frase italiana completa
- **È** (verbo essere) e **e** (congiunzione) sempre distinguibili — mai tutto maiuscolo

### Audio — Web Speech API
- TTS gratuito, già nel browser, zero configurazione
- Fallback sempre visibile: pulsante `[👁️ Leggi]` se audio non disponibile
- Per microfono: pulsante `[⌨️ Scrivi invece]` se mic non disponibile
- Lingua TTS: sempre `it-IT`, rate `0.88`

### Attività per tipo lezione (variano tra unità)

| Slot | Tipo | Attività |
|------|------|----------|
| L1 | Vocabolario | Flashcard IT→EN poi EN→IT con audio TTS |
| L2 | Lettura | Dialogo a bolle bilingue + quiz comprensione |
| L3 | Pratica | Word bank componi frase (punteggiatura fissa, audio a completamento) |
| L4 | Ascolto | Senti TTS → scegli parola o frase corretta |
| L5 | Speed Round | Mix 10 domande da tutte le lezioni, 10 secondi ciascuna |
| Boss | Sfida la Nonna | Dialogo interattivo: lei parla (bilingue), tu scegli risposta (bilingue), reazioni divertenti agli errori (bilingue) |

### Struttura fumetti e domande
- Sempre su **due righe separate**
- Riga 1: testo italiano
- Riga 2: testo inglese (corsivo o colore più tenue)
- Mai concatenati sulla stessa riga con `/` o `—`

### Struttura JSON lezioni — v2

```json
{
  "id": 1,
  "title": "Titolo IT",
  "titleEN": "Title EN",
  "type": "vocabolario|lettura|pratica|ascolto|speedround|boss",
  "icon": "⭐",
  "reward": {
    "slot": "colazione|fine_colazione|pranzo|aperitivo|cena|dolce",
    "crediti": 5,
    "pool": [{ "emoji": "☕", "nome": "Nome IT", "nomeEN": "Name EN" }]
  },
  "vocab": [
    {
      "id": "parola",
      "emoji": "👋",
      "it": "Ciao",
      "en": "Hello / Goodbye",
      "audio_text": "Ciao",
      "mario_it": "Spiegazione italiana.",
      "mario_en": "English explanation."
    }
  ],
  "questions": [
    {
      "id": 1,
      "personaggio": "mario",
      "tipo": "multipla|vero_falso|word_bank|abbina_coppia|ascolta_scegli",
      "fase": "riconoscimento|comprensione|produzione",
      "intro_it": "Testo italiano intro.",
      "intro_en": "English intro text.",
      "domanda_it": "Domanda in italiano?",
      "domanda_en": "Question in English?",
      "opzioni": [
        { "it": "Opzione IT", "en": "Option EN" }
      ],
      "correct": 0,
      "feedback_ok_it": "Feedback positivo IT.",
      "feedback_ok_en": "Positive feedback EN.",
      "feedback_err_it": "Feedback errore IT.",
      "feedback_err_en": "Error feedback EN."
    }
  ]
}
```

**Regole campi:**
- `intro_it` / `intro_en` → due righe nel fumetto, TTS solo su `intro_it`
- `domanda_it` / `domanda_en` → due righe nel box domanda
- `opzioni` → ogni opzione è `{ it, en }` (due righe nel bottone)
- `feedback_ok_it/en` e `feedback_err_it/en` → due righe nella barra feedback
- `audio_text` nel vocab → testo esatto per TTS (gestisce accenti, elisioni)

### Bug da correggere
- **È vs e**: sempre distinguibili nel testo — `È` (verbo) mai scritto come `E` maiuscolo
- Maiuscole/minuscole sempre rispettate nella visualizzazione (no `toUpperCase()` sulle opzioni)
- Punteggiatura (`.`, `?`, `!`, `,`) **non inclusa** nel pool word bank — appare fissa a video

---

## PERSONAGGI UFFICIALI (15 totali)

| ID | Nome | Ruolo | Età | Città | Colore |
|---|---|---|---|---|---|
| mario | Mario | Barista napoletano | 45 | Napoli | `#ff9b42` — **FISSO in ogni lezione** |
| sofia | Sofia | Studentessa d'arte | 26 | Bologna | `#c8a0e8` |
| zac | Zac | Studente architettura (padre italiano, madre marocchina) | 23 | Vicenza | `#22c55e` |
| gino | Prof. Gino | Pensionato ex professore | 68 | Napoli | `#e5b700` |
| matilde | Matilde | Professoressa italiano | 38 | Milano | `#1cb0f6` |
| vittoria | Nonna Vittoria | La Nonna | 72 | Napoli | `#ffd700` — **BOSS principale** |
| tamara | Tamara | Fashion designer | 29 | Dakar | `#f97316` |
| yuki | Yuki | Imprenditrice | 27 | Osaka | `#f43f5e` |
| rafael | Rafael | Chef | 31 | Buenos Aires | `#3b82f6` |
| chenwei | Chen Wei | Imprenditore | 44 | Shanghai | `#ef4444` |
| jack | Jack | Travel blogger | 34 | Sydney | `#0ea5e9` |
| oliver | Oliver | Architetto freelance | 41 | Londra | `#8b5cf6` |
| patricia | Patricia | Pensionata ex avvocata | 58 | Miami | `#ec4899` |
| priya | Priya | Sviluppatrice app | 32 | Mumbai | `#a855f7` |
| hans | Hans | Ingegnere in sabbatico | 42 | Monaco | `#64748b` |

---

## STRUTTURA PRODOTTO

**6 città × 15 temi × 2 unità = 180 unità totali**

- Ogni unità: 5 lezioni + 1 boss = **6 sessioni**
- Ogni lezione: 8-10 domande
- **Totale domande: ~9.720**

### Città e livelli CEFR

| Città | Livello |
|---|---|
| Napoli | A1 |
| Roma | A2 |
| Firenze | B1 |
| Venezia | B2 |
| Milano | C1 |
| Italia | C2 |

---

## STRUTTURA TEMA (2 unità per tema)

### UNITÀ 1 — SCOPRI + PRATICA

| Lezione | Icona | Tipo | Attività |
|---|---|---|---|
| L1 | ⭐ | Vocabolario | multipla + abbina_coppia |
| L2 | 📖 | Contesto | multipla + vero_falso |
| L3 | 💪 | Pratica | fill_blank + tap_right |
| L4 | 🎧 | Ascolto | ascolta_scegli |
| L5 | 🎯 | Speedround | mix veloce |
| Boss | 🏆 | — | fill_blank + word_bank |

### UNITÀ 2 — PRATICA + USA

| Lezione | Icona | Tipo | Attività |
|---|---|---|---|
| L1 | 🔁 | Ripasso | ascolta_scegli dominante |
| L2 | 🎭 | Situazione | tap_right + word_bank |
| L3 | 🎭 | Situazione | fill_blank + word_bank |
| L4 | 🎭 | Situazione | word_bank + completa_risposta |
| L5 | 🎯 | Speedround | mix audio |
| Boss | 🏆 | — | produzione completa |

---

## MATRICE A1 — 10 REGOLE

### REGOLA 1 — Proporzioni per unità
- **U1**: 60% Scopri + 30% Pratica + 10% Usa
- **U2**: 0% Scopri + 30% Pratica + 70% Usa

### REGOLA 2 — Tipi ammessi U1
- `multipla` (max 40%)
- `abbina_coppia` (max 1)
- `vero_falso` (max 1)
- `fill_blank` (buco semplice)
- `tap_right` (max 3 opzioni)
- `ascolta_scegli` (solo da L3)
- `word_bank` (max 4 parole, solo L5 e Boss)

**VIETATI in U1**: word_bank lungo, dialogo

### REGOLA 3 — Tipi ammessi U2
- `ascolta_scegli` (dominante)
- `fill_blank` (anche nel mezzo della frase)
- `tap_right`
- `word_bank` (max 6 parole)
- `multipla` (max 20%)

**VIETATI in U2**: abbina_coppia, vero_falso puro

### REGOLA 4 — Complessità linguistica U1
- Frasi max 5 parole
- Solo vocabolario corrente
- Solo presente indicativo
- Solo pronomi io / tu

### REGOLA 5 — Complessità linguistica U2
- Frasi max 8 parole
- Vocabolario tema completo
- Connettivi semplici: `e`, `ma`, `perché`
- Pronomi: io / tu / lui / lei

### REGOLA 6 — Progressione audio U1
| L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|
| 0% | 0% | 20% | 50% | 30% |

### REGOLA 7 — Progressione audio U2
| L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|
| 60% | 20% | 40% | 80% | 60% |

### REGOLA 8 — Arco difficoltà ogni lezione
| Domande | Difficoltà | Fase |
|---|---|---|
| Q1-Q2 | 1/5 | Comfort |
| Q3-Q5 | 2-3/5 | Apprendimento |
| Q6-Q7 | 3-4/5 | Consolidamento |
| Q8 | 4/5 | Produzione |

### REGOLA 9 — Mario sempre presente
- **U1**: posa pensiero (spiega)
- **U2**: posa saluto (testa)
- **U3**: posa felice (osserva)
- Posa 2 (felice) → risposta corretta
- Posa 3 (pensiero) → risposta sbagliata

### REGOLA 10 — Pillola culturale
- 1 per lezione, sempre alla fine
- Opzionale per l'utente
- Max 3 righe IT + 3 righe EN + 1 esempio
- **MAI dentro il flusso delle domande**

---

## I 15 TEMI DI NAPOLI (A1)

| # | Tema |
|---|---|
| 1 | Saluti e presentazioni |
| 2 | Al bar — ordinare |
| 3 | Al bar — pagare e chiedere |
| 4 | In giro — chiedere indicazioni |
| 5 | In giro — descrivere luoghi |
| 6 | I numeri (1-100) |
| 7 | Giorni, orari e appuntamenti |
| 8 | Il cibo napoletano |
| 9 | Descrivere persone |
| 10 | La famiglia base |
| 11 | I colori e aggettivi base |
| 12 | Al telefono base |
| 13 | Fare la spesa |
| 14 | Il tempo atmosferico |
| 15 | Le emozioni base |

---

## AVATAR PERSONAGGI

**Stile**: chibi semi-3D, sfondo trasparente PNG

**3 pose per personaggio:**
- **Posa 1 — Saluto**: neutro, mano alzata
- **Posa 2 — Felice**: braccia alzate, salto
- **Posa 3 — Pensiero**: mano al mento

**Regole**:
- Occhi sempre verso l'utente
- Mario: **3 pose già generate e processate**

---

## Regole Audio e Evidenziazione — Aprile 2026

### REGOLA AUDIO — Solo italiano, mai inglese
- Il TTS parla SOLO la parte italiana di qualsiasi testo bilingue
- Le opzioni di risposta vengono pronunciate SOLO se `opt.it !== opt.en`
  (se sono uguali, l'opzione è in inglese e non va pronunciata)
- PersonaggioBubble usa sempre `u.lang = "it-IT"` — invariato
- QBox parla solo `domandaIT` — invariato
- Fix in DomandaMultipla: `if (optIt && optIt !== optEn) pronounce(optIt)`

### REGOLA EVIDENZIAZIONE — Termini italiani in testo bilingue
Quando un termine italiano appare nel testo inglese (o in una domanda
bilingue dove il focus è su una parola italiana), usare la convenzione
`«termine»` nel JSON.

Il componente `renderText()` converte automaticamente `«termine»` in
`<u>termine</u>` con sottolineatura evidenziata.

**Esempi corretti nel JSON:**
- `"en": "What does «per favore» mean?"`
- `"en": "Mario says: «ecco a lei»!"`
- `"en": "«Grazie» → «Prego»! The perfect pair!"`
- `"it": "Cosa significa «per favore»?"`

**Regola**: se una parola/frase italiana appare come focus della domanda
o come termine da riconoscere, va sempre marcata con «» — sia nella
parte IT che EN della stessa domanda.

**Non marcare**: parole di contorno, nomi propri, emoji.

### REGOLA BILINGUE — Tradurre o tenere in italiano?
- Parole del **vocabolario attivo** della lezione → restano in italiano
  nel testo EN + marcate con «» per evidenziarle
  Es: "What does «per favore» mean?"
- Parole di **contesto/narrativa** non ancora insegnate → sempre tradotte
  Es: "Mario says: two euros." (due euro non è nel vocab dell'unità)

### REGOLA vero_falso — quando usarlo e quando no
- MAI usare vero_falso se la risposta è ovviamente vera (es. definizione appena insegnata)
- MAI mettere termini inglesi nella frase italiana del vero_falso
- SE si usa: verificare SEMPRE che correct=0 per Vero e correct=1 per Falso
- PREFERIRE multipla situazionale: "cosa fa X?" con 3 azioni narrative
  è sempre più efficace pedagogicamente di "vero o falso?"

### REGOLA EMOJI NEI JSON
- Emoji SOLO nei campi italiani: domanda.it, contesto_it, intro_it
- MAI in domanda.en, contesto_en, intro_en — verranno mostrate dalla parte IT
- MAI emoji trailing in feedbackOk.en e feedbackErr.en
- Unica eccezione: emoji standalone come feedback (es. "Correct! 🎉")
  che non hanno corrispondente IT

---

## Regole emerse — Sessione Aprile 2026 (Unit3)

### AUDIO — Regole definitive
- TTS parla SOLO italiano — mai testo inglese
- Opzioni multipla/tap_right: `if (optIt && optIt !== optEn) pronounce(optIt)`
- PersonaggioBubble: sempre `u.lang = "it-IT"` — invariato
- AbbinaCoppia: 🔊 solo sulla colonna IT, mai sulla colonna EN
- Il testo EN è sempre silenzioso — l'utente lo legge, non lo ascolta

### EMOJI — Regole definitive
- Emoji SOLO nei campi IT: domanda.it, contesto_it, intro_it, frase_it
- MAI in campi EN: domanda.en, contesto_en, intro_en, frase_en, feedbackOk.en, feedbackErr.en
- Unica eccezione ammessa: emoji di celebrazione SOLO in feedbackOk.it (es. 🎉🏆)
- Il componente NON deve strippare emoji a runtime — il JSON deve essere pulito alla fonte

### BILINGUE — Regole definitive
- Parole del vocabolario attivo → restano in italiano nel testo EN + marcate con «»
  Es: `"en": "What does «per favore» mean?"`
- Parole di contesto/narrativa non insegnate → sempre tradotte in inglese
  Es: `"en": "Mario says: two euros."` (due euro non è nel vocab dell'unità)
- «termine» nel JSON → renderText() converte in <u>termine</u> sottolineato

### VERO_FALSO — Regole definitive
- MAI usare se la risposta è ovviamente vera (definizione appena insegnata)
- MAI mettere termini inglesi nella parte italiana della frase
- Verificare SEMPRE: correct=0 per Vero, correct=1 per Falso
- PREFERIRE multipla situazionale: "cosa fa X?" con 3 azioni narrative discriminanti

### CORRECT INDEX — Regola definitiva
- La risposta corretta NON deve essere sempre in posizione 0
- Distribuzione target per lezione: variare tra 0, 1, 2 senza pattern ripetitivo
- Pattern consigliato per 3 opzioni: [1, 2, 0, 2, 1, 0, 2, 1, 0, ...]
- Mai due correct=0 consecutivi nella stessa lezione

### ABBINA_COPPIA — Modalità corrette
- Classic mode: `{it: "parola IT", en: "traduzione EN"}` — colonna sx IT con 🔊, colonna dx EN senza 🔊
- Situation mode: aggiunge `situazione_en` e `traduzione_en` — usare solo per abbinamenti contestuali
- MAI usare situation mode per semplici traduzioni diretta → usa classic mode

### CONTESTO — Regole definitive
- `tipo_contesto: "falso_amico"` → mostra banner ⚠️ giallo
- Senza tipo_contesto → contesto normale senza banner
- contesto_en non deve ripetere l'emoji già presente in contesto_it

### STATO UNIT3 ✅ — Aprile 2026
- lesson1.json ✅ (Il conto / Quanto costa? / Per favore · Emma)
- lesson2.json ✅ (Grazie / Prego / Ecco a lei · Hans)
- lesson3.json ✅ (Pratica · Oliver)
- lesson4.json ✅ (Ascolto · Emma)
- lesson5.json ✅ (Speedround · Mario solo)
- boss.json ✅ (Sfida la Nonna · Vittoria)
- personaggi.json ✅ (Emma + Hans + Oliver aggiunti)
- percorso/page.js ✅ (Unit3 visibile nel percorso)

---

## Piano integrazione implicita — Pronomi + ESSERE + AVERE (Temi 4-10)

### Filosofia
Pronomi, ESSERE e AVERE NON hanno un tema dedicato.
Emergono in contesto nei temi dove sono naturali.
Lo studente li impara usandoli, mai studiandoli come lista.

### Mappa di integrazione

| Tema | Contesto naturale | Strutture introdotte |
|------|-------------------|----------------------|
| 4 — In giro: indicazioni | Mario guida Emma per le strade | io vado · tu giri · lei prende |
| 5 — In giro: luoghi | I personaggi descrivono dove sono | io sono in · lui è vicino a |
| 6 — I numeri | Prezzi, età, quantità al bar | io ho 5 euro · lei ha 30 anni |
| 7 — Orari e appuntamenti | Appuntamenti tra personaggi | noi abbiamo · voi avete · io sono libero |
| 8 — Il cibo napoletano | Preferenze e ordini al tavolo | loro vogliono · noi prendiamo |
| 9 — Descrivere persone | I personaggi si descrivono | lui è · lei è · loro sono |
| 10 — La famiglia | Mario parla della sua famiglia | noi siamo · voi siete · loro hanno |

### Regole di introduzione

- MAX 1 pronome nuovo per lezione — mai presentare io/tu/lui insieme
- La struttura appare PRIMA nel fumetto di Mario, poi nelle domande
- Il feedback ERR spiega con analogia EN:
  Es: "HO 30 anni — in italiano l'età si HA, non si È! (I HAVE 30, not I AM 30)"
- ESSERE nei feedback da Tema 4: "Sono di Napoli = I am from Naples — di = from"
- AVERE nei feedback da Tema 6: "Ho 5 euro = I have 5 euros — HO non AM!"

### Progressione pronomi per tema

| Tema 4 | io · tu |
| Tema 5 | io · tu · lui · lei |
| Tema 6 | io · tu + AVERE (ho/hai) |
| Tema 7 | noi · voi + AVERE (abbiamo/avete) |
| Tema 8 | loro + verbi comuni |
| Tema 9 | lui/lei + ESSERE (è) rafforzato |
| Tema 10 | tutti i pronomi + ESSERE/AVERE completi |

### Difficoltà specifiche per anglofoni — da evidenziare nei feedback

- AVERE per l'età: "I have 30 years" non esiste in EN → feedback sempre presente
- ESSERE per origine: "I am from" = "Sono di" — di ≠ from ma funziona allo stesso modo
- TU vs LEI formale: anglofoni non hanno il formale → pillola culturale in Tema 4
- VOI plurale: "you all" non esiste in EN → pillola culturale in Tema 7
- LORO per persone E cose: "they" funziona uguale → feedback rassicurante

### STATO UNIT4 ✅ — Aprile 2026
- lesson1.json ✅ (A destra / A sinistra / Dritto · Emma)
- lesson2.json ✅ (Dov'è? / Vicino / Lontano · Hans)
- lesson3.json ✅ (Pratica · Oliver) — pronomi io/tu introdotti nel feedback
- lesson4.json ✅ (Ascolto · Emma)
- lesson5.json ✅ (Speedround · Mario solo — word_bank A1.2)
- boss.json ✅ (Sfida la Nonna · Vittoria)
- percorso/page.js ✅ (Unit4 visibile nel percorso)

### Vocabolario Unit4 — Tema 4
1. A destra → To the right
2. A sinistra → To the left
3. Dritto → Straight ahead
4. Dov'è? → Where is it?
5. Vicino → Near
6. Lontano → Far

### Pronomi integrati (piano Opzione A)
- Tema 4: io/tu introdotti implicitamente nel feedback
  "VAI = tu vai — come you go in inglese!"
- Pillola L3: spiega perché tu è opzionale in italiano
