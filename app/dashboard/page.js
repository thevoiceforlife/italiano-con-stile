'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLevelData } from '../components/LevelBadge';
import { loadProgress } from '../components/saveProgress';
import ItalyTravelModal from '../components/ItalyTravelModal';

const DEFAULT_AVATARS = ['🍕','🤌','☕','🎵','🌊','🏺','🍋','👒'];
const DAY_KEYS_ARR   = ['lun','mar','mer','gio','ven','sab','dom'];
const DAY_IT         = ['L','M','M','G','V','S','D'];

function getDefaultAvatar() {
  try {
    const s = localStorage.getItem('italiano-avatar');
    if (s) return s;
    const pick = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    localStorage.setItem('italiano-avatar', pick);
    return pick;
  } catch { return '🍕'; }
}

function getDefaultNickname(levelId) {
  try {
    const custom = localStorage.getItem('italiano-nickname');
    if (custom) return custom;
    const lv = getLevelData(levelId);
    let seed = localStorage.getItem('italiano-nick-seed');
    if (!seed) { seed = String(Math.floor(Math.random()*9000)+1000); localStorage.setItem('italiano-nick-seed', seed); }
    return (lv.nickPrefix || 'Turista') + '_' + seed;
  } catch { return 'Turista_0000'; }
}

function buildStats(data) {
  const completed = data?.completed ?? [];
  const scores    = data?.lessonScores ?? {};
  const all       = Object.values(scores);
  const accuracy  = all.length ? Math.round(all.reduce((a,s)=>a+(s.accuracy??0),0)/all.length) : 0;
  return { lezioni: completed.length, parole: completed.length*12, accuracy, minuti: completed.length*8 };
}

function EditProfileModal({ avatar, nickname, onSave, onClose }) {
  const [av, setAv]     = useState(avatar);
  const [nick, setNick] = useState(nickname);
  function save() {
    const n = nick.trim().replace(/\s+/g,'_').slice(0,20);
    if (!n) return;
    try { localStorage.setItem('italiano-avatar',av); localStorage.setItem('italiano-nickname',n); } catch {}
    onSave(av, n);
  }
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--card)',borderRadius:20,border:'1.5px solid var(--border)',padding:24,maxWidth:340,width:'100%'}}>
        <div style={{fontSize:18,fontWeight:900,color:'var(--text)',marginBottom:16}}>Modifica profilo / Edit profile</div>
        <div style={{fontSize:14,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',marginBottom:8}}>Avatar</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
          {DEFAULT_AVATARS.map(a=>(
            <button key={a} onClick={()=>setAv(a)} style={{fontSize:24,width:44,height:44,borderRadius:'50%',border:`2.5px solid ${a===av?'var(--primary)':'var(--border)'}`,background:a===av?'var(--opt-sel-bg)':'var(--card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{a}</button>
          ))}
        </div>
        <div style={{fontSize:14,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',marginBottom:8}}>Nickname (max 20)</div>
        <input value={nick} onChange={e=>setNick(e.target.value.slice(0,20))} style={{width:'100%',padding:'10px 12px',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:10,fontSize:17,color:'var(--text)',fontFamily:'inherit',outline:'none',marginBottom:18}} placeholder="es. Turista_1234" />
        <button onClick={save} style={{width:'100%',padding:13,borderRadius:12,border:'none',background:'var(--primary)',color:'white',fontSize:17,fontWeight:900,cursor:'pointer',fontFamily:'inherit',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:10}}>Salva / Save</button>
        <button onClick={onClose} style={{width:'100%',padding:11,borderRadius:12,border:'1.5px solid var(--border)',background:'none',fontSize:16,fontWeight:800,color:'var(--text2)',cursor:'pointer',fontFamily:'inherit'}}>Annulla / Cancel</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [data,       setData]       = useState(null);
  const [avatar,     setAvatar]     = useState('🍕');
  const [nickname,   setNickname]   = useState('Turista_0000');
  const [levelId,    setLevelId]    = useState('A1');
  const [stats,      setStats]      = useState({lezioni:0,parole:0,accuracy:0,minuti:0});
  const [showEdit,   setShowEdit]   = useState(false);
  const [showTravel, setShowTravel] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  useEffect(()=>{
    const p = loadProgress();
    setData(p);
    setLevelId(p?.livello ?? 'A1');
    setStats(buildStats(p));
    setAvatar(getDefaultAvatar());
    setNickname(getDefaultNickname(p?.livello ?? 'A1'));
    setMounted(true);
  },[]);

  if (!mounted) return null;

  const lv         = getLevelData(levelId);
  const completed  = data?.completed ?? [];
  const energy     = data?.energy ?? 25;
  const credits    = data?.credits ?? 0;
  const activeDays = data?.streak?.activeDays ?? [];
  const tickets    = data?.tickets ?? {};
  const todayIdx   = (new Date().getDay()+6)%7;
  const travelAccess = energy>=90?'all':energy>=60?'citta':energy>=25?'mete':'none';

  const eColor = energy>=90?'#46A302':energy>=61?'#58CC02':energy>=36?'#1CB0F6':energy>=26?'#FF9600':'#CC0000';

  const C  = {background:'var(--card)',border:'1.5px solid var(--border)',borderRadius:16,padding:14};
  const tr = {height:4,background:'var(--bg)',borderRadius:99,overflow:'hidden'};
  const fi = (w,c)=>({height:'100%',width:`${Math.min(w,100)}%`,background:c,borderRadius:99,transition:'width 0.7s'});

  return (
    <main className="page-wide" style={{minHeight:'100vh',background:'var(--bg)',paddingBottom:40,paddingLeft:0,paddingRight:0}}>

      {/* ── TOP BAR ── */}
      <div style={{background:'var(--card)',borderBottom:'1.5px solid var(--border)',padding:'12px 8px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <button
          onClick={()=>router.push('/')}
          style={{background:'none',border:'none',color:'var(--primary)',fontSize:16,fontWeight:900,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}
        >
          🏠 Home
        </button>
        <span style={{fontSize:16,fontWeight:900,color:'var(--text)'}}>Dashboard</span>
        <div style={{width:64}}/>
      </div>

      <div style={{padding:'12px 8px',display:'flex',flexDirection:'column',gap:10,maxWidth:'100%',margin:'0 auto'}}>

        {/* ── 1. STATUS CARD ── */}
        <div style={C}>

          {/* Riga principale: avatar · nick/badge · energia · matita */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:48,height:48,borderRadius:'50%',border:`2.5px solid ${lv.color}`,background:lv.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
              {avatar}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:18,fontWeight:900,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{nickname}</div>
              <span style={{display:'inline-flex',alignItems:'center',gap:4,background:lv.bg,color:lv.color,padding:'2px 8px',borderRadius:99,fontSize:14,fontWeight:700,marginTop:3}}>
                {lv.emoji} {lv.id} · {lv.itLabel}
              </span>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:22,fontWeight:900,color:eColor,lineHeight:1}}>{Math.round(energy)}%</div>
              <div style={{fontSize:13,color:'var(--text3)',marginTop:1}}>energia</div>
            </div>
            <button
              onClick={()=>setShowEdit(true)}
              title="Modifica profilo / Edit profile"
              style={{background:'none',border:'1.5px solid var(--border)',borderRadius:8,width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:17,flexShrink:0}}
            >✏️</button>
          </div>

          {/* Barra energia */}
          <div style={{...tr,marginBottom:10}}>
            <div style={fi(energy,eColor)}/>
          </div>

          {/* Numeri celebrativi */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            <div style={{background:'rgba(28,176,246,0.08)',borderRadius:12,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:900,color:'#1CB0F6',lineHeight:1,letterSpacing:'-0.5px'}}>
                {stats.parole.toLocaleString()}
              </div>
              <div style={{fontSize:13,color:'var(--text3)',marginTop:3}}>parole apprese</div>
              <div style={{fontSize:12,color:'var(--text3)',opacity:0.7}}>words learned</div>
            </div>
            <div style={{background:'rgba(255,150,0,0.08)',borderRadius:12,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:900,color:'#FF9600',lineHeight:1}}>
                {activeDays.length}<span style={{fontSize:16,fontWeight:700,color:'rgba(255,150,0,0.6)'}}>/7</span>
              </div>
              <div style={{fontSize:13,color:'var(--text3)',marginTop:3}}>giorni attivi</div>
              <div style={{fontSize:12,color:'var(--text3)',opacity:0.7}}>active days</div>
            </div>
          </div>

          {/* Streak 7 giorni */}
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:15,flexShrink:0}}>🔥</span>
            <div style={{display:'flex',gap:3,flex:1}}>
              {DAY_KEYS_ARR.map((key,i)=>{
                const done    = activeDays.includes(key);
                const isToday = i === todayIdx;
                return (
                  <div key={key} style={{flex:1,textAlign:'center'}}>
                    <div style={{
                      height:20,borderRadius:5,
                      background: done?'#FF960018':'var(--bg)',
                      border: isToday
                        ? `1.5px solid ${done?'#FF9600':'#E5B700'}`
                        : `1px solid ${done?'#FF960066':'var(--border)'}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize: done?10:7,
                      color: done?'#FF9600':'var(--text3)',
                    }}>
                      {done?'✓':'·'}
                    </div>
                    <div style={{fontSize:12,marginTop:3,fontWeight:700,color:isToday?'#E5B700':'var(--text3)'}}>
                      {DAY_IT[i]}
                    </div>
                  </div>
                );
              })}
            </div>
            <span style={{fontSize:13,fontWeight:700,color:'#E5B700',flexShrink:0}}>+30cr Dom</span>
          </div>

        </div>

        {/* ── 2. HUB NAVIGAZIONE ── */}

        {/* Percorso — rettangolo grande */}
        <div
          onClick={()=>router.push('/')}
          style={{background:'rgba(88,204,2,0.08)',border:'1.5px solid rgba(88,204,2,0.3)',borderRadius:16,padding:'18px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:14}}
        >
          <span style={{fontSize:34,flexShrink:0}}>🗺️</span>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:'#58cc02'}}>Il tuo percorso</div>
            <div style={{fontSize:15,color:'rgba(255,255,255,0.4)',marginTop:2}}>Your learning path</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.25)',marginTop:3}}>A1 · {completed.length} lezioni completate</div>
          </div>
          <span style={{fontSize:20,color:'#58cc02'}}>→</span>
        </div>

        {/* Biblioteca + Esplora — quadrati uguali */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>

          <div
            onClick={()=>router.push('/biblioteca')}
            style={{background:'rgba(229,183,0,0.06)',border:'1.5px solid rgba(229,183,0,0.25)',borderRadius:16,padding:'20px 12px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center',justifyContent:'center',minHeight:140}}
          >
            <span style={{fontSize:30}}>📖</span>
            <div style={{fontSize:17,fontWeight:900,color:'#E5B700'}}>Biblioteca</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.35)'}}>Library</div>
          </div>

          <div
            onClick={()=>setShowTravel(true)}
            style={{background:'rgba(0,188,212,0.06)',border:'1.5px solid rgba(0,188,212,0.25)',borderRadius:16,padding:'20px 12px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center',justifyContent:'center',minHeight:140}}
          >
            <span style={{fontSize:30}}>✈️</span>
            <div style={{fontSize:17,fontWeight:900,color:'#00BCD4'}}>Esplora</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.35)'}}>Explore Italy</div>
            <div style={{fontSize:13,fontWeight:700,color:'rgba(0,188,212,0.7)'}}>🎫 {credits} cr</div>
          </div>

        </div>

      </div>

      {/* ── MODALS ── */}
      {showEdit && (
        <EditProfileModal
          avatar={avatar} nickname={nickname}
          onSave={(av,nick)=>{setAvatar(av);setNickname(nick);setShowEdit(false);}}
          onClose={()=>setShowEdit(false)}
        />
      )}

      {showTravel && (
        <ItalyTravelModal
          energy={energy}
          credits={credits}
          tickets={tickets}
          travelAccess={travelAccess}
          onClose={()=>setShowTravel(false)}
          onBuyTicket={(cityId,cost)=>{
            try {
              const raw = localStorage.getItem('italiano-progress');
              const d   = raw ? JSON.parse(raw) : {};
              if ((d.credits??0) < cost) return false;
              const upd = {...d, credits:d.credits-cost, tickets:{...(d.tickets??{}),[cityId]:true}};
              localStorage.setItem('italiano-progress', JSON.stringify(upd));
              return true;
            } catch { return false; }
          }}
        />
      )}

    </main>
  );
}
