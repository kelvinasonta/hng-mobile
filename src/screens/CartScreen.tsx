import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Trash2, ArrowRight, Tag, Check, Sparkles } from 'lucide-react-native';
import { THEME } from '../theme';
import { useCart } from '../context/CartContext';

interface CartScreenProps {
  onCheckout: () => void;
  onExploreCatalog: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onCheckout, onExploreCatalog }) => {
  const { 
    items, updateQuantity, removeFromCart, totalItems, subtotal, 
    refreshCart, promoCode, promoDiscount, applyPromoCode, tax, shipping, total 
  } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const insets = useSafeAreaInsets();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  }, [refreshCart]);

  const handleApplyPromo = () => {
    if (!inputCode) return;
    const ok = applyPromoCode(inputCode);
    if (ok) {
      setPromoMessage({ text: 'Promo code applied successfully!', isError: false });
    } else {
      setPromoMessage({ text: 'Invalid promo code. Try WELCOME10 or TECH20', isError: true });
    }
  };

  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBadge}>
          <ShoppingBag size={40} color={THEME.colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Cart Ledger Empty</Text>
        <Text style={styles.emptySub}>
          You have no hardware systems allocated to your active dispatch docket.
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={onExploreCatalog}
          activeOpacity={0.8}
        >
          <Text style={styles.browseBtnText}>EXPLORE HARDWARE CATALOG</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DISPATCH CART</Text>
          <Text style={styles.headerCount}>{totalItems} HARDWARE ALLOCATIONS</Text>
        </View>

        {/* Free Shipping Meter */}
        <View style={styles.freeShippingBox}>
          <View style={styles.freeShippingRow}>
            <Text style={styles.freeShippingText}>
              {remainingForFreeShipping > 0
                ? `Add $${remainingForFreeShipping.toLocaleString()} more for Free Express Shipping`
                : '🎉 You have unlocked Free Express Insured Shipping!'}
            </Text>
            <Text style={styles.freeShippingPercent}>{progressToFreeShipping.toFixed(0)}%</Text>
          </View>
          <View style={styles.freeShippingBarBg}>
            <View style={[styles.freeShippingBarFill, { width: `${progressToFreeShipping}%` }]} />
          </View>
        </View>

        {/* Cart Item Cards */}
        {items.map(({ product, quantity }) => (
          <View key={product.id} style={styles.cartCard}>
            <Image source={{ uri: product.image }} style={styles.thumb} />
            <View style={styles.cardInfo}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {product.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeFromCart(product.id)}
                  style={styles.removeBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#f87171" />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTagline} numberOfLines={1}>
                {product.tagline || product.categoryLabel}
              </Text>

              <View style={styles.cardBottomRow}>
                <Text style={styles.cardPrice}>
                  ${(product.price * quantity).toLocaleString()}
                </Text>

                {/* Stepper Buttons */}
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => updateQuantity(product.id, -1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.stepVal}>{quantity}</Text>

                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => updateQuantity(product.id, 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Promo Code Form */}
        <View style={styles.promoContainer}>
          <View style={styles.promoInputWrapper}>
            <Tag size={14} color={THEME.colors.textDim} style={styles.promoIcon} />
            <TextInput
              style={styles.promoInput}
              placeholder="Promo code (e.g. WELCOME10)"
              placeholderTextColor={THEME.colors.textDim}
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity style={styles.promoApplyBtn} onPress={handleApplyPromo}>
            <Text style={styles.promoApplyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {promoMessage && (
          <View style={styles.promoMsgBox}>
            {!promoMessage.isError && <Check size={12} color="#34d399" />}
            <Text style={[styles.promoMsgText, { color: promoMessage.isError ? '#f87171' : '#34d399' }]}>
              {promoMessage.text}
            </Text>
          </View>
        )}

        {/* Summary Breakdown */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ALLOCATION SUMMARY</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>${subtotal.toLocaleString()}</Text>
          </View>

          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} color="#34d399" />
                <Text style={[styles.summaryLabel, { color: '#34d399' }]}>
                  Promo Discount ({promoCode})
                </Text>
              </View>
              <Text style={[styles.summaryVal, { color: '#34d399' }]}>
                -${promoDiscount.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Regional Tax (8%)</Text>
            <Text style={styles.summaryVal}>${tax.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Express Insured Shipping</Text>
            <Text style={[styles.summaryVal, shipping === 0 && { color: '#34d399' }]}>
              {shipping === 0 ? 'FREE' : `$${shipping.toLocaleString()}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRowTotal}>
            <Text style={styles.totalLabel}>TOTAL PAYABLE</Text>
            <Text style={styles.totalVal}>${total.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Sticky Bottom Checkout Dock (Elevated above TabBar) */}
      <View style={[styles.checkoutDock, { bottom: Math.max(insets.bottom, 12) + 60, paddingBottom: 16 }]}>
        <View style={styles.dockTotalInfo}>
          <Text style={styles.dockTotalLabel}>TOTAL DUE</Text>
          <Text style={styles.dockTotalVal}>${total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={onCheckout}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
            <ArrowRight size={14} color="#07090e" strokeWidth={2.5} />
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
  scrollList: {
    padding: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 1.5,
  },
  headerCount: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 1,
    marginTop: 2,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: THEME.radius.sm,
    backgroundColor: '#05070a',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
    flex: 1,
  },
  removeBtn: {
    padding: 4,
  },
  removeBtnText: {
    color: THEME.colors.textDim,
    fontSize: 12,
  },
  cardTagline: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.textMain,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  stepVal: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.colors.textMain,
    paddingHorizontal: 6,
  },
  summaryCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
    marginTop: 12,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 1,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 0.8,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  checkoutDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(7, 9, 14, 0.95)',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  dockTotalInfo: {
    flex: 1,
  },
  dockTotalLabel: {
    fontSize: 9,
    color: THEME.colors.textDim,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dockTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textMain,
  },
  checkoutBtn: {
    flex: 1.5,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#07090e',
    letterSpacing: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textMain,
  },
  emptySub: {
    fontSize: 13,
    color: THEME.colors.textDim,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 280,
  },
  browseBtn: {
    marginTop: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
  },
  browseBtnText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  freeShippingBox: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    marginBottom: 16,
    borderRadius: THEME.radius.sm,
  },
  freeShippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  freeShippingText: {
    fontSize: 11,
    color: THEME.colors.textMain,
  },
  freeShippingPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMain,
  },
  freeShippingBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  freeShippingBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  promoInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
  },
  promoIcon: {
    marginRight: 8,
  },
  promoInput: {
    flex: 1,
    color: THEME.colors.textMain,
    fontSize: 13,
    paddingVertical: 10,
  },
  promoApplyBtn: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: THEME.radius.sm,
  },
  promoApplyBtnText: {
    color: THEME.colors.textMain,
    fontSize: 12,
    fontWeight: '700',
  },
  promoMsgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  promoMsgText: {
    fontSize: 12,
  },
});
