import { StyleSheet, View } from 'react-native';

export function ProgressBar({
  value,
  height = 10,
  trackColor = 'rgba(255,255,255,0.14)',
  fillColor = 'rgba(46,196,182,0.70)',
}: {
  value: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
}) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${Math.round(v * 100)}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});


