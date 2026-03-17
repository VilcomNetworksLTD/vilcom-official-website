import { useNavigate } from 'react-router-dom';

// API Base URL - should be configured in .env
// Strip /api/v1 if present to avoid double paths
import api from '@/lib/axios';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  customer_type?: 'individual' | 'business';
  company_name?: string;
  company_registration?: string;
  tax_pin?: string;
  address?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  sms_notifications?: boolean;
  marketing_consent?: boolean;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserData;
    token: string;
    token_type?: string;
    expires_at?: string;
  };
  errors?: Record<string, string[]>;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  customer_type: string;
  roles: Array<{ id: number; name: string }>;
}

// Token Management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUser = (): UserData | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: UserData): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// API Functions
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  const data = response.data;

  if (response.status < 300 && data.success) {
    if (data.data?.token) {
      setToken(data.data.token);
    }
    if (data.data?.user) {
      setUser(data.data.user);
    }
  }

  return data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  const result = response.data;

  if (response.status < 300 && result.success) {
    if (result.data?.token) {
      setToken(result.data.token);
    }
    if (result.data?.user) {
      setUser(result.data.user);
    }
  }

  return result;
};

export const logout = async (): Promise<void> => {
  const token = getToken();
  
  if (token) {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  
  removeToken();
};

export const getCurrentUser = async (): Promise<AuthResponse | null> => {
  const token = getToken();
  
  if (!token) return null;

  try {
    const response = await api.get('/auth/user');
    const data = response.data;
    if (data.success && data.data?.user) {
      setUser(data.data.user);
      return data;
    }
  } catch (error: any) {
    // Token might be invalid
    if (error.response?.status === 401) {
      removeToken();
    }
  }
  
  return null;
};

export const refreshToken = async (): Promise<boolean> => {
  const token = getToken();
  
  if (!token) return false;

  try {
    const response = await api.post('/auth/refresh');
    const data = response.data;
    if (data.data?.token) {
      setToken(data.data.token);
      return true;
    }
  } catch {
    // Refresh failed
  }
  
  return false;
};

