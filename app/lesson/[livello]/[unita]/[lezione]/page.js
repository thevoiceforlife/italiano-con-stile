"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import PersonaggioBubble from "../../../../components/PersonaggioBubble";
import BarraSecondaria from "../../../../components/BarraSecondaria";
import LessonComplete from "../../../../components/LessonComplete";
import LessonTopbar from "../../../../components/LessonTopbar";
import TricoloreBar from "../../../../components/TricoloreBar";
import { pronounce, cleanForTTS } from "../../../../components/pronounce";
import { salvaProgressi } from "../../../../components/saveProgress";
import { FraseAnnotata } from "../../../../components/WordPopup";
import VocabMatch from "../../../../components/VocabMatch";
import BossIntroPopup from "../../../../components/BossIntroPopup";

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

// ─── Bilingual helpers ────────────────────────────────────────────────────────
// Parole-chiave italiane per riconoscere quale parte di "IT / EN" è italiana
const IT_KEYWORDS = /\b(è|sei|un|una|uno|il|lo|la|gli|le|di|da|in|su|con|per|che|non|più|qui|così|ora|sempre|quasi|questa|questo|questi|ecco|bravo|brava|bravi|esatto|perfetto|facile|veloce|ordina|ultima|prima|dopo|cosa|dove|quando|perché|come|ciao|grazie|prego|sì|no|al|alla|del|della|dei|delle|nel|nella|e|o|ma|se|fra|tra|hai|ho|ha|sono|è|era|sarà|fai|fa|va|ti|mi|ci|vi|si)\b/gi;
const EN_KEYWORDS = /\b(the|is|are|was|were|be|you|your|i|we|he|she|it|what|which|how|where|when|why|who|at|on|in|to|of|for|from|with|and|or|but|if|a|an|this|that|these|those|very|here|there|go|come|do|does|have|has|had|let's|you're|it's|one|two|quick|fast|easy|now|then|well|great|done|time|bar|order|build|mix|food|food|final|listen)\b/gi;

function countMatches(s, regex) {
  const m = s.match(regex);
  return m ? m.length : 0;
}

// Data una stringa che può essere "IT / EN" oppure "EN / IT", restituisce {it, en}
export function splitBilingual(text) {
  if (!text) return { it: "", en: "" };
  const s = String(text);
  if (!s.includes(" / ")) return { it: s, en: "" };
  const parts = s.split(" / ").map(p => p.trim());
  if (parts.length !== 2) return { it: s, en: "" };
  const [a, b] = parts;
  const aIT = countMatches(a, IT_KEYWORDS);
  const bIT = countMatches(b, IT_KEYWORDS);
  const aEN = countMatches(a, EN_KEYWORDS);
  const bEN = countMatches(b, EN_KEYWORDS);
  const aScore = aIT - aEN;
  const bScore = bIT - bEN;
  // aScore alto = a è più italiano
  if (aScore >= bScore) return { it: a, en: b };
  return { it: b, en: a };
}

// Estrae la parte IT dall'intro della domanda (gestisce sia formato v1 che v2)
// Restituisce sempre stringhe pulite — mai undefined/null/"undefined"
function cleanStr(x) {
  if (x === undefined || x === null) return "";
  const s = String(x).trim();
  if (s === "undefined" || s === "null") return "";
  return s;
}
function getIntroBilingual(q) {
  // I JSON usano sia "introIT" (camelCase) che "intro_it" (snake_case)
  const introIt = cleanStr(q.introIT) || cleanStr(q.intro_it);
  const introEn = cleanStr(q.intro_en);
  const intro   = cleanStr(q.intro);

  // Campi separati: introIT + intro_en
  if (introIt && introEn) return { it: introIt, en: introEn };
  // Solo introIT
  if (introIt) return { it: introIt, en: "" };
  // intro semplice (senza " / ") + intro_en separato
  if (intro && introEn && !intro.includes(" / ")) return { it: intro, en: introEn };
  // Legacy: intro concatenato "IT / EN" o "EN / IT"
  if (intro) return splitBilingual(intro);
  return { it: "", en: "" };
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
  const domandaIT = q.domanda?.it || "";
  const [speaking, setSpeaking] = useState(false);

  function handleClick() {
    if (!domandaIT || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(cleanForTTS(domandaIT));
    u.lang = "it-IT"; u.rate = 0.85;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setTimeout(() => { try { window.speechSynthesis.speak(u); } catch {} }, 50);
  }

  return (
    <div
      className="q-card"
      onClick={handleClick}
      title="Clicca per ascoltare · Click to listen"
      style={{
        borderColor: speaking ? "var(--special)" : c,
        boxShadow: speaking ? "0 0 16px rgba(255,149,0,0.7)" : "none",
        position: "relative",
        cursor: domandaIT ? "pointer" : "default",
        paddingRight: 28,
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="q-card__it">
        <FraseAnnotata testo={domandaIT} annotazioni={q.annotazioni_domanda || []} />
      </div>
      <div className="q-card__en">{q.domanda?.en || ""}</div>
      {domandaIT && (
        <span aria-hidden="true" style={{ position: "absolute", bottom: 6, right: 8, fontSize: 11, opacity: 0.55, pointerEvents: "none" }}>🔊</span>
      )}
    </div>
  );
}

function FeedbackBar({ isCorrect, feedbackOk, feedbackErr, onNext }) {
  const col = isCorrect ? "var(--ok-text)" : "var(--err-text)";
  return (
    <div className="app-bottom app-bottom--feedback" style={{ background: isCorrect ? "var(--ok-bar)" : "var(--err-bar)", borderTop: `2px solid ${col}` }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 900, color: col, lineHeight: 1.2, textTransform: "none", letterSpacing: "normal" }}>
          {isCorrect ? "✅ Esatto!" : "❌ Sbagliato!"}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, fontStyle: "italic", color: col, opacity: 0.8, lineHeight: 1.2 }}>
          {isCorrect ? "Correct!" : "Wrong!"}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: col, opacity: 0.95, lineHeight: 1.35, marginTop: 4 }}>
          {isCorrect ? feedbackOk?.it : feedbackErr?.it}
        </div>
        <div style={{ fontSize: 13, color: col, opacity: 0.7, marginTop: 2, fontStyle: "italic", lineHeight: 1.35 }}>
          {isCorrect ? feedbackOk?.en : feedbackErr?.en}
        </div>
      </div>
      <button onClick={onNext} className={isCorrect ? "btn-primary" : "btn-primary btn-primary--err"}>
        Avanti · Next →
      </button>
    </div>
  );
}

function CheckBar({ disabled, onCheck, labelIT = "Controlla", labelEN = "Check" }) {
  return (
    <div className="app-bottom">
      <button onClick={disabled ? undefined : onCheck} disabled={disabled} className="btn-primary">
        {labelIT} · {labelEN}
      </button>
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
  const intro = getIntroBilingual(q);
  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!confirmed} />
        {q.gesture && (
          <div style={{ background: "var(--card)", border: "2px solid var(--border)", borderRadius: "var(--r)", padding: 20, textAlign: "center" }}>
            <span style={{ fontSize: 64, lineHeight: 1 }}>{q.gesture}</span>
            {q.gesture_label && <div style={{ fontSize: 14, color: "var(--text3)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{q.gesture_label}</div>}
          </div>
        )}
        {q.contesto_it && (
          <div className="q-card" style={{ borderColor: CHAR_COLOR[q.personaggio] }}>
            <div style={{ fontSize: 13, color: "#E5B700", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>⚠️ Falso amico · False friend</div>
            <div className="q-card__it">{q.domanda.it}</div>
            <div className="q-card__en">{q.domanda.en}</div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 11px", marginTop: 10 }}>
              <div style={{ fontSize: 16, fontStyle: "italic", color: "var(--text)" }}>{q.contesto_it}</div>
              <div style={{ fontSize: 14, fontStyle: "italic", color: "var(--text3)", marginTop: 3 }}>{q.contesto_en}</div>
            </div>
          </div>
        )}
        {!q.contesto_it && !q.gesture && <QBox q={q} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {shuffled.map(({ o: opt }, si) => {
            const isThisCorrect = si === newCorrect;
            const styleExtra = {};
            if (confirmed) {
              styleExtra.boxShadow = "none";
              if (isThisCorrect) { styleExtra.background = "var(--ok-bar)"; styleExtra.borderColor = "var(--ok-text)"; styleExtra.color = "var(--ok-text)"; }
              else if (si === selected) { styleExtra.background = "var(--err-bar)"; styleExtra.borderColor = "var(--err-text)"; styleExtra.color = "var(--err-text)"; }
            } else if (selected === si) {
              styleExtra.background = "var(--opt-sel-bg)";
              styleExtra.borderColor = "var(--opt-sel-b)";
              styleExtra.color = "var(--opt-sel-text)";
              styleExtra.boxShadow = "0 4px 0 var(--opt-sel-b)";
            } else {
              styleExtra.boxShadow = "0 4px 0 var(--border)";
            }
            const optIt = getOptIt(opt);
            return (
              <button
                key={si}
                onClick={() => {
                  if (confirmed) return;
                  if (optIt) pronounce(optIt);
                  setSelected(si);
                }}
                className="opt-card"
                style={{ ...styleExtra, position: "relative", cursor: confirmed ? "default" : "pointer" }}
              >
                <div className="opt-card__it" style={styleExtra.color ? { color: styleExtra.color } : undefined}>{optIt}</div>
                {getOptEn(opt) && <div className="opt-card__en" style={styleExtra.color ? { color: styleExtra.color, opacity: 0.75 } : undefined}>{getOptEn(opt)}</div>}
                {!confirmed && (
                  <span aria-hidden="true" style={{ position: "absolute", bottom: 4, right: 6, fontSize: 11, opacity: 0.55, pointerEvents: "none" }}>🔊</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {confirmed
        ? <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
        : <CheckBar disabled={selected === null} onCheck={() => {
            setConfirmed(true);
            playSound(isCorrect ? "correct" : "wrong");
            if (isCorrect && selected !== null) {
              const correctOpt = shuffled[newCorrect]?.o;
              const it = typeof correctOpt === "string" ? correctOpt : correctOpt?.it;
              if (it) pronounce(it);
            }
          }} />}
    </>
  );
}

function DomandaVeroFalso({ q, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const isCorrect = selected === q.correct;
  const intro = getIntroBilingual(q);

  function handleSelect(val) {
    if (confirmed) return;
    pronounce(val ? "Vero" : "Falso");
    setSelected(val);
    setConfirmed(true);
    playSound(val === q.correct ? "correct" : "wrong");
  }
  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!confirmed} />
        <div className="q-card" style={{ borderColor: CHAR_COLOR[q.personaggio] }}>
          <div className="q-card__it">{q.domanda.it}</div>
          <div className="q-card__en">{q.domanda.en}</div>
        </div>
      </div>
      {confirmed ? (
        <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
      ) : (
        <div className="app-bottom" style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => handleSelect(true)}
            style={{
              flex: 1, height: 56, fontSize: 16, fontWeight: 700,
              borderRadius: "var(--r)",
              background: "var(--card)",
              border: "2px solid #58cc02",
              color: "#58cc02",
              cursor: "pointer", fontFamily: "inherit",
              textTransform: "none", letterSpacing: "normal",
              lineHeight: 1.2, padding: "0 10px",
            }}
          >
            <div>✅ Vero</div>
            <div style={{ fontSize: 12, fontStyle: "italic", fontWeight: 500, opacity: 0.85 }}>True</div>
          </button>
          <button
            onClick={() => handleSelect(false)}
            style={{
              flex: 1, height: 56, fontSize: 16, fontWeight: 700,
              borderRadius: "var(--r)",
              background: "var(--card)",
              border: "2px solid #ff4b4b",
              color: "#ff4b4b",
              cursor: "pointer", fontFamily: "inherit",
              textTransform: "none", letterSpacing: "normal",
              lineHeight: 1.2, padding: "0 10px",
            }}
          >
            <div>❌ Falso</div>
            <div style={{ fontSize: 12, fontStyle: "italic", fontWeight: 500, opacity: 0.85 }}>False</div>
          </button>
        </div>
      )}
    </>
  );
}

function DomandaAscolta({ q, onAnswer }) {
  const seed = (q.audio || "").length * 3 + 5;
  const shuffled = useRef(stableShuffle(q.opzioni, seed)).current;
  const newCorrect = shuffled.findIndex(x => x.i === q.correct);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [audioLabelIT, setAudioLabelIT] = useState("Clicca 🔊 per ascoltare");
  const [audioLabelEN, setAudioLabelEN] = useState("Click 🔊 to listen");
  const isCorrect = selected === newCorrect;
  const intro = getIntroBilingual(q);
  useEffect(() => { return () => window.speechSynthesis?.cancel(); }, []);
  function playAudio(slow = false) {
    if (!q.audio) return;
    // TTS legge SOLO q.audio che per definizione è italiano
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(cleanForTTS(q.audio));
      u.lang = "it-IT"; u.rate = slow ? 0.4 : 0.9;
      window.speechSynthesis.speak(u);
      setAudioLabelIT((slow ? "🐢 " : "🔊 ") + `"${q.audio}"`);
      setAudioLabelEN("");
    }, 50);
  }
  const getOptIt = (opt) => typeof opt === "string" ? opt : opt.it;
  const getOptEn = (opt) => typeof opt === "object" ? opt.en : null;
  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!confirmed} />
        <div className="q-card" style={{ borderColor: CHAR_COLOR[q.personaggio] }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <button onClick={() => playAudio(false)} style={{ background: "#FF9B42", border: "none", borderRadius: "99px", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, flexShrink: 0, textTransform: "none", letterSpacing: "normal" }}>🔊</button>
            <button onClick={() => playAudio(true)} style={{ background: "#1CB0F622", border: "1.5px solid #1CB0F644", borderRadius: "99px", padding: "6px 12px", fontWeight: 700, color: "var(--secondary)", cursor: "pointer", fontFamily: "inherit", lineHeight: 1.15, textAlign: "center", textTransform: "none", letterSpacing: "normal" }}>
              <div style={{ fontSize: 13 }}>🐢 Lento</div>
              <div style={{ fontSize: 10, fontStyle: "italic", opacity: 0.85, fontWeight: 600 }}>Slow</div>
            </button>
            <div style={{ flex: 1, lineHeight: 1.25, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "var(--text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{audioLabelIT}</div>
              {audioLabelEN && <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>{audioLabelEN}</div>}
            </div>
          </div>
          <div className="q-card__it">{q.domanda.it}</div>
          <div className="q-card__en">{q.domanda.en}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {shuffled.map(({ o: opt }, si) => {
            const isThisCorrect = si === newCorrect;
            const styleExtra = {};
            if (confirmed) {
              styleExtra.boxShadow = "none";
              if (isThisCorrect) { styleExtra.background = "var(--ok-bar)"; styleExtra.borderColor = "var(--ok-text)"; styleExtra.color = "var(--ok-text)"; }
              else if (si === selected) { styleExtra.background = "var(--err-bar)"; styleExtra.borderColor = "var(--err-text)"; styleExtra.color = "var(--err-text)"; }
            } else if (selected === si) {
              styleExtra.background = "var(--opt-sel-bg)";
              styleExtra.borderColor = "var(--opt-sel-b)";
              styleExtra.color = "var(--opt-sel-text)";
              styleExtra.boxShadow = "0 4px 0 var(--opt-sel-b)";
            } else {
              styleExtra.boxShadow = "0 4px 0 var(--border)";
            }
            return (
              <button key={si} onClick={() => !confirmed && setSelected(si)} className="opt-card" style={{ ...styleExtra, cursor: confirmed ? "default" : "pointer" }}>
                <div className="opt-card__it" style={styleExtra.color ? { color: styleExtra.color } : undefined}>{getOptIt(opt)}</div>
                {getOptEn(opt) && <div className="opt-card__en" style={styleExtra.color ? { color: styleExtra.color, opacity: 0.75 } : undefined}>{getOptEn(opt)}</div>}
              </button>
            );
          })}
        </div>
      </div>
      {confirmed
        ? <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
        : <CheckBar disabled={selected === null} onCheck={() => {
            setConfirmed(true);
            playSound(isCorrect ? "correct" : "wrong");
            if (isCorrect && selected !== null) {
              const correctOpt = shuffled[newCorrect]?.o;
              const it = typeof correctOpt === "string" ? correctOpt : correctOpt?.it;
              if (it) pronounce(it);
            }
          }} />}
    </>
  );
}

function DomandaWordBank({ q, onAnswer }) {
  const soluzione = q.soluzione || (q.parole || []).join(" ");
  const punteggiatura = soluzione.match(/[.,;:!?]+$/)?.[0] || ".";
  const PUNCT = /^[.,;:!?…]+$/;
  const wordsOnly = (q.parole || []).filter(w => !PUNCT.test(w));
  const pool = [...wordsOnly, ...(q.distrattori || [])];
  const [bankWords] = useState(() => pool.map((w, i) => ({ id: `${w}-${i}`, testo: w })).sort(() => Math.random() - 0.5));

  const [fase, setFase] = useState("composizione");
  const [tentativi, setTentativi] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [bubbleIT, setBubbleIT] = useState("Componi la frase!");
  const [bubbleEN, setBubbleEN] = useState("Build the sentence!");

  const usedIds = new Set(selectedWords.map(w => w.id));
  const canEdit = (fase === "composizione") || (fase === "soluzione" && !showSolution);

  function aggiungiParola(w) {
    if (!canEdit) return;
    setSelectedWords(prev => [...prev, w]);
  }
  function rimuoviParola(idx) {
    if (!canEdit) return;
    setSelectedWords(prev => prev.filter((_, i) => i !== idx));
  }

  function normalizza(str) {
    return str.trim().replace(/\s+/g, " ").replace(/[.,;:!?]+/g, "").toLowerCase();
  }

  function handleCheck() {
    if (selectedWords.length === 0) return;
    const fraseComposta = normalizza(selectedWords.map(w => w.testo).join(" "));
    const soluzioneNorm = normalizza(soluzione);
    if (fraseComposta === soluzioneNorm) {
      setFase("corretto");
      playSound("correct");
      pronounce(soluzione, "it-IT");
      setBubbleIT(q.feedbackOk?.it || "Perfetto!");
      setBubbleEN(q.feedbackOk?.en || "Perfect!");
      return;
    }
    setShakeTrigger(true);
    playSound("wrong");
    setTimeout(() => setShakeTrigger(false), 500);
    setSelectedWords([]);
    if (fase === "soluzione") return;
    const nuovi = tentativi + 1;
    setTentativi(nuovi);
    if (nuovi >= 3) {
      setFase("soluzione");
      setBubbleIT("Guarda le parole evidenziate!");
      setBubbleEN("Look at the highlighted words!");
    } else if (nuovi === 2) {
      setBubbleIT("Ancora! Hai un ultimo tentativo!");
      setBubbleEN("One more try!");
    } else {
      setBubbleIT("Riprova!");
      setBubbleEN("Try again!");
    }
  }

  const compBorderStyle = fase === "corretto" ? "solid" : (fase === "soluzione" && showSolution) ? "solid" : selectedWords.length > 0 ? "solid" : "dashed";
  const compBorderColor = fase === "corretto" ? "var(--ok-text)" : (fase === "soluzione" && showSolution) ? "var(--ok-text)" : shakeTrigger ? "var(--err-text)" : fase === "soluzione" ? "var(--special)" : selectedWords.length > 0 ? "#C8A0E8" : "var(--border)";
  const feedbackAnim = fase === "corretto" ? "ok" : (shakeTrigger ? "err" : null);
  const tentativiColor = tentativi >= 2 ? "var(--err-text)" : "var(--text3)";

  // Stile condiviso per ogni chip parola (garantisce display block per flex gap)
  const chipBase = { display: "inline-block", borderRadius: 8, padding: "4px 10px", fontSize: 15, fontWeight: 600 };

  return (
    <>
      <div className="app-body">
        <PersonaggioBubble
          character={q.personaggio}
          textIT={bubbleIT}
          textEN={bubbleEN}
          feedback={feedbackAnim}
          pulseUntilClick={false}
        />

        {/* FIX 4: Pulsante ascolto SEMPRE visibile + contatore */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => pronounce(soluzione, "it-IT")} style={{ background: "none", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", textTransform: "none", letterSpacing: "normal" }}>
            🔊 Ascolta · Listen
          </button>
          {canEdit && (
            <div style={{ fontSize: 13, color: tentativiColor, lineHeight: 1.25, textAlign: "right" }}>
              <span>{selectedWords.length}/{wordsOnly.length}</span>
              {tentativi > 0 && <span style={{ color: "var(--err-text)" }}> · {tentativi}/3</span>}
            </div>
          )}
        </div>

        {/* Zona composizione — FIX 1: display flex + gap 8 + ogni parola è un div inline-block */}
        <div style={{
          minHeight: 56, border: `2px ${compBorderStyle} ${compBorderColor}`, borderRadius: "var(--r)",
          padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
          transition: "border-color 0.3s", background: "var(--bg)",
          animation: shakeTrigger ? "shake-err 0.4s ease" : fase === "corretto" ? "pulse-ok 0.4s ease" : "none",
        }}>
          {(fase === "soluzione" && showSolution) ? (
            <>
              {wordsOnly.map((w, i) => (
                <div key={i} style={{ ...chipBase, background: "rgba(88,204,2,0.12)", border: "1.5px solid var(--ok-text)", color: "var(--ok-text)", fontWeight: 700 }}>{w}</div>
              ))}
              <div style={{ color: "var(--ok-text)", fontWeight: 700, fontSize: 16, marginLeft: "auto" }}>{punteggiatura}</div>
            </>
          ) : selectedWords.length === 0 ? (
            <>
              <div style={{ color: "var(--text3)", fontSize: 14 }}>
                <div>Tocca le parole qui sotto</div>
                <div style={{ fontStyle: "italic", fontSize: 13, opacity: 0.8 }}>Tap words below</div>
              </div>
              <div style={{ color: "var(--text3)", fontWeight: 700, fontSize: 16, marginLeft: "auto", opacity: 0.4 }}>{punteggiatura}</div>
            </>
          ) : (
            <>
              {selectedWords.map((w, i) => (
                <div key={w.id} onClick={() => rimuoviParola(i)} style={{
                  ...chipBase,
                  background: fase === "corretto" ? "rgba(88,204,2,0.12)" : "#C8A0E818",
                  border: `1.5px solid ${fase === "corretto" ? "var(--ok-text)" : "#C8A0E8"}`,
                  borderBottom: `4px solid ${fase === "corretto" ? "var(--ok-text)" : "#C8A0E8"}`,
                  cursor: fase === "corretto" ? "default" : "pointer",
                  color: fase === "corretto" ? "var(--ok-text)" : "#C8A0E8",
                }}>{w.testo}</div>
              ))}
              <div style={{ color: fase === "corretto" ? "var(--ok-text)" : "#C8A0E8", fontWeight: 700, fontSize: 16, marginLeft: "auto" }}>{punteggiatura}</div>
            </>
          )}
        </div>

        {/* Word bank — FIX 1: display flex + gap 8 + ogni parola è un div inline-block */}
        {canEdit && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {bankWords.map(w => {
              const isUsed = usedIds.has(w.id);
              const isCorrectWord = fase === "soluzione" && wordsOnly.includes(w.testo);
              return (
                <div key={w.id} onClick={() => !isUsed && aggiungiParola(w)} style={{
                  ...chipBase,
                  background: isCorrectWord ? "rgba(88,204,2,0.1)" : "var(--card)",
                  border: `1.5px solid ${isCorrectWord ? "#58cc02" : "var(--border)"}`,
                  borderBottom: `4px solid ${isCorrectWord ? "#58cc02" : "var(--border)"}`,
                  color: isCorrectWord ? "#58cc02" : "var(--text)",
                  cursor: isUsed ? "default" : "pointer", opacity: isUsed ? 0.3 : 1,
                  pointerEvents: isUsed ? "none" : "auto",
                  transition: "opacity 0.15s, border-color 0.3s, background 0.3s",
                  textTransform: "none", letterSpacing: "normal",
                }}>{w.testo}</div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM — FIX 3: utente avanza solo con AVANTI */}
      {fase === "composizione" && (
        <div className="app-bottom">
          <button onClick={handleCheck} disabled={selectedWords.length === 0} className="btn-primary">Controlla · Check</button>
        </div>
      )}
      {fase === "corretto" && (
        <div className="app-bottom">
          <button onClick={() => { window.speechSynthesis?.cancel(); onAnswer(true); }} className="btn-primary">Avanti · Next →</button>
        </div>
      )}
      {fase === "soluzione" && !showSolution && (
        <div className="app-bottom" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={handleCheck} disabled={selectedWords.length === 0} className="btn-primary">Controlla · Check</button>
          <button onClick={() => { setShowSolution(true); pronounce(soluzione, "it-IT"); }} className="btn-primary btn-primary--warn">Vedi soluzione · Show answer</button>
        </div>
      )}
      {fase === "soluzione" && showSolution && (
        <div className="app-bottom">
          <button onClick={() => { window.speechSynthesis?.cancel(); onAnswer(false); }} className="btn-primary btn-primary--warn">Avanti · Next →</button>
        </div>
      )}
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
  const intro = getIntroBilingual(q);
  useEffect(() => { if (allMatched && !done) { setDone(true); playSound("correct"); } }, [matched]);
  function handleIT(it) { if (matched[it] || done) return; setSelIT(it); if (selEN !== null) tryMatch(it, selEN); }
  function handleEN(en) { if (Object.values(matched).includes(en) || done) return; setSelEN(en); if (selIT !== null) tryMatch(selIT, en); }
  function tryMatch(it, en) {
    const pair = q.coppie.find(c => c.it === it);
    if (pair && pair.en === en) {
      setMatched(m => ({ ...m, [it]: en }));
      setSelIT(null);
      setSelEN(null);
      // TTS legge solo la parola italiana abbinata
      try {
        window.speechSynthesis?.cancel();
        setTimeout(() => {
          const u = new SpeechSynthesisUtterance(cleanForTTS(it));
          u.lang = "it-IT"; u.rate = 0.88;
          window.speechSynthesis.speak(u);
        }, 120);
      } catch (e) {}
    }
    else { setWrong({ it, en }); setTimeout(() => { setSelIT(null); setSelEN(null); setWrong(null); }, 700); }
  }
  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={allMatched ? "ok" : null} pulseUntilClick={!allMatched} />
        <QBox q={q} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shuffIT.current.map(({ it }) => {
              const isMatched = !!matched[it], isSel = selIT === it, isWrong = wrong?.it === it;
              let bg = "var(--card)", border = "var(--border)", color = "var(--text)";
              if (isMatched) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
              else if (isWrong) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
              else if (isSel) { bg = "var(--opt-sel-bg)"; border = "var(--opt-sel-b)"; color = "var(--opt-sel-text)"; }
              return <button key={it} onClick={() => !isMatched && handleIT(it)} style={{ background: bg, border: `2px solid ${border}`, color, borderRadius: "var(--r)", padding: "12px 16px", fontSize: 16, fontWeight: 700, cursor: isMatched ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "left", textTransform: "none", letterSpacing: "normal", width: "100%", display: "block" }}>{it}</button>;
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shuffEN.current.map(({ en }) => {
              const isMatched = Object.values(matched).includes(en), isSel = selEN === en, isWrong = wrong?.en === en;
              let bg = "var(--card)", border = "var(--border)", color = "var(--text)";
              if (isMatched) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
              else if (isWrong) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
              else if (isSel) { bg = "var(--opt-sel-bg)"; border = "var(--opt-sel-b)"; color = "var(--opt-sel-text)"; }
              return <button key={en} onClick={() => !isMatched && handleEN(en)} style={{ background: bg, border: `2px solid ${border}`, color, borderRadius: "var(--r)", padding: "12px 16px", fontSize: 15, fontWeight: 500, cursor: isMatched ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "left", fontStyle: "italic", textTransform: "none", letterSpacing: "normal", width: "100%", display: "block" }}>{en}</button>;
            })}
          </div>
        </div>
        {allMatched && (
          <div style={{ background: "var(--ok-bar)", border: "1.5px solid var(--ok-text)", borderRadius: "var(--r)", padding: "11px 14px" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "var(--ok-text)", lineHeight: 1.2 }}>✅ Esatto!</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ok-text)", fontStyle: "italic", opacity: 0.75, marginBottom: 4 }}>Correct!</div>
            <div style={{ fontSize: 15, color: "var(--ok-text)", lineHeight: 1.4 }}>{q.feedbackOk?.it}</div>
            <div style={{ fontSize: 13, color: "var(--ok-text)", opacity: 0.7, fontStyle: "italic", marginTop: 2, lineHeight: 1.4 }}>{q.feedbackOk?.en}</div>
          </div>
        )}
      </div>
      {allMatched && (
        <div className="app-bottom">
          <button onClick={() => { window.speechSynthesis?.cancel(); onAnswer(true); }} className="btn-primary btn-primary--secondary">Avanti · Next →</button>
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
      // TTS legge solo audio_text (se c'è) o v.it — mai l'inglese
      const u = new SpeechSynthesisUtterance(cleanForTTS(v.audio_text || v.it));
      u.lang = "it-IT"; u.rate = 0.88;
      window.speechSynthesis.speak(u);
    }, 80);
  }
  return (
    <>
      <div className="app-wrapper">
        <TricoloreBar />
        <LessonTopbar unita={unita} lezione={lezione} />
        <TricoloreBar />
        <BarraSecondaria
          current={toccate.size}
          total={lesson.vocab.length}
          progress={Math.round((toccate.size / lesson.vocab.length) * 100)}
          labelIT="Vocabolo"
          labelEN="Word"
          unitType={unitType}
        />
        <div className="app-body">
          <PersonaggioBubble
            character="mario"
            textIT="Benvenuto! Tocca ogni parola per impararla."
            textEN="Welcome! Tap each word to learn it."
            autoSpeak={true}
          />
          {lesson.vocab.map(v => {
            const toccata = toccate.has(v.id);
            const marioIT = v.mario_it || (v.mario ? splitBilingual(v.mario).it : "");
            const marioEN = v.mario_en || (v.mario ? splitBilingual(v.mario).en : "");
            return (
              <div key={v.id} onClick={() => handleTap(v)} style={{ background: toccata ? "var(--opt-sel-bg)" : "var(--card)", border: `2px solid ${toccata ? "var(--opt-sel-b)" : "var(--border)"}`, borderRadius: "var(--r)", padding: "15px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, boxShadow: toccata ? "0 4px 0 var(--opt-sel-b)" : "0 4px 0 var(--border)", transition: "background 0.2s, border 0.2s" }}>
                <div style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{v.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 20, color: toccata ? "var(--opt-sel-text)" : "var(--text)", marginBottom: 2 }}>{v.it}</div>
                  <div style={{ fontSize: 15, color: "var(--text3)", fontWeight: 600, fontStyle: "italic" }}>{v.en}</div>
                  {toccata && marioIT && (
                    <>
                      <div style={{ fontSize: 14, color: "var(--text2)", marginTop: 5, lineHeight: 1.4 }}>{marioIT}</div>
                      {marioEN && <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", marginTop: 2, lineHeight: 1.4 }}>{marioEN}</div>}
                    </>
                  )}
                </div>
                {toccata && <span style={{ fontSize: 20 }}>✅</span>}
              </div>
            );
          })}
        </div>
        <div className="app-bottom">
          <button onClick={tutteVisitate ? onComplete : undefined} disabled={!tutteVisitate} className="btn-primary">
            {tutteVisitate
              ? "Inizia il Quiz · Start Quiz →"
              : `Tocca le parole (${toccate.size}/${lesson.vocab.length})`}
          </button>
        </div>
      </div>
    </>
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
  const faseMap = {
    riconoscimento: { it: "Riconoscimento", en: "Recognition" },
    comprensione:   { it: "Comprensione",   en: "Comprehension" },
    produzione:     { it: "Produzione",     en: "Production" },
  };
  const fase = faseMap[q?.fase] || { it: "", en: "" };
  function handleAnswer(isCorrect) {
    if (isCorrect) setScore(s => s + 1);
    if (current + 1 >= total) onComplete(isCorrect ? score + 1 : score);
    else setCurrent(c => c + 1);
  }
  return (
    <>
      <div className="app-wrapper">
        <TricoloreBar />
        <LessonTopbar unita={unita} lezione={lezione} />
        <TricoloreBar />
        <BarraSecondaria
          current={current + 1}
          total={total}
          progress={Math.round(((current + 1) / total) * 100)}
          labelIT="Domanda"
          labelEN="Question"
          fase={fase}
          unitType={unitType}
        />
        {q && <DomandaRouter key={current} q={q} onAnswer={handleAnswer} />}
      </div>
    </>
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
  const [showBossIntro, setShowBossIntro] = useState(lezione === "boss");
  const unitType = getUnitType(unita);

  useEffect(() => {
    loadLesson(livello, unita, lezione)
      .then(data => { setLesson(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [livello, unita, lezione]);

  if (loading) return (
    <>
      <div className="app-wrapper">
        <TricoloreBar />
        <div className="app-body" style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>☕</div>
            <div style={{ fontSize: 17, color: "var(--text)", fontWeight: 700 }}>Caricamento...</div>
            <div style={{ fontSize: 15, color: "var(--text3)", fontStyle: "italic", marginTop: 2 }}>Loading...</div>
          </div>
        </div>
      </div>
    </>
  );

  if (error || !lesson) return (
    <>
      <div className="app-wrapper">
        <TricoloreBar />
        <div className="app-body" style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😅</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--err-text)" }}>Lezione non trovata</div>
            <div style={{ fontSize: 15, color: "var(--err-text)", fontStyle: "italic", opacity: 0.8, marginBottom: 8 }}>Lesson not found</div>
            <p style={{ fontSize: 14, color: "var(--text3)", marginBottom: 16 }}>{livello} · Unità {unita} · Lezione {lezione}</p>
          </div>
        </div>
        <div className="app-bottom">
          <button onClick={() => router.push("/")} className="btn-primary">🏠 Home</button>
        </div>
      </div>
    </>
  );

  // Calcola reward e salva progresso
  function handleQuizComplete(corrette) {
    const lessonId = lezione === "boss" ? "boss" : parseInt(lezione);
    const tipo = lezione === "boss" ? "boss" : "lezione";
    const r = salvaProgressi({ tipo, lessonId, corrette, totDomande: lesson.questions.length, lessonReward: lesson.reward, unita });
    setReward(r); setFase("done");
  }

  if (fase === "done" && reward) return <LessonComplete reward={reward} livello={livello} unita={unita} lezione={lezione} onHome={() => router.push("/")} />;

  if (showBossIntro) {
    return <BossIntroPopup onStart={() => setShowBossIntro(false)} />;
  }

  if (fase === "intro") {
    if (!lesson.vocab || lesson.vocab.length === 0) {
      return (
        <QuizFase lesson={lesson} unitType={unitType} unita={unita} lezione={lezione} onComplete={handleQuizComplete} />
      );
    }
    return <VocabMatch lesson={lesson} unitType={unitType} unita={unita} lezione={lezione} onComplete={() => setFase("quiz")} router={router} />;
  }

  return (
    <QuizFase lesson={lesson} unitType={unitType} unita={unita} lezione={lezione} onComplete={handleQuizComplete} />
  );
}
