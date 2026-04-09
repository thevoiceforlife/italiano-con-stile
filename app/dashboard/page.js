'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLevelData } from '../components/LevelBadge';
import { loadProgress } from '../components/saveProgress';
import ItalyTravelModal from '../components/ItalyTravelModal';

const DEFAULT_AVATARS = ['🍕','🤌','☕','🎵','🌊','🏺','🍋','👒'];
const DAY_KEYS_ARR   = ['lun','mar','mer','gio','ven','sab','dom'];
const DAY_IT         = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
const DAY_EN         = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

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
    return lv.nickPrefix + '_' + seed;
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
  const [av,   setAv]   = useState(avatar);
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
        <div style={{fontSize:16,fontWeight:900,color:'var(--text)',marginBottom:16}}>Modifica profilo / Edit profile</div>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',marginBottom:8}}>Avatar</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
          {DEFAULT_AVATARS.map(a=>(
            <button key={a} onClick={()=>setAv(a)} style={{fontSize:24,width:44,height:44,borderRadius:'50%',border:`2.5px solid ${a===av?'var(--primary)':'var(--border)'}`,background:a===av?'var(--opt-sel-bg)':'var(--card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{a}</button>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',marginBottom:8}}>Nickname (max 20)</div>
        <input value={nick} onChange={e=>setNick(e.target.value.slice(0,20))} style={{width:'100%',padding:'10px 12px',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:10,fontSize:14,color:'var(--text)',fontFamily:'inherit',outline:'none',marginBottom:18}} placeholder="es. Turista_1234" />
        <button onClick={save} style={{width:'100%',padding:13,borderRadius:12,border:'none',background:'var(--primary)',color:'white',fontSize:14,fontWeight:900,cursor:'pointer',fontFamily:'inherit',textTransform:'uppercase',letterSpacing:'0.6px',boxShadow:'0 4px 0 var(--primary-d)',marginBottom:10}}>Salva / Save</button>
        <button onClick={onClose} style={{width:'100%',padding:11,borderRadius:12,border:'1.5px solid var(--border)',background:'none',fontSize:13,fontWeight:800,color:'var(--text2)',cursor:'pointer',fontFamily:'inherit'}}>Annulla / Cancel</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [data,     setData]     = useState(null);
  const [avatar,   setAvatar]   = useState('🍕');
  const [nickname, setNickname] = useState('Turista_0000');
  const [levelId,  setLevelId]  = useState('A1');
  const [stats,    setStats]    = useState({lezioni:0,parole:0,accuracy:0,minuti:0});
  const [showEdit,   setShowEdit]   = useState(false);
  const [showTravel, setShowTravel] = useState(false);
  const [mounted,  setMounted]  = useState(false);

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
  const mete      = Object.keys(tickets).filter(k=>CITIES_META.find(c=>c.id===k&&c.cat==='mete')).length;
  const citta     = Object.keys(tickets).filter(k=>CITIES_META.find(c=>c.id===k&&c.cat==='citta')).length;
  const capitali  = Object.keys(tickets).filter(k=>CITIES_META.find(c=>c.id===k&&c.cat==='capitali')).length;
  const totVisited = mete+citta+capitali;
  const nextCost   = energy>=90?500:energy>=60?350:200;
  const creditPct  = Math.min((credits/nextCost)*100,100);
  const a1Pct      = Math.min(Math.round((completed.length/48)*100),100);
  // Stessi colori e label di XPBar (coerenza home ↔ dashboard)
  const eColor = energy > 100 ? '#E5B700'
    : energy >= 90 ? '#46A302'
    : energy >= 61 ? '#58CC02'
    : energy >= 36 ? '#1CB0F6'
    : energy >= 26 ? '#FF9600'
    : '#CC0000';
  const eLabel = energy > 100 ? 'Eccezionale! / Exceptional!'
    : energy >= 90 ? 'Caricato / Fully charged'
    : energy >= 61 ? 'In forma / In shape'
    : energy >= 36 ? 'Buono / Good'
    : energy >= 26 ? 'Quasi scarico / Running low'
    : 'Emergenza / Emergency';

  const C  = {background:'var(--card)',border:'1.5px solid var(--border)',borderRadius:16,padding:16};
  const lb = {fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em'};
  const mu = {fontSize:12,color:'var(--text3)'};
  const vl = {fontSize:24,fontWeight:900,color:'var(--text)'};
  const st = {fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10};
  const tr = {height:7,background:'var(--bg)',borderRadius:99,overflow:'hidden',marginTop:6};
  const dv = {height:1,background:'var(--border)',margin:'12px 0'};
  const fi = (w,c)=>({height:'100%',width:`${w}%`,background:c,borderRadius:99,transition:'width 0.7s'});

  return (
    <main className="page-wide" style={{minHeight:'100vh',background:'var(--bg)',paddingBottom:32}}>

      {/* Top bar */}
      <div style={{background:'var(--card)',borderBottom:'1.5px solid var(--border)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <button onClick={()=>router.push('/')} style={{background:'none',border:'none',color:'var(--primary)',fontSize:13,fontWeight:900,cursor:'pointer',fontFamily:'inherit'}}>← Home</button>
        <span style={{fontSize:13,fontWeight:900,color:'var(--text)'}}>Dashboard / Il mio profilo</span>
        <button onClick={()=>setShowEdit(true)} style={{background:'none',border:'1.5px solid var(--border)',borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:700,color:'var(--text2)',cursor:'pointer',fontFamily:'inherit'}}>✏️ Modifica / Edit</button>
      </div>

      <div style={{padding:16,display:'flex',flexDirection:'column',gap:14,maxWidth:480,margin:'0 auto'}}>

        {/* ── HUB NAVIGAZIONE ── */}
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:4}}>

          {/* Percorso — rettangolo grande */}
          <div
            onClick={()=>document.getElementById('section-percorso')?.scrollIntoView({behavior:'smooth'})}
            style={{background:'rgba(88,204,2,0.08)',border:'1.5px solid rgba(88,204,2,0.3)',borderRadius:16,padding:'18px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:14}}
          >
            <span style={{fontSize:36,flexShrink:0}}>🗺️</span>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:'#58cc02'}}>Il tuo percorso</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>Your learning path</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',marginTop:3}}>A1 · {completed.length} lezioni completate</div>
            </div>
          </div>

          {/* Biblioteca + Esplora — quadrati uguali */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div
              onClick={()=>router.push('/biblioteca')}
              style={{background:'rgba(229,183,0,0.06)',border:'1.5px solid rgba(229,183,0,0.25)',borderRadius:16,padding:'18px 12px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center',aspectRatio:'1',justifyContent:'center'}}
            >
              <span style={{fontSize:32}}>📖</span>
              <div style={{fontSize:14,fontWeight:900,color:'#E5B700'}}>Biblioteca</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>Library</div>
            </div>
            <div
              onClick={()=>document.getElementById('section-viaggi')?.scrollIntoView({behavior:'smooth'})}
              style={{background:'rgba(0,188,212,0.06)',border:'1.5px solid rgba(0,188,212,0.25)',borderRadius:16,padding:'18px 12px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center',aspectRatio:'1',justifyContent:'center'}}
            >
              <span style={{fontSize:32}}>✈️</span>
              <div style={{fontSize:14,fontWeight:900,color:'#00BCD4'}}>Esplora</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>Explore Italy</div>
            </div>
          </div>
        </div>

        {/* ── 1. PROFILO ── */}
        <div style={C}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
            <div style={{width:58,height:58,borderRadius:'50%',border:`3px solid ${lv.color}`,background:lv.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{avatar}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:900,color:'var(--text)',marginBottom:4}}>{nickname}</div>
              <span style={{display:'inline-flex',alignItems:'center',gap:5,background:lv.bg,color:lv.color,padding:'3px 10px',borderRadius:99,fontSize:12,fontWeight:700}}>
                {lv.emoji} {lv.id} · {lv.itLabel} / {lv.enLabel}
              </span>
              <div style={{fontSize:11,color:'var(--text3)',marginTop:4,fontStyle:'italic'}}>{lv.momento}</div>
            </div>
          </div>
          <div style={{background:lv.bg,border:`1px solid ${lv.color}33`,borderRadius:10,padding:'10px 13px',marginBottom:12}}>
            <div style={{fontSize:12,color:lv.color,fontStyle:'italic',lineHeight:1.5}}>"{lv.frase}"</div>
            <div style={{fontSize:11,color:lv.color,opacity:0.75,fontStyle:'italic',marginTop:3}}>"{lv.fraseEN}"</div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={mu}>Progresso {lv.id} / {lv.id} progress</span>
            <span style={mu}>{a1Pct}% · {completed.length}/48 lezioni</span>
          </div>
          <div style={tr}><div style={fi(a1Pct,lv.color)}/></div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12,flexWrap:'wrap'}}>
            <span style={{background:'#FAEEDA',color:'#854F0B',padding:'3px 10px',borderRadius:99,fontSize:12,fontWeight:700}}>🔥 {activeDays.length} giorni / days</span>
            <span style={{background:'var(--bg)',color:'var(--text3)',padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:700}}>record: {data?.streakRecord ?? activeDays.length}</span>
          </div>
        </div>

        {/* ── 2. BOX ENERGIA ── */}
        <div style={C}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
            <div>
              <div style={lb}>energia / energy</div>
              <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:4}}>
                <span style={vl}>{Math.round(energy)}%</span>
                <span style={{fontSize:13,fontWeight:700,color:eColor}}>{eLabel}</span>
              </div>
            </div>
            <span style={{fontSize:32}}>{energy>100?'⚡':energy>=60?'🔋':energy>=25?'🔋':'🪫'}</span>
          </div>
          <div style={tr}><div style={fi(Math.min(energy,100),eColor)}/></div>
          {energy>100 && <div style={{...tr,marginTop:4}}><div style={fi(Math.min(energy-100,100),'#E5B700')}/></div>}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
            {[{p:25,l:'Mete'},{p:60,l:'Città'},{p:90,l:'Capitali'}].map(({p,l})=>(
              <span key={p} style={{fontSize:9,fontWeight:700,color:energy>=p?eColor:'var(--text3)'}}>▸ {p}% {l}</span>
            ))}
          </div>
          {energy<=25 && (
            <div style={{marginTop:10,background:'var(--err-bar)',border:'1px solid #FF4B4B44',borderRadius:8,padding:'7px 11px',fontSize:11,color:'var(--err-text)',textAlign:'center'}}>
              ⚠️ Energia bassa — completa una lezione / Complete a lesson to recharge
            </div>
          )}
        </div>

        {/* ── 3. BOX STREAK ── */}
        <div style={C}>
          <div style={st}>🔥 streak settimanale / weekly streak</div>
          <div style={{display:'flex',gap:3,justifyContent:'space-between'}}>
            {DAY_KEYS_ARR.map((key,i)=>{
              const done=activeDays.includes(key), isToday=i===todayIdx;
              return (
                <div key={key} style={{textAlign:'center',flex:1}}>
                  <div style={{height:28,borderRadius:7,background:done?'#FF960022':'var(--bg)',border:isToday?`2px solid ${done?'#FF9600':'#E5B700'}`:`1.5px solid ${done?'#FF9600':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:done?13:7,boxShadow:isToday?`0 0 8px ${done?'#FF960066':'#E5B70066'}`:'none',transition:'all 0.3s'}}>
                    {done?'✅':'·'}
                  </div>
                  <div style={{fontSize:9,marginTop:3,fontWeight:700,color:isToday?'#E5B700':'var(--text3)',lineHeight:1.3}}>
                    {DAY_IT[i]}<br/>{DAY_EN[i]}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
            <span style={mu}>giorno attivo = ≥2 lezioni / active day = ≥2 lessons</span>
            <span style={{fontSize:11,fontWeight:700,color:'#E5B700'}}>Dom/Sun: +30 cr ⚡</span>
          </div>
        </div>

        {/* ── 4. BOX CREDITI + VIAGGI ── */}
        <div style={C}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <div style={lb}>crediti / credits</div>
              <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:4}}>
                <span style={vl}>{credits}</span>
                <span style={{fontSize:22}}>🎫</span>
              </div>
              <div style={mu}>prossima città / next city: {nextCost} cr</div>
            </div>
            <button onClick={()=>setShowTravel(true)} style={{background:'linear-gradient(135deg,#005F8A,#00A8D0)',color:'white',border:'none',borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 2px 12px #00A8D044'}}>
              🇮🇹 Viaggia / Travel
            </button>
          </div>
          <div style={tr}><div style={fi(creditPct,'#378ADD')}/></div>

          <div style={dv}/>

          <div style={st}>🇮🇹 luoghi visitati / places visited</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginBottom:12}}>
            {[
              {icon:'🏛️',cat:'Capitali', catEN:'Capitals',    minE:90, visited:capitali,tot:20, color:'#E91E8C', neon:'#E91E8C33', pill:'#E91E8C22'},
              {icon:'🏙️',cat:'Città',    catEN:'Cities',      minE:60, visited:citta,   tot:80, color:'#E67E22', neon:'#E67E2233', pill:'#E67E2222'},
              {icon:'🗺️',cat:'Mete',     catEN:'Destinations',minE:25, visited:mete,    tot:45, color:'#00BCD4', neon:'#00BCD433', pill:'#00BCD422'},
            ].map(({icon,cat,catEN,minE,visited,tot,color,neon,pill})=>{
              const unlocked = energy>=minE;
              return (
                <div key={cat} style={{borderRadius:10,padding:'10px 6px',textAlign:'center',background:'var(--card)',
                  border:`1.5px solid ${unlocked?color:'var(--border)'}`,
                  boxShadow:unlocked?`0 0 10px ${neon}`:'none',
                  opacity:unlocked?1:0.5}}>
                  <div style={{fontSize:18,marginBottom:3}}>{icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:1}}>{cat}</div>
                  <div style={{fontSize:9,color:'var(--text3)',marginBottom:4}}>{catEN}</div>
                  <div style={{fontSize:15,fontWeight:900,color:unlocked?color:'var(--text3)'}}>{visited}/{tot}</div>
                  <div style={{display:'flex',gap:2,justifyContent:'center',marginTop:4,flexWrap:'wrap'}}>
                    {Array.from({length:Math.min(tot,8)},(_,i)=>(
                      <div key={i} style={{width:6,height:6,borderRadius:'50%',background:i<visited?color:'var(--border)'}}/>
                    ))}
                  </div>
                  <div style={{display:'inline-block',padding:'2px 6px',borderRadius:99,fontSize:9,fontWeight:700,marginTop:5,
                    background:unlocked?pill:'var(--bg)',color:unlocked?color:'var(--text3)'}}>
                    {unlocked?`✓ aperto / open`:`🔒 ≥${minE}% ⚡`}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{paddingTop:8,borderTop:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={mu}>Totale visitati / Total visited</span>
            <span style={{fontSize:14,fontWeight:900,color:'var(--text)'}}>{totVisited} / 145 destinazioni</span>
          </div>
        </div>

        {/* ── 5. STATISTICHE ── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8}}>
          {[
            {l:'lezioni\nlessons',     v:stats.lezioni},
            {l:'parole\nwords',        v:stats.parole},
            {l:'accuratezza\naccuracy',v:stats.accuracy+'%'},
            {l:'minuti\nminutes',      v:stats.minuti},
          ].map(({l,v})=>(
            <div key={l} style={{...C,padding:'10px 8px'}}>
              <div style={{fontSize:9,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',whiteSpace:'pre-line',lineHeight:1.4,marginBottom:4}}>{l}</div>
              <div style={{fontSize:20,fontWeight:900,color:'var(--text)'}}>{v}</div>
            </div>
          ))}
        </div>

        {/* ── 6. PERCORSO ── */}
        <div style={C}>
          <div style={st}>percorso {lv.id} / learning path {lv.id}</div>
          {[
            {n:1,titleIT:'Il primo giorno a Napoli',titleEN:'First day in Naples',  lessons:[1,2,3,4],comingSoon:false},
            {n:2,titleIT:'Fare conoscenza',         titleEN:'Making friends',        lessons:[],       comingSoon:true},
            {n:3,titleIT:'La giornata napoletana',  titleEN:'Daily Neapolitan life', lessons:[],       comingSoon:true},
          ].map(({n,titleIT,titleEN,lessons,comingSoon},ri,arr)=>{
            const lessDone = lessons.length>0 && lessons.every(id=>completed.includes(id));
            const bossDone = completed.includes('boss');
            const done     = lessDone && bossDone && n===1;
            const active   = !comingSoon && !done && n===1;
            const pct      = lessons.length>0 ? Math.round((lessons.filter(id=>completed.includes(id)).length/lessons.length)*100) : 0;
            return (
              <div key={n}
                onClick={active ? ()=>router.push('/') : undefined}
                style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',
                  borderBottom:ri<arr.length-1?'1px solid var(--border)':'none',
                  cursor:active?'pointer':'default',
                }}>
                <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                  background:done?'#EAF3DE':active?'#E6F1FB':'var(--bg)',
                  border:done?'2px solid #46A302':active?'2px solid #378ADD':'1.5px solid var(--border)',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>
                  {done?'✅':comingSoon||!active?'🔒':n}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:800,color:done?'#46A302':active?'var(--text)':'var(--text3)',marginBottom:2}}>
                    {'Unità '+n+' — '+titleIT}
                  </div>
                  <div style={{fontSize:11,color:'var(--text3)',marginBottom:3}}>
                    {'Unit '+n+' — '+titleEN+(comingSoon?' · in arrivo / coming soon':'')}
                  </div>
                  {!comingSoon && <div style={tr}><div style={fi(pct,done?'#639922':'#378ADD')}/></div>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                  <span style={{padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:700,
                    background:done?'#EAF3DE':comingSoon?'var(--bg)':active?'#E6F1FB':'var(--bg)',
                    color:done?'#3B6D11':comingSoon?'var(--text3)':active?'#185FA5':'var(--text3)'}}>
                    {done?'fatto / done':comingSoon?'🔒 in arrivo':active?'in corso / active':'🔒 bloccato'}
                  </span>
                  {active && <span style={{fontSize:16,color:'#378ADD',fontWeight:900}}>→</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 7. RACCOMANDAZIONI ── */}
        <div style={C}>
          <div style={st}>raccomandazioni / recommendations</div>
          {[

            {icon:'🔁',title:`Da ripassare / Review: ${Math.max(0,stats.parole-40)} parole / words`,sub:'Non le vedi da 7+ giorni / Not seen in 7+ days'},
            {icon:'📚',title:'Approfondisci / Study: essere vs avere',      sub:'Errori frequenti / Frequent mistakes → biblioteca'},
            {icon:'🏆',title:'Assessment A1 → A2',                       sub:`Disponibile dopo 12 unità / After 12 units · completate: ${Math.floor(completed.length/4)}`},
          ].map(({icon,title,sub,action},i,arr)=>(
            <div key={i} onClick={action} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:i<arr.length-1?'1px solid var(--border)':'none',cursor:action?'pointer':'default'}}>
              <div style={{width:30,height:30,borderRadius:8,flexShrink:0,background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>{icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:'var(--text)',marginBottom:2}}>{title}</div>
                <div style={mu}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

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
          travelAccess={energy>=90?'all':energy>=60?'citta':energy>=25?'mete':'none'}
          onClose={()=>setShowTravel(false)}
          onBuyTicket={(cityId,cost)=>{
            try {
              const raw  = localStorage.getItem('italiano-progress');
              const data = raw ? JSON.parse(raw) : {};
              if ((data.credits??0) < cost) return false;
              const upd = {...data, credits:data.credits-cost, tickets:{...(data.tickets??{}),[cityId]:true}};
              localStorage.setItem('italiano-progress', JSON.stringify(upd));
              return true;
            } catch { return false; }
          }}
        />
      )}
    
      {/* ── Biblioteca ── */}
      <div
        onClick={() => router.push('/biblioteca')}
        style={{
          background: "var(--card)", border: "1.5px solid var(--border)",
          borderRadius: "var(--r)", padding: "16px",
          cursor: "pointer", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 14,
          borderLeft: "3px solid #E5B700",
        }}
      >
        <span style={{ fontSize: 28 }}>📚</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text)", marginBottom: 2 }}>Biblioteca / Library</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Grammatica, vocabolario, falsi amici — Finally someone explains why.</div>
        </div>
        <span style={{ fontSize: 16, color: "var(--text3)" }}>›</span>
      </div>
    </main>
  );
}
