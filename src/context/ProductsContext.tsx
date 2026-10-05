import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';
import { getProductsCatalog } from '../services/api';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  filteredProducts: Product[];
  getProductById: (id: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType>({
  products: [],
  loading: true,
  error: null,
  refreshCatalog: async () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  selectedCategory: 'all',
  setSelectedCategory: () => {},
  filteredProducts: [],
  getProductById: () => undefined,
});

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const refreshCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getProductsCatalog();
      setProducts(items);
    } catch (err: any) {
      console.warn('[ProductsContext] Web API error:', err?.message);
      setError(err?.message || 'Unable to load catalog from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  const getProductById = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tagline && p.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'all' ||
        p.category === selectedCategory ||
        p.categoryLabel?.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshCatalog,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filteredProducts,
        getProductById,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
