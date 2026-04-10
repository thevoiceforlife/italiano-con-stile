"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLevelData } from "../components/LevelBadge";

export default function BibliotecaPage() {
  const router = useRouter();
  const [tab, setTab] = useState("grammatica");
  const [index, setIndex] = useState(null);

  useEffect(() => {
    fetch("/data/biblioteca/index.json")
      .then(r => r.json())
      .then(setIndex)
      .catch(() => {});
  }, []);

  const schede = index ? index[tab] : [];

  // Raggruppa per sottocategoria
  const grouped = {};
  (schede || []).filter(s => !s.hidden).forEach(s => {
    if (!grouped[s.sottocategoria]) grouped[s.sottocategoria] = [];
    grouped[s.sottocategoria].push(s);
  });

  return (
    <main className="page-wide" style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: "var(--card)", borderBottom: "2px solid var(--border)", padding: "14px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: "6px 12px", fontSize: 15, fontWeight: 800, color: "var(--text2)", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
            ← Dashboard
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)" }}>📚 Biblioteca</div>
            <div style={{ fontSize: 14, color: "var(--text3)" }}>Finally someone explains why</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: 4 }}>
          {["grammatica", "vocabolario"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px 0", borderRadius: "calc(var(--r) - 2px)", border: "none",
              background: tab === t ? "var(--primary)" : "transparent",
              color: tab === t ? "white" : "var(--text3)",
              fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "inherit",
              textTransform: "capitalize", transition: "all 0.2s",
              boxShadow: tab === t ? "0 2px 0 var(--primary-d)" : "none",
            }}>
              {t === "grammatica" ? "🔤 Grammatica" : "🗣️ Vocabolario"}
            </button>
          ))}
        </div>

        {/* Schede per sottocategoria */}
        {!index && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>☕</div>
            <div style={{ fontSize: 16, color: "var(--text3)" }}>Caricamento... / Loading...</div>
          </div>
        )}

        {Object.entries(grouped).map(([sotto, schede]) => (
          <div key={sotto} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingLeft: 2 }}>
              {sotto}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {schede.map(s => {
                const lv = getLevelData(s.livello);
                const locked = s.comingSoon;
                return (
                  <div
                    key={s.id}
                    onClick={() => !locked && router.push(`/biblioteca/${s.id}`)}
                    style={{
                      background: "var(--card)", border: "1.5px solid var(--border)",
                      borderRadius: "var(--r)", padding: "14px 16px",
                      cursor: locked ? "default" : "pointer",
                      opacity: locked ? 0.45 : 1,
                      display: "flex", alignItems: "center", gap: 14,
                      transition: "border 0.15s",
                      borderLeft: locked ? "1.5px solid var(--border)" : `3px solid ${lv.color}`,
                    }}
                  >
                    <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{s.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: "var(--text)" }}>{s.titolo.it}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: lv.color, background: lv.bg, padding: "2px 6px", borderRadius: 99, flexShrink: 0 }}>{s.livello}</span>
                      </div>
                      <div style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.4 }}>{s.titolo.en}</div>
                      {!locked && <div style={{ fontSize: 14, color: "var(--text2)", fontStyle: "italic", marginTop: 4, lineHeight: 1.4 }}>"{s.teaser.it}"</div>}
                      {locked && <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>🔒 In arrivo / Coming soon</div>}
                    </div>
                    {!locked && <span style={{ fontSize: 18, color: "var(--text3)", flexShrink: 0 }}>›</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
