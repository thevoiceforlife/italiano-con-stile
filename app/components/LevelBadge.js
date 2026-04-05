export function getLevelData(level) {
  const levels = {
    A1: { it: "Il Turista",     en: "The Tourist",    emoji: "🧳", fase: "Scintilla" },
    A2: { it: "Il Viaggiatore", en: "The Traveller",  emoji: "🛵", fase: "Incontro" },
    B1: { it: "L'Esploratore",  en: "The Explorer",   emoji: "🗺️", fase: "Avventura" },
    B2: { it: "L'Appassionato", en: "The Passionate", emoji: "❤️", fase: "Complicità" },
    C1: { it: "L'Esperto",      en: "The Expert",     emoji: "🎭", fase: "Passione" },
    C2: { it: "Il Maestro",     en: "The Master",     emoji: "👑", fase: "Essenza" },
  };
  return levels[level] || levels["A1"];
}

export default function LevelBadge({ level }) {
  const data = getLevelData(level);
  return (
    <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text2)" }}>
      {data.emoji} {level} · {data.it} / {data.en}
    </span>
  );
}
