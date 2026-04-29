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
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="space-y-8 max-w-[1700px] mx-auto">
          {/* TOP CONTROL & EXECUTIVE BAR */}
          <div className="grid gap-6 lg:grid-cols-[400px_1fr] items-start">
            <div className="space-y-6">
              <Sidebar accountDetails={accountDetails} />
            </div>

            <div className="min-w-0">
              <DashboardCards
                viewMode="executive"
                onMetricsReady={setMetrics}
                onAccountDetail={setAccountDetails}
              />
              <DashboardMetricsRow metrics={metrics} />
            </div>
          </div>

          {/* MAIN FULL-WIDTH OPERATIONAL REPOSITORY */}
          <div className="w-full">
            <DashboardCards
              viewMode="operational"
              onMetricsReady={setMetrics}
              onAccountDetail={setAccountDetails}
            />
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
