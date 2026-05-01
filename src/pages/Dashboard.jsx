import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import Loader from '../components/common/Loader';
import DashboardCards from '../components/dashboard/DashboardCards';
import DashboardMetricsRow from '../components/dashboard/DashboardMetricsRow';
import Sidebar from '../components/dashboard/Sidebar';
import DateSectionModal from '../components/layout/DateSectionModal';
import AccountModal from '../components/layout/AccountModal';
import AccountSelectModal from '../components/layout/AccountSelectModal';
import api from '../services/api';
import { FiCalendar, FiChevronDown } from 'react-icons/fi';

const fmtDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Dashboard() {
  const { user, fetchUser, activeAccount, setActiveAccount, selectedDateRange } = useAuth();
  const [loading, setLoading] = useState(!user);
  const [metrics, setMetrics] = useState([]);
  const [accountDetails, setAccountDetails] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [modal, setModal] = useState(null);
  const [showAccountSelectModal, setShowAccountSelectModal] = useState(false);

  const fetchAccounts = useCallback(async (preserveActive = false) => {
    try {
      const res = await api.get('/accounts-list/?skip=0&limit=100');
      const list = res.data?.data || [];
      setAccounts(list);
  
      if (!activeAccount) {
        const savedId = localStorage.getItem('activeAccountId');
        const matched = savedId ? list.find((acc) => String(acc.id) === savedId) : null;
        setActiveAccount(matched || null);
      } else if (preserveActive) {
        const latestActive = list.find((acc) => acc.id === activeAccount.id);
        setActiveAccount(latestActive || null);
      }
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    } finally {
      setLoadingAccounts(false);
    }
  }, [activeAccount, setActiveAccount]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const requiresAccountSetup = !loading && !loadingAccounts && accounts.length === 0;
  const requiresAccountSelection = !loading && !loadingAccounts && accounts.length > 0 && !activeAccount;

  useEffect(() => {
    if (requiresAccountSetup) {
      setModal('add');
    } else if (requiresAccountSelection) {
      setShowAccountSelectModal(true);
    }
  }, [requiresAccountSetup, requiresAccountSelection]);

  useEffect(() => {
    if (!user) {
      fetchUser().finally(() => setLoading(false));
    }
  }, [user, fetchUser]);

  if (loading) return <Loader />;

  return (
    <AppShell mainClassName="pt-4 lg:pt-5">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="space-y-3 max-w-[1700px] mx-auto">
          {/* EXECUTIVE OVERVIEW CARDS - OUTSIDE THE GRID */}
          <DashboardCards
            viewMode="executive-cards"
            onMetricsReady={setMetrics}
            onAccountDetail={setAccountDetails}
            extraAction={
              <button 
                onClick={() => setShowDateModal(true)}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-2 px-3.5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all group"
              >
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <FiCalendar size={14} />
                </div>
                <div className="text-left">
                  <div className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest leading-none">Filter Range</div>
                  <div className="text-[0.7rem] font-black text-slate-900 mt-0.5">
                    {selectedDateRange.from ? fmtDate(selectedDateRange.from) : '-'} — {selectedDateRange.to ? fmtDate(selectedDateRange.to) : 'Today'}
                  </div>
                </div>
                <FiChevronDown className="ml-1 text-slate-400 group-hover:text-primary transition-colors" size={14} />
              </button>
            }
          />

          {/* HIGH-DENSITY COMMAND CENTER GRID */}
          <div className="grid gap-3 xl:grid-cols-4 items-stretch">
            {/* COLUMN 1: ACCOUNT ANALYSIS */}
            <Sidebar accountDetails={accountDetails} />

            {/* COLUMN 2: FINANCIAL HEALTH */}
            <DashboardCards
              viewMode="executive-charts"
              onMetricsReady={setMetrics}
              onAccountDetail={setAccountDetails}
            />

            {/* COLUMN 3: BUSINESS PROFILE (RADAR) */}
            <DashboardMetricsRow metrics={metrics} mode="radar" />

            {/* COLUMN 4: TODAY'S PULSE (BARS) */}
            <DashboardMetricsRow metrics={metrics} mode="pulse" />
          </div>

          <div className="space-y-3">
            <DashboardCards
              viewMode="operational"
              onMetricsReady={setMetrics}
              onAccountDetail={setAccountDetails}
            />
          </div>
        </div>
      </motion.div>
      <DateSectionModal 
        isOpen={showDateModal} 
        onClose={() => setShowDateModal(false)} 
        onDateSelect={() => setShowDateModal(false)} 
      />
      {modal ? (
        <AccountModal
          mode={modal}
          initialData={modal === 'edit' ? activeAccount : null}
          disableClose={requiresAccountSetup && modal === 'add'}
          onClose={() => { if (requiresAccountSetup && modal === 'add') return; setModal(null); }}
          onSuccess={() => { setModal(null); fetchAccounts(true); }}
        />
      ) : null}
      {showAccountSelectModal ? (
        <AccountSelectModal
          isOpen={showAccountSelectModal}
          onClose={() => {
            if (!requiresAccountSelection) {
              setShowAccountSelectModal(false);
            }
          }}
        />
      ) : null}
    </AppShell>
  );
}
