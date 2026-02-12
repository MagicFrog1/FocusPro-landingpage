export type Capricho = {
  id: string;
  tier: 'bronze' | 'silver' | 'gold';
  name: string;
  priceCents: number;
  emoji?: string;
  motivator?: string;
  asset: any;
};

export const MASCOTAS: Capricho[] = [
  {
    id: 'conejo',
    tier: 'bronze',
    name: 'Conejo Saltarín',
    priceCents: 2000,
    emoji: '🐰',
    motivator: 'Un compañero saltarín para tu Fumi.',
    asset: require('@/assets/images/mascotaconejo.png'),
  },
  {
    id: 'dino',
    tier: 'bronze',
    name: 'Dino Bebé',
    priceCents: 2000,
    emoji: '🦖',
    motivator: 'Pequeño pero con un gran rugido.',
    asset: require('@/assets/images/mascotadino.png'),
  },
  {
    id: 'perro',
    tier: 'silver',
    name: 'Perrito Fiel',
    priceCents: 2000,
    emoji: '🐶',
    motivator: 'Nunca te dejará solo en este camino.',
    asset: require('@/assets/images/msacotaperro.png'),
  },
  {
    id: 'gato',
    tier: 'gold',
    name: 'Gatito Místico',
    priceCents: 2000,
    emoji: '🐱',
    motivator: 'Tiene siete vidas, ¡cuida la tuya!',
    asset: require('@/assets/images/mscotagato.png'),
  },
];

export const CAPRICHOS = MASCOTAS; // Retrocompatibilidad básica por si se usa en otros sitios
