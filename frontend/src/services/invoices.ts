import axios from '@/lib/axios';


export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  type: string;
  product?: { id: number; name: string };
  addon?: { id: number; name: string };
}

export interface Invoice {
  id: number;
  invoice_number: string;
  reference_number?: string;
  type: 'subscription' | 'one_time' | 'prorated' | 'credit_note' | 'setup_fee';
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'void' | 'refunded' | 'uncollectible';
  invoice_date: string;
  due_date: string;
  paid_at?: string;
  currency: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  tax_rate: number;
  setup_fee: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  notes?: string;
  internal_notes?: string;
  pdf_path?: string;
  user?: { id: number; name: string; email: string; phone?: string; company_name?: string };
  subscription?: { id: number; subscription_number: string; product?: { name: string } };
  items?: InvoiceItem[];
  payments?: any[];
  created_by?: { id: number; name: string };
  created_at: string;
}

export interface InvoiceAnalytics {
  summary: {
    total: number; draft: number; sent: number;
    paid: number; overdue: number; void: number;
  };
  revenue: {
    total_billed: number; total_paid: number; outstanding: number;
  };
  period: { from: string; to: string };
}

export const adminInvoicesApi = {
  // ── List ──────────────────────────────────────────────────────────────────
  getAll: async (params?: {
    status?: string; type?: string; search?: string;
    user_id?: number; from?: string; to?: string;
    page?: number; per_page?: number;
  }) => {
    const response = await axios.get('/admin/invoices', { params });
    return response.data;
  },

  // ── Single ────────────────────────────────────────────────────────────────
  get: async (id: number) => {
    const response = await axios.get(`/admin/invoices/${id}`);
    return response.data;
  },

  // ── Create ────────────────────────────────────────────────────────────────
  create: async (data: {
    user_id: number; type: string; due_date?: string; notes?: string;
    discount_amount?: number; tax_rate?: number;
    items: { description: string; quantity: number; unit_price: number; product_id?: number; type?: string }[];
  }) => {
    const response = await axios.post('/admin/invoices', data);
    return response.data;
  },

  // ── Update ────────────────────────────────────────────────────────────────
  update: async (id: number, data: {
    due_date?: string; notes?: string; internal_notes?: string;
    discount_amount?: number; tax_rate?: number;
  }) => {
    const response = await axios.put(`/admin/invoices/${id}`, data);
    return response.data;
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  send: async (id: number) => {
    const response = await axios.post(`/admin/invoices/${id}/send`);
    return response.data;
  },

  markPaid: async (id: number) => {
    const response = await axios.post(`/admin/invoices/${id}/mark-paid`);
    return response.data;
  },

  void: async (id: number, reason?: string) => {
    const response = await axios.post(`/admin/invoices/${id}/void`, { reason });
    return response.data;
  },

  download: async (id: number) => {
    const response = await axios.get(`/admin/invoices/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalytics: async (params?: { from?: string; to?: string }) => {
    const response = await axios.get('/admin/invoices/analytics', { params });
    return response.data;
  },
};

export default adminInvoicesApi;