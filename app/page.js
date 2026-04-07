"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LessonButton from "./components/LessonButton";
import XPBar from "./components/XPBar";
import Logo from "./components/Logo";
import OnboardingModal from "./components/OnboardingModal";
import { parla, CHARACTERS as CHAR_VOICES } from "./components/CharacterBubble";
import { loadProgress } from "./components/saveProgress";
import { getLevelData } from "./components/LevelBadge";

// ─── Sprint 8: mini-game imports ──────────────────────────────────────────────
import MarioDialog  from "./components/games/MarioDialog";
import DiegoGesti   from "./components/games/DiegoGesti";
import SofiaSlang   from "./components/games/SofiaSlang";
import GinoStoria   from "./components/games/GinoStoria";
import MatildeEmail from "./components/games/MatildeEmail";

const STORAGE_KEY = "italiano-progress";

// ─── PERSONAGGI ───────────────────────────────────────────────────────────────
const CHARACTERS = [
  {
    id: "mario", name: "Mario", emoji: "☕", color: "#FF9B42",
    bubble: { it: "Sono Mario, il tuo barista. Ti accompagno in ogni lezione — dal primo caffè alla vita quotidiana italiana.", en: "I'm Mario, your barman. I'll guide you through every lesson — from your first espresso to everyday Italian life." },
    speakIT: "Sono Mario, il tuo barista. Ti accompagno in ogni lezione, dal primo caffè alla vita quotidiana italiana.",
    miniGame: "mario_dialog",
    miniGameLabel: "☕ Dialogo al bar",
    miniGameDesc:  "Parla con Mario in italiano — 5 turni di conversazione reale.",
  },
  {
    id: "sofia", name: "Sofia", emoji: "🎧", color: "#C8A0E8",
    bubble: { it: "Sono Sofia. Ti insegno lo slang, i social e come parlano davvero i giovani italiani. Veloce.", en: "I'm Sofia. I'll teach you slang, social media Italian, and how young Italians actually speak. Fast." },
    speakIT: "Sono Sofia. Ti insegno lo slang, i social e come parlano davvero i giovani italiani. Veloce.",
    miniGame: "speed_round",
    miniGameLabel: "🎧 Speed Round Slang",
    miniGameDesc:  "8 termini slang in 30 secondi — scegli il significato giusto.",
  },
  {
    id: "diego", name: "Diego", emoji: "🧢", color: "#22C55E",
    bubble: { it: "Io sono Diego! Ogni volta che fai bene, arrivo io! SIIII!", en: "I'm Diego! Every time you do well, I show up! YESSS!" },
    speakIT: "Io sono Diego! Ogni volta che fai bene, arrivo io! Siiiii!",
    miniGame: "flash_gesti",
    miniGameLabel: "🧢 Flash Gesti",
    miniGameDesc:  "10 gesti italiani in 60 secondi — li conosci tutti?",
  },
  {
    id: "gino", name: "Gino", emoji: "🎓", color: "#E5B700",
    bubble: { it: "Sono Gino, professore in pensione. Ti racconto la storia della lingua italiana.", en: "I'm Gino, a retired teacher. I'll tell you the story of the Italian language." },
    speakIT: "Sono Gino, professore di lettere in pensione. Ti racconto la storia della lingua italiana.",
    miniGame: "gesto_storia",
    miniGameLabel: "🎓 Gesto + Storia",
    miniGameDesc:  "Impara un gesto, poi leggi la storia vera in cui appare.",
  },
  {
    id: "matilde", name: "Matilde", emoji: "💼", color: "#1CB0F6",
    bubble: { it: "Sono Matilde. Business Italian, email formali, riunioni. Niente slang. Procediamo.", en: "I'm Matilde. Business Italian, formal emails, meetings. No slang. Let's proceed." },
    speakIT: "Sono Matilde. Business Italian, email formali, riunioni. Niente slang. Niente scuse. Procediamo.",
    miniGame: "email_challenge",
    miniGameLabel: "💼 Email Challenge",
    miniGameDesc:  "Scrivi un'email formale — Matilde la valuta con AI.",
  },
  {
    id: "vittoria", name: "Vittoria", emoji: "🍦", color: "#E5B700",
    bubble: { it: "Sono Nonna Vittoria. Se sbagli il congiuntivo, lo sento da qui. Ma se studi con il cuore, ti faccio il gelato.", en: "I'm Nonna Vittoria. I can hear a wrong subjunctive from miles away. But study with heart, and I'll make you gelato." },
    speakIT: "Sono Nonna Vittoria. Se sbagli il congiuntivo, lo sento da qui. Ma se studi con il cuore, ti faccio il gelato.",
    miniGame: "boss",
    miniGameLabel: "🍦 Sfida la Nonna",
    miniGameDesc:  "Boss challenge — in arrivo! / Coming soon!",
  },
];

const UNITS = [
  {
    id: 1,
    livello: "A1",
    titleIT: "Il primo giorno a Napoli",
    titleEN: "First day in Naples",
    lessons: [
      { id:1, emoji:"☕", titleIT:"Le Prime Parole",              titleEN:"The First Words",        subtitleIT:"Ciao, Grazie, Prego, Sì",                    subtitleEN:"Day 1 essentials" },
      { id:2, emoji:"🥐", titleIT:"Il Primo Caffè",               titleEN:"The First Coffee",       subtitleIT:"Ordina senza sembrare turista",               subtitleEN:"Order without looking like a tourist" },
      { id:3, emoji:"🍸", titleIT:"Mario dà le Indicazioni",      titleEN:"Mario Gives Directions", subtitleIT:"Preposizioni di luogo in contesto",           subtitleEN:"Prepositions of place in context" },
      { id:4, emoji:"🍕", titleIT:"La Cultura del Cibo",          titleEN:"The Culture of Food",    subtitleIT:"L'ordine dei piatti — sacro e intoccabile",   subtitleEN:"The order of courses — sacred" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma", subtitleIT:"5 domande — il gelato ti aspetta 🍦", subtitleEN:"5 questions — gelato awaits 🍦" },
  },
  {
    id: 2,
    titleIT: "Fare conoscenza",
    titleEN: "Making friends",
    lessons: [],
    comingSoon: true,
  },
  {
    id: 3,
    titleIT: "La giornata napoletana",
    titleEN: "Daily Neapolitan life",
    lessons: [],
    comingSoon: true,
  },
];

// ─── Suoni personaggi ─────────────────────────────────────────────────────────
function playCharacterSound(id) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (id === "mario")   [523,659,784].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine";o.frequency.value=f; g.gain.setValueAtTime(0,ctx.currentTime+i*0.13);g.gain.linearRampToValueAtTime(0.28,ctx.currentTime+i*0.13+0.05);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.13+0.35); o.start(ctx.currentTime+i*0.13);o.stop(ctx.currentTime+i*0.13+0.35); });
    if (id === "sofia")   [1200,1600].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="square";o.frequency.value=f; g.gain.setValueAtTime(0.15,ctx.currentTime+i*0.08);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.08+0.12); o.start(ctx.currentTime+i*0.08);o.stop(ctx.currentTime+i*0.08+0.12); });
    if (id === "diego")   [330,392,494,587,784].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="triangle";o.frequency.value=f; g.gain.setValueAtTime(0.22,ctx.currentTime+i*0.07);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.07+0.14); o.start(ctx.currentTime+i*0.07);o.stop(ctx.currentTime+i*0.07+0.14); });
    if (id === "gino")    [130,164,196].forEach((f)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine";o.frequency.value=f; g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(0.2,ctx.currentTime+0.15);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+1.0); o.start(ctx.currentTime);o.stop(ctx.currentTime+1.0); });
    if (id === "matilde") [880,1100].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sawtooth";o.frequency.value=f; g.gain.setValueAtTime(0.18,ctx.currentTime+i*0.15);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.15+0.08); o.start(ctx.currentTime+i*0.15);o.stop(ctx.currentTime+i*0.15+0.08); });
    if (id === "vittoria")[523,440,392,349].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.type="sine";o.frequency.value=f; const t=ctx.currentTime+i*0.22; g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.24,t+0.06);g.gain.exponentialRampToValueAtTime(0.001,t+0.55); o.start(t);o.stop(t+0.56); });
  } catch(e){}
}

// ─── Sprint 8: Mini-game launcher ────────────────────────────────────────────
// Render del mini-game giusto in base a c.miniGame
function MiniGameRouter({ character, onClose, onXP }) {
  const props = { onClose, onXP };
  switch (character.miniGame) {
    case "mario_dialog":   return <MarioDialog  {...props} />;
    case "speed_round":    return <SofiaSlang   {...props} />;
    case "flash_gesti":    return <DiegoGesti   {...props} />;
    case "gesto_storia":   return <GinoStoria   {...props} />;
    case "email_challenge":return <MatildeEmail {...props} />;
    // Vittoria boss → per ora bio (Sprint 9)
    default:               return null;
  }
}

// ─── Modal bio personaggio (long press) ──────────────────────────────────────
function CharacterModal({ c, onClose }) {
  const voice = CHAR_VOICES[c.id];
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"var(--card)",borderRadius:"20px",border:`3px solid ${c.color}`,boxShadow:`0 0 40px ${c.color}55`,padding:"32px 24px",maxWidth:"340px",width:"100%",textAlign:"center" }}>
        <div style={{ position:"relative",width:"110px",height:"110px",margin:"0 auto 16px" }}>
          <div style={{ width:"110px",height:"110px",borderRadius:"50%",border:`4px solid ${c.color}`,overflow:"hidden",background:"var(--bg)",boxShadow:`0 0 28px ${c.color}99` }}>
            <img src={`/images/${c.id}.png`} alt={c.name} style={{ width:"100%",height:"100%",objectFit:"cover" }} />
          </div>
          <span style={{ position:"absolute",bottom:"0px",right:"0px",fontSize:"28px",lineHeight:1 }}>{c.emoji}</span>
        </div>
        <div style={{ fontSize:"22px",fontWeight:900,color:c.color,marginBottom:"16px" }}>{c.name}</div>
        <p style={{ fontSize:"13px",fontWeight:800,color:"var(--text)",lineHeight:1.6,fontStyle:"italic",marginBottom:"10px" }}>"{c.bubble.it}"</p>
        <div style={{ height:"1px",background:"var(--border)",margin:"10px 0" }} />
        <p style={{ fontSize:"13px",fontWeight:700,color:"var(--text2)",lineHeight:1.6,fontStyle:"italic",marginBottom:"16px" }}>"{c.bubble.en}"</p>
        <div style={{ background:`${c.color}22`,border:`1px solid ${c.color}66`,borderRadius:"8px",padding:"8px 12px",marginBottom:"16px",fontSize:"12px",fontWeight:700,color:c.color }}>
          🎮 {c.miniGameLabel} — {c.miniGameDesc}
        </div>
        <button onClick={()=>parla(c.speakIT,voice,undefined,undefined)} style={{ background:c.color,color:"white",border:"none",borderRadius:"var(--r)",padding:"12px 28px",fontSize:"14px",fontWeight:900,cursor:"pointer",boxShadow:`0 4px 0 ${c.color}99`,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"12px",width:"100%" }}>
          🔊 Ascolta / Listen
        </button>
        <button onClick={onClose} style={{ background:"none",border:"2px solid var(--border)",borderRadius:"var(--r)",padding:"10px 28px",fontSize:"13px",fontWeight:800,color:"var(--text2)",cursor:"pointer",width:"100%",textTransform:"uppercase",letterSpacing:"0.6px" }}>
          Chiudi / Close
        </button>
      </div>
    </div>
  );
}

// ─── Card personaggio con tap (game) e long press (bio) ──────────────────────
function CharacterCard({ c, onTap, onLongPress }) {
  const [hovered, setHovered] = useState(false);
  const pressTimer            = useRef(null);
  const longPressed           = useRef(false);

  function handlePointerDown() {
    longPressed.current = false;
    pressTimer.current  = setTimeout(() => {
      longPressed.current = true;
      onLongPress();
    }, 600);
  }
  function handlePointerUp() {
    clearTimeout(pressTimer.current);
    if (!longPressed.current) onTap();
  }
  function handlePointerLeave() {
    clearTimeout(pressTimer.current);
  }

  return (
    <div
      style={{ textAlign:"center",flex:1,position:"relative",cursor:"pointer",userSelect:"none" }}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>{ setHovered(false); handlePointerLeave(); }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onContextMenu={e=>{ e.preventDefault(); onLongPress(); }}
    >
      <div style={{ position:"relative",width:"52px",height:"52px",margin:"0 auto 4px",transition:"transform 0.2s",transform:hovered?"scale(1.18)":"scale(1)" }}>
        <div style={{ width:"52px",height:"52px",borderRadius:"50%",border:`3px solid ${c.color}`,overflow:"hidden",background:"var(--card)",boxShadow:hovered?`0 0 18px ${c.color}CC,0 0 36px ${c.color}66`:"none",transition:"box-shadow 0.25s" }}>
          <img src={`/images/${c.id}.png`} alt={c.name} width={52} height={52} style={{ objectFit:"cover",width:"100%",height:"100%" }} />
        </div>
        <span style={{ position:"absolute",bottom:"-2px",right:"-4px",fontSize:"13px",lineHeight:1 }}>{c.emoji}</span>
      </div>
      <span style={{ fontSize:"10px",fontWeight:800,color:hovered?c.color:"var(--text2)",transition:"color 0.2s" }}>
        {c.name}
      </span>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [dashAvatar,   setDashAvatar]   = useState('🍕');
  const [dashNickname, setDashNickname] = useState('Il mio profilo');
  const [modalChar,      setModalChar]      = useState(null);   // long press → bio
  const [openUnit,       setOpenUnit]       = useState(1);        // unità aperta nell'accordion
  const [activeGame,     setActiveGame]     = useState(null);   // tap → game
  const [completed,      setCompleted]      = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted,        setMounted]        = useState(false);

  function refreshCompleted() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setCompleted(data.completed ?? []);
    } catch { setCompleted([]); }
  }

  useEffect(() => {
    const data = loadProgress();
    if (!data || !data.onboardingDone) setShowOnboarding(true);
    refreshCompleted();
    setMounted(true);
    window.addEventListener("focus", refreshCompleted);
    // Popola pill dashboard
    try {
      const av      = localStorage.getItem('italiano-avatar')    || '🍕';
      const nick    = localStorage.getItem('italiano-nickname');
      const seed    = localStorage.getItem('italiano-nick-seed') || '0000';
      const prog    = JSON.parse(localStorage.getItem('italiano-progress') || '{}');
      const levelId = prog.livello || 'A1';
      const lv      = getLevelData(levelId);
      setDashAvatar(av);
      setDashNickname(nick || (lv.nickPrefix + '_' + seed));
    } catch {}
    return () => window.removeEventListener("focus", refreshCompleted);
  }, []);

  // Aggiunge XP dopo il mini-game
  function handleGameXP(xp) {
    try {
      const raw  = localStorage.getItem('italiano-progress');
      const data = raw ? JSON.parse(raw) : {};
      const updated = { ...data, credits: (data.credits ?? 0) + xp };
      localStorage.setItem('italiano-progress', JSON.stringify(updated));
    } catch {}
  }

  function handleOnboardingComplete() {
    setShowOnboarding(false);
    refreshCompleted();
  }

  function isUnlocked(id) {
    if (id === 1)      return true;
    if (id === 2)      return completed.includes(1);
    if (id === 3)      return completed.includes(2);
    if (id === 4)      return completed.includes(3);
    if (id === "boss") return completed.includes(4);
    return false;
  }

  function isUnitUnlocked(unitId) {
    if (unitId === 1) return true;
    const prevUnit = UNITS.find(u => u.id === unitId - 1);
    if (!prevUnit) return false;
    return prevUnit.lessons.every(l => completed.includes(l.id)) && completed.includes("boss");
  }

  function isDone(id) { return completed.includes(id); }


  if (!mounted) return null;

  // Determina se l'utente ha già iniziato
  let hasProgress = false;
  try {
    const data = loadProgress();
    hasProgress = !!(data && data.onboardingDone);
  } catch {}

  // Prossima lezione da fare
  const allLessons = UNITS.flatMap(u => u.lessons.map(l => ({...l, unita: u.id, livello: u.livello || 'A1'})));
  const nextLesson = allLessons.find(l => isUnlocked(l.id) && !isDone(l.id));

  // ── LANDING (non autenticato) ──────────────────────────────────────────────
  if (!hasProgress) {
    return (
      <main className="full-bleed" style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
        {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

        {/* HERO */}
        <div style={{ position:"relative", height:"55vh", minHeight:280, overflow:"hidden" }}>
          <img
            src="/images/bar-di-mario.png"
            alt="Bar di Mario — Napoli"
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(13,31,45,0.05) 0%, rgba(13,31,45,0.6) 55%, rgba(13,31,45,1) 100%)" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"clamp(16px,4vw,40px)" }}>
            <div style={{ maxWidth:640, margin:"0 auto" }}>
              <div style={{ fontSize:"clamp(20px,4vw,32px)", fontWeight:900, color:"#fff", lineHeight:1.25, marginBottom:6 }}>
                Benvenuto al <span style={{ color:"#E5B700" }}>Bar di Mario</span>
                <br />
                <span style={{ fontSize:"clamp(14px,2.5vw,22px)", fontWeight:700, color:"rgba(255,255,255,0.7)" }}>
                  Welcome to <span style={{ color:"#E5B700" }}>Mario's Bar</span>
                </span>
              </div>
              <div style={{ fontSize:"clamp(12px,1.8vw,16px)", color:"rgba(255,255,255,0.55)", lineHeight:1.5 }}>
                Impara da Napoli. Parla ovunque. / Learn from Naples. Speak anywhere.
              </div>
            </div>
          </div>
        </div>

        {/* CONTENUTO */}
        <div style={{ flex:1, padding:"0 clamp(16px,5vw,48px)" }}>
          <div style={{ maxWidth:640, margin:"0 auto" }}>

            {/* PERSONAGGI */}
            <section style={{ padding:"24px 0 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>
                I tuoi compagni / Your companions
              </div>
              <div style={{ display:"flex", gap:"clamp(6px,2vw,16px)", justifyContent:"space-between" }}>
                {CHARACTERS.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { playCharacterSound(c.id); if (c.miniGame === "boss") { setModalChar(c); return; } setActiveGame(c); }}
                    onMouseEnter={e => e.currentTarget.querySelector('.char-glow').style.boxShadow = `0 0 18px ${c.color}CC`}
                    onMouseLeave={e => e.currentTarget.querySelector('.char-glow').style.boxShadow = 'none'}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer", flex:1 }}
                  >
                    <div
                      className="char-glow"
                      style={{ width:"clamp(44px,8vw,64px)", height:"clamp(44px,8vw,64px)", borderRadius:"50%", border:`2px solid ${c.color}`, background:"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", transition:"box-shadow 0.2s" }}
                    >
                      <img src={`/images/${c.id}.png`} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML += `<span style="font-size:22px">${c.emoji}</span>`; }} />
                    </div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textAlign:"center" }}>{c.name}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* COME FUNZIONA */}
            <section style={{ padding:"20px 0" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:16 }}>
                Come funziona / How it works
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:16 }}>
                {[
                  { icon:"📖", it:"Impara", en:"Learn", sub:"Lezioni brevi / Short lessons" },
                  { icon:"⚡", it:"Energia", en:"Energy", sub:"Cibo napoletano / Neapolitan food" },
                  { icon:"🗺️", it:"Esplora", en:"Explore", sub:"Tutta Italia / All of Italy" },
                ].map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", flex:1 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flex:1, textAlign:"center" }}>
                      <span style={{ fontSize:"clamp(24px,4vw,36px)" }}>{s.icon}</span>
                      <div style={{ fontSize:"clamp(11px,1.5vw,14px)", fontWeight:700, color:"#fff" }}>{s.it}<br /><span style={{ color:"rgba(255,255,255,0.4)", fontWeight:400 }}>{s.en}</span></div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", lineHeight:1.3 }}>{s.sub}</div>
                    </div>
                    {i < 2 && <div style={{ fontSize:16, color:"rgba(255,255,255,0.2)", flexShrink:0, paddingBottom:16 }}>→</div>}
                  </div>
                ))}
              </div>

              {/* BARRA ENERGIA CON CIBO */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"12px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:8 }}>
                  <span>Energia / Energy</span>
                  <span style={{ color:"#E5B700" }}>Guadagnata con il cibo / Earned with food</span>
                </div>
                <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden", marginBottom:8 }}>
                  <div style={{ height:"100%", width:"20%", background:"#E5B700", borderRadius:4 }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  {["☕","🥐","🍹","🍕","🍦"].map((e, i) => (
                    <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                      <span style={{ fontSize:"clamp(14px,2vw,20px)" }}>{e}</span>
                      <div style={{ width:6, height:6, borderRadius:"50%", background: i===0 ? "#E5B700" : "rgba(255,255,255,0.15)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* TAGLINE + CTA */}
            <section style={{ padding:"16px 0 32px", textAlign:"center" }}>
              <div style={{ fontSize:"clamp(16px,2.5vw,22px)", fontWeight:900, color:"#fff", marginBottom:4 }}>
                L'italiano inizia qui.
              </div>
              <div style={{ fontSize:"clamp(12px,1.5vw,16px)", color:"rgba(255,255,255,0.4)", marginBottom:24 }}>
                Italian starts here.
              </div>
              <button
                onClick={() => setShowOnboarding(true)}
                style={{ width:"100%", maxWidth:400, padding:"16px 24px", background:"#E5B700", color:"#0d1f2d", border:"none", borderRadius:14, fontSize:"clamp(14px,2vw,16px)", fontWeight:900, cursor:"pointer", fontFamily:"inherit" }}
              >
                Siediti al bar / Take a seat →
              </button>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:10 }}>
                Gratis · Nessuna carta / Free · No credit card
              </div>
            </section>

          </div>
        </div>

        {/* MODALS */}
        {modalChar && <CharacterModal c={modalChar} onClose={() => { window.speechSynthesis?.cancel(); setModalChar(null); }} />}
        {activeGame && <MiniGameRouter character={activeGame} onClose={() => setActiveGame(null)} onXP={(xp) => { handleGameXP(xp); refreshCompleted(); }} />}
      </main>
    );
  }

  // ── HOME AUTENTICATA ───────────────────────────────────────────────────────
  const lessonDone = nextLesson ? isDone(nextLesson.id) : false;
  const isFirstLesson = nextLesson && nextLesson.id === 1 && !isDone(1);
  const ctaLabel = isFirstLesson ? "Inizia / Start →" : "Continua / Continue →";
  const ctaLabelTop = isFirstLesson ? "Lezione 1 / Lesson 1" : `Lezione ${nextLesson ? nextLesson.id : ''} / Lesson ${nextLesson ? nextLesson.id : ''}`;

  return (
    <main className="full-bleed" style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* TOP BAR */}
      <header style={{ padding:"10px clamp(16px,5vw,48px)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <Logo />
        <button
          onClick={() => router.push('/dashboard')}
          style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:50, padding:"5px 14px 5px 5px", cursor:"pointer", fontFamily:"inherit" }}
        >
          <div style={{ width:"clamp(44px,6vw,56px)", height:"clamp(44px,6vw,56px)", borderRadius:"50%", border:"2.5px solid #E5B700", background:"rgba(229,183,0,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(20px,3vw,28px)", flexShrink:0, overflow:"hidden" }}>
            {dashAvatar}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{dashNickname}</span>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Dashboard →</span>
          </div>
        </button>
      </header>

      {/* CONTENUTO */}
      <div style={{ flex:1, padding:"24px clamp(16px,5vw,48px)" }}>
        <div style={{ maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:28 }}>

          {/* PERSONAGGI */}
          <section>
            <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>
              I tuoi compagni / Your companions
            </div>
            <div style={{ display:"flex", gap:"clamp(6px,2vw,16px)", justifyContent:"space-between" }}>
              {CHARACTERS.map(c => (
                <div
                  key={c.id}
                  onClick={() => { playCharacterSound(c.id); if (c.miniGame === "boss") { setModalChar(c); return; } setActiveGame(c); }}
                  onMouseEnter={e => e.currentTarget.querySelector('.char-glow').style.boxShadow = `0 0 18px ${c.color}CC`}
                  onMouseLeave={e => e.currentTarget.querySelector('.char-glow').style.boxShadow = 'none'}
                  style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer", flex:1 }}
                >
                  <div
                    className="char-glow"
                    style={{ width:"clamp(44px,8vw,64px)", height:"clamp(44px,8vw,64px)", borderRadius:"50%", border:`2px solid ${c.color}`, background:"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", transition:"box-shadow 0.2s" }}
                  >
                    <img src={`/images/${c.id}.png`} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML += `<span style="font-size:22px">${c.emoji}</span>`; }} />
                  </div>
                  <div style={{ fontSize:10, color:"var(--text3)", textAlign:"center" }}>{c.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* PROSSIMA LEZIONE */}
          {nextLesson && (
            <section style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.8px" }}>
                {isFirstLesson ? "Prima lezione / First lesson" : "In corso / Current lesson"}
              </div>

              {/* FRAME LEZIONE UNIFICATO */}
              <div className="frame-glow" style={{ border:"1.5px solid #27AE60", borderRadius:16, overflow:"hidden" }}>
                <div style={{ background:"rgba(39,174,96,0.05)", padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", border:"2px solid #FF9B42", background:"rgba(255,155,66,0.15)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                    <img src="/images/mario.png" alt="Mario" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="font-size:22px">🧑</span>'; }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#27AE60", marginBottom:2 }}>
                      {ctaLabelTop}
                    </div>
                    <div style={{ fontSize:14, fontWeight:900, color:"var(--text)", marginBottom:3 }}>
                      {nextLesson.titleIT} / {nextLesson.titleEN}
                    </div>
                    <div style={{ fontSize:11, color:"var(--text3)" }}>
                      Unità {nextLesson.unita} / Unit {nextLesson.unita} · {nextLesson.livello} · ~5 min
                    </div>
                  </div>
                </div>
                <div style={{ height:"1px", background:"rgba(39,174,96,0.2)" }} />
                <button
                  className="btn-breathe"
                  onClick={() => router.push(`/lesson/${nextLesson.livello}/${nextLesson.unita}/${nextLesson.id}`)}
                  style={{ width:"100%", padding:"16px", background:"#27AE60", color:"#fff", border:"none", fontSize:16, fontWeight:900, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.5px" }}
                >
                  {ctaLabel}
                </button>
              </div>

              {/* PULSANTE PERCORSO */}
              <button
                onClick={() => router.push('/dashboard')}
                style={{ width:"100%", padding:"14px", background:"rgba(0,188,212,0.08)", color:"#00BCD4", border:"1.5px solid #00BCD4", borderRadius:14, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
              >
                Il tuo percorso / Your learning path →
              </button>
            </section>
          )}

        </div>
      </div>

      {/* MODALS */}
      {modalChar && <CharacterModal c={modalChar} onClose={() => { window.speechSynthesis?.cancel(); setModalChar(null); }} />}
      {activeGame && <MiniGameRouter character={activeGame} onClose={() => setActiveGame(null)} onXP={(xp) => { handleGameXP(xp); refreshCompleted(); }} />}
    </main>
  );
}
