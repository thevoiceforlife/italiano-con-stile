"use client";
import { useState, useEffect, useCallback } from "react";
import personaggiData from "@/data/config/personaggi.json";

// Voice/rate/pitch sono parametri runtime TTS — non vanno nel JSON config
const VOICE_CONFIG = {
  mario:    { voice: "Rocko",   rate: 0.88, pitch: 1.0 },
  sofia:    { voice: "Shelley", rate: 1.1,  pitch: 1.2 },
  diego:    { voice: "Eddy",    rate: 1.3,  pitch: 1.55 },
  gino:     { voice: "Grandpa", rate: 0.72, pitch: 0.72 },
  matilde:  { voice: "Sandy",   rate: 0.95, pitch: 1.0 },
  vittoria: { voice: "Grandma", rate: 0.75, pitch: 0.9 },
};

// CHARACTERS: merge config JSON + voice config — usato ovunque nell'app
export const CHARACTERS = Object.fromEntries(
  Object.entries(personaggiData).map(([id, p]) => [id, {
    name: p.nome,
    image: p.avatar,
    color: p.colore,
    ...(VOICE_CONFIG[id] || {}),
  }])
);

// ─── Selezione voce con fallback graceful ─────────────────────────────────────
// Strategia: voce esatta → voce italiana qualsiasi → voce di sistema
function selezionaVoce(voci, config) {
  // 1. Voce esatta richiesta (es. "Rocko" it-IT)
  const esatta = voci.find(
    (v) => v.name === config.voice && v.lang.startsWith("it")
  );
  if (esatta) return esatta;

  // 2. Qualsiasi voce italiana disponibile sul dispositivo
  const italiana = voci.find((v) => v.lang.startsWith("it"));
  if (italiana) return italiana;

  // 3. Fallback: null = browser usa voce di sistema
  return null;
}

function cleanForTTSInternal(text) {
  return String(text).replace(/(\d+)-(\d+)/g, '$1 $2').replace(/\s*-\s*/g, ' ').replace(/\//g, ' ').replace(/·/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parla(testo, config, onStart, onEnd) {
  if (!testo || !config) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(cleanForTTSInternal(testo));
  u.lang = "it-IT";
  u.rate = config.rate ?? 0.88;
  u.pitch = config.pitch ?? 1.0;

  const trySpeak = () => {
    const voci = window.speechSynthesis.getVoices();
    const voce = selezionaVoce(voci, config);

    if (voce) u.voice = voce;

    // Se è voce di fallback, normalizza rate/pitch per evitare effetti strani
    if (voce && voce.name !== config.voice) {
      u.rate  = Math.min(config.rate  ?? 0.88, 1.0);
      u.pitch = Math.min(config.pitch ?? 1.0,  1.2);
    }

    u.onstart = () => onStart?.();
    u.onend   = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = trySpeak;
  } else {
    trySpeak();
  }
}

// CHARACTER_ANIMS rimane esportato ma vuoto — le animazioni sono in globals.css
export const CHARACTER_ANIMS = ``;

/**
 * CharacterBubble
 * @param {string}  character  — "mario" | "sofia" | "diego" | "gino" | "matilde" | "vittoria"
 * @param {string}  textIT     — testo italiano (riga 1, colore principale)
 * @param {string}  textEN     — testo inglese (riga 2, italic var(--text3))
 * @param {string}  text       — [legacy] testo bilingue su una riga (deprecated)
 * @param {string}  speakText  — testo italiano da leggere ad alta voce (TTS)
 * @param {boolean} autoSpeak  — parla automaticamente al mount
 * @param {string}  feedback   — "ok" | "err" | null
 * @param {number}  size       — dimensione avatar in px (default: 64)
 */
export default function CharacterBubble({
  character = "mario",
  textIT = "",
  textEN = "",
  text = "",
  speakText = "",
  autoSpeak = false,
  feedback = null,
  size = 64,
}) {
  const cfg = CHARACTERS[character];
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    if (!speakText) return;
    parla(
      speakText,
      cfg,
      () => setSpeaking(true),
      () => setSpeaking(false),
    );
  }, [speakText, cfg]);

  useEffect(() => {
    if (!autoSpeak || !speakText) return;
    const t = setTimeout(speak, 400);
    return () => {
      clearTimeout(t);
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    };
  }, [autoSpeak, speakText, speak]);

  // Animazione avatar
  let avatarAnim = "none";
  if (feedback === "ok") avatarAnim = "pulse-ok 0.5s ease";
  else if (feedback === "err") avatarAnim = "shake-err 0.5s ease";
  else if (speaking)
    avatarAnim = `speaking-glow-${character} 1s ease-in-out infinite`;

  // Glow bubble — colore del personaggio mentre parla
  const bubbleGlow = speaking ? `0 0 12px 3px ${cfg.color}55` : "none";

  const bubbleBorder = speaking ? cfg.color : "var(--border)";

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
      {/* AVATAR */}
      <img
        src={cfg.image}
        alt={cfg.name}
        width={size}
        height={size}
        onClick={speak}
        title={`Clicca per risentire ${cfg.name}`}
        style={{
          borderRadius: "50%",
          border: `3px solid ${cfg.color}`,
          flexShrink: 0,
          animation: avatarAnim,
          cursor: speakText ? "pointer" : "default",
        }}
      />

      {/* SPEECH BUBBLE */}
      {(textIT || textEN || text) && (
        <div style={{ position: "relative", flex: 1 }}>
          {/* CODA DEL FUMETTO — triangolino in basso a sinistra */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "-10px",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: `10px solid ${bubbleBorder}`,
              transition: "border-color 0.3s",
              zIndex: 2,
            }}
          />
          {/* Riempimento interno della coda */}
          <div
            style={{
              position: "absolute",
              bottom: "11px",
              left: "-7px",
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "9px solid var(--card)",
              zIndex: 3,
            }}
          />

          {/* BUBBLE BOX */}
          <div
            style={{
              background: "var(--card)",
              border: `2px solid ${bubbleBorder}`,
              borderRadius: "14px 14px 14px 4px",
              padding: "12px 14px",
              lineHeight: 1.5,
              boxShadow: bubbleGlow,
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
          >
            {textIT ? (
              <>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)", lineHeight: 1.35 }}>
                  {textIT}
                </div>
                {textEN && textEN !== "undefined" && textEN !== "null" && String(textEN).trim() !== "" && (
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text3)", fontStyle: "italic", marginTop: 3, lineHeight: 1.35 }}>
                    {textEN}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text2)" }}>
                {text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
