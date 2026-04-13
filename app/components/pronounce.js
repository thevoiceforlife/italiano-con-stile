/**
 * pronounce — utility TTS Safari-safe con selezione voce italiana.
 *
 * Safari e iOS bloccano Web Speech API se speak() viene chiamato
 * senza essere in corrispondenza di un evento utente diretto.
 * Workaround:
 *  1) Chiamala SEMPRE da un event handler di click (no useEffect auto).
 *  2) Wrappa speak() in setTimeout 50ms per dare tempo al sistema.
 *
 * Uso:
 *   import { pronounce } from "./pronounce";
 *   <button onClick={() => pronounce("Ciao")}>🔊</button>
 *   <button onClick={() => pronounce("Hello", "en-US")}>🔊</button>
 */

// Precarica le voci al primo import
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

export function cleanForTTS(text) {
  return String(text)
    .replace(/(\d+)-(\d+)/g, '$1 $2')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\//g, ' ')
    .replace(/·/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function pronounce(text, lang = "it-IT") {
  if (!text || typeof window === "undefined") return;
  if (!window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(cleanForTTS(text));
    u.lang = lang;
    u.rate = 0.85;
    u.pitch = 1;
    u.volume = 1;

    // Forza voce nella lingua richiesta se disponibile
    const voci = window.speechSynthesis.getVoices();
    const prefix = lang.split("-")[0]; // "it" da "it-IT"
    const voce = voci.find(v => v.lang === lang)
              || voci.find(v => v.lang.replace("_", "-") === lang)
              || voci.find(v => v.lang.startsWith(prefix));
    if (voce) u.voice = voce;

    setTimeout(() => {
      try { window.speechSynthesis.speak(u); } catch (e) {}
    }, 50);

    return u;
  } catch (e) {}
}

export default pronounce;
