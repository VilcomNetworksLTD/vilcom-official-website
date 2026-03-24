import api from '@/lib/axios';
import type { Media } from '@/services/media';

// ── Types ──────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: number;
  media_id: number;
  media: Media;
  title: string;
  category: string;
  location: string | null;
  sort_order: number;
  is_published: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryListResponse {
  success: boolean;
  data: {
    data: GalleryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface GalleryItemPayload {
  media_id: number;
  title: string;
  category: string;
  location?: string;
  sort_order?: number;
  is_published?: boolean;
}

export interface ReorderPayload {
  items: { id: number; sort_order: number }[];
}

// ── Public service (no auth) ───────────────────────────────────────────────

export const galleryService = {
  /**
   * Fetch published gallery items — used by the public Gallery page.
   */
  getAll: async (params?: { category?: string; page?: number; per_page?: number }): Promise<GalleryListResponse> => {
    const response = await api.get<GalleryListResponse>('/gallery', { params });
    return response.data;
  },

  /**
   * Fetch distinct categories.
   */
  getCategories: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/gallery/categories');
    return response.data;
  },
};

// ── Admin service (requires auth) ──────────────────────────────────────────

export const galleryAdminService = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<GalleryListResponse> => {
    const response = await api.get<GalleryListResponse>('/admin/gallery', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/admin/gallery/${id}`);
    return response.data;
  },

  /**
   * Promote a media file into the gallery.
   */
  create: async (data: GalleryItemPayload) => {
    const response = await api.post('/admin/gallery', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Omit<GalleryItemPayload, 'media_id'>>) => {
    const response = await api.put(`/admin/gallery/${id}`, data);
    return response.data;
  },

  destroy: async (id: number) => {
    const response = await api.delete(`/admin/gallery/${id}`);
    return response.data;
  },

  togglePublish: async (id: number) => {
    const response = await api.post(`/admin/gallery/${id}/toggle-publish`);
    return response.data;
  },

  reorder: async (payload: ReorderPayload) => {
    const response = await api.post('/admin/gallery/reorder', payload);
    return response.data;
  },
};