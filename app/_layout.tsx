import Constants from 'expo-constants';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

/** Simple back header used on stacked screens (page / web / notifications). */
function SubHeader({ title }: { title: string }) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: theme.appBar,
      }}
    >
      <Pressable hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
        <Ionicons name="chevron-back" size={24} color={theme.appBarText} />
      </Pressable>
      <Text
        numberOfLines={1}
        style={{ color: theme.appBarText, fontSize: 16, fontWeight: '700', flex: 1 }}
      >
        {title}
      </Text>
    </View>
  );
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
      {isHome ? <AppBar /> : <SubHeader title={subTitle} />}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
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
