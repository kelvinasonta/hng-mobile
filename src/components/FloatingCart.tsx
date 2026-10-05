import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';
import { THEME } from '../theme';
import { useCart } from '../context/CartContext';

interface FloatingCartProps {
  onPress: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ onPress }) => {
  const { totalItems } = useCart();
  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          bottom: 90 + Math.max(insets.bottom, 0),
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <ShoppingBag size={24} color={THEME.colors.primary} />
        {totalItems > 0 && (
          <View style={styles.floatingBadge}>
            <Text style={styles.floatingBadgeText}>{totalItems}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f141d',
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  cartEmoji: {
    fontSize: 22,
  },
  floatingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#07090e',
  },
  floatingBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#07090e',
  },
});
