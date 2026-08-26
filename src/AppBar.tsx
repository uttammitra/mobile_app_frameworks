import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
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
 */
export function AppBar({ title }: { title?: string }) {
  const { config } = useConfig();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const design = (config?.design ?? {}) as Record<string, any>;
  const template = String(design.template ?? 'appbar');
  if (template === 'none') return null;

  const showTitle = design.showTitle !== false;
  const bg = theme.appBar;
  const fg = theme.appBarText;
  const buttons = (config?.navigation?.appBarButtons ?? []) as any[];
  const logo = config?.app?.logo ?? config?.app?.icon ?? null;
  const label = title ?? config?.app?.name ?? '';

  return (
    <View style={{ backgroundColor: bg, paddingTop: insets.top }}>
      <View style={styles.bar}>
        <View style={styles.left}>
          {design.showLogoInBar && logo ? (
            <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
          ) : null}
          {showTitle ? (
            <Text numberOfLines={1} style={[styles.title, { color: fg, fontFamily: theme.fontFamilyRN }]}>
              {label}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {buttons.map((b, i) => (
            <Pressable
              key={b.id ?? String(i)}
              hitSlop={8}
              style={styles.btn}
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
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logo: { width: 26, height: 26, borderRadius: 6 },
  title: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  btn: { padding: 2 },
});
