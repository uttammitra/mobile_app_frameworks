import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BUNDLE_ID, NotificationItem } from './config';
import { useConfig } from './ConfigProvider';

const READ_KEY = `eatapp:notif:read:${BUNDLE_ID}`;
const MAX_REMEMBERED = 300;

async function loadReadIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(READ_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function saveReadIds(ids: string[]) {
  try {
    await AsyncStorage.setItem(READ_KEY, JSON.stringify(ids.slice(-MAX_REMEMBERED)));
  } catch {
    /* ignore */
  }
}

/**
 * Device-local unread state.
 *
 * `notifications.history` from the CMS is DELIVERY history, not unread state —
 * it must never drive the badge on its own, otherwise the newest message stays
 * "unread" forever. We remember the ids that were already seen on this device
 * and derive the badge from whatever is left.
 */
export function useNotificationCenter() {
  const { config } = useConfig();
  const [readIds, setReadIds] = useState<string[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadReadIds().then((ids) => {
      if (alive) setReadIds(ids);
    });
    return () => {
      alive = false;
    };
  }, []);

  const history = useMemo(() => {
    const items = (config?.notifications?.history ?? []) as NotificationItem[];
    return [...items]
      .filter(Boolean)
      .sort((a, b) => new Date(b.sentAt ?? 0).getTime() - new Date(a.sentAt ?? 0).getTime());
  }, [config?.notifications?.history]);

  const unread = useMemo(() => {
    if (!readIds) return [];
    const seen = new Set(readIds);
    return history.filter((n, i) => !seen.has(String(n.id ?? i)));
  }, [history, readIds]);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = Array.from(
        new Set([...(prev ?? []), ...history.map((n, i) => String(n.id ?? i))]),
      );
      void saveReadIds(next);
      return next;
    });
  }, [history]);

  return {
    history,
    unread,
    unreadCount: unread.length,
    ready: readIds !== null,
    markAllRead,
  };
}
