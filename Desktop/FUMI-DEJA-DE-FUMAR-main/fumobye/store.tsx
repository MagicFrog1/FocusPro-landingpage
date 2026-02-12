import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { clearStorage, loadJSON, saveJSON } from './storage';
import type { FumoByeMood, FumoByeReason, FumoByeState } from './types';
import { calcRateCentsPerSecond, calcSavedCentsNow, calculateFumiEvolution, DAY_MS, toISODateLocal } from './utils';

type FumoByeContextValue = {
  ready: boolean;
  state: FumoByeState;
  nowTs: number;
  savedCentsNow: number;
  availableCentsNow: number;
  caprichosSpentCents: number;
  rateCentsPerSecond: number;
  daysSmokeFree: number;
  pendingConfetti: boolean;
  clearConfetti: () => void;
  actions: {
    completeOnboarding: (args: {
      cigsPerDay: number;
      packPriceCents: number;
      reason: FumoByeReason;
      age: number;
      yearsSmoking: number;
    }) => void;
    updateSettings: (partial: Partial<FumoByeState['settings']>) => void;
    markCheckin: (mood: FumoByeMood) => void;
    resetProgress: () => void;
    setPremiumActive: (active: boolean) => void;
    buyCapricho: (priceCents: number) => boolean;
    buyPet: (petId: string, priceCents: number) => boolean;
    setActivePet: (petId: string | null) => void;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    deleteAccount: () => Promise<void>;
    registerCigarette: (dateArg?: string, amount?: number) => void;
  };
};

const initialState = (nowTs: number): FumoByeState => ({
  schemaVersion: 2,
  onboardingCompleted: false,
  createdAtTs: nowTs,
  isLoggedIn: false,
  email: null,
  settings: {
    cigsPerDay: 20,
    packPriceCents: 500, // 5€
    cigsPerPack: 20,
    reason: null,
    currency: 'EUR',
    motivationBeast: false,
    age: null,
    yearsSmoking: null,
  },
  progress: {
    baseCents: 0,
    baseAtTs: nowTs,
    smokeFreeStartTs: nowTs,
    lastMilestoneCents: 0,
    bestStreakDays: 0,
    caprichosSpentCents: 0,
    cigarettesSmoked: {},
    cigarettesSpentCents: 0,
    fumiEvolution: {
      currentLevel: 'enfermo',
      progressNumerator: 0,
      progressDenominator: 1,
      lastCheckedDate: toISODateLocal(nowTs),
      streakDays: 0,
      lastSuccessDate: null,
    },
    ownedPets: [],
    activePetId: null,
  },
  checkin: {
    lastCheckinDate: null,
    lastMood: null,
  },
  premium: {
    active: false,
  },
});

function normalizeLoadedState(raw: any, nowTs: number): FumoByeState {
  // Migración suave desde schemaVersion 1 (o estados parciales)
  const fallback = initialState(nowTs);
  const schemaVersion = raw?.schemaVersion;

  const settings = {
    ...fallback.settings,
    ...(raw?.settings ?? {}),
  };

  const progress = {
    ...fallback.progress,
    ...(raw?.progress ?? {}),
    cigarettesSmoked: raw?.progress?.cigarettesSmoked ?? {},
    cigarettesSpentCents: raw?.progress?.cigarettesSpentCents ?? 0,
    fumiEvolution: {
      currentLevel: (raw?.progress?.fumiEvolution?.currentLevel ?? 'enfermo') as any,
      progressNumerator: raw?.progress?.fumiEvolution?.progressNumerator ?? 0,
      progressDenominator: raw?.progress?.fumiEvolution?.progressDenominator ?? 1,
      lastCheckedDate: raw?.progress?.fumiEvolution?.lastCheckedDate ?? toISODateLocal(nowTs),
      streakDays: raw?.progress?.fumiEvolution?.streakDays ?? 0,
      lastSuccessDate: raw?.progress?.fumiEvolution?.lastSuccessDate ?? null,
    },
    ownedPets: raw?.progress?.ownedPets ?? [],
    activePetId: raw?.progress?.activePetId ?? null,
  };

  const checkin = {
    ...fallback.checkin,
    ...(raw?.checkin ?? {}),
  };

  const premium = {
    ...fallback.premium,
    ...(raw?.premium ?? {}),
  };

  const normalized: FumoByeState = {
    schemaVersion: 2,
    onboardingCompleted: !!raw.onboardingCompleted,
    createdAtTs: raw.createdAtTs || nowTs,
    isLoggedIn: !!raw.isLoggedIn,
    email: raw.email || null,
    settings,
    progress,
    checkin,
    premium,
  };

  // Si venía de v1, garantizamos defaults nuevos
  if (schemaVersion === 1 || schemaVersion == null) {
    normalized.settings.currency = (raw?.settings?.currency ?? 'EUR') as any;
    normalized.settings.motivationBeast = !!raw?.settings?.motivationBeast;
    normalized.settings.age = raw?.settings?.age ?? null;
    normalized.settings.yearsSmoking = raw?.settings?.yearsSmoking ?? null;
    normalized.progress.bestStreakDays = Number(raw?.progress?.bestStreakDays ?? 0) || 0;
  }

  return normalized;
}

const FumoByeContext = createContext<FumoByeContextValue | null>(null);

export function useFumoBye() {
  const ctx = React.useContext(FumoByeContext);
  if (!ctx) throw new Error('useFumoBye debe usarse dentro de <FumoByeProvider>');
  return ctx;
}

export function FumoByeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<FumoByeState>(() => initialState(Date.now()));
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [pendingConfetti, setPendingConfetti] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let alive = true;
    (async () => {
      const now = Date.now();
      const loaded = await loadJSON<any>(initialState(now) as any);
      if (!alive) return;
      setState(normalizeLoadedState(loaded, now));
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Tick 1s para contador real-time
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ready]);

  // Verificar evolución de Fumi diariamente
  useEffect(() => {
    if (!ready) return;
    const today = toISODateLocal(nowTs);
    const fumiEvolution = state.progress.fumiEvolution;

    // Si ya se verificó hoy, no hacer nada
    if (fumiEvolution?.lastCheckedDate === today) return;

    setState((s) => {
      const evolution = s.progress.fumiEvolution ?? {
        currentLevel: 'enfermo',
        progressNumerator: 0,
        progressDenominator: 1,
        lastCheckedDate: today,
        streakDays: 0,
        lastSuccessDate: null,
      };

      const evolutionResult = calculateFumiEvolution({
        currentLevel: evolution.currentLevel,
        progressNumerator: evolution.progressNumerator,
        progressDenominator: evolution.progressDenominator,
        streakDays: evolution.streakDays,
        lastSuccessDate: evolution.lastSuccessDate,
        lastCheckedDate: evolution.lastCheckedDate,
        cigarettesSmoked: s.progress.cigarettesSmoked ?? {},
        cigsPerDay: s.settings.cigsPerDay,
        today,
      });

      return {
        ...s,
        progress: {
          ...s.progress,
          fumiEvolution: {
            ...evolution,
            ...evolutionResult,
            lastCheckedDate: today,
          },
        },
      };
    });
  }, [ready, nowTs, state.progress.fumiEvolution?.lastCheckedDate, state.progress.cigarettesSmoked, state.settings.cigsPerDay]);

  // Persistencia: debounce muy simple (microtask) para no escribir 60 veces/segundo.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      saveJSON(stateRef.current).catch(() => { });
    }, 50);
    return () => clearTimeout(t);
  }, [ready, state]);

  const rateCentsPerSecond = useMemo(() => calcRateCentsPerSecond(state.settings), [state.settings]);

  // Ahorro bruto (sin restar cigarros fumados)
  const savedCentsGross = useMemo(
    () =>
      calcSavedCentsNow({
        baseCents: state.progress.baseCents,
        baseAtTs: state.progress.baseAtTs,
        nowTs,
        rateCentsPerSecond,
      }),
    [state.progress.baseAtTs, state.progress.baseCents, nowTs, rateCentsPerSecond]
  );

  // Ahorro neto (restando cigarros fumados)
  const savedCentsNow = useMemo(
    () => Math.max(0, savedCentsGross - (state.progress.cigarettesSpentCents ?? 0)),
    [savedCentsGross, state.progress.cigarettesSpentCents]
  );

  const caprichosSpentCents = useMemo(() => Math.max(0, state.progress.caprichosSpentCents ?? 0), [state.progress.caprichosSpentCents]);

  const availableCentsNow = useMemo(() => Math.max(0, savedCentsNow - caprichosSpentCents), [savedCentsNow, caprichosSpentCents]);

  const daysSmokeFree = useMemo(() => {
    if (!state.onboardingCompleted) return 0;
    return Math.max(0, Math.floor((nowTs - state.progress.smokeFreeStartTs) / DAY_MS) + 1);
  }, [nowTs, state.onboardingCompleted, state.progress.smokeFreeStartTs]);

  // Récord histórico: si superas tu mejor racha, lo persistimos.
  useEffect(() => {
    if (!ready || !state.onboardingCompleted) return;
    const best = state.progress.bestStreakDays ?? 0;
    if (daysSmokeFree > best) {
      setState((s) => ({
        ...s,
        progress: { ...s.progress, bestStreakDays: daysSmokeFree },
      }));
    }
  }, [ready, state.onboardingCompleted, daysSmokeFree, state.progress.bestStreakDays]);

  // Hito de confeti cada 10€ (1000 cents)
  useEffect(() => {
    if (!ready || !state.onboardingCompleted) return;
    const milestone = Math.floor(savedCentsNow / 1000) * 1000;
    if (milestone > 0 && milestone > state.progress.lastMilestoneCents) {
      setPendingConfetti(true);
      setState((s) => ({
        ...s,
        progress: { ...s.progress, lastMilestoneCents: milestone },
      }));
    }
  }, [ready, savedCentsNow, state.onboardingCompleted, state.progress.lastMilestoneCents]);

  const clearConfetti = useCallback(() => setPendingConfetti(false), []);

  const completeOnboarding = useCallback(
    (args: { cigsPerDay: number; packPriceCents: number; reason: FumoByeReason; age: number; yearsSmoking: number }) => {
      const ts = Date.now();
      setState((s) => ({
        ...s,
        onboardingCompleted: true,
        settings: {
          ...s.settings,
          cigsPerDay: args.cigsPerDay,
          packPriceCents: args.packPriceCents,
          reason: args.reason,
          age: args.age,
          yearsSmoking: args.yearsSmoking,
        },
        progress: {
          ...s.progress,
          baseCents: 0,
          baseAtTs: ts,
          smokeFreeStartTs: ts,
          lastMilestoneCents: 0,
          caprichosSpentCents: 0,
          cigarettesSmoked: {},
          cigarettesSpentCents: 0,
          ownedPets: [],
          activePetId: null,
        },
      }));
    },
    []
  );

  const updateSettings = useCallback((partial: Partial<FumoByeState['settings']>) => {
    const ts = Date.now();
    setState((s) => {
      // Si cambia la tasa, consolidamos el ahorro actual como base y reiniciamos el "reloj"
      const prevRate = calcRateCentsPerSecond(s.settings);
      const currentSaved = calcSavedCentsNow({
        baseCents: s.progress.baseCents,
        baseAtTs: s.progress.baseAtTs,
        nowTs: ts,
        rateCentsPerSecond: prevRate,
      });
      return {
        ...s,
        settings: { ...s.settings, ...partial },
        progress: { ...s.progress, baseCents: currentSaved, baseAtTs: ts },
      };
    });
  }, []);

  const markCheckin = useCallback((mood: FumoByeMood) => {
    const today = toISODateLocal(Date.now());
    setState((s) => ({
      ...s,
      checkin: { lastCheckinDate: today, lastMood: mood },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const ts = Date.now();
    setState((s) => {
      const currentStreak = s.onboardingCompleted ? Math.max(0, Math.floor((ts - s.progress.smokeFreeStartTs) / DAY_MS) + 1) : 0;
      const best = Math.max(s.progress.bestStreakDays ?? 0, currentStreak);
      return {
        ...s,
        progress: {
          ...s.progress,
          baseCents: 0,
          baseAtTs: ts,
          smokeFreeStartTs: ts,
          lastMilestoneCents: 0,
          bestStreakDays: best,
          caprichosSpentCents: 0,
          cigarettesSmoked: {},
          cigarettesSpentCents: 0,
          ownedPets: s.progress.ownedPets ?? [],
          activePetId: s.progress.activePetId ?? null,
          fumiEvolution: {
            currentLevel: 'enfermo',
            progressNumerator: 0,
            progressDenominator: 1,
            lastCheckedDate: toISODateLocal(ts),
            streakDays: 0,
            lastSuccessDate: null,
          },
        },
      };
    });
  }, []);

  const setPremiumActive = useCallback((active: boolean) => {
    setState((s) => ({ ...s, premium: { active } }));
  }, []);

  const buyCapricho = useCallback((priceCents: number) => {
    const price = Math.max(0, Math.floor(priceCents));
    if (!price) return false;
    const ts = Date.now();
    setNowTs(ts);

    const s = stateRef.current;
    const rate = calcRateCentsPerSecond(s.settings);
    const savedNow = calcSavedCentsNow({
      baseCents: s.progress.baseCents,
      baseAtTs: s.progress.baseAtTs,
      nowTs: ts,
      rateCentsPerSecond: rate,
    });
    const spent = Math.max(0, s.progress.caprichosSpentCents ?? 0);
    const available = Math.max(0, savedNow - spent);
    if (available < price) return false;

    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        caprichosSpentCents: Math.max(0, (prev.progress.caprichosSpentCents ?? 0) + price),
      },
    }));
    return true;
  }, []);

  const buyPet = useCallback((petId: string, priceCents: number) => {
    const price = Math.max(0, Math.floor(priceCents));
    const ts = Date.now();
    setNowTs(ts);

    const s = stateRef.current;
    const rate = calcRateCentsPerSecond(s.settings);
    const savedNow = calcSavedCentsNow({
      baseCents: s.progress.baseCents,
      baseAtTs: s.progress.baseAtTs,
      nowTs: ts,
      rateCentsPerSecond: rate,
    });
    const spent = Math.max(0, s.progress.caprichosSpentCents ?? 0);
    const available = Math.max(0, savedNow - spent);

    if (available < price) return false;
    if (s.progress.ownedPets?.includes(petId)) return false;

    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        caprichosSpentCents: Math.max(0, (prev.progress.caprichosSpentCents ?? 0) + price),
        ownedPets: [...(prev.progress.ownedPets ?? []), petId],
        activePetId: petId, // Se selecciona automáticamente al comprar
      },
    }));
    return true;
  }, []);

  const setActivePet = useCallback((petId: string | null) => {
    setState((s) => ({
      ...s,
      progress: {
        ...s.progress,
        activePetId: petId,
      },
    }));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Demo: cualquier email/password funciona (en producción sería una llamada API)
    await new Promise((resolve) => setTimeout(resolve, 600));
    setState((s) => ({
      ...s,
      isLoggedIn: true,
      email,
    }));
    return true;
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({
      ...s,
      isLoggedIn: false,
      email: null,
    }));
  }, []);

  const deleteAccount = useCallback(async (): Promise<void> => {
    // Borra todo y resetea el onboarding
    const now = Date.now();
    const fresh = initialState(now);
    setState(fresh);
    await clearStorage().catch(() => { });
    await saveJSON(fresh).catch(() => { });
  }, []);

  const registerCigarette = useCallback((dateArg?: string, amount: number = 1) => {
    const ts = Date.now();
    const today = dateArg || toISODateLocal(ts);
    const costPerCig = state.settings.packPriceCents / state.settings.cigsPerPack;

    setState((s) => {
      const currentCount = s.progress.cigarettesSmoked?.[today] ?? 0;
      const newCount = Math.max(0, currentCount + amount);
      const costThisAction = Math.round(costPerCig * amount);
      const newSpent = Math.max(0, (s.progress.cigarettesSpentCents ?? 0) + costThisAction);

      // Calcular el ahorro acumulado hasta ahora antes de restar/sumar el costo
      const currentSavedCents = calcSavedCentsNow({
        baseCents: s.progress.baseCents,
        baseAtTs: s.progress.baseAtTs,
        nowTs: ts,
        rateCentsPerSecond: calcRateCentsPerSecond(s.settings),
      });

      // Restar/Sumar el costo de la acción del ahorro
      const newBaseCents = Math.max(0, currentSavedCents - costThisAction);

      // Calcular nueva evolución de Fumi
      const fumiEvolution = s.progress.fumiEvolution ?? {
        currentLevel: 'enfermo',
        progressNumerator: 0,
        progressDenominator: 1,
        lastCheckedDate: today,
        streakDays: 0,
        lastSuccessDate: null,
      };

      const updatedCigarettes = {
        ...(s.progress.cigarettesSmoked ?? {}),
        [today]: newCount,
      };

      const evolutionResult = calculateFumiEvolution({
        currentLevel: fumiEvolution.currentLevel,
        progressNumerator: fumiEvolution.progressNumerator,
        progressDenominator: fumiEvolution.progressDenominator,
        streakDays: fumiEvolution.streakDays,
        lastSuccessDate: fumiEvolution.lastSuccessDate,
        lastCheckedDate: fumiEvolution.lastCheckedDate,
        cigarettesSmoked: updatedCigarettes,
        cigsPerDay: s.settings.cigsPerDay,
        today,
      });

      // SIEMPRE resetear el tiempo sin fumar cuando se añade un cigarro
      return {
        ...s,
        progress: {
          ...s.progress,
          cigarettesSmoked: updatedCigarettes,
          cigarettesSpentCents: newSpent,
          // Resetear el tiempo sin fumar cada vez que se añade un cigarro
          smokeFreeStartTs: ts,
          // Consolidar el ahorro restando el costo del cigarro
          baseCents: newBaseCents,
          baseAtTs: ts,
          fumiEvolution: {
            ...fumiEvolution,
            ...evolutionResult,
            lastCheckedDate: today,
          },
        },
      };
    });
  }, [state.settings.packPriceCents, state.settings.cigsPerPack, state.settings.cigsPerDay]);

  const appStartedAt = state.createdAtTs ?? state.progress.baseAtTs;
  const appDays = Math.max(1, Math.floor((nowTs - appStartedAt) / DAY_MS) + 1);

  const value = useMemo<FumoByeContextValue>(
    () => ({
      ready,
      state,
      nowTs,
      savedCentsNow,
      availableCentsNow,
      caprichosSpentCents,
      rateCentsPerSecond,
      daysSmokeFree,
      pendingConfetti,
      clearConfetti,
      actions: {
        completeOnboarding,
        updateSettings,
        markCheckin,
        resetProgress,
        setPremiumActive,
        buyCapricho,
        buyPet,
        setActivePet,
        login,
        logout,
        deleteAccount,
        registerCigarette,
      },
      appDays,
    }),
    [
      ready,
      state,
      nowTs,
      savedCentsNow,
      availableCentsNow,
      caprichosSpentCents,
      rateCentsPerSecond,
      daysSmokeFree,
      pendingConfetti,
      clearConfetti,
      completeOnboarding,
      updateSettings,
      markCheckin,
      resetProgress,
      setPremiumActive,
      buyCapricho,
      buyPet,
      setActivePet,
      login,
      logout,
      deleteAccount,
      registerCigarette,
      appDays,
    ]
  );

  return <FumoByeContext.Provider value={value}>{children}</FumoByeContext.Provider>;
}


