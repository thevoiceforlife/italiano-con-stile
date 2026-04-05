'use client';
// app/components/games/DiegoGesti.js
import { useState, useEffect, useRef } from 'react';
import { overlay, modal } from './MarioDialog';

const GESTI = [
  { emoji:'🤌', nome:'Ma che vuoi?',     en:"What do you want? / So what?",    tip:"Dita unite che si aprono verso l'alto" },
  { emoji:'✋',  nome:'Basta!',           en:"Enough! / Stop it!",              tip:"Palmo aperto verso l'interlocutore" },
  { emoji:'👌',  nome:'Perfetto!',        en:"Perfect! / Delicious!",           tip:"Dita al mento, poi via — usato anche per il cibo" },
  { emoji:'🤏',  nome:'Un momento',      en:"Just a moment / Wait",            tip:"Pollice e indice vicini, mano alzata" },
  { emoji:'🖐️', nome:'Aspetta!',         en:"Wait! / Hold on!",               tip:"Mano aperta alzata, dita verso l'alto" },
  { emoji:'🤷',  nome:'Non lo so',       en:"I don't know / Who knows",        tip:"Spalle alzate, palmi verso l'alto" },
  { emoji:'👆',  nome:'Attenzione!',     en:"Pay attention! / Listen up!",     tip:"Indice alzato verso il soffitto" },
  { emoji:'🫰',  nome:'Buonissimo!',     en:"Delicious! (food)",               tip:"Tutte le dita unite, poi si aprono — solo per il cibo" },
  { emoji:'🫳',  nome:'Non me ne frega', en:"I don't care at all",             tip:"Dorso della mano sfiorato dall'altra mano" },
  { emoji:'👋',  nome:'Vattene!',        en:"Go away! (informal)",             tip:"Mano agitata — diverso dal saluto amichevole" },
];

const TIME_LIMIT = 60;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

export default function DiegoGesti({ onClose, onXP }) {
  const [queue]      = useState(() => shuffle(GESTI));
  const [idx,        setIdx]        = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score,      setScore]      = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(TIME_LIMIT);
  const [done,       setDone]       = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (done) onXP?.(Math.min(score * 5, 30));
  }, [done]);

  function next(knew) {
    if (knew) setScore(s => s+1);
    const n = idx + 1;
    if (n >= queue.length) { clearInterval(timerRef.current); setDone(true); }
    else { setIdx(n); setShowAnswer(false); }
  }

  const g    = queue[idx];
  const pct  = (timeLeft / TIME_LIMIT) * 100;
  const xpEarned = Math.min(score * 5, 30);

  return (
    <div style={overlay}>
      <div style={{ ...modal, border:'2px solid #22C55E44', borderBottom:'none' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 14px 12px', borderBottom:'1px solid var(--border)' }}>
          <img src="/images/diego.png" alt="Diego" style={{ width:42,height:42,borderRadius:'50%',border:'2.5px solid #22C55E',objectFit:'cover' }} />
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:'#22C55E' }}>Flash Gesti con Diego</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Conosci i gesti italiani? · {idx+1}/{queue.length}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto',background:'none',border:'none',color:'var(--text3)',fontSize:20,cursor:'pointer',padding:4 }}>✕</button>
        </div>

        {/* Timer */}
        <div style={{ padding:'8px 14px 4px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:8, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, width:`${pct}%`,
              background: timeLeft < 10 ? '#ef4444' : '#22C55E',
              transition:'width 1s linear, background-color 0.3s' }} />
          </div>
          <span style={{ fontSize:13, fontWeight:900, color: timeLeft < 10 ? '#ef4444' : '#22C55E', minWidth:28 }}>
            {timeLeft}s
          </span>
        </div>

        {done ? (
          <div style={{ padding:'28px 20px', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:6 }}>⏱️</div>
            <div style={{ fontWeight:900, fontSize:15, color:'var(--text)', marginBottom:4 }}>
              {timeLeft === 0 ? 'Tempo scaduto!' : 'Tutti i gesti!'}
            </div>
            <div style={{ fontSize:13, color:'var(--text3)', marginBottom:4 }}>
              Gesti indovinati: <strong style={{ color:'#22C55E' }}>{score}/{queue.length}</strong>
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:'#E5B700', marginBottom:18 }}>+{xpEarned} XP</div>
            <button onClick={onClose} style={btnGreen}>Torna alla home</button>
          </div>
        ) : (
          <div style={{ flex:1, padding:'20px 20px 12px', display:'flex', flexDirection:'column', gap:14, alignItems:'center' }}>
            {/* Gesto */}
            <div style={{ fontSize:88, lineHeight:1, textAlign:'center' }}>{g.emoji}</div>
            <div style={{ fontSize:22, fontWeight:900, color:'var(--text)', textAlign:'center' }}>{g.nome}</div>

            {!showAnswer ? (
              <button onClick={() => setShowAnswer(true)} style={btnGreenOutline}>
                Mostra significato / Show meaning
              </button>
            ) : (
              <>
                <div style={{ background:'var(--card)', border:'2px solid #22C55E44', borderRadius:12, padding:'12px 16px', width:'100%', textAlign:'center' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{g.en}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', fontStyle:'italic' }}>💡 {g.tip}</div>
                </div>
                <div style={{ display:'flex', gap:10, width:'100%' }}>
                  <button onClick={() => next(false)} style={btnRed}>✕ Non lo sapevo</button>
                  <button onClick={() => next(true)}  style={btnGreen}>✓ Lo sapevo!</button>
                </div>
              </>
            )}

            <div style={{ fontSize:11, color:'var(--text3)' }}>
              Punteggio: <strong style={{ color:'#22C55E' }}>{score}</strong> · +{xpEarned} XP finora
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnGreen       = { background:'#22C55E',color:'white',border:'none',borderRadius:'var(--r)',padding:'13px 0',width:'100%',fontSize:14,fontWeight:900,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 0 #16a34a' };
const btnGreenOutline= { background:'none',color:'#22C55E',border:'2px solid #22C55E',borderRadius:'var(--r)',padding:'12px 32px',fontSize:14,fontWeight:900,cursor:'pointer',fontFamily:'inherit' };
const btnRed         = { flex:1,background:'#ef444422',color:'#ef4444',border:'2px solid #ef444466',borderRadius:'var(--r)',padding:'12px 0',fontSize:13,fontWeight:900,cursor:'pointer',fontFamily:'inherit' };
