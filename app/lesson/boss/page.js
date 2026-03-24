"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CharacterBubble, {
  parla,
  CHARACTERS,
} from "../../components/CharacterBubble";
import LessonComplete from "../../components/LessonComplete";
import { salvaProgressi, getNonnaMsg } from "../../components/saveProgress";

// ─── Suoni ────────────────────────────────────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
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

function playVittoria() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 440, 392, 349, 440, 523].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.26, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o.start(t); o.stop(t + 0.46);
    });
  } catch (e) {}
}

// ─── Componente principale ────────────────────────────────────────────────────
export default function BossLevel() {
  const router = useRouter();

  // Stato caricamento domande
  const [loading, setLoading]     = useState(true);
  const [questions, setQuestions] = useState([]);
  const [source, setSource]       = useState("fallback"); // "gemini" | "fallback"

  // Stato gioco
  const [current, setCurrent]         = useState(0);
  const [selected, setSelected]       = useState(null);
  const [confirmed, setConfirmed]     = useState(false);
  const [scoreCorrect, setScoreCorrect] = useState(0);
  const [animFeedback, setAnimFeedback] = useState(null);
  const [done, setDone]               = useState(false);
  const [reward, setReward]           = useState(null);

  // ─── Carica domande all'avvio ───────────────────────────────────────────────
  useEffect(() => {
    async function fetchQuestions() {
      try {
        // Leggi livello e domande già viste da localStorage
        const saved = JSON.parse(localStorage.getItem("ics_progress") || "{}");
        const livello = saved.livello ?? "Turista";
        const seenIds = saved.seenBossIds ?? [];

        const res = await fetch("/api/sfida", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ livello, seenIds }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setQuestions(data.questions);
        setSource(data.source);

        // Salva gli ID visti (per anti-ripetizione futura)
        if (data.source === "gemini") {
          const newIds = data.questions.map((q) => q.id);
          const updated = [...new Set([...seenIds, ...newIds])].slice(-60); // max 60
          localStorage.setItem(
            "ics_progress",
            JSON.stringify({ ...saved, seenBossIds: updated })
          );
        }
      } catch (err) {
        // Fallback silenzioso — usa le domande di default dall'API
        // (che già gestisce il fallback internamente)
        console.warn("[boss] fetch fallito, riprovo con fallback diretto");
        setQuestions([]); // l'API route gestisce il fallback, questo non dovrebbe accadere
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // ─── Dati domanda corrente ──────────────────────────────────────────────────
  const q = questions[current];
  const isCorrect = selected !== null && q && q.opts[selected] === q.opts[q.correct];
  const progress = questions.length > 0
    ? Math.round(((current + 1) / questions.length) * 100)
    : 0;

  function handleSelect(i) {
    if (confirmed) return;
    setSelected(i);
  }

  function handleConfirm() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    if (isCorrect) {
      playSound("correct");
      setAnimFeedback("ok");
      setScoreCorrect((s) => s + 1);
    } else {
      playSound("wrong");
      setAnimFeedback("err");
    }
    setTimeout(() => setAnimFeedback(null), 600);
  }

  function handleNext() {
    window.speechSynthesis?.cancel();

    if (current + 1 >= questions.length) {
      // Fine sfida — calcola energia e salva
      const finalScore = isCorrect ? scoreCorrect : scoreCorrect; // già aggiornato
      const nonnaData = getNonnaMsg(isCorrect ? scoreCorrect + 1 : scoreCorrect);
      
      const r = salvaProgressi({
        tipo: "boss",
        corrette: isCorrect ? scoreCorrect + 1 : scoreCorrect,
        totDomande: questions.length,
      });
      setReward(r);
      playVittoria();
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
      setAnimFeedback(null);
    }
  }

  // ─── Schermata di caricamento ───────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", animation: "pulse-ok 1s ease infinite" }}>🍦</div>
        <p style={{ fontSize: "15px", fontWeight: 800, color: "#E5B700", marginBottom: "6px" }}>
          Vittoria prepara le domande…
        </p>
        <p style={{ fontSize: "12px", color: "var(--text3)", fontStyle: "italic" }}>
          Vittoria is preparing your questions…
        </p>
      </main>
    );
  }

  // ─── Schermata vittoria / risultato finale ──────────────────────────────────
  if (done && reward) {
    return <LessonComplete reward={reward} onHome={() => router.push("/")} />;
  }

    // ─── Guardia: domande non ancora caricate ──────────────────────────────────
  if (!q) return null;

  // ─── Top bar ───────────────────────────────────────────────────────────────
  const topBar = (
    <div style={{
      background: "var(--card)",
      borderBottom: "2px solid var(--border)",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}>
      <button
        onClick={() => router.push("/")}
        style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", padding: "4px", color: "var(--text2)" }}
      >
        ←
      </button>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "11px", fontWeight: 900, color: "#E5B700",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>🍦 Sfida la Nonna</span>
          {source === "gemini" && (
            <span style={{ fontSize: "10px", color: "var(--text3)", fontWeight: 700 }}>✨ AI</span>
          )}
        </div>
        <div style={{ height: "8px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            background: "#E5B700", borderRadius: "99px",
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>
      <span style={{ fontSize: "13px", fontWeight: 900, color: "#E5B700" }}>
        {scoreCorrect} ✅
      </span>
    </div>
  );

  // ─── Gioco ─────────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", flexDirection: "column" }}>
      {topBar}

      <div style={{
        flex: 1, padding: "24px 16px",
        display: "flex", flexDirection: "column", gap: "20px",
        maxWidth: "480px", margin: "0 auto", width: "100%",
      }}>
        {/* Narrativa / domanda */}
        <div style={{
          background: "var(--card)",
          borderRadius: "var(--r)",
          border: "2px solid #E5B700",
          padding: "16px 18px",
          boxShadow: "0 0 12px #E5B70022",
        }}>
          <p style={{ fontWeight: 900, fontSize: "15px", color: "var(--text)", marginBottom: "6px", lineHeight: 1.6 }}>
            {q.q}
          </p>
          {q.qEN && (
            <p style={{ fontWeight: 700, fontSize: "12px", color: "var(--text3)", lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
              {q.qEN}
            </p>
          )}
        </div>

        {/* Vittoria — osserva ogni risposta */}
        <CharacterBubble
          character="vittoria"
          text="Pensa bene prima di rispondere — ti sto guardando."
          speakText="Pensa bene prima di rispondere. Ti sto guardando."
          autoSpeak={current === 0 && !confirmed}
          feedback={animFeedback}
        />

        {/* Opzioni */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.opts.map((opt, i) => {
            let bg = "var(--opt-bg)", border = "var(--opt-border)", color = "var(--opt-text)", shadow = "0 4px 0 var(--border)", anim = "none";
            if (confirmed) {
              shadow = "none";
              if (i === q.correct) {
                bg = "var(--ok-bar)"; border = "var(--ok-text)"; color = "var(--ok-text)";
                if (i === selected) anim = "pulse-ok 0.5s ease";
              } else if (i === selected && !isCorrect) {
                bg = "var(--err-bar)"; border = "var(--err-text)"; color = "var(--err-text)";
                anim = "shake-err 0.5s ease";
              }
            } else if (selected === i) {
              bg = "var(--opt-sel-bg)"; border = "var(--opt-sel-b)"; color = "var(--opt-sel-text)"; shadow = "0 4px 0 var(--opt-sel-b)";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  background: bg, border: `2px solid ${border}`, color,
                  borderRadius: "var(--r)", padding: "14px 16px",
                  textAlign: "left", fontSize: "14px", fontWeight: 800,
                  textTransform: "none", letterSpacing: 0,
                  cursor: confirmed ? "default" : "pointer",
                  transition: "background 0.15s, border 0.15s, color 0.15s",
                  animation: anim, boxShadow: shadow,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK BAR */}
      {confirmed ? (
        <div style={{
          background: isCorrect ? "var(--ok-bar)" : "var(--err-bar)",
          borderTop: `2px solid ${isCorrect ? "var(--ok-text)" : "var(--err-text)"}`,
          padding: "20px 16px",
          animation: "slide-up 0.25s ease",
        }}>
          <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 900, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", marginBottom: "4px" }}>
                {isCorrect ? "✅ Esatto! / Correct!" : "❌ Sbagliato / Wrong"}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", opacity: 0.85, lineHeight: 1.5 }}>
                {isCorrect ? q.explain : q.explain}
              </div>
              {q.explainEN && (
                <div style={{ fontSize: "12px", color: isCorrect ? "var(--ok-text)" : "var(--err-text)", opacity: 0.65, marginTop: "4px", fontStyle: "italic" }}>
                  {q.explainEN}
                </div>
              )}
            </div>
            <button
              onClick={handleNext}
              style={{
                background: isCorrect ? "var(--primary)" : "var(--err-btn)",
                color: "white", padding: "14px 20px", borderRadius: "var(--r)",
                fontSize: "14px", fontWeight: 900, border: "none",
                boxShadow: `0 4px 0 ${isCorrect ? "var(--primary-d)" : "var(--err-btn-d)"}`,
                textTransform: "uppercase", letterSpacing: "0.6px", flexShrink: 0, cursor: "pointer",
              }}
            >
              {current + 1 >= questions.length ? "Finisci!" : "Avanti"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "16px", background: "var(--card)", borderTop: "2px solid var(--border)" }}>
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <button
              onClick={handleConfirm}
              disabled={selected === null}
              style={{
                width: "100%", padding: "16px", borderRadius: "var(--r)",
                fontSize: "15px", fontWeight: 900, letterSpacing: "0.6px",
                border: "none", textTransform: "uppercase",
                background: selected === null ? "var(--dis-bg)" : "#E5B700",
                color: selected === null ? "var(--dis-text)" : "white",
                boxShadow: selected === null ? "none" : "0 4px 0 #b8920b",
                cursor: selected === null ? "not-allowed" : "pointer",
              }}
            >
              Controlla / Check
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
