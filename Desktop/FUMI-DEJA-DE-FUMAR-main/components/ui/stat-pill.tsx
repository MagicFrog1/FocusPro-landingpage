import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: 2,
  },
  label: { opacity: 0.72, fontWeight: '800', fontSize: 12 },
  value: { fontWeight: '900' },
});





