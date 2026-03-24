// app/api/sfida/route.js
// ─── Genera 5 domande per "Sfida la Nonna" via Gemini Flash ──────────────────
// Fallback automatico alla banca statica se API non disponibile.

import { NextResponse } from "next/server";

// ─── Banca statica di fallback (livello Turista — base solida) ────────────────
const FALLBACK = [
  {
    id: "f01",
    q: "È mattina. Entri al Bar di Mario. Cosa fai PRIMA?",
    qEN: "It's morning. You walk into Mario's Bar. What do you do FIRST?",
    opts: ["Vado alla cassa a pagare", "Vado al bancone a ordinare", "Mi siedo ad aspettare", "Chiedo il menu"],
    correct: 0,
    explain: "Al bar italiano si paga PRIMA alla cassa, poi si porta lo scontrino al bancone.",
    explainEN: "At an Italian bar you pay FIRST at the till, then bring the receipt to the counter.",
  },
  {
    id: "f02",
    q: "Come ordini un caffè e un cornetto alla cassa?",
    qEN: "How do you order a coffee and a croissant at the till?",
    opts: ["Un caffè e un cornetto, per favore", "Voglio un caffè e un cornetto", "One coffee and one croissant", "Dammi un caffè e un cornetto"],
    correct: 0,
    explain: "'Per favore' è fondamentale. 'Voglio' e 'Dammi' sono troppo diretti.",
    explainEN: "'Per favore' is essential. 'Voglio' and 'Dammi' are too abrupt.",
  },
  {
    id: "f03",
    q: "Mario chiede: 'Il cornetto — lo vuoi caldo?' Tu rispondi:",
    qEN: "Mario asks: 'The cornetto — do you want it warm?' You reply:",
    opts: ["Sì, grazie!", "Yes please!", "Caldo? Che vuol dire?", "No problem!"],
    correct: 0,
    explain: "Risposta semplice e naturale in italiano. Rispondere in inglese fa sorridere Mario... e piangere dentro.",
    explainEN: "Simple, natural Italian reply. Answering in English makes Mario smile... and cry inside.",
  },
  {
    id: "f04",
    q: "Il caffè è pronto. Dove lo bevi?",
    qEN: "The coffee is ready. Where do you drink it?",
    opts: ["Al bancone, in piedi — come si fa", "Lo porto al tavolo", "Lo porto fuori", "Aspetto seduto"],
    correct: 0,
    explain: "Il caffè italiano si beve al bancone, in piedi, in 2 minuti. È un rito — veloce, intenso, perfetto.",
    explainEN: "Italian coffee is drunk at the counter, standing up, in 2 minutes. It's a ritual.",
  },
  {
    id: "f05",
    q: "Mario dice: 'In bocca al lupo!' Tu rispondi:",
    qEN: "Mario says: 'In bocca al lupo!' You reply:",
    opts: ["Crepi!", "Grazie mille!", "Good luck to you too!", "Ciao!"],
    correct: 0,
    explain: "'Crepi!' è l'UNICA risposta corretta. Dire 'grazie' porta sfortuna — regola ferrea.",
    explainEN: "'Crepi!' is the ONLY correct reply. Saying 'grazie' brings bad luck — iron rule.",
  },
];

// ─── Configurazione livelli ───────────────────────────────────────────────────
const LEVEL_CONFIG = {
  Turista: {
    cefr: "A0-A1",
    tema: "Bar di Mario — sopravvivenza quotidiana",
    tipi: [
      "Come si dice X in italiano? (vocabolario base: saluti, oggetti del bar, numeri)",
      "Cosa fai in questa situazione al bar? (comportamento culturale italiano)",
      "Completa la frase semplice con la parola giusta",
      "Quale risposta e educata e corretta in italiano?",
    ],
    esempiQ: [
      "Come si dice thank you in italiano?",
      "Entri al bar. Cosa fai PRIMA di ordinare?",
      "Mario dice In bocca al lupo! Tu rispondi:",
      "Come ordini un caffe in modo educato?",
    ],
    note: "Domande molto semplici. Opzioni chiare, una sola corretta. Contesto: bar italiano, vita quotidiana, turista anglofono a Napoli.",
  },
  Viaggiatore: {
    cefr: "A2",
    tema: "Vita italiana quotidiana — negozi, trasporti, ristorante",
    tipi: [
      "Articolo corretto (il/la/un/una/lo) davanti a sostantivo",
      "Verbo al presente (andare/essere/avere/volere) — coniugazione giusta",
      "Falso amico: questa parola italiana significa davvero quello che pensi?",
      "Gesto italiano: cosa significa questo gesto in contesto?",
    ],
    esempiQ: [
      "___ caffe, per favore. Quale articolo?",
      "Attualmente in italiano significa: currently / actually / certainly?",
      "Mario usa il gesto dita a punta. Cosa intende?",
    ],
    note: "Falsi amici reali: attualmente/actually, morbido/morbid, peperoni/pepperoni. Verbi comuni al presente. Gesti autentici napoletani.",
  },
  Esploratore: {
    cefr: "B1",
    tema: "Grammatica in contesto — conversazione libera",
    tipi: [
      "Congiuntivo presente dopo sperare che / pensare che / volere che",
      "Preposizione di luogo corretta (a/in/da/di/su) in frase completa",
      "Registro: quale versione e informale vs formale?",
      "Proverbio italiano: scegli il significato corretto",
    ],
    esempiQ: [
      "Spero che Mario ___ al bar domani. (essere al congiuntivo)",
      "Abito ___ Roma. Quale preposizione?",
      "Tra il dire e il fare ce di mezzo il mare significa:",
    ],
    note: "Congiuntivo presente con trigger classici. Proverbi autentici. Registri formale/informale in situazioni reali.",
  },
  Appassionato: {
    cefr: "B2",
    tema: "Ironia, cultura, sfumature — capire come pensano gli italiani",
    tipi: [
      "Congiuntivo imperfetto in periodo ipotetico: se avessi... farei",
      "Slang moderno italiano: cosa significa questa espressione?",
      "Ironia: cosa intende DAVVERO dire questa frase?",
      "Email formale: quale formula di apertura e corretta?",
    ],
    esempiQ: [
      "Se avessi piu tempo, ___ italiano ogni giorno. (studiare al condizionale)",
      "Dai! in italiano puo significare:",
      "Quale apertura e corretta per email formale italiana?",
    ],
    note: "Congiuntivo imperfetto + condizionale. Slang autentico: dai, ma va, figurati, macche. Ironia italiana.",
  },
  Esperto: {
    cefr: "C1",
    tema: "Lingua autentica — registro, sfumatura, cultura profonda",
    tipi: [
      "Congiuntivo trapassato in periodo ipotetico di 3 tipo: se avessi saputo, avrei fatto",
      "Registro giornalistico: come scriverebbe questa frase un giornalista italiano?",
      "Espressione regionale: napoletano, romano o milanese?",
      "Perche questa battuta e divertente per un italiano?",
    ],
    esempiQ: [
      "Se ___ prima, avrei evitato tutto. (sapere al congiuntivo trapassato)",
      "Quale frase ha registro giornalistico corretto?",
      "Uaglio! e un espressione tipicamente:",
    ],
    note: "Congiuntivo trapassato. Dialettalismi autentici (napoletano). Registro formale-neutro giornalistico italiano.",
  },
  Maestro: {
    cefr: "C2",
    tema: "Padronanza totale — pensare e sentire in italiano",
    tipi: [
      "Sfumatura aspettuale: imperfetto vs passato prossimo — perche?",
      "Pragmatica: perche questa risposta e piu naturale per un madrelingua?",
      "Cultura implicita: cosa presuppone questa frase che uno straniero non capirebbe?",
      "Concordanza complessa in frase con piu subordinate",
    ],
    esempiQ: [
      "Stammi bene e grammaticalmente un imperativo riflessivo usato come:",
      "Perche un italiano dice Abbiamo scherzato con tono serio?",
      "In Non e che non voglia venire, il parlante in realta:",
    ],
    note: "Doppia negazione retorica. Aspetto verbale. Presupposizioni culturali implicite.",
  },
};

function buildPrompt(livello, seenIds) {
  const cfg = LEVEL_CONFIG[livello] || LEVEL_CONFIG.Turista;
  const seenNote = seenIds.length > 0
    ? "Non generare domande simili a queste gia viste (ID: " + seenIds.slice(-10).join(", ") + ")."
    : "";
  const tipoIdx = Math.floor(Math.random() * cfg.tipi.length);
  const qIdx = Math.floor(Math.random() * cfg.esempiQ.length);

  return "Sei un insegnante esperto di italiano per anglofoni. Crei domande per Sfida la Nonna, un quiz culturale ambientato a Napoli.\n\n" +
    "LIVELLO: " + livello + " (CEFR " + cfg.cefr + ")\n" +
    "TEMA: " + cfg.tema + "\n" +
    "NOTE: " + cfg.note + "\n" +
    (seenNote ? seenNote + "\n" : "") +
    "\nTIPI DI DOMANDA da usare (uno per domanda, varia i tipi):\n" +
    cfg.tipi.map((t, i) => (i + 1) + ". " + t).join("\n") +
    "\n\nESEMPIO domanda buona per questo livello: " + cfg.esempiQ[qIdx] +
    "\n\nREGOLE TASSATIVE:\n" +
    "1. Le 4 opzioni devono essere TUTTE plausibili ma una sola corretta\n" +
    "2. Le opzioni sbagliate devono essere errori tipici di un anglofono, non opzioni assurde\n" +
    "3. La risposta corretta (correct: 0,1,2,3) deve VARIARE nelle 5 domande — non usare sempre 0\n" +
    "4. q e qEN max 100 caratteri, opts max 50 caratteri ciascuna\n" +
    "5. explain spiega PERCHE quella e la risposta giusta (max 80 caratteri)\n" +
    "6. TIPO OPZIONI — regola critica:\n" +
    "   - Se la domanda e 'Cosa significa X?' o 'X vuol dire?' → le opzioni devono essere SIGNIFICATI/TRADUZIONI di X, non risposte a X\n" +
    "   - Se la domanda e 'Come rispondi a X?' o 'Cosa dici?' → le opzioni devono essere FRASI DA DIRE, non traduzioni\n" +
    "   - Se la domanda e 'Completa: ___ ' → le opzioni devono essere PAROLE/FORME che completano la frase\n" +
    "   - MAI mischiare i tipi: opzioni-risposta per domande di significato e viceversa\n" +
    "   - ESEMPIO SBAGLIATO: domanda='Avanti cosa significa?' opzioni=['Ciao','Vuoi altro?','Come stai?','Arrivederci!'] — SBAGLIATO perche sono risposte, non significati\n" +
    "   - ESEMPIO GIUSTO: domanda='Avanti cosa significa?' opzioni=['Prego accomodati','Vai avanti tu','E il tuo turno','Buongiorno'] — GIUSTO perche sono significati plausibili\n" +
    "\nFORMATO: array JSON puro, zero testo prima o dopo, zero markdown:\n" +
    '[{"id":"a1","q":"...","qEN":"...","opts":["...","...","...","..."],"correct":0,"explain":"...","explainEN":"..."},{"id":"a2","q":"...","qEN":"...","opts":["...","...","...","..."],"correct":1,"explain":"...","explainEN":"..."},{"id":"a3","q":"...","qEN":"...","opts":["...","...","...","..."],"correct":2,"explain":"...","explainEN":"..."},{"id":"a4","q":"...","qEN":"...","opts":["...","...","...","..."],"correct":3,"explain":"...","explainEN":"..."},{"id":"a5","q":"...","qEN":"...","opts":["...","...","...","..."],"correct":1,"explain":"...","explainEN":"..."}]';
}

// ─── Handler principale ───────────────────────────────────────────────────────
export async function POST(request) {
  const { livello = "Turista", seenIds = [] } = await request.json();

  const apiKey = process.env.OPENROUTER_API_KEY;

  // Nessuna chiave → fallback immediato
  if (!apiKey) {
    return NextResponse.json({ questions: FALLBACK, source: "fallback" });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://italiano-con-stile.vercel.app",
        "X-Title": "Italiano con Stile",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: buildPrompt(livello, seenIds) }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    // Strip eventuali backtick markdown
    const clean = raw.replace(/```json|```/gi, "").trim();
    const questions = JSON.parse(clean);

    // Validazione minima
    if (
      !Array.isArray(questions) ||
      questions.length < 5 ||
      !questions[0].q ||
      !questions[0].opts
    ) {
      throw new Error("Risposta malformata");
    }

    return NextResponse.json({ questions, source: "gemini" });

  } catch (err) {
    console.error("[sfida/route] OpenRouter fallback:", err.message);
    return NextResponse.json({ questions: FALLBACK, source: "fallback" });
  }
}
