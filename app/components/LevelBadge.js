export function getLevelData(level) {
  const levels = {
    A1: { it: "Il Turista",     en: "The Tourist",    emoji: "🧳", fase: "Scintilla",  nickPrefix: "Turista" },
    A2: { it: "Il Viaggiatore", en: "The Traveller",  emoji: "🛵", fase: "Incontro",   nickPrefix: "Viaggiatore" },
    B1: { it: "L'Esploratore",  en: "The Explorer",   emoji: "🗺️", fase: "Avventura", nickPrefix: "Esploratore" },
    B2: { it: "L'Appassionato", en: "The Passionate", emoji: "❤️", fase: "Complicità",nickPrefix: "Appassionato" },
    C1: { it: "L'Esperto",      en: "The Expert",     emoji: "🎭", fase: "Passione",  nickPrefix: "Esperto" },
    C2: { it: "Il Maestro",     en: "The Master",     emoji: "👑", fase: "Essenza",   nickPrefix: "Maestro" },
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
