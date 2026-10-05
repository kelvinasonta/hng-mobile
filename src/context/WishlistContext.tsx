import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import {
  getWishlistFromWebAPI,
  toggleWishlistWebAPI,
  removeFromWishlistWebAPI,
  clearWishlistWebAPI,
} from '../services/api';

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => boolean;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  isSyncing: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  wishlistCount: 0,
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  toggleWishlist: () => false,
  isInWishlist: () => false,
  clearWishlist: () => {},
  isSyncing: false,
  refreshWishlist: async () => {},
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync wishlist with Web API on user login / change
  const refreshWishlist = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const items = await getWishlistFromWebAPI(user.id, user.email);
      setWishlist(items);
    } catch (err) {
      console.warn('[WishlistContext] Failed to fetch wishlist from Web API', err);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      refreshWishlist();
    }
  }, [user?.email, refreshWishlist]);

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.id === productId);
  };

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });

    if (user?.id || user?.email) {
      toggleWishlistWebAPI(product, user?.id, user?.email).catch((err) =>
        console.warn('[WishlistContext] Add sync error', err)
      );
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));

    if (user?.id || user?.email) {
      removeFromWishlistWebAPI(productId, user?.id, user?.email).catch((err) =>
        console.warn('[WishlistContext] Remove sync error', err)
      );
    }
  };

  const toggleWishlist = (product: Product): boolean => {
    const exists = isInWishlist(product.id);
    if (exists) {
      removeFromWishlist(product.id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (user?.id || user?.email) {
      clearWishlistWebAPI(user?.id, user?.email).catch((err) =>
        console.warn('[WishlistContext] Clear sync error', err)
      );
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        isSyncing,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
