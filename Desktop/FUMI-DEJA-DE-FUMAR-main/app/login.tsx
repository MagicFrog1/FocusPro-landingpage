import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';

import { ThemedText } from '@/components/themed-text';
import { ZenScreen } from '@/components/zen-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { useFumoBye } from '@/fumobye/store';

export default function LoginScreen() {
  const { actions } = useFumoBye();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputTextColor = isDark ? '#ECEDEE' : '#11181C';
  const inputPlaceholderColor = isDark ? 'rgba(255,255,255,0.40)' : 'rgba(20,20,22,0.35)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.28)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(231, 184, 112, 0.22)';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await actions.login(email.trim(), password);
      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        setError('Email o contraseña incorrectos');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta de nuevo.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ZenScreen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <ThemedText type="title">Bienvenido a Fumi</ThemedText>
        <ThemedText style={styles.sub}>Inicia sesión para continuar tu viaje sin humo.</ThemedText>

        <GlassCard style={styles.card}>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              placeholder="tu@email.com"
              placeholderTextColor={inputPlaceholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: inputTextColor, backgroundColor: inputBg, borderColor: inputBorder }]}
            />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              placeholder="••••••••"
              placeholderTextColor={inputPlaceholderColor}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: inputTextColor, backgroundColor: inputBg, borderColor: inputBorder }]}
            />
          </View>

          <AnimatePresence>
            {error ? (
              <MotiView
                from={{ opacity: 0, translateY: -4 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -4 }}
                transition={{ type: 'timing', duration: 200 }}>
                <ThemedText style={styles.error}>{error}</ThemedText>
              </MotiView>
            ) : null}
          </AnimatePresence>

          <PillButton variant="primary" onPress={handleLogin} disabled={loading} style={styles.loginBtn}>
            <ThemedText style={styles.loginBtnText}>{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}</ThemedText>
          </PillButton>

          <ThemedText style={styles.hint}>
            Demo: Cualquier email y contraseña funcionan. En producción, esto conectaría con un servidor real.
          </ThemedText>
        </GlassCard>
      </ScrollView>
    </ZenScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 64, paddingBottom: 28, gap: 16 },
  sub: { marginTop: 8, opacity: 0.78 },
  card: { marginTop: 12, gap: 16 },
  field: { gap: 8 },
  label: { fontWeight: '800', opacity: 0.9 },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff5c5c',
    fontWeight: '700',
    marginTop: 4,
  },
  loginBtn: { marginTop: 8 },
  loginBtnText: { fontWeight: '900' },
  hint: { marginTop: 8, opacity: 0.65, fontSize: 12, textAlign: 'center' },
});




