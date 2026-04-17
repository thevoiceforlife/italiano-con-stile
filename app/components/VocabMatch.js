"use client";
/**
 * VocabMatch — Round 1 (IT→EN) + Round 2 (EN→IT).
 *
 * Design semplice senza audio:
 *  - Round 1: emoji + parola IT grande → 3 opzioni EN
 *  - Round 2: emoji + parola EN grande → 3 opzioni IT
 *  - Risposta immediata, verde/rosso, passa alla prossima
 */

import { useState, useEffect, useRef } from "react";
import LessonTopbar from "./LessonTopbar";
import BarraSecondaria from "./BarraSecondaria";
import TricoloreBar from "./TricoloreBar";
import PersonaggioBubble from "./PersonaggioBubble";
import { pronounce } from "./pronounce";

function capitalizza(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const FALLBACK_POOL = {
  en: ["Thank you", "Please", "You are welcome", "Excuse me", "Sorry", "See you later"],
  it: ["Grazie", "Prego", "Per favore", "Scusa", "Certo", "A presto"],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normKey(s) {
  return String(s || "").toLowerCase().trim();
}

/**
 * Genera 3 opzioni (1 corretta + 2 distrattori) senza duplicati.
 * Fallback al pool fisso se non ci sono abbastanza distrattori unici.
 */
function generaOpzioni(paroleVocab, wordCorretta, campo) {
  const correctVal = wordCorretta[campo];
  const correctKey = normKey(correctVal);

  // Candidati dai vocab della lezione — dedup case-insensitive, escludi la corretta
  const altri = paroleVocab
    .filter(v => v.id !== wordCorretta.id)
    .map(v => v[campo])
    .filter(Boolean);

  const seen = new Set([correctKey]);
  const distractors = [];
  for (const val of shuffle(altri)) {
    const k = normKey(val);
    if (!seen.has(k)) { seen.add(k); distractors.push(val); }
    if (distractors.length >= 2) break;
  }

  // Se mancano distrattori — attingi dal pool fallback
  const pool = FALLBACK_POOL[campo] || [];
  for (const cand of shuffle(pool)) {
    if (distractors.length >= 2) break;
    const k = normKey(cand);
    if (!seen.has(k)) { seen.add(k); distractors.push(cand); }
  }

  // Risposta corretta + 2 distrattori, mescolati
  const opzioni = shuffle([correctVal, ...distractors]);

  // Verifica finale dedup case-insensitive
  const uniqueKeys = new Set(opzioni.map(normKey));
  if (uniqueKeys.size < opzioni.length) {
    // Caso limite: non dovrebbe mai accadere grazie ai check sopra
    return shuffle([correctVal, pool[0] || "Grazie", pool[1] || "Prego"]);
  }

  return opzioni.map(o => ({ text: o, correct: normKey(o) === correctKey }));
}

export default function VocabMatch({ lesson, unitType, unita, lezione, onComplete }) {
  const vocab = lesson.vocab;
  const character = "mario";
  const totalWords = vocab.length;

  const [round, setRound] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [esito, setEsito] = useState(null); // null | "ok" | "err"
  const [order1] = useState(() => shuffle(vocab.map((_, i) => i)));
  const [order2, setOrder2] = useState(() => shuffle(vocab.map((_, i) => i)));
  const [options, setOptions] = useState([]);
  const [bubble, setBubble] = useState({ it: "Abbina la parola!", en: "Match the word!", status: "" });

  const order = round === 1 ? order1 : order2;
  const currentWord = vocab[order[currentIdx]];

  useEffect(() => {
    if (!currentWord) return;
    const field = round === 1 ? "en" : "it";
    setOptions(generaOpzioni(vocab, currentWord, field));
    setSelected(null);
    setConfirmed(false);
    setEsito(null);
  }, [currentIdx, round]);

  function handleSelect(idx) {
    if (confirmed) return;
    setSelected(idx);
    setConfirmed(true);
    const isOk = options[idx]?.correct;
    if (isOk) {
      setBubble({ it: "Bravo!", en: "Well done!", status: "ok" });
      if (round === 2) pronounce(currentWord.audio_text || currentWord.it, "it-IT");
      setEsito("ok");
    } else {
      setBubble({ it: "Riprova!", en: "Try again!", status: "err" });
      setEsito("err");
    }
  }

  function handleRetry() {
    setSelected(null);
    setConfirmed(false);
    setEsito(null);
    setBubble({
      it: round === 1 ? "Abbina la parola!" : "Ora al contrario!",
      en: round === 1 ? "Match the word!" : "Now reverse!",
      status: "",
    });
  }

  function handleNext() {
    if (currentIdx + 1 >= totalWords) {
      if (round === 1) {
        setRound(2);
        setCurrentIdx(0);
        setOrder2(shuffle(vocab.map((_, i) => i)));
        setBubble({ it: "Ora al contrario!", en: "Now reverse!", status: "" });
      } else {
        onComplete && onComplete();
      }
    } else {
      setCurrentIdx(c => c + 1);
      setBubble({ it: round === 1 ? "Abbina la parola!" : "Ora al contrario!", en: round === 1 ? "Match the word!" : "Now reverse!", status: "" });
    }
  }

  if (!currentWord) return null;

  const progress = Math.round((((round === 1 ? 0 : totalWords) + currentIdx + 1) / (totalWords * 2)) * 100);
  const promptText = round === 1 ? currentWord.it : currentWord.en;

  return (
    <>
      <div className="app-wrapper">
        <TricoloreBar />
        <LessonTopbar unita={unita} lezione={lezione} />
        <TricoloreBar />
        <BarraSecondaria
          current={(round === 1 ? currentIdx : totalWords + currentIdx) + 1}
          total={totalWords * 2}
          progress={progress}
          labelIT="Parola"
          labelEN="Word"
          unitType={unitType}
        />

        <div className="app-body">
          <PersonaggioBubble
            character={character}
            textIT={bubble.it}
            textEN={bubble.en}
            feedback={bubble.status || null}
            pulseUntilClick={false}
          />

          {/* Prompt card centrale */}
          <div style={{
            background: "var(--bg-card)", border: "1.5px solid var(--border-soft)",
            borderRadius: "var(--r-lg)", padding: "24px 20px", textAlign: "center",
            marginBottom: 16,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {currentWord.icon_svg
              ? <img src={currentWord.icon_svg} alt={currentWord.it} style={{ width: 52, height: 52, objectFit: "contain", marginBottom: 8 }} />
              : <span style={{ fontSize: 52, lineHeight: 1, marginBottom: 8 }}>{currentWord.emoji}</span>
            }

            {round === 1 ? (
              <>
                <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)" }}>{currentWord.it}</div>
                <button
                  onClick={() => pronounce(currentWord.audio_text || currentWord.it, "it-IT")}
                  style={{
                    background: "none", border: "1px solid var(--border-accent)",
                    borderRadius: "var(--r-sm)",
                    padding: "4px 14px", fontSize: 13, color: "var(--accent)",
                    marginTop: 8,
                    cursor: "pointer", fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
                  }}
                >🔊 Ascolta · Listen</button>
              </>
            ) : (
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)" }}>{currentWord.en}</div>
            )}
          </div>

          {/* Options — grid 3 colonne */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {options.map((opt, i) => {
              const isSel = selected === i;
              const ok = confirmed && opt.correct;
              const err = confirmed && isSel && !opt.correct;
              const wrongAnswered = confirmed && !options[selected]?.correct;
              const showAudio = round === 2 && opt.correct && wrongAnswered;
              const bg     = ok ? "rgba(88,204,2,0.08)" : err ? "rgba(255,75,75,0.06)" : "var(--bg-el)";
              const border = ok ? "var(--green)"        : err ? "var(--red)"           : "var(--border-soft)";
              const col    = ok ? "var(--green)"        : err ? "var(--red)"           : "var(--text)";
              return (
                <div key={`${round}-${currentIdx}-${i}`} onClick={() => handleSelect(i)} style={{
                  background: bg, border: `1.5px solid ${border}`,
                  borderRadius: "var(--r)", padding: "12px 8px",
                  textAlign: "center", minHeight: 56,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: confirmed ? "default" : "pointer",
                  fontFamily: "inherit", textTransform: "none", letterSpacing: "normal",
                  fontSize: 14, fontWeight: 700, color: col,
                  position: "relative",
                  animation: err ? "shake 0.3s ease" : "none",
                  transition: "all 0.15s",
                }}>
                  <span>{capitalizza(opt.text)}</span>
                  {showAudio && (
                    <button
                      onClick={(e) => { e.stopPropagation(); pronounce(currentWord.audio_text || currentWord.it, "it-IT"); }}
                      style={{
                        position: "absolute", top: 4, right: 4,
                        background: "none", border: "1px solid var(--green)", borderRadius: 6,
                        padding: "2px 6px", fontSize: 11, color: "var(--green)",
                        cursor: "pointer", fontFamily: "inherit",
                        textTransform: "none", letterSpacing: "normal",
                      }}
                    >🔊</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="app-bottom">
          {!confirmed ? (
            <button disabled className="btn-cta btn-primary" style={{
              background: "var(--card)", color: "var(--muted)",
              borderBottom: "4px solid var(--border)", opacity: 0.6,
            }}>
              <span className="btn-it">{round === 1 ? "Scegli la traduzione" : "Scegli la parola"}</span>
              <span className="btn-en">{round === 1 ? "Pick the translation" : "Pick the word"}</span>
            </button>
          ) : esito === "ok" ? (
            <button onClick={handleNext} className="btn-cta btn-primary" style={{
              background: "var(--green)", color: "#fff",
              borderBottom: "4px solid var(--green-dark)",
            }}>
              <span className="btn-it">AVANTI →</span>
              <span className="btn-en">Next</span>
            </button>
          ) : (
            <button onClick={handleRetry} className="btn-cta btn-primary" style={{
              background: "var(--accent)", color: "#fff",
              borderBottom: "4px solid var(--accent-dark)",
            }}>
              <span className="btn-it">RIPROVA</span>
              <span className="btn-en">Try again</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
