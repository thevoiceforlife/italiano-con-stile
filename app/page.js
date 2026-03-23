"use client";
import { useState } from "react";
import LessonButton from "./components/LessonButton";
import XPBar from "./components/XPBar";
import Logo from "./components/Logo";

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
    unlocked: false,
  },
  {
    id: 3,
    title: "La Cultura del Cibo",
    subtitle: "L'ordine dei piatti — sacro e intoccabile",
    unlocked: false,
  },
];

function CharacterCard({ c }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ textAlign: "center", flex: 1, position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* FUMETTO — appare sull'hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "72px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "180px",
            background: "var(--card)",
            border: `2px solid ${c.color}`,
            borderRadius: "12px",
            padding: "10px 12px",
            zIndex: 10,
            boxShadow: `0 0 12px ${c.color}55`,
            animation: "fade-in 0.2s ease",
            pointerEvents: "none",
          }}
        >
          {/* Testo IT */}
          <p
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--text)",
              marginBottom: "6px",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            "{c.bubble.it}"
          </p>
          {/* Divisore */}
          <div
            style={{
              height: "1px",
              background: "var(--border)",
              marginBottom: "6px",
            }}
          />
          {/* Testo EN */}
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text2)",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            "{c.bubble.en}"
          </p>
          {/* Freccia in basso */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: `8px solid ${c.color}`,
            }}
          />
        </div>
      )}

      {/* AVATAR */}
      <div
        style={{
          position: "relative",
          width: "56px",
          height: "56px",
          margin: "0 auto 4px",
          transition: "transform 0.2s",
          transform: hovered ? "scale(1.15)" : "scale(1)",
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
            boxShadow: hovered ? `0 0 12px ${c.color}88` : "none",
            transition: "box-shadow 0.2s",
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
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "24px 16px",
      }}
    >
      {/* HEADER */}
      <header style={{ marginBottom: "32px" }}>
        <Logo />
      </header>

      {/* XP BAR */}
      <XPBar />

      {/* I TUOI COMPAGNI */}
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
            paddingBottom: "40px", // spazio per i fumetti
          }}
        >
          {CHARACTERS.map((c) => (
            <CharacterCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      {/* LEZIONI */}
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
