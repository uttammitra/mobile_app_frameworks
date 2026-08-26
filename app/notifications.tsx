import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { NotificationItem } from '../src/config';
import { useConfig, useTheme } from '../src/ConfigProvider';

function ago(iso?: string | null) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '';
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
}

export default function Notifications() {
  const { config, refresh } = useConfig();
  const theme = useTheme();
  const [busy, setBusy] = useState(false);

  const items = (config?.notifications?.history ?? []) as NotificationItem[];

  const onRefresh = useCallback(async () => {
    setBusy(true);
    await refresh();
    setBusy(false);
  }, [refresh]);

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={items.length ? styles.list : styles.empty}
      data={items}
      keyExtractor={(n, i) => n.id ?? String(i)}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={onRefresh} tintColor={theme.primary} />}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Ionicons name="notifications-off-outline" size={34} color={theme.textSecondary} />
          <Text style={{ color: theme.textSecondary, marginTop: 10 }}>No notifications yet.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border, borderRadius: theme.cardRadius }]}>
          <View style={[styles.icon, { backgroundColor: `${theme.primary}1A` }]}>
            <Ionicons name="notifications" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            {!!item.message && (
              <Text style={[styles.msg, { color: theme.textSecondary }]}>{item.message}</Text>
            )}
            <Text style={[styles.time, { color: theme.textSecondary }]}>{ago(item.sentAt)}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, gap: 10 },
  empty: { flexGrow: 1 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  row: { flexDirection: 'row', gap: 12, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700' },
  msg: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 6 },
});
