import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, ShoppingBag, Check, Zap } from 'lucide-react-native';
import { THEME } from '../theme';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onExpressCheckout: (product: Product) => void;
  backTitle?: string;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onBack,
  onExpressCheckout,
  backTitle,
}) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'materials'>('overview');
  const insets = useSafeAreaInsets();

  const alreadyInCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const specs = product.specs || product.specifications || {};
  const specEntries = Object.entries(specs).filter(
    ([k]) => !['overview', 'materials', 'warranty'].includes(k.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { paddingTop: 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={16} color={THEME.colors.primary} />
          <Text style={styles.backBtnText}>{backTitle ? backTitle.toUpperCase() : 'BACK'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity
          style={[styles.headerWishlistBtn, inWishlist && styles.headerWishlistBtnActive]}
          onPress={() => toggleWishlist(product)}
          activeOpacity={0.7}
        >
          <Heart
            size={18}
            color={inWishlist ? '#f43f5e' : THEME.colors.textMuted}
            fill={inWishlist ? '#f43f5e' : 'none'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Image Stage */}
        <View style={styles.stage}>
          <Image
            source={{ uri: product.image }}
            style={styles.stageImage}
            resizeMode="cover"
          />
          {product.badge && (
            <View style={styles.stageBadge}>
              <Text style={styles.stageBadgeText}>{product.badge}</Text>
            </View>
          )}
        </View>

        {/* Essential Info Header */}
        <View style={styles.infoSection}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>
              {product.categoryLabel || product.category}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.starText}>★</Text>
              <Text style={styles.ratingText}>{product.rating || '5.0'}</Text>
            </View>
          </View>

          <Text style={styles.productTitle}>{product.name}</Text>
          {product.tagline && <Text style={styles.tagline}>{product.tagline}</Text>}

          {/* Pricing and Stock Card */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>DIRECT ALLOCATION PRICE</Text>
              <Text style={styles.priceValue}>${product.price.toLocaleString()}</Text>
            </View>
            <View style={styles.stockStatus}>
              <View style={[styles.stockDot, { backgroundColor: product.stock > 10 ? '#34d399' : '#f59e0b' }]} />
              <Text style={styles.stockLabel}>
                {product.stock > 0 ? `${product.stock} units available` : 'Replenishing'}
              </Text>
            </View>
          </View>

          {/* Key Feature Bullets */}
          {product.features && product.features.length > 0 && (
            <View style={styles.featureGrid}>
              {product.features.map((feat, idx) => (
                <View key={idx} style={styles.featureChip}>
                  <Text style={styles.featureDot}>◆</Text>
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
            onPress={() => setActiveTab('overview')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              OVERVIEW
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'specs' && styles.tabItemActive]}
            onPress={() => setActiveTab('specs')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'specs' && styles.tabTextActive]}>
              TECH SPECS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'materials' && styles.tabItemActive]}
            onPress={() => setActiveTab('materials')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'materials' && styles.tabTextActive]}>
              MATERIALS
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: ENGINEERING OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <Text style={styles.tabSectionTitle}>ARCHITECTURAL NARRATIVE</Text>
            <Text style={styles.bodyParagraph}>
              {product.overview || product.description}
            </Text>

            <View style={styles.highlightCallout}>
              <Text style={styles.calloutTitle}>ENGINEERING DISCIPLINE</Text>
              <Text style={styles.calloutBody}>
                Each component is crafted to eliminate superfluous tolerances. Acoustic chambers, thermal pathways, and RF windows are mathematically aligned with aerospace accuracy.
              </Text>
            </View>
          </View>
        )}

        {/* TAB 2: TECHNICAL SPECIFICATIONS MATRIX */}
        {activeTab === 'specs' && (
          <View style={styles.tabContent}>
            <View style={styles.specHeaderRow}>
              <Text style={styles.tabSectionTitle}>HARDWARE TELEMETRY MATRIX</Text>
              <Text style={styles.specCount}>{specEntries.length} PARAMETERS</Text>
            </View>

            {specEntries.length > 0 ? (
              <View style={styles.specTable}>
                {specEntries.map(([key, val], idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.specRow,
                      idx % 2 === 0 ? styles.specRowEven : styles.specRowOdd,
                    ]}
                  >
                    <Text style={styles.specKey}>{key}</Text>
                    <Text style={styles.specVal}>{String(val)}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptySpecText}>
                No hardware parameters registered for this model.
              </Text>
            )}
          </View>
        )}

        {/* TAB 3: MATERIALS & FINISH */}
        {activeTab === 'materials' && (
          <View style={styles.tabContent}>
            <Text style={styles.tabSectionTitle}>METALLURGY & SUBSTRATES</Text>
            <Text style={styles.bodyParagraph}>
              {product.materials ||
                'Machined Grade 5 Aerospace Titanium with Sandstone Ceramic Backing and 2.5D Sapphire Crystal Lens.'}
            </Text>

            <View style={styles.warrantyBox}>
              <Text style={styles.warrantyTitle}>CONCIERGE WARRANTY & COVERAGE</Text>
              <Text style={styles.warrantyText}>
                {product.warranty ||
                  '2-Year Worldwide Concierge Warranty with full replacement coverage & priority service.'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Bottom Purchase Dock */}
      <View style={[styles.bottomDock, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          style={[styles.wishlistDockBtn, inWishlist && styles.wishlistDockBtnActive]}
          onPress={() => toggleWishlist(product)}
          activeOpacity={0.8}
        >
          <Heart
            size={20}
            color={inWishlist ? '#f43f5e' : THEME.colors.textMuted}
            fill={inWishlist ? '#f43f5e' : 'none'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cartDockBtn, alreadyInCart && styles.cartDockBtnInCart]}
          onPress={() => {
            if (!alreadyInCart) addToCart(product, 1);
          }}
          disabled={alreadyInCart}
          activeOpacity={0.8}
        >
          {alreadyInCart ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Check size={16} color={THEME.colors.primary} />
              <Text style={[styles.cartDockBtnText, styles.cartDockBtnTextInCart]}>IN CART</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ShoppingBag size={16} color={THEME.colors.textMain} />
              <Text style={styles.cartDockBtnText}>+ ADD TO CART</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.expressDockBtn}
          onPress={() => onExpressCheckout(product)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#07090e" />
            <Text style={styles.expressDockBtnText}>EXPRESS BUY</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.bg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textMain,
    maxWidth: 200,
    textAlign: 'center',
  },
  headerWishlistBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWishlistBtnActive: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  headerWishlistIcon: {
    fontSize: 16,
    color: THEME.colors.textMuted,
  },
  headerWishlistIconActive: {
    color: '#f43f5e',
  },
  scrollContent: {
    paddingBottom: 40,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  stage: {
    width: '100%',
    height: 300,
    backgroundColor: '#05070a',
    position: 'relative',
  },
  stageImage: {
    width: '100%',
    height: '100%',
  },
  stageBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stageBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#07090e',
    letterSpacing: 1,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starText: {
    color: '#f59e0b',
    fontSize: 13,
  },
  ratingText: {
    color: THEME.colors.textMain,
    fontSize: 12,
    fontWeight: '800',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.textMain,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 18,
  },
  priceLabel: {
    fontSize: 9,
    color: THEME.colors.textDim,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.textMain,
    marginTop: 2,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  featureDot: {
    color: THEME.colors.primary,
    fontSize: 8,
  },
  featureText: {
    fontSize: 11,
    color: THEME.colors.textMain,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: THEME.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textDim,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: THEME.colors.primary,
  },
  tabContent: {
    padding: 20,
  },
  tabSectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  bodyParagraph: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    lineHeight: 22,
  },
  highlightCallout: {
    marginTop: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: THEME.radius.md,
    padding: 14,
  },
  calloutTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  calloutBody: {
    fontSize: 12,
    color: THEME.colors.textDim,
    lineHeight: 18,
  },
  specHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  specCount: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f59e0b',
  },
  specTable: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  specRowEven: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  specRowOdd: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  specKey: {
    flex: 1.1,
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  specVal: {
    flex: 1.5,
    fontSize: 11,
    color: THEME.colors.textMain,
    fontWeight: '600',
  },
  emptySpecText: {
    color: THEME.colors.textDim,
    fontSize: 12,
    paddingVertical: 10,
  },
  warrantyBox: {
    marginTop: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    padding: 16,
    borderRadius: THEME.radius.md,
  },
  warrantyTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 1,
    marginBottom: 6,
  },
  warrantyText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    lineHeight: 18,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(7, 9, 14, 0.95)',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  wishlistDockBtn: {
    width: 48,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistDockBtnActive: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  wishlistDockIcon: {
    fontSize: 20,
    color: THEME.colors.textMuted,
  },
  wishlistDockIconActive: {
    color: '#f43f5e',
  },
  cartDockBtn: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartDockBtnInCart: {
    borderColor: 'rgba(56, 189, 248, 0.4)',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  cartDockBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 0.8,
  },
  cartDockBtnTextInCart: {
    color: THEME.colors.primary,
  },
  expressDockBtn: {
    flex: 1.2,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expressDockBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#07090e',
    letterSpacing: 0.8,
  },
});
