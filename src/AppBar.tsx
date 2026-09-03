import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ion } from './icons';
import { useConfig, useTheme } from './ConfigProvider';
import { openNavTarget } from './nav';

/**
 * App bar rendered 100% from the CMS payload:
 *   design.template   -> appbar | tabs | drawer | none
 *   design.showTitle  -> show/hide the app name
 *   theme.appBar*     -> background / text colours (fall back to primary)
 *   navigation.appBarButtons[] -> right hand icons (bell is always first)
 *
 * The SAME component renders the home bar and every stacked screen header, so
 * the bar height never changes between screens (no vertical jump on navigate).
 * `showBack` swaps the logo for a back chevron; the title cross-fades.
 */
export const APP_BAR_HEIGHT = 52;

export function AppBar({ title, showBack = false }: { title?: string; showBack?: boolean }) {
  const { config } = useConfig();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const design = (config?.design ?? {}) as Record<string, any>;
  const template = String(design.template ?? 'appbar');

  const showTitle = design.showTitle !== false;
  const bg = theme.appBar;
  const fg = theme.appBarText;
  const buttons = (config?.navigation?.appBarButtons ?? []) as any[];
  const logo = config?.app?.logo ?? config?.app?.icon ?? null;
  const label = title ?? config?.app?.name ?? '';

  // Subtle fade/slide whenever the title changes between screens.
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [label, anim]);

  if (template === 'none') return null;

  return (
    <View style={{ backgroundColor: bg, paddingTop: insets.top }}>
      <View style={styles.bar}>
        <View style={styles.left}>
          {showBack ? (
            <Pressable
              hitSlop={10}
              style={styles.back}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            >
              <Ionicons name="chevron-back" size={24} color={fg} />
            </Pressable>
          ) : design.showLogoInBar && logo ? (
            <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
          ) : null}
          {showTitle ? (
            <Animated.Text
              numberOfLines={1}
              style={[
                styles.title,
                { color: fg, fontFamily: theme.fontFamilyRN },
                {
                  opacity: anim,
                  transform: [
                    { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
                  ],
                },
              ]}
            >
              {label}
            </Animated.Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {buttons.map((b, i) => (
            <Pressable
              key={b.id ?? String(i)}
              hitSlop={8}
              style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.55 : 1 }]}
              onPress={() => {
                if (b.action === 'notifications' || b.route === '/notifications') {
                  router.push('/notifications');
                  return;
                }
                const route = String(b.route ?? '');
                if (/^(tel:|mailto:)/i.test(route)) {
                  Linking.openURL(route).catch(() => {});
                  return;
                }
                openNavTarget(router, { label: b.label, route, action: b.action, url: b.url });
              }}
            >
              <Ionicons name={ion(b.icon)} size={22} color={fg} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: APP_BAR_HEIGHT,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logo: { width: 26, height: 26, borderRadius: 6 },
  back: { marginLeft: -4, marginRight: 2 },
  title: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  btn: { padding: 2 },
});
