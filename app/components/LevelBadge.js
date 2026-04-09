export function getLevelData(level) {
  const levels = {
    A1: { id:"A1", it:"Il Turista",     itLabel:"Il Turista",     en:"The Tourist",    enLabel:"The Tourist",    emoji:"🧳", fase:"Scintilla",  nickPrefix:"Turista",     color:"#58cc02", bg:"rgba(88,204,2,0.12)",    momento:"Il viaggio inizia",          frase:"Ogni esperto è stato prima un principiante.",    fraseEN:"Every expert was once a beginner." },
    A2: { id:"A2", it:"Il Viaggiatore", itLabel:"Il Viaggiatore", en:"The Traveller",  enLabel:"The Traveller",  emoji:"🛵", fase:"Incontro",   nickPrefix:"Viaggiatore", color:"#1CB0F6", bg:"rgba(28,176,246,0.12)",  momento:"Il mondo si apre",           frase:"Viaggiare è vivere due volte.",                  fraseEN:"To travel is to live twice." },
    B1: { id:"B1", it:"L'Esploratore",  itLabel:"L'Esploratore",  en:"The Explorer",   enLabel:"The Explorer",   emoji:"🗺️", fase:"Avventura", nickPrefix:"Esploratore", color:"#FF9B42", bg:"rgba(255,155,66,0.12)",  momento:"L'avventura continua",       frase:"Non si finisce mai di imparare.",                fraseEN:"You never stop learning." },
    B2: { id:"B2", it:"L'Appassionato", itLabel:"L'Appassionato", en:"The Passionate", enLabel:"The Passionate", emoji:"❤️", fase:"Complicità", nickPrefix:"Appassionato",color:"#E91E8C", bg:"rgba(233,30,140,0.12)",  momento:"La lingua è tua",            frase:"La passione muove le montagne.",                 fraseEN:"Passion moves mountains." },
    C1: { id:"C1", it:"L'Esperto",      itLabel:"L'Esperto",      en:"The Expert",     enLabel:"The Expert",     emoji:"🎭", fase:"Passione",   nickPrefix:"Esperto",     color:"#C8A0E8", bg:"rgba(200,160,232,0.12)", momento:"Padronanza vera",            frase:"La perfezione è nei dettagli.",                  fraseEN:"Perfection is in the details." },
    C2: { id:"C2", it:"Il Maestro",     itLabel:"Il Maestro",     en:"The Master",     enLabel:"The Master",     emoji:"👑", fase:"Essenza",    nickPrefix:"Maestro",     color:"#E5B700", bg:"rgba(229,183,0,0.12)",   momento:"Sei italiano nell'anima",    frase:"Il maestro impara sempre dai suoi studenti.",    fraseEN:"The master always learns from students." },
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
