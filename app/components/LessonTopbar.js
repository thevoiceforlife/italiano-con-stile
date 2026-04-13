"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadProgress } from "./saveProgress";

/**
 * LessonTopbar — SOLO la riga centrale 720 della topbar lezione.
 *
 * NON contiene i TricoloreBar: vanno renderizzati dal chiamante come
 * siblings diretti (fratelli del LessonTopbar), così da essere figli di
 * un container full-width senza wrapper intermedi.
 *
 * Struttura render:
 *   <div class="lesson-topbar-outer">        (full-width, bg)
 *     <div class="lesson-topbar-inner">      (max-width: 720 centrato)
 *       home | title | credits
 *     </div>
 *   </div>
 *
 * Su mobile (<768px) mostra "U1·L1" compatto, altrimenti bilingue.
 *
 * @param {string|number} unita
 * @param {string|number} lezione
 * @param {string}        confirmMsg
 */
export default function LessonTopbar({ unita, lezione, confirmMsg }) {
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const d = loadProgress();
    if (d && typeof d.credits === "number") setCredits(d.credits);

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
      <div className="lesson-topbar__credits" title={`${credits} crediti`}>
        🎫 {credits}
      </div>
    </div>
  );
}
