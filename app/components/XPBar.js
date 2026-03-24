"use client";
import { useState, useEffect } from "react";

// ─── Legge progressi da localStorage ─────────────────────────────────────────
function readProgress() {
  try {
    const saved = localStorage.getItem("ics_progress");
    if (saved) {
      const data = JSON.parse(saved);
      return {
        energy:      data.energy      ?? 100,
        pizzaSlices: data.pizzaSlices ?? 0,
        credits:     data.credits     ?? 0,
        streak:      data.streak      ?? 0,
      };
    }
  } catch (e) {}
  return { energy: 100, pizzaSlices: 0, credits: 0, streak: 0 };
}

function energyColor(pct) {
  if (pct > 60) return "#58CC02";
  if (pct >= 30) return "#FF9600";
  return "#FF4B4B";
}
function energyShadow(pct) {
  if (pct > 60) return "0 0 10px #58CC0244";
  if (pct >= 30) return "0 0 10px #FF960044";
  return "0 0 10px #FF4B4B44";
}

// ─── Alimenti con recupero energia ───────────────────────────────────────────
const FOODS = [
  { icon: "☕", it: "Caffè",    en: "6 correct",  pct: "+10%",  color: "#FF9B42" },
  { icon: "🥐", it: "Cornetto", en: "Lesson done", pct: "+20%", color: "#E5C95A" },
  { icon: "🍸", it: "Aperitivo",en: "Mini-game",  pct: "+30%",  color: "#C8A0E8" },
  { icon: "🍦", it: "Gelato",   en: "Nonna only", pct: "+100%", color: "#E5B700", rare: true },
];

// ─── Sagoma SVG Italia — tracciato semplificato ma geograficamente coerente ──
// viewBox 0 0 160 240
// Stivale orientato correttamente:
//   - confine N in alto (y≈18), bordo adriatico a destra, tirrenico a sinistra
//   - sperone (tacco, Puglia) sporge a destra ~2/3 dell'altezza
//   - punta (Calabria/Reggio) piega a sinistra in basso
//   - Sicilia in basso-sinistra, Sardegna a sinistra centro
function ItalySilhouette({ color = "#E5B700", opacity = 0.9 }) {
  return (
    <svg viewBox="0 0 160 245" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* ── Penisola principale ── */}
      <path
        fill={color}
        fillOpacity={opacity}
        d="
          M 38,20
          C 55,13 78,11 100,14
          C 118,16 133,24 140,36
          C 145,48 143,63 141,78
          C 139,92 137,107 136,121
          C 149,135 155,150 152,163
          C 150,172 143,177 134,172
          C 128,168 124,178 120,190
          C 114,204 106,216 96,222
          C 86,227 74,226 65,218
          C 55,208 48,194 42,178
          C 36,162 32,144 30,126
          C 28,108 28,90 30,74
          C 32,58 30,44 35,32
          Z
        "
      />
      {/* ── Sicilia — triangolo a SW della punta ── */}
      <path
        fill={color}
        fillOpacity={opacity * 0.82}
        d="
          M 24,234
          C 30,226 42,222 56,224
          C 68,226 76,232 74,240
          C 66,244 50,244 36,240
          Z
        "
      />
      {/* ── Sardegna — isola allungata a sinistra ── */}
      <path
        fill={color}
        fillOpacity={opacity * 0.72}
        d="
          M 7,90
          C 11,83 18,84 21,92
          C 25,102 24,116 21,126
          C 18,134 11,136 7,128
          C 4,120 4,99 7,90
          Z
        "
      />
    </svg>
  );
}

// ─── Modal Viaggia in Italia ──────────────────────────────────────────────────
function ItalyModal({ credits, onClose }) {
  const DESTINATIONS = [
    {
      icon: "🏠",
      it: "Napoli",
      en: "Il bar di Mario — sempre sbloccata",
      cost: null,
      free: true,
      color: "#58CC02",
      bg: "linear-gradient(135deg, #0a1a0a, #0a1628)",
    },
    {
      icon: "🏘️",
      it: "Borghi",
      en: "Pompei, Matera, Assisi, Alberobello…",
      cost: 20,
      color: "var(--text)",
      bg: "var(--card)",
    },
    {
      icon: "🏙️",
      it: "Province",
      en: "Bari, Palermo, Bologna, Genova…",
      cost: 50,
      color: "var(--text)",
      bg: "var(--card)",
    },
    {
      icon: "🏛️",
      it: "Capoluoghi",
      en: "Roma, Firenze, Milano, Venezia…",
      cost: 100,
      color: "#E5B700",
      bg: "linear-gradient(135deg, #1a1a2e, #2a1a00)",
      gold: true,
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        animation: "fade-in 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: "20px",
          border: "2px solid #E5B70066",
          boxShadow: "0 0 48px #E5B70022",
          width: "100%",
          maxWidth: "400px",
          overflow: "hidden",
          animation: "card-flip 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0d1b2a, #1a2a10)",
            borderBottom: "2px solid #E5B70044",
            padding: "16px 20px 14px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div style={{ width: "40px", height: "62px", flexShrink: 0 }}>
            <ItalySilhouette color="#E5B700" opacity={1} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#E5B700", lineHeight: 1.1 }}>
              Viaggia in Italia
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text2)", marginTop: "2px" }}>
              Travel through Italy
            </div>
            <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: 600, marginTop: "6px" }}>
              I tuoi crediti:{" "}
              <span style={{ color: "#58CC02", fontWeight: 900 }}>🎫 {credits} cr</span>
            </div>
          </div>
        </div>

        {/* Corpo a due colonne */}
        <div style={{ display: "flex" }}>

          {/* Colonna sinistra — sagoma grande + motto bilingue */}
          <div
            style={{
              width: "82px",
              flexShrink: 0,
              background: "linear-gradient(180deg, #0d1b2a 0%, #111 100%)",
              borderRight: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 8px",
              gap: "10px",
            }}
          >
            <div style={{ width: "56px", height: "86px" }}>
              <ItalySilhouette color="#E5B700" opacity={0.65} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#E5B700", lineHeight: 1.7 }}>
                Impara<br />Accumula<br />Viaggia
              </div>
              <div style={{ width: "36px", height: "1px", background: "var(--border)", margin: "5px auto" }} />
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text3)", lineHeight: 1.7 }}>
                Learn<br />Earn<br />Explore
              </div>
            </div>
          </div>

          {/* Colonna destra — fasce */}
          <div style={{ flex: 1 }}>
            {DESTINATIONS.map((d, i) => {
              const canAfford = d.free || credits >= d.cost;
              return (
                <div
                  key={i}
                  style={{
                    background: d.bg,
                    borderBottom: i < DESTINATIONS.length - 1 ? "1px solid var(--border)" : "none",
                    padding: "11px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    opacity: canAfford ? 1 : 0.5,
                    transition: "opacity 0.3s",
                  }}
                >
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{d.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: "13px", color: d.color, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      {d.it}
                      {d.free && (
                        <span style={{ fontSize: "9px", background: "#58CC0222", color: "#58CC02", border: "1px solid #58CC0244", borderRadius: "99px", padding: "1px 6px", fontWeight: 900 }}>
                          ✅ FREE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text3)", fontWeight: 600, marginTop: "1px" }}>
                      {d.en}
                    </div>
                  </div>
                  {!d.free && (
                    <span style={{
                      background: d.gold ? "#E5B70011" : "var(--dis-bg)",
                      color: d.gold ? "#E5B700" : "var(--text2)",
                      border: `1px solid ${d.gold ? "#E5B70066" : "var(--border)"}`,
                      borderRadius: "99px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}>
                      🎫 {d.cost}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "10px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "11px", color: "var(--text3)", fontWeight: 600, textAlign: "center", lineHeight: 1.7, margin: 0 }}>
            <span style={{ color: "#58CC02", fontWeight: 800 }}>+2 crediti</span> per ogni risposta corretta<br />
            Crediti → compra <strong style={{ color: "#E5B700" }}>biglietti</strong> → viaggia in Italia<br />
            <span style={{ fontStyle: "italic", fontSize: "10px" }}>
              +2 credits per correct answer · spend them on tickets to travel Italy
            </span>
          </p>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "2px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "9px",
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
    </div>
  );
}

// ─── XPBar principale ─────────────────────────────────────────────────────────
export default function XPBar() {
  const [energy, setEnergy]           = useState(100);
  const [pizzaSlices, setPizzaSlices] = useState(0);
  const [credits, setCredits]         = useState(0);
  const [streak, setStreak]           = useState(0);
  const [showItaly, setShowItaly]     = useState(false);

  function refresh() {
    const d = readProgress();
    setEnergy(d.energy);
    setPizzaSlices(d.pizzaSlices);
    setCredits(d.credits);
    setStreak(d.streak);
  }

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const pct   = Math.min(Math.max(Math.round(energy), 0), 100);
  const color = energyColor(pct);

  return (
    <>
      {showItaly && (
        <ItalyModal credits={credits} onClose={() => setShowItaly(false)} />
      )}

      <section
        style={{
          background: "var(--card)",
          borderRadius: "var(--r)",
          border: "2px solid var(--border)",
          padding: "14px 16px",
          marginBottom: "24px",
        }}
      >
        {/* ─ Riga 1: streak (solo se > 0) + biglietto ─ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          {streak > 0 ? (
            <span style={{ fontSize: "13px", fontWeight: 900, color: "var(--streak)" }}>
              🔥 {streak}
            </span>
          ) : (
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)" }}>
              🔥 Inizia il tuo streak!
            </span>
          )}

          {/* Biglietto cliccabile */}
          <button
            onClick={() => setShowItaly(true)}
            title="Viaggia in Italia / Travel Italy"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            {/* Label sinistra */}
            <div style={{ textAlign: "right", lineHeight: 1.4 }}>
              <div style={{ fontSize: "11px", fontWeight: 900, color: "#E5B700" }}>
                {credits === 0 ? "Accumula crediti" : `${credits} crediti`}
              </div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text3)" }}>
                {credits === 0 ? "→ biglietti per l\'Italia" : "→ compra biglietti 🇮🇹"}
              </div>
            </div>
            {/* Biglietto */}
            <div
              style={{
                background: "linear-gradient(135deg, #1a2a10, #0d1b2a)",
                border: "2px solid #E5B700",
                borderRadius: "10px",
                padding: "6px 14px 6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 0 10px #E5B70033",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", left: "-7px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", borderRadius: "50%", background: "var(--bg)", border: "2px solid #E5B700" }} />
              <div style={{ position: "absolute", right: "-7px", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", borderRadius: "50%", background: "var(--bg)", border: "2px solid #E5B700" }} />
              <div style={{ width: "16px", height: "25px" }}>
                <ItalySilhouette color="#E5B700" opacity={1} />
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: "16px", fontWeight: 900, color: credits > 0 ? "#E5B700" : "var(--text3)" }}>
                  {credits}
                </div>
                <div style={{ fontSize: "9px", fontWeight: 800, color: "var(--text3)", letterSpacing: "0.5px" }}>
                  {credits === 1 ? "CREDITO" : "CREDITI"}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* ─ Riga 2: barra energia con label ─ */}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
            <span style={{ fontSize: "12px", fontWeight: 900, color, transition: "color 0.4s" }}>
              ⚡ Energia / Energy
            </span>
            <span style={{ fontSize: "12px", fontWeight: 800, color, transition: "color 0.4s" }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: "10px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: color,
                borderRadius: "99px",
                boxShadow: energyShadow(pct),
                transition: "width 0.5s ease, background 0.4s ease",
              }}
            />
          </div>
          {pct <= 60 && (
            <p style={{ fontSize: "11px", fontWeight: 700, color, marginTop: "4px", textAlign: "right", fontStyle: "italic", transition: "color 0.4s" }}>
              {pct >= 30 ? "Quasi scarico… / Running low…" : "Energia critica! / Critical energy!"}
            </p>
          )}
        </div>

        {/* ─ Riga 3: legenda cibo → energia ─ */}
        <div
          style={{
            background: "var(--bg)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            padding: "8px 10px",
            marginBottom: "10px",
          }}
        >
          {/* Titolo legenda */}
          <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "7px" }}>
            Recupera energia con / Restore energy with
          </div>

          {/* Chips alimenti */}
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {FOODS.map((f) => (
              <div
                key={f.icon}
                title={`${f.it} — ${f.en}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: f.rare ? "#E5B70011" : "var(--card)",
                  border: `1px solid ${f.rare ? "#E5B70044" : "var(--border)"}`,
                  borderRadius: "99px",
                  padding: "3px 8px",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "13px" }}>{f.icon}</span>
                <span style={{ fontSize: "11px", fontWeight: 900, color: f.rare ? "#E5B700" : color }}>
                  {f.pct}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─ Riga 4: pizza a spicchi (accumulatore separato) ─ */}
        <div
          style={{
            background: "var(--bg)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
            🍕 Pizza — accumula spicchi / Collect slices
          </div>
          {pizzaSlices === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", opacity: 0.22, filter: "grayscale(1)" }}>🍕</span>
              <span style={{ fontSize: "11px", color: "var(--text3)", fontWeight: 700, lineHeight: 1.5 }}>
                Ogni 5 risposte corrette = 1 spicchio +8%<br />
                <span style={{ fontWeight: 600 }}>Every 5 correct answers = 1 slice +8%</span>
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  title={i < pizzaSlices ? `Spicchio ${i + 1} — +8% energia` : ""}
                  style={{
                    fontSize: "18px",
                    opacity: i < pizzaSlices ? 1 : 0.15,
                    filter: i < pizzaSlices ? "none" : "grayscale(1)",
                    transition: "opacity 0.35s, filter 0.35s",
                  }}
                >
                  🍕
                </span>
              ))}
              <span style={{ fontSize: "11px", color: "var(--text3)", fontWeight: 700, marginLeft: "4px" }}>
                {pizzaSlices < 6
                  ? `${pizzaSlices}/6 · ancora ${(6 - pizzaSlices) * 5} risp.`
                  : "Pizza completa! +48% energia 🎉"}
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
