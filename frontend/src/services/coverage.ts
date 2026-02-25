import axios from '@/lib/axios';

export interface CoverageZone {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: 'active' | 'coming_soon' | 'inactive';
  is_serviceable: boolean;
  center_lat?: number;
  center_lng?: number;
  radius_km?: number;
  children?: CoverageZone[];
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

// Public coverage API
export const coverageApi = {
  // Check coverage for an address or coordinates
  checkCoverage: async (params: { address?: string; lat?: number; lng?: number }) => {
    const response = await axios.post<CoverageCheckResponse>('/api/v1/coverage/check', params);
    return response.data;
  },

  // Get all active coverage areas
  getAreas: async () => {
    const response = await axios.get<{ areas: CoverageZone[] }>('/api/v1/coverage/areas');
    return response.data;
  },

  // Get GeoJSON for map visualization
  getGeoJson: async () => {
    const response = await axios.get<{ type: string; features: any[] }>('/api/v1/coverage/geojson');
    return response.data;
  },

  // Register interest in uncovered area
  registerInterest: async (data: InterestSignup) => {
    const response = await axios.post('/api/v1/coverage/interest', data);
    return response.data;
  },
};

// Admin coverage API
export const adminCoverageApi = {
  // Get all zones
  getZones: async (params?: { page?: number; per_page?: number }) => {
    const response = await axios.get('/api/v1/coverage/admin/coverage/zones', { params });
    return response.data;
  },

  // Get single zone with products
  getZone: async (zoneId: number) => {
    const response = await axios.get(`/api/v1/coverage/admin/coverage/zones/${zoneId}`);
    return response.data;
  },

  // Create zone
  createZone: async (data: Partial<CoverageZone>) => {
    const response = await axios.post('/api/v1/coverage/admin/coverage/zones', data);
    return response.data;
  },

  // Update zone
  updateZone: async (zoneId: number, data: Partial<CoverageZone>) => {
    const response = await axios.put(`/api/v1/coverage/admin/coverage/zones/${zoneId}`, data);
    return response.data;
  },

  // Delete zone
  deleteZone: async (zoneId: number) => {
    const response = await axios.delete(`/api/v1/coverage/admin/coverage/zones/${zoneId}`);
    return response.data;
  },

  // Get products attached to a zone
  getZoneProducts: async (zoneId: number) => {
    const response = await axios.get(`/api/v1/coverage/admin/coverage/zones/${zoneId}/products`);
    return response.data;
  },

  // Attach product to zone
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
    const response = await axios.post(`/api/v1/coverage/admin/coverage/zones/${zoneId}/products`, data);
    return response.data;
  },

  // Update zone product
  updateZoneProduct: async (zoneId: number, productId: number, data: any) => {
    const response = await axios.put(`/api/v1/coverage/admin/coverage/zones/${zoneId}/products/${productId}`, data);
    return response.data;
  },

  // Detach product from zone
  detachProduct: async (zoneId: number, productId: number) => {
    const response = await axios.delete(`/api/v1/coverage/admin/coverage/zones/${zoneId}/products/${productId}`);
    return response.data;
  },

  // Get packages for a zone
  getZonePackages: async (zoneId: number) => {
    const response = await axios.get(`/api/v1/coverage/admin/coverage/zones/${zoneId}/packages`);
    return response.data;
  },

  // Create package for zone
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
    const response = await axios.post(`/api/v1/coverage/admin/coverage/zones/${zoneId}/packages`, data);
    return response.data;
  },

  // Update zone package
  updateZonePackage: async (zoneId: number, packageId: number, data: any) => {
    const response = await axios.put(`/api/v1/coverage/admin/coverage/zones/${zoneId}/packages/${packageId}`, data);
    return response.data;
  },

  // Delete zone package
  deleteZonePackage: async (zoneId: number, packageId: number) => {
    const response = await axios.delete(`/api/v1/coverage/admin/coverage/zones/${zoneId}/packages/${packageId}`);
    return response.data;
  },

  // Get interest signups
  getInterestSignups: async (params?: { status?: string; search?: string; page?: number }) => {
    const response = await axios.get('/api/v1/coverage/admin/coverage/interest-signups', { params });
    return response.data;
  },

  // Update signup status
  updateSignupStatus: async (signupId: number, data: { status: string; notes?: string }) => {
    const response = await axios.put(`/api/v1/coverage/admin/coverage/interest-signups/${signupId}/status`, data);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (params?: { from?: string; to?: string }) => {
    const response = await axios.get('/api/v1/coverage/admin/coverage/analytics', { params });
    return response.data;
  },

  // Get check logs
  getCheckLogs: async (params?: { is_covered?: boolean; from?: string; to?: string; search?: string; page?: number }) => {
    const response = await axios.get('/api/v1/coverage/admin/coverage/check-logs', { params });
    return response.data;
  },
};

export default coverageApi;
