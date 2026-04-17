"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Logo from "./components/Logo";
import TricoloreBar from "./components/TricoloreBar";
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
  { id: 1, livello: "A1", titleIT: "Saluti base", titleEN: "Basic greetings",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Saluti base",            titleEN:"Basic greetings" },
      { id:2, emoji:"📖", titleIT:"Presentarsi",             titleEN:"Introducing yourself" },
      { id:3, emoji:"💪", titleIT:"Saluti — in pratica",     titleEN:"Greetings — in practice" },
      { id:4, emoji:"🎧", titleIT:"Saluti — ascolta",        titleEN:"Greetings — listen" },
      { id:5, emoji:"🎯", titleIT:"Ripasso veloce",          titleEN:"Quick recap" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 2, livello: "A1", titleIT: "Presentarsi", titleEN: "Introducing yourself", tipo: "consolidamento",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Presentarsi",             titleEN:"Introducing yourself" },
      { id:2, emoji:"📖", titleIT:"Presentarsi — contesto",  titleEN:"Introducing — context" },
      { id:3, emoji:"💪", titleIT:"Pratica presentazioni",   titleEN:"Practice introductions" },
      { id:4, emoji:"🎧", titleIT:"Ascolta presentazioni",   titleEN:"Listen to introductions" },
      { id:5, emoji:"🎯", titleIT:"Ripasso veloce",          titleEN:"Quick recap" },
    ],
    boss: { id:"boss", titleIT:"La Nonna presenta", titleEN:"Nonna introduces you" },
  },
  { id: 3, livello: "A1", titleIT: "Al bar: pagare", titleEN: "At the bar: paying",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Il conto",                titleEN:"The bill" },
      { id:2, emoji:"📖", titleIT:"Grazie e prego",          titleEN:"Thank you and welcome" },
      { id:3, emoji:"💪", titleIT:"Pratica al bar",          titleEN:"Practice at the bar" },
      { id:4, emoji:"🎧", titleIT:"Ascolta al bar",          titleEN:"Listen at the bar" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 4, livello: "A1", titleIT: "In giro per Napoli", titleEN: "Around Naples",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Destra, sinistra, dritto", titleEN:"Right, left, straight" },
      { id:2, emoji:"📖", titleIT:"Dov'è il bar?",           titleEN:"Where is the bar?" },
      { id:3, emoji:"💪", titleIT:"In giro con Oliver",      titleEN:"Out and about with Oliver" },
      { id:4, emoji:"🎧", titleIT:"Ascolta le direzioni",    titleEN:"Listen to the directions" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 5, livello: "A1", titleIT: "In giro: luoghi", titleEN: "Around: places",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"La piazza e la chiesa",   titleEN:"The square and the church" },
      { id:2, emoji:"📖", titleIT:"Di fronte e dietro",      titleEN:"In front and behind" },
      { id:3, emoji:"💪", titleIT:"Io vado, tu vai",         titleEN:"I go, you go" },
      { id:4, emoji:"🎧", titleIT:"Ascolta i luoghi",        titleEN:"Listen to the places" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 6, livello: "A1", titleIT: "I numeri", titleEN: "Numbers",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"I primi numeri",          titleEN:"The first numbers" },
      { id:2, emoji:"📖", titleIT:"Cinquanta e cento",       titleEN:"Fifty and one hundred" },
      { id:3, emoji:"💪", titleIT:"Quanti anni hai?",        titleEN:"How old are you?" },
      { id:4, emoji:"🎧", titleIT:"Ascolta i numeri",        titleEN:"Listen to the numbers" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 7, livello: "A1", titleIT: "Giorni e orari", titleEN: "Days and times",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Oggi e domani",           titleEN:"Today and tomorrow" },
      { id:2, emoji:"📖", titleIT:"Mattina, pomeriggio, sera", titleEN:"Morning, afternoon, evening" },
      { id:3, emoji:"💪", titleIT:"Sono le tre",             titleEN:"It is three o clock" },
      { id:4, emoji:"🎧", titleIT:"Ascolta gli orari",       titleEN:"Listen to the times" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 8, livello: "A1", titleIT: "Il cibo napoletano", titleEN: "Neapolitan food",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Pizza, caffè, cornetto",  titleEN:"Pizza, coffee, croissant" },
      { id:2, emoji:"📖", titleIT:"Buono e delizioso",       titleEN:"Good and delicious" },
      { id:3, emoji:"💪", titleIT:"Pratica — il cibo",       titleEN:"Practice — food" },
      { id:4, emoji:"🎧", titleIT:"Ascolta — il cibo",       titleEN:"Listen — food" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 9, livello: "A1", titleIT: "Descrivere persone", titleEN: "Describing people",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Alto, basso, giovane",    titleEN:"Tall, short, young" },
      { id:2, emoji:"📖", titleIT:"Simpatico e capelli",     titleEN:"Nice and hair" },
      { id:3, emoji:"💪", titleIT:"Pratica — le persone",    titleEN:"Practice — people" },
      { id:4, emoji:"🎧", titleIT:"Ascolta — le persone",    titleEN:"Listen — people" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 10, livello: "A1", titleIT: "La famiglia", titleEN: "The family",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Mamma, papà, fratello",   titleEN:"Mum, dad, brother" },
      { id:2, emoji:"📖", titleIT:"Sorella, nonni, famiglia", titleEN:"Sister, grandparents, family" },
      { id:3, emoji:"💪", titleIT:"Pratica — la famiglia",   titleEN:"Practice — family" },
      { id:4, emoji:"🎧", titleIT:"Ascolta — la famiglia",   titleEN:"Listen — family" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 11, livello: "A1", titleIT: "I colori", titleEN: "The colours",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Rosso, blu, verde",       titleEN:"Red, blue, green" },
      { id:2, emoji:"📖", titleIT:"Bianco, nero, bello",     titleEN:"White, black, beautiful" },
      { id:3, emoji:"💪", titleIT:"Pratica — i colori",      titleEN:"Practice — colours" },
      { id:4, emoji:"🎧", titleIT:"Ascolta — i colori",      titleEN:"Listen — colours" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 12, livello: "A1", titleIT: "Al telefono", titleEN: "On the phone",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Pronto! Chi parla?",      titleEN:"Hello! Who is speaking?" },
      { id:2, emoji:"📖", titleIT:"Un momento, richiamo",    titleEN:"One moment, I will call back" },
      { id:3, emoji:"💪", titleIT:"Pratica — al telefono",   titleEN:"Practice — on the phone" },
      { id:4, emoji:"🎧", titleIT:"Ascolta — al telefono",   titleEN:"Listen — on the phone" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 13, livello: "A1", titleIT: "Fare la spesa", titleEN: "Shopping",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Il mercato",              titleEN:"The market" },
      { id:2, emoji:"📖", titleIT:"Posso avere? Il resto",   titleEN:"Can I have? The change" },
      { id:3, emoji:"💪", titleIT:"Pratica — la spesa",      titleEN:"Practice — shopping" },
      { id:4, emoji:"🎧", titleIT:"Ascolta — la spesa",      titleEN:"Listen — shopping" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 14, livello: "A1", titleIT: "Il tempo", titleEN: "The weather",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Fa caldo, fa freddo",     titleEN:"It is hot, it is cold" },
      { id:2, emoji:"📖", titleIT:"Piove e c'è il sole",     titleEN:"It is raining and sunny" },
      { id:3, emoji:"💪", titleIT:"Pratica — il tempo",      titleEN:"Practice — weather" },
      { id:4, emoji:"🎧", titleIT:"Ascolta — il tempo",      titleEN:"Listen — weather" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
  },
  { id: 15, livello: "A1", titleIT: "Le emozioni", titleEN: "Emotions",
    lessons: [
      { id:1, emoji:"⭐", titleIT:"Felice, triste, stanco",  titleEN:"Happy, sad, tired" },
      { id:2, emoji:"📖", titleIT:"Come stai? Sto bene",     titleEN:"How are you? I am fine" },
      { id:3, emoji:"💪", titleIT:"Pratica — le emozioni",   titleEN:"Practice — emotions" },
      { id:4, emoji:"🎧", titleIT:"Ascolta — le emozioni",   titleEN:"Listen — emotions" },
      { id:5, emoji:"🎯", titleIT:"Tutto veloce!",           titleEN:"All speed!" },
    ],
    boss: { id:"boss", titleIT:"Sfida la Nonna", titleEN:"Challenge the Grandma" },
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
  const [homeCredits,  setHomeCredits]  = useState(0);
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
    if (!data || !data.onboardingDone) { /* onboarding aperto solo dal click CTA landing */ }
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
      setDashNickname(nick || ((lv.nickPrefix || 'Turista') + '_' + seed));
      setHomeCredits(typeof prog.credits === 'number' ? prog.credits : 0);
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

  // Composite key: "u1-1", "u1-boss", "u2-3", etc.
  // Backward compat: old keys (1, 2, "boss") treated as unit 1
  function ckey(unitId, lessonId) { return `u${unitId}-${lessonId}`; }

  function isCompleted(unitId, lessonId) {
    const key = ckey(unitId, lessonId);
    if (completed.includes(key)) return true;
    // Backward compat: unit 1 old-style keys
    if (unitId === 1) return completed.includes(lessonId === "boss" ? "boss" : lessonId);
    return false;
  }

  function isLessonUnlocked(unitId, lessonId) {
    if (lessonId === 1) return isUnitUnlocked(unitId);
    if (lessonId === "boss") return [1,2,3,4,5].every(l => isCompleted(unitId, l));
    return isCompleted(unitId, lessonId - 1);
  }

  function isUnitUnlocked(unitId) {
    if (unitId === 1) return true;
    const prevId = unitId - 1;
    return [1,2,3,4,5].every(l => isCompleted(prevId, l)) && isCompleted(prevId, "boss");
  }


  if (!mounted) return null;

  // Determina se l'utente ha già iniziato
  let hasProgress = false;
  try {
    const data = loadProgress();
    hasProgress = !!(data && data.onboardingDone);
  } catch {}

  // Prossima lezione da fare (scansiona tutte le unità sbloccate)
  const allLessons = UNITS.filter(u => !u.comingSoon).flatMap(u => u.lessons.map(l => ({...l, unita: u.id, livello: u.livello || 'A1'})));
  const nextLesson = allLessons.find(l => isLessonUnlocked(l.unita, l.id) && !isCompleted(l.unita, l.id));

  // ── LANDING (non autenticato) ──────────────────────────────────────────────
  if (!hasProgress) {
    return (
      <>
        {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

        <div className="app-wrapper" style={{ minHeight:"auto" }}>
          <img
            src="/images/bar-di-mario.png"
            alt="Bar di Mario — Napoli"
            style={{ width:"100%", maxWidth:"100%", display:"block", objectFit:"cover", objectPosition:"center center", height:"clamp(200px,45vw,360px)", borderRadius:"var(--r)" }}
          />
          <TricoloreBar />
          {/* Topbar onboarding: solo logo centrato, nessun HOME */}
          <div className="app-topbar" style={{ justifyContent:"center" }}>
            <Logo size={40} />
          </div>
          <TricoloreBar />

          <div className="app-body" style={{ alignItems:"center", justifyContent:"center", gap:16 }}>
            <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"16px 0" }}>
              <div style={{ fontSize:56, lineHeight:1 }}>☕</div>
              <div style={{ textAlign:"center", lineHeight:1.35 }}>
                <div style={{ fontSize:20, fontWeight:900, color:"var(--text)" }}>Benvenuto al Bar di Mario</div>
                <div style={{ fontSize:15, color:"var(--text3)", fontStyle:"italic", marginTop:4 }}>Welcome to Mario's Bar</div>
              </div>
              <div style={{ textAlign:"center", fontSize:14, color:"var(--text2)", lineHeight:1.5 }}>
                <div>L'italiano inizia qui.</div>
                <div style={{ color:"var(--text3)", fontStyle:"italic" }}>Italian starts here.</div>
              </div>
              <div style={{ fontSize:12, color:"var(--text3)", textAlign:"center", marginTop:8 }}>
                Gratis · Nessuna carta
                <div style={{ fontStyle:"italic", opacity:0.8 }}>Free · No credit card</div>
              </div>
            </div>
          </div>

          <div className="app-bottom">
            <button
              onClick={() => setShowOnboarding(true)}
              className="btn-primary"
            >
              Siediti al bar · Take a seat →
            </button>
          </div>
        </div>

        {modalChar && <CharacterModal c={modalChar} onClose={() => { window.speechSynthesis?.cancel(); setModalChar(null); }} />}
        {activeGame && <MiniGameRouter character={activeGame} onClose={() => setActiveGame(null)} onXP={(xp) => { handleGameXP(xp); refreshCompleted(); }} />}
      </>
    );
  }

  // ── HOME AUTENTICATA ───────────────────────────────────────────────────────
  const lessonDone = nextLesson ? isCompleted(nextLesson.unita, nextLesson.id) : false;
  const isFirstLesson = nextLesson && nextLesson.id === 1 && nextLesson.unita === 1 && !isCompleted(1, 1);
  const ctaLabel = isFirstLesson ? "Inizia / Start →" : "Continua / Continue →";
  const ctaLabelTop = isFirstLesson ? "Lezione 1 / Lesson 1" : `Lezione ${nextLesson ? nextLesson.id : ''} / Lesson ${nextLesson ? nextLesson.id : ''}`;

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Schema globale: wrapper 720 + tricolore + topbar + tricolore + body + bottom */}
      <div className="app-wrapper">
        <TricoloreBar />
        <div className="app-topbar">
          <button
            onClick={() => router.push('/dashboard')}
            className="lesson-topbar__home"
            aria-label="Dashboard"
            title="Dashboard"
          >
            👤
          </button>
          <div className="lesson-topbar__title">
            <div className="lesson-topbar__title-it">Italiano con Stile</div>
            <div className="lesson-topbar__title-en">Finally, someone explains why</div>
          </div>
          <div className="lesson-topbar__credits" title={`${homeCredits} crediti`}>
            🎫 {homeCredits}
          </div>
        </div>
        <TricoloreBar />

        {/* BODY */}
        <div className="app-body">
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

          {/* PERSONAGGI */}
          <section>
            <div style={{ fontSize:13, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>
              I tuoi compagni / Your companions
            </div>
            <div style={{ display:"flex", gap:"clamp(6px,2vw,16px)", justifyContent:"space-between", overflow:"hidden" }}>
              {CHARACTERS.map(c => (
                <div
                  key={c.id}
                  onClick={() => { playCharacterSound(c.id); if (c.miniGame === "boss") { setModalChar(c); return; } setActiveGame(c); }}
                  onMouseEnter={e => e.currentTarget.querySelector('.char-glow').style.boxShadow = `0 0 18px ${c.color}CC`}
                  onMouseLeave={e => e.currentTarget.querySelector('.char-glow').style.boxShadow = 'none'}
                  style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer", flex:1, minWidth:0 }}
                >
                  <div
                    className="char-glow"
                    style={{ width:"clamp(44px,8vw,64px)", height:"clamp(44px,8vw,64px)", borderRadius:"50%", border:`2px solid ${c.color}`, background:"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", transition:"box-shadow 0.2s" }}
                  >
                    <img src={`/images/${c.id}.png`} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML += `<span style="font-size:22px">${c.emoji}</span>`; }} />
                  </div>
                  <div style={{ fontSize:13, color:"var(--text3)", textAlign:"center" }}>{c.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* PROSSIMA LEZIONE o COMPLETATO */}
          {!nextLesson && (
            <section style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"20px 0" }}>
              <div style={{ fontSize:48 }}>🎉</div>
              <div style={{ fontSize:18, fontWeight:900, color:"#58cc02", textAlign:"center" }}>Complimenti! Hai completato tutto!</div>
              <div style={{ fontSize:14, fontStyle:"italic", color:"var(--text3)", textAlign:"center" }}>Congratulations! You completed everything!</div>
              <button onClick={() => router.push('/percorso')} style={{ marginTop:8, background:"none", border:"1.5px solid rgba(88,204,2,0.3)", borderRadius:12, padding:"10px 20px", color:"#58cc02", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", textTransform:"none", letterSpacing:"normal" }}>
                🗺️ Vedi il percorso / See your path
              </button>
            </section>
          )}
          {nextLesson && (
            <section style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ fontSize:13, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.8px" }}>
                {isFirstLesson ? "Prima lezione / First lesson" : "In corso / Current lesson"}
              </div>

              {/* FRAME LEZIONE UNIFICATO */}
              <div className="frame-glow" style={{ border:"1.5px solid #58cc02", borderRadius:16, overflow:"hidden" }}>
                <div style={{ background:"rgba(88,204,2,0.05)", padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", border:"2px solid #FF9B42", background:"rgba(255,155,66,0.15)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                    <img src="/images/mario.png" alt="Mario" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="font-size:22px">🧑</span>'; }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#58cc02", marginBottom:2 }}>
                      {ctaLabelTop}
                    </div>
                    <div style={{ fontSize:17, fontWeight:900, color:"var(--text)", marginBottom:3 }}>
                      {nextLesson.titleIT} / {nextLesson.titleEN}
                    </div>
                    <div style={{ fontSize:14, color:"var(--text3)" }}>
                      Unità {nextLesson.unita} / Unit {nextLesson.unita} · {nextLesson.livello} · ~5 min
                    </div>
                  </div>
                </div>
                <div style={{ height:"1px", background:"rgba(88,204,2,0.2)" }} />
                <button
                  className="btn-breathe"
                  onClick={() => router.push(`/lesson/${nextLesson.livello}/${nextLesson.unita}/${nextLesson.id}`)}
                  style={{ width:"100%", padding:"16px", background:"#58cc02", color:"#fff", border:"none", fontSize:18, fontWeight:900, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.5px" }}
                >
                  {ctaLabel}
                </button>
              </div>

            </section>
          )}

          </div>
        </div>
        <div className="app-bottom">
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary btn-primary--secondary"
          >
            👤 Dashboard
          </button>
        </div>
      </div>

      {/* MODALS */}
      {modalChar && <CharacterModal c={modalChar} onClose={() => { window.speechSynthesis?.cancel(); setModalChar(null); }} />}
      {activeGame && <MiniGameRouter character={activeGame} onClose={() => setActiveGame(null)} onXP={(xp) => { handleGameXP(xp); refreshCompleted(); }} />}
    </>
  );
}
