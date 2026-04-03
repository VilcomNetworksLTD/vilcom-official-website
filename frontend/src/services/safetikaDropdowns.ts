// src/services/safetikaDropdowns.ts
// Typed client for the Safetika dropdown proxy endpoints exposed by our backend.
// All endpoints are under /api/v1/admin/vilcom-safetika/* and require Bearer auth.

import api from "@/lib/axios";

export interface DropdownOption {
  id: number;
  name: string;
}

export interface SafetikaDropdowns {
  salesPersons: DropdownOption[];
  serviceCategories: DropdownOption[];
  accountTypes: DropdownOption[];
  customerTypes: DropdownOption[];
}

const BASE = "/admin/vilcom-safetika";

async function fetchList(url: string): Promise<DropdownOption[]> {
  try {
    const res = await api.get(url);
    return res.data?.data ?? [];
  } catch {
    return [];
  }
}

export const safetikaDropdownsApi = {
  /** GET /admin/vilcom-safetika/sales-persons */
  getSalesPersons: (): Promise<DropdownOption[]> =>
    fetchList(`${BASE}/sales-persons`),

  /** GET /admin/vilcom-safetika/service-categories */
  getServiceCategories: (): Promise<DropdownOption[]> =>
    fetchList(`${BASE}/service-categories`),

  /** GET /admin/vilcom-safetika/account-types */
  getAccountTypes: (): Promise<DropdownOption[]> =>
    fetchList(`${BASE}/account-types`),

  /** GET /admin/vilcom-safetika/customer-types */
  getCustomerTypes: (): Promise<DropdownOption[]> =>
    fetchList(`${BASE}/customer-types`),

  /**
   * POST /admin/vilcom-safetika/account-types/by-category
   * Returns account types filtered to those valid for the given service category.
   */
  getAccountTypesByCategory: async (
    serviceCategory: string
  ): Promise<DropdownOption[]> => {
    try {
      const res = await api.post(`${BASE}/account-types/by-category`, {
        service_category: serviceCategory,
      });
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch all dropdowns in parallel.
   * Useful for pre-loading the approval modal.
   */
  fetchAll: async (): Promise<SafetikaDropdowns> => {
    const [salesPersons, serviceCategories, accountTypes, customerTypes] =
      await Promise.all([
        safetikaDropdownsApi.getSalesPersons(),
        safetikaDropdownsApi.getServiceCategories(),
        safetikaDropdownsApi.getAccountTypes(),
        safetikaDropdownsApi.getCustomerTypes(),
      ]);
    return { salesPersons, serviceCategories, accountTypes, customerTypes };
  },
};
