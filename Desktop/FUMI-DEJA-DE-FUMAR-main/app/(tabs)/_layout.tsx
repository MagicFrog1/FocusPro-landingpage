import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Home, Sparkles, User } from 'lucide-react-native';

function TabIcon({
  icon: Icon,
  focused,
  color,
  size = 22,
}: {
  icon: typeof Home;
  focused: boolean;
  color: string;
  size?: number;
}) {
  if (focused) {
    return (
      <View style={styles.iconContainerActive}>
        <Icon color={Palette.white} size={size} strokeWidth={3} />
      </View>
    );
  }
  return (
    <View style={styles.iconContainerInactive}>
      <Icon color={Palette.brown} size={size} strokeWidth={2.5} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Palette.brown,
        tabBarInactiveTintColor: Palette.textLight,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: Palette.white }} />
        ),
        tabBarStyle: {
          position: 'relative',
          height: 70,
          backgroundColor: Palette.white,
          borderTopWidth: 4,
          borderTopColor: Palette.brown,
          paddingBottom: Platform.OS === 'ios' ? 10 : 12,
          paddingTop: 10,
          paddingHorizontal: 0,
          elevation: 0,
          shadowOpacity: 0,
          marginBottom: Platform.OS === 'ios' ? 3 : -5,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          gap: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Home} focused={focused} color={color} />,
        }}
      />

      <Tabs.Screen
        name="caprichos"
        options={{
          href: '/caprichos',
          title: '',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Sparkles} focused={focused} color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => <TabIcon icon={User} focused={focused} color={color} />,
        }}
      />

    </Tabs >
  );
}

const styles = StyleSheet.create({
  iconContainerActive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.brown,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Palette.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 3px 6px rgba(0,0,0,0.2)',
      },
    }),
  },
  iconContainerInactive: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Palette.cream,
    borderWidth: 3,
    borderColor: Palette.brown,
  },
});
