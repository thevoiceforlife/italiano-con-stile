"use client";
/**
 * LessonCompletePopup — overlay di riepilogo fine lezione.
 * Appare dopo l'ultima domanda, prima della schermata risultati finale.
 *
 * Props:
 *  - reward: { emoji, nome_it, nome_en }
 *  - corrette, totale, crediti, energia
 *  - lessonIndex: 0..5 (5 = boss)
 *  - messaggioIT, messaggioEN
 *  - onHome(), onContinua()
 */

import CelebrationEffect from "./CelebrationEffect";

export function getMessaggioMario(corrette, totale) {
  if (corrette === totale) {
    return { it: "Perfetto! Sei una star!", en: "Perfect! You are a star!" };
  }
  if (corrette >= totale * 0.75) {
    return { it: "Ottimo lavoro! Continua così!", en: "Great work! Keep it up!" };
  }
  if (corrette >= totale * 0.5) {
    return { it: "Bene! La pratica fa il maestro.", en: "Good! Practice makes perfect." };
  }
  return { it: "Riprova — migliorerai!", en: "Try again — you will improve!" };
}

export default function LessonCompletePopup({
  reward,
  corrette,
  totale,
  crediti,
  energia,
  lessonIndex,
  messaggioIT,
  messaggioEN,
  onHome,
  onContinua,
}) {
  const steps = [1, 2, 3, 4, 5, "boss"];

  return (
    <>
      <CelebrationEffect />
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: "0 16px",
      }}>
        <div style={{
          background: "#1e2d3d", borderRadius: 20, padding: "28px 24px",
          maxWidth: 380, width: "100%", border: "2px solid var(--accent)",
          animation: "popIn 0.5s ease-out forwards",
        }}>

          {/* REWARD FOOD */}
          <div style={{
            fontSize: 72, textAlign: "center",
            animation: "rewardBounce 0.6s ease-out", marginBottom: 8,
          }}>
            {reward?.emoji || "🍽️"}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 900, color: "var(--accent)",
            textAlign: "center", marginBottom: 4,
          }}>
            {reward?.nome_it || "Ricompensa"}
          </div>
          <div style={{
            fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.4)",
            textAlign: "center", marginBottom: 20,
          }}>
            {reward?.nome_en || "Reward"}
          </div>

          {/* STATS — 3 card */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8, marginBottom: 20,
          }}>
            <div style={{ background: "#152535", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#58cc02" }}>{corrette}/{totale}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Corrette</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Correct</div>
            </div>
            <div style={{ background: "#152535", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#ff9b42" }}>🎫 +{crediti}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Crediti</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Credits</div>
            </div>
            <div style={{ background: "#152535", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#1cb0f6" }}>⚡ +{energia}%</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Energia</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Energy</div>
            </div>
          </div>

          {/* BARRA PROGRESSIONE TEMA */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, color: "rgba(255,255,255,0.35)",
              textAlign: "center", marginBottom: 8,
            }}>
              Tema 1: Saluti e presentazioni · Theme 1: Greetings
            </div>
            <div style={{
              display: "flex", justifyContent: "center", gap: 8, alignItems: "center",
            }}>
              {steps.map((step, i) => {
                const completata = lessonIndex > i;
                const corrente = lessonIndex === i;
                return (
                  <div key={i} style={{
                    width: corrente ? 14 : 10,
                    height: corrente ? 14 : 10,
                    borderRadius: "50%",
                    background: completata
                      ? "#58cc02"
                      : corrente
                        ? "var(--accent)"
                        : "rgba(255,255,255,0.15)",
                    border: corrente ? "2px solid var(--accent)" : "none",
                    transition: "all 0.3s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {step === "boss" && (
                      <span style={{ fontSize: 10 }}>
                        {completata ? "🏆" : "👑"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* MESSAGGIO MARIO */}
          <div style={{
            background: "#152535", borderRadius: 12, padding: "12px 16px",
            marginBottom: 20, textAlign: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
              "{messaggioIT}"
            </div>
            <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(255,255,255,0.35)" }}>
              "{messaggioEN}"
            </div>
          </div>

          {/* 2 PULSANTI */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10 }}>
            <button
              onClick={onHome}
              style={{
                background: "none", border: "1.5px solid rgba(255,255,255,0.2)",
                borderRadius: 12, padding: "0 16px", height: 52,
                color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer",
                fontFamily: "inherit",
              }}
              aria-label="Home"
            >🏠</button>

            <button
              onClick={onContinua}
              className="btn-cta"
              style={{
                background: "#58cc02", color: "#fff",
                borderBottom: "4px solid #46a302",
                borderRadius: 12, height: 52,
              }}
            >
              <span className="btn-it">CONTINUA →</span>
              <span className="btn-en">Continue</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
