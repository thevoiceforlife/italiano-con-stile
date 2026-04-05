'use client';
// app/components/games/MarioDialog.js
import { useState, useRef, useEffect } from 'react';

const MARIO_SYSTEM = `Sei Mario, barista romano di 50 anni — simpatico, chiassoso, genuino.
Sei nel tuo bar a Roma. Lo studente è un anglofono che impara l'italiano.
REGOLE:
- Rispondi SEMPRE e SOLO in italiano semplice (livello A2-B1).
- Frasi brevi, massimo 2-3 frasi per risposta.
- Se lo studente sbaglia la grammatica, correggilo UNA volta sola, gentilmente, poi vai avanti.
- Usa espressioni romane: "Ahò!", "Ammazza!", "Ma dai!", "Anvedi!"
- Rimani sempre nel personaggio del barista nel suo bar.
- Non tradurre mai in inglese.`;

const MAX_TURNS = 5;

export default function MarioDialog({ onClose, onXP }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ahò! Benvenuto nel mio bar! ☕ Cosa prendi stamattina?' },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [turns,   setTurns]   = useState(0);
  const [done,    setDone]    = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading || done) return;
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 150,
          system:     MARIO_SYSTEM,
          messages:   newMsgs,
        }),
      });
      const data  = await res.json();
      const reply = data.content?.[0]?.text ?? 'Scusa, non ho capito!';
      const newTurns = turns + 1;
      setTurns(newTurns);
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
      if (newTurns >= MAX_TURNS) { setDone(true); onXP?.(25); }
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Ahimè! Problemi tecnici — riprova tra poco! 😅',
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <Header onClose={onClose}>
          <img src="/images/mario.png" alt="Mario" style={avatarSm} />
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:'#FF9B42' }}>Dialogo con Mario</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Al bar romano · {Math.min(turns, MAX_TURNS)}/{MAX_TURNS} turni</div>
          </div>
        </Header>

        <ProgressBar value={turns} max={MAX_TURNS} color="#FF9B42" />

        <div style={chat}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start', marginBottom:8 }}>
              {m.role==='assistant' && <img src="/images/mario.png" alt="" style={bubbleAv} />}
              <div style={{ ...bubble, ...(m.role==='user' ? bubbleUser : bubbleAssistant('#FF9B42')) }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, marginBottom:8 }}>
              <img src="/images/mario.png" alt="" style={bubbleAv} />
              <div style={{ ...bubble, ...bubbleAssistant('#FF9B42') }}>
                <span style={{ display:'inline-flex', gap:3 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width:6,height:6,borderRadius:'50%',background:'var(--text3)',display:'inline-block',animation:`blink 1.2s ${i*0.2}s infinite` }} />)}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {done ? (
          <DoneBox xp={25} msg="Hai parlato italiano al bar con Mario!" onClose={onClose} />
        ) : (
          <div style={{ display:'flex', gap:8, padding:'0 14px', marginTop:8 }}>
            <input
              style={inputSt}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Scrivi in italiano..."
              disabled={loading}
              autoFocus
            />
            <button onClick={send} disabled={loading || !input.trim()}
              style={{ ...sendBtn, opacity: loading||!input.trim() ? 0.4 : 1 }}>➤</button>
          </div>
        )}
      </div>
      <style>{dotAnim}</style>
    </div>
  );
}

// ─── Shared sub-components (usati da tutti i game) ───────────────────────────
function Header({ children, onClose }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10,
      padding:'14px 14px 12px', borderBottom:'1px solid var(--border)' }}>
      {children}
      <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none',
        color:'var(--text3)', fontSize:20, cursor:'pointer', lineHeight:1, padding:4 }}>✕</button>
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  return (
    <div style={{ height:4, background:'var(--border)', margin:'0 14px 4px', borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', background:color, width:`${Math.min(value/max,1)*100}%`,
        borderRadius:99, transition:'width 0.4s' }} />
    </div>
  );
}

function DoneBox({ xp, msg, onClose }) {
  return (
    <div style={{ padding:'24px 16px', textAlign:'center' }}>
      <div style={{ fontSize:32, marginBottom:6 }}>🎉</div>
      <div style={{ fontWeight:900, fontSize:15, color:'var(--text)', marginBottom:4 }}>Bravissimo!</div>
      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:14 }}>{msg}</div>
      <div style={{ fontSize:22, fontWeight:900, color:'#E5B700', marginBottom:16 }}>+{xp} XP</div>
      <button onClick={onClose} style={btnPrimary}>Torna alla home</button>
    </div>
  );
}

// ─── Stili condivisi ─────────────────────────────────────────────────────────
export const overlay = { position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'flex-end',justifyContent:'center' };
export const modal   = { background:'var(--bg)',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:480,display:'flex',flexDirection:'column',paddingBottom:20,border:'2px solid #ffffff18',borderBottom:'none',maxHeight:'92vh' };
const avatarSm       = { width:42,height:42,borderRadius:'50%',border:'2.5px solid #FF9B42',objectFit:'cover',flexShrink:0 };
const chat           = { flex:1,overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',minHeight:180,maxHeight:'52vh' };
const bubbleAv       = { width:26,height:26,borderRadius:'50%',objectFit:'cover',flexShrink:0,alignSelf:'flex-end',marginRight:6,border:'2px solid #FF9B42' };
const bubble         = { padding:'10px 13px',fontSize:13,fontWeight:600,lineHeight:1.5,maxWidth:'76%' };
const bubbleUser     = { background:'var(--primary)',color:'white',borderRadius:'18px 18px 4px 18px' };
const bubbleAssistant = (color) => ({ background:'var(--card)',color:'var(--text)',borderRadius:'4px 18px 18px 18px',border:`1.5px solid ${color}44` });
const inputSt        = { flex:1,background:'var(--card)',border:'2px solid var(--border)',borderRadius:12,padding:'11px 13px',fontSize:14,color:'var(--text)',fontFamily:'inherit',outline:'none' };
const sendBtn        = { background:'#FF9B42',color:'white',border:'none',borderRadius:12,padding:'0 16px',fontSize:18,cursor:'pointer',fontWeight:900,flexShrink:0 };
const btnPrimary     = { background:'var(--primary)',color:'white',border:'none',borderRadius:'var(--r)',padding:'13px 32px',fontSize:14,fontWeight:900,cursor:'pointer',fontFamily:'inherit',textTransform:'uppercase',letterSpacing:'0.6px',boxShadow:'0 4px 0 var(--primary-d)' };
const dotAnim        = `@keyframes blink{0%,80%,100%{opacity:0}40%{opacity:1}}`;
