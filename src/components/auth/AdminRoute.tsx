import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * Route guard that requires administrator role.
 * Non-admin operators are bounced back to /settings.
 */
export const AdminRoute = () => {
  const { currentOperator } = useApp();

  if (currentOperator?.role !== 'administrator') {
    return <Navigate to="/settings" replace />;
  }

  return <Outlet />;
};