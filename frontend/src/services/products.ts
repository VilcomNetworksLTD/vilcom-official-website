import api from "@/lib/axios";
import type { Product, ApiResponse } from "./api";

const BASE_URL = "/products";

// Re-export Product type for backward compatibility
export type { Product, ApiResponse } from "./api";

// ============================================
// Products API
// ============================================
export const productsApi = {
  // Get all products
  async getAll(params?: Record<string, unknown>): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(BASE_URL, { params });
    return response.data.data;
  },

  // Get featured products
  async getFeatured(limit: number = 6): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(`${BASE_URL}/featured`, {
      params: { limit },
    });
    return response.data.data;
  },

  // Get promotional products
  async getOnPromotion(params?: Record<string, unknown>): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(`${BASE_URL}/on-promotion`, { params });
    return response.data.data;
  },

  // Get products by category
  async getByCategory(
    categorySlug: string,
    params?: Record<string, unknown>
  ): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(`${BASE_URL}/category/${categorySlug}`, { params });
    return response.data.data;
  },

  // Get single product
  async get(slug: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`${BASE_URL}/${slug}`);
    return response.data.data;
  },

  // Check availability
  async checkAvailability(
    slug: string,
    area: string
  ): Promise<{
    available: boolean;
    coverage_available: boolean;
    has_capacity: boolean;
    in_stock: boolean;
    message: string;
  }> {
    const response = await api.post<ApiResponse<{
      available: boolean;
      coverage_available: boolean;
      has_capacity: boolean;
      in_stock: boolean;
      message: string;
    }>>(`${BASE_URL}/${slug}/availability`, { area });
    return response.data.data;
  },

  // Get related products
  async getRelated(slug: string): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(`${BASE_URL}/${slug}/related`);
    return response.data.data;
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get internet plans (type: internet_plan) from the API
 * @param planCategory - Optional filter: 'home' or 'business'
 */
export async function getInternetPlans(planCategory?: "home" | "business"): Promise<Product[]> {
  const params: Record<string, unknown> = {
    type: "internet_plan",
    is_active: true,
    per_page: "all",
  };

  if (planCategory) {
    params.plan_category = planCategory;
  }

  const response = await productsApi.getAll(params);
  return response;
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const response = await productsApi.getFeatured(limit);
  return response;
}

/**
 * Get products by category slug
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const response = await productsApi.getByCategory(categorySlug);
  return response;
}

/**
 * Get product with details
 */
export async function getProductDetails(slug: string): Promise<Product> {
  const response = await productsApi.get(slug);
  return response;
}

export default productsApi;

