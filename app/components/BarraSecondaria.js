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
    <div className="barra-secondaria" style={{ padding: "10px 0 6px", flexShrink: 0 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, minHeight: 28,
      }}>
        {/* Sinistra: counter */}
        <div style={{ lineHeight: 1.2, flexShrink: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "var(--green)",
            letterSpacing: "0.3px",
          }}>
            {labelIT.toUpperCase()} {current}/{total}
          </div>
          <div style={{
            fontSize: 10, color: "var(--text3)", fontStyle: "italic",
          }}>
            {labelEN} {current}/{total}
          </div>
        </div>

        {/* Destra: fase badge + unitType */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
        }}>
          {fase && fase.it && (
            <div style={{
              fontSize: 10, fontWeight: 700,
              padding: "3px 10px", borderRadius: 20,
              background: "rgba(28,176,246,0.15)",
              color: "var(--blue)",
              border: "1px solid rgba(28,176,246,0.25)",
              textTransform: "none", letterSpacing: "normal",
              whiteSpace: "nowrap",
            }}>
              {fase.it}
            </div>
          )}
          {unitType && (
            <div style={{
              fontSize: 10, fontWeight: 800,
              color: unitType.color,
              background: `${unitType.color}22`,
              border: `1px solid ${unitType.color}55`,
              borderRadius: 20,
              padding: "3px 8px",
              textTransform: "none", letterSpacing: "normal",
              whiteSpace: "nowrap",
            }}>
              {unitType.emoji} {unitType.it}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar: 6px */}
      <div style={{
        height: 6, background: "var(--border-soft)",
        borderRadius: 3, overflow: "hidden", marginTop: 8,
      }}>
        <div style={{
          width: `${Math.max(0, Math.min(100, progress))}%`,
          height: "100%", background: "var(--green)", borderRadius: 3,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}
