import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Redirect /dashboard to the appropriate dashboard based on user role
const DashboardRedirect = () => {
  const { getDashboardUrl, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <Navigate to={getDashboardUrl()} replace />;
};

export default DashboardRedirect;

