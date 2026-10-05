import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { THEME } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';
import { ProductsProvider } from './src/context/ProductsContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <WishlistProvider>
                <View style={styles.appWrapper}>
                  <AppNavigator />
                </View>
              </WishlistProvider>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  appWrapper: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
});
