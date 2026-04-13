"use client";
import { useState, useEffect } from "react";

const COLORS = ["#58cc02","#ff9500","#1cb0f6","#ffd700","#ff4b4b"];
const EMOJIS = ["🎉","🎊","🌟","💫","✨","🎈","🏆","🎯"];

function rand(min, max) { return min + Math.random() * (max - min); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── 1. Confetti classici ───────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    left: `${rand(0,100)}%`, color: COLORS[i % 5],
    dur: `${rand(1.5,3)}s`, delay: `${rand(0,1)}s`,
  }));
  return <>{pieces.map((p,i) => (
    <div key={i} style={{ position:"absolute", left:p.left, top:-12, width:8, height:8, background:p.color, borderRadius:2, animation:`cel-confetti ${p.dur} ${p.delay} ease-in forwards` }} />
  ))}</>;
}

// ─── 2. Fireworks ───────────────────────────────────────────────────────────
function Fireworks() {
  const centers = Array.from({ length: 5 }, () => ({ x: rand(15,85), y: rand(15,60) }));
  return <>{centers.map((c, ci) => {
    const particles = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const dist = rand(40, 80);
      return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist };
    });
    return particles.map((p, pi) => (
      <div key={`${ci}-${pi}`} style={{
        position:"absolute", left:`${c.x}%`, top:`${c.y}%`,
        width:6, height:6, borderRadius:"50%", background: COLORS[ci % 5],
        "--dx":`${p.dx}px`, "--dy":`${p.dy}px`,
        animation:`cel-firework 0.8s ${ci * 0.3}s ease-out forwards`,
      }} />
    ));
  })}</>;
}

// ─── 3. Stelle cadenti ──────────────────────────────────────────────────────
function ShootingStars() {
  const stars = Array.from({ length: 10 }, (_, i) => ({
    top: `${rand(0,40)}%`, right: `${rand(-10,30)}%`,
    delay: `${rand(0,1.5)}s`, dur: `${rand(0.8,1.5)}s`,
  }));
  return <>{stars.map((s,i) => (
    <div key={i} style={{ position:"absolute", top:s.top, right:s.right, fontSize:rand(14,22), animation:`cel-star ${s.dur} ${s.delay} ease-in forwards` }}>⭐</div>
  ))}</>;
}

// ─── 4. Bolle ───────────────────────────────────────────────────────────────
function Bubbles() {
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    left: `${rand(5,95)}%`, size: rand(12,30),
    dur: `${rand(2,3.5)}s`, delay: `${rand(0,1)}s`,
    color: pick(COLORS),
  }));
  return <>{bubbles.map((b,i) => (
    <div key={i} style={{
      position:"absolute", left:b.left, bottom:-20,
      width:b.size, height:b.size, borderRadius:"50%",
      background:b.color, opacity:0.3,
      animation:`cel-bubble ${b.dur} ${b.delay} ease-out forwards`,
    }} />
  ))}</>;
}

// ─── 5. Emoji rain ──────────────────────────────────────────────────────────
function EmojiRain() {
  const items = Array.from({ length: 10 }, () => ({
    emoji: pick(EMOJIS), left: `${rand(5,90)}%`,
    size: rand(24,36), dur: `${rand(1.5,3)}s`, delay: `${rand(0,1)}s`,
  }));
  return <>{items.map((e,i) => (
    <div key={i} style={{ position:"absolute", left:e.left, top:-50, fontSize:e.size, animation:`cel-emoji ${e.dur} ${e.delay} ease-in forwards` }}>{e.emoji}</div>
  ))}</>;
}

// ─── 6. Pulse rings ─────────────────────────────────────────────────────────
function PulseRings() {
  return <>{[0, 0.3, 0.6].map((d,i) => (
    <div key={i} style={{
      position:"absolute", left:"50%", top:"40%",
      width:60, height:60, marginLeft:-30, marginTop:-30,
      borderRadius:"50%", border:"4px solid #58cc02",
      animation:`cel-ring 1.2s ${d}s ease-out forwards`,
    }} />
  ))}</>;
}

// ─── 7. Snow / coriandoli lenti ─────────────────────────────────────────────
function Snow() {
  const flakes = Array.from({ length: 20 }, (_, i) => ({
    left: `${rand(0,100)}%`, color: pick(COLORS), size: rand(5,10),
    dur: `${rand(2.5,4)}s`, delay: `${rand(0,1.5)}s`,
    round: Math.random() > 0.5,
  }));
  return <>{flakes.map((f,i) => (
    <div key={i} style={{
      position:"absolute", left:f.left, top:-15,
      width:f.size, height:f.size, background:f.color,
      borderRadius: f.round ? "50%" : 2,
      animation:`cel-snow ${f.dur} ${f.delay} ease-in-out forwards`,
    }} />
  ))}</>;
}

// ─── 8. Laser burst ─────────────────────────────────────────────────────────
function LaserBurst() {
  return <>{Array.from({ length: 8 }, (_, i) => (
    <div key={i} style={{
      position:"absolute", left:"50%", top:"40%",
      width:"120%", height:3, marginLeft:"-60%",
      background:`linear-gradient(90deg, transparent, ${COLORS[i % 5]}, transparent)`,
      transformOrigin:"center center",
      transform:`rotate(${i * 45}deg)`,
      animation:`cel-laser 1s ${i * 0.08}s ease-out forwards`,
    }} />
  ))}</>;
}

const ANIMATIONS = [Confetti, Fireworks, ShootingStars, Bubbles, EmojiRain, PulseRings, Snow, LaserBurst];

export default function CelebrationEffect() {
  const [visible, setVisible] = useState(true);
  const [Anim] = useState(() => ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999, overflow:"hidden" }}>
        <Anim />
      </div>
      <style>{`
        @keyframes cel-confetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity:1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity:0; }
        }
        @keyframes cel-firework {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity:0; }
        }
        @keyframes cel-star {
          0%   { transform: translate(0,0); opacity:1; }
          100% { transform: translate(-200px, 200px); opacity:0; }
        }
        @keyframes cel-bubble {
          0%   { transform: translateY(0) scale(0); opacity:0.6; }
          100% { transform: translateY(-110vh) scale(1); opacity:0; }
        }
        @keyframes cel-emoji {
          0%   { transform: translateY(-50px) rotate(0deg); opacity:1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity:0.5; }
        }
        @keyframes cel-ring {
          0%   { transform: scale(0); opacity:0.8; border-width:4px; }
          100% { transform: scale(4); opacity:0; border-width:1px; }
        }
        @keyframes cel-snow {
          0%   { transform: translateY(-20px) translateX(0) rotate(0deg); opacity:1; }
          25%  { transform: translateY(25vh) translateX(20px) rotate(90deg); }
          50%  { transform: translateY(50vh) translateX(-20px) rotate(180deg); }
          75%  { transform: translateY(75vh) translateX(20px) rotate(270deg); }
          100% { transform: translateY(110vh) translateX(0) rotate(360deg); opacity:0; }
        }
        @keyframes cel-laser {
          0%   { transform: rotate(var(--r, 0deg)) scaleX(0); opacity:1; }
          50%  { transform: rotate(var(--r, 0deg)) scaleX(1); opacity:0.8; }
          100% { transform: rotate(var(--r, 0deg)) scaleX(1.5); opacity:0; }
        }
      `}</style>
    </>
  );
}
