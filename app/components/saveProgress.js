// app/components/saveProgress.js
// ─── Sistema reward centralizzato — Sprint 11 ────────────────────────────────

const KEY = 'italiano-progress';

// Crediti fissi per slot lezione (dalla bibbia)
const SLOT_CREDITI = { 1: 5, 2: 5, 3: 8, 4: 8, 5: 10 };
const BOSS_CREDITI = 30;

// Energia base per slot lezione
const SLOT_ENERGIA = { 1: 10, 2: 12, 3: 15, 4: 15, 5: 18 };
const BOSS_ENERGIA_MAX = 10;

// Fallback pool cibo se il JSON non ha reward.pool
const FALLBACK_FOOD = {
  1: { emoji: '☕', nome: 'Caffe espresso', nomeEN: 'Espresso coffee' },
  2: { emoji: '🥐', nome: 'Cornetto alla crema', nomeEN: 'Cream croissant' },
  3: { emoji: '🍝', nome: 'Spaghetti al pomodoro', nomeEN: 'Spaghetti with tomato sauce' },
  4: { emoji: '🍹', nome: 'Aperol Spritz', nomeEN: 'Aperol Spritz' },
  5: { emoji: '🍕', nome: 'Pizza margherita', nomeEN: 'Margherita pizza' },
};

// Pick random item from pool
function pickRandom(pool) {
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

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
  { min: 10, energy: 15, msg: 'Perfetto! Nonna è fiera di te.',   msgEN: "Perfect! Grandma is proud of you.", speak: 'Perfetto! Nonna è fiera di te.' },
  { min: 9,  energy: 12, msg: 'Sei al mio livello ormai.',        msgEN: "You're at my level now.",           speak: 'Sei al mio livello ormai.' },
  { min: 8,  energy: 10, msg: 'Quasi perfetto! Bravissimo.',      msgEN: 'Almost perfect! Very well done.',   speak: 'Quasi perfetto! Bravissimo.' },
  { min: 7,  energy: 8,  msg: 'Ottimo lavoro. Il gelato è tuo.',  msgEN: 'Great work. Gelato is yours.',      speak: 'Ottimo lavoro. Il gelato è tuo.' },
  { min: 6,  energy: 7,  msg: 'Bene! Qualche errore, ma bene.',   msgEN: 'Good! A few mistakes, but good.',  speak: 'Bene! Qualche errore, ma bene.' },
  { min: 5,  energy: 5,  msg: 'Metà giuste. Puoi fare meglio.',   msgEN: 'Half right. You can do better.',    speak: 'Metà giuste. Puoi fare meglio.' },
  { min: 4,  energy: 4,  msg: 'Quasi. Un errore si perdona.',     msgEN: 'Almost. One mistake is forgiven.',  speak: 'Quasi. Un piccolo errore si perdona.' },
  { min: 3,  energy: 3,  msg: 'Metà strada. Studia di più.',      msgEN: 'Halfway. Study more.',              speak: 'Metà strada. Devi studiare di più.' },
  { min: 2,  energy: 2,  msg: 'Hai la testa altrove.',            msgEN: 'Your mind is elsewhere.',           speak: 'Solo due. La prossima volta impegnati.' },
  { min: 1,  energy: 1,  msg: 'Una sola. Mamma mia.',             msgEN: 'Just one. Goodness gracious.',      speak: 'Una sola. Il gelato lo prendi lo stesso.' },
  { min: 0,  energy: 0,  msg: 'Ti do il gelato lo stesso. 🍦',    msgEN: "Gelato anyway. Next time try.",     speak: 'Va bene. Ti do lo stesso il gelato. La prossima volta impegnati.' },
];

export function getNonnaMsg(score) {
  return NONNA_MSGS.find(m => score >= m.min) ?? NONNA_MSGS[NONNA_MSGS.length - 1];
}

// ─── Funzione principale ──────────────────────────────────────────────────────
// lessonReward = il campo reward dal JSON della lezione (opzionale)
export function salvaProgressi({ tipo, lessonId, corrette, totDomande, lessonReward, unita }) {
  let data = loadProgress() ?? { energy: 25, credits: 0, tickets: {}, completed: [], completedToday: [], lessonScores: {}, streak: null };

  const sad    = corrette <= 1;
  const perfetto = corrette === totDomande;
  let reward = {};
  // Composite key per multi-unit: "u2-3" o fallback al vecchio formato per unit 1
  const unitNum = parseInt(unita) || 1;
  function ckey(id) { return `u${unitNum}-${id}`; }

  if (tipo === 'lezione') {
    const lid      = typeof lessonId === 'string' ? lessonId : parseInt(lessonId);
    const slotNum  = typeof lid === 'number' ? lid : 1;
    const multi    = getMultiplier(corrette, totDomande);

    // Pool cibo: dal JSON o fallback
    const pool     = lessonReward?.pool;
    const picked   = pool ? pickRandom(pool) : FALLBACK_FOOD[slotNum] ?? FALLBACK_FOOD[1];

    // Crediti: dal JSON reward.crediti o dalla tabella SLOT_CREDITI
    const creditiSlot = lessonReward?.crediti ?? SLOT_CREDITI[slotNum] ?? 5;

    // Energia
    const energiaBase = SLOT_ENERGIA[slotNum] ?? 10;
    let   energiaG    = sad ? 0 : Math.round(energiaBase * multi);

    // Crediti: slot crediti * multiplier (proporzionale alla performance)
    const creditiBase  = sad ? 0 : Math.round(creditiSlot * multi);
    const creditiBonus = (perfetto && !sad) ? Math.round(creditiSlot * 0.5) : 0;
    const creditiTot   = creditiBase + creditiBonus;

    const prev      = data.lessonScores?.[lid];
    const prevE     = prev?.energia ?? 0;
    const prevC     = prev?.crediti ?? 0;
    const isReplay  = !!prev;
    const deltaE    = sad ? 0 : energiaG - prevE;
    const deltaC    = sad ? 0 : creditiTot - prevC;
    const energiaDopo = Math.min(Math.max((data.energy ?? 25) + deltaE, 0), 200);
    const creditiDopo = Math.max((data.credits ?? 0) + deltaC, 0);

    const completedToday = [...new Set([...(data.completedToday ?? []), lid])];
    const allPerfect = !sad && perfetto && [1, 2, 3, 4, 5, 'boss'].every(id => {
      if (id === lid) return true;
      return data.lessonScores?.[id]?.perfetto === true;
    });
    const newStreak = updateStreak(data, completedToday);

    reward = {
      tipo: sad ? 'sad' : 'lezione', lessonId: lid, corrette, totDomande, perfetto, sad,
      cibo: sad ? 'nessuno' : (picked.nome || 'cibo'),
      ciboEmoji: sad ? '😔' : (picked.emoji || '🍽️'),
      ciboNome:  sad ? '—'  : (picked.nome || 'Cibo'),
      ciboNomeEN: sad ? '—' : (picked.nomeEN || picked.nome || 'Food'),
      slot: lessonReward?.slot || 'generico',
      energia: energiaG,
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
      completed: sad ? data.completed : [...new Set([...(data.completed ?? []), ckey(lid)])],
      completedToday,
      lessonScores: sad ? data.lessonScores : {
        ...data.lessonScores,
        [ckey(lid)]: { energia: energiaG, crediti: creditiTot, corrette, perfetto },
      },
      streak: newStreak,
    });

  } else if (tipo === 'boss') {
    const nonna    = getNonnaMsg(corrette);
    const bossSad  = corrette === 0;
    const energiaG = bossSad ? 0 : nonna.energy;
    const creditiTot = bossSad ? 0 : (lessonReward?.crediti ?? BOSS_CREDITI);

    // Pool dolce dal JSON boss o fallback gelato
    const pool   = lessonReward?.pool;
    const picked = pool ? pickRandom(pool) : { emoji: '🍦', nome: 'Gelato alla crema', nomeEN: 'Cream gelato' };

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
      [1, 2, 3, 4, 5].every(id => data.lessonScores?.[id]?.perfetto === true);
    const newStreak = updateStreak(data, completedToday);

    reward = {
      tipo: bossSad ? 'sad' : 'boss', lessonId: 'boss', corrette, totDomande,
      perfetto: corrette === totDomande, sad: bossSad,
      nonna,
      cibo: picked.nome || 'gelato',
      ciboEmoji: picked.emoji || '🍦',
      ciboNome: picked.nome || 'Gelato',
      ciboNomeEN: picked.nomeEN || 'Gelato',
      slot: 'dolce',
      energia: energiaG, energiaPrima: data.energy ?? 25, energiaDopo,
      crediti: creditiTot, creditiPrima: data.credits ?? 0, creditiDopo,
      isReplay, deltaEnergia: deltaE, deltaCrediti: deltaC,
      menuCompleto: allPerfect,
    };

    saveRaw({
      ...data,
      energy:  energiaDopo,
      credits: creditiDopo,
      completed: bossSad ? data.completed : [...new Set([...(data.completed ?? []), ckey('boss')])],
      completedToday,
      lessonScores: {
        ...data.lessonScores,
        [ckey('boss')]: { energia: energiaG, crediti: creditiTot, corrette, perfetto: corrette === totDomande },
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
