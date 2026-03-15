import axios from '@/lib/axios';



export interface TicketReply {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_internal: boolean;
  user?: { id: number; name: string };
  created_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  user?: { id: number; name: string; email: string; phone?: string };
  assigned_to?: number;
  assignedTo?: { id: number; name: string };
  replies?: TicketReply[];
  replies_count?: number;
  resolved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

// ── Client API ────────────────────────────────────────────────────────────────
export const ticketsApi = {
  getAll: async (params?: { status?: string; priority?: string; search?: string; page?: number; per_page?: number }) => {
    const response = await axios.get('/tickets', { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await axios.get(`/tickets/${id}`);
    return response.data;
  },

  create: async (data: { title: string; description: string; priority?: string; category?: string }) => {
    const response = await axios.post('/tickets', data);
    return response.data;
  },

  update: async (id: number, data: { title?: string; description?: string; priority?: string }) => {
    const response = await axios.put(`/tickets/${id}`, data);
    return response.data;
  },

  reply: async (id: number, message: string) => {
    const response = await axios.post(`/tickets/${id}/reply`, { message });
    return response.data;
  },
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminTicketsApi = {
  getAll: async (params?: {
    status?: string; priority?: string; assigned_to?: number;
    category?: string; search?: string; page?: number; per_page?: number;
  }) => {
    const response = await axios.get('/admin/tickets', { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await axios.get(`/admin/tickets/${id}`);
    return response.data;
  },

  assign: async (id: number, assigned_to: number) => {
    const response = await axios.post(`/tickets/${id}/assign`, { assigned_to });
    return response.data;
  },

  resolve: async (id: number) => {
    const response = await axios.post(`/tickets/${id}/resolve`);
    return response.data;
  },

  close: async (id: number) => {
    const response = await axios.post(`/tickets/${id}/close`);
    return response.data;
  },

  reopen: async (id: number) => {
    const response = await axios.post(`/tickets/${id}/reopen`);
    return response.data;
  },

  reply: async (id: number, message: string) => {
    const response = await axios.post(`/tickets/${id}/reply`, { message });
    return response.data;
  },

  addInternalNote: async (id: number, note: string) => {
    const response = await axios.post(`/tickets/${id}/internal-note`, { note });
    return response.data;
  },

  getStaff: async () => {
    const response = await axios.get('/admin/tickets/staff');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axios.get('/admin/tickets/analytics');
    return response.data;
  },
};

export default ticketsApi;