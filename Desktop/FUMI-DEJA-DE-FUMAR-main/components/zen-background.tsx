import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Brand } from '@/constants/theme';

type Variant = 'auto' | 'light' | 'dark';

export function ZenBackground({ variant = 'auto' }: { variant?: Variant }) {
  const scheme = useColorScheme() ?? 'light';
  const v = variant === 'auto' ? scheme : variant;

  const gradientColors = useMemo(() => {
    return v === 'dark'
      ? [Brand.night, '#0E101C', Brand.espresso]
      : [Brand.cream, Brand.latte, Brand.sand];
  }, [v]);

  const blobA = v === 'dark' ? 'rgba(231, 184, 112, 0.12)' : 'rgba(176, 122, 85, 0.26)';
  const blobB = v === 'dark' ? 'rgba(242, 215, 194, 0.10)' : 'rgba(231, 184, 112, 0.22)';
  const blobC = v === 'dark' ? 'rgba(176, 122, 85, 0.10)' : 'rgba(90, 62, 51, 0.10)';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[styles.blob, styles.blob1, { backgroundColor: blobA }]} />
      <View style={[styles.blob, styles.blob2, { backgroundColor: blobB }]} />
      <View style={[styles.blob, styles.blob3, { backgroundColor: blobC }]} />
      <BlurView intensity={v === 'dark' ? 22 : 28} tint={v === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, v === 'dark' ? styles.fogDark : styles.fogLight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 420,
    height: 420,
    top: -120,
    left: -140,
    transform: [{ rotate: '18deg' }],
  },
  blob2: {
    width: 520,
    height: 520,
    bottom: -180,
    right: -200,
    transform: [{ rotate: '-14deg' }],
  },
  blob3: {
    width: 320,
    height: 320,
    top: 210,
    right: -110,
    transform: [{ rotate: '8deg' }],
  },
  fogLight: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fogDark: {
    backgroundColor: 'rgba(10,10,12,0.18)',
  },
});


