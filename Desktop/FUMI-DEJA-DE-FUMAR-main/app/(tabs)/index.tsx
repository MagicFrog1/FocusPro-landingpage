import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Link, router } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import { ThemedText } from '@/components/themed-text';
import { ZenScreen } from '@/components/zen-screen';
import { Palette } from '@/constants/theme';
import { MASCOTAS } from '@/fumobye/caprichos';
import { useFumoBye } from '@/fumobye/store';
import { DAY_MS, toISODateLocal } from '@/fumobye/utils';
import { Lock, Plus, X } from 'lucide-react-native';

function hashString(s: string) {
  // hash simple y estable para elegir mensaje del día
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}


export default function DashboardScreen() {
  const { ready, state, nowTs, savedCentsNow, daysSmokeFree, pendingConfetti, clearConfetti, actions } = useFumoBye();
  const pushedRef = useRef({ onboarding: false, checkin: false });
  const prevEuroRef = useRef<number>(Math.floor(savedCentsNow / 100));
  const [glowKey, setGlowKey] = useState(0);
  const [showFumiLevels, setShowFumiLevels] = useState(false);

  // Consumo de hoy
  const today = toISODateLocal(nowTs);
  const cigarettesToday = state.progress.cigarettesSmoked?.[today] ?? 0;

  // Evolución de Fumi según consumo (nuevo sistema)
  const fumiEvolution = useMemo(() => {
    const fumiLevel = state.progress.fumiEvolution?.currentLevel ?? 'enfermo';
    const progressNum = state.progress.fumiEvolution?.progressNumerator ?? 0;
    const progressDen = state.progress.fumiEvolution?.progressDenominator ?? 1;

    const levelMap: Record<string, { stage: string; image: any; name: string; description: string }> = {
      enfermo: { stage: 'enfermo', image: require('@/assets/images/fumienfermo.png'), name: 'Fumi Enfermo', description: 'Acabas de empezar. Cada día sin fumar te hace más fuerte.' },
      bebeSano: { stage: 'peluche', image: require('@/assets/images/fumisentadopeluche.png'), name: 'Fumi Bebe Sano', description: '¡Tu primer día completo! Sigue así.' },
      deporte: { stage: 'deporte', image: require('@/assets/images/fumideporte.png'), name: 'Fumi Deporte', description: '¡Una semana completa! Ya sientes la diferencia.' },
      rico: { stage: 'rico', image: require('@/assets/images/fumirico (2).png'), name: 'Fumi Rico', description: '¡Un mes sin fumar! Tu cartera y tu salud lo agradecen.' },
      pulmonDiamante: { stage: 'elegante', image: require('@/assets/images/fumielegante (2).png'), name: 'Fumi Pulmón de Diamante', description: '¡Eres una leyenda! Un año completo sin fumar.' },
      dios: { stage: 'dios', image: require('@/assets/images/fumicelebrando.png'), name: 'Fumi Dios', description: '¡Perfección absoluta! Has alcanzado el nivel máximo.' },
    };

    const base = levelMap[fumiLevel] ?? levelMap.enfermo;
    return { ...base };
  }, [state.progress.fumiEvolution]);

  const levelOrder = ['enfermo', 'bebeSano', 'deporte', 'rico', 'pulmonDiamante', 'dios'];
  const currentLevelKey = state.progress.fumiEvolution?.currentLevel ?? 'enfermo';
  const currentIdx = levelOrder.indexOf(currentLevelKey);

  const rooms = useMemo(() => [
    { id: 'enfermo', bg: require('@/assets/images/fondofumi.png'), img: require('@/assets/images/fumienfermo.png'), name: 'Estado Inicial', desc: 'Fumi está recuperándose...' },
    { id: 'bebeSano', bg: require('@/assets/images/fondofumi3.png'), img: require('@/assets/images/fumisentadopeluche.png'), name: 'Fumi Sano', desc: '¡Primeras 24h superadas!' },
    { id: 'deporte', bg: require('@/assets/images/fondofumigym.png'), img: require('@/assets/images/fumideporte.png'), name: 'Modo Deporte', desc: 'Pulmones más fuertes.' },
    { id: 'rico', bg: require('@/assets/images/fumifondoplaya.png'), img: require('@/assets/images/fumirico (2).png'), name: 'Fumi Playero', desc: 'Disfrutando del ahorro.' },
    { id: 'pulmonDiamante', bg: require('@/assets/images/fondofumirico.png'), img: require('@/assets/images/fumielegante (2).png'), name: 'Elegancia Pura', desc: 'Leyenda del aire limpio.' },
    { id: 'dios', bg: require('@/assets/images/fondofumirico.png'), img: require('@/assets/images/fumicelebrando.png'), name: 'Nivel Dios', desc: 'Maestro de la voluntad.' },
  ], []);

  // Progreso preciso (poco a poco)
  const fumiEvolutionPrecise = useMemo(() => {
    const fumiLevel = state.progress.fumiEvolution?.currentLevel ?? 'enfermo';
    const progressNum = state.progress.fumiEvolution?.progressNumerator ?? 0;
    const progressDen = state.progress.fumiEvolution?.progressDenominator ?? 1;
    const mediaCigs = Math.round(state.settings.cigsPerDay);
    const cigsToday = state.progress.cigarettesSmoked?.[today] ?? 0;

    // Calcular fracción del día actual (0 a 0.99)
    const now = new Date(nowTs);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayFraction = Math.min(0.99, (nowTs - startOfDay) / (24 * 60 * 60 * 1000));

    // Determinar si hoy se está cumpliendo el objetivo para ganar la fracción
    let isFailingToday = false;
    if (mediaCigs > 0) {
      switch (fumiLevel) {
        case 'enfermo':
        case 'bebeSano': isFailingToday = cigsToday >= mediaCigs; break;
        case 'deporte': isFailingToday = cigsToday > mediaCigs * 0.7; break;
        case 'rico': isFailingToday = cigsToday > mediaCigs * 0.5; break;
        case 'pulmonDiamante': isFailingToday = cigsToday > mediaCigs * 0.25; break;
        case 'dios': isFailingToday = cigsToday > 0; break;
      }
    }

    const effectiveProgressNum = isFailingToday ? progressNum : progressNum + dayFraction;
    const progressPercent = progressDen > 0 ? (effectiveProgressNum / progressDen) * 100 : 0;

    return {
      percent: Math.min(100, Math.max(0, progressPercent)),
      progressText: `${progressNum}/${progressDen}`,
      isFailingToday
    };
  }, [state.progress.fumiEvolution, state.settings.cigsPerDay, state.progress.cigarettesSmoked, today, nowTs]);

  // Niveles de Fumi con requisitos y progreso (nuevo sistema basado en consumo)
  const fumiLevels = useMemo(() => {
    const currentLevel = state.progress.fumiEvolution?.currentLevel ?? 'enfermo';
    const progressNum = state.progress.fumiEvolution?.progressNumerator ?? 0;
    const progressDen = state.progress.fumiEvolution?.progressDenominator ?? 1;
    const mediaCigs = Math.round(state.settings.cigsPerDay);

    const levels = [
      {
        stage: 'enfermo',
        levelKey: 'enfermo',
        image: require('@/assets/images/fumienfermo.png'),
        name: 'Fumi Enfermo',
        requirement: 'Nivel inicial. Tu punto de partida en el viaje hacia la libertad'
      },
      {
        stage: 'peluche',
        levelKey: 'bebeSano',
        image: require('@/assets/images/fumisentadopeluche.png'),
        name: 'Fumi Bebe Sano',
        requirement: `Fuma menos de ${mediaCigs} cigarros al día durante 3 días seguidos`
      },
      {
        stage: 'deporte',
        levelKey: 'deporte',
        image: require('@/assets/images/fumideporte.png'),
        name: 'Fumi Deporte',
        requirement: `Fuma máximo ${Math.round(mediaCigs * 0.7)} cigarros al día durante 3 días seguidos`
      },
      {
        stage: 'rico',
        levelKey: 'rico',
        image: require('@/assets/images/fumirico (2).png'),
        name: 'Fumi Rico',
        requirement: `Fuma máximo ${Math.round(mediaCigs * 0.5)} cigarros al día durante 5 días seguidos`
      },
      {
        stage: 'elegante',
        levelKey: 'pulmonDiamante',
        image: require('@/assets/images/fumielegante (2).png'),
        name: 'Fumi Pulmón de Diamante',
        requirement: `Fuma máximo ${Math.round(mediaCigs * 0.25)} cigarros al día durante 10 días seguidos`
      },
      {
        stage: 'dios',
        levelKey: 'dios',
        image: require('@/assets/images/fumicelebrando.png'),
        name: 'Fumi Dios',
        requirement: 'No fumes ningún cigarro durante 15 días seguidos. La perfección absoluta'
      },
    ];

    const levelOrder = ['enfermo', 'bebeSano', 'deporte', 'rico', 'pulmonDiamante', 'dios'];
    const currentIndex = levelOrder.indexOf(currentLevel);

    return levels.map((level) => {
      const levelIndex = levelOrder.indexOf(level.levelKey);
      const isCurrent = level.levelKey === currentLevel;
      const isUnlocked = levelIndex <= currentIndex;

      let progress = 0;
      let progressText = '';

      if (isCurrent) {
        if (progressDen > 1) {
          progress = Math.round((progressNum / progressDen) * 100);
          progressText = `${progressNum}/${progressDen} días completados`;
        } else {
          progress = 0;
          progressText = 'En progreso...';
        }
      } else if (isUnlocked) {
        progress = 100;
        progressText = 'Completado';
      } else {
        progress = 0;
        progressText = 'Bloqueado';
      }

      return {
        ...level,
        isUnlocked,
        isCurrent,
        progress,
        progressText,
      };
    });
  }, [state.progress.fumiEvolution]);

  useEffect(() => {
    if (!ready) return;
    if (!state.onboardingCompleted && !pushedRef.current.onboarding) {
      pushedRef.current.onboarding = true;
      router.replace('/onboarding');
      return;
    }
    // Requerir premium para usar la app
    if (!state.premium.active) {
      router.replace('/premium');
      return;
    }
  }, [ready, state.onboardingCompleted, state.premium.active]);

  // Configurar notificaciones contextuales de Fumi
  useEffect(() => {
    if (!ready || !state.onboardingCompleted || !state.premium.active) return;
    // En simuladores / web no configuramos notificaciones para evitar errores visuales
    if (!Device.isDevice) return;

    const setupNotifications = async () => {
      try {
        // Solicitar permisos
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        // Cancelar notificaciones anteriores
        await Notifications.cancelAllScheduledNotificationsAsync();

        const today = toISODateLocal(nowTs);
        const cigarettesToday = state.progress.cigarettesSmoked?.[today] ?? 0;
        const fumiLevel = state.progress.fumiEvolution?.currentLevel ?? 'enfermo';
        const progressNum = state.progress.fumiEvolution?.progressNumerator ?? 0;
        const progressDen = state.progress.fumiEvolution?.progressDenominator ?? 1;
        const mediaCigs = Math.round(state.settings.cigsPerDay);
        const currentHour = new Date(nowTs).getHours();

        // 8 notificaciones diferentes distribuidas a lo largo del día
        const notifications = [
          // 1. Recordatorio matutino (9:00) - Si no has registrado cigarros
          {
            hour: 9,
            minute: 0,
            condition: () => cigarettesToday === 0 && currentHour < 9,
            title: '🌅 Buenos días con Fumi',
            body: 'No olvides registrar tus cigarros hoy. Cada registro te ayuda a seguir tu progreso.',
          },
          // 2. Recordatorio mediodía (13:00) - Si no has registrado cigarros
          {
            hour: 13,
            minute: 15,
            condition: () => cigarettesToday === 0 && currentHour < 13,
            title: '📊 Mediodía con Fumi',
            body: '¿Has fumado hoy? Regístralo para mantener tu progreso actualizado.',
          },
          // 3. Recordatorio tarde (17:00) - Si no has registrado cigarros
          {
            hour: 17,
            minute: 30,
            condition: () => cigarettesToday === 0 && currentHour < 17,
            title: '⏰ Recordatorio de Fumi',
            body: 'No olvides contabilizar tus cigarros del día. Tu progreso lo necesita.',
          },
          // 4. Felicitación si cumples objetivos (19:00)
          {
            hour: 19,
            minute: 0,
            condition: () => {
              const cigsToday = Math.round(cigarettesToday);
              const porcentaje = mediaCigs > 0 ? Math.round((cigsToday / mediaCigs) * 100) : 100;
              return cigsToday < mediaCigs && currentHour < 19;
            },
            title: '🎉 ¡Buen trabajo!',
            body: 'Estás cumpliendo tus objetivos. ¡Sigue así y Fumi evolucionará!',
          },
          // 5. Recordatorio de revisar progreso (20:00)
          {
            hour: 20,
            minute: 45,
            condition: () => currentHour < 20,
            title: '📈 Revisa tu progreso',
            body: 'Echa un vistazo a cómo está evolucionando Fumi y tu salud hoy.',
          },
          // 6. Recordatorio de verificar evolución (21:30)
          {
            hour: 21,
            minute: 30,
            condition: () => currentHour < 21,
            title: '🌟 Estado de Fumi',
            body: 'Revisa cómo está Fumi y qué necesitas para que evolucione al siguiente nivel.',
          },
          // 7. Motivación si estás cerca de objetivo (22:00)
          {
            hour: 22,
            minute: 0,
            condition: () => {
              if (progressDen <= 1) return false;
              const falta = progressDen - progressNum;
              return falta <= 2 && currentHour < 22;
            },
            title: '💪 Casi lo logras',
            body: `Te faltan solo ${progressDen - progressNum} días para que Fumi evolucione. ¡No te rindas!`,
          },
          // 8. Recordatorio nocturno (23:00) - Revisar el día
          {
            hour: 23,
            minute: 15,
            condition: () => currentHour < 23,
            title: '🌙 Resumen del día',
            body: 'Revisa cómo fue tu día y el progreso de Fumi. ¡Mañana será otro día de éxito!',
          },
        ];

        // Programar notificaciones que cumplan condiciones
        for (const notif of notifications) {
          if (notif.condition()) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: notif.title,
                body: notif.body,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: { screen: '/(tabs)/' }, // Deep link al inicio
              },
              trigger: {
                hour: notif.hour,
                minute: notif.minute,
                repeats: true,
              } as any,
            });
          }
        }
      } catch (error) {
        console.log('Error configurando notificaciones:', error);
      }
    };

    setupNotifications().catch(console.error);
  }, [ready, state.onboardingCompleted, state.premium.active, state.progress.cigarettesSmoked, state.progress.fumiEvolution, state.settings.cigsPerDay, nowTs]);

  // Manejar cuando se toca una notificación
  useEffect(() => {
    if (!ready) return;
    if (!Device.isDevice) return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        router.push(data.screen as any);
      }
    });

    return () => subscription.remove();
  }, [ready]);

  // Haptics + glow al subir el euro entero
  useEffect(() => {
    const euro = Math.floor(savedCentsNow / 100);
    if (euro > prevEuroRef.current) {
      prevEuroRef.current = euro;
      setGlowKey((k) => k + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    }
  }, [savedCentsNow]);

  // Cálculo de tiempo transcurrido para salud
  const elapsedDays = useMemo(() => {
    const start = state.progress.smokeFreeStartTs;
    if (!start) return 0;
    return Math.max(0, (nowTs - start) / DAY_MS);
  }, [nowTs, state.progress.smokeFreeStartTs]);


  const timeBreakdown = useMemo(() => {
    const start = state.progress.smokeFreeStartTs;
    if (!start) {
      return { years: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const diffMs = Math.max(0, nowTs - start);
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const years = Math.floor(totalDays / 365);
    const daysRemaining = totalDays % 365;
    const weeks = Math.floor(daysRemaining / 7);
    const days = daysRemaining % 7;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    return { years, weeks, days, hours, minutes, seconds };
  }, [nowTs, state.progress.smokeFreeStartTs]);

  // Texto detallado de tiempo sin fumar (años / meses / días / horas / minutos / segundos)
  const timeSinceQuit = useMemo(() => {
    const start = state.progress.smokeFreeStartTs;
    if (!start) {
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const diffMs = Math.max(0, nowTs - start);
    let totalSeconds = Math.floor(diffMs / 1000);
    const years = Math.floor((totalSeconds * 1.0) / (365 * 24 * 3600));
    totalSeconds -= years * 365 * 24 * 3600;
    const months = Math.floor((totalSeconds * 1.0) / (30 * 24 * 3600));
    totalSeconds -= months * 30 * 24 * 3600;
    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds -= days * 24 * 3600;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { years, months, days, hours, minutes, seconds };
  }, [nowTs, state.progress.smokeFreeStartTs]);

  // Mensajes motivacionales animados según tiempo sin fumar y nivel de Fumi
  const motivationalMessage = useMemo(() => {
    const { years, months, days } = timeSinceQuit;
    const currentLevel = state.progress.fumiEvolution?.currentLevel ?? 'enfermo';

    const levelNames: Record<string, string> = {
      enfermo: 'Fumi Enfermo',
      bebeSano: 'Fumi Bebe Sano',
      deporte: 'Fumi Deporte',
      rico: 'Fumi Rico',
      pulmonDiamante: 'Fumi Pulmón de Diamante',
      dios: 'Fumi Dios',
    };

    const levelOrder = ['enfermo', 'bebeSano', 'deporte', 'rico', 'pulmonDiamante', 'dios'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    const nextLevelKey = levelOrder[Math.min(currentIndex + 1, levelOrder.length - 1)];
    const nextLevelName = levelNames[nextLevelKey];

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mes${months > 1 ? 'es' : ''}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} día${days !== 1 ? 's' : ''}`);
    const timeText = parts.join(' y ');

    if (currentLevel === 'dios') {
      return `Impresionante, llevas ${timeText} sin fumar. Has llevado a Fumi a su nivel máximo, sigue así para mantener tu leyenda.`;
    }

    return `Muy bien, llevas ${timeText} sin fumar. ${levelNames[currentLevel] ?? 'Fumi'} está orgulloso de ti. El siguiente nivel, ${nextLevelName}, te espera si sigues así.`;
  }, [timeSinceQuit, state.progress.fumiEvolution]);


  const dailyMessage = useMemo(() => {
    const dayKey = toISODateLocal(nowTs);
    const list = [
      'Respira hondo... ese aire limpio es gratis, el tabaco te estaba arruinando. Hoy eres un 1% más rico que ayer.',
      'Si hoy te pica el mono: mira tu hucha. El cigarro es caro y encima huele mal.',
      'Un día más sin fumar: tu yo de mañana te da las gracias (y tu cartera también).',
      'No es suerte: es disciplina. Sigue así.',
    ];
    return list[hashString(dayKey) % list.length];
  }, [nowTs]);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.white }}>
      <ZenScreen contentStyle={{ paddingBottom: 20, backgroundColor: Palette.white }} variant="light">
        {pendingConfetti ? (
          <ConfettiCannon
            count={90}
            origin={{ x: 0, y: 0 }}
            fadeOut
            fallSpeed={2800}
            explosionSpeed={700}
            onAnimationEnd={clearConfetti}
          />
        ) : null}

        {/* Fumi Evolutivo - Swiper de habitaciones */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.fumiEvolutionCardWrapper}>
          <ScrollView
            horizontal
            pagingEnabled={false}
            snapToInterval={require('react-native').Dimensions.get('window').width - 60} // card width (width-80) + margins (20)
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 30 }} // (ScreenW - Stride) / 2 -> (W - (W-60))/2 = 30 to center
            style={styles.fumiRoomPager}>
            {rooms.map((room, idx) => {
              const isLocked = idx > currentIdx;
              return (
                <View key={room.id} style={styles.fumiRoomSlot}>
                  <View style={styles.fumiRoomCardInner}>
                    <ImageBackground
                      source={room.bg}
                      style={styles.fumiRoomBg}
                      imageStyle={{ borderRadius: 44 }}>

                      {/* Overlay Bloqueado */}
                      {isLocked && (
                        <View style={styles.fumiRoomLockedOverlay}>
                          <Lock size={48} color="rgba(255,255,255,0.6)" />
                          <ThemedText style={styles.fumiRoomLockedText}>BLOQUEADO</ThemedText>
                          <ThemedText style={styles.fumiRoomLockedSub}>{room.name}</ThemedText>
                          <ThemedText style={styles.fumiRoomLockedReq}>
                            {
                              {
                                enfermo: 'Inicio',
                                bebeSano: '3 días',
                                deporte: '7 días',
                                rico: '14 días',
                                pulmonDiamante: '30 días',
                                dios: '90 días'
                              }[room.id]
                            }
                          </ThemedText>
                        </View>
                      )}

                      {/* Contador (solo visible si no está bloqueado o en modo preview suave) */}
                      <View style={[styles.mainCounterCardBottom, isLocked && { opacity: 0.3 }]}>
                        <View style={styles.counterHeaderBottom}>
                          <ThemedText style={styles.counterTitleBottom}>Tiempo sin fumar</ThemedText>
                        </View>
                        <View style={styles.timeCounterContainerBottom}>
                          <View style={styles.timeItemBottom}>
                            <ThemedText style={styles.timeValueBottom}>{timeBreakdown.days}</ThemedText>
                            <ThemedText style={styles.timeLabelBottom}>Días</ThemedText>
                          </View>
                          <View style={[styles.timeDividerBottom, { height: 16 }]} />
                          <View style={styles.timeItemBottom}>
                            <ThemedText style={styles.timeValueBottom}>{String(timeBreakdown.hours).padStart(2, '0')}</ThemedText>
                            <ThemedText style={styles.timeLabelBottom}>Horas</ThemedText>
                          </View>
                          <View style={[styles.timeDividerBottom, { height: 16 }]} />
                          <View style={styles.timeItemBottom}>
                            <ThemedText style={styles.timeValueBottom}>{String(timeBreakdown.minutes).padStart(2, '0')}</ThemedText>
                            <ThemedText style={styles.timeLabelBottom}>Min</ThemedText>
                          </View>
                          <View style={[styles.timeDividerBottom, { height: 16 }]} />
                          <View style={styles.timeItemBottom}>
                            <ThemedText style={styles.timeValueBottom}>{String(timeBreakdown.seconds).padStart(2, '0')}</ThemedText>
                            <ThemedText style={styles.timeLabelBottom}>Seg</ThemedText>
                          </View>
                        </View>
                      </View>

                      {/* Fumi en la habitación */}
                      <View style={[styles.fumiImageWithPetContainer, isLocked && { opacity: 0.4, filter: 'grayscale(1)' } as any]}>
                        {/* Mascota (si hay una activa) */}
                        {state.progress.activePetId ? (
                          <MotiView
                            from={{ scale: 0, opacity: 0, translateX: 20 }}
                            animate={{ scale: 1, opacity: 1, translateX: 0 }}
                            transition={{ type: 'spring', delay: 400 }}
                            style={styles.petInRoomContainer}>
                            <Pressable
                              onPress={() => router.push('/caprichos')}
                              style={({ pressed }) => [pressed && { transform: [{ scale: 0.95 }] }]}>
                              <Image
                                source={MASCOTAS.find(m => m.id === state.progress.activePetId)?.asset}
                                style={styles.petInRoomImage}
                                resizeMode="contain"
                              />
                            </Pressable>
                          </MotiView>
                        ) : (
                          <MotiView
                            from={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1000 }}
                            style={[styles.petInRoomContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Pressable
                              onPress={() => router.push('/caprichos')}
                              style={({ pressed }) => [
                                styles.adoptPetBtn,
                                pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
                              ]}>
                              <Plus size={20} color="#FFF" />
                              <ThemedText style={styles.adoptPetText}>Mascota</ThemedText>
                            </Pressable>
                          </MotiView>
                        )}

                        <MotiView
                          from={{ scale: 0.95, rotate: '-3deg' }}
                          animate={{ scale: 1.05, rotate: '3deg' }}
                          transition={{ type: 'timing', duration: 4000, repeatReverse: true }}
                          style={styles.fumiInRoomWrapper}>
                          <Image
                            source={room.img}
                            style={styles.fumiEvolutionImageLarge}
                            resizeMode="contain"
                          />
                        </MotiView>
                      </View>

                      {/* Indicador de Swipe */}
                      {!isLocked && idx === currentIdx && (
                        <MotiView
                          from={{ translateX: 0 }}
                          animate={{ translateX: 10 }}
                          transition={{ type: 'timing', duration: 1000, repeatReverse: true }}
                          style={styles.swipeHint}>
                          <ThemedText style={styles.swipeHintText}>Desliza para ver más →</ThemedText>
                        </MotiView>
                      )}
                    </ImageBackground>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </MotiView>

        {/* Información de Fumi - Debajo del fondo para legibilidad top */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 250 }}>
          <View style={styles.fumiEvolutionInfoCard}>
            <ThemedText style={styles.fumiEvolutionNameLarge}>{fumiEvolution.name}</ThemedText>
            <ThemedText style={styles.fumiEvolutionDescriptionSlim}>{fumiEvolution.description}</ThemedText>
          </View>
        </MotiView>

        {/* Nivel Actual - Diseño más atractivo */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}>
          {(() => {
            const currentLevel = state.progress.fumiEvolution?.currentLevel ?? 'enfermo';
            const mediaCigs = Math.round(state.settings.cigsPerDay);

            let nextLevelReq = '';

            if (currentLevel === 'enfermo' || currentLevel === 'bebeSano') {
              nextLevelReq = `Menos de ${mediaCigs} cigarros/3 días`;
            } else if (currentLevel === 'deporte') {
              nextLevelReq = `Máx ${Math.round(mediaCigs * 0.7)} cigarros/3 días`;
            } else if (currentLevel === 'rico') {
              nextLevelReq = `Máx ${Math.round(mediaCigs * 0.5)} cigarros/5 días`;
            } else if (currentLevel === 'pulmonDiamante') {
              nextLevelReq = `Máx ${Math.round(mediaCigs * 0.25)} cigarros/10 días`;
            } else if (currentLevel === 'dios') {
              nextLevelReq = `0 cigarros/15 días`;
            }

            const progressPercent = fumiEvolutionPrecise.percent;
            const progressPercentDisplay = progressPercent.toFixed(1);
            const progressText = fumiEvolutionPrecise.progressText;

            return (
              <View style={styles.fumiProgressContainerPremium}>
                <View style={styles.fumiProgressHeader}>
                  <View>
                    <ThemedText style={styles.fumiEvolutionLevelLabel}>Progreso de Evolución</ThemedText>
                    <ThemedText style={styles.fumiProgressRequirement}>{nextLevelReq}</ThemedText>
                  </View>
                  <ThemedText style={[
                    styles.fumiProgressPercent,
                    fumiEvolutionPrecise.isFailingToday && { color: '#C66D6D' }
                  ]}>{progressPercentDisplay}%</ThemedText>
                </View>
                <View style={styles.fumiProgressBarTrack}>
                  <MotiView
                    animate={{
                      width: `${progressPercent}%`,
                      backgroundColor: fumiEvolutionPrecise.isFailingToday ? '#C66D6D' : '#C69C6D'
                    }}
                    transition={{ type: 'timing', duration: 1000 }}>
                    <View style={[
                      styles.fumiProgressBarFill,
                      fumiEvolutionPrecise.isFailingToday && { backgroundColor: '#C66D6D' }
                    ]} />
                  </MotiView>
                </View>
                <View style={styles.fumiProgressFooter}>
                  <ThemedText style={styles.fumiProgressTextSmall}>Días con éxito: {progressText}</ThemedText>
                  {fumiEvolutionPrecise.isFailingToday && (
                    <ThemedText style={styles.fumiProgressWarning}>¡Hoy has fumado demasiado!</ThemedText>
                  )}
                </View>
              </View>
            );
          })()}
        </MotiView>

        {/* Contador de Consumo Diario - Más atractivo */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 350 }}>
          <View style={styles.consumptionCardPremium}>
            <View style={styles.consumptionRowCozy}>
              <View style={styles.consumptionInfoCozy}>
                <ThemedText style={styles.consumptionTitleCozy}>Cigarros hoy</ThemedText>
                <ThemedText style={styles.consumptionCountCozy}>{cigarettesToday}</ThemedText>
              </View>

              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  actions.registerCigarette(today, 1);
                }}
                style={({ pressed }) => [
                  styles.consumeBtnCozy,
                  pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 }
                ]}>
                <Plus size={24} color="#FFF" strokeWidth={3.5} />
                <ThemedText style={styles.consumeBtnTextCozy}>Fumar</ThemedText>
              </Pressable>
            </View>
          </View>
        </MotiView>

        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 400, delay: 450 }}>
          <View style={styles.dailyCard}>
            <ThemedText style={styles.daily}>{dailyMessage}</ThemedText>
            <MotiView
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 650 }}>
              <ThemedText style={styles.dailySecondary}>{motivationalMessage}</ThemedText>
            </MotiView>
          </View>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 500 }}>
          <View style={styles.quickLinksRow}>
            <Link href="/(tabs)/caprichos" asChild>
              <Pressable style={[styles.quickLinkCard, { width: '100%' }]}>
                <ThemedText style={styles.quickLinkTitle}>Caprichos</ThemedText>
                <ThemedText style={styles.quickLinkText}>Qué podrías comprar</ThemedText>
              </Pressable>
            </Link>
          </View>
        </MotiView>



        {/* Modal de Niveles de Fumi - Pantalla Completa */}
        {showFumiLevels && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
            style={StyleSheet.absoluteFill}>
            <View style={styles.fumiLevelsFullScreen}>
              <View style={styles.fumiLevelsHeader}>
                <View style={styles.fumiLevelsHeaderText}>
                  <ThemedText style={styles.fumiLevelsTitle}>Niveles de Fumi</ThemedText>
                  <ThemedText style={styles.fumiLevelsSubtitle}>
                    Evoluciona reduciendo tu consumo día a día
                  </ThemedText>
                </View>
                <Pressable
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowFumiLevels(false);
                  }}
                  style={styles.fumiLevelsClose}>
                  <X size={28} color={Palette.textDark} strokeWidth={3} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.fumiLevelsScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.fumiLevelsList}
                bounces={false}>
                {fumiLevels.map((level, index) => {
                  const isLocked = !level.isUnlocked;
                  const isCurrent = level.isCurrent;

                  return (
                    <MotiView
                      key={level.stage}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'timing', duration: 300, delay: index * 100 }}>
                      <View style={[
                        styles.fumiLevelItem,
                        isCurrent && styles.fumiLevelItemCurrent,
                        isLocked && styles.fumiLevelItemLocked
                      ]}>
                        <View style={styles.fumiLevelImageContainer}>
                          <Image
                            source={level.image}
                            style={[
                              styles.fumiLevelImage,
                              isLocked && styles.fumiLevelImageLocked
                            ]}
                            resizeMode="contain"
                          />
                          {isLocked && (
                            <View style={styles.fumiLevelLockOverlay}>
                              <Lock size={32} color={Palette.white} strokeWidth={2.5} />
                            </View>
                          )}
                        </View>
                        <View style={styles.fumiLevelInfo}>
                          <View style={styles.fumiLevelsHeader}>
                            <ThemedText style={[
                              styles.fumiLevelName,
                              isLocked && styles.fumiLevelNameLocked
                            ]}>
                              {level.name}
                            </ThemedText>
                            {isCurrent && (
                              <View style={styles.fumiLevelBadge}>
                                <ThemedText style={styles.fumiLevelBadgeText}>Fase Actual</ThemedText>
                              </View>
                            )}
                            {level.isUnlocked && !isCurrent && (
                              <View style={styles.fumiLevelBadgeUnlocked}>
                                <ThemedText style={styles.fumiLevelBadgeTextUnlocked}>Desbloqueado</ThemedText>
                              </View>
                            )}
                            {isLocked && (
                              <View style={styles.fumiLevelBadgeLocked}>
                                <ThemedText style={styles.fumiLevelBadgeTextLocked}>Bloqueado</ThemedText>
                              </View>
                            )}
                          </View>
                          <ThemedText style={[
                            styles.fumiLevelRequirement,
                            isLocked && styles.fumiLevelRequirementLocked
                          ]}>
                            {level.requirement}
                          </ThemedText>

                          {/* Barra de progreso */}
                          {isCurrent ? (
                            <View style={styles.fumiLevelProgressContainer}>
                              <View style={styles.fumiLevelProgressHeader}>
                                <ThemedText style={styles.fumiLevelProgressText}>
                                  {level.progressText || 'En progreso...'}
                                </ThemedText>
                                <ThemedText style={styles.fumiLevelProgressPercent}>{level.progress}%</ThemedText>
                              </View>
                              <View style={styles.fumiLevelProgressBarTrack}>
                                <MotiView
                                  from={{ width: 0 }}
                                  animate={{ width: `${level.progress}%` }}
                                  transition={{ type: 'timing', duration: 800, delay: index * 100 + 200 }}>
                                  <View style={styles.fumiLevelProgressBarFillCurrent} />
                                </MotiView>
                              </View>
                              <ThemedText style={styles.fumiLevelProgressHint}>
                                Registra tu consumo diario para avanzar
                              </ThemedText>
                            </View>
                          ) : isLocked ? (
                            <View style={styles.fumiLevelInfo}>
                              <ThemedText style={styles.fumiLevelLockedText}>
                                Este nivel está bloqueado. Completa el nivel anterior para desbloquearlo.
                              </ThemedText>
                            </View>
                          ) : (
                            <View style={styles.fumiLevelProgressContainer}>
                              <View style={styles.fumiLevelProgressHeader}>
                                <ThemedText style={styles.fumiLevelProgressText}>Completado</ThemedText>
                                <ThemedText style={styles.fumiLevelProgressPercent}>100%</ThemedText>
                              </View>
                              <View style={styles.fumiLevelProgressBarTrack}>
                                <View style={styles.fumiLevelProgressBarFillUnlocked} />
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    </MotiView>
                  );
                })}
              </ScrollView>
            </View>
          </MotiView>
        )}
      </ZenScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, padding: 20, paddingTop: 10, gap: 14 },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    textAlign: 'center',
  },
  mainSub: {
    marginTop: 4,
    opacity: 0.9,
    fontSize: 13,
    textAlign: 'center',
  },
  mainSubStrong: {
    fontWeight: '900',
  },
  sub: { marginTop: 6, opacity: 0.78, fontSize: 16 },




  // Tarjetas de información
  infoCard: {
    marginTop: 24,
    backgroundColor: '#FFF8F0', // Cozy cream base
    borderRadius: 32,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8D0B0', // Soft border
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5A3E33',
    includeFontPadding: false,
    letterSpacing: 0.3,
    textAlign: 'center', // Centered title for cozy feel
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      default: 'sans-serif',
    }),
  },
  cardBody: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A3E33',
    lineHeight: 24,
    includeFontPadding: false,
  },



  dailyCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: '#E8C4A0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
      },
    }),
  },
  daily: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A3E33',
    lineHeight: 24,
    includeFontPadding: false,
  },
  dailySecondary: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#5A3E33',
    opacity: 0.9,
    lineHeight: 22,
    includeFontPadding: false,
  },
  quickLinksRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  quickLinkCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
      },
    }),
  },
  quickLinkTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5A3E33',
    includeFontPadding: false,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(90,62,51,0.7)',
    includeFontPadding: false,
  },


  // Fumi Evolutivo - Estilo Tamagotchi Cozy (Grande)
  fumiEvolutionCard: {
    marginTop: 2, // Pushed right to the top
    marginHorizontal: 12,
    borderRadius: 44,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8D0B0',
    overflow: 'hidden',
    minHeight: 460, // Sligthly more height after user reduced it
    justifyContent: 'space-between',
    paddingBottom: 110, // Fumi lower
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 8px 24px rgba(139, 90, 43, 0.1)',
      },
    }),
  },
  fumiEvolutionContentCentered: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  fumiImageContainerLarge: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fumiImageWithPetContainer: {
    width: '100%',
    height: 300,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingLeft: 20, // Even more to the left (was 40)
    zIndex: 10,
    paddingBottom: 20,
  },
  fumiInRoomWrapper: {
    zIndex: 2,
  },
  petInRoomContainer: {
    position: 'absolute',
    right: '15%',
    bottom: 40,
    width: 90,
    height: 90,
    zIndex: 3,
  },
  petInRoomImage: {
    width: '100%',
    height: '100%',
  },
  adoptPetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    borderStyle: 'dashed',
  },
  adoptPetText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fumiEvolutionImageLarge: {
    width: 140,
    height: 140,
  },
  fumiEvolutionInfoCard: {
    marginTop: 0,
    marginHorizontal: 24,
    paddingVertical: 8,
    alignItems: 'center',
    zIndex: 10,
  },
  fumiEvolutionInfoCentered: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 16,
  },
  fumiEvolutionNameLarge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8c7060',
    letterSpacing: 0,
    textAlign: 'center',
    width: '100%',
    lineHeight: 22,
    opacity: 0.7,
  },
  fumiEvolutionDescriptionSlim: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8C7060',
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 32,
    lineHeight: 16,
    opacity: 0.8,
  },
  fumiEvolutionHint: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C69C6D',
    marginTop: 8,
    textAlign: 'center',
  },
  fumiEvolutionLevelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8C7060',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fumiProgressContainerOutside: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8D0B0',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  fumiProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fumiProgressPercent: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8B5A2B',
  },
  fumiProgressBarTrack: {
    height: 10,
    backgroundColor: '#F5E6D3',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fumiProgressBarFill: {
    height: '100%',
    backgroundColor: '#C69C6D',
    borderRadius: 5,
  },
  fumiProgressRequirement: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A08070',
    opacity: 0.8,
  },
  fumiProgressTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A08070',
  },

  mainCounterCardBottom: {
    width: '100%',
    padding: 12,
    backgroundColor: 'rgba(50, 40, 30, 0.55)',
    borderRadius: 24, // Suavizado
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  counterHeaderBottom: {
    alignItems: 'center',
    marginBottom: 12,
  },
  counterTitleBottom: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    opacity: 0.95,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  counterSubtitleBottom: {
    display: 'none',
  },
  timeCounterContainerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timeItemBottom: {
    alignItems: 'center',
  },
  timeValueBottom: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFE8D0', // Creamy white for dark background
    fontVariant: ['tabular-nums'],
  },
  timeLabelBottom: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E8D0B0', // Light brown for dark background
    textTransform: 'uppercase',
    marginTop: 2,
  },
  timeDividerBottom: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  consumptionCard: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8D0B0',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  consumptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  consumptionHeaderCompact: {
    flex: 1,
  },
  consumptionTitleCompact: {
    fontSize: 16,
    fontWeight: '900',
    color: '#5A3E33',
  },
  consumptionControlsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  consumptionButtonCompact: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumptionButtonMinus: {
    backgroundColor: '#F5E6D3',
  },
  consumptionButtonPlus: {
    backgroundColor: Palette.brown,
  },
  consumptionCardPremium: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 32, // Very rounded
    backgroundColor: '#FFF8F0', // Soft creamy background
    padding: 8, // Padding for inner content
    borderWidth: 2,
    borderColor: '#E8D0B0',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  consumptionRowCozy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  consumptionInfoCozy: {
    gap: 2,
  },
  consumptionTitleCozy: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8C7060', // Soft brown
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  consumptionCountCozy: {
    fontSize: 36,
    fontWeight: '900',
    color: '#5A3E33', // Darker brown
    includeFontPadding: false,
    lineHeight: 40,
  },
  consumeBtnCozy: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5A2B', // Main brand brown
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  consumeBtnTextCozy: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  consumptionNumberCompact: {
    fontSize: 20,
    fontWeight: '900',
    color: Palette.brown,
  },

  fumiLevelsFullScreen: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  fumiLevelsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E6D3',
  },
  fumiLevelsHeaderText: {
    flex: 1,
  },
  fumiLevelsTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Palette.textDark,
  },
  fumiLevelsSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textMedium,
    marginTop: 4,
  },
  fumiLevelsClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fumiLevelsScroll: {
    flex: 1,
  },
  fumiLevelsList: {
    padding: 20,
    gap: 16,
  },
  fumiLevelItem: {
    flexDirection: 'row',
    backgroundColor: Palette.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F5E6D3',
    gap: 16,
    alignItems: 'center',
  },
  fumiLevelItemCurrent: {
    borderColor: Palette.brown,
    backgroundColor: '#FFFBF5',
  },
  fumiLevelItemLocked: {
    opacity: 0.8,
    backgroundColor: '#F9F9F9',
  },
  fumiLevelImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  fumiLevelImage: {
    width: 80,
    height: 80,
  },
  fumiLevelImageLocked: {
    opacity: 0.3,
  },
  fumiLevelLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fumiLevelInfo: {
    flex: 1,
    gap: 4,
  },
  fumiLevelName: {
    fontSize: 18,
    fontWeight: '900',
    color: Palette.textDark,
  },
  fumiLevelNameLocked: {
    color: Palette.textMedium,
  },
  fumiLevelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: Palette.brown,
  },
  fumiLevelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.white,
    textTransform: 'uppercase',
  },
  fumiLevelBadgeUnlocked: {
    backgroundColor: '#E8F5E9',
  },
  fumiLevelBadgeLocked: {
    backgroundColor: '#F5F5F5',
  },
  fumiLevelBadgeTextUnlocked: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
    textTransform: 'uppercase',
  },
  fumiLevelBadgeTextLocked: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9E9E9E',
    textTransform: 'uppercase',
  },
  fumiLevelRequirement: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textDark,
    opacity: 0.8,
    marginTop: 4,
    lineHeight: 18,
  },
  fumiLevelRequirementLocked: {
    color: Palette.textMedium,
  },
  fumiLevelProgressContainer: {
    marginTop: 8,
    gap: 4,
  },
  fumiLevelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fumiLevelProgressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textMedium,
  },
  fumiLevelProgressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.brown,
  },
  fumiLevelProgressBarTrack: {
    height: 8,
    backgroundColor: '#F5E6D3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fumiLevelProgressBarFillCurrent: {
    height: '100%',
    backgroundColor: Palette.brown,
  },
  fumiLevelProgressBarFillUnlocked: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  fumiLevelProgressHint: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.brown,
    fontStyle: 'italic',
    marginTop: 2,
  },
  fumiLevelLockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textMedium,
    fontStyle: 'italic',
  },
  fumiLevelFinalMessage: {
    marginTop: 24,
    padding: 24,
    borderRadius: 24,
    backgroundColor: Palette.yellow,
    borderWidth: 2,
    borderColor: Palette.brown,
    alignItems: 'center',
    gap: 8,
  },
  fumiLevelFinalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.textDark,
    textAlign: 'center',
  },
  fumiLevelFinalText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textDark,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },

  // Nuevos estilos para Swiper y Premium UI
  fumiEvolutionCardWrapper: {
    marginTop: 40, // More top margin as requested
    height: 480, // Ensure height for shadow
    backgroundColor: 'transparent', // Wrapper is transparent now
  },
  fumiRoomPager: {
    width: '100%',
    height: 480,
    overflow: 'visible', // Allow shadows to be seen
  },
  fumiRoomSlot: {
    width: Platform.OS === 'web' ? 360 : require('react-native').Dimensions.get('window').width - 80, // Narrower as requested
    height: 460,
    marginHorizontal: 10, // Spacing
    justifyContent: 'center',
  },
  fumiRoomCardInner: {
    flex: 1,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E8D0B0',
    backgroundColor: '#FDF8F2',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  fumiRoomBg: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 110,
  },
  fumiRoomLockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  fumiRoomLockedText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    letterSpacing: 2,
  },
  fumiRoomLockedSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  fumiRoomLockedReq: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 5, // Lowered even more (was 12)
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8D0B0',
    zIndex: 20,
  },
  swipeHintText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5A2B',
  },

  fumiProgressContainerPremium: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#F5E6DA',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  fumiProgressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  fumiProgressWarning: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C66D6D',
  },

  consumptionSubtitleCompact: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A08070',
    marginTop: 2,
  },
  consumeBtnCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  minusBtn: {
    borderColor: '#E8D0B0',
    backgroundColor: '#FFF',
  },
  plusBtn: {
    borderColor: '#8B5A2B',
    backgroundColor: '#8B5A2B',
  },
  cigsCountCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5E6DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cigsCountText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#8B5A2B',
  },
});
