import { Palette } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { Link, router } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AshOverlay } from '@/components/ash-overlay';
import { ThemedText } from '@/components/themed-text';
import { PillButton } from '@/components/ui/pill-button';
import { ZenScreen } from '@/components/zen-screen';
import { useFumoBye } from '@/fumobye/store';
import { calcDailySpendCents, clamp, currencySymbol, formatMoneyFromCents } from '@/fumobye/utils';

type CurrencyOption = 'EUR' | 'USD' | 'GBP' | 'MXN';


function levelLabel(days: number) {
  if (days >= 90) return 'Pulmón de Diamante';
  if (days >= 60) return 'Leyenda Respiratoria';
  if (days >= 30) return 'Pulmón de Acero';
  if (days >= 14) return 'Veterano con Estilo';
  if (days >= 7) return 'Aprendiz Serio';
  if (days >= 3) return 'Novato con Ganas';
  return 'Recién Despierto';
}


export default function PerfilScreen() {
  const { state, actions, daysSmokeFree, savedCentsNow } = useFumoBye();
  const inputTextColor = Palette.textDark;
  const inputPlaceholderColor = Palette.textLight;

  const [ash, setAsh] = useState(false);
  const [editing, setEditing] = useState(false);

  const currency = (state.settings.currency ?? 'EUR') as CurrencyOption;
  const bestDays = state.progress.bestStreakDays ?? 0;

  const [draftCigs, setDraftCigs] = useState(String(state.settings.cigsPerDay ?? 20));
  const [draftPackPrice, setDraftPackPrice] = useState(((state.settings.packPriceCents ?? 500) / 100).toFixed(2));
  const [draftCurrency, setDraftCurrency] = useState<CurrencyOption>(currency);

  // Requerir premium
  useEffect(() => {
    if (!state.premium.active) {
      router.replace('/premium');
    }
  }, [state.premium.active]);


  useEffect(() => {
    if (!editing) return;
    setDraftCigs(String(state.settings.cigsPerDay ?? 20));
    setDraftPackPrice(((state.settings.packPriceCents ?? 500) / 100).toFixed(2));
    setDraftCurrency(currency);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const dailySpendCents = useMemo(() => calcDailySpendCents(state.settings), [state.settings]);
  const lvl = useMemo(() => levelLabel(daysSmokeFree), [daysSmokeFree]);


  return (
    <ZenScreen contentStyle={{ paddingBottom: 96, backgroundColor: Palette.white }}>
      <AshOverlay visible={ash} onDone={() => setAsh(false)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cabecera Dinámica */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={styles.title}>Tu Perfil</ThemedText>
              <ThemedText style={styles.sub}>
                {daysSmokeFree > 0 ? `Nivel: ${lvl}` : 'Tu amigo Fumi está calentando motores.'}
              </ThemedText>
            </View>
          </View>
        </MotiView>

        {/* Identidad + récord */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle" style={styles.cardTitle}>Tu Perfil</ThemedText>
                <ThemedText style={styles.muted}>
                  {state.onboardingCompleted ? 'Información de tu cuenta y configuración' : 'Completa el onboarding para comenzar'}
                </ThemedText>
              </View>
              <View style={styles.badgePill}>
                <ThemedText style={styles.badgeText}>{daysSmokeFree} días</ThemedText>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={[styles.statMiniCard, { backgroundColor: Palette.cream }]}>
                <ThemedText style={styles.statLabel}>Récord histórico</ThemedText>
                <ThemedText style={styles.statValue}>{bestDays} días</ThemedText>
              </View>
              <View style={[styles.statMiniCard, { backgroundColor: Palette.pinkBeige }]}>
                <ThemedText style={styles.statLabel}>Motor (hoy)</ThemedText>
                <ThemedText style={styles.statValue}>{formatMoneyFromCents(dailySpendCents, currency)}/día</ThemedText>
              </View>
            </View>
          </View>
        </MotiView>


        {/* Configuración de Ahorro */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 150 }}>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle" style={styles.cardTitle}>Configuración de Ahorro</ThemedText>
                <ThemedText style={styles.muted}>
                  Ajusta tus preferencias de consumo y moneda
                </ThemedText>
              </View>
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEditing((v) => !v);
                }}
                style={styles.editBtn}>
                <ThemedText style={styles.editBtnText}>{editing ? 'Cerrar' : 'Editar'}</ThemedText>
              </Pressable>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Precio paquete</ThemedText>
                <ThemedText style={styles.summaryValue}>{formatMoneyFromCents(state.settings.packPriceCents, currency)}</ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Cigarros/día</ThemedText>
                <ThemedText style={styles.summaryValue}>{state.settings.cigsPerDay}</ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Moneda</ThemedText>
                <ThemedText style={styles.summaryValue}>{currencySymbol(currency)} · {currency}</ThemedText>
              </View>
            </View>

            <AnimatePresence>
              {editing ? (
                <MotiView
                  from={{ opacity: 0, translateY: -6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -6 }}
                  transition={{ type: 'timing', duration: 220 }}
                  style={{ gap: 12 }}>
                  <View style={styles.fieldRow}>
                    <ThemedText style={styles.fieldLabel}>Precio del paquete</ThemedText>
                    <View style={styles.inputWrap}>
                      <ThemedText style={styles.inputPrefix}>{currencySymbol(draftCurrency)}</ThemedText>
                      <TextInput
                        value={draftPackPrice}
                        onChangeText={setDraftPackPrice}
                        keyboardType="decimal-pad"
                        placeholder="5.50"
                        placeholderTextColor={inputPlaceholderColor}
                        style={[styles.input, { color: inputTextColor }]}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldRow}>
                    <ThemedText style={styles.fieldLabel}>Cigarros por día</ThemedText>
                    <View style={styles.inputWrap}>
                      <TextInput
                        value={draftCigs}
                        onChangeText={setDraftCigs}
                        keyboardType="number-pad"
                        placeholder="20"
                        placeholderTextColor={inputPlaceholderColor}
                        style={[styles.input, { color: inputTextColor }]}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldRow}>
                    <ThemedText style={styles.fieldLabel}>Moneda</ThemedText>
                    <View style={styles.currencyRow}>
                      {(['EUR', 'USD', 'GBP', 'MXN'] as CurrencyOption[]).map((c) => {
                        const on = draftCurrency === c;
                        return (
                          <Pressable
                            key={c}
                            onPress={async () => {
                              setDraftCurrency(c);
                              await Haptics.selectionAsync();
                            }}
                            style={[styles.currencyChip, on ? styles.currencyChipOn : styles.currencyChipOff]}>
                            <ThemedText style={[styles.currencyChipText, on ? styles.currencyChipTextOn : null]}>
                              {currencySymbol(c)} {c}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <PillButton
                    variant="primary"
                    onPress={async () => {
                      const normalizedPrice = draftPackPrice.replace(',', '.').replace(/[^0-9.]/g, '');
                      const price = Number(normalizedPrice);
                      const priceCents = Number.isFinite(price) && price > 0 ? Math.round(price * 100) : 0;
                      const cigs = clamp(parseInt(draftCigs.replace(/[^0-9]/g, ''), 10) || 0, 0, 200);

                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      actions.updateSettings({
                        packPriceCents: priceCents > 0 ? priceCents : state.settings.packPriceCents,
                        cigsPerDay: cigs,
                        currency: draftCurrency,
                      } as any);
                      setEditing(false);
                    }}>
                    <ThemedText style={{ fontWeight: '900' }}>Guardar cambios</ThemedText>
                  </PillButton>
                </MotiView>
              ) : null}
            </AnimatePresence>
          </View>
        </MotiView>


        {/* Premium */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}>
          <View style={[styles.card, styles.premiumCard]}>
            <View style={{ gap: 10 }}>
              <ThemedText type="subtitle" style={styles.cardTitle}>Premium</ThemedText>
              <View style={{ gap: 4 }}>
                <ThemedText style={styles.bullet}>- Sincronización en la nube</ThemedText>
                <ThemedText style={styles.bullet}>- Consejos personalizados</ThemedText>
                <ThemedText style={styles.bullet}>- Widget exclusivo para iOS</ThemedText>
              </View>

              <Link href="/premium" asChild>
                <Pressable
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={styles.premiumBtn}>
                  <ThemedText style={styles.premiumBtnText}>
                    {state.premium.active ? 'Premium Activo' : 'Desbloquear Premium'}
                  </ThemedText>
                </Pressable>
              </Link>
            </View>
          </View>
        </MotiView>

        <View style={{ height: 18 }} />
      </ScrollView >
    </ZenScreen >
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 16 },
  headerRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 8 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: -0.5,
  },
  sub: { marginTop: 4, opacity: 0.8, fontSize: 16, fontWeight: '600', color: Palette.textMedium },
  muted: { opacity: 0.8, fontSize: 14, fontWeight: '600', color: Palette.textMedium },
  card: {
    backgroundColor: Palette.white,
    borderRadius: 28,
    padding: 20,
    gap: 16,
    borderWidth: 3,
    borderColor: Palette.brown,
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
  cardTitle: {
    color: Palette.textDark,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5A3E33',
    letterSpacing: -0.3,
  },


  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  badgePill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: Palette.brown,
    backgroundColor: Palette.cream,
  },
  badgeText: { fontWeight: '900', fontSize: 14, color: Palette.textDark },

  statRow: { flexDirection: 'row', gap: 12 },
  statMiniCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 3,
    borderColor: Palette.brown,
    gap: 6,
  },
  statLabel: { opacity: 0.8, fontSize: 12, fontWeight: '700', color: Palette.textMedium },
  statValue: { fontSize: 20, fontWeight: '900', color: Palette.textDark },

  editBtn: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderColor: Palette.brown,
    backgroundColor: Palette.white,
  },
  editBtnText: { fontWeight: '900', fontSize: 14, color: Palette.brown },

  summaryGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  summaryItem: {
    flexGrow: 1,
    minWidth: '30%',
    borderRadius: 20,
    padding: 14,
    borderWidth: 3,
    borderColor: Palette.brown,
    backgroundColor: Palette.cream,
    gap: 4,
  },
  fumiLevelBadgeLocked: {
    backgroundColor: '#F5F5F5',
  },
  fumiLevelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.white,
    textTransform: 'uppercase',
  },
  fumiLevelBadgeTextLocked: { color: '#8B5A2B', fontSize: 10, fontWeight: '900' },
  summaryLabel: { opacity: 0.8, fontSize: 12, fontWeight: '700', color: Palette.textMedium },
  summaryValue: { fontSize: 16, fontWeight: '900', color: Palette.textDark },

  fieldRow: { gap: 10 },
  fieldLabel: { fontSize: 15, fontWeight: '800', opacity: 0.9, color: Palette.textDark },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 20,
    paddingHorizontal: 14,
    borderWidth: 3,
    borderColor: Palette.brown,
    backgroundColor: Palette.white,
  },
  inputPrefix: { fontSize: 16, fontWeight: '900', color: Palette.brown },
  input: { flex: 1, paddingLeft: 10, fontSize: 16, fontWeight: '800', color: Palette.textDark },

  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 3,
  },
  currencyChipOn: { borderColor: Palette.brown, backgroundColor: Palette.cream },
  currencyChipOff: { borderColor: Palette.borderLight, backgroundColor: Palette.white },
  currencyChipText: { fontSize: 14, fontWeight: '900', color: Palette.textDark },
  currencyChipTextOn: { color: Palette.textDark },

  premiumCard: {
    backgroundColor: Palette.cream,
    borderColor: Palette.brown,
  },
  bullet: { opacity: 0.9, fontSize: 14, color: Palette.textDark, fontWeight: '700' },
  premiumBtn: {
    marginTop: 4,
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Palette.brown,
    backgroundColor: Palette.white,
  },
  premiumBtnText: { fontSize: 16, fontWeight: '900', color: Palette.brown },

  resetBtn: {
    borderRadius: 24,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Palette.error,
    backgroundColor: Palette.white,
    marginTop: 12,
  },
  resetBtnText: { fontSize: 16, fontWeight: '900', color: Palette.error },

});
