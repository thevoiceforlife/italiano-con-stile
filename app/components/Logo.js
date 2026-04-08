"use client";
import { useState, useRef, useEffect } from "react";

const WORDS = ["Finally,", "someone", "explains", "why."];
const WORD_DELAYS = [0, 550, 1200, 1900];

export default function Logo({ size = 160 }) {
  const [hovered, setHovered] = useState(false);
  const [waving, setWaving] = useState(false);
  const [activeWord, setActiveWord] = useState(-1);
  const [unlocked, setUnlocked] = useState(false);
  const wavingRef = useRef(false);
  const timersRef = useRef([]);
  const ctxRef = useRef(null);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  function ringBell(onEnd) {
    try {
      const ctx = ctxRef.current;
      if (!ctx) {
        onEnd?.();
        return;
      }
      if (ctx.state === "suspended") ctx.resume();

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-6, ctx.currentTime);
      comp.knee.setValueAtTime(3, ctx.currentTime);
      comp.ratio.setValueAtTime(4, ctx.currentTime);
      comp.attack.setValueAtTime(0, ctx.currentTime);
      comp.release.setValueAtTime(0.1, ctx.currentTime);
      comp.connect(ctx.destination);

      const bell = (freq, partials, gainVal, decay, offset) => {
        const osc0 = ctx.createOscillator();
        const gain0 = ctx.createGain();
        osc0.type = "sine";
        osc0.frequency.setValueAtTime(freq, ctx.currentTime + offset);
        gain0.gain.setValueAtTime(gainVal, ctx.currentTime + offset);
        gain0.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + offset + decay,
        );
        osc0.connect(gain0);
        gain0.connect(comp);
        osc0.start(ctx.currentTime + offset);
        osc0.stop(ctx.currentTime + offset + decay);
        partials.forEach((ratio, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq * ratio, ctx.currentTime + offset);
          const pg = gainVal * (0.5 / (i + 1));
          gain.gain.setValueAtTime(pg, ctx.currentTime + offset);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + offset + decay * 0.65,
          );
          osc.connect(gain);
          gain.connect(comp);
          osc.start(ctx.currentTime + offset);
          osc.stop(ctx.currentTime + offset + decay);
        });
      };

      bell(2200, [2.756, 5.404], 4.0, 1.2, 0);
      bell(2200, [2.756, 5.404], 2.5, 1.0, 0.008);
      timersRef.current.push(setTimeout(() => onEnd?.(), 1250));
    } catch (e) {
      onEnd?.();
    }
  }

  function highlightWords() {
    WORD_DELAYS.forEach((delay, i) => {
      timersRef.current.push(setTimeout(() => setActiveWord(i), delay));
    });
    timersRef.current.push(setTimeout(() => setActiveWord(-1), 3000));
  }

  function runSequence() {
    if (wavingRef.current) return;
    wavingRef.current = true;
    setWaving(true);
    clearTimers();

    ringBell(() => {
      highlightWords();

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance("Finally someone explains why");
        u.lang = "en-GB";
        u.rate = 1.1;
        u.pitch = 1.8;
        u.volume = 0.6;

        const voci = window.speechSynthesis.getVoices();
        const voce =
          voci.find(
            (v) => v.name === "Shelley" && v.lang.startsWith("en-GB"),
          ) ||
          voci.find((v) => v.name === "Shelley" && v.lang.startsWith("en")) ||
          voci.find((v) => v.name.includes("Samantha")) ||
          voci.find((v) => v.lang.startsWith("en-GB")) ||
          voci.find(
            (v) => v.lang.startsWith("en") && !v.name.includes("Google"),
          );
        if (voce) u.voice = voce;

        u.onboundary = (e) => {
          if (e.name !== "word") return;
          const word = "Finally someone explains why"
            .slice(e.charIndex, e.charIndex + e.charLength)
            .trim()
            .toLowerCase();
          const idx = ["finally", "someone", "explains", "why"].indexOf(word);
          if (idx !== -1) {
            clearTimers();
            setActiveWord(idx);
          }
        };

        u.onend = () => {
          setActiveWord(-1);
          ringBell(() => {
            setWaving(false);
            wavingRef.current = false;
          });
        };
        u.onerror = () => {
          setActiveWord(-1);
          setWaving(false);
          wavingRef.current = false;
        };

        window.speechSynthesis.speak(u);
      } else {
        timersRef.current.push(
          setTimeout(() => {
            ringBell(() => {
              setWaving(false);
              wavingRef.current = false;
            });
          }, 3200),
        );
      }
    });
  }

  function handleIconClick(e) {
    e.stopPropagation();
    if (!unlocked) {
      try {
        ctxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
        ctxRef.current.resume().then(() => {
          setUnlocked(true);
          runSequence();
        });
      } catch (err) {
        setUnlocked(true);
        runSequence();
      }
    } else {
      if (!wavingRef.current) runSequence();
    }
  }

  function handleEnter() {
    setHovered(true);
    if (unlocked && !wavingRef.current) runSequence();
  }

  function handleLeave() {
    setHovered(false);
  }

  const h = Math.round((size * 280) / 340);
  const logoAnim = waving
    ? "logo-wave 2.4s ease-in-out infinite"
    : "logo-float 3s ease-in-out infinite";

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        cursor: "pointer",
        padding: "8px 0",
        maxWidth: "480px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* SVG LOGO */}
      <div style={{ flexShrink: 0, animation: logoAnim }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 340 280"
          width={size}
          height={h}
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            <filter id="glow-uk" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation={hovered ? "9" : "4"}
                floodColor="#4B7FE8"
                floodOpacity={hovered ? "0.9" : "0.6"}
              />
            </filter>
            <filter id="glow-it" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation={hovered ? "9" : "4"}
                floodColor="#ffffff"
                floodOpacity={hovered ? "0.7" : "0.4"}
              />
            </filter>
            <clipPath id="uk-clip-logo">
              <path d="M 52,28 H 236 A 52,52 0 0 1 260,52 V 156 A 52,52 0 0 1 236,180 H 112 L 22,234 L 52,180 A 52,52 0 0 1 28,156 V 52 A 52,52 0 0 1 52,28 Z" />
            </clipPath>
            <clipPath id="it-clip-logo">
              <path d="M 102,68 H 297 A 52,52 0 0 1 321,92 V 200 A 52,52 0 0 1 297,224 H 229 L 256,278 L 169,224 H 102 A 52,52 0 0 1 78,200 V 92 A 52,52 0 0 1 102,68 Z" />
            </clipPath>
          </defs>

          {/* UK BUBBLE */}
          <g
            style={{
              transformOrigin: "144px 110px",
              animation: waving
                ? "bubble-uk-wave 2.4s ease-in-out infinite"
                : "bubble-uk 4s ease-in-out infinite",
            }}
          >
            <path
              d="M 52,28 H 236 A 52,52 0 0 1 260,52 V 156 A 52,52 0 0 1 236,180 H 112 L 22,234 L 52,180 A 52,52 0 0 1 28,156 V 52 A 52,52 0 0 1 52,28 Z"
              fill="#012169"
              filter="url(#glow-uk)"
            />
            <g clipPath="url(#uk-clip-logo)">
              <line
                x1="28"
                y1="28"
                x2="260"
                y2="234"
                stroke="white"
                strokeWidth="52"
              />
              <line
                x1="260"
                y1="28"
                x2="28"
                y2="234"
                stroke="white"
                strokeWidth="52"
              />
              <line
                x1="28"
                y1="28"
                x2="260"
                y2="234"
                stroke="#C8102E"
                strokeWidth="30"
              />
              <line
                x1="260"
                y1="28"
                x2="28"
                y2="234"
                stroke="#C8102E"
                strokeWidth="30"
              />
              <rect x="28" y="90" width="232" height="48" fill="white" />
              <rect x="126" y="28" width="48" height="206" fill="white" />
              <rect x="28" y="98" width="232" height="32" fill="#C8102E" />
              <rect x="134" y="28" width="32" height="206" fill="#C8102E" />
            </g>
            <path
              d="M 52,28 H 236 A 52,52 0 0 1 260,52 V 156 A 52,52 0 0 1 236,180 H 112 L 22,234 L 52,180 A 52,52 0 0 1 28,156 V 52 A 52,52 0 0 1 52,28 Z"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="12"
            />
            <path
              d="M 52,28 H 236 A 52,52 0 0 1 260,52 V 156 A 52,52 0 0 1 236,180 H 112 L 22,234 L 52,180 A 52,52 0 0 1 28,156 V 52 A 52,52 0 0 1 52,28 Z"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="4"
            />
            <path
              d="M 52,28 H 236 A 52,52 0 0 1 260,52 V 156 A 52,52 0 0 1 236,180 H 112 L 22,234 L 52,180 A 52,52 0 0 1 28,156 V 52 A 52,52 0 0 1 52,28 Z"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            />
          </g>

          {/* ITALIAN BUBBLE */}
          <g
            style={{
              transformOrigin: "199px 148px",
              animation: waving
                ? "bubble-it-wave 2.4s ease-in-out infinite"
                : "bubble-it 4s ease-in-out infinite",
            }}
          >
            <path
              d="M 102,68 H 297 A 52,52 0 0 1 321,92 V 200 A 52,52 0 0 1 297,224 H 229 L 256,278 L 169,224 H 102 A 52,52 0 0 1 78,200 V 92 A 52,52 0 0 1 102,68 Z"
              fill="white"
              filter="url(#glow-it)"
            />
            <g clipPath="url(#it-clip-logo)">
              <rect x="78" y="68" width="81" height="210" fill="#009246" />
              <rect x="240" y="68" width="81" height="210" fill="#CE2B37" />
            </g>
            <path
              d="M 102,68 H 297 A 52,52 0 0 1 321,92 V 200 A 52,52 0 0 1 297,224 H 229 L 256,278 L 169,224 H 102 A 52,52 0 0 1 78,200 V 92 A 52,52 0 0 1 102,68 Z"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="12"
            />
            <path
              d="M 102,68 H 297 A 52,52 0 0 1 321,92 V 200 A 52,52 0 0 1 297,224 H 229 L 256,278 L 169,224 H 102 A 52,52 0 0 1 78,200 V 92 A 52,52 0 0 1 102,68 Z"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="4"
            />
            <path
              d="M 102,68 H 297 A 52,52 0 0 1 321,92 V 200 A 52,52 0 0 1 297,224 H 229 L 256,278 L 169,224 H 102 A 52,52 0 0 1 78,200 V 92 A 52,52 0 0 1 102,68 Z"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </div>

      {/* TESTI */}
      <div style={{ flex: 1, textAlign: "left" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: hovered ? "#6EE01A" : "var(--primary)",
            letterSpacing: "-0.3px",
            marginBottom: "6px",
            lineHeight: 1.2,
            transition: "color 0.3s",
          }}
        >
          Italian for English Speakers
        </h1>

        {/* SOTTOTITOLO CON ICONA + PAROLE NEON */}
        <p
          style={{
            fontSize: "14px",
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: "8px",
            lineHeight: 1.6,
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            alignItems: "center",
          }}
        >
          {/* ICONA 🔊 — sparisce dopo unlock */}
          {!unlocked && (
            <span
              onClick={handleIconClick}
              title="Click to enable sound"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#0D2A0D",
                border: "2.5px solid #58CC02",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                cursor: "pointer",
                flexShrink: 0,
                animationName: "bell-pulse-icon",
                animationDuration: "1.5s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
              }}
            >
              🔊
            </span>
          )}

          {WORDS.map((word, i) => (
            <span
              key={i}
              style={{
                color:
                  activeWord === i
                    ? "#FFFFFF"
                    : hovered
                      ? "var(--text)"
                      : "var(--text2)",
                textShadow:
                  activeWord === i
                    ? "0 0 8px #58CC02, 0 0 16px #58CC02, 0 0 32px #58CC02, 0 0 48px #46A302"
                    : "none",
                transform: activeWord === i ? "scale(1.15)" : "scale(1)",
                display: "inline-block",
                transition: "color 0.08s, text-shadow 0.08s, transform 0.08s",
                fontWeight: activeWord === i ? 900 : 700,
              }}
            >
              {word}
            </span>
          ))}
        </p>

        {/* BARRA AUDIO */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "3px",
            height: "16px",
            opacity: 1,
          }}
        >
          {[7, 12, 9, 14, 8, 11, 6, 13, 10, 7, 12, 9].map((barH, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                height: `${barH}px`,
                background: "var(--primary)",
                borderRadius: "2px",
                animationName: waving ? "bar-wave" : "none",
                animationDuration: "0.6s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: "var(--text3)",
              marginLeft: "6px",
              lineHeight: "16px",
            }}
          >
            EN
          </span>
        </div>
      </div>
    </div>
  );
}
