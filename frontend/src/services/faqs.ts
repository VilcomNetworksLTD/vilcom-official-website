import api from '@/lib/axios';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category_id: number | null;
  category?: FaqCategory;
  order: number;
  is_active: boolean;
  views: number;
  created_by: number;
  created_at: string;
}

export interface FaqCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  faqs_count?: number;
}

export interface FaqResponse {
  success: boolean;
  data: Faq[];
}

export interface FaqSingleResponse {
  success: boolean;
  data: Faq;
}

export interface FaqCategoryResponse {
  success: boolean;
  data: FaqCategory[];
}

export interface FaqStats {
  total_faqs: number;
  active_faqs: number;
  inactive_faqs: number;
  total_views: number;
  total_categories: number;
}

export const faqService = {
  // Get all FAQs (admin)
  getAll: async (params?: { category_id?: number; status?: string; search?: string; page?: number }) => {
    const response = await api.get<FaqResponse>('/faqs/admin', { params });
    return response.data;
  },

  // Get public FAQs (active)
  getPublic: async (params?: { category_id?: number; search?: string }) => {
    const response = await api.get<FaqResponse>('/faqs', { params });
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get<FaqCategoryResponse>('/faqs/categories');
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get<{ success: boolean; data: FaqStats }>('/faqs/statistics');
    return response.data;
  },

  // Create FAQ
  create: async (data: { question: string; answer: string; category_id?: number; order?: number; is_active?: boolean }) => {
    const response = await api.post<FaqSingleResponse>('/faqs', data);
    return response.data;
  },

  // Get single FAQ
  getById: async (id: number) => {
    const response = await api.get<FaqSingleResponse>(`/faqs/${id}`);
    return response.data;
  },

  // Update FAQ
  update: async (id: number, data: { question?: string; answer?: string; category_id?: number; order?: number; is_active?: boolean }) => {
    const response = await api.put<FaqSingleResponse>(`/faqs/${id}`, data);
    return response.data;
  },

  // Delete FAQ
  delete: async (id: number) => {
    const response = await api.delete(`/faqs/${id}`);
    return response.data;
  },

  // Toggle status
  toggleStatus: async (id: number) => {
    const response = await api.post<FaqSingleResponse>(`/faqs/${id}/toggle`);
    return response.data;
  },

  // Record view
  recordView: async (id: number) => {
    const response = await api.post<FaqSingleResponse>(`/faqs/${id}/view`);
    return response.data;
  },

  // Reorder FAQs
  reorder: async (faqs: { id: number; order: number }[]) => {
    const response = await api.post('/faqs/reorder', { faqs });
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (ids: number[]) => {
    const response = await api.post('/faqs/bulk-delete', { ids });
    return response.data;
  },

  // Create category
  createCategory: async (data: { name: string; description?: string; order?: number }) => {
    const response = await api.post<{ success: boolean; data: FaqCategory }>('/faqs/categories', data);
    return response.data;
  },

  // Update category
  updateCategory: async (id: number, data: { name?: string; description?: string; order?: number }) => {
    const response = await api.put<{ success: boolean; data: FaqCategory }>(`/faqs/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: number) => {
    const response = await api.delete(`/faqs/categories/${id}`);
    return response.data;
  },
};

