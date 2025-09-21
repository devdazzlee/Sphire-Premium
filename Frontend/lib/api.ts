import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  addresses: Address[];
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  features: string[];
  ingredients?: string[];
  howToUse?: string;
  skinType?: string[];
  benefits?: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  brand?: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
  reviewsCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getMe: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  refreshToken: async (token: string): Promise<ApiResponse<{ token: string }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    sort?: string;
    search?: string;
  }): Promise<ApiResponse<{ products: Product[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);
    return response.json();
  },

  getById: async (id: string, token?: string): Promise<ApiResponse<{ product: Product; relatedProducts: Product[] }>> => {
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, { headers });
    return response.json();
  },

  getCategories: async (): Promise<ApiResponse<{ categories: any[] }>> => {
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    return response.json();
  },

  getFeatured: async (limit?: number): Promise<ApiResponse<{ products: Product[] }>> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${API_BASE_URL}/products/featured${params}`);
    return response.json();
  },

  getReviews: async (id: string, page?: number, limit?: number): Promise<ApiResponse<{ reviews: any[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (page) searchParams.append('page', page.toString());
    if (limit) searchParams.append('limit', limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/products/${id}/reviews?${searchParams}`);
    return response.json();
  },
};

// Users API
export const usersApi = {
  getProfile: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateProfile: async (token: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  uploadAvatar: async (token: string, file: File): Promise<ApiResponse<{ user: User }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },

  getAddresses: async (token: string): Promise<ApiResponse<{ addresses: Address[] }>> => {
    const response = await fetch(`${API_BASE_URL}/users/addresses`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  addAddress: async (token: string, address: Omit<Address, '_id'>): Promise<ApiResponse<{ addresses: Address[] }>> => {
    const response = await fetch(`${API_BASE_URL}/users/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(address),
    });
    return response.json();
  },

  updateAddress: async (token: string, addressId: string, address: Partial<Address>): Promise<ApiResponse<{ addresses: Address[] }>> => {
    const response = await fetch(`${API_BASE_URL}/users/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(address),
    });
    return response.json();
  },

  deleteAddress: async (token: string, addressId: string): Promise<ApiResponse<{ addresses: Address[] }>> => {
    const response = await fetch(`${API_BASE_URL}/users/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  setDefaultAddress: async (token: string, addressId: string): Promise<ApiResponse<{ addresses: Address[] }>> => {
    const response = await fetch(`${API_BASE_URL}/users/addresses/${addressId}/default`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updatePassword: async (token: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
  },
};

// Cart API
export const cartApi = {
  get: async (token: string): Promise<ApiResponse<{ cart: Cart }>> => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  addItem: async (token: string, productId: string, quantity: number): Promise<ApiResponse<{ cart: Cart }>> => {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    return response.json();
  },

  updateItem: async (token: string, productId: string, quantity: number): Promise<ApiResponse<{ cart: Cart }>> => {
    const response = await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  removeItem: async (token: string, productId: string): Promise<ApiResponse<{ cart: Cart }>> => {
    const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  clear: async (token: string): Promise<ApiResponse<{ cart: Cart }>> => {
    const response = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

// Orders API
export const ordersApi = {
  create: async (token: string, orderData: {
    shippingAddress: Address;
    notes?: string;
  }): Promise<ApiResponse<{ order: Order }>> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  getAll: async (token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/orders?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getById: async (token: string, orderId: string): Promise<ApiResponse<{ order: Order }>> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  cancel: async (token: string, orderId: string, cancellationReason?: string): Promise<ApiResponse<{ order: Order }>> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ cancellationReason }),
    });
    return response.json();
  },

  getStats: async (token: string): Promise<ApiResponse<{ stats: any }>> => {
    const response = await fetch(`${API_BASE_URL}/orders/stats/summary`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

// Utility function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Token management utilities
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_user');
  },
};
