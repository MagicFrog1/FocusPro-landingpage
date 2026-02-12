import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { clamp } from '@/fumobye/utils';
import { useEffect, useState } from 'react';

type DonutChartProps = {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  subtitle?: string;
  showValue?: boolean;
};

export function DonutChart({
  value,
  size = 120,
  strokeWidth = 12,
  color = 'rgba(231, 184, 112, 0.85)',
  backgroundColor = 'rgba(255,255,255,0.18)',
  label,
  subtitle,
  showValue = true,
}: DonutChartProps) {
  const clamped = clamp(value, 0, 100);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Animación simple
    const duration = 800;
    const steps = 30;
    const stepValue = clamped / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const newValue = Math.min(stepValue * currentStep, clamped);
      setAnimatedValue(newValue);
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [clamped]);

  const strokeDashoffset = circumference * (1 - animatedValue / 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G transform={`translate(${center}, ${center})`}>
          {/* Background circle */}
          <Circle
            r={radius}
            fill="transparent"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            opacity={0.25}
          />
          {/* Progress circle con color REAL aplicado directamente */}
          <Circle
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90)"
            opacity={0.95}
          />
        </G>
      </Svg>
      <View style={styles.centerContent}>
        {showValue && (
          <ThemedText style={[styles.value, { fontSize: size * 0.18 }]}>
            {Math.round(clamped)}%
          </ThemedText>
        )}
        {label && (
          <ThemedText style={[styles.label, { fontSize: size * 0.11 }]} numberOfLines={1}>
            {label}
          </ThemedText>
        )}
        {subtitle && (
          <ThemedText style={[styles.subtitle, { fontSize: size * 0.09 }]} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  value: {
    fontWeight: '900',
    opacity: 0.95,
  },
  label: {
    fontWeight: '800',
    opacity: 0.85,
  },
  subtitle: {
    opacity: 0.7,
  },
});

