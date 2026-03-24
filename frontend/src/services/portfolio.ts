import api from '@/lib/axios';
import type { Media } from '@/services/media';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PortfolioProject {
  id: number;
  media_id: number | null;
  media?: Media;
  title: string;
  category: string;
  location: string | null;
  description: string | null;
  stats_value: string | null;
  stats_label: string | null;
  sort_order: number;
  is_published: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioListResponse {
  success: boolean;
  data: {
    data: PortfolioProject[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PortfolioPayload {
  media_id?: number | null;
  title: string;
  category: string;
  location?: string | null;
  description?: string | null;
  stats_value?: string | null;
  stats_label?: string | null;
  sort_order?: number;
  is_published?: boolean;
}

export interface ReorderPayload {
  items: { id: number; order: number }[];
}

// ── Public service (no auth) ───────────────────────────────────────────────

export const portfolioService = {
  getAll: async (params?: { category?: string; page?: number; per_page?: number }): Promise<PortfolioProject[]> => {
    // Note: Our API controller index returns the paginated data directly or inside data wrap 
    // depending on the resource but $projects returns { data: [...] } for paginator
    const response = await api.get('/portfolio', { params });
    // Normalize response for frontend depending on backend pagination
    return response.data?.data || response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/portfolio/categories');
    return response.data?.data || response.data;
  },
};

// ── Admin service (requires auth) ──────────────────────────────────────────

export const portfolioAdminService = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PortfolioListResponse> => {
    const response = await api.get<PortfolioListResponse>('/admin/portfolio', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/admin/portfolio/${id}`);
    return response.data;
  },

  create: async (data: PortfolioPayload) => {
    const response = await api.post('/admin/portfolio', data);
    return response.data;
  },

  update: async (id: number, data: Partial<PortfolioPayload>) => {
    const response = await api.put(`/admin/portfolio/${id}`, data);
    return response.data;
  },

  destroy: async (id: number) => {
    const response = await api.delete(`/admin/portfolio/${id}`);
    return response.data;
  },

  togglePublish: async (id: number) => {
    const response = await api.post(`/admin/portfolio/${id}/toggle-publish`);
    return response.data;
  },

  reorder: async (payload: ReorderPayload) => {
    const response = await api.post('/admin/portfolio/reorder', payload);
    return response.data;
  },
};
