import { StyleSheet, Text, type TextProps, Platform } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { AppFonts } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '700',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    fontFamily: Platform.select({
      ios: 'ui-rounded',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '700',
  },
});
