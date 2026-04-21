import api from "@/lib/axios";
import type { ApiResponse } from "./api";

// Lead types
export interface Lead {
  id: number;
  vlc_vid: string;
  user_id?: number;
  product_id?: number;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  source: string;
  status: string;
  score: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  page_views: number;
  time_on_site: number;
  scroll_depth: number;
  device_type: string;
  is_business: boolean;
  message?: string;
  assigned_staff_id?: number;
  converted_at?: string;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  // Laravel serializes the 'assignedStaff' relation as 'assigned_staff' (snake_case)
  assigned_staff?: {
    id: number;
    name: string;
    email: string;
  };
  // Keep camelCase alias for any legacy references
  assignedStaff?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface LeadVisit {
  id: number;
  lead_id: number;
  vlc_vid: string;
  url?: string;
  page_title?: string;
  time_on_page: number;
  scroll_depth: number;
  referrer?: string;
  utm_params?: Record<string, string>;
  device_type: string;
  created_at: string;
}

export interface LeadSubmission {
  vlc_vid?: string;
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  product_id?: number;
  source: string;
  message?: string;
  is_business?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  device_type?: string;
}

export interface WaitlistSubmission {
  vlc_vid?: string;
  name: string;
  email: string;
  phone?: string;
  area?: string;
  device_type?: string;
}

export interface NewsletterSubmission {
  vlc_vid?: string;
  email: string;
  device_type?: string;
}

export interface AbandonmentSubmission {
  vlc_vid?: string;
  name?: string;
  email?: string;
  phone?: string;
  product_id?: number;
  booking_data?: Record<string, unknown>;
  device_type?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface LeadStatistics {
  overview: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    proposal: number;
    converted: number;
    lost: number;
    conversion_rate: number;
    average_score: number;
    hot_leads: number;
  };
  by_source: Record<string, number>;
  this_month: number;
  last_month: number;
}

// ============================================
// Public Lead API
// ============================================

export const leadsApi = {
  // Track page visit (uses sendBeacon)
  async trackVisit(data: {
    vlc_vid: string;
    url?: string;
    page_title?: string;
    time_on_page?: number;
    scroll_depth?: number;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    device_type?: string;
  }): Promise<{ vlc_vid: string; lead_id: number }> {
    const response = await api.post<ApiResponse<{ vlc_vid: string; lead_id: number }>>(
      "/leads/track-visit",
      data
    );
    return response.data.data;
  },

  // Capture lead from CTA
  async capture(data: LeadSubmission): Promise<{
    lead_id: number;
    score: number;
    status: string;
  }> {
    const response = await api.post<ApiResponse<{
      lead_id: number;
      score: number;
      status: string;
    }>>("/leads/capture", data);
    return response.data.data;
  },

  // Waitlist signup
  async waitlist(data: WaitlistSubmission): Promise<{ lead_id: number }> {
    const response = await api.post<ApiResponse<{ lead_id: number }>>(
      "/leads/waitlist",
      data
    );
    return response.data.data;
  },

  // Newsletter signup
  async newsletter(data: NewsletterSubmission): Promise<{ lead_id: number }> {
    const response = await api.post<ApiResponse<{ lead_id: number }>>(
      "/leads/newsletter",
      data
    );
    return response.data.data;
  },

  // Capture booking abandonment
  async captureAbandonment(data: AbandonmentSubmission): Promise<{
    lead_id: number;
    score: number;
  }> {
    const response = await api.post<ApiResponse<{
      lead_id: number;
      score: number;
    }>>("/leads/abandonment", data);
    return response.data.data;
  },

  // Generate visitor ID
  async generateVisitorId(): Promise<{ vlc_vid: string }> {
    const response = await api.get<ApiResponse<{ vlc_vid: string }>>(
      "/leads/visitor-id"
    );
    return response.data.data;
  },
};

// ============================================
// Admin Lead API
// ============================================

export const adminLeadsApi = {
  // Get all leads
  async getAll(params?: Record<string, unknown>): Promise<{
    data: Lead[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await api.get<ApiResponse<Lead[]>>("/admin/leads", {
      params,
    });
    return {
      data: response.data.data,
      meta: response.data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      },
    };
  },

  // Get lead statistics
  async getStatistics(): Promise<LeadStatistics> {
    const response = await api.get<ApiResponse<LeadStatistics>>(
      "/admin/leads/statistics"
    );
    return response.data.data;
  },

  // Get available staff for assignment
  async getStaff(): Promise<Array<{
    id: number;
    name: string;
    email: string;
    leads_count: number;
  }>> {
    const response = await api.get<
      ApiResponse<
        Array<{
          id: number;
          name: string;
          email: string;
          leads_count: number;
        }>
      >
    >("/admin/leads/staff");
    return response.data.data;
  },

  // Get single lead
  async get(id: number): Promise<Lead> {
    const response = await api.get<ApiResponse<Lead>>(`/admin/leads/${id}`);
    return response.data.data;
  },

  // Update lead
  async update(
    id: number,
    data: Partial<Lead>
  ): Promise<Lead> {
    const response = await api.put<ApiResponse<Lead>>(
      `/admin/leads/${id}`,
      data
    );
    return response.data.data;
  },

  // Update lead status
  async updateStatus(
    id: number,
    status: string
  ): Promise<Lead> {
    const response = await api.post<ApiResponse<Lead>>(
      `/admin/leads/${id}/status`,
      { status }
    );
    return response.data.data;
  },

  // Assign lead to staff
  async assign(
    id: number,
    assignedStaffId: number
  ): Promise<Lead> {
    const response = await api.post<ApiResponse<Lead>>(
      `/admin/leads/${id}/assign`,
      { assigned_staff_id: assignedStaffId }
    );
    return response.data.data;
  },

  // Auto-assign lead
  async autoAssign(id: number): Promise<Lead> {
    const response = await api.post<ApiResponse<Lead>>(
      `/admin/leads/${id}/auto-assign`
    );
    return response.data.data;
  },

  // Convert lead to customer
  async convert(id: number): Promise<Lead> {
    const response = await api.post<ApiResponse<Lead>>(
      `/admin/leads/${id}/convert`
    );
    return response.data.data;
  },

  // Delete lead
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/leads/${id}`);
  },

  // Find duplicates
  async getDuplicates(
    id: number
  ): Promise<Lead[]> {
    const response = await api.get<ApiResponse<Lead[]>>(
      `/admin/leads/${id}/duplicates`
    );
    return response.data.data;
  },

  // Merge leads
  async merge(
    id: number,
    duplicateId: number
  ): Promise<Lead> {
    const response = await api.post<ApiResponse<Lead>>(
      `/admin/leads/${id}/merge`,
      { duplicate_id: duplicateId }
    );
    return response.data.data;
  },

  // Bulk assign
  async bulkAssign(
    leadIds: number[],
    assignedStaffId: number
  ): Promise<void> {
    await api.post("/admin/leads/bulk-assign", {
      lead_ids: leadIds,
      assigned_staff_id: assignedStaffId,
    });
  },
};

export default leadsApi;

