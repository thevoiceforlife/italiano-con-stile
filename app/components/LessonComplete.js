'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── Coriandoli CSS ───────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left:  `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    dur:   `${1.8 + Math.random() * 1.2}s`,
    color: ['#58CC02','#E5B700','#FF9600','#1CB0F6','#C8A0E8','#FF4B4B'][i % 6],
    size:  `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
  }));

  return (
    <>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:2000, overflow:'hidden' }}>
        {pieces.map(p => (
          <div key={p.id} style={{
            position:'absolute', left:p.left, top:'-10px',
            width:p.size, height:p.size,
            background:p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform:`rotate(${p.rotate})`,
            animation:`confettiFall ${p.dur} ${p.delay} ease-in forwards`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity:1; }
          80%  { opacity:1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity:0; }
        }
      `}</style>
    </>
  );
}

// ─── Barra energia animata ────────────────────────────────────────────────────
function EnergyBar({ prima, dopo }) {
  const [animPct, setAnimPct] = useState(Math.min(prima, 100));
  const color = dopo > 100 ? '#E5B700' : dopo >= 90 ? '#46A302' : dopo >= 61 ? '#58CC02' : dopo >= 36 ? '#1CB0F6' : dopo >= 26 ? '#FF9600' : '#CC0000';

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(Math.min(dopo, 100)), 300);
    return () => clearTimeout(t);
  }, [dopo]);

  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--text2)', marginBottom:4 }}>
        <span>⚡ {Math.round(prima)}%</span>
        <span style={{ color, fontWeight:800 }}>→ {Math.round(dopo)}%{dopo > 100 ? ' 🚀' : ''}</span>
      </div>
      <div style={{ position:'relative', height:12, background:'var(--bg)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${Math.min(prima,100)}%`, background:'var(--border)', borderRadius:99 }} />
        <div style={{
          position:'absolute', left:0, top:0, bottom:0,
          width:`${animPct}%`, background:color, borderRadius:99,
          transition:'width 1.5s cubic-bezier(.4,0,.2,1)',
          boxShadow:`0 0 8px ${color}88`,
        }} />
      </div>
    </div>
  );
}

// ─── Popup SAD ────────────────────────────────────────────────────────────────
function PopupSad({ reward, onRetry, onHome }) {
  return (
    <div style={{ textAlign:'center', padding:'32px 24px' }}>
      <div style={{ fontSize:72, marginBottom:16 }}>😔</div>
      <div style={{ fontSize:20, fontWeight:900, color:'var(--text)', marginBottom:8 }}>
        Nessun punto oggi / No points today
      </div>
      <div style={{ fontSize:16, color:'var(--text2)', lineHeight:1.6, marginBottom:24 }}>
        Riprova per guadagnare energia e crediti viaggio! /
        Try again to earn energy and travel credits!
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <button onClick={onRetry} style={{
          background:'var(--primary)', color:'#fff', border:'none',
          borderRadius:'var(--r)', padding:'14px', fontSize:18, fontWeight:900,
          cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 0 var(--primary-d)',
          textTransform:'uppercase', letterSpacing:'0.6px',
        }}>
          🔁 Riprova / Try again
        </button>
        <button onClick={onHome} style={{background:'none',border:'none',color:'#58cc02',fontSize:16,fontWeight:900,cursor:'pointer',fontFamily:'inherit'}}>🏠 Home</button>
      </div>
    </div>
  );
}

// ─── Popup MENU COMPLETO ──────────────────────────────────────────────────────
function PopupMenuCompleto({ reward, onBoss }) {
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => { setTimeout(() => setShowConfetti(false), 4000); }, []);

  return (
    <>
      {showConfetti && <Confetti />}
      <div style={{ textAlign:'center', padding:'24px' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🎊</div>
        <div style={{ fontSize:21, fontWeight:900, color:'#E5B700', marginBottom:4 }}>
          GIORNATA NAPOLETANA COMPLETA!
        </div>
        <div style={{ fontSize:16, color:'var(--text2)', marginBottom:20 }}>
          Complete Neapolitan Day! Hai conquistato tutto! 🇮🇹
        </div>

        <EnergyBar prima={reward.energiaPrima} dopo={reward.energiaDopo} />

        <div style={{ fontSize:16, color:'var(--text2)', marginBottom:20, marginTop:16, lineHeight:1.5 }}>
          Pronto per la Sfida della Nonna? /
          Ready for Grandma's Challenge?
        </div>

        <button onClick={onBoss} style={{
          background:'linear-gradient(135deg, #1a1a2e, #2a1500)',
          color:'#E5B700', border:'2px solid #E5B700',
          borderRadius:'var(--r)', padding:'14px',
          fontSize:18, fontWeight:900, cursor:'pointer', fontFamily:'inherit',
          boxShadow:'0 0 20px #E5B70044', width:'100%',
          textTransform:'uppercase', letterSpacing:'0.6px',
        }}>
          🍦 Sfida la Nonna!
        </button>
      </div>
    </>
  );
}

// ─── Popup BOSS REWARD (gelato dinamico) ─────────────────────────────────────
function PopupBossReward({ reward, onHome }) {
  const crediti = reward.crediti ?? 0;
  const gusti = crediti <= 10 ? 1 : crediti <= 20 ? 2 : 3;
  const gelatoIcon = gusti === 1 ? "🍦" : gusti === 2 ? "🍨" : "🍧";
  const gelatoLabel = gusti === 1 ? "1 gusto" : gusti === 2 ? "2 gusti" : "3 gusti con panna";
  const gelatoLabelEn = gusti === 1 ? "1 flavour" : gusti === 2 ? "2 flavours" : "3 flavours with cream";
  const isPerfect = gusti === 3;

  const nonnaIT = gusti === 1
    ? "Brava! Un gelato lo meriti. La prossima volta di più!"
    : gusti === 2
      ? "Molto bene! Due gusti per te — sei sulla strada giusta!"
      : "Perfetto! Sei pronto per Napoli. La Nonna è orgogliosa di te!";
  const nonnaEN = gusti === 1
    ? "Well done! You deserve a gelato. More next time!"
    : gusti === 2
      ? "Very good! Two flavours — you're on the right track!"
      : "Perfect! You're ready for Naples. Nonna is so proud of you!";

  const sparkles = [
    { emoji: "✨", top: 0, left: 5, delay: "0s" },
    { emoji: "⭐", top: -4, right: 2, delay: "0.5s" },
    { emoji: "✨", bottom: 0, left: 15, delay: "1s" },
    { emoji: "⭐", bottom: -4, right: 10, delay: "1.5s" },
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

      {/* Nonna con sparkle */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', border: '3px solid #ffd700',
          overflow: 'hidden', background: '#2c3e4a', animation: 'float 2s ease-in-out infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/images/vittoria.png" alt="Nonna" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML += '<span style="font-size:36px">👵</span>'; }} />
        </div>
        {sparkles.map((s, i) => (
          <span key={i} style={{ position: 'absolute', fontSize: 14, pointerEvents: 'none', top: s.top, left: s.left, right: s.right, bottom: s.bottom, animation: `sparkle 1.6s ${s.delay} ease-in-out infinite` }}>{s.emoji}</span>
        ))}
      </div>

      {/* Perfect badge */}
      {isPerfect && (
        <div style={{ background: '#ffd700', color: '#1a1a1a', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
          ★ Punteggio perfetto · Perfect score ★
        </div>
      )}

      {/* Gelato */}
      <div style={{ fontSize: 72, lineHeight: 1, animation: 'gelato 0.8s ease-out forwards' }}>
        {gelatoIcon}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#ffd700' }}>{gelatoLabel}</div>
        <div style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{gelatoLabelEn}</div>
      </div>

      {/* Frase nonna */}
      <div style={{ textAlign: 'center', lineHeight: 1.5 }}>
        <div style={{ fontSize: 15, color: '#E5B700', fontStyle: 'italic' }}>"{nonnaIT}"</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginTop: 4 }}>"{nonnaEN}"</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        {[
          { icon: '✅', val: `${reward.corrette}/${reward.totDomande}`, label: 'risposte' },
          { icon: '🎫', val: `+${crediti}`, label: 'crediti' },
          { icon: gelatoIcon, val: `${gusti}`, label: 'gusti' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: 'var(--bg)', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Energia */}
      <div style={{ width: '100%' }}>
        <EnergyBar prima={reward.energiaPrima} dopo={reward.energiaDopo} />
      </div>

      {/* Unlock */}
      <div style={{ background: 'rgba(28,176,246,0.08)', border: '1px solid rgba(28,176,246,0.3)', borderRadius: 12, padding: '10px 14px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1CB0F6' }}>🔓 Unità 2 sbloccata!</div>
        <div style={{ fontSize: 12, fontStyle: 'italic', color: 'rgba(28,176,246,0.5)', marginTop: 2 }}>Unit 2 unlocked!</div>
      </div>

      {/* Pulsante */}
      <button onClick={onHome} style={{
        width: '100%', height: 56, border: 'none', borderRadius: 'var(--r)',
        borderBottom: isPerfect ? '4px solid #b8920b' : '4px solid var(--primary-d)',
        background: isPerfect ? '#ffd700' : 'var(--primary)',
        color: isPerfect ? '#1a1a1a' : '#fff',
        fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
        <span>🗺️ Vai all'Unità 2!</span>
        <span style={{ fontSize: 11, fontStyle: 'italic', opacity: 0.7 }}>Go to Unit 2!</span>
      </button>
    </div>
  );
}

// ─── Popup REWARD (post-lezione / post-boss) ──────────────────────────────────
function PopupReward({ reward, onContinua, onHome, nextUrl }) {
  const isBoss  = reward.tipo === 'boss';
  const [bouncing, setBouncing] = useState(true);
  useEffect(() => { setTimeout(() => setBouncing(false), 1200); }, []);

  return (
    <div style={{ padding:'24px' }}>

      {/* Cibo guadagnato — grande con bounce */}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{
          fontSize:72, lineHeight:1,
          animation: bouncing ? 'foodBounce 0.6s ease-out 2' : 'none',
        }}>
          {reward.ciboEmoji}
        </div>
        <div style={{ fontSize:20, fontWeight:900, color:'var(--text)', marginTop:10 }}>
          {reward.ciboNome}!
        </div>
        {reward.ciboNomeEN && reward.ciboNomeEN !== reward.ciboNome && (
          <div style={{ fontSize:15, color:'var(--text3)', fontStyle:'italic', marginTop:2 }}>
            {reward.ciboNomeEN}
          </div>
        )}
        {isBoss && reward.nonna && (
          <div style={{ fontSize:16, color:'#E5B700', fontStyle:'italic', marginTop:8, lineHeight:1.5 }}>
            "{reward.nonna.msg}" / "{reward.nonna.msgEN}"
          </div>
        )}
        <div style={{ fontSize:14, color:'var(--text3)', marginTop:6 }}>
          {reward.corrette}/{reward.totDomande} risposte corrette / correct answers
          {reward.isReplay ? ' — replay' : ''}
        </div>
      </div>

      {/* Energia */}
      <div style={{
        background:'var(--bg)', borderRadius:12,
        border:'1px solid var(--border)', padding:'12px 14px', marginBottom:12,
      }}>
        <div style={{ fontSize:15, fontWeight:900, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
          ⚡ Energia guadagnata / Energy gained
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:22, fontWeight:900,
            color: reward.energia > 0 ? '#58CC02' : 'var(--text3)' }}>
            {reward.energia > 0 ? `+${reward.energia}%` : '—'}
          </span>
          {reward.isReplay && reward.deltaEnergia !== 0 && (
            <span style={{
              fontSize:14, fontWeight:700,
              color: reward.deltaEnergia > 0 ? '#58CC02' : '#FF4B4B',
            }}>
              {reward.deltaEnergia > 0 ? '+' : ''}{reward.deltaEnergia}% vs precedente
            </span>
          )}
        </div>
        <EnergyBar prima={reward.energiaPrima} dopo={reward.energiaDopo} />
      </div>

      {/* Crediti */}
      <div style={{
        background:'var(--bg)', borderRadius:12,
        border:'1px solid var(--border)', padding:'12px 14px', marginBottom:16,
      }}>
        <div style={{ fontSize:15, fontWeight:900, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
          🎫 Crediti viaggio / Travel credits
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <span style={{ fontSize:16, color:'var(--text2)' }}>
            Guadagnati / Earned
          </span>
          <span style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>+{reward.creditiBase ?? 0} cr</span>
        </div>
        {reward.creditiBonus > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <span style={{ fontSize:16, color:'#E5B700' }}>⭐ Bonus perfetto</span>
            <span style={{ fontSize:16, fontWeight:700, color:'#E5B700' }}>+{reward.creditiBonus} cr</span>
          </div>
        )}
        <div style={{ borderTop:'1px solid var(--border)', marginTop:6, paddingTop:6, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:16, fontWeight:800, color:'var(--text)' }}>Totale</span>
          <span style={{ fontSize:16, fontWeight:900, color:'#58CC02' }}>
            +{reward.crediti} cr
          </span>
        </div>
        {reward.isReplay && reward.deltaCrediti !== 0 && (
          <div style={{ fontSize:14, color: reward.deltaCrediti > 0 ? '#58CC02' : '#FF4B4B', marginTop:4 }}>
            {reward.deltaCrediti > 0 ? '+' : ''}{reward.deltaCrediti} cr vs sessione precedente
          </div>
        )}
      </div>

      {/* Bottoni navigazione */}
      <div style={{ display:'flex', gap:10 }}>
        {nextUrl && (
          <button onClick={onHome} style={{background:'none',border:'none',color:'#58cc02',fontSize:16,fontWeight:900,cursor:'pointer',fontFamily:'inherit'}}>🏠 Home</button>
        )}
        <button onClick={onContinua} style={{
          flex:2, background:'var(--primary)', color:'#fff', border:'none',
          borderRadius:'var(--r)', padding:'14px',
          fontSize:17, fontWeight:900, cursor:'pointer', fontFamily:'inherit',
          boxShadow:'0 4px 0 var(--primary-d)',
          textTransform:'uppercase', letterSpacing:'0.6px',
        }}>
          {nextUrl ? 'Continua / Continue →' : '🏠 Home'}
        </button>
      </div>
    </div>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function LessonComplete({ reward, livello, unita, lezione, onHome }) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (reward && !reward.sad) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [reward]);

  if (!reward) return null;

  // Calcola URL prossima lezione
  const lv = livello || 'A1';
  const un = unita || '1';
  const le = lezione || '1';
  let nextUrl = null;
  if (le === 'boss') {
    nextUrl = null; // dopo il boss torna home
  } else {
    const num = parseInt(le);
    if (num < 5) {
      nextUrl = `/lesson/${lv}/${un}/${num + 1}`;
    } else {
      nextUrl = `/lesson/${lv}/${un}/boss`;
    }
  }

  const handleRetry = () => {
    router.push(`/lesson/${lv}/${un}/${le}`);
  };
  const handleBoss  = () => router.push(`/lesson/${lv}/${un}/boss`);
  const handleHome  = () => { if (onHome) onHome(); else router.push('/'); };
  const handleContinua = () => {
    if (reward.menuCompleto) handleBoss();
    else if (nextUrl) router.push(nextUrl);
    else handleHome();
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-lesson)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      {showConfetti && <Confetti />}
      <div style={{
        background:'var(--card)', borderRadius:20,
        border:'2px solid var(--border)',
        maxWidth:400, width:'100%',
        boxShadow:'0 24px 64px rgba(0,0,0,0.4)',
        overflow:'hidden',
      }}>

        {/* Header */}
        <div style={{
          background: reward.tipo === 'sad'
            ? 'var(--err-bar)'
            : reward.menuCompleto
              ? 'linear-gradient(135deg, #1a1200, #2a1500)'
              : 'linear-gradient(180deg, var(--card) 0%, var(--bg) 100%)',
          borderBottom:'1px solid var(--border)',
          padding:'14px 20px', textAlign:'center',
        }}>
          <div style={{
            fontSize:16, fontWeight:900, textTransform:'uppercase', letterSpacing:'1px',
            color: reward.tipo === 'sad' ? 'var(--err-text)' : reward.menuCompleto ? '#E5B700' : 'var(--primary)',
          }}>
            {reward.tipo === 'sad'
              ? '❌ Nessun punto / No points'
              : reward.menuCompleto
                ? '🎊 Giornata Completa!'
                : reward.tipo === 'boss'
                  ? '🍦 Sfida la Nonna — Completata!'
                  : `✅ Lezione ${reward.lessonId} — Completata!`
            }
          </div>
        </div>

        {/* Contenuto */}
        {reward.tipo === 'sad'
          ? <PopupSad reward={reward} onRetry={handleRetry} onHome={handleHome} />
          : reward.menuCompleto
            ? <PopupMenuCompleto reward={reward} onBoss={handleBoss} />
            : reward.tipo === 'boss'
              ? <PopupBossReward reward={reward} onHome={handleHome} />
              : <PopupReward reward={reward} onContinua={handleContinua} onHome={handleHome} nextUrl={nextUrl} />
        }
      </div>

      <style>{`
        @keyframes glowGold {
          0%,100% { opacity:.85; }
          50%      { opacity:1; }
        }
        @keyframes foodBounce {
          0%   { transform: scale(0.3) translateY(40px); opacity:0; }
          50%  { transform: scale(1.15) translateY(-10px); opacity:1; }
          70%  { transform: scale(0.95) translateY(2px); }
          100% { transform: scale(1) translateY(0); opacity:1; }
        }
      `}</style>
    </div>
  );
}
