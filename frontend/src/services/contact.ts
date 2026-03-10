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
  /**
   * Submit a contact form message (public endpoint)
   */
  async sendMessage(data: ContactMessage): Promise<ContactMessageResponse> {
    const response = await axios.post('/api/v1/contact/messages', data);
    return response.data;
  },

  /**
   * Get available departments
   */
  async getDepartments(): Promise<{ data: Department[] }> {
    const response = await axios.get('/api/v1/contact/departments');
    return response.data;
  },

  /**
   * Admin: Get all contact messages
   */
  async getAdminMessages(params?: {
    status?: string;
    department?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) {
    const response = await axios.get('/api/v1/admin/contact/messages', { params });
    return response.data;
  },

  /**
   * Admin: Get single message
   */
  async getAdminMessage(id: number) {
    const response = await axios.get(`/api/v1/admin/contact/messages/${id}`);
    return response.data;
  },

  /**
   * Admin: Update message
   */
  async updateAdminMessage(id: number, data: {
    status?: string;
    admin_notes?: string;
    assigned_staff_id?: number;
  }) {
    const response = await axios.put(`/api/v1/admin/contact/messages/${id}`, data);
    return response.data;
  },

  /**
   * Admin: Mark as contacted
   */
  async markContacted(id: number) {
    const response = await axios.post(`/api/v1/admin/contact/messages/${id}/contacted`);
    return response.data;
  },

  /**
   * Admin: Mark as resolved
   */
  async markResolved(id: number) {
    const response = await axios.post(`/api/v1/admin/contact/messages/${id}/resolved`);
    return response.data;
  },

  /**
   * Admin: Delete message
   */
  async deleteMessage(id: number) {
    const response = await axios.delete(`/api/v1/admin/contact/messages/${id}`);
    return response.data;
  },

  /**
   * Admin: Get statistics
   */
  async getStatistics() {
    const response = await axios.get('/api/v1/admin/contact/messages/statistics');
    return response.data;
  },

  /**
   * Admin: Get available staff for assignment
   */
  async getStaff() {
    const response = await axios.get('/api/v1/admin/contact/messages/staff');
    return response.data;
  },
};

export default contactService;

