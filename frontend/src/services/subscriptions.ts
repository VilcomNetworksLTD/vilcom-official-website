import api from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'cancelled'
  | 'expired'
  | 'pending_cancellation'
  | 'pending_upgrade'
  | 'trial';

export type BillingCycle = 'monthly' | 'quarterly' | 'semi_annually' | 'annually';

export type CancelReason =
  | 'too_expensive'
  | 'switching_provider'
  | 'no_longer_needed'
  | 'poor_service'
  | 'moving_area'
  | 'other';

export type ChangeType = 'upgrade' | 'downgrade' | 'cycle_change' | 'addon_change' | 'initial';

export interface SubscriptionAddon {
  id: number;
  addon_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  billing_cycle: BillingCycle;
  status: 'active' | 'cancelled' | 'pending';
  added_at: string;
  cancelled_at: string | null;
  addon: {
    id: number;
    name: string;
    type: string;
    icon?: string;
  };
}

export interface SubscriptionPlanChange {
  id: number;
  change_type: ChangeType;
  apply_timing: 'immediate' | 'next_cycle';
  from_price: number;
  to_price: number;
  from_billing_cycle: BillingCycle;
  to_billing_cycle: BillingCycle;
  proration_credit: number;
  proration_charge: number;
  net_proration: number;
  days_remaining: number;
  days_in_cycle: number;
  effective_date: string;
  notes?: string;
  to_product: { id: number; name: string };
}

export interface SubscriptionStatusHistory {
  id: number;
  from_status: SubscriptionStatus | null;
  to_status: SubscriptionStatus;
  reason: string;
  changed_at: string;
  changed_by?: { id: number; name: string };
}

export interface Subscription {
  id: number;
  subscription_number: string;
  user_id: number;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  base_price: number;
  addons_total: number;
  discount_amount: number;
  setup_fee: number;
  total_amount: number;
  currency: string;
  proration_credit: number;
  proration_charge: number;
  proration_date: string | null;
  current_period_start: string;
  current_period_end: string;
  next_renewal_at: string | null;
  trial_ends_at: string | null;
  started_at: string | null;
  cancelled_at: string | null;
  suspended_at: string | null;
  is_trial: boolean;
  trial_days: number | null;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
  cancel_reason: CancelReason | null;
  cancel_notes: string | null;
  suspension_reason: string | null;
  grace_period_ends_at: string | null;
  pending_change_type: ChangeType | null;
  pending_change_date: string | null;
  metadata: Record<string, unknown> | null;
  product: {
    id: number;
    name: string;
    type: string;
    slug: string;
    speed_mbps?: number;
    connection_type?: string;
  };
  variant?: {
    id: number;
    name: string;
    sku?: string;
  };
  coverage_zone?: {
    id: number;
    name: string;
    county: string;
  };
  active_addons?: SubscriptionAddon[];
  plan_changes?: SubscriptionPlanChange[];
  status_history?: SubscriptionStatusHistory[];
}

export interface ProrationPreview {
  current_plan: string;
  new_plan: string;
  current_price: number;
  new_price: number;
  days_remaining: number;
  days_in_cycle: number;
  credit_amount: number;
  charge_amount: number;
  net_amount: number;
  net_label: 'Amount Due' | 'Credit Applied';
  effective_date: string;
  next_renewal_date: string;
}

// ─── Customer API ─────────────────────────────────────────────────────────────

export const subscriptionApi = {
  list: async () => {
    const response = await api.get<{ data: Subscription[] }>('/subscriptions');
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<Subscription>(`/subscriptions/${id}`);
    return response.data;
  },

  create: async (payload: {
    product_id: number;
    product_variant_id?: number;
    coverage_zone_id?: number;
    billing_cycle: BillingCycle;
    addon_ids?: number[];
    auto_renew?: boolean;
  }) => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      '/subscriptions',
      payload
    );
    return response.data;
  },

  previewProration: async (
    id: number,
    payload: {
      to_product_id: number;
      to_variant_id?: number;
      billing_cycle: BillingCycle;
    }
  ) => {
    const response = await api.get<ProrationPreview>(
      `/subscriptions/${id}/proration-preview`,
      { params: payload }
    );
    return response.data;
  },

  changePlan: async (
    id: number,
    payload: {
      to_product_id: number;
      to_variant_id?: number;
      billing_cycle: BillingCycle;
      immediate?: boolean;
    }
  ) => {
    const response = await api.post<{
      message: string;
      change: SubscriptionPlanChange;
      subscription: Subscription;
    }>(`/subscriptions/${id}/change-plan`, payload);
    return response.data;
  },

  cancel: async (
    id: number,
    payload: {
      reason: CancelReason;
      notes?: string;
      at_period_end?: boolean;
    }
  ) => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      `/subscriptions/${id}/cancel`,
      payload
    );
    return response.data;
  },

  reactivate: async (id: number) => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      `/subscriptions/${id}/reactivate`
    );
    return response.data;
  },

  addAddon: async (
    id: number,
    payload: { addon_id: number; quantity?: number }
  ) => {
    const response = await api.post<{
      message: string;
      subscription_addon: SubscriptionAddon;
      new_total: number;
    }>(`/subscriptions/${id}/addons`, payload);
    return response.data;
  },

  removeAddon: async (id: number, addonId: number) => {
    const response = await api.delete<{ message: string; new_total: number }>(
      `/subscriptions/${id}/addons/${addonId}`
    );
    return response.data;
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export interface SubscriptionAnalytics {
  summary: Record<SubscriptionStatus, number>;
  mrr: number;
  due_this_week: number;
  due_today: number;
  in_grace: number;
  by_billing_cycle: Array<{
    billing_cycle: BillingCycle;
    count: number;
    revenue: number;
  }>;
  by_product: Array<{
    product_id: number;
    count: number;
    product: { name: string };
  }>;
  new_this_period: number;
  churn_this_period: number;
  top_cancel_reasons: Array<{ cancel_reason: CancelReason; count: number }>;
}

export const adminSubscriptionApi = {
  list: async (params?: {
    status?: SubscriptionStatus;
    user_id?: number;
    product_id?: number;
    billing_cycle?: BillingCycle;
    search?: string;
    due_soon?: number;
    page?: number;
  }) => {
    const response = await api.get<{ data: Subscription[]; total: number }>(
      '/admin/subscriptions',
      { params }
    );
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<Subscription>(`/admin/subscriptions/${id}`);
    return response.data;
  },

  create: async (payload: {
    user_id: number;
    product_id: number;
    product_variant_id?: number;
    coverage_zone_id?: number;
    billing_cycle: BillingCycle;
    addon_ids?: number[];
    discount_amount?: number;
    setup_fee?: number;
    trial_days?: number;
    auto_renew?: boolean;
    managed_by?: number;
    internal_notes?: string;
  }) => {
    const response = await api.post<Subscription>('/admin/subscriptions', payload);
    return response.data;
  },

  activate: async (id: number) => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      `/admin/subscriptions/${id}/activate`
    );
    return response.data;
  },

  suspend: async (id: number, reason: string) => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      `/admin/subscriptions/${id}/suspend`,
      { reason }
    );
    return response.data;
  },

  reactivate: async (id: number) => {
    const response = await api.post<{ message: string; subscription: Subscription }>(
      `/admin/subscriptions/${id}/reactivate`
    );
    return response.data;
  },

  changePlan: async (
    id: number,
    payload: {
      to_product_id: number;
      to_variant_id?: number;
      billing_cycle: BillingCycle;
      immediate?: boolean;
      notes?: string;
    }
  ) => {
    const response = await api.post<{
      message: string;
      change: SubscriptionPlanChange;
      subscription: Subscription;
    }>(`/admin/subscriptions/${id}/change-plan`, payload);
    return response.data;
  },

  analytics: async (params?: { from?: string; to?: string }) => {
    const response = await api.get<SubscriptionAnalytics>(
      '/admin/subscriptions/analytics',
      { params }
    );
    return response.data;
  },
};

export default subscriptionApi;

