import { API_CONFIG } from '@/config/api';
import { USE_TEST_DATA, getTestProducts, getTestCategories, getTestProductById, getTestProductsByCategory, getTestFeaturedProducts, simulateApiResponse } from '@/utils/testData';

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

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isActive: boolean;
  helpfulVotes: number;
  adminResponse?: {
    text: string;
    respondedBy: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  verifiedReviews: number;
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

  loginWithGoogle: async (firebaseToken: string, name: string, email: string, picture: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken, name, email, picture }),
    });
    return response.json();
  },

  loginWithFacebook: async (firebaseToken: string, name: string, email: string, picture: any): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseToken, name, email, picture }),
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
    if (USE_TEST_DATA) {
      let products = getTestProducts();
      
      // Apply filters
      if (params?.category && params.category !== 'all') {
        products = products.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
      }
      
      if (params?.subcategory) {
        products = products.filter(p => p.subcategory.toLowerCase() === params.subcategory?.toLowerCase());
      }
      
      if (params?.featured) {
        products = products.filter(p => p.isFeatured);
      }
      
      if (params?.inStock !== undefined) {
        products = products.filter(p => p.inStock === params.inStock);
      }
      
      if (params?.minPrice) {
        products = products.filter(p => p.price >= params.minPrice!);
      }
      
      if (params?.maxPrice) {
        products = products.filter(p => p.price <= params.maxPrice!);
      }
      
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply sorting
      if (params?.sort) {
        switch (params.sort) {
          case 'name_asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name_desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'price_asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'rating_desc':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'oldest':
            products.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
        }
      }
      
      // Apply pagination
      const limit = params?.limit || 50;
      const page = params?.page || 1;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);
      
      return {
        status: 'success' as const,
        data: {
          products: paginatedProducts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(products.length / limit),
            totalProducts: products.length,
            hasNextPage: endIndex < products.length,
            hasPrevPage: page > 1
          }
        }
      };
    }
    
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
    if (USE_TEST_DATA) {
      const product = getTestProductById(id);
      if (!product) {
        return {
          status: 'error' as const,
          message: 'Product not found'
        };
      }
      
      // Get related products (same category, excluding current product)
      const relatedProducts = getTestProducts()
        .filter(p => p._id !== id && p.category === product.category)
        .slice(0, 4);
      
      return {
        status: 'success' as const,
        data: {
          product,
          relatedProducts
        }
      };
    }
    
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, { headers });
    return response.json();
  },

  getCategories: async (): Promise<ApiResponse<{ categories: any[] }>> => {
    if (USE_TEST_DATA) {
      const categories = getTestCategories();
      return {
        status: 'success' as const,
        data: { categories }
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    return response.json();
  },

  getFeatured: async (limit?: number): Promise<ApiResponse<{ products: Product[] }>> => {
    if (USE_TEST_DATA) {
      let featuredProducts = getTestFeaturedProducts();
      if (limit) {
        featuredProducts = featuredProducts.slice(0, limit);
      }
      return {
        status: 'success' as const,
        data: { products: featuredProducts }
      };
    }
    
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${API_BASE_URL}/products/featured${params}`);
    return response.json();
  },

  getReviews: async (id: string, page?: number, limit?: number, sort?: string): Promise<ApiResponse<{ reviews: Review[]; stats: ReviewStats; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (page) searchParams.append('page', page.toString());
    if (limit) searchParams.append('limit', limit.toString());
    if (sort) searchParams.append('sort', sort);
    
    const response = await fetch(`${API_BASE_URL}/reviews/product/${id}?${searchParams}`);
    return response.json();
  },
};

// Reviews API
export const reviewsApi = {
  getByProduct: async (productId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<ApiResponse<{ reviews: Review[]; stats: ReviewStats; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}?${searchParams}`);
    return response.json();
  },

  create: async (token: string, reviewData: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<ApiResponse<{ review: Review }>> => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    return response.json();
  },

  getUserReviews: async (token: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ reviews: Review[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/reviews/user?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  update: async (token: string, reviewId: string, reviewData: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<ApiResponse<{ review: Review }>> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    return response.json();
  },

  delete: async (token: string, reviewId: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  markHelpful: async (token: string, reviewId: string): Promise<ApiResponse<{ helpfulVotes: number }>> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  report: async (token: string, reviewId: string, reason: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
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

// Newsletter API
export interface NewsletterSubscriber {
  _id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
  source: string;
}

export const newsletterApi = {
  // Subscribe to newsletter
  subscribe: async (email: string, source: string = 'footer'): Promise<ApiResponse<{ subscriber: NewsletterSubscriber }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Failed to subscribe to newsletter',
      };
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Failed to unsubscribe from newsletter',
      };
    }
  },
};
