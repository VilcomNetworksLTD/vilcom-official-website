import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Redirect /dashboard to the appropriate dashboard based on user role.
// We MUST wait for isLoading to be false before checking roles — otherwise
// the user object is null (still being fetched) and everyone lands on /client/dashboard.
const DashboardRedirect = () => {
  const { getDashboardUrl, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Render a spinner while auth state is being restored from localStorage/API
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to={getDashboardUrl()} replace />;
};

export default DashboardRedirect;
