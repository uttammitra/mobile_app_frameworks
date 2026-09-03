import Constants from 'expo-constants';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppBar } from '../src/AppBar';
import { ConfigProvider, useConfig, useTheme } from '../src/ConfigProvider';
import { TabBar } from '../src/TabBar';

SplashScreen.preventAutoHideAsync().catch(() => {});

function useOneSignal(appId?: string) {
  useEffect(() => {
    if (!appId) return;
    (async () => {
      try {
        const { OneSignal } = await import('react-native-onesignal');
        OneSignal.initialize(appId);
        OneSignal.Notifications.requestPermission(true);
      } catch {
        /* OneSignal is unavailable in Expo Go — ignore */
      }
    })();
  }, [appId]);
}

function Shell() {
  const { config, loading } = useConfig();
  const theme = useTheme();
  const pathname = usePathname();
  useOneSignal(config?.onesignal?.appId);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  const isHome = pathname === '/' || pathname === '/index';
  const subTitle = pathname.startsWith('/notifications')
    ? 'Notifications'
    : (config?.pages ?? []).find((p) => pathname.endsWith(String(p.slug ?? '')))?.title ?? '';

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.appBarText === '#FFFFFF' ? 'light' : 'dark'} />
      <AppBar title={isHome ? undefined : subTitle} showBack={!isHome} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 220,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="p/[slug]" />
        <Stack.Screen name="web" />
        <Stack.Screen name="notifications" />
      </Stack>
      <TabBar />
    </View>
  );
}

export default function RootLayout() {
  void Constants.expoConfig?.extra;
  return (
    <SafeAreaProvider>
      <ConfigProvider>
        <Shell />
      </ConfigProvider>
    </SafeAreaProvider>
  );
}
