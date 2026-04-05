'use client';
// app/components/games/GinoStoria.js
import { useState } from 'react';
import { overlay, modal } from './MarioDialog';

const STORIE = [
  {
    gesto: '🤌', nome:'Ma che vuoi?',
    storia:`Era una mattina fresca a Roma. Marco, un turista americano, cercava il Colosseo 
con una mappa enorme. Si avvicinò a un signore anziano: "Scusi, dove si trova il Colosseo?"

Il signore alzò lo sguardo, vide la mappa, poi guardò Marco dritto negli occhi. 
Con un sorriso paziente, fece il gesto classico — dita unite che si aprono verso l'alto — 
e disse: "Ma dai! È proprio là davanti a lei! Non lo vede?"

Marco si girò. Il Colosseo era a duecento metri. Rise da solo per dieci minuti.`,
    domandaIT: 'Dove si trova il Colosseo in questa storia?',
    rispostaEN: 'The Colosseum was right in front of Marco — 200 metres away.',
    xp: 20,
  },
  {
    gesto: '✋', nome:'Basta!',
    storia:`La nonna Carmela aveva cucinato per tre ore. Sul tavolo c'erano: pasta al forno, 
polpette, insalata caprese, pane fatto in casa, e due torte.

Il nipote Luca, al secondo piatto, alzò la mano: "Nonna, basta, non ce la faccio più!"

La nonna lo guardò con gli occhi spalancati. Poi alzò la sua mano — palmo aperto, 
decisa — e disse: "BASTA?! Tu non sai nemmeno cosa significa basta! Siediti. 
C'è ancora il dolce, il caffè, e i biscotti. Basta lo dico io."

Luca non protestò più.`,
    domandaIT: 'Perché Luca dice "basta"? Come risponde la nonna?',
    rispostaEN: 'Luca is full and wants to stop eating. The nonna refuses — she decides when "enough" is enough!',
    xp: 20,
  },
  {
    gesto: '👌', nome:'Perfetto! / Buonissimo!',
    storia:`Diego, un giovane chef milanese, presentò il suo nuovo piatto al ristorante: 
risotto al tartufo con fonduta di Parmigiano.

Il critico gastronomico — uomo serio, mai contento — assaggiò. Silenzio. 
Poi, lentamente, portò le dita al mento, le aprì verso l'esterno, e disse: "Perfetto."

Un solo gesto. Tre sillabe. Tutto il ristorante capì. Diego abbracciò il sous-chef.
In Italia, le parole a volte sono troppo poche per una cosa così grande.`,
    domandaIT: 'Come reagisce il critico gastronomico? Cosa significa il suo gesto?',
    rispostaEN: "The critic uses the 'perfetto' gesture to express that the dish is flawless — a huge compliment from a notoriously hard-to-please man.",
    xp: 20,
  },
];

function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }

export default function GinoStoria({ onClose, onXP }) {
  const [storia]    = useState(() => shuffle(STORIE)[0]);
  const [fase,      setFase]     = useState('gesto');   // gesto → storia → domanda → fine
  const [risposta,  setRisposta] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function complete() { setFase('fine'); onXP?.(storia.xp); }

  return (
    <div style={overlay}>
      <div style={{ ...modal, border:'2px solid #E5B70044', borderBottom:'none' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 14px 12px', borderBottom:'1px solid var(--border)' }}>
          <img src="/images/gino.png" alt="Gino" style={{ width:42,height:42,borderRadius:'50%',border:'2.5px solid #E5B700',objectFit:'cover' }} />
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:'#E5B700' }}>Gesto & Storia con Gino</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>
              {fase==='gesto' ? 'Fase 1 — Impara il gesto' : fase==='storia' ? 'Fase 2 — Leggi la storia' : fase==='domanda' ? 'Fase 3 — Rispondi' : 'Completato!'}
            </div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto',background:'none',border:'none',color:'var(--text3)',fontSize:20,cursor:'pointer',padding:4 }}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:6, padding:'8px 14px 4px', justifyContent:'center' }}>
          {['gesto','storia','domanda','fine'].map((s,i) => (
            <div key={s} style={{ width:32, height:4, borderRadius:99,
              background: ['gesto','storia','domanda','fine'].indexOf(fase) >= i ? '#E5B700' : 'var(--border)',
              transition:'background 0.3s' }} />
          ))}
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'18px 16px 6px' }}>

          {fase === 'gesto' && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <div style={{ fontSize:96, lineHeight:1 }}>{storia.gesto}</div>
              <div style={{ fontSize:22, fontWeight:900, color:'var(--text)', textAlign:'center' }}>{storia.nome}</div>
              <div style={{ background:'var(--card)', border:'2px solid #E5B70044', borderRadius:12, padding:'14px 16px', width:'100%', fontSize:13, color:'var(--text2)', lineHeight:1.6, textAlign:'center' }}>
                Ricorda questo gesto — lo troverai nella storia che stai per leggere. 
                Osserva il movimento, non solo l'emoji!
              </div>
              <button onClick={() => setFase('storia')} style={btnGold}>Leggi la storia →</button>
            </div>
          )}

          {fase === 'storia' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ background:'var(--card)', border:'2px solid #E5B70044', borderRadius:12, padding:'16px', fontSize:13.5, color:'var(--text)', lineHeight:1.75, whiteSpace:'pre-line' }}>
                {storia.storia}
              </div>
              <button onClick={() => setFase('domanda')} style={btnGold}>Rispondi alla domanda →</button>
            </div>
          )}

          {fase === 'domanda' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:15, fontWeight:900, color:'var(--text)', lineHeight:1.5 }}>
                {storia.domandaIT}
              </div>
              <textarea
                value={risposta}
                onChange={e => setRisposta(e.target.value)}
                placeholder="Scrivi la tua risposta in italiano o inglese..."
                rows={4}
                style={{ background:'var(--card)', border:'2px solid var(--border)', borderRadius:12, padding:'12px', fontSize:13, color:'var(--text)', fontFamily:'inherit', outline:'none', resize:'vertical' }}
              />
              {!submitted ? (
                <button onClick={() => risposta.trim() && setSubmitted(true)} style={{ ...btnGold, opacity: risposta.trim() ? 1 : 0.4 }}>
                  Controlla / Check
                </button>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ background:'var(--ok-bar)', border:'2px solid var(--ok-text)', borderRadius:12, padding:'12px 14px' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--ok-text)', marginBottom:4 }}>💡 Risposta di esempio / Sample answer:</div>
                    <div style={{ fontSize:13, color:'var(--ok-text)', lineHeight:1.5 }}>{storia.rispostaEN}</div>
                  </div>
                  <button onClick={complete} style={btnGold}>Ottimo! Fine →</button>
                </div>
              )}
            </div>
          )}

          {fase === 'fine' && (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🎓</div>
              <div style={{ fontWeight:900, fontSize:15, color:'var(--text)', marginBottom:4 }}>Gino è soddisfatto!</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16 }}>Hai imparato un gesto e la sua storia.</div>
              <div style={{ fontSize:22, fontWeight:900, color:'#E5B700', marginBottom:18 }}>+{storia.xp} XP</div>
              <button onClick={onClose} style={btnGold}>Torna alla home</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnGold = { background:'#E5B700',color:'white',border:'none',borderRadius:'var(--r)',padding:'13px 0',width:'100%',fontSize:14,fontWeight:900,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 0 #b8920b',textTransform:'uppercase',letterSpacing:'0.6px' };
