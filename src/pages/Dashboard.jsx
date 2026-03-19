import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/common/Loader';

export default function Dashboard() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      fetchUser()
        .catch(() => setError('Failed to load user data.'))
        .finally(() => setLoading(false));
    }
  }, [user, fetchUser]);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-layout">
      <Navbar />
      <motion.main
        className="dashboard-main"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {error && <div className="dashboard-error">{error}</div>}
        <h2 className="dashboard-heading">Dashboard</h2>
        {user && (
          <div className="user-card">
            <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <h3 className="user-name">{user.name}</h3>
              <p className="user-detail">📧 {user.email}</p>
              {user.contact && <p className="user-detail">📞 {user.contact}</p>}
            </div>
          </div>
        )}
      </motion.main>
    </div>
  );
}
