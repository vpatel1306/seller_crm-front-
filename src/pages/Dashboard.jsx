import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Loader from '../components/common/Loader';
import DashboardCards from '../components/dashboard/DashboardCards';
import Sidebar from '../components/dashboard/Sidebar';

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
        <h2 className="dashboard-heading mx-2">Dashboard</h2>
        <div className="row g-2">
          <div className="col-md-9">
            <DashboardCards />
          </div>
          <div className="col-md-3">
            <Sidebar />
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
