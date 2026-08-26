import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useConfig, useTheme } from '../../src/ConfigProvider';
import { HtmlView, UrlView } from '../../src/HtmlView';

export default function Page() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { config } = useConfig();
  const theme = useTheme();

  const page = (config?.pages ?? []).find(
    (p) => p.slug === slug || p.slug === `/${slug}` || p.slug?.replace(/^\//, '') === slug,
  );

  if (!page) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: String(slug ?? '') }} />
        <Text style={{ color: theme.textSecondary }}>This page is not available yet.</Text>
      </View>
    );
  }

  const url = (page as any).url as string | undefined;
  return (
    <>
      <Stack.Screen options={{ title: page.title ?? '' }} />
      {url && (page.type === 'iframe' || page.type === 'pdf' || page.type === 'youtube' || page.type === 'video') ? (
        <UrlView url={url} />
      ) : (
        <HtmlView html={page.html ?? ''} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
