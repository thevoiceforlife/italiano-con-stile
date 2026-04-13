"use client";
import { useState } from "react";

/**
 * PillolaPerche — pillola culturale "Perché?"
 *
 * Mostra un bottone 💡 con la domanda.
 * Al click si espande con titolo, corpo, esempio e "Capito!".
 *
 * @param {object} pillola — { domanda_it, domanda_en, titolo_it, titolo_en, corpo_it, corpo_en, esempio_it, esempio_en, icon }
 */
export default function PillolaPerche({ pillola }) {
  const [open, setOpen] = useState(false);
  if (!pillola) return null;

  const icon = pillola.icon || "💡";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%", background: "rgba(229,183,0,0.08)",
          border: "1.5px solid rgba(229,183,0,0.3)", borderRadius: 12,
          padding: "12px 16px", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 10,
          textTransform: "none", letterSpacing: "normal",
          animation: "pulse-ok 2s ease-in-out infinite",
        }}
      >
        <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#E5B700", lineHeight: 1.3 }}>
            {pillola.domanda_it}
          </div>
          <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(229,183,0,0.5)", marginTop: 2 }}>
            {pillola.domanda_en}
          </div>
        </div>
        <span style={{ fontSize: 16, color: "#E5B700", flexShrink: 0 }}>›</span>
      </button>
    );
  }

  return (
    <div style={{
      width: "100%", background: "rgba(229,183,0,0.06)",
      border: "1.5px solid rgba(229,183,0,0.25)", borderRadius: 12,
      padding: "16px", animation: "fade-in 0.3s ease-out",
    }}>
      {/* Titolo */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#E5B700", lineHeight: 1.3 }}>
          {icon} {pillola.titolo_it}
        </div>
        <div style={{ fontSize: 13, fontStyle: "italic", color: "rgba(229,183,0,0.5)", marginTop: 2 }}>
          {pillola.titolo_en}
        </div>
      </div>

      {/* Corpo */}
      <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, marginBottom: 12 }}>
        {pillola.corpo_it}
      </div>
      <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--text3)", lineHeight: 1.5, marginBottom: 12 }}>
        {pillola.corpo_en}
      </div>

      {/* Esempio */}
      {pillola.esempio_it && (
        <div style={{
          background: "rgba(229,183,0,0.08)", borderRadius: 8,
          padding: "10px 12px", marginBottom: 14,
          border: "1px solid rgba(229,183,0,0.15)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#E5B700" }}>{pillola.esempio_it}</div>
          {pillola.esempio_en && (
            <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(229,183,0,0.5)", marginTop: 3 }}>{pillola.esempio_en}</div>
          )}
        </div>
      )}

      {/* Capito! */}
      <button
        onClick={() => setOpen(false)}
        style={{
          width: "100%", padding: "10px", background: "rgba(229,183,0,0.12)",
          border: "1.5px solid rgba(229,183,0,0.3)", borderRadius: 10,
          color: "#E5B700", fontSize: 14, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        <span>Capito!</span>
        <span style={{ fontSize: 12, fontStyle: "italic", opacity: 0.6 }}>Got it!</span>
      </button>
    </div>
  );
}
