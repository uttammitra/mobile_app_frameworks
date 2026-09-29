import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useConfig } from './ConfigProvider';

/** Branded splash from the EatApp portal (background, logo, title, duration, fade). */
export function SplashOverlay() {
  const { config, loading } = useConfig();
  const s = (config?.splash ?? {}) as Record<string, any>;
  const opacity = useRef(new Animated.Value(1)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading) return;
    const hold = Math.max(0, Number(s.duration ?? 2)) * 1000;
    const fade = Number(s.animationDuration ?? 600);
    const t = setTimeout(() => {
      if (s.animation === 'none') return setDone(true);
      Animated.timing(opacity, { toValue: 0, duration: fade, useNativeDriver: true }).start(() => setDone(true));
    }, hold);
    return () => clearTimeout(t);
  }, [loading]);

  if (done) return null;
  const textColor = s.textTheme === 'dark' ? '#000000' : '#FFFFFF';
  const body = (
    <View style={styles.center}>
      {s.showLogo !== false && s.logo ? <Image source={{ uri: s.logo }} style={styles.logo} resizeMode="contain" /> : null}
      {s.title ? <Text style={[styles.title, { color: textColor }]}>{s.title}</Text> : null}
      {s.subtitle ? <Text style={[styles.sub, { color: textColor }]}>{s.subtitle}</Text> : null}
    </View>
  );
  const bg = s.backgroundColor || '#000000';
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity, backgroundColor: bg, zIndex: 999 }]}>
      {s.backgroundImage && s.bg !== 'solid' ? (
        <ImageBackground source={{ uri: s.backgroundImage }} style={StyleSheet.absoluteFill} resizeMode="cover">{body}</ImageBackground>
      ) : (
        body
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: { width: 180, height: 180 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  sub: { fontSize: 15, marginTop: 6, textAlign: 'center', opacity: 0.85 },
});
