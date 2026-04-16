"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import PersonaggioBubble from "../../../../components/PersonaggioBubble";
import BarraSecondaria from "../../../../components/BarraSecondaria";
import LessonComplete from "../../../../components/LessonComplete";
import LessonTopbar from "../../../../components/LessonTopbar";
import TricoloreBar from "../../../../components/TricoloreBar";
import { pronounce, cleanForTTS, isAudioOn } from "../../../../components/pronounce";
import { salvaProgressi } from "../../../../components/saveProgress";
import { FraseAnnotata } from "../../../../components/WordPopup";
import VocabMatch from "../../../../components/VocabMatch";
import BossIntroPopup from "../../../../components/BossIntroPopup";
import LessonCompletePopup, { getMessaggioMario } from "../../../../components/LessonCompletePopup";

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


// Converte «termine» → <u>termine</u> per evidenziare termini IT in testo bilingue
function renderText(text) {
  if (!text || !text.includes('«')) return text;
  const parts = text.split(/(«[^»]+»)/g);
  return parts.map((part, i) =>
    part.startsWith('«')
      ? <u key={i} style={{ fontWeight: 700, textDecorationColor: 'var(--special)', textDecorationThickness: 2 }}>{part.slice(1, -1)}</u>
      : part
  );
}

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
      <div className="q-card__en">{renderText(q.domanda?.en || "")}</div>
      {domandaIT && (
        <span aria-hidden="true" style={{ position: "absolute", bottom: 6, right: 8, fontSize: 11, opacity: 0.55, pointerEvents: "none" }}>🔊</span>
      )}
    </div>
  );
}

function FeedbackBar({ isCorrect, feedbackOk, feedbackErr, onNext }) {
  const titoloCol = isCorrect ? "var(--green)" : "var(--red)";
  const bg     = isCorrect ? "rgba(88,204,2,0.1)"  : "rgba(255,75,75,0.08)";
  const border = isCorrect ? "rgba(88,204,2,0.3)"  : "var(--border-red)";
  return (
    <div className="app-bottom app-bottom--feedback" style={{
      background: "var(--bg-deep)", borderTop: "1px solid var(--border-soft)",
    }}>
      <div style={{
        background: bg, border: `1.5px solid ${border}`,
        borderRadius: "var(--r)", padding: "12px 14px", marginBottom: 12,
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: titoloCol }}>
          {isCorrect ? "✅ Esatto! · Correct!" : "❌ Sbagliato! · Wrong!"}
        </div>
        <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, marginTop: 3 }}>
          {isCorrect ? feedbackOk?.it : feedbackErr?.it}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", marginTop: 2, lineHeight: 1.5 }}>
          {isCorrect ? feedbackOk?.en : feedbackErr?.en}
        </div>
      </div>
      <button onClick={onNext} className="btn-cta btn-primary" style={{
        background: isCorrect ? "var(--green)" : "var(--accent)",
        color: "#fff",
        borderBottom: `4px solid ${isCorrect ? "var(--green-dark)" : "var(--accent-dark)"}`,
      }}>
        <span className="btn-it">AVANTI →</span>
        <span className="btn-en">Next</span>
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
            {q.tipo_contesto === "falso_amico" && (
              <div style={{ fontSize: 13, color: "#E5B700", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>⚠️ Falso amico · False friend</div>
            )}
            <div className="q-card__it">{q.domanda.it}</div>
            <div className="q-card__en">{q.domanda.en}</div>
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 11px", marginTop: 10 }}>
              <div style={{ fontSize: 16, fontStyle: "italic", color: "var(--text)" }}>{q.contesto_it}</div>
              {q.contesto_en && q.contesto_en !== q.contesto_it && (
                <div style={{ fontSize: 14, fontStyle: "italic", color: "var(--text3)", marginTop: 3 }}>{q.contesto_en}</div>
              )}
            </div>
          </div>
        )}
        {!q.contesto_it && !q.gesture && <QBox q={q} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {shuffled.map(({ o: opt }, si) => {
            const isThisCorrect = si === newCorrect;
            const isOk  = confirmed && isThisCorrect;
            const isErr = confirmed && si === selected && !isThisCorrect;
            const isSel = !confirmed && selected === si;
            const optIt = getOptIt(opt);
            const optEn = getOptEn(opt);
            const lettere = ["A", "B", "C", "D"];
            const lettera = lettere[si] || String(si + 1);

            // STATI border/bg
            const bg     = isOk ? "rgba(88,204,2,0.08)" : isErr ? "rgba(255,75,75,0.06)" : isSel ? "rgba(28,176,246,0.08)" : "var(--bg-el)";
            const border = isOk ? "var(--green)"        : isErr ? "var(--red)"           : isSel ? "var(--blue)"           : "var(--border-soft)";
            // Letter badge
            const lBg    = isOk ? "rgba(88,204,2,0.2)" : isErr ? "rgba(255,75,75,0.15)" : isSel ? "rgba(28,176,246,0.2)" : "rgba(255,255,255,0.06)";
            const lCol   = isOk ? "var(--green)"       : isErr ? "var(--red)"           : isSel ? "var(--blue)"          : "var(--text4)";
            const itCol  = isOk ? "var(--green)"       : isErr ? "var(--red)"           : "var(--text)";

            return (
              <button
                key={si}
                onClick={() => {
                  if (confirmed) return;
                  if (optIt && optIt !== optEn) pronounce(optIt); // NO audio su testo EN-only
                  setSelected(si);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: bg, border: `1.5px solid ${border}`,
                  borderRadius: "var(--r)", padding: "12px 14px",
                  cursor: confirmed ? "default" : "pointer",
                  minHeight: 60, width: "100%",
                  fontFamily: "inherit", textTransform: "none", letterSpacing: "normal", textAlign: "left",
                  transition: "all 0.15s",
                  animation: isErr ? "shake 0.3s ease" : "none",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: lBg, color: lCol,
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{lettera}</div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: itCol }}>{optIt}</div>
                  {optEn && optEn !== optIt && <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", marginTop: 1 }}>{optEn}</div>}
                </div>
                {isOk && <span style={{ color: "var(--green)", fontSize: 16, flexShrink: 0 }}>✓</span>}
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
  const audioText = q.audio_it || q.audio || "";
  const seed = audioText.length * 3 + 5;
  const shuffled = useRef(stableShuffle(q.opzioni, seed)).current;
  const newCorrect = shuffled.findIndex(x => x.i === q.correct);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const isCorrect = selected === newCorrect;
  const intro = getIntroBilingual(q);
  useEffect(() => { return () => window.speechSynthesis?.cancel(); }, []);
  function playAudio(slow = false) {
    if (!audioText) return;
    // Mostra sempre il testo al click — indipendente da isAudioOn()
    setHasListened(true);
    // Se audio è OFF, nessuna pronuncia TTS ma il testo resta visibile
    if (!isAudioOn()) return;
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(cleanForTTS(audioText));
      u.lang = "it-IT";
      u.rate = slow ? 0.4 : 0.9;
      const voci = window.speechSynthesis?.getVoices() || [];
      const voce = voci.find(v => v.lang === "it-IT")
                || voci.find(v => v.lang.startsWith("it"));
      if (voce) u.voice = voce;
      window.speechSynthesis.speak(u);
    }, 50);
  }
  const getOptIt = (opt) => typeof opt === "string" ? opt : opt.it;
  const getOptEn = (opt) => typeof opt === "object" ? opt.en : null;
  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!confirmed} />

        {/* AUDIO BAR — pulsante principale + pulsante lento */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => playAudio(false)} style={{
            flex: 1,
            background: "var(--bg-el)",
            border: "1.5px solid var(--border-blue)",
            borderRadius: "var(--r)",
            padding: 14,
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer",
            fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(28,176,246,0.15)", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>🔊</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }}>Ascolta</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", marginTop: 2 }}>Listen</div>
            </div>
          </button>
          <button onClick={() => playAudio(true)} style={{
            background: "var(--bg-el)",
            border: "1.5px solid var(--border-soft)",
            borderRadius: "var(--r)",
            padding: "12px 10px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            minWidth: 60, cursor: "pointer",
            fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
          }}>
            <span style={{ fontSize: 16 }}>🐢</span>
            <span style={{ fontSize: 9, color: "var(--text3)", fontWeight: 700 }}>LENTO</span>
          </button>
        </div>

        {/* RISULTATO AUDIO — mostra frase IT + EN dopo il primo click */}
        {hasListened ? (
          <div style={{
            background: "var(--bg-deep)", borderRadius: 10,
            padding: "10px 12px", marginBottom: 12, textAlign: "center",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>"{audioText}"</div>
            {q.audio_en && (
              <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", marginTop: 2 }}>"{q.audio_en}"</div>
            )}
          </div>
        ) : (
          <div style={{
            background: "var(--bg-deep)", borderRadius: 10,
            padding: "10px 12px", marginBottom: 12, textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic" }}>
              Clicca 🔊 per ascoltare<br/>
              <span style={{ fontSize: 11 }}>Click 🔊 to listen</span>
            </div>
          </div>
        )}

        {/* DOMANDA */}
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{q.domanda.it}</div>
        <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--text3)", marginBottom: 8 }}>{q.domanda.en}</div>

        {/* OPZIONI con lettera A/B/C/D */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {shuffled.map(({ o: opt }, si) => {
            const isThisCorrect = si === newCorrect;
            const isOk  = confirmed && isThisCorrect;
            const isErr = confirmed && si === selected && !isCorrect;
            const isSel = !confirmed && selected === si;
            const optIt = getOptIt(opt);
            const optEn = getOptEn(opt);
            const lettera = ["A", "B", "C", "D"][si] || String(si + 1);

            const bg     = isOk ? "rgba(88,204,2,0.08)" : isErr ? "rgba(255,75,75,0.06)" : isSel ? "rgba(28,176,246,0.08)" : "var(--bg-el)";
            const border = isOk ? "var(--green)"        : isErr ? "var(--red)"           : isSel ? "var(--blue)"           : "var(--border-soft)";
            const lBg    = isOk ? "rgba(88,204,2,0.2)" : isErr ? "rgba(255,75,75,0.15)" : isSel ? "rgba(28,176,246,0.2)" : "rgba(255,255,255,0.06)";
            const lCol   = isOk ? "var(--green)"       : isErr ? "var(--red)"           : isSel ? "var(--blue)"          : "var(--text4)";
            const itCol  = isOk ? "var(--green)"       : isErr ? "var(--red)"           : "var(--text)";

            return (
              <button key={si} onClick={() => !confirmed && setSelected(si)} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: bg, border: `1.5px solid ${border}`,
                borderRadius: "var(--r)", padding: "12px 14px",
                cursor: confirmed ? "default" : "pointer",
                minHeight: 60, width: "100%",
                fontFamily: "inherit", textTransform: "none", letterSpacing: "normal", textAlign: "left",
                transition: "all 0.15s",
                animation: isErr ? "shake 0.3s ease" : "none",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: lBg, color: lCol,
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{lettera}</div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: itCol }}>{optIt}</div>
                  {optEn && optEn !== optIt && <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", marginTop: 1 }}>{optEn}</div>}
                </div>
                {isOk && <span style={{ color: "var(--green)", fontSize: 16, flexShrink: 0 }}>✓</span>}
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

  const compBorderColor = fase === "corretto" ? "var(--green)" : (fase === "soluzione" && showSolution) ? "var(--green)" : shakeTrigger ? "var(--red)" : "var(--border-soft)";
  const feedbackAnim = fase === "corretto" ? "ok" : (shakeTrigger ? "err" : null);
  const tentativiColor = tentativi >= 2 ? "var(--red)" : "var(--text3)";

  // Stile condiviso per ogni chip parola
  const chipBase = { display: "inline-block", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700 };

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

        {/* Contesto EN fisso — significato idiomatico sempre visibile */}
        {(q.domanda?.en || q.frase_en) && (
          <div style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            fontStyle: "italic",
            textAlign: "center",
            marginBottom: 8,
            padding: "6px 0",
          }}>
            {q.domanda?.en || q.frase_en || ""}
          </div>
        )}

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

        {/* Zona composizione — slots area */}
        <div style={{
          minHeight: 44, border: `1.5px solid ${compBorderColor}`, borderRadius: 10,
          padding: 8, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          transition: "border-color 0.3s", background: "var(--bg-deep)",
          marginBottom: 10,
          animation: shakeTrigger ? "shake 0.3s ease" : "none",
        }}>
          {(fase === "soluzione" && showSolution) ? (
            <>
              {wordsOnly.map((w, i) => (
                <div key={i} style={{ ...chipBase, background: "var(--bg-el)", border: "1.5px solid var(--green)", color: "var(--green)" }}>{w}</div>
              ))}
              <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 14, marginLeft: "auto" }}>{punteggiatura}</div>
            </>
          ) : selectedWords.length === 0 ? (
            <>
              <div style={{ color: "var(--text3)", fontSize: 13, fontStyle: "italic" }}>
                Tocca le parole qui sotto · Tap words below
              </div>
            </>
          ) : (
            <>
              {selectedWords.map((w, i) => (
                <div key={w.id} onClick={() => rimuoviParola(i)} style={{
                  ...chipBase,
                  background: "var(--bg-el)",
                  border: `1.5px solid var(--green)`,
                  cursor: fase === "corretto" ? "default" : "pointer",
                  color: "var(--green)",
                }}>{w.testo}</div>
              ))}
              <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 14, marginLeft: "auto" }}>{punteggiatura}</div>
            </>
          )}
        </div>

        {/* Words pool */}
        {canEdit && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {bankWords.map(w => {
              const isUsed = usedIds.has(w.id);
              const isCorrectWord = fase === "soluzione" && wordsOnly.includes(w.testo);
              return (
                <div key={w.id} onClick={() => !isUsed && aggiungiParola(w)} style={{
                  ...chipBase,
                  background: "var(--bg-el)",
                  border: `1.5px solid ${isCorrectWord ? "var(--green)" : "var(--border-soft)"}`,
                  color: isCorrectWord ? "var(--green)" : "var(--text)",
                  cursor: isUsed ? "default" : "pointer",
                  opacity: isUsed ? 0.2 : 1,
                  pointerEvents: isUsed ? "none" : "auto",
                  transition: "opacity 0.15s, border-color 0.15s",
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
  useEffect(() => {
    if (allMatched && !done) {
      setDone(true);
      playSound("correct");
      // Pronuncia ogni parola IT della coppia in sequenza (1200ms di delay).
      // coppia.en contiene la parola IT da imparare in modalità situazione;
      // in modalità classica coppia.it è la parola IT e coppia.en è la traduzione EN.
      const hasSituationMode = q.coppie.some(p => p.situazione_en);
      q.coppie.forEach((coppia, i) => {
        setTimeout(() => {
          const parolaIT = hasSituationMode ? coppia.en : coppia.it;
          pronounce(parolaIT, "it-IT");
        }, i * 1200);
      });
    }
  }, [matched]);
  function handleIT(it) { if (matched[it] || done) return; setSelIT(it); if (selEN !== null) tryMatch(it, selEN); }
  function handleEN(en) { if (Object.values(matched).includes(en) || done) return; setSelEN(en); if (selIT !== null) tryMatch(selIT, en); }
  function tryMatch(it, en) {
    const pair = q.coppie.find(c => c.it === it);
    if (pair && pair.en === en) {
      setMatched(m => ({ ...m, [it]: en }));
      setSelIT(null);
      setSelEN(null);
      // Nessun TTS automatico — audio solo on demand tramite 🔊
    }
    else { setWrong({ it, en }); setTimeout(() => { setSelIT(null); setSelEN(null); setWrong(null); }, 700); }
  }
  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={allMatched ? "ok" : null} pulseUntilClick={!allMatched} />
        <QBox q={q} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {shuffIT.current.map((cIT, i) => {
            const cEN = shuffEN.current[i];
            const it = cIT.it, en = cEN.en;
            const hasSituationMode = q.coppie.some(p => p.situazione_en);

            // Testi bilingue per ciascun box
            const leftTopIT  = it;
            const leftSubEN  = cIT.situazione_en || "";
            const rightTopIT = hasSituationMode ? en : en; // parola IT (situation) o traduzione EN (classic)
            const rightSubEN = hasSituationMode ? (cEN.traduzione_en || "") : "";

            // STATI BOX SINISTRO
            const itMatched = !!matched[it], itSel = selIT === it, itWrong = wrong?.it === it;
            let bgL = "var(--bg-el)", brL = "var(--border-soft)", colL = "var(--text)";
            if (itMatched) { bgL = "rgba(88,204,2,0.08)"; brL = "var(--green)"; colL = "var(--green)"; }
            else if (itWrong) { bgL = "rgba(255,75,75,0.06)"; brL = "var(--red)"; colL = "var(--red)"; }
            else if (itSel) { bgL = "rgba(28,176,246,0.08)"; brL = "var(--blue)"; colL = "var(--blue)"; }

            // STATI BOX DESTRO
            const enMatched = Object.values(matched).includes(en), enSel = selEN === en, enWrong = wrong?.en === en;
            let bgR = "var(--bg-el)", brR = "var(--border-soft)", colR = "var(--text)";
            if (enMatched) { bgR = "rgba(88,204,2,0.08)"; brR = "var(--green)"; colR = "var(--green)"; }
            else if (enWrong) { bgR = "rgba(255,75,75,0.06)"; brR = "var(--red)"; colR = "var(--red)"; }
            else if (enSel) { bgR = "rgba(28,176,246,0.08)"; brR = "var(--blue)"; colR = "var(--blue)"; }

            const boxBaseStyle = {
              position: "relative",
              minHeight: 72,
              padding: "12px 14px 28px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              borderRadius: "var(--r)",
              transition: "all 0.15s",
              fontFamily: "inherit",
              textTransform: "none",
              letterSpacing: "normal",
              textAlign: "left",
            };
            const audioIconStyle = {
              position: "absolute",
              bottom: 6,
              right: 8,
              fontSize: 12,
              opacity: 0.35,
              cursor: "pointer",
              padding: 4,
              lineHeight: 1,
              transition: "opacity 0.15s",
            };

            return (
              <div key={i} className="match-row">
                {/* BOX SINISTRO */}
                <div
                  onClick={() => !itMatched && handleIT(it)}
                  className="match-card"
                  style={{
                    ...boxBaseStyle,
                    background: bgL, border: `1.5px solid ${brL}`, color: colL,
                    cursor: itMatched ? "default" : "pointer",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: colL, lineHeight: 1.3, textAlign: "left" }}>
                    {leftTopIT}
                  </div>
                  {leftSubEN && (
                    <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--text3)", marginTop: 3, lineHeight: 1.3, textAlign: "left" }}>
                      {leftSubEN}
                    </div>
                  )}
                  <div
                    onClick={(e) => { e.stopPropagation(); pronounce(it, "it-IT"); }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.35; }}
                    style={audioIconStyle}
                    aria-label="Ascolta"
                    role="button"
                  >🔊</div>
                </div>

                {/* BOX DESTRO */}
                <div
                  onClick={() => !enMatched && handleEN(en)}
                  className="match-card"
                  style={{
                    ...boxBaseStyle,
                    background: bgR, border: `1.5px solid ${brR}`, color: colR,
                    cursor: enMatched ? "default" : "pointer",
                  }}
                >
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: colR,
                    lineHeight: 1.3,
                    textAlign: "left",
                    fontStyle: hasSituationMode ? "normal" : "italic",
                  }}>
                    {rightTopIT}
                  </div>
                  {rightSubEN && (
                    <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--text3)", marginTop: 3, lineHeight: 1.3, textAlign: "left" }}>
                      {rightSubEN}
                    </div>
                  )}
                  {hasSituationMode && (
                    <div
                      onClick={(e) => { e.stopPropagation(); pronounce(en, "it-IT"); }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.35; }}
                      style={audioIconStyle}
                      aria-label="Ascolta"
                      role="button"
                    >🔊</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {allMatched && (
          <div style={{
            background: "rgba(88,204,2,0.1)", border: "1.5px solid rgba(88,204,2,0.3)",
            borderRadius: "var(--r)", padding: "12px 14px",
            marginTop: 12, animation: "fadeIn 0.2s ease",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>✅ Esatto! · Correct!</div>
            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, marginTop: 3 }}>{q.feedbackOk?.it}</div>
            {q.feedbackOk?.en && (
              <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", marginTop: 2, lineHeight: 1.5 }}>{q.feedbackOk?.en}</div>
            )}
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

// ─── TIPO: fill_blank ────────────────────────────────────────────────────────
function DomandaFillBlank({ q, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [corretto, setCorretto] = useState(false);
  const [sbagliato, setSbagliato] = useState(false);

  // Parsing frase su run di 3+ underscore → array alternato di testo + "___"
  // Robusto a "___", "_____", "_______" etc — qualsiasi lunghezza del placeholder.
  function parseFrase(frase) {
    return (frase || "").split(/_{3,}/)
      .flatMap((p, i, arr) => i < arr.length - 1 ? [p, "___"] : [p])
      .filter(p => p !== "");
  }
  const partiIT = parseFrase(q.frase_it);

  function selectOption(opt) {
    if (corretto) return;
    setSelectedOption(opt);
    // Un nuovo click dopo uno sbagliato resetta lo stato errore
    if (sbagliato) setSbagliato(false);
  }

  function controlla() {
    if (!selectedOption) return;
    const rispostaCorretta = q.opzioni[q.correct];
    if (selectedOption.it === rispostaCorretta.it) {
      setCorretto(true);
      playSound("correct");
      // Pronuncia la frase IT completa con la parola inserita al posto del buco
      const fraseCompleta = (q.frase_it || "").replace(/_{3,}/, selectedOption.it);
      pronounce(fraseCompleta, "it-IT");
    } else {
      setSbagliato(true);
      playSound("wrong");
    }
  }

  function riprova() {
    setSelectedOption(null);
    setCorretto(false);
    setSbagliato(false);
  }

  function avanti() {
    window.speechSynthesis?.cancel();
    onAnswer(true);
  }

  return (
    <>
      <div className="app-body">
        <PersonaggioBubble
          character={q.personaggio}
          textIT="Inserisci la parola mancante!"
          textEN="Fill in the missing word!"
          feedback={corretto ? "ok" : sbagliato ? "err" : null}
          pulseUntilClick={!corretto && !sbagliato}
        />

        {/* FRASE BOX */}
        <div style={{
          background: "var(--bg-deep)", borderRadius: "var(--r)", padding: "14px", marginBottom: 12,
          border: corretto
            ? "1.5px solid var(--border-green)"
            : sbagliato
              ? "1.5px solid var(--border-red)"
              : "1.5px solid var(--border-soft)",
          transition: "border 0.2s",
        }}>
          {/* FRASE IT — testo grande con buco inline (whiteSpace preserva gli spazi) */}
          <div style={{
            fontSize: 20, fontWeight: 700, color: "#fff",
            lineHeight: 1.6, marginBottom: 8,
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4,
          }}>
            {partiIT.map((parte, i) => (
              parte === "___" ? (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  minWidth: 90, height: 34, borderRadius: "var(--r-sm)",
                  border: corretto
                    ? "2px solid var(--green)"
                    : sbagliato
                      ? "2px solid var(--red)"
                      : "2px dashed rgba(255,149,0,0.6)",
                  background: corretto
                    ? "rgba(88,204,2,0.08)"
                    : sbagliato
                      ? "rgba(255,75,75,0.06)"
                      : "rgba(255,149,0,0.06)",
                  color: corretto
                    ? "var(--green)"
                    : sbagliato
                      ? "var(--red)"
                      : selectedOption
                        ? "var(--accent)"
                        : "rgba(255,149,0,0.5)",
                  fontWeight: 700, fontSize: 16, padding: "0 10px",
                  animation: sbagliato ? "shake 0.3s ease" : "none",
                  transition: "all 0.2s",
                }}>
                  {selectedOption?.it || "___"}
                </span>
              ) : (
                <span key={i} style={{ whiteSpace: "pre-wrap" }}>{parte}</span>
              )
            ))}
          </div>

          {/* FRASE EN — significato idiomatico completo */}
          {q.frase_en && (
            <div style={{
              fontSize: 12,
              color: "var(--text3)",
              fontStyle: "italic",
              marginTop: 6,
              lineHeight: 1.5,
            }}>
              {"= " + q.frase_en.replace(/_{3,}/g, "...")}
            </div>
          )}
        </div>

        {/* PILL OPZIONI */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16,
        }}>
          {q.opzioni.map((opt, i) => {
            const isUsed = selectedOption?.it === opt.it;
            return (
              <div
                key={i}
                onClick={() => !isUsed && !corretto && selectOption(opt)}
                style={{
                  background: "var(--bg-el)",
                  border: isUsed ? "1.5px solid var(--border-accent)" : "1.5px solid var(--border-soft)",
                  borderRadius: 10, padding: "12px 16px",
                  cursor: isUsed || corretto ? "default" : "pointer",
                  opacity: isUsed ? 0.3 : 1,
                  pointerEvents: isUsed ? "none" : "auto",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flex: 1, minWidth: 70, textAlign: "center",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{opt.it}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTONE BOTTOM — 4 stati */}
      <div className="app-bottom">
        {corretto ? (
          <button onClick={avanti} className="btn-cta btn-primary" style={{
            background: "var(--green)", color: "#fff",
            borderBottom: "4px solid var(--green-dark)",
          }}>
            <span className="btn-it">AVANTI →</span>
            <span className="btn-en">Next</span>
          </button>
        ) : sbagliato ? (
          <button onClick={riprova} className="btn-cta btn-primary" style={{
            background: "var(--accent)", color: "#fff",
            borderBottom: "4px solid var(--accent-dark)",
          }}>
            <span className="btn-it">RIPROVA</span>
            <span className="btn-en">Try again</span>
          </button>
        ) : selectedOption ? (
          <button onClick={controlla} className="btn-cta btn-primary" style={{
            background: "var(--green)", color: "#fff",
            borderBottom: "4px solid var(--green-dark)",
          }}>
            <span className="btn-it">CONTROLLA</span>
            <span className="btn-en">Check</span>
          </button>
        ) : (
          <button disabled className="btn-cta btn-primary" style={{
            background: "var(--card)", color: "var(--muted)",
            borderBottom: "4px solid var(--border)", opacity: 0.6,
          }}>
            <span className="btn-it">CONTROLLA</span>
            <span className="btn-en">Check</span>
          </button>
        )}
      </div>
    </>
  );
}

// ─── TIPO: dialogo ──────────────────────────────────────────────────────────
function DomandaDialogo({ q, onAnswer }) {
  const [turnoIdx, setTurnoIdx] = useState(0);
  const [risposte, setRisposte] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // "ok"|"err"|null
  const [completato, setCompletato] = useState(false);
  const [score, setScore] = useState(0);
  const intro = getIntroBilingual(q);
  const turni = q.turni || [];

  const turnoCorrente = turni[turnoIdx];
  const tuttiRisposti = turnoIdx >= turni.length;

  function handleSelect(idx) {
    if (feedback || completato) return;
    setSelected(idx);
    const isOk = idx === turnoCorrente.correct;
    setFeedback(isOk ? "ok" : "err");
    if (isOk) {
      setScore(s => s + 1);
      pronounce(turnoCorrente.opzioni[idx].it, "it-IT");
      setTimeout(() => {
        setRisposte(prev => [...prev, { turno: turnoIdx, risposta: idx }]);
        setFeedback(null);
        setSelected(null);
        if (turnoIdx + 1 >= turni.length) setCompletato(true);
        else {
          setTurnoIdx(t => t + 1);
          // TTS per il prossimo turno del personaggio
          const next = turni[turnoIdx + 1];
          if (next) setTimeout(() => pronounce(next.testo_it, "it-IT"), 400);
        }
      }, 1200);
    } else {
      playSound("wrong");
      setTimeout(() => { setFeedback(null); setSelected(null); }, 800);
    }
  }

  // TTS primo turno
  useEffect(() => {
    if (turni[0]) setTimeout(() => pronounce(turni[0].testo_it, "it-IT"), 300);
  }, []);

  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={completato ? "ok" : null} pulseUntilClick={false} />

        {/* Chat bubbles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {turni.map((t, ti) => {
            if (ti > turnoIdx && !completato) return null;
            const risposta = risposte.find(r => r.turno === ti);
            return (
              <div key={ti}>
                {/* Bolla personaggio */}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6, animation: "fade-in 0.3s ease-out" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{CHAR_COLOR[t.personaggio] ? "🗣️" : "🗣️"}</span>
                  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px 12px 12px 0", padding: "10px 14px", maxWidth: "75%" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{t.testo_it}</div>
                    <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--text3)", marginTop: 2 }}>{t.testo_en}</div>
                  </div>
                </div>
                {/* Bolla utente (se risposto) */}
                {risposta && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6, animation: "fade-in 0.3s ease-out" }}>
                    <div style={{ background: "rgba(88,204,2,0.15)", border: "1px solid #58cc02", borderRadius: "12px 12px 0 12px", padding: "10px 14px", maxWidth: "75%" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#58cc02" }}>{t.opzioni[risposta.risposta].it}</div>
                      <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(88,204,2,0.6)", marginTop: 2 }}>{t.opzioni[risposta.risposta].en}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Opzioni per turno corrente */}
        {!completato && turnoCorrente && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {turnoCorrente.opzioni.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(i)} style={{
                background: feedback === "ok" && i === selected ? "var(--ok-bar)" : feedback === "err" && i === selected ? "var(--err-bar)" : "var(--card)",
                border: `1.5px solid ${feedback === "ok" && i === selected ? "var(--ok-text)" : feedback === "err" && i === selected ? "var(--err-text)" : "var(--border)"}`,
                borderRadius: 10, padding: "10px 14px", cursor: feedback ? "default" : "pointer",
                fontFamily: "inherit", textTransform: "none", letterSpacing: "normal", textAlign: "left",
                animation: feedback === "err" && i === selected ? "shake-err 0.4s ease" : "none",
              }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{opt.it}</div>
                <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--text3)" }}>{opt.en}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {completato && (
        <div className="app-bottom">
          <button onClick={() => onAnswer(score === turni.length)} className="btn-primary">Avanti · Next →</button>
        </div>
      )}
    </>
  );
}

// ─── TIPO: ascolta_giudica ──────────────────────────────────────────────────
function DomandaAscoltoGiudica({ q, onAnswer }) {
  const [hasListened, setHasListened] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState(null);
  const isCorrect = selected === q.correct;
  const intro = getIntroBilingual(q);

  function handleListen() {
    pronounce(q.audio_it, "it-IT");
    setHasListened(true);
  }

  function handleAnswer(val) {
    if (confirmed || !hasListened) return;
    setSelected(val);
    setConfirmed(true);
    playSound(val === q.correct ? "correct" : "wrong");
  }

  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!hasListened} />

        {/* Pulsante ascolto grande */}
        <div style={{ textAlign: "center", margin: "12px 0" }}>
          <button onClick={handleListen} style={{
            width: 80, height: 80, borderRadius: "50%", border: "3px solid var(--special)",
            background: "rgba(255,149,0,0.1)", fontSize: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
            animation: !hasListened ? "pulse-ok 2s ease-in-out infinite" : "none",
          }}>🔊</button>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 8 }}>
            {hasListened ? "Tocca per riascoltare · Tap to listen again" : "Ascolta! · Listen!"}
          </div>
        </div>

        {/* Domanda */}
        <div className="q-card" style={{ borderColor: CHAR_COLOR[q.personaggio], textAlign: "center" }}>
          <div className="q-card__it">{q.domanda.it}</div>
          <div className="q-card__en">{q.domanda.en}</div>
        </div>
      </div>

      {confirmed
        ? <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
        : (
          <div className="app-bottom" style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleAnswer(true)} disabled={!hasListened} style={{
              flex: 1, height: 56, fontSize: 15, fontWeight: 700, borderRadius: "var(--r)",
              background: "var(--card)", border: "2px solid #58cc02", color: "#58cc02",
              cursor: hasListened ? "pointer" : "not-allowed", fontFamily: "inherit",
              opacity: hasListened ? 1 : 0.4, textTransform: "none", letterSpacing: "normal",
            }}>
              <div>✅ Corretto</div><div style={{ fontSize: 11, fontStyle: "italic", opacity: 0.7 }}>True</div>
            </button>
            <button onClick={() => handleAnswer(false)} disabled={!hasListened} style={{
              flex: 1, height: 56, fontSize: 15, fontWeight: 700, borderRadius: "var(--r)",
              background: "var(--card)", border: "2px solid #ff4b4b", color: "#ff4b4b",
              cursor: hasListened ? "pointer" : "not-allowed", fontFamily: "inherit",
              opacity: hasListened ? 1 : 0.4, textTransform: "none", letterSpacing: "normal",
            }}>
              <div>❌ Sbagliato</div><div style={{ fontSize: 11, fontStyle: "italic", opacity: 0.7 }}>False</div>
            </button>
          </div>
        )
      }
    </>
  );
}

// ─── TIPO: tap_right ────────────────────────────────────────────────────────
function DomandaTapRight({ q, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const isCorrect = selected === q.correct;
  const intro = getIntroBilingual(q);

  function handleTap(idx) {
    if (confirmed) return;
    setSelected(idx);
    setConfirmed(true);
    playSound(idx === q.correct ? "correct" : "wrong");
    if (idx === q.correct) pronounce(q.opzioni[idx].it, "it-IT");
  }

  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!confirmed} />
        {q.contesto_it && (() => {
          // Estrai l'emoji (prima occorrenza) e rimuovila dai testi IT/EN
          const emojiRegex = /\p{Extended_Pictographic}/u;
          const emojiGlobal = /\p{Extended_Pictographic}/gu;
          const emoji = q.contesto_emoji
            || (q.contesto_it.match(emojiRegex)?.[0])
            || (q.contesto_en?.match(emojiRegex)?.[0])
            || "";
          const itClean = q.contesto_it.replace(emojiGlobal, "").trim();
          const enClean = (q.contesto_en || "").replace(emojiGlobal, "").trim();
          return (
            <div style={{ background: "var(--bg)", borderLeft: "3px solid var(--special)", borderRadius: "0 var(--r) var(--r) 0", padding: 12 }}>
              {emoji && (
                <div style={{ fontSize: 24, textAlign: "center", marginBottom: 6 }}>{emoji}</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textAlign: "center" }}>{itClean}</div>
              {enClean && (
                <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 2 }}>{enClean}</div>
              )}
            </div>
          );
        })()}
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{q.domanda.it}</div>
        <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--text3)", marginTop: -8 }}>{q.domanda.en}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {q.opzioni.map((opt, i) => {
            const isSel = !confirmed && selected === i;
            const ok   = confirmed && i === q.correct;
            const err  = confirmed && selected === i && !isCorrect;
            const bg     = ok ? "rgba(88,204,2,0.08)" : err ? "rgba(255,75,75,0.06)" : isSel ? "rgba(28,176,246,0.08)" : "var(--bg-el)";
            const border = ok ? "var(--green)"        : err ? "var(--red)"           : isSel ? "var(--blue)"           : "var(--border-soft)";
            const itCol  = ok ? "var(--green)"        : err ? "var(--red)"           : "var(--text)";
            return (
              <button key={i} onClick={() => handleTap(i)} style={{
                background: bg, border: `1.5px solid ${border}`, borderRadius: 14,
                padding: "14px 8px", textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                minHeight: 90, cursor: confirmed ? "default" : "pointer",
                fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
                transition: "all 0.15s",
                animation: err ? "shake 0.3s ease" : "none",
              }}>
                {opt.emoji && <span style={{ fontSize: 28 }}>{opt.emoji}</span>}
                <div style={{ fontSize: 13, fontWeight: 700, color: itCol, lineHeight: 1.2 }}>{opt.it}</div>
                {opt.en && <div style={{ fontSize: 10, fontStyle: "italic", color: "var(--text3)", lineHeight: 1.2 }}>{opt.en}</div>}
              </button>
            );
          })}
        </div>
      </div>
      {confirmed && (
        <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
      )}
    </>
  );
}

// ─── TIPO: giusto_o_no ──────────────────────────────────────────────────────
function DomandaGiustoONo({ q, onAnswer }) {
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState(null);
  const isCorrect = selected === q.correct;
  const intro = getIntroBilingual(q);

  function handleAnswer(val) {
    if (confirmed) return;
    setSelected(val);
    setConfirmed(true);
    playSound(val === q.correct ? "correct" : "wrong");
  }

  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!confirmed} />
        {/* Scena box */}
        <div style={{
          background: "var(--bg-deep)", borderRadius: "var(--r)",
          padding: "14px 16px", marginBottom: 14,
          border: "1.5px solid var(--border-soft)",
        }}>
          {q.scena_it && (
            <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", marginBottom: 6 }}>
              {q.scena_it}{q.scena_en ? ` · ${q.scena_en}` : ""}
            </div>
          )}
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>"{q.frase_it}"</div>
          {q.frase_en && (
            <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", marginTop: 4 }}>"{q.frase_en}"</div>
          )}
        </div>
      </div>
      {confirmed
        ? <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
        : (
          <div className="app-bottom" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => handleAnswer(true)} style={{
              background: "rgba(88,204,2,0.1)",
              border: "1.5px solid rgba(88,204,2,0.3)",
              borderRadius: "var(--r)", padding: 16,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              cursor: "pointer",
              fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
              transition: "background 0.15s",
            }}>
              <span style={{ fontSize: 28 }}>👍</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>Giusto!</div>
              <div style={{ fontSize: 11, fontStyle: "italic", color: "rgba(88,204,2,0.6)" }}>Right</div>
            </button>
            <button onClick={() => handleAnswer(false)} style={{
              background: "rgba(255,75,75,0.08)",
              border: "1.5px solid rgba(255,75,75,0.25)",
              borderRadius: "var(--r)", padding: 16,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              cursor: "pointer",
              fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
              transition: "background 0.15s",
            }}>
              <span style={{ fontSize: 28 }}>👎</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--red)" }}>Sbagliato!</div>
              <div style={{ fontSize: 11, fontStyle: "italic", color: "rgba(255,75,75,0.6)" }}>Wrong</div>
            </button>
          </div>
        )
      }
    </>
  );
}

// ─── TIPO: completa_risposta ─────────────────────────────────────────────────
function DomandaCompletaRisposta({ q, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const isCorrect = selected === q.correct;
  const intro = getIntroBilingual(q);

  function renderRisposta(frase, selectedOpt) {
    const parts = frase.split("_____");
    if (parts.length < 2) return <span>{frase}</span>;
    return (
      <span>
        {parts[0]}
        <span style={{
          display: "inline-block", minWidth: 80,
          borderBottom: `2px solid ${confirmed ? (isCorrect ? "var(--ok-text)" : "var(--err-text)") : "var(--special)"}`,
          color: confirmed ? (isCorrect ? "var(--ok-text)" : "var(--err-text)") : "var(--special)",
          fontWeight: 700, textAlign: "center", padding: "0 8px",
        }}>
          {selectedOpt ? selectedOpt.it : "_____"}
        </span>
        {parts[1]}
      </span>
    );
  }

  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!confirmed} />
        {/* Contesto: qualcuno dice qualcosa */}
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            {q.contesto_it} / {q.contesto_en}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>"{q.frase_contesto_it}"</div>
          <div style={{ fontSize: 14, fontStyle: "italic", color: "var(--text3)", marginTop: 2 }}>"{q.frase_contesto_en}"</div>
        </div>
        {/* Freccia → Tu rispondi */}
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
          <div>↓ Tu rispondi:</div>
          <div style={{ fontStyle: "italic", opacity: 0.7 }}>You reply:</div>
        </div>
        {/* Risposta con buco */}
        <div className="q-card" style={{ borderColor: CHAR_COLOR[q.personaggio] }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>
            {renderRisposta(q.risposta_it, selected !== null ? q.opzioni[selected] : null)}
          </div>
          <div style={{ fontSize: 14, fontStyle: "italic", color: "var(--text3)", marginTop: 4 }}>{q.risposta_en}</div>
        </div>
        {/* Opzioni */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {q.opzioni.map((opt, i) => {
            const isSel = selected === i;
            const ok = confirmed && i === q.correct;
            const err = confirmed && isSel && !isCorrect;
            const bg = ok ? "var(--ok-bar)" : err ? "var(--err-bar)" : isSel ? "var(--opt-sel-bg)" : "var(--card)";
            const border = ok ? "var(--ok-text)" : err ? "var(--err-text)" : isSel ? "var(--opt-sel-b)" : "var(--border)";
            return (
              <button key={i} onClick={() => !confirmed && setSelected(i)} style={{
                flex: "1 1 45%", background: bg, border: `1.5px solid ${border}`,
                borderBottom: `4px solid ${border}`, borderRadius: 10, padding: "8px 12px",
                cursor: confirmed ? "default" : "pointer", fontFamily: "inherit",
                textTransform: "none", letterSpacing: "normal", textAlign: "center",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: ok ? "var(--ok-text)" : err ? "var(--err-text)" : "var(--text)" }}>{opt.it}</div>
                <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--text3)", opacity: 0.7 }}>{opt.en}</div>
              </button>
            );
          })}
        </div>
      </div>
      {confirmed
        ? <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
        : <CheckBar disabled={selected === null} onCheck={() => { setConfirmed(true); playSound(isCorrect ? "correct" : "wrong"); }} />
      }
    </>
  );
}

// ─── TIPO: ascolta_ripeti ───────────────────────────────────────────────────
function DomandaAscoltaRipeti({ q, onAnswer }) {
  const [hasListened, setHasListened] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const isCorrect = selected === q.correct;
  const intro = getIntroBilingual(q);
  const audioOn = typeof window !== "undefined" && localStorage.getItem("ics_audio") !== "false";

  function handleListen() {
    pronounce(q.audio_it, "it-IT");
    setHasListened(true);
  }

  function handleSelect(idx) {
    if (confirmed) return;
    setSelected(idx);
    setConfirmed(true);
    playSound(idx === q.correct ? "correct" : "wrong");
    if (idx === q.correct) pronounce(q.opzioni[idx].it, "it-IT");
  }

  return (
    <>
      <div className="app-body">
        <PersonaggioBubble character={q.personaggio} textIT={intro.it} textEN={intro.en} feedback={confirmed ? (isCorrect ? "ok" : "err") : null} pulseUntilClick={!hasListened && audioOn} />

        {audioOn ? (
          <>
            <div style={{ textAlign: "center", margin: "8px 0" }}>
              <button onClick={handleListen} style={{
                width: 72, height: 72, borderRadius: "50%", border: "3px solid var(--special)",
                background: "rgba(255,149,0,0.1)", fontSize: 32, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
                animation: !hasListened ? "pulse-ok 2s ease-in-out infinite" : "none",
              }}>🔊</button>
              <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 6 }}>
                {hasListened ? "Tocca per riascoltare" : "Ascolta la frase! · Listen!"}
              </div>
            </div>
          </>
        ) : (
          <div className="q-card" style={{ borderColor: CHAR_COLOR[q.personaggio], textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--text3)", textTransform: "uppercase", marginBottom: 6 }}>Leggi e scegli! · Read and choose!</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{q.audio_it}</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {q.opzioni.map((opt, i) => {
            const isSel = selected === i;
            const ok = confirmed && i === q.correct;
            const err = confirmed && isSel && !isCorrect;
            return (
              <button key={i} onClick={() => (hasListened || !audioOn) && handleSelect(i)} style={{
                background: ok ? "var(--ok-bar)" : err ? "var(--err-bar)" : "var(--card)",
                border: `1.5px solid ${ok ? "var(--ok-text)" : err ? "var(--err-text)" : "var(--border)"}`,
                borderRadius: "var(--r)", padding: "12px 16px", cursor: (hasListened || !audioOn) && !confirmed ? "pointer" : "default",
                fontFamily: "inherit", textTransform: "none", letterSpacing: "normal", textAlign: "left",
                opacity: (!hasListened && audioOn) ? 0.4 : 1,
                animation: err ? "shake-err 0.4s ease" : "none",
              }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: ok ? "var(--ok-text)" : err ? "var(--err-text)" : "var(--text)" }}>{opt.it}</div>
                <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--text3)" }}>{opt.en}</div>
              </button>
            );
          })}
        </div>
      </div>
      {confirmed && (
        <FeedbackBar isCorrect={isCorrect} feedbackOk={q.feedbackOk} feedbackErr={q.feedbackErr} onNext={() => { window.speechSynthesis?.cancel(); onAnswer(isCorrect); }} />
      )}
    </>
  );
}

function DomandaRouter({ q, onAnswer }) {
  if (!q) return null;
  switch (q.tipo) {
    case "vero_falso":         return <DomandaVeroFalso        key={q.domanda?.it || q.id} q={q} onAnswer={onAnswer} />;
    case "ascolta_scegli":     return <DomandaAscolta          key={q.domanda?.it || q.id} q={q} onAnswer={onAnswer} />;
    case "word_bank":          return <DomandaWordBank         key={q.domanda?.it || q.id} q={q} onAnswer={onAnswer} />;
    case "abbina_coppia":      return <DomandaAbbina           key={q.domanda?.it || q.id} q={q} onAnswer={onAnswer} />;
    case "fill_blank":         return <DomandaFillBlank        key={q.frase_it   || q.id} q={q} onAnswer={onAnswer} />;
    case "dialogo":            return <DomandaDialogo          key={q.id}                  q={q} onAnswer={onAnswer} />;
    case "ascolta_giudica":    return <DomandaAscoltoGiudica   key={q.audio_it   || q.id} q={q} onAnswer={onAnswer} />;
    case "tap_right":          return <DomandaTapRight         key={q.contesto_it || q.id} q={q} onAnswer={onAnswer} />;
    case "giusto_o_no":        return <DomandaGiustoONo        key={q.frase_it   || q.id} q={q} onAnswer={onAnswer} />;
    case "completa_risposta":  return <DomandaCompletaRisposta key={q.risposta_it || q.id} q={q} onAnswer={onAnswer} />;
    case "ascolta_ripeti":     return <DomandaAscoltaRipeti    key={q.audio_it   || q.id} q={q} onAnswer={onAnswer} />;
    default:                   return <DomandaMultipla         key={q.domanda?.it || q.id} q={q} onAnswer={onAnswer} />;
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
    setReward(r); setFase("popup");
  }

  if (fase === "popup" && reward) {
    const totale = lesson.questions.length;
    const corrette = reward.corrette ?? 0;
    const msg = getMessaggioMario(corrette, totale);
    const lessonIndex = lezione === "boss" ? 5 : Math.max(0, (parseInt(lezione) || 1) - 1);
    return (
      <LessonCompletePopup
        reward={{
          emoji: reward.ciboEmoji,
          nome_it: reward.ciboNome,
          nome_en: reward.ciboNomeEN,
        }}
        corrette={corrette}
        totale={totale}
        crediti={reward.crediti ?? 0}
        energia={reward.energia ?? 0}
        lessonIndex={lessonIndex}
        messaggioIT={msg.it}
        messaggioEN={msg.en}
        onHome={() => router.push("/")}
        onContinua={() => setFase("done")}
      />
    );
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
