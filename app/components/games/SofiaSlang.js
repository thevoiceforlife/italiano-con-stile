'use client';
// app/components/games/SofiaSlang.js
import { useState, useEffect, useRef } from 'react';
import { overlay, modal } from './MarioDialog';

const SLANG = [
  { parola:'Figurati!',        corretta:"Don't mention it! / No worries!", sbagliate:["Figure it out!","Watch out!","Hurry up!"] },
  { parola:'In gamba',         corretta:'Clever / Capable',                sbagliate:['On the leg','Tired','Lucky'] },
  { parola:'Dai!',             corretta:'Come on! / No way!',              sbagliate:['Goodbye','Give me','Thank you'] },
  { parola:'Mamma mia!',       corretta:'Oh my goodness!',                 sbagliate:['My mother!','Good food','Call mom'] },
  { parola:'Ci mancherebbe',   corretta:'Of course / By all means',        sbagliate:['It was missing','I miss you','Something is wrong'] },
  { parola:'Boh',              corretta:"I have no idea / Whatever",       sbagliate:['Yes indeed','Goodbye','Beautiful'] },
  { parola:'Roba da matti',    corretta:'Incredible / Unbelievable',       sbagliate:['Stuff for crazy people','Expensive things','Foreign goods'] },
  { parola:'Cavolo!',          corretta:'Darn! / Shoot!',                  sbagliate:['Cabbage!','Excellent!','Horse!'] },
  { parola:'Mannaggia',        corretta:'Darn it! / Damn!',                sbagliate:['A lot','Slowly','Tomorrow'] },
  { parola:'Andiamo!',         corretta:"Come on! / Let's go!",            sbagliate:["We're going nowhere","Goodbye","Stop it!"] },
  { parola:'Mica male',        corretta:'Not bad at all / Pretty good',    sbagliate:['Not at all good','Very bad','Kind of strange'] },
  { parola:'Che schifo!',      corretta:'How disgusting! / Yuck!',         sbagliate:["What a shame!","How funny!","How cool!"] },
];

const TIME_LIMIT = 30;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function buildOptions(item) {
  return shuffle([item.corretta, ...item.sbagliate.slice(0,3)]);
}

export default function SofiaSlang({ onClose, onXP }) {
  const [questions] = useState(() => shuffle(SLANG).slice(0, 8).map(q => ({ ...q, options: buildOptions(q) })));
  const [idx,      setIdx]      = useState(0);
  const [score,    setScore]    = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done,     setDone]     = useState(false);
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
    if (done) onXP?.(score * 5);
  }, [done]);

  function pick(opt) {
    if (selected !== null || done) return;
    setSelected(opt);
    const isRight = opt === questions[idx].corretta;
    if (isRight) setScore(s => s+1);
    setTimeout(() => {
      const next = idx + 1;
      if (next >= questions.length) { clearInterval(timerRef.current); setDone(true); }
      else { setIdx(next); setSelected(null); }
    }, 800);
  }

  const q    = questions[idx];
  const xpEarned = score * 5;

  return (
    <div style={overlay}>
      <div style={{ ...modal, border:'2px solid #C8A0E844', borderBottom:'none' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 14px 10px', borderBottom:'1px solid var(--border)' }}>
          <img src="/images/sofia.png" alt="Sofia" style={{ width:42,height:42,borderRadius:'50%',border:'2.5px solid #C8A0E8',objectFit:'cover' }} />
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:'#C8A0E8' }}>Speed Round con Sofia</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Slang italiano — fai presto!</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto',background:'none',border:'none',color:'var(--text3)',fontSize:20,cursor:'pointer',padding:4 }}>✕</button>
        </div>

        {/* Timer */}
        <div style={{ padding:'8px 14px 4px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:8, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, width:`${(timeLeft/TIME_LIMIT)*100}%`,
              background: timeLeft < 10 ? '#ef4444' : '#C8A0E8',
              transition:'width 1s linear, background-color 0.3s' }} />
          </div>
          <span style={{ fontSize:13, fontWeight:900, color: timeLeft<10 ? '#ef4444' : '#C8A0E8', minWidth:28 }}>
            {timeLeft}s
          </span>
        </div>

        {done ? (
          <div style={{ padding:'28px 20px', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:6 }}>🎤</div>
            <div style={{ fontWeight:900, fontSize:15, color:'var(--text)', marginBottom:4 }}>Speed Round finito!</div>
            <div style={{ fontSize:13, color:'var(--text3)', marginBottom:4 }}>
              Corretti: <strong style={{ color:'#C8A0E8' }}>{score}/{questions.length}</strong>
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:'#E5B700', marginBottom:18 }}>+{xpEarned} XP</div>
            <button onClick={onClose} style={btnPurple}>Torna alla home</button>
          </div>
        ) : (
          <div style={{ flex:1, padding:'18px 16px 14px', display:'flex', flexDirection:'column', gap:12 }}>
            {/* Progress pallini */}
            <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
              {questions.map((_, i) => (
                <div key={i} style={{ width:8, height:8, borderRadius:'50%',
                  background: i < idx ? '#C8A0E8' : i===idx ? '#E5B700' : 'var(--border)',
                  transition:'background 0.3s' }} />
              ))}
            </div>

            {/* Domanda */}
            <div style={{ background:'var(--card)', border:'2px solid #C8A0E844', borderRadius:14, padding:'20px 16px', textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#C8A0E8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>
                Cosa significa? / What does it mean?
              </div>
              <div style={{ fontSize:28, fontWeight:900, color:'var(--text)' }}>"{q.parola}"</div>
            </div>

            {/* Opzioni */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {q.options.map((opt, i) => {
                const isCorrect = opt === q.corretta;
                const isSelected = selected === opt;
                let bg = 'var(--card)', border = 'var(--border)', color = 'var(--text)';
                if (selected !== null) {
                  if (isCorrect)       { bg='#22c55e22'; border='#22c55e'; color='#22c55e'; }
                  else if (isSelected) { bg='#ef444422'; border='#ef4444'; color='#ef4444'; }
                }
                return (
                  <button key={i} onClick={() => pick(opt)} style={{
                    background:bg, border:`2px solid ${border}`, color,
                    borderRadius:'var(--r)', padding:'12px 14px', textAlign:'left',
                    fontSize:13, fontWeight:800, cursor: selected!==null ? 'default' : 'pointer',
                    fontFamily:'inherit', transition:'all 0.2s',
                  }}>{opt}</button>
                );
              })}
            </div>

            <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>
              Punteggio: <strong style={{ color:'#C8A0E8' }}>{score}</strong> · +{xpEarned} XP finora
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnPurple = { background:'#C8A0E8',color:'white',border:'none',borderRadius:'var(--r)',padding:'13px 0',width:'100%',fontSize:14,fontWeight:900,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 0 #9b6cd0' };
