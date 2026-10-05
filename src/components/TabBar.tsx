import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, Cpu, Heart, ShoppingBag, User } from 'lucide-react-native';
import { THEME } from '../theme';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export type TabKey = 'discover' | 'catalog' | 'wishlist' | 'cart' | 'account';

interface TabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onSelectTab }) => {
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const insets = useSafeAreaInsets();

  const tabs: Array<{
    key: TabKey;
    label: string;
    renderIcon: (color: string, active: boolean) => React.ReactNode;
  }> = [
    {
      key: 'discover',
      label: 'Discover',
      renderIcon: (color) => <Compass size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'catalog',
      label: 'Hardware',
      renderIcon: (color) => <Cpu size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'wishlist',
      label: 'Wishlist',
      renderIcon: (color, active) => (
        <Heart
          size={20}
          color={active ? '#f43f5e' : color}
          fill={active ? '#f43f5e' : 'none'}
          strokeWidth={2}
        />
      ),
    },
    {
      key: 'cart',
      label: 'Cart',
      renderIcon: (color) => <ShoppingBag size={20} color={color} strokeWidth={2} />,
    },
    {
      key: 'account',
      label: 'Account',
      renderIcon: (color) => <User size={20} color={color} strokeWidth={2} />,
    },
  ];

  return (
    <View style={[styles.dockContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.dock}>
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          const badgeCount = t.key === 'cart' ? totalItems : t.key === 'wishlist' ? wishlistCount : 0;
          const iconColor = isActive ? THEME.colors.primary : THEME.colors.textDim;

          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => onSelectTab(t.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                {t.renderIcon(iconColor, isActive)}
                {badgeCount > 0 && (
                  <View style={[styles.dockBadge, t.key === 'wishlist' && styles.wishlistBadge]}>
                    <Text style={styles.dockBadgeText}>{badgeCount}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                  isActive && t.key === 'wishlist' && { color: '#f43f5e' },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7, 9, 14, 0.96)',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 8,
  },
  dock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.md,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  iconWrapper: {
    position: 'relative',
  },
  tabIcon: {
    fontSize: 18,
  },
  dockBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  dockBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#07090e',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textDim,
    marginTop: 4,
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '900',
  },
  wishlistTabIcon: {
    color: '#f43f5e',
  },
  wishlistBadge: {
    backgroundColor: '#f43f5e',
  },
});
