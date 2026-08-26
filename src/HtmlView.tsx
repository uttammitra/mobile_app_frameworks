import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from './ConfigProvider';

const SYSTEM_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", system-ui, sans-serif';

/**
 * Renders CMS HTML (home sections, page-builder pages) exactly like the
 * dashboard preview: same font stack, same theme tokens.
 */
export function HtmlView({ html }: { html: string }) {
  const theme = useTheme();
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
  html, body { margin: 0; padding: 0; background: var(--background); color: var(--text);
    font-family: ${theme.fontStack ?? SYSTEM_STACK}; -webkit-font-smoothing: antialiased; }
  img { max-width: 100%; height: auto; display: block; }
  a { color: var(--primary); }
  iframe { width: 100%; border: 0; }
</style>
</head><body>${html}</body></html>`;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: doc }}
      style={[styles.web, { backgroundColor: theme.background }]}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      allowsInlineMediaPlayback
    />
  );
}

export function UrlView({ url }: { url: string }) {
  const theme = useTheme();
  return (
    <WebView
      source={{ uri: url }}
      style={[styles.web, { backgroundColor: theme.background }]}
      javaScriptEnabled
      domStorageEnabled
      pullToRefreshEnabled
      allowsInlineMediaPlayback
    />
  );
}

const styles = StyleSheet.create({ web: { flex: 1 } });
