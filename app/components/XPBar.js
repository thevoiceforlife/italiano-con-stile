'use client';
import { useState, useEffect } from 'react';
import ItalyTravelModal from './ItalyTravelModal';
import { initAndDecay, checkSundayBonus, loadProgress } from './saveProgress';

function getEnergyColor(pct) {
  if (pct > 100) return '#E5B700';
  if (pct >= 90) return '#46A302';
  if (pct >= 61) return '#58CC02';
  if (pct >= 36) return '#1CB0F6';
  if (pct >= 26) return '#FF9600';
  return '#CC0000';
}

function getEnergyLabel(pct) {
  if (pct > 100) return { it: 'Eccezionale! ⚡🚀', en: 'Exceptional! ⚡🚀' };
  if (pct >= 90) return { it: 'Caricato!',          en: 'Fully charged!' };
  if (pct >= 61) return { it: 'In forma',            en: 'In shape' };
  if (pct >= 36) return { it: 'Buono',               en: 'Good' };
  if (pct >= 26) return { it: 'Quasi scarico',       en: 'Running low' };
  return              { it: 'Emergenza',              en: 'Emergency' };
}

function getTravelAccess(pct) {
  if (pct >= 90) return 'all';
  if (pct >= 60) return 'province';
  if (pct >= 25) return 'borghi';
  return 'none';
}

// ─── Streak ───────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Lun/Mon','Mar/Tue','Mer/Wed','Gio/Thu','Ven/Fri','Sab/Sat','Dom/Sun'];
const DAY_KEYS   = ['lun','mar','mer','gio','ven','sab','dom'];

function StreakBar({ streak }) {
  if (!streak) return null;
  const { activeDays = [], totalDays = 7, weekStart } = streak;
  const days = Array.from({ length: 7 }, (_, i) => ({
    label: DAY_LABELS[i], key: DAY_KEYS[i]
  }));
  const active = activeDays.length;
  const t = totalDays ?? 7;
  const bonusTxt = active >= t ? '+50 cr ⚡'
    : active >= Math.ceil(t * 5/7) ? '+30 cr'
    : active >= Math.ceil(t * 3/7) ? '+10 cr' : '—';

  return (
    <div style={{ marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 6 }}>
        <span style={{ fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
          🔥 Streak settimanale / Weekly streak
        </span>
        <span style={{ fontSize:11, fontWeight:700, color:'#E5B700' }}>
          Dom/Sun: {bonusTxt}
        </span>
      </div>
      <div style={{ display:'flex', gap:4 }}>
        {days.map(({ label, key }) => {
          const done = activeDays.includes(key);
          return (
            <div key={key} style={{ textAlign:'center', flex:1 }}>
              <div style={{
                height:24, borderRadius:6,
                background: done ? '#FF960022' : 'var(--bg)',
                border: `1.5px solid ${done ? '#FF9600' : 'var(--border)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: done ? 13 : 6,
                boxShadow: done ? '0 0 8px #FF960044' : 'none',
              }}>
                {done ? '✅' : '·'}
              </div>
              <div style={{ fontSize:9, color:'var(--text3)', marginTop:2, fontWeight:600 }}>{label}</div>
            </div>
          );
        })}

      </div>
      <div style={{ fontSize:10, color:'var(--text3)', marginTop:5, textAlign:'center' }}>
        {active} giorni attivi · giorno attivo = ≥2 lezioni / active day = ≥2 lessons
      </div>
    </div>
  );
}

// ─── XPBar principale ─────────────────────────────────────────────────────────
export default function XPBar() {
  const [energy,     setEnergy]     = useState(25);
  const [credits,    setCredits]    = useState(0);
  const [tickets,    setTickets]    = useState({});
  const [streak,     setStreak]     = useState(null);
  const [showTravel, setShowTravel] = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [sundayMsg,  setSundayMsg]  = useState(null);

  const refresh = () => {
    const p = loadProgress();
    if (!p) return;
    setEnergy(p.energy  ?? 25);
    setCredits(p.credits ?? 0);
    setTickets(p.tickets ?? {});
    setStreak(p.streak   ?? null);
  };

  useEffect(() => {
    const data = initAndDecay();
    setEnergy(data.energy  ?? 25);
    setCredits(data.credits ?? 0);
    setTickets(data.tickets ?? {});
    setStreak(data.streak   ?? null);
    setMounted(true);
    const bonus = checkSundayBonus();
    if (bonus) setSundayMsg(bonus);
    window.addEventListener('focus', refresh);
    const t = setInterval(refresh, 60_000);
    return () => { window.removeEventListener('focus', refresh); clearInterval(t); };
  }, []);

  const handleBuyTicket = (cityId, cost) => {
    try {
      const raw  = localStorage.getItem('italiano-progress');
      const data = raw ? JSON.parse(raw) : {};
      if ((data.credits ?? 0) < cost) return false;
      const upd = { ...data, credits: data.credits - cost,
        tickets: { ...(data.tickets ?? {}), [cityId]: true } };
      localStorage.setItem('italiano-progress', JSON.stringify(upd));
      setCredits(upd.credits);
      setTickets(upd.tickets);
      return true;
    } catch { return false; }
  };

  if (!mounted) return null;

  const clampedPct  = Math.min(energy, 100);
  const overPct     = energy > 100 ? Math.min(energy - 100, 100) : 0;
  const mainColor   = getEnergyColor(energy);
  const label       = getEnergyLabel(energy);
  const access      = getTravelAccess(energy);
  const canTravel   = access !== 'none';
  const isOver      = energy > 100;
  const isEmergency = energy <= 25;

  const travelBtnLabel = access === 'all'      ? '🇮🇹 Tutta Italia'
    : access === 'province' ? '🇮🇹 Borghi + Province'
    : access === 'borghi'   ? '🇮🇹 Solo Borghi'
    : '🔒 Ricarica prima';

  return (
    <>
      <div style={{
        background:'var(--card)',
        border:`1.5px solid ${isOver ? '#E5B70055' : isEmergency ? '#CC000044' : 'var(--border)'}`,
        borderRadius:16, padding:'14px 18px',
        display:'flex', flexDirection:'column', gap:10,
        marginBottom:16,
        boxShadow: isOver ? '0 0 24px #E5B70018' : 'none',
        transition:'border-color 0.4s, box-shadow 0.4s',
      }}>

        {/* Banner domenica */}
        {sundayMsg && (
          <div style={{
            background:'#1a1200', border:'1px solid #E5B70066',
            borderRadius:8, padding:'8px 12px',
            fontSize:12, color:'#E5B700', fontWeight:700,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            animation:'fadeIn 0.3s ease',
          }}>
            <span>
              🎉 Bonus domenica: +{sundayMsg.creditiBonus} cr
              {sundayMsg.energiaBonus > 0 ? ` +${sundayMsg.energiaBonus}% ⚡` : ''}
              &nbsp;— {sundayMsg.active}/{sundayMsg.total} giorni attivi!
            </span>
            <button onClick={() => setSundayMsg(null)} style={{
              background:'none', border:'none', color:'#E5B700',
              cursor:'pointer', fontSize:16, lineHeight:1,
            }}>✕</button>
          </div>
        )}

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:20 }}>
              {isOver ? '⚡' : energy >= 60 ? '🔋' : energy >= 26 ? '🔋' : '🪫'}
            </span>
            <span style={{ color:'var(--text)', fontSize:13, fontWeight:700 }}>
              Energia / Energy
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:mainColor, fontSize:15, fontWeight:800, fontVariantNumeric:'tabular-nums', transition:'color 0.4s' }}>
              {Math.round(energy)}%
            </span>
            <span style={{ color:'var(--text3)', fontSize:10, fontWeight:600 }}>
              {label.it}
            </span>
          </div>
        </div>

        {/* Barra */}
        <div style={{ position:'relative', height:14, background:'var(--bg)', borderRadius:99, overflow:'hidden' }}>
          {/* Segmento principale */}
          <div style={{
            position:'absolute', left:0, top:0, bottom:0,
            width:`${clampedPct}%`,
            background: mainColor,
            borderRadius:99,
            transition:'width 0.7s cubic-bezier(.4,0,.2,1), background-color 0.4s',
            boxShadow:`0 0 8px ${mainColor}66`,
          }} />
          {/* Over-energy oro */}
          {isOver && (
            <div style={{
              position:'absolute', left:0, top:0, bottom:0,
              width:`${overPct}%`,
              background:'linear-gradient(90deg, #E5B700, #FFD700)',
              borderRadius:99,
              animation:'glowGold 1.5s ease-in-out infinite',
              boxShadow:'0 0 16px #E5B70099',
            }} />
          )}
          {/* Tacche soglie */}
          {[25, 60, 90].map(p => (
            <div key={p} style={{
              position:'absolute', left:`${p}%`, top:0, bottom:0,
              width:2, background:'rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>

        {/* Etichette soglie */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:-6 }}>
          {[
            { pct:25, emoji:'🍎', label:'Borghi' },
            { pct:60, emoji:'🏛', label:'Province' },
            { pct:90, emoji:'🎉', label:'Capoluoghi' },
          ].map(({ pct, emoji, label: lbl }) => (
            <span key={pct} style={{ fontSize:9, fontWeight:700,
              color: energy >= pct ? '#58CC02' : 'var(--text3)' }}>
              {emoji} {pct}% {lbl}
            </span>
          ))}
        </div>

        {/* Crediti + bottone */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:2 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ fontSize:17 }}>🎫</span>
            <span style={{ color:'var(--text)', fontSize:14, fontWeight:800 }}>{credits}</span>
            <span style={{ color:'var(--text2)', fontSize:11 }}>crediti</span>
          </div>
          <button onClick={() => setShowTravel(true)} style={{
            background: canTravel
              ? 'linear-gradient(135deg, #005F8A 0%, #00A8D0 100%)'
              : 'var(--bg)',
            color:      canTravel ? '#fff' : 'var(--text3)',
            border:     canTravel ? 'none' : '1px solid var(--border)',
            borderRadius:10, padding:'7px 16px',
            fontSize:12, fontWeight:700, cursor:'pointer',
            display:'flex', alignItems:'center', gap:7,
            transition:'all 0.2s', fontFamily:'inherit',
            boxShadow: canTravel ? '0 2px 12px #00A8D044' : 'none',
          }}>
            {travelBtnLabel}
          </button>
        </div>

        {/* Avviso emergenza */}
        {!canTravel && (
          <div style={{
            background:'var(--err-bar)', border:'1px solid #FF4B4B44',
            borderRadius:8, padding:'7px 11px',
            fontSize:11, color:'var(--err-text)', textAlign:'center', lineHeight:1.45,
          }}>
            ⚠️ Energia sotto il 25% — completa una lezione per viaggiare! /
            Energy below 25% — complete a lesson to travel!
          </div>
        )}

        {/* Streak */}
        <StreakBar streak={streak} />
      </div>

      {showTravel && (
        <ItalyTravelModal
          energy={energy}
          credits={credits}
          tickets={tickets}
          travelAccess={access}
          onClose={() => setShowTravel(false)}
          onBuyTicket={handleBuyTicket}
        />
      )}

      <style>{`
        @keyframes glowGold {
          0%,100% { opacity:.85; }
          50%      { opacity:1; box-shadow:0 0 24px #E5B700CC; }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </>
  );
}
