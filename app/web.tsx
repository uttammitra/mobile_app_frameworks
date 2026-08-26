import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { UrlView } from '../src/HtmlView';

export default function Web() {
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();
  return (
    <>
      <Stack.Screen options={{ title: title ?? '' }} />
      <UrlView url={String(url)} />
    </>
  );
}
