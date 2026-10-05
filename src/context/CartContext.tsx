import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { getCartFromWebAPI, updateCartItemWebAPI, removeCartItemWebAPI, clearCartWebAPI } from '../services/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  isInCart: (productId: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartSheetOpen: boolean;
  setIsCartSheetOpen: (open: boolean) => void;
  refreshCart: () => Promise<void>;
  promoCode: string;
  promoDiscount: number;
  applyPromoCode: (code: string) => boolean;
  shipping: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  isInCart: () => false,
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  isCartSheetOpen: false,
  setIsCartSheetOpen: () => {},
  refreshCart: async () => {},
  promoCode: '',
  promoDiscount: 0,
  applyPromoCode: () => false,
  shipping: 0,
  tax: 0,
  total: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscountRate, setPromoDiscountRate] = useState(0);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const apiCart = await getCartFromWebAPI(user.id, user.email);
      setItems(apiCart);
    } catch (e) {
      console.warn('Failed to fetch cart', e);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const refreshCart = async () => {
    await fetchCart();
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.product.id === productId);
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    // Optimistic
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    if (user) {
      const updated = await updateCartItemWebAPI(product, quantity, false, user.id, user.email);
      if (updated.length > 0) {
        setItems(updated);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    if (user) {
      const updated = await removeCartItemWebAPI(productId, user.id, user.email);
      if (updated.length > 0) {
        setItems(updated);
      } else {
        await fetchCart();
      }
    }
  };

  const updateQuantity = async (productId: string, delta: number) => {
    const itemToUpdate = items.find((item) => item.product.id === productId);
    if (!itemToUpdate) return;
    const nextQty = itemToUpdate.quantity + delta;
    
    if (nextQty <= 0) {
      await removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: nextQty };
        }
        return item;
      })
    );

    if (user) {
      const updated = await updateCartItemWebAPI(itemToUpdate.product, nextQty, true, user.id, user.email);
      if (updated.length > 0) setItems(updated);
    }
  };

  const clearCart = async () => {
    setItems([]);
    setPromoCode('');
    setPromoDiscountRate(0);
    if (user) {
      await clearCartWebAPI(user.id, user.email);
    }
  };

  const applyPromoCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'WELCOME10') {
      setPromoCode(clean);
      setPromoDiscountRate(0.1);
      return true;
    } else if (clean === 'TECH20') {
      setPromoCode(clean);
      setPromoDiscountRate(0.2);
      return true;
    }
    return false;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const promoDiscount = subtotal * promoDiscountRate;
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const tax = Math.round((subtotal - promoDiscount) * 0.08 * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - promoDiscount + tax + shipping) * 100) / 100);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        isInCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        promoCode,
        promoDiscount,
        applyPromoCode,
        shipping,
        tax,
        total,
        isCartSheetOpen,
        setIsCartSheetOpen,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
