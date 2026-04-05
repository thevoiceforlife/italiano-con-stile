const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SCHEDA_ID = process.argv[2];
if (!SCHEDA_ID) {
  console.error('❌ Uso: node scripts/genera-esercizi.js [id-scheda]');
  console.error('   Es: node scripts/genera-esercizi.js articoli-determinativi');
  process.exit(1);
}

const SCHEDA_PATH = path.join(__dirname, `../public/data/biblioteca/schede/${SCHEDA_ID}.json`);
if (!fs.existsSync(SCHEDA_PATH)) {
  console.error(`❌ Scheda non trovata: ${SCHEDA_PATH}`);
  process.exit(1);
}

const scheda = JSON.parse(fs.readFileSync(SCHEDA_PATH, 'utf8'));

const prompt = `Sei un esperto di grammatica italiana e didattica per anglofoni.
Devi generare 60 esercizi per la scheda "${scheda.titolo.it} / ${scheda.titolo.en}" di livello ${scheda.livello}.

CONTESTO DELLA SCHEDA:
${scheda.perche.it}

SPIEGAZIONE:
${scheda.spiegazione.it}

REGOLE FONDAMENTALI:
- Tutto bilingue IT e EN senza eccezioni
- Tono "Finally someone explains why" — chiaro, diretto, onesto
- Livello ${scheda.livello} — vocabolario semplice, contesto napoletano/italiano quotidiano
- Niente frasi artificiali — usa contesti reali (bar, strada, ristorante, famiglia)
- I feedback devono spiegare il PERCHÉ, non solo dire giusto/sbagliato

GENERA ESATTAMENTE:
- 20 esercizi tipo "multipla" (scelta multipla, 4 opzioni, una sola corretta)
- 20 esercizi tipo "vero_falso" (affermazione vera o falsa)
- 20 esercizi tipo "word_bank" (componi la frase con le parole date)

FORMATO JSON per ogni esercizio:

Multipla:
{
  "tipo": "multipla",
  "domanda": { "it": "...", "en": "..." },
  "opzioni": ["opzione0", "opzione1", "opzione2", "opzione3"],
  "correct": 0,
  "feedbackOk": { "it": "...", "en": "..." },
  "feedbackErr": { "it": "...", "en": "..." }
}

Vero/Falso:
{
  "tipo": "vero_falso",
  "domanda": { "it": "...", "en": "..." },
  "correct": true,
  "feedbackOk": { "it": "...", "en": "..." },
  "feedbackErr": { "it": "...", "en": "..." }
}

Word Bank:
{
  "tipo": "word_bank",
  "domanda": { "it": "Componi: [frase con ___]", "en": "Build: [sentence with ___]" },
  "parole": ["parola1", "parola2", "parola3"],
  "distrattori": ["dist1", "dist2"],
  "correct": ["parola1", "parola2", "parola3"],
  "feedbackOk": { "it": "...", "en": "..." },
  "feedbackErr": { "it": "...", "en": "..." }
}

Rispondi SOLO con un array JSON valido di 60 oggetti esercizio. Niente testo prima o dopo. Niente markdown.`;

async function genera() {
  console.log(`\n📚 Scheda: ${scheda.titolo.it} / ${scheda.titolo.en}`);
  console.log(`🎯 Livello: ${scheda.livello}`);
  console.log(`⏳ Generazione 60 esercizi in corso...\n`);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('❌ Errore API:', err);
    process.exit(1);
  }

  const data = await res.json();
  const testo = data.content[0].text.trim();

  let esercizi;
  try {
    esercizi = JSON.parse(testo);
  } catch (e) {
    console.error('❌ Risposta non è JSON valido. Salvo il raw per debug...');
    fs.writeFileSync(`scripts/debug-${SCHEDA_ID}.txt`, testo);
    console.error('   Salvato in scripts/debug-' + SCHEDA_ID + '.txt');
    process.exit(1);
  }

  // Statistiche
  const multipla   = esercizi.filter(e => e.tipo === 'multipla').length;
  const veroFalso  = esercizi.filter(e => e.tipo === 'vero_falso').length;
  const wordBank   = esercizi.filter(e => e.tipo === 'word_bank').length;
  console.log(`✅ Generati: ${esercizi.length} esercizi`);
  console.log(`   🔤 Multipla:    ${multipla}/20`);
  console.log(`   ✅ Vero/Falso:  ${veroFalso}/20`);
  console.log(`   🧩 Word Bank:   ${wordBank}/20`);

  // Salva draft
  const draftPath = `scripts/draft-${SCHEDA_ID}.json`;
  fs.writeFileSync(draftPath, JSON.stringify(esercizi, null, 2));
  console.log(`\n📄 Draft salvato in: ${draftPath}`);
  console.log(`\n👀 Leggi il draft:`);
  console.log(`   cat ${draftPath} | head -100`);
  console.log(`\n✅ Se va bene, applica:`);
  console.log(`   node scripts/applica-esercizi.js ${SCHEDA_ID}`);
}

genera().catch(err => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
