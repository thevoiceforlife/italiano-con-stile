"use client";
import { useRouter } from "next/navigation";

export default function LessonButton({ lessonId }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/lesson/${lessonId}`)}
      style={{
        background: "var(--primary)",
        color: "white",
        padding: "10px 18px",
        borderRadius: "var(--r)",
        fontSize: "13px",
        fontWeight: 900,
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        border: "none",
        boxShadow: "0 4px 0 var(--primary-d)",
        cursor: "pointer",
      }}
    >
      VAI → / GO →
    </button>
  );
}
