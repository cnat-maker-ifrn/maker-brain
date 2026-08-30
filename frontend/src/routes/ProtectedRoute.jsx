import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { AppLayout } from '@/components/layout/AppLayout';

export function ProtectedRoute({ allowedGroups }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedGroups && !allowedGroups.some((group) => user.groups.includes(group))) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}