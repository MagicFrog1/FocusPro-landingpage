import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ZenBackground } from '@/components/zen-background';

type Variant = 'auto' | 'light' | 'dark';

export function ZenScreen({
  children,
  variant = 'auto',
  padded = true,
  contentStyle,
  scrollable = true,
}: {
  children: ReactNode;
  variant?: Variant;
  padded?: boolean;
  contentStyle?: ViewStyle;
  scrollable?: boolean;
}) {
  return (
    <View style={styles.root}>
      <ZenBackground variant={variant} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.scrollContent, padded ? styles.padded : null, contentStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, padded ? styles.padded : null, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  padded: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
});


