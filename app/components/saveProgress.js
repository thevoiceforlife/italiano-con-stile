// app/components/saveProgress.js
// ─── Sistema reward centralizzato — Sprint 6 ─────────────────────────────────

const KEY = 'italiano-progress';

const LESSON_FOOD = {
  1: { cibo: 'caffe',     energiaBase: 10, emoji: '☕', nome: 'Caffè' },
  2: { cibo: 'cornetto',  energiaBase: 15, emoji: '🥐', nome: 'Cornetto' },
  3: { cibo: 'aperitivo', energiaBase: 20, emoji: '🍸', nome: 'Aperitivo' },
  4: { cibo: 'pizza',     energiaBase: 15, emoji: '🍕', nome: 'Pizza' },
};

function getMultiplier(corrette, tot) {
  const r = corrette / tot;
  if (r >= 1)    return 1.00;
  if (r >= 0.75) return 0.75;
  if (r >= 0.50) return 0.50;
  if (r >= 0.25) return 0.25;
  return 0;
}

function getSpicchi(corrette) {
  return Math.min(Math.floor(corrette / 2), 4);
}

const DAY_NAMES = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function getDaysToSunday() {
  const d = new Date().getDay();
  return d === 0 ? 1 : 8 - d;
}

// FIX Sprint 7: lunedì della settimana corrente in formato ISO
function getMondayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveRaw(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ─── Init + decay giornaliero ─────────────────────────────────────────────────
export function initAndDecay() {
  const now   = Date.now();
  const today = todayISO();
  let   data  = loadProgress();

  if (!data) {
    const initial = {
      energy: 25, credits: 0, tickets: {}, completed: [],
      completedToday: [], lessonScores: {},
      lastVisit: now, lastVisitDate: today,
      livello: null, onboardingDone: false,
      streak: { weekStart: getMondayISO(), totalDays: 7, activeDays: [], bonusErogato: false },
    };
    saveRaw(initial);
    return initial;
  }

  const lastDate = data.lastVisitDate ?? today;
  const daysDiff = lastDate !== today
    ? Math.max(1, Math.floor((now - (data.lastVisit ?? now)) / 86_400_000))
    : 0;

  let energy         = data.energy ?? 25;
  let completedToday = data.completedToday ?? [];

  if (daysDiff > 0 && (data.completed ?? []).length > 0) {
    energy         = Math.max(energy - daysDiff * 15, 25);
    completedToday = [];
  }

  // Reset streak se lunedì
  let streak = data.streak ?? { weekStart: getMondayISO(), totalDays: 7, activeDays: [], bonusErogato: false };
  const dow = new Date().getDay();
  const currentMonday = getMondayISO();
  const isNewWeek = streak.weekStart !== currentMonday;
  if (isNewWeek) {
    if ((streak.activeDays ?? []).length === 0 && (data.completed ?? []).length > 0) {
      energy = 25;
    }
    streak = { weekStart: currentMonday, totalDays: 7, activeDays: [], bonusErogato: false };
  }

  const updated = { ...data, energy, completedToday, lastVisit: now, lastVisitDate: today, streak };
  saveRaw(updated);
  return updated;
}

function updateStreak(data, completedToday) {
  if ((completedToday ?? []).length < 2) return data.streak;
  const today  = DAY_NAMES[new Date().getDay()];
  const active = data.streak?.activeDays ?? [];
  if (active.includes(today)) return data.streak;
  return { ...data.streak, activeDays: [...active, today] };
}

// ─── Messaggi Nonna ───────────────────────────────────────────────────────────
export const NONNA_MSGS = [
  { score: 5, energy: 10, msg: 'Sei al mio livello ormai.',      msgEN: "You're at my level now.",         speak: 'Perfetta! Sei al mio livello ormai.' },
  { score: 4, energy: 7,  msg: 'Quasi. Un errore si perdona.',   msgEN: 'Almost. One mistake is forgiven.', speak: 'Quasi. Un piccolo errore si perdona.' },
  { score: 3, energy: 5,  msg: 'Metà strada. Studia di più.',    msgEN: 'Halfway. Study more.',             speak: 'Metà strada. Devi studiare di più.' },
  { score: 2, energy: 3,  msg: 'Hai la testa altrove.',          msgEN: 'Your mind is elsewhere.',         speak: 'Solo due. La prossima volta impegnati.' },
  { score: 1, energy: 1,  msg: 'Una sola. Mamma mia.',           msgEN: 'Just one. Goodness gracious.',    speak: 'Una sola. Il gelato lo prendi lo stesso.' },
  { score: 0, energy: 0,  msg: 'Ti do il gelato lo stesso. 🍦',  msgEN: "Gelato anyway. Next time try.",   speak: 'Va bene. Ti do lo stesso il gelato. La prossima volta impegnati.' },
];

export function getNonnaMsg(score) {
  return NONNA_MSGS.find(m => m.score === score) ?? NONNA_MSGS[NONNA_MSGS.length - 1];
}

// ─── Funzione principale ──────────────────────────────────────────────────────
export function salvaProgressi({ tipo, lessonId, corrette, totDomande }) {
  let data = loadProgress() ?? { energy: 25, credits: 0, tickets: {}, completed: [], completedToday: [], lessonScores: {}, streak: null };

  const sad    = corrette <= 1;
  const perfetto = corrette === totDomande;
  let reward = {};

  if (tipo === 'lezione') {
    const food     = LESSON_FOOD[lessonId] ?? LESSON_FOOD[1];
    const multi    = getMultiplier(corrette, totDomande);
    const spicchi  = lessonId === 4 ? getSpicchi(corrette) : 0;
    let   energiaG = 0;
    if (!sad) {
      energiaG = lessonId === 4
        ? Math.round(food.energiaBase * (spicchi / 4))
        : Math.round(food.energiaBase * multi);
    }
    const creditiBase  = sad ? 0 : corrette * 2;
    const creditiBonus = (perfetto && !sad) ? 5 : 0;
    const creditiTot   = creditiBase + creditiBonus;

    const prev      = data.lessonScores?.[lessonId];
    const prevE     = prev?.energia ?? 0;
    const prevC     = prev?.crediti ?? 0;
    const isReplay  = !!prev;
    const deltaE    = sad ? 0 : energiaG - prevE;
    const deltaC    = sad ? 0 : creditiTot - prevC;
    const energiaDopo = Math.min(Math.max((data.energy ?? 25) + deltaE, 0), 200);
    const creditiDopo = Math.max((data.credits ?? 0) + deltaC, 0);

    const completedToday = [...new Set([...(data.completedToday ?? []), lessonId])];
    const allPerfect = !sad && perfetto && [1, 2, 3, 4, 'boss'].every(id => {
      if (id === lessonId) return true;
      return data.lessonScores?.[id]?.perfetto === true;
    });
    const newStreak = updateStreak(data, completedToday);

    reward = {
      tipo: sad ? 'sad' : 'lezione', lessonId, corrette, totDomande, perfetto, sad,
      cibo: sad ? 'nessuno' : food.cibo,
      ciboEmoji: sad ? '😔' : food.emoji,
      ciboNome:  sad ? '—'  : food.nome,
      spicchi, energia: energiaG,
      energiaPrima: data.energy ?? 25, energiaDopo,
      crediti: creditiTot, creditiBase, creditiBonus,
      creditiPrima: data.credits ?? 0, creditiDopo,
      isReplay, deltaEnergia: deltaE, deltaCrediti: deltaC,
      menuCompleto: allPerfect,
    };

    saveRaw({
      ...data,
      energy:   energiaDopo,
      credits:  creditiDopo,
      completed: sad ? data.completed : [...new Set([...(data.completed ?? []), lessonId])],
      completedToday,
      lessonScores: sad ? data.lessonScores : {
        ...data.lessonScores,
        [lessonId]: { energia: energiaG, crediti: creditiTot, corrette, perfetto },
      },
      streak: newStreak,
    });

  } else if (tipo === 'boss') {
    const nonna    = getNonnaMsg(corrette);
    const bossSad  = corrette === 0;
    const energiaG = bossSad ? 0 : nonna.energy;
    const creditiTot = bossSad ? 0 : 20;

    const prev     = data.lessonScores?.['boss'];
    const prevE    = prev?.energia ?? 0;
    const prevC    = prev?.crediti ?? 0;
    const isReplay = !!prev;
    const deltaE   = bossSad ? 0 : energiaG - prevE;
    const deltaC   = bossSad ? 0 : creditiTot - prevC;
    const energiaDopo = Math.min(Math.max((data.energy ?? 25) + deltaE, 0), 200);
    const creditiDopo = Math.max((data.credits ?? 0) + deltaC, 0);

    const completedToday = [...new Set([...(data.completedToday ?? []), 'boss'])];
    const allPerfect = corrette === totDomande &&
      [1, 2, 3, 4].every(id => data.lessonScores?.[id]?.perfetto === true);
    const newStreak = updateStreak(data, completedToday);

    reward = {
      tipo: bossSad ? 'sad' : 'boss', lessonId: 'boss', corrette, totDomande,
      perfetto: corrette === totDomande, sad: bossSad,
      nonna, cibo: 'gelato', ciboEmoji: '🍦', ciboNome: 'Gelato',
      energia: energiaG, energiaPrima: data.energy ?? 25, energiaDopo,
      crediti: creditiTot, creditiPrima: data.credits ?? 0, creditiDopo,
      isReplay, deltaEnergia: deltaE, deltaCrediti: deltaC,
      menuCompleto: allPerfect,
    };

    saveRaw({
      ...data,
      energy:  energiaDopo,
      credits: creditiDopo,
      completed: bossSad ? data.completed : [...new Set([...(data.completed ?? []), 'boss'])],
      completedToday,
      lessonScores: {
        ...data.lessonScores,
        boss: { energia: energiaG, crediti: creditiTot, corrette, perfetto: corrette === totDomande },
      },
      streak: newStreak,
    });
  }

  return reward;
}

// ─── Bonus domenica ───────────────────────────────────────────────────────────
export function checkSundayBonus() {
  if (new Date().getDay() !== 0) return null;
  const data = loadProgress();
  if (!data?.streak || data.streak.bonusErogato) return null;
  const active = (data.streak.activeDays ?? []).length;
  const total  = data.streak.totalDays ?? 7;
  let creditiBonus = 0, energiaBonus = 0;
  if (active >= total)                       { creditiBonus = 50; energiaBonus = 15; }
  else if (active >= Math.ceil(total * 5/7)) { creditiBonus = 30; }
  else if (active >= Math.ceil(total * 3/7)) { creditiBonus = 10; }
  const energiaDopo = Math.min((data.energy ?? 25) + energiaBonus, 200);
  const creditiDopo = (data.credits ?? 0) + creditiBonus;
  saveRaw({ ...data, energy: energiaDopo, credits: creditiDopo, streak: { ...data.streak, bonusErogato: true } });
  return creditiBonus > 0 ? { creditiBonus, energiaBonus, active, total } : null;
}

export function completaOnboarding(livello) {
  const data = loadProgress() ?? {};
  saveRaw({ ...data, livello, onboardingDone: true });
}
