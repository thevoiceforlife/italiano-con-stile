"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TricoloreBar from "../components/TricoloreBar";
import { loadProgress } from "../components/saveProgress";

const UNITS = [
  {
    id: 1, livello: "A1",
    titleIT: "Il primo giorno a Napoli", titleEN: "First day in Naples",
    tipo: "esplorazione", icon: "🗺️", color: "#1CB0F6",
    lessons: [
      { id: 1, emoji: "⭐", titleIT: "Le Prime Parole", titleEN: "The First Words" },
      { id: 2, emoji: "📖", titleIT: "Il Primo Caffè", titleEN: "The First Coffee" },
      { id: 3, emoji: "💪", titleIT: "Mario dà le Indicazioni", titleEN: "Mario Gives Directions" },
      { id: 4, emoji: "🎧", titleIT: "La Cultura del Cibo", titleEN: "The Culture of Food" },
      { id: 5, emoji: "🎯", titleIT: "Speed Round", titleEN: "Speed Round" },
    ],
    boss: { titleIT: "Sfida la Nonna", titleEN: "Challenge the Grandma" },
  },
  {
    id: 2, livello: "A1",
    titleIT: "Fare conoscenza", titleEN: "Making friends",
    tipo: "consolidamento", icon: "🔁", color: "#C8A0E8",
    lessons: [
      { id: 1, emoji: "🔁", titleIT: "Di nuovo al bar", titleEN: "Back at the bar" },
      { id: 2, emoji: "✍️", titleIT: "Le prime presentazioni", titleEN: "First introductions" },
      { id: 3, emoji: "💪", titleIT: "La classe di Matilde", titleEN: "Matilde's class" },
      { id: 4, emoji: "🎭", titleIT: "La festa di Gino", titleEN: "Gino's party" },
      { id: 5, emoji: "🎯", titleIT: "Ripasso veloce", titleEN: "Quick recap" },
    ],
    boss: { titleIT: "La Nonna presenta", titleEN: "Nonna introduces you" },
  },
];

function ckey(unitId, lessonId) { return `u${unitId}-${lessonId}`; }

function isCompleted(completed, unitId, lessonId) {
  const key = ckey(unitId, lessonId);
  if (completed.includes(key)) return true;
  if (unitId === 1) return completed.includes(lessonId === "boss" ? "boss" : lessonId);
  return false;
}

function isUnitUnlocked(completed, unitId) {
  if (unitId === 1) return true;
  const prev = unitId - 1;
  return [1,2,3,4,5].every(l => isCompleted(completed, prev, l)) && isCompleted(completed, prev, "boss");
}

function isLessonUnlocked(completed, unitId, lessonId) {
  if (lessonId === 1) return isUnitUnlocked(completed, unitId);
  if (lessonId === "boss") return [1,2,3,4,5].every(l => isCompleted(completed, unitId, l));
  return isCompleted(completed, unitId, lessonId - 1);
}

function getStato(completed, unitId, lessonId, nextKey) {
  if (isCompleted(completed, unitId, lessonId)) return "done";
  if (ckey(unitId, lessonId) === nextKey) return "next";
  if (isLessonUnlocked(completed, unitId, lessonId)) return "unlocked";
  return "locked";
}

function LessonRow({ stato, titleIT, titleEN, emoji, isBoss, onClick }) {
  const icon = stato === "done" ? (isBoss ? "🏆" : "✅")
    : stato === "next" ? "▶️"
    : stato === "unlocked" ? (isBoss ? "👑" : emoji)
    : "🔒";
  const color = stato === "done" ? (isBoss ? "#E5B700" : "#58cc02")
    : stato === "next" ? "#FF9600"
    : "var(--text)";
  const canClick = stato !== "locked";

  return (
    <div
      onClick={() => canClick && onClick()}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px", borderRadius: "var(--r)", marginBottom: 4,
        background: stato === "next" ? "rgba(255,149,0,0.1)" : "var(--card)",
        border: stato === "next" ? "1.5px solid var(--special)" : stato === "done" ? `1px solid ${isBoss ? "rgba(229,183,0,0.3)" : "rgba(88,204,2,0.3)"}` : "1px solid var(--border)",
        opacity: stato === "locked" ? 0.4 : 1,
        cursor: canClick ? "pointer" : "not-allowed",
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: isBoss ? 900 : 700, color }}>
          {isBoss ? `Boss · ${titleIT}` : titleIT}
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>{titleEN}</div>
      </div>
      {stato === "next" && (
        <span style={{ fontSize: 12, color: "var(--special)", fontWeight: 700, flexShrink: 0 }}>CONTINUA →</span>
      )}
    </div>
  );
}

export default function PercorsoPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [openUnits, setOpenUnits] = useState({});

  useEffect(() => {
    const data = loadProgress();
    const comp = data?.completed ?? [];
    setCompleted(comp);

    // Apri l'unità con la prossima lezione
    let nextUnit = null;
    for (const u of UNITS) {
      if (!isUnitUnlocked(comp, u.id)) break;
      const allDone = u.lessons.every(l => isCompleted(comp, u.id, l.id)) && isCompleted(comp, u.id, "boss");
      if (!allDone) { nextUnit = u.id; break; }
    }
    if (nextUnit) setOpenUnits({ [nextUnit]: true });
    else if (UNITS.length > 0) setOpenUnits({ [UNITS[UNITS.length - 1].id]: true });

    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Trova prossima lezione globale
  let nextKey = null;
  for (const u of UNITS) {
    if (!isUnitUnlocked(completed, u.id)) break;
    for (const l of u.lessons) {
      if (!isCompleted(completed, u.id, l.id)) { nextKey = ckey(u.id, l.id); break; }
    }
    if (nextKey) break;
    if (!isCompleted(completed, u.id, "boss")) { nextKey = ckey(u.id, "boss"); break; }
  }

  const totalDone = UNITS.reduce((sum, u) => {
    return sum + u.lessons.filter(l => isCompleted(completed, u.id, l.id)).length + (isCompleted(completed, u.id, "boss") ? 1 : 0);
  }, 0);
  const totalLessons = UNITS.reduce((sum, u) => sum + u.lessons.length + 1, 0);

  function toggleUnit(id) {
    setOpenUnits(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      <div className="app-wrapper">
        <TricoloreBar />
        <div className="app-topbar">
          <button onClick={() => router.push("/dashboard")} className="lesson-topbar__home" aria-label="Dashboard">←</button>
          <div className="lesson-topbar__title">
            <div className="lesson-topbar__title-it">Il tuo percorso</div>
            <div className="lesson-topbar__title-en">Your learning path</div>
          </div>
          <div style={{ width: 40 }} />
        </div>
        <TricoloreBar />

        <div className="app-body">

          {/* Header livello A1 */}
          <div style={{
            background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 14,
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 28 }}>🎒</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "var(--text)" }}>A1 — Turista</div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>{totalDone}/{totalLessons} lezioni completate</div>
            </div>
          </div>

          {/* Unità */}
          {UNITS.map(u => {
            const unitUnlocked = isUnitUnlocked(completed, u.id);
            const doneCount = u.lessons.filter(l => isCompleted(completed, u.id, l.id)).length + (isCompleted(completed, u.id, "boss") ? 1 : 0);
            const totalCount = u.lessons.length + 1;
            const isOpen = !!openUnits[u.id];
            const allDone = doneCount === totalCount;

            return (
              <div key={u.id}>
                {/* Header unità — accordion toggle */}
                <div
                  onClick={() => unitUnlocked && toggleUnit(u.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 14px", borderRadius: 12,
                    background: allDone ? "rgba(88,204,2,0.06)" : unitUnlocked ? "var(--card)" : "var(--bg)",
                    border: `1.5px solid ${allDone ? "rgba(88,204,2,0.3)" : "var(--border)"}`,
                    cursor: unitUnlocked ? "pointer" : "default",
                    opacity: unitUnlocked ? 1 : 0.45,
                    marginBottom: isOpen ? 8 : 0,
                    transition: "margin-bottom 0.2s",
                  }}
                >
                  {/* Cerchio numero */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: allDone ? "#58cc02" : unitUnlocked ? u.color : "var(--border)",
                    fontSize: 15, color: "#fff", fontWeight: 900, flexShrink: 0,
                  }}>
                    {allDone ? "✓" : u.id}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "var(--text)", lineHeight: 1.3 }}>
                      Unità {u.id} · {u.titleIT}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>
                      Unit {u.id} · {u.titleEN}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
                        background: u.tipo === "esplorazione" ? "rgba(28,176,246,0.15)" : "rgba(200,160,232,0.15)",
                        color: u.tipo === "esplorazione" ? "#1CB0F6" : "#C8A0E8",
                      }}>
                        {u.tipo === "esplorazione" ? "🗺️ Esplorazione" : "🔁 Consolidamento"}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{doneCount}/{totalCount}</span>
                      {/* Mini progress */}
                      <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(doneCount / totalCount) * 100}%`, background: "#58cc02", borderRadius: 99, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  </div>

                  {/* Freccia accordion */}
                  {unitUnlocked && (
                    <span style={{ fontSize: 16, color: "var(--text3)", flexShrink: 0, transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                  )}
                  {!unitUnlocked && <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>}
                </div>

                {/* Lezioni — visibili solo se aperto */}
                {isOpen && (
                  <div style={{ paddingLeft: 20, borderLeft: `2px solid ${u.color}33`, marginLeft: 18, marginBottom: 8 }}>
                    {u.lessons.map(l => {
                      const stato = getStato(completed, u.id, l.id, nextKey);
                      return (
                        <LessonRow
                          key={l.id}
                          stato={stato}
                          titleIT={`L${l.id} · ${l.titleIT}`}
                          titleEN={l.titleEN}
                          emoji={l.emoji}
                          isBoss={false}
                          onClick={() => router.push(`/lesson/${u.livello}/${u.id}/${l.id}`)}
                        />
                      );
                    })}
                    {/* Boss */}
                    <LessonRow
                      stato={getStato(completed, u.id, "boss", nextKey)}
                      titleIT={u.boss.titleIT}
                      titleEN={u.boss.titleEN}
                      emoji="👑"
                      isBoss={true}
                      onClick={() => router.push(`/lesson/${u.livello}/${u.id}/boss`)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="app-bottom">
          <button onClick={() => router.push("/")} className="btn-primary btn-primary--secondary">🏠 Home</button>
        </div>
      </div>
    </>
  );
}
