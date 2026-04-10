"use client";
import { useState, useEffect, useRef } from "react";

const CHAR_IMAGE = { mario:"/images/mario.png", sofia:"/images/sofia.png", diego:"/images/diego.png", gino:"/images/gino.png", matilde:"/images/matilde.png" };
const CHAR_COLOR = { mario:"#FF9B42", sofia:"#C8A0E8", diego:"#22C55E", gino:"#E5B700", matilde:"#1CB0F6" };

const INTRO_IT = "Abbina la parola!";
const INTRO_EN = "Match the word!";

const FEEDBACK = {
  ok:    [{it:"Bravo!",en:"Well done!"},{it:"Esatto!",en:"Correct!"},{it:"Perfetto!",en:"Perfect!"}],
  err:   [{it:"Riprova!",en:"Try again!"},{it:"Non ancora!",en:"Not yet!"},{it:"Quasi!",en:"Almost!"}],
  round: [{it:"Ottimo! Avanti!",en:"Great! Next round!"},{it:"Round completato!",en:"Round complete!"}],
  done:  [{it:"Hai finito!",en:"All done!"}],
};

const BATCH = 4;

function computeBatches(arr, size = 4) {
  if (arr.length <= size) return [arr];
  const batches = [];
  for (let i = 0; i < arr.length; i += size) batches.push(arr.slice(i, i + size));
  if (batches.length > 1 && batches[batches.length - 1].length < 2) {
    const last = batches.pop();
    batches[batches.length - 1] = [...batches[batches.length - 1], ...last];
  }
  return batches;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function speakWord(text) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text.replace(" / ", " "));
  u.lang = "it-IT"; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function VocabMatch({ lesson, unitType, unita, lezione, onComplete, router }) {
  const vocab = lesson.vocab;
  const character = "mario";
  const charColor = CHAR_COLOR[character] || "#00BCD4";
  const charImage = CHAR_IMAGE[character] || "/images/mario.png";

  // Intro state
  const [introPlayed, setIntroPlayed] = useState(false);
  const [charAnim, setCharAnim] = useState("invite");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cardsActive, setCardsActive] = useState(false);
  const [litWordIdx, setLitWordIdx] = useState(-1);

  // Bubble state
  const [bubbleIT, setBubbleIT] = useState(INTRO_IT);
  const [bubbleEN, setBubbleEN] = useState(INTRO_EN);
  const [bubbleStatus, setBubbleStatus] = useState(""); // "" | "ok" | "err"

  // Game state
  const batchesRef = useRef(computeBatches(shuffle(vocab)));
  const roundsRef = useRef(batchesRef.current.flat());
  const [batchIndex, setBatchIndex] = useState(0);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [enShuffled, setEnShuffled] = useState([]);
  const [matched, setMatched] = useState([]);
  const [selectedIT, setSelectedIT] = useState(null);
  const [selectedEN, setSelectedEN] = useState(null);
  const [totalXP, setTotalXP] = useState(0);
  const [errors, setErrors] = useState(0);
  const [nextActive, setNextActive] = useState(false);
  const [progress, setProgress] = useState(5);
  const [done, setDone] = useState(false);

  const resetTimer = useRef(null);
  const charAnimTimer = useRef(null);

  useEffect(() => {
    const batch = batchesRef.current[0] || [];
    setCurrentBatch(batch);
    setEnShuffled(shuffle(batch));
  }, []);

  useEffect(() => { return () => { window.speechSynthesis?.cancel(); }; }, []);

  function loadBatch(idx) {
    const batch = batchesRef.current[idx] || [];
    setCurrentBatch(batch);
    setEnShuffled(shuffle(batch));
    setMatched([]);
    setSelectedIT(null);
    setSelectedEN(null);
    setNextActive(false);
  }

  function setCharAnimOnce(type, after = "idle") {
    if (charAnimTimer.current) clearTimeout(charAnimTimer.current);
    setCharAnim(type);
    charAnimTimer.current = setTimeout(() => setCharAnim(after), 700);
  }

  function scheduleBubbleReset(ms) {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setBubbleIT(INTRO_IT);
      setBubbleEN(INTRO_EN);
      setBubbleStatus("");
      resetTimer.current = null;
    }, ms);
  }

  function cancelBubbleReset() {
    if (resetTimer.current) { clearTimeout(resetTimer.current); resetTimer.current = null; }
  }

  function onCharClick() {
    if (introPlayed) return;
    setIntroPlayed(true);
    setCharAnim("speaking");
    setIsSpeaking(true);

    if (!window.speechSynthesis) { endIntro(); return; }
    const words = INTRO_IT.split(" ");
    const u = new SpeechSynthesisUtterance(INTRO_IT);
    u.lang = "it-IT"; u.rate = 0.82;
    u.addEventListener("boundary", e => {
      if (e.name !== "word") return;
      let cum = 0;
      for (let i = 0; i < words.length; i++) {
        if (cum >= e.charIndex) { setLitWordIdx(i); break; }
        cum += words[i].length + 1;
      }
    });
    u.addEventListener("end", () => { setLitWordIdx(-1); endIntro(); });
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function endIntro() {
    setIsSpeaking(false);
    setCharAnim("idle");
    setCardsActive(true);
  }

  function handleSelectIT(id) {
    if (matched.includes(id)) return;
    setSelectedIT(prev => prev === id ? null : id);
    setSelectedEN(null);
  }

  function handleSelectEN(id) {
    if (matched.includes(id)) return;
    setSelectedEN(prev => prev === id ? null : id);
  }

  useEffect(() => {
    if (selectedIT && selectedEN) tryMatch(selectedIT, selectedEN);
  }, [selectedIT, selectedEN]);

  function tryMatch(iId, eId) {
    if (iId === eId) {
      const newMatched = [...matched, iId];
      setMatched(newMatched);
      setSelectedIT(null);
      setSelectedEN(null);

      const newXP = totalXP + 10;
      setTotalXP(newXP);
      const pct = Math.round(5 + ((batchIndex * BATCH) + newMatched.length) / roundsRef.current.length * 90);
      setProgress(Math.min(pct, 95));

      speakWord(vocab.find(v => v.id === iId).it);

      const isRoundDone = newMatched.length === currentBatch.length;
      if (isRoundDone) {
        cancelBubbleReset();
        setTimeout(() => {
          const nextIdx = batchIndex + 1;
          setBatchIndex(nextIdx);
          if (nextIdx >= batchesRef.current.length) {
            const f = rnd(FEEDBACK.done);
            setBubbleIT(f.it); setBubbleEN(f.en); setBubbleStatus("ok");
            setCharAnimOnce("spin", "idle");
            setProgress(100);
            setTimeout(() => setDone(true), 1200);
          } else {
            const f = rnd(FEEDBACK.round);
            setBubbleIT(f.it); setBubbleEN(f.en); setBubbleStatus("ok");
            setCharAnimOnce("spin", "idle");
            setNextActive(true);
          }
        }, 700);
      } else {
        const f = rnd(FEEDBACK.ok);
        setBubbleIT(f.it); setBubbleEN(f.en); setBubbleStatus("ok");
        setCharAnimOnce("bounce", "idle");
        scheduleBubbleReset(1000);
      }
    } else {
      setSelectedIT(null);
      setSelectedEN(null);
      setErrors(e => e + 1);
      const f = rnd(FEEDBACK.err);
      setBubbleIT(f.it); setBubbleEN(f.en); setBubbleStatus("err");
      setCharAnimOnce("shake", "idle");
      scheduleBubbleReset(1000);
    }
  }

  function handleNextRound() {
    if (!nextActive) return;
    setBubbleIT(INTRO_IT); setBubbleEN(INTRO_EN); setBubbleStatus("");
    loadBatch(batchIndex);
    setNextActive(false);
  }

  useEffect(() => {
    if (done) {
      setTimeout(() => onComplete(), 400);
    }
  }, [done]);

  // Styles
  const itCardStyle = (id) => {
    const isMatched = matched.includes(id);
    const isSelected = selectedIT === id;
    let border = charColor;
    let bg = `${charColor}12`;
    let boxShadow = `0 0 9px ${charColor}4D, inset 0 0 10px ${charColor}0D`;
    if (isMatched) { border = "#27AE60"; bg = "rgba(39,174,96,0.1)"; boxShadow = "0 0 12px rgba(39,174,96,0.5)"; }
    else if (isSelected) { border = "#00f0ff"; boxShadow = "0 0 16px rgba(0,240,255,0.6)"; }
    return {
      borderRadius: 12, textAlign: "center", padding: "13px 6px 10px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      border: `1.5px solid ${border}`, boxShadow, background: bg,
      cursor: isMatched ? "default" : "pointer",
      transition: "border-color .12s, background .12s, box-shadow .12s",
      opacity: cardsActive ? 1 : 0.3,
    };
  };

  const enCardStyle = (id) => {
    const isMatched = matched.includes(id);
    const isSelected = selectedEN === id;
    let border = "#E5B700";
    let bg = "rgba(229,183,0,0.07)";
    let boxShadow = "0 0 9px rgba(229,183,0,0.25), inset 0 0 8px rgba(229,183,0,0.05)";
    if (isMatched) { border = "#27AE60"; bg = "rgba(39,174,96,0.1)"; boxShadow = "0 0 12px rgba(39,174,96,0.5)"; }
    else if (isSelected) { border = "#ffe34d"; boxShadow = "0 0 16px rgba(255,227,77,0.6)"; }
    return {
      borderRadius: 8, textAlign: "center", padding: "7px 3px",
      fontSize: 10, color: "#fff", fontWeight: 500, lineHeight: 1.3,
      display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44,
      border: `1.5px solid ${border}`, boxShadow, background: bg,
      cursor: isMatched ? "default" : "pointer",
      transition: "border-color .12s, background .12s, box-shadow .12s",
      opacity: cardsActive ? 1 : 0.3,
      pointerEvents: cardsActive ? "auto" : "none",
    };
  };

  const charAnimStyle = () => {
    const base = {
      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
      background: `${charColor}1F`, border: `2px solid ${charColor}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, cursor: introPlayed ? "default" : "pointer",
    };
    return base;
  };

  const bubbleBorder = bubbleStatus === "ok" ? "#27AE60" : bubbleStatus === "err" ? "#E24B4A" : charColor;
  const bubbleBg = bubbleStatus === "ok" ? "rgba(39,174,96,0.1)" : bubbleStatus === "err" ? "rgba(226,75,74,0.08)" : `${charColor}14`;
  const bubbleShadow = bubbleStatus === "ok" ? "0 0 10px rgba(39,174,96,0.4)" : bubbleStatus === "err" ? "0 0 10px rgba(226,75,74,0.4)" : isSpeaking ? `0 0 22px ${charColor}BF` : `0 0 8px ${charColor}33`;

  const introWords = INTRO_IT.split(" ");
  const tot = batchesRef.current.length;

  return (
    <main className="full-bleed" style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", flexDirection: "column", width: "100%" }}>
      <style>{`
        @keyframes vm-invite  { 0%,100%{box-shadow:0 0 8px ${charColor}66;}50%{box-shadow:0 0 22px ${charColor}E6,0 0 36px ${charColor}4D;} }
        @keyframes vm-idle    { 0%,100%{box-shadow:0 0 5px ${charColor}40;}50%{box-shadow:0 0 12px ${charColor}80;} }
        @keyframes vm-speaking{ 0%,100%{box-shadow:0 0 12px ${charColor}80;}50%{box-shadow:0 0 28px ${charColor}FF,0 0 46px ${charColor}59;} }
        @keyframes vm-bounce  { 0%{transform:translateY(0)}30%{transform:translateY(-10px)}55%{transform:translateY(0)}75%{transform:translateY(-5px)}100%{transform:translateY(0)} }
        @keyframes vm-shake   { 0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)} }
        @keyframes vm-spin    { 0%{transform:rotate(0)scale(1)}50%{transform:rotate(180deg)scale(1.2)}100%{transform:rotate(360deg)scale(1)} }
        .vm-char { animation: vm-idle 2.5s ease-in-out infinite; }
        .vm-char.invite   { animation: vm-invite   1.2s ease-in-out infinite; }
        .vm-char.idle     { animation: vm-idle     2.5s ease-in-out infinite; }
        .vm-char.speaking { animation: vm-speaking 0.45s ease-in-out infinite; }
        .vm-char.bounce   { animation: vm-bounce   0.5s ease forwards; }
        .vm-char.shake    { animation: vm-shake    0.4s ease forwards; }
        .vm-char.spin     { animation: vm-spin     0.6s ease forwards; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: "var(--card)", borderBottom: "2px solid var(--border)", padding: "12px clamp(16px, 5vw, 48px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <button onClick={() => { if (window.confirm("Tornare alla home?\n\nIl progresso non verrà salvato.")) { window.speechSynthesis?.cancel(); router.push("/"); } }} style={{background:'none',border:'none',color:'#58cc02',fontSize:13,fontWeight:900,cursor:'pointer',fontFamily:'inherit'}}>🏠 Home</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Unità {unita} · Lezione {lezione} / Unit {unita} · Lesson {lezione}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{lesson.title}</div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: unitType.color, background: `${unitType.color}22`, border: `1px solid ${unitType.color}66`, borderRadius: 99, padding: "3px 9px" }}>
            {unitType.emoji} {unitType.it === "Esplorazione" ? "Nuovi contenuti" : "Ripasso"}
          </div>
        </div>
        <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "var(--primary)", borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Activity area */}
      <div style={{ flex: 1, padding: "20px clamp(16px, 5vw, 48px)", display: "flex", flexDirection: "column", gap: 14, width: "100%" }}><div style={{ maxWidth: 540, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Character + bubble */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div
            className={`vm-char ${charAnim}`}
            style={charAnimStyle()}
            onClick={onCharClick}
          >
            <img src={charImage} alt={character} width={48} height={48} style={{borderRadius:"50%",objectFit:"cover",pointerEvents:"none"}} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ position: "relative" }}>
              {/* Arrow */}
              <div style={{ position: "absolute", left: -7, top: 16, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: `7px solid ${bubbleBorder}`, transition: "border-right-color 0.25s" }} />
              {/* Bubble */}
              <div style={{ borderRadius: 10, border: `1.5px solid ${bubbleBorder}`, boxShadow: bubbleShadow, background: bubbleBg, padding: "8px 12px", height: 62, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, overflow: "hidden", transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {!introPlayed || cardsActive
                    ? bubbleIT
                    : introWords.map((w, i) => (
                        <span key={i} style={{ color: i === litWordIdx ? "#00f0ff" : "#fff", transition: "color 0.08s" }}>{w}{i < introWords.length - 1 ? " " : ""}</span>
                      ))
                  }
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bubbleEN}</div>
              </div>
            </div>
            <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 4, textAlign: "right" }}>
              Round {batchIndex + 1} di {tot} · Round {batchIndex + 1} of {tot}
            </div>
          </div>
        </div>

        {/* IT cards 2x2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {currentBatch.map(v => (
            <div key={v.id} style={itCardStyle(v.id)} onClick={() => cardsActive && !matched.includes(v.id) && handleSelectIT(v.id)}>
              <span style={{ fontSize: 24, lineHeight: 1, letterSpacing: 1 }}>{v.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>{v.it}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

        {/* EN cards 1x4 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
          {enShuffled.map(v => (
            <div key={v.id} style={enCardStyle(v.id)} onClick={() => cardsActive && !matched.includes(v.id) && handleSelectEN(v.id)}>
              {v.en}
            </div>
          ))}
        </div>
      </div>{/* end max-width wrapper */}
      </div>{/* end content area */}

      {/* Bottom button */}
      <div style={{ padding: "14px clamp(16px, 5vw, 48px)", background: "var(--card)", borderTop: "2px solid var(--border)" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <button
            onClick={nextActive ? handleNextRound : undefined}
            disabled={!nextActive}
            style={{ width: "100%", padding: 15, borderRadius: "var(--r)", fontSize: 15, fontWeight: 900, letterSpacing: "0.6px", border: "none", textTransform: "uppercase", fontFamily: "inherit", background: nextActive ? "var(--primary)" : "var(--dis-bg)", color: nextActive ? "white" : "var(--dis-text)", boxShadow: nextActive ? "0 4px 0 var(--primary-d)" : "none", cursor: nextActive ? "pointer" : "not-allowed", transition: "all 0.2s" }}
          >
            Avanti / Next →
          </button>
        </div>
      </div>
    </main>
  );
}
