import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppConfig, bundledConfig, cachedConfig, fetchConfig } from './config';

type Ctx = {
  config: AppConfig | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const ConfigContext = createContext<Ctx>({ config: null, loading: true, refresh: async () => {} });

export const useConfig = () => useContext(ConfigContext);

export function useTheme() {
  const { config } = useConfig();
  const t = (config?.theme ?? {}) as Record<string, any>;
  return {
    primary: t.primary ?? '#111827',
    background: t.background ?? '#FFFFFF',
    surface: t.surface ?? '#F8FAFC',
    card: t.card ?? '#FFFFFF',
    text: t.text ?? '#0F172A',
    textSecondary: t.textSecondary ?? '#64748B',
    border: t.border ?? '#E2E8F0',
    tabBar: t.tabBar ?? '#FFFFFF',
    tabActive: t.tabActive ?? t.primary ?? '#111827',
    tabInactive: t.tabInactive ?? '#94A3B8',
    cardRadius: Number(t.cardRadius ?? 14),
    fontStack: t.fontStack,
  };
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const live = await fetchConfig();
    if (live) setConfig(live);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      // 1. instant render from cache, 2. fall back to the bundled snapshot
      const cached = (await cachedConfig()) ?? bundledConfig();
      if (alive && cached) setConfig(cached);
      if (alive) setLoading(false);
      // 3. always refresh in the background (hot reload without a rebuild)
      await refresh();
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);

  return (
    <ConfigContext.Provider value={{ config, loading, refresh }}>{children}</ConfigContext.Provider>
  );
}
