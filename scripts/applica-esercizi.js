const fs = require('fs');
const path = require('path');

const SCHEDA_ID = process.argv[2];
if (!SCHEDA_ID) {
  console.error('❌ Uso: node scripts/applica-esercizi.js [id-scheda]');
  process.exit(1);
}

const draftPath = path.join(__dirname, `draft-${SCHEDA_ID}.json`);
const schedaPath = path.join(__dirname, `../public/data/biblioteca/schede/${SCHEDA_ID}.json`);

if (!fs.existsSync(draftPath)) {
  console.error(`❌ Draft non trovato: ${draftPath}`);
  console.error(`   Esegui prima: node scripts/genera-esercizi.js ${SCHEDA_ID}`);
  process.exit(1);
}

const esercizi = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
const scheda = JSON.parse(fs.readFileSync(schedaPath, 'utf8'));

// Sostituisci gli esercizi
scheda.esercizi = esercizi;
fs.writeFileSync(schedaPath, JSON.stringify(scheda, null, 2));

console.log(`✅ ${esercizi.length} esercizi applicati a ${SCHEDA_ID}.json`);
console.log(`   🔤 Multipla:   ${esercizi.filter(e => e.tipo === 'multipla').length}`);
console.log(`   ✅ Vero/Falso: ${esercizi.filter(e => e.tipo === 'vero_falso').length}`);
console.log(`   🧩 Word Bank:  ${esercizi.filter(e => e.tipo === 'word_bank').length}`);
console.log(`\n🎉 Fatto! Ricarica /biblioteca/${SCHEDA_ID}`);
