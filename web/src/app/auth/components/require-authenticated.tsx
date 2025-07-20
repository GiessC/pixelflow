import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/auth.context';

export function RequireAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' />;
  }

  return <Outlet />;
}
