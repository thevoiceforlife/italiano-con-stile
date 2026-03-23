"use client";
import { useState, useEffect } from "react";

const MAX_XP = 100;

function readProgress() {
  try {
    const saved = localStorage.getItem("ics_progress");
    if (saved) {
      const data = JSON.parse(saved);
      return {
        xp: data.xp ?? 0,
        lives: data.lives ?? 5,
        streak: data.streak ?? 0,
      };
    }
  } catch (e) {}
  return { xp: 0, lives: 5, streak: 0 };
}

export default function XPBar() {
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(5);
  const [streak, setStreak] = useState(0);

  function refresh() {
    const d = readProgress();
    setXp(d.xp);
    setLives(d.lives);
    setStreak(d.streak);
  }

  useEffect(() => {
    refresh();
    // aggiorna quando si torna sulla tab
    window.addEventListener("focus", refresh);
    // aggiorna quando localStorage cambia da un'altra tab
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const percent = Math.min(Math.round((xp / MAX_XP) * 100), 100);

  return (
    <section
      style={{
        background: "var(--card)",
        borderRadius: "var(--r)",
        border: "2px solid var(--border)",
        padding: "14px 16px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <span
        style={{ fontSize: "13px", fontWeight: 900, color: "var(--streak)" }}
      >
        🔥 {streak}
      </span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span
            style={{ fontSize: "13px", fontWeight: 800, color: "var(--text)" }}
          >
            ☕ {xp} caffè
          </span>
          <span style={{ fontSize: "12px", color: "var(--text3)" }}>
            {percent}%
          </span>
        </div>
        <div
          style={{
            height: "8px",
            background: "var(--border)",
            borderRadius: "99px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "var(--primary)",
              borderRadius: "99px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
      <span
        style={{
          background: "var(--err-bar)",
          color: "var(--lives)",
          borderRadius: "99px",
          padding: "4px 10px",
          fontSize: "13px",
          fontWeight: 900,
          border: "1px solid var(--err-text)",
        }}
      >
        ❤️ {lives}
      </span>
    </section>
  );
}
