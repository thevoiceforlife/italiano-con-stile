"use client";

export default function BossIntroPopup({ unita, onStart }) {
  const nextUnit = parseInt(unita || 1) + 1;
  const sparkles = [
    { emoji: "✨", top: 8, left: 10, delay: "0s" },
    { emoji: "⭐", top: 5, right: 8, delay: "0.4s" },
    { emoji: "✨", bottom: 12, left: 20, delay: "0.8s" },
    { emoji: "⭐", bottom: 8, right: 16, delay: "1.2s" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: "0 16px",
    }}>
      <div style={{
        background: "var(--bg-el)", borderRadius: 20, padding: "28px 24px",
        maxWidth: 380, width: "100%", border: "2px solid #ffd700",
        animation: "popIn 0.5s ease-out forwards",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      }}>

        {/* Nonna con sparkle */}
        <div style={{ position: "relative", width: 90, height: 90 }}>
          <div style={{
            width: 90, height: 90, borderRadius: "50%", border: "4px solid #ffd700",
            overflow: "hidden", background: "var(--bg-el2)",
            animation: "float 2s ease-in-out infinite",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img
              src="/images/vittoria.png" alt="Nonna Vittoria"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML += '<span style="font-size:44px">👵</span>'; }}
            />
          </div>
          {sparkles.map((s, i) => (
            <span key={i} style={{
              position: "absolute", fontSize: 16, pointerEvents: "none",
              top: s.top, left: s.left, right: s.right, bottom: s.bottom,
              animation: `sparkle 1.6s ${s.delay} ease-in-out infinite`,
            }}>{s.emoji}</span>
          ))}
        </div>

        {/* Badge */}
        <div style={{
          background: "#ffd700", color: "#1a1a1a", borderRadius: 20,
          padding: "3px 10px", fontSize: 11, fontWeight: 900,
          textTransform: "uppercase", letterSpacing: "1px",
        }}>
          Boss finale · Final boss
        </div>

        {/* Titolo */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#ffd700" }}>Sfida la Nonna!</div>
          <div style={{ fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Challenge the Grandma!</div>
        </div>

        {/* Descrizione */}
        <div style={{ textAlign: "center", lineHeight: 1.5 }}>
          <div style={{ fontSize: 14, color: "#e5e5e5" }}>
            La Nonna ti mette alla prova su tutto quello che hai imparato. Dimostra di essere pronto per Napoli!
          </div>
          <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            Nonna tests you on everything you've learned. Prove you're ready for Naples!
          </div>
        </div>

        {/* 3 Premi */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          {[
            { emoji: "🎫", it: "Crediti viaggio", en: "Travel credits", val: "+30 cr", delay: "0.3s" },
            { emoji: "🍦", it: "Gelato — energia massima", en: "Gelato — full energy boost", val: "+20%", delay: "0.5s" },
            { emoji: "🗺️", it: `Sblocchi Unità ${nextUnit}`, en: `Unlocks Unit ${nextUnit}`, val: "🔓", delay: "0.7s" },
          ].map((p, i) => (
            <div key={i} style={{
              background: "var(--bg-card)", borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
              animation: `slideUp 0.4s ${p.delay} ease-out both`,
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{p.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e5e5" }}>{p.it}</div>
                <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(255,255,255,0.35)" }}>{p.en}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#ffd700", flexShrink: 0 }}>{p.val}</div>
            </div>
          ))}
        </div>

        {/* Avviso */}
        <div style={{
          background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.3)",
          borderRadius: 10, padding: "10px 14px", width: "100%", textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ff9600" }}>
            ⚠️ 10 domande · nessun aiuto · solo tu e lei
          </div>
          <div style={{ fontSize: 11, fontStyle: "italic", color: "rgba(255,149,0,0.5)", marginTop: 2 }}>
            10 questions · no hints · just you and her
          </div>
        </div>

        {/* Pulsante */}
        <button onClick={onStart} className="btn-cta" style={{
          height: 64, background: "#ffd700", color: "#1a1a1a",
          borderBottom: "4px solid #b8920b",
        }}>
          <span className="btn-it">🥊 Inizia la sfida!</span>
          <span className="btn-en">Start the challenge!</span>
        </button>
      </div>
    </div>
  );
}
