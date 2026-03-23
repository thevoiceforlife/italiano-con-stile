# 📖 BIBBIA DEL PROGETTO — "Italiano con Stile"
> Documento di riferimento per ogni nuova sessione di sviluppo.
> Incolla questo documento all'inizio di ogni nuova conversazione con Claude.
> Ultima versione: marzo 2026 — aggiornata dopo Sprint 2

---

## 1. CONCEPT GENERALE

**Nome app:** Italiano con Stile
**Titolo UI:** Italian for English Speakers
**Tagline UI:** "Finally, someone explains why."
**Tagline interna:** "Impara l'italiano con i tuoi 5 compagni napoletani"
**Target:** English speakers (anglofoni) — livelli A1 → C2
**Lingua UI:** Inglese
**Lingua di apprendimento:** Italiano
**Regola bilingue ASSOLUTA:** Ogni frase, spiegazione, avvertenza, badge, notifica deve essere in DOPPIA LINGUA — prima in italiano, poi in inglese. Nessuna eccezione. Non solo la frase da imparare, ma TUTTA la spiegazione.

**Ispirazione:** Duolingo — ma con identità italiana forte, ironia autentica, contenuti culturali profondi.

**Differenziatori chiave rispetto a Duolingo:**
- Il bar di Mario come metafora centrale e hub narrativo
- 5 personaggi con identità precise e trigger specifici
- Contenuti culturali autentici (non inventati): proverbi, gesti, falsi amici reali
- Sistema punti a tema italiano: Caffè → Cornetto → Aperitivo → Pizza
- Viaggio nelle 20 regioni italiane
- Ironia autentica — ride CON l'Italia, mai dell'Italia
- Grammatica mai insegnata frontalmente — sempre nascosta nel contesto

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

**Voci Web Speech API disponibili sul Mac del developer (aggiornate Sprint 2):**
> ⚠️ Le voci Luca/Federica/Paola NON sono disponibili in Chrome/Safari su questo Mac.
> Le voci attive sono quelle del sistema macOS moderno:

- `Rocko` it-IT → **Mario** (M, caldo e deciso)
- `Shelley` en-GB → **Logo sottotitolo** (F, voce inglese)
- `Eddy` it-IT → **Diego** (M, pitch alto simula bambino)
- `Grandpa` it-IT → **Gino** (M anziano, lento)
- `Sandy` it-IT → **Matilde** (F professionale)
- `Shelley` it-IT → **Sofia** (F giovane)

**Azure TTS per produzione (voci per personaggio):**
- Mario → it-IT-GiuseppeNeural (M adulto)
- Sofia → it-IT-IsabellaNeural (F giovane)
- Diego → it-IT-GiuseppeNeural + pitch alto
- Gino → it-IT-BenignoNeural (M anziano)
- Matilde → it-IT-ElsaNeural (F professionale)

---

## 3. I 5 PERSONAGGI — PROFILI DEFINITIVI

### ☕ MARIO — Il Barista
- **Età:** 40-45 anni
- **Ruolo nell'app:** Personaggio PRINCIPALE — presente in OGNI lezione. Host, guida, cuore dell'app.
- **Voce Web Speech:** `Rocko` it-IT | rate: 0.88 | pitch: 1.0
- **Colore:** #FF9B42 (arancio caldo)
- **Animazione avatar:** speaking-glow-mario (glow arancione pulsante mentre parla)
- **Personalità:** Caldo, accogliente, ironico ma mai cattivo. Conosce tutti. Dal turista al professionista, dall'umile all'altolocato — al suo bar passano tutti. Elargisce consigli, dice "Attenzione, sembra X ma è Y", conosce proverbi, gesti, storia locale.
- **Funzione pedagogica:** Apre ogni sessione con frase del giorno. Introduce il tema. Presenta gli altri personaggi nel momento giusto. Chiude con "Il Consiglio di Mario". Consola dopo errori con ironia calda.
- **Feature unica:** "Il Consiglio di Mario" — ogni lezione ha un momento in cui Mario si sporge dal bancone e dice qualcosa che non troveresti su nessun libro.
- **Argomenti:** Vita quotidiana, saluti, cibo e bar, indicazioni stradali, clima, sport, calcio, falsi amici del quotidiano, gesti.
- **Frasi tipo:** "Senti qua..." / "Attenzione però..." / "Sembra X ma è Y — te lo dico io" / "Meglio tardi che mai!"
- **Presentazione home:** "Sono Mario, il tuo barista. Ti accompagno in ogni lezione — dal primo caffè alla vita quotidiana italiana. / I'm Mario, your barman. I'll guide you through every lesson — from your first espresso to everyday Italian life."
- **IMMAGINE:** `/public/images/mario.png`

### 🎧 SOFIA — La Scugnizza
- **Età:** ~20 anni
- **Ruolo nell'app:** Voce della generazione Z italiana. Slang, linguaggio urbano, ironia secca.
- **Voce Web Speech:** `Shelley` it-IT | rate: 1.1 | pitch: 1.2
- **Colore:** #C8A0E8 (viola)
- **Animazione avatar:** speaking-glow-sofia (glow viola pulsante)
- **Personalità:** Distaccata ma non maleducata. Intelligenza sottile. Parla veloce. Non spiega mai due volte. "Boh." è una risposta completa per lei.
- **Funzione pedagogica:** Slang moderno, espressioni idiomatiche contemporanee, italiano dei social, speed round veloci.
- **Argomenti:** Slang generazionale, social media in italiano, musica pop, cosa NON dire a un giovane italiano, WhatsApp e TikTok italiano.
- **Frasi tipo:** "Tipo... boh." / "Ok, non male." / "Veloce, muoviti." / "Nah, non ci siamo."
- **Presentazione home:** "Sono Sofia. Ti insegno lo slang, i social e come parlano davvero i giovani italiani. Veloce. / I'm Sofia. I'll teach you slang, social media Italian, and how young Italians actually speak. Fast."
- **IMMAGINE:** `/public/images/sofia.png`

### 🧢 DIEGO — Il Piccirillo
- **Età:** 7-8 anni
- **Ruolo nell'app:** Motore emozionale puro. NON insegna grammatica o cultura. È il rinforzo positivo.
- **Voce Web Speech:** `Eddy` it-IT | rate: 1.3 | pitch: 1.55
- **Colore:** #22C55E (verde)
- **Animazione avatar:** speaking-glow-diego (glow verde pulsante)
- **Personalità:** Entusiasmo illimitato. Frasi semplicissime. Usa l'imperativo continuamente. Non capisce le cose difficili e lo dice apertamente.
- **Funzione pedagogica:** Appare solo su streak, successi, celebrazioni. Vocabolario A1 elementare. Mascotte dello streak giornaliero.
- **Argomenti:** Vocabolario A1, colori, animali, numeri, sport, giochi, rinforzo positivo.
- **Frasi tipo:** "SIIIIII! Sei fortissimo!" / "Woooo! Streak x5!" / "DAI DAI DAI!" / "Nooo! Ma dai! Riprova!"
- **Presentazione home:** "Io sono Diego! Ogni volta che fai bene, arrivo io! SIIII! Sei fortissimo! / I'm Diego! Every time you do well, I show up! YESSS! You're the best!"
- **IMMAGINE:** `/public/images/diego.png`

### 🎓 GINO — Il Professore in Pensione
- **Età:** 70-75 anni
- **Ruolo nell'app:** Cultura, storia, profondità. Ex professore di lettere. NON insegna regole come un manuale — le RACCONTA.
- **Voce Web Speech:** `Grandpa` it-IT | rate: 0.72 | pitch: 0.72
- **Colore:** #E5B700 (ambra/oro)
- **Animazione avatar:** speaking-glow-gino (glow ambra pulsante)
- **Personalità:** Lento, pausato, riflessivo. Inizia sempre con un aneddoto. Cita Dante, Manzoni, Leopardi naturalmente. Non usa mai gergo moderno. Fa domande retoriche: "Sai perché si dice così?"
- **Funzione pedagogica:** Appare SOLO dopo errori ripetuti (3 volte stesso errore) o in "pillole cultura". Grammatica profonda B1+. Pillole di storia. Etimologia. Citazioni colte. Dialetti regionali.
- **I "Pacchetti Gino":** max 3 schermate — 1) La regola in 1 frase, 2) 3 esempi quotidiani, 3) 2 eccezioni + trucco. Poi 5 esercizi mirati. Poi torna il flusso normale.
- **Differenza da Matilde:** Gino racconta storie, cita autori, fa viaggi nel tempo. Matilde va dritta al punto con precisione business.
- **Argomenti:** Congiuntivo, condizionale, storia della lingua, letteratura italiana accessibile, arte, architettura, origine proverbi.
- **Frasi tipo:** "Vedi, c'è una storia bellissima..." / "Dante diceva che..." / "Sai perché si dice così?"
- **Presentazione home:** "Sono Gino, professore di lettere in pensione. Ti racconto la storia della lingua italiana — perché capire il perché è più potente che memorizzare la regola. / I'm Gino, a retired literature teacher. I'll tell you the story of the Italian language — because understanding why is more powerful than memorising the rule."
- **IMMAGINE:** `/public/images/gino.png`

### 💼 MATILDE — La Manager
- **Età:** 35-45 anni
- **Ruolo nell'app:** Precisione, efficienza, professionalità. Italian business language.
- **Voce Web Speech:** `Sandy` it-IT | rate: 0.95 | pitch: 1.0
- **Colore:** #1CB0F6 (azzurro)
- **Animazione avatar:** speaking-glow-matilde (glow azzurro pulsante)
- **Personalità:** Assertiva, neutro-professionale. Zero nostalgia. Frasi complete, mai troncate. Usa sempre il condizionale di cortesia. Non usa slang mai. Corregge senza essere maleducata.
- **Differenza da Gino:** Matilde definisce, distingue, corregge. Nessuna narrativa, massima precisione.
- **Funzione pedagogica:** Business Italian, email formali, meeting, negoziazione, vocabolario tecnico, italiano formale. Conduce test di livello B2-C2. Hard Mode.
- **Argomenti:** Email e comunicazioni formali, presentazioni, contratti (base), il "Lei" di cortesia, CV.
- **Frasi tipo:** "La distinzione è precisa..." / "Per essere esatti..." / "Corretto. Procediamo." / "Il mercato non aspetta."
- **Presentazione home:** "Sono Matilde. Business Italian, email formali, riunioni. Niente slang. Niente scuse. Procediamo. / I'm Matilde. Business Italian, formal emails, meetings. No slang. No excuses. Let's proceed."
- **IMMAGINE:** `/public/images/matilde.png`

---

## 4. TRIGGER — QUANDO APPARE OGNI PERSONAGGIO

| Personaggio | Appare quando... |
|---|---|
| ☕ Mario | SEMPRE — apertura app, inizio/fine ogni lezione, errori, traguardi, daily tip |
| 🎧 Sofia | Moduli slang, speed round, espressioni idiomatiche moderne |
| 🧢 Diego | Streak ogni 3 risposte corrette, lezione completata, bonus XP, vocabolario A1 |
| 🎓 Gino | Stesso errore grammaticale 3 volte, pillole storia, etimologia, livello B1+ |
| 💼 Matilde | Moduli business, email formali, test B2-C2, Hard Mode, errore in contesto formale |

**Regola d'oro:** Mario apre e chiude SEMPRE. Gli altri entrano solo nel loro dominio, introdotti da Mario.

---

## 5. PALETTE COLORI — DARK MODE (Duolingo-inspired)

```css
/* Sfondi */
--bg:         #23313D;   /* Sfondo base — home e navigazione */
--bg-lesson:  #23313D;   /* Sfondo lezione */
--card:       #2C3E4A;   /* Card e contenitori */
--border:     #38444D;   /* Bordi */
--line:       #13444D;   /* Linee sentiero */

/* Testo */
--text:       #E5E5E5;   /* Testo principale */
--text2:      #AFAFAF;   /* Testo secondario */
--text3:      #777E8B;   /* Testo terziario */

/* Bottoni azione */
--primary:    #58CC02;   /* Verde Duolingo — conferma/avanti */
--primary-d:  #46A302;   /* Ombra bottone primario */
--secondary:  #1CB0F6;   /* Azzurro — inizia/upgrade */
--secondary-d:#1899D6;
--special:    #FF9600;   /* Arancione — ripassa/XP */
--special-d:  #E68600;

/* Opzioni risposta */
--opt-bg:       #2C3E4A;
--opt-border:   #38444D;
--opt-text:     #E5E5E5;
--opt-sel-bg:   #13444D;
--opt-sel-b:    #1CB0F6;
--opt-sel-text: #1CB0F6;

/* Feedback barra */
--ok-bar:    #061F23;    /* Sfondo risposta corretta */
--ok-text:   #58CC02;
--err-bar:   #2E0F11;    /* Sfondo risposta sbagliata */
--err-text:  #FF4B4B;
--err-btn:   #FF4B4B;
--err-btn-d: #D33131;
--warn-bar:  #2A2000;    /* Quasi corretto */
--warn-text: #FFC800;
--warn-btn:  #FFC800;

/* Indicatori top bar */
--streak:    #FF9600;
--lives:     #FF4B4B;
--xp:        #58CC02;

/* Disabled */
--dis-bg:    #38444D;
--dis-text:  #BEC2CC;

/* Personaggi */
--mario:     #FF9B42;
--sofia:     #C8A0E8;
--diego:     #22C55E;
--gino:      #E5B700;
--matilde:   #1CB0F6;

--r:   14px;   /* Border radius standard */
--dep: 4px;    /* Profondità ombra bottoni */
```

**Font:** Nunito (via `next/font/google`) — weight 700/800/900
**Bottoni:** uppercase, font-weight 900, letter-spacing 0.6px, ombra 3D `0 4px 0 [colore-scuro]`
**Bottone pressed:** `translateY(2px)` — simula click fisico

---

## 6. SISTEMA A PUNTI — LA VALUTA ITALIANA

| Livello | Icona | Equivale a |
|---|---|---|
| Base | ☕ Caffè | 1 pt |
| Secondo | 🥐 Cornetto | 5 caffè |
| Terzo | 🍹 Aperitivo | 4 cornetti = 20 pt |
| Top | 🍕 Pizza | 5 aperitivi = 100 pt |

**⚠️ Per i minori:** Aperitivo → Bibita analcolica / Arancino / Gelato

**Come si guadagnano:**
- Risposta corretta: +1 caffè
- Risposta perfetta (primo tentativo): +2 caffè
- Daily login: +2 caffè
- Lezione completata: +5 cornetti
- Lezione perfetta (0 errori): +10 cornetti
- Streak 7 giorni: +15 cornetti
- Achievement: +10 cornetti
- Unità completata: +100 punti pizza
- Boss level superato: +200 punti pizza
- Regione completata: +300 punti pizza
- Passaggio livello CEFR: +1000 punti pizza

**Come si spendono:**
- Streak Freeze: 1 cornetto
- Vita extra: 2 caffè
- Hint risposta: 1 caffè
- Skip domanda: 3 caffè
- Sblocca regione in anticipo: 5 pizze
- Costume personaggio: 2 pizze

**⚠️ Stato attuale (Sprint 2):** Sistema parzialmente implementato. XP generico salvato in localStorage. Distinzione caffè/cornetti/aperitivo/pizza da implementare in Sprint 6.

---

## 7. LIVELLI UTENTE (CEFR → Titolo)

| CEFR | Titolo | Personaggio guida |
|---|---|---|
| A1 | 🧳 Il Turista | Mario |
| A2 | 🗺 L'Esploratore | Diego |
| B1 | 🍕 Il Residente | Sofia |
| B2 | 🎭 L'Innamorato | Gino |
| C1 | 💼 Il Manager | Matilde |
| C2 | 🏛 Il Nonno Onorario | Gino + tutti |

**Test di ingresso:** 20 domande adattive, risultato in 5 minuti, certificato condivisibile.

---

## 8. STRUTTURA LEZIONI (Metodo Duolingo applicato)

**Regola fondamentale:** La grammatica NON ha una sezione separata. È distribuita in ogni unità come strato invisibile.

**Struttura di ogni lezione (implementata in Sprint 2):**
1. **Fase Intro** — 3 card vocabolario tap-to-reveal con emoji + parola + traduzione + frase di Mario + audio al tap. Il bottone "Inizia" si sblocca solo quando tutte le card sono state toccate.
2. **Fase Quiz** — domande multiple choice con feedback bilingue, sistema vite, XP.
3. **Schermata completamento** — XP guadagnato, vite rimaste, Mario che saluta.

**Gino appare SOLO dopo un errore ripetuto** — mai come insegnante frontale.

**Tipi di domande:**
1. Multiple choice (4 opzioni) ← implementato
2. Word bank / Tap in order
3. Listen + type
4. Speaking (Web Speech API)
5. Image match
6. Fill in the blank
7. Reorder words (drag & drop)
8. AI Dialogue
9. Speed Round
10. Falso amico detector

**Struttura feedback risposta typing (Levenshtein distance):**
- dist = 0: ✅ Perfetto
- dist ≤ 3: ⚠️ Attenzione
- dist > 3: ❌ Sbagliato

---

## 9. COMPONENTI STRUTTURALI (Sprint 2)

### `CharacterBubble` — componente riusabile
**File:** `app/components/CharacterBubble.js`
**Esporta:** `default CharacterBubble`, `CHARACTERS`, `parla()`, `CHARACTER_ANIMS`

```jsx
<CharacterBubble
  character="mario"     // "mario"|"sofia"|"diego"|"gino"|"matilde"
  text="Testo bilingue" // testo nel fumetto
  speakText="Testo IT"  // testo da leggere ad alta voce
  autoSpeak={true}      // parla automaticamente al mount
  feedback="ok"         // "ok"|"err"|null — animazione feedback
  size={64}             // dimensione avatar px
/>
```

**Comportamenti:**
- Glow pulsante nel colore del personaggio mentre parla
- Fumetto speech bubble con coda triangolare CSS
- Bordo fumetto si illumina nel colore del personaggio mentre parla
- Avatar cliccabile per risentire la voce
- Animazioni pulse-ok / shake-err sul feedback

### `Logo` — logo animato
**File:** `app/components/Logo.js`
- Logo SVG con bandiera UK + bandiera IT come speech bubble
- Animazione `logo-float` continua
- Su hover: `logo-wave` + glow intensificato
- Icona 🗣️ verde neon prima del sottotitolo — click sblocca AudioContext
- Dopo unlock: solo hover attiva la sequenza
- Sequenza: ding campanella 2200Hz → voce EN → parole neon una per una → ding finale

### `XPBar` — barra XP home
**File:** `app/components/XPBar.js`
- Legge da `localStorage` key `ics_progress`
- Mostra: streak 🔥, caffè ☕, percentuale, vite ❤️

### `LessonButton` — bottone VAI
**File:** `app/components/LessonButton.js`
- Client component per routing `router.push(/lesson/${id})`

---

## 10. UNITÀ DIDATTICHE (struttura)

### Unità 1 — Benvenuto al Bar di Mario (A1)

**Lezione 1 — Il Primo Caffè** ← IMPLEMENTATA
- Vocabolario intro: caffè ☕, cornetto 🥐, tè 🍵
- Come ordinare senza sembrare turista
- Falso amico: "cornetto" ≠ "cornet"
- Il rito del caffè al bancone
- Dove si paga al bar italiano

**Lezione 2 — Mario dà le Indicazioni** ⏳
- Come chiedere strada senza fare l'americano
- Preposizioni di luogo: a, in, da, per
- Il GPS italiano ("a 10 minuti" = forse 30)
- I numeri e l'orario

**Lezione 3 — La Cultura del Cibo** ⏳
- L'ordine dei piatti — sacro e intoccabile
- Falso amico: "peperoni" ≠ "pepperoni"
- Al ristorante — ordina senza offendere
- La domenica a tavola

**Boss Level** ⏳
- Ordina colazione completa senza errori

### Unità 2 — Mario dà le Indicazioni (A1-A2) ⏳
### Unità 3 — La Cultura del Cibo (A2) ⏳

---

## 11. CONTENUTI AUTENTICI — REGOLE

**REGOLA ASSOLUTA:** Proverbi, frasi idiomatiche, gesti devono essere REALMENTE USATI in Italia. Nessun contenuto inventato.

**Prima del lancio:** Revisione da madrelingua italiano contemporaneo (25-50 anni, non accademico).

### Proverbi autentici verificati (campione):
- "Tra il dire e il fare c'è di mezzo il mare." → Easier said than done.
- "Chi dorme non piglia pesci." → The early bird catches the worm.
- "Non tutte le ciambelle riescono col buco." → Things don't always go as planned.
- "Il lupo perde il pelo ma non il vizio." → A leopard never changes its spots.
- "Meglio tardi che mai." → Better late than never.
- "Paese che vai, usanza che trovi." → When in Rome, do as the Romans do.
- "Chi va piano va sano e va lontano." → Slow and steady wins the race.
- "Ogni scarrafone è bello a mamma soia." → (napoletano) Every mother thinks her child beautiful.

### Falsi amici verificati (campione):
- magari ≠ maybe (= I wish / if only)
- attualmente ≠ actually (= currently)
- annoiato ≠ annoyed (= bored)
- educato ≠ educated (= polite)
- argomento ≠ argument (= topic)
- eventualmente ≠ eventually (= possibly)
- parenti ≠ parents (= relatives)
- peperoni ≠ pepperoni (= bell peppers)
- morbido ≠ morbid (= soft/tender)
- camera ≠ camera (= room/bedroom)

### Gesti autentici verificati (campione):
- 🤌 Dita a punta → "Ma che vuoi?"
- ☝️ Indice rotante sulla guancia → "Buonissimo!"
- 🖐 Dito sotto l'occhio → "Occhio!"
- ✋ Dorso mano sotto mento → "Non me ne frega"
- 🤘 Corna giù = scaramantico / verso qualcuno = insulto grave

### Frasi idiomatiche autentiche verificate (campione):
- "Meno male!" = Thank goodness!
- "In bocca al lupo!" → risposta OBBLIGATORIA: "Crepi!"
- "Magari!" = I wish!
- "Dai!" = Come on / No way / Stop it
- "Che casino!" = What a mess!
- "Non me ne frega niente." = I don't care at all.
- "Figurati!" = Don't mention it
- "Ma va'!" = No way! / Really?

---

## 12. VIAGGIO NELLE 20 REGIONI

Ogni regione = 3 lezioni tematiche + 1 ricetta in italiano + 1 dialetto locale (frasi base) + 1 fatto culturale sorprendente + badge "Passaporto Regionale".

Valle d'Aosta, Piemonte, Lombardia, Trentino-AA, Veneto, Friuli-VG, Liguria, Emilia-Romagna, Toscana, Umbria, Marche, Lazio, Abruzzo, Molise (la regione "che non esiste"), Campania, Basilicata, Puglia, Calabria, Sicilia (arancino vs arancina!), Sardegna.

---

## 13. APP ESISTENTE (dopo Sprint 2)

**URL produzione:** `https://italiano-con-stile.vercel.app`
**Repository:** `https://github.com/thevoiceforlife/italiano-con-stile`

**Struttura file chiave:**
```
app/
  page.js                    — Home Screen
  layout.js                  — Layout globale + Nunito
  globals.css                — Design system + animazioni
  components/
    CharacterBubble.js       — Componente personaggi riusabile
    LessonButton.js          — Bottone VAI → (client)
    XPBar.js                 — Barra XP home (legge localStorage)
    Logo.js                  — Logo animato con audio
    Skyline.js               — (deprecato — skyline rimosso)
  lesson/
    1/page.js                — Lezione 1 completa
public/
  images/
    mario.png / sofia.png / diego.png / gino.png / matilde.png
```

**Funzionalità implementate:**
- ✅ Home Screen dark mode stile Duolingo
- ✅ Logo animato con speech bubble UK+IT
- ✅ Audio campanella 2200Hz + voce EN sul logo
- ✅ Fumetti hover sui personaggi (bilingue)
- ✅ CharacterBubble riusabile per tutte le lezioni
- ✅ Lezione 1 completa (intro vocabolario + quiz 3 domande)
- ✅ Sistema vite (5 vite, -1 per errore)
- ✅ XP salvato in localStorage
- ✅ Suoni Web Audio API (corretto/sbagliato)
- ✅ Animazioni feedback (pulse-ok / shake-err)
- ✅ Barra progressione lezione
- ✅ Schermata completamento lezione
- ✅ Deploy automatico su Vercel

---

## 14. ROADMAP SPRINT

| Sprint | Contenuto | Status |
|---|---|---|
| 0 | Bibbia del progetto | ✅ FATTO |
| 1 | Setup GitHub + Vercel + Supabase + VS Code | ✅ FATTO |
| 2 | Demo HTML → Next.js reale + deploy | ✅ FATTO |
| 3 | Unità 1 completa — Bar di Mario (lezioni 2+3+Boss) | ⏳ Prossimo |
| 4 | Autenticazione + salvataggio progressi Supabase | ⏳ |
| 5 | Mappa regioni — prime 5 regioni | ⏳ |
| 6 | Sistema punti caffè completo + shop | ⏳ |
| 7 | Mini-giochi (gesto quiz, speed round, falso amico detector) | ⏳ |
| 8 | Business Italian — moduli Matilde | ⏳ |
| 9 | App mobile PWA | ⏳ |
| 10 | Freemium → monetizzazione | ⏳ |

---

## 15. DECISIONI CHIAVE — LOG CON DATA

> **Come funziona questo log:**
> Le decisioni qui sono **default stabili** — non si riaprono per abitudine o dimenticanza,
> ma si riaprono eccome se c'è una ragione valida.
>
> **Per riaprire una decisione**, all'inizio della nuova chat scrivi:
> "Oggi rivediamo la decisione su [X] perché [motivo]. La nuova decisione è [Y]."

| Data | Decisione | Motivo / Note |
|---|---|---|
| mar 2026 | **Gino = professore in pensione** (non insegnante attivo) | Entra con citazioni, storia, aneddoti — mai frontale |
| mar 2026 | **Matilde = efficienza e precisione business** | Nessuna narrativa, mai slang, condizionale sempre |
| mar 2026 | **Grammatica MAI frontale** — Gino solo dopo 3 errori | Metodo Duolingo — la regola emerge dall'errore |
| mar 2026 | **Tutto bilingue** — ogni parola di spiegazione ITA + ENG | Non solo la frase da imparare — tutta la spiegazione |
| mar 2026 | **Contenuti autentici** — revisione madrelingua pre-lancio | Nessun proverbio/gesto inventato o da calendario |
| mar 2026 | **Mario = personaggio principale** — il bar come hub | Dal turista al professionista, passano tutti da lui |
| mar 2026 | **Punti: Caffè / Cornetto / Aperitivo / Pizza** | Aperitivo → Bibita/Gelato per i minori |
| mar 2026 | **Editor: VS Code** (non Cursor AI) | VS Code già installato sul Mac del developer |
| mar 2026 | **Git via SSH** (non HTTPS) | GitHub non supporta più autenticazione HTTPS da terminale |
| mar 2026 | **Node.js installato da nodejs.org** (non Homebrew) | Homebrew ha dato problemi di configurazione |
| mar 2026 | **Supabase: RLS abilitato su tutte le tabelle** | Sicurezza default — ogni utente vede solo i propri dati |
| mar 2026 | **Voci Mac sostituite** — Rocko/Shelley/Grandpa/Sandy/Eddy | Luca/Federica/Paola non disponibili in Chrome/Safari su questo Mac |
| mar 2026 | **CharacterBubble come componente strutturale** | Riusabile per tutti i personaggi — voce, colore, glow centralizzati |
| mar 2026 | **Logo con audio campanella 2200Hz** | Web Audio API — 3 parziali inarmoniache, gain 4.0, DynamicsCompressor |
| mar 2026 | **Sblocco audio con primo click** | Policy browser — AudioContext richiede gesto utente. Icona 🗣️ neon come CTA |
| mar 2026 | **Sfondo base #23313D** (non #0A2E36 Duolingo) | Più neutro, meno saturo — meglio su schermi diversi |
| mar 2026 | **localStorage per XP temporaneo** | Soluzione ponte fino a Sprint 4 (Supabase auth) |
| mar 2026 | **Lezione strutturata in 2 fasi** — Intro vocabolario + Quiz | Metodo Duolingo: presenta prima, poi testa |
| mar 2026 | **Titolo UI: "Italian for English Speakers"** | Più diretto e SEO-friendly del tagline italiano |
| mar 2026 | **Sottotitolo UI: "Finally, someone explains why."** | Empatico, differenziante, memorabile |
| mar 2026 | **Dark mode permanente** (no toggle light/dark) | Scelta estetica forte — coerente con il brand |
| mar 2026 | **Skyline SVG rimosso** dalla homepage | Si sovrapponeva al contenuto — da rivedere in Sprint dedicato |

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

**Alla fine di ogni sprint** chiedi a Claude di generare la Bibbia aggiornata con:
- Sezione 14 (Roadmap) aggiornata
- Sezione 15 (Log decisioni) con nuove decisioni e data
- Qualsiasi altra sezione modificata

Le decisioni in sezione 15 sono **default stabili, non dogmi** — si aggiornano quando c'è un motivo reale.
