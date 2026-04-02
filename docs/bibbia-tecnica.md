# 📖 BIBBIA TECNICA — ITALIANO CON STILE
**Versione:** Sprint 7 (aggiornata 02/04/2026)
**Repository:** https://github.com/thevoiceforlife/italiano-con-stile
**Produzione:** https://italiano-con-stile.vercel.app
**Stack:** Next.js 16 + React 19, Vercel, localStorage, Web Speech API

---

## 1. IDENTITÀ DEL PROGETTO

**Motto:** Finally, someone explains why.
**Target:** Anglofoni che imparano italiano
**Lingua UI:** Sempre bilingue IT / EN — senza eccezioni
**Tono:** Caldo, diretto, culturalmente autentico. Mai scolastico.
**Livelli:** A1 Turista → A2 Viaggiatore → B1 Esploratore → B2 Appassionato

---

## 2. ARCHITETTURA FILE

```
app/
  page.js                          Home — personaggi, menu del giorno
  lesson/[id]/page.js              Motore lezioni — 7 tipi di domanda
  lesson/boss/page.js              Sfida la Nonna
  components/
    XPBar.js                       Energia + streak + viaggi
    ItalyTravelModal.js            Cartina Italia
    LessonComplete.js              Schermata fine lezione
    OnboardingModal.js             Onboarding + placement test
    CharacterBubble.js             Personaggio con audio Web Speech API
    LessonButton.js                Bottone VAI → / GO →
    WordPopup.js                   Popup annotazioni grammaticali
    saveProgress.js                Sistema reward centralizzato
    Logo.js                        Logo con animazione
public/
  images/
    mario.png / sofia.png / diego.png / gino.png / matilde.png / vittoria.png
    italia-map.png
    gesti/                         Immagini gesti italiani (da generare)
  data/lessons/
    lesson1.json → lesson4.json
    lesson-boss.json
```

**localStorage key:** `"italiano-progress"`
```json
{
  "energy": 25,
  "credits": 0,
  "tickets": {},
  "completed": [],
  "completedToday": [],
  "lessonScores": {},
  "lastVisit": 0,
  "lastVisitDate": "2026-04-02",
  "livello": "turista",
  "onboardingDone": false,
  "streak": {
    "weekStart": "2026-03-30",
    "totalDays": 7,
    "activeDays": [],
    "bonusErogato": false
  }
}
```

---

## 3. PERSONAGGI — REGOLE DEFINITIVE

### 3.1 I 6 personaggi

| ID | Nome | Emoji | Colore | Voce Web Speech | Ruolo |
|----|------|-------|--------|-----------------|-------|
| mario | Mario | ☕ | #FF9B42 | Rocko (it-IT) | Barista napoletano — guida principale A1-A2 |
| sofia | Sofia | 🎧 | #C8A0E8 | Shelley (it-IT) | Giovane influencer — slang e social |
| diego | Diego | 🧢 | #22C55E | Eddy (it-IT) | Bambino energico — gesti e vocabolario base |
| gino | Gino | 🎓 | #E5B700 | Grandpa (it-IT) | Professore in pensione — etimologia e cultura |
| matilde | Matilde | 💼 | #1CB0F6 | Sandy (it-IT) | Business woman — registro formale B1-B2 |
| vittoria | Vittoria | 🍦 | #E5B700 | Grandma (it-IT) | Nonna Vittoria — boss finale, tono diretto |

### 3.2 Regole per i testi dei personaggi

**REGOLA FONDAMENTALE: Ogni personaggio parla sempre in prima persona diretta all'utente.**

❌ SBAGLIATO (terza persona):
```
"Diego ti mostra un gesto del bar!"
"Mario prende l'ordine del cliente"
```

✅ CORRETTO (prima persona):
```
"Sai riconoscere questo gesto al bar?"
"Come vuoi ordinare il caffè? Dimmi quello più educato!"
```

**Tono per personaggio:**

- **Mario** — amichevole, entusiasta, pratico. "Al mio bar si fa così!"
- **Sofia** — veloce, diretta, slang. "Dai, lo sai questo!"
- **Diego** — energico, con punti esclamativi. "Riesci al volo?"
- **Gino** — calmo, sapiente, racconta storie. "Sai perché si dice così?"
- **Matilde** — formale, professionale, senza fronzoli. "Quale registro usi?"
- **Vittoria** — secca, ironica, affettuosa. "Se non la sai, c'è un problema."

### 3.3 Campo intro nei JSON

Ogni domanda ha:
```json
{
  "intro": "Testo italiano — parlato dal personaggio ad alta voce",
  "intro_en": "English translation — shown in bubble but NOT spoken"
}
```

La bubble mostra: `"${q.intro} / ${q.intro_en}"`
L'audio pronuncia: solo `q.intro` in italiano

---

## 4. SISTEMA ENERGIA — REGOLE DEFINITIVE

| Range | Colore | Stato |
|-------|--------|-------|
| 0-25% | #CC0000 Rosso | Emergenza |
| 26-35% | #FF9600 Arancione | Quasi scarico |
| 36-60% | #1CB0F6 Azzurro | Buono |
| 61-89% | #58CC02 Verde | In forma |
| 90-100% | #46A302 Verde pieno | Caricato |
| 100%+ | #E5B700 Oro ⚡ | Eccezionale / Over-energy |

**Regole:**
- Primo accesso: 25%
- Reset giornaliero: ogni 24h → -15%, minimo 25%
- Lunedì senza giorni attivi: reset forzato a 25%
- Over-energy: accumula oltre 100%, colore oro

**Guadagno energia per lezione:**
- L1 ☕ +10% / L2 🥐 +15% / L3 🍸 +20% / L4 🍕 +15% / Boss 🍦 0-10%

**Scala errori:**
- 0 errori = 100% del reward
- 1-2 errori = 75%
- 3-4 errori = 50%
- 5-6 errori = 25%
- 7+ errori = 0%

**Crediti:**
- Risposta corretta: +2 cr
- Lezione perfetta: +5 cr bonus
- Boss: +20 cr fissi

**Soglie viaggio:**
- ≥25% = Borghi
- ≥60% = Province
- ≥90% = Capoluoghi

---

## 5. SISTEMA LEZIONI — STRUTTURA 4 FASI

Ogni lezione ha esattamente **4 fasi** e **8 domande totali**:

```
FASE 1 — SCOPERTA (0 domande, N card vocabolario)
  → Card tap-to-reveal con emoji + IT + EN + spiegazione Mario
  → Audio: pronuncia SOLO la parola italiana (non la spiegazione)
  → Barra progresso: 0% → 25%

FASE 2 — RICONOSCIMENTO (3 domande)
  → Tipi: multipla, gesti, abbina_coppia
  → Barra progresso: 25% → ~60%

FASE 3 — COMPRENSIONE (2 domande)
  → Tipi: ascolta_scegli, vero_falso
  → Barra progresso: ~60% → ~80%

FASE 4 — PRODUZIONE (3 domande)
  → Tipi: word_bank, fill_blank, falso_amico, scegli_registro
  → Barra progresso: ~80% → 100%
```

**Sfida la Nonna:** NO fase Scoperta. 5 domande: 2 riconoscimento + 1 comprensione + 2 produzione.

---

## 6. TIPI DI DOMANDA — 8 TIPI IMPLEMENTATI

### 6.1 `multipla`
Scelta multipla standard. Le opzioni sono oggetti `{it, en}` — mostrate bilingue.
Usato da: mario, matilde, vittoria

### 6.2 `gesti`
Come multipla ma con emoji gesto sopra.
Campi aggiuntivi: `gesture` (emoji), `gesture_label` (IT / EN)
Usato da: diego

### 6.3 `abbina_coppia`
Due colonne, shuffle separato IT e EN.
Campo: `coppie: [{it, en}]`
Usato da: diego

### 6.4 `ascolta_scegli`
Player audio 🔊 + tartaruga 🐢 lento. Opzioni bilingue.
Campo: `audio` (stringa italiana pronunciata)
Usato da: mario, vittoria

### 6.5 `vero_falso`
Due bottoni Vero/Falso. Risposta immediata al tap senza "Controlla".
Campo: `correct: true | false`
Usato da: gino, vittoria

### 6.6 `word_bank`
Riordina parole. Con hint bilingue. Tre stati: ok / incompleta / errata.
Campi: `parole`, `distrattori`, `correct` (array ordinato), `hint_it`, `hint_en`
Usato da: sofia

### 6.7 `fill_blank`
Come multipla ma con contesto frase con blank.
Usato da: gino

### 6.8 `falso_amico`
Come multipla ma con box contesto bilingue sopra.
Campi: `contesto_it`, `contesto_en`
Usato da: gino, vittoria

### 6.9 `scegli_registro`
Come multipla ma per scegliere formale/informale.
Usato da: matilde

---

## 7. STRUTTURA JSON LEZIONE — TEMPLATE COMPLETO

```json
{
  "id": 5,
  "title": "Titolo IT / Title EN",
  "subtitle": "Sottotitolo IT / Subtitle EN",
  "livello": "Turista",
  "livello_en": "Tourist",
  "unita": 1,

  "vocab": [
    {
      "id": "id-univoco",
      "emoji": "🎯",
      "it": "parola italiana",
      "en": "english translation",
      "mario": "Spiegazione in prima persona IT. / Explanation in first person EN."
    }
  ],

  "questions": [
    {
      "personaggio": "mario",
      "tipo": "multipla",
      "fase": "riconoscimento",
      "intro": "Testo prima persona IT — pronunciato ad alta voce",
      "intro_en": "English translation — shown in bubble only",
      "domanda": {
        "it": "Domanda in italiano?",
        "en": "Question in English?"
      },
      "opzioni": [
        { "it": "Opzione italiana", "en": "English option" },
        { "it": "Opzione italiana 2", "en": "English option 2" }
      ],
      "correct": 0,
      "feedbackOk": {
        "it": "Feedback positivo in italiano.",
        "en": "Positive feedback in English."
      },
      "feedbackErr": {
        "it": "Feedback negativo in italiano.",
        "en": "Negative feedback in English."
      }
    },

    {
      "personaggio": "diego",
      "tipo": "abbina_coppia",
      "fase": "riconoscimento",
      "intro": "Testo prima persona IT",
      "intro_en": "English translation",
      "domanda": { "it": "Domanda IT?", "en": "Question EN?" },
      "coppie": [
        { "it": "parola IT", "en": "word EN" }
      ],
      "feedbackOk": { "it": "...", "en": "..." },
      "feedbackErr": { "it": "...", "en": "..." }
    },

    {
      "personaggio": "mario",
      "tipo": "ascolta_scegli",
      "fase": "comprensione",
      "intro": "Testo prima persona IT",
      "intro_en": "English translation",
      "audio": "Frase italiana da pronunciare",
      "domanda": { "it": "Domanda IT?", "en": "Question EN?" },
      "opzioni": [
        { "it": "Opzione IT", "en": "Option EN" }
      ],
      "correct": 0,
      "feedbackOk": { "it": "...", "en": "..." },
      "feedbackErr": { "it": "...", "en": "..." }
    },

    {
      "personaggio": "gino",
      "tipo": "vero_falso",
      "fase": "comprensione",
      "intro": "Testo prima persona IT",
      "intro_en": "English translation",
      "domanda": { "it": "Affermazione IT.", "en": "Statement EN." },
      "correct": false,
      "feedbackOk": { "it": "...", "en": "..." },
      "feedbackErr": { "it": "...", "en": "..." }
    },

    {
      "personaggio": "sofia",
      "tipo": "word_bank",
      "fase": "produzione",
      "intro": "Testo prima persona IT",
      "intro_en": "English translation",
      "domanda": { "it": "Domanda IT?", "en": "Question EN?" },
      "hint_it": "Frase target IT.",
      "hint_en": "Target sentence EN.",
      "parole": ["Parola1", "parola2", "parola3"],
      "distrattori": ["distrat1", "distrat2"],
      "correct": ["Parola1", "parola2", "parola3"],
      "feedbackOk": { "it": "...", "en": "..." },
      "feedbackErr": { "it": "...", "en": "..." }
    },

    {
      "personaggio": "gino",
      "tipo": "falso_amico",
      "fase": "produzione",
      "intro": "Testo prima persona IT",
      "intro_en": "English translation",
      "domanda": { "it": "Domanda IT?", "en": "Question EN?" },
      "contesto_it": "\"Frase con la parola in contesto.\"",
      "contesto_en": "\"Sentence with the word in context.\"",
      "opzioni": [
        { "it": "Opzione IT", "en": "Option EN" }
      ],
      "correct": 1,
      "feedbackOk": { "it": "...", "en": "..." },
      "feedbackErr": { "it": "...", "en": "..." }
    }
  ],

  "reward": {
    "cibo": "cornetto",
    "cibo_emoji": "🥐",
    "cibo_nome_it": "Cornetto",
    "cibo_nome_en": "Croissant",
    "energia_base": 15,
    "scala_errori": [
      { "max_errori": 0,  "moltiplicatore": 1.0 },
      { "max_errori": 2,  "moltiplicatore": 0.75 },
      { "max_errori": 4,  "moltiplicatore": 0.50 },
      { "max_errori": 6,  "moltiplicatore": 0.25 },
      { "max_errori": 99, "moltiplicatore": 0.0 }
    ]
  }
}
```

---

## 8. ANNOTAZIONI GRAMMATICALI — WORDPOPUP

Ogni parola annotabile ha questo schema:

```json
{
  "parola": "caffè",
  "tipo": "sostantivo",
  "categoria_it": "sostantivo · maschile · singolare",
  "categoria_en": "noun · masculine · singular",
  "en": "coffee / espresso",
  "perche": "Spiegazione del perché in italiano.",
  "perche_en": "Explanation of why in English."
}
```

**Tipi e colori:**

| Tipo | Colore | Hex |
|------|--------|-----|
| sostantivo | 🟠 Arancione | #FF9B42 |
| verbo | 🟢 Verde | #58CC02 |
| aggettivo | 🔵 Azzurro | #1CB0F6 |
| articolo | 🟣 Viola | #C8A0E8 |
| preposizione | 🌸 Rosa | #FF6B9D |
| avverbio | 🩶 Grigio | #AFAFAF |
| falso_amico | 🔴 Rosso | #FF4B4B |
| culturale | 🟡 Oro | #E5B700 |

**Terminologia bilingue obbligatoria:**

| Italiano | English |
|----------|---------|
| sostantivo | noun |
| verbo | verb |
| aggettivo | adjective |
| articolo | article |
| preposizione | preposition |
| avverbio | adverb |
| maschile | masculine |
| femminile | feminine |
| singolare | singular |
| plurale | plural |
| determinativo | definite |
| indeterminativo | indefinite |
| condizionale | conditional |

---

## 9. DISTRIBUZIONE DOMANDE PER LIVELLO

### A1 — Turista (8 tipi attivi)
multipla · abbina_coppia · gesti · ascolta_scegli · vero_falso · word_bank · fill_blank · falso_amico

### A2 — Viaggiatore (+3 nuovi)
+ ascolta_ricostruisci · ascolta_dialogo · completa_desinenza

### B1 — Esploratore (+3 nuovi)
+ scegli_registro · word_bank_formale · ordina_dialogo

### B2 — Appassionato (+2 nuovi)
+ traduci_frase · falso_amico_avanzato

---

## 10. SISTEMA STREAK SETTIMANALE

- **Settimana:** Lunedì → Domenica
- **Giorno attivo:** ≥2 lezioni completate in un giorno
- **Bonus domenica:**
  - ≥5/7 giorni attivi: +50 cr + energia
  - ≥3/7 giorni attivi: +30 cr
  - ≥2/7 giorni attivi: +10 cr
- **Giorni mostrati:** tutti e 7, bilingue (Lun/Mon, Mar/Tue, Mer/Wed, Gio/Thu, Ven/Fri, Sab/Sat, Dom/Sun)

---

## 11. REGOLE UI GLOBALI

1. **Tutto bilingue IT / EN** — senza eccezioni. Titoli, label, feedback, bottoni.
2. **Box domanda** — bordo colorato con il colore del personaggio. Mai confondersi con le risposte.
3. **Opzioni risposta** — sempre bilingue IT (grassetto) + EN (corsivo sotto).
4. **Feedback** — sempre bilingue. IT in grassetto, EN in corsivo sotto.
5. **Audio** — pronuncia solo IT. Mai pronunciare testo inglese.
6. **Shuffle risposte** — deterministico (seed basato sulla domanda) per evitare che la corretta sia sempre prima.
7. **Word bank** — tre stati: ok (verde), incompleta (giallo), sbagliata (rosso). Bottone Riprova senza penalità extra.

---

## 12. COME AGGIUNGERE UNA NUOVA LEZIONE

### Step 1 — Crea il JSON
Segui esattamente il template della sezione 7.
- 4 vocab card nella fase Scoperta
- 3 domande fase Riconoscimento (multipla + gesti/abbina_coppia)
- 2 domande fase Comprensione (ascolta_scegli + vero_falso)
- 3 domande fase Produzione (word_bank + fill_blank/falso_amico)
- Tutti i testi `intro` in prima persona
- Tutto bilingue

### Step 2 — Aggiungi a page.js
```javascript
const LESSONS = [
  // ...lezioni esistenti...
  { id: 5, title: "Titolo IT / Title EN", subtitle: "Sottotitolo IT / EN" },
];
```

### Step 3 — Aggiungi logica unlock
```javascript
function isUnlocked(id) {
  // ...
  if (id === 5) return completed.includes(4);
}
```

### Step 4 — Copia il JSON
```bash
cp lesson5.json ~/Desktop/italiano-con-stile/public/data/lessons/lesson5.json
```

### Step 5 — Deploy
```bash
git add . && git commit -m "Aggiunta lezione 5: [titolo]" && git push origin main
```

---

## 13. COME GENERARE LEZIONI CON CLAUDE API (Sprint 9+)

Usa questo prompt per generare un JSON lezione completo:

```
Sei il motore di generazione lezioni per "Italiano con Stile".
Genera una lezione JSON seguendo ESATTAMENTE questo template: [template sezione 7]

REGOLE OBBLIGATORIE:
- Tutto bilingue IT / EN
- Tutti i testi intro in prima persona diretta
- Mario parla come barista napoletano amichevole
- Diego parla in modo energico con punti esclamativi
- Gino parla come professore che racconta storie
- Sofia parla veloce e diretto
- Matilde parla formale e professionale
- Vittoria parla secca e ironica

TEMA: [inserisci tema, es. "Al Ristorante", "In Albergo", "Numeri e Prezzi"]
LIVELLO: A1 Turista
UNITA: [numero unità]

Genera SOLO il JSON, nessun testo aggiuntivo.
```

Modello consigliato: **Claude Haiku** — ~$0.001 per lezione generata.

---

## 14. ROADMAP SPRINT

| Sprint | Contenuto | Status |
|--------|-----------|--------|
| 5 | Cartina Italia + energia + viaggi | ✅ |
| 6 | Menu del giorno + onboarding + streak | ✅ |
| 7 | Motore lezioni 7 tipi + JSON + WordPopup | ✅ |
| 8 | Mini-game personaggi (tap → gioco) | ⏳ |
| 9 | Prompt chaining — Unità 2 e 3 A1 | ⏳ |
| 10 | Autenticazione Supabase | ⏳ |
| 11 | Azure TTS + speech recognition | ⏳ |
| 12 | Business Italian Matilde | ⏳ |
| 13 | PWA mobile | ⏳ |
| 14 | Freemium + monetizzazione | ⏳ |

---

## 15. MINI-GAME PERSONAGGI (Sprint 8)

| Personaggio | Mini-game | Meccanica |
|------------|-----------|-----------|
| ☕ Mario | Cosa dice il cliente? | Dialogo AI — 3 opzioni generate da Claude API |
| 🎧 Sofia | Speed Round | 10 slang in 60 secondi |
| 🧢 Diego | Flash Gesti | 5 gesti in 60 secondi |
| 🎓 Gino | Gesto + Storia | 1 gesto con storia culturale approfondita |
| 💼 Matilde | Email Challenge | Componi email formale con word bank |
| 🍦 Vittoria | Sfida la Nonna | Boss finale — già implementato |

**Accesso:** tap sul personaggio nella home.
**Costo AI (Mario):** ~$0.002 per dialogo con Claude Haiku.

---

*Fine Bibbia Tecnica — aggiornare ad ogni sprint.*
