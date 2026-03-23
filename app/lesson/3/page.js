"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CharacterBubble, {
  parla,
  CHARACTERS,
} from "../../components/CharacterBubble";

const VOCAB = [
  {
    id: "peperone",
    emoji: "🫑",
    it: "il peperone",
    en: "bell pepper",
    mario:
      "Attenzione! Peperone non è pepperoni della pizza. È il peperone verde, rosso, giallo! / Watch out! Peperone is not pizza pepperoni. It's the green, red, yellow bell pepper!",
    marioIT:
      "Attenzione! Peperone non è pepperoni della pizza. È il peperone verde, rosso, giallo!",
  },
  {
    id: "primo",
    emoji: "🍝",
    it: "il primo",
    en: "first course (pasta/risotto)",
    mario:
      "In Italia si mangia in ordine: antipasto, primo, secondo, dolce. Non si salta! / In Italy you eat in order: starter, first course, main, dessert. No skipping!",
    marioIT:
      "In Italia si mangia in ordine: antipasto, primo, secondo, dolce. Non si salta!",
  },
  {
    id: "conto",
    emoji: "🧾",
    it: "il conto",
    en: "the bill",
    mario:
      "Per chiedere il conto si dice: 'Ci porta il conto, per favore?' — mai schioccare le dita! / To ask for the bill say: 'Ci porta il conto, per favore?' — never snap your fingers!",
    marioIT:
      "Per chiedere il conto si dice: Ci porta il conto, per favore? Mai schioccare le dita!",
  },
];

const QUESTIONS = [
  {
    id: 1,
    character: "mario",
    intro: "Senti qua... / Listen up...",
    introIT: "Senti qua...",
    question: "Qual è l'ordine corretto dei piatti in Italia?",
    questionEN: "What is the correct order of courses in Italy?",
    options: [
      "Primo, secondo, antipasto, dolce",
      "Antipasto, primo, secondo, dolce",
      "Secondo, primo, dolce",
      "Non c'è un ordine fisso",
    ],
    correct: 1,
    feedback: {
      ok: "Esatto! L'ordine è sacro in Italia — antipasto, primo, secondo, dolce. Non si negozia. / Exactly! The order is sacred in Italy — starter, first, main, dessert. Non-negotiable.",
      err: "Attenzione! In Italia l'ordine dei piatti è una tradizione seria. Antipasto prima di tutto! / Watch out! In Italy the order of courses is a serious tradition. Antipasto first!",
    },
  },
  {
    id: 2,
    character: "gino",
    intro:
      "Vedi, c'è una storia bellissima... / You see, there's a wonderful story...",
    introIT: "Vedi, c'è una storia bellissima dietro questa parola...",
    question: "In italiano, 'peperoni' sulla pizza significa...?",
    questionEN: "In Italian, 'peperoni' on a pizza means...?",
    options: [
      "Salame piccante (come in America)",
      "Peperoni colorati — non il salame!",
      "Una pizza speciale napoletana",
      "Qualsiasi tipo di carne",
    ],
    correct: 1,
    feedback: {
      ok: "Bravo! 'Peperoni' in italiano sono i peperoni colorati. Il salame piccante americano si chiama 'salame piccante' — parola inglese! / Well done! 'Peperoni' in Italian are bell peppers. The American spicy salami is an English word!",
      err: "Falso amico! Se ordini 'pizza ai peperoni' in Italia, arriva con i peperoni colorati — non il salame. / False friend! If you order 'pizza ai peperoni' in Italy, you get bell peppers — not salami.",
    },
  },
  {
    id: 3,
    character: "mario",
    intro: "E per finire... / And finally...",
    introIT: "E per finire, una cosa importante al ristorante...",
    question: "Come si chiede il conto al ristorante in Italia?",
    questionEN: "How do you ask for the bill at a restaurant in Italy?",
    options: [
      "Schioccare le dita al cameriere",
      "Ci porta il conto, per favore?",
      "Check please!",
      "Alzarsi e andare alla cassa",
    ],
    correct: 1,
    feedback: {
      ok: "Perfetto! 'Ci porta il conto, per favore?' — educato, diretto, italiano al 100%. / Perfect! 'Ci porta il conto, per favore?' — polite, direct, 100% Italian.",
      err: "Meglio tardi che mai! Schioccare le dita è molto maleducato in Italia. Sempre 'per favore'! / Better late than never! Snapping your fingers is very rude in Italy. Always 'per favore'!",
    },
  },
  {
    id: 4,
    character: "mario",
    intro: "Sembra X ma è Y... / Looks like X but it's Y...",
    introIT: "Sembra X ma è Y — te lo dico io.",
    question: "Cosa è il 'coperto' al ristorante?",
    questionEN: "What is the 'coperto' at a restaurant?",
    options: [
      "Il coperchio della pentola",
      "Una tassa sul tavolo per pane e servizio",
      "Il menu del giorno",
      "Il dolce incluso nel pasto",
    ],
    correct: 1,
    feedback: {
      ok: "Esatto! Il coperto è una piccola tassa per posto a tavola — include il pane e il servizio. Normale in Italia, non è una truffa! / Exactly! The coperto is a small cover charge — it includes bread and service. Normal in Italy, not a scam!",
      err: "Attenzione! Il coperto non è il coperchio — è una piccola tassa per posto a tavola. Tra 1 e 3 euro a persona, normalissimo. / Watch out! Coperto isn't a lid — it's a small cover charge per person. Between 1 and 3 euros, perfectly normal.",
    },
  },
  {
    id: 5,
    character: "mario",
    intro: "Ultima cosa... / One last thing...",
    introIT: "Ultima cosa, e poi sei pronto per qualsiasi ristorante italiano!",
    question: "Dopo il pranzo, un italiano ordina spesso...?",
    questionEN: "After lunch, an Italian often orders...?",
    options: ["Un cappuccino", "Un caffè", "Una birra", "Un succo di frutta"],
    correct: 1,
    feedback: {
      ok: "Perfetto! Dopo i pasti si ordina sempre un caffè — mai un cappuccino. Il cappuccino è solo per la mattina! / Perfect! After meals you always order an espresso — never a cappuccino. Cappuccino is only for the morning!",
      err: "Ricorda: il cappuccino è solo per la mattina! Dopo pranzo o cena, gli italiani ordinano sempre un caffè. / Remember: cappuccino is only for the morning! After lunch or dinner, Italians always order an espresso.",
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

export default function Lesson3() {
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
      setLives((l) => l - 0.5);
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
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🍕</div>
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
          Ora sai mangiare come un italiano. / Now you know how to eat like an
          Italian.
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
            text="Bravissimo! Ora al ristorante italiano non farai più brutte figure. / Excellent! Now you won't embarrass yourself at an Italian restaurant."
            speakText="Bravissimo! Ora al ristorante italiano non farai più brutte figure."
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
            text="Oggi parliamo di cibo — la cosa più seria in Italia! Tocca ogni parola! / Today we talk about food — the most serious thing in Italy! Tap each word!"
            speakText="Oggi parliamo di cibo — la cosa più seria in Italia! Tocca ogni parola per impararla."
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
