import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../theme';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';

interface DiscoverScreenProps {
  onSelectProduct: (productId: string) => void;
  onExploreCatalog: () => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onSelectProduct,
  onExploreCatalog,
}) => {
  const { products, setSelectedCategory, loading, refreshCatalog } = useProducts();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;

  const heroProduct = products[0];
  const featuredList = products.slice(1, 4);

  const categories = [
    { key: 'all', label: 'All Catalog' },
    { key: 'smartphones', label: 'Phones' },
    { key: 'watch', label: 'Wearables' },
    { key: 'headphone', label: 'Acoustics' },
    { key: 'laptops', label: 'Computing' },
    { key: 'smart-home', label: 'Living' },
  ];

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>SYNCING WITH WEB HARDWARE REGISTRY...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 0) }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshCatalog}
          tintColor={THEME.colors.primary}
        />
      }
    >
      {/* Hero Banner */}
      {heroProduct && (
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => onSelectProduct(heroProduct.id)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: heroProduct.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>APEX LAUNCH • 2026 EDITION</Text>
            </View>
            <Text style={styles.heroTitle}>{heroProduct.name}</Text>
            <Text style={styles.heroTagline} numberOfLines={2}>
              {heroProduct.tagline}
            </Text>
            <View style={styles.heroPriceRow}>
              <Text style={styles.heroPrice}>${heroProduct.price.toLocaleString()}</Text>
              <View style={styles.heroActionBtn}>
                <Text style={styles.heroActionBtnText}>EXPLORE DOSSIER →</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Category Pills Bar */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>COLLECTIONS</Text>
          <TouchableOpacity onPress={onExploreCatalog}>
            <Text style={styles.sectionLink}>VIEW ALL ({products.length})</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={styles.categoryPill}
              onPress={() => {
                setSelectedCategory(c.key);
                onExploreCatalog();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryPillText}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Hardware Section */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ARCHITECTURAL HARDWARE</Text>
          <Text style={styles.sectionSub}>Precision Acoustic & Computing</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
          {featuredList.map((product) => (
            <View key={product.id} style={{ width: isTablet ? '50%' : '100%', paddingHorizontal: 8 }}>
              <ProductCard
                product={product}
                onPress={() => onSelectProduct(product.id)}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  heroCard: {
    height: 380,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    backgroundColor: '#05070a',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: THEME.colors.primary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: THEME.colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 0.3,
  },
  heroTagline: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  heroPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  heroPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.textMain,
  },
  heroActionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.radius.sm,
  },
  heroActionBtnText: {
    color: '#07090e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  categorySection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 1.5,
  },
  sectionSub: {
    fontSize: 11,
    color: THEME.colors.textDim,
  },
  sectionLink: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    letterSpacing: 0.5,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  categoryPillText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  featuredSection: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
