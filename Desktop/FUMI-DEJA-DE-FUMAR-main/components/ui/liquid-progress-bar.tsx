import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

type Props = {
  value: number; // 0..1
  height?: number;
};

export function LiquidProgressBar({ value, height = 10 }: Props) {
  const v = Math.max(0, Math.min(1, value));
  const pct = `${Math.round(v * 100)}%`;

  return (
    <View style={[styles.track, { height }]}>
      <MotiView
        style={[styles.fillWrap, { width: pct }]}
        from={{ translateY: 0 }}
        animate={{ translateY: -1 }}
        transition={{ type: 'timing', duration: 800, loop: true }}
      >
        <LinearGradient
          colors={['rgba(43,255,155,0.92)', 'rgba(43,255,155,0.55)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        {/* “shimmer” suave para sensación líquida */}
        <MotiView
          style={styles.shimmerWrap}
          from={{ translateX: -60, opacity: 0.0 }}
          animate={{ translateX: 160, opacity: 0.35 }}
          transition={{ type: 'timing', duration: 1200, loop: true }}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  fillWrap: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  shimmerWrap: {
    position: 'absolute',
    top: -8,
    bottom: -8,
    width: 60,
    borderRadius: 999,
    overflow: 'hidden',
  },
});





