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

// ─── Barra energia mini ───────────────────────────────────────────────────────
function EnergyMiniBar({ prima, dopo }) {
  const color = dopo > 100 ? '#E5B700' : dopo >= 90 ? '#46A302' : dopo >= 61 ? '#58CC02' : dopo >= 36 ? '#1CB0F6' : dopo >= 26 ? '#FF9600' : '#CC0000';
  const pctPrima = Math.min(prima, 100);
  const pctDopo  = Math.min(dopo,  100);
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--text2)', marginBottom:4 }}>
        <span>{Math.round(prima)}%</span>
        <span style={{ color, fontWeight:800 }}>→ {Math.round(dopo)}%{dopo > 100 ? ' ⚡🚀' : ''}</span>
      </div>
      <div style={{ position:'relative', height:10, background:'var(--bg)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${pctPrima}%`, background:'var(--border)', borderRadius:99 }} />
        <div style={{
          position:'absolute', left:0, top:0, bottom:0,
          width:`${pctDopo}%`, background:color, borderRadius:99,
          transition:'width 1s cubic-bezier(.4,0,.2,1)',
          boxShadow:`0 0 6px ${color}66`,
        }} />
        {dopo > 100 && (
          <div style={{
            position:'absolute', left:0, top:0, bottom:0,
            width:`${Math.min(dopo - 100, 100)}%`,
            background:'linear-gradient(90deg,#E5B700,#FFD700)',
            borderRadius:99, animation:'glowGold 1.5s infinite',
          }} />
        )}
      </div>
    </div>
  );
}

// ─── Popup SAD (0-1 corrette) ─────────────────────────────────────────────────
function PopupSad({ onRetry, onHome }) {
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

// ─── Popup MENU NAPOLETANO COMPLETO ───────────────────────────────────────────
function PopupMenuCompleto({ reward, onBoss }) {
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => { setTimeout(() => setShowConfetti(false), 4000); }, []);

  const items = [
    { emoji:'☕', nome:'Caffè',     pct:10 },
    { emoji:'🥐', nome:'Cornetto',  pct:15 },
    { emoji:'🍸', nome:'Aperitivo', pct:20 },
    { emoji:'🍕', nome:'Pizza',     pct:15 },
  ];

  return (
    <>
      {showConfetti && <Confetti />}
      <div style={{ textAlign:'center', padding:'24px' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🎊</div>
        <div style={{ fontSize:21, fontWeight:900, color:'#E5B700', marginBottom:4 }}>
          MENU NAPOLETANO COMPLETATO!
        </div>
        <div style={{ fontSize:16, color:'var(--text2)', marginBottom:20 }}>
          Complete Neapolitan Menu! Hai conquistato tutto! 🇮🇹
        </div>

        <div style={{ background:'var(--bg)', borderRadius:12, padding:'14px', marginBottom:16 }}>
          {items.map(it => (
            <div key={it.emoji} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{it.emoji}</span>
              <span style={{ color:'var(--text)', fontWeight:700, flex:1, textAlign:'left', marginLeft:10 }}>{it.nome}</span>
              <span style={{ color:'#58CC02', fontWeight:900, fontSize:16 }}>+{it.pct}%</span>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--border)', marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:'var(--text2)', fontWeight:700 }}>⚡ Totale energia</span>
            <span style={{ color:'#58CC02', fontWeight:900 }}>+60% → {Math.round(reward?.energiaDopo ?? 95)}%</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
            <span style={{ color:'var(--text2)', fontWeight:700 }}>🎫 Crediti totali oggi</span>
            <span style={{ color:'var(--text)', fontWeight:900 }}>+84 cr</span>
          </div>
        </div>

        <div style={{ fontSize:16, color:'var(--text2)', marginBottom:20, lineHeight:1.5 }}>
          ☕ Domani si ricomincia con un buon caffè! /
          Tomorrow the menu awaits again!
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

// ─── Popup NORMALE ────────────────────────────────────────────────────────────
function PopupNormale({ reward, onContinua, onHome }) {
  const isPizza = reward.lessonId === 4;
  const isBoss  = reward.tipo === 'boss';

  return (
    <div style={{ padding:'24px' }}>

      {/* Cibo guadagnato */}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ fontSize:56 }}>{reward.ciboEmoji}</div>
        <div style={{ fontSize:20, fontWeight:900, color:'var(--text)', marginTop:8 }}>
          {isPizza
            ? reward.spicchi === 4
              ? '🍕 Pizza intera guadagnata!'
              : `${reward.spicchi} spicch${reward.spicchi === 1 ? 'io' : 'i'} di pizza!`
            : `${reward.ciboNome} guadagnato!`
          }
        </div>
        {isBoss && reward.nonna && (
          <div style={{ fontSize:16, color:'#E5B700', fontStyle:'italic', marginTop:6, lineHeight:1.5 }}>
            "{reward.nonna.msg}" / "{reward.nonna.msgEN}"
          </div>
        )}
        <div style={{ fontSize:15, color:'var(--text3)', marginTop:4 }}>
          {reward.corrette}/{reward.totDomande} risposte corrette
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
        <EnergyMiniBar prima={reward.energiaPrima} dopo={reward.energiaDopo} />

        {isPizza && reward.spicchi < 4 && (
          <div style={{ marginTop:8, fontSize:14, color:'var(--text3)' }}>
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} style={{ fontSize:20, opacity: i < reward.spicchi ? 1 : 0.25 }}>🍕</span>
            ))}
            <span style={{ marginLeft:6 }}>ancora {4 - reward.spicchi} spicch{4 - reward.spicchi === 1 ? 'io' : 'i'} per la pizza intera!</span>
          </div>
        )}
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
            {reward.corrette} risposte × 2
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
            {!reward.perfetto && <span style={{ color:'var(--text3)', fontWeight:600 }}> (max: 21 cr)</span>}
          </span>
        </div>
        {reward.isReplay && reward.deltaCrediti !== 0 && (
          <div style={{ fontSize:14, color: reward.deltaCrediti > 0 ? '#58CC02' : '#FF4B4B', marginTop:4 }}>
            {reward.deltaCrediti > 0 ? '+' : ''}{reward.deltaCrediti} cr vs sessione precedente
          </div>
        )}
      </div>

      {/* Hint replay se non perfetto */}
      {!reward.perfetto && !isBoss && (
        <div style={{
          background:'#1a1200', border:'1px solid #E5B70044',
          borderRadius:8, padding:'8px 12px',
          fontSize:14, color:'#E5B700', textAlign:'center', marginBottom:14,
        }}>
          🔁 Riprova per ottenere tutti i crediti! / Retry for max credits!
        </div>
      )}

      {/* Bottoni */}
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onHome} style={{background:'none',border:'none',color:'#58cc02',fontSize:16,fontWeight:900,cursor:'pointer',fontFamily:'inherit'}}>🏠 Home</button>
        <button onClick={onContinua} style={{
          flex:2, background:'var(--primary)', color:'#fff', border:'none',
          borderRadius:'var(--r)', padding:'14px',
          fontSize:17, fontWeight:900, cursor:'pointer', fontFamily:'inherit',
          boxShadow:'0 4px 0 var(--primary-d)',
          textTransform:'uppercase', letterSpacing:'0.6px',
        }}>Continua →</button>
      </div>
    </div>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function LessonComplete({ reward, onHome }) {
  const router = useRouter();

  if (!reward) return null;

  const handleRetry = () => {
    if (reward.lessonId === 'boss') router.push('/lesson/boss');
    else router.push(`/lesson/${reward.lessonId}`);
  };

  const handleBoss  = () => router.push('/lesson/boss');
  const handleHome  = () => { if (onHome) onHome(); else router.push('/'); };
  const handleContinua = () => {
    if (reward.menuCompleto) handleBoss();
    else handleHome();
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-lesson)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
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
                ? '🎊 Menu Napoletano Completo!'
                : reward.tipo === 'boss'
                  ? '🍦 Sfida la Nonna — Completata!'
                  : `✅ Lezione ${reward.lessonId} — Completata!`
            }
          </div>
        </div>

        {/* Contenuto */}
        {reward.tipo === 'sad'
          ? <PopupSad onRetry={handleRetry} onHome={handleHome} />
          : reward.menuCompleto
            ? <PopupMenuCompleto reward={reward} onBoss={handleBoss} />
            : <PopupNormale reward={reward} onContinua={handleContinua} onHome={handleHome} />
        }
      </div>

      <style>{`
        @keyframes glowGold {
          0%,100% { opacity:.85; }
          50%      { opacity:1; }
        }
      `}</style>
    </div>
  );
}
