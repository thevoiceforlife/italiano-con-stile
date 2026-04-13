"use client";
import { useEffect, useRef, useState } from "react";
import { CHARACTERS } from "./CharacterBubble";
import { cleanForTTS } from "./pronounce";

/**
 * PersonaggioBubble — personaggio + fumetto con animazione TTS.
 *
 * Props:
 * @param {string}  character — "mario"|"sofia"|"diego"|"gino"|"matilde"|"vittoria"
 * @param {string}  textIT — testo italiano nel fumetto
 * @param {string}  textEN — testo inglese nel fumetto
 * @param {"ok"|"err"|null} feedback — feedback visuale (bounce/shake)
 * @param {"bounce"|"shake"|"spin"|null} anim — animazione one-shot
 * @param {boolean} pulseUntilClick — se true, avatar pulsa finché utente non clicca
 * @param {function} onSpeakStart — chiamata quando TTS inizia
 * @param {function} onSpeakEnd — chiamata quando TTS finisce (o errore)
 */
export default function PersonaggioBubble({
  character = "mario",
  textIT = "",
  textEN = "",
  feedback = null,
  anim = null,
  pulseUntilClick = false,
  onSpeakStart,
  onSpeakEnd,
  // retrocompat — ignorato
  autoSpeak, // eslint-disable-line no-unused-vars
}) {
  const cfg = CHARACTERS[character] || CHARACTERS.mario;
  const charColor = cfg.color;

  const cleanIT = String(textIT || "").trim();
  let cleanEN = String(textEN || "").trim();
  if (cleanEN === "undefined" || cleanEN === "null") cleanEN = "";

  // ── Stato TTS + typewriter ──────────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayIT, setDisplayIT] = useState(cleanIT);
  const [showEN, setShowEN] = useState(true);
  const [hasClicked, setHasClicked] = useState(false);
  const typewriterRef = useRef(null);

  // Quando il testo cambia (es. feedback), mostra subito il testo completo
  useEffect(() => {
    if (!isSpeaking) {
      setDisplayIT(cleanIT);
      setShowEN(true);
    }
  }, [cleanIT, isSpeaking]);

  // Se pulseUntilClick cambia a true (nuovo round/domanda), reset hasClicked
  useEffect(() => {
    if (pulseUntilClick) setHasClicked(false);
  }, [pulseUntilClick]);

  // ── Mount enter animation ONE-SHOT ────────────────────────────────────
  const hasEntered = useRef(false);
  const [showEnter, setShowEnter] = useState(false);
  useEffect(() => {
    if (hasEntered.current) return;
    hasEntered.current = true;
    setShowEnter(true);
    const t = setTimeout(() => setShowEnter(false), 550);
    return () => clearTimeout(t);
  }, []);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── Handler: click avatar o bubble → TTS + typewriter ─────────────────
  function handleSpeak() {
    if (!cleanIT) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Ferma TTS + typewriter precedenti
    window.speechSynthesis.cancel();
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }

    // Segnala hasClicked (ferma pulse)
    setHasClicked(true);
    if (onSpeakStart) onSpeakStart();

    // Setup utterance
    const u = new SpeechSynthesisUtterance(cleanForTTS(cleanIT));
    u.lang = "it-IT";
    u.rate = 0.85;
    u.pitch = 1;
    u.volume = 1;

    setIsSpeaking(true);
    setDisplayIT("");
    setShowEN(false);

    // Typewriter 80ms/char
    let i = 0;
    typewriterRef.current = setInterval(() => {
      i++;
      setDisplayIT(cleanIT.slice(0, i));
      if (i >= cleanIT.length) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
        setShowEN(true);
      }
    }, 80);

    function finish() {
      setIsSpeaking(false);
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
      setDisplayIT(cleanIT);
      setShowEN(true);
      if (onSpeakEnd) onSpeakEnd();
    }

    u.onend = finish;
    u.onerror = finish;

    setTimeout(() => {
      try { window.speechSynthesis.speak(u); } catch (e) {}
    }, 50);
  }

  // ── Classe animazione avatar ──────────────────────────────────────────
  let animClass = "";
  if (feedback === "ok")       animClass = "pb-bounce";
  else if (feedback === "err") animClass = "pb-shake";
  else if (anim === "bounce")  animClass = "pb-bounce";
  else if (anim === "shake")   animClass = "pb-shake";
  else if (anim === "spin")    animClass = "pb-spin";
  else if (showEnter)          animClass = "pb-enter";

  // Pulse: pulsa se pulseUntilClick e non ha ancora cliccato, oppure se speaking
  const isPulsing = (pulseUntilClick && !hasClicked) || isSpeaking;

  // ── Stili fumetto ─────────────────────────────────────────────────────
  const bubbleBorder = feedback === "ok" ? "#27AE60"
    : feedback === "err" ? "#E24B4A"
    : isSpeaking ? "#ff9500"
    : charColor;
  const bubbleBg = feedback === "ok" ? "rgba(39,174,96,0.1)"
    : feedback === "err" ? "rgba(226,75,74,0.08)"
    : `${charColor}14`;
  const bubbleShadow = feedback === "ok" ? "0 0 10px rgba(39,174,96,0.4)"
    : feedback === "err" ? "0 0 10px rgba(226,75,74,0.4)"
    : isSpeaking ? "0 0 16px rgba(255,149,0,0.8)"
    : "none";

  const avatarStyle = {
    "--char-color": charColor,
    "--char-bg": `${charColor}1F`,
  };

  return (
    <div className="pb-row">
      {/* AVATAR */}
      <div
        onClick={handleSpeak}
        title="Clicca per ascoltare · Click to listen"
        className={`pb-avatar-wrapper ${isPulsing ? "speaking" : ""}`.trim()}
        style={{
          width: 80, height: 80, flexShrink: 0,
          cursor: cleanIT ? "pointer" : "default",
        }}
      >
        <img
          src={cfg.image}
          alt={cfg.name}
          width={80}
          height={80}
          className={`pb-avatar ${animClass}`.trim()}
          style={{ ...avatarStyle, pointerEvents: "none" }}
        />
        {cleanIT && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute", bottom: -2, right: -2,
              background: charColor, borderRadius: "50%",
              width: 24, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, border: "2px solid var(--bg)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
              pointerEvents: "none",
            }}
          >
            🔊
          </div>
        )}
      </div>

      {/* FUMETTO */}
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute", left: -12, top: 28,
            width: 0, height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: `12px solid ${bubbleBorder}`,
            transition: "border-right-color 0.25s",
          }}
        />
        <div
          onClick={handleSpeak}
          title="Clicca per ascoltare · Click to listen"
          style={{
            position: "relative", borderRadius: 10,
            border: `1.5px solid ${bubbleBorder}`,
            background: bubbleBg,
            boxShadow: bubbleShadow,
            padding: "12px 28px 12px 16px",
            minHeight: 64,
            display: "flex", flexDirection: "column", justifyContent: "center",
            cursor: cleanIT ? "pointer" : "default",
            transition: "border-color 0.5s ease, background 0.5s ease, box-shadow 0.5s ease",
          }}
        >
          {cleanIT && (
            <div
              style={{
                fontSize: 16, fontWeight: 600, color: "var(--text)",
                lineHeight: 1.35, minHeight: "1.35em",
              }}
            >
              {isSpeaking ? displayIT : cleanIT}
              {isSpeaking && (
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block", width: 2, height: "1em",
                    background: "#ff9500", marginLeft: 2,
                    verticalAlign: "text-bottom",
                    animation: "blink 0.8s steps(2) infinite",
                  }}
                />
              )}
            </div>
          )}
          {cleanEN && (
            <div
              style={{
                fontSize: 13, fontStyle: "italic", color: "var(--text3)",
                lineHeight: 1.35, marginTop: cleanIT ? 4 : 0,
                opacity: showEN ? 1 : 0,
                transform: showEN ? "translateY(0)" : "translateY(4px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}
            >
              {cleanEN}
            </div>
          )}
          {cleanIT && !isSpeaking && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute", bottom: 4, right: 6,
                fontSize: 11, opacity: 0.55, pointerEvents: "none",
              }}
            >
              🔊
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
