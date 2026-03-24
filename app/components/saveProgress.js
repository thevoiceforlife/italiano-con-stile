// app/components/saveProgress.js
// ─── Sistema reward centralizzato — Sprint 4 ─────────────────────────────────
// Usato da tutte le lezioni e dalla Sfida la Nonna.
// Unico punto di verità per energia, crediti, pizza, gelato.

// ─── Messaggi Vittoria calibrati sul punteggio (Sfida la Nonna) ───────────────
export const NONNA_MSGS = [
  {
    score: 5,
    energy: 15,
    msg: "Perfetta! Sei brava/o quanto me.",
    msgEN: "Perfect! You're as good as me.",
    sub: "Vittoria si asciuga una lacrima di orgoglio e ti porge il gelato con entrambe le mani.",
    subEN: "Vittoria wipes a proud tear and hands you the gelato with both hands.",
    speak: "Perfetta! Sei brava e brava quanto me. Tieni, te lo meriti.",
  },
  {
    score: 4,
    energy: 12,
    msg: "Quasi perfetta. Un errore si perdona.",
    msgEN: "Almost perfect. One mistake is forgiven.",
    sub: "Vittoria taglia una fetta leggermente più piccola ma te la dà lo stesso con un sorriso.",
    subEN: "Vittoria cuts a slightly smaller slice but gives it to you with a smile.",
    speak: "Quasi perfetta. Un piccolo errore si perdona. Tieni il gelato.",
  },
  {
    score: 3,
    energy: 9,
    msg: "Metà strada. Devi studiare di più.",
    msgEN: "Halfway there. You need to study more.",
    sub: "Vittoria sospira, ti dà il gelato, e ti guarda a lungo negli occhi prima di voltarsi.",
    subEN: "Vittoria sighs, gives you the gelato, and holds your gaze before turning away.",
    speak: "Metà strada. Devi studiare di più. Ma il gelato te lo do lo stesso.",
  },
  {
    score: 2,
    energy: 6,
    msg: "Solo due giuste? Hai la testa altrove.",
    msgEN: "Only two right? Your mind is elsewhere.",
    sub: "Vittoria appoggia il gelato sul tavolo senza guardare, scuotendo lentamente la testa.",
    subEN: "Vittoria sets the gelato on the table without looking, slowly shaking her head.",
    speak: "Solo due. Solo due. Ma il gelato ce lo metto lo stesso. La prossima volta impegnati.",
  },
  {
    score: 1,
    energy: 3,
    msg: "Una sola risposta giusta. Mamma mia.",
    msgEN: "Just one right answer. Goodness gracious.",
    sub: "Vittoria ti dà il gelato in silenzio. Il silenzio è peggio delle parole.",
    subEN: "Vittoria gives you the gelato in silence. The silence is worse than words.",
    speak: "Una sola. Il gelato lo prendi lo stesso, ma la prossima volta cerca di impegnarti.",
  },
  {
    score: 0,
    energy: 2,
    msg: "Va bene, ti do lo stesso il gelato. Ma la prossima volta impegnati di più.",
    msgEN: "Alright, I'll give you the gelato anyway. But next time, try harder.",
    sub: "Vittoria mette il cono in mano senza una parola e torna in cucina. Il messaggio è chiaro.",
    subEN: "Vittoria puts the cone in your hand without a word and returns to the kitchen. Message clear.",
    speak: "Va bene. Ti do lo stesso il gelato. Ma la prossima volta, per favore, impegnati di più.",
  },
];

export function getNonnaMsg(score) {
  return NONNA_MSGS.find((m) => m.score === score) ?? NONNA_MSGS[NONNA_MSGS.length - 1];
}

// ─── Funzione principale ───────────────────────────────────────────────────────
/**
 * Salva i progressi in localStorage dopo una lezione o la Sfida la Nonna.
 *
 * @param {object} params
 * @param {"lezione"|"boss"} params.tipo
 * @param {number} [params.lessonId]   — ID lezione (0-3), solo per tipo "lezione"
 * @param {number} params.corrette     — risposte corrette
 * @param {number} params.totDomande   — totale domande (di solito 5)
 * @returns {object} reward — oggetto con i valori guadagnati, per mostrare nel popup
 */
export function salvaProgressi({ tipo, lessonId, corrette, totDomande }) {
  const prev = JSON.parse(localStorage.getItem("ics_progress") || "{}");
  const errori = totDomande - corrette;

  let reward = {};

  if (tipo === "lezione") {
    // ── Logica reward basata su risposte corrette ───────────────────────────
    // 8/8 → cornetto + caffè bonus + pizza
    // 5-7 → cornetto + caffè + pizza
    // 3-4 → cornetto + caffè
    // 1-2 → caffè
    // 0   → niente

    const perfetto   = corrette === totDomande;
    const haCornetto = corrette >= 3;
    const haCaffe    = corrette >= 1;
    const haCaffeBonus = perfetto;

    // Pizza: 1 spicchio ogni 6 risposte corrette
    const nuoviSpicchi   = Math.floor(corrette / 6);
    const spicchiAttuali = prev.pizzaSlices ?? 0;
    const spicchiFinali  = Math.min(spicchiAttuali + nuoviSpicchi, 6);
    const pizzaEnergia   = nuoviSpicchi * 8;

    // Calcola energia base
    let energiaBase = 0;
    if (perfetto)      energiaBase = 25; // cornetto + caffè bonus
    else if (haCornetto) energiaBase = 20; // cornetto
    else if (haCaffe)    energiaBase = 10; // caffè
    else                 energiaBase = 2;  // minimo

    // Crediti
    let crediti = 0;
    if (perfetto)        crediti = 15;
    else if (haCornetto) crediti = 10;
    else if (haCaffe)    crediti = 5;
    else                 crediti = 2;

    // Determina cibo principale per il popup
    let cibo = "nessuno";
    if (perfetto)        cibo = "cornetto+caffè";
    else if (haCornetto) cibo = "cornetto+caffè-normale";
    else if (haCaffe)    cibo = "caffè";

    reward = {
      energia:     energiaBase + pizzaEnergia,
      energiaBase,
      pizzaEnergia,
      crediti,
      spicchi:     nuoviSpicchi,
      cibo,
      perfetto,
      haCornetto,
      haCaffe,
      haCaffeBonus,
      corrette,
      totDomande,
      tipo:        "lezione",
      lessonId,
    };

    localStorage.setItem("ics_progress", JSON.stringify({
      ...prev,
      energy:      Math.min((prev.energy ?? 100) + reward.energia, 100),
      credits:     (prev.credits ?? 0) + reward.crediti,
      pizzaSlices: spicchiFinali,
      streak:      prev.streak ?? 0,
      completed:   [...new Set([...(prev.completed ?? []), lessonId])],
    }));

  } else if (tipo === "boss") {
    // ── Reward Sfida la Nonna ───────────────────────────────────────────────
    const nonnaData = getNonnaMsg(corrette);

    reward = {
      energia:  nonnaData.energy,
      crediti:  50,
      gelato:   true,
      nonna:    nonnaData,
      tipo:     "boss",
    };

    localStorage.setItem("ics_progress", JSON.stringify({
      ...prev,
      energy:    Math.min((prev.energy ?? 100) + nonnaData.energy, 100),
      credits:   (prev.credits ?? 0) + 50,
      streak:    prev.streak ?? 0,
      completed: [...new Set([...(prev.completed ?? []), "boss"])],
    }));
  }

  return reward;
}
