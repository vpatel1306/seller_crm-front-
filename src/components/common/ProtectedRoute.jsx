import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { token, activeAccount } = useAuth();

  if (!token) return <Navigate to="/" replace />;

  if (location.pathname !== '/dashboard' && !activeAccount) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
