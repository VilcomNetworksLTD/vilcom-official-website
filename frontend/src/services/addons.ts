import api from "@/lib/axios";
import type { Addon, ApiResponse } from "./api";

const BASE_URL = "/addons";

// ============================================
// Addons API
// ============================================
export const addonsApi = {
  // Get all addons
  async getAll(params?: Record<string, unknown>): Promise<Addon[]> {
    const response = await api.get<ApiResponse<Addon[]>>(BASE_URL, { params });
    return response.data.data;
  },

  // Get single addon
  async get(slug: string): Promise<Addon> {
    const response = await api.get<ApiResponse<Addon>>(`${BASE_URL}/${slug}`);
    return response.data.data;
  },

  // Get addons for a product
  async getForProduct(productId: number): Promise<Addon[]> {
    const response = await api.get<ApiResponse<Addon[]>>(`${BASE_URL}/product/${productId}`);
    return response.data.data;
  },
};

export default addonsApi;

