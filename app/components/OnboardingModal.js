'use client';
import { useState } from 'react';
import { completaOnboarding } from './saveProgress';

// ─── Placement test — 5 domande A1→B2 ────────────────────────────────────────
const PLACEMENT_QUESTIONS = [
  {
    q: { it: 'Come si dice "hello" in italiano?', en: 'How do you say "hello" in Italian?' },
    options: ['Ciao', 'Grazie', 'Prego', 'Arrivederci'],
    correct: 0, level: 'A1',
  },
  {
    q: { it: 'Qual è la risposta giusta?', en: 'Which is the correct article?' },
    context: { it: '___ caffè è buono.', en: 'The coffee is good.' },
    options: ['Un', 'Una', 'Il', 'La'],
    correct: 0, level: 'A1+',
  },
  {
    q: { it: 'Qual è il passato di "mangio"?', en: 'What is the past tense of "I eat"?' },
    options: ['Ho mangiato', 'Mangiavo', 'Mangiai', 'Mangerò'],
    correct: 0, level: 'A2',
  },
  {
    q: { it: 'Quale frase usa il congiuntivo correttamente?', en: 'Which sentence uses the subjunctive correctly?' },
    options: [
      'Penso che venga domani',
      'Penso che viene domani',
      'Penso che è venuto domani',
      'Penso che veniva domani',
    ],
    correct: 0, level: 'B1',
  },
  {
    q: { it: 'Cosa significa "magari" in inglese?', en: 'What does "magari" mean in English?' },
    options: ['Maybe', 'I wish / If only', 'Perhaps', 'Actually'],
    correct: 1, level: 'B2',
  },
];

function getLevel(score) {
  if (score >= 5) return { id: 'appassionato', emoji: '❤️', label: 'Appassionato', sub: 'B2' };
  if (score >= 4) return { id: 'esploratore',  emoji: '🗺',  label: 'Esploratore',  sub: 'B1' };
  if (score >= 2) return { id: 'viaggiatore',  emoji: '🛵',  label: 'Viaggiatore',  sub: 'A2' };
  return              { id: 'turista',          emoji: '🧳',  label: 'Turista',      sub: 'A1' };
}

// ─── Onboarding screens ───────────────────────────────────────────────────────
const SCREENS = [
  {
    emoji: '🍽',
    title: { it: 'Il Menu del Giorno', en: 'The Daily Menu' },
    desc:  { it: 'Ogni giorno completa 4 lezioni + Sfida la Nonna per caricare l\'energia al massimo. Caffè → Cornetto → Aperitivo → Pizza → Gelato.',
              en: 'Every day complete 4 lessons + Challenge Nonna to fill your energy. Coffee → Croissant → Aperitif → Pizza → Gelato.' },
    color: '#FF9B42',
  },
  {
    emoji: '⚡',
    title: { it: 'L\'Energia', en: 'Energy' },
    desc:  { it: 'Parti dal 25% ogni mattina. Più studi, più ricarichi. Raggiungi il 100% e oltre con il gelato della Nonna! Il giorno senza studiare, l\'energia scende.',
              en: 'You start at 25% every morning. The more you study, the more you recharge. Reach 100%+ with Nonna\'s gelato! Skip a day and energy drops.' },
    color: '#58CC02',
  },
  {
    emoji: '🇮🇹',
    title: { it: 'I Viaggi', en: 'Travel' },
    desc:  { it: 'Accumula crediti rispondendo correttamente e compra biglietti per visitare l\'Italia. Borghi dal 25%, Province dal 60%, Capoluoghi dal 90%. Napoli è sempre aperta.',
              en: 'Earn credits by answering correctly and buy tickets to visit Italy. Villages from 25%, Provinces from 60%, Major cities from 90%. Naples is always open.' },
    color: '#1CB0F6',
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function OnboardingModal({ onComplete }) {
  const [phase,      setPhase]      = useState('start');      // 'start' | 'test' | 'screens' | 'result'
  const [testIdx,    setTestIdx]    = useState(0);
  const [testScore,  setTestScore]  = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [confirmed,  setConfirmed]  = useState(false);
  const [screenIdx,  setScreenIdx]  = useState(0);
  const [level,      setLevel]      = useState(null);

  function finishOnboarding(livello) {
    completaOnboarding(livello);
    onComplete(livello);
  }

  function handleStart(hasBasi) {
    if (hasBasi) setPhase('test');
    else         setPhase('screens');
  }

  function handleTestAnswer() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    const correct = selected === PLACEMENT_QUESTIONS[testIdx].correct;
    if (correct) setTestScore(s => s + 1);
  }

  function handleTestNext() {
    const next = testIdx + 1;
    if (next >= PLACEMENT_QUESTIONS.length) {
      const finalScore = testScore + (selected === PLACEMENT_QUESTIONS[testIdx].correct ? 1 : 0);
      setLevel(getLevel(finalScore));
      setPhase('screens');
    } else {
      setTestIdx(next);
      setSelected(null);
      setConfirmed(false);
    }
  }

  function handleScreenNext() {
    if (screenIdx + 1 < SCREENS.length) setScreenIdx(s => s + 1);
    else {
      const lv = level ?? { id: 'turista', emoji: '🧳', label: 'Turista', sub: 'A1' };
      setPhase('result');
    }
  }

  const q = PLACEMENT_QUESTIONS[testIdx];
  const isCorrect = selected !== null && selected === q?.correct;
  const sc = SCREENS[screenIdx];

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.85)',
      backdropFilter:'blur(6px)', zIndex:2000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div style={{
        background:'var(--card)', borderRadius:24,
        maxWidth:380, width:'100%',
        boxShadow:'0 32px 80px rgba(0,0,0,0.7)',
        overflow:'hidden', animation:'modalIn 0.3s ease',
      }}>

        {/* ── START ── */}
        {phase === 'start' && (
          <div style={{ padding:'32px 24px', textAlign:'center' }}>
            <div style={{ fontSize:64, marginBottom:12 }}>☕</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#FF9B42', marginBottom:8 }}>
              Benvenuto al Bar di Mario!
            </div>
            <div style={{ fontSize:16, color:'var(--text2)', lineHeight:1.6, marginBottom:24 }}>
              Finally, someone explains why.
            </div>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>
              ☕ Sei già stato in Italia? / Have you studied Italian before?
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button onClick={() => handleStart(false)} style={{
                background:'var(--primary)', color:'#fff', border:'none',
                borderRadius:'var(--r)', padding:'14px',
                fontSize:17, fontWeight:900, cursor:'pointer', fontFamily:'inherit',
                boxShadow:'0 4px 0 var(--primary-d)',
              }}>
                🧳 Parto da zero / I'm a beginner
              </button>
              <button onClick={() => handleStart(true)} style={{
                background:'var(--card)', color:'var(--text)',
                border:'2px solid var(--border)',
                borderRadius:'var(--r)', padding:'14px',
                fontSize:17, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
              }}>
                🛵 Ho già qualche base / I have some Italian
              </button>
            </div>
          </div>
        )}

        {/* ── PLACEMENT TEST ── */}
        {phase === 'test' && (
          <div style={{ padding:'24px' }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:14, fontWeight:900, color:'var(--primary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>
                Placement test — {testIdx + 1}/{PLACEMENT_QUESTIONS.length}
              </div>
              <div style={{ height:6, background:'var(--bg)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${((testIdx + 1) / PLACEMENT_QUESTIONS.length) * 100}%`,
                  background:'var(--primary)', borderRadius:99, transition:'width 0.4s' }} />
              </div>
            </div>

            {q.context && (
              <div style={{ background:'var(--bg)', borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:18, fontWeight:800, color:'var(--text)', textAlign:'center' }}>
                {q.context.it}
              </div>
            )}

            <div style={{ fontSize:17, fontWeight:800, color:'var(--text)', marginBottom:4 }}>{q.q.it}</div>
            <div style={{ fontSize:15, color:'var(--text3)', fontStyle:'italic', marginBottom:16 }}>{q.q.en}</div>

            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {q.options.map((opt, i) => {
                let bg = 'var(--opt-bg)', border = 'var(--opt-border)', color = 'var(--opt-text)';
                if (confirmed) {
                  if (i === q.correct) { bg = 'var(--ok-bar)'; border = 'var(--ok-text)'; color = 'var(--ok-text)'; }
                  else if (i === selected) { bg = 'var(--err-bar)'; border = 'var(--err-text)'; color = 'var(--err-text)'; }
                } else if (selected === i) { bg = 'var(--opt-sel-bg)'; border = 'var(--opt-sel-b)'; color = 'var(--opt-sel-text)'; }
                return (
                  <button key={i} onClick={() => !confirmed && setSelected(i)} style={{
                    background:bg, border:`2px solid ${border}`, color,
                    borderRadius:'var(--r)', padding:'12px 14px',
                    textAlign:'left', fontSize:17, fontWeight:700,
                    cursor: confirmed ? 'default' : 'pointer', fontFamily:'inherit',
                    transition:'background 0.15s, border 0.15s',
                  }}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {!confirmed ? (
              <button onClick={handleTestAnswer} disabled={selected === null} style={{
                width:'100%', padding:'14px', borderRadius:'var(--r)',
                background: selected === null ? 'var(--dis-bg)' : 'var(--primary)',
                color: selected === null ? 'var(--dis-text)' : '#fff',
                border:'none', fontSize:17, fontWeight:900, cursor: selected === null ? 'not-allowed' : 'pointer',
                fontFamily:'inherit', boxShadow: selected !== null ? '0 4px 0 var(--primary-d)' : 'none',
              }}>
                Controlla / Check
              </button>
            ) : (
              <button onClick={handleTestNext} style={{
                width:'100%', padding:'14px', borderRadius:'var(--r)',
                background: isCorrect ? 'var(--primary)' : 'var(--err-btn, #CC0000)',
                color:'#fff', border:'none', fontSize:17, fontWeight:900, cursor:'pointer',
                fontFamily:'inherit',
              }}>
                {testIdx + 1 < PLACEMENT_QUESTIONS.length ? 'Avanti →' : 'Vediamo il risultato →'}
              </button>
            )}
          </div>
        )}

        {/* ── SCREENS ── */}
        {phase === 'screens' && (
          <div style={{ padding:'32px 24px', textAlign:'center' }}>
            <div style={{ fontSize:72, marginBottom:16 }}>{sc.emoji}</div>
            <div style={{ fontSize:21, fontWeight:900, color:sc.color, marginBottom:12 }}>
              {sc.title.it} / {sc.title.en}
            </div>
            <div style={{ fontSize:16, color:'var(--text2)', lineHeight:1.7, marginBottom:28 }}>
              {sc.desc.it}
              <br/><span style={{ color:'var(--text3)', fontStyle:'italic' }}>{sc.desc.en}</span>
            </div>
            {/* Dots */}
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:24 }}>
              {SCREENS.map((_, i) => (
                <div key={i} style={{
                  width: i === screenIdx ? 24 : 8, height:8, borderRadius:99,
                  background: i === screenIdx ? sc.color : 'var(--border)',
                  transition:'all 0.3s',
                }} />
              ))}
            </div>
            <button onClick={handleScreenNext} style={{
              width:'100%', background:sc.color, color:'#fff', border:'none',
              borderRadius:'var(--r)', padding:'14px',
              fontSize:17, fontWeight:900, cursor:'pointer', fontFamily:'inherit',
            }}>
              {screenIdx + 1 < SCREENS.length ? 'Avanti →' : 'Iniziamo! / Let\'s go!'}
            </button>
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === 'result' && (
          <div style={{ padding:'32px 24px', textAlign:'center' }}>
            {(() => {
              const lv = level ?? { id:'turista', emoji:'🧳', label:'Turista', sub:'A1' };
              return (
                <>
                  <div style={{ fontSize:72, marginBottom:12 }}>{lv.emoji}</div>
                  <div style={{ fontSize:16, color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'1px' }}>
                    Il tuo livello / Your level
                  </div>
                  <div style={{ fontSize:22, fontWeight:900, color:'var(--primary)', marginBottom:4 }}>
                    {lv.label}
                  </div>
                  <div style={{ fontSize:16, color:'var(--text2)', marginBottom:24 }}>
                    {lv.sub} — Mario ti aspetta al bar!
                  </div>
                  <button onClick={() => finishOnboarding(lv.id)} style={{
                    width:'100%', background:'var(--primary)', color:'#fff', border:'none',
                    borderRadius:'var(--r)', padding:'14px',
                    fontSize:18, fontWeight:900, cursor:'pointer', fontFamily:'inherit',
                    boxShadow:'0 4px 0 var(--primary-d)',
                    textTransform:'uppercase', letterSpacing:'0.6px',
                  }}>
                    ☕ Andiamo! / Let's go!
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:scale(0.95); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  );
}
