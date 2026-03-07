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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permissions: string | string[]) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  getDashboardUrl: () => string;
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

// ============================================
// API URL
// ============================================

const API_URL = import.meta.env.VITE_API_URL || '';

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
          const response = await fetch(`${API_URL}/auth/user`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.user) {
              setUser(data.data.user);
              localStorage.setItem('auth_user', JSON.stringify(data.data.user));
            }
          } else if (response.status === 401) {
            // Token invalid, clear auth state
            handleLogout();
          }
        } catch (error) {
          console.error('Failed to load user', error);
          handleLogout();
        }
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // ============================================
  // AUTH FUNCTIONS
  // ============================================

  const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requires_2fa) {
        throw new Error('2FA_REQUIRED');
      }
      throw new Error(data.message || 'Login failed');
    }

    if (data.success && data.data) {
      const { user: userData, token: authToken } = data.data;
      
      // Store token
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const logout = async (): Promise<void> => {
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });
      } catch (error) {
        console.error('Logout request failed', error);
      }
    }
    
    handleLogout();
  };

  const register = async (data: RegisterData): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.errors ? JSON.stringify(result.errors) : 'Registration failed');
    }

    if (result.success && result.data) {
      const { user: userData, token: authToken } = result.data;
      
      // Store token
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
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

  /**
   * Get the appropriate dashboard URL based on user role
   * Priority: admin > staff > client
   */
  const getDashboardUrl = (): string => {
    if (!user) return '/';
    
    if (hasRole('admin')) {
      return '/admin/dashboard';
    }
    
    if (hasRole(['staff', 'sales', 'technical_support', 'web_developer', 'content_manager'])) {
      return '/staff/dashboard';
    }
    
    // Default to client dashboard
    return '/client/dashboard';
  };

  const hasPermission = (permissions: string | string[]): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.roles?.some((role: Role) => role.name === 'admin')) {
      return true;
    }
    
    const permArray = Array.isArray(permissions) ? permissions : [permissions];
    return user.permissions?.some((perm: Permission) => permArray.includes(perm.name)) || false;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  // Check roles
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

  // Check permissions
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
  do?: string | string[]; // permissions
  be?: string | string[]; // roles
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditional rendering based on permissions or roles
 * 
 * Usage:
 * <Can do="products.create">
 *   <CreateProductButton />
 * </Can>
 * 
 * <Can be="admin">
 *   <AdminPanel />
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ do: permissions, be: roles, children, fallback }) => {
  const { hasRole, hasPermission } = useAuth();

  let authorized = true;

  if (roles) {
    authorized = authorized && hasRole(roles);
  }

  if (permissions) {
    authorized = authorized && hasPermission(permissions);
  }

  return authorized ? <>{children}</> : <>{fallback}</>;
};

