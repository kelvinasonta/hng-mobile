import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, ShoppingBag, Check } from 'lucide-react-native';
import { Product } from '../types';
import { THEME } from '../theme';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onExpressBuy?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onExpressBuy }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const alreadyInCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);

  return (
    <View style={styles.card}>
      {/* Product Image Stage (tappable to view dossier) */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Badge Pill */}
        {product.badge && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        )}

        {/* Category Pill */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>
            {product.categoryLabel || product.category}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Wishlist Bookmark Button (positioned on top right of card, isolated from card navigation) */}
      <TouchableOpacity
        style={[styles.wishlistBtn, inWishlist && styles.wishlistBtnActive]}
        onPress={() => toggleWishlist(product)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Heart
          size={16}
          color={inWishlist ? '#f43f5e' : '#cbd5e1'}
          fill={inWishlist ? '#f43f5e' : 'none'}
        />
      </TouchableOpacity>

      {/* Product Details */}
      <View style={styles.content}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          
          {product.tagline && (
            <Text style={styles.productTagline} numberOfLines={2}>
              {product.tagline}
            </Text>
          )}
        </TouchableOpacity>

        {/* Price & Stock Row */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>MSRP ALLOCATION</Text>
            <Text style={styles.priceText}>${product.price.toLocaleString()}</Text>
          </View>

          <View style={styles.stockBadge}>
            <View
              style={[
                styles.stockDot,
                { backgroundColor: product.stock > 10 ? '#34d399' : '#f59e0b' },
              ]}
            />
            <Text style={styles.stockText}>{product.stock} units</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.cartBtn,
              alreadyInCart && styles.cartBtnInCart,
            ]}
            onPress={() => {
              if (!alreadyInCart) {
                addToCart(product, 1);
              }
            }}
            disabled={alreadyInCart}
            activeOpacity={0.8}
          >
            {alreadyInCart ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Check size={14} color={THEME.colors.primary} />
                <Text style={[styles.cartBtnText, styles.cartBtnTextInCart]}>IN CART</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShoppingBag size={14} color="#07090e" />
                <Text style={styles.cartBtnText}>+ ADD TO CART</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inspectBtn}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.inspectBtnText}>DOSSIER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    height: 200,
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
    paddingVertical: 4,
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
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  productName: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.textMain,
    letterSpacing: 0.2,
  },
  productTagline: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  priceLabel: {
    fontSize: 9,
    color: THEME.colors.textDim,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textMain,
    marginTop: 2,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  cartBtn: {
    flex: 1.6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
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
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cartBtnTextInCart: {
    color: THEME.colors.primary,
  },
  inspectBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 10,
    borderRadius: THEME.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inspectBtnText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBtnActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderColor: 'rgba(244, 63, 94, 0.6)',
  },
  wishlistIcon: {
    fontSize: 14,
    color: THEME.colors.textMuted,
  },
  wishlistIconActive: {
    color: '#f43f5e',
  },
});
