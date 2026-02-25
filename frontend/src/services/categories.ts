import api from "@/lib/axios";
import type { Category, ApiResponse } from "./api";

const BASE_URL = "/categories";

// ============================================
// Categories API
// ============================================
export const categoriesApi = {
  // Get all categories
  async getAll(params?: Record<string, unknown>): Promise<Category[]> {
    // Note: API returns paginated data differently depending on params
    // When per_page != 'all': returns { data: { data: [...], pagination: {...} }, meta: {...} }
    // When per_page = 'all': returns { data: [...], ... }
    const response = await api.get(BASE_URL, { params });
    const rawData = response.data.data;
    // Handle both paginated and non-paginated responses
    if (Array.isArray(rawData)) {
      return rawData;
    }
    // Paginated response - extract data from the inner object
    return rawData?.data || [];
  },

  // Get category tree
  async getTree(type?: string): Promise<Category[]> {
    const response = await api.get(`${BASE_URL}/tree`, {
      params: type ? { type } : undefined,
    });
    return response.data.data;
  },

  // Get single category
  async get(slug: string): Promise<Category> {
    const response = await api.get(`${BASE_URL}/${slug}`);
    return response.data.data;
  },

  // Get products in category
  async getProducts(
    slug: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Category>> {
    const response = await api.get(`${BASE_URL}/${slug}/products`, { params });
    return response.data;
  },
};

export default categoriesApi;

