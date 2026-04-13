'use client';
import { useState } from 'react';
import { completaOnboarding } from './saveProgress';
import TricoloreBar from './TricoloreBar';

// ─── Placement test — 5 domande A1→B2 ────────────────────────────────────────
const PLACEMENT_QUESTIONS = [
  {
    q: { it: 'Come si dice "hello" in italiano?', en: 'How do you say "hello" in Italian?' },
    options: ['Ciao', 'Grazie', 'Prego', 'Arrivederci'],
    correct: 0, level: 'A1',
  },
  {
    q: { it: 'Qual è la risposta giusta?', en: 'Which is the correct article?' },
    context: { it: '___ caffè è buono.', en: 'The coffee is good.' },
    options: ['Un', 'Una', 'Il', 'La'],
    correct: 0, level: 'A1+',
  },
  {
    q: { it: 'Qual è il passato di "mangio"?', en: 'What is the past tense of "I eat"?' },
    options: ['Ho mangiato', 'Mangiavo', 'Mangiai', 'Mangerò'],
    correct: 0, level: 'A2',
  },
  {
    q: { it: 'Quale frase usa il congiuntivo correttamente?', en: 'Which sentence uses the subjunctive correctly?' },
    options: [
      'Penso che venga domani',
      'Penso che viene domani',
      'Penso che è venuto domani',
      'Penso che veniva domani',
    ],
    correct: 0, level: 'B1',
  },
  {
    q: { it: 'Cosa significa "magari" in inglese?', en: 'What does "magari" mean in English?' },
    options: ['Maybe', 'I wish / If only', 'Perhaps', 'Actually'],
    correct: 1, level: 'B2',
  },
];

function getLevel(score) {
  if (score >= 5) return { id: 'appassionato', emoji: '❤️', label: 'Appassionato', labelEN: 'Passionate', sub: 'B2' };
  if (score >= 4) return { id: 'esploratore',  emoji: '🗺',  label: 'Esploratore',  labelEN: 'Explorer',  sub: 'B1' };
  if (score >= 2) return { id: 'viaggiatore',  emoji: '🛵',  label: 'Viaggiatore',  labelEN: 'Traveller', sub: 'A2' };
  return              { id: 'turista',          emoji: '🧳',  label: 'Turista',      labelEN: 'Tourist',   sub: 'A1' };
}

// ─── Onboarding screens ───────────────────────────────────────────────────────
const SCREENS = [
  {
    emoji: '🍽',
    title:   { it: 'Il Menu del Giorno', en: 'The Daily Menu' },
    desc:    { it: "Ogni giorno completa 5 lezioni + Sfida la Nonna per caricare l'energia al massimo. Caffè → Cornetto → Pranzo → Aperitivo → Cena → Gelato.",
               en: "Every day complete 5 lessons + Challenge Nonna to fill your energy. Coffee → Croissant → Lunch → Aperitif → Dinner → Gelato." },
    color: '#FF9B42',
  },
  {
    emoji: '⚡',
    title:   { it: "L'Energia", en: 'Energy' },
    desc:    { it: "Parti dal 25% ogni mattina. Più studi, più ricarichi. Raggiungi il 100% e oltre con il gelato della Nonna! Il giorno senza studiare, l'energia scende.",
               en: "You start at 25% every morning. The more you study, the more you recharge. Reach 100%+ with Nonna's gelato! Skip a day and energy drops." },
    color: '#58CC02',
  },
  {
    emoji: '🇮🇹',
    title:   { it: 'I Viaggi', en: 'Travel' },
    desc:    { it: "Accumula crediti rispondendo correttamente e compra biglietti per visitare l'Italia. Mete dal 25%, Città dal 60%, Capitali dal 90%. Napoli è sempre aperta.",
               en: "Earn credits by answering correctly and buy tickets to visit Italy. Destinations from 25%, Cities from 60%, Capitals from 90%. Naples is always open." },
    color: '#1CB0F6',
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function OnboardingModal({ onComplete }) {
  const [phase,      setPhase]      = useState('start');      // 'start' | 'test' | 'screens' | 'result'
  const [testIdx,    setTestIdx]    = useState(0);
  const [testScore,  setTestScore]  = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [confirmed,  setConfirmed]  = useState(false);
  const [screenIdx,  setScreenIdx]  = useState(0);
  const [level,      setLevel]      = useState(null);

  function finishOnboarding(livello) {
    completaOnboarding(livello);
    onComplete(livello);
  }

  function handleStart(hasBasi) {
    if (hasBasi) setPhase('test');
    else         setPhase('screens');
  }

  function handleTestAnswer() {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    const correct = selected === PLACEMENT_QUESTIONS[testIdx].correct;
    if (correct) setTestScore(s => s + 1);
  }

  function handleTestNext() {
    const next = testIdx + 1;
    if (next >= PLACEMENT_QUESTIONS.length) {
      const finalScore = testScore + (selected === PLACEMENT_QUESTIONS[testIdx].correct ? 1 : 0);
      setLevel(getLevel(finalScore));
      setPhase('screens');
    } else {
      setTestIdx(next);
      setSelected(null);
      setConfirmed(false);
    }
  }

  function handleScreenNext() {
    if (screenIdx + 1 < SCREENS.length) setScreenIdx(s => s + 1);
    else setPhase('result');
  }

  const q = PLACEMENT_QUESTIONS[testIdx];
  const isCorrect = selected !== null && selected === q?.correct;
  const sc = SCREENS[screenIdx];
  const lvResult = level ?? { id: 'turista', emoji: '🧳', label: 'Turista', labelEN: 'Tourist', sub: 'A1' };

  // Overlay fullscreen opaco, NON blur, riempie tutto sopra la home
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: '#111b27',
    zIndex: 2000,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  // ═══ START ══════════════════════════════════════════════════════════════════
  if (phase === 'start') {
    return (
      <div style={overlayStyle}>
        <div className="app-wrapper">
          <TricoloreBar />
          <div className="app-topbar" style={{ justifyContent: 'center' }}>
            <div className="lesson-topbar__title">
              <div className="lesson-topbar__title-it">Italiano con Stile</div>
              <div className="lesson-topbar__title-en">Onboarding</div>
            </div>
          </div>
          <TricoloreBar />
          <div className="app-body" style={{ textAlign: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '24px 0' }}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>☕</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#FF9B42', marginBottom: 6 }}>
                Benvenuto al Bar di Mario!
              </div>
              <div style={{ fontSize: 15, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 24 }}>
                Welcome to Mario's Bar!
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                ☕ Sei già stato in Italia?
              </div>
              <div style={{ fontSize: 14, color: 'var(--text3)', fontStyle: 'italic' }}>
                Have you studied Italian before?
              </div>
            </div>
          </div>
          <div className="app-bottom app-bottom--feedback">
            <button
              onClick={() => handleStart(false)}
              className="btn-primary"
            >
              🧳 Parto da zero · I'm a beginner
            </button>
            <button
              onClick={() => handleStart(true)}
              className="btn-primary btn-primary--secondary"
            >
              🛵 Ho già qualche base · I have some Italian
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ PLACEMENT TEST ═════════════════════════════════════════════════════════
  if (phase === 'test') {
    return (
      <div style={overlayStyle}>
        <div className="app-wrapper">
          <TricoloreBar />
          <div className="app-topbar" style={{ justifyContent: 'center' }}>
            <div className="lesson-topbar__title">
              <div className="lesson-topbar__title-it">Placement test</div>
              <div className="lesson-topbar__title-en">{testIdx + 1}/{PLACEMENT_QUESTIONS.length}</div>
            </div>
          </div>
          <TricoloreBar />

          {/* Mini progress sub-bar */}
          <div style={{ padding: '8px 0', flexShrink: 0 }}>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${((testIdx + 1) / PLACEMENT_QUESTIONS.length) * 100}%`,
                background: 'var(--primary)',
                borderRadius: 99,
                transition: 'width 0.4s',
              }} />
            </div>
          </div>

          <div className="app-body">
            {q.context && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 18, fontWeight: 800, color: 'var(--text)', textAlign: 'center' }}>
                {q.context.it}
              </div>
            )}
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', lineHeight: 1.35 }}>{q.q.it}</div>
              <div style={{ fontSize: 14, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.35, marginTop: 4 }}>{q.q.en}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, i) => {
                let bg = 'var(--opt-bg)', border = 'var(--opt-border)', color = 'var(--opt-text)';
                if (confirmed) {
                  if (i === q.correct) { bg = 'var(--ok-bar)'; border = 'var(--ok-text)'; color = 'var(--ok-text)'; }
                  else if (i === selected) { bg = 'var(--err-bar)'; border = 'var(--err-text)'; color = 'var(--err-text)'; }
                } else if (selected === i) { bg = 'var(--opt-sel-bg)'; border = 'var(--opt-sel-b)'; color = 'var(--opt-sel-text)'; }
                return (
                  <button key={i} onClick={() => !confirmed && setSelected(i)} className="opt-card" style={{
                    background: bg, borderColor: border, color,
                    textAlign: 'left',
                    cursor: confirmed ? 'default' : 'pointer',
                  }}>
                    <div className="opt-card__it" style={{ color }}>{opt}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="app-bottom">
            {!confirmed ? (
              <button
                onClick={handleTestAnswer}
                disabled={selected === null}
                className="btn-primary"
              >
                Controlla · Check
              </button>
            ) : (
              <button
                onClick={handleTestNext}
                className={isCorrect ? "btn-primary" : "btn-primary btn-primary--err"}
              >
                {testIdx + 1 < PLACEMENT_QUESTIONS.length ? 'Avanti · Next →' : 'Vediamo il risultato · See result →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══ SCREENS (Menu / Energia / Viaggi) ══════════════════════════════════════
  if (phase === 'screens') {
    return (
      <div style={overlayStyle}>
        <div className="app-wrapper">
          <TricoloreBar />
          <div className="app-topbar" style={{ justifyContent: 'center' }}>
            <div className="lesson-topbar__title">
              <div className="lesson-topbar__title-it">{sc.title.it}</div>
              <div className="lesson-topbar__title-en">{sc.title.en}</div>
            </div>
          </div>
          <TricoloreBar />

          <div className="app-body" style={{ textAlign: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 88 }}>{sc.emoji}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: sc.color, lineHeight: 1.3 }}>{sc.title.it}</div>
                <div style={{ fontSize: 15, color: 'var(--text3)', fontStyle: 'italic', marginTop: 2 }}>{sc.title.en}</div>
              </div>
              <div style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 480 }}>
                {sc.desc.it}
                <div style={{ color: 'var(--text3)', fontStyle: 'italic', marginTop: 6 }}>{sc.desc.en}</div>
              </div>
              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                {SCREENS.map((_, i) => (
                  <div key={i} style={{
                    width: i === screenIdx ? 24 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: i === screenIdx ? sc.color : 'var(--border)',
                    transition: 'all 0.3s',
                  }} />
                ))}
              </div>
            </div>
          </div>

          <div className="app-bottom">
            <button
              onClick={handleScreenNext}
              className="btn-primary"
              style={{ background: sc.color, boxShadow: `0 4px 0 ${sc.color}80` }}
            >
              {screenIdx + 1 < SCREENS.length ? 'Avanti · Next →' : "Iniziamo · Let's go →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ RESULT ═════════════════════════════════════════════════════════════════
  return (
    <div style={overlayStyle}>
      <div className="app-wrapper">
        <TricoloreBar />
        <div className="app-topbar" style={{ justifyContent: 'center' }}>
          <div className="lesson-topbar__title">
            <div className="lesson-topbar__title-it">Il tuo livello</div>
            <div className="lesson-topbar__title-en">Your level</div>
          </div>
        </div>
        <TricoloreBar />

        <div className="app-body" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 88 }}>{lvResult.emoji}</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Il tuo livello / Your level
              </div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', lineHeight: 1.2 }}>
                {lvResult.label}
              </div>
              <div style={{ fontSize: 16, color: 'var(--text3)', fontStyle: 'italic', marginTop: 2 }}>
                {lvResult.labelEN}
              </div>
            </div>
            <div style={{ fontSize: 15, color: 'var(--text2)' }}>
              {lvResult.sub} · Mario ti aspetta al bar!
              <div style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Mario is waiting for you at the bar!</div>
            </div>
          </div>
        </div>

        <div className="app-bottom">
          <button
            onClick={() => finishOnboarding(lvResult.id)}
            className="btn-primary"
          >
            ☕ Andiamo · Let's go →
          </button>
        </div>
      </div>
    </div>
  );
}
