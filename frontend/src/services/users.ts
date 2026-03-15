import api from "@/lib/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  customer_type: "individual" | "business";
  company_name: string | null;
  status: "active" | "inactive" | "suspended";
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
  role?: string;                                        // single role (legacy)
  roles?: ('staff' | 'sales' | 'technical_support' | 'admin' | 'client')[]; // multi-role
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const usersApi = {
  list: (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
    // axios serialises arrays as roles[]=staff&roles[]=sales which Laravel reads as $request->roles
    return api.get("/users", { params: filters });
  },

  statistics: (): Promise<{ data: UserStatistics }> => {
    return api.get("/users/statistics");
  },

  get: (id: number): Promise<{ data: User }> => {
    return api.get(`/users/${id}`);
  },

  create: (data: Partial<User> & { password: string; role: string }): Promise<{ data: User }> => {
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
};