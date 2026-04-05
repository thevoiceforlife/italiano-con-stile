"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Dati ─────────────────────────────────────────────────────────────────────

const TEMPI = [
  {
    id: "cong-presente",
    num: "01",
    modo: "Congiuntivo",
    titolo_it: "Congiuntivo Presente",
    titolo_en: "Present Subjunctive",
    desc_it: "Opinione, dubbio, emozione, volontà al presente.",
    desc_en: "Opinion, doubt, emotion, will in the present.",
    chips: ["Pensare che", "Volere che", "È importante che", "Sperare che"],
    formazione: {
      it: "-are → -i/-i/-i/-iamo/-iate/-ino · -ere/-ire → -a/-a/-a/-iamo/-iate/-ano",
      en: "-are → -i/-i/-i/-iamo/-iate/-ino · -ere/-ire → -a/-a/-a/-iamo/-iate/-ano"
    },
    tabella: {
      cols: ["Pronome", "PARLARE", "VEDERE", "ESSERE", "AVERE"],
      rows: [
        ["io", "parli", "veda", "sia", "abbia"],
        ["tu", "parli", "veda", "sia", "abbia"],
        ["lui/lei", "parli", "veda", "sia", "abbia"],
        ["noi", "parliamo", "vediamo", "siamo", "abbiamo"],
        ["voi", "parliate", "vediate", "siate", "abbiate"],
        ["loro", "parlino", "vedano", "siano", "abbiano"],
      ]
    },
    regola: {
      it: "Verbo principale al PRESENTE → congiuntivo PRESENTE nella subordinata. Anche benché, affinché, purché, prima che → congiuntivo presente.",
      en: "Main verb in PRESENT → PRESENT subjunctive in subordinate. Also benché, affinché, purché, prima che → present subjunctive."
    },
    esempi: [
      { it: "Penso che Mario sia stanco.", en: "I think Mario is tired.", ctx: "→ Opinione soggettiva" },
      { it: "Voglio che tu venga.", en: "I want you to come.", ctx: "→ Volontà + soggetto diverso" },
      { it: "È importante che tu studi.", en: "It's important that you study.", ctx: "→ Espressione impersonale" },
      { it: "Benché faccia freddo, esco.", en: "Although it's cold, I'm going out.", ctx: "→ Concessione" },
    ],
    errori: [
      { sbagliato: "Penso che Mario è stanco.", corretto: "Penso che Mario sia stanco.", perche: "'Penso che' → congiuntivo, non indicativo." },
      { sbagliato: "Se venga Mario…", corretto: "Se viene Mario…", perche: "SE ipotetico non prende MAI il congiuntivo presente." },
    ]
  },
  {
    id: "cong-passato",
    num: "02",
    modo: "Congiuntivo",
    titolo_it: "Congiuntivo Passato",
    titolo_en: "Past Subjunctive",
    desc_it: "Principale al presente + azione già avvenuta.",
    desc_en: "Present main clause + already completed action.",
    chips: ["Emozione presente + fatto passato", "Giudizio retrospettivo"],
    formazione: {
      it: "Congiuntivo presente di avere/essere + participio passato",
      en: "Present subjunctive of avere/essere + past participle"
    },
    tabella: {
      cols: ["Pronome", "PARTIRE (essere)", "MANGIARE (avere)"],
      rows: [
        ["io", "sia partito/a", "abbia mangiato"],
        ["tu", "sia partito/a", "abbia mangiato"],
        ["lui/lei", "sia partito/a", "abbia mangiato"],
        ["noi", "siamo partiti/e", "abbiamo mangiato"],
        ["voi", "siate partiti/e", "abbiate mangiato"],
        ["loro", "siano partiti/e", "abbiano mangiato"],
      ]
    },
    regola: {
      it: "Principale al PRESENTE + evento già completato = congiuntivo PASSATO. 'Sono felice che tu sia venuto.'",
      en: "Present main clause + already completed event = PAST subjunctive. 'Sono felice che tu sia venuto.'"
    },
    esempi: [
      { it: "Sono felice che tu sia venuto.", en: "I'm glad you came.", ctx: "→ Emozione presente, fatto passato" },
      { it: "È strano che non abbia chiamato.", en: "It's strange he hasn't called.", ctx: "→ Giudizio su azione passata" },
      { it: "Sebbene sia partito tardi, è arrivato in orario.", en: "Although he left late, he arrived on time.", ctx: "→ Sebbene + passato" },
      { it: "Credo che abbiano sbagliato.", en: "I think they made a mistake.", ctx: "→ Opinione su evento passato" },
    ],
    errori: [
      { sbagliato: "Sono felice che hai vinto.", corretto: "Sono felice che tu abbia vinto.", perche: "Dopo emozioni al presente + evento passato → congiuntivo passato." },
      { sbagliato: "Se sia venuto…", corretto: "Se è venuto…", perche: "SE ipotetico non prende MAI il congiuntivo passato." },
    ]
  },
  {
    id: "cong-imperfetto",
    num: "03",
    modo: "Congiuntivo",
    titolo_it: "Congiuntivo Imperfetto",
    titolo_en: "Imperfect Subjunctive",
    desc_it: "Principale al passato + contemporaneità; ipotesi irreali al presente.",
    desc_en: "Past main clause + simultaneous action; unreal present hypotheses.",
    chips: ["Voleva che", "Se (Tipo II)", "Desideri passati", "Come se"],
    formazione: {
      it: "-are → -assi/-assi/-asse/-assimo/-aste/-assero · -ere/-ire → -essi/-esse/-essimo/-este/-essero · Essere → fossi/fosse/fossimo/foste/fossero · Avere → avessi/avesse/avessimo/aveste/avessero",
      en: "-are → -assi/-assi/-asse/-assimo/-aste/-assero · -ere/-ire → -essi/-esse/-essimo/-este/-essero · Essere → fossi/fosse/fossimo/foste/fossero · Avere → avessi/avesse/avessimo/aveste/avessero"
    },
    tabella: {
      cols: ["Pronome", "ESSERE", "AVERE", "ANDARE (-are)"],
      rows: [
        ["io", "fossi", "avessi", "andassi"],
        ["tu", "fossi", "avessi", "andassi"],
        ["lui/lei", "fosse", "avesse", "andasse"],
        ["noi", "fossimo", "avessimo", "andassimo"],
        ["voi", "foste", "aveste", "andaste"],
        ["loro", "fossero", "avessero", "andassero"],
      ]
    },
    regola: {
      it: "1) Principale al PASSATO + 'che' → cong. imperfetto. 2) SE ipotetico Tipo II (irreale presente) → cong. imperfetto + condizionale presente. 3) Come se → sempre cong. imperfetto (mai condizionale!).",
      en: "1) Past main clause + 'che' → imperfect subjunctive. 2) SE Type II (unreal present) → imperfect subjunctive + present conditional. 3) Come se → always imperfect subjunctive (never conditional!)."
    },
    esempi: [
      { it: "Volevo che tu venissi con me.", en: "I wanted you to come with me.", ctx: "→ Desiderio nel passato" },
      { it: "Se fossi libero, verrei.", en: "If I were free, I'd come.", ctx: "→ Tipo II: ipotesi irreale presente" },
      { it: "Parla come se fosse italiano.", en: "He speaks as if he were Italian.", ctx: "→ Come se + imperfetto" },
      { it: "Vorrei che tu studiassi di più.", en: "I'd like you to study more.", ctx: "→ Vorrei che + imperfetto" },
    ],
    errori: [
      { sbagliato: "Se verrei… / Se sarei…", corretto: "Se venissi… / Se fossi…", perche: "MAI il condizionale dopo SE ipotetico. Sempre congiuntivo imperfetto." },
      { sbagliato: "Come se sarebbe italiano.", corretto: "Come se fosse italiano.", perche: "'Come se' → sempre congiuntivo imperfetto. Mai condizionale." },
    ]
  },
  {
    id: "cong-trapassato",
    num: "04",
    modo: "Congiuntivo",
    titolo_it: "Congiuntivo Trapassato",
    titolo_en: "Pluperfect Subjunctive",
    desc_it: "Anteriorità rispetto a principale al passato; ipotesi passate impossibili.",
    desc_en: "Prior to past main clause; impossible past hypotheses.",
    chips: ["Rimpianti/Regrets", "Se (Tipo III)", "Anteriore al passato", "Come se (passato)"],
    formazione: {
      it: "Congiuntivo imperfetto di avere/essere + participio passato · avessi/fossi + participio",
      en: "Imperfect subjunctive of avere/essere + past participle · avessi/fossi + participle"
    },
    tabella: {
      cols: ["Pronome", "DORMIRE (avere)", "USCIRE (essere)"],
      rows: [
        ["io", "avessi dormito", "fossi uscito/a"],
        ["tu", "avessi dormito", "fossi uscito/a"],
        ["lui/lei", "avesse dormito", "fosse uscito/a"],
        ["noi", "avessimo dormito", "fossimo usciti/e"],
        ["voi", "aveste dormito", "foste usciti/e"],
        ["loro", "avessero dormito", "fossero usciti/e"],
      ]
    },
    regola: {
      it: "1) Principale al PASSATO + evento anteriore → trapassato. 2) SE Tipo III (irreale passato) → cong. trapassato + condizionale passato. ⚠️ Trapassato ≠ condizionale passato: avessi mangiato (cong.) vs avrei mangiato (cond.).",
      en: "1) Past main clause + prior event → pluperfect. 2) SE Type III (impossible past) → pluperfect subjunctive + past conditional. ⚠️ Pluperfect ≠ past conditional: avessi mangiato (subj.) vs avrei mangiato (cond.)."
    },
    esempi: [
      { it: "Se avessi saputo, ti avrei chiamato.", en: "If I had known, I would have called you.", ctx: "→ Tipo III: rimpianto impossibile" },
      { it: "Non pensavo che fosse già partito.", en: "I didn't think he had already left.", ctx: "→ Anteriorità nel passato" },
      { it: "Parla come se avesse visto un fantasma.", en: "He speaks as if he'd seen a ghost.", ctx: "→ Come se + trapassato (azione anteriore)" },
      { it: "Era impossibile che avesse mentito.", en: "It was impossible he had lied.", ctx: "→ Giudizio passato su azione anteriore" },
    ],
    errori: [
      { sbagliato: "Se avrei saputo…", corretto: "Se avessi saputo…", perche: "MAI condizionale dopo SE ipotetico. Tipo III → cong. trapassato." },
      { sbagliato: "avrei mangiato (dopo se)", corretto: "avessi mangiato (dopo se)", perche: "avessi = congiuntivo trapassato ✅ · avrei = condizionale passato ❌ dopo SE." },
    ]
  },
  {
    id: "cond-presente",
    num: "05",
    modo: "Condizionale",
    titolo_it: "Condizionale Presente",
    titolo_en: "Present Conditional ('would')",
    desc_it: "Cortesia, desiderio, ipotesi, consiglio, notizia non verificata.",
    desc_en: "Politeness, desire, hypothesis, advice, unverified news.",
    chips: ["Vorrei", "Dovresti", "Al posto tuo…", "Notizie non confermate"],
    formazione: {
      it: "Radice futuro + -ei/-esti/-ebbe/-emmo/-este/-ebbero. Irregolari: essere→sarei · avere→avrei · andare→andrei · fare→farei · venire→verrei · potere→potrei · dovere→dovrei · volere→vorrei",
      en: "Future stem + -ei/-esti/-ebbe/-emmo/-este/-ebbero. Irregulars: essere→sarei · avere→avrei · andare→andrei · fare→farei · venire→verrei · potere→potrei · dovere→dovrei · volere→vorrei"
    },
    tabella: {
      cols: ["Pronome", "PARLARE", "VEDERE", "VENIRE (irr.)"],
      rows: [
        ["io", "parlerei", "vedrei", "verrei"],
        ["tu", "parleresti", "vedresti", "verresti"],
        ["lui/lei", "parlerebbe", "vedrebbe", "verrebbe"],
        ["noi", "parleremmo", "vedremmo", "verremmo"],
        ["voi", "parlereste", "vedreste", "verreste"],
        ["loro", "parlerebbero", "vedrebbero", "verrebbero"],
      ]
    },
    regola: {
      it: "1) Cortesia: 'Vorrei un caffè' — mai 'voglio'. 2) Consiglio: 'Dovresti studiare'. 3) SE whether (interrogativa indiretta): 'Non so se verrei' — corretto! Solo SE ipotetico (= if) non prende il condizionale.",
      en: "1) Politeness: 'Vorrei un caffè' — never 'voglio'. 2) Advice: 'Dovresti studiare'. 3) SE whether (indirect question): 'Non so se verrei' — correct! Only hypothetical SE (= if) never takes the conditional."
    },
    esempi: [
      { it: "Vorrei un caffè, per favore.", en: "I'd like a coffee, please.", ctx: "→ Cortesia al bar" },
      { it: "Dovresti studiare di più.", en: "You should study more.", ctx: "→ Consiglio gentile" },
      { it: "Al posto tuo, non lo farei.", en: "In your place, I wouldn't do it.", ctx: "→ Ipotesi implicita" },
      { it: "Non so se verrei — era lontano.", en: "I don't know whether I'd come.", ctx: "→ SE whether ✅ (= whether)" },
    ],
    errori: [
      { sbagliato: "Voglio un caffè.", corretto: "Vorrei un caffè.", perche: "'Voglio' suona brusco al bar. Il condizionale è la forma cortese standard." },
      { sbagliato: "Se verrei… (ipotetico)", corretto: "Se venissi…", perche: "SE ipotetico (= if) + condizionale = sempre sbagliato. Test: funziona con 'whether'? No → errore." },
    ]
  },
  {
    id: "cond-passato",
    num: "06",
    modo: "Condizionale",
    titolo_it: "Condizionale Passato",
    titolo_en: "Past Conditional ('would have')",
    desc_it: "Rimpianto, futuro nel passato, ipotesi passata impossibile.",
    desc_en: "Regret, future-in-the-past, impossible past hypothesis.",
    chips: ["Avrei dovuto", "Avrei potuto", "Avrei voluto", "Discorso indiretto"],
    formazione: {
      it: "Condizionale presente di avere/essere + participio passato · avrei/sarei + participio",
      en: "Present conditional of avere/essere + past participle · avrei/sarei + participle"
    },
    tabella: {
      cols: ["Pronome", "VENIRE (essere)", "FARE (avere)"],
      rows: [
        ["io", "sarei venuto/a", "avrei fatto"],
        ["tu", "saresti venuto/a", "avresti fatto"],
        ["lui/lei", "sarebbe venuto/a", "avrebbe fatto"],
        ["noi", "saremmo venuti/e", "avremmo fatto"],
        ["voi", "sareste venuti/e", "avreste fatto"],
        ["loro", "sarebbero venuti/e", "avrebbero fatto"],
      ]
    },
    regola: {
      it: "I tre rimpianti: AVREI DOVUTO (should have) · AVREI POTUTO (could have) · AVREI VOLUTO (would have liked). Discorso indiretto: 'Verrò' → 'ha detto che sarebbe venuto'. SE whether: 'Non so se sarei venuto' ✅.",
      en: "The three regrets: AVREI DOVUTO (should have) · AVREI POTUTO (could have) · AVREI VOLUTO (would have liked). Indirect speech: 'Verrò' → 'ha detto che sarebbe venuto'. SE whether: 'Non so se sarei venuto' ✅."
    },
    esempi: [
      { it: "Avrei dovuto chiamarti — mi dispiace.", en: "I should have called you — I'm sorry.", ctx: "→ Rimpianto: should have" },
      { it: "Avrei potuto dirtelo prima.", en: "I could have told you earlier.", ctx: "→ Rimpianto: could have" },
      { it: "Mario ha detto che sarebbe venuto.", en: "Mario said he would come.", ctx: "→ Discorso indiretto al passato" },
      { it: "Non so se sarei venuto — era lontano.", en: "I don't know whether I would have come.", ctx: "→ SE whether ✅" },
    ],
    errori: [
      { sbagliato: "Se sarei venuto… (ipotetico)", corretto: "Se fossi venuto…", perche: "SE ipotetico + condizionale passato = sempre sbagliato. Usare cong. trapassato." },
      { sbagliato: "avessi fatto (dopo 'avrei')", corretto: "avrei fatto (cond.) vs avessi fatto (cong.)", perche: "Confusione trapassato/condizionale passato: avessi = cong. · avrei = cond." },
    ]
  },
];

const CONGIUNZIONI = [
  {
    cat_it: "Concessione",
    cat_en: "Concession",
    colore: "verde",
    voci: ["benché", "sebbene", "nonostante (che)", "malgrado (che)", "quantunque", "per quanto"],
    esempio_it: "Benché faccia freddo, esco.",
    esempio_en: "Although it's cold, I'm going out.",
    tempo: "Congiuntivo presente o imperfetto secondo il tempo della principale"
  },
  {
    cat_it: "Scopo",
    cat_en: "Purpose",
    colore: "rosso",
    voci: ["affinché", "perché (= so that)", "acciocché (formale)"],
    esempio_it: "Parlo lento affinché tu capisca.",
    esempio_en: "I speak slowly so you understand.",
    tempo: "Congiuntivo presente (scopo futuro rispetto alla principale)"
  },
  {
    cat_it: "Condizione",
    cat_en: "Condition",
    colore: "verde",
    voci: ["purché", "a patto che", "a condizione che", "a meno che (non)", "salvo che"],
    esempio_it: "Vengo, purché tu voglia.",
    esempio_en: "I'll come, provided you want me to.",
    tempo: "Congiuntivo presente o imperfetto"
  },
  {
    cat_it: "Temporale",
    cat_en: "Time",
    colore: "rosso",
    voci: ["prima che"],
    esempio_it: "Prima che lui arrivi, prepariamo tutto.",
    esempio_en: "Before he arrives, let's prepare everything.",
    tempo: "Congiuntivo presente (principale al presente) o imperfetto (principale al passato)"
  },
  {
    cat_it: "Causa apparente",
    cat_en: "Apparent cause",
    colore: "verde",
    voci: ["non perché", "non che"],
    esempio_it: "Non lo faccio perché abbia paura.",
    esempio_en: "It's not that I'm afraid.",
    tempo: "Congiuntivo presente"
  },
  {
    cat_it: "Limitativa",
    cat_en: "Limitative",
    colore: "rosso",
    voci: ["per quanto", "chiunque", "qualunque cosa", "comunque"],
    esempio_it: "Per quanto studi, non capisce.",
    esempio_en: "No matter how much he studies…",
    tempo: "Congiuntivo presente o imperfetto"
  },
  {
    cat_it: "Modale / Comparativa",
    cat_en: "Modal / Comparative",
    colore: "verde",
    voci: ["come se (+ cong. imperfetto o trapassato)"],
    esempio_it: "Parla come se fosse italiano.",
    esempio_en: "He speaks as if he were Italian.",
    tempo: "Imperfetto (contemporaneo) o trapassato (anteriore). MAI condizionale dopo come se."
  },
  {
    cat_it: "Concessiva ipotetica",
    cat_en: "Concessive hypothetical",
    colore: "rosso",
    voci: ["anche se (+ cong. imperfetto)"],
    esempio_it: "Anche se studiasse, non capirebbe.",
    esempio_en: "Even if he studied, he wouldn't understand.",
    tempo: "Congiuntivo imperfetto + condizionale presente"
  },
];

const SCHEMA_SE = [
  { tipo: "Tipo 1 — Reale", se: "se + indicativo PRESENTE", principale: "futuro / presente", esempio_it: "Se studi, imparerai.", esempio_en: "If you study, you'll learn.", ok: true, colloquiale: false },
  { tipo: "Tipo 2 — Irreale presente", se: "se + cong. IMPERFETTO", principale: "condizionale PRESENTE", esempio_it: "Se studiassi, impareresti.", esempio_en: "If you studied, you'd learn.", ok: true, colloquiale: false },
  { tipo: "Tipo 3 — Irreale passato", se: "se + cong. TRAPASSATO", principale: "condizionale PASSATO", esempio_it: "Se avessi studiato, avresti imparato.", esempio_en: "If you had studied, you'd have learned.", ok: true, colloquiale: false },
  { tipo: "Tipo Misto", se: "se + cong. TRAPASSATO", principale: "condizionale PRESENTE", esempio_it: "Se avessi studiato, parleresti bene adesso.", esempio_en: "If you had studied, you'd speak well now.", ok: true, colloquiale: false },
  { tipo: "SE whether ✅", se: "se + CONDIZIONALE (pres. o pass.)", principale: "—", esempio_it: "Non so se verrei. / Non so se sarei venuto.", esempio_en: "I don't know whether I would come.", ok: true, colloquiale: false },
  { tipo: "Colloquiale ⚠️", se: "se + indicativo IMPERFETTO", principale: "indicativo IMPERFETTO", esempio_it: "Se venivo, ti chiamavo.", esempio_en: "(If I came, I would've called.)", ok: false, colloquiale: true },
  { tipo: "❌ SE + condizionale (ipotetico)", se: "se + CONDIZIONALE", principale: "—", esempio_it: "~~Se verrei~~", esempio_en: "If I would come", ok: false, colloquiale: false },
  { tipo: "❌ SE + cong. presente", se: "se + cong. PRESENTE", principale: "—", esempio_it: "~~Se venga~~", esempio_en: "If he comes (subj.)", ok: false, colloquiale: false },
  { tipo: "❌ SE + cong. passato", se: "se + cong. PASSATO", principale: "—", esempio_it: "~~Se sia venuto~~", esempio_en: "If he has come (subj.)", ok: false, colloquiale: false },
];

// ── Componente TCard (accordion) ─────────────────────────────────────────────
function TCard({ t, aperta, onToggle }) {
  const isCond = t.modo === "Condizionale";
  const accent = isCond ? "var(--primary)" : "#009246";
  const accentBg = isCond ? "rgba(var(--primary-rgb, 229,183,0), 0.08)" : "rgba(0,146,70,0.3)";

  return (
    <div style={{
      border: `1.5px solid var(--border)`,
      borderLeft: `5px solid ${aperta ? accent : "var(--border)"}`,
      borderRadius: "var(--r)",
      overflow: "hidden",
      transition: "border-color 0.2s",
      marginBottom: 4,
    }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          padding: "18px 20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          background: aperta ? "var(--text)" : "var(--card)",
          transition: "background 0.2s",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontFamily: "monospace", fontSize: 9, letterSpacing: 2,
              background: aperta ? accent : accentBg,
              color: aperta ? "var(--text)" : accent,
              padding: "2px 8px", fontWeight: 900,
            }}>{t.num}</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: aperta ? "rgba(255,255,255,0.4)" : "var(--text3)" }}>{t.modo}</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: aperta ? "white" : "var(--text)", marginBottom: 2 }}>{t.titolo_it}</div>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1, color: aperta ? "rgba(255,255,255,0.4)" : "var(--text3)", marginBottom: 4 }}>{t.titolo_en}</div>
          <div style={{ fontSize: 12, color: aperta ? "rgba(255,255,255,0.55)" : "var(--text3)", lineHeight: 1.5 }}>{t.desc_it} <em style={{ opacity: 0.7 }}>· {t.desc_en}</em></div>
        </div>
        <div style={{ fontSize: 16, color: aperta ? "rgba(255,255,255,0.3)" : "var(--text3)", transform: aperta ? "rotate(180deg)" : "none", transition: "transform 0.25s", flexShrink: 0, marginTop: 4 }}>▼</div>
      </div>

      {/* Body espanso */}
      {aperta && (
        <div style={{ background: "#15212a", padding: "24px 20px 28px", animation: "fadeInDown 0.25s ease" }}>
          {/* Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {t.chips.map((c, i) => (
              <span key={i} style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 1, padding: "3px 10px", background: "rgba(255,255,255,0.08)", color: "#88DDAA", border: "1px solid rgba(255,255,255,0.15)" }}>{c}</span>
            ))}
          </div>

          {/* Formazione */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderLeft: `3px solid ${accent}`, padding: "10px 14px", marginBottom: 16, fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.8)" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#88DDAA", marginBottom: 4 }}>📐 Formazione / Formation</div>
            {t.formazione.it}
          </div>

          {/* Tabella coniugazione */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 16 }}>
            <thead>
              <tr>
                {t.tabella.cols.map((c, i) => (
                  <th key={i} style={{
                    padding: "8px 10px", textAlign: "left",
                    background: i === 0 ? "rgba(255,255,255,0.06)" : (isCond ? "rgba(229,183,0,0.25)" : "rgba(0,146,70,0.25)"),
                    color: i === 0 ? "rgba(255,255,255,0.4)" : (isCond ? "#E5B700" : "#88DDAA"),
                    fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700,
                  }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.tabella.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: "7px 10px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      color: ci === 0 ? "#88DDAA" : "rgba(255,255,255,0.85)",
                      fontFamily: ci === 0 ? "monospace" : "inherit",
                      fontSize: ci === 0 ? 11 : 13,
                      fontWeight: ci === 0 ? 700 : 500,
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Regola */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderLeft: `3px solid ${isCond ? "#E5B700" : "#88DDAA"}`, padding: "10px 14px", marginBottom: 16, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: isCond ? "#E5B700" : "#88DDAA", marginBottom: 4 }}>📌 Regola / Rule</div>
            {t.regola.it}
          </div>

          {/* Esempi bilingue */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 16 }}>
            {t.esempi.map((e, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", padding: "12px 14px" }}>
                <div style={{ fontStyle: "italic", fontSize: 14, color: "white", marginBottom: 3 }}>{e.it}</div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#FF9999", marginBottom: 3 }}>{e.en}</div>
                <div style={{ fontSize: 11, color: "#88DDAA", fontStyle: "italic" }}>{e.ctx}</div>
              </div>
            ))}
          </div>

          {/* Errori comuni */}
          <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#FF9999", marginBottom: 8 }}>⚠️ Errori comuni / Common mistakes</div>
          {t.errori.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 3 }}>
              <div style={{ background: "rgba(206,43,55,0.15)", padding: "10px 12px", borderTop: "3px solid #CE2B37" }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#FF9999", marginBottom: 5 }}>❌ SBAGLIATO</div>
                <div style={{ fontStyle: "italic", fontSize: 13, color: "#FF9999", textDecoration: "line-through" }}>{e.sbagliato}</div>
              </div>
              <div style={{ background: "rgba(0,146,70,0.15)", padding: "10px 12px", borderTop: "3px solid #009246" }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#88DDAA", marginBottom: 5 }}>✅ CORRETTO</div>
                <div style={{ fontStyle: "italic", fontSize: 13, color: "#88DDAA", marginBottom: 4 }}>{e.corretto}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{e.perche}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pagina principale ─────────────────────────────────────────────────────────
export default function CongiuntivoCondizionale() {
  const router = useRouter();
  const [aperte, setAperte] = useState({});
  const [tab, setTab] = useState("tempi");

  const toggle = (id) => setAperte(prev => ({ ...prev, [id]: !prev[id] }));
  const apriTutti = () => {
    const all = {};
    TEMPI.forEach(t => { all[t.id] = true; });
    setAperte(all);
  };
  const chiudiTutti = () => setAperte({});

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .esempi-grid { grid-template-columns: 1fr !important; }
          .errori-grid { grid-template-columns: 1fr !important; }
          .cong-grid { grid-template-columns: 1fr !important; }
          .se-table td, .se-table th { font-size: 11px !important; padding: 7px 8px !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{
        background: "#15212a",
        padding: "48px 20px 36px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(to right, #009246 33.33%, white 33.33%, white 66.66%, #CE2B37 66.66%)"
        }} />
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: "monospace", letterSpacing: 1 }}
          >← Biblioteca</button>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>Grammatica · B1</div>
          <h1 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 900, color: "white", lineHeight: 1.05, marginBottom: 8 }}>
            <span style={{ color: "#009246" }}>Congiuntivo</span> &amp; <span style={{ color: "#E5B700" }}>Condizionale</span>
          </h1>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 20 }}>SUBJUNCTIVE &amp; CONDITIONAL — ALL TENSES + CONJUNCTIONS + SE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <div style={{ background: "rgba(0,146,70,0.15)", padding: "14px 16px", borderLeft: "4px solid #009246" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, color: "#88DDAA", marginBottom: 6 }}>🇮🇹 Italiano</div>
              <div style={{ fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>Il congiuntivo esprime soggettività, dubbio, speranza, volontà. Il condizionale esprime cortesia, ipotesi e rimpianti. Insieme costruiscono il sistema dell'ipotetico italiano.</div>
            </div>
            <div style={{ background: "rgba(206,43,55,0.15)", padding: "14px 16px", borderLeft: "4px solid #CE2B37" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, color: "#FF9999", marginBottom: 6 }}>🇬🇧 English</div>
              <div style={{ fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>The subjunctive expresses subjectivity, doubt, hope, will. The conditional expresses politeness, hypotheses and regrets. Together they build the Italian hypothetical system.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: "var(--card)", borderBottom: "1.5px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { id: "tempi", label: "⏱ Tempi verbali" },
            { id: "congiunzioni", label: "🔗 Congiunzioni" },
            { id: "se", label: "🔀 Schema SE" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "14px 18px", background: "none", border: "none", cursor: "pointer",
              fontFamily: "monospace", fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
              color: tab === t.id ? "var(--primary)" : "var(--text3)",
              borderBottom: tab === t.id ? "3px solid var(--primary)" : "3px solid transparent",
              fontWeight: tab === t.id ? 800 : 500, transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 16px" }}>

        {/* ── TAB: Tempi verbali ── */}
        {tab === "tempi" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>6 tempi verbali</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>Tap per espandere · Clicca la regola, leggi gli esempi, evita gli errori</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={apriTutti} style={{ fontFamily: "monospace", fontSize: 10, padding: "6px 12px", background: "none", border: "1.5px solid var(--border)", color: "var(--text3)", cursor: "pointer" }}>Apri tutti</button>
                <button onClick={chiudiTutti} style={{ fontFamily: "monospace", fontSize: 10, padding: "6px 12px", background: "none", border: "1.5px solid var(--border)", color: "var(--text3)", cursor: "pointer" }}>Chiudi tutti</button>
              </div>
            </div>

            {/* Separatore Congiuntivo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 4, height: 24, background: "#009246" }} />
              <span style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#009246", fontWeight: 800 }}>Congiuntivo</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            {TEMPI.filter(t => t.modo === "Congiuntivo").map(t => (
              <TCard key={t.id} t={t} aperta={!!aperte[t.id]} onToggle={() => toggle(t.id)} />
            ))}

            {/* Separatore Condizionale */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 10px" }}>
              <div style={{ width: 4, height: 24, background: "var(--primary)" }} />
              <span style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--primary)", fontWeight: 800 }}>Condizionale</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            {TEMPI.filter(t => t.modo === "Condizionale").map(t => (
              <TCard key={t.id} t={t} aperta={!!aperte[t.id]} onToggle={() => toggle(t.id)} />
            ))}

            {/* Link agli esercizi */}
            <div style={{ marginTop: 32, background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: 20 }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--text3)", marginBottom: 12 }}>📝 Esercizi disponibili</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { id: "congiuntivo", label: "Congiuntivo (tutti i tempi)" },
                  { id: "congiuntivo-presente", label: "Congiuntivo Presente" },
                  { id: "condizionale", label: "Condizionale Presente" },
                  { id: "condizionale-passato", label: "Condizionale Passato" },
                  { id: "periodo-ipotetico", label: "Periodo Ipotetico" },
                ].map(s => (
                  <button key={s.id} onClick={() => router.push(`/biblioteca/${s.id}`)} style={{
                    padding: "8px 14px", background: "var(--bg)", border: "1.5px solid var(--border)",
                    borderRadius: 8, fontSize: 12, color: "var(--text)", cursor: "pointer", fontWeight: 600,
                  }}>
                    {s.label} →
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Congiunzioni ── */}
        {tab === "congiunzioni" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>Congiunzioni che reggono il congiuntivo</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text3)", letterSpacing: 1 }}>CONJUNCTIONS THAT TRIGGER THE SUBJUNCTIVE</div>
            </div>
            <div className="cong-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              {CONGIUNZIONI.map((c, i) => (
                <div key={i} style={{
                  background: "var(--card)",
                  borderTop: `4px solid ${c.colore === "verde" ? "#009246" : "var(--primary)"}`,
                  padding: "16px 18px",
                  border: "1.5px solid var(--border)",
                  borderTopColor: c.colore === "verde" ? "#009246" : "var(--primary)",
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: c.colore === "verde" ? "#009246" : "var(--primary)", marginBottom: 8, fontWeight: 800 }}>
                    {c.cat_it} / {c.cat_en}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                    {c.voci.map((v, j) => (
                      <span key={j} style={{
                        fontFamily: "monospace", fontSize: 11, padding: "2px 8px",
                        background: c.colore === "verde" ? "rgba(0,146,70,0.18)" : "rgba(229,183,0,0.15)",
                        color: c.colore === "verde" ? "#88DDAA" : "#E5B700",
                        border: `1px solid ${c.colore === "verde" ? "rgba(0,146,70,0.3)" : "rgba(229,183,0,0.35)"}`,
                      }}>{v}</span>
                    ))}
                  </div>
                  <div style={{ fontStyle: "italic", fontSize: 14, color: "var(--text)", marginBottom: 3, lineHeight: 1.5 }}>«{c.esempio_it}»</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>"{c.esempio_en}"</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", borderTop: "1px solid var(--border)", paddingTop: 8, lineHeight: 1.5 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--text3)" }}>Tempo: </span>{c.tempo}
                  </div>
                </div>
              ))}
            </div>

            {/* Nota Mario */}
            <div style={{ marginTop: 24, background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: 18, borderLeft: "4px solid var(--primary)" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--primary)", marginBottom: 8 }}>💡 Regola rapida</div>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>
                <strong>Congiuntivo presente</strong> → principale al presente/futuro.<br />
                <strong>Congiuntivo imperfetto</strong> → principale al passato/condizionale.<br />
                <strong>Come se</strong> → sempre imperfetto (contemporaneo) o trapassato (anteriore). <span style={{ color: "var(--primary)", fontWeight: 700 }}>MAI condizionale dopo come se.</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Schema SE ── */}
        {tab === "se" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>Schema completo del SE</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text3)", letterSpacing: 1 }}>IF-CLAUSES COMPLETE GUIDE — CORRECT · COLLOQUIAL · WRONG</div>
            </div>

            {/* Test WHETHER */}
            <div style={{ background: "var(--card)", border: "1.5px solid var(--primary)", borderRadius: "var(--r)", padding: 16, marginBottom: 20 }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--primary)", marginBottom: 8 }}>💡 Il test del WHETHER</div>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>
                Sostituisci <strong>SE</strong> con <strong>WHETHER</strong> in inglese.<br />
                ✅ Funziona? → <strong>SE whether</strong> → condizionale corretto: <em>«Non so se verrei»</em> = "I don't know <strong>whether</strong> I would come"<br />
                ❌ Non funziona? → <strong>SE ipotetico</strong> → mai condizionale: <em>~~«Se verrei»~~</em> = "If I <strong>would</strong> come" ❌
              </div>
            </div>

            {/* Tabella */}
            <div style={{ overflowX: "auto" }}>
              <table className="se-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, border: "2px solid var(--text)" }}>
                <thead>
                  <tr>
                    {["Tipo", "Protasi (SE...)", "Apodosi (principale)", "Esempio IT", "Esempio EN"].map((h, i) => (
                      <th key={i} style={{
                        padding: "10px 12px", textAlign: "left",
                        background: i === 0 ? "var(--text)" : i <= 2 ? "#15212a" : "#1e2d38",
                        color: "white", fontFamily: "monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
                        borderRight: "1px solid rgba(255,255,255,0.1)",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCHEMA_SE.map((r, i) => {
                    const isError = !r.ok && !r.colloquiale;
                    const isColloquiale = r.colloquiale;
                    const bg = isError ? "rgba(206,43,55,0.12)" : isColloquiale ? "rgba(229,183,0,0.1)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.03)";
                    const borderColor = isError ? "#CE2B37" : isColloquiale ? "#E5B700" : "transparent";
                    return (
                      <tr key={i} style={{ background: bg, borderLeft: `4px solid ${borderColor}` }}>
                        <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 12, color: isError ? "#CE2B37" : isColloquiale ? "#E5B700" : "var(--text)", borderBottom: "1px solid var(--border)" }}>
                          {r.tipo}
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "var(--text2)", borderBottom: "1px solid var(--border)" }}>{r.se}</td>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "var(--text2)", borderBottom: "1px solid var(--border)" }}>{r.principale}</td>
                        <td style={{ padding: "10px 12px", fontStyle: "italic", fontSize: 12, color: isError ? "#CE2B37" : "var(--text)", borderBottom: "1px solid var(--border)" }}>{r.esempio_it}</td>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "var(--text3)", borderBottom: "1px solid var(--border)" }}>{r.esempio_en}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legenda */}
            <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { colore: "transparent", border: "var(--border)", label: "✅ Corretto" },
                { colore: "rgba(229,183,0,0.15)", border: "#E5B700", label: "⚠️ Colloquiale (parlato)" },
                { colore: "rgba(206,43,55,0.08)", border: "#CE2B37", label: "❌ Sempre sbagliato" },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text3)" }}>
                  <div style={{ width: 16, height: 10, background: l.colore, border: `1.5px solid ${l.border}` }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Raccordo cong+cond */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>Raccordo Congiuntivo ↔ Condizionale</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginBottom: 16 }}>WHICH SUBJUNCTIVE GOES WITH WHICH CONDITIONAL?</div>
              <div style={{ display: "grid", gap: 3 }}>
                {[
                  { cong: "Cong. PRESENTE", cond: "Cond. PRESENTE", quando: "Principale al presente", esempio: "Spero che venga → potrebbe venire", colore: "#009246" },
                  { cong: "Cong. PASSATO", cond: "Cond. PRESENTE", quando: "Emozione presente + fatto passato", esempio: "Sono felice che sia venuto", colore: "#009246" },
                  { cong: "Cong. IMPERFETTO", cond: "Cond. PRESENTE", quando: "Tipo II / Principale al passato", esempio: "Se studiassi → impareresti · Voleva che venissi", colore: "#E5B700" },
                  { cong: "Cong. TRAPASSATO", cond: "Cond. PASSATO", quando: "Tipo III / Rimpianto passato", esempio: "Se avessi studiato → avresti imparato", colore: "#CE2B37" },
                  { cong: "Cong. TRAPASSATO", cond: "Cond. PRESENTE", quando: "Tipo MISTO (cond. passata, effetto ora)", esempio: "Se avessi studiato → parleresti bene adesso", colore: "#E5B700" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 180px 1fr", gap: 2 }}>
                    <div style={{ background: "rgba(0,146,70,0.18)", border: "1.5px solid rgba(0,146,70,0.2)", padding: "10px 12px" }}>
                      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#009246", marginBottom: 3 }}>CONGIUNTIVO</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#88DDAA" }}>{r.cong}</div>
                    </div>
                    <div style={{ background: "rgba(229,183,0,0.08)", border: "1.5px solid rgba(229,183,0,0.2)", padding: "10px 12px" }}>
                      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "var(--primary)", marginBottom: 3 }}>CONDIZIONALE</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#E5B700" }}>{r.cond}</div>
                    </div>
                    <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", padding: "10px 12px", borderLeft: `3px solid ${r.colore}` }}>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>{r.quando}</div>
                      <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--text)" }}>{r.esempio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eccezioni */}
            <div style={{ marginTop: 24, background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "var(--r)", padding: 18, borderLeft: "4px solid #CE2B37" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#CE2B37", marginBottom: 12 }}>⚡ Eccezioni e casi speciali</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { regola: "È certo che / So che", uso: "→ INDICATIVO (non congiuntivo). La certezza non richiede il congiuntivo.", esempio: "So che Mario è bravo. ✅ (non 'sia')" },
                  { regola: "SE whether (= whether)", uso: "→ CONDIZIONALE corretto. Test: sostituisci SE con WHETHER in inglese.", esempio: "Non so se verrei. ✅ = I don't know whether I would come." },
                  { regola: "Come se", uso: "→ SEMPRE cong. imperfetto o trapassato. MAI condizionale.", esempio: "Come se fosse ✅ · Come se sarebbe ❌" },
                  { regola: "Colloquiale: se + imperfetto indicativo", uso: "→ Accettato nel parlato informale, scorretto nello scritto formale.", esempio: "Se venivo, ti chiamavo. ⚠️ Formale: Se fossi venuto, ti avrei chiamato." },
                ].map((e, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, fontSize: 12 }}>
                    <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>{e.regola}</div>
                    <div>
                      <div style={{ color: "var(--text2)", lineHeight: 1.5, marginBottom: 2 }}>{e.uso}</div>
                      <div style={{ fontStyle: "italic", color: "var(--text3)", fontSize: 11 }}>{e.esempio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
