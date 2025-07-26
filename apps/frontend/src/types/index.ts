// Product Types
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
  category?: Category;
  image_url?: string;
  is_active: boolean;
  preparation_time_minutes?: number;
  allergens?: string[];
  nutritional_info?: NutritionalInfo;
  options?: ProductOption[];
  sizes?: ProductSize[];
  created_at?: string;
  updated_at?: string;
  display_order?: number;
  category_name?: string;
  category_name_en?: string;
  category_name_he?: string;
  // Legacy fields for backward compatibility
  image?: string;
  emoji?: string;
  is_new?: boolean;
  is_popular?: boolean;
  preparation_time?: number;
}

export interface Category {
  id: number;
  name: string;
  name_en?: string;
  name_he?: string;
  description?: string;
  description_en?: string;
  description_he?: string;
  display_order?: number;
  is_active: boolean;
  image_url?: string;
  products?: Product[];
}

export interface ProductOption {
  id: number;
  name: string;
  name_en?: string;
  name_he?: string;
  display_name?: string;
  display_name_en?: string;
  display_name_he?: string;
  description?: string;
  description_en?: string;
  description_he?: string;
  option_type: string;
  price_modifier: number;
  is_active: boolean;
  display_order: number;
}

export interface ProductSize {
  id: number;
  name: string;
  name_en?: string;
  name_he?: string;
  display_name?: string;
  display_name_en?: string;
  display_name_he?: string;
  price_modifier: number;
  is_active: boolean;
  display_order: number;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
  selected_options?: ProductOption[];
  selected_size?: ProductSize;
  total_price: number;
}

export interface Cart {
  items: CartItem[];
  delivery_method: 'pickup' | 'delivery';
  delivery_address?: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
}

// Order Types
export interface Order {
  id: number;
  order_number: string;
  customer_id?: number;
  customer?: Customer;
  status: OrderStatus;
  delivery_address?: string;
  delivery_instructions?: string;
  order_type: 'pickup' | 'delivery';
  payment_method: 'cash' | 'card' | 'online';
  subtotal: number;
  delivery_charge: number;
  total: number;
  order_items: OrderItem[];
  created_at: string;
  updated_at?: string;
  estimated_delivery_time?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_options?: Record<string, any>;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderStatus {
  id: number;
  name: string;
  name_en?: string;
  name_he?: string;
  display_name?: string;
  display_name_en?: string;
  display_name_he?: string;
  description?: string;
  description_en?: string;
  description_he?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
}

// Customer Types
export interface Customer {
  id: number;
  telegram_id?: number;
  name: string;
  phone?: string;
  email?: string;
  language?: 'he' | 'en';
  delivery_address?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  orders?: Order[];
}

// Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  language?: 'he' | 'en';
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// UI Types
export interface UIState {
  isLoading: boolean;
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalType: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Language Types
export interface LanguageState {
  currentLanguage: 'he' | 'en';
  translations: Record<string, Record<string, string>>;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CheckoutForm {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_method: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_instructions?: string;
  payment_method: 'cash' | 'card' | 'online';
  special_instructions?: string;
}

export interface ProductForm {
  name: string;
  name_en?: string;
  name_he?: string;
  description?: string;
  description_en?: string;
  description_he?: string;
  price: number;
  category_id?: number;
  image_url?: string;
  is_active: boolean;
  preparation_time_minutes?: number;
  allergens?: string[];
  nutritional_info?: NutritionalInfo;
}

// Analytics Types
export interface AnalyticsData {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  average_order_value: number;
  top_products: ProductPerformance[];
  daily_sales: DailySales[];
  order_status_distribution: OrderStatusDistribution[];
}

export interface ProductPerformance {
  product_id: number;
  product_name: string;
  total_orders: number;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface DailySales {
  date: string;
  total_orders: number;
  total_revenue: number;
  total_items_sold: number;
  average_order_value: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

// Business Settings Types
export interface BusinessSettings {
  business_name: string;
  business_description?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  business_website?: string;
  business_hours?: string;
  delivery_charge: number;
  currency: string;
  hilbeh_available_days?: string[];
  hilbeh_available_hours?: string;
  welcome_message?: string;
  about_us?: string;
  contact_info?: string;
} 