import api from "@/lib/axios";
import type { Category, ApiResponse } from "./api";

const BASE_URL = "/categories";

// ============================================
// Categories API
// ============================================
export const categoriesApi = {
  // Get all categories
  async getAll(params?: Record<string, unknown>): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>(BASE_URL, { params });
    return response.data.data;
  },

  // Get category tree
  async getTree(type?: string): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>(`${BASE_URL}/tree`, {
      params: type ? { type } : undefined,
    });
    return response.data.data;
  },

  // Get single category
  async get(slug: string): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(`${BASE_URL}/${slug}`);
    return response.data.data;
  },

  // Get products in category
  async getProducts(
    slug: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Category>> {
    const response = await api.get<ApiResponse<Category>>(`${BASE_URL}/${slug}/products`, { params });
    return response.data;
  },
};

export default categoriesApi;

