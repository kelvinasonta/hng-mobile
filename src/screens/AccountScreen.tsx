import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Package, ShieldCheck, Heart, LogOut, ArrowRight, MapPin, MessageSquare, Star, Layers, Sparkles, ExternalLink, Mail, Phone, Lock, Plus, Building2, Globe, Laptop, Key, Shield } from 'lucide-react-native';
import { THEME } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { getCustomerOrders, OrderRecord } from '../services/api';

interface AccountScreenProps {
  onNavigateWishlist?: () => void;
}

type TabType = 'overview' | 'profile' | 'orders' | 'wishlist' | 'addresses' | 'security' | 'reviews';

export const AccountScreen: React.FC<AccountScreenProps> = ({ onNavigateWishlist }) => {
  const { user, openAuthModal, signInWithGoogle, logout } = useAuth();
  const { wishlistCount, refreshWishlist } = useWishlist();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const insets = useSafeAreaInsets();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);

  const fetchOrders = useCallback(async () => {
    if (!user?.email) return;
    setLoadingOrders(true);
    try {
      const realOrders = await getCustomerOrders(user.email);
      setOrders(realOrders);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user?.email, fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders(), refreshWishlist()]);
    setRefreshing(false);
  }, [fetchOrders, refreshWishlist]);

  if (!user) {
    return (
      <View style={styles.loggedOutContainer}>
        <View style={styles.loggedOutCard}>
          <View style={styles.loggedOutIconBadge}>
            <User size={36} color={THEME.colors.primary} />
          </View>
          <Text style={styles.loggedOutTitle}>CUSTOMER PORTAL</Text>
          <Text style={styles.loggedOutSub}>
            Sign in or register to track your orders, access your wishlist, and manage your account settings.
          </Text>

          <TouchableOpacity style={styles.googleActionBtn} onPress={() => signInWithGoogle()} activeOpacity={0.85}>
            <View style={styles.googleGWrapper}><Text style={styles.googleG}>G</Text></View>
            <Text style={styles.googleActionBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emailActionBtn} onPress={() => openAuthModal('signin')} activeOpacity={0.8}>
            <Text style={styles.emailActionBtnText}>Sign In with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openAuthModal('signup')} style={styles.registerLink}>
            <Text style={styles.registerLinkText}>
              New to AETHER? <Text style={{ color: THEME.colors.primary, fontWeight: '800' }}>Register Client Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'reviews', label: 'My Reviews', icon: Star },
  ];

  const recentOrder = orders.length > 0 ? orders[0] : null;

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top, backgroundColor: THEME.colors.surface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabMenu} contentContainerStyle={styles.tabMenuContent}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id as TabType)}
            >
              <tab.icon size={14} color={activeTab === tab.id ? '#07090e' : THEME.colors.textMuted} />
              <Text style={[styles.tabBtnText, activeTab === tab.id && styles.tabBtnTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.contentScroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 + Math.max(insets.bottom, 0) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />}
      >
        <View style={styles.contentContainer}>
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <View>
              <View style={styles.heroBanner}>
                <View style={styles.heroSparkles}>
                  <Sparkles size={14} color={THEME.colors.primary} />
                  <Text style={styles.heroSparklesText}>Welcome Back</Text>
                </View>
                <Text style={styles.heroTitle}>{user.name}</Text>
                <Text style={styles.heroSub}>Account linked with {user.email}</Text>
                <TouchableOpacity style={styles.editProfileBtn} onPress={() => setActiveTab('profile')}>
                  <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Package size={16} color={THEME.colors.primary} />
                    <Text style={styles.metricTitle}>Total Orders</Text>
                  </View>
                  <Text style={styles.metricValue}>{orders.length}</Text>
                </View>
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <MapPin size={16} color="#34d399" />
                    <Text style={[styles.metricTitle, { color: '#34d399' }]}>Addresses</Text>
                  </View>
                  <Text style={styles.metricValue}>{addresses.length}</Text>
                </View>
              </View>

              <View style={styles.recentOrderCard}>
                <View style={styles.recentOrderHeader}>
                  <Text style={styles.recentOrderTitle}>Latest Transaction</Text>
                  <TouchableOpacity onPress={() => setActiveTab('orders')} style={styles.viewAllRow}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <ArrowRight size={14} color={THEME.colors.primary} />
                  </TouchableOpacity>
                </View>

                {recentOrder ? (
                  <View style={styles.recentOrderBox}>
                    <View style={styles.recentOrderTop}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.recentOrderId}>#{recentOrder.id || 'N/A'}</Text>
                        <Text style={styles.recentOrderDate}>{recentOrder.created_at ? new Date(recentOrder.created_at).toLocaleDateString() : ''}</Text>
                      </View>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusText}>{recentOrder.status || recentOrder.order_status || 'Confirmed'}</Text>
                      </View>
                    </View>
                    <View style={styles.recentOrderBottom}>
                      <Text style={styles.recentOrderTotal}>Total Paid: ${(recentOrder.total || recentOrder.total_amount || 0).toLocaleString()}</Text>
                      <TouchableOpacity style={styles.receiptRow}>
                        <Text style={styles.receiptText}>Order Receipt</Text>
                        <ExternalLink size={12} color={THEME.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No orders logged yet. Visit the catalog to make your first purchase!</Text>
                )}
              </View>
            </View>
          )}

          {/* TAB: PROFILE INFO */}
          {activeTab === 'profile' && (
            <View style={styles.tabSection}>
              <View style={styles.sectionHeaderWrap}>
                <Text style={styles.pageTitle}>Profile Information</Text>
                <Text style={styles.pageSubtitle}>Manage your personal customer details and contact preferences.</Text>
              </View>
              
              <View style={styles.formCard}>
                <Text style={styles.inputLabel}>Email Address (Primary Identifier)</Text>
                <View style={styles.inputIconWrap}>
                  <Mail size={16} color={THEME.colors.textDim} style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.inputField, { color: THEME.colors.textDim }]} 
                    value={user.email}
                    editable={false}
                  />
                </View>
                <Text style={styles.inputHelper}>To change your primary email, contact customer support for identity verification.</Text>

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Full Legal Name</Text>
                <View style={styles.inputIconWrap}>
                  <User size={16} color={THEME.colors.textDim} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputField} 
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Alex Vance"
                    placeholderTextColor={THEME.colors.textDim}
                  />
                </View>

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Mobile Phone (for Delivery SMS)</Text>
                <View style={styles.inputIconWrap}>
                  <Phone size={16} color={THEME.colors.textDim} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputField} 
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor={THEME.colors.textDim}
                    keyboardType="phone-pad"
                  />
                </View>

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Avatar Image URL</Text>
                <TextInput 
                  style={[styles.inputField, { paddingLeft: 14 }]} 
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder="https://..."
                  placeholderTextColor={THEME.colors.textDim}
                />

                <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert("Profile Update", "Profile updated successfully.")}>
                  <Text style={styles.primaryBtnText}>Save Profile Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <View style={styles.tabSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>ORDER HISTORY</Text>
                <TouchableOpacity onPress={fetchOrders} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.refreshText}>↻ REFRESH</Text>
                </TouchableOpacity>
              </View>
              {loadingOrders ? (
                <View style={styles.loadingOrdersBox}>
                  <ActivityIndicator size="small" color={THEME.colors.primary} />
                </View>
              ) : orders.length > 0 ? (
                orders.map((ord) => {
                  const formattedTotal = ord.total_amount || ord.total || 0;
                  const statusLabel = ord.order_status || ord.status || 'Processing';
                  const itemsCount = ord.order_items?.length || 1;
                  const firstItemName = ord.order_items?.[0]?.product_name || 'Hardware Allocation';

                  return (
                    <View key={ord.id} style={styles.orderCard}>
                      <View style={styles.orderTop}>
                        <Text style={styles.orderId}>{ord.id}</Text>
                        <Text style={styles.orderTotal}>${formattedTotal.toLocaleString()}</Text>
                      </View>
                      <Text style={styles.orderItem}>{firstItemName} {itemsCount > 1 ? `(+${itemsCount - 1} more)` : ''}</Text>
                      <View style={styles.orderBottom}>
                        <Text style={styles.orderDate}>{ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Active'}</Text>
                        <View style={styles.statusPillAlt}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusTextAlt}>{statusLabel}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyStateCard}>
                  <Package size={36} color={THEME.colors.textMuted} style={{ marginBottom: 12 }} />
                  <Text style={styles.emptyStateTitle}>NO ACTIVE ORDERS</Text>
                  <Text style={styles.emptyStateSub}>You have no placed orders under this account.</Text>
                </View>
              )}
            </View>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === 'wishlist' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionHeader}>SAVED WISHLIST</Text>
              <View style={styles.emptyStateCard}>
                <Heart size={36} color={THEME.colors.textMuted} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyStateTitle}>WISHLIST</Text>
                <Text style={styles.emptyStateSub}>You have {wishlistCount} items saved.</Text>
                <TouchableOpacity style={[styles.editProfileBtn, { marginTop: 16 }]} onPress={onNavigateWishlist}>
                  <Text style={styles.editProfileBtnText}>View Wishlist Screen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'addresses' && (
            <View style={styles.tabSection}>
              <View style={[styles.sectionHeaderWrap, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.pageTitle}>Saved Addresses</Text>
                  <Text style={styles.pageSubtitle}>Manage delivery locations for accelerated checkout and courier routing.</Text>
                </View>
                <TouchableOpacity style={styles.addBtn}>
                  <Plus size={14} color={THEME.colors.bg} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {addresses.length === 0 ? (
                <View style={styles.emptyStateCardDash}>
                  <Building2 size={36} color={THEME.colors.textDim} style={{ marginBottom: 12 }} />
                  <Text style={styles.emptyStateTitle}>No Saved Addresses Yet</Text>
                  <Text style={styles.emptyStateSub}>Add your shipping and billing locations for faster checkout on upcoming audio and computing hardware releases.</Text>
                  <TouchableOpacity style={styles.primaryBtnSm}>
                    <Plus size={14} color={THEME.colors.bg} />
                    <Text style={styles.primaryBtnText}>Add First Address</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View></View>
              )}
            </View>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <View style={styles.tabSection}>
               <View style={styles.formCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Key size={20} color={THEME.colors.primary} />
                  <Text style={styles.pageTitle}>Password & Auth</Text>
                </View>
                <Text style={styles.pageSubtitle}>Ensure your hardware procurement account remains protected with high-entropy passkeys.</Text>
                <View style={styles.divider} />
                
                <Text style={styles.inputLabel}>New Master Password</Text>
                <View style={styles.inputIconWrap}>
                  <Lock size={16} color={THEME.colors.textDim} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputField} 
                    placeholder="••••••••••••"
                    placeholderTextColor={THEME.colors.textDim}
                    secureTextEntry
                  />
                </View>

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Confirm New Password</Text>
                <View style={styles.inputIconWrap}>
                  <Lock size={16} color={THEME.colors.textDim} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputField} 
                    placeholder="••••••••••••"
                    placeholderTextColor={THEME.colors.textDim}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity style={[styles.primaryBtn, { opacity: 0.5 }]} disabled>
                  <Text style={styles.primaryBtnText}>Update Password</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Shield size={18} color={THEME.colors.primary} />
                  <Text style={styles.cardHeader}>Connected Providers</Text>
                </View>
                
                <View style={styles.identityRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={styles.identityIcon}>
                       <Text style={{ fontWeight: '900', color: '#4285F4' }}>G</Text>
                    </View>
                    <View>
                      <Text style={styles.identityTitle}>Google Cloud OAuth</Text>
                      <Text style={styles.identitySub}>{user.email}</Text>
                    </View>
                  </View>
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Active</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <View style={styles.tabSection}>
              <View style={styles.sectionHeaderWrap}>
                <Text style={styles.pageTitle}>Hardware Reviews</Text>
                <Text style={styles.pageSubtitle}>Manage and track your product feedback and verified buyer reviews.</Text>
              </View>
              <View style={styles.emptyStateCardDash}>
                <Star size={36} color={THEME.colors.textDim} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyStateTitle}>No Reviews Submitted</Text>
                <Text style={styles.emptyStateSub}>You haven't reviewed any hardware yet. Review your past purchases to help the community.</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <LogOut size={14} color="#f87171" />
            <Text style={styles.logoutBtnText}>SIGN OUT</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  tabMenu: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  tabMenuContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  tabBtnTextActive: {
    color: '#07090e',
    fontWeight: '700',
  },
  heroBanner: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  heroSparkles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  heroSparklesText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginBottom: 16,
  },
  editProfileBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editProfileBtnText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  recentOrderCard: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentOrderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  recentOrderBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    padding: 16,
  },
  recentOrderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentOrderId: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  recentOrderDate: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginLeft: 8,
  },
  statusPill: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34d399',
  },
  recentOrderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
  },
  recentOrderTotal: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptText: {
    fontSize: 12,
    color: THEME.colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  tabSection: {
    marginBottom: 24,
  },
  sectionHeaderWrap: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textDim,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  refreshText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
    letterSpacing: 1,
  },
  orderCard: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  orderItem: {
    fontSize: 13,
    color: THEME.colors.textMain,
    fontWeight: '500',
    marginBottom: 10,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 8,
  },
  orderDate: {
    fontSize: 11,
    color: THEME.colors.textDim,
  },
  statusPillAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
    marginRight: 6,
  },
  statusTextAlt: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  emptyStateCard: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateCardDash: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textMain,
    marginBottom: 6,
  },
  emptyStateSub: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  loadingOrdersBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
  },
  logoutBtnText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  loggedOutContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loggedOutCard: {
    width: '100%',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  loggedOutIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  loggedOutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textMain,
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  loggedOutSub: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  googleActionBtn: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  googleGWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleG: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  googleActionBtnText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '700',
  },
  emailActionBtn: {
    width: '100%',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emailActionBtnText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  registerLink: {
    paddingVertical: 6,
  },
  registerLinkText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textMain,
    marginBottom: 8,
  },
  inputIconWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 10,
  },
  inputField: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 14,
    fontSize: 14,
    color: THEME.colors.textMain,
  },
  inputHelper: {
    fontSize: 11,
    color: THEME.colors.textDim,
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryBtnSm: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  primaryBtnText: {
    color: THEME.colors.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  addBtnText: {
    color: THEME.colors.bg,
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 20,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    padding: 16,
  },
  identityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  identitySub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePillText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
});
