import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ZenScreen } from '@/components/zen-screen';
import { Palette } from '@/constants/theme';

export default function VidaGanadaScreen() {
  return (
    <ZenScreen contentStyle={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}>
          <ArrowLeft size={24} color={Palette.brown} strokeWidth={3} />
        </Pressable>
        <ThemedText type="title" style={styles.title}>
          ¿Cómo se calcula la vida ganada?
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}>
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>📊 El cálculo</ThemedText>
            <ThemedText style={styles.cardText}>
              Por cada cigarrillo que NO fumas, ganas aproximadamente 11 minutos de vida. Este dato está basado en estudios médicos que relacionan el consumo de tabaco con la reducción de la esperanza de vida.
            </ThemedText>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}>
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>⏱️ Vida ganada hoy</ThemedText>
            <ThemedText style={styles.cardText}>
              Se calcula multiplicando los cigarros que habrías fumado hoy (según tu consumo diario) por 11 minutos. Si llevas 8 horas sin fumar y fumabas 20 cigarros al día, habrías fumado aproximadamente 6-7 cigarros en ese tiempo.
            </ThemedText>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}>
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>📈 Vida ganada total</ThemedText>
            <ThemedText style={styles.cardText}>
              Es la suma de todos los minutos ganados desde que dejaste de fumar. Se calcula multiplicando los días sin fumar por tu consumo diario y por 11 minutos por cigarrillo.
            </ThemedText>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}>
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>💡 ¿Por qué 11 minutos?</ThemedText>
            <ThemedText style={styles.cardText}>
              Estudios científicos han demostrado que cada cigarrillo reduce la esperanza de vida en aproximadamente 11 minutos. Esto incluye el tiempo que tarda el cuerpo en procesar las toxinas y el impacto acumulativo en la salud a largo plazo.
            </ThemedText>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}>
          <View style={styles.infoBox}>
            <ThemedText style={styles.infoText}>
              💚 Recuerda: estos cálculos son estimaciones basadas en datos médicos. Cada día sin fumar es una victoria para tu salud.
            </ThemedText>
          </View>
        </MotiView>
      </ScrollView>
    </ZenScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.white,
    borderWidth: 3,
    borderColor: Palette.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: Palette.textDark,
    includeFontPadding: false,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 3,
    borderColor: Palette.brown,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: Palette.textMedium,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: Palette.pinkBeige,
    borderRadius: 24,
    padding: 20,
    borderWidth: 3,
    borderColor: Palette.brown,
    marginTop: 8,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: Palette.textDark,
    fontWeight: '700',
    textAlign: 'center',
  },
});


