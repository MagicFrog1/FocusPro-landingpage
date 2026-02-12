import { PropsWithChildren } from 'react';
import { Platform, StyleProp, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  variant?: 'auto' | 'light' | 'dark';
}>;

export function GlassCard({ children, style, intensity, variant = 'auto' }: Props) {
  const scheme = useColorScheme();
  const isDark = (variant === 'auto' ? scheme : variant) === 'dark';
  return (
    <BlurView
      intensity={intensity ?? (isDark ? 18 : 28)}
      tint={isDark ? 'dark' : 'light'}
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight, Platform.OS === 'web' ? styles.webShadow : null, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardLight: {
    backgroundColor: 'rgba(255,250,246,0.30)',
    borderColor: 'rgba(231, 184, 112, 0.22)',
  },
  cardDark: {
    backgroundColor: '#D4A574', // 60% - Marrón claro (principal)
    borderColor: '#FFFFFF', // 20% - Blanco (secundario)
  },
  webShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
});


