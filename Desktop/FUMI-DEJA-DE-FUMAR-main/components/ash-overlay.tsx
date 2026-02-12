import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';

type Particle = {
  id: string;
  x: number;
  size: number;
  delay: number;
  duration: number;
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

export function AshOverlay({ visible, onDone }: { visible: boolean; onDone?: () => void }) {
  const { width, height } = useWindowDimensions();
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    if (!visible) return;
    setSeed((s) => s + 1);
    const t = setTimeout(() => onDone?.(), 1750);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  const particles = useMemo<Particle[]>(() => {
    const rnd = mulberry32(seed);
    const count = 34;
    const list: Particle[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: `${seed}-${i}`,
        x: rnd() * width,
        size: 3 + rnd() * 7,
        delay: rnd() * 260,
        duration: 900 + rnd() * 900,
        opacity: 0.12 + rnd() * 0.22,
      });
    }
    return list;
  }, [seed, width]);

  return (
    <AnimatePresence>
      {visible ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'timing', duration: 180 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none">
          <View style={[StyleSheet.absoluteFill, styles.dim]} />
          {particles.map((p) => (
            <MotiView
              key={p.id}
              from={{ translateY: -24, translateX: p.x, opacity: 0 }}
              animate={{ translateY: height + 40, translateX: p.x + (p.x % 2 === 0 ? 10 : -10), opacity: p.opacity }}
              transition={{ type: 'timing', duration: p.duration, delay: p.delay }}
              style={[
                styles.particle,
                {
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size,
                },
              ]}
            />
          ))}
        </MotiView>
      ) : null}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  dim: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  particle: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#2A2A2E',
  },
});





