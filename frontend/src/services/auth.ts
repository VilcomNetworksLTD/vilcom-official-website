import { useNavigate } from 'react-router-dom';

// API Base URL - should be configured in .env
// Strip /api/v1 if present to avoid double paths
let API_URL = import.meta.env.VITE_API_URL || "";
API_URL = API_URL.replace(/\/api\/v1$/, "");

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
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (response.ok && data.success) {
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
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.ok && result.success) {
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
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  
  removeToken();
};

export const getCurrentUser = async (): Promise<AuthResponse | null> => {
  const token = getToken();
  
  if (!token) return null;

  const response = await fetch(`${API_URL}/auth/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    if (data.success && data.data?.user) {
      setUser(data.data.user);
      return data;
    }
  }
  
  // Token might be invalid
  if (response.status === 401) {
    removeToken();
  }
  
  return null;
};

export const refreshToken = async (): Promise<boolean> => {
  const token = getToken();
  
  if (!token) return false;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    if (data.data?.token) {
      setToken(data.data.token);
      return true;
    }
  }
  
  return false;
};

