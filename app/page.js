"use client";
import { useState } from "react";
import LessonButton from "./components/LessonButton";
import XPBar from "./components/XPBar";
import Logo from "./components/Logo";
import { parla, CHARACTERS as CHAR_VOICES } from "./components/CharacterBubble";

const CHARACTERS = [
  {
    id: "mario",
    name: "Mario",
    emoji: "☕",
    color: "#FF9B42",
    bubble: {
      it: "Sono Mario, il tuo barista. Ti accompagno in ogni lezione — dal primo caffè alla vita quotidiana italiana.",
      en: "I'm Mario, your barman. I'll guide you through every lesson — from your first espresso to everyday Italian life.",
    },
    speakIT:
      "Sono Mario, il tuo barista. Ti accompagno in ogni lezione, dal primo caffè alla vita quotidiana italiana.",
  },
  {
    id: "sofia",
    name: "Sofia",
    emoji: "🎧",
    color: "#C8A0E8",
    bubble: {
      it: "Sono Sofia. Ti insegno lo slang, i social e come parlano davvero i giovani italiani. Veloce.",
      en: "I'm Sofia. I'll teach you slang, social media Italian, and how young Italians actually speak. Fast.",
    },
    speakIT:
      "Sono Sofia. Ti insegno lo slang, i social e come parlano davvero i giovani italiani. Veloce.",
  },
  {
    id: "diego",
    name: "Diego",
    emoji: "🧢",
    color: "#22C55E",
    bubble: {
      it: "Io sono Diego! Ogni volta che fai bene, arrivo io! SIIII! Sei fortissimo!",
      en: "I'm Diego! Every time you do well, I show up! YESSS! You're the best!",
    },
    speakIT:
      "Io sono Diego! Ogni volta che fai bene, arrivo io! Siiiii! Sei fortissimo!",
  },
  {
    id: "gino",
    name: "Gino",
    emoji: "🎓",
    color: "#E5B700",
    bubble: {
      it: "Sono Gino, professore di lettere in pensione. Ti racconto la storia della lingua italiana — perché capire il perché è più potente che memorizzare la regola.",
      en: "I'm Gino, a retired literature teacher. I'll tell you the story of the Italian language — because understanding why is more powerful than memorising the rule.",
    },
    speakIT:
      "Sono Gino, professore di lettere in pensione. Ti racconto la storia della lingua italiana. Perché capire il perché è più potente che memorizzare la regola.",
  },
  {
    id: "matilde",
    name: "Matilde",
    emoji: "💼",
    color: "#1CB0F6",
    bubble: {
      it: "Sono Matilde. Business Italian, email formali, riunioni. Niente slang. Niente scuse. Procediamo.",
      en: "I'm Matilde. Business Italian, formal emails, meetings. No slang. No excuses. Let's proceed.",
    },
    speakIT:
      "Sono Matilde. Business Italian, email formali, riunioni. Niente slang. Niente scuse. Procediamo.",
  },
];

const LESSONS = [
  {
    id: 1,
    title: "Il Primo Caffè",
    subtitle: "Ordina senza sembrare turista",
    unlocked: true,
  },
  {
    id: 2,
    title: "Mario dà le Indicazioni",
    subtitle: "Preposizioni di luogo in contesto",
    unlocked: true,
  },
  {
    id: 3,
    title: "La Cultura del Cibo",
    subtitle: "L'ordine dei piatti — sacro e intoccabile",
    unlocked: true,
  },
];

function playCharacterSound(id) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    if (id === "mario") {
      [523, 659, 784].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.13);
        g.gain.linearRampToValueAtTime(0.28, ctx.currentTime + i * 0.13 + 0.05);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.13 + 0.35,
        );
        o.start(ctx.currentTime + i * 0.13);
        o.stop(ctx.currentTime + i * 0.13 + 0.35);
      });
    }

    if (id === "sofia") {
      [1200, 1600].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "square";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.08 + 0.12,
        );
        o.start(ctx.currentTime + i * 0.08);
        o.stop(ctx.currentTime + i * 0.08 + 0.12);
      });
    }

    if (id === "diego") {
      [330, 392, 494, 587, 784].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "triangle";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.07);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.07 + 0.14,
        );
        o.start(ctx.currentTime + i * 0.07);
        o.stop(ctx.currentTime + i * 0.07 + 0.14);
      });
    }

    if (id === "gino") {
      [130, 164, 196].forEach((freq) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15);
        g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 1.0);
      });
    }

    if (id === "matilde") {
      [880, 1100].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sawtooth";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.15);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.15 + 0.08,
        );
        o.start(ctx.currentTime + i * 0.15);
        o.stop(ctx.currentTime + i * 0.15 + 0.08);
      });
    }
  } catch (e) {}
}

function CharacterModal({ c, onClose }) {
  const voice = CHAR_VOICES[c.id];

  function handleSpeak() {
    parla(c.speakIT, voice, undefined, undefined);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "fade-in 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: "20px",
          border: `3px solid ${c.color}`,
          boxShadow: `0 0 40px ${c.color}55`,
          padding: "32px 24px",
          maxWidth: "340px",
          width: "100%",
          textAlign: "center",
          animation: "card-flip 0.25s ease",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "110px",
            height: "110px",
            margin: "0 auto 16px",
          }}
        >
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              border: `4px solid ${c.color}`,
              overflow: "hidden",
              background: "var(--bg)",
              boxShadow: `0 0 28px ${c.color}99`,
            }}
          >
            <img
              src={`/images/${c.id}.png`}
              alt={c.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <span
            style={{
              position: "absolute",
              bottom: "0px",
              right: "0px",
              fontSize: "28px",
              lineHeight: 1,
            }}
          >
            {c.emoji}
          </span>
        </div>

        <div
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: c.color,
            marginBottom: "16px",
          }}
        >
          {c.name}
        </div>

        <p
          style={{
            fontSize: "13px",
            fontWeight: 800,
            color: "var(--text)",
            lineHeight: 1.6,
            fontStyle: "italic",
            marginBottom: "10px",
          }}
        >
          "{c.bubble.it}"
        </p>

        <div
          style={{
            height: "1px",
            background: "var(--border)",
            margin: "10px 0",
          }}
        />

        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--text2)",
            lineHeight: 1.6,
            fontStyle: "italic",
            marginBottom: "20px",
          }}
        >
          "{c.bubble.en}"
        </p>

        <button
          onClick={handleSpeak}
          style={{
            background: c.color,
            color: "white",
            border: "none",
            borderRadius: "var(--r)",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: `0 4px 0 ${c.color}99`,
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginBottom: "12px",
            width: "100%",
          }}
        >
          🔊 Ascolta / Listen
        </button>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "2px solid var(--border)",
            borderRadius: "var(--r)",
            padding: "10px 28px",
            fontSize: "13px",
            fontWeight: 800,
            color: "var(--text2)",
            cursor: "pointer",
            width: "100%",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          Chiudi / Close
        </button>
      </div>
    </div>
  );
}

function CharacterCard({ c, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        textAlign: "center",
        flex: 1,
        position: "relative",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div
        style={{
          position: "relative",
          width: "56px",
          height: "56px",
          margin: "0 auto 4px",
          transition: "transform 0.2s",
          transform: hovered ? "scale(1.18)" : "scale(1)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: `3px solid ${c.color}`,
            overflow: "hidden",
            background: "var(--card)",
            boxShadow: hovered
              ? `0 0 18px ${c.color}CC, 0 0 36px ${c.color}66`
              : "0 0 0px transparent",
            transition: "box-shadow 0.25s ease",
          }}
        >
          <img
            src={`/images/${c.id}.png`}
            alt={c.name}
            width={56}
            height={56}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </div>
        <span
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-4px",
            fontSize: "14px",
            lineHeight: 1,
          }}
        >
          {c.emoji}
        </span>
      </div>

      <span
        style={{
          fontSize: "11px",
          fontWeight: 800,
          color: hovered ? c.color : "var(--text2)",
          transition: "color 0.2s",
        }}
      >
        {c.name}
      </span>
    </div>
  );
}

export default function Home() {
  const [modalChar, setModalChar] = useState(null);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "24px 16px",
      }}
    >
      <header style={{ marginBottom: "32px" }}>
        <Logo />
      </header>

      <XPBar />

      {modalChar && (
        <CharacterModal
          c={modalChar}
          onClose={() => {
            window.speechSynthesis?.cancel();
            setModalChar(null);
          }}
        />
      )}

      <section style={{ marginBottom: "28px" }}>
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 900,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "12px",
          }}
        >
          I tuoi compagni
        </h2>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          {CHARACTERS.map((c) => (
            <CharacterCard
              key={c.id}
              c={c}
              onClick={() => {
                playCharacterSound(c.id);
                setModalChar(c);
              }}
            />
          ))}
        </div>
      </section>

      <section>
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 900,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "12px",
          }}
        >
          Unità 1 — Benvenuto al Bar di Mario
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {LESSONS.map((lesson) => (
            <div
              key={lesson.id}
              style={{
                background: "var(--card)",
                borderRadius: "var(--r)",
                border: `2px solid ${lesson.unlocked ? "#58CC02" : "var(--border)"}`,
                padding: "16px",
                opacity: lesson.unlocked ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: lesson.unlocked ? "#58CC02" : "var(--dis-bg)",
                  boxShadow: lesson.unlocked
                    ? "0 4px 0 #46A302"
                    : "0 4px 0 #AFAFAF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "white",
                  fontWeight: 900,
                }}
              >
                {lesson.unlocked ? "⭐" : "🔒"}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: "15px",
                    color: lesson.unlocked ? "var(--text)" : "var(--text3)",
                    marginBottom: "2px",
                  }}
                >
                  {lesson.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text3)",
                    fontWeight: 700,
                  }}
                >
                  {lesson.subtitle}
                </div>
              </div>
              {lesson.unlocked && <LessonButton lessonId={lesson.id} />}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
