"use client";
import { useState, useEffect, useRef } from "react";
import LessonButton from "./components/LessonButton";
import XPBar from "./components/XPBar";
import Logo from "./components/Logo";
import OnboardingModal from "./components/OnboardingModal";
import { parla, CHARACTERS as CHAR_VOICES } from "./components/CharacterBubble";
import { loadProgress } from "./components/saveProgress";

const STORAGE_KEY = "italiano-progress";

// ─── PERSONAGGI ───────────────────────────────────────────────────────────────
const CHARACTERS = [
  {
    id: "mario", name: "Mario", emoji: "☕", color: "#FF9B42",
    bubble: { it: "Sono Mario, il tuo barista. Ti accompagno in ogni lezione — dal primo caffè alla vita quotidiana italiana.", en: "I'm Mario, your barman. I'll guide you through every lesson — from your first espresso to everyday Italian life." },
    speakIT: "Sono Mario, il tuo barista. Ti accompagno in ogni lezione, dal primo caffè alla vita quotidiana italiana.",
    miniGame: "mario_bar",
    miniGameLabel: "☕ Cosa dice il cliente?",
  },
  {
    id: "sofia", name: "Sofia", emoji: "🎧", color: "#C8A0E8",
    bubble: { it: "Sono Sofia. Ti insegno lo slang, i social e come parlano davvero i giovani italiani. Veloce.", en: "I'm Sofia. I'll teach you slang, social media Italian, and how young Italians actually speak. Fast." },
    speakIT: "Sono Sofia. Ti insegno lo slang, i social e come parlano davvero i giovani italiani. Veloce.",
    miniGame: "speed_round",
    miniGameLabel: "🎧 Speed Round",
  },
  {
    id: "diego", name: "Diego", emoji: "🧢", color: "#22C55E",
    bubble: { it: "Io sono Diego! Ogni volta che fai bene, arrivo io! SIIII!", en: "I'm Diego! Every time you do well, I show up! YESSS!" },
    speakIT: "Io sono Diego! Ogni volta che fai bene, arrivo io! Siiiii!",
    miniGame: "flash_gesti",
    miniGameLabel: "🧢 Flash Gesti",
  },
  {
    id: "gino", name: "Gino", emoji: "🎓", color: "#E5B700",
    bubble: { it: "Sono Gino, professore in pensione. Ti racconto la storia della lingua italiana.", en: "I'm Gino, a retired teacher. I'll tell you the story of the Italian language." },
    speakIT: "Sono Gino, professore di lettere in pensione. Ti racconto la storia della lingua italiana.",
    miniGame: "gesto_storia",
    miniGameLabel: "🎓 Gesto + Storia",
  },
  {
    id: "matilde", name: "Matilde", emoji: "💼", color: "#1CB0F6",
    bubble: { it: "Sono Matilde. Business Italian, email formali, riunioni. Niente slang. Procediamo.", en: "I'm Matilde. Business Italian, formal emails, meetings. No slang. Let's proceed." },
    speakIT: "Sono Matilde. Business Italian, email formali, riunioni. Niente slang. Niente scuse. Procediamo.",
    miniGame: "email_challenge",
    miniGameLabel: "💼 Email Challenge",
  },
  {
    id: "vittoria", name: "Vittoria", emoji: "🍦", color: "#E5B700",
    bubble: { it: "Sono Nonna Vittoria. Se sbagli il congiuntivo, lo sento da qui. Ma se studi con il cuore, ti faccio il gelato.", en: "I'm Nonna Vittoria. I can hear a wrong subjunctive from miles away. But study with heart, and I'll make you gelato." },
    speakIT: "Sono Nonna Vittoria. Se sbagli il congiuntivo, lo sento da qui. Ma se studi con il cuore, ti faccio il gelato.",
    miniGame: "boss",
    miniGameLabel: "🍦 Sfida la Nonna",
  },
];

const LESSONS = [
  { id:1, title:"Le Prime Parole",        subtitle:"Ciao, Grazie, Prego, Sì — il giorno 1" },
  { id:2, title:"Il Primo Caffè",          subtitle:"Ordina senza sembrare turista" },
  { id:3, title:"Mario dà le Indicazioni", subtitle:"Preposizioni di luogo in contesto" },
  { id:4, title:"La Cultura del Cibo",     subtitle:"L'ordine dei piatti — sacro e intoccabile" },
  { id:"boss", title:"⚡ Sfida la Nonna",  subtitle:"5 domande — il gelato ti aspetta sempre 🍦", boss:true },
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

// ─── Modal bio personaggio ────────────────────────────────────────────────────
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
          🎮 {c.miniGameLabel} — in arrivo! / coming soon!
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

// ─── Card personaggio con long press ─────────────────────────────────────────
function CharacterCard({ c, onTap, onLongPress }) {
  const [hovered, setHovered]   = useState(false);
  const pressTimer              = useRef(null);
  const longPressed             = useRef(false);

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
  const [modalChar,      setModalChar]      = useState(null);
  const [completed,      setCompleted]      = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted,        setMounted]        = useState(false);

  function refreshCompleted() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setCompleted(data.completed ?? []);
    } catch { setCompleted([]); }
  }

  // Init — decay + onboarding check
  useEffect(() => {
    const data = loadProgress();
    if (!data || !data.onboardingDone) setShowOnboarding(true);
    refreshCompleted();
    setMounted(true);
    window.addEventListener("focus", refreshCompleted);
    return () => window.removeEventListener("focus", refreshCompleted);
  }, []);

  function handleOnboardingComplete(livello) {
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

  function isDone(id) { return completed.includes(id); }

  const unlockedCount = [1,2,3,4,"boss"].filter(id => isDone(id)).length;

  return (
    <main style={{ minHeight:"100vh",background:"var(--bg)",padding:"24px 16px" }}>

      {/* Onboarding */}
      {showOnboarding && mounted && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <header style={{ marginBottom:"32px" }}>
        <Logo />
      </header>

      {/* Energia + streak */}
      <XPBar />

      {/* Modal bio personaggio */}
      {modalChar && (
        <CharacterModal c={modalChar} onClose={()=>{ window.speechSynthesis?.cancel(); setModalChar(null); }} />
      )}

      {/* ── PERSONAGGI ── */}
      <section style={{ marginBottom:"28px" }}>
        <h2 style={{ fontSize:"13px",fontWeight:900,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"4px" }}>
          I tuoi compagni
        </h2>
        <p style={{ fontSize:"11px",color:"var(--text3)",marginBottom:"12px" }}>
          Tap → mini-game (presto!) · Tieni premuto / Hold → bio
        </p>
        <div style={{ display:"flex",gap:"6px",justifyContent:"space-between" }}>
          {CHARACTERS.map(c => (
            <CharacterCard
              key={c.id}
              c={c}
              onTap={() => {
                playCharacterSound(c.id);
                // Sprint 7: aprirà il mini-game. Per ora apre bio.
                setModalChar(c);
              }}
              onLongPress={() => {
                playCharacterSound(c.id);
                setModalChar(c);
              }}
            />
          ))}
        </div>
      </section>

      {/* ── MENU DEL GIORNO ── */}
      <section style={{ marginBottom:"28px" }}>
        <h2 style={{ fontSize:"13px",fontWeight:900,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"4px" }}>
          🍽 Menu del Giorno / Daily Menu
        </h2>
        <p style={{ fontSize:"11px",color:"var(--text3)",marginBottom:"12px" }}>
          ☕ Caffè → 🥐 Cornetto → 🍸 Aperitivo → 🍕 Pizza → 🍦 Gelato
        </p>
        <div style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
          {LESSONS.map(lesson => {
            const unlocked = isUnlocked(lesson.id);
            const done     = isDone(lesson.id);
            return (
              <div key={lesson.id} style={{
                background: lesson.boss ? "linear-gradient(135deg,#1a1a2e,#2a1500)" : "var(--card)",
                borderRadius:"var(--r)",
                border:`2px solid ${done?"#46A302":lesson.boss&&unlocked?"#E5B700":unlocked?"#58CC02":"var(--border)"}`,
                padding:"16px", opacity:unlocked?1:0.4,
                display:"flex",alignItems:"center",gap:"14px",
                boxShadow:lesson.boss&&unlocked?"0 0 20px #E5B70033":"none",
                transition:"opacity 0.3s",
              }}>
                <div style={{ width:"44px",height:"44px",borderRadius:"50%",flexShrink:0,
                  background:done?"#46A302":lesson.boss&&unlocked?"#E5B700":unlocked?"#58CC02":"var(--dis-bg)",
                  boxShadow:done?"0 4px 0 #2d7a00":lesson.boss&&unlocked?"0 4px 0 #b8920b":unlocked?"0 4px 0 #46A302":"0 4px 0 #AFAFAF",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",color:"white",fontWeight:900,
                }}>
                  {done?"✅":lesson.boss&&unlocked?"🍦":unlocked?"⭐":"🔒"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900,fontSize:"15px",
                    color:done?"#46A302":lesson.boss&&unlocked?"#E5B700":unlocked?"var(--text)":"var(--text3)",marginBottom:"2px" }}>
                    {lesson.title}
                  </div>
                  <div style={{ fontSize:"12px",color:"var(--text3)",fontWeight:700 }}>{lesson.subtitle}</div>
                </div>
                {!!unlocked && <LessonButton lessonId={lesson.id} />}
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
}
