// Test Data Utility for Development
// This file helps switch between test data and API data when server is offline

import testCategories from '../data/testCategories.json';
import testProducts from '../data/testProducts.json';

// Configuration flag - set to true when server is offline
export const USE_TEST_DATA = false; // Change this to false when server is working

// Test Data Types
export interface TestCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentCategory: string | null;
  subcategories: string[];
  isActive: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  brand: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  features: string[];
  ingredients: string[];
  howToUse?: string;
  skinType: string[];
  benefits: string[];
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

// API Response Types (when server is working)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Utility Functions
export const getTestCategories = (): TestCategory[] => {
  return testCategories as TestCategory[];
};

export const getTestProducts = (): TestProduct[] => {
  return testProducts as TestProduct[];
};

export const getTestProductById = (id: string): TestProduct | undefined => {
  return testProducts.find(product => product._id === id) as TestProduct;
};

export const getTestProductsByCategory = (category: string): TestProduct[] => {
  return testProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  ) as TestProduct[];
};

export const getTestFeaturedProducts = (): TestProduct[] => {
  return testProducts.filter(product => product.isFeatured) as TestProduct[];
};

// Mock API delay to simulate real API behavior
export const mockApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Simulated API responses
export const simulateApiResponse = async <T>(data: T, delay: number = 500): Promise<ApiResponse<T>> => {
  await mockApiDelay(delay);
  return {
    success: true,
    data,
    message: 'Success'
  };
};

// Usage Examples:
/*
// In your components, you can use this pattern:

import { USE_TEST_DATA, getTestCategories, getTestProducts, simulateApiResponse } from '@/utils/testData';

// Fetch categories
const fetchCategories = async () => {
  if (USE_TEST_DATA) {
    const categories = getTestCategories();
    return await simulateApiResponse(categories);
  } else {
    // Use real API
    const response = await fetch('/api/categories');
    return await response.json();
  }
};

// Fetch products
const fetchProducts = async () => {
  if (USE_TEST_DATA) {
    const products = getTestProducts();
    return await simulateApiResponse(products);
  } else {
    // Use real API
    const response = await fetch('/api/products');
    return await response.json();
  }
};
*/

export default {
  USE_TEST_DATA,
  getTestCategories,
  getTestProducts,
  getTestProductById,
  getTestProductsByCategory,
  getTestFeaturedProducts,
  mockApiDelay,
  simulateApiResponse
};


