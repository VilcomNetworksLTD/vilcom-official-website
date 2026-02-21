import api from '@/lib/axios';

export interface Media {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  alt_text: string;
  caption: string;
  folder: string;
  usage_count: number;
  created_by: number;
  created_at: string;
}

export interface MediaResponse {
  success: boolean;
  data: Media[];
}

export interface MediaSingleResponse {
  success: boolean;
  data: Media;
}

export const mediaService = {
  // Get all media files
  getAll: async (params?: { folder?: string; search?: string; type?: string; page?: number }) => {
    const response = await api.get<MediaResponse>('/media', { params });
    return response.data;
  },

  // Get all folders
  getFolders: async () => {
    const response = await api.get<{ success: boolean; data: string[] }>('/media/folders');
    return response.data;
  },

  // Upload media
  upload: async (formData: FormData) => {
    const response = await api.post<MediaSingleResponse>('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get single media
  getById: async (id: number) => {
    const response = await api.get<MediaSingleResponse>(`/media/${id}`);
    return response.data;
  },

  // Update media metadata
  update: async (id: number, data: { alt_text?: string; caption?: string; folder?: string }) => {
    const response = await api.put<MediaSingleResponse>(`/media/${id}`, data);
    return response.data;
  },

  // Delete media
  delete: async (id: number) => {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (ids: number[]) => {
    const response = await api.post('/media/bulk-delete', { ids });
    return response.data;
  },

  // Create folder
  createFolder: async (name: string) => {
    const response = await api.post('/media/folders', { name });
    return response.data;
  },

  // Delete folder
  deleteFolder: async (name: string) => {
    const response = await api.delete('/media/folders', { data: { name } });
    return response.data;
  },

  // Get public media
  getPublic: async (params?: { page?: number }) => {
    const response = await api.get<MediaResponse>('/media/public', { params });
    return response.data;
  },
};

