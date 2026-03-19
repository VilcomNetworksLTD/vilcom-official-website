import axios from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoverageZone {
  id: number;
  name: string;
  slug: string;
  type: string;
  // DB enum: active | inactive | planned
  status: 'active' | 'inactive' | 'planned';
  is_serviceable: boolean;
  center_lat?: number;
  center_lng?: number;
  radius_km?: number;
  county?: string;
  coverage_type?: 'Home' | 'Business' | 'Both' | 'None';
  connectivity_index?: number;
  notes?: string;
  children?: CoverageZone[];
}

export interface CoverageZonesMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface CoverageZonesResponse {
  data: CoverageZone[];
  meta: CoverageZonesMeta;
}

export interface CoveragePackage {
  id: number;
  coverage_zone_id: number;
  package_name: string;
  speed_mbps_down: number;
  speed_mbps_up: number;
  monthly_price: number;
  currency: string;
  is_available: boolean;
  description?: string;
  features?: string[];
  formatted_speed: string;
  formatted_price: string;
}

export interface CoverageProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  category?: string;
  short_description?: string;
  features?: string[];
  badge?: string;
  is_featured: boolean;
  pricing: {
    monthly: number;
    quarterly: number;
    semi_annually: number;
    annually: number;
    one_time: number;
    setup_fee: number;
  };
  promo?: {
    price: number;
    ends_at: string;
  };
  speed_mbps?: number;
  connection_type?: string;
  is_available: boolean;
  capacity: {
    limit?: number;
    current?: number;
    has_capacity: boolean;
  };
  notes?: string;
}

export interface CoverageCheckResponse {
  is_covered: boolean;
  zone: {
    id: number;
    name: string;
    type: string;
    status: string;
    packages: CoveragePackage[];
  } | null;
  coordinates: { lat: number; lng: number } | null;
  message: string;
}

export interface InterestSignup {
  name: string;
  email: string;
  phone?: string;
  address: string;
  area_description?: string;
  lat?: number;
  lng?: number;
}

export interface PublicZonesParams {
  per_page?: number;
  type?: string;
  search?: string;
}

export interface AdminZonesParams {
  page?: number;
  per_page?: number;
  type?: string;
  status?: string;
  search?: string;
  summary?: boolean;
}


// ─── Public coverage API ──────────────────────────────────────────────────────

export const coverageApi = {

  /**
   * Check if an address or lat/lng coordinate is within a coverage zone.
   */
  checkCoverage: async (params: { address?: string; lat?: number; lng?: number }) => {
    const response = await axios.post<CoverageCheckResponse>('/coverage/check', params);
    return response.data;
  },

  /**
   * Get top-level public coverage areas with their children.
   */
  getAreas: async () => {
    const response = await axios.get<{ areas: CoverageZone[] }>('/coverage/areas');
    return response.data;
  },

  /**
   * Get GeoJSON feature collection of all active coverage zones.
   */
  getGeoJson: async () => {
    const response = await axios.get<{ type: string; features: any[] }>('/coverage/geojson');
    return response.data;
  },

  /**
   * Register interest for coverage in an uncovered area.
   */
  registerInterest: async (data: InterestSignup) => {
    const response = await axios.post('/coverage/interest', data);
    return response.data;
  },

  /**
   * Get paginated list of public active coverage zones with coordinates.
   * Used by KenyaCoverageMap2D to overlay live data on the map.
   */
  getZones: async (params?: PublicZonesParams): Promise<CoverageZonesResponse> => {
    const response = await axios.get<CoverageZonesResponse>('/coverage/zones', { params });
    return response.data;
  },
};


// ─── Admin coverage API ───────────────────────────────────────────────────────

export const adminCoverageApi = {

  // ── Zones ──────────────────────────────────────────────────────────────────

  /**
   * Get all coverage zones (admin view — includes inactive/planned).
   * Also used by KenyaCoverageMap2D in admin mode to load survey area dots.
   */
  getZones: async (params?: AdminZonesParams): Promise<CoverageZonesResponse> => {
    const response = await axios.get<CoverageZonesResponse>('/admin/coverage/zones', { params });
    return response.data;
  },

  getZone: async (zoneId: number) => {
    const response = await axios.get(`/admin/coverage/zones/${zoneId}`);
    return response.data;
  },

  createZone: async (data: Partial<CoverageZone> & { [key: string]: any }) => {
    const response = await axios.post('/admin/coverage/zones', data);
    return response.data;
  },

  updateZone: async (zoneId: number, data: Partial<CoverageZone> & { [key: string]: any }) => {
    const response = await axios.put(`/admin/coverage/zones/${zoneId}`, data);
    return response.data;
  },

  deleteZone: async (zoneId: number) => {
    const response = await axios.delete(`/admin/coverage/zones/${zoneId}`);
    return response.data;
  },

  // ── Zone Products ──────────────────────────────────────────────────────────

  getZoneProducts: async (zoneId: number) => {
    const response = await axios.get(`/admin/coverage/zones/${zoneId}/products`);
    return response.data;
  },

  attachProduct: async (zoneId: number, data: {
    product_id: number;
    is_available?: boolean;
    price_monthly?: number;
    price_quarterly?: number;
    price_semi_annually?: number;
    price_annually?: number;
    setup_fee?: number;
    promotional_price?: number;
    promotional_start?: string;
    promotional_end?: string;
    capacity_limit?: number;
    speed_mbps?: number;
    connection_type?: 'fiber' | 'wireless' | 'both';
    notes?: string;
  }) => {
    const response = await axios.post(`/admin/coverage/zones/${zoneId}/products`, data);
    return response.data;
  },

  updateZoneProduct: async (zoneId: number, productId: number, data: any) => {
    const response = await axios.put(`/admin/coverage/zones/${zoneId}/products/${productId}`, data);
    return response.data;
  },

  detachProduct: async (zoneId: number, productId: number) => {
    const response = await axios.delete(`/admin/coverage/zones/${zoneId}/products/${productId}`);
    return response.data;
  },

  // ── Zone Packages ──────────────────────────────────────────────────────────

  getZonePackages: async (zoneId: number) => {
    const response = await axios.get(`/admin/coverage/zones/${zoneId}/packages`);
    return response.data;
  },

  createZonePackage: async (zoneId: number, data: {
    package_name: string;
    speed_mbps_down?: number;
    speed_mbps_up?: number;
    monthly_price: number;
    currency?: string;
    is_available?: boolean;
    description?: string;
    features?: string[];
    sort_order?: number;
  }) => {
    const response = await axios.post(`/admin/coverage/zones/${zoneId}/packages`, data);
    return response.data;
  },

  updateZonePackage: async (zoneId: number, packageId: number, data: any) => {
    const response = await axios.put(`/admin/coverage/zones/${zoneId}/packages/${packageId}`, data);
    return response.data;
  },

  deleteZonePackage: async (zoneId: number, packageId: number) => {
    const response = await axios.delete(`/admin/coverage/zones/${zoneId}/packages/${packageId}`);
    return response.data;
  },

  // ── Interest Signups ───────────────────────────────────────────────────────

  getInterestSignups: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/admin/coverage/interest-signups', { params });
    return response.data;
  },

  updateSignupStatus: async (signupId: number, data: { status: string; notes?: string }) => {
    const response = await axios.put(`/admin/coverage/interest-signups/${signupId}/status`, data);
    return response.data;
  },

  // ── Analytics & Logs ───────────────────────────────────────────────────────

  getAnalytics: async (params?: { from?: string; to?: string }) => {
    const response = await axios.get('/admin/coverage/analytics', { params });
    return response.data;
  },

  getCheckLogs: async (params?: {
    is_covered?: boolean;
    from?: string;
    to?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get('/admin/coverage/check-logs', { params });
    return response.data;
  },
};

export default coverageApi;