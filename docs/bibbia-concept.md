# Bibbia Concept — Italiano con Stile

> **Scope**: concept di prodotto, target utente, differenziatori, tagline, tono narrativo, personaggi come identità emotiva, posizionamento rispetto a Duolingo, roadmap di prodotto.
>
> **Fuori scope** (vedi `docs/bibbia-tecnica.md`): architettura tecnica, codice, JSON, validator, componenti, deployment.
>
> **Stato**: v5 ancorata a marzo 2026 (Sprint 3). Molte decisioni di prodotto successive (aprile 2026, v2 architettura) non sono ancora integrate qui — vedi F2.1.b in roadmap.
>
> **Ultimo allineamento con la realtà**: marzo 2026 (v5). Aggiornamento v6 in corso.
>
> **Come aggiornare**: aggiungi sezione con data in testa. Non riscrivere sezioni obsolete — marchiale con `> ⚠️ Obsoleto dal YYYY-MM-DD: vedi sezione X`.

---

# 📖 BIBBIA DEL PROGETTO — "Italiano con Stile"
> Documento di riferimento per ogni nuova sessione di sviluppo.
> Incolla questo documento all'inizio di ogni nuova conversazione con Claude.
> Ultima versione: marzo 2026 — aggiornata dopo Sprint 3

---

## 1. CONCEPT GENERALE

**Nome app:** Italiano con Stile
**Titolo UI:** Italian for English Speakers
**Tagline UI:** "Finally, someone explains why."
**Tagline interna:** "Impara l'italiano con i tuoi 6 compagni napoletani"
**Target:** English speakers (anglofoni) — livelli A1 → C2
**Lingua UI:** Inglese
**Lingua di apprendimento:** Italiano
**Regola bilingue ASSOLUTA:** Ogni frase, spiegazione, avvertenza, badge, notifica deve essere in DOPPIA LINGUA — prima in italiano, poi in inglese. Nessuna eccezione. Non solo la frase da imparare, ma TUTTA la spiegazione.

**Ispirazione:** Duolingo — ma con identità italiana forte, ironia autentica, contenuti culturali profondi.

**Differenziatori chiave rispetto a Duolingo:**
- Il bar di Mario come metafora centrale e hub narrativo
- 6 personaggi con identità precise e trigger specifici (aggiunto Nonna Vittoria)
- Contenuti culturali autentici (non inventati): proverbi, gesti, falsi amici reali
- Sistema energia a tema italiano: Caffè → Cornetto → Aperitivo → Pizza → Gelato
- Viaggio nelle 20 regioni italiane con sistema biglietti
- Ironia autentica — ride CON l'Italia, mai dell'Italia
- Grammatica mai insegnata frontalmente — sempre nascosta nel contesto
- Boss Level = "Sfida la Nonna" (non "Boss Level" generico)

---

## 2. STACK TECNICO

| Componente | Tecnologia | Piano gratuito |
|---|---|---|
| Frontend | Next.js 16 + React 19 | - |
| Deploy | Vercel | Free (100GB bandwidth) |
| Database + Auth | Supabase | Free (500MB, 50k MAU) |
| AI features | Claude API (Haiku) | ~$5/mese a 5k utenti |
| Audio TTS | Web Speech API (dev) → Azure TTS (prod) | 500k chars/mese free |
| Analytics | PostHog | 1M eventi/mese free |
| Editor | VS Code | - |
| CI/CD | GitHub Actions | Free |
| CSS | Tailwind v4 | - |
| Font | Nunito (Google Fonts via next/font) | - |

**Voci Web Speech API disponibili sul Mac del developer:**
> ⚠️ Le voci Luca/Federica/Paola NON sono disponibili in Chrome/Safari su questo Mac.

- `Rocko` it-IT → **Mario** (M, caldo e deciso)
- `Shelley` en-GB → **Logo sottotitolo** (F, voce inglese)
- `Eddy` it-IT → **Diego** (M, pitch alto simula bambino)
- `Grandpa` it-IT → **Gino** (M anziano, lento)
- `Sandy` it-IT → **Matilde** (F professionale)
- `Shelley` it-IT → **Sofia** (F giovane)
- `Grandma` it-IT → **Vittoria** (F anziana, dolce) ← da verificare disponibilità

---

## 3. I 6 PERSONAGGI — PROFILI DEFINITIVI

> ⚠️ **Obsoleto dal 2026-04-24**: il roster è ora di 15 personaggi. Vedi `docs/decisioni-architettura-v2.md` sezione 10 (lista completa) e sezione 5 (regola casting 5-da-15 per tema). La lista qui sotto resta solo come riferimento storico Sprint 3.

### ☕ MARIO — Il Barista
- **Età:** 40-45 anni
- **Ruolo nell'app:** Personaggio PRINCIPALE — presente in OGNI lezione.
- **Voce Web Speech:** `Rocko` it-IT | rate: 0.88 | pitch: 1.0
- **Colore:** #FF9B42 (arancio caldo)
- **Animazione avatar:** speaking-glow-mario
- **Personalità:** Caldo, accogliente, ironico ma mai cattivo.
- **Funzione pedagogica:** Apre ogni sessione. Introduce gli altri personaggi. Chiude con "Il Consiglio di Mario".
- **Suono distintivo home:** 3 note campanella bar (523→659→784 Hz, sine)
- **Argomenti:** Vita quotidiana, saluti, cibo e bar, indicazioni, clima, sport, falsi amici, gesti.
- **IMMAGINE:** `/public/images/mario.png`

### 🎧 SOFIA — La Scugnizza
- **Età:** ~20 anni
- **Voce Web Speech:** `Shelley` it-IT | rate: 1.1 | pitch: 1.2
- **Colore:** #C8A0E8 (viola)
- **Suono distintivo home:** 2 blip sintetici acuti (1200→1600 Hz, square)
- **Funzione pedagogica:** Slang moderno, espressioni idiomatiche, italiano dei social, speed round.
- **Mini-game:** Speed Round — 10 parole slang in 60 secondi
- **IMMAGINE:** `/public/images/sofia.png`

### 🧢 DIEGO — Il Piccirillo
- **Età:** 7-8 anni
- **Voce Web Speech:** `Eddy` it-IT | rate: 1.3 | pitch: 1.55
- **Colore:** #22C55E (verde)
- **Suono distintivo home:** 5 note saltellanti ascendenti (triangle)
- **Funzione pedagogica:** Streak, celebrazioni, rinforzo positivo. Vocabolario A1.
- **Mini-game Flash Gesti:** 5 gesti in 60 secondi — veloce, istintivo, divertente
- **IMMAGINE:** `/public/images/diego.png`

### 🎓 GINO — Il Professore in Pensione
- **Età:** 70-75 anni
- **Voce Web Speech:** `Grandpa` it-IT | rate: 0.72 | pitch: 0.72
- **Colore:** #E5B700 (ambra/oro)
- **Suono distintivo home:** Accordo grave lento (130+164+196 Hz, sine)
- **Funzione pedagogica:** Appare dopo 3 errori ripetuti o in "pillole cultura". Grammatica B1+, etimologia, storia.
- **Mini-game Gesti Approfonditi:** 1 gesto con storia e contesto culturale completo
- **IMMAGINE:** `/public/images/gino.png`

### 💼 MATILDE — La Manager
- **Età:** 35-45 anni
- **Voce Web Speech:** `Sandy` it-IT | rate: 0.95 | pitch: 1.0
- **Colore:** #1CB0F6 (azzurro)
- **Suono distintivo home:** 2 click secchi e precisi (880→1100 Hz, sawtooth)
- **Funzione pedagogica:** Business Italian, email formali, meeting, vocabolario tecnico, Hard Mode.
- **Mini-game:** Email Challenge — completa l'email formale con la forma corretta
- **IMMAGINE:** `/public/images/matilde.png`

### 🍦 NONNA VITTORIA — L'Autorità Morale ← NUOVO
- **Età:** 70-80 anni
- **Ruolo nell'app:** Autorità morale e cuore pulsante della lingua. Grammatica pura, concordanza, tradizioni.
- **Voce Web Speech:** `Grandma` it-IT (da verificare) | rate: 0.75 | pitch: 0.9
- **Colore:** #E5B700 (oro caldo — diverso da Gino per contesto)
- **Personalità:** Dolce ma severa. Se sbagli un congiuntivo, ti guarda con disappunto sopra gli occhiali. Se fai bene, ti regala un consiglio di vita o una ricetta.
- **Trigger apparizione:**
  1. Dopo 3 errori dello stesso tipo → corregge con dolcezza
  2. Dopo sessione perfetta → ti premia con una perla di saggezza o ricetta
- **NON appare mai come insegnante frontale** — solo come reazione agli eventi
- **Mini-game:** "La Ricetta" — leggi una ricetta autentica, rispondi a domande di comprensione
- **Ricompensa speciale:** Il Gelato 🍦 — ripristina energia al 100%
- **"Sfida la Nonna":** È lei il boss finale di ogni unità (non "Boss Level")
- **IMMAGINE:** `/public/images/vittoria.png` ← da creare

---

## 4. TRIGGER — QUANDO APPARE OGNI PERSONAGGIO

| Personaggio | Appare quando... |
|---|---|
| ☕ Mario | SEMPRE — apertura app, inizio/fine ogni lezione, errori, traguardi, daily tip |
| 🎧 Sofia | Moduli slang, speed round, espressioni idiomatiche moderne |
| 🧢 Diego | Streak ogni 3 risposte corrette, lezione completata, bonus, vocabolario A1 |
| 🎓 Gino | Stesso errore grammaticale 3 volte, pillole storia, etimologia, livello B1+ |
| 💼 Matilde | Moduli business, email formali, test B2-C2, Hard Mode |
| 🍦 Vittoria | Dopo 3 errori uguali OPPURE dopo sessione perfetta |

**Regola d'oro:** Mario apre e chiude SEMPRE. Gli altri entrano solo nel loro dominio.

---

## 5. SISTEMA ENERGIA ← NUOVO (sostituisce vite/cuori)

**Concetto:** L'utente ha una barra energia (0-100%). Gli errori la consumano, il cibo la recupera. Energia a 0% = lezione bloccata.

### Perdita energia
| Evento | Perdita |
|---|---|
| Risposta sbagliata | -10% |
| 2 errori di fila | -15% |
| Energia a 0% | Lezione bloccata |

### Recupero energia — Il Cibo Italiano
| Cibo | Icona | Recupero | Come si guadagna |
|---|---|---|---|
| Caffè | ☕ | +10% | 6 risposte corrette |
| Cornetto | 🥐 | +20% | Lezione completata |
| Aperitivo | 🍸 | +30% | Mini-game personaggio completato |
| Pizza | 🍕 | +8% per spicchio (max 6 spicchi = +48%) | 1 spicchio ogni 5 risposte corrette |
| Gelato | 🍦 | +100% | Solo da Nonna Vittoria — raro e prezioso |

**La pizza si accumula a spicchi** — 6 emoji 🍕 in fila, quelli guadagnati accesi, quelli mancanti sbiaditi.

**Il gelato è rarissimo** — Vittoria non lo regala facilmente. Solo dopo sessione perfetta o dopo aver imparato da 3 errori uguali.

### Colori barra energia
- > 60% → verde #58CC02
- 30-60% → arancione #FF9600
- < 30% → rosso #FF4B4B

---

## 6. SISTEMA CREDITI E BIGLIETTI ← NUOVO

### Crediti
Ogni azione guadagna crediti. I crediti si spendono in biglietti per viaggiare.

| Azione | Crediti |
|---|---|
| Risposta corretta | +2 cr |
| Lezione completata | +10 cr |
| Sfida la Nonna — superata | +50 cr |
| Mini-game personaggio | +5 cr |
| Streak 7 giorni | +20 cr |

**I crediti non scadono mai.**

### Biglietti — 3 fasce
| Fascia | Costo | Destinazioni |
|---|---|---|
| 🍎 Borghi e località | 20 crediti | Pompei, Matera, Assisi, Alberobello, Cinque Terre, Agrigento, Portofino, Orvieto |
| 🏛 Province note | 50 crediti | Bari, Palermo, Bologna, Genova, Cagliari, Catania |
| 🎉 Capoluoghi iconici | 100 crediti | Roma, Firenze, Milano, Venezia, Torino |

**Napoli è sempre sbloccata** — è il punto di partenza, il bar di Mario è lì.

### Viaggio nelle regioni
- Sistema SEPARATO dalle lezioni principali
- Ogni città ha 2-5 lezioni tematiche proprie (storia, dialetto, cibo locale)
- Si sblocca comprando il biglietto della fascia corrispondente
- Più biglietti della stessa fascia = più città visitabili
- La cartina dell'Italia mostra le città con colori per fascia

---

## 7. SISTEMA MINI-GAME PERSONAGGI ← NUOVO

Ogni personaggio ha un mini-game diverso che rispecchia la sua personalità:

| Personaggio | Mini-game | Meccanica | Punti dati |
|---|---|---|---|
| ☕ Mario | "Cosa dice il cliente?" | Senti audio, scegli risposta al bancone | +caffè |
| 🎧 Sofia | Speed Round | 10 parole slang in 60 secondi | +aperitivo |
| 🧢 Diego | Flash Gesti | 5 gesti in 60 secondi — risposta istintiva | +cornetto |
| 🎓 Gino | Gesto + Storia | 1 gesto con storia culturale approfondita | +pizza |
| 💼 Matilde | Email Challenge | Completa l'email formale | +aperitivo |
| 🍦 Vittoria | La Ricetta | Leggi ricetta autentica, rispondi a domande | +gelato (raro) |

**I gesti hanno due livelli:**
- **Diego** — flash veloce: "Cosa significa 🤌?" — 4 opzioni, 60 secondi
- **Gino** — approfondimento: storia, origine regionale, quando usarlo e quando NO

---

## 8. PALETTE COLORI — DARK MODE

```css
--bg:         #23313D;
--bg-lesson:  #23313D;
--card:       #2C3E4A;
--border:     #38444D;
--text:       #E5E5E5;
--text2:      #AFAFAF;
--text3:      #777E8B;
--primary:    #58CC02;
--primary-d:  #46A302;
--secondary:  #1CB0F6;
--special:    #FF9600;
--ok-bar:     #061F23;
--ok-text:    #58CC02;
--err-bar:    #2E0F11;
--err-text:   #FF4B4B;
--streak:     #FF9600;
--xp:         #58CC02;
--mario:      #FF9B42;
--sofia:      #C8A0E8;
--diego:      #22C55E;
--gino:       #E5B700;
--matilde:    #1CB0F6;
--vittoria:   #E5B700;
--r:   14px;
--dep: 4px;
```

---

## 9. STRUTTURA LEZIONI

**Struttura di ogni lezione:**
1. **Fase Intro** — 3-5 card vocabolario tap-to-reveal
2. **Fase Quiz** — 5 domande multiple choice
3. **Schermata completamento** — XP, energia, Mario che saluta

**Regole:**
- Ogni risposta sbagliata = -10% energia (non -0.5 cuori come prima)
- Gino appare SOLO dopo 3 errori dello stesso tipo
- Vittoria appare dopo sessione perfetta o 3 errori uguali
- Diego appare alla fine di ogni lezione completata

**Progressione lezioni — si sbloccano in sequenza:**
- Lezione 0 sempre sbloccata
- Lezione N si sblocca dopo aver completato N-1
- "Sfida la Nonna" si sblocca dopo aver completato tutte le lezioni dell'unità

---

## 10. UNITÀ DIDATTICHE — STATO ATTUALE

> ⚠️ **Obsoleto dal 2026-04-24**: stato congelato al 5 marzo 2026 (Sprint 3). Il contenuto A1 è oggi completo (15 unit × 6 sessioni = 90 JSON, vedi `docs/bibbia-tecnica.md` sezione STATO UNIT5-15). Il pilota v2 è su Tema 1 Saluti (L1+L2 live). Aggiornamento consolidato in F2.1.b.

### Unità 1 — Benvenuto al Bar di Mario (A1) ← SPRINT 3 COMPLETATO

| Lezione | Titolo | Status |
|---|---|---|
| 0 | Le Prime Parole (Ciao, Grazie, Prego, Sì) | ✅ FATTO |
| 1 | Il Primo Caffè | ✅ FATTO |
| 2 | Mario dà le Indicazioni | ✅ FATTO |
| 3 | La Cultura del Cibo | ✅ FATTO |
| Boss | Sfida la Nonna | ✅ FATTO |

**Nota curriculum:** Le lezioni 1-3 sono pensate per chi ha già qualche base. La Lezione 0 è pensata per il vero principiante assoluto (domande in inglese, opzioni con una parola italiana alla volta).

---

## 11. CONTENUTI AUTENTICI — REGOLE

**REGOLA ASSOLUTA:** Proverbi, frasi idiomatiche, gesti devono essere REALMENTE USATI in Italia.

**Prima del lancio:** Revisione da madrelingua italiano contemporaneo (25-50 anni, non accademico).

### Proverbi autentici verificati
- "Tra il dire e il fare c'è di mezzo il mare." → Easier said than done.
- "Chi dorme non piglia pesci." → The early bird catches the worm.
- "Meglio tardi che mai." → Better late than never.
- "Il lupo perde il pelo ma non il vizio." → A leopard never changes its spots.
- "Ogni scarrafone è bello a mamma soia." → (napoletano)

### Falsi amici verificati
- magari ≠ maybe (= I wish)
- attualmente ≠ actually (= currently)
- annoiato ≠ annoyed (= bored)
- educato ≠ educated (= polite)
- peperoni ≠ pepperoni (= bell peppers)
- morbido ≠ morbid (= soft)
- camera ≠ camera (= room)

### Gesti autentici verificati
- 🤌 Dita a punta → "Ma che vuoi?"
- ☝️ Indice rotante sulla guancia → "Buonissimo!"
- 🖐 Dito sotto l'occhio → "Occhio!"
- 🤘 Corna giù = scaramantico / verso qualcuno = insulto grave

---

## 12. VIAGGIO NELLE 20 REGIONI

Ogni città sblocca contenuti propri separati dalle lezioni principali.

### Fascia Borghi (20 crediti)
Pompei, Matera, Assisi, Alberobello, Cinque Terre, Agrigento, Portofino, Orvieto

### Fascia Province (50 crediti)
Bari, Palermo, Bologna, Genova, Cagliari, Catania

### Fascia Capoluoghi (100 crediti)
Roma, Firenze, Milano, Venezia, Torino

**Napoli:** sempre sbloccata — punto di partenza.

Ogni destinazione = 2-5 lezioni tematiche + 1 ricetta in italiano + 1 dialetto locale + 1 fatto culturale sorprendente + badge "Passaporto Regionale".

---

## 13. APP ESISTENTE (dopo Sprint 3)

> ⚠️ **Obsoleto dal 2026-04-24**: descrive l'app al 5 marzo 2026. Negli sprint successivi sono stati aggiunti: biblioteca completa (30 schede, 1800 esercizi), mini-game personaggi, dashboard, sistema reward multi-slot, taxonomy semantica, validator pre-commit, pilota v2. Per lo stato reale vedi `docs/bibbia-tecnica.md` sezione STATO ATTUALE.

**URL produzione:** `https://italiano-con-stile.vercel.app`
**Repository:** `https://github.com/thevoiceforlife/italiano-con-stile`

**Struttura file chiave:**
```
app/
  page.js                    — Home Screen con modal personaggi
  layout.js                  — Layout globale + Nunito
  globals.css                — Design system + animazioni
  components/
    CharacterBubble.js       — Componente personaggi riusabile
    LessonButton.js          — Bottone VAI → (client)
    XPBar.js                 — Barra XP home (legge localStorage, refresh su focus)
    Logo.js                  — Logo animato con audio
  lesson/
    0/page.js                — Lezione 0 — Le Prime Parole (beginner assoluto)
    1/page.js                — Lezione 1 — Il Primo Caffè
    2/page.js                — Lezione 2 — Mario dà le Indicazioni
    3/page.js                — La Cultura del Cibo (include Gino sulla domanda peperoni)
    boss/page.js             — Sfida la Nonna
public/
  images/
    mario.png / sofia.png / diego.png / gino.png / matilde.png
    vittoria.png ← DA CREARE
```

**Funzionalità implementate:**
- ✅ Home Screen dark mode stile Duolingo
- ✅ Logo animato con speech bubble UK+IT
- ✅ Modal personaggi con suono distintivo per ognuno
- ✅ Glow hover sui personaggi
- ✅ CharacterBubble riusabile per tutte le lezioni
- ✅ Lezioni 0, 1, 2, 3 complete (5 domande, -0.5 vita per errore)
- ✅ Sfida la Nonna (boss level, zero errori per vincere, +200 punti)
- ✅ Sistema progressione — lezioni si sbloccano in sequenza
- ✅ XP/crediti salvati in localStorage con campo `completed`
- ✅ Suoni Web Audio API (corretto/sbagliato/personaggi)
- ✅ Animazioni feedback (pulse-ok / shake-err)
- ✅ Barra progressione lezione
- ✅ Deploy automatico su Vercel

**Da implementare (prossimi sprint):**
- ⏳ Sistema energia (sostituisce vite)
- ⏳ Sistema crediti + biglietti
- ⏳ Cartina Italia con viaggio nelle regioni
- ⏳ Mini-game per ogni personaggio
- ⏳ Nonna Vittoria come personaggio
- ⏳ Autenticazione + salvataggio Supabase

---

## 14. ROADMAP SPRINT

> ⚠️ **Obsoleto dal 2026-04-24**: roadmap Sprint numerata (1-16) superata dalla roadmap v2 (Fasi F1-F2-F3 post-audit 20/4). Gli Sprint 11-16 citati qui non sono più il piano attivo. Vedi `docs/decisioni-architettura-v2.md` sezione 11 per la roadmap v2.

| Sprint | Contenuto | Status |
|---|---|---|
| 0 | Bibbia del progetto | ✅ FATTO |
| 1 | Setup GitHub + Vercel + Supabase + VS Code | ✅ FATTO |
| 2 | Demo HTML → Next.js reale + deploy | ✅ FATTO |
| 3 | Unità 1 completa — lezioni 0-3 + Sfida la Nonna | ✅ FATTO |
| 4 | Sistema energia + crediti + biglietti + Sfida la Nonna AI | ✅ FATTO |
| 5 | Cartina Italia + viaggio nelle regioni | ⏳ Prossimo |
| 6 | Prompt chaining — generazione lezioni da Claude API | ⏳ |
| 7 | Mini-giochi gesti (Diego flash + Gino approfondimento) | ⏳ |
| 8 | Autenticazione + salvataggio progressi Supabase | ⏳ |
| 9 | Business Italian — moduli Matilde | ⏳ |
| 10 | Azure TTS — voci consistenti su tutti i dispositivi | ⏳ |
| 11 | App mobile PWA | ⏳ |
| 12 | Freemium → monetizzazione | ⏳ |

---

## 15. DECISIONI CHIAVE — LOG CON DATA

| Data | Decisione | Motivo / Note |
|---|---|---|
| mar 2026 | **Gino = professore in pensione** | Entra con citazioni, storia, aneddoti — mai frontale |
| mar 2026 | **Matilde = efficienza e precisione business** | Nessuna narrativa, mai slang |
| mar 2026 | **Grammatica MAI frontale** — Gino solo dopo 3 errori | Metodo Duolingo |
| mar 2026 | **Tutto bilingue** — ogni parola di spiegazione ITA + ENG | Nessuna eccezione |
| mar 2026 | **Mario = personaggio principale** | Dal turista al professionista, passano tutti da lui |
| mar 2026 | **Dark mode permanente** | Scelta estetica forte |
| mar 2026 | **localStorage per progressi temporanei** | Ponte fino a Sprint 8 (Supabase auth) |
| mar 2026 | **Lezione strutturata in 2 fasi** — Intro vocabolario + Quiz | Metodo Duolingo |
| mar 2026 | **5 domande per lezione** | Più sostanzioso delle 3 originali |
| mar 2026 | **Errore = -0.5 energia** (non -1 vita) | Più graduale, meno punitivo |
| mar 2026 | **Boss Level → "Sfida la Nonna"** | Più narrativo, più italiano, più emozionante |
| mar 2026 | **Nonna Vittoria = 6° personaggio** | Autorità morale, grammatica pura, gelato come premio |
| mar 2026 | **Sistema energia** sostituisce vite | Barra % più graduale dei cuori Duolingo |
| mar 2026 | **Cibo = energia** — caffè/cornetto/aperitivo/pizza/gelato | Metafora italiana coerente con il sistema punti |
| mar 2026 | **Pizza si accumula a spicchi** (6 🍕 emoji) | Visivo, intuitivo, originale |
| mar 2026 | **Gelato = solo da Nonna Vittoria** | Raro e prezioso — +100% energia |
| mar 2026 | **Sistema crediti + biglietti** separato dalle lezioni | Ogni risposta corretta = +2 crediti → compri biglietti |
| mar 2026 | **3 fasce biglietti** — borghi 20cr, province 50cr, capoluoghi 100cr | Progressione naturale |
| mar 2026 | **Napoli = punto di partenza sempre sbloccato** | Il bar di Mario è a Napoli |
| mar 2026 | **Mini-game gesti doppio** — Diego flash + Gino approfondimento | Stessa meccanica, due livelli di profondità |
| mar 2026 | **Vittoria appare su 2 trigger** — 3 errori uguali O sessione perfetta | Non solo "prof dei fallimenti" |
| mar 2026 | **Lezione 0 per principianti assoluti** | Domande in inglese, una parola italiana alla volta |
| mar 2026 | **CharacterBubble come componente strutturale** | Riusabile per tutti i personaggi |
| mar 2026 | **Suono distintivo per ogni personaggio** nella home modal | Mario campanella, Sofia blip, Diego salti, Gino accordo grave, Matilde click |
| mar 2026 | **Livelli = Archetipi narrativi** — Turista/Viaggiatore/Esploratore/Appassionato/Esperto/Maestro | Più emotivi e attraenti di A0-C2 |
| mar 2026 | **Sfida la Nonna dà sempre il gelato** — energia dipende dal punteggio (0-15%) | Vittoria è una nonna, non un bancomat |
| mar 2026 | **5 domande fisse per Sfida la Nonna**, difficoltà crescente per livello | Struttura semplice, scalabile |
| mar 2026 | **Strategia AI 3 fasi** — statico → OpenRouter gratuito → Haiku a 5k utenti | Zero costo fino a trazione reale |
| mar 2026 | **OpenRouter + Gemma 3 12B** come ponte gratuito per domande dinamiche | Disponibile da Italia, 0 costi |
| mar 2026 | **Prompt chaining previsto Sprint 6-7** — Claude genera lezioni intere dalla Bibbia | 80 lezioni = 40 min, ~$0.02/lezione |
| mar 2026 | **Web Speech API = fallback graceful** — voce esatta → italiana → sistema | Consistenza su tutti i dispositivi ora, Azure TTS Sprint 10 |
| mar 2026 | **Niente perdita energia durante lezione** — solo reward ridotto a fine (Opzione B) | Meno punitivo, più motivante per principianti |
| mar 2026 | **Pizza con gli alimenti nel popup** — non con i crediti | La pizza recupera energia, non è un credito |
| mar 2026 | **Due sezioni nel popup reward** — Energia guadagnata / Crediti biglietti | Chiarezza visiva, nessuna confusione tra sistemi |
| mar 2026 | **Zero aggettivi gender-sensitive** in tutto il progetto | Regola globale — vedi §23 per lista sostituzioni |
| mar 2026 | **Motore lezioni dinamico** — `app/lesson/[id]/page.js` + JSON per contenuti | Un solo motore, contenuti separati — Sprint 5 |
| mar 2026 | **Personaggio = tipo domanda** — Mario multipla, Sofia word bank, Diego gesti, Gino vero/falso, Matilde word bank formale | Coerenza pedagogica e narrativa |
| mar 2026 | **Word bank** — punteggiatura fissa nel box, maiuscola come hint | Niente tastiera mobile, niente errori di ortografia |
| mar 2026 | **Opzioni solo in italiano** — niente traduzione EN nelle risposte | Evita aiuto involontario |
| mar 2026 | **Decay energia per inattività** — -10%/giorno dopo 24h, minimo 5% | Solo se ha già fatto lezioni — non scoraggia i nuovi |
| mar 2026 | **5 livelli colore energia** — verde/azzurro/arancione/rosso/rosso intenso | Più granularità visiva, urgenza progressiva |
| mar 2026 | **Energia iniziale 30%** al primo accesso | Crea bisogno visivo immediato — l'utente vuole riempire la barra |
| mar 2026 | **Viaggi bloccati sotto 25%** — eccetto Napoli sempre accessibile | Non puoi viaggiare se sei esausto — prima mangia |
| mar 2026 | **Avviso giallo tra 25-35%** prima del blocco viaggi | Comunicare con anticipo, non muri secchi |
| mar 2026 | **Rinumerazione lezioni** — parte da 1 (non 0) nel motore dinamico | Più naturale per l'utente |
| mar 2026 | **Viaggia in Italia = popup dal biglietto** nella XPBar | Crediti → biglietti → destinazioni, tutto in un gesto |

---

## 16. RIFERIMENTI TECNICI

**GitHub:**
- Username: `thevoiceforlife`
- Repository: `italiano-con-stile`
- URL: `https://github.com/thevoiceforlife/italiano-con-stile`
- Autenticazione: SSH (`~/.ssh/id_ed25519`)

**Vercel:**
- URL produzione: `https://italiano-con-stile.vercel.app`
- Deploy automatico: ogni `git push origin main`

**Supabase:**
- Progetto: `italiano-con-stile`
- URL: `https://sgruterciderytvlzoqb.supabase.co`
- Tabelle create: `users`, `progress`, `scores`
- RLS: abilitato su tutte e tre

**Ambiente locale:**
- Node.js: v24.14.0
- npm: v11.9.0
- Git: v2.39.2
- Cartella progetto: `~/Desktop/italiano-con-stile`
- Server locale: `npm run dev` → `http://localhost:3000`

---

## 17. COME USARE QUESTO DOCUMENTO

All'inizio di ogni nuova conversazione con Claude, incolla questo testo e aggiungi:

```
"Questo è il documento di riferimento del progetto 'Italiano con Stile'.
Oggi lavoriamo su: [descrivi lo sprint].

[Se vuoi riaprire una decisione:]
Oggi rivediamo la decisione su [X] perché [motivo].
La nuova decisione è [Y] — aggiorna la sezione 15.

[Eventuali aggiornamenti rispetto all'ultima sessione:]
- ...
"
```

**Alla fine di ogni sprint** chiedi a Claude di generare la Bibbia aggiornata.

Le decisioni in sezione 15 sono **default stabili, non dogmi** — si aggiornano quando c'è un motivo reale.

---

## 18. SISTEMA LIVELLI UTENTE — ARCHETIPI

I livelli non si chiamano A0-C2 nell'UI — hanno nomi narrativi con una parola chiave emotiva.

| Livello | Archetipo | Parola Chiave | Sfumatura attraente |
|---|---|---|---|
| A0-A1 | 🧳 Il Turista | Scintilla | L'inizio di un colpo di fulmine con la lingua |
| A2 | 🛵 Il Viaggiatore | Incontro | Quando inizi a parlare davvero con le persone |
| B1 | 🗺️ L'Esploratore | Avventura | La libertà di scoprire l'Italia più nascosta |
| B2 | ❤️ L'Appassionato | Complicità | Capire l'ironia, i gesti e il "vivere all'italiana" |
| C1 | 🎭 L'Esperto | Passione | Non studi più: vivi, sogni e senti in italiano |
| C2 | 👑 Il Maestro | Essenza | Sei diventato parte dell'anima stessa del Paese |

---

## 19. SISTEMA ENERGIA — DECISIONI SPRINT 4

### Logica cibo → energia
L'energia massima raggiungibile dipende dalla combinazione di tutti i cibi — non solo dal caffè.
Un utente che accumula solo caffè non raggiungerà mai il 100%.

| Cibo | Recupero | Come si guadagna |
|---|---|---|
| ☕ Caffè | +10% | 6 risposte corrette |
| 🥐 Cornetto | +20% | Lezione completata |
| 🍸 Aperitivo | +30% | Mini-game personaggio completato |
| 🍕 Pizza | +8% per spicchio (max 6 = +48%) | 1 spicchio ogni 5 risposte corrette |
| 🍦 Gelato | variabile (vedi sotto) | Solo da Sfida la Nonna |

### Sfida la Nonna — meccanica gelato Sprint 4
- La sfida ha sempre **5 domande**, difficoltà crescente per livello archetipo
- Il gelato si riceve **sempre** al termine — Vittoria non nega mai il gelato
- L'energia guadagnata dipende dal punteggio:

| Risposte corrette | Energia guadagnata | Messaggio Vittoria |
|---|---|---|
| 5/5 | +15% | "Perfetta! Sei brava/o quanto me." |
| 4/5 | +12% | "Quasi. Un errore si perdona." |
| 3/5 | +9% | "Metà strada. Devi studiare di più." |
| 2/5 | +6% | "Solo due? Hai la testa altrove." |
| 1/5 | +3% | "Una sola. Mamma mia." |
| 0/5 | +2% | "Va bene, ti do lo stesso il gelato. Ma la prossima volta impegnati di più." |

**Ragionale:** Il gelato non è una punizione — è una nonna. Le nonne danno sempre da mangiare. Ma il *quanto ti ricarica* dipende dall'impegno.

### Colori barra energia
- > 60% → verde `#58CC02`
- 30-60% → arancione `#FF9600`
- < 30% → rosso `#FF4B4B`

---

## 20. STRATEGIA GENERAZIONE DOMANDE AI

### Fase 0 — Banca statica (ora → primi utenti) — €0
- 5 domande per lezione scritte a mano, salvate nel codice
- localStorage traccia domande già viste → no ripetizioni
- Fallback automatico se API non risponde

### Fase 1 — OpenRouter / Gemini Flash (ponte gratuito) — €0
- Modello: `google/gemma-3-12b-it:free` via OpenRouter
- Chiave: salvata in `.env.local` come `OPENROUTER_API_KEY`
- Route API: `app/api/sfida/route.js`
- Fallback automatico alla Fase 0 se timeout o errore
- Anti-ripetizione: localStorage salva IDs domande già viste (max 60)
- Badge `✨ AI` appare nella topbar quando Gemini genera le domande

### Fase 2 — Claude Haiku (da 5.000 utenti attivi) — ~$5/mese
- Qualità superiore: conosce italiano autentico, falsi amici, proverbi dialettali
- Stesso sistema di fallback e anti-ripetizione della Fase 1
- Costo: ~$0.25 per 1M token input, ~100 token per domanda

### Regola del prompt (valida per tutte le fasi)
Il prompt include per ogni livello:
1. Tipi di domanda specifici (non generici)
2. Esempi concreti di domande buone
3. Note pedagogiche (falsi amici reali, gesti autentici)
4. Regola critica: opzioni sbagliate = errori tipici di un anglofono
5. Regola tipo opzioni: "Cosa significa X?" → opzioni sono SIGNIFICATI, non risposte

---

## 21. PROMPT CHAINING — NOTA PER SPRINT FUTURO

**Cosa è:** Usare Claude API per generare lezioni intere in automatico, non solo domande singole.

**Quando usarlo:** Sprint 6-7, quando serve scalare i contenuti oltre le 4 lezioni manuali attuali.

**Come funziona:**
```
Input:  Bibbia completa + "Crea Lezione 5 — Tema: Al Ristorante — Livello: Viaggiatore"
Output: JSON completo con:
        - 5 card vocabolario (parola IT + EN + esempio)
        - Dialogo Mario di apertura (bilingue)
        - 5 domande quiz con feedback culturale
        - speakText per ogni personaggio
        - Messaggio di chiusura Diego/Mario
```

**Perché Claude e non Gemini per questo:**
Claude conosce già la Bibbia, i personaggi, il tono ironico, la regola bilingue assoluta.
Una lezione generata da Claude sarà coerente con il sistema — Gemini produrrebbe contenuto generico da correggere.

**Stima:** 80 lezioni per coprire tutti i livelli = ~40 minuti di lavoro con prompt chaining.
**Costo:** ~$0.02 per lezione con Claude Haiku.

---

---

## 22. SISTEMA REWARD LEZIONI — STRUTTURA POPUP FINALE

### Scala reward in base agli errori (5 domande per lezione)

| Errori | Cibo | Energia base | Crediti |
|---|---|---|---|
| 0 | 🥐 Cornetto + ☕ Caffè bonus | +20% + 5% | +15 cr (+5 bonus) |
| 1 | 🥐 Cornetto | +20% | +12 cr |
| 2 | 🥐 Cornetto (piccolo) | +15% | +10 cr |
| 3 | ☕ Caffè | +10% | +8 cr |
| 4 | ☕ Caffè (piccolo) | +5% | +5 cr |
| 5+ | (nessuno) | +2% | +2 cr |

**Pizza:** sempre +8% per ogni spicchio guadagnato (1 spicchio ogni 5 risposte corrette), indipendentemente dagli errori. Va nella sezione energia.

### Struttura popup — due sezioni separate

```
── Energia guadagnata ─────────────────
🥐 Cornetto                      +20%
☕ Caffè bonus (solo 0 errori)    +5%
🍕 Pizza (N spicchi)             +N×8%
[barra progresso energia]

── Crediti biglietti ──────────────────
🎫 Completamento                 +10 cr
⭐ Bonus perfetto (solo 0 errori) +5 cr
```

La pizza sta con gli alimenti perché recupera energia — non con i crediti.

### Energia durante la lezione
**Nessuna perdita durante la lezione** — gli errori non consumano energia in tempo reale. Il reward finale è ridotto in base agli errori (Opzione B). L'utente finisce sempre la lezione.

---

## 23. REGOLE DI STILE — LINGUAGGIO

### Niente aggettivi gender-sensitive
Regola valida per tutto il progetto — UI, messaggi personaggi, feedback, notifiche, Bibbia.

| ❌ Elimina | ✅ Sostituisci con |
|---|---|
| Bravissimo / Bravissima | Eccezionale, Complimenti, Perfetto |
| Bravo / Brava | Ottimo lavoro, Ben fatto |
| Sei fortissimo / fortissima | Che risultato! Incredibile! |
| Sei bravo/a quanto me | Sei al mio livello ormai |
| Sei pronto / pronta | Pronti? / Si inizia! |
| Bravissimo! / Excellent! | Eccezionale! / Excellent! |

Questa regola si applica a tutti i personaggi — Mario, Diego, Vittoria, Gino, Sofia, Matilde.

---

---

## 24. MOTORE LEZIONI DINAMICO — STRUTTURA DEFINITIVA

### Architettura file

```
app/
  lesson/
    [id]/page.js          ← motore unico per tutte le lezioni
    boss/page.js          ← motore dedicato Sfida la Nonna
  page.js                 ← home, legge IDs dal JSON

data/
  lessons/
    lesson1.json          ← contenuto lezione 1
    lesson2.json          ← contenuto lezione 2
    lesson3.json          ← ...
    lesson4.json

components/
  saveProgress.js         ← reward centralizzato
  LessonComplete.js       ← popup completamento
```

### Numerazione lezioni
Parte da 1 — la vecchia "lezione 0" diventa lezione 1. Tutte le altre scalano.

### Struttura JSON lezione

```json
{
  "id": 1,
  "title": "Il Primo Caffè",
  "subtitle": "Ordina senza sembrare turista",
  "livello": "Turista",
  "vocab": [
    {
      "id": "caffe",
      "emoji": "☕",
      "it": "un caffè",
      "en": "a coffee",
      "mario": "Testo intro Mario bilingue IT / EN"
    }
  ],
  "questions": [
    {
      "personaggio": "mario",
      "tipo": "multipla",
      "domanda": {
        "it": "Come si chiede un caffè?",
        "en": "How do you ask for a coffee?"
      },
      "opzioni": ["Un caffè, per favore", "Voglio un caffè", "Dammi un caffè", "Coffee please"],
      "correct": 0,
      "feedbackOk": {
        "it": "Perfetto! Breve e educato.",
        "en": "Perfect! Brief and polite."
      },
      "feedbackErr": {
        "it": "'Voglio' è troppo diretto in italiano.",
        "en": "'Voglio' sounds too blunt in Italian."
      }
    },
    {
      "personaggio": "sofia",
      "tipo": "word_bank",
      "domanda": {
        "it": "Riordina le parole per formare la frase.",
        "en": "Put the words in the right order."
      },
      "frase_target": "Vorrei un caffè, per favore.",
      "struttura": ["___", "___", "___", ",", "___", "___", "."],
      "parole": ["Vorrei", "un", "caffè", "per", "favore"],
      "distrattori": ["grazie", "ciao", "buongiorno"],
      "feedbackOk": { "it": "Eccezionale!", "en": "Excellent!" },
      "feedbackErr": { "it": "Riprova — guarda la struttura.", "en": "Try again — look at the structure." }
    },
    {
      "personaggio": "diego",
      "tipo": "gesti",
      "domanda": {
        "it": "Cosa significa questo gesto? 🤌",
        "en": "What does this gesture mean?"
      },
      "opzioni": ["Ma che vuoi?", "Buonissimo!", "Attenzione!", "Vieni qui"],
      "correct": 0,
      "feedbackOk": { "it": "Esatto! Il gesto napoletano per eccellenza.", "en": "Correct! The quintessential Neapolitan gesture." },
      "feedbackErr": { "it": "No — questo gesto esprime irritazione o domanda.", "en": "No — this gesture expresses irritation or a question." }
    },
    {
      "personaggio": "gino",
      "tipo": "vero_falso",
      "domanda": {
        "it": "Al bar italiano si paga prima al bancone.",
        "en": "At an Italian bar you pay first at the counter."
      },
      "correct": false,
      "feedbackOk": { "it": "Giusto! Si paga PRIMA alla cassa.", "en": "Correct! You pay FIRST at the till." },
      "feedbackErr": { "it": "Si paga alla cassa, non al bancone.", "en": "You pay at the till, not the counter." }
    },
    {
      "personaggio": "matilde",
      "tipo": "word_bank",
      "domanda": {
        "it": "Completa l'email formale.",
        "en": "Complete the formal email."
      },
      "frase_target": "Gentile Dottoressa, Le invio i documenti.",
      "struttura": ["___", "___", ",", "___", "___", "___", "___", "."],
      "parole": ["Gentile", "Dottoressa", "Le", "invio", "i", "documenti"],
      "distrattori": ["Ciao", "mando", "i file", "saluti"],
      "feedbackOk": { "it": "Registro formale perfetto.", "en": "Perfect formal register." },
      "feedbackErr": { "it": "'Le' maiuscolo è il pronome di cortesia formale.", "en": "'Le' capitalised is the formal courtesy pronoun." }
    }
  ],
  "reward": {
    "scala_errori": [
      { "max_errori": 0, "energia": 25, "crediti": 15, "cibo": "cornetto+caffè" },
      { "max_errori": 1, "energia": 20, "crediti": 12, "cibo": "cornetto" },
      { "max_errori": 2, "energia": 15, "crediti": 10, "cibo": "cornetto" },
      { "max_errori": 3, "energia": 10, "crediti": 8,  "cibo": "caffè" },
      { "max_errori": 4, "energia": 5,  "crediti": 5,  "cibo": "caffè" },
      { "max_errori": 99,"energia": 2,  "crediti": 2,  "cibo": "nessuno" }
    ],
    "pizza_ogni_n_risposte": 5
  }
}
```

### Personaggio → tipo di domanda

| Personaggio | Tipo | Meccanica |
|---|---|---|
| ☕ Mario | `multipla` | 4 opzioni solo in italiano, 1 corretta |
| 🎧 Sofia | `word_bank` | Ascolta frase, riordina parole |
| 🧢 Diego | `gesti` | Vedi gesto emoji, scegli significato tra 4 opzioni |
| 🎓 Gino | `vero_falso` | Affermazione IT + EN, risposta Vero/Falso |
| 💼 Matilde | `word_bank` | Componi frase formale con word bank |

### Meccanica word bank
- La punteggiatura (virgole, punti, ecc.) è già presente nel box di composizione come guida visiva fissa — non è un elemento da posizionare
- La maiuscola sulla prima parola della word bank è un hint visivo per l'inizio della frase
- I distrattori sono parole plausibili ma sbagliate nel contesto
- L'utente clicca le parole per comporle — clicca di nuovo per rimuoverle

### Bilingue nelle domande
- Testo domanda: IT + EN (adattato al livello — solo EN per Turista A0)
- Opzioni di risposta: **solo italiano** — niente traduzione per evitare aiuto involontario
- Feedback ok/err: **sempre bilingue IT + EN** senza eccezioni

### Numero domande e vocab
- Domande per lezione: 3-8, dichiarate nel JSON (default 5)
- Card vocabolario intro: 3-5, dichiarate nel JSON (default 3)

---

## 25. DECAY ENERGIA PER INATTIVITÀ

**Concetto:** l'energia scende lentamente se l'utente non si collega — crea abitudine senza essere punitivo.

| Inattività | Decay |
|---|---|
| 0-24 ore | nessuno |
| 1 giorno | -10% |
| 2 giorni | -20% |
| 3 giorni | -30% |
| 5+ giorni | si ferma al minimo del 5% |

**Regole:**
- Il minimo assoluto è **5%** — non scende mai sotto, anche dopo settimane
- Il decay parte solo se `completed.length > 0` — chi non ha ancora fatto lezioni non vede l'energia scendere
- Si calcola al mount di `app/page.js` confrontando `Date.now()` con `lastVisit` in localStorage
- `lastVisit` si aggiorna ad ogni visita

**Implementazione in `app/page.js`:**
```js
const now = Date.now();
const lastVisit = prev.lastVisit ?? now;
const giorniPassati = Math.floor((now - lastVisit) / 86400000);
if (giorniPassati > 0 && (prev.completed ?? []).length > 0) {
  const decay = giorniPassati * 10;
  const nuovaEnergia = Math.max((prev.energy ?? 100) - decay, 5);
  // salva nuovaEnergia in localStorage
}
```

---

---

## 26. SISTEMA ENERGIA — COLORI E SOGLIE AVANZATE

### 5 livelli colore barra energia

| % | Colore | Hex | Stato | Conseguenze |
|---|---|---|---|---|
| 75-100% | Verde | #58CC02 | In forma | Tutto sbloccato |
| 50-74% | Azzurro | #1CB0F6 | Buono | Tutto sbloccato |
| 25-49% | Arancione | #FF9600 | Quasi scarico | Tutto sbloccato |
| 10-24% | Rosso | #FF4B4B | Critico | Viaggi bloccati |
| 0-9% | Rosso intenso | #CC0000 | Emergenza | Viaggi bloccati + popup urgente futuro |

### Primo accesso
- Energia iniziale: **30%** (fascia arancione — crea bisogno visivo immediato)
- Vale solo al primo accesso assoluto (localStorage vuoto)
- Chi ha già progressi non viene mai resettato a 30%

### Assenza prolungata
- Decay: -10%/giorno dopo 24h di inattività
- Minimo assoluto: **5%** (rosso intenso — urgenza massima)
- Solo se `completed.length > 0` — i nuovi utenti non vengono penalizzati

### Blocco viaggi sotto 25%
- Sotto 25% le destinazioni diverse da Napoli sono bloccate visivamente
- Lucchetto rosso + messaggio: "Energia insufficiente — mangia qualcosa prima di partire! / Not enough energy — eat something before travelling!"
- **Napoli rimane sempre accessibile** — è il bar di Mario, la casa base
- Tra 25-35% appare avviso giallo: "Attenzione — ancora un po' e non potrai viaggiare"
- I crediti accumulati non scadono — l'utente può spenderli appena recupera energia

### Futuro (Sprint 5+)
- Popup onboarding al primo accesso che spiega il sistema energia
- Popup urgente quando energia < 10% con suggerimenti su come recuperarla rapidamente
- Acquisto rapido energia tramite esercizi o mini-game suggeriti nel popup

---
