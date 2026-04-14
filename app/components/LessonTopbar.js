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

  return (
    <div className="app-topbar">
      <button className="lesson-topbar__home" onClick={handleHome} aria-label="Home">
        🏠
      </button>
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
        background: "none", border: "1px solid var(--border)", borderRadius: 8,
        padding: "4px 8px", fontSize: 16, cursor: "pointer",
        color: audioOn ? "var(--special)" : "var(--text3)", flexShrink: 0,
      }}>
        {audioOn ? "🔊" : "🔕"}
      </button>
    </div>
  );
}
