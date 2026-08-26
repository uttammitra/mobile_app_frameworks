import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useConfig, useTheme } from '../../src/ConfigProvider';
import { HtmlView, UrlView } from '../../src/HtmlView';

export default function Page() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { config } = useConfig();
  const theme = useTheme();

  const key = String(slug ?? '').replace(/^\//, '');
  const page = (config?.pages ?? []).find(
    (p) => String(p.slug ?? '').replace(/^\//, '') === key,
  );

  if (!page) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>This page is not available yet.</Text>
      </View>
    );
  }

  const url = (page as any).url as string | undefined;
  const urlTypes = ['iframe', 'pdf', 'youtube', 'video', 'api', 'external'];
  if (url && (urlTypes.includes(String(page.type)) || /^https?:\/\//i.test(url))) {
    return <UrlView url={url} />;
  }
  return <HtmlView html={page.html ?? ''} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
