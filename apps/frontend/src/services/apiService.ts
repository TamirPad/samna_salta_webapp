import { apiService } from "../utils/api";

// API Service interface
export interface ApiServiceInterface {
  // Auth
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<any>;
  getCurrentUser: () => Promise<any>;

  // Products
  getProducts: (params?: any) => Promise<any>;
  getProduct: (id: number) => Promise<any>;
  createProduct: (productData: any) => Promise<any>;
  updateProduct: (id: number, productData: any) => Promise<any>;
  deleteProduct: (id: number) => Promise<any>;

  // Categories
  getCategories: () => Promise<any>;
  createCategory: (categoryData: any) => Promise<any>;
  updateCategory: (id: number, categoryData: any) => Promise<any>;
  deleteCategory: (id: number) => Promise<any>;

  // Orders
  getOrders: (params?: any) => Promise<any>;
  getOrder: (id: number) => Promise<any>;
  createOrder: (orderData: any) => Promise<any>;
  updateOrderStatus: (
    id: number,
    status: string,
    notes?: string,
  ) => Promise<any>;
  confirmPayment: (id: number, paymentIntentId: string) => Promise<any>;
  cancelOrder: (id: number, reason: string) => Promise<any>;

  // Customers
  getCustomers: (params?: any) => Promise<any>;
  getCustomer: (id: number) => Promise<any>;
  updateCustomer: (id: number, customerData: any) => Promise<any>;
  deleteCustomer: (id: number) => Promise<any>;

  // Analytics
  getDashboardAnalytics: () => Promise<any>;
  getSalesReport: (params?: any) => Promise<any>;
  getProductAnalytics: (params?: any) => Promise<any>;
  getCustomerAnalytics: (params?: any) => Promise<any>;
}

// Enhanced API Service with caching and error handling
export class EnhancedApiService implements ApiServiceInterface {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(method: string, url: string, params?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(
    key: string,
    data: any,
    ttl: number = this.DEFAULT_CACHE_TTL,
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    return apiService.login(credentials);
  }

  async register(userData: any) {
    return apiService.register(userData);
  }

  async logout() {
    this.clearCache(); // Clear cache on logout
    return apiService.logout();
  }

  async getCurrentUser() {
    return apiService.getCurrentUser();
  }

  // Product methods with caching
  async getProducts(params?: any) {
    const cacheKey = this.getCacheKey("GET", "/products", params);
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await apiService.getProducts(params);
    this.setCachedData(cacheKey, result, 2 * 60 * 1000); // 2 minutes for products
    return result;
  }

  async getProduct(id: number) {
    const cacheKey = this.getCacheKey("GET", `/products/${id}`);
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await apiService.getProduct(id);
    this.setCachedData(cacheKey, result, 10 * 60 * 1000); // 10 minutes for single product
    return result;
  }

  async createProduct(productData: any) {
    this.clearCache(); // Clear cache on product creation
    return apiService.createProduct(productData);
  }

  async updateProduct(id: number, productData: any) {
    this.clearCache(); // Clear cache on product update
    return apiService.updateProduct(id, productData);
  }

  async deleteProduct(id: number) {
    this.clearCache(); // Clear cache on product deletion
    return apiService.deleteProduct(id);
  }

  // Category methods
  async getCategories() {
    const cacheKey = this.getCacheKey("GET", "/products/categories");
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await apiService.getCategories();
    this.setCachedData(cacheKey, result, 30 * 60 * 1000); // 30 minutes for categories
    return result;
  }

  async createCategory(categoryData: any) {
    this.clearCache();
    return apiService.createCategory(categoryData);
  }

  async updateCategory(id: number, categoryData: any) {
    this.clearCache();
    return apiService.updateCategory(id, categoryData);
  }

  async deleteCategory(id: number) {
    this.clearCache();
    return apiService.deleteCategory(id);
  }

  // Order methods
  async getOrders(params?: any) {
    return apiService.getOrders(params);
  }

  async getOrder(id: number) {
    return apiService.getOrder(id);
  }

  async createOrder(orderData: any) {
    return apiService.createOrder(orderData);
  }

  async updateOrderStatus(id: number, status: string, notes?: string) {
    return apiService.updateOrderStatus(id, status, notes);
  }

  async confirmPayment(id: number, paymentIntentId: string) {
    return apiService.confirmPayment(id, paymentIntentId);
  }

  async cancelOrder(id: number, reason: string) {
    return apiService.cancelOrder(id, reason);
  }

  // Customer methods
  async getCustomers(params?: any) {
    return apiService.getCustomers(params);
  }

  async getCustomer(id: number) {
    return apiService.getCustomer(id);
  }

  async updateCustomer(id: number, customerData: any) {
    return apiService.updateCustomer(id, customerData);
  }

  async deleteCustomer(id: number) {
    return apiService.deleteCustomer(id);
  }

  // Analytics methods
  async getDashboardAnalytics() {
    return apiService.getDashboardAnalytics();
  }

  async getSalesReport(params?: any) {
    return apiService.getSalesReport(params);
  }

  async getProductAnalytics(params?: any) {
    return apiService.getProductAnalytics(params);
  }

  async getCustomerAnalytics(params?: any) {
    return apiService.getCustomerAnalytics(params);
  }
}

// Export singleton instance
export const enhancedApiService = new EnhancedApiService();
