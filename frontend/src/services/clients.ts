import api from "@/lib/axios";

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  customer_type: "individual" | "business";
  company_name: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
  // Emerald provisioning fields
  emerald_approval_status: "none" | "pending" | "approved" | "rejected";
  emerald_pending_product_id: number | null;
  emerald_mbr_id: string | null;
  emerald_approval_notes: string | null;
  emerald_approval_reviewed_at: string | null;
  pending_product?: {
    id: number;
    name: string;
    price_monthly: number;
    slug: string;
  };
  subscriptions?: Subscription[];
  invoices?: Invoice[];
}

export interface Subscription {
  id: number;
  product_id: number;
  billing_cycle: string;
  status: string;
  price: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  total_amount: number;
  status: string;
  due_date: string;
}

export interface ClientStatistics {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  suspended_clients: number;
  individual_clients: number;
  business_clients: number;
  new_clients_this_month: number;
}

export interface ClientFilters {
  search?: string;
  status?: string;
  customer_type?: string;
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

export interface ProductOption {
  id: number;
  name: string;
  price_monthly: number | null;
  slug: string;
  type: string;
}

export interface PushToEmeraldPayload {
  product_id: number;
  account_type?: string;
  service_category?: string;
  customer_type?: string;
  sales_person?: string;
  notes?: string;
}

export const clientsApi = {
  list: (filters: ClientFilters = {}): Promise<any> => {
    return api.get("/admin/clients", { params: filters });
  },

  get: (id: number): Promise<{ data: Client }> => {
    return api.get(`/admin/clients/${id}`);
  },

  create: (data: Partial<Client> & { password: string, auto_verify?: boolean, send_welcome?: boolean }): Promise<{ data: Client }> => {
    return api.post("/admin/clients", data);
  },

  update: (id: number, data: Partial<Client>): Promise<{ data: Client }> => {
    return api.put(`/admin/clients/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return api.delete(`/admin/clients/${id}`);
  },

  suspend: (id: number, reason: string): Promise<{ data: Client }> => {
    return api.post(`/admin/clients/${id}/suspend`, { reason });
  },

  activate: (id: number): Promise<{ data: Client }> => {
    return api.post(`/admin/clients/${id}/activate`);
  },

  statistics: (): Promise<{ data: ClientStatistics }> => {
    return api.get("/admin/clients/statistics");
  },

  /** Push an existing client to Emerald Provision (with optional immediate provisioning) */
  pushToEmerald: (id: number, payload: PushToEmeraldPayload): Promise<any> => {
    return api.post(`/admin/clients/${id}/push-to-emerald`, payload);
  },

  /** Fetch active products for Emerald provisioning assignment */
  listProducts: (): Promise<ProductOption[]> => {
    return api
      .get("/products", { params: { is_active: 1, per_page: 100 } })
      .then((res: any) => {
        const raw = res.data?.data ?? res.data ?? [];
        return raw.map((p: any) => ({
          id: p.id,
          name: p.name,
          price_monthly: p.price_monthly ? parseFloat(p.price_monthly) : null,
          slug: p.slug,
          type: p.type,
        }));
      });
  },
};
