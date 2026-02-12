import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';

type Props = {
  count?: number;
  variant?: 'subtle' | 'sparkly';
};

type Dot = {
  key: string;
  leftPct: number;
  topPct: number;
  size: number;
  delayMs: number;
  durationMs: number;
  opacity: number;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function LightParticles({ count = 14, variant = 'subtle' }: Props) {
  const dots = useMemo<Dot[]>(() => {
    const rand = mulberry32(1337);
    const out: Dot[] = [];
    for (let i = 0; i < count; i++) {
      const size = variant === 'sparkly' ? 4 + rand() * 9 : 3 + rand() * 7;
      out.push({
        key: `dot-${i}`,
        leftPct: rand() * 100,
        topPct: rand() * 100,
        size,
        delayMs: Math.floor(rand() * 1400),
        durationMs: Math.floor(5200 + rand() * 5200),
        opacity: variant === 'sparkly' ? 0.16 + rand() * 0.18 : 0.10 + rand() * 0.14,
      });
    }
    return out;
  }, [count, variant]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dots.map((d) => (
        <MotiView
          key={d.key}
          from={{ translateY: 0, opacity: d.opacity * 0.7, scale: 0.95 }}
          animate={{ translateY: -24, opacity: d.opacity, scale: 1.06 }}
          transition={{
            type: 'timing',
            duration: d.durationMs,
            delay: d.delayMs,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.dot,
            {
              left: `${d.leftPct}%`,
              top: `${d.topPct}%`,
              width: d.size,
              height: d.size,
              borderRadius: d.size,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#fff',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});





