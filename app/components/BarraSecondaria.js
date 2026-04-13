"use client";

/**
 * BarraSecondaria — zona 2 uniforme su tutte le schermate lezione.
 *
 * Struttura invariabile:
 *   - Altezza fissa ~48px (padding 8px 0)
 *   - Sinistra:
 *       bold verde   "DOMANDA {current}/{total}"  (o "VOCABOLO ...")
 *       italic grigio "QUESTION {current}/{total}" (o "WORD ...")
 *   - Destra:
 *       nome fase bilingue (RICONOSCIMENTO / Recognition)
 *       badge unità Esplorazione/Consolidamento
 *   - Sotto: barra progresso verde height:4px width:100%
 *
 * @param {number} current  — indice corrente (1-based, es: 3)
 * @param {number} total    — totale (es: 8)
 * @param {number} progress — percentuale 0-100 (calcolata dal chiamante)
 * @param {string} labelIT  — etichetta IT singolare ("Domanda" | "Vocabolo" | "Round")
 * @param {string} labelEN  — etichetta EN ("Question" | "Word" | "Round")
 * @param {object} fase     — { it: "Comprensione", en: "Comprehension" } (opzionale)
 * @param {object} unitType — { it, en, color, emoji } (opzionale)
 */
export default function BarraSecondaria({
  current,
  total,
  progress = 0,
  labelIT = "Domanda",
  labelEN = "Question",
  fase = null,
  unitType = null,
}) {
  return (
    <div
      className="barra-secondaria"
      style={{
        padding: "8px 0",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          minHeight: 40,
        }}
      >
        {/* Sinistra: counter */}
        <div style={{ lineHeight: 1.2, flexShrink: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: "var(--primary)",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {labelIT} {current}/{total}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontStyle: "italic",
            }}
          >
            {labelEN} {current}/{total}
          </div>
        </div>

        {/* Destra: fase + badge unità */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            minWidth: 0,
          }}
        >
          {fase && fase.it && (
            <div style={{ textAlign: "right", lineHeight: 1.15 }}>
              <div
                style={{
                  color: "var(--text2)",
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "none",
                  letterSpacing: "normal",
                }}
              >
                {fase.it}
              </div>
              {fase.en && (
                <div
                  style={{
                    color: "var(--text3)",
                    fontWeight: 600,
                    fontSize: 10,
                    fontStyle: "italic",
                    textTransform: "none",
                    letterSpacing: "normal",
                  }}
                >
                  {fase.en}
                </div>
              )}
            </div>
          )}
          {unitType && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: unitType.color,
                background: `${unitType.color}22`,
                border: `1px solid ${unitType.color}55`,
                borderRadius: 99,
                padding: "2px 8px",
                textAlign: "center",
                lineHeight: 1.15,
                textTransform: "none",
                letterSpacing: "normal",
                whiteSpace: "nowrap",
              }}
            >
              <div>
                {unitType.emoji} {unitType.it}
              </div>
              {unitType.en && (
                <div style={{ fontSize: 9, fontStyle: "italic", opacity: 0.85, fontWeight: 600 }}>
                  {unitType.en}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar: 4px */}
      <div
        style={{
          height: 4,
          background: "var(--border)",
          borderRadius: 99,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, progress))}%`,
            height: "100%",
            background: "var(--primary)",
            borderRadius: 99,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
