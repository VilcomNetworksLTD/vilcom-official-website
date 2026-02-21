import api from '@/lib/axios';

export interface Testimonial {
  id: number;
  name: string;
  company: string | null;
  avatar: string | null;
  content: string;
  rating: number;
  is_approved: boolean;
  is_featured: boolean;
  created_by: number;
  created_at: string;
}

export interface TestimonialResponse {
  success: boolean;
  data: Testimonial[];
}

export interface TestimonialSingleResponse {
  success: boolean;
  data: Testimonial;
}

export interface TestimonialStats {
  total: number;
  approved: number;
  pending: number;
  featured: number;
  average_rating: number;
}

export const testimonialService = {
  // Get all testimonials (admin)
  getAll: async (params?: { status?: string; featured?: boolean; search?: string; page?: number }) => {
    const response = await api.get<TestimonialResponse>('/testimonials/admin', { params });
    return response.data;
  },

  // Get public testimonials (approved)
  getPublic: async () => {
    const response = await api.get<TestimonialResponse>('/testimonials');
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get<{ success: boolean; data: TestimonialStats }>('/testimonials/statistics');
    return response.data;
  },

  // Create testimonial
  create: async (formData: FormData) => {
    const response = await api.post<TestimonialSingleResponse>('/testimonials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get single testimonial
  getById: async (id: number) => {
    const response = await api.get<TestimonialSingleResponse>(`/testimonials/${id}`);
    return response.data;
  },

  // Update testimonial
  update: async (id: number, formData: FormData) => {
    const response = await api.put<TestimonialSingleResponse>(`/testimonials/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete testimonial
  delete: async (id: number) => {
    const response = await api.delete(`/testimonials/${id}`);
    return response.data;
  },

  // Approve testimonial
  approve: async (id: number) => {
    const response = await api.post<TestimonialSingleResponse>(`/testimonials/${id}/approve`);
    return response.data;
  },

  // Reject testimonial
  reject: async (id: number) => {
    const response = await api.post<TestimonialSingleResponse>(`/testimonials/${id}/reject`);
    return response.data;
  },

  // Toggle featured
  toggleFeatured: async (id: number) => {
    const response = await api.post<TestimonialSingleResponse>(`/testimonials/${id}/featured`);
    return response.data;
  },

  // Bulk approve
  bulkApprove: async (ids: number[]) => {
    const response = await api.post('/testimonials/bulk-approve', { ids });
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (ids: number[]) => {
    const response = await api.post('/testimonials/bulk-delete', { ids });
    return response.data;
  },
};

