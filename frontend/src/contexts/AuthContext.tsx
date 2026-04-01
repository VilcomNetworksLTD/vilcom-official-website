import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: 'individual' | 'business';
  status: string;
  email_verified_at?: string;
  roles: Role[];
  permissions: Permission[];
  two_factor_enabled: boolean;
  company_name?: string;
  address?: string;
  city?: string;
  county?: string;
  emerald_mbr_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
}

interface Permission {
  id: number;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<string>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permissions: string | string[]) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  getDashboardUrl: () => string;
}

// ============================================
// PURE HELPER — no React state dependency
// ============================================

/**
 * Compute the correct dashboard URL for a given user object.
 * Call this synchronously with the API response data so you
 * never read stale React state after setUser().
 */
export function getDashboardUrlForUser(user: User | null): string {
  if (!user) return '/auth';
  const roleNames = user.roles?.map((r) => r.name) ?? [];
  if (roleNames.includes('admin')) return '/admin/dashboard';
  if (roleNames.some((r) => ['staff','sales','technical_support','web_developer','content_manager'].includes(r))) {
    return '/staff/dashboard';
  }
  return '/client/dashboard';
}

interface RegisterData {
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
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);



import api from '@/lib/axios';

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
  const loadUser = async () => {
      const storedToken = localStorage.getItem('auth_token');

      if (storedToken) {
        setToken(storedToken);

        try {
          const response = await api.get('/auth/user');
          if (response.data.success && response.data.data?.user) {
            setUser(response.data.data.user);
            localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
          }
        } catch (error: any) {
          if (error.response?.status === 401) {
            handleLogout();
          } else {
            console.error('Failed to load user', error);
          }
        }
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  // ============================================
  // AUTH FUNCTIONS
  // ============================================

  const login = async (email: string, password: string): Promise<string> => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    if (response.status >= 300) {
      if (data.requires_2fa) {
        throw new Error('2FA_REQUIRED');
      }
      throw new Error(data.message || 'Login failed');
    }

    if (data.success && data.data) {
      const { user: userData, token: authToken } = data.data;
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      // Return the URL computed from the fresh API response — not from stale React state
      return getDashboardUrlForUser(userData);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const logout = async (): Promise<void> => {
    const storedToken = localStorage.getItem('auth_token');

    if (storedToken) {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Logout request failed', error);
      }
    }

    handleLogout();
  };

  const register = async (data: RegisterData): Promise<string> => {
    const response = await api.post('/auth/register', data);
    const result = response.data;

    if (response.status >= 300) {
      // Surface Laravel field-level validation errors
      if (result.errors) {
        const messages = Object.values(result.errors as Record<string, string[]>)
          .flat()
          .join(' ');
        throw new Error(messages);
      }
      throw new Error(result.message || 'Registration failed');
    }

    if (result.success && result.data) {
      const { user: userData, token: authToken } = result.data;
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      // Return the URL computed from the fresh API response — not from stale React state
      return getDashboardUrlForUser(userData);
    } else {
      throw new Error(result.message || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  // ============================================
  // AUTHORIZATION FUNCTIONS
  // ============================================

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return user.roles?.some((role: Role) => roleArray.includes(role.name)) || false;
  };

  const hasPermission = (permissions: string | string[]): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.roles?.some((role: Role) => role.name === 'admin')) return true;

    const permArray = Array.isArray(permissions) ? permissions : [permissions];
    return user.permissions?.some((perm: Permission) => permArray.includes(perm.name)) || false;
  };

  /**
   * Get the appropriate dashboard URL based on user role.
   * Priority: admin > staff > client
   */
  const getDashboardUrl = (): string => {
    if (hasRole('admin')) return '/admin/dashboard';
    if (hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager'])) {
      return '/staff/dashboard';
    }
    return '/client/dashboard'; // Default for clients or missing roles
  };

  const isAdmin = hasRole('admin');
  const isStaff = hasRole(['admin', 'staff']);
  const isClient = hasRole('client');

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    register,
    hasRole,
    hasPermission,
    isAdmin,
    isStaff,
    isClient,
    getDashboardUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// HOOK
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

interface ProtectedRouteProps {
  children: ReactNode;
  requireRoles?: string[];
  requirePermissions?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRoles = [],
  requirePermissions = [],
  fallback,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (requireRoles.length > 0 && !hasRole(requireRoles)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requirePermissions.length > 0 && !hasPermission(requirePermissions)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to perform this action.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// ============================================
// AUTHORIZATION COMPONENTS
// ============================================

interface CanProps {
  do?: string | string[];
  be?: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditional rendering based on permissions or roles.
 *
 * Usage:
 *   <Can do="products.create"><CreateProductButton /></Can>
 *   <Can be="admin"><AdminPanel /></Can>
 */
export const Can: React.FC<CanProps> = ({ do: permissions, be: roles, children, fallback }) => {
  const { hasRole, hasPermission } = useAuth();

  let authorized = true;
  if (roles) authorized = authorized && hasRole(roles);
  if (permissions) authorized = authorized && hasPermission(permissions);

  return authorized ? <>{children}</> : <>{fallback}</>;
};