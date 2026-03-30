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
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <motion.main
        className="flex-1 p-8 max-md:p-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {error && <div className="bg-[#fef2f2] text-error border border-[#fecaca] rounded-inner px-4 py-2.5 mb-4 text-[0.875rem]">{error}</div>}
        <h2 className="text-[1.5rem] font-bold mb-6 text-text mx-2">Dashboard</h2>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-3/4">
            <DashboardCards />
          </div>
          <div className="w-full lg:w-1/4">
            <Sidebar />
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
