"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CharacterBubble, { parla, CHARACTERS } from "../../components/CharacterBubble";
import LessonComplete from "../../components/LessonComplete";
import { salvaProgressi } from "../../components/saveProgress";

// ─── Carica il JSON della lezione ─────────────────────────────────────────────
// I JSON sono in /public/data/lessons/ per essere accessibili via fetch
async function loadLesson(id) {
  const res = await fetch(`/data/lessons/lesson${id}.json`);
  if (!res.ok) throw new Error(`Lezione ${id} non trovata`);
  return res.json();
}

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

// ─── Fase INTRO — card vocabolario tap-to-reveal ──────────────────────────────
function VocabIntro({ lesson, onComplete }) {
  const [toccate, setToccate] = useState(new Set());
  const [attiva, setAttiva] = useState(null);

  function handleTap(v) {
    setAttiva(v.id);
    setToccate((prev) => new Set([...prev, v.id]));
    // Leggi il testo con la voce di Mario
    const voice = CHARACTERS["mario"];
    if (voice) parla(v.marioIT, voice);
  }

  const tutteVisitate = toccate.size >= lesson.vocab.length;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", flexDirection: "column" }}>
      {/* TopBar */}
      <div style={{ background: "var(--card)", borderBottom: "2px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            {lesson.title}
          </div>
          <div style={{ height: "8px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: `${Math.round((toccate.size / lesson.vocab.length) * 50)}%`, height: "100%", background: "var(--primary)", borderRadius: "99px", transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "480px", margin: "0 auto", width: "100%" }}>

        <CharacterBubble
          character="mario"
          text={`Benvenuto! Tocca ogni parola per impararla. / Welcome! Tap each word to learn it.`}
          speakText="Benvenuto! Tocca ogni parola per impararla."
          autoSpeak={true}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {lesson.vocab.map((v) => {
            const toccata = toccate.has(v.id);
            const isAttiva = attiva === v.id;
            return (
              <div
                key={v.id}
                onClick={() => handleTap(v)}
                style={{
                  background: toccata ? "var(--opt-sel-bg)" : "var(--card)",
                  border: `2px solid ${toccata ? "var(--opt-sel-b)" : "var(--border)"}`,
                  borderRadius: "var(--r)",
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: toccata ? "0 4px 0 var(--opt-sel-b)" : "0 4px 0 var(--border)",
                  animation: isAttiva ? "card-flip 0.3s ease" : "none",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                <div style={{ fontSize: "48px", lineHeight: 1, flexShrink: 0 }}>{v.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: "22px", color: toccata ? "var(--opt-sel-text)" : "var(--text)", marginBottom: "2px" }}>
                    {v.it}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text3)", fontWeight: 700 }}>{v.en}</div>
                  {toccata && (
                    <div style={{ fontSize: "12px", color: "var(--text2)", fontStyle: "italic", marginTop: "6px", lineHeight: 1.4 }}>
                      {v.mario}
                    </div>
                  )}
                </div>
                {toccata && <span style={{ fontSize: "20px" }}>✅</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pulsante continua */}
      <div style={{ padding: "16px", background: "var(--card)", borderTop: "2px solid var(--border)" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <button
            onClick={tutteVisitate ? onComplete : undefined}
            disabled={!tutteVisitate}
            style={{
              width: "100%", padding: "16px", borderRadius: "var(--r)",
              fontSize: "15px", fontWeight: 900, letterSpacing: "0.6px",
              border: "none", textTransform: "uppercase",
              background: tutteVisitate ? "var(--primary)" : "var(--dis-bg)",
              color: tutteVisitate ? "white" : "var(--dis-text)",
              boxShadow: tutteVisitate ? "0 4px 0 var(--primary-d)" : "none",
              cursor: tutteVisitate ? "pointer" : "not-allowed",
            }}
          >
            {tutteVisitate
              ? "Inizia il quiz / Start quiz →"
              : `Tocca tutte le parole (${toccate.size}/${lesson.vocab.length})`}
          </button>
        </div>
      </div>
    </main>
  );
}

// ─── Domanda MULTIPLA ─────────────────────────────────────────────────────────
function DomandaMultipla({ q, onAnswer, animFeedback }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const isCorrect = selected !== null && selected === q.correct;

  function handleConfirm() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    playSound(isCorrect ? "correct" : "wrong");
  }

  function handleNext() {
    window.speechSynthesis?.cancel();
    onAnswer(isCorrect);
  }

  return (
    <>
      <div style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "480px", margin: "0 auto", width: "100%" }}>

        {/* Personaggio */}
        <CharacterBubble
          character={q.personaggio}
          text={q.intro}
          speakText={q.introIT}
          autoSpeak={true}
          feedback={animFeedback}
        />

        {/* Domanda */}
        <div style={{ background: "var(--card)", borderRadius: "var(--r)", border: "2px solid var(--border)", padding: "14px 16px" }}>
          <p style={{ fontWeight: 900, fontSize: "15px", color: "var(--text)", marginBottom: "4px", lineHeight: 1.5 }}>
            {q.domanda.it}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text3)", fontStyle: "italic", margin: 0, lineHeight: 1.4 }}>
            {q.domanda.en}
          </p>
        </div>

        {/* Opzioni */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.opzioni.map((opt, i) => {
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
                onClick={() => !confirmed && setSelected(i)}
                style={{
                  background: bg, border: `2px solid ${border}`, color,
                  borderRadius: "var(--r)", padding: "14px 16px",
                  textAlign: "left", fontSize: "14px", fontWeight: 800,
                  textTransform: "none", letterSpacing: 0,
                  cursor: confirmed ? "default" : "pointer",
                  transition: "background 0.15s, border 0.15s",
                  animation: anim, boxShadow: shadow,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback bar / Confirm button */}
      {confirmed ? (
        <div style={{
          background: isCorrect ? "var(--ok-bar)" : "var(--err-bar)",
          borderTop: `2px solid ${isCorrect ? "var(--ok-text)" : "var(--err-text)"}`,
          padding: "20px 16px", animation: "slide-up 0.25s ease",
        }}>
          <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 900, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", marginBottom: "4px" }}>
                {isCorrect ? "✅ Esatto! / Correct!" : "❌ Sbagliato / Wrong"}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: isCorrect ? "var(--ok-text)" : "var(--err-text)", opacity: 0.85, lineHeight: 1.5 }}>
                {isCorrect ? q.feedbackOk.it : q.feedbackErr.it}
              </div>
              <div style={{ fontSize: "12px", color: isCorrect ? "var(--ok-text)" : "var(--err-text)", opacity: 0.65, marginTop: "3px", fontStyle: "italic" }}>
                {isCorrect ? q.feedbackOk.en : q.feedbackErr.en}
              </div>
            </div>
            <button onClick={handleNext} style={{
              background: isCorrect ? "var(--primary)" : "var(--err-btn)",
              color: "white", padding: "14px 20px", borderRadius: "var(--r)",
              fontSize: "14px", fontWeight: 900, border: "none",
              boxShadow: `0 4px 0 ${isCorrect ? "var(--primary-d)" : "var(--err-btn-d)"}`,
              textTransform: "uppercase", letterSpacing: "0.6px", cursor: "pointer", flexShrink: 0,
            }}>
              Avanti
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
                background: selected === null ? "var(--dis-bg)" : "var(--primary)",
                color: selected === null ? "var(--dis-text)" : "white",
                boxShadow: selected === null ? "none" : "0 4px 0 var(--primary-d)",
                cursor: selected === null ? "not-allowed" : "pointer",
              }}
            >
              Controlla / Check
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Fase QUIZ — gestisce tutte le domande in sequenza ────────────────────────
function QuizFase({ lesson, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [scoreCorrect, setScoreCorrect] = useState(0);
  const [animFeedback, setAnimFeedback] = useState(null);

  const q = lesson.questions[current];
  const progress = Math.round(((current + 1) / lesson.questions.length) * 100);

  function handleAnswer(isCorrect) {
    if (isCorrect) setScoreCorrect((s) => s + 1);
    setAnimFeedback(isCorrect ? "ok" : "err");
    setTimeout(() => setAnimFeedback(null), 600);

    if (current + 1 >= lesson.questions.length) {
      const finalScore = isCorrect ? scoreCorrect + 1 : scoreCorrect;
      onComplete(finalScore);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", flexDirection: "column" }}>
      {/* TopBar */}
      <div style={{ background: "var(--card)", borderBottom: "2px solid var(--border)", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            {lesson.title} — {current + 1}/{lesson.questions.length}
          </div>
          <div style={{ height: "8px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--primary)", borderRadius: "99px", transition: "width 0.4s ease" }} />
          </div>
        </div>
        <span style={{ fontSize: "13px", fontWeight: 900, color: "var(--primary)" }}>
          {scoreCorrect} ✅
        </span>
      </div>

      {/* Domanda — per ora solo multipla, altri tipi in Sprint 5 */}
      {q.tipo === "multipla" || q.tipo === "gesti" ? (
        <DomandaMultipla key={current} q={q} onAnswer={handleAnswer} animFeedback={animFeedback} />
      ) : (
        <DomandaMultipla key={current} q={q} onAnswer={handleAnswer} animFeedback={animFeedback} />
      )}
    </main>
  );
}

// ─── MOTORE PRINCIPALE ────────────────────────────────────────────────────────
export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = parseInt(params.id);

  const [lesson, setLesson]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [fase, setFase]       = useState("intro"); // "intro" | "quiz" | "done"
  const [reward, setReward]   = useState(null);

  // ── Carica il JSON al mount ──────────────────────────────────────────────────
  useEffect(() => {
    loadLesson(lessonId)
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [lessonId]);

  // ── Schermata caricamento ────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>☕</div>
          <p style={{ fontSize: "14px", color: "var(--text3)" }}>Caricamento... / Loading...</p>
        </div>
      </main>
    );
  }

  // ── Errore lezione non trovata ───────────────────────────────────────────────
  if (error || !lesson) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-lesson)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>😅</div>
          <p style={{ fontSize: "15px", fontWeight: 800, color: "var(--err-text)", marginBottom: "16px" }}>
            Lezione non trovata / Lesson not found
          </p>
          <button onClick={() => router.push("/")} style={{ background: "var(--primary)", color: "white", padding: "12px 24px", borderRadius: "var(--r)", border: "none", fontWeight: 900, cursor: "pointer" }}>
            ← Home
          </button>
        </div>
      </main>
    );
  }

  // ── Completamento ────────────────────────────────────────────────────────────
  if (fase === "done" && reward) {
    return <LessonComplete reward={reward} onHome={() => router.push("/")} />;
  }

  // ── Intro vocabolario ────────────────────────────────────────────────────────
  if (fase === "intro") {
    return (
      <VocabIntro
        lesson={lesson}
        onComplete={() => setFase("quiz")}
      />
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  return (
    <QuizFase
      lesson={lesson}
      onComplete={(corrette) => {
        const r = salvaProgressi({
          tipo: "lezione",
          lessonId: lesson.id,
          corrette,
          totDomande: lesson.questions.length,
        });
        setReward(r);
        setFase("done");
      }}
    />
  );
}
