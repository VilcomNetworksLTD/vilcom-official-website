import api from '@/lib/axios';

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  target_logged_in: boolean;
  target_guests: boolean;
  target_roles: string[];
  cta_text: string;
  cta_url: string;
  order: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
}

export interface BannerResponse {
  success: boolean;
  data: Banner[];
}

export interface BannerSingleResponse {
  success: boolean;
  data: Banner;
}

export const bannerService = {
  // Get all banners (admin)
  getAll: async (params?: { position?: string; status?: string; search?: string; page?: number }) => {
    const response = await api.get<BannerResponse>('/banners', { params });
    return response.data;
  },

  // Get active banners for public
  getActive: async (position?: string) => {
    const response = await api.get<BannerResponse>('/banners/active', { 
      params: { position } 
    });
    return response.data;
  },

  // Get positions
  getPositions: async () => {
    const response = await api.get<{ success: boolean; data: Record<string, string> }>('/banners/positions');
    return response.data;
  },

  // Create banner
  create: async (formData: FormData) => {
    const response = await api.post<BannerSingleResponse>('/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get single banner
  getById: async (id: number) => {
    const response = await api.get<BannerSingleResponse>(`/banners/${id}`);
    return response.data;
  },

  // Update banner
  update: async (id: number, formData: FormData) => {
    const response = await api.put<BannerSingleResponse>(`/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete banner
  delete: async (id: number) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  },

  // Toggle status
  toggleStatus: async (id: number) => {
    const response = await api.post<BannerSingleResponse>(`/banners/${id}/toggle`);
    return response.data;
  },

  // Reorder banners
  reorder: async (banners: { id: number; order: number }[]) => {
    const response = await api.post('/banners/reorder', { banners });
    return response.data;
  },

  // Duplicate banner
  duplicate: async (id: number) => {
    const response = await api.post<BannerSingleResponse>(`/banners/${id}/duplicate`);
    return response.data;
  },
};

