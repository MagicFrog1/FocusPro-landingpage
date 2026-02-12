import { PropsWithChildren } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

type Props = PropsWithChildren<{
  variant?: 'pastel' | 'dark';
}>;

export function ScreenBackground({ children, variant }: Props) {
  const scheme = useColorScheme();
  const v: 'pastel' | 'dark' = variant ?? (scheme === 'dark' ? 'dark' : 'pastel');

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={
          v === 'dark'
            ? ['#07070A', '#0C0F1E', '#071A18']
            : ['#FFE7F3', '#E6FAFF', '#EAF9E8']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* “Glass haze” para sensación premium */}
      {v === 'pastel' ? (
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <BlurView intensity={12} tint="dark" style={[StyleSheet.absoluteFill, styles.darkHaze]} />
      )}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  darkHaze: { backgroundColor: 'rgba(10,10,12,0.25)' },
});





