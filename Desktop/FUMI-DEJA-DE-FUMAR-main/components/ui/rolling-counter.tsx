import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { type FumoByeCurrency } from '@/fumobye/utils';

type RollingCounterProps = {
  value: number; // valor en céntimos
  currency: FumoByeCurrency;
  style?: any;
  textStyle?: any;
};

export function RollingCounter({ value, currency, style, textStyle }: RollingCounterProps) {
  const animatedValue = useSharedValue(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      animatedValue.value = withTiming(value, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      });
      prevValueRef.current = value;
    } else {
      // Inicializar el valor
      animatedValue.value = value;
    }
  }, [value]);

  // Formatear valor para extraer partes
  const formattedValue = (value / 100).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Extraer símbolo y número
  const match = formattedValue.match(/^([^\d]*)([\d,]*)(\.?)(\d*)$/);
  const symbol = match?.[1] || '';
  const integerPart = match?.[2]?.replace(/,/g, '') || '0';
  const decimalPart = match?.[4] || '00';

  return (
    <View style={[styles.container, style]}>
      {symbol && <ThemedText style={[styles.text, textStyle]}>{symbol}</ThemedText>}
      
      {/* Parte entera - cada dígito con efecto de rollo */}
      {integerPart.split('').map((char, index) => {
        const digit = parseInt(char, 10);
        const position = integerPart.length - 1 - index;
        return (
          <RollingDigit
            key={`int-${index}-${digit}-${value}`}
            targetDigit={digit}
            position={position}
            isDecimal={false}
            animatedValue={animatedValue}
            textStyle={textStyle}
          />
        );
      })}
      
      {/* Separador decimal */}
      <ThemedText style={[styles.text, textStyle]}>,</ThemedText>
      
      {/* Parte decimal */}
      {decimalPart.split('').map((char, index) => {
        const digit = parseInt(char, 10);
        return (
          <RollingDigit
            key={`dec-${index}-${digit}-${value}`}
            targetDigit={digit}
            position={index}
            isDecimal={true}
            animatedValue={animatedValue}
            textStyle={textStyle}
          />
        );
      })}
    </View>
  );
}

function RollingDigit({
  targetDigit,
  position,
  isDecimal,
  animatedValue,
  textStyle,
}: {
  targetDigit: number;
  position: number;
  isDecimal: boolean;
  animatedValue: Animated.SharedValue<number>;
  textStyle?: any;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const currentValue = animatedValue.value / 100; // Convertir céntimos a euros
    
    // Calcular qué dígito debería mostrarse en esta posición
    let currentDigit: number;
    if (isDecimal) {
      // Para decimales
      const multiplier = Math.pow(10, position + 1); // +1 porque posición 0 = décimas
      const decimalPart = (currentValue % 1) * 100; // Obtener parte decimal como número entero (ej: 0.45 -> 45)
      currentDigit = Math.floor(decimalPart / Math.pow(10, position)) % 10;
    } else {
      // Para enteros
      const divisor = Math.pow(10, position);
      const intPart = Math.floor(currentValue);
      currentDigit = Math.floor(intPart / divisor) % 10;
    }
    
    // Calcular el offset para centrar el dígito actual
    // El contenedor tiene altura 40, cada dígito tiene altura 40
    // Queremos que el dígito actual esté centrado en la ventana visible
    // Si currentDigit es 5, el offset debería ser -5 * 40 para centrar el dígito 5
    const offset = -currentDigit * 40;

    return {
      transform: [{ translateY: offset }],
    };
  });

  // Crear una columna de dígitos 0-9 repetidos para efecto continuo
  // Incluimos múltiples repeticiones para permitir rollos largos
  const allDigits = Array.from({ length: 30 }, (_, i) => i % 10);

  return (
    <View style={styles.digitContainer}>
      <Animated.View style={[styles.digitWrapper, animatedStyle]}>
        {allDigits.map((digit, index) => (
          <View key={index} style={styles.digitItem}>
            <ThemedText style={[styles.text, textStyle]}>{digit}</ThemedText>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitContainer: {
    height: 40,
    width: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  digitItem: {
    height: 40,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
    color: '#fff',
  },
});
