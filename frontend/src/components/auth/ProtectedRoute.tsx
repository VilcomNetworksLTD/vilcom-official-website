import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRoles?: string | string[];
  requirePermissions?: string | string[];
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRoles,
  requirePermissions,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback || <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check roles
  if (requireRoles) {
    const roles = Array.isArray(requireRoles) ? requireRoles : [requireRoles];
    if (!roles.some(role => hasRole(role))) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permissions
  if (requirePermissions) {
    const permissions = Array.isArray(requirePermissions) ? requirePermissions : [requirePermissions];
    if (!permissions.some(permission => hasPermission(permission))) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

