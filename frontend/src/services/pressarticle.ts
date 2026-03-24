import api from '@/lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export type ArticleType = 'press' | 'blog';

export interface PressArticle {
  id: number;
  title: string;
  excerpt: string | null;
  source_name: string;
  source_url: string | null;
  article_url: string | null;
  category: string;
  type: ArticleType;              // ← new
  thumbnail_url: string | null;
  thumbnail_media_id: number | null;
  thumbnail: string | null;       // resolved by backend accessor
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PressArticleListResponse {
  success: boolean;
  data: {
    data: PressArticle[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PressArticleSingleResponse {
  success: boolean;
  data: PressArticle;
}

export interface PressArticleFilters {
  type?: ArticleType;             // ← new
  category?: string;
  search?: string;
  is_published?: boolean;
  per_page?: number;
  page?: number;
}

export interface PressArticlePayload {
  title: string;
  excerpt?: string;
  source_name: string;
  source_url?: string;
  article_url?: string;
  category: string;
  type: ArticleType;              // ← new (required on create)
  thumbnail_url?: string;
  thumbnail_media_id?: number | null;
  is_featured?: boolean;
  is_published?: boolean;
  published_at?: string | null;
}

// ── Public service (no auth) ───────────────────────────────────────────────

export const pressArticleService = {
  /**
   * Fetch published articles.
   * Pass type: 'press' for Media.tsx, type: 'blog' for Blog.tsx.
   */
  getAll: async (filters?: PressArticleFilters): Promise<PressArticleListResponse> => {
    const response = await api.get<PressArticleListResponse>('/press-articles', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Fetch the featured article for a given type.
   * Pass type: 'press' or type: 'blog'.
   */
  getFeatured: async (type?: ArticleType): Promise<PressArticleSingleResponse> => {
    const response = await api.get<PressArticleSingleResponse>('/press-articles/featured', {
      params: type ? { type } : undefined,
    });
    return response.data;
  },

  /**
   * Fetch distinct category list, optionally scoped to a type.
   */
  getCategories: async (type?: ArticleType): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/press-articles/categories', {
      params: type ? { type } : undefined,
    });
    return response.data;
  },
};

// ── Admin service (requires auth) ──────────────────────────────────────────

export const pressArticleAdminService = {
  getAll: async (filters?: PressArticleFilters): Promise<PressArticleListResponse> => {
    const response = await api.get<PressArticleListResponse>('/admin/press-articles', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: number): Promise<PressArticleSingleResponse> => {
    const response = await api.get<PressArticleSingleResponse>(`/admin/press-articles/${id}`);
    return response.data;
  },

  create: async (data: PressArticlePayload): Promise<PressArticleSingleResponse> => {
    const response = await api.post<PressArticleSingleResponse>('/admin/press-articles', data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<PressArticlePayload>,
  ): Promise<PressArticleSingleResponse> => {
    const response = await api.put<PressArticleSingleResponse>(
      `/admin/press-articles/${id}`,
      data,
    );
    return response.data;
  },

  destroy: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/admin/press-articles/${id}`);
    return response.data;
  },

  togglePublish: async (id: number): Promise<PressArticleSingleResponse> => {
    const response = await api.post<PressArticleSingleResponse>(
      `/admin/press-articles/${id}/toggle-publish`,
    );
    return response.data;
  },

  toggleFeatured: async (id: number): Promise<PressArticleSingleResponse> => {
    const response = await api.post<PressArticleSingleResponse>(
      `/admin/press-articles/${id}/toggle-featured`,
    );
    return response.data;
  },
};