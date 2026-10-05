import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, ShoppingBag, Trash2, Check } from 'lucide-react-native';
import { THEME } from '../theme';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface WishlistScreenProps {
  onSelectProduct: (productId: string) => void;
  onExploreCatalog: () => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  onSelectProduct,
  onExploreCatalog,
}) => {
  const { wishlist, removeFromWishlist, clearWishlist, isSyncing, refreshWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;
  const numCols = isTablet ? (width >= 1024 ? 3 : 2) : 1;

  const totalValue = wishlist.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <View style={styles.container}>
      {/* Telemetry Header */}
      <View style={styles.telemetryBar}>
        <View>
          <Text style={styles.telemetryLabel}>SAVED HARDWARE DOSSIERS</Text>
          <Text style={styles.telemetrySub}>
            {wishlist.length} SYSTEM{wishlist.length !== 1 ? 'S' : ''} BOOKMARKED • TOTAL ALLOCATION ${totalValue.toLocaleString()}
          </Text>
        </View>

        {wishlist.length > 0 && (
          <TouchableOpacity onPress={clearWishlist} style={styles.clearBtn} activeOpacity={0.7}>
            <Text style={styles.clearBtnText}>CLEAR ALL</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wishlist Items List */}
      <FlatList
        key={`grid-${numCols}`}
        data={wishlist}
        keyExtractor={(item) => item.id}
        numColumns={numCols}
        columnWrapperStyle={numCols > 1 ? { gap: 16, paddingHorizontal: 16 } : undefined}
        contentContainerStyle={[
          styles.listContent, 
          numCols > 1 && { paddingHorizontal: 0 },
          { paddingBottom: 110 + Math.max(insets.bottom, 0) }
        ]}
        refreshing={isSyncing}
        onRefresh={refreshWishlist}
        renderItem={({ item }) => {
          const alreadyInCart = isInCart(item.id);

          return (
            <View style={[{ flex: 1, maxWidth: numCols > 1 ? `${100 / numCols}%` : '100%' }, numCols === 1 && { width: '100%' }]}>
              <View style={[styles.card, { marginBottom: numCols > 1 ? 0 : 16 }]}>
              {/* Product Image Stage (tappable to view dossier) */}
              <TouchableOpacity
                onPress={() => onSelectProduct(item.id)}
                activeOpacity={0.9}
                style={styles.imageContainer}
              >
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                {item.badge && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{item.categoryLabel || item.category}</Text>
                </View>
              </TouchableOpacity>

              {/* Remove Icon Button (isolated) */}
              <TouchableOpacity
                style={styles.removeIconBtn}
                onPress={() => removeFromWishlist(item.id)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={14} color="#f87171" />
              </TouchableOpacity>

              {/* Card Content */}
              <View style={styles.content}>
                <TouchableOpacity onPress={() => onSelectProduct(item.id)} activeOpacity={0.8}>
                  <View style={styles.titleRow}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.priceText}>${item.price.toLocaleString()}</Text>
                  </View>

                  {item.tagline && (
                    <Text style={styles.productTagline} numberOfLines={1}>
                      {item.tagline}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Stock Row & Actions */}
                <View style={styles.actionRow}>
                  <View style={styles.stockBadge}>
                    <View
                      style={[
                        styles.stockDot,
                        { backgroundColor: (item.stock || 50) > 10 ? '#34d399' : '#f59e0b' },
                      ]}
                    />
                    <Text style={styles.stockText}>{item.stock ?? 50} units</Text>
                  </View>

                  <View style={styles.btnGroup}>
                    <TouchableOpacity
                      style={[styles.cartBtn, alreadyInCart && styles.cartBtnInCart]}
                      onPress={() => {
                        if (!alreadyInCart) addToCart(item, 1);
                      }}
                      disabled={alreadyInCart}
                      activeOpacity={0.8}
                    >
                      {alreadyInCart ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Check size={12} color={THEME.colors.primary} />
                          <Text style={[styles.cartBtnText, styles.cartBtnTextInCart]}>IN CART</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <ShoppingBag size={12} color="#07090e" />
                          <Text style={styles.cartBtnText}>+ MOVE TO CART</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dossierBtn}
                      onPress={() => onSelectProduct(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.dossierBtnText}>DOSSIER →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <Heart size={28} color="#f43f5e" />
            </View>
            <Text style={styles.emptyTitle}>NO SAVED HARDWARE DOSSIERS</Text>
            <Text style={styles.emptySub}>
              Bookmark reference editions from the catalog to monitor inventory allocations and maintain priority dispatch access.
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={onExploreCatalog} activeOpacity={0.8}>
              <Text style={styles.exploreBtnText}>EXPLORE HARDWARE CATALOG</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  telemetryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: 'rgba(7, 9, 14, 0.6)',
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 1.5,
  },
  telemetrySub: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f87171',
    letterSpacing: 0.8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#05070a',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#07090e',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  categoryPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  categoryText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  removeIconBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIconText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textMain,
    flex: 1,
    marginRight: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  productTagline: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 10,
    color: THEME.colors.textDim,
    fontWeight: '600',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  cartBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtnInCart: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  cartBtnText: {
    color: '#07090e',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  cartBtnTextInCart: {
    color: THEME.colors.primary,
  },
  dossierBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: THEME.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dossierBtnText: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 26,
    color: THEME.colors.primary,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: THEME.colors.textDim,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 280,
  },
  exploreBtn: {
    marginTop: 24,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radius.sm,
  },
  exploreBtnText: {
    color: '#07090e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
