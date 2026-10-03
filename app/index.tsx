import React, { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useConfig, useTheme } from '../src/ConfigProvider';
import { HtmlView } from '../src/HtmlView';
import { homeHtml } from '../src/home';

export default function Home() {
  const { config, loading, refresh } = useConfig();
  const theme = useTheme();
  const html = useMemo(() => homeHtml(config), [config]);

  if (loading && !config) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!config) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      >
        <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
          Could not load the app configuration.{'\n'}Pull down to retry.
        </Text>
      </ScrollView>
    );
  }

  return <HtmlView html={html} />;
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
