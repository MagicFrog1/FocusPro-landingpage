import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { CheckCircle2, Lock } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { LightParticles } from '@/components/light-particles';
import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { ZenScreen } from '@/components/zen-screen';
import { Palette } from '@/constants/theme';
import { MASCOTAS, type Capricho } from '@/fumobye/caprichos';
import { useFumoBye } from '@/fumobye/store';
import { formatMoneyFromCents } from '@/fumobye/utils';
import { usePalette } from '@/hooks/use-palette';

type Estado = 'conseguido' | 'en_camino' | 'bloqueado';

const COIN_URL = 'https://actions.google.com/sounds/v1/coins/coin_drop.mp3';

function tierLabel(t: Capricho['tier']) {
  if (t === 'bronze') return 'Bronze';
  if (t === 'silver') return 'Silver';
  return 'Gold';
}

function tierGlow(t: Capricho['tier']) {
  if (t === 'bronze') return 'rgba(255, 179, 102, 0.22)';
  if (t === 'silver') return 'rgba(180, 200, 255, 0.18)';
  return 'rgba(255, 209, 102, 0.28)';
}

function CaprichoCard({
  item,
  index,
  cardWidth,
  estado,
  percent,
  currency,
  onBuy,
  palette,
}: {
  item: Capricho & { owned?: boolean; isActive?: boolean };
  index: number;
  cardWidth: number;
  estado: Estado;
  percent: number;
  currency: string;
  onBuy: () => void;
  palette: {
    success: string;
    textLight: string;
    accent: string;
  };
}) {
  const achieved = estado === 'conseguido';
  const inWay = estado === 'en_camino';
  const locked = estado === 'bloqueado';

  return (
    <View style={[{ width: cardWidth, marginBottom: 8 }]}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => { });
        }}
        style={({ pressed }) => [styles.cardPress, pressed ? { transform: [{ scale: 0.985 }] } : null]}>
        <View style={[styles.card, achieved ? styles.cardAchieved : inWay ? styles.cardWay : styles.cardLocked]}>
          <View style={styles.headerRow}>
            <View style={[styles.tierPill, achieved ? styles.tierPillOn : styles.tierPillOff]}>
              <ThemedText style={styles.tierText}>{tierLabel(item.tier)}</ThemedText>
            </View>
            <ThemedText style={[styles.price, locked ? styles.muted : null]}>{formatMoneyFromCents(item.priceCents, currency as any)}</ThemedText>
          </View>

          <View style={styles.titleRow}>
            <ThemedText style={[styles.title, locked ? styles.muted : null]}>
              {item.name}
            </ThemedText>
            {achieved ? <CheckCircle2 size={24} color={palette.success} strokeWidth={3} /> : locked ? <Lock size={20} color={palette.textLight} strokeWidth={2.5} /> : null}
          </View>

          <View style={styles.petPreviewContainer}>
            <Image
              source={item.asset}
              style={[styles.petPreviewImage, locked && { tintColor: 'rgba(0,0,0,0.3)' }]}
              resizeMode="contain"
            />
          </View>

          {item.motivator ? <ThemedText style={[styles.motivator, locked ? styles.muted : null]}>{item.motivator}</ThemedText> : null}

          {inWay ? (
            <View style={styles.progressBox}>
              <View style={styles.progressTop}>
                <ThemedText style={styles.progressLabel}>Casi ahí...</ThemedText>
                <ThemedText style={styles.progressPct}>{Math.round(percent * 100)}%</ThemedText>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${Math.round(percent * 100)}%` }]} />
              </View>
            </View>
          ) : null}

          {achieved ? (
            <View style={styles.buyRow}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                  onBuy();
                }}
                style={({ pressed }) => [
                  styles.buyBtn,
                  pressed ? { transform: [{ scale: 0.98 }], opacity: 0.95 } : null,
                  item.isActive && { backgroundColor: palette.accent }
                ]}>
                <ThemedText style={styles.buyText}>
                  {item.owned ? (item.isActive ? 'Quitar mascota' : 'Seleccionar') : 'Enviarlo a casa'}
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {locked ? <View style={styles.lockOverlay} pointerEvents="none" /> : null}
        </View>
      </Pressable>
    </View>
  );
}


export default function CaprichosScreen() {
  const { width } = useWindowDimensions();
  const { state, availableCentsNow, savedCentsNow, caprichosSpentCents, actions, nowTs, daysSmokeFree } = useFumoBye();
  const palette = usePalette();

  const [confettiKey, setConfettiKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(nowTs);

  const soundRef = useRef<Audio.Sound | null>(null);
  const prevAvailRef = useRef<number>(availableCentsNow);

  // Actualizar el tiempo cada segundo para que el dato curioso cambie cada 15 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: COIN_URL }, { volume: 0.75 });
        if (!alive) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch {
        // si falla, seguimos con háptica
      }
    })();
    return () => {
      alive = false;
      soundRef.current?.unloadAsync().catch(() => { });
      soundRef.current = null;
    };
  }, []);

  const playCoin = async () => {
    try {
      await soundRef.current?.replayAsync();
    } catch {
      // ignore
    }
  };

  const cardWidth = Math.min(width * 0.78, 360);
  const spacing = 14;
  const snap = cardWidth + spacing * 2;

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const currentIdx = useMemo(() => MASCOTAS.findIndex((c) => c.priceCents > availableCentsNow), [availableCentsNow]);
  const currentTarget = currentIdx >= 0 ? MASCOTAS[currentIdx] : null;
  const power = currentTarget ? Math.max(0, Math.min(1, availableCentsNow / currentTarget.priceCents)) : 1;

  // Sonido de “monedas” cuando desbloqueas un nuevo capricho (al cruzar el umbral).
  useEffect(() => {
    const prev = prevAvailRef.current;
    const now = availableCentsNow;
    prevAvailRef.current = now;
    if (now <= prev) return;

    const unlocked = MASCOTAS.find((c) => prev < c.priceCents && now >= c.priceCents);
    if (unlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
      playCoin();
    }
  }, [availableCentsNow]);

  const currency = state.settings.currency;

  // Requerir premium
  useEffect(() => {
    if (!state.premium.active) {
      router.replace('/premium');
    }
  }, [state.premium.active]);

  return (
    <ZenScreen padded={false} contentStyle={{ backgroundColor: Palette.white }}>
      <LightParticles variant="sparkly" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.safePad}>


          {/* Panel destacado de Ahorro */}
          <MotiView
            from={{ opacity: 0, translateY: 15, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 100 }}>
            <View style={styles.ahorroCard}>
              <View style={styles.ahorroCardContent}>
                <ThemedText style={styles.ahorroLabel}>Disponible para gastar</ThemedText>
                <View style={styles.ahorroWrap}>
                  <Image
                    source={require('@/assets/images/fumirico (2).png')}
                    style={styles.fumiCelebrandoImage}
                    resizeMode="contain"
                  />
                  <ThemedText style={styles.ahorroValue}>
                    {formatMoneyFromCents(availableCentsNow, state.settings.currency)}
                  </ThemedText>
                  <MotiView
                    key={availableCentsNow}
                    from={{ opacity: 0.6, scale: 1.05 }}
                    animate={{ opacity: 0, scale: 1 }}
                    transition={{ type: 'timing', duration: 800 }}
                    style={styles.ahorroGlow}
                    pointerEvents="none"
                  />
                </View>
                <ThemedText style={styles.ahorroSubtext}>Dinero disponible para regalarle cosas a Fumi</ThemedText>
              </View>
            </View>
          </MotiView>

          <View style={{ marginTop: 24, marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 20, fontWeight: '900', color: '#5A3E33', marginLeft: 4 }}>
              Compañeros Fumi
            </ThemedText>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: '#8C7060', marginLeft: 4, marginTop: 4 }}>
              Adopta una mascota con tus ahorros
            </ThemedText>
          </View>
        </View>

        <View style={styles.carouselWrap}>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, paddingBottom: 40 }}>
            {MASCOTAS.map((item, index) => {
              const itemOwned = state.progress.ownedPets?.includes(item.id);
              const isActive = state.progress.activePetId === item.id;

              let estado: Estado = 'bloqueado';
              if (itemOwned) estado = 'conseguido';
              else if (availableCentsNow >= item.priceCents) estado = 'conseguido';
              else if (index === currentIdx) estado = 'en_camino';

              const percent = item.priceCents > 0 ? Math.max(0, Math.min(1, availableCentsNow / item.priceCents)) : 0;
              const gridCardWidth = (width - 40 - 12) / 2; // (Screen - Padding - Gap) / 2

              return (
                <CaprichoCard
                  key={item.id}
                  item={{ ...item, owned: itemOwned, isActive } as any}
                  index={index}
                  cardWidth={gridCardWidth}
                  estado={itemOwned ? 'conseguido' : estado}
                  percent={percent}
                  currency={currency}
                  palette={palette}
                  onBuy={() => {
                    if (itemOwned) {
                      actions.setActivePet(isActive ? null : item.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      return;
                    }

                    const ok = actions.buyPet(item.id, item.priceCents);
                    if (!ok) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
                      setToast('Uy. Te falta un poquito para esta mascota.');
                      setTimeout(() => setToast(null), 1800);
                      return;
                    }
                    setConfettiKey((k) => k + 1);
                    setToast(`¡Genial! El ${item.name} se ha unido a Fumi.`);
                    setTimeout(() => setToast(null), 2600);
                  }}
                />
              );
            })}
          </View>
        </View>

      </ScrollView>

      {
        confettiKey ? (
          <ConfettiCannon
            key={`confetti-${confettiKey}`}
            count={120}
            origin={{ x: width / 2, y: 0 }}
            fadeOut
            fallSpeed={3000}
            explosionSpeed={850}
          />
        ) : null
      }

      {
        toast ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 10 }}
            transition={{ type: 'timing', duration: 220 }}
            style={styles.toastWrap}>
            <GlassCard intensity={26} style={styles.toastCard}>
              <ThemedText style={styles.toastText}>{toast}</ThemedText>
            </GlassCard>
          </MotiView>
        ) : null
      }
    </ZenScreen >
  );
}

const styles = StyleSheet.create({
  safePad: { paddingHorizontal: 20, paddingTop: 16 },
  ahorroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  // Panel de Ahorro - Estilo Premium & Profesional
  ahorroCard: {
    borderRadius: 32,
    overflow: 'visible',
    borderWidth: 2,
    borderColor: '#D4A574', // Warm brown border
    backgroundColor: '#FFFFFF', // Clean white background
    position: 'relative',
    marginTop: 8,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 12px 32px rgba(139, 90, 43, 0.15)',
      },
    }),
  },
  ahorroCardContent: {
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  ahorroLabel: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    color: '#5A3E33', // Dark rich brown
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  ahorroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    gap: 12,
  },
  fumiCelebrandoImage: {
    width: 160,
    height: 160,
    marginBottom: 4,
  },
  ahorroValue: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 64,
    includeFontPadding: false,
    color: '#8B5A2B', // Rich brown
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  ahorroGlow: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    top: '15%',
    bottom: '15%',
    borderRadius: 120,
    backgroundColor: 'rgba(212, 165, 116, 0.2)', // Warm glow
    zIndex: -1,
  },
  ahorroSubtext: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    color: '#8C7060',
    letterSpacing: 0.2,
    lineHeight: 22,
    includeFontPadding: false,
  },

  powerBox: {
    marginTop: 16,
    gap: 14,
    padding: 20,
    borderRadius: 28,
    backgroundColor: Palette.white,
    borderWidth: 3,
    borderColor: Palette.brown,
  },
  powerTop: { gap: 10 },
  powerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  powerLabel: { fontWeight: '900', fontSize: 18, color: Palette.textDark },
  powerPct: { fontWeight: '900', fontSize: 22, color: Palette.brown },
  powerHint: { fontWeight: '700', fontSize: 13, color: Palette.textLight },
  progressBarContainer: {
    height: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Palette.brown,
    borderRadius: 10,
  },

  carouselWrap: { marginTop: 8 },

  cardPress: { borderRadius: 32 },
  card: {
    borderRadius: 32,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
    borderWidth: 3,
  },
  cardAchieved: {
    backgroundColor: Palette.white,
    borderColor: Palette.brown,
  },
  cardWay: {
    backgroundColor: Palette.cream,
    borderColor: Palette.brown,
  },
  cardLocked: {
    backgroundColor: '#E8E8E8',
    borderColor: '#CCCCCC',
    opacity: 0.7,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tierPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  tierPillOn: { backgroundColor: Palette.white, borderColor: Palette.white },
  tierPillOff: { backgroundColor: '#F0F0F0', borderColor: '#CCCCCC' },
  tierText: { fontWeight: '900', fontSize: 12, color: Palette.textDark },

  price: { fontWeight: '900', fontSize: 18, color: Palette.textDark },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.4, color: Palette.textDark, flex: 1 },
  motivator: { fontWeight: '700', fontSize: 14, color: Palette.textLight, lineHeight: 20 },
  muted: { opacity: 0.5 },

  petPreviewContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  petPreviewImage: {
    width: '100%',
    height: '100%',
  },

  progressBox: { marginTop: 4, gap: 10 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontWeight: '900', fontSize: 14, color: Palette.textDark },
  progressPct: { fontWeight: '900', fontSize: 16, color: Palette.brown },
  progressHint: { fontWeight: '700', fontSize: 12, color: Palette.textLight },

  buyRow: { marginTop: 4, alignItems: 'flex-start' },
  buyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Palette.success,
    borderWidth: 3,
    borderColor: Palette.white,
  },
  buyText: { fontWeight: '900', fontSize: 14, color: Palette.textWhite },

  // Achievements / Comprados - Estilo Logros Profesional
  bottomSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },
  panelsScroll: {
    flexGrow: 0,
  },
  panelsRow: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  compradosCard: {
    width: 340,
    padding: 28,
    borderRadius: 28,
    backgroundColor: '#FFFFFF', // Clean white
    borderWidth: 2,
    borderColor: '#D4A574', // Warm brown border
    gap: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  compradosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  compradosIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0', // Warm cream
    borderWidth: 2,
    borderColor: '#E8D0B0', // Soft beige
  },
  compradosTitle: { fontWeight: '900', fontSize: 19, color: '#5A3E33', letterSpacing: -0.2 },
  compradosSub: { fontWeight: '700', fontSize: 13, color: '#8C7060', marginTop: 2, opacity: 0.9 },
  compradosScroll: {
    maxHeight: 160,
  },
  compradosGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  compradosItem: {
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFF8F0', // Warm cream background
    borderWidth: 2,
    borderColor: '#E8D0B0', // Soft beige border
    gap: 8,
    minWidth: 100,
    maxWidth: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  compradosEmoji: { fontSize: 40, marginBottom: 2 },
  compradosName: { fontWeight: '900', fontSize: 12, textAlign: 'center', color: '#5A3E33', lineHeight: 16 },
  compradosPrice: { fontWeight: '700', fontSize: 10, color: '#8C7060', marginTop: 1, opacity: 0.8 },
  compradosEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E8D0B0',
    backgroundColor: '#FFF8F0',
    gap: 8,
  },
  compradosEmptyText: { fontWeight: '900', fontSize: 15, color: '#5A3E33', textAlign: 'center' },
  compradosEmptySub: { fontWeight: '700', fontSize: 13, color: '#8C7060', textAlign: 'center', opacity: 0.8 },

  // Fun Fact - Cozy Style
  funFact: {
    width: 320,
    gap: 16,
    padding: 24,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EFF5',
  },
  funHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 6,
  },
  funIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#2B4B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
    }),
  },
  funTitle: { fontWeight: '900', fontSize: 18, color: '#2B4B6B' },
  funText: { fontWeight: '600', lineHeight: 24, fontSize: 15, color: '#4A6A8A' },

  toastWrap: { position: 'absolute', left: 16, right: 16, bottom: 92 },
  toastCard: { borderRadius: 24, padding: 16, backgroundColor: Palette.white, borderWidth: 3, borderColor: Palette.brown },
  toastText: { fontWeight: '900', fontSize: 14, color: Palette.textDark },

  bottomSpacer: { height: 92 },
});

