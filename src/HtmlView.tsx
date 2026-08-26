import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useConfig, useTheme } from './ConfigProvider';

const SYSTEM_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", system-ui, sans-serif';

/**
 * Renders CMS HTML (home sections, page-builder pages) exactly like the
 * dashboard preview: same font stack, same theme tokens.
 */
export function HtmlView({ html }: { html: string }) {
  const theme = useTheme();
  const router = useRouter();

  const doc = `<!doctype html><html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
<style>
  :root {
    --primary: ${theme.primary};
    --background: ${theme.background};
    --card: ${theme.card};
    --text: ${theme.text};
    --text-secondary: ${theme.textSecondary};
    --border: ${theme.border};
    --radius: ${theme.cardRadius}px;
  }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; min-height: 100%; background: var(--background); color: var(--text);
    font-family: ${theme.fontStack ?? SYSTEM_STACK}; -webkit-font-smoothing: antialiased; }
  img { max-width: 100%; height: auto; display: block; }
  a { color: var(--primary); }
  iframe { width: 100%; border: 0; }
</style>
</head><body>${html}</body></html>`;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: doc, baseUrl: '' }}
      style={[styles.web, { backgroundColor: theme.background }]}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      onShouldStartLoadWithRequest={(req) => {
        if (req.url === 'about:blank' || req.url.startsWith('data:') || req.url.startsWith('file:')) return true;
        // Never let the CMS/API host itself be opened as a page (it requires a login).
        if (/mobileforge-studio\.lovable\.app/i.test(req.url)) return false;
        if (/^(tel:|mailto:|sms:)/i.test(req.url)) {
          Linking.openURL(req.url).catch(() => {});
          return false;
        }
        if (/^https?:\/\//i.test(req.url) && req.isTopFrame !== false) {
          router.push({ pathname: '/web', params: { url: req.url } });
          return false;
        }
        return true;
      }}
    />
  );
}

/** Full-screen in-app browser used for every external navigation target. */
export function UrlView({ url }: { url: string }) {
  const theme = useTheme();
  const { config } = useConfig();
  const wv = (config?.webview ?? {}) as Record<string, any>;
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);

  const uri = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  if (failed) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 12 }}>
          This page could not be loaded.
        </Text>
        <Text
          onPress={() => Linking.openURL(uri).catch(() => {})}
          style={{ color: theme.primary, fontWeight: '600' }}
        >
          Open in browser
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.web}>
      <WebView
        source={{ uri }}
        originWhitelist={['*']}
        style={[styles.web, { backgroundColor: theme.background }]}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled={wv.cookies !== false}
        sharedCookiesEnabled={wv.cookies !== false}
        pullToRefreshEnabled={wv.pullToRefresh !== false}
        allowsBackForwardNavigationGestures
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        startInLoadingState
        userAgent={
          // Some sites block the default RN WebView UA — present as mobile Safari/Chrome.
          undefined
        }
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onHttpError={() => setLoading(false)}
        onShouldStartLoadWithRequest={(req) => {
          if (/^(tel:|mailto:|sms:|intent:)/i.test(req.url)) {
            Linking.openURL(req.url).catch(() => {});
            return false;
          }
          return true;
        }}
      />
      {loading && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={theme.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  web: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
