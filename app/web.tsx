import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { UrlView } from '../src/HtmlView';

export default function Web() {
  const { url } = useLocalSearchParams<{ url: string; title?: string }>();
  return <UrlView url={String(url ?? '')} />;
}
