import axios from '@/lib/axios';

export interface StaffInvitation {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'sales' | 'technical_support';
  status: 'pending' | 'accepted' | 'expired';
  invited_by: number;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  inviter?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
}

export interface CreateInvitationData {
  email: string;
  role: 'admin' | 'staff' | 'sales' | 'technical_support';
  expires_days?: number;
}

export interface AcceptInvitationData {
  token: string;
  name: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

const invitationsService = {
  // Get all invitations (admin only)
  async getAll(params?: { status?: string }): Promise<{ data: StaffInvitation[]; meta: any }> {
    const response = await axios.get('/admin/staff-invitations', { params });
    return response.data;
  },

  // Get invitation statistics (admin only)
  async getStats(): Promise<InvitationStats> {
    const response = await axios.get('/admin/staff-invitations/statistics');
    return response.data;
  },

  // Send invitation (admin only)
  async create(data: CreateInvitationData): Promise<{ message: string; invitation?: StaffInvitation; user?: any }> {
    const response = await axios.post('/admin/staff-invitations', data);
    return response.data;
  },

  // Resend invitation (admin only)
  async resend(invitationId: string): Promise<{ message: string }> {
    const response = await axios.post(`/admin/staff-invitations/${invitationId}/resend`);
    return response.data;
  },

  // Cancel/revoke invitation (admin only)
  async cancel(invitationId: string): Promise<{ message: string }> {
    const response = await axios.delete(`/admin/staff-invitations/${invitationId}`);
    return response.data;
  },

  // Accept invitation (public - for invited staff)
  async accept(data: AcceptInvitationData): Promise<{ message: string; user: any }> {
    const response = await axios.post('/staff-invitations/accept', data);
    return response.data;
  },

  // Get invitation details by token (public)
  async getByToken(token: string): Promise<any> {
    const response = await axios.get(`/staff-invitations/${token}`);
    return response.data;
  },
};

export default invitationsService;

