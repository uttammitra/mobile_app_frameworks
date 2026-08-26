import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
  useOneSignal(config?.onesignal?.appId);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: config?.app?.name ?? 'Home' }} />
        <Stack.Screen name="p/[slug]" options={{ title: '' }} />
        <Stack.Screen name="web" options={{ title: '' }} />
      </Stack>
      <TabBar />
    </View>
  );
}

export default function RootLayout() {
  // touch extra so the config bundle is initialised early
  void Constants.expoConfig?.extra;
  return (
    <SafeAreaProvider>
      <ConfigProvider>
        <Shell />
      </ConfigProvider>
    </SafeAreaProvider>
  );
}
