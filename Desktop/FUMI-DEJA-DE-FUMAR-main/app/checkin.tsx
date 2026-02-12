import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { CheckCircle2, Moon, AlertTriangle, type LucideIcon } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ZenScreen } from '@/components/zen-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { useFumoBye } from '@/fumobye/store';
import type { FumoByeMood } from '@/fumobye/types';

const MOOD_OPTIONS: {
  id: FumoByeMood;
  icon: LucideIcon;
  label: string;
  description: string;
  accentColor: string;
}[] = [
  {
    id: 'zen',
    icon: CheckCircle2,
    label: 'Zen',
    description: 'Tranquilo y en control',
    accentColor: '#8FA87A',
  },
  {
    id: 'ansioso',
    icon: Moon,
    label: 'Ansioso',
    description: 'Necesito calma',
    accentColor: '#B8A070',
  },
  {
    id: 'rojo',
    icon: AlertTriangle,
    label: 'Mono',
    description: 'Momento difícil',
    accentColor: '#C88A7A',
  },
];

export default function CheckinScreen() {
  const { actions } = useFumoBye();

  return (
    <ZenScreen padded={false} variant="light">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header con animación estilo premium */}
        <MotiView 
          from={{ opacity: 0, scale: 0.9, translateY: -20 }} 
          animate={{ opacity: 1, scale: 1, translateY: 0 }} 
          transition={{ type: 'timing', duration: 500 }}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Estado de ánimo
            </ThemedText>
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 200 }}>
              <ThemedText style={styles.subtitle}>
                Selecciona cómo te sientes en este momento
              </ThemedText>
            </MotiView>
          </View>
        </MotiView>

        {/* Tarjetas de estado destacadas estilo premium */}
        <View style={styles.optionsContainer}>
          {MOOD_OPTIONS.map((mood, index) => {
            const IconComponent = mood.icon;
            return (
              <MotiView
                key={mood.id}
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500, delay: 300 + index * 100 }}>
                <Pressable
                  style={({ pressed }) => [
                    styles.moodCardWrapper,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    actions.markCheckin(mood.id);
                    router.push(`/reflexion?mood=${mood.id}`);
                  }}>
                  <View style={styles.moodCard}>
                    {/* Contenido de la tarjeta - diseño minimalista */}
                    <View style={styles.cardInnerContent}>
                      <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: `${mood.accentColor}15`, borderColor: `${mood.accentColor}30` }]}>
                          <IconComponent size={36} color={mood.accentColor} strokeWidth={2.5} />
                        </View>
                      </View>
                      
                      <View style={styles.textContainer}>
                        <ThemedText style={[styles.moodLabel, { color: '#1A1A1A' }]}>{mood.label}</ThemedText>
                        <ThemedText style={styles.moodDescription}>{mood.description}</ThemedText>
                      </View>
                      
                      <View style={styles.arrowContainer}>
                        <View style={[styles.arrow, { backgroundColor: 'rgba(0, 0, 0, 0.04)' }]}>
                          <ThemedText style={styles.arrowText}>→</ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </MotiView>
            );
          })}
        </View>

        {/* Info card estilo premium */}
        <MotiView 
          from={{ opacity: 0, translateY: 20 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          transition={{ type: 'timing', duration: 500, delay: 700 }}>
          <View style={styles.infoCard}>
            <ThemedText style={styles.infoText}>
              Tu estado de ánimo nos ayuda a personalizar tu experiencia y ofrecerte el apoyo que necesitas.
            </ThemedText>
          </View>
        </MotiView>
      </ScrollView>
    </ZenScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerContent: { padding: 24, paddingTop: 80, paddingBottom: 40, gap: 24 },
  header: { 
    alignItems: 'center', 
    marginBottom: 8, 
    gap: 12 
  },
  title: { 
    fontSize: 36,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 44,
    includeFontPadding: false,
  },
  subtitle: { 
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 18,
    marginTop: 8,
  },
  moodCardWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  moodCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInnerContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    minHeight: 110,
  },
  iconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  moodLabel: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 28,
    includeFontPadding: false,
  },
  moodDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.55)',
    fontWeight: '500',
    lineHeight: 20,
  },
  arrowContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  infoCard: {
    marginTop: 8,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.65)',
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
});


