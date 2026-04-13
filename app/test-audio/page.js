"use client"
export default function TestAudio() {
  function speak(text, lang="it-IT") {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  return (
    <div style={{padding:40, display:"flex",
                 flexDirection:"column", gap:16}}>
      <h1>Test Audio</h1>
      <button onClick={() => speak("Ciao, come stai?")}>
        🔊 Parla italiano
      </button>
      <button onClick={() => speak("Hello, how are you?", "en-US")}>
        🔊 Speak English
      </button>
      <button onClick={() => speak("Grazie mille!")}>
        🔊 Grazie
      </button>
    </div>
  )
}
