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
  brand?: string;
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
  weight?: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  createdAt: string;
  updatedAt: string;
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
  user: string | User;
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

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string | Category;
  subcategories?: Category[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: string | User;
  product: string | Product;
  order: string | Order;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  isApproved: boolean;
  isPublished: boolean;
  adminResponse?: {
    response: string;
    respondedBy: string;
    respondedAt: string;
  };
  helpfulVotes?: Array<{
    user: string;
    isHelpful: boolean;
  }>;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  _id: string;
  name: string;
  type: 'warehouse' | 'store' | 'pickup_point' | 'office';
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactInfo: {
    phone?: string;
    email?: string;
    manager?: string;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  capacity?: {
    storage: number;
    maxOrders: number;
  };
  services: string[];
  shippingZones: Array<{
    name: string;
    description?: string;
    areas: string[];
    deliveryDays: {
      min: number;
      max: number;
    };
    shippingCost: number;
    freeShippingThreshold: number;
    isActive: boolean;
  }>;
  isActive: boolean;
  isDefault: boolean;
  inventory: Array<{
    product: string | Product;
    quantity: number;
    reserved: number;
    lastUpdated: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  businessInfo: {
    name: string;
    tagline?: string;
    description?: string;
    logo?: string;
    favicon?: string;
    email: string;
    phone: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country: string;
    };
    socialMedia: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
    taxId?: string;
    registrationNumber?: string;
  };
  paymentMethods: Array<{
    name: string;
    type: string;
    isActive: boolean;
    config: any;
    displayOrder: number;
  }>;
  shipping: {
    defaultShippingCost: number;
    freeShippingThreshold: number;
    shippingMethods: Array<{
      name: string;
      cost: number;
      deliveryDays: {
        min: number;
        max: number;
      };
      isActive: boolean;
    }>;
    returnPolicy: {
      enabled: boolean;
      days: number;
      conditions?: string;
    };
  };
  notifications: {
    email: {
      orderConfirmations: boolean;
      orderUpdates: boolean;
      marketing: boolean;
      newsletters: boolean;
    };
    sms: {
      orderConfirmations: boolean;
      orderUpdates: boolean;
      marketing: boolean;
    };
    push: {
      orderUpdates: boolean;
      promotions: boolean;
      general: boolean;
    };
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    twitterCard?: string;
    googleAnalytics?: string;
    facebookPixel?: string;
    customHead?: string;
    customFooter?: string;
  };
  inventory: {
    lowStockThreshold: number;
    outOfStockThreshold: number;
    trackInventory: boolean;
    allowBackorders: boolean;
    autoUpdateStock: boolean;
  };
  currency: {
    primary: string;
    symbol: string;
    position: 'before' | 'after';
  };
  timezone: string;
  language: string;
  dateFormat: string;
  maintenance: {
    isActive: boolean;
    message?: string;
    allowedIPs?: string[];
  };
  features: {
    reviews: {
      enabled: boolean;
      moderation: boolean;
    };
    wishlist: {
      enabled: boolean;
    };
    compare: {
      enabled: boolean;
    };
    coupons: {
      enabled: boolean;
    };
    loyalty: {
      enabled: boolean;
    };
  };
  lastUpdatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  user: string | User;
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  description: string;
  details?: {
    oldValues?: any;
    newValues?: any;
    metadata?: any;
  };
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  createdAt: string;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
  };
  products: {
    total: number;
    totalStock: number;
    lowStock: number;
    outOfStock: number;
    averagePrice: number;
  };
  orders: {
    total: number;
    totalRevenue: number;
    averageOrderValue: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

// Auth API
export const authApi = {
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
};

// Admin API
export const adminApi = {
  getDashboardStats: async (token: string, startDate?: string, endDate?: string): Promise<ApiResponse<{ stats: DashboardStats }>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getUsers: async (token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ users: User[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/users?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getUser: async (token: string, userId: string): Promise<ApiResponse<{ user: User; recentOrders: Order[] }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  createUser: async (token: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateUser: async (token: string, userId: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteUser: async (token: string, userId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  deleteOrder: async (token: string, orderId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAddresses: async (token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    country?: string;
  }): Promise<ApiResponse<{ addresses: any[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${API_BASE_URL}/admin/addresses?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateAddress: async (token: string, userId: string, data: {
    type?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/addresses/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteAddress: async (token: string, userId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/addresses/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getProducts: async (token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: boolean;
    isActive?: boolean;
  }): Promise<ApiResponse<{ products: Product[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/products?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  createProduct: async (token: string, productData: FormData): Promise<ApiResponse<{ product: Product }>> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: productData,
    });
    return response.json();
  },

  updateProduct: async (token: string, productId: string, productData: FormData): Promise<ApiResponse<{ product: Product }>> => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: productData,
    });
    return response.json();
  },

  deleteProduct: async (token: string, productId: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getOrders: async (token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/orders?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getOrder: async (token: string, orderId: string): Promise<ApiResponse<{ order: Order }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateOrderStatus: async (token: string, orderId: string, data: {
    status: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    adminNotes?: string;
  }): Promise<ApiResponse<{ order: Order }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getRevenueAnalytics: async (token: string, period: string = '30d'): Promise<ApiResponse<{ revenueData: any[]; period: string; startDate: string; endDate: string }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/revenue?period=${period}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Category Management APIs
  getCategories: async (token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ categories: Category[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/categories?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getCategoryTree: async (token: string): Promise<ApiResponse<{ categories: Category[] }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/tree`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getCategory: async (token: string, categoryId: string): Promise<ApiResponse<{ category: Category }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  createCategory: async (token: string, categoryData: Partial<Category> | FormData): Promise<ApiResponse<{ category: Category }>> => {
    const isFormData = categoryData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${token}` },
      body: isFormData ? categoryData : JSON.stringify(categoryData),
    });
    return response.json();
  },

  updateCategory: async (token: string, categoryId: string, categoryData: Partial<Category> | FormData): Promise<ApiResponse<{ category: Category }>> => {
    const isFormData = categoryData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${token}` },
      body: isFormData ? categoryData : JSON.stringify(categoryData),
    });
    return response.json();
  },

  deleteCategory: async (token: string, categoryId: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Review Management APIs
  getReviews: async (token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
    isApproved?: boolean;
    isActive?: boolean;
  }): Promise<ApiResponse<{ reviews: Review[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/reviews?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getPendingReviews: async (token: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ reviews: Review[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/reviews/pending?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  approveReview: async (token: string, reviewId: string, notes?: string): Promise<ApiResponse<{ review: Review }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ notes }),
    });
    return response.json();
  },

  rejectReview: async (token: string, reviewId: string, notes?: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ notes }),
    });
    return response.json();
  },

  deleteReview: async (token: string, reviewId: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },


  // Locations Management APIs
  getLocations: async (token: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ locations: Location[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/locations?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  createLocation: async (token: string, locationData: Partial<Location>): Promise<ApiResponse<{ location: Location }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify(locationData),
    });
    return response.json();
  },

  updateLocation: async (token: string, locationId: string, locationData: Partial<Location>): Promise<ApiResponse<{ location: Location }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/locations/${locationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify(locationData),
    });
    return response.json();
  },

  deleteLocation: async (token: string, locationId: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/admin/locations/${locationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Settings Management APIs
  getSettings: async (token: string): Promise<ApiResponse<{ settings: Settings }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateSettings: async (token: string, settingsData: Partial<Settings>): Promise<ApiResponse<{ settings: Settings }>> => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify(settingsData),
    });
    return response.json();
  },

  // Activity Logs APIs
  getActivityLogs: async (token: string, params?: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    userId?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ logs: ActivityLog[]; pagination: any }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/activity-logs?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Reports & Export APIs
  exportData: async (token: string, params: {
    type: string;
    format?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ downloadUrl: string; type: string; format: string }>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/reports/export?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Newsletter endpoints
  getNewsletterSubscribers: async (
    token: string,
    params?: { page?: number; limit?: number; isActive?: boolean; search?: string }
  ): Promise<ApiResponse<{ subscribers: any[]; pagination: any }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.search) queryParams.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/newsletter/subscribers?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Failed to fetch newsletter subscribers',
      };
    }
  },

  getNewsletterStats: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Failed to fetch newsletter stats',
      };
    }
  },

  sendNewsletter: async (
    token: string,
    newsletterData: { subject: string; content: string; htmlContent?: string }
  ): Promise<ApiResponse<{ recipientCount: number }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newsletterData),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Failed to send newsletter',
      };
    }
  },

  deleteNewsletterSubscriber: async (token: string, subscriberId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/subscriber/${subscriberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Failed to delete subscriber',
      };
    }
  },
};

// Token management utilities
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_token', token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_token');
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_user', JSON.stringify(user));
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_user');
  },
};