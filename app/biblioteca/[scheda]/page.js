"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CharacterBubble from "../../components/CharacterBubble";
import { getLevelData } from "../../components/LevelBadge";

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

// Shuffle semplice — restituisce array di {testo, isCorrect}
function shuffleOpzioni(opzioni, correctIdx) {
  const arr = opzioni.map((testo, i) => ({ testo, isCorrect: i === correctIdx }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Esercizio Multipla ────────────────────────────────────────────────────────
function EsercizioMultipla({ q, onDone }) {
  const [opzioni] = useState(() => shuffleOpzioni(q.opzioni, q.correct));
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const isCorrect = selected !== null && opzioni[selected]?.isCorrect;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", lineHeight: 1.5 }}>{q.domanda.it}</div>
      <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", marginBottom: 4 }}>{q.domanda.en}</div>
      {opzioni.map((opt, si) => {
        let bg = "var(--opt-bg)", border = "var(--opt-border)", color = "var(--opt-text)";
        if (confirmed) {
          if (opt.isCorrect) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
          else if (si === selected) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
        } else if (selected === si) {
          bg = "var(--opt-sel-bg)"; border = "var(--opt-sel-b)"; color = "var(--opt-sel-text)";
        }
        return (
          <button key={si} onClick={() => !confirmed && setSelected(si)} style={{
            background: bg, border: `2px solid ${border}`, color,
            borderRadius: "var(--r)", padding: "11px 14px", textAlign: "left",
            fontFamily: "inherit", width: "100%",
            cursor: confirmed ? "default" : "pointer", fontSize: 13, fontWeight: 700,
          }}>
            {opt.testo}
          </button>
        );
      })}
      {!confirmed && (
        <button
          onClick={() => { if (selected === null) return; setConfirmed(true); playSound(isCorrect ? "correct" : "wrong"); }}
          disabled={selected === null}
          style={{ marginTop: 4, padding: 12, borderRadius: "var(--r)", border: "none", background: selected === null ? "var(--dis-bg)" : "var(--primary)", color: selected === null ? "var(--dis-text)" : "white", fontSize: 13, fontWeight: 900, cursor: selected === null ? "not-allowed" : "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.6px" }}
        >
          Controlla / Check
        </button>
      )}
      {confirmed && (
        <div style={{ background: isCorrect ? "var(--ok-bar)" : "var(--err-bar)", border: `1.5px solid ${isCorrect ? "var(--ok-text)" : "var(--err-text)"}`, borderRadius: "var(--r)", padding: "12px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", marginBottom: 3 }}>
            {isCorrect ? "✅ Esatto! / Correct!" : "❌ Non corretto / Wrong"}
          </div>
          <div style={{ fontSize: 12, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", lineHeight: 1.5, marginBottom: 4 }}>
            {isCorrect ? q.feedbackOk?.it : q.feedbackErr?.it}
          </div>
          <div style={{ fontSize: 11, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", opacity: 0.75, fontStyle: "italic", marginBottom: 10 }}>
            {isCorrect ? q.feedbackOk?.en : q.feedbackErr?.en}
          </div>
          <button onClick={() => onDone(isCorrect)} style={{ width: "100%", padding: 10, borderRadius: "var(--r)", border: "none", background: isCorrect ? "var(--primary)" : "#CC0000", color: "white", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}>
            Avanti / Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Esercizio Vero/Falso ──────────────────────────────────────────────────────
function EsercizioVeroFalso({ q, onDone }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const isCorrect = selected === q.correct;

  function handleSelect(val) {
    if (confirmed) return;
    setSelected(val); setConfirmed(true);
    playSound(val === q.correct ? "correct" : "wrong");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", lineHeight: 1.5 }}>{q.domanda.it}</div>
      <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", marginBottom: 4 }}>{q.domanda.en}</div>
      <div style={{ display: "flex", gap: 10 }}>
        {[true, false].map(val => {
          let bg = "var(--card)", border = "var(--border)", color = "var(--text)";
          if (confirmed) {
            if (val === q.correct) { bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)"; }
            else if (val === selected) { bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)"; }
          }
          return (
            <button key={String(val)} onClick={() => handleSelect(val)} disabled={confirmed} style={{
              flex: 1, padding: 12, borderRadius: "var(--r)", border: `2px solid ${border}`,
              background: bg, color, fontSize: 13, fontWeight: 900,
              cursor: confirmed ? "default" : "pointer", fontFamily: "inherit",
            }}>
              {val ? "✅ Vero / True" : "❌ Falso / False"}
            </button>
          );
        })}
      </div>
      {confirmed && (
        <div style={{ background: isCorrect ? "var(--ok-bar)" : "var(--err-bar)", border: `1.5px solid ${isCorrect ? "var(--ok-text)" : "var(--err-text)"}`, borderRadius: "var(--r)", padding: "12px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", marginBottom: 3 }}>
            {isCorrect ? "✅ Esatto! / Correct!" : "❌ Non corretto / Wrong"}
          </div>
          <div style={{ fontSize: 12, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", lineHeight: 1.5, marginBottom: 4 }}>
            {isCorrect ? q.feedbackOk?.it : q.feedbackErr?.it}
          </div>
          <div style={{ fontSize: 11, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", opacity: 0.75, fontStyle: "italic", marginBottom: 10 }}>
            {isCorrect ? q.feedbackOk?.en : q.feedbackErr?.en}
          </div>
          <button onClick={() => onDone(isCorrect)} style={{ width: "100%", padding: 10, borderRadius: "var(--r)", border: "none", background: isCorrect ? "var(--primary)" : "#CC0000", color: "white", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}>
            Avanti / Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Esercizio Word Bank ───────────────────────────────────────────────────────
function EsercizioWordBank({ q, onDone }) {
  const correct = q.correct || [];
  const pool = [...(q.parole || []), ...(q.distrattori || [])];
  const [shuffled] = useState(() => [...pool].sort(() => Math.random() - 0.5));
  const [target, setTarget] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const usedCounts = {};
  target.forEach(w => { usedCounts[w] = (usedCounts[w] || 0) + 1; });

  function addWord(w) {
    const avail = pool.filter(x => x === w).length;
    if ((usedCounts[w] || 0) < avail) { setTarget(t => [...t, w]); setFeedback(null); }
  }
  function removeWord(i) { if (feedback === "ok") return; setTarget(t => t.filter((_, idx) => idx !== i)); setFeedback(null); }
  function handleCheck() {
    if (target.length < correct.length) { setFeedback("incomplete"); return; }
    const ok = JSON.stringify(target) === JSON.stringify(correct);
    setFeedback(ok ? "ok" : "err");
    playSound(ok ? "correct" : "wrong");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", lineHeight: 1.5 }}>{q.domanda.it}</div>
      <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>{q.domanda.en}</div>
      <div style={{ background: "var(--bg)", border: `2px dashed ${feedback === "ok" ? "var(--ok-text)" : feedback === "err" ? "var(--err-text)" : "var(--border)"}`, borderRadius: "var(--r)", padding: "10px 12px", minHeight: 46, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        {target.length === 0
          ? <span style={{ color: "var(--text3)", fontSize: 12 }}>Tocca le parole qui sotto / Tap words below</span>
          : target.map((w, i) => (
            <button key={i} onClick={() => removeWord(i)} style={{ background: "#C8A0E818", border: "2px solid #C8A0E8", borderRadius: 8, padding: "5px 10px", fontSize: 13, fontWeight: 800, color: "#C8A0E8", cursor: feedback === "ok" ? "default" : "pointer", fontFamily: "inherit" }}>{w}</button>
          ))}
      </div>
      <div style={{ fontSize: 10, color: "var(--text3)", textAlign: "right" }}>{target.length}/{correct.length} parole / words</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {shuffled.map((w, i) => {
          const avail = pool.filter(x => x === w).length;
          const isUsed = (usedCounts[w] || 0) >= avail;
          return (
            <button key={i} onClick={() => !isUsed && feedback !== "ok" && addWord(w)} disabled={isUsed || feedback === "ok"} style={{ background: "var(--card)", border: "2px solid var(--border)", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 800, color: "var(--text)", cursor: isUsed ? "not-allowed" : "pointer", opacity: isUsed ? 0.25 : 1, fontFamily: "inherit" }}>{w}</button>
          );
        })}
      </div>
      {feedback && (
        <div style={{ background: feedback === "ok" ? "var(--ok-bar)" : feedback === "incomplete" ? "#1a1200" : "var(--err-bar)", border: `1.5px solid ${feedback === "ok" ? "var(--ok-text)" : feedback === "incomplete" ? "#E5B70088" : "var(--err-text)"}`, borderRadius: "var(--r)", padding: "12px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: feedback === "ok" ? "var(--ok-text)" : feedback === "incomplete" ? "#E5B700" : "var(--err-text)", marginBottom: 3 }}>
            {feedback === "ok" ? "✅ Esatto! / Correct!" : feedback === "incomplete" ? "⚠️ Incompleta / Incomplete" : "❌ Non corretto / Wrong"}
          </div>
          {feedback !== "incomplete" && (
            <>
              <div style={{ fontSize: 12, color: feedback === "ok" ? "var(--ok-text)" : "var(--err-text)", lineHeight: 1.5, marginBottom: 4 }}>{feedback === "ok" ? q.feedbackOk?.it : q.feedbackErr?.it}</div>
              <div style={{ fontSize: 11, color: feedback === "ok" ? "var(--ok-text)" : "var(--err-text)", opacity: 0.75, fontStyle: "italic", marginBottom: 10 }}>{feedback === "ok" ? q.feedbackOk?.en : q.feedbackErr?.en}</div>
            </>
          )}
          {feedback === "ok"
            ? <button onClick={() => onDone(true)} style={{ width: "100%", padding: 10, borderRadius: "var(--r)", border: "none", background: "var(--primary)", color: "white", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}>Avanti / Next →</button>
            : <button onClick={() => { setTarget([]); setFeedback(null); }} style={{ width: "100%", padding: 10, borderRadius: "var(--r)", border: "none", background: "#E5B700", color: "white", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}>🔁 Riprova / Try again</button>}
        </div>
      )}
      {!feedback && (
        <button onClick={handleCheck} disabled={target.length === 0} style={{ padding: 12, borderRadius: "var(--r)", border: "none", background: target.length === 0 ? "var(--dis-bg)" : "var(--primary)", color: target.length === 0 ? "var(--dis-text)" : "white", fontSize: 13, fontWeight: 900, cursor: target.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Controlla / Check
        </button>
      )}
    </div>
  );
}

// ── Router esercizi ───────────────────────────────────────────────────────────
function EsercizioRouter({ q, onDone }) {
  switch (q.tipo) {
    case "vero_falso": return <EsercizioVeroFalso q={q} onDone={onDone} />;
    case "word_bank":  return <EsercizioWordBank  q={q} onDone={onDone} />;
    default:           return <EsercizioMultipla  q={q} onDone={onDone} />;
  }
}

// ── Pagina scheda ─────────────────────────────────────────────────────────────
export default function SchedaPage() {
  const router = useRouter();
  const { scheda } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sezione, setSezione] = useState("teoria"); // teoria | esercizi
  const [marioSpeaking, setMarioSpeaking] = useState(false);
  const [tipoEser, setTipoEser] = useState("multipla");
  const [eserIdx, setEserIdx] = useState(0);
  const [score, setScore] = useState({ multipla: 0, vero_falso: 0, word_bank: 0 });
  const [done, setDone] = useState({ multipla: false, vero_falso: false, word_bank: false });

  useEffect(() => {
    fetch(`/data/biblioteca/schede/${scheda}.json`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [scheda]);

  function speakEsempio(text) {
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "it-IT"; u.rate = 0.88;
      window.speechSynthesis.speak(u);
    }, 50);
  }

  function getEsercizi(tipo) {
    return (data?.esercizi || []).filter(e => e.tipo === tipo);
  }

  function handleEserDone(correct) {
    const lista = getEsercizi(tipoEser);
    if (correct) setScore(s => ({ ...s, [tipoEser]: s[tipoEser] + 1 }));
    if (eserIdx + 1 >= lista.length) {
      setDone(d => ({ ...d, [tipoEser]: true }));
    } else {
      setEserIdx(i => i + 1);
    }
  }

  function startTipo(tipo) {
    setTipoEser(tipo);
    setEserIdx(0);
    setDone(d => ({ ...d, [tipo]: false }));
    setScore(s => ({ ...s, [tipo]: 0 }));
    setSezione("esercizi");
  }

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 36, marginBottom: 8 }}>☕</div><div style={{ fontSize: 13, color: "var(--text3)" }}>Caricamento / Loading...</div></div>
    </main>
  );

  if (!data) return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>😅</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--err-text)", marginBottom: 16 }}>Scheda non trovata / Card not found</div>
        <button onClick={() => router.push("/biblioteca")} style={{ background: "var(--primary)", color: "white", padding: "10px 20px", borderRadius: "var(--r)", border: "none", fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>← Biblioteca</button>
      </div>
    </main>
  );

  const lv = getLevelData(data.livello);
  const tipiConfig = [
    { tipo: "multipla",   emoji: "🔤", it: "Scelta Multipla",  en: "Multiple Choice" },
    { tipo: "vero_falso", emoji: "✅", it: "Vero o Falso",     en: "True or False" },
    { tipo: "word_bank",  emoji: "🧩", it: "Componi la Frase", en: "Build the Sentence" },
  ];

  const eserCorrente = sezione === "esercizi" ? getEsercizi(tipoEser) : [];
  const isDoneTipo = done[tipoEser];
  const totTipo = eserCorrente.length;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 60 }}>

      {/* Header sticky */}
      <div style={{ background: "var(--card)", borderBottom: "2px solid var(--border)", padding: "12px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => sezione === "esercizi" ? setSezione("teoria") : router.push("/biblioteca")} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: "5px 11px", fontSize: 11, fontWeight: 900, color: "var(--text2)", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
            {sezione === "esercizi" ? "← Teoria" : "← Biblioteca"}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
              {data.emoji} {data.titolo.it}
              <span style={{ fontSize: 9, fontWeight: 800, color: lv.color, background: lv.bg, padding: "2px 6px", borderRadius: 99, flexShrink: 0 }}>{data.livello}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>{data.titolo.en}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── SEZIONE TEORIA ── */}
        {sezione === "teoria" && (
          <>
            {/* Mario intro */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  border: "3px solid #FF9B42", overflow: "hidden",
                  background: "var(--card)",
                  boxShadow: "0 0 0 0 #FF9B4266",
                  animation: "mario-pulse 2.5s ease-in-out infinite",
                }}>
                  <img src="/images/mario.png" alt="Mario" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setMarioSpeaking(true);
                    setTimeout(() => {
                      const u = new SpeechSynthesisUtterance(data.mario);
                      u.lang = "it-IT"; u.rate = 0.88;
                      u.onend = () => setMarioSpeaking(false);
                      u.onerror = () => setMarioSpeaking(false);
                      window.speechSynthesis.speak(u);
                    }, 50);
                  }}
                  style={{
                    position: "absolute", bottom: -4, right: -4,
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#FF9B42", border: "2px solid var(--bg)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, cursor: "pointer", lineHeight: 1,
                  }}
                  title="Ascolta / Listen"
                >🔊</button>
              </div>
              <div style={{ flex: 1, background: marioSpeaking ? "#FF9B4211" : "var(--card)", border: `2px solid ${marioSpeaking ? "#FF9B42" : "#FF9B4244"}`, borderRadius: "var(--r)", padding: "12px 14px", boxShadow: marioSpeaking ? "0 0 16px #FF9B4244" : "none", transition: "all 0.3s" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", lineHeight: 1.5, marginBottom: 4 }}>{data.mario}</div>
                <div style={{ height: 1, background: "var(--border)", marginBottom: 4 }} />
                <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", lineHeight: 1.4 }}>{data.marioEn}</div>
              </div>
            </div>
            <style>{`
              @keyframes mario-pulse {
                0%, 100% { box-shadow: 0 0 0 0 #FF9B4266; }
                50% { box-shadow: 0 0 0 8px #FF9B4200; }
              }
            `}</style>

            {/* 💡 Perché / Why */}
            <div style={{ background: "#1a1200", border: "2px solid #E5B700", borderRadius: "var(--r)", padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#E5B700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                💡 Perché / Why — finally someone explains
              </div>
              <div style={{ fontSize: 13, color: "#F5E6A3", lineHeight: 1.7, marginBottom: 8 }}>{data.perche.it}</div>
              <div style={{ height: 1, background: "#E5B70033", marginBottom: 8 }} />
              <div style={{ fontSize: 12, color: "#C8B87A", lineHeight: 1.6, fontStyle: "italic" }}>{data.perche.en}</div>
            </div>

            {/* Spiegazione */}
            <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📖 Spiegazione / Explanation</div>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 6 }}>{data.spiegazione.it}</div>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 6 }} />
              <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5, fontStyle: "italic" }}>{data.spiegazione.en}</div>
            </div>

            {/* Tabella */}
            {data.tabella && (
              <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: 16, overflowX: "auto" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>📊 Schema / Table</div>
                {(() => {
                  // Supporta sia il vecchio formato {headers, rows} che il nuovo formato array di oggetti
                  const isOldFormat = data.tabella.headers && data.tabella.rows;
                  const headers = isOldFormat
                    ? data.tabella.headers
                    : Object.keys(data.tabella[0] || {});
                  const rows = isOldFormat
                    ? data.tabella.rows
                    : data.tabella.map(obj => Object.values(obj));
                  return (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                      <thead>
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} style={{ padding: "6px 8px", textAlign: "left", borderBottom: "2px solid var(--border)", color: "var(--text2)", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, ri) => (
                          <tr key={ri} style={{ borderBottom: "1px solid var(--border)", background: ri % 2 === 0 ? "transparent" : "var(--bg)" }}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ padding: "7px 8px", color: ci === 0 ? "var(--text3)" : "var(--text)", fontWeight: ci === 0 ? 700 : 600, fontSize: 11, lineHeight: 1.4 }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            )}

            {/* Esempi audio */}
            <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                🔊 Esempi / Examples — tocca per ascoltare / tap to listen
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(data.esempi || []).map((e, i) => (
                  <div key={i} onClick={() => speakEsempio(e.audio || e.it)} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10 }}
                    onMouseEnter={ev => ev.currentTarget.style.borderColor = "var(--primary)"}
                    onMouseLeave={ev => ev.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>🔊</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", lineHeight: 1.4 }}>{e.it}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", marginTop: 2 }}>{e.en}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nota napoletana */}
            {data.nota && (
              <div style={{ background: "var(--bg)", borderLeft: "3px solid #FF9B42", borderRadius: "0 var(--r) var(--r) 0", padding: "10px 14px" }}>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{data.nota.it}</div>
                <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
                <div style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic", lineHeight: 1.5 }}>{data.nota.en}</div>
              </div>
            )}

            {/* Scegli tipo esercizio */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
                ✏️ Esercizi / Exercises — scegli il tipo / choose type
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tipiConfig.map(({ tipo, emoji, it, en }) => {
                  const lista = getEsercizi(tipo);
                  const isDone = done[tipo];
                  const sc = score[tipo];
                  return (
                    <button key={tipo} onClick={() => startTipo(tipo)} style={{
                      background: "var(--card)", border: `2px solid ${isDone ? "var(--ok-text)" : "var(--border)"}`,
                      borderRadius: "var(--r)", padding: "13px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      transition: "border 0.15s",
                    }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text)", marginBottom: 2 }}>{it} / {en}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{lista.length} esercizi / exercises</div>
                      </div>
                      {isDone
                        ? <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ok-text)", background: "var(--ok-bar)", padding: "3px 8px", borderRadius: 99 }}>{sc}/{lista.length} ✓</span>
                        : <span style={{ fontSize: 14, color: "var(--text3)" }}>›</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── SEZIONE ESERCIZI ── */}
        {sezione === "esercizi" && (
          <>
            {/* Header tipo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text)" }}>
                {tipiConfig.find(t => t.tipo === tipoEser)?.emoji} {tipiConfig.find(t => t.tipo === tipoEser)?.it}
              </div>
              {!isDoneTipo && (
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)" }}>
                  {eserIdx + 1}/{totTipo} · {score[tipoEser]} ✅
                </div>
              )}
            </div>

            {/* Progress bar */}
            {!isDoneTipo && (
              <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${((eserIdx) / totTipo) * 100}%`, height: "100%", background: "var(--primary)", borderRadius: 99, transition: "width 0.3s" }} />
              </div>
            )}

            {/* Esercizio corrente */}
            {!isDoneTipo && eserCorrente[eserIdx] && (
              <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: 16 }}>
                <EsercizioRouter key={`${tipoEser}-${eserIdx}`} q={eserCorrente[eserIdx]} onDone={handleEserDone} />
              </div>
            )}

            {/* Completamento tipo */}
            {isDoneTipo && (
              <div style={{ background: score[tipoEser] === totTipo ? "var(--ok-bar)" : "var(--card)", border: `2px solid ${score[tipoEser] === totTipo ? "var(--ok-text)" : "var(--border)"}`, borderRadius: "var(--r)", padding: "24px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{score[tipoEser] === totTipo ? "🎉" : "💪"}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: score[tipoEser] === totTipo ? "var(--ok-text)" : "var(--text)", marginBottom: 4 }}>
                  {score[tipoEser]}/{totTipo} — {score[tipoEser] === totTipo ? "Perfetto! / Perfect!" : "Quasi! / Almost!"}
                </div>
                <div style={{ fontSize: 12, color: score[tipoEser] === totTipo ? "var(--ok-text)" : "var(--text3)", marginBottom: 20, fontStyle: "italic" }}>
                  {score[tipoEser] === totTipo
                    ? "Tutti corretti! Vai avanti. / All correct! Keep going."
                    : "Rileggi la teoria e riprova. / Review the theory and try again."}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => startTipo(tipoEser)} style={{ flex: 1, padding: 11, borderRadius: "var(--r)", border: "2px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
                    🔁 Riprova / Retry
                  </button>
                  <button onClick={() => setSezione("teoria")} style={{ flex: 1, padding: 11, borderRadius: "var(--r)", border: "none", background: "var(--primary)", color: "white", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>
                    ← Teoria / Theory
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
