import api from "@/lib/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  country: string | null;
  postal_code: string | null;
  customer_type: "individual" | "business";
  company_name: string | null;
  company_registration: string | null;
  tax_pin: string | null;
  status: "active" | "inactive" | "suspended" | "pending_verification";
  emerald_mbr_id: string | null;
  created_at: string;
  updated_at: string;
  roles: Array<{ id: number; name: string }>;
}

export interface UserStatistics {
  total: number;
  active: number;
  clients: number;
  staff: number;
  admins: number;
  individuals: number;
  businesses: number;
  verified: number;
}

export interface UserFilters {
  search?: string;
  status?: string;
  customer_type?: string;
  role?: string;
  roles?: ("staff" | "sales" | "technical_support" | "admin" | "client")[];
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** Fields the authenticated user may update on their own profile. */
export interface ProfileUpdatePayload {
  name?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  county?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

export const usersApi = {
  // ── Own profile ────────────────────────────────────────────────────────────

  /**
   * Fetch the currently authenticated user's full profile.
   * GET /v1/auth/user
   */
  getCurrent: (): Promise<{ data: User }> => {
    return api.get("/auth/user");
  },

  /**
   * Update the currently authenticated user's own profile.
   * PUT /v1/auth/user  →  UserController@updateCurrent
   *
   * Permitted fields: name, phone, address, city, county, country, postal_code
   */
  updateCurrent: (data: ProfileUpdatePayload): Promise<{ data: User }> => {
    return api.put("/auth/user", data);
  },

  // ── Admin / Staff management ───────────────────────────────────────────────

  list: (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
    return api.get("/users", { params: filters });
  },

  statistics: (): Promise<{ data: UserStatistics }> => {
    return api.get("/users/statistics");
  },

  get: (id: number): Promise<{ data: User }> => {
    return api.get(`/users/${id}`);
  },

  create: (
    data: Partial<User> & { password: string; role: string }
  ): Promise<{ data: User }> => {
    return api.post("/users", data);
  },

  update: (id: number, data: Partial<User>): Promise<{ data: User }> => {
    return api.put(`/users/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return api.delete(`/users/${id}`);
  },

  suspend: (id: number, reason: string): Promise<{ data: User }> => {
    return api.post(`/users/${id}/suspend`, { reason });
  },

  activate: (id: number): Promise<{ data: User }> => {
    return api.post(`/users/${id}/activate`);
  },

  provisionEmerald: (
    id: number,
    product_id: number
  ): Promise<{ data: User; customer_id: string; account_id: string }> => {
    return api.post(`/users/${id}/provision-emerald`, { product_id });
  },

  impersonate: (
    id: number
  ): Promise<{ data: { token: string; user: User; impersonator_id: number } }> => {
    return api.post(`/users/${id}/impersonate`);
  },

  stopImpersonating: (): Promise<{ data: { token: string; user: User } }> => {
    return api.post("/users/stop-impersonating");
  },

  roles: (): Promise<{ data: Array<{ id: number; name: string }> }> => {
    return api.get("/users/roles");
  },
};