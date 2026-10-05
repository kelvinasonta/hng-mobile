import React from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { THEME } from '../theme';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';

interface HardwareCatalogScreenProps {
  onSelectProduct: (productId: string) => void;
}

export const HardwareCatalogScreen: React.FC<HardwareCatalogScreenProps> = ({ onSelectProduct }) => {
  const {
    filteredProducts,
    loading,
    refreshCatalog,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useProducts();

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;
  const numCols = isTablet ? (width >= 1024 ? 3 : 2) : 1;

  const categories = [
    { key: 'all', label: 'All Catalog' },
    { key: 'smartphones', label: 'Smartphones' },
    { key: 'watch', label: 'Wearables' },
    { key: 'headphone', label: 'Acoustics' },
    { key: 'speaker', label: 'Speakers' },
    { key: 'laptops', label: 'Computing' },
    { key: 'smart-home', label: 'Smart Living' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color={THEME.colors.textDim} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search hardware, alloys, acoustic drivers..."
            placeholderTextColor={THEME.colors.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={14} color={THEME.colors.textDim} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills Filter */}
      <View style={styles.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.key;
            return (
              <TouchableOpacity
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setSelectedCategory(item.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Telemetry Counter */}
      <View style={styles.telemetryBar}>
        <Text style={styles.telemetryText}>
          SHOWING {filteredProducts.length} HARDWARE SYSTEM{filteredProducts.length !== 1 ? 'S' : ''}
        </Text>
        <Text style={styles.telemetryStatus}>LEDGER ACTIVE</Text>
      </View>

      {/* Product List */}
      <FlatList
        key={`grid-${numCols}`}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={numCols}
        columnWrapperStyle={numCols > 1 ? { gap: 16, paddingHorizontal: 16 } : undefined}
        contentContainerStyle={[
          styles.productList, 
          numCols > 1 && { paddingHorizontal: 0 },
          { paddingBottom: 100 + Math.max(insets.bottom, 0) }
        ]}
        refreshing={loading}
        onRefresh={refreshCatalog}
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: numCols > 1 ? `${100 / numCols}%` : '100%' }}>
            <ProductCard
              product={item}
              onPress={() => onSelectProduct(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📡</Text>
            <Text style={styles.emptyTitle}>No Hardware Found</Text>
            <Text style={styles.emptySub}>
              No models match &ldquo;{searchQuery}&rdquo;. Try another alloy or query.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <Text style={styles.resetBtnText}>RESET FILTERS</Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.textMain,
    fontSize: 13,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: THEME.colors.textDim,
    fontSize: 12,
  },
  categoryBar: {
    paddingVertical: 6,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
  },
  pillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: THEME.colors.primary,
  },
  pillText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  pillTextActive: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  telemetryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  telemetryText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textDim,
    letterSpacing: 1,
  },
  telemetryStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 1,
  },
  productList: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  emptySub: {
    fontSize: 12,
    color: THEME.colors.textDim,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: THEME.radius.sm,
  },
  resetBtnText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
