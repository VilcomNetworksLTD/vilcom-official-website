import api from "@/lib/axios";

// Types
export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  type: string;
  icon: string | null;
  image: string | null;
  banner: string | null;
  color: string | null;
  attributes: Record<string, unknown> | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  show_in_menu: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  children?: Category[];
  products?: Product[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  category?: Category;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string | null;
  type: string;
  speed_mbps: number | null;
  connection_type: string | null;
  plan_category: string | null;
  storage_gb: number | null;
  bandwidth_gb: number | null;
  email_accounts: number | null;
  databases: number | null;
  domains_allowed: number | null;
  ssl_included: boolean;
  backup_included: boolean;
  pages_included: number | null;
  revisions_included: number | null;
  delivery_days: number | null;
  sms_credits: number | null;
  cost_per_sms: number | null;
  price_monthly: number | null;
  price_quarterly: number | null;
  price_semi_annually: number | null;
  price_annually: number | null;
  price_one_time: number | null;
  setup_fee: number;
  promotional_price: number | null;
  promotional_start: string | null;
  promotional_end: string | null;
  features: string[] | null;
  technical_specs: Record<string, unknown> | null;
  coverage_areas: string[] | null;
  available_nationwide: boolean;
  stock_quantity: number | null;
  capacity_limit: number | null;
  current_capacity: number;
  track_capacity: boolean;
  image: string | null;
  gallery: string[] | null;
  icon: string | null;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_quote_based: boolean;
  requires_approval: boolean;
  sort_order: number;
  requirements: string | null;
  terms_conditions: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  // Price display info from backend
  price_display?: {
    is_quote_based: boolean;
    has_fixed_price: boolean;
    show_get_quote: boolean;
    show_buy_now: boolean;
    primary_price: number | null;
    primary_label: string;
    price_monthly: number | null;
    price_quarterly: number | null;
    price_semi_annually: number | null;
    price_annually: number | null;
    price_one_time: number | null;
    setup_fee: number | null;
    formatted_pricing: Record<string, unknown>;
    price_type: string;
  };
  variants?: ProductVariant[];
  addons?: Addon[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku: string | null;
  attributes: Record<string, unknown> | null;
  price_monthly: number | null;
  price_quarterly: number | null;
  price_semi_annually: number | null;
  price_annually: number | null;
  price_one_time: number | null;
  setup_fee: number;
  stock_quantity: number | null;
  capacity_limit: number | null;
  current_capacity: number;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string | null;
  type: string;
  applicable_to: string[] | null;
  price_monthly: number | null;
  price_quarterly: number | null;
  price_semi_annually: number | null;
  price_annually: number | null;
  price_one_time: number | null;
  is_recurring: boolean;
  min_quantity: number;
  max_quantity: number | null;
  stock_quantity: number | null;
  bundle_rules: Record<string, unknown> | null;
  can_be_bundled: boolean;
  bundle_discount_percent: number | null;
  icon: string | null;
  image: string | null;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  requires_approval: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ============================================
// Categories API
// ============================================
export const categoriesApi = {
  // Get all categories
  async getAll(params?: Record<string, unknown>): Promise<ApiResponse<Category[]>> {
    const response = await api.get("/categories", { params });
    return response.data;
  },

  // Get category tree
  async getTree(type?: string): Promise<ApiResponse<Category[]>> {
    const response = await api.get("/categories/tree", {
      params: type ? { type } : undefined,
    });
    return response.data;
  },

  // Get single category
  async get(slug: string): Promise<ApiResponse<Category>> {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  // Get products in category
  async getProducts(
    slug: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Product[]>> {
    const response = await api.get(`/categories/${slug}/products`, { params });
    return response.data;
  },
};

// ============================================
// Products API
// ============================================
export const productsApi = {
  // Get all products
  async getAll(params?: Record<string, unknown>): Promise<ApiResponse<Product[]>> {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Get featured products
  async getFeatured(limit: number = 6): Promise<ApiResponse<Product[]>> {
    const response = await api.get("/products/featured", {
      params: { limit },
    });
    return response.data;
  },

  // Get promotional products
  async getOnPromotion(params?: Record<string, unknown>): Promise<ApiResponse<Product[]>> {
    const response = await api.get("/products/on-promotion", { params });
    return response.data;
  },

  // Get products by category
  async getByCategory(
    categorySlug: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Product[]>> {
    const response = await api.get(`/products/category/${categorySlug}`, { params });
    return response.data;
  },

  // Get single product
  async get(slug: string): Promise<ApiResponse<Product>> {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  // Check availability
  async checkAvailability(
    slug: string,
    area: string
  ): Promise<ApiResponse<{
    available: boolean;
    coverage_available: boolean;
    has_capacity: boolean;
    in_stock: boolean;
    message: string;
  }>> {
    const response = await api.post(`/products/${slug}/availability`, { area });
    return response.data;
  },

  // Get related products
  async getRelated(slug: string): Promise<ApiResponse<Product[]>> {
    const response = await api.get(`/products/${slug}/related`);
    return response.data;
  },
};

// ============================================
// Addons API
// ============================================
export const addonsApi = {
  // Get all addons
  async getAll(params?: Record<string, unknown>): Promise<ApiResponse<Addon[]>> {
    const response = await api.get("/addons", { params });
    return response.data;
  },

  // Get single addon
  async get(slug: string): Promise<ApiResponse<Addon>> {
    const response = await api.get(`/addons/${slug}`);
    return response.data;
  },

  // Get addons for a product
  async getForProduct(productId: number): Promise<ApiResponse<Addon[]>> {
    const response = await api.get(`/addons/product/${productId}`);
    return response.data;
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get internet plans (type: internet_plan) from the API
 * @param planCategory - Optional filter: 'home' or 'business'
 */
export async function getInternetPlans(planCategory?: "home" | "business"): Promise<Product[]> {
  const params: Record<string, unknown> = {
    type: "internet_plan",
    is_active: true,
    per_page: "all",
  };

  if (planCategory) {
    params.plan_category = planCategory;
  }

  const response = await productsApi.getAll(params);
  return response.data;
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const response = await productsApi.getFeatured(limit);
  return response.data;
}

/**
 * Get products by category slug
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const response = await productsApi.getByCategory(categorySlug);
  return response.data;
}

/**
 * Get product with details
 */
export async function getProductDetails(slug: string): Promise<Product> {
  const response = await productsApi.get(slug);
  return response.data;
}

/**
 * Get all categories
 */
export async function getAllCategories(params?: Record<string, unknown>): Promise<Category[]> {
  const response = await categoriesApi.getAll(params);
  return response.data;
}

/**
 * Get category tree
 */
export async function getCategoryTree(type?: string): Promise<Category[]> {
  const response = await categoriesApi.getTree(type);
  return response.data;
}
