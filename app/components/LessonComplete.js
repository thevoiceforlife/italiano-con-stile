"use client";
// app/components/LessonComplete.js
// ─── Popup completamento — usato da lezioni 0-3 e Sfida la Nonna ─────────────

import { useEffect, useState } from "react";
import CharacterBubble from "./CharacterBubble";

// ─── Suono vittoria ────────────────────────────────────────────────────────────
function playVittoriaSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.start(t); o.stop(t + 0.4);
    });
  } catch (e) {}
}

function playBossSound() {
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

// ─── Riga reward singola ───────────────────────────────────────────────────────
function RewardRow({ icon, label, value, highlight }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text2)" }}>{label}</span>
      </div>
      <span style={{
        fontSize: "14px", fontWeight: 900,
        color: highlight ?? "#58CC02",
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── FoodRow con tooltip hover ───────────────────────────────────────────────
function FoodRow({ icon, label, earned, value, tooltip, highlight }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: "relative", opacity: earned ? 1 : 0.3, transition: "opacity 0.3s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <RewardRow icon={icon} label={label} value={value} highlight={earned ? highlight : "var(--text3)"} />
      {hovered && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 4px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#FFFFFF",
          border: `1.5px solid ${highlight}`,
          borderRadius: "8px",
          padding: "6px 10px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#222222",
          whiteSpace: "nowrap",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          pointerEvents: "none",
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────
/**
 * @param {object}   reward     — oggetto restituito da salvaProgressi()
 * @param {function} onHome     — callback per tornare alla home
 * @param {function} onRiprova  — callback per riprovare (solo boss)
 */
export default function LessonComplete({ reward, onHome, onRiprova }) {
  const [barWidth, setBarWidth] = useState(0);
  const isLezione = reward.tipo === "lezione";
  const isBoss    = reward.tipo === "boss";

  useEffect(() => {
    if (isBoss) playBossSound(); else playVittoriaSound();
    // Anima la barra energia dopo un piccolo delay
    const t = setTimeout(() => setBarWidth(Math.round((reward.energia / (isBoss ? 15 : 25)) * 100)), 300);
    return () => clearTimeout(t);
  }, []);

  // ── Lezione normale ──────────────────────────────────────────────────────────
  if (isLezione) {
    return (
      <main style={{
        minHeight: "100vh", background: "var(--bg-lesson)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "24px",
      }}>
        {/* Emoji celebrazione */}
        <div style={{ fontSize: "64px", marginBottom: "8px" }}>
          {reward.perfetto ? "🏆" : "✅"}
        </div>

        {/* Titolo */}
        <h1 style={{
          fontSize: "24px", fontWeight: 900, color: "#58CC02",
          marginBottom: "4px", textAlign: "center",
        }}>
          {reward.perfetto ? "Perfetto! / Perfect!" : "Completato! / Completed!"}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "24px", textAlign: "center" }}>
          Lezione {reward.lessonId} superata / Lesson {reward.lessonId} cleared
        </p>

        {/* Reward card — due sezioni */}
        <div style={{
          background: "var(--card)", border: "2px solid var(--border)",
          borderRadius: "var(--r)", padding: "14px 20px",
          maxWidth: "320px", width: "100%", marginBottom: "20px",
        }}>
          {/* Sezione 1: Energia — tutti gli alimenti sempre visibili */}
          <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: "6px" }}>
            Energia guadagnata / Energy earned
          </div>

          {/* ── Caffè ── */}
          <FoodRow
            icon="☕"
            label={reward.haCaffeBonus ? "Caffè bonus" : "Caffè"}
            earned={reward.haCaffe}
            value={reward.haCaffeBonus ? "+5%" : "+10%"}
            tooltip={reward.haCaffeBonus
              ? "Lezione perfetta — 8/8! / Perfect lesson!"
              : "1 o più risposte corrette / 1 or more correct answers"}
            highlight="#FF9B42"
          />

          {/* ── Cornetto ── */}
          <FoodRow
            icon="🥐"
            label="Cornetto"
            earned={reward.haCornetto}
            value="+20%"
            tooltip="3 o più risposte corrette / 3 or more correct answers"
            highlight="#58CC02"
          />

          {/* ── Pizza ── */}
          <FoodRow
            icon="🍕"
            label={reward.spicchi > 0 ? `Pizza — ${reward.spicchi} spicchio` : "Pizza"}
            earned={reward.spicchi > 0}
            value={reward.spicchi > 0 ? `+${reward.pizzaEnergia}%` : "+8% per spicchio"}
            tooltip="1 spicchio ogni 6 risposte corrette / 1 slice every 6 correct answers"
            highlight="#FF9600"
          />

          {/* ── Barra energia ── */}
          <div style={{ height: "7px", background: "var(--border)", borderRadius: "99px", overflow: "hidden", margin: "8px 0 10px" }}>
            <div style={{ width: `${barWidth}%`, height: "100%", background: "#58CC02", borderRadius: "99px", transition: "width 0.8s ease" }} />
          </div>

          {/* ── Aperitivo ── */}
          <FoodRow
            icon="🍸"
            label="Aperitivo"
            earned={false}
            value="+30%"
            tooltip="Completa un mini-game personaggio / Complete a character mini-game"
            highlight="#C8A0E8"
          />

          {/* ── Gelato ── */}
          <FoodRow
            icon="🍦"
            label="Gelato"
            earned={false}
            value="+2→15%"
            tooltip="Supera la Sfida la Nonna / Beat the Sfida la Nonna challenge"
            highlight="#E5B700"
          />

          {/* ── Divisore ── */}
          <div style={{ height: "1px", background: "var(--border)", margin: "10px 0" }} />

          {/* ── Crediti biglietti ── */}
          <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: "6px" }}>
            Crediti biglietti / Travel credits
          </div>
          <RewardRow icon="🎫" label="Completamento" value={`+${reward.perfetto ? reward.crediti - 5 : reward.crediti} cr`} highlight="#E5B700" />
          {reward.perfetto && (
            <RewardRow icon="⭐" label="Bonus lezione perfetta!" value="+5 cr" highlight="#E5B700" />
          )}
        </div>

        {/* Mario */}
        <div style={{ maxWidth: "320px", width: "100%", marginBottom: "28px" }}>
          <CharacterBubble
            character="mario"
            text={reward.perfetto
              ? "Bravissimo! Zero errori — sei già più italiano di molti turisti! / Excellent! Zero errors — you're already more Italian than most tourists!"
              : "Ben fatto! Continua così — la prossima lezione ti aspetta. / Well done! Keep it up — the next lesson awaits."}
            speakText={reward.perfetto
              ? "Bravissimo! Zero errori. Sei già più italiano di molti turisti!"
              : "Ben fatto! Continua così. La prossima lezione ti aspetta."}
            autoSpeak={true}
          />
        </div>

        <button onClick={onHome} style={{
          background: "var(--primary)", color: "white",
          padding: "16px 32px", borderRadius: "var(--r)",
          fontSize: "15px", fontWeight: 900,
          boxShadow: "0 4px 0 var(--primary-d)", border: "none",
          textTransform: "uppercase", letterSpacing: "0.6px",
          width: "100%", maxWidth: "320px", cursor: "pointer",
        }}>
          ← Torna alla Home / Back Home
        </button>
      </main>
    );
  }

  // ── Sfida la Nonna ───────────────────────────────────────────────────────────
  const nonna = reward.nonna;
  return (
    <main style={{
      minHeight: "100vh", background: "var(--bg-lesson)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{ fontSize: "72px", marginBottom: "8px" }}>🍦</div>
      <div style={{
        fontSize: "13px", fontWeight: 900, color: "#E5B700",
        letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px",
      }}>
        Sfida la Nonna — completata
      </div>

      {/* Score */}
      <div style={{
        background: "var(--card)", border: "3px solid #E5B700",
        borderRadius: "var(--r)", padding: "14px 28px",
        textAlign: "center", marginBottom: "16px",
        boxShadow: "0 0 24px #E5B70033",
      }}>
        <div style={{ fontSize: "38px", fontWeight: 900, color: "#E5B700" }}>
          {reward.corrette ?? 0}/5
        </div>
        <div style={{ fontSize: "12px", color: "var(--text3)", fontWeight: 700, marginTop: "2px" }}>
          risposte corrette / correct answers
        </div>
      </div>

      {/* Messaggio Vittoria */}
      <div style={{
        background: "var(--card)", border: "2px solid #E5B70066",
        borderRadius: "var(--r)", padding: "16px 20px",
        maxWidth: "320px", width: "100%", marginBottom: "16px",
      }}>
        <div style={{ marginBottom: "10px" }}>
          <CharacterBubble
            character="vittoria"
            text={`"${nonna.msg}" / "${nonna.msgEN}"`}
            speakText={nonna.speak}
            autoSpeak={true}
          />
        </div>
        <p style={{
          fontSize: "11px", color: "var(--text3)", fontStyle: "italic",
          lineHeight: 1.5, margin: 0,
        }}>
          {nonna.sub}
        </p>
      </div>

      {/* Reward card */}
      <div style={{
        background: "var(--card)", border: "2px solid var(--border)",
        borderRadius: "var(--r)", padding: "14px 20px",
        maxWidth: "320px", width: "100%", marginBottom: "20px",
      }}>
        <RewardRow icon="🍦" label="Gelato" value="sempre!" highlight="#E5B700" />
        <RewardRow icon="⚡" label="Energia / Energy" value={`+${nonna.energy}%`} highlight={
          nonna.energy >= 12 ? "#58CC02" : nonna.energy >= 6 ? "#FF9600" : "#FF4B4B"
        } />
        <RewardRow icon="🎫" label="Crediti sfida / Challenge credits" value="+50 cr" highlight="#E5B700" />

        {/* Barra energia */}
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px" }}>
            Max +15% con 5/5 / Max +15% with 5/5
          </div>
          <div style={{ height: "8px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{
              width: `${barWidth}%`, height: "100%",
              background: "#E5B700", borderRadius: "99px",
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      </div>

      <button onClick={onHome} style={{
        background: "var(--primary)", color: "white",
        padding: "16px 32px", borderRadius: "var(--r)",
        fontSize: "15px", fontWeight: 900,
        boxShadow: "0 4px 0 var(--primary-d)", border: "none",
        textTransform: "uppercase", letterSpacing: "0.6px",
        width: "100%", maxWidth: "320px", cursor: "pointer",
        marginBottom: "12px",
      }}>
        ← Torna alla Home / Back Home
      </button>
    </main>
  );
}
