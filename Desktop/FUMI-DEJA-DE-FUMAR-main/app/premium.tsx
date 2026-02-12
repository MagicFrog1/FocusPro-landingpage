import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  Activity,
  CheckCircle,
  Clock,
  CloudUpload,
  Heart,
  PiggyBank,
  TrendingUp,
  type LucideIcon
} from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/components/ui/glass-card';
import { ZenScreen } from '@/components/zen-screen';
import { Palette } from '@/constants/theme';
import { useFumoBye } from '@/fumobye/store';
import { getOfferings, purchasePackage, restorePurchases } from '@/services/revenuecat';

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: TrendingUp,
    title: 'Niveles de Fumi',
    description: 'Sistema de niveles y recompensas',
  },
  {
    icon: Clock,
    title: 'Contador Real',
    description: 'Actualización en tiempo real cada segundo',
  },
  {
    icon: Activity,
    title: 'Nivel de Consumo',
    description: 'Métricas detalladas de tu consumo',
  },
  {
    icon: PiggyBank,
    title: 'Cuenta de Ahorro',
    description: 'Visualiza tu ahorro en tiempo real',
  },
  {
    icon: Heart,
    title: 'Estado de Salud',
    description: 'Métricas de pulmones, oxígeno y energía',
  },
  {
    icon: CloudUpload,
    title: 'Sincronización en la nube',
    description: 'Datos seguros en todos tus dispositivos',
  },
];

export default function PremiumScreen() {
  const { state, actions } = useFumoBye();
  const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'annual'>('monthly');

  const handlePurchase = async (plan: 'monthly' | 'annual') => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Intentar compra con RevenueCat
      const offerings = await getOfferings();
      const currentOffering = offerings?.current;

      if (currentOffering && currentOffering.availablePackages.length > 0) {
        // Buscar el paquete correspondiente por tipo o identificador
        const packageIdentifier = plan === 'monthly' ? 'premium_monthly' : 'premium_annual';
        const packageType = plan === 'monthly' ? 'MONTHLY' : 'ANNUAL';

        // Buscar por identifier primero, luego por tipo
        let packageToPurchase = currentOffering.availablePackages.find(
          (pkg) => pkg.identifier === packageIdentifier
        );

        if (!packageToPurchase) {
          packageToPurchase = currentOffering.availablePackages.find(
            (pkg) => pkg.packageType === packageType
          );
        }

        // Si aún no hay, usar el primero disponible (fallback)
        if (!packageToPurchase && currentOffering.availablePackages.length > 0) {
          packageToPurchase = currentOffering.availablePackages[0];
        }

        if (packageToPurchase) {
          const customerInfo = await purchasePackage(packageToPurchase);
          if (customerInfo?.entitlements.active['premium']) {
            actions.setPremiumActive(true);
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 300);
            return;
          }
        }
      }

      // Si RevenueCat no está disponible o falla, usar modo demo
      actions.setPremiumActive(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 300);
    } catch (error) {
      console.error('Error en la compra:', error);
      // En caso de error, usar modo demo
      actions.setPremiumActive(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 300);
    }
  };

  return (
    <ZenScreen padded={false} variant="light" contentStyle={{ backgroundColor: Palette.white }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}>
          <GlassCard style={styles.comparisonCard}>
            <ThemedText style={styles.comparisonTitle}>
              💚 Cuida de Fumi, no lo dejes enfermo
            </ThemedText>
            <ThemedText style={styles.comparisonText}>
              Cada día sin fumar, Fumi se hace más fuerte. Premium te ayuda a seguir su evolución y celebrar cada logro juntos.
            </ThemedText>
          </GlassCard>
        </MotiView>

        {/* Lista de características - Compacta */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 500 }}>
          <View style={styles.featuresSection}>
            <ThemedText style={styles.featuresTitle}>Todo lo que incluye</ThemedText>
            <View style={styles.featuresList}>
              {FEATURES.map((feature, i) => {
                const IconComponent = feature.icon;
                return (
                  <MotiView
                    key={i}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 300, delay: 600 + i * 60 }}>
                    <View style={styles.featureCard}>
                      <View style={styles.featureIconContainer}>
                        <IconComponent size={22} color={Palette.brown} />
                      </View>
                      <View style={styles.featureContent}>
                        <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                        <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
                      </View>
                    </View>
                  </MotiView>
                );
              })}
            </View>
          </View>
        </MotiView>

        {/* Card Premium con precios y botones - Después */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 900 }}>
          <View style={styles.premiumCard}>
            {/* Stickers aleatorios de FUMI en esquinas */}
            <MotiView
              from={{ opacity: 0, scale: 0.8, rotate: '10deg' }}
              animate={{ opacity: 1, scale: 1, rotate: '8deg' }}
              transition={{ type: 'spring', delay: 1000 }}
              style={styles.stickerCorner1}>
              <Image
                source={require('@/assets/images/FUMI__2_-removebg-preview.png')}
                style={styles.stickerImageSmall}
                resizeMode="contain"
              />
            </MotiView>
            <MotiView
              from={{ opacity: 0, scale: 0.8, rotate: '-15deg' }}
              animate={{ opacity: 1, scale: 1, rotate: '-12deg' }}
              transition={{ type: 'spring', delay: 1100 }}
              style={styles.stickerCorner2}>
              <Image
                source={require('@/assets/images/fumicelebrando.png')}
                style={styles.stickerImageSmall}
                resizeMode="contain"
              />
            </MotiView>
            <MotiView
              from={{ opacity: 0, scale: 0.8, rotate: '12deg' }}
              animate={{ opacity: 1, scale: 1, rotate: '10deg' }}
              transition={{ type: 'spring', delay: 1200 }}
              style={styles.stickerCorner3}>
              <Image
                source={require('@/assets/images/FUMI_sentado-removebg-preview.png')}
                style={styles.stickerImageSmall}
                resizeMode="contain"
              />
            </MotiView>
            <MotiView
              from={{ opacity: 0, scale: 0.8, rotate: '-8deg' }}
              animate={{ opacity: 1, scale: 1, rotate: '-6deg' }}
              transition={{ type: 'spring', delay: 1300 }}
              style={styles.stickerCorner4}>
              <Image
                source={require('@/assets/images/fumimedico.png')}
                style={styles.stickerImageSmall}
                resizeMode="contain"
              />
            </MotiView>
            <View style={styles.premiumCardContent}>
              {/* Fumi sentado decorativo sobre el selector */}
              <MotiView
                from={{ opacity: 0, scale: 0.8, rotate: '5deg' }}
                animate={{ opacity: 1, scale: 1, rotate: '3deg' }}
                transition={{ type: 'spring', delay: 1400 }}
                style={styles.planDividerFumi}>
                <Image
                  source={require('@/assets/images/fumisentadopeluche.png')}
                  style={styles.planDividerFumiImage}
                  resizeMode="contain"
                />
              </MotiView>

              {/* Selector de plan mejorado - Vertical */}
              <View style={styles.planSelector}>
                {/* ANUAL - ARRIBA */}
                <View style={styles.planOptionWrapper}>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedPlan('annual');
                    }}
                    style={[
                      styles.planOption,
                      selectedPlan === 'annual' && styles.planOptionSelected,
                    ]}>
                    <View style={styles.planOptionContent}>
                      <View style={styles.planTextRow}>
                        <MotiView
                          from={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: selectedPlan === 'annual' ? 1 : 0.7, scale: selectedPlan === 'annual' ? 1 : 0.9 }}
                          transition={{ type: 'spring', delay: 0 }}
                          style={styles.planFumiContainerSmall}>
                          <Image
                            source={require('@/assets/images/fumielegante (2).png')}
                            style={styles.planFumiImageSmall}
                            resizeMode="contain"
                          />
                        </MotiView>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={[styles.planOptionText, selectedPlan === 'annual' && styles.planOptionTextSelected]}>
                            Plan Anual
                          </ThemedText>
                          <ThemedText style={[styles.planSubtext, selectedPlan === 'annual' && styles.planSubtextSelected]}>
                            29,99€/año · Solo 2,50€/mes
                          </ThemedText>
                        </View>
                        <View style={[styles.planBadgeInline, selectedPlan === 'annual' && styles.planBadgeSelected]}>
                          <ThemedText style={[styles.planBadgeText, selectedPlan === 'annual' && styles.planBadgeTextSelected]}>
                            Ahorra 17%
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </View>

                {/* MENSUAL - DEBAJO */}
                <View style={styles.planOptionWrapper}>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedPlan('monthly');
                    }}
                    style={[
                      styles.planOption,
                      selectedPlan === 'monthly' && styles.planOptionSelected,
                    ]}>
                    <View style={styles.planOptionContent}>
                      <View style={styles.planTextRow}>
                        <MotiView
                          from={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: selectedPlan === 'monthly' ? 1 : 0.7, scale: selectedPlan === 'monthly' ? 1 : 0.9 }}
                          transition={{ type: 'spring', delay: 0 }}
                          style={styles.planFumiContainerSmall}>
                          <Image
                            source={require('@/assets/images/fumirico (2).png')}
                            style={styles.planFumiImageSmall}
                            resizeMode="contain"
                          />
                        </MotiView>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={[styles.planOptionText, selectedPlan === 'monthly' && styles.planOptionTextSelected]}>
                            Plan Mensual
                          </ThemedText>
                          <ThemedText style={[styles.planSubtext, selectedPlan === 'monthly' && styles.planSubtextSelected]}>
                            Gratis 3 días, luego 4,99€/mes
                          </ThemedText>
                        </View>
                        <View style={[styles.freeTrialBadgeInline, selectedPlan === 'monthly' && styles.freeTrialBadgeSelected]}>
                          <ThemedText style={[styles.freeTrialBadgeText, selectedPlan === 'monthly' && styles.freeTrialBadgeTextSelected]}>
                            Prueba gratis
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </View>
              </View>

              <View style={styles.priceSection}>
                <MotiView
                  key={selectedPlan}
                  from={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' }}>
                  {selectedPlan === 'monthly' ? (
                    <>
                      <View style={styles.priceContainer}>
                        <ThemedText style={styles.price}>
                          Gratis
                        </ThemedText>
                        <ThemedText style={styles.priceUnit}>
                          {' '}3 días
                        </ThemedText>
                      </View>
                      <View style={styles.priceAfterTrialContainer}>
                        <ThemedText style={styles.priceAfterTrial}>
                          Después 4,99€/mes
                        </ThemedText>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.priceContainer}>
                        <ThemedText style={styles.price}>
                          29,99€
                        </ThemedText>
                        <ThemedText style={styles.priceUnit}>
                          /año
                        </ThemedText>
                      </View>
                      <View style={styles.priceEquivalentContainer}>
                        <ThemedText style={styles.priceEquivalent}>
                          Solo 2,50€/mes
                        </ThemedText>
                      </View>
                    </>
                  )}
                </MotiView>
                <ThemedText style={styles.priceNote}>
                  Cancela cuando quieras · Sin compromiso
                </ThemedText>
              </View>

              {!state.premium.active && (
                <>
                  <Pressable
                    style={({ pressed }) => [
                      styles.ctaButton,
                      { transform: [{ scale: pressed ? 0.98 : 1 }] },
                    ]}
                    onPress={() => handlePurchase(selectedPlan)}>
                    <ThemedText style={styles.ctaText}>
                      {selectedPlan === 'monthly' ? '3 días gratis ahora' : 'Suscribirse ahora'}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.restoreButton,
                      { transform: [{ scale: pressed ? 0.98 : 1 }] },
                    ]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const customerInfo = await restorePurchases();
                      if (customerInfo?.entitlements.active['premium']) {
                        actions.setPremiumActive(true);
                        setTimeout(() => {
                          router.replace('/(tabs)');
                        }, 300);
                      }
                    }}>
                    <ThemedText style={styles.restoreText}>Restaurar compras</ThemedText>
                  </Pressable>
                </>
              )}

              {state.premium.active && (
                <MotiView
                  from={{ scale: 0.95, opacity: 0.9 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', loop: true, repeatReverse: true }}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.ctaButton,
                      styles.ctaButtonActive,
                      { transform: [{ scale: pressed ? 0.98 : 1 }] },
                    ]}
                    disabled>
                    <View style={styles.ctaButtonActiveContent}>
                      <CheckCircle size={22} color={Palette.white} strokeWidth={3} />
                      <ThemedText style={styles.ctaTextActive}>
                        Premium Activado
                      </ThemedText>
                    </View>
                  </Pressable>
                </MotiView>
              )}
            </View>
          </View>
        </MotiView>

        {/* Enlaces legales */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 1200 }}>
          <Pressable
            style={({ pressed }) => [
              styles.legalLink,
              { transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/terminos');
            }}>
            <ThemedText style={styles.legalLinkText}>Términos y Condiciones</ThemedText>
          </Pressable>
        </MotiView>

        {/* Botón cerrar */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 1300 }}>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Cerrar la pantalla premium (es un modal)
              // Como se usa router.replace, no hay historial, así que redirigimos
              if (state.premium.active) {
                router.replace('/(tabs)');
              } else {
                // Si no tiene premium, no puede cerrar (la app requiere premium)
                // Pero permitimos cerrar de todas formas para que no se quede atrapado
                router.replace('/(tabs)');
              }
            }}>
            <ThemedText style={styles.closeText}>Cerrar</ThemedText>
          </Pressable>
        </MotiView>
      </ScrollView>
    </ZenScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerContent: { padding: 24, paddingTop: 80, paddingBottom: 40, gap: 24 },
  header: { alignItems: 'center', marginBottom: 8, gap: 12 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mascotImage: {
    width: 120,
    height: 120,
  },
  mascotImageSmall: {
    width: 60,
    height: 60,
  },
  crownContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  crownGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: Palette.textDark,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 44,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  subtitle: {
    fontSize: 16,
    color: Palette.textMedium,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  premiumCard: {
    borderRadius: 32,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: '#E8D0B0',
    backgroundColor: '#FFF8F0', // Cozy cream
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  premiumCardContent: {
    padding: 28,
    gap: 24,
    position: 'relative',
  },
  priceSection: {
    alignItems: 'center',
    gap: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 48,
    fontWeight: '900',
    color: Palette.brown,
    letterSpacing: 0.5,
    lineHeight: 56,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  priceUnit: {
    fontSize: 20,
    color: Palette.brown,
    opacity: 0.8,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  priceEquivalentContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Palette.pinkBeige,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Palette.brown,
  },
  priceEquivalent: {
    fontSize: 17,
    color: Palette.textDark,
    textAlign: 'center',
    fontWeight: '900',
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  priceAfterTrialContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Palette.pinkBeige,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Palette.brown,
  },
  priceAfterTrial: {
    fontSize: 17,
    color: Palette.textDark,
    textAlign: 'center',
    fontWeight: '900',
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  priceNote: {
    fontSize: 13,
    color: Palette.textMedium,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  planSelector: {
    flexDirection: 'column', // Vertical layout
    gap: 12,
    marginBottom: 24,
    marginTop: 20,
  },
  planDividerFumi: {
    position: 'absolute',
    top: -50,
    left: '50%',
    marginLeft: -45,
    width: 90,
    height: 90,
    zIndex: 10,
  },
  planDividerFumiImage: {
    width: '100%',
    height: '100%',
  },
  planOptionWrapper: {
    width: '100%', // Full width
    position: 'relative',
  },
  planOption: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FFF8F0', // Warm cream
    borderWidth: 2,
    borderColor: '#E8D0B0', // Soft beige border
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  planOptionSelected: {
    backgroundColor: '#D4A574', // Warm brown/tan
    borderColor: '#8B5A2B', // Darker brown
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 12px rgba(139, 90, 43, 0.25)',
      },
    }),
  },
  planOptionContent: {
    width: '100%',
  },
  planTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  planFumiContainerSmall: {
    width: 50,
    height: 50,
  },
  planFumiImageSmall: {
    width: '100%',
    height: '100%',
  },
  planFumiContainer: {
    width: 70,
    height: 70,
    marginBottom: 4,
  },
  planFumiImage: {
    width: '100%',
    height: '100%',
  },
  stickerLeft: {
    position: 'absolute',
    top: -25,
    left: -15,
    width: 60,
    height: 60,
    zIndex: 2,
  },
  stickerRight: {
    position: 'absolute',
    top: -25,
    right: -15,
    width: 60,
    height: 60,
    zIndex: 2,
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  stickerImageSmall: {
    width: '100%',
    height: '100%',
  },
  stickerCorner1: {
    position: 'absolute',
    top: -25,
    left: -20,
    width: 70,
    height: 70,
    zIndex: 5,
  },
  stickerCorner2: {
    position: 'absolute',
    top: -20,
    right: -15,
    width: 65,
    height: 65,
    zIndex: 5,
  },
  stickerCorner3: {
    position: 'absolute',
    bottom: -25,
    left: -18,
    width: 68,
    height: 68,
    zIndex: 5,
  },
  stickerCorner4: {
    position: 'absolute',
    bottom: -22,
    right: -20,
    width: 72,
    height: 72,
    zIndex: 5,
  },
  planOptionText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5A3E33', // Dark brown
    letterSpacing: 0.2,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  planOptionTextSelected: {
    color: '#FFFFFF', // White for selected
    fontWeight: '900',
    fontSize: 19,
  },
  planSubtext: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C7060',
    marginTop: 2,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  planSubtextSelected: {
    color: '#FFF8F0', // Light cream for selected
    opacity: 0.95,
  },
  planBadgeInline: {
    backgroundColor: '#FFDAB3', // Warm peach
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5A2B',
  },
  planBadgeSelected: {
    backgroundColor: '#FFF8F0', // Light cream when selected
    borderColor: '#FFF8F0',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#5A3E33',
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  planBadgeTextSelected: {
    color: '#8B5A2B', // Dark brown when selected
  },
  freeTrialBadgeInline: {
    backgroundColor: '#B8E6D5', // Soft mint green
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#37A87D',
  },
  freeTrialBadgeSelected: {
    backgroundColor: '#FFF8F0', // Light cream when selected
    borderColor: '#FFF8F0',
  },
  freeTrialBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2D6B53',
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  freeTrialBadgeTextSelected: {
    color: '#37A87D', // Green when selected
  },
  ctaButton: {
    borderRadius: 28,
    marginTop: 16,
    backgroundColor: '#8B5A2B',
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 16px rgba(139, 90, 43, 0.3)',
      },
    }),
  },
  ctaButtonActive: {
    backgroundColor: '#C9A882', // Warm tan/beige
    borderColor: '#8B5A2B',
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 12px rgba(139, 90, 43, 0.3)',
      },
    }),
  },
  ctaButtonActiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    color: Palette.white,
    letterSpacing: -0.2,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  ctaTextActive: {
    fontSize: 19,
    fontWeight: '900',
    color: Palette.white,
    letterSpacing: -0.2,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  comparisonCard: {
    padding: 24,
    marginBottom: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E8D0B0',
    backgroundColor: '#FFF8F0', // Cozy cream background
    ...Platform.select({
      ios: {
        shadowColor: '#8B5A2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5A3E33', // Dark brown
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  comparisonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8C7060', // Medium brown
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  featuresSection: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.textDark,
    letterSpacing: 0.3,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  featuresList: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#E8D0B0',
  },
  featureContent: {
    flex: 1,
    gap: 3,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.textDark,
    includeFontPadding: false,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  featureDescription: {
    fontSize: 12,
    color: Palette.textMedium,
    opacity: 0.8,
    lineHeight: 16,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  closeButton: {
    marginTop: 8,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Palette.brown,
    backgroundColor: Palette.cream,
  },
  closeText: {
    color: Palette.textDark,
    fontWeight: '800',
    fontSize: 16,
  },
  restoreButton: {
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Palette.brown,
    backgroundColor: Palette.cream,
  },
  restoreText: {
    color: Palette.textDark,
    fontWeight: '700',
    fontSize: 15,
  },
  legalLink: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  legalLinkText: {
    color: Palette.textMedium,
    opacity: 0.7,
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
