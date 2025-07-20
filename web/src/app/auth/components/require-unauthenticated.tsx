import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/auth.context';

export function RequireUnauthenticated() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to='/app/gallery' /> : <Outlet />;
}
