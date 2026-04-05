"use client";
import { useRouter } from "next/navigation";

export default function LessonButton({ livello, unita, lezione, lessonId }) {
  const router = useRouter();

  const href = livello && unita && lezione !== undefined
    ? `/lesson/${livello}/${unita}/${lezione}`
    : `/lesson/${lessonId}`;

  return (
    <button
      onClick={() => router.push(href)}
      style={{
        background: "var(--primary)",
        color: "white",
        border: "none",
        borderRadius: "var(--r)",
        padding: "7px 16px",
        fontSize: 12,
        fontWeight: 900,
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.04em",
        boxShadow: "0 3px 0 var(--primary-d)",
        flexShrink: 0,
        textTransform: "uppercase",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      Inizia →
    </button>
  );
}
