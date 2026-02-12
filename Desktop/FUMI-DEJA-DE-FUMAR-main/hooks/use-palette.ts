/**
 * Hook para acceder a la paleta de colores de forma centralizada
 * Usa este hook en lugar de colores hardcodeados para mantener consistencia
 */

import { ColorUtils, Palette } from '@/constants/theme';

export function usePalette() {
  return {
    // Acceso directo a la paleta
    colors: Palette,
    
    // Utilidades de color
    utils: ColorUtils,
    
    // Colores comunes (shorthand)
    primary: Palette.cream,
    secondary: Palette.brown,
    accent: Palette.yellow,
    background: Palette.background,
    surface: Palette.surface,
    text: Palette.textDark,
    textSecondary: Palette.textMedium,
    textLight: Palette.textLight,
    textWhite: Palette.textWhite,
    border: Palette.border,
    
    // Colores de estado
    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    info: Palette.info,
    
    // Helper para opacidad
    withOpacity: ColorUtils.withOpacity,
  };
}

/**
 * Función helper para obtener colores sin hook (útil en estilos)
 */
export function getPaletteColor(colorName: keyof typeof Palette): string {
  return Palette[colorName];
}

/**
 * Función helper para obtener color con opacidad
 */
export function getColorWithOpacity(color: string, opacity: number): string {
  return ColorUtils.withOpacity(color, opacity);
}

