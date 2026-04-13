"use client";
/**
 * VocabMatch — Round 1 (IT→EN) + Round 2 (EN→IT).
 *
 * Flusso:
 *   1. Personaggio appare pulsando (waitingForClick=true)
 *   2. Utente clicca avatar → TTS intro + typewriter → card sbloccate
 *   3. Utente abbina coppie. Match OK → pulse-ok + TTS italiano. Match ERR → shake-err.
 *   4. Tutte abbinate → CTA "Avanti" → Round 2 (stessa logica) → onComplete()
 */

import { useState, useEffect, useRef } from "react";
import LessonTopbar from "./LessonTopbar";
import BarraSecondaria from "./BarraSecondaria";
import TricoloreBar from "./TricoloreBar";
import PersonaggioBubble from "./PersonaggioBubble";
import { pronounce } from "./pronounce";

const INTRO1 = { it: "Abbina la parola!", en: "Match the word!" };
const INTRO2 = { it: "Ora al contrario: inglese → italiano", en: "Now reverse: English → Italian" };
const MSG_OK  = { it: "Bravo!",   en: "Well done!" };
const MSG_ERR = { it: "Riprova!", en: "Try again!" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabMatch({ lesson, unitType, unita, lezione, onComplete }) {
  const vocab = lesson.vocab;
  const character = "mario";
  const totalPairs = vocab.length;

  // ── Stati ─────────────────────────────────────────────────────────────────
  const [round,           setRound]           = useState(1);
  const [matched,         setMatched]         = useState([]);
  const [selTop,          setSelTop]          = useState(null);
  const [selBot,          setSelBot]          = useState(null);
  const [bubble,          setBubble]          = useState({ ...INTRO1, status: "" });
  const [charAnim,        setCharAnim]        = useState("");
  const [topCards,        setTopCards]        = useState([]);
  const [botCards,        setBotCards]        = useState([]);
  const [done,            setDone]            = useState(false);
  // Avatar pulsa finché utente non clicca (invito visivo, non blocca card)
  const [waitingForClick, setWaitingForClick] = useState(true);
  // FIX 6: card in errore — [{id,zone}] per shake solo sulle due card cliccate
  const [shakingCards,    setShakingCards]    = useState([]);
  // FIX 5: card appena matchate (animazione pulse-ok)
  const [pulsingIds,      setPulsingIds]      = useState([]);

  const timersRef = useRef([]);
  function pushTimer(t) { timersRef.current.push(t); }
  function clearAllTimers() {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    setTopCards(shuffle(vocab));
    setBotCards(shuffle(vocab));
    return () => {
      clearAllTimers();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effetto match ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selTop || !selBot) return;
    const isMatch = selTop === selBot;

    if (isMatch) {
      // FIX 5: animazione pulse-ok
      setPulsingIds(prev => [...prev, selTop]);
      pushTimer(setTimeout(() => setPulsingIds(prev => prev.filter(id => id !== selTop)), 450));

      setMatched(prev => [...prev, selTop]);
      setBubble({ ...MSG_OK, status: "ok" });
      setCharAnim("bounce");
      pushTimer(setTimeout(() => setCharAnim(""), 700));

      // FIX 4: audio solo al match corretto, solo italiano
      const v = vocab.find(x => x.id === selTop);
      if (v) pronounce(v.audio_text || v.it, "it-IT");

      const willBeLast = (matched.length + 1) === totalPairs;
      if (!willBeLast) {
        pushTimer(setTimeout(() => setBubble({ ...getIntro(round), status: "" }), 1400));
      }
    } else {
      // FIX 6: shake solo sulle due card appena cliccate
      setShakingCards([{ id: selTop, zone: "top" }, { id: selBot, zone: "bot" }]);
      pushTimer(setTimeout(() => setShakingCards([]), 500));

      setBubble({ ...MSG_ERR, status: "err" });
      setCharAnim("shake");
      pushTimer(setTimeout(() => setCharAnim(""), 700));
      pushTimer(setTimeout(() => setBubble({ ...getIntro(round), status: "" }), 1400));
    }

    setSelTop(null);
    setSelBot(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selTop, selBot]);

  // ── Done → segnala a parent ──────────────────────────────────────────────
  useEffect(() => {
    if (!done) return;
    pushTimer(setTimeout(() => onComplete && onComplete(), 300));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // ── Avanti ───────────────────────────────────────────────────────────────
  function getIntro(r) { return r === 1 ? INTRO1 : INTRO2; }
  const roundComplete = matched.length === totalPairs;

  function handleAvanti() {
    if (!roundComplete) return;
    if (round === 1) {
      setRound(2);
      setMatched([]);
      setSelTop(null);
      setSelBot(null);
      setShakingCards([]);
      setPulsingIds([]);
      setBubble({ ...INTRO2, status: "" });
      setTopCards(shuffle(vocab));
      setBotCards(shuffle(vocab));
      setWaitingForClick(true);
    } else {
      setDone(true);
    }
  }

  // ── FIX 4: card non hanno audio individuale — solo selezione ─────────────
  function handleSelect(id, zone) {
    if (matched.includes(id)) return;
    if (zone === "top") setSelTop(prev => (prev === id ? null : id));
    else                setSelBot(prev => (prev === id ? null : id));
  }

  // ── Progresso ────────────────────────────────────────────────────────────
  const phaseBase  = round === 1 ? 5 : 50;
  const phaseRange = 45;
  const progress   = Math.round(phaseBase + (matched.length / totalPairs) * phaseRange);

  // ── Card styles ──────────────────────────────────────────────────────────
  const GREEN = "#58cc02";
  const GREEN_BG = "rgba(88,204,2,0.1)";
  const RED = "#ff4b4b";
  const MARIO_COLOR = "#FF9B42";

  function cardStyleTop(v) {
    const isMatched  = matched.includes(v.id);
    const isSelected = selTop === v.id;
    const isError    = shakingCards.some(s => s.id === v.id && s.zone === "top");
    const isPulsing  = pulsingIds.includes(v.id);

    let border = MARIO_COLOR;
    let bg     = `${MARIO_COLOR}14`;
    let shadow = `0 0 9px ${MARIO_COLOR}40`;
    let textColor = "#fff";
    let anim = "none";

    if (isMatched) {
      border = GREEN; bg = GREEN_BG; shadow = `0 0 14px rgba(88,204,2,0.45)`; textColor = GREEN;
    } else if (isError) {
      border = RED; bg = "rgba(255,75,75,0.08)"; shadow = `0 0 10px rgba(255,75,75,0.4)`;
      anim = "shake-err 0.4s ease";
    } else if (isSelected) {
      border = "#00f0ff"; shadow = "0 0 16px rgba(0,240,255,0.6)";
    }
    if (isPulsing) anim = "pulse-ok 0.4s ease";

    return {
      position: "relative", borderRadius: 12, padding: "14px 10px 18px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 6, minHeight: 74,
      border: `2px solid ${border}`, background: bg, boxShadow: shadow,
      cursor: isMatched ? "default" : "pointer",
      transition: "border-color .15s, background .15s, box-shadow .15s, color .15s",
      pointerEvents: isMatched ? "none" : "auto",
      color: textColor,
      animation: anim,
    };
  }

  function cardStyleBot(v) {
    const isMatched  = matched.includes(v.id);
    const isSelected = selBot === v.id;
    const isError    = shakingCards.some(s => s.id === v.id && s.zone === "bot");
    const isPulsing  = pulsingIds.includes(v.id);

    let border = "#E5B700";
    let bg     = "rgba(229,183,0,0.10)";
    let shadow = "0 0 9px rgba(229,183,0,0.35)";
    let textColor = "#fff";
    let anim = "none";

    if (isMatched) {
      border = GREEN; bg = GREEN_BG; shadow = `0 0 14px rgba(88,204,2,0.45)`; textColor = GREEN;
    } else if (isError) {
      border = RED; bg = "rgba(255,75,75,0.08)"; shadow = `0 0 10px rgba(255,75,75,0.4)`;
      anim = "shake-err 0.4s ease";
    } else if (isSelected) {
      border = "#ffe34d"; shadow = "0 0 16px rgba(255,227,77,0.6)";
    }
    if (isPulsing) anim = "pulse-ok 0.4s ease";

    return {
      position: "relative", borderRadius: 10, padding: "12px 8px 16px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 4, minHeight: 60,
      border: `2px solid ${border}`, background: bg, boxShadow: shadow,
      cursor: isMatched ? "default" : "pointer",
      transition: "border-color .15s, background .15s, box-shadow .15s, color .15s",
      pointerEvents: isMatched ? "none" : "auto",
      textAlign: "center", color: textColor,
      animation: anim,
    };
  }

  // ── Card content ─────────────────────────────────────────────────────────
  function TopCardContent({ v }) {
    if (round === 1) {
      return (<>
        <span style={{ fontSize: 30, lineHeight: 1 }}>{v.emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{v.it}</span>
      </>);
    }
    return <span style={{ fontSize: 15, fontWeight: 600, fontStyle: "italic" }}>{v.en}</span>;
  }

  function BotCardContent({ v }) {
    if (round === 1) {
      return <span style={{ fontSize: 13, fontWeight: 500, fontStyle: "italic", lineHeight: 1.25 }}>{v.en}</span>;
    }
    return (<>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{v.emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{v.it}</span>
    </>);
  }

  // ── FIX 3: CTA bilingue ──────────────────────────────────────────────────
  function CTAContent() {
    if (roundComplete) {
      return (<>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Avanti</span>
        <span style={{ fontSize: 11, fontWeight: 500, fontStyle: "italic", opacity: 0.8 }}>Next →</span>
      </>);
    }
    return (<>
      <span style={{ fontSize: 14, fontWeight: 700 }}>Abbina le parole ({matched.length}/{totalPairs})</span>
      <span style={{ fontSize: 11, fontWeight: 500, fontStyle: "italic", opacity: 0.8 }}>Match the words ({matched.length}/{totalPairs})</span>
    </>);
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="app-wrapper">
        <TricoloreBar />
        <LessonTopbar unita={unita} lezione={lezione} />
        <TricoloreBar />

        <BarraSecondaria
          current={round}
          total={2}
          progress={progress}
          labelIT="Round"
          labelEN="Round"
          unitType={unitType}
        />

        <div className="app-body">
          <PersonaggioBubble
            character={character}
            textIT={bubble.it}
            textEN={bubble.en}
            feedback={bubble.status || null}
            anim={charAnim || null}
            pulseUntilClick={waitingForClick}
            onSpeakStart={() => setWaitingForClick(false)}
          />

          {/* Top cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(totalPairs, 3)}, 1fr)`,
            gap: 10, marginTop: 4,
          }}>
            {topCards.map(v => (
              <div key={`top-${round}-${v.id}`} style={cardStyleTop(v)} onClick={() => handleSelect(v.id, "top")}>
                <TopCardContent v={v} />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />

          {/* Bottom cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(totalPairs, 3)}, 1fr)`,
            gap: 8,
          }}>
            {botCards.map(v => (
              <div key={`bot-${round}-${v.id}`} style={cardStyleBot(v)} onClick={() => handleSelect(v.id, "bot")}>
                <BotCardContent v={v} />
              </div>
            ))}
          </div>
        </div>

        {/* FIX 3: CTA bilingue su due righe */}
        <div className="app-bottom">
          <button
            onClick={handleAvanti}
            disabled={!roundComplete}
            className="btn-primary"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}
          >
            <CTAContent />
          </button>
        </div>
      </div>
    </>
  );
}

