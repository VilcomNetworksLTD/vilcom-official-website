import api from "@/lib/axios";
import type { ApiResponse } from "./api";

// Quote request types
export interface QuoteRequest {
  id: number;
  quote_number: string;
  service_type: string;
  status: 'pending' | 'under_review' | 'quoted' | 'accepted' | 'rejected' | 'expired' | 'converted_to_subscription';
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_name?: string;
  general_info?: Record<string, unknown>;
  technical_requirements?: Record<string, unknown>;
  budget_range?: string;
  timeline?: string;
  preferred_start_date?: string;
  quoted_price?: number;
  staff_notes?: string;
  admin_response?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  assigned_staff?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface QuoteSubmission {
  service_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_name?: string;
  product_id?: number;
  general_info?: Record<string, unknown>;
  technical_requirements?: Record<string, unknown>;
  budget_range?: string;
  timeline?: string;
  preferred_start_date?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  additional_notes?: string;
  source?: string;
  referral_source?: string;
}

export interface QuoteStatistics {
  overview: {
    total: number;
    pending: number;
    under_review: number;
    quoted: number;
    accepted: number;
    converted: number;
    this_month: number;
    last_month: number;
  };
  by_service_type: Record<string, number>;
  by_status: Record<string, number>;
  average_quoted_price: number;
}

// ============================================
// Public Quote API
// ============================================

export const quotesApi = {
  // Get available service types
  async getServiceTypes(): Promise<Record<string, string>> {
    const response = await api.get<ApiResponse<Record<string, string>>>("/quotes/service-types");
    return response.data.data;
  },

  // Get technical fields for a service type
  async getTechnicalFields(serviceType: string): Promise<{
    service_type: string;
    service_type_label: string;
    fields: Record<string, string>;
  }> {
    const response = await api.get<ApiResponse<{
      service_type: string;
      service_type_label: string;
      fields: Record<string, string>;
    }>>("/quotes/technical-fields", { params: { service_type: serviceType } });
    return response.data.data;
  },

  // Get budget ranges and timeline options
  async getOptions(): Promise<{
    budget_ranges: Record<string, string>;
    timeline_options: Record<string, string>;
    urgency_levels: Record<string, string>;
  }> {
    const response = await api.get<ApiResponse<{
      budget_ranges: Record<string, string>;
      timeline_options: Record<string, string>;
      urgency_levels: Record<string, string>;
    }>>("/quotes/options");
    return response.data.data;
  },

  // Submit a quote request
  async submit(data: QuoteSubmission): Promise<{
    quote_number: string;
    id: number;
    service_type: string;
    status: string;
    submitted_at: string;
  }> {
    const response = await api.post<ApiResponse<{
      quote_number: string;
      id: number;
      service_type: string;
      status: string;
      submitted_at: string;
    }>>("/quotes", data);
    return response.data.data;
  },

  // Get user's quote requests (authenticated)
  async getAll(params?: Record<string, unknown>): Promise<{
    data: QuoteRequest[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await api.get<ApiResponse<QuoteRequest[]>>("/quotes", { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, per_page: 10, total: 0 }
    };
  },

  // Get single quote request
  async get(quoteNumber: string): Promise<QuoteRequest> {
    const response = await api.get<ApiResponse<QuoteRequest>>(`/quotes/${quoteNumber}`);
    return response.data.data;
  },

  // Respond to a quote (accept/reject)
  async respond(
    quoteNumber: string,
    response: 'accepted' | 'rejected',
    notes?: string
  ): Promise<{
    quote_number: string;
    status: string;
    quoted_price?: number;
  }> {
    const result = await api.post<ApiResponse<{
      quote_number: string;
      status: string;
      quoted_price?: number;
    }>>(`/quotes/${quoteNumber}/respond`, { response, notes });
    return result.data.data;
  },
};

// ============================================
// Admin Quote API
// ============================================

export const adminQuotesApi = {
  // Get all quotes (admin)
  async getAll(params?: Record<string, unknown>): Promise<{
    data: QuoteRequest[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await api.get<ApiResponse<QuoteRequest[]>>("/admin/quotes", { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 }
    };
  },

  // Get quote statistics
  async getStatistics(): Promise<QuoteStatistics> {
    const response = await api.get<ApiResponse<QuoteStatistics>>("/admin/quotes/statistics");
    return response.data.data;
  },

  // Get available staff for assignment
  async getStaff(): Promise<Array<{ id: number; name: string; email: string }>> {
    const response = await api.get<ApiResponse<Array<{ id: number; name: string; email: string }>>>("/admin/quotes/staff");
    return response.data.data;
  },

  // Get single quote
  async get(id: number): Promise<QuoteRequest> {
    const response = await api.get<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}`);
    return response.data.data;
  },

  // Mark quote as under review
  async markUnderReview(id: number): Promise<QuoteRequest> {
    const response = await api.post<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}/mark-review`);
    return response.data.data;
  },

  // Submit a quote response
  async submitQuote(
    id: number,
    data: {
      quoted_price: number;
      staff_notes?: string;
      admin_response: string;
    }
  ): Promise<QuoteRequest> {
    const response = await api.post<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}/quote`, data);
    return response.data.data;
  },

  // Assign quote to staff
  async assign(id: number, staffId: number): Promise<QuoteRequest> {
    const response = await api.post<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}/assign`, {
      assigned_staff_id: staffId,
    });
    return response.data.data;
  },

  // Update quote details
  async update(
    id: number,
    data: Partial<QuoteRequest>
  ): Promise<QuoteRequest> {
    const response = await api.put<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}`, data);
    return response.data.data;
  },

  // Convert quote to subscription
  async convertToSubscription(id: number, subscriptionId: number): Promise<QuoteRequest> {
    const response = await api.post<ApiResponse<QuoteRequest>>(`/admin/quotes/${id}/convert`, {
      subscription_id: subscriptionId,
    });
    return response.data.data;
  },

  // Delete quote
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/quotes/${id}`);
  },
};

export default quotesApi;

