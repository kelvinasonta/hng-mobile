import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Heart, User as UserIcon } from 'lucide-react-native';
import { THEME } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface AppHeaderProps {
  title?: string;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onPressLogo?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onOpenCart,
  onOpenWishlist,
  onPressLogo,
}) => {
  const { user, openAuthModal } = useAuth();
  const { totalItems, setIsCartSheetOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: 16 }]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onPressLogo}
          activeOpacity={onPressLogo ? 0.7 : 1}
          disabled={!onPressLogo}
        >
          <Text style={styles.brandTitle}>A E T H E R</Text>
          <Text style={styles.brandSubtitle}>
            {title ? title.toUpperCase() : 'APEX HARDWARE ARCHITECTURE'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          {/* Customer Auth Button / Status */}
          {user ? (
            <TouchableOpacity
              onPress={() => openAuthModal('signin')}
              style={styles.clientPill}
              activeOpacity={0.8}
            >
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarInitial}>
                  <Text style={styles.avatarInitialText}>{user.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={styles.clientNameText} numberOfLines={1}>
                {user.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => openAuthModal('signin')}
              style={styles.signInBtn}
              activeOpacity={0.8}
            >
              <UserIcon size={12} color={THEME.colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.signInBtnText}>SIGN IN</Text>
            </TouchableOpacity>
          )}

          {/* Wishlist Icon Button */}
          {onOpenWishlist && (
            <TouchableOpacity
              onPress={onOpenWishlist}
              style={styles.wishlistBtn}
              activeOpacity={0.7}
            >
              <Heart
                size={18}
                color="#f43f5e"
                fill={wishlistCount > 0 ? '#f43f5e' : 'none'}
              />
              {wishlistCount > 0 && (
                <View style={styles.wishlistBadge}>
                  <Text style={styles.badgeText}>{wishlistCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Cart Icon Button */}
          <TouchableOpacity
            onPress={onOpenCart || (() => setIsCartSheetOpen(true))}
            style={styles.cartBtn}
            activeOpacity={0.7}
          >
            <ShoppingBag size={18} color={THEME.colors.textMain} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: THEME.colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.primary,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  avatarImg: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  avatarInitial: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    color: '#07090e',
    fontSize: 10,
    fontWeight: '900',
  },
  clientNameText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMain,
    maxWidth: 64,
  },
  signInBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signInBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 0.8,
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartIconText: {
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: THEME.colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#07090e',
  },
  wishlistBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wishlistIconText: {
    fontSize: 16,
    color: '#f43f5e',
  },
  wishlistBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#f43f5e',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
