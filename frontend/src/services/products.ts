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
  return response.data;
}

// ============================================
// Helper Functions for Quote-Based Products
// ============================================

/**
 * Check if a product requires a quote (no fixed price)
 */
export function isQuoteBased(product: Product): boolean {
  return product.is_quote_based === true;
}

/**
 * Check if a product has a fixed price (not quote-based)
 */
export function hasFixedPrice(product: Product): boolean {
  return !isQuoteBased(product);
}

/**
 * Check if product should show "Get Quote" button
 */
export function showGetQuote(product: Product): boolean {
  return isQuoteBased(product);
}

/**
 * Check if product should show "Buy Now" button
 */
export function showBuyNow(product: Product): boolean {
  return hasFixedPrice(product) && !!(product.price_monthly || product.price_annually || product.price_one_time);
}

/**
 * Get the display price for a product
 * Returns null for quote-based products
 */
export function getDisplayPrice(product: Product): { price: number; label: string } | null {
  if (isQuoteBased(product)) {
    return null;
  }

  // Priority: annual (divided by 12) > monthly > one-time
  if (product.price_annually) {
    return {
      price: Number(product.price_annually) / 12,
      label: '/month (billed annually)'
    };
  }

  if (product.price_monthly) {
    return {
      price: Number(product.price_monthly),
      label: '/month'
    };
  }

  if (product.price_one_time) {
    return {
      price: Number(product.price_one_time),
      label: ' (one-time)'
    };
  }

  return null;
}

/**
 * Get all available pricing options for a product
 */
export function getPricingOptions(product: Product): Array<{ key: string; price: number; label: string; perMonth?: number }> {
  if (isQuoteBased(product)) {
    return [];
  }

  const options: Array<{ key: string; price: number; label: string; perMonth?: number }> = [];

  if (product.price_monthly) {
    options.push({
      key: 'monthly',
      price: Number(product.price_monthly),
      label: 'Monthly'
    });
  }

  if (product.price_quarterly) {
    options.push({
      key: 'quarterly',
      price: Number(product.price_quarterly),
      label: 'Quarterly (3 months)',
      perMonth: Number(product.price_quarterly) / 3
    });
  }

  if (product.price_semi_annually) {
    options.push({
      key: 'semi_annually',
      price: Number(product.price_semi_annually),
      label: 'Semi-Annually (6 months)',
      perMonth: Number(product.price_semi_annually) / 6
    });
  }

  if (product.price_annually) {
    options.push({
      key: 'annually',
      price: Number(product.price_annually),
      label: 'Annually (12 months)',
      perMonth: Number(product.price_annually) / 12
    });
  }

  if (product.price_one_time && options.length === 0) {
    options.push({
      key: 'one_time',
      price: Number(product.price_one_time),
      label: 'One-time payment'
    });
  }

  return options;
}

/**
 * Get quote-based products only
 */
export async function getQuoteBasedProducts(): Promise<Product[]> {
  const allProducts = await productsApi.getAll({ is_active: true });
  return allProducts.filter(isQuoteBased);
}

/**
 * Get fixed-price products only
 */
export async function getFixedPriceProducts(): Promise<Product[]> {
  const allProducts = await productsApi.getAll({ is_active: true });
  return allProducts.filter(hasFixedPrice);
}

export default productsApi;

