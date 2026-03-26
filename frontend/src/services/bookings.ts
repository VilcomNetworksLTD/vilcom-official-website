// src/services/bookings.ts
import axios from '../lib/axios';

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  reference: string;
  data?: any;
  vms?: {
    reference?: string;
    check_in_code?: string;
    qr_code_url?: string;
  };
}

export interface Consultant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

/**
 * Official Vilcom Networks Contact Details
 * Centralized so you can update them easily in one place
 */
export const COMPANY_CONTACT = {
  phoneHelpline: "0111 028800",
  email: "customercare@vilcom.co.ke",
} as const;

const bookingService = {
  /**
   * Get list of consultants/staff
   */
  async getConsultants(): Promise<{ data: Consultant[] }> {
    const response = await axios.get('/staff/consultants');
    return response.data;
  },

  /**
   * Get available time slots for a specific date
   */
  async getAvailableSlots(params: { date: string; staff_id?: number }) {
    const response = await axios.get('/bookings/available-slots', { params });
    return response.data;
  },

  /**
   * Create a new booking - Fully aligned with VMS expected payload
   */
  async createBooking(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name?: string;
    customer_type: 'new' | 'existing';
    activity_type: 'meeting' | 'interview' | 'consultancy' | 'training';
    meeting_mode: 'in_person' | 'virtual' | 'phone';
    notes?: string;

    assigned_to?: number;

    booking_date: string;
    booking_time: string;

    // VMS fields
    id_type: 'national_id' | 'passport' | 'drivers_license' | 'other';
    id_number: string;
    visit_type: string;
    purpose: string;
    location: string;
  }): Promise<BookingResponse> {
    const response = await axios.post('/bookings', data);
    return response.data;
  },

  /**
   * Track a booking by reference (public endpoint)
   */
  async trackBooking(reference: string) {
    const response = await axios.get(`/bookings/track/${reference}`);
    return response.data;
  },

  /**
   * Get user's bookings (authenticated)
   */
  async getBookings(params?: {
    status?: string;
    staff_id?: number;
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
  }) {
    const response = await axios.get('/bookings', { params });
    return response.data;
  },

  /**
   * Get single booking details
   */
  async getBooking(bookingId: number) {
    const response = await axios.get(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: number, reason: string) {
    const response = await axios.post(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },
};

export default bookingService;