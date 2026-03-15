import axios from '@/lib/axios';



export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;
  data: ContactMessage;
}

export interface Department {
  value: string;
  label: string;
}

export const contactService = {
  // ── Public ────────────────────────────────────────────────────────────────

  async sendMessage(data: ContactMessage): Promise<ContactMessageResponse> {
    const response = await axios.post('/contact/messages', data);
    return response.data;
  },

  async getDepartments(): Promise<{ data: Department[] }> {
    const response = await axios.get('/contact/departments');
    return response.data;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  async getAdminMessages(params?: {
    status?: string;
    department?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) {
    const response = await axios.get('/admin/contact/messages', { params });
    return response.data;
  },

  async getAdminMessage(id: number) {
    const response = await axios.get(`/admin/contact/messages/${id}`);
    return response.data;
  },

  async updateAdminMessage(id: number, data: {
    status?: string;
    admin_notes?: string;
    assigned_staff_id?: number;
  }) {
    const response = await axios.put(`/admin/contact/messages/${id}`, data);
    return response.data;
  },

  async markContacted(id: number) {
    const response = await axios.post(`/admin/contact/messages/${id}/contacted`);
    return response.data;
  },

  async markResolved(id: number) {
    const response = await axios.post(`/admin/contact/messages/${id}/resolved`);
    return response.data;
  },

  async deleteMessage(id: number) {
    const response = await axios.delete(`/admin/contact/messages/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await axios.get('/admin/contact/messages/statistics');
    return response.data;
  },

  async getStaff() {
    const response = await axios.get('/admin/contact/messages/staff');
    return response.data;
  },
};

export default contactService;