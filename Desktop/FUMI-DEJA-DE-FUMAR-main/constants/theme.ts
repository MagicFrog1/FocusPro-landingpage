/**
 * Paleta de Colores FumoBye - Estilo Cartoon
 * Basada en diseño suave, redondeado y simple
 * Organización horizontal por categorías
 */

import { Platform } from 'react-native';

// ============================================
// PALETA PRINCIPAL - Colores Base (Horizontal)
// ============================================
export const Palette = {
  // Colores Primarios (60% - Uso principal)
  cream: '#F5E6D3',        // Beige/crema claro (cuerpo principal)
  brown: '#D4A574',        // Marrón claro (fondo principal)
  white: '#FFFFFF',        // Blanco puro (bordes, nubes)
  
  // Colores Secundarios (20% - Acentos)
  pinkBeige: '#F0D4C4',    // Rosa-beige (orejas, patas, detalles)
  yellow: '#FFD166',       // Amarillo suave (acentos, highlights)
  softWhite: '#FFF8F0',   // Blanco suave (fondos alternativos)
  
  // Colores de Contorno (Outlines - Líneas gruesas)
  outlineDark: '#4A3428',  // Marrón oscuro (contornos principales)
  outlineMedium: '#5A3E33', // Marrón medio (contornos secundarios)
  outlineLight: '#8B6F47',  // Marrón claro (contornos sutiles)
  
  // Colores de Texto
  textDark: '#1A1A1A',     // Negro suave (texto principal)
  textMedium: '#4A3428',   // Marrón oscuro (texto secundario)
  textLight: '#666666',    // Gris medio (texto terciario)
  textWhite: '#FFFFFF',    // Blanco (texto sobre fondos oscuros)
  
  // Colores de Estado
  success: '#37D39A',      // Verde (éxito, completado)
  warning: '#FFD166',      // Amarillo (advertencia)
  error: '#FF6B6B',        // Rojo suave (error)
  info: '#4ECDC4',         // Turquesa (información)
  
  // Colores de Fondo
  background: '#F5E6D3',   // Fondo principal (crema)
  backgroundAlt: '#FFF8F0', // Fondo alternativo (blanco suave)
  surface: '#FFFFFF',      // Superficie (tarjetas, cards)
  surfaceAlt: '#F0D4C4',   // Superficie alternativa (rosa-beige)
  
  // Colores de Borde
  border: '#FFFFFF',       // Borde principal (blanco)
  borderDark: '#4A3428',  // Borde oscuro (marrón)
  borderLight: '#E0D4C4',  // Borde claro (beige)
} as const;

// ============================================
// PALETA BRAND - Compatibilidad con código existente
// ============================================
export const Brand = {
  // Colores principales (mapeo a nueva paleta)
  brownLight: Palette.brown,
  white: Palette.white,
  yellowSoft: Palette.yellow,
  
  // Variaciones
  brownLightDark: Palette.outlineMedium,
  brownLightLight: Palette.cream,
  whiteSoft: Palette.softWhite,
  yellowSoftDark: '#E8D68F',
  
  // Nuevos colores de la paleta
  cream: Palette.cream,
  pinkBeige: Palette.pinkBeige,
  outlineDark: Palette.outlineDark,
} as const;

// ============================================
// COLORES POR CONTEXTO - Sistema de gestión
// ============================================
const tintColorLight = Palette.brown;
const tintColorDark = Palette.white;

export const Colors = {
  light: {
    text: Palette.textDark,
    background: Palette.background,
    tint: tintColorLight,
    icon: Palette.outlineDark,
    tabIconDefault: Palette.textMedium,
    tabIconSelected: Palette.brown,
  },
  dark: {
    text: Palette.textWhite,
    background: Palette.brown,
    tint: tintColorDark,
    icon: Palette.white,
    tabIconDefault: Palette.softWhite,
    tabIconSelected: Palette.white,
  },
};

// ============================================
// UTILIDADES DE COLOR - Funciones helper
// ============================================
export const ColorUtils = {
  // Obtener color por nombre de la paleta
  get: (colorName: keyof typeof Palette): string => Palette[colorName],
  
  // Obtener color con opacidad
  withOpacity: (color: string, opacity: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  // Colores para tarjetas (cards)
  card: {
    primary: Palette.white,
    secondary: Palette.cream,
    accent: Palette.yellow,
    border: Palette.border,
    borderDark: Palette.borderDark,
  },
  
  // Colores para botones
  button: {
    primary: Palette.yellow,
    secondary: Palette.brown,
    success: Palette.success,
    text: Palette.textDark,
    textOnPrimary: Palette.textDark,
    textOnSecondary: Palette.white,
  },
  
  // Colores para texto
  text: {
    primary: Palette.textDark,
    secondary: Palette.textMedium,
    tertiary: Palette.textLight,
    onDark: Palette.textWhite,
    onLight: Palette.textDark,
  },
  
  // Colores para estados
  state: {
    achieved: Palette.success,
    inProgress: Palette.yellow,
    locked: Palette.textLight,
    error: Palette.error,
    info: Palette.info,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const AppFonts = {
  sans: 'Inter_400Regular',
  sansSemiBold: 'Inter_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
};
