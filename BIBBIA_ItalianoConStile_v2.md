# 📖 BIBBIA DEL PROGETTO — "Italiano con Stile"
> Documento di riferimento per ogni nuova sessione di sviluppo.
> Incolla questo documento all'inizio di ogni nuova conversazione con Claude.
> Ultima versione: marzo 2026 — aggiornata dopo Sprint 1

---

## 1. CONCEPT GENERALE

**Nome app:** Italiano con Stile
**Tagline:** "Impara l'italiano con i tuoi 5 compagni napoletani"
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
| Frontend | Next.js | - |
| Deploy | Vercel | Free (100GB bandwidth) |
| Database + Auth | Supabase | Free (500MB, 50k MAU) |
| AI features | Claude API (Haiku) | ~$5/mese a 5k utenti |
| Audio TTS | Web Speech API (dev) → Azure TTS (prod) | 500k chars/mese free |
| Analytics | PostHog | 1M eventi/mese free |
| Editor | VS Code | - |
| CI/CD | GitHub Actions | Free |

**Voci TTS installate sul Mac del developer:**
- Alice (F) — voce italiana macOS
- Luca (M) — voce italiana macOS ← INSTALLATA
- Federica (F) — voce italiana macOS ← INSTALLATA
- Paola (F giovane) — voce italiana macOS ← INSTALLATA

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
- **Voce Mac:** Luca | pitch: 1.0 | rate: 0.88
- **Animazione:** wiggle
- **Tag colore:** vt-mario (arancio caldo #FF9B42)
- **Personalità:** Caldo, accogliente, ironico ma mai cattivo. Conosce tutti. Dal turista al professionista, dall'umile all'altolocato — al suo bar passano tutti. Elargisce consigli, dice "Attenzione, sembra X ma è Y", conosce proverbi, gesti, storia locale.
- **Funzione pedagogica:** Apre ogni sessione con frase del giorno. Introduce il tema. Presenta gli altri personaggi nel momento giusto. Chiude con "Il Consiglio di Mario". Consola dopo errori con ironia calda.
- **Feature unica:** "Il Consiglio di Mario" — ogni lezione ha un momento in cui Mario si sporge dal bancone e dice qualcosa che non troveresti su nessun libro.
- **Argomenti:** Vita quotidiana, saluti, cibo e bar, indicazioni stradali, clima, sport, calcio, falsi amici del quotidiano, gesti.
- **Frasi tipo:** "Senti qua..." / "Attenzione però..." / "Sembra X ma è Y — te lo dico io" / "Meglio tardi che mai!" (ironico sui ritardi)
- **IMMAGINE:** /mnt/user-data/uploads/1774181966975_Mario.png (base64 disponibile)

### 🎧 SOFIA — La Scugnizza
- **Età:** ~20 anni
- **Ruolo nell'app:** Voce della generazione Z italiana. Slang, linguaggio urbano, ironia secca.
- **Voce Mac:** Paola | pitch: 1.2 | rate: 1.1
- **Animazione:** nod
- **Tag colore:** vt-sofia (viola #C8A0E8)
- **Personalità:** Distaccata ma non maleducata. Intelligenza sottile. Parla veloce. Non spiega mai due volte. "Boh." è una risposta completa per lei.
- **Funzione pedagogica:** Slang moderno, espressioni idiomatiche contemporanee, italiano dei social, speed round veloci.
- **Argomenti:** Slang generazionale, social media in italiano, musica pop, cosa NON dire a un giovane italiano, WhatsApp e TikTok italiano.
- **Frasi tipo:** "Tipo... boh." / "Ok, non male." / "Veloce, muoviti." / "Nah, non ci siamo."
- **IMMAGINE:** /mnt/user-data/uploads/1774181966975_Sofia.png (base64 disponibile)

### 🧢 DIEGO — Il Piccirillo
- **Età:** 7-8 anni
- **Ruolo nell'app:** Motore emozionale puro. NON insegna grammatica o cultura. È il rinforzo positivo.
- **Voce Mac:** Luca | pitch: 1.55 | rate: 1.3 (stessa voce di Mario ma acuta — simula bambino)
- **Animazione:** bounce
- **Tag colore:** vt-diego (verde #22C55E)
- **Personalità:** Entusiasmo illimitato. Frasi semplicissime. Usa l'imperativo continuamente. Non capisce le cose difficili e lo dice apertamente.
- **Funzione pedagogica:** Appare solo su streak, successi, celebrazioni. Vocabolario A1 elementare. Mascotte dello streak giornaliero.
- **Argomenti:** Vocabolario A1, colori, animali, numeri, sport, giochi, rinforzo positivo.
- **Frasi tipo:** "SIIIIII! Sei fortissimo!" / "Woooo! Streak x5!" / "DAI DAI DAI!" / "Nooo! Ma dai! Riprova!"
- **IMMAGINE:** /mnt/user-data/uploads/1774181966975_Diego.png (base64 disponibile)

### 🎓 GINO — Il Professore in Pensione
- **Età:** 70-75 anni
- **Ruolo nell'app:** Cultura, storia, profondità. Ex professore di lettere. NON insegna regole come un manuale — le RACCONTA.
- **Voce Mac:** Luca | pitch: 0.72 | rate: 0.72 (stessa voce di Mario ma grave e lenta)
- **Animazione:** pulse
- **Tag colore:** vt-gino (ambra #FEF3C7)
- **Personalità:** Lento, pausato, riflessivo. Inizia sempre con un aneddoto. Cita Dante, Manzoni, Leopardi naturalmente. Non usa mai gergo moderno. Fa domande retoriche: "Sai perché si dice così?"
- **Funzione pedagogica:** Appare SOLO dopo errori ripetuti (3 volte stesso errore) o in "pillole cultura". Grammatica profonda B1+. Pillole di storia. Etimologia. Citazioni colte. Dialetti regionali.
- **I "Pacchetti Gino":** max 3 schermate — 1) La regola in 1 frase, 2) 3 esempi quotidiani, 3) 2 eccezioni + trucco. Poi 5 esercizi mirati. Poi torna il flusso normale.
- **Differenza da Matilde:** Gino racconta storie, cita autori, fa viaggi nel tempo. Matilde va dritta al punto con precisione business.
- **Argomenti:** Congiuntivo, condizionale, congiuntivo imperfetto, storia della lingua, letteratura italiana accessibile, arte, architettura, origine proverbi, contraddizioni cultura italiana.
- **Frasi tipo:** "Figliolo..." / "Vedi, c'è una storia bellissima..." / "Dante diceva che..." / "Sai perché si dice così?"
- **Esempio:** Il congiuntivo → "Dante lo usa 312 volte nella Divina Commedia, figliolo. Non è un caso."
- **IMMAGINE:** /mnt/user-data/uploads/1774181966976_Gino.png (base64 disponibile)

### 💼 MATILDE — La Manager
- **Età:** 35-45 anni
- **Ruolo nell'app:** Precisione, efficienza, professionalità. Italian business language.
- **Voce Mac:** Federica | pitch: 1.0 | rate: 0.95
- **Animazione:** nod
- **Tag colore:** vt-matilde (azzurro #E0F2FE)
- **Personalità:** Assertiva, neutro-professionale. Zero nostalgia. Frasi complete, mai troncate. Usa sempre il condizionale di cortesia. Non usa slang mai. Corregge senza essere maleducata.
- **Differenza da Gino:** Matilde definisce, distingue, corregge. Nessuna narrativa, massima precisione. Gino racconta — Matilde punta.
- **Funzione pedagogica:** Business Italian, email formali, meeting, negoziazione, vocabolario tecnico, italiano formale. Conduce test di livello B2-C2. Hard Mode.
- **Argomenti:** Email e comunicazioni formali, presentazioni, contratti (base), il "Lei" di cortesia, CV, differenze regionali nel business.
- **Frasi tipo:** "La distinzione è precisa..." / "Per essere esatti..." / "Corretto. Procediamo." / "Il mercato non aspetta."
- **Esempio:** "'Voglio' è aggressivo in contesto formale. 'Vorrei' è lo standard. Non è una sfumatura — è sostanza."
- **IMMAGINE:** /mnt/user-data/uploads/1774181966976_Matilde.png (base64 disponibile)

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

## 5. PALETTE COLORI

```css
--napoli: #0094DA        /* Azzurro Napoli — selezioni, bottoni audio */
--napoli-d: #0078B8      /* Napoli scuro — ombra bottoni */
--napoli-bg: #E0F7FF     /* Napoli chiaro — sfondo selezioni */
--primary: #4F46E5       /* Indigo — bottoni azione principale */
--primary-d: #3730A3     /* Indigo scuro — ombra */
--bg: #F0F4FF            /* Sfondo generale — azzurro chiaro */
--card: #FFFFFF          /* Card background */
--border: #D1D9F0        /* Bordo normale */
--border2: #B8C4E8       /* Bordo secondario */
--text: #1E293B          /* Testo principale */
--text2: #475569         /* Testo secondario */
--text3: #64748B         /* Testo terziario */
--ok: #16A34A            /* Verde successo */
--ok-bg: #DCFCE7
--ok-b: #86EFAC
--err: #DC2626           /* Rosso errore */
--err-bg: #FEE2E2
--err-b: #FCA5A5
--warn: #D97706          /* Ambra attenzione */
--warn-bg: #FFFBEB
--warn-b: #FCD34D
--gold: #F59E0B          /* Oro — XP, stelle */
--gold-d: #D97706
--r: 14px                /* Border radius standard */
--dep: 4px               /* Profondità ombra bottoni */
```

**Font:** Nunito (Google Fonts) — weight 700/800/900
**Bottoni:** uppercase, font-weight 900, letter-spacing 0.6px
**Bottoni — sistema colori con cssText inline (priorità massima):**
- Controlla OFF: #1A3A6B, opacity 0.72
- Controlla ON / Continua: #4F46E5 indigo
- Attenzione (warn): #D97706 ambra
- Sbagliato / Capito: #DC2626 rosso
- Audio: #0284C7 → hover #024F7A

---

## 6. SISTEMA A PUNTI — LA VALUTA ITALIANA

| Livello | Icona | Punti | Equivale a |
|---|---|---|---|
| Base | ☕ Caffè | 10 pt | Unità base |
| Secondo | 🥐 Cornetto | 50 pt | 5 caffè |
| Terzo | 🍹 Aperitivo | 200 pt | 4 cornetti |
| Top | 🍕 Pizza | 1.000 pt | 5 aperitivi |

**⚠️ Per i minori:** Aperitivo → Bibita analcolica / Arancino / Gelato (rilevato dall'età alla registrazione)

**Come si guadagnano:**
- Risposta corretta: +1 caffè
- Risposta perfetta: +2 caffè
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
- Streak Freeze: 50 pt (1 cornetto)
- Vita extra: 20 pt (2 caffè)
- Hint risposta: 10 pt (1 caffè)
- Skip domanda: 30 pt (3 caffè)
- Sblocca regione in anticipo: 500 pt
- Costume personaggio: 200 pt

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

**Regola fondamentale:** La grammatica NON ha una sezione separata. È distribuita in ogni unità come strato invisibile. L'utente studia una situazione (ordinare al bar) e senza saperlo impara gli articoli.

**Gino appare SOLO dopo un errore ripetuto** — mai come insegnante frontale.

**Tipi di domande:**
1. Multiple choice (4 opzioni)
2. Word bank / Tap in order (metti in ordine)
3. Listen + type (ascolta e scrivi)
4. Speaking (Web Speech API)
5. Image match
6. Fill in the blank
7. Reorder words (drag & drop)
8. AI Dialogue (conversazione simulata)
9. Speed Round (10 domande in 60 secondi)
10. Falso amico detector

**Struttura feedback risposta typing (Levenshtein distance):**
- dist = 0: ✅ Perfetto — verde, XP pieno, suono ok
- dist ≤ 3: ⚠️ Attenzione — giallo, metà XP, mostra risposta corretta
- dist > 3: ❌ Sbagliato — rosso, perdi vita

**Colori bottoni con `style.cssText` inline (non classList — override totale browser):**
```javascript
// CRITICO: usare sempre style.cssText per i bottoni, mai classi CSS
// Il flag btnReady (boolean) controlla clickabilità — mai leggere cursor dal DOM
```

---

## 9. UNITÀ DIDATTICHE (struttura)

### Unità 1 — Benvenuto al Bar di Mario (A1)
- Il primo caffè (ordina senza sembrare turista)
- Articoli il/la/lo in contesto (mai spiegati direttamente)
- Falso amico: "cornetto" ≠ "cornet"
- Il rito del caffè al bancone (cultura bilingue)
- Come salutare: ciao / buongiorno / salve / arrivederci
- Verbi essere e avere in contesto
- 🟣 Boss: ordina colazione completa senza errori

### Unità 2 — Mario dà le indicazioni (A1-A2)
- Come chiedere strada senza fare l'americano
- Preposizioni di luogo: a, in, da, per
- Il GPS italiano ("a 10 minuti" = forse 30)
- Trappola: "vicino" ha significato relativo
- I numeri e l'orario
- 🟣 Boss: arriva puntuale a un appuntamento con Matilde

### Unità 3 — La cultura del cibo (A2)
- L'ordine dei piatti — sacro e intoccabile
- Falso amico: "peperoni" ≠ "pepperoni"
- Al ristorante — ordina senza offendere
- Plurale irregolare: uovo→uova, braccio→braccia
- La domenica a tavola — 3 ore minimo
- Parmigiano sul pesce: come sopravvivere
- 🟣 Boss: cena di famiglia con Gino che interroga

---

## 10. CONTENUTI AUTENTICI — REGOLE

**REGOLA ASSOLUTA:** Proverbi, frasi idiomatiche, gesti devono essere REALMENTE USATI in Italia. Nessun contenuto inventato o da calendario. Solo parlato contemporaneo verificato.

**Prima del lancio:** Revisione da madrelingua italiano contemporaneo (25-50 anni, non accademico). Beta test con 5-6 italiani di regioni diverse.

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
- magari ≠ maybe (= I wish / if only) → "maybe" = forse
- attualmente ≠ actually (= currently) → "actually" = in realtà
- annoiato ≠ annoyed (= bored) → "annoyed" = infastidito
- educato ≠ educated (= polite) → "educated" = istruito
- argomento ≠ argument (= topic) → "argument" = litigio
- eventualmente ≠ eventually (= possibly, if needed) → "eventually" = alla fine
- parenti ≠ parents (= relatives) → "parents" = genitori
- peperoni ≠ pepperoni (= bell peppers) → US pepperoni = salame piccante
- morbido ≠ morbid (= soft/tender)
- camera ≠ camera (= room/bedroom) → "camera" = macchina fotografica

### Gesti autentici verificati (campione):
- 🤌 Dita a punta, palmo su, su/giù → "Ma che vuoi?" / "What's going on?"
- ☝️ Indice rotante sulla guancia → "Buonissimo!" (solo cibo)
- 🖐 Dito sotto l'occhio → "Occhio!" / "Watch out!" (⚠️ volgare in alcuni paesi)
- ✋ Dorso mano sotto mento, spinta via → "Non me ne frega" (⚠️ volgare in Francia)
- 🤘 Corna giù = scaramantico / corna verso qualcuno = insulto grave (⚠️ DOPPIO SIGNIFICATO)
- 👌 Pollice+indice cerchio → Perfetto / con bacio alle dita = buonissimo

### Frasi idiomatiche autentiche verificate (campione):
- "Meno male!" = Thank goodness! (NON "less bad")
- "In bocca al lupo!" → risposta OBBLIGATORIA: "Crepi!" (mai "Grazie" — porta sfortuna)
- "Magari!" = I wish! (NON "maybe")
- "Dai!" = Come on / No way / Stop it (il tono decide tutto)
- "Che casino!" = What a mess! (NON gambling casino)
- "Non me ne frega niente." = I don't care at all.
- "Figurati!" = Don't mention it / Of course (NON "figure yourself")
- "Ma va'!" = No way! / Really? (tono decide il significato)

---

## 11. VIAGGIO NELLE 20 REGIONI

Ogni regione = 3 lezioni tematiche + 1 ricetta in italiano + 1 dialetto locale (frasi base) + 1 fatto culturale sorprendente + badge "Passaporto Regionale".

Le 20 regioni con tema:
Valle d'Aosta (franco-provenzale), Piemonte (FIAT/Barolo/Juve), Lombardia (business/moda), Trentino-AA (tedesco+italiano), Veneto (prosecco/Venezia), Friuli-VG (confine AUT/SLO), Liguria (pesto/Genova), Emilia-Romagna (pasta/Ferrari/Pavarotti), Toscana (italiano standard/arte), Umbria (pace/tartufo), Marche (Rinascimento/Adriatico), Lazio (Roma/romanesco), Abruzzo (montagne e mare), Molise (la regione "che non esiste" — meme nazionale), Campania (Napoli/pizza/napoletano), Basilicata (Matera/Lucania), Puglia (orecchiette/trulli), Calabria ('nduja/Aspromonte), Sicilia (arancino vs arancina — il grande dibattito!), Sardegna (lingua sarda/Cannonau).

---

## 12. DEMO ESISTENTE

**File generato:** `italiano_demo.html` (193.934 caratteri)
**Contiene:**
- Splash screen con i 5 personaggi (immagini PNG reali embedded in base64)
- Home screen con percorso lezioni (prima lezione attiva, altre bloccate)
- Lezione giocabile completa — 8 domande, tutti i personaggi, voci Web Speech API
- Sistema XP, streak, vite, feedback animato, confetti, overlay streak/completamento

**Immagini PNG reali disponibili in:**
- /mnt/user-data/uploads/1774181966975_Mario.png
- /mnt/user-data/uploads/1774181966975_Diego.png
- /mnt/user-data/uploads/1774181966975_Sofia.png
- /mnt/user-data/uploads/1774181966976_Gino.png
- /mnt/user-data/uploads/1774181966976_Matilde.png

---

## 13. ROADMAP SPRINT

| Sprint | Contenuto | Status |
|---|---|---|
| 0 | Bibbia del progetto | ✅ FATTO |
| 1 | Setup GitHub + Vercel + Supabase + VS Code | ✅ FATTO |
| 2 | Demo HTML → Next.js reale + deploy | ⏳ Prossimo |
| 3 | Unità 1 completa — Bar di Mario | ⏳ |
| 4 | Autenticazione + salvataggio progressi Supabase | ⏳ |
| 5 | Mappa regioni — prime 5 regioni | ⏳ |
| 6 | Sistema punti caffè completo + shop | ⏳ |
| 7 | Mini-giochi (gesto quiz, speed round, falso amico detector) | ⏳ |
| 8 | Business Italian — moduli Matilde | ⏳ |
| 9 | App mobile PWA | ⏳ |
| 10 | Freemium → monetizzazione | ⏳ |

---

## 14. DECISIONI CHIAVE — LOG CON DATA

> **Come funziona questo log:**
> Le decisioni qui sono **default stabili** — non si riaprono per abitudine o dimenticanza,
> ma si riaprono eccome se c'è una ragione valida (cambio di idea, problema tecnico,
> feedback beta test, voce migliore trovata, ecc.).
>
> **Per riaprire una decisione**, all'inizio della nuova chat scrivi:
> "Oggi rivediamo la decisione su [X] perché [motivo]. La nuova decisione è [Y]."
> Claude aggiornerà questo log con la nuova decisione e la data.

| Data | Decisione | Motivo / Note |
|---|---|---|
| mar 2026 | **Paola → Sofia** (voce giovane femminile Mac) | Timbro più giovane e caratteriale rispetto ad Alice |
| mar 2026 | **Federica → Matilde** (voce professionale Mac) | Tono più formale e assertivo |
| mar 2026 | **Luca → Mario / Diego (pitch 1.55) / Gino (pitch 0.72)** | Unica voce maschile disponibile, differenziata col pitch |
| mar 2026 | **Gino = professore in pensione** (non insegnante attivo) | Entra con citazioni, storia, aneddoti — mai frontale |
| mar 2026 | **Matilde = efficienza e precisione business** | Nessuna narrativa, mai slang, condizionale sempre |
| mar 2026 | **Grammatica MAI frontale** — Gino solo dopo 3 errori | Metodo Duolingo — la regola emerge dall'errore |
| mar 2026 | **Tutto bilingue** — ogni parola di spiegazione ITA + ENG | Non solo la frase da imparare — tutta la spiegazione |
| mar 2026 | **Contenuti autentici** — revisione madrelingua pre-lancio | Nessun proverbio/gesto inventato o da calendario |
| mar 2026 | **Mario = personaggio principale** — il bar come hub | Dal turista al professionista, passano tutti da lui |
| mar 2026 | **Punti: Caffè / Cornetto / Aperitivo / Pizza** | Aperitivo → Bibita/Gelato per i minori (rilevato da età) |
| mar 2026 | **Bottoni: style.cssText inline** (non classList) | Override totale browser — priorità CSS garantita |
| mar 2026 | **btnReady boolean** per clickabilità | Mai leggere cursor dal DOM — flag interno sempre |
| mar 2026 | **Editor: VS Code** (non Cursor AI) | VS Code già installato sul Mac del developer — decisione pragmatica |
| mar 2026 | **Git via SSH** (non HTTPS) | GitHub non supporta più autenticazione HTTPS da terminale |
| mar 2026 | **Node.js installato da nodejs.org** (non Homebrew) | Homebrew ha dato problemi di configurazione su questo Mac |
| mar 2026 | **Supabase: RLS abilitato su tutte le tabelle** | Sicurezza default — ogni utente vede solo i propri dati |

---

## 15. RIFERIMENTI TECNICI SPRINT 1

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

## 16. COME USARE QUESTO DOCUMENTO

All'inizio di ogni nuova conversazione con Claude, incolla questo testo e aggiungi:

```
"Questo è il documento di riferimento del progetto 'Italiano con Stile'.
Oggi lavoriamo su: [descrivi lo sprint].

[Se vuoi riaprire una decisione:]
Oggi rivediamo la decisione su [X] perché [motivo].
La nuova decisione è [Y] — aggiorna la sezione 14.

[Eventuali aggiornamenti rispetto all'ultima sessione:]
- ...
"
```

**Alla fine di ogni sprint** chiedi a Claude di generare la Bibbia aggiornata con:
- Sezione 13 (Roadmap) aggiornata con sprint completati
- Sezione 14 (Log decisioni) con eventuali nuove decisioni e data
- Qualsiasi altra sezione modificata durante la sessione

Le decisioni in sezione 14 sono **default stabili, non dogmi** — si aggiornano quando c'è un motivo reale.
