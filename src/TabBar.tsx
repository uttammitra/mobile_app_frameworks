import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavItem } from './config';
import { useConfig, useTheme } from './ConfigProvider';

/** CMS icon names (lucide-ish) → Ionicons. */
const ICONS: Record<string, string> = {
  Home: 'home', Menu: 'restaurant', ShoppingBag: 'bag', ShoppingCart: 'cart',
  MapPin: 'location', Phone: 'call', Mail: 'mail', Image: 'images', Camera: 'camera',
  Calendar: 'calendar', Star: 'star', Heart: 'heart', User: 'person', Users: 'people',
  Settings: 'settings', Info: 'information-circle', Gift: 'gift', Tag: 'pricetag',
  Clock: 'time', Globe: 'globe', Search: 'search', Bell: 'notifications',
  MoreHorizontal: 'ellipsis-horizontal', Utensils: 'restaurant', Truck: 'car',
};
const ion = (name?: string) => (ICONS[name ?? ''] ?? 'ellipse-outline') as any;

export function TabBar() {
  const { config } = useConfig();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<{ title: string; items: NavItem[] } | null>(null);

  const nav = config?.navigation ?? {};
  const all = (nav.items ?? []).filter(Boolean);
  if (!all.length) return null;

  const maxVisible = Math.max(2, Math.min(Number(nav.maxVisible ?? 4), 5));
  const visible = all.slice(0, maxVisible);
  const overflow = all.slice(maxVisible);

  const go = (item: NavItem) => {
    const isGroup = item.isGroup || item.action === 'group';
    const children = item.children ?? item.submenu?.items ?? [];
    if (isGroup && children.length) {
      setSheet({ title: item.submenu?.title ?? item.label, items: children });
      return;
    }
    if (item.action === 'external' && item.url) {
      router.push({ pathname: '/web', params: { url: item.url, title: item.label } });
      return;
    }
    const route = item.route ?? '/';
    if (route === '/') router.push('/');
    else router.push({ pathname: '/p/[slug]', params: { slug: route.replace(/^\//, '') } });
  };

  const isActive = (item: NavItem) => {
    const children = item.children ?? item.submenu?.items ?? [];
    if (children.length) return children.some((c) => c.route && pathname.endsWith(c.route));
    const route = item.route ?? '/';
    return route === '/' ? pathname === '/' : pathname.endsWith(route);
  };

  const cell = (item: NavItem, key: string) => {
    const active = isActive(item);
    const group = item.isGroup || item.action === 'group';
    return (
      <Pressable key={key} style={styles.tab} onPress={() => go(item)}>
        <Ionicons
          name={ion(item.icon)}
          size={22}
          color={active ? theme.tabActive : theme.tabInactive}
        />
        <Text
          numberOfLines={1}
          style={[styles.tabLabel, { color: active ? theme.tabActive : theme.tabInactive }]}
        >
          {item.label}
          {group ? ' ›' : ''}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        {visible.map((item, i) => cell(item, item.id ?? String(i)))}
        {overflow.length > 0 &&
          cell(
            {
              id: '__more',
              label: nav.moreLabel ?? 'More',
              icon: 'MoreHorizontal',
              isGroup: true,
              children: overflow,
            },
            '__more',
          )}
      </View>

      <Modal visible={!!sheet} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.card, paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: theme.border }]} />
          <Text style={[styles.sheetTitle, { color: theme.text }]}>{sheet?.title}</Text>
          <ScrollView>
            {(sheet?.items ?? []).map((child, i) => (
              <Pressable
                key={child.id ?? String(i)}
                style={[styles.row, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setSheet(null);
                  setTimeout(() => go(child), 120);
                }}
              >
                <Ionicons name={ion(child.icon)} size={20} color={theme.primary} />
                <Text style={[styles.rowLabel, { color: theme.text }]}>{child.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '70%',
  },
  grabber: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, marginBottom: 12 },
  sheetTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});
