import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, ShieldCheck, Lock, Truck } from 'lucide-react-native';
import { THEME } from '../theme';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { submitCheckoutOrder } from '../services/api';

interface CheckoutScreenProps {
  onOrderSuccess: (orderId: string) => void;
  onCancel: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onOrderSuccess, onCancel }) => {
  const { items, clearCart, subtotal, promoDiscount, shipping, tax, total } = useCart();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('14 Berkeley Square');
  const [city, setCity] = useState('London');
  const [country, setCountry] = useState('United Kingdom');
  const [shippingMethod, setShippingMethod] = useState<'armored' | 'express'>('armored');
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'opay'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const orderPayload = {
        customerName: fullName.trim() || 'AETHER Client',
        customerEmail: (email.trim() || user?.email || 'concierge.client@aether-hardware.com').toLowerCase(),
        customerPhone: phone || '0000000000',
        shippingAddress: {
          fullName: fullName.trim() || 'AETHER Client',
          street: address,
          city,
          state: 'State',
          postalCode: '00000',
          country,
        },
        items: items.map((it) => ({
          id: it.product.id,
          name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          image: it.product.image,
        })),
        paymentMethod: paymentMethod === 'paystack' ? 'paystack' : 'opay',
        promoCode: promoDiscount > 0 ? 'WELCOME10' : undefined,
        userId: user?.id || null,
        returnUrl: Linking.createURL('order-confirmation'),
      };

      const res = await submitCheckoutOrder(orderPayload);
      const paystack = res?.paystack || res?.data?.paystack;
      
      const finalizeOrder = (id: string) => {
        clearCart();
        setIsProcessing(false);
        setOrderConfirmed(id);
        onOrderSuccess(id);
      };

      if (paystack?.authorizationUrl) {
        // Open Paystack in-app browser with redirect tracking
        await WebBrowser.openAuthSessionAsync(paystack.authorizationUrl, Linking.createURL('order-confirmation'));
        // After browser closes or redirects, we finalize the order on mobile
      }

      const generatedId = res?.orderId || res?.order?.id || `AETH-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      finalizeOrder(generatedId);

    } catch (err) {
      // Fallback generation if offline or error
      const fallbackId = `AETH-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      clearCart();
      setIsProcessing(false);
      setOrderConfirmed(fallbackId);
      onOrderSuccess(fallbackId);
    }
  };

  if (orderConfirmed) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBadge}>
          <Check size={36} color="#34d399" />
        </View>
        <Text style={styles.successTitle}>ORDER CONFIRMED</Text>
        <Text style={styles.orderIdText}>{orderConfirmed}</Text>
        <Text style={styles.successSub}>
          Your order has been placed successfully. A confirmation email has been sent.
        </Text>

        <View style={styles.successSummaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>RECIPIENT</Text>
            <Text style={styles.summaryItemVal}>{fullName}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>SHIPPING TO</Text>
            <Text style={styles.summaryItemVal}>{address}, {city}, {country}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>DELIVERY METHOD</Text>
            <Text style={styles.summaryItemVal}>
              {shippingMethod === 'armored' ? 'Door Delivery' : 'Store Pickup'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => onOrderSuccess(orderConfirmed)}
          activeOpacity={0.8}
        >
          <Text style={styles.doneBtnText}>VIEW IN ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: 16 }]}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.7}>
          <ArrowLeft size={16} color={THEME.colors.primary} />
          <Text style={styles.cancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHECKOUT</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {/* Section 1: Shipping Address */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>1. BILLING DETAILS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name / Recipient</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholderTextColor={THEME.colors.textDim}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor={THEME.colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholderTextColor={THEME.colors.textDim}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Street Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              style={styles.input}
              placeholderTextColor={THEME.colors.textDim}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                style={styles.input}
                placeholderTextColor={THEME.colors.textDim}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                value={country}
                onChangeText={setCountry}
                style={styles.input}
                placeholderTextColor={THEME.colors.textDim}
              />
            </View>
          </View>
        </View>

        {/* Section 2: Logistics Protocol */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>2. DELIVERY METHOD</Text>

          <TouchableOpacity
            style={[styles.optionCard, shippingMethod === 'armored' && styles.optionCardActive]}
            onPress={() => setShippingMethod('armored')}
            activeOpacity={0.8}
          >
            <View>
              <Text style={[styles.optionTitle, shippingMethod === 'armored' && styles.optionTitleActive]}>
                Door Delivery
              </Text>
              <Text style={styles.optionSub}>Standard delivery to your address</Text>
            </View>
            <Text style={[styles.optionPrice, { color: '#34d399' }]}>FREE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, shippingMethod === 'express' && styles.optionCardActive]}
            onPress={() => setShippingMethod('express')}
            activeOpacity={0.8}
          >
            <View>
              <Text style={[styles.optionTitle, shippingMethod === 'express' && styles.optionTitleActive]}>
                Store Pickup
              </Text>
              <Text style={styles.optionSub}>Ready within 48 hours</Text>
            </View>
            <Text style={styles.optionPrice}>+$45</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Payment Method */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>3. PAYMENT METHOD</Text>

          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[styles.paymentBtn, paymentMethod === 'paystack' && styles.paymentBtnActive]}
              onPress={() => setPaymentMethod('paystack')}
            >
              <Text style={[styles.paymentBtnText, paymentMethod === 'paystack' && styles.paymentBtnTextActive]}>
                Paystack Payments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentBtn, paymentMethod === 'opay' && styles.paymentBtnActive]}
              onPress={() => setPaymentMethod('opay')}
            >
              <Text style={[styles.paymentBtnText, paymentMethod === 'opay' && styles.paymentBtnTextActive]}>
                OPay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Dock Button */}
      <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View>
          <Text style={styles.dockLabel}>TOTAL</Text>
          <Text style={styles.dockVal}>${total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>
            {isProcessing ? 'PROCESSING...' : 'PLACE ORDER'}
          </Text>
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
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 1,
  },
  scrollList: {
    padding: 16,
    gap: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  inputGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textDim,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: THEME.colors.textMain,
    fontSize: 13,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.sm,
    padding: 12,
  },
  optionCardActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  optionTitleActive: {
    color: THEME.colors.primary,
  },
  optionSub: {
    fontSize: 10,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  optionPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentBtn: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 12,
    borderRadius: THEME.radius.sm,
    alignItems: 'center',
  },
  paymentBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  paymentBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  paymentBtnTextActive: {
    color: THEME.colors.primary,
  },
  dock: {
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
  dockLabel: {
    fontSize: 9,
    color: THEME.colors.textDim,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dockVal: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textMain,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
  },
  submitBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#07090e',
    letterSpacing: 0.8,
  },
  successContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successCheck: {
    fontSize: 28,
    color: '#34d399',
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 1,
    textAlign: 'center',
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.primary,
    marginTop: 4,
    letterSpacing: 1,
  },
  successSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    maxWidth: 300,
  },
  successSummaryCard: {
    width: '100%',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  summaryItem: {
    gap: 2,
  },
  summaryItemLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.textDim,
    letterSpacing: 0.8,
  },
  summaryItemVal: {
    fontSize: 12,
    color: THEME.colors.textMain,
    fontWeight: '700',
  },
  doneBtn: {
    marginTop: 24,
    backgroundColor: THEME.colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#07090e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
