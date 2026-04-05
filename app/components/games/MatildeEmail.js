'use client';
// app/components/games/MatildeEmail.js
import { useState } from 'react';
import { overlay, modal } from './MarioDialog';

const SCENARI = [
  {
    a:       'La Scuola di Cucina "Il Cucchiaio d\'Oro"',
    oggetto: 'Richiesta di informazioni sui corsi',
    contesto: 'Sei uno studente straniero. Scrivi un\'email formale per chiedere: quali corsi hanno, quanto costano, e quando inizia il prossimo corso.',
    esempio:  'Gentili Signori,\nmi chiamo James White e sono interessato ai vostri corsi di cucina italiana.\nPotete inviarmi informazioni sui corsi disponibili, i prezzi e le date di inizio?\nRingrazio anticipatamente e rimango in attesa di una vostra risposta.\nCordiali saluti,\nJames White',
    suggerimentiVocab: ['Spettabile / Gentili Signori', 'Mi chiamo...', 'Sono interessato/a a...', 'Potete inviarmi informazioni su...', 'Ringrazio anticipatamente', 'Cordiali saluti / Distinti saluti'],
  },
  {
    a:       'Hotel Bella Vista, ufficio prenotazioni',
    oggetto: 'Richiesta di prenotazione e informazioni',
    contesto: 'Vuoi prenotare una camera doppia per il weekend del 15-17 maggio. Chiedi il prezzo per notte, se è inclusa la colazione, e se c\'è il parcheggio.',
    esempio:  'Spettabile Hotel Bella Vista,\ndesidero prenotare una camera doppia per il weekend del 15-17 maggio.\nPotreste gentilmente comunicarmi il prezzo per notte? La colazione è inclusa?\nDisponete inoltre di un parcheggio per gli ospiti?\nIn attesa di una vostra risposta, invio cordiali saluti.\nMaria Johnson',
    suggerimentiVocab: ['Spettabile...', 'Desidero prenotare...', 'Potreste comunicarmi...', 'La colazione è inclusa?', 'In attesa di una vostra risposta', 'Invio cordiali saluti'],
  },
];

function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }

const EVAL_SYSTEM = `Sei Matilde, insegnante di italiano formale e Business Italian. 
Valuta l'email di un anglofono (livello B1) in modo professionale ma incoraggiante.
Rispondi SOLO con JSON valido, nessun testo prima o dopo, nessun backtick markdown.
Formato esatto:
{"voto":7,"commento":"...","correzioni":["...","..."],"frase_ok":"...","xp":25}
- voto: 1-10
- commento: max 2 frasi, tono professionale e incoraggiante
- correzioni: array di max 2 stringhe con suggerimenti specifici (può essere vuoto [])
- frase_ok: una frase dell'email che hai trovato particolarmente buona (cita testualmente)
- xp: 10 se voto<5, 20 se voto 5-7, 30 se voto>=8`;

export default function MatildeEmail({ onClose, onXP }) {
  const [scenario]  = useState(() => shuffle(SCENARI)[0]);
  const [fase,      setFase]      = useState('intro');  // intro → scrivi → carica → risultato
  const [testo,     setTesto]     = useState('');
  const [feedback,  setFeedback]  = useState(null);
  const [loading,   setLoading]   = useState(false);

  async function valuta() {
    if (testo.trim().length < 60) return;
    setFase('carica');
    setLoading(true);

    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system:     EVAL_SYSTEM,
          messages:   [{
            role:    'user',
            content: `Scenario: ${scenario.contesto}\n\nEMAIL DELLO STUDENTE:\n${testo}`,
          }],
        }),
      });
      const data  = await res.json();
      const raw   = data.content?.[0]?.text ?? '{}';
      const clean = raw.replace(/```json|```/g,'').trim();
      const fb    = JSON.parse(clean);
      setFeedback(fb);
      setFase('risultato');
      onXP?.(fb.xp ?? 20);
    } catch {
      setFeedback({ voto:7, commento:'Ottimo lavoro! Email ben strutturata.', correzioni:[], frase_ok:'', xp:20 });
      setFase('risultato');
      onXP?.(20);
    } finally {
      setLoading(false);
    }
  }

  const charOk = testo.trim().length >= 60;

  return (
    <div style={overlay}>
      <div style={{ ...modal, border:'2px solid #1CB0F644', borderBottom:'none' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 14px 12px', borderBottom:'1px solid var(--border)' }}>
          <img src="/images/matilde.png" alt="Matilde" style={{ width:42,height:42,borderRadius:'50%',border:'2.5px solid #1CB0F6',objectFit:'cover' }} />
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:'#1CB0F6' }}>Email Challenge con Matilde</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Italiano formale — niente scuse, procediamo.</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto',background:'none',border:'none',color:'var(--text3)',fontSize:20,cursor:'pointer',padding:4 }}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>

          {fase === 'intro' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ background:'var(--card)', border:'2px solid #1CB0F644', borderRadius:12, padding:'16px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#1CB0F6', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>📧 Il tuo scenario</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}><strong style={{color:'var(--text)'}}>A:</strong> {scenario.a}</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}><strong style={{color:'var(--text)'}}>Oggetto:</strong> {scenario.oggetto}</div>
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{scenario.contesto}</div>
              </div>
              <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', marginBottom:8 }}>💡 Vocaboli utili / Useful vocabulary:</div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {scenario.suggerimentiVocab.map((v,i) => (
                    <div key={i} style={{ fontSize:12, color:'var(--text2)' }}>· {v}</div>
                  ))}
                </div>
              </div>
              <button onClick={() => setFase('scrivi')} style={btnBlue}>Inizia a scrivere →</button>
            </div>
          )}

          {fase === 'scrivi' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ background:'#1CB0F611', border:'1px solid #1CB0F633', borderRadius:8, padding:'9px 12px', fontSize:11, color:'#1CB0F6', lineHeight:1.5 }}>
                💡 Inizia con <strong>"Gentili Signori,"</strong> o <strong>"Spettabile {scenario.a},"</strong> · Finisci con <strong>"Cordiali saluti,"</strong>
              </div>
              <textarea
                value={testo}
                onChange={e => setTesto(e.target.value)}
                placeholder={`Spettabile ${scenario.a},\n\n...`}
                rows={10}
                style={{ background:'var(--card)', border:`2px solid ${charOk ? '#1CB0F6' : 'var(--border)'}`, borderRadius:12, padding:'13px', fontSize:13, color:'var(--text)', fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.65, transition:'border-color 0.2s' }}
              />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:11, color: charOk ? '#22c55e' : 'var(--text3)' }}>
                  {testo.length} caratteri {charOk ? '✓ pronta per la valutazione' : '(minimo 60)'}
                </div>
              </div>
              <button onClick={valuta} disabled={!charOk} style={{ ...btnBlue, opacity: charOk ? 1 : 0.4 }}>
                Invia per valutazione 📤
              </button>
            </div>
          )}

          {fase === 'carica' && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'32px 0' }}>
              <div style={{ width:40, height:40, border:'3px solid #1CB0F622', borderTop:'3px solid #1CB0F6', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <div style={{ fontSize:13, color:'var(--text3)', fontStyle:'italic' }}>Matilde sta leggendo la tua email...</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {fase === 'risultato' && feedback && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {/* Voto */}
              <div style={{ display:'flex', alignItems:'center', gap:14, background:'var(--card)', border:'2px solid #1CB0F644', borderRadius:14, padding:'16px' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:'#1CB0F6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:20, fontWeight:900, color:'white' }}>{feedback.voto}/10</span>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', lineHeight:1.5 }}>{feedback.commento}</div>
                </div>
              </div>

              {/* Frase ottima */}
              {feedback.frase_ok && (
                <div style={{ background:'#22c55e18', border:'1.5px solid #22c55e44', borderRadius:10, padding:'10px 13px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#22c55e', marginBottom:4 }}>⭐ Ottima questa frase:</div>
                  <div style={{ fontSize:13, color:'var(--text)', fontStyle:'italic' }}>"{feedback.frase_ok}"</div>
                </div>
              )}

              {/* Correzioni */}
              {feedback.correzioni?.length > 0 && (
                <div style={{ background:'var(--card)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', marginBottom:6 }}>✏️ Da migliorare:</div>
                  {feedback.correzioni.map((c,i) => (
                    <div key={i} style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5, marginBottom:3 }}>→ {c}</div>
                  ))}
                </div>
              )}

              {/* Esempio */}
              <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', marginBottom:6 }}>📄 Esempio email modello:</div>
                <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7, whiteSpace:'pre-line', fontStyle:'italic' }}>{scenario.esempio}</div>
              </div>

              <div style={{ fontSize:20, fontWeight:900, color:'#E5B700', textAlign:'center' }}>+{feedback.xp} XP</div>
              <button onClick={onClose} style={btnBlue}>Torna alla home</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnBlue = { background:'#1CB0F6',color:'white',border:'none',borderRadius:'var(--r)',padding:'13px 0',width:'100%',fontSize:14,fontWeight:900,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 0 #0e7cb0',textTransform:'uppercase',letterSpacing:'0.6px' };
