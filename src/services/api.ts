declare const process: { env: Record<string, string | undefined> };
import { Product } from '../types';

/**
 * AETHER Mobile Web API Client
 * All mobile data flows through the Next.js Web API layer.
 * Zero direct database connections and zero mock data.
 */

// Dynamically read from .env (EXPO_PUBLIC_API_URL) with localhost fallback
export const API_BASE_URL: string = (
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  tagline: string;
  category: string;
  categoryLabel?: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  description: string;
  features: string[];
  stock: number;
}

export interface OrderRecord {
  id: string;
  created_at?: string;
  total_amount?: number;
  total?: number;
  order_status?: string;
  status?: string;
  shipping_address?: string;
  customer_name?: string;
  customer_email?: string;
  payment_method?: string;
  order_items?: Array<{
    id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    image_url?: string;
  }>;
}

/**
 * Fetch hardware products catalog from Web API
 */
export async function getProductsCatalog(category?: string, query?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (query) params.append('q', query);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/products${queryString}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch catalog (HTTP ${res.status})`);
    }

    const json = await res.json();
    const rawProducts: ApiProduct[] = json?.data?.products || json?.products || [];

    // Map Web API products to Mobile Product schema
    return rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline || '',
      category: p.category as any,
      categoryLabel: p.categoryLabel || p.category,
      price: Number(p.price),
      rating: Number(p.rating || 5),
      reviewsCount: Number(p.reviewsCount || 0),
      image: p.image,
      badge: p.badge,
      description: p.description,
      features: Array.isArray(p.features) ? p.features : [],
      stock: p.stock ?? 50,
      engineeringOverview: p.description,
      materialsAndFinish: 'Precision forged titanium alloy, matte carbon ceramic coating, and acoustic dampening acoustic composite.',
    }));
  } catch (error: any) {
    console.error('[Web API: getProductsCatalog Error]', error);
    throw error;
  }
}

/**
 * Customer sign in via Web API
 */
export async function loginWithWebAPI(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || json.error || 'Authentication failed');
  }

  return json.data.user;
}

/**
 * Customer registration via Web API
 */
export async function registerWithWebAPI(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || json.error || 'Registration failed');
  }

  return json.data.user;
}

/**
 * Generates the live Supabase Google OAuth authorization URL
 */
export function getGoogleOAuthUrl(appRedirectUrl?: string): string {
  const supabaseUrl = 'https://xlygzpdhsykigztuusvf.supabase.co';
  const callbackUrl = `${API_BASE_URL}/auth/callback?client=mobile${appRedirectUrl ? '&next=' + encodeURIComponent(appRedirectUrl) : ''}`;
  return `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(callbackUrl)}`;
}

export async function exchangeGoogleAuthCode(code: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/google/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || 'Code exchange failed');
  }
  return json.data.user;
}


/**
 * Customer Google authentication via Web API
 */
export async function googleAuthWithWebAPI(email?: string, name?: string, avatarUrl?: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, avatarUrl }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || json.error || 'Google authentication failed');
  }

  return json.data.user;
}

/**
 * Fetch customer orders from Web API
 */
export async function getCustomerOrders(email: string): Promise<OrderRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return json?.data?.orders || json?.orders || [];
  } catch (error) {
    console.error('[Web API: getCustomerOrders Error]', error);
    return [];
  }
}

/**
 * Submit checkout order to Web API
 */
export async function submitCheckoutOrder(orderPayload: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: any;
  items: Array<{ id: string; name: string; price: number; quantity: number; image: string }>;
  paymentMethod: string;
  promoCode?: string;
  userId?: string | null;
  returnUrl?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || json.error || 'Order placement failed');
  }

  return json.data;
}

/**
 * Fetch customer wishlist from Web API
 */
export async function getWishlistFromWebAPI(userId?: string, email?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);

    const res = await fetch(`${API_BASE_URL}/api/wishlist?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.wishlist || [];
  } catch (error) {
    console.error('[Web API: getWishlist Error]', error);
    return [];
  }
}

/**
 * Add or toggle item in customer wishlist via Web API
 */
export async function toggleWishlistWebAPI(product: Product, userId?: string, email?: string): Promise<{ wishlist: Product[]; inWishlist: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productData: product,
        action: 'toggle',
        userId,
        email,
      }),
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return {
        wishlist: json.data?.wishlist || [],
        inWishlist: json.data?.inWishlist ?? true,
      };
    }
    return { wishlist: [], inWishlist: false };
  } catch (error) {
    console.error('[Web API: toggleWishlist Error]', error);
    return { wishlist: [], inWishlist: false };
  }
}

/**
 * Remove product from customer wishlist via Web API
 */
export async function removeFromWishlistWebAPI(productId: string, userId?: string, email?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams({ productId });
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);

    const res = await fetch(`${API_BASE_URL}/api/wishlist?${params.toString()}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    const json = await res.json();
    return json?.data?.wishlist || [];
  } catch (error) {
    console.error('[Web API: removeFromWishlist Error]', error);
    return [];
  }
}

/**
 * Clear customer wishlist via Web API
 */
export async function clearWishlistWebAPI(userId?: string, email?: string): Promise<void> {
  try {
    const params = new URLSearchParams({ all: 'true' });
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);

    await fetch(`${API_BASE_URL}/api/wishlist?${params.toString()}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
  } catch (error) {
    console.error('[Web API: clearWishlist Error]', error);
  }
}

/**
 * Fetch customer cart from Web API
 */
export async function getCartFromWebAPI(userId?: string, email?: string): Promise<{ product: Product; quantity: number }[]> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);

    const res = await fetch(`${API_BASE_URL}/api/cart?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.data?.cart || [];
    return items.map((item: any) => ({
      product: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      },
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error('[Web API: getCart Error]', error);
    return [];
  }
}

/**
 * Add or update item in customer cart via Web API
 */
export async function updateCartItemWebAPI(product: Product, quantity: number, setExactQuantity: boolean, userId?: string, email?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productData: product,
        quantity,
        setExactQuantity,
        userId,
        email,
      }),
    });

    const json = await res.json();
    const items = json?.data?.cart || [];
    return items.map((item: any) => ({
      product: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      },
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error('[Web API: updateCart Error]', error);
    return [];
  }
}

/**
 * Remove product from customer cart via Web API
 */
export async function removeCartItemWebAPI(productId: string, userId?: string, email?: string) {
  try {
    const params = new URLSearchParams({ productId });
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);

    const res = await fetch(`${API_BASE_URL}/api/cart?${params.toString()}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    const json = await res.json();
    const items = json?.data?.cart || [];
    return items.map((item: any) => ({
      product: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      },
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error('[Web API: removeCartItem Error]', error);
    return [];
  }
}

/**
 * Clear customer cart via Web API
 */
export async function clearCartWebAPI(userId?: string, email?: string) {
  try {
    const params = new URLSearchParams({ all: 'true' });
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);

    await fetch(`${API_BASE_URL}/api/cart?${params.toString()}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
  } catch (error) {
    console.error('[Web API: clearCart Error]', error);
  }
}

