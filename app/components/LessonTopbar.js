"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadProgress } from "./saveProgress";

export default function LessonTopbar({ unita, lezione, confirmMsg }) {
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [audioOn, setAudioOn] = useState(true);

  useEffect(() => {
    const d = loadProgress();
    if (d && typeof d.credits === "number") setCredits(d.credits);
    setAudioOn(localStorage.getItem("ics_audio") !== "false");

    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const isBoss    = lezione === "boss";
  const titleIT   = isBoss ? "Sfida la Nonna" : `Unità ${unita} · Lezione ${lezione}`;
  const titleEN   = isBoss ? "Challenge the Grandma" : `Unit ${unita} · Lesson ${lezione}`;
  const titleMobile = isBoss ? "🍦 Boss" : `U${unita} · L${lezione}`;

  const defaultConfirm =
    "Tornare alla home?\n\nIl progresso di questa lezione non verrà salvato.\n\n" +
    "Go back home?\nYour progress on this lesson won't be saved.";

  function handleHome() {
    if (window.confirm(confirmMsg || defaultConfirm)) {
      window.speechSynthesis?.cancel();
      router.push("/");
    }
  }

  function toggleAudio() {
    const nuovo = !audioOn;
    setAudioOn(nuovo);
    localStorage.setItem("ics_audio", String(nuovo));
    if (!nuovo) window.speechSynthesis?.cancel();
  }

  const iconBtnStyle = {
    width: 32, height: 32, borderRadius: "50%",
    background: "var(--bg-el)", border: "1px solid var(--border-soft)",
    fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    fontFamily: "inherit",
  };
  return (
    <div className="app-topbar" style={{
      background: "var(--bg-deep)",
      borderBottom: "1px solid var(--border-soft)",
    }}>
      <button onClick={handleHome} aria-label="Home" style={iconBtnStyle}>🏠</button>
      <div className="lesson-topbar__title">
        {isMobile ? (
          <div className="lesson-topbar__title-mobile">{titleMobile}</div>
        ) : (
          <>
            <div className="lesson-topbar__title-it">{titleIT}</div>
            <div className="lesson-topbar__title-en">{titleEN}</div>
          </>
        )}
      </div>
      <button onClick={toggleAudio} title={audioOn ? "Audio on" : "Audio off"} style={{
        ...iconBtnStyle,
        color: audioOn ? "var(--accent)" : "var(--text3)",
      }}>
        {audioOn ? "🔊" : "🔕"}
      </button>
    </div>
  );
}
