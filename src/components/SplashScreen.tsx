import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { THEME } from '../theme';

interface SplashScreenProps {
  onFinish?: () => void;
  statusText?: string;
}

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  statusText = 'INITIALIZING CLIENT CONCIERGE...',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress line animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) {
        // Smooth exit
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }
    });
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.centerContent, { transform: [{ scale: scaleAnim }] }]}>
        {/* Luxury Geometric Brand Emblem */}
        <Animated.View style={[styles.logoOuterGlow, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoSymbol}>▲</Text>
          </View>
        </Animated.View>

        {/* Brand Title */}
        <Text style={styles.brandTitle}>A E T H E R</Text>
        <Text style={styles.brandSubtitle}>PRECISION ACOUSTICS & HARDWARE</Text>

        {/* Dynamic Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        {/* Status text */}
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={THEME.colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.statusLabel}>{statusText}</Text>
        </View>
      </Animated.View>

      {/* Footer Credentials */}
      <View style={styles.footer}>
        <Text style={styles.footerBadge}>CLIENT SECURE ARCHITECTURE • v2.6.0</Text>
        <Text style={styles.footerSub}>LONDON • ZÜRICH • TOKYO</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#07090e',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  logoOuterGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0b101b',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  logoSymbol: {
    fontSize: 26,
    color: '#38bdf8',
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: 6,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 3,
    marginBottom: 36,
  },
  progressTrack: {
    width: Math.min(width * 0.65, 240),
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 1.2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 9,
    fontWeight: '500',
    color: '#475569',
    letterSpacing: 2,
  },
});
