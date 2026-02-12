import type { FumiLevel, FumoByeCurrency, FumoByeSettings } from './types';

export const DAY_MS = 24 * 60 * 60 * 1000;

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function formatEurosFromCents(cents: number) {
  return formatMoneyFromCents(cents, 'EUR');
}

export function formatMoneyFromCents(cents: number, currency: FumoByeCurrency) {
  const value = cents / 100;
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
  });
}

export function currencySymbol(currency: FumoByeCurrency) {
  // Preferimos símbolo compacto (para UI). En locales ES, a veces USD muestra "US$".
  // Mapeamos manualmente para controles/inputs.
  const map: Record<FumoByeCurrency, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    MXN: '$',
  };
  return map[currency] ?? '€';
}

export function toISODateLocal(ts: number) {
  // YYYY-MM-DD en hora local
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function calcDailySpendCents(settings: FumoByeSettings) {
  const packsPerDay = settings.cigsPerPack > 0 ? settings.cigsPerDay / settings.cigsPerPack : 0;
  return Math.max(0, Math.round(packsPerDay * settings.packPriceCents));
}

export function calcRateCentsPerSecond(settings: FumoByeSettings) {
  return calcDailySpendCents(settings) / 86400;
}

export function calcSavedCentsNow(args: {
  baseCents: number;
  baseAtTs: number;
  nowTs: number;
  rateCentsPerSecond: number;
}) {
  const { baseCents, baseAtTs, nowTs, rateCentsPerSecond } = args;
  const deltaSeconds = Math.max(0, (nowTs - baseAtTs) / 1000);
  // `Math.round` hace que el contador se sienta más "real-time" (menos "saltos" por el floor).
  return Math.max(0, Math.round(baseCents + deltaSeconds * rateCentsPerSecond));
}

/**
 * Calcula estadísticas semanales de consumo de cigarros
 */
export function getWeeklyStats(cigarettesSmoked: Record<string, number>, nowTs: number) {
  const today = toISODateLocal(nowTs);
  const stats = {
    today: cigarettesSmoked[today] ?? 0,
    weekTotal: 0,
    weekAverage: 0,
    weekDays: [] as Array<{ date: string; count: number }>,
  };

  // Obtener últimos 7 días
  for (let i = 0; i < 7; i++) {
    const date = new Date(nowTs);
    date.setDate(date.getDate() - i);
    const dateStr = toISODateLocal(date.getTime());
    const count = cigarettesSmoked[dateStr] ?? 0;
    stats.weekTotal += count;
    stats.weekDays.unshift({ date: dateStr, count });
  }

  stats.weekAverage = stats.weekTotal / 7;

  return stats;
}

/**
 * Calcula la evolución de Fumi basada en el consumo de cigarros
 */
export function calculateFumiEvolution(args: {
  currentLevel: FumiLevel;
  progressNumerator: number;
  progressDenominator: number;
  streakDays: number;
  lastSuccessDate: string | null;
  lastCheckedDate: string;
  cigarettesSmoked: Record<string, number>;
  cigsPerDay: number;
  today: string;
}): {
  newLevel: FumiLevel;
  newProgressNumerator: number;
  newProgressDenominator: number;
  newStreakDays: number;
  newLastSuccessDate: string | null;
} {
  const {
    currentLevel,
    progressNumerator,
    progressDenominator,
    streakDays,
    lastSuccessDate,
    lastCheckedDate,
    cigarettesSmoked,
    cigsPerDay,
    today,
  } = args;

  // Determinar el denominador objetivo base para el nivel actual
  let targetDen = 1;
  switch (currentLevel) {
    case 'enfermo':
    case 'bebeSano': targetDen = 3; break;
    case 'deporte': targetDen = 3; break;
    case 'rico': targetDen = 5; break;
    case 'pulmonDiamante': targetDen = 10; break;
    case 'dios': targetDen = 15; break;
  }

  // Si el denominador actual es 1 (valor por defecto o reset), lo inicializamos al objetivo del nivel
  let currentDen = progressDenominator <= 1 ? targetDen : progressDenominator;

  const isDailyCheck = lastCheckedDate !== today;

  const cigsToday = Math.round(cigarettesSmoked[today] ?? 0);
  const mediaCigs = Math.round(cigsPerDay);

  let newLevel: FumiLevel = currentLevel;
  let newProgressNumerator = progressNumerator;
  let newProgressDenominator = currentDen;
  let newStreakDays = streakDays;
  let newLastSuccessDate = lastSuccessDate;

  // 1. IMPACTO NEGATIVO INMEDIATO (Si fuma demasiado hoy)
  if (cigsToday >= mediaCigs && mediaCigs > 0) {
    if (currentLevel !== 'enfermo') {
      const levelOrder: FumiLevel[] = ['enfermo', 'bebeSano', 'deporte', 'rico', 'pulmonDiamante', 'dios'];
      const currentIndex = levelOrder.indexOf(currentLevel);
      if (currentIndex > 0) {
        newLevel = levelOrder[currentIndex - 1]; // Baja un nivel
      }
      newProgressNumerator = 0;
      // Al bajar de nivel, el denominador se pondrá bien en el próximo tick o daily check
      newProgressDenominator = 1;
      newStreakDays = 0;
      newLastSuccessDate = null;
    }
    return { newLevel, newProgressNumerator, newProgressDenominator, newStreakDays, newLastSuccessDate };
  }

  // 2. PROGRESO DIARIO (Solo ocurre al cambiar de día)
  if (isDailyCheck) {
    // Calculamos qué día acaba de terminar (ayer)
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = toISODateLocal(yesterdayDate.getTime());

    const cigsYesterday = Math.round(cigarettesSmoked[yesterday] ?? 0);
    const porcentajeYesterday = mediaCigs > 0 ? (cigsYesterday / mediaCigs) * 100 : 100;

    let success = false;

    // Definir éxito según nivel actual
    switch (currentLevel) {
      case 'enfermo':
      case 'bebeSano':
        success = cigsYesterday < mediaCigs;
        break;
      case 'deporte':
        success = porcentajeYesterday <= 70;
        break;
      case 'rico':
        success = porcentajeYesterday <= 50;
        break;
      case 'pulmonDiamante':
        success = porcentajeYesterday <= 25;
        break;
      case 'dios':
        success = cigsYesterday === 0;
        break;
    }

    if (success) {
      newProgressNumerator++;
      newStreakDays++;
      newLastSuccessDate = yesterday;

      // Subir nivel?
      if (newProgressNumerator >= currentDen) {
        const levelOrder: FumiLevel[] = ['enfermo', 'bebeSano', 'deporte', 'rico', 'pulmonDiamante', 'dios'];
        const currentIndex = levelOrder.indexOf(currentLevel);
        if (currentIndex < levelOrder.length - 1) {
          newLevel = levelOrder[currentIndex + 1];
        }
        newProgressNumerator = 0;
        newProgressDenominator = 1; // Se inicializará en el próximo tick del nivel
      }
    } else {
      // Si no fue éxito ayer, perdemos progreso
      if (newProgressNumerator > 0) {
        newProgressNumerator--;
      }
      newStreakDays = 0;
    }
  }

  return {
    newLevel,
    newProgressNumerator,
    newProgressDenominator: newProgressDenominator === 1 ? targetDen : newProgressDenominator,
    newStreakDays,
    newLastSuccessDate,
  };
}

/**
 * Calcula las métricas de salud basadas en el perfil y tiempo sin fumar
 */
export function calculateHealthMetrics(args: {
  elapsedDays: number;
  cigsPerDay: number;
  yearsSmoking: number | null;
  age: number | null;
  cigarettesToday: number;
}) {
  const { elapsedDays, cigsPerDay, yearsSmoking, age, cigarettesToday } = args;

  const years = yearsSmoking ?? 0;
  const ageSafe = age ?? 30;
  const dailyCigs = Math.max(0, cigsPerDay);

  // Riesgo inicial según perfil (de 0 a 100)
  const yearsScore = Math.min(45, years * 1.5);
  const cigsScore = Math.min(30, (dailyCigs / 20) * 20);
  const ageScore = Math.min(15, Math.max(0, ageSafe - 25) * 0.4);
  const riskScore = Math.min(90, yearsScore + cigsScore + ageScore);

  const calculateMetric = (metric: 'lungs' | 'taste' | 'oxygen' | 'energy') => {
    let maxPenalty = 0;
    let recoveryRate = 0;
    let minBase = 30;

    switch (metric) {
      case 'lungs':
        maxPenalty = 60;
        recoveryRate = 0.015; // Muy lento (mejoría en meses/años)
        minBase = 25;
        break;
      case 'taste':
        maxPenalty = 45;
        recoveryRate = 0.12; // Rápido (mejoría en días/semanas)
        minBase = 35;
        break;
      case 'oxygen':
        maxPenalty = 40;
        recoveryRate = 0.25; // Muy rápido (mejoría en horas/días)
        minBase = 40;
        break;
      case 'energy':
        maxPenalty = 55;
        recoveryRate = 0.05; // Medio
        minBase = 30;
        break;
    }

    const effectivePenalty = Math.min(maxPenalty, riskScore);
    const startHealth = Math.max(minBase, 100 - effectivePenalty);

    // Recuperación base por tiempo sin fumar
    // elapsedDays es el tiempo real desde el último cigarro.
    const recovered = Math.min(100 - startHealth, elapsedDays * recoveryRate * 10);
    let currentHealth = startHealth + recovered;

    // Penalización por consumo de hoy (impacto agudo inmediato)
    const dailyImpact = Math.min(35, cigarettesToday * 4);
    currentHealth = Math.max(5, currentHealth - dailyImpact);

    return Math.round(currentHealth);
  };

  return {
    oxigeno: calculateMetric('oxygen'),
    energia: calculateMetric('energy'),
    gusto: calculateMetric('taste'),
    pulmones: calculateMetric('lungs'),
  };
}
