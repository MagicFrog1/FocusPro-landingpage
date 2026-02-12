import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Clock, Heart } from 'lucide-react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ZenScreen } from '@/components/zen-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { useFumoBye } from '@/fumobye/store';
import { DAY_MS, formatMoneyFromCents } from '@/fumobye/utils';

// Colores más claros y suaves, menos marrón
const METRIC_COLORS = {
  lungs: '#7DA88C', // Verde menta suave
  taste: '#E7B870', // Dorado cálido
  oxygen: '#A278FF', // Púrpura suave
  energy: '#FF9696', // Rosa coral
  life: '#B07A55', // Marrón terroso (más claro)
  savings: '#E7B870', // Dorado para ahorro
} as const;

// Cálculo REALISTA basado en datos médicos y progreso REAL del usuario
function calculateRealisticHealth(
  elapsedDays: number,
  cigsPerDay: number,
  metric: 'lungs' | 'taste' | 'oxygen' | 'energy'
): number {
  const hoursSinceQuit = elapsedDays * 24;

  switch (metric) {
    case 'lungs':
      if (hoursSinceQuit < 20 / 60) return 25;
      if (elapsedDays < 2) return 25 + (elapsedDays / 2) * 5;
      if (elapsedDays < 14) return 30 + ((elapsedDays - 2) / 12) * 30;
      if (elapsedDays < 90) return 60 + ((elapsedDays - 14) / 76) * 25;
      return Math.min(100, 85 + ((elapsedDays - 90) / 365) * 15);

    case 'taste':
      if (hoursSinceQuit < 20) return 20;
      if (hoursSinceQuit < 48) return 20 + ((hoursSinceQuit - 20) / 28) * 40;
      if (elapsedDays < 7) return 60 + ((elapsedDays - 2) / 5) * 25;
      return Math.min(100, 85 + ((elapsedDays - 7) / 30) * 15);

    case 'oxygen':
      if (hoursSinceQuit < 20 / 60) return 70;
      if (hoursSinceQuit < 12) return 70 + ((hoursSinceQuit - 20 / 60) / (12 - 20 / 60)) * 20;
      if (elapsedDays < 3) return 90 + ((elapsedDays - 0.5) / 2.5) * 8;
      return Math.min(100, 98 + ((elapsedDays - 3) / 7) * 2);

    case 'energy':
      if (elapsedDays < 1) return 45;
      if (elapsedDays < 3) return 45 + ((elapsedDays - 1) / 2) * 10;
      if (elapsedDays < 14) return 55 + ((elapsedDays - 3) / 11) * 25;
      if (elapsedDays < 90) return 80 + ((elapsedDays - 14) / 76) * 15;
      return Math.min(100, 95 + ((elapsedDays - 90) / 365) * 5);

    default:
      return 50;
  }
}

export default function ProgresoScreen() {
  const { ready, nowTs, savedCentsNow, daysSmokeFree, state } = useFumoBye();
  const startTs = state.progress.smokeFreeStartTs;
  const elapsedMs = Math.max(0, nowTs - startTs);
  const elapsedDays = elapsedMs / DAY_MS;

  // Requerir premium
  useEffect(() => {
    if (!state.premium.active) {
      router.replace('/premium');
    }
  }, [state.premium.active]);

  const completedRef = useRef<Set<string>>(new Set());

  // Métricas de salud REALISTAS
  const healthMetrics = useMemo(() => {
    const lungs = calculateRealisticHealth(elapsedDays, state.settings.cigsPerDay, 'lungs');
    const taste = calculateRealisticHealth(elapsedDays, state.settings.cigsPerDay, 'taste');
    const oxygen = calculateRealisticHealth(elapsedDays, state.settings.cigsPerDay, 'oxygen');
    const energy = calculateRealisticHealth(elapsedDays, state.settings.cigsPerDay, 'energy');
    
    return { lungs, taste, oxygen, energy };
  }, [elapsedDays, state.settings.cigsPerDay]);

  // Haptics al completar hitos
  useEffect(() => {
    let didTrigger = false;
    if (healthMetrics.lungs >= 100 && !completedRef.current.has('lungs')) {
      completedRef.current.add('lungs');
      didTrigger = true;
    }
    if (healthMetrics.taste >= 100 && !completedRef.current.has('taste')) {
      completedRef.current.add('taste');
      didTrigger = true;
    }
    if (didTrigger) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [healthMetrics]);

  // Vida ganada REAL
  const cigsPerDay = state.settings.cigsPerDay;
  const minutesPerCig = 11;
  const cigsAvoidedTotal = Math.max(0, elapsedDays * cigsPerDay);
  const lifeMinutesTotal = cigsAvoidedTotal * minutesPerCig;
  const windowStart = Math.max(startTs, nowTs - DAY_MS);
  const elapsedTodayMs = Math.max(0, nowTs - windowStart);
  const cigsAvoidedToday = Math.max(0, (elapsedTodayMs / DAY_MS) * cigsPerDay);
  const lifeMinutesToday = cigsAvoidedToday * minutesPerCig;
  const lifeHoursToday = lifeMinutesToday / 60;

  const bestStreak = state.progress.bestStreakDays ?? daysSmokeFree;
  const rateCentsPerSecond = useMemo(() => {
    const packsPerDay = state.settings.cigsPerPack > 0 ? state.settings.cigsPerDay / state.settings.cigsPerPack : 0;
    const dailySpendCents = Math.max(0, Math.round(packsPerDay * state.settings.packPriceCents));
    return dailySpendCents / 86400;
  }, [state.settings]);

  return (
    <ZenScreen contentStyle={{ paddingBottom: 96 }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Tu cuerpo te da las gracias
            </ThemedText>
            <ThemedText style={styles.sub}>
              Racha: {daysSmokeFree} días · Ahorro: {formatMoneyFromCents(savedCentsNow, state.settings.currency)}
            </ThemedText>
          </View>
        </MotiView>

        {/* Vida ganada */}
        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: 15 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}>
          <GlassCard intensity={24} style={styles.lifeCard}>
            <MotiView
              from={{ opacity: 0, scale: 0.8, rotate: '-12deg' }}
              animate={{ opacity: 1, scale: 1, rotate: '-10deg' }}
              transition={{ type: 'spring', delay: 200 }}
              style={styles.fumiMedicoSticker}>
              <Image
                source={require('@/assets/images/fumimedico.png')}
                style={styles.fumiMedicoImage}
                resizeMode="contain"
              />
            </MotiView>
            <View style={styles.titleWithIcon}>
              <Clock size={28} color="#5A3E33" />
              <ThemedText style={styles.lifeCardTitle}>Vida Ganada</ThemedText>
            </View>
            <View style={styles.lifeStats}>
              <View style={styles.lifeStatItem}>
                <ThemedText style={styles.lifeStatValue} numberOfLines={1}>
                  +{lifeHoursToday.toFixed(1)}h
                </ThemedText>
                <ThemedText style={styles.lifeStatLabel}>Hoy</ThemedText>
              </View>
              <View style={styles.lifeStatDivider} />
              <View style={styles.lifeStatItem}>
                <ThemedText style={styles.lifeStatValue} numberOfLines={1}>
                  {Math.floor(lifeMinutesTotal / 60)}h {Math.round(lifeMinutesTotal % 60)}m
                </ThemedText>
                <ThemedText style={styles.lifeStatLabel}>Total</ThemedText>
              </View>
            </View>
          </GlassCard>
        </MotiView>

        {/* Métricas de salud principales */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 150 }}>
          <GlassCard intensity={24} style={styles.healthCard}>
            <View style={styles.titleWithIcon}>
              <Heart size={24} color="#5A3E33" fill="#7DA88C" />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Recuperación de salud
              </ThemedText>
            </View>

            <View style={styles.metricsGrid}>
              {/* Fila superior: Función Pulmonar | Sentido del Gusto */}
              <GlassCard intensity={20} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <ThemedText style={styles.metricLabel}>Función Pulmonar</ThemedText>
                  <ThemedText style={styles.metricValue} numberOfLines={1}>{Math.round(healthMetrics.lungs)}%</ThemedText>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${healthMetrics.lungs}%`, backgroundColor: METRIC_COLORS.lungs }]} />
                </View>
                <ThemedText style={styles.metricExplanation}>
                  {elapsedDays < 2 
                    ? 'Mejora rápida inicial: tus pulmones empiezan a limpiarse'
                    : elapsedDays < 14
                    ? 'Mejora notable: función respiratoria aumenta significativamente'
                    : elapsedDays < 90
                    ? 'Recuperación avanzada: capacidad pulmonar cerca del máximo'
                    : 'Recuperación completa: función pulmonar restaurada'}
                </ThemedText>
              </GlassCard>

              <GlassCard intensity={20} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <ThemedText style={styles.metricLabel}>Sentido del Gusto</ThemedText>
                  <ThemedText style={styles.metricValue} numberOfLines={1}>{Math.round(healthMetrics.taste)}%</ThemedText>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${healthMetrics.taste}%`, backgroundColor: METRIC_COLORS.taste }]} />
                </View>
                <ThemedText style={styles.metricExplanation}>
                  {elapsedDays < 2
                    ? 'Recuperación rápida: las papilas gustativas se regeneran en 48-72 horas'
                    : 'Recuperación completa: ya puedes saborear la comida correctamente'}
                </ThemedText>
              </GlassCard>

              {/* Fila inferior: Energía | Oxígeno en sangre */}
              <GlassCard intensity={20} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <ThemedText style={styles.metricLabel}>Energía</ThemedText>
                  <ThemedText style={styles.metricValue} numberOfLines={1}>{Math.round(healthMetrics.energy)}%</ThemedText>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${healthMetrics.energy}%`, backgroundColor: METRIC_COLORS.energy }]} />
                </View>
                <ThemedText style={styles.metricExplanation}>
                  {elapsedDays < 3
                    ? 'Mejora inicial: tu cuerpo recupera energía al no procesar toxinas'
                    : elapsedDays < 14
                    ? 'Mejora notable: circulación mejorada aumenta tu energía'
                    : 'Nivel óptimo: energía restaurada completamente'}
                </ThemedText>
              </GlassCard>

              <GlassCard intensity={20} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <ThemedText style={styles.metricLabel}>Oxígeno en sangre</ThemedText>
                  <ThemedText style={styles.metricValue} numberOfLines={1}>{Math.round(healthMetrics.oxygen)}%</ThemedText>
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricBarFill, { width: `${healthMetrics.oxygen}%`, backgroundColor: METRIC_COLORS.oxygen }]} />
                </View>
                <ThemedText style={styles.metricExplanation}>
                  {elapsedDays < 1
                    ? 'Mejora inmediata: el monóxido de carbono se elimina en horas'
                    : elapsedDays < 3
                    ? 'Recuperación rápida: niveles de oxígeno casi normales'
                    : 'Nivel óptimo: oxigenación completa restaurada'}
                </ThemedText>
              </GlassCard>
            </View>
          </GlassCard>
        </MotiView>

        {/* Dato médico */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}>
          <GlassCard intensity={22} style={styles.banner}>
            <ThemedText type="defaultSemiBold" style={styles.bannerTitle}>
              Dato &quot;médico&quot;:
            </ThemedText>
            <ThemedText style={styles.bannerText}>
              &quot;Tu cuerpo está en modo reparación. No es magia: es que ya no lo envenenas cada 30 minutos.&quot;
            </ThemedText>
          </GlassCard>
        </MotiView>

        {/* Link de explicación de vida ganada */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 250 }}>
          <Pressable 
            style={styles.infoLink}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/vida-ganada');
            }}>
            <ThemedText style={styles.infoLinkText}>
              ¿Cómo se calcula la vida ganada?
            </ThemedText>
          </Pressable>
        </MotiView>
      </ScrollView>
    </ZenScreen>
  );
}

const styles = StyleSheet.create({
  content: { 
    paddingTop: 24, 
    paddingBottom: 32, 
    paddingHorizontal: 4, 
    gap: 20 
  },
  header: { 
    marginBottom: 8, 
    paddingHorizontal: 4 
  },
  title: { 
    letterSpacing: 0.2, 
    fontSize: 34, 
    fontWeight: '900', 
    lineHeight: 42, 
    includeFontPadding: false,
    color: '#5A3E33',
  },
  sub: { 
    marginTop: 12, 
    opacity: 0.9, 
    fontSize: 17, 
    fontWeight: '700', 
    lineHeight: 24,
    color: '#5A3E33',
  },
  sectionTitle: { 
    marginBottom: 16, 
    fontSize: 22, 
    fontWeight: '900', 
    letterSpacing: -0.3, 
    lineHeight: 28,
    color: '#5A3E33',
    flex: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingRight: 90,
  },
  
  // Vida ganada
  lifeCard: {
    padding: 20,
    paddingTop: 30,
    borderRadius: 50,
    gap: 16,
    position: 'relative',
    overflow: 'visible',
  },
  fumiMedicoSticker: {
    position: 'absolute',
    top: -15,
    right: -10,
    width: 100,
    height: 100,
    zIndex: 10,
  },
  fumiMedicoImage: {
    width: '100%',
    height: '100%',
  },
  lifeCardTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
    color: '#5A3E33',
    flexShrink: 1,
  },
  lifeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  lifeStatItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 120,
  },
  lifeStatDivider: {
    width: 1,
    height: 45,
    backgroundColor: 'rgba(90, 62, 51, 0.2)',
    marginHorizontal: 12,
  },
  lifeStatValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5A3E33',
    letterSpacing: -0.3,
    includeFontPadding: false,
    marginBottom: 6,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 4,
    lineHeight: 28,
  },
  lifeStatLabel: {
    fontSize: 15,
    opacity: 0.8,
    fontWeight: '700',
    color: '#5A3E33',
  },
  
  // Cards de salud
  healthCard: {
    padding: 16,
    paddingHorizontal: 12,
    borderRadius: 24,
    gap: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 0,
    width: '100%',
  },
  metricCard: {
    width: '48%',
    padding: 12,
    borderRadius: 18,
    gap: 8,
    marginBottom: 0,
  },
  metricHeader: {
    flexDirection: 'column',
    marginBottom: 6,
    gap: 3,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5A3E33',
    lineHeight: 15,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5A3E33',
    letterSpacing: -0.3,
    includeFontPadding: false,
    textAlign: 'left',
    width: '100%',
    paddingVertical: 1,
    lineHeight: 24,
  },
  metricBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(90, 62, 51, 0.12)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricExplanation: {
    fontSize: 10,
    opacity: 0.75,
    lineHeight: 14,
    fontWeight: '600',
    color: '#5A3E33',
    marginTop: 4,
  },
  
  // Banner y razón
  banner: {
    padding: 24,
    borderRadius: 24,
    gap: 12,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5A3E33',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#5A3E33',
    opacity: 0.9,
  },
  infoLink: {
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  infoLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5A3E33',
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
});
