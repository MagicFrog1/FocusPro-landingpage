import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

type Variant = 'primary' | 'secondary' | 'danger';

export function PillButton({
  children,
  variant = 'secondary',
  style,
  ...props
}: PressableProps & { children: ReactNode; variant?: Variant; style?: ViewStyle }) {
  const scheme = useColorScheme() ?? 'light';
  const dark = scheme === 'dark';

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.base,
        dark ? styles.baseDark : styles.baseLight,
        variant === 'primary' ? (dark ? styles.primaryDark : styles.primaryLight) : null,
        variant === 'danger' ? (dark ? styles.dangerDark : styles.dangerLight) : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  baseLight: {
    borderColor: 'rgba(255,255,255,0.40)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  baseDark: {
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  primaryLight: {
    borderColor: 'rgba(46,196,182,0.30)',
    backgroundColor: 'rgba(46,196,182,0.16)',
  },
  primaryDark: {
    borderColor: 'rgba(215,255,243,0.28)',
    backgroundColor: 'rgba(46,196,182,0.14)',
  },
  dangerLight: {
    borderColor: 'rgba(255,92,92,0.35)',
    backgroundColor: 'rgba(255,92,92,0.14)',
  },
  dangerDark: {
    borderColor: 'rgba(255,92,92,0.45)',
    backgroundColor: 'rgba(255,92,92,0.12)',
  },
  pressed: { opacity: 0.86 },
});





