'use client';
import { useState, useRef, useEffect } from 'react';

// ─── Configurazione tipi grammaticali ────────────────────────────────────────
export const TIPI = {
  sostantivo:   { color: '#FF9B42', bg: '#FF9B4222', border: '#FF9B4266', icon: '📦', it: 'sostantivo',    en: 'noun'        },
  verbo:        { color: '#58CC02', bg: '#58CC0222', border: '#58CC0266', icon: '⚡', it: 'verbo',         en: 'verb'        },
  aggettivo:    { color: '#1CB0F6', bg: '#1CB0F622', border: '#1CB0F666', icon: '🎨', it: 'aggettivo',     en: 'adjective'   },
  articolo:     { color: '#C8A0E8', bg: '#C8A0E822', border: '#C8A0E866', icon: '🔤', it: 'articolo',      en: 'article'     },
  preposizione: { color: '#FF6B9D', bg: '#FF6B9D22', border: '#FF6B9D66', icon: '🔗', it: 'preposizione',  en: 'preposition' },
  avverbio:     { color: '#AFAFAF', bg: '#AFAFAF22', border: '#AFAFAF66', icon: '✨', it: 'avverbio',      en: 'adverb'      },
  falso_amico:  { color: '#FF4B4B', bg: '#FF4B4B22', border: '#FF4B4B66', icon: '⚠️', it: 'falso amico',   en: 'false friend'},
  culturale:    { color: '#E5B700', bg: '#E5B70022', border: '#E5B70066', icon: '🇮🇹', it: 'parola culturale', en: 'cultural word'},
};

// ─── Popup ────────────────────────────────────────────────────────────────────
function Popup({ ann, onClose }) {
  const cfg = TIPI[ann.tipo] || TIPI.culturale;
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.45)',
        }}
      />
      {/* Popup */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 201,
        background: '#2C3E4A',
        border: `2px solid ${cfg.border}`,
        borderRadius: 16,
        padding: '16px 18px',
        width: 'calc(100% - 32px)',
        maxWidth: 400,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${cfg.color}22`,
        animation: 'popupUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{cfg.icon}</span>
              <span style={{
                fontSize: 20, fontWeight: 900, color: cfg.color,
                fontFamily: 'inherit',
              }}>
                {ann.parola}
              </span>
            </div>
            <div style={{
              display: 'inline-block',
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 6, padding: '2px 8px',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: cfg.color }}>
                {ann.categoria_it}
              </span>
              <span style={{ fontSize: 14, color: '#777E8B', margin: '0 4px' }}>·</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#AFAFAF', fontStyle: 'italic' }}>
                {ann.categoria_en}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#777E8B',
              fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4,
            }}
          >✕</button>
        </div>

        {/* Traduzione */}
        <div style={{
          background: '#23313D', borderRadius: 8,
          padding: '8px 12px', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#E5E5E5' }}>{ann.parola}</span>
          <span style={{ color: '#38444D', fontSize: 16 }}>→</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#AFAFAF', fontStyle: 'italic' }}>{ann.en}</span>
        </div>

        {/* Perché — bilingue */}
        {ann.perche && (
          <div style={{
            borderLeft: `3px solid ${cfg.color}`,
            borderRadius: '0 8px 8px 0',
            padding: '8px 11px',
            background: cfg.bg,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: cfg.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💡 Perché / Why
            </div>
            <div style={{ fontSize: 15, color: '#E5E5E5', lineHeight: 1.6, fontWeight: 600 }}>
              {ann.perche}
            </div>
            {ann.perche_en && (
              <div style={{ fontSize: 14, color: '#AFAFAF', lineHeight: 1.5, fontStyle: 'italic', marginTop: 4 }}>
                {ann.perche_en}
              </div>
            )}
          </div>
        )}

        {/* Esempi extra */}
        {ann.esempi && ann.esempi.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {ann.esempi.map((es, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 0',
                borderTop: i > 0 ? '1px solid #38444D' : 'none',
              }}>
                <span style={{ fontSize: 15, color: es.ok ? '#58CC02' : '#FF4B4B', flexShrink: 0 }}>
                  {es.ok ? '✅' : '❌'}
                </span>
                <span style={{ fontSize: 15, color: '#E5E5E5', fontWeight: 700 }}>{es.it}</span>
                <span style={{ fontSize: 14, color: '#AFAFAF', fontStyle: 'italic' }}>{es.en}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes popupUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}

// ─── Parola annotata — il componente da usare nelle lezioni ──────────────────
export function ParolaAnnotata({ parola, ann }) {
  const [open, setOpen] = useState(false);
  const cfg = TIPI[ann?.tipo] || TIPI.culturale;

  if (!ann) return <span>{parola}</span>;

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        style={{
          color: cfg.color,
          borderBottom: `2px dashed ${cfg.color}`,
          paddingBottom: 1,
          cursor: 'pointer',
          fontWeight: 800,
          transition: 'opacity 0.15s',
          display: 'inline',
        }}
        title={`${ann.categoria_it} / ${ann.categoria_en}`}
      >
        {parola}
      </span>
      {open && <Popup ann={ann} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── Frase annotata — renderizza una stringa con token annotati ──────────────
// Uso: <FraseAnnotata testo="Vorrei un caffè" annotazioni={[...]} />
// annotazioni: array di oggetti { parola, tipo, ... }
export function FraseAnnotata({ testo, annotazioni = [] }) {
  if (!annotazioni || annotazioni.length === 0) {
    return <span>{testo}</span>;
  }

  // Costruisce mappa parola → annotazione
  const annMap = {};
  annotazioni.forEach(a => { annMap[a.parola] = a; });

  // Tokenizza il testo preservando spazi e punteggiatura
  const tokens = testo.split(/(\s+|[.,!?;:'"«»—])/);

  return (
    <span>
      {tokens.map((token, i) => {
        const ann = annMap[token];
        if (ann) {
          return <ParolaAnnotata key={i} parola={token} ann={ann} />;
        }
        return <span key={i}>{token}</span>;
      })}
    </span>
  );
}

// ─── Legenda colori — da mostrare nella home o nell'onboarding ───────────────
export function LegendaAnnotazioni() {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      background: '#2C3E4A', borderRadius: 12,
      padding: '10px 14px',
    }}>
      {Object.entries(TIPI).map(([key, cfg]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 12, height: 3, borderRadius: 99,
            background: cfg.color,
            borderBottom: `2px dashed ${cfg.color}`,
          }} />
          <span style={{ fontSize: 13, color: '#AFAFAF', fontWeight: 600 }}>
            {cfg.it} / {cfg.en}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ParolaAnnotata;
