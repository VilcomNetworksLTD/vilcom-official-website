import axios from '../lib/axios';

export interface BookableService {
  id: number;
  name: string;
  slug: string;
  type: string;
  purpose_label: string;
  category: string;
  category_slug: string;
  plan_category: string;
  description: string;
  is_quote_based: boolean;
  requires_approval: boolean;
  badge: string | null;
  icon: string | null;
  image: string | null;
  price_monthly: number | null;
  price_one_time: number | null;
  setup_fee: number | null;
  details: Record<string, any>;
  consultation_duration_minutes: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Booking {
  id: number;
  reference: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  customer_type: 'individual' | 'business';
  client_display: string;
  product_id: number;
  product_snapshot: Record<string, any>;
  meeting_purpose: string;
  assigned_to: number | null;
  assigned_staff: {
    id: number;
    name: string;
    email: string;
  } | null;
  booking_date: string;
  booking_date_formatted: string;
  booking_time: string;
  booking_time_formatted: string;
  duration_minutes: number;
  meeting_type: 'in_person' | 'virtual' | 'phone';
  meeting_type_label: string;
  meeting_link: string | null;
  meeting_location: string | null;
  notes: string | null;
  internal_notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled' | 'no_show';
  status_label: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  can_cancel: boolean;
  can_reschedule: boolean;
  can_update_status: boolean;
}

export interface Consultant {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  department: string | null;
  bio: string | null;
  availabilities: {
    day_of_week: number;
    day_name: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  today: number;
  this_week: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  by_product_type: Record<string, number>;
}

const bookingService = {
  /**
   * Get bookable services/products for booking
   */
  async getBookableServices(params?: {
    type?: string;
    plan_category?: string;
    category?: string;
    quote_based_only?: boolean;
  }) {
    const response = await axios.get('/bookings/services', { params });
    return response.data;
  },

  /**
   * Get available time slots for a specific date and product
   */
  async getAvailableSlots(params: {
    date: string;
    product_id: number;
    staff_id?: number;
  }) {
    const response = await axios.get('/bookings/available-slots', { params });
    return response.data;
  },

  /**
   * Create a new booking (saves to our DB AND syncs to VMS simultaneously)
   */
  async createBooking(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name?: string;
    customer_type: 'individual' | 'business';
    product_id: number;
    assigned_to?: number;
    booking_date: string;
    booking_time: string;
    meeting_type: 'in_person' | 'virtual' | 'phone';
    notes?: string;
    /** Required for VMS visitor pass */
    id_type: 'national_id' | 'passport' | 'drivers_license' | 'other';
    /** Required for VMS visitor pass */
    id_number: string;
    visit_type?: string;
    purpose?: string;
  }) {
    const response = await axios.post('/bookings', data);
    return response.data;
  },

  /**
   * Track a booking by reference (public)
   */
  async trackBooking(reference: string) {
    const response = await axios.get(`/bookings/track/${reference}`);
    return response.data;
  },

  /**
   * Get list of consultants/staff available for booking
   */
  async getConsultants(params?: {
    department?: string;
    available_today?: boolean;
  }) {
    const response = await axios.get('/staff/consultants', { params });
    return response.data;
  },

  /**
   * Get staff member's availability for a date range
   */
  async getStaffAvailability(userId: number, params: {
    date_from: string;
    date_to: string;
  }) {
    const response = await axios.get(`/staff/${userId}/availability`, { params });
    return response.data;
  },

  // Authenticated endpoints

  /**
   * Get user's bookings (or all bookings for admin/staff)
   */
  async getBookings(params?: {
    status?: string;
    staff_id?: number;
    product_id?: number;
    product_type?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
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
   * Cancel own booking
   */
  async cancelBooking(bookingId: number, reason: string) {
    const response = await axios.post(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Update booking status (admin/staff only)
   */
  async updateBookingStatus(
    bookingId: number,
    data: {
      status: 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
      cancellation_reason?: string;
      internal_notes?: string;
      new_date?: string;
      new_time?: string;
      assigned_to?: number;
      meeting_link?: string;
    }
  ) {
    const response = await axios.patch(`/bookings/${bookingId}/status`, data);
    return response.data;
  },

  /**
   * Get booking statistics
   */
  async getStatistics() {
    const response = await axios.get('/bookings/meta/statistics');
    return response.data;
  },

  /**
   * Update own availability (staff only)
   */
  async updateAvailability(
    userId: number,
    availability: Array<{
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_available: boolean;
      notes?: string;
    }>
  ) {
    const response = await axios.post(`/staff/${userId}/availability`, {
      availability,
    });
    return response.data;
  },
};

export default bookingService;

