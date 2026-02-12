import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ArrowLeft, DollarSign, Heart, Sparkles } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { useMemo, useRef, useState } from 'react';
import { Image, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useFumoBye } from '@/fumobye/store';
import { clamp, currencySymbol, formatMoneyFromCents } from '@/fumobye/utils';

const REASONS = [
  { id: 'dinero' as const, label: 'Dinero', sub: 'Ahorrar para lo que realmente importa', icon: DollarSign },
  { id: 'salud' as const, label: 'Salud', sub: 'Mejorar tu bienestar físico', icon: Heart },
  { id: 'aliento' as const, label: 'Aliento', sub: 'Sentirte más fresco y confiado', icon: Sparkles },
];

// Textos explicativos cortos y sencillos
const EXPLANATIONS = [
  'Así calculamos tu ahorro.\nCada cigarrillo que no fumas se convierte en dinero real.',
  'Tu progreso en tiempo real.\nCada segundo que pasa sin fumar, tu ahorro crece.',
  'Beneficios personalizados.\nCalculamos tu recuperación según tu edad y años fumando.',
  'Cómo mejora tu cuerpo.\nOxígeno, energía y pulmones mejoran día a día.',
  'Consejos diarios.\nCada día un mensaje diferente para mantenerte motivado.',
  '¡Listo!\nCada día sin fumar es una victoria. ¡Vamos a por ello!',
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const { state, actions } = useFumoBye();
  const currency = state.settings.currency ?? 'EUR';
  const priceInputRef = useRef<TextInput>(null);

  const [step, setStep] = useState(0);
  const [cigsPerDay, setCigsPerDay] = useState(state.settings.cigsPerDay ?? 20);
  const [packPriceText, setPackPriceText] = useState(((state.settings.packPriceCents ?? 500) / 100).toFixed(2));
  const [reason, setReason] = useState(state.settings.reason ?? null);
  const [age, setAge] = useState(state.settings.age ?? 30);
  const [yearsSmoking, setYearsSmoking] = useState(state.settings.yearsSmoking ?? 5);
  const [isPriceInputFocused, setIsPriceInputFocused] = useState(false);

  const packPriceCents = useMemo(() => {
    const normalized = packPriceText.replace(',', '.').replace(/[^0-9.]/g, '');
    const n = Number(normalized);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(n * 100);
  }, [packPriceText]);

  const nextEnabled =
    (step === 0 && cigsPerDay > 0) ||
    (step === 1 && packPriceCents > 0) ||
    (step === 2 && age > 0 && age <= 120) ||
    (step === 3 && yearsSmoking >= 0 && yearsSmoking <= 80) ||
    (step === 4 && !!reason) ||
    step === 5;

  const totalSteps = 6;
  const progress = (step + 1) / totalSteps;
  const screenHeight = height;

  return (
    <View style={styles.container}>
      {/* Parte superior - Marrón pastel con preguntas */}
      <View style={[styles.topSection, { height: screenHeight / 2 }]}>
        {/* Botón atrás - Arriba a la izquierda */}
        {step > 0 && (
          <Pressable
            style={styles.backButtonTop}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStep(step - 1);
            }}>
            <ArrowLeft size={22} color={Palette.white} strokeWidth={2.5} />
            <ThemedText style={styles.backButtonTopText}>Atrás</ThemedText>
          </Pressable>
        )}
        <View style={styles.topContent}>
          {/* Contenido de la pregunta */}
          <ScrollView
            style={styles.questionScroll}
            contentContainerStyle={styles.questionContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={step}
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -15 }}
                transition={{ type: 'timing', duration: 200 }}
                style={styles.questionWrap}>

                {step === 0 ? (
                  <>
                    <ThemedText style={styles.questionTitle}>¿Cuántos cigarrillos fumabas al día?</ThemedText>
                    <View style={styles.pickerRow}>
                      <Pressable
                        style={styles.pillButton}
                        onPress={async () => {
                          const v = clamp(cigsPerDay - 1, 0, 200);
                          setCigsPerDay(v);
                          await Haptics.selectionAsync();
                        }}>
                        <ThemedText style={styles.pillText}>−</ThemedText>
                      </Pressable>
                      <View style={styles.numberBox}>
                        <ThemedText style={styles.bigNumber}>{cigsPerDay}</ThemedText>
                        <ThemedText style={styles.unit}>cigarrillos</ThemedText>
                      </View>
                      <Pressable
                        style={styles.pillButton}
                        onPress={async () => {
                          const v = clamp(cigsPerDay + 1, 0, 200);
                          setCigsPerDay(v);
                          await Haptics.selectionAsync();
                        }}>
                        <ThemedText style={styles.pillText}>+</ThemedText>
                      </Pressable>
                    </View>
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <ThemedText style={styles.questionTitle}>¿Cuánto costaba tu paquete?</ThemedText>
                    <View style={styles.inputContainer}>
                      <ThemedText style={styles.currencySymbol}>{currencySymbol(currency)}</ThemedText>
                      <TextInput
                        ref={priceInputRef}
                        value={packPriceText}
                        onChangeText={setPackPriceText}
                        keyboardType="decimal-pad"
                        placeholder="5.00"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        style={styles.input}
                        onFocus={() => setIsPriceInputFocused(true)}
                        onBlur={() => setIsPriceInputFocused(false)}
                      />
                    </View>
                    {isPriceInputFocused && (
                      <Pressable
                        style={styles.doneButton}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          Keyboard.dismiss();
                          setIsPriceInputFocused(false);
                        }}>
                        <ThemedText style={styles.doneButtonText}>Listo</ThemedText>
                      </Pressable>
                    )}
                    {packPriceCents > 0 && (
                      <View style={styles.infoBox}>
                        <ThemedText style={styles.infoText}>
                          Aproximadamente {formatMoneyFromCents(Math.round((packPriceCents * cigsPerDay) / 20), currency)} por día
                        </ThemedText>
                      </View>
                    )}
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <ThemedText style={styles.questionTitle}>¿Cuántos años tienes?</ThemedText>
                    <View style={styles.pickerRow}>
                      <Pressable
                        style={styles.pillButton}
                        onPress={async () => {
                          const v = clamp(age - 1, 1, 120);
                          setAge(v);
                          await Haptics.selectionAsync();
                        }}>
                        <ThemedText style={styles.pillText}>−</ThemedText>
                      </Pressable>
                      <View style={styles.numberBox}>
                        <ThemedText style={styles.bigNumber}>{age}</ThemedText>
                        <ThemedText style={styles.unit}>años</ThemedText>
                      </View>
                      <Pressable
                        style={styles.pillButton}
                        onPress={async () => {
                          const v = clamp(age + 1, 1, 120);
                          setAge(v);
                          await Haptics.selectionAsync();
                        }}>
                        <ThemedText style={styles.pillText}>+</ThemedText>
                      </Pressable>
                    </View>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <ThemedText style={styles.questionTitle}>¿Cuántos años llevabas fumando?</ThemedText>
                    <View style={styles.pickerRow}>
                      <Pressable
                        style={styles.pillButton}
                        onPress={async () => {
                          const v = clamp(yearsSmoking - 1, 0, 80);
                          setYearsSmoking(v);
                          await Haptics.selectionAsync();
                        }}>
                        <ThemedText style={styles.pillText}>−</ThemedText>
                      </Pressable>
                      <View style={styles.numberBox}>
                        <ThemedText style={styles.bigNumber}>{yearsSmoking}</ThemedText>
                        <ThemedText style={styles.unit}>años</ThemedText>
                      </View>
                      <Pressable
                        style={styles.pillButton}
                        onPress={async () => {
                          const v = clamp(yearsSmoking + 1, 0, 80);
                          setYearsSmoking(v);
                          await Haptics.selectionAsync();
                        }}>
                        <ThemedText style={styles.pillText}>+</ThemedText>
                      </Pressable>
                    </View>
                  </>
                ) : null}

                {step === 4 ? (
                  <>
                    <ThemedText style={styles.questionTitle}>¿Por qué quieres dejar de fumar?</ThemedText>
                    <View style={styles.reasonsRow}>
                      {REASONS.map((r) => {
                        const selected = reason === r.id;
                        return (
                          <Pressable
                            key={r.id}
                            style={[styles.reasonCard, selected && styles.reasonCardSelected]}
                            onPress={async () => {
                              setReason(r.id);
                              await Haptics.selectionAsync();
                            }}>
                            <View style={[styles.reasonIconContainer, selected && styles.reasonCardSelectedIcon]}>
                              <r.icon 
                                size={32} 
                                color={selected ? Palette.brown : Palette.brown} 
                                strokeWidth={2.5} 
                              />
                            </View>
                            <ThemedText style={[styles.reasonTitle, selected && { color: Palette.white }]}>{r.label}</ThemedText>
                            <ThemedText style={[styles.reasonSub, selected && { color: Palette.white, opacity: 0.9 }]}>{r.sub}</ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : null}

                {step === 5 ? (
                  <>
                    <ThemedText style={styles.questionTitle}>¡Todo listo!</ThemedText>
                    <View style={styles.finalInfo}>
                      <ThemedText style={styles.finalText}>• Te mostraremos tu ahorro en tiempo real</ThemedText>
                      <ThemedText style={styles.finalText}>• Seguimiento de tu salud y progreso</ThemedText>
                      <ThemedText style={styles.finalText}>• Consejos personalizados cada día</ThemedText>
                    </View>
                    <View style={styles.fumiGroupContainer}>
                      <Text style={styles.companionTextBold}>
                        Fumi será tu compañero de viaje para dejar de fumar
                      </Text>
                    </View>
                  </>
                ) : null}
              </MotiView>
            </AnimatePresence>
          </ScrollView>
        </View>
      </View>

      {/* Separador recto - Subido */}
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        {step === 5 && (
          <View style={styles.separatorFumiGroup}>
            <Image
              source={require('@/assets/images/fumideporte.png')}
              style={styles.separatorFumiIcon}
              resizeMode="contain"
            />
            <Image
              source={require('@/assets/images/fumielegante (2).png')}
              style={styles.separatorFumiIcon}
              resizeMode="contain"
            />
            <Image
              source={require('@/assets/images/fumirico (2).png')}
              style={styles.separatorFumiIcon}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* Parte inferior - Blanco con mascota FUMI y texto explicativo */}
      <View style={[styles.bottomSection, { height: screenHeight / 2 }]}>
        <View style={styles.bottomContent}>
          <View style={styles.explanationContainer}>
            {step !== 5 ? (
              <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: -20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                key={`fumi-${step}`}>
                <Image
                  source={
                    step % 3 === 0
                      ? require('@/assets/images/fumireloj.png')
                      : step % 3 === 1
                      ? require('@/assets/images/fumimedico.png')
                      : require('@/assets/images/fumicelebrando.png')
                  }
                  style={styles.mascotImage}
                  resizeMode="contain"
                />
              </MotiView>
            ) : null}
            {step !== 5 ? (
              <MotiView
                from={{ opacity: 0, translateY: 20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 180, delay: 100 }}
                key={`explanation-${step}`}>
                <View style={styles.explanationBox}>
                  <ThemedText style={styles.explanationText} numberOfLines={4} adjustsFontSizeToFit>
                    {EXPLANATIONS[step]}
                  </ThemedText>
                </View>
              </MotiView>
            ) : (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                key="fumi-companion">
                <View style={styles.bottomFumiGroup}>
                  <Image
                    source={require('@/assets/images/fumisentadopeluche.png')}
                    style={styles.mainFumiImage}
                    resizeMode="contain"
                  />
                  <View style={styles.companionMessageBox}>
                    <ThemedText style={styles.companionMessageText}>
                      ¡Estaré contigo en cada paso del camino! 🌟
                    </ThemedText>
                  </View>
                </View>
              </MotiView>
            )}
          </View>
          
          {/* Botón continuar - Debajo del texto */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.nextButton, !nextEnabled && styles.nextButtonDisabled]}
              disabled={!nextEnabled}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (step < 5) {
                  setStep(step + 1);
                  return;
                }
                if (!reason) return;
                actions.completeOnboarding({ cigsPerDay, packPriceCents, reason, age, yearsSmoking });
                router.replace('/');
              }}>
              <ThemedText style={styles.nextButtonText}>{step < 5 ? 'Continuar' : 'Empezar'}</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.brown,
  },
  // Parte superior - Marrón pastel
  topSection: {
    backgroundColor: Palette.brown,
    width: '100%',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    position: 'relative',
  },
  topContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  questionScroll: {
    flex: 1,
  },
  questionContent: {
    paddingBottom: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  questionWrap: {
    width: '100%',
  },
  questionTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: Palette.white,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 44,
    marginBottom: 40,
    paddingHorizontal: 8,
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  // Separador con forma de ola pronunciada
  separator: {
    height: 4,
    width: '100%',
    backgroundColor: 'transparent',
    position: 'relative',
    marginTop: -20,
    zIndex: 10,
  },
  separatorLine: {
    width: '100%',
    height: 4,
    backgroundColor: Palette.white,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  separatorFumiGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    zIndex: 11,
  },
  separatorFumiIcon: {
    width: 100,
    height: 100,
    flexShrink: 0,
  },
  // Parte inferior - Blanco
  bottomSection: {
    backgroundColor: Palette.white,
    width: '100%',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 0,
  },
  bottomContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 15,
    paddingTop: 12,
    backgroundColor: Palette.white,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonTop: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  backButtonTopText: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.white,
    includeFontPadding: false,
  },
  explanationContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    width: '100%',
    maxWidth: '100%',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  mascotImage: {
    width: 220,
    height: 220,
    flexShrink: 0,
  },
  explanationBox: {
    width: '100%',
    backgroundColor: Palette.brown,
    borderRadius: 24,
    padding: 16,
    borderWidth: 4,
    borderColor: Palette.white,
    minHeight: 90,
    maxHeight: 110,
    justifyContent: 'center',
    position: 'relative',
    maxWidth: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 12px rgba(0,0,0,0.25)',
      },
    }),
  },
  explanationText: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.white,
    textAlign: 'left',
    lineHeight: 22,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  pillButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Palette.brown,
  },
  pillText: {
    fontSize: 28,
    fontWeight: '900',
    color: Palette.brown,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  numberBox: {
    alignItems: 'center',
    gap: 6,
    minWidth: 140,
    paddingHorizontal: 20,
  },
  bigNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: Palette.white,
    letterSpacing: 1,
    includeFontPadding: false,
    lineHeight: 72,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  unit: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.white,
    opacity: 0.9,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: Palette.white,
    borderWidth: 3,
    borderColor: Palette.brown,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.brown,
    marginRight: 12,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: Palette.brown,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  infoBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: Palette.brown,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.brown,
    textAlign: 'center',
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  reasonsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  reasonCard: {
    flex: 1,
    minWidth: 100,
    maxWidth: 110,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Palette.white,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 8,
  },
  reasonCardSelected: {
    backgroundColor: Palette.brown,
    borderColor: Palette.white,
  },
  reasonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.white,
    borderWidth: 3,
    borderColor: Palette.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  reasonCardSelectedIcon: {
    backgroundColor: Palette.white,
    borderColor: Palette.white,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Palette.brown,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  reasonSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textMedium,
    textAlign: 'center',
    includeFontPadding: false,
    paddingHorizontal: 4,
    lineHeight: 14,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  finalInfo: {
    marginTop: 8,
    gap: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.white,
    includeFontPadding: false,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  nextButton: {
    width: '100%',
    borderRadius: 28,
    height: 56,
    backgroundColor: Palette.brown,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Palette.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: Palette.white,
    includeFontPadding: false,
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  doneButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Palette.white,
    borderWidth: 3,
    borderColor: Palette.brown,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: Palette.brown,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  fumiGroupContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 8,
  },
  companionText: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.white,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 30,
    paddingHorizontal: 12,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  companionTextBold: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.white,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 32,
    paddingHorizontal: 12,
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  fumiGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  fumiIcon: {
    width: 100,
    height: 100,
    flexShrink: 0,
  },
  bottomFumiGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  mainFumiImage: {
    width: 180,
    height: 180,
    flexShrink: 0,
  },
  companionMessageBox: {
    width: '100%',
    backgroundColor: Palette.brown,
    borderRadius: 24,
    padding: 18,
    borderWidth: 4,
    borderColor: Palette.white,
    minHeight: 80,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 12px rgba(0,0,0,0.25)',
      },
    }),
  },
  companionMessageText: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.white,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
});
