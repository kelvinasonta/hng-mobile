export type ProductCategory = 
  | 'smartphones' 
  | 'smartphone'
  | 'watch' 
  | 'headphone' 
  | 'speaker' 
  | 'laptops' 
  | 'smart-home' 
  | 'living';

export interface Product {
  id: string;
  name: string;
  tagline?: string;
  category: ProductCategory;
  categoryLabel?: string;
  price: number;
  stock: number;
  image: string;
  badge?: string;
  description: string;
  features: string[];
  rating: number;
  reviewsCount?: number;
  overview?: string;
  materials?: string;
  warranty?: string;
  specs?: Record<string, string>;
  specifications?: Record<string, any>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  image?: string;
}

export interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: OrderItem[];
  shipping_address?: {
    fullName: string;
    street: string;
    city: string;
    country: string;
  };
}

export interface SpecRow {
  key: string;
  value: string;
}
