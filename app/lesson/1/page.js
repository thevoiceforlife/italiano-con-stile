"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CharacterBubble, {
  CHARACTER_ANIMS,
  parla,
  CHARACTERS,
} from "../../components/CharacterBubble";

const VOCAB = [
  {
    id: "caffe",
    emoji: "☕",
    it: "il caffè",
    en: "espresso / coffee",
    mario:
      "Al bar si dice solo 'un caffè' — niente 'espresso'. / At the bar you just say 'un caffè' — not 'espresso'.",
    marioIT: "Al bar si dice solo un caffè, niente espresso.",
  },
  {
    id: "cornetto",
    emoji: "🥐",
    it: "il cornetto",
    en: "croissant / brioche",
    mario:
      "Non è un gelato! Il cornetto si mangia a colazione. / It's not ice cream! Cornetto is eaten at breakfast.",
    marioIT: "Non è un gelato! Il cornetto si mangia a colazione.",
  },
  {
    id: "te",
    emoji: "🍵",
    it: "il tè",
    en: "tea",
    mario:
      "Al bar italiano il tè non è popolare — ma esiste! / Tea isn't popular at Italian bars — but it exists!",
    marioIT: "Al bar italiano il tè non è popolare, ma esiste.",
  },
];

const QUESTIONS = [
  {
    id: 1,
    character: "mario",
    intro: "Senti qua... / Listen up...",
    introIT: "Senti qua...",
    question: "Come si ordina un caffè al bar italiano?",
    questionEN: "How do you order a coffee at an Italian bar?",
    options: [
      "Un caffè, per favore",
      "One espresso please",
      "Voglio un caffè",
      "Dammi un caffè",
    ],
    correct: 0,
    feedback: {
      ok: "Esatto! Breve e diretto. Al bancone si dice così. / Exactly! Short and direct. That's how you say it at the counter.",
      err: "Attenzione! 'Voglio' è troppo diretto. 'Per favore' fa tutta la differenza. / Watch out! 'Voglio' is too blunt. 'Per favore' makes all the difference.",
    },
  },
  {
    id: 2,
    character: "mario",
    intro: "Attenzione però... / Be careful though...",
    introIT: "Attenzione però...",
    question: "Cosa è il 'cornetto' in Italia?",
    questionEN: "What is a 'cornetto' in Italy?",
    options: [
      "Un gelato",
      "Una brioche a colazione",
      "Un cornet musicale",
      "Una pasta sfoglia salata",
    ],
    correct: 1,
    feedback: {
      ok: "Bravo! Il cornetto è la brioche della colazione italiana — non il gelato! / Well done! Cornetto is the breakfast brioche — not ice cream!",
      err: "Sembra 'cornet' ma è una brioche! In Italia il cornetto si mangia a colazione. / Looks like 'cornet' but it's a brioche! Cornetto is eaten at breakfast.",
    },
  },
  {
    id: 3,
    character: "mario",
    intro: "Sai come funziona il bar? / Do you know how a bar works?",
    introIT: "Sai come funziona il bar?",
    question: "In un bar italiano, dove si paga?",
    questionEN: "At an Italian bar, where do you pay?",
    options: [
      "Prima al bancone",
      "Dopo aver bevuto",
      "Prima alla cassa, poi al bancone",
      "Non si paga",
    ],
    correct: 2,
    feedback: {
      ok: "Perfetto! Prima paghi alla cassa, prendi lo scontrino, poi ordini al bancone. / Perfect! First pay at the till, get your receipt, then order at the counter.",
      err: "Meglio tardi che mai! Prima cassa, poi bancone — sempre. / Better late than never! Till first, then counter — always.",
    },
  },
];

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
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {}
}

const EXTRA_ANIMS = `
  @keyframes slide-up  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes card-flip { 0%{transform:scale(0.95);opacity:0.5} 100%{transform:scale(1);opacity:1} }
  @keyframes fade-in   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

export default function Lesson1() {
  const router = useRouter();

  const [fase, setFase] = useState("intro");
  const [toccate, setToccate] = useState(new Set());
  const [cardAttiva, setCardAttiva] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(5);
  const [done, setDone] = useState(false);
  const [animFeedback, setAnimFeedback] = useState(null);

  const tutteLeCarteToccate = toccate.size >= VOCAB.length;
  const q = QUESTIONS[current];
  const isCorrect = selected === q?.correct;
  const progress =
    fase === "intro" ? 0 : Math.round(((current + 1) / QUESTIONS.length) * 100);

  function handleCardTap(v) {
    setCardAttiva(v.id);
    setToccate((prev) => new Set([...prev, v.id]));
    parla(v.marioIT, CHARACTERS.mario, undefined, undefined);
  }

  function handleSelect(i) {
    if (confirmed) return;
    setSelected(i);
  }

  function handleConfirm() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    if (isCorrect) {
      setXp((x) => x + 10);
      playSound("correct");
      setAnimFeedback("ok");
    } else {
      setLives((l) => l - 1);
      playSound("wrong");
      setAnimFeedback("err");
    }
    setTimeout(() => setAnimFeedback(null), 600);
  }

  function handleNext() {
    window.speechSynthesis?.cancel();
    if (current + 1 >= QUESTIONS.length) {
      const prev = JSON.parse(localStorage.getItem("ics_progress") || "{}");
      localStorage.setItem(
        "ics_progress",
        JSON.stringify({
          xp: (prev.xp ?? 0) + xp,
          lives: lives,
          streak: prev.streak ?? 0,
        }),
      );
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
      setAnimFeedback(null);
    }
  }

  const topBar = (
    <div
      style={{
        background: "var(--card)",
        borderBottom: "2px solid var(--border)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <button
        onClick={() => router.push("/")}
        style={{
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          padding: "4px",
          textTransform: "none",
          letterSpacing: 0,
          color: "var(--text2)",
        }}
      >
        ←
      </button>
      <div
        style={{
          flex: 1,
          height: "8px",
          background: "var(--border)",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "var(--primary)",
            borderRadius: "99px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{ fontSize: "13px", fontWeight: 900, color: "var(--lives)" }}
      >
        ❤️ {lives}
      </span>
      <span style={{ fontSize: "13px", fontWeight: 900, color: "var(--xp)" }}>
        ☕ {xp}
      </span>
    </div>
  );

  if (done) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg-lesson)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 900,
            color: "var(--primary)",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Lezione completata! / Lesson complete!
        </h1>
        <p
          style={{
            color: "var(--text2)",
            marginBottom: "24px",
            fontSize: "15px",
          }}
        >
          Hai risposto a tutte le domande. / You answered all the questions.
        </p>
        <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
          <div
            style={{
              background: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "16px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "28px", fontWeight: 900, color: "var(--xp)" }}
            >
              +{xp}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text3)" }}>
              ☕ caffè / XP
            </div>
          </div>
          <div
            style={{
              background: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "16px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "var(--lives)",
              }}
            >
              ❤️ {lives}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text3)" }}>
              vite rimaste / lives left
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "32px", maxWidth: "320px" }}>
          <CharacterBubble
            character="mario"
            text="Bravo! Ora conosci le parole del bar italiano. / Well done! Now you know the Italian bar words."
            speakText="Bravo! Ora conosci le parole del bar italiano."
            autoSpeak={true}
          />
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "var(--primary)",
            color: "white",
            padding: "14px 32px",
            borderRadius: "var(--r)",
            fontSize: "15px",
            fontWeight: 900,
            boxShadow: "0 4px 0 var(--primary-d)",
            border: "none",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          ← Torna alla Home / Back Home
        </button>
      </main>
    );
  }

  if (fase === "intro") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg-lesson)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>
          {CHARACTER_ANIMS}
          {EXTRA_ANIMS}
        </style>
        {topBar}
        <div
          style={{
            flex: 1,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "480px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <CharacterBubble
            character="mario"
            text="Oggi impariamo 3 parole del bar. Tocca ogni parola! / Today we learn 3 bar words. Tap each one!"
            speakText="Oggi impariamo tre parole del bar. Tocca ogni parola per impararla."
            autoSpeak={true}
          />

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {VOCAB.map((v) => {
              const toccata = toccate.has(v.id);
              const attiva = cardAttiva === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => handleCardTap(v)}
                  style={{
                    background: toccata ? "var(--opt-sel-bg)" : "var(--card)",
                    border: `2px solid ${toccata ? "var(--opt-sel-b)" : "var(--border)"}`,
                    borderRadius: "var(--r)",
                    padding: "16px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    boxShadow: toccata
                      ? "0 4px 0 var(--opt-sel-b)"
                      : "0 4px 0 var(--border)",
                    animation: attiva ? "card-flip 0.3s ease" : "none",
                    transition: "background 0.2s, border 0.2s",
                  }}
                >
                  <div
                    style={{ fontSize: "48px", lineHeight: 1, flexShrink: 0 }}
                  >
                    {v.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: 900,
                        color: toccata ? "var(--opt-sel-text)" : "var(--text)",
                        marginBottom: "2px",
                      }}
                    >
                      {v.it}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--text3)",
                        marginBottom: toccata ? "8px" : 0,
                      }}
                    >
                      {v.en}
                    </div>
                    {toccata && (
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--opt-sel-text)",
                          lineHeight: 1.5,
                          animation: "fade-in 0.3s ease",
                        }}
                      >
                        💬 {v.mario}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: "20px", flexShrink: 0 }}>
                    {toccata ? "✅" : "👆"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--card)",
            borderTop: "2px solid var(--border)",
          }}
        >
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setFase("quiz");
              }}
              disabled={!tutteLeCarteToccate}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "var(--r)",
                fontSize: "15px",
                fontWeight: 900,
                letterSpacing: "0.6px",
                border: "none",
                textTransform: "uppercase",
                background: tutteLeCarteToccate
                  ? "var(--primary)"
                  : "var(--dis-bg)",
                color: tutteLeCarteToccate ? "white" : "var(--dis-text)",
                boxShadow: tutteLeCarteToccate
                  ? "0 4px 0 var(--primary-d)"
                  : "none",
                cursor: tutteLeCarteToccate ? "pointer" : "not-allowed",
                transition: "background 0.3s, box-shadow 0.3s",
              }}
            >
              {tutteLeCarteToccate
                ? "Inizia gli esercizi! / Start!"
                : `Tocca tutte le parole (${toccate.size}/${VOCAB.length})`}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-lesson)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>
        {CHARACTER_ANIMS}
        {EXTRA_ANIMS}
      </style>
      {topBar}

      <div
        style={{
          flex: 1,
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "480px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <CharacterBubble
          character={q.character}
          text={q.intro}
          speakText={q.introIT}
          autoSpeak={true}
          feedback={animFeedback}
        />

        <div
          style={{
            background: "var(--card)",
            borderRadius: "var(--r)",
            border: "2px solid var(--border)",
            padding: "18px",
          }}
        >
          <p
            style={{
              fontWeight: 900,
              fontSize: "16px",
              color: "var(--text)",
              marginBottom: "6px",
            }}
          >
            {q.question}
          </p>
          <p
            style={{ fontWeight: 700, fontSize: "13px", color: "var(--text3)" }}
          >
            {q.questionEN}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.options.map((opt, i) => {
            let bg = "var(--opt-bg)",
              border = "var(--opt-border)",
              color = "var(--opt-text)",
              shadow = "0 4px 0 var(--border)",
              anim = "none";
            if (confirmed) {
              shadow = "none";
              if (i === q.correct) {
                bg = "var(--ok-bar)";
                border = "var(--ok-text)";
                color = "var(--ok-text)";
                if (i === selected) anim = "pulse-ok 0.5s ease";
              } else if (i === selected && !isCorrect) {
                bg = "var(--err-bar)";
                border = "var(--err-text)";
                color = "var(--err-text)";
                anim = "shake-err 0.5s ease";
              }
            } else if (selected === i) {
              bg = "var(--opt-sel-bg)";
              border = "var(--opt-sel-b)";
              color = "var(--opt-sel-text)";
              shadow = "0 4px 0 var(--opt-sel-b)";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  background: bg,
                  border: `2px solid ${border}`,
                  color,
                  borderRadius: "var(--r)",
                  padding: "14px 16px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: 800,
                  textTransform: "none",
                  letterSpacing: 0,
                  cursor: confirmed ? "default" : "pointer",
                  transition: "background 0.15s, border 0.15s, color 0.15s",
                  animation: anim,
                  boxShadow: shadow,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {confirmed ? (
        <div
          style={{
            background: isCorrect ? "var(--ok-bar)" : "var(--err-bar)",
            borderTop: `2px solid ${isCorrect ? "var(--ok-text)" : "var(--err-text)"}`,
            padding: "20px 16px",
            animation: "slide-up 0.25s ease",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 900,
                  color: isCorrect ? "var(--ok-text)" : "var(--err-text)",
                  marginBottom: "4px",
                }}
              >
                {isCorrect
                  ? "✅ Esatto! / Correct!"
                  : "❌ Risposta sbagliata / Wrong answer"}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: isCorrect ? "var(--ok-text)" : "var(--err-text)",
                  opacity: 0.85,
                  lineHeight: 1.5,
                }}
              >
                {isCorrect ? q.feedback.ok : q.feedback.err}
              </div>
            </div>
            <button
              onClick={handleNext}
              style={{
                background: isCorrect ? "var(--primary)" : "var(--err-btn)",
                color: "white",
                padding: "14px 24px",
                borderRadius: "var(--r)",
                fontSize: "14px",
                fontWeight: 900,
                border: "none",
                boxShadow: `0 4px 0 ${isCorrect ? "var(--primary-d)" : "var(--err-btn-d)"}`,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              {current + 1 >= QUESTIONS.length ? "Finisci!" : "Continua"}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "16px",
            background: "var(--card)",
            borderTop: "2px solid var(--border)",
          }}
        >
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <button
              onClick={handleConfirm}
              disabled={selected === null}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "var(--r)",
                fontSize: "15px",
                fontWeight: 900,
                letterSpacing: "0.6px",
                border: "none",
                textTransform: "uppercase",
                background:
                  selected === null ? "var(--dis-bg)" : "var(--primary)",
                color: selected === null ? "var(--dis-text)" : "white",
                boxShadow:
                  selected === null ? "none" : "0 4px 0 var(--primary-d)",
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
