import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import Loader from '../components/common/Loader';
import DashboardCards from '../components/dashboard/DashboardCards';
import DashboardMetricsRow from '../components/dashboard/DashboardMetricsRow';
import Sidebar from '../components/dashboard/Sidebar';

export default function Dashboard() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(!user);
  const [metrics, setMetrics] = useState([]);
  const [accountDetails, setAccountDetails] = useState(null);
  useEffect(() => {
    if (!user) {
      fetchUser().finally(() => setLoading(false));
    }
  }, [user, fetchUser]);

  if (loading) return <Loader />;

  return (
    <AppShell mainClassName="pt-4 lg:pt-5">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-stretch 2xl:gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="min-w-0 h-full">
            <Sidebar accountDetails={accountDetails}/>
          </div>
          <div className="min-w-0">
            <DashboardCards  onMetricsReady={setMetrics} onAccountDetail={setAccountDetails} />
          </div>
        </div>

        <DashboardMetricsRow metrics={metrics} />
      </motion.div>
    </AppShell>
  );
}
