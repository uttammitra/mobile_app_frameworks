import Constants from 'expo-constants';
import React, { useEffect } from 'react';
import { AppState, Linking, Platform, Pressable, Text, View } from 'react-native';
import { BUNDLE_ID } from './config';
import { useConfig, useTheme } from './ConfigProvider';

/** Compares dotted versions: -1 if a<b, 0 equal, 1 if a>b. */
export function compareVersions(a: string, b: string) {
  const pa = String(a).split(/[^0-9]+/).filter(Boolean).map(Number);
  const pb = String(b).split(/[^0-9]+/).filter(Boolean).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

function installedVersion() {
  return String(Constants.nativeAppVersion ?? Constants.expoConfig?.version ?? '0.0.0');
}

function storeUrl(v: Record<string, any>, name: string) {
  if (Platform.OS === 'android') {
    return v.androidStoreUrl || `market://details?id=${BUNDLE_ID}`;
  }
  if (v.iosStoreUrl) return v.iosStoreUrl;
  if (v.iosAppId) return `itms-apps://apps.apple.com/app/id${v.iosAppId}`;
  return `itms-apps://search.itunes.apple.com/WebObjects/MZSearch.woa/wa/search?media=software&term=${encodeURIComponent(name)}`;
}

/** Blocks the app when Force Update or Maintenance Mode is on in the EatApp portal. */
export function UpdateGate({ children }: { children: React.ReactNode }) {
  const { config, refresh } = useConfig();
  const theme = useTheme();

  // Re-check settings every time the app comes back to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const v = (config?.version ?? {}) as Record<string, any>;
  const current = installedVersion();
  const mustUpdate = !!v.forceUpdate && !!v.minimumVersion && compareVersions(current, v.minimumVersion) < 0;
  const maintenance = !!v.maintenanceMode;
  if (!mustUpdate && !maintenance) return <>{children}</>;

  const name = config?.app?.name ?? 'the app';
  const open = async () => {
    const url = storeUrl(v, name);
    try {
      await Linking.openURL(url);
    } catch {
      await Linking.openURL(
        Platform.OS === 'android'
          ? `https://play.google.com/store/apps/details?id=${BUNDLE_ID}`
          : `https://apps.apple.com/search?term=${encodeURIComponent(name)}`,
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text, textAlign: 'center', fontFamily: theme.fontFamilyRN }}>
        {mustUpdate ? 'Update required' : 'Back shortly'}
      </Text>
      <Text style={{ fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
        {mustUpdate
          ? v.updateMessage || `A new version of ${name} is available. Please update to continue.`
          : v.maintenanceMessage || 'We are updating the app. Back shortly.'}
      </Text>
      {mustUpdate ? (
        <>
          <Pressable
            onPress={open}
            style={{ marginTop: 28, backgroundColor: theme.primary, paddingVertical: 14, paddingHorizontal: 36, borderRadius: theme.buttonRadius }}
          >
            <Text style={{ color: theme.appBarText, fontSize: 16, fontWeight: '600' }}>Update now</Text>
          </Pressable>
          <Text style={{ marginTop: 16, fontSize: 12, color: theme.textSecondary }}>
            Installed {current} · Required {v.minimumVersion}
          </Text>
        </>
      ) : (
        <Pressable onPress={refresh} style={{ marginTop: 24, padding: 12 }}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}
