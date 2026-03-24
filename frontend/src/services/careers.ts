import api from "@/lib/axios";
import type { ApiResponse } from "./api";

// Job Vacancy types (admin-posted)
export interface JobVacancy {
  id: number;
  title: string;
  department: string | null;
  location: string;
  type: string;
  description: string;
  requirements: string[] | null;
  status: 'active' | 'closed' | 'draft';
  deadline: string | null;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface JobVacancyFormData {
  title: string;
  department?: string;
  location?: string;
  type: string;
  description: string;
  requirements?: string[];
  status: 'active' | 'closed' | 'draft';
  deadline?: string;
}

// Career application types
export interface CareerApplication {
  id: number;
  application_number: string;
  job_title: string;
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cover_letter?: string;
  cv_path?: string;
  certificates_path?: string;
  additional_documents_path?: string;
  status: 'pending' | 'under_review' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired' | 'withdrawn';
  status_label: string;
  hr_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CareerApplicationSubmission {
  job_title: string;
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cover_letter?: string;
  cv: File;
  certificates?: File;
  additional_documents?: File;
}

export interface CareerApplicationStatus {
  application_number: string;
  job_title: string;
  full_name: string;
  status: string;
  status_label: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface CareerStatistics {
  total: number;
  pending: number;
  under_review: number;
  shortlisted: number;
  interviewed: number;
  rejected: number;
  hired: number;
  recent_count: number;
  this_month: number;
  by_job_title: Array<{ job_title: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
}

// ============================================
// Public Career API
// ============================================

export const careersApi = {
  // Get available job positions
  async getJobPositions(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>("/careers/positions");
    return response.data.data;
  },

  // Get available statuses
  async getStatuses(): Promise<Record<string, string>> {
    const response = await api.get<ApiResponse<Record<string, string>>>("/careers/statuses");
    return response.data.data;
  },

  // Submit a career application
  async submit(data: CareerApplicationSubmission): Promise<{
    application_number: string;
    job_title: string;
    submitted_at: string;
  }> {
    const formData = new FormData();
    formData.append('job_title', data.job_title);
    formData.append('full_name', data.full_name);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.linkedin_url) formData.append('linkedin_url', data.linkedin_url);
    if (data.portfolio_url) formData.append('portfolio_url', data.portfolio_url);
    if (data.cover_letter) formData.append('cover_letter', data.cover_letter);
    formData.append('cv', data.cv);
    if (data.certificates) formData.append('certificates', data.certificates);
    if (data.additional_documents) formData.append('additional_documents', data.additional_documents);

    const response = await api.post<ApiResponse<{
      application_number: string;
      job_title: string;
      submitted_at: string;
    }>>("/careers/apply", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Check application status
  async checkStatus(applicationNumber: string, email: string): Promise<CareerApplicationStatus> {
    const response = await api.post<ApiResponse<CareerApplicationStatus>>("/careers/check-status", {
      application_number: applicationNumber,
      email,
    });
    return response.data.data;
  },

  // Withdraw application
  async withdraw(applicationNumber: string, email: string): Promise<void> {
    await api.post("/careers/withdraw", {
      application_number: applicationNumber,
      email,
    });
  },
};

// ============================================
// Admin Career Application API
// ============================================

export const adminCareersApi = {
  // Get all career applications (admin)
  async getAll(params?: Record<string, unknown>): Promise<{
    data: CareerApplication[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await api.get<ApiResponse<CareerApplication[]>>("/admin/careers", { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 }
    };
  },

  // Get career application statistics
  async getStatistics(): Promise<CareerStatistics> {
    const response = await api.get<ApiResponse<CareerStatistics>>("/admin/careers/statistics");
    return response.data.data;
  },

  // Get unique job titles
  async getJobTitles(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>("/admin/careers/job-titles");
    return response.data.data;
  },

  // Get single career application
  async get(id: number): Promise<CareerApplication> {
    const response = await api.get<ApiResponse<CareerApplication>>(`/admin/careers/${id}`);
    return response.data.data;
  },

  // Update application status
  async updateStatus(
    id: number,
    data: {
      status: 'pending' | 'under_review' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired' | 'withdrawn';
      notes?: string;
    }
  ): Promise<{
    id: number;
    status: string;
    status_label: string;
    reviewed_at: string;
  }> {
    const response = await api.post<ApiResponse<{
      id: number;
      status: string;
      status_label: string;
      reviewed_at: string;
    }>>(`/admin/careers/${id}/status`, data);
    return response.data.data;
  },

  // Update application notes
  async updateNotes(
    id: number,
    hrNotes: string
  ): Promise<void> {
    await api.put(`/admin/careers/${id}/notes`, {
      hr_notes: hrNotes,
    });
  },

  // Download CV
  async downloadCv(id: number): Promise<Blob> {
    const response = await api.get(`/admin/careers/${id}/download/cv`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download certificates
  async downloadCertificates(id: number): Promise<Blob> {
    const response = await api.get(`/admin/careers/${id}/download/certificates`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download additional documents
  async downloadAdditionalDocuments(id: number): Promise<Blob> {
    const response = await api.get(`/admin/careers/${id}/download/additional`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete application
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/careers/${id}`);
  },

  // Bulk update status
  async bulkUpdateStatus(
    applicationIds: number[],
    status: 'pending' | 'under_review' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired' | 'withdrawn'
  ): Promise<void> {
    await api.post("/admin/careers/bulk-update", {
      application_ids: applicationIds,
      status,
    });
  },
};

export default careersApi;

// ============================================
// Admin Vacancies API
// ============================================

export const adminVacanciesApi = {
  async getAll(params?: Record<string, unknown>): Promise<{
    data: JobVacancy[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
  }> {
    const response = await api.get<ApiResponse<JobVacancy[]>>('/admin/vacancies', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    };
  },

  async create(data: JobVacancyFormData): Promise<JobVacancy> {
    const response = await api.post<ApiResponse<JobVacancy>>('/admin/vacancies', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<JobVacancyFormData>): Promise<JobVacancy> {
    const response = await api.put<ApiResponse<JobVacancy>>(`/admin/vacancies/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/vacancies/${id}`);
  },
};

// Public vacancies API
export const publicVacanciesApi = {
  async getActive(): Promise<JobVacancy[]> {
    const response = await api.get<ApiResponse<JobVacancy[]>>('/vacancies');
    return response.data.data;
  },
};
