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

  return (
    <main className="page-narrow" style={{ minHeight:"100vh",background:"var(--bg)",padding:"24px 16px" }}>

      {showOnboarding && mounted && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <header style={{ marginBottom:"24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Logo />
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3,
            background:"var(--card)", border:"1.5px solid var(--border)",
            borderRadius:14, padding:"7px 12px",
            cursor:"pointer", fontFamily:"inherit",
          }}
        >
          <span style={{ fontSize:10, fontWeight:900, color:"var(--primary)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Dashboard</span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{
              width:24, height:24, borderRadius:"50%",
              border:"2px solid var(--primary)",
              background:"var(--opt-sel-bg)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, lineHeight:1, flexShrink:0,
            }}>{dashAvatar}</div>
            <span style={{ fontSize:12, fontWeight:700, color:"var(--text)" }}>{dashNickname}</span>
            <span style={{ fontSize:11, color:"var(--text3)" }}>→</span>
          </div>
        </button>

      </header>

      <XPBar />



      {/* ── Bio modal (long press) ── */}
      {modalChar && (
        <CharacterModal c={modalChar} onClose={()=>{ window.speechSynthesis?.cancel(); setModalChar(null); }} />
      )}

      {/* ── Mini-game (tap) ── */}
      {activeGame && (
        <MiniGameRouter
          character={activeGame}
          onClose={() => setActiveGame(null)}
          onXP={(xp) => { handleGameXP(xp); refreshCompleted(); }}
        />
      )}

      {/* ── PERSONAGGI ── */}
      <section style={{ marginBottom:"28px" }}>
        <h2 style={{ fontSize:"13px",fontWeight:900,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"4px" }}>
          I tuoi compagni / Your companions
        </h2>
        <p style={{ fontSize:"11px",color:"var(--text3)",marginBottom:"12px" }}>
          Tap → mini-game · Tieni premuto / Hold → bio
        </p>
        <div style={{ display:"flex",gap:"6px",justifyContent:"space-between" }}>
          {CHARACTERS.map(c => (
            <CharacterCard
              key={c.id}
              c={c}
              onTap={() => {
                playCharacterSound(c.id);
                // Vittoria non ha ancora un game → apre bio
                if (c.miniGame === "boss") { setModalChar(c); return; }
                setActiveGame(c);
              }}
              onLongPress={() => {
                playCharacterSound(c.id);
                setModalChar(c);
              }}
            />
          ))}
        </div>
      </section>

      {/* ── PERCORSO / LEARNING PATH ── */}
      <section style={{ marginBottom:"28px" }}>
        <h2 style={{ fontSize:"13px",fontWeight:900,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"4px" }}>
          🗺️ Percorso A1 / Learning path A1
        </h2>
        <p style={{ fontSize:"11px",color:"var(--text3)",marginBottom:"12px" }}>
          🧳 Il Turista / The Tourist — Napoli e dintorni
        </p>
        <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
          {UNITS.map(unit => {
            const isOpen     = openUnit === unit.id;
            const unitDone   = unit.lessons.length > 0 && unit.lessons.every(l => isDone(l.id));
            const unitActive = !unit.comingSoon && unit.lessons.some(l => isUnlocked(l.id));
            const unitLocked = unit.comingSoon || (!unitDone && !unitActive);
            return (
              <div key={unit.id} style={{
                background:"var(--card)",
                borderRadius:"var(--r)",
                overflow:"hidden",
                opacity: unitLocked ? 0.45 : 1,
                transition:"opacity 0.3s",
                border:"0.5px solid var(--border)",
                borderLeft:`4px solid ${unitDone?"#639922":unitActive?"#378ADD":"var(--border)"}`,
              }}>
                {/* Header unità — Proposta B+A */}
                <div
                  onClick={() => !unitLocked && setOpenUnit(isOpen ? null : unit.id)}
                  style={{
                    display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",
                    cursor: unitLocked ? "default" : "pointer",
                    background: "transparent",
                  }}
                >
                  {/* Cerchio numero — Proposta B */}
                  <div style={{
                    width:36,height:36,borderRadius:"50%",flexShrink:0,
                    background:unitDone?"#639922":unitActive?"#378ADD":"var(--bg)",
                    border: unitLocked?"1.5px solid var(--border)":"none",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:unitDone?16:14,color:"white",fontWeight:900,
                  }}>
                    {unitDone?"✓":unitLocked?"🔒":unit.id}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15,fontWeight:900,color:"var(--text)",letterSpacing:"0.02em" }}>
                      Unità {unit.id} — {unit.titleIT}
                    </div>
                    <div style={{ fontSize:12,color:"var(--text2)",marginTop:2,letterSpacing:"0.01em" }}>
                      Unit {unit.id} — {unit.titleEN}
                      {unit.comingSoon && " · in arrivo / coming soon"}
                    </div>
                    {/* Progress bar — Proposta B */}
                    {!unit.comingSoon && (
                      <div style={{ height:3,background:unitDone?"#C0DD97":unitActive?"#B5D4F4":"var(--border)",borderRadius:99,marginTop:6,overflow:"hidden" }}>
                        <div style={{
                          height:"100%",borderRadius:99,
                          background:unitDone?"#639922":"#378ADD",
                          width:`${unit.lessons.length>0?Math.round((unit.lessons.filter(l=>isDone(l.id)).length/unit.lessons.length)*100):0}%`,
                          transition:"width 0.5s",
                        }}/>
                      </div>
                    )}
                  </div>
                  {!unitLocked && (
                    <span style={{ fontSize:12,color:unitDone?"#639922":unitActive?"#378ADD":"var(--text3)",transition:"transform 0.2s",transform:isOpen?"rotate(180deg)":"none",flexShrink:0 }}>▾</span>
                  )}
                </div>

                {/* Lezioni */}
                {isOpen && !unit.comingSoon && (
                  <div style={{ borderTop:"1px solid var(--border)" }}>
                    {unit.lessons.map((lesson, li) => {
                      const unlocked = isUnlocked(lesson.id);
                      const done     = isDone(lesson.id);
                      return (
                        <div key={lesson.id} style={{
                          display:"flex",alignItems:"center",gap:"10px",
                          padding:"10px 14px",
                          borderBottom:"1.5px dashed #B4B2A966",
                          background: done?"#46A30208":"transparent",
                        }}>
                          {/* Cerchio emoji alimento — NO lucchetto a sinistra */}
                          <div style={{
                            width:30,height:30,borderRadius:"50%",flexShrink:0,
                            background: done?"#EAF3DE":unlocked?"#E6F1FB":"var(--bg)",
                            border:`1.5px solid ${done?"#639922":unlocked?"#378ADD":"var(--border)"}`,
                            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
                          }}>
                            {lesson.emoji}
                          </div>
                          <div style={{ flex:1, opacity: unlocked||done ? 1 : 0.4 }}>
                            <div style={{ fontSize:12,fontWeight:800,color:done?"#27500A":unlocked?"var(--text)":"var(--text3)" }}>
                              Lezione {li+1} · {lesson.titleIT} / {lesson.titleEN}
                            </div>
                            <div style={{ fontSize:11,color:"var(--text3)",marginTop:1 }}>
                              {lesson.subtitleIT}
                            </div>
                          </div>
                          {done && (
                            <span style={{ fontSize:11,fontWeight:700,color:"#3B6D11",padding:"3px 8px",borderRadius:99,background:"#EAF3DE",flexShrink:0 }}>✓ rivedi</span>
                          )}
                          {unlocked && !done && <LessonButton livello={unit.livello || "A1"} unita={unit.id} lezione={lesson.id} />}
                          {!unlocked && <span style={{ fontSize:16,color:"var(--text3)",flexShrink:0 }}>🔒</span>}
                        </div>
                      );
                    })}
                    {/* Boss — separatore tratteggiato dorato */}
                    {unit.boss && (() => {
                      const bossUnlocked = isUnlocked("boss");
                      const bossDone     = isDone("boss");
                      return (
                        <div style={{
                          display:"flex",alignItems:"center",gap:"10px",
                          padding:"11px 14px",
                          background: bossUnlocked?"#1a120844":"transparent",
                          borderTop:"1.5px dashed #E5B700AA",
                        }}>
                          <div style={{
                            width:30,height:30,borderRadius:"50%",flexShrink:0,
                            background: bossDone?"#E5B700":bossUnlocked?"#E5B70022":"var(--bg)",
                            border:`1.5px solid ${bossUnlocked?"#E5B700":"var(--border)"}`,
                            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
                          }}>
                            {bossDone ? "✅" : "🍦"}
                          </div>
                          <div style={{ flex:1, opacity: bossUnlocked ? 1 : 0.45 }}>
                            <div style={{ fontSize:13,fontWeight:900,color:bossDone?"#E5B700":bossUnlocked?"#E5B700":"var(--text3)" }}>
                              ⚡ {unit.boss.titleIT} / {unit.boss.titleEN}
                            </div>
                            <div style={{ fontSize:11,color:"var(--text3)",marginTop:1 }}>
                              {unit.boss.subtitleIT}
                            </div>
                          </div>
                          {bossDone && <span style={{ fontSize:11,fontWeight:700,color:"#E5B700",padding:"3px 8px",borderRadius:99,background:"#E5B70022",flexShrink:0 }}>✓ rivedi</span>}
                          {bossUnlocked && !bossDone && <LessonButton livello={unit.livello || "A1"} unita={unit.id} lezione="boss" />}
                          {!bossUnlocked && !bossDone && <span style={{ fontSize:16,color:"var(--text3)",flexShrink:0 }}>🔒</span>}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
}
