import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Home, TrendingUp, Heart, PiggyBank, Calendar, BarChart3 } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ZenScreen } from '@/components/zen-screen';
import { GlassCard } from '@/components/ui/glass-card';

type FeatureSlide = {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
};

const SLIDES: FeatureSlide[] = [
  {
    icon: Home,
    title: 'Cuartel',
    description: 'Tu panel principal. Aquí verás tu racha de días sin fumar, ahorro acumulado y estado de salud en tiempo real.',
    color: '#7DA88C',
  },
  {
    icon: TrendingUp,
    title: 'Progreso',
    description: 'Visualiza tu recuperación: función pulmonar, oxígeno en sangre, energía y tiempo de vida ganado.',
    color: '#A278FF',
  },
  {
    icon: PiggyBank,
    title: 'Caprichos',
    description: 'Ve qué podrías comprar con el dinero que ahorras. Cada día sin fumar es dinero en tu bolsillo.',
    color: '#E7B870',
  },
  {
    icon: Calendar,
    title: 'Calendario',
    description: 'Marca visual de tu viaje. Cada día verde es una victoria, cada día es un paso más hacia tu meta.',
    color: '#FF9696',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas',
    description: 'Métricas detalladas de tu progreso. Racha actual, mejor récord, dinero ahorrado y mucho más.',
    color: '#B07A55',
  },
];

export default function WelcomePremiumScreen() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.back();
    }
  };

  const IconComponent = SLIDES[currentSlide].icon;

  return (
    <ZenScreen variant="light" padded={false}>
      <View style={styles.container}>
        {/* Header con botón cerrar */}
        <View style={styles.header}>
          <Pressable onPress={handleSkip} style={styles.closeButton}>
            <X size={24} color="#5A3E33" />
          </Pressable>
          <ThemedText style={styles.skipText} onPress={handleSkip}>
            Omitir
          </ThemedText>
        </View>

        {/* Contenido del slide */}
        <MotiView
          key={currentSlide}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.slideContent}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[`${SLIDES[currentSlide].color}40`, `${SLIDES[currentSlide].color}20`]}
              style={styles.iconGradient}>
              <IconComponent size={64} color={SLIDES[currentSlide].color} />
            </LinearGradient>
          </View>

          <ThemedText style={styles.title}>{SLIDES[currentSlide].title}</ThemedText>
          <ThemedText style={styles.description}>{SLIDES[currentSlide].description}</ThemedText>
        </MotiView>

        {/* Indicadores de página */}
        <View style={styles.indicators}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlide === index && styles.indicatorActive,
                { backgroundColor: currentSlide === index ? SLIDES[currentSlide].color : 'rgba(90, 62, 51, 0.2)' },
              ]}
            />
          ))}
        </View>

        {/* Botón siguiente/empezar */}
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={[SLIDES[currentSlide].color, `${SLIDES[currentSlide].color}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}>
            <ThemedText style={styles.nextButtonText}>
              {currentSlide < SLIDES.length - 1 ? 'Siguiente' : '¡Empezar!'}
            </ThemedText>
          </LinearGradient>
        </Pressable>
      </View>
    </ZenScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(90, 62, 51, 0.1)',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5A3E33',
    opacity: 0.7,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(90, 62, 51, 0.1)',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#5A3E33',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    color: '#5A3E33',
    textAlign: 'center',
    opacity: 0.85,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorActive: {
    width: 24,
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.2,
  },
});


