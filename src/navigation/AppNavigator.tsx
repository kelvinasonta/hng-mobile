import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { THEME } from '../theme';
import { AppHeader } from '../components/AppHeader';
import { TabBar, TabKey } from '../components/TabBar';
import { FloatingCart } from '../components/FloatingCart';
import { CustomerAuthModal } from '../components/CustomerAuthModal';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { HardwareCatalogScreen } from '../screens/HardwareCatalogScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { useProducts } from '../context/ProductsContext';
import { hasSeenWelcome, setHasSeenWelcome } from '../services/storage';
import { Product } from '../types';

export const AppNavigator: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [originTab, setOriginTab] = useState<TabKey>('discover');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { getProductById } = useProducts();
  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;

  useEffect(() => {
    let isMounted = true;
    hasSeenWelcome().then((seen) => {
      if (isMounted) {
        setShowWelcome(!seen);
        setIsReady(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFinishWelcome = async () => {
    setShowWelcome(false);
    await setHasSeenWelcome();
  };

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: THEME.colors.bg }} />;
  }

  if (showWelcome) {
    return <WelcomeScreen onFinish={handleFinishWelcome} />;
  }

  const navigateToTab = (tab: TabKey) => {
    setSelectedProductId(null);
    setIsCheckingOut(false);
    setActiveTab(tab);
  };

  const handleSelectProduct = (productId: string) => {
    setOriginTab(activeTab);
    setSelectedProductId(productId);
  };

  const handleExpressCheckout = (_product: Product) => {
    setSelectedProductId(null);
    setIsCheckingOut(true);
  };

  const renderMainTab = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <DiscoverScreen
            onSelectProduct={handleSelectProduct}
            onExploreCatalog={() => navigateToTab('catalog')}
          />
        );
      case 'catalog':
        return <HardwareCatalogScreen onSelectProduct={handleSelectProduct} />;
      case 'wishlist':
        return (
          <WishlistScreen
            onSelectProduct={handleSelectProduct}
            onExploreCatalog={() => navigateToTab('catalog')}
          />
        );
      case 'cart':
        return (
          <CartScreen
            onCheckout={() => setIsCheckingOut(true)}
            onExploreCatalog={() => navigateToTab('catalog')}
          />
        );
      case 'account':
        return <AccountScreen onNavigateWishlist={() => navigateToTab('wishlist')} />;
      default:
        return (
          <DiscoverScreen
            onSelectProduct={handleSelectProduct}
            onExploreCatalog={() => navigateToTab('catalog')}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Mobile App Header */}
      <AppHeader
        title={
          selectedProduct
            ? selectedProduct.name
            : isCheckingOut
            ? 'SECURE DISPATCH'
            : activeTab === 'account'
            ? 'CONCIERGE ACCOUNT'
            : activeTab === 'cart'
            ? 'DISPATCH CART'
            : activeTab === 'wishlist'
            ? 'SAVED HARDWARE'
            : activeTab === 'catalog'
            ? 'HARDWARE CATALOG'
            : 'APEX HARDWARE'
        }
        onOpenCart={() => navigateToTab('cart')}
        onOpenWishlist={() => navigateToTab('wishlist')}
        onPressLogo={() => navigateToTab('discover')}
      />

      {/* Main Screen Body */}
      <View style={styles.content}>
        {selectedProduct ? (
          <ProductDetailScreen
            product={selectedProduct}
            onBack={() => setSelectedProductId(null)}
            onExpressCheckout={handleExpressCheckout}
            backTitle={originTab}
          />
        ) : isCheckingOut ? (
          <CheckoutScreen
            onCancel={() => setIsCheckingOut(false)}
            onOrderSuccess={(_orderId) => {
              setIsCheckingOut(false);
              setActiveTab('account');
            }}
          />
        ) : (
          renderMainTab()
        )}
      </View>

      {/* Floating Cart Button (hidden on cart screen, checkout, and detail screen where bottom dock is present) */}
      {!selectedProduct && activeTab !== 'cart' && !isCheckingOut && (
        <FloatingCart onPress={() => navigateToTab('cart')} />
      )}

      {/* Bottom Navigation Dock */}
      {!isCheckingOut && !selectedProduct && (
        <TabBar activeTab={activeTab} onSelectTab={navigateToTab} />
      )}

      {/* Customer Login & Registration Modal */}
      <CustomerAuthModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  content: {
    flex: 1,
  },
});
