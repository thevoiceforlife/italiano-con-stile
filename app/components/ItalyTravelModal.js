'use client';
import { useState } from 'react';

const CITIES = [
  { id:'napoli',      name:'Napoli',       tier:'home',      cost:0,   x:53, y:67, emoji:'☕', desc:'Il bar di Mario — il tuo punto di partenza', descEn:"Mario's bar — your home base", fact:'Il caffè napoletano è protetto come patrimonio culturale UNESCO.', factEn:'Neapolitan coffee is UNESCO-listed cultural heritage.', always:true },
  { id:'roma',        name:'Roma',         tier:'capoluogo', cost:100, x:47, y:56, emoji:'🏛', desc:'La Città Eterna — 2800 anni di storia', descEn:'The Eternal City — 2800 years of history', fact:'Roma ha più fontane di qualsiasi altra città al mondo.', factEn:'Rome has more fountains than any other city in the world.' },
  { id:'firenze',     name:'Firenze',      tier:'capoluogo', cost:100, x:42, y:41, emoji:'🎨', desc:'La culla del Rinascimento', descEn:'The cradle of the Renaissance', fact:'Il Davide di Michelangelo è alto 5,17 metri.', factEn:"Michelangelo's David stands 5.17 metres tall." },
  { id:'milano',      name:'Milano',       tier:'capoluogo', cost:100, x:36, y:21, emoji:'👔', desc:'La capitale della moda e del design', descEn:'The capital of fashion and design', fact:"L'Ultima Cena di Leonardo è dipinta su un muro, non su tela.", factEn:"Leonardo's Last Supper is painted on a wall, not on canvas." },
  { id:'venezia',     name:'Venezia',      tier:'capoluogo', cost:100, x:53, y:20, emoji:'🛶', desc:'La città galleggiante — 118 isolette', descEn:'The floating city — 118 tiny islands', fact:'Venezia non ha strade — solo canali e calli.', factEn:'Venice has no streets — only canals and narrow alleyways.' },
  { id:'torino',      name:'Torino',       tier:'capoluogo', cost:100, x:25, y:22, emoji:'🚗', desc:"La prima capitale d'Italia", descEn:"Italy's first capital", fact:'La Mole Antonelliana era nata come sinagoga.', factEn:'The Mole Antonelliana was originally built as a synagogue.' },
  { id:'bologna',     name:'Bologna',      tier:'provincia', cost:50,  x:44, y:31, emoji:'🍝', desc:'La Rossa, la Grassa, la Dotta', descEn:'The Red, the Fat, the Learned', fact:'Il ragù bolognese non si serve con gli spaghetti — si usa la tagliatella.', factEn:"Bolognese ragù is never served with spaghetti — it's traditionally tagliatelle." },
  { id:'genova',      name:'Genova',       tier:'provincia', cost:50,  x:29, y:31, emoji:'⚓', desc:'La Superba — città di Cristoforo Colombo', descEn:'La Superba — city of Christopher Columbus', fact:'Il pesto genovese ha una ricetta ufficiale depositata.', factEn:'Genovese pesto has an officially registered recipe.' },
  { id:'bari',        name:'Bari',         tier:'provincia', cost:50,  x:65, y:62, emoji:'🐟', desc:"La porta dell'Oriente", descEn:'The gateway to the East', fact:'Le nonne di Bari vecchia fanno le orecchiette in strada ogni mattina.', factEn:'The grandmothers of Old Bari make orecchiette in the street every morning.' },
  { id:'palermo',     name:'Palermo',      tier:'provincia', cost:50,  x:40, y:83, emoji:'🍋', desc:'Il crocevia del Mediterraneo', descEn:'The crossroads of the Mediterranean', fact:'Il mercato Ballarò di Palermo è attivo da oltre mille anni.', factEn:"Palermo's Ballarò market has been active for over a thousand years." },
  { id:'catania',     name:'Catania',      tier:'provincia', cost:50,  x:57, y:85, emoji:'🌋', desc:"All'ombra dell'Etna", descEn:'In the shadow of Etna', fact:"L'Etna è il vulcano attivo più alto d'Europa.", factEn:'Etna is the tallest active volcano in Europe.' },
  { id:'cagliari',    name:'Cagliari',     tier:'provincia', cost:50,  x:24, y:65, emoji:'🏖', desc:'Capitale della Sardegna', descEn:'Capital of Sardinia', fact:'In Sardegna si parla una lingua romanza distinta: il sardo.', factEn:'Sardinia has its own distinct Romance language: Sardinian.' },
  { id:'pompei',      name:'Pompei',       tier:'borgo',     cost:20,  x:56, y:69, emoji:'🏺', desc:'La città fermata nel 79 d.C.', descEn:'The city frozen in 79 AD', fact:'Gli scavi di Pompei sono ancora in corso dopo 250 anni.', factEn:'Pompeii excavations have been ongoing for 250 years.' },
  { id:'matera',      name:'Matera',       tier:'borgo',     cost:20,  x:63, y:65, emoji:'🪨', desc:"I Sassi — la città più antica d'Europa", descEn:'The Sassi — the oldest city in Europe', fact:'Matera è stata capitale europea della cultura nel 2019.', factEn:'Matera was European Capital of Culture in 2019.' },
  { id:'assisi',      name:'Assisi',       tier:'borgo',     cost:20,  x:47, y:46, emoji:'🕊', desc:'La città di San Francesco', descEn:'The city of Saint Francis', fact:"San Francesco d'Assisi è il patrono d'Italia.", factEn:'Saint Francis of Assisi is the patron saint of Italy.' },
  { id:'alberobello', name:'Alberobello',  tier:'borgo',     cost:20,  x:66, y:64, emoji:'🍄', desc:'I trulli — case a forma di cono', descEn:'The trulli — cone-shaped stone houses', fact:'Costruire un trullo senza cemento richiede settimane di lavoro.', factEn:'Building a trullo without cement takes weeks of skilled work.' },
  { id:'cinque-terre',name:'Cinque Terre', tier:'borgo',     cost:20,  x:31, y:33, emoji:'🌊', desc:'Cinque borghi aggrappati alle scogliere', descEn:'Five villages clinging to the cliffs', fact:'Le Cinque Terre sono accessibili solo a piedi o in barca.', factEn:'The Cinque Terre are only accessible on foot or by boat.' },
  { id:'agrigento',   name:'Agrigento',    tier:'borgo',     cost:20,  x:38, y:87, emoji:'🏛', desc:'La Valle dei Templi greci', descEn:'The Valley of the Greek Temples', fact:'Il Tempio della Concordia è tra i templi greci meglio conservati al mondo.', factEn:"Agrigento's Temple of Concordia is one of the world's best-preserved Greek temples." },
  { id:'portofino',   name:'Portofino',    tier:'borgo',     cost:20,  x:30, y:32, emoji:'⛵', desc:'Il porticciolo dei sogni — Liguria', descEn:'The dream harbour — Liguria', fact:'Portofino ha solo 400 abitanti ma attira milioni di visitatori.', factEn:'Portofino has only 400 inhabitants but attracts millions of visitors.' },
  { id:'orvieto',     name:'Orvieto',      tier:'borgo',     cost:20,  x:45, y:50, emoji:'🏰', desc:'Il Duomo medievale sulla rupe di tufo', descEn:'The medieval cathedral on a tufa cliff', fact:'Orvieto ha una città sotterranea scavata dagli Etruschi 2500 anni fa.', factEn:'Orvieto has an underground city carved by the Etruscans 2,500 years ago.' },
];

const TIER = {
  home:      { label:'Base',      color:'#FF9B42', ring:'#FF9B4266', r:9,  energyMin:0  },
  capoluogo: { label:'Capoluogo', color:'#FFD700', ring:'#FFD70055', r:7,  energyMin:90 },
  provincia: { label:'Provincia', color:'#1CB0F6', ring:'#1CB0F644', r:6,  energyMin:60 },
  borgo:     { label:'Borgo',     color:'#22C55E', ring:'#22C55E33', r:5,  energyMin:25 },
};

const MAP_SIZE = 260;

// Accessibile in base al tier e all'energia
function isTierAccessible(tier, travelAccess) {
  if (tier === 'home') return true;
  if (travelAccess === 'all')      return true;
  if (travelAccess === 'province') return tier === 'borgo' || tier === 'provincia';
  if (travelAccess === 'borghi')   return tier === 'borgo';
  return false;
}

function FilterBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'var(--primary)' : 'var(--card)',
      color: active ? '#fff' : 'var(--text2)',
      border: active ? 'none' : '1px solid var(--border)',
      borderRadius:8, padding:'4px 11px',
      fontSize:11, fontWeight:700, cursor:'pointer',
      fontFamily:'inherit', transition:'all 0.18s', whiteSpace:'nowrap',
    }}>
      {label}
    </button>
  );
}

export default function ItalyTravelModal({ energy, credits, tickets, travelAccess = 'borghi', onClose, onBuyTicket }) {
  const [selected,   setSelected]   = useState(null);
  const [filter,     setFilter]     = useState('all');
  const [justBought, setJustBought] = useState(null);
  const [boughtMsg,  setBoughtMsg]  = useState('');

  const isUnlocked = (c) => c.always || !!tickets[c.id];
  const canAfford  = (c) => credits >= c.cost;
  const accessible = (c) => isTierAccessible(c.tier, travelAccess);

  const handleBuy = (city) => {
    if (!canAfford(city) || !accessible(city)) return;
    const ok = onBuyTicket(city.id, city.cost);
    if (ok) {
      setJustBought(city.id);
      setBoughtMsg(`🎉 Biglietto per ${city.name} acquistato! / Ticket to ${city.name} purchased!`);
      setTimeout(() => { setJustBought(null); setBoughtMsg(''); }, 2800);
    }
  };

  const visibleCities = filter === 'all'
    ? CITIES
    : CITIES.filter(c => c.tier === filter || c.tier === 'home');

  // Banner per tier bloccati
  const tierBanners = [];
  if (travelAccess === 'borghi')   tierBanners.push('🏛 Province: 60% energia · 🎉 Capoluoghi: 90% energia');
  if (travelAccess === 'province') tierBanners.push('🎉 Capoluoghi: 90% energia — ancora un po\'!');

  return (
    <div onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.82)',
      backdropFilter:'blur(4px)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16, animation:'modalIn 0.22s ease',
    }}>
      <div style={{
        background:'var(--bg)', border:'1.5px solid var(--border)',
        borderRadius:20, width:'100%', maxWidth:840, maxHeight:'93vh',
        overflow:'hidden', display:'flex', flexDirection:'column',
        boxShadow:'0 24px 64px rgba(0,0,0,0.65)',
      }}>

        {/* Header */}
        <div style={{ padding:'15px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, background:'linear-gradient(180deg,var(--card) 0%,var(--bg) 100%)' }}>
          <div>
            <div style={{ color:'var(--text)', fontWeight:800, fontSize:17, display:'flex', alignItems:'center', gap:8 }}>
              🇮🇹 Viaggia in Italia / Travel Italy
            </div>
            <div style={{ color:'var(--text2)', fontSize:11, marginTop:3 }}>
              {credits} crediti · Napoli sempre aperta · Energia: {Math.round(energy)}%
            </div>
          </div>
          <button onClick={onClose} style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text2)', borderRadius:8, width:32, height:32, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>✕</button>
        </div>

        {/* Banner tier bloccati */}
        {tierBanners.map((b,i) => (
          <div key={i} style={{ background:'#1a1200', borderBottom:'1px solid #E5B70033', padding:'8px 20px', color:'#E5B700', fontSize:11, textAlign:'center', fontWeight:700, flexShrink:0 }}>
            🔒 {b}
          </div>
        ))}

        {/* Toast acquisto */}
        {boughtMsg && (
          <div style={{ background:'var(--ok-bar)', borderBottom:'1px solid #58CC0244', padding:'9px 20px', color:'var(--ok-text)', fontSize:12, textAlign:'center', fontWeight:700, flexShrink:0, animation:'fadeIn 0.2s ease' }}>
            {boughtMsg}
          </div>
        )}

        {/* Corpo */}
        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

          {/* Mappa */}
          <div style={{ flexShrink:0, width:MAP_SIZE+24, padding:'16px 8px 16px 16px', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            {/* Legenda */}
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:5 }}>
              {Object.entries(TIER).map(([key, cfg]) => {
                const tierOk = isTierAccessible(key, travelAccess);
                return (
                  <div key={key} style={{ display:'flex', alignItems:'center', gap:7, opacity: tierOk ? 1 : 0.45 }}>
                    <div style={{ width:cfg.r*1.9, height:cfg.r*1.9, borderRadius:'50%', background:cfg.color, flexShrink:0, boxShadow:`0 0 7px ${cfg.color}99` }} />
                    <span style={{ color:'var(--text2)', fontSize:10 }}>
                      {cfg.label}
                      {key === 'home'      ? ' — sempre aperta' :
                       key === 'capoluogo' ? ` · 100cr · ≥90%${!tierOk?' 🔒':''}` :
                       key === 'provincia' ? ` · 50cr · ≥60%${!tierOk?' 🔒':''}` :
                                            ` · 20cr · ≥25%${!tierOk?' 🔒':''}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mappa con immagine */}
            <div style={{ position:'relative', width:MAP_SIZE, height:MAP_SIZE, borderRadius:14, overflow:'hidden', boxShadow:'0 4px 28px rgba(0,0,0,0.55)', flexShrink:0 }}>
              <img src="/images/italia-map.png" alt="Cartina Italia" style={{ width:MAP_SIZE, height:MAP_SIZE, display:'block', userSelect:'none', objectFit:'cover' }} draggable={false} />

              <svg viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`} style={{ position:'absolute', inset:0, width:MAP_SIZE, height:MAP_SIZE }}>
                {CITIES.map(city => {
                  const cx = (city.x / 100) * MAP_SIZE;
                  const cy = (city.y / 100) * MAP_SIZE;
                  const cfg        = TIER[city.tier];
                  const unlocked   = isUnlocked(city);
                  const access     = accessible(city);
                  const isSelected = selected?.id === city.id;
                  const isBought   = justBought === city.id;
                  return (
                    <g key={city.id} style={{ cursor:'pointer' }} onClick={()=>setSelected(city===selected?null:city)}>
                      {isSelected && <circle cx={cx} cy={cy} r={cfg.r+7} fill="none" stroke={cfg.color} strokeWidth="1.5" opacity="0.65" style={{ animation:'svgPulse 1.4s infinite' }} />}
                      {isBought   && <circle cx={cx} cy={cy} r={cfg.r+3} fill="none" stroke={cfg.color} strokeWidth="2.5" style={{ animation:'svgPing 0.7s ease-out forwards' }} />}
                      <circle cx={cx} cy={cy} r={cfg.r+3} fill={unlocked&&access?cfg.ring:'rgba(0,0,0,0.25)'} style={{ transition:'fill 0.3s' }} />
                      <circle cx={cx} cy={cy} r={isSelected?cfg.r+2:cfg.r}
                        fill={unlocked ? cfg.color : access ? '#2C3E4A' : '#1a2530'}
                        stroke={isSelected?'#fff':unlocked?`${cfg.color}BB`:'#38444D'}
                        strokeWidth={isSelected?2.5:1}
                        opacity={!access?0.3:1}
                        style={{ transition:'r 0.2s, fill 0.3s' }}
                      />
                      {unlocked&&!city.always && <text x={cx} y={cy+3.5} textAnchor="middle" fontSize={city.tier==='borgo'?'5':'6'} fill="#fff" style={{ pointerEvents:'none', userSelect:'none' }}>✓</text>}
                      {!unlocked&&access && <text x={cx} y={cy+3} textAnchor="middle" fontSize="5" fill="#8899AA" style={{ pointerEvents:'none', userSelect:'none' }}>🔒</text>}
                      {!access && <text x={cx} y={cy+3} textAnchor="middle" fontSize="5" fill="#553333" style={{ pointerEvents:'none', userSelect:'none' }}>⛔</text>}
                      {(isSelected||city.always) && <text x={cx} y={cy+cfg.r+10} textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={cfg.color} style={{ pointerEvents:'none', userSelect:'none', filter:'drop-shadow(0 1px 3px rgba(0,0,0,0.95))' }}>{city.name}</text>}
                    </g>
                  );
                })}
              </svg>
            </div>
            <div style={{ color:'var(--text3)', fontSize:10, textAlign:'center' }}>Clicca una città / Tap a city</div>
          </div>

          {/* Pannello destro */}
          <div style={{ flex:1, overflow:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
              <FilterBtn label="🗺 Tutte"            active={filter==='all'}       onClick={()=>setFilter('all')} />
              <FilterBtn label="🎉 Capoluoghi 100cr"  active={filter==='capoluogo'} onClick={()=>setFilter('capoluogo')} />
              <FilterBtn label="🏛 Province 50cr"    active={filter==='provincia'} onClick={()=>setFilter('provincia')} />
              <FilterBtn label="🍎 Borghi 20cr"      active={filter==='borgo'}     onClick={()=>setFilter('borgo')} />
            </div>

            {/* Scheda città */}
            {selected && (
              <div style={{ background:'var(--card)', border:`1.5px solid ${TIER[selected.tier].color}`, borderRadius:14, padding:'14px 16px', flexShrink:0, animation:'fadeIn 0.2s ease' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:6 }}>
                      <span style={{ fontSize:26 }}>{selected.emoji}</span>
                      <div>
                        <div style={{ color:'var(--text)', fontWeight:800, fontSize:16 }}>{selected.name}</div>
                        <div style={{ display:'inline-block', background:`${TIER[selected.tier].color}22`, color:TIER[selected.tier].color, borderRadius:6, padding:'1px 8px', fontSize:10, fontWeight:700, marginTop:2 }}>
                          {TIER[selected.tier].label} {selected.cost > 0 ? `· ${selected.cost} cr` : '· sempre aperta'}
                          {!accessible(selected) && selected.tier !== 'home' ? ` · serve ≥${TIER[selected.tier].energyMin}% energia` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ color:'var(--text2)', fontSize:12, marginBottom:6 }}>{selected.desc} / {selected.descEn}</div>
                    {selected.fact && (
                      <div style={{ background:'var(--bg)', borderLeft:`3px solid ${TIER[selected.tier].color}`, borderRadius:'0 6px 6px 0', padding:'6px 10px', fontSize:11, color:'var(--text2)', lineHeight:1.5, marginTop:4 }}>
                        💡 {selected.fact} / {selected.factEn}
                      </div>
                    )}
                  </div>
                  <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'var(--text3)', fontSize:15, cursor:'pointer', flexShrink:0 }}>✕</button>
                </div>
                <div style={{ marginTop:12 }}>
                  {selected.always ? (
                    <div style={{ background:'#FF9B4222', color:'#FF9B42', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, textAlign:'center' }}>
                      ☕ Casa — il Bar di Mario ti aspetta sempre!
                    </div>
                  ) : isUnlocked(selected) ? (
                    <div style={{ background:'var(--ok-bar)', color:'var(--ok-text)', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700, textAlign:'center' }}>
                      ✅ Sbloccata — lezioni locali in arrivo! / Unlocked — local lessons coming soon!
                    </div>
                  ) : !accessible(selected) ? (
                    <div style={{ background:'var(--err-bar)', color:'var(--err-text)', borderRadius:10, padding:'8px 14px', fontSize:11, textAlign:'center', lineHeight:1.5 }}>
                      🔒 Ricarica l'energia fino al {TIER[selected.tier].energyMin}% per sbloccare questo tier /
                      Recharge to {TIER[selected.tier].energyMin}% to unlock
                    </div>
                  ) : !canAfford(selected) ? (
                    <div style={{ background:'var(--card)', color:'var(--text2)', borderRadius:10, padding:'8px 14px', fontSize:11, textAlign:'center', lineHeight:1.5, border:'1px solid var(--border)' }}>
                      💳 Crediti insufficienti — hai {credits}/{selected.cost} / Not enough credits
                    </div>
                  ) : (
                    <button onClick={()=>handleBuy(selected)} style={{ background:'var(--primary)', color:'#fff', border:'none', borderRadius:10, padding:'9px 14px', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 2px 12px #58CC0244', transition:'transform 0.1s' }}
                      onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'}
                      onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
                    >
                      🎫 Compra biglietto — {selected.cost} crediti / Buy ticket
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Lista città */}
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {visibleCities.map(city => {
                const unlocked  = isUnlocked(city);
                const access    = accessible(city);
                const tierColor = TIER[city.tier].color;
                const isActive  = selected?.id === city.id;
                return (
                  <button key={city.id} onClick={()=>setSelected(city===selected?null:city)} style={{
                    background: isActive ? 'var(--card)' : 'var(--bg)',
                    border: `1px solid ${isActive?tierColor:'var(--border)'}`,
                    borderRadius:10, padding:'8px 12px',
                    display:'flex', alignItems:'center', gap:10,
                    cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                    transition:'all 0.15s', opacity: !access ? 0.4 : 1,
                  }}>
                    <div style={{ fontSize:20, flexShrink:0, width:26, textAlign:'center' }}>{city.emoji}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:'var(--text)', fontSize:13, fontWeight:700 }}>{city.name}</div>
                      <div style={{ color:tierColor, fontSize:10, fontWeight:600, marginTop:1 }}>
                        {city.always ? 'Sempre accessibile / Always open' : `${TIER[city.tier].label} · ${city.cost} cr`}
                        {!access && !city.always ? ` · 🔒 ≥${TIER[city.tier].energyMin}%` : ''}
                      </div>
                    </div>
                    <div style={{ flexShrink:0, fontSize:14 }}>
                      {city.always    ? '🏠'
                      : unlocked      ? <span style={{ color:'#58CC02', fontWeight:700, fontSize:12 }}>✅</span>
                      : !access       ? '⛔'
                      : canAfford(city) ? <span style={{ color:'var(--primary)', fontSize:12 }}>🎫</span>
                      :                  <span style={{ color:'var(--text3)', fontSize:12 }}>💳</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes svgPulse { 0%,100%{opacity:0.5} 50%{opacity:0.9} }
        @keyframes svgPing  { from{opacity:0.9;transform:scale(1)} to{opacity:0;transform:scale(2.8)} }
      `}</style>
    </div>
  );
}
