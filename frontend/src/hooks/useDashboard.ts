// src/hooks/useDashboard.ts

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export interface ServiceDetails {
  mbr_id: string | null;
  account_id: string | null;
  login: string | null;
  plan_name: string | null;
  pay_period: string | null;
  billing_cycle: string | null;
  is_active: boolean;
  status: "active" | "suspended" | "expired" | "expiring_soon";
  expire_date: string | null;
  days_left: number | null;
  data_left: string | null;
  time_left: string | null;
  balance: string | null;
  is_expiring_soon: boolean;
  needs_renewal: boolean;
}

export interface DashboardData {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    emerald_mbr_id: string | null;
    status: string;
  };
  payment_info: {
    paybill: string;
    account_no: string | null;
    has_account: boolean;
    instructions: string;
  };
  service: ServiceDetails | null;
  stats: {
    active_subscriptions: number;
    open_tickets: number;
    outstanding_balance: number;
  };
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
  lastRefresh: Date | null;
}

export const useDashboard = (
  autoRefreshMs = 60_000
): UseDashboardReturn => {
  const [data, setData]               = useState<DashboardData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await api.get("/client/dashboard");
      setData(res.data.data);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    if (autoRefreshMs > 0) {
      const interval = setInterval(() => fetch(true), autoRefreshMs);
      return () => clearInterval(interval);
    }
  }, [fetch, autoRefreshMs]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh: () => fetch(true),
    lastRefresh,
  };
};

// ── Service status polling (lightweight — calls /client/service-status) ──

export const useServiceStatus = (mbrId: string | null) => {
  const [status, setStatus]   = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const poll = useCallback(async () => {
    if (!mbrId) return;
    setLoading(true);
    try {
      const res = await api.get("/client/service-status");
      setStatus(res.data.data);
    } catch {
      // silently fail — don't disrupt UI
    } finally {
      setLoading(false);
    }
  }, [mbrId]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, [poll]);

  return { status, loading, poll };
};