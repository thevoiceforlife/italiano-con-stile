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
app/components/games/MarioDialog.js  — Dialogo AI Claude Haiku
app/components/games/DiegoGesti.js   — Flash Gesti
app/components/games/SofiaSlang.js   — Speed Round slang
app/components/games/GinoStoria.js   — Gesto + Storia
app/components/games/MatildeEmail.js — Email Challenge AI
app/lesson/[id]/page.js              — Lezioni con FraseAnnotata in VocabIntro
public/images/italia-map.png         — Mappa PNG statica (usata nel modal)
public/images/italia-map.svg         — Mappa SVG (non ancora integrata)
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
