import { PropsWithChildren } from 'react';
import { Pressable, StyleProp, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';

type Props = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'ghost' | 'danger';
}>;

export function PrimaryButton({ children, onPress, disabled, style, variant = 'primary' }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (variant === 'ghost') {
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={[styles.ghost, disabled ? styles.disabled : null, style]}>
        <ThemedText style={styles.ghostText}>{children}</ThemedText>
      </Pressable>
    );
  }

  if (variant === 'danger') {
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={[styles.danger, disabled ? styles.disabled : null, style]}>
        <ThemedText style={styles.dangerText}>{children}</ThemedText>
      </Pressable>
    );
  }

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.wrap, disabled ? styles.disabled : null, style]}>
      <LinearGradient
        colors={isDark ? ['rgba(46,196,182,0.38)', 'rgba(120,210,255,0.22)'] : ['#2EC4B6', '#82D2FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.grad}
      />
      <ThemedText style={styles.text}>{children}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  grad: { ...StyleSheet.absoluteFillObject },
  text: { color: '#fff', fontWeight: '900' },
  ghost: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  ghostText: { fontWeight: '900' },
  danger: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,92,92,0.45)',
    backgroundColor: 'rgba(255,92,92,0.12)',
  },
  dangerText: { color: '#FF5C5C', fontWeight: '900' },
  disabled: { opacity: 0.55 },
});





