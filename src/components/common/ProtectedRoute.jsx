import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../layout/AppSidebar';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { token, activeAccount } = useAuth();

  if (!token) return <Navigate to="/" replace />;

  if (location.pathname !== '/dashboard' && !activeAccount) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto w-full">
        {children}
      </div>
    </div>
  );
}
