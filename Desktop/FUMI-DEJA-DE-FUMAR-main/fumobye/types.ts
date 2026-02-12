export type FumoByeReason = 'dinero' | 'salud' | 'aliento';
export type FumoByeMood = 'zen' | 'ansioso' | 'rojo';

export type FumoByeCurrency = 'EUR' | 'USD' | 'GBP' | 'MXN';

export type FumoByeSettings = {
  cigsPerDay: number;
  packPriceCents: number;
  cigsPerPack: number;
  reason: FumoByeReason | null;
  currency: FumoByeCurrency;
  motivationBeast: boolean;
  age: number | null;
  yearsSmoking: number | null;
};

export type FumiLevel = 'enfermo' | 'bebeSano' | 'deporte' | 'rico' | 'pulmonDiamante' | 'dios';

export type FumoByeProgress = {
  /**
   * Ahorro acumulado "base" guardado en disco.
   * El resto se calcula en tiempo real desde `baseAtTs` usando la tasa actual.
   */
  baseCents: number;
  /** Timestamp (ms) cuando se fijó baseCents (o se cambiaron ajustes). */
  baseAtTs: number;
  /** Timestamp (ms) inicio de la racha sin fumar. */
  smokeFreeStartTs: number;
  /** Último hito de confeti (en céntimos), para no repetirlo. */
  lastMilestoneCents: number;
  /** Récord histórico de días (mejor racha), persistido. */
  bestStreakDays: number;
  /**
   * Total gastado en caprichos (en céntimos).
   * Esto NO reduce el ahorro histórico (`savedCentsNow`), sólo el saldo gastable.
   */
  caprichosSpentCents: number;
  /**
   * Registro de cigarros fumados por fecha (YYYY-MM-DD).
   * Estrategia de reducción progresiva: permite registrar consumo sin resetear la racha.
   */
  cigarettesSmoked: Record<string, number>;
  /**
   * Total de dinero gastado en cigarros fumados (en céntimos).
   * Se resta del ahorro neto para mostrar el balance real.
   */
  cigarettesSpentCents: number;
  /**
   * Sistema de evolución de Fumi basado en consumo
   */
  fumiEvolution: {
    /** Nivel actual de Fumi */
    currentLevel: FumiLevel;
    /** Progreso fraccional hacia el siguiente nivel (numerador/denominador) */
    progressNumerator: number;
    progressDenominator: number;
    /** Última fecha verificada (YYYY-MM-DD) */
    lastCheckedDate: string;
    /** Rachas de días cumpliendo objetivos */
    streakDays: number;
    /** Última fecha que se cumplió el objetivo (YYYY-MM-DD) */
    lastSuccessDate: string | null;
  };
  /** Mascotas desbloqueadas/compradas */
  ownedPets: string[];
  /** Mascota seleccionada actualmente */
  activePetId: string | null;
};

export type FumoByeCheckin = {
  /** YYYY-MM-DD */
  lastCheckinDate: string | null;
  lastMood: FumoByeMood | null;
};

export type FumoByePremium = {
  active: boolean;
};

export type FumoByeAuth = {
  isLoggedIn: boolean;
  email: string | null;
};

export type FumoByeState = {
  schemaVersion: 2;
  onboardingCompleted: boolean;
  /** Momento en el que el usuario empezó a usar la app (para calcular días totales de uso). */
  createdAtTs: number;
  /** Estado de autenticación simple (demo) */
  isLoggedIn: boolean;
  email: string | null;
  settings: FumoByeSettings;
  progress: FumoByeProgress;
  checkin: FumoByeCheckin;
  premium: FumoByePremium;
};


