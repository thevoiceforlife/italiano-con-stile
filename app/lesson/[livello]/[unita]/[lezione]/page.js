"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import CharacterBubble from "../../../../components/CharacterBubble";
import LessonComplete from "../../../../components/LessonComplete";
import { salvaProgressi } from "../../../../components/saveProgress";
import { FraseAnnotata } from "../../../../components/WordPopup";

async function loadLesson(livello, unita, lezione) {
  const file = lezione === "boss" ? "boss" : `lesson${lezione}`;
  const res = await fetch(`/data/lessons/${livello}/unit${unita}/${file}.json`);
  if (!res.ok) throw new Error(`Lezione ${livello}/${unita}/${lezione} non trovata`);
  return res.json();
}

function getUnitType(unita) {
  return parseInt(unita) % 2 !== 0
    ? { it: "Esplorazione", en: "Exploration", color: "#1CB0F6", emoji: "🗺️" }
    : { it: "Consolidamento", en: "Consolidation", color: "#C8A0E8", emoji: "🔁" };
}

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === "correct") {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {}
}

function stableShuffle(arr, seed) {
  const a = [...arr.map((o, i) => ({ o, i }))];
  const s = seed || 7;
  for (let i = a.length - 1; i > 0; i--) {
    const j = (s * (i + 3) + i * 11) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CHAR_COLOR = {
  mario: "#FF9B42", sofia: "#C8A0E8", diego: "#22C55E",
  gino: "#E5B700", matilde: "#1CB0F6", vittoria: "#E5B700",
};

function QBox({ q }) {
  const c = CHAR_COLOR[q?.personaggio] || "#1CB0F6";
  return (
    <div style={{ background: "var(--card)", borderRadius: "var(--r)", border: `2px solid ${c}`, padding: "13px 15px" }}>
      <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text)", lineHeight: 1.5, marginBottom: 4 }}>
        <FraseAnnotata testo={q.domanda.it} annotazioni={q.annotazioni_domanda || []} />
      </div>
      <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>{q.domanda.en}</div>
    </div>
  );
}

function FeedbackBar({ isCorrect, feedbackOk, feedbackErr, onNext }) {
  return (
    <div style={{ background: isCorrect ? "var(--ok-bar)" : "var(--err-bar)", borderTop: `2px solid ${isCorrect ? "var(--ok-text)" : "var(--err-text)"}`, padding: "16px", flexShrink: 0 }}>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", marginBottom: 3 }}>
            {isCorrect ? "✅ Esatto! / Correct!" : "❌ Sbagliato / Wrong"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", opacity: 0.9, lineHeight: 1.5 }}>
            {isCorrect ? feedbackOk?.it : feedbackErr?.it}
          </div>
          <div style={{ fontSize: 11, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", opacity: 0.65, marginTop: 3, fontStyle: "italic" }}>
            {isCorrect ? feedbackOk?.en : feedbackErr?.en}
          </div>
        </div>
        <button onClick={onNext} style={{ background: isCorrect ? "var(--primary)" : "#CC0000", color: "white", padding: "13px 18px", borderRadius: "var(--r)", fontSize: 14, fontWeight: 900, border: "none", boxShadow: `0 4px 0 ${isCorrect ? "var(--primary-d)" : "#990000"}`, textTransform: "uppercase", letterSpacing: "0.6px", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>Avanti →</button>
      </div>
    </div>
  );
}

function CheckBar({ disabled, onCheck, label = "Controlla / Check" }) {
  return (
    <div style={{ padding: "14px 16px", background: "var(--card)", borderTop: "2px solid var(--border)", flexShrink: 0 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <button onClick={disabled ? undefined : onCheck} disabled={disabled} style={{ width: "100%", padding: 15, borderRadius: "var(--r)", fontSize: 15, fontWeight: 900, letterSpacing: "0.6px", border: "none", textTransform: "uppercase", fontFamily: "inherit", background: disabled ? "var(--dis-bg)" : "var(--primary)", color: disabled ? "var(--dis-text)" : "white", boxShadow: disabled ? "none" : "0 4px 0 var(--primary-d)", cursor: disabled ? "not-allowed" : "pointer" }}>{label}</button>
      </div>
    </div>
  );
}

function DomandaMultipla({ q, onAnswer }) {
  const seed = (q.domanda?.it || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = useRef(stableShuffle(q.opzioni, seed)).current;
  const newCorrect = shuffled.findIndex(x => x.i === q.correct);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const isCorrect = selected === newCorrect;
  const getOptIt = (opt) => typeof opt === "string" ? opt : opt.it;
  const getOptEn = (opt) => typeof opt === "object" ? opt.en : null;
  return (
    <>
      <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto", width: "100%", overflowY: "auto" }}>
        <CharacterBubble character={q.personaggio} text={`${q.intro} / ${q.intro_en}`} speakText={q.intro} autoSpeak={true} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} />
        {q.gesture && (
          <div style={{ background: "var(--card)", border: "2px solid var(--border)", borderRadius: "var(--r)", padding: 20, textAlign: "center" }}>
            <span style={{ fontSize: 64, lineHeight: 1 }}>{q.gesture}</span>
            {q.gesture_label && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{q.gesture_label}</div>}
          </div>
        )}
        {q.contesto_it && (
          <div style={{ background: "var(--card)", border: `2px solid ${CHAR_COLOR[q.personaggio]}`, borderRadius: "var(--r)", padding: "13px 15px" }}>
            <div style={{ fontSize: 10, color: "#E5B700", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>⚠️ Falso amico / False friend</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text)", marginBottom: 4 }}>{q.domanda.it}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", marginBottom: 10 }}>{q.domanda.en}</div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 11px" }}>
              <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--text)" }}>{q.contesto_it}</div>
              <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--text3)", marginTop: 3 }}>{q.contesto_en}</div>
            </div>
          </div>
        )}
        {!q.contesto_it && !q.gesture && <QBox q={q} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {shuffled.map(({ o: opt }, si) => {
            const isThisCorrect = si === newCorrect;
            let bg = "var(--opt-bg)", border = "var(--opt-border)", color = "var(--opt-text)", shadow = "0 4px 0 var(--border)";
            if (confirmed) {
              shadow = "none";
              if (isThisCorrect) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
              else if (si === selected) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
            } else if (selected === si) { bg = "var(--opt-sel-bg)"; border = "var(--opt-sel-b)"; color = "var(--opt-sel-text)"; shadow = "0 4px 0 var(--opt-sel-b)"; }
            return (
              <button key={si} onClick={() => !confirmed && setSelected(si)} style={{ background: bg, border: `2px solid ${border}`, color, borderRadius: "var(--r)", padding: "12px 14px", textAlign: "left", fontFamily: "inherit", width: "100%", cursor: confirmed ? "default" : "pointer", transition: "background 0.15s, border 0.15s", boxShadow: shadow }}>
                <div style={{ fontSize: 14, fontWeight: 800, pointerEvents: "none" }}>{getOptIt(opt)}</div>
                {getOptEn(opt) && <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.75, fontStyle: "italic", marginTop: 2, pointerEvents: "none" }}>{getOptEn(opt)}</div>}
              </button>
            );
          })}
        </div>
      </div>
      {confirmed
        ? <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
        : <CheckBar disabled={selected === null} onCheck={() => { setConfirmed(true); playSound(isCorrect ? "correct" : "wrong"); }} />}
    </>
  );
}

function DomandaVeroFalso({ q, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const isCorrect = selected === q.correct;
  function handleSelect(val) {
    if (confirmed) return;
    setSelected(val); setConfirmed(true);
    playSound(val === q.correct ? "correct" : "wrong");
  }
  return (
    <>
      <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto", width: "100%", overflowY: "auto" }}>
        <CharacterBubble character={q.personaggio} text={`${q.intro} / ${q.intro_en}`} speakText={q.intro} autoSpeak={true} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} />
        <div style={{ background: "var(--card)", borderRadius: "var(--r)", border: `2px solid ${CHAR_COLOR[q.personaggio]}`, padding: "14px 15px" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text)", lineHeight: 1.5, marginBottom: 4 }}>{q.domanda.it}</div>
          <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>{q.domanda.en}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[true, false].map(val => {
            let bg = "var(--card)", border = "var(--border)", color = "var(--text)";
            if (confirmed) {
              if (val === q.correct) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
              else if (val === selected) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
            }
            return (
              <button key={String(val)} onClick={() => handleSelect(val)} disabled={confirmed} style={{ flex: 1, padding: 14, borderRadius: "var(--r)", border: `2px solid ${border}`, background: bg, color, fontSize: 14, fontWeight: 900, cursor: confirmed ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {val ? "✅ Vero / True" : "❌ Falso / False"}
              </button>
            );
          })}
        </div>
      </div>
      {confirmed && <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />}
    </>
  );
}

function DomandaAscolta({ q, onAnswer }) {
  const seed = (q.audio || "").length * 3 + 5;
  const shuffled = useRef(stableShuffle(q.opzioni, seed)).current;
  const newCorrect = shuffled.findIndex(x => x.i === q.correct);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [audioLabel, setAudioLabel] = useState("Clicca 🔊 per ascoltare / Click 🔊 to listen");
  const isCorrect = selected === newCorrect;
  useEffect(() => { return () => window.speechSynthesis?.cancel(); }, []);
  function playAudio(slow = false) {
    if (!q.audio) return;
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(q.audio);
      u.lang = "it-IT"; u.rate = slow ? 0.4 : 0.9;
      window.speechSynthesis.speak(u);
      setAudioLabel((slow ? "🐢 " : "🔊 ") + `"${q.audio}"`);
    }, 50);
  }
  const getOptIt = (opt) => typeof opt === "string" ? opt : opt.it;
  const getOptEn = (opt) => typeof opt === "object" ? opt.en : null;
  return (
    <>
      <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto", width: "100%", overflowY: "auto" }}>
        <CharacterBubble character={q.personaggio} text={`${q.intro} / ${q.intro_en}`} speakText={q.intro} autoSpeak={true} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} />
        <div style={{ background: "var(--card)", border: `2px solid ${CHAR_COLOR[q.personaggio]}`, borderRadius: "var(--r)", padding: "13px 15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <button onClick={() => playAudio(false)} style={{ background: "#FF9B42", border: "none", borderRadius: "99px", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>🔊</button>
            <button onClick={() => playAudio(true)} style={{ background: "#1CB0F622", border: "1.5px solid #1CB0F644", borderRadius: "99px", padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "var(--secondary)", cursor: "pointer", fontFamily: "inherit" }}>🐢 Lento / Slow</button>
            <span style={{ fontSize: 11, color: "var(--text2)", fontStyle: "italic", flex: 1 }}>{audioLabel}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text)", lineHeight: 1.5 }}>{q.domanda.it}</div>
          <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", marginTop: 2 }}>{q.domanda.en}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {shuffled.map(({ o: opt }, si) => {
            const isThisCorrect = si === newCorrect;
            let bg = "var(--opt-bg)", border = "var(--opt-border)", color = "var(--opt-text)", shadow = "0 4px 0 var(--border)";
            if (confirmed) {
              shadow = "none";
              if (isThisCorrect) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
              else if (si === selected) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
            } else if (selected === si) { bg = "var(--opt-sel-bg)"; border = "var(--opt-sel-b)"; color = "var(--opt-sel-text)"; shadow = "0 4px 0 var(--opt-sel-b)"; }
            return (
              <button key={si} onClick={() => !confirmed && setSelected(si)} style={{ background: bg, border: `2px solid ${border}`, color, borderRadius: "var(--r)", padding: "12px 14px", textAlign: "left", fontFamily: "inherit", width: "100%", cursor: confirmed ? "default" : "pointer", transition: "background 0.15s, border 0.15s", boxShadow: shadow }}>
                <div style={{ fontSize: 14, fontWeight: 800, pointerEvents: "none" }}>{getOptIt(opt)}</div>
                {getOptEn(opt) && <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.75, fontStyle: "italic", marginTop: 2, pointerEvents: "none" }}>{getOptEn(opt)}</div>}
              </button>
            );
          })}
        </div>
      </div>
      {confirmed
        ? <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
        : <CheckBar disabled={selected === null} onCheck={() => { setConfirmed(true); playSound(isCorrect ? "correct" : "wrong"); }} />}
    </>
  );
}

function DomandaWordBank({ q, onAnswer }) {
  const correct = q.correct || q.parole || q.words || [];
  const pool = [...(q.parole || q.words || []), ...(q.distrattori || [])];
  const [shuffled] = useState(() => [...pool].sort(() => Math.random() - 0.5));
  const [target, setTarget] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const usedCounts = {};
  target.forEach(w => { usedCounts[w] = (usedCounts[w] || 0) + 1; });
  function addWord(w) {
    const avail = pool.filter(x => x === w).length;
    if ((usedCounts[w] || 0) < avail) { setTarget(t => [...t, w]); setFeedback(null); }
  }
  function removeWord(i) { if (feedback === "ok") return; setTarget(t => t.filter((_, idx) => idx !== i)); setFeedback(null); }
  function handleCheck() {
    if (target.length === 0) return;
    if (target.length < correct.length) { setFeedback("incomplete"); return; }
    const ok = JSON.stringify(target) === JSON.stringify(correct);
    if (ok) { setFeedback("ok"); playSound("correct"); }
    else { if (attempts === 0) setAttempts(1); setFeedback("err"); playSound("wrong"); }
  }
  function handleRetry() { setTarget([]); setFeedback(null); }
  const fbColor = feedback === "ok" ? "var(--ok-text)" : feedback === "incomplete" ? "#E5B700" : "var(--err-text)";
  const fbBg = feedback === "ok" ? "var(--ok-bar)" : feedback === "incomplete" ? "#1a1200" : "var(--err-bar)";
  const fbBorder = feedback === "ok" ? "var(--ok-text)" : feedback === "incomplete" ? "#E5B70088" : "var(--err-text)";
  return (
    <>
      <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto", width: "100%", overflowY: "auto" }}>
        <CharacterBubble character={q.personaggio} text={`${q.intro} / ${q.intro_en}`} speakText={q.intro} autoSpeak={true} feedback={feedback === "ok" ? "ok" : feedback === "err" ? "err" : null} />
        {(q.hint_it || q.hintIt) && (
          <div style={{ background: "var(--bg)", borderLeft: "3px solid #C8A0E8", borderRadius: "0 8px 8px 0", padding: "8px 11px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#C8A0E8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>💡 Suggerimento / Hint</div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
              <strong>IT:</strong> {q.hint_it || q.hintIt}<br />
              <em><strong>EN:</strong> {q.hint_en || q.hintEn}</em>
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Componi la frase / Build the sentence — tocca per rimuovere / tap to remove:</div>
        <div style={{ background: "var(--bg)", border: `2px dashed ${feedback === "ok" ? "var(--ok-text)" : feedback === "err" ? "var(--err-text)" : "var(--border)"}`, borderRadius: "var(--r)", padding: "10px 12px", minHeight: 50, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", transition: "border-color 0.2s" }}>
          {target.length === 0
            ? <span style={{ color: "var(--text3)", fontSize: 12 }}>Tocca le parole qui sotto / Tap words below</span>
            : target.map((w, i) => <button key={i} onClick={() => removeWord(i)} style={{ background: "#C8A0E818", border: "2px solid #C8A0E8", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 800, color: "#C8A0E8", cursor: feedback === "ok" ? "default" : "pointer", fontFamily: "inherit" }}>{w}</button>)}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "right" }}>{target.length}/{correct.length} parole / words</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {shuffled.map((w, i) => {
            const avail = pool.filter(x => x === w).length;
            const isUsed = (usedCounts[w] || 0) >= avail;
            return <button key={i} onClick={() => !isUsed && feedback !== "ok" && addWord(w)} disabled={isUsed || feedback === "ok"} style={{ background: "var(--card)", border: "2px solid var(--border)", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 800, color: "var(--text)", cursor: isUsed ? "not-allowed" : "pointer", opacity: isUsed ? 0.25 : 1, fontFamily: "inherit", transition: "all 0.15s" }}>{w}</button>;
          })}
        </div>
        {feedback && (
          <div style={{ background: fbBg, border: `1.5px solid ${fbBorder}`, borderRadius: "var(--r)", padding: "11px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: fbColor, marginBottom: 2 }}>
              {feedback === "ok" ? "✅ Esatto! / Correct!" : feedback === "incomplete" ? "⚠️ Incompleta / Incomplete" : "❌ Non corretto / Wrong"}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: fbColor, lineHeight: 1.5 }}>
              {feedback === "ok" ? q.feedbackOk?.it : feedback === "incomplete" ? "Aggiungi altre parole! / Add more words!" : q.feedbackErr?.it}
            </div>
            {feedback !== "incomplete" && <div style={{ fontSize: 11, color: fbColor, opacity: 0.7, fontStyle: "italic", marginTop: 2 }}>{feedback === "ok" ? q.feedbackOk?.en : q.feedbackErr?.en}</div>}
          </div>
        )}
      </div>
      {feedback === "ok"
        ? <div style={{ padding: "14px 16px", background: "var(--card)", borderTop: "2px solid var(--border)", flexShrink: 0 }}><div style={{ maxWidth: 480, margin: "0 auto" }}><button onClick={() => { window.speechSynthesis?.cancel(); onAnswer(true); }} style={{ width: "100%", padding: 15, borderRadius: "var(--r)", border: "none", background: "var(--secondary)", color: "white", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.6px", boxShadow: "0 4px 0 #0e7cb0" }}>Avanti / Next →</button></div></div>
        : feedback === "err" || feedback === "incomplete"
          ? <div style={{ padding: "14px 16px", background: "var(--card)", borderTop: "2px solid var(--border)", flexShrink: 0 }}><div style={{ maxWidth: 480, margin: "0 auto" }}><button onClick={handleRetry} style={{ width: "100%", padding: 15, borderRadius: "var(--r)", border: "none", background: "#E5B700", color: "white", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.6px", boxShadow: "0 4px 0 #b8920b" }}>🔁 Riprova / Try again</button></div></div>
          : <CheckBar disabled={target.length === 0} onCheck={handleCheck} />}
    </>
  );
}

function DomandaAbbina({ q, onAnswer }) {
  const [selIT, setSelIT] = useState(null);
  const [selEN, setSelEN] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrong, setWrong] = useState(null);
  const [done, setDone] = useState(false);
  const shuffIT = useRef([...q.coppie].sort(() => Math.random() - 0.5));
  const shuffEN = useRef([...q.coppie].sort(() => Math.random() - 0.5));
  const allMatched = Object.keys(matched).length === q.coppie.length;
  useEffect(() => { if (allMatched && !done) { setDone(true); playSound("correct"); } }, [matched]);
  function handleIT(it) { if (matched[it] || done) return; setSelIT(it); if (selEN !== null) tryMatch(it, selEN); }
  function handleEN(en) { if (Object.values(matched).includes(en) || done) return; setSelEN(en); if (selIT !== null) tryMatch(selIT, en); }
  function tryMatch(it, en) {
    const pair = q.coppie.find(c => c.it === it);
    if (pair && pair.en === en) { setMatched(m => ({ ...m, [it]: en })); setSelIT(null); setSelEN(null); }
    else { setWrong({ it, en }); setTimeout(() => { setSelIT(null); setSelEN(null); setWrong(null); }, 700); }
  }
  return (
    <>
      <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto", width: "100%", overflowY: "auto" }}>
        <CharacterBubble character={q.personaggio} text={`${q.intro} / ${q.intro_en}`} speakText={q.intro} autoSpeak={true} feedback={allMatched ? "ok" : null} />
        <QBox q={q} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shuffIT.current.map(({ it }) => {
              const isMatched = !!matched[it], isSel = selIT === it, isWrong = wrong?.it === it;
              let bg = "var(--card)", border = "var(--border)", color = "var(--text)";
              if (isMatched) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
              else if (isWrong) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
              else if (isSel) { bg = "var(--opt-sel-bg)"; border = "var(--opt-sel-b)"; color = "var(--opt-sel-text)"; }
              return <button key={it} onClick={() => !isMatched && handleIT(it)} style={{ background: bg, border: `2px solid ${border}`, color, borderRadius: "var(--r)", padding: "11px 12px", fontSize: 13, fontWeight: 800, cursor: isMatched ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "left" }}>{it}</button>;
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shuffEN.current.map(({ en }) => {
              const isMatched = Object.values(matched).includes(en), isSel = selEN === en, isWrong = wrong?.en === en;
              let bg = "var(--card)", border = "var(--border)", color = "var(--text)";
              if (isMatched) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
              else if (isWrong) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
              else if (isSel) { bg = "var(--opt-sel-bg)"; border = "var(--opt-sel-b)"; color = "var(--opt-sel-text)"; }
              return <button key={en} onClick={() => !isMatched && handleEN(en)} style={{ background: bg, border: `2px solid ${border}`, color, borderRadius: "var(--r)", padding: "11px 12px", fontSize: 12, fontWeight: 700, cursor: isMatched ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "left", fontStyle: "italic" }}>{en}</button>;
            })}
          </div>
        </div>
        {allMatched && (
          <div style={{ background: "var(--ok-bar)", border: "1.5px solid var(--ok-text)", borderRadius: "var(--r)", padding: "11px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ok-text)", marginBottom: 2 }}>✅ Esatto! / Correct!</div>
            <div style={{ fontSize: 12, color: "var(--ok-text)", lineHeight: 1.5 }}>{q.feedbackOk?.it}</div>
            <div style={{ fontSize: 11, color: "var(--ok-text)", opacity: 0.7, fontStyle: "italic", marginTop: 2 }}>{q.feedbackOk?.en}</div>
          </div>
        )}
      </div>
      {allMatched && (
        <div style={{ padding: "14px 16px", background: "var(--card)", borderTop: "2px solid var(--border)", flexShrink: 0 }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <button onClick={() => { window.speechSynthesis?.cancel(); onAnswer(true); }} style={{ width: "100%", padding: 15, borderRadius: "var(--r)", border: "none", background: "var(--secondary)", color: "white", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.6px", boxShadow: "0 4px 0 #0e7cb0" }}>Avanti / Next →</button>
          </div>
        </div>
      )}
    </>
  );
}

function VocabIntro({ lesson, unitType, unita, lezione, onComplete }) {
  const router = useRouter();
  const [toccate, setToccate] = useState(new Set());
  const tutteVisitate = toccate.size >= lesson.vocab.length;
  function handleTap(v) {
    setToccate(prev => new Set([...prev, v.id]));
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(v.it);
      u.lang = "it-IT"; u.rate = 0.88;
      window.speechSynthesis.speak(u);
    }, 80);
  }
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "var(--card)", borderBottom: "2px solid var(--border)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <button onClick={() => { if (window.confirm("Tornare alla home? / Go back home?\n\nIl progresso di questa lezione non verrà salvato.\nYour progress on this lesson won't be saved.")) { window.speechSynthesis?.cancel(); router.push('/'); } }} style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: "5px 11px", fontSize: 11, fontWeight: 900, color: "var(--text2)", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, letterSpacing: "0.04em" }}>🏠 Home</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Unità {unita} · Lezione {lezione} / Unit {unita} · Lesson {lezione}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{lesson.title}</div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: unitType.color, background: `${unitType.color}22`, border: `1px solid ${unitType.color}66`, borderRadius: 99, padding: "3px 9px" }}>
            {unitType.emoji} {unitType.it === "Esplorazione" ? "Nuovi contenuti / New content" : "Ripasso / Review"}
          </div>
        </div>
        <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${Math.round((toccate.size / lesson.vocab.length) * 25)}%`, height: "100%", background: "var(--primary)", borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>
      <div style={{ flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <CharacterBubble character="mario" text="Benvenuto! Tocca ogni parola per impararla. / Welcome! Tap each word to learn it." speakText="Benvenuto! Tocca ogni parola per impararla." autoSpeak={true} />
        {lesson.vocab.map(v => {
          const toccata = toccate.has(v.id);
          return (
            <div key={v.id} onClick={() => handleTap(v)} style={{ background: toccata ? "var(--opt-sel-bg)" : "var(--card)", border: `2px solid ${toccata ? "var(--opt-sel-b)" : "var(--border)"}`, borderRadius: "var(--r)", padding: "15px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, boxShadow: toccata ? "0 4px 0 var(--opt-sel-b)" : "0 4px 0 var(--border)", transition: "background 0.2s, border 0.2s" }}>
              <div style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{v.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 20, color: toccata ? "var(--opt-sel-text)" : "var(--text)", marginBottom: 2 }}>{v.it}</div>
                <div style={{ fontSize: 13, color: "var(--text3)", fontWeight: 700 }}>{v.en}</div>
                {toccata && v.mario && (
                  <div style={{ fontSize: 12, color: "var(--text2)", fontStyle: "italic", marginTop: 5, lineHeight: 1.4 }}>
                    <FraseAnnotata testo={v.mario} annotazioni={v.annotazioni || []} />
                  </div>
                )}
              </div>
              {toccata && <span style={{ fontSize: 20 }}>✅</span>}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "14px 16px", background: "var(--card)", borderTop: "2px solid var(--border)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <button onClick={tutteVisitate ? onComplete : undefined} disabled={!tutteVisitate} style={{ width: "100%", padding: 15, borderRadius: "var(--r)", fontSize: 15, fontWeight: 900, letterSpacing: "0.6px", border: "none", textTransform: "uppercase", fontFamily: "inherit", background: tutteVisitate ? "var(--primary)" : "var(--dis-bg)", color: tutteVisitate ? "white" : "var(--dis-text)", boxShadow: tutteVisitate ? "0 4px 0 var(--primary-d)" : "none", cursor: tutteVisitate ? "pointer" : "not-allowed" }}>
            {tutteVisitate ? "Inizia il Quiz / Start Quiz →" : `Scopri tutte le parole (${toccate.size}/${lesson.vocab.length})`}
          </button>
        </div>
      </div>
    </main>
  );
}

function DomandaRouter({ q, onAnswer }) {
  if (!q) return null;
  switch (q.tipo) {
    case "vero_falso":     return <DomandaVeroFalso key={q.domanda?.it} q={q} onAnswer={onAnswer} />;
    case "ascolta_scegli": return <DomandaAscolta   key={q.domanda?.it} q={q} onAnswer={onAnswer} />;
    case "word_bank":      return <DomandaWordBank   key={q.domanda?.it} q={q} onAnswer={onAnswer} />;
    case "abbina_coppia":  return <DomandaAbbina     key={q.domanda?.it} q={q} onAnswer={onAnswer} />;
    default:               return <DomandaMultipla   key={q.domanda?.it} q={q} onAnswer={onAnswer} />;
  }
}

function QuizFase({ lesson, unitType, unita, lezione, onComplete }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const q = lesson.questions[current];
  const total = lesson.questions.length;
  const faseMap = { riconoscimento: "Riconoscimento", comprensione: "Comprensione / Comprehension", produzione: "Produzione / Production" };
  function handleAnswer(isCorrect) {
    if (isCorrect) setScore(s => s + 1);
    if (current + 1 >= total) onComplete(isCorrect ? score + 1 : score);
    else setCurrent(c => c + 1);
  }
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "var(--card)", borderBottom: "2px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => { if (window.confirm("Tornare alla home? / Go back home?\n\nIl progresso di questa lezione non verrà salvato.\nYour progress on this lesson won't be saved.")) { window.speechSynthesis?.cancel(); router.push('/'); } }} style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: "5px 11px", fontSize: 11, fontWeight: 900, color: "var(--text2)", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, letterSpacing: "0.04em" }}>🏠 Home</button>
                Unità {unita} · {current + 1}/{total}
              </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--text3)", fontWeight: 600, textTransform: "none", fontSize: 10 }}>{faseMap[q?.fase] || ""}</span>
              <div style={{ fontSize: 9, fontWeight: 800, color: unitType.color, background: `${unitType.color}22`, border: `1px solid ${unitType.color}55`, borderRadius: 99, padding: "2px 7px" }}>
                {unitType.emoji} {unitType.it}
              </div>
            </div>
          </div>
          <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${25 + Math.round((current / total) * 75)}%`, height: "100%", background: "var(--primary)", borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 900, color: "var(--primary)" }}>{score} ✅</span>
      </div>
      {q && <DomandaRouter key={current} q={q} onAnswer={handleAnswer} />}
    </main>
  );
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const { livello, unita, lezione } = params;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fase, setFase] = useState("intro");
  const [reward, setReward] = useState(null);
  const unitType = getUnitType(unita);

  useEffect(() => {
    loadLesson(livello, unita, lezione)
      .then(data => { setLesson(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [livello, unita, lezione]);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>☕</div>
        <p style={{ fontSize: 14, color: "var(--text3)" }}>Caricamento... / Loading...</p>
      </div>
    </main>
  );

  if (error || !lesson) return (
    <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😅</div>
        <p style={{ fontSize: 15, fontWeight: 800, color: "var(--err-text)", marginBottom: 8 }}>Lezione non trovata / Lesson not found</p>
        <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>{livello} / Unità {unita} / Lezione {lezione}</p>
        <button onClick={() => router.push("/")} style={{ background: "var(--primary)", color: "white", padding: "12px 24px", borderRadius: "var(--r)", border: "none", fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>← Home</button>
      </div>
    </main>
  );

  if (fase === "done" && reward) return <LessonComplete reward={reward} onHome={() => router.push("/")} />;

  if (fase === "intro") {
    if (!lesson.vocab || lesson.vocab.length === 0) {
      return (
        <QuizFase lesson={lesson} unitType={unitType} unita={unita} lezione={lezione} onComplete={corrette => {
          const lessonId = lezione === "boss" ? "boss" : parseInt(lezione);
          const r = salvaProgressi({ tipo: "lezione", lessonId, corrette, totDomande: lesson.questions.length });
          setReward(r); setFase("done");
        }} />
      );
    }
    return <VocabIntro lesson={lesson} unitType={unitType} unita={unita} lezione={lezione} onComplete={() => setFase("quiz")} />;
  }

  return (
    <QuizFase lesson={lesson} unitType={unitType} unita={unita} lezione={lezione} onComplete={corrette => {
      const lessonId = lezione === "boss" ? "boss" : parseInt(lezione);
      const r = salvaProgressi({ tipo: "lezione", lessonId, corrette, totDomande: lesson.questions.length });
      setReward(r); setFase("done");
    }} />
  );
}
