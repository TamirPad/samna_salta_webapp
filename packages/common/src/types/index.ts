// User types
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  language?: 'he' | 'en';
  createdAt?: string;
  lastLogin?: string;
  updatedAt?: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  name_en?: string;
  name_he?: string;
  description?: string;
  description_en?: string;
  description_he?: string;
  price: number;
  category_id?: number;
  category?: string;
  image_url?: string;
  is_active: boolean;
  preparation_time_minutes?: number;
  allergens?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Language types
export type Language = 'en' | 'he';

// Theme types
export type Theme = 'light' | 'dark'; 