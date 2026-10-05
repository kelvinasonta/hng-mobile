import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../theme';
import { setHasSeenWelcome } from '../services/storage';

const { width } = Dimensions.get('window');

interface WelcomeSlide {
  id: string;
  step: string;
  badge: string;
  symbol: string;
  headline: string;
  subheadline: string;
  description: string;
  imageUrl: string;
  tagline: string;
  telemetry: string;
}

const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    id: '1',
    step: '01 / 03',
    badge: 'FLAGSHIP HARDWARE',
    symbol: '▲',
    headline: 'PIONEERING ACOUSTICS & HARDWARE',
    subheadline: 'PRECISION FORGED FOR ENTHUSIASTS',
    description:
      'Explore flagship smartphones, studio planar monitors, and biometric wearables crafted without aesthetic compromise or mass-market excess.',
    imageUrl:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    tagline: 'TITANIUM TACTILE CHASSIS',
    telemetry: '120Hz LTPO • PLANAR ACOUSTIC',
  },
  {
    id: '2',
    step: '02 / 03',
    badge: 'AEROSPACE METALLURGY',
    symbol: '◆',
    headline: 'BESPOKE MATERIALS & DRIVERS',
    subheadline: 'GRADE-5 TITANIUM & CERAMICS',
    description:
      'Machined from aerospace billet alloys, matte carbon ceramics, and custom neodymium drivers calibrated for transparent frequency response.',
    imageUrl:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    tagline: 'NEODYMIUM PLANAR DRIVER',
    telemetry: '96kHz / 24-BIT STUDIO RESOLUTION',
  },
  {
    id: '3',
    step: '03 / 03',
    badge: 'CONCIERGE LOGISTICS',
    symbol: '★',
    headline: 'ARMORED DISPATCH & WARRANTY',
    subheadline: 'DIRECT VAULT-TO-DOOR TRANSIT',
    description:
      'Direct allocations dispatched with GPS-tracked armored logistics telemetry, fully backed by an unconditional 2-Year worldwide concierge warranty.',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    tagline: 'WHITE-GLOVE COURIER',
    telemetry: 'GPS ARMORED AIR TRANSIT • 2-YR WARRANTY',
  },
];

interface WelcomeScreenProps {
  onFinish: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Gentle breathing float animation to make hardware feel alive
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== currentIndex && index >= 0 && index < WELCOME_SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < WELCOME_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Immediately persist flag so welcome screen is never shown again
    setHasSeenWelcome();
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const isLastPage = currentIndex === WELCOME_SLIDES.length - 1;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Top Bar with Brand & Skip */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>A E T H E R</Text>
          <Text style={styles.brandVersion}>CLIENT v2.6</Text>
        </View>

        {!isLastPage && (
          <TouchableOpacity onPress={handleComplete} style={styles.skipBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.skipBtnText}>SKIP</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={WELCOME_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Alive Image Showcase Frame */}
            <Animated.View
              style={[
                styles.imageCardContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <View style={styles.imageCardWrapper}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                {/* Subtle vignette gradient overlay */}
                <View style={styles.imageOverlayTop} />
                <View style={styles.imageOverlayBottom} />

                {/* Floating Telemetry Tag */}
                <View style={styles.floatingTag}>
                  <View style={styles.pulsingDot} />
                  <Text style={styles.floatingTagText}>{item.tagline}</Text>
                </View>

                {/* Bottom Spec Badge */}
                <View style={styles.floatingSpecBadge}>
                  <Text style={styles.floatingSpecText}>{item.telemetry}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Step Counter Pill */}
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>{item.step}</Text>
              <Text style={styles.stepDivider}>•</Text>
              <Text style={styles.badgeLabel}>{item.badge}</Text>
            </View>

            {/* Typography */}
            <Text style={styles.headline}>{item.headline}</Text>
            <Text style={styles.subheadline}>{item.subheadline}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Bottom Navigation & Controls */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 36) }]}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {WELCOME_SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Action Button: Next vs Get Started */}
        <TouchableOpacity
          style={[styles.actionBtn, isLastPage && styles.actionBtnComplete]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.actionBtnText, isLastPage && styles.actionBtnTextComplete]}>
            {isLastPage ? 'GET STARTED' : 'NEXT →'}
          </Text>
        </TouchableOpacity>

        {/* Subtle Assurance Text */}
        <Text style={styles.footerNote}>
          CONCIERGE HARDWARE REGISTRY • 256-BIT CLIENT PRIVACY
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#07090e',
    zIndex: 9999,
  },
  topBar: {
    paddingTop: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: 3,
  },
  brandVersion: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  skipBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1.5,
  },
  slide: {
    width: width,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCardContainer: {
    width: '100%',
    height: 220,
    marginBottom: 20,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  imageCardWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    backgroundColor: '#0b101b',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(7, 9, 14, 0.35)',
  },
  imageOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(7, 9, 14, 0.65)',
  },
  floatingTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
    marginRight: 6,
  },
  floatingTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1,
  },
  floatingSpecBadge: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(11, 16, 27, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  floatingSpecText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#cbd5e1',
    letterSpacing: 1,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    marginBottom: 10,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1.2,
  },
  stepDivider: {
    color: '#475569',
    marginHorizontal: 6,
    fontSize: 10,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 19,
    fontWeight: '900',
    color: '#f8fafc',
    textAlign: 'center',
    letterSpacing: 0.8,
    lineHeight: 25,
    marginBottom: 4,
  },
  subheadline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    textAlign: 'center',
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#38bdf8',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionBtn: {
    width: '100%',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionBtnComplete: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1.5,
  },
  actionBtnTextComplete: {
    color: '#07090e',
    fontWeight: '900',
  },
  footerNote: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 1.2,
  },
});
