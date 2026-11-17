import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const ProtectedRoute = () => {
  const { currentOperator } = useApp();
  const location = useLocation();

  if (!currentOperator) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};