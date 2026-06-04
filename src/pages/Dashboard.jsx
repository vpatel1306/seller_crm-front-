import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import Loader from '../components/common/Loader';
import DateSectionModal from '../components/layout/DateSectionModal';
import AccountModal from '../components/layout/AccountModal';
import AccountSelectModal from '../components/layout/AccountSelectModal';
import api from '../services/api';
import { 
  FiCalendar, 
  FiChevronDown, 
  FiChevronLeft, 
  FiChevronRight, 
  FiSearch, 
  FiDownload, 
  FiClock, 
  FiBox, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiPercent, 
  FiDollarSign,
  FiGrid,
  FiList,
  FiArrowUpRight,
  FiLayers,
  FiPieChart,
  FiCreditCard,
  FiPlus,
  FiX,
  FiSidebar,
  FiRefreshCw
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import OrdersSidebarSection from '../components/orders/OrdersSidebarSection';
import SummaryTable from '../components/ui/SummaryTable';

// Helper formatters
const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCurrency = (value) => 
  Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Sparkline = ({ color, points }) => (
  <svg className="w-16 h-8 overflow-visible" viewBox="0 0 100 30">
    <path
      d={points}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const summaryTableProps = {
  containerClassName: 'overflow-hidden rounded-default border border-slate-200 bg-white shadow-soft transition-all mb-4',
  titleClassName: 'bg-slate-50 px-5 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500',
  headRowClassName: 'bg-white',
  headerCellClassName: 'border-b border-slate-100 px-5 py-3 text-left text-[0.62rem] font-bold uppercase tracking-widest text-slate-400',
  cellClassName: 'px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-700',
  bodyWrapperClassName: 'max-h-72 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200',
  hoverClass: 'hover:bg-slate-50',
  rowClassName: (_, i) => (i % 2 === 0 ? 'bg-white border-b !border-slate-100' : 'bg-slate-50/20 border-b !border-slate-100'),
};

const parseSummaries = (payload) => {
  if (!payload) return { orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] };

  let orderDateSummaryRows = [];
  let statusSummaryRows = [];
  let courierSummaryRows = [];

  // --- 1. Order Date Summary ---
  if (payload.grouped?.order_date && Array.isArray(payload.grouped.order_date)) {
    orderDateSummaryRows = payload.grouped.order_date.map(item => ({
      date: item.order_date || 'Unknown',
      count: item.total_orders ?? 0,
      cost: (Number(item.total_cost_amount) || 0).toFixed(2),
    }));
  } else if (payload.summaries?.date_wise && Array.isArray(payload.summaries.date_wise)) {
    orderDateSummaryRows = payload.summaries.date_wise.map(item => ({
      date: item.date || 'Unknown',
      count: item.count ?? 0,
      cost: (Number(item.cost_amt) || 0).toFixed(2),
    }));
  } else if (payload.summary?.date_wise) {
    const dw = payload.summary.date_wise;
    if (Array.isArray(dw)) {
      orderDateSummaryRows = dw.map(item => ({
        date: item.date || item.order_date || 'Unknown',
        count: item.count ?? item.total_orders ?? 0,
        cost: (Number(item.cost_amt) || Number(item.total_cost_amount) || 0).toFixed(2),
      }));
    } else {
      orderDateSummaryRows = Object.entries(dw || {}).map(([key, val]) => {
        const count = typeof val === 'object' ? (val?.count ?? val?.total_orders ?? val?.total_rows ?? val?.rows ?? val?.qty ?? val?.value ?? 0) : Number(val) || 0;
        const cost = typeof val === 'object' ? (val?.cost_amt ?? val?.cost_amount ?? val?.total_cost_amount ?? val?.amount ?? val?.total_amount ?? 0) : 0;
        return {
          date: key,
          count,
          cost: Number(cost).toFixed(2),
        };
      });
    }
  }

  // --- 2. Status Summary ---
  let tempStatusRows = [];
  if (payload.grouped?.order_summary && Array.isArray(payload.grouped.order_summary)) {
    tempStatusRows = payload.grouped.order_summary.map(item => ({
      status: item.order_status || 'Unknown',
      count: item.total_orders ?? 0,
      cost: (Number(item.total_cost_amount) || 0).toFixed(2),
    }));
  } else if (payload.summaries?.status_wise && Array.isArray(payload.summaries.status_wise)) {
    tempStatusRows = payload.summaries.status_wise.map(item => ({
      status: item.status || 'Unknown',
      count: item.count ?? 0,
      cost: (Number(item.cost_amt) || 0).toFixed(2),
    }));
  } else if (payload.summary?.status_wise_counts && Array.isArray(payload.summary.status_wise_counts)) {
    tempStatusRows = payload.summary.status_wise_counts.map(item => ({
      status: item.order_status || 'Unknown',
      count: item.order_count ?? 0,
      cost: (Number(item.cost_amount) || 0).toFixed(2),
    }));
  } else if (payload.summary?.return_type) {
    const rt = payload.summary.return_type;
    if (Array.isArray(rt)) {
      tempStatusRows = rt.map(item => ({
        status: item.return_type || item.status || 'Unknown',
        count: item.count ?? 0,
        cost: (Number(item.cost_amt) || Number(item.amount) || 0).toFixed(2),
      }));
    } else {
      tempStatusRows = Object.entries(rt || {}).map(([key, val]) => {
        const count = typeof val === 'object' ? (val?.count ?? val?.total_orders ?? val?.total_rows ?? val?.rows ?? val?.qty ?? val?.value ?? 0) : Number(val) || 0;
        const cost = typeof val === 'object' ? (val?.cost_amt ?? val?.cost_amount ?? val?.total_cost_amount ?? val?.amount ?? val?.total_amount ?? 0) : 0;
        return {
          status: key,
          count,
          cost: Number(cost).toFixed(2),
        };
      });
    }
  }

  // Merge same status rows case-insensitively
  const mergedStatus = {};
  tempStatusRows.forEach(item => {
    const rawStatus = item.status || 'Unknown';
    const key = rawStatus.toUpperCase().trim();
    if (!mergedStatus[key]) {
      mergedStatus[key] = {
        status: rawStatus,
        count: 0,
        costVal: 0
      };
    }
    mergedStatus[key].count += Number(item.count || 0);
    mergedStatus[key].costVal += Number(item.cost || 0);
  });
  statusSummaryRows = Object.values(mergedStatus).map(item => ({
    status: item.status,
    count: item.count,
    cost: item.costVal.toFixed(2)
  }));

  // --- 3. Courier Summary ---
  if (payload.grouped?.courier && Array.isArray(payload.grouped.courier)) {
    courierSummaryRows = payload.grouped.courier.map(item => ({
      courier: item.courier_partner || 'Unknown',
      pickup: item.total_orders ?? 0,
      cost: (Number(item.total_cost_amount) || 0).toFixed(2),
    }));
  } else if (payload.summaries?.courier_wise && Array.isArray(payload.summaries.courier_wise)) {
    courierSummaryRows = payload.summaries.courier_wise.map(item => ({
      courier: item.courier || 'Unknown',
      pickup: item.count ?? 0,
      cost: (Number(item.cost_amt) || 0).toFixed(2),
    }));
  } else if (payload.summary?.courier) {
    const cr = payload.summary.courier;
    if (Array.isArray(cr)) {
      courierSummaryRows = cr.map(item => ({
        courier: item.courier || item.courier_partner || 'Unknown',
        pickup: item.count ?? item.total_orders ?? 0,
        cost: (Number(item.cost_amt) || Number(item.total_cost_amount) || 0).toFixed(2),
      }));
    } else {
      courierSummaryRows = Object.entries(cr || {}).map(([key, val]) => {
        const count = typeof val === 'object' ? (val?.count ?? val?.total_orders ?? val?.total_rows ?? val?.rows ?? val?.qty ?? val?.value ?? 0) : Number(val) || 0;
        const cost = typeof val === 'object' ? (val?.cost_amt ?? val?.cost_amount ?? val?.total_cost_amount ?? val?.amount ?? val?.total_amount ?? 0) : 0;
        return {
          courier: key,
          pickup: count,
          cost: Number(cost).toFixed(2),
        };
      });
    }
  }

  return { orderDateSummaryRows, statusSummaryRows, courierSummaryRows };
};

export default function Dashboard() {
  const { user, fetchUser, activeAccount, setActiveAccount, selectedDateRange, setSelectedDateRange } = useAuth();
  
  // Dashboard overall states
  const [loading, setLoading] = useState(!user);
  const [dashboardData, setDashboardData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [modal, setModal] = useState(null);
  const [showAccountSelectModal, setShowAccountSelectModal] = useState(false);
  
  // New UI custom states
  const [activeTab, setActiveTab] = useState('action-required');
  
  // Inline filters local state
  const [localStartDate, setLocalStartDate] = useState(selectedDateRange.from || '');
  const [localEndDate, setLocalEndDate] = useState(selectedDateRange.to || '');

  // --- Tab 1 (Pending Payments) States ---
  const [pendingSkuDraft, setPendingSkuDraft] = useState('');
  const [pendingSku, setPendingSku] = useState('');
  const [pendingOrderIdDraft, setPendingOrderIdDraft] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  const [pendingOrderFilterDraft, setPendingOrderFilterDraft] = useState('All');
  const [pendingOrderFilter, setPendingOrderFilter] = useState('All');

  // --- Tab 2 (Orders Analysis) States ---
  const [ordersSkuDraft, setOrdersSkuDraft] = useState('');
  const [ordersSku, setOrdersSku] = useState('');
  const [ordersOrderIdDraft, setOrdersOrderIdDraft] = useState('');
  const [ordersOrderId, setOrdersOrderId] = useState('');
  const [ordersStatusDraft, setOrdersStatusDraft] = useState('all');
  const [ordersStatus, setOrdersStatus] = useState('all');
  const [ordersPaymentStatusDraft, setOrdersPaymentStatusDraft] = useState('all');
  const [ordersPaymentStatus, setOrdersPaymentStatus] = useState('all');

  // --- Tab 3 (Payments Analysis) States ---
  const [paymentsSkuDraft, setPaymentsSkuDraft] = useState('');
  const [paymentsSku, setPaymentsSku] = useState('');
  const [paymentsOrderIdDraft, setPaymentsOrderIdDraft] = useState('');
  const [paymentsOrderId, setPaymentsOrderId] = useState('');
  const [paymentsOrderFilterDraft, setPaymentsOrderFilterDraft] = useState('All');
  const [paymentsOrderFilter, setPaymentsOrderFilter] = useState('All');

  // --- Tab 5 (Returns Analysis) States ---
  const [returnsSkuDraft, setReturnsSkuDraft] = useState('');
  const [returnsSku, setReturnsSku] = useState('');
  const [returnsOrderIdDraft, setReturnsOrderIdDraft] = useState('');
  const [returnsOrderId, setReturnsOrderId] = useState('');

  // Tab 1 (Action Required) Pending payments states
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(10);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Sidebar Visibility State (Unified)
  const [dashboardSidebarOpen, setDashboardSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_dashboard_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Pagination Limit States
  const [ordersLimit, setOrdersLimit] = useState(10);
  const [paymentsLimit, setPaymentsLimit] = useState(10);
  const [returnsLimit, setReturnsLimit] = useState(10);

  // Summaries States
  const [pendingSummaries, setPendingSummaries] = useState({ orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] });
  const [ordersSummaries, setOrdersSummaries] = useState({ orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] });
  const [paymentsSummaries, setPaymentsSummaries] = useState({ orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] });
  const [returnsSummaries, setReturnsSummaries] = useState({ orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] });

  // Tab 2 (Orders Analysis) interactive states
  const [ordersFilter, setOrdersFilter] = useState('all'); // 'all', 'delivered', 'cancelled', 'pending', 'sla'
  const [ordersList, setOrdersList] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Tab 3 (Payments Analysis) interactive states
  const [paymentsFilter, setPaymentsFilter] = useState('received'); // 'received', 'pending', 'mismatch'
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Tab 5 (Returns Analysis) interactive states
  const [returnsFilter, setReturnsFilter] = useState('transit'); // 'transit', 'received', 'not-received', 'mismatch'
  const [returnsList, setReturnsList] = useState([]);
  const [returnsTotal, setReturnsTotal] = useState(0);
  const [returnsPage, setReturnsPage] = useState(1);
  const [returnsLoading, setReturnsLoading] = useState(false);

  // Sync inline dates when selectedDateRange changes globally
  useEffect(() => {
    setLocalStartDate(selectedDateRange.from || '');
    setLocalEndDate(selectedDateRange.to || '');
  }, [selectedDateRange]);

  // Persist sidebar visibility state in localStorage
  useEffect(() => {
    localStorage.setItem('crm_dashboard_sidebar_open', JSON.stringify(dashboardSidebarOpen));
  }, [dashboardSidebarOpen]);



  const handleApplyPendingFilters = () => {
    setPendingSku(pendingSkuDraft);
    setPendingOrderId(pendingOrderIdDraft);
    setPendingOrderFilter(pendingOrderFilterDraft);
    setPendingPage(1);
  };

  const handleResetPendingFilters = () => {
    setPendingSkuDraft('');
    setPendingSku('');
    setPendingOrderIdDraft('');
    setPendingOrderId('');
    setPendingOrderFilterDraft('All');
    setPendingOrderFilter('All');
    setPendingPage(1);
  };

  const handleApplyOrdersFilters = () => {
    setOrdersSku(ordersSkuDraft);
    setOrdersOrderId(ordersOrderIdDraft);
    setOrdersStatus(ordersStatusDraft);
    setOrdersPaymentStatus(ordersPaymentStatusDraft);
    setOrdersPage(1);
  };

  const handleResetOrdersFilters = () => {
    setOrdersSkuDraft('');
    setOrdersSku('');
    setOrdersOrderIdDraft('');
    setOrdersOrderId('');
    setOrdersStatusDraft('all');
    setOrdersStatus('all');
    setOrdersPaymentStatusDraft('all');
    setOrdersPaymentStatus('all');
    setOrdersPage(1);
  };

  const handleApplyPaymentsFilters = () => {
    setPaymentsSku(paymentsSkuDraft);
    setPaymentsOrderId(paymentsOrderIdDraft);
    setPaymentsOrderFilter(paymentsOrderFilterDraft);
    setPaymentsPage(1);
  };

  const handleResetPaymentsFilters = () => {
    setPaymentsSkuDraft('');
    setPaymentsSku('');
    setPaymentsOrderIdDraft('');
    setPaymentsOrderId('');
    setPaymentsOrderFilterDraft('All');
    setPaymentsOrderFilter('All');
    setPaymentsPage(1);
  };

  const handleApplyReturnsFilters = () => {
    setReturnsSku(returnsSkuDraft);
    setReturnsOrderId(returnsOrderIdDraft);
    setReturnsPage(1);
  };

  const handleResetReturnsFilters = () => {
    setReturnsSkuDraft('');
    setReturnsSku('');
    setReturnsOrderIdDraft('');
    setReturnsOrderId('');
    setReturnsPage(1);
  };

  // Fetch standard dashboard summary data
  const fetchDashboardData = useCallback(async () => {
    if (!activeAccount?.id || !selectedDateRange?.from || !selectedDateRange?.to) return;

    try {
      const res = await api.post('/get-dashboard-summary', {
        start_date: selectedDateRange.from,
        end_date: selectedDateRange.to,
      }, {
        headers: { account: activeAccount.id },
      });
      setDashboardData(res.data || {});
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData({});
    }
  }, [activeAccount?.id, selectedDateRange?.from, selectedDateRange?.to]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch Action Required (Tab 1) pending payments
  const fetchPendingPayments = useCallback(async () => {
    if (!activeAccount?.id || activeTab !== 'action-required') return;
    setPendingLoading(true);
    try {
      const payload = {
        filter_data: {
          start_date: selectedDateRange.from || '',
          end_date: selectedDateRange.to || '',
          ...(pendingOrderId.trim() ? { order_id: pendingOrderId.trim() } : {}),
          ...(pendingSku.trim() ? { sku: pendingSku.trim() } : {})
        },
        order_filter: pendingOrderFilter,
        page_no: pendingPage,
        limit: pendingLimit,
      };
      const res = await api.post('/get-pending-payment-orders', payload, {
        headers: { account: activeAccount.id }
      });
      const data = res.data || {};
      setPendingOrders(data.data || []);
      setPendingTotal(Number(data.total_count ?? data.total_rows ?? data.total) || (data.data || []).length);
      setPendingSummaries(parseSummaries(data));
    } catch (error) {
      console.error('Failed to fetch pending payments:', error);
      setPendingOrders([]);
      setPendingTotal(0);
      setPendingSummaries({ orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] });
    } finally {
      setPendingLoading(false);
    }
  }, [activeAccount?.id, activeTab, pendingPage, pendingLimit, pendingOrderId, pendingSku, pendingOrderFilter, selectedDateRange?.from, selectedDateRange?.to]);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  // Fetch Orders Analysis (Tab 2) Details List
  const fetchOrdersAnalysis = useCallback(async () => {
    if (!activeAccount?.id || activeTab !== 'orders-analysis') return;
    setOrdersLoading(true);
    try {
      let endpoint = '/get-orders';
      let extraFilter = {};

      if (ordersFilter === 'delivered') {
        extraFilter = { order_status: 'DELIVERED' };
      } else if (ordersFilter === 'cancelled') {
        extraFilter = { order_status: 'CANCELLED' };
      } else if (ordersFilter === 'ready_to_ship') {
        extraFilter = { order_status: 'READY_TO_SHIP' };
      } else if (ordersFilter === 'out_for_delivery') {
        extraFilter = { order_status: 'Delivering Today' };
      } else if (ordersFilter === 'returned') {
        extraFilter = { status: ['Return In Transit', 'Return Received', 'Return Not Receive', 'Return', 'RTO'] };
      } else if (ordersFilter === 'pending') {
        endpoint = '/get-pending-payment-orders';
      } else if (ordersFilter === 'sla' || ordersFilter === 'unsettled-pickup') {
        endpoint = '/get-unsettled-pickup-orders';
      } else if (ordersFilter === 'cancel-pickup') {
        endpoint = '/get-cancel-pickup-orders';
      } else if (ordersFilter === 'approved-claims' || ordersFilter === 'pending-claims') {
        endpoint = '/get-approved-claim-orders';
        if (ordersFilter === 'approved-claims') {
          extraFilter = { claim_status: 'Approved' };
        } else if (ordersFilter === 'pending-claims') {
          extraFilter = { claim_status: 'Pending' };
        }
      } else if (ordersFilter === 'wrong-return-claims') {
        endpoint = '/get-wrong-return-claim-orders';
      }

      if (ordersStatus !== 'all') {
        extraFilter.order_status = ordersStatus;
      }
      if (ordersPaymentStatus !== 'all') {
        extraFilter.payment_status = ordersPaymentStatus;
      }

      const payload = {
        filter_data: {
          start_date: selectedDateRange.from || '',
          end_date: selectedDateRange.to || '',
          ...extraFilter,
          ...(ordersOrderId.trim() ? { platform_order_id: ordersOrderId.trim() } : {}),
          ...(ordersSku.trim() ? { sku: ordersSku.trim() } : {})
        },
        page_no: ordersPage,
        limit: ordersLimit,
      };

      if (endpoint === '/get-pending-payment-orders') {
        payload.order_filter = 'All';
      }

      const res = await api.post(endpoint, payload, {
        headers: { account: activeAccount.id }
      });
      const data = res.data || {};
      setOrdersList(data.data || []);
      setOrdersTotal(Number(data.total_count ?? data.total_rows ?? data.total) || (data.data || []).length);
      setOrdersSummaries(parseSummaries(data));
    } catch (error) {
      console.error('Failed to fetch orders analysis list:', error);
      setOrdersList([]);
      setOrdersTotal(0);
      setOrdersSummaries({ orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] });
    } finally {
      setOrdersLoading(false);
    }
  }, [activeAccount?.id, activeTab, ordersFilter, ordersPage, ordersLimit, ordersOrderId, ordersSku, ordersStatus, ordersPaymentStatus, selectedDateRange?.from, selectedDateRange?.to]);

  useEffect(() => {
    fetchOrdersAnalysis();
  }, [fetchOrdersAnalysis]);

  useEffect(() => {
    setOrdersPage(1);
  }, [ordersFilter]);

  // Fetch Payments Analysis (Tab 3) Details List
  const fetchPaymentsAnalysis = useCallback(async () => {
    if (!activeAccount?.id || activeTab !== 'payments-analysis') return;
    setPaymentsLoading(true);
    try {
      let endpoint = '/get-received-payment-orders';
      if (paymentsFilter === 'pending') {
        endpoint = '/get-pending-payment-orders';
      } else if (paymentsFilter === 'mismatch') {
        endpoint = '/get-payment-mismatch-orders';
      }

      const payload = {
        filter_data: {
          start_date: selectedDateRange.from || '',
          end_date: selectedDateRange.to || '',
          ...(paymentsOrderId.trim() ? { order_id: paymentsOrderId.trim() } : {}),
          ...(paymentsSku.trim() ? { sku: paymentsSku.trim() } : {})
        },
        page_no: paymentsPage,
        limit: paymentsLimit,
      };

      if (endpoint === '/get-pending-payment-orders' || endpoint === '/get-received-payment-orders') {
        payload.order_filter = paymentsOrderFilter;
      }

      const res = await api.post(endpoint, payload, {
        headers: { account: activeAccount.id }
      });
      const data = res.data || {};
      setPaymentsList(data.data || []);
      setPaymentsTotal(Number(data.total_count ?? data.total_rows ?? data.total) || (data.data || []).length);
      setPaymentsSummaries(parseSummaries(data));
    } catch (error) {
      console.error('Failed to fetch payments analysis list:', error);
      setPaymentsList([]);
      setPaymentsTotal(0);
      setPaymentsSummaries({ orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] });
    } finally {
      setPaymentsLoading(false);
    }
  }, [activeAccount?.id, activeTab, paymentsFilter, paymentsPage, paymentsLimit, paymentsOrderId, paymentsSku, paymentsOrderFilter, selectedDateRange?.from, selectedDateRange?.to]);

  useEffect(() => {
    fetchPaymentsAnalysis();
  }, [fetchPaymentsAnalysis]);

  useEffect(() => {
    setPaymentsPage(1);
  }, [paymentsFilter]);

  // Fetch Returns Analysis (Tab 5) Details List
  const fetchReturnsAnalysis = useCallback(async () => {
    if (!activeAccount?.id || activeTab !== 'returns-analysis') return;
    setReturnsLoading(true);
    try {
      let endpoint = '/get-pending-returns';
      let extraFilter = {};

      if (returnsFilter === 'transit') {
        extraFilter = { status: ['RETURN_IN_TRANSIT'] };
      } else if (returnsFilter === 'received') {
        endpoint = '/get-received-returns';
      } else if (returnsFilter === 'not-received') {
        endpoint = '/get-pending-returns';
      } else if (returnsFilter === 'mismatch') {
        endpoint = '/get-return-mismatch-returns';
      }

      const payload = {
        filter_data: {
          start_date: selectedDateRange.from || '',
          end_date: selectedDateRange.to || '',
          ...extraFilter,
          ...(returnsOrderId.trim() ? { order_id: returnsOrderId.trim() } : {}),
          ...(returnsSku.trim() ? { sku: returnsSku.trim() } : {})
        },
        page_no: returnsPage,
        limit: returnsLimit,
      };

      const res = await api.post(endpoint, payload, {
        headers: { account: activeAccount.id }
      });
      const data = res.data || {};
      setReturnsList(data.data || []);
      setReturnsTotal(Number(data.total_count ?? data.total_rows ?? data.total) || (data.data || []).length);
      setReturnsSummaries(parseSummaries(data));
    } catch (error) {
      console.error('Failed to fetch returns analysis list:', error);
      setReturnsList([]);
      setReturnsTotal(0);
      setReturnsSummaries({ orderDateSummaryRows: [], statusSummaryRows: [], courierSummaryRows: [] });
    } finally {
      setReturnsLoading(false);
    }
  }, [activeAccount?.id, activeTab, returnsFilter, returnsPage, returnsLimit, returnsOrderId, returnsSku, selectedDateRange?.from, selectedDateRange?.to]);

  useEffect(() => {
    fetchReturnsAnalysis();
  }, [fetchReturnsAnalysis]);

  useEffect(() => {
    setReturnsPage(1);
  }, [returnsFilter]);

  // Export Pending Payments as CSV
  const exportPendingPayments = async () => {
    if (!activeAccount?.id) return;
    try {
      const payload = {
        filter_data: {
          start_date: pendingFromDate,
          end_date: pendingToDate,
          ...(pendingOrderId.trim() ? { order_id: pendingOrderId.trim() } : {}),
          ...(pendingSku.trim() ? { sku: pendingSku.trim() } : {})
        },
        order_filter: pendingOrderFilter,
        page_no: 1,
        limit: 2000,
      };
      const res = await api.post('/get-pending-payment-orders', payload, {
        headers: { account: activeAccount.id }
      });
      const data = res.data?.data || [];
      if (data.length === 0) {
        alert("No pending payment records to export.");
        return;
      }

      // Format CSV
      const headers = ['Order ID', 'Order Date', 'SKU', 'Order Status', 'Payment Status'];
      const rows = data.map(order => [
        order.platform_order_id || '',
        order.order_date || '',
        order.sku || '',
        order.order_status || 'DELIVERED',
        'Pending'
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `pending_payments_${activeAccount.account_name || 'account'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export pending payments:', error);
    }
  };

  // Fetch accounts list
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

  // Deconstruct API metrics
  const dashboardCards = dashboardData?.dashboard_cards || {};
  const accountStatus = dashboardData?.account_status || {};
  const overview = dashboardData?.overview || { headline_metrics: {} };
  const headlineMetrics = overview.headline_metrics || {};

  // Extracted values for Orders Analysis
  const totalOrdersVal = dashboardCards.all_orders?.total_orders || 0;
  const deliveredOrdersVal = dashboardCards.delivered?.total_orders || 0;
  const cancelledOrdersVal = dashboardCards.cancelled?.total_orders || 0;
  const pendingOrdersVal = dashboardCards.pending_payment?.total_orders || 0;
  const slaBreachedOrdersVal = dashboardCards.unsettled_pickup?.total_orders || 0;
  const totalQuantityVal = headlineMetrics.total_sales_orders || 0;

  // Chart data for Returns Analysis
  const returnsChartData = [
    { name: 'On The Way', count: Number(dashboardCards.return_in_transit?.total_orders || 0), color: '#f59e0b' },
    { name: 'Received', count: Number(dashboardCards.return_received?.total_orders || 0), color: '#10b981' },
    { name: 'Not Received', count: Number(dashboardCards.return_not_received?.total_orders || 0), color: '#f43f5e' },
    { name: 'Wrong/Damaged', count: Number(dashboardCards.return_mismatch?.total_orders || 0), color: '#ef4444' },
  ];

  return (
    <AppShell mainClassName="pt-4 lg:pt-5 bg-[#f8fafc]">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="space-y-4 max-w-[1700px] mx-auto">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Overview of your business performance</p>
            </div>
            
            {/* FILTER BY DATE */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none border-l-2 border-primary pl-1.5">Filter by Order Date <span className="text-[9px] font-bold text-slate-300 ml-0.5">(Max 3 months)</span></span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                <div className="relative flex-1 sm:flex-initial">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="w-full sm:w-36 bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary transition-all shadow-soft"
                  />
                </div>
                <div className="relative flex-1 sm:flex-initial">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                  <input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="w-full sm:w-36 bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary transition-all shadow-soft"
                  />
                </div>
                <button
                  onClick={() => {
                    if (localStartDate && localEndDate) {
                      setSelectedDateRange({ from: localStartDate, to: localEndDate });
                    }
                  }}
                  className="bg-primary text-white text-xs font-black px-4 py-2 rounded-xl shadow-soft hover:bg-primary/95 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap text-center"
                >
                  Apply Date Filter
                </button>
              </div>
            </div>
          </div>

          {/* TAB BAR SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 gap-3">
            <div className="flex items-center gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
              {[
                { id: 'action-required', label: 'Action Required' },
                { id: 'orders-analysis', label: 'Orders Analysis' },
                { id: 'payments-analysis', label: 'Payments Analysis' },
                // { id: 'ads-analysis', label: 'Ads Analysis' },
                { id: 'returns-analysis', label: 'Returns Analysis' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-black uppercase tracking-wider pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>



          {/* DYNAMIC TAB BODY */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* TAB 1: ACTION REQUIRED */}
              {activeTab === 'action-required' && (
                <div className="space-y-4">
                  
                  {/* Priority row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* High Priority */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all flex justify-between items-center group">
                      <div>
                        <span className="text-[10px] font-black text-error uppercase tracking-widest">High Priority</span>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">Settlement overdue (15+ days)</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2.5">
                          {formatCount(pendingTotal)} <span className="text-xs font-bold text-slate-400">orders</span>
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-800 group-hover:scale-105 transition-transform">{formatCount(pendingTotal)}</span>
                        <Sparkline color="#E24A31" points="M 5 25 Q 25 10 50 15 T 95 5" />
                      </div>
                    </div>

                    {/* Medium Priority */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all flex justify-between items-center group">
                      <div>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Medium Priority</span>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">Pending settlement (7-14 days)</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2.5">
                          0 <span className="text-xs font-bold text-slate-400">orders</span>
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-800 group-hover:scale-105 transition-transform">0</span>
                        <Sparkline color="#f59e0b" points="M 5 20 L 95 20" />
                      </div>
                    </div>

                    {/* Low Priority */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all flex justify-between items-center group">
                      <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Low Priority</span>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">Recently delivered (0-6 days)</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2.5">
                          0 <span className="text-xs font-bold text-slate-400">orders</span>
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-800 group-hover:scale-105 transition-transform">0</span>
                        <Sparkline color="#3755AD" points="M 5 20 L 95 20" />
                      </div>
                    </div>

                  </div>

                  {/* Pending Payments List & Sidebar Grid */}
                  <div className={`grid gap-3 xl:gap-3 ${dashboardSidebarOpen ? 'xl:grid-cols-[320px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
                    
                    {dashboardSidebarOpen && (
                      <OrdersSidebarSection>
                        <SummaryTable
                          {...summaryTableProps}
                          title="Order Date Summary"
                          rows={pendingSummaries.orderDateSummaryRows}
                          cols={[
                            { key: 'date', label: 'Order Date', color: () => 'text-text' },
                            { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                        <SummaryTable
                          {...summaryTableProps}
                          title="Status Summary"
                          rows={pendingSummaries.statusSummaryRows}
                          cols={[
                            {
                              key: 'status',
                              label: 'Status',
                              color: (row) => (row.status.startsWith('RTO') ? 'text-rose-600 font-bold' : row.status === 'DELIVERED' ? 'text-emerald-600 font-bold' : 'text-text'),
                            },
                            { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                        <SummaryTable
                          {...summaryTableProps}
                          title="Courier Summary"
                          rows={pendingSummaries.courierSummaryRows}
                          cols={[
                            { key: 'courier', label: 'Courier', color: () => 'text-text' },
                            { key: 'pickup', label: 'Pickup', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                      </OrdersSidebarSection>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-800">Pending Payments</h3>
                          <span className="bg-blue-50 text-blue-600 text-xs font-extrabold px-2.5 py-1 rounded-full">{formatCount(pendingTotal)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                          <button 
                            onClick={exportPendingPayments}
                            className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-soft hover:bg-emerald-700 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <FiDownload size={14} />
                            <span>Export Pending Payments</span>
                          </button>



                          <button
                            onClick={() => setDashboardSidebarOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft cursor-pointer transition-all"
                          >
                            <FiSidebar size={14} />
                            <span>{dashboardSidebarOpen ? 'Hide Summary' : 'Show Summary'}</span>
                          </button>

                          <button
                            onClick={() => fetchPendingPayments()}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft cursor-pointer transition-all"
                          >
                            <FiRefreshCw size={13} className="text-slate-400" />
                            <span>Refresh</span>
                          </button>
                        </div>
                      </div>

                      {/* Pending Payments Filters */}
                      <div className="crm-panel-muted p-4 sm:p-5 mb-5 shadow-soft">
                        <div className="flex flex-wrap items-end gap-3">
                          
                          {/* SKU Filter */}
                          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">SKU</label>
                            <div className="relative group">
                              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                              <input
                                type="text"
                                value={pendingSkuDraft}
                                onChange={(e) => setPendingSkuDraft(e.target.value)}
                                placeholder="Search SKU..."
                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Order ID Filter */}
                          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order ID</label>
                            <div className="relative group">
                              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                              <input
                                type="text"
                                value={pendingOrderIdDraft}
                                onChange={(e) => setPendingOrderIdDraft(e.target.value)}
                                placeholder="Search Order ID..."
                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Order Filter */}
                          <div className="flex flex-col gap-1.5 w-44">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order Filter</label>
                            <div className="relative">
                              <select
                                value={pendingOrderFilterDraft}
                                onChange={(e) => setPendingOrderFilterDraft(e.target.value)}
                                className="h-9 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner hover:border-slate-300"
                              >
                                <option value="All">All Orders</option>
                                <option value="Profit">Profit Orders Only</option>
                                <option value="Loss">Loss Orders Only</option>
                              </select>
                              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={handleApplyPendingFilters}
                              className="h-9 bg-primary text-white text-xs font-black px-6 rounded-xl shadow-soft hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                            >
                              Apply
                            </button>
                            <button
                              onClick={handleResetPendingFilters}
                              className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-5 rounded-xl transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Pending Payments Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                              <th className="py-3 px-4">Order ID</th>
                              <th className="py-3 px-4">Order Date</th>
                              <th className="py-3 px-4">SKU</th>
                              <th className="py-3 px-4 text-right">Qty</th>
                              <th className="py-3 px-4">Order Status</th>
                              <th className="py-3 px-4">AWB Number</th>
                              <th className="py-3 px-4">Courier Partner</th>
                              <th className="py-3 px-4">Customer Name</th>
                              <th className="py-3 px-4 text-right">Cost Amount</th>
                              <th className="py-3 px-4">Pickup Date</th>
                              <th className="py-3 px-4">Dispatch Date</th>
                              <th className="py-3 px-4">Days</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingLoading ? (
                              <tr>
                                <td colSpan={13} className="py-10 text-center text-xs font-bold text-slate-400">
                                  <div className="flex flex-col items-center gap-2 justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                                    <span>Loading pending payments...</span>
                                  </div>
                                </td>
                              </tr>
                            ) : pendingOrders.length === 0 ? (
                              <tr>
                                <td colSpan={13} className="py-10 text-center text-xs font-bold text-slate-400">No pending payments found.</td>
                              </tr>
                            ) : (
                              pendingOrders.map((order, i) => (
                                <tr key={order.id || i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                                  <td className="py-4 px-4 font-black text-primary select-all">{order.platform_order_id}</td>
                                  <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                    {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </td>
                                  <td className="py-4 px-4 max-w-[200px]">
                                    <div className="font-extrabold text-amber-700 truncate" title={order.sku}>{order.sku}</div>
                                  </td>
                                  <td className="py-4 px-4 text-right font-bold text-slate-700">{order.qty || '-'}</td>
                                
                                  <td className="py-4 px-4">
                                    <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600">
                                      {order.order_status || '-'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 font-mono text-slate-600 text-[10px]">{order.awb_number || '-'}</td>
                                  <td className="py-4 px-4 font-bold text-slate-600">{order.courier_partner || '-'}</td>
                                  <td className="py-4 px-4 font-bold text-slate-600">{order.customer_name || '-'}</td>
                                  <td className="py-4 px-4 text-right font-bold text-slate-700">₹{formatCount(order.cost_amount || 0)}</td>
                                  <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                    {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </td>
                                  <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                    {order.dispatch_date ? new Date(order.dispatch_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </td>
                                  <td className="py-4 px-4 font-bold text-slate-700">{order.days || '-'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {pendingTotal > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-bold gap-3">
                          <div className="flex items-center gap-3">
                            <span>
                              Showing {Math.min((pendingPage - 1) * pendingLimit + 1, pendingTotal)} - {Math.min(pendingPage * pendingLimit, pendingTotal)} of {pendingTotal}
                            </span>
                            <span className="text-[10px] opacity-60 font-bold ml-2">Rows per page:</span>
                            <select
                              value={pendingLimit}
                              onChange={(e) => {
                                const nextLimit = Number(e.target.value);
                                setPendingLimit(nextLimit);
                                setPendingPage(1);
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 outline-none focus:border-primary shadow-soft cursor-pointer"
                            >
                              {[10, 25, 50, 100].map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={pendingPage === 1}
                              onClick={() => setPendingPage(p => Math.max(p - 1, 1))}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <FiChevronLeft size={16} />
                            </button>
                            <span className="font-extrabold text-slate-700">Page {pendingPage} of {Math.ceil(pendingTotal / pendingLimit) || 1}</span>
                            <button
                              disabled={pendingPage >= Math.ceil(pendingTotal / pendingLimit)}
                              onClick={() => setPendingPage(p => p + 1)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <FiChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: ORDERS ANALYSIS */}
              {activeTab === 'orders-analysis' && (
                <div className="space-y-4">
                  
                  {/* Six Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { filterKey: 'all', title: 'Total Orders', value: totalOrdersVal, icon: FiBox, color: { bg: 'bg-blue-50/80 border border-blue-100', text: 'text-blue-600' } },
                      { filterKey: 'delivered', title: 'Delivered', value: deliveredOrdersVal, icon: FiCheckCircle, color: { bg: 'bg-emerald-50/80 border border-emerald-100', text: 'text-emerald-600' } },
                      { filterKey: 'cancelled', title: 'Cancelled', value: cancelledOrdersVal, icon: FiXCircle, color: { bg: 'bg-rose-50/80 border border-rose-100', text: 'text-rose-600' } },
                      { filterKey: 'pending', title: 'Pending', value: pendingOrdersVal, icon: FiClock, color: { bg: 'bg-amber-50/80 border border-amber-100', text: 'text-amber-600' } },
                      { filterKey: 'sla', title: 'SLA Breached', value: slaBreachedOrdersVal, icon: FiAlertCircle, color: { bg: 'bg-orange-50/80 border border-orange-100', text: 'text-orange-600' } },
                      { filterKey: 'all', title: 'Total Quantity', value: totalQuantityVal, icon: FiTrendingUp, color: { bg: 'bg-purple-50/80 border border-purple-100', text: 'text-purple-600' } },
                    ].map((card, i) => (
                      <div 
                        key={i} 
                        onClick={() => setOrdersFilter(card.filterKey)}
                        className={`rounded-2xl border p-4 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all flex items-start justify-between cursor-pointer ${
                          ordersFilter === card.filterKey ? 'bg-primary/5 border-primary' : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className={`p-2.5 rounded-xl ${card.color.bg} ${card.color.text} w-fit`}>
                            <card.icon size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{card.title}</p>
                            <h4 className="text-xl font-black text-slate-800 mt-2">{formatCount(card.value)}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Breakdown row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Stage tracking */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <FiLayers size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Delivery Stage Tracking</h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Current stage of all received orders</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          { filterKey: 'all', title: 'Total Orders Received', count: dashboardCards.all_orders?.total_orders || 0, key: 'all_orders', barColor: 'bg-teal-500' },
                          { filterKey: 'delivered', title: 'Delivered to Customer', count: dashboardCards.delivered?.total_orders || 0, key: 'delivered', barColor: 'bg-emerald-500' },
                          { filterKey: 'shipped', title: 'On the Way (Shipped)', count: dashboardCards.shipped?.total_orders || 0, key: 'shipped', barColor: 'bg-indigo-500' },
                          { filterKey: 'out_for_delivery', title: 'Out for Delivery', count: dashboardCards.pending?.total_orders || 0, key: 'out_for_delivery', barColor: 'bg-amber-500' },
                          { filterKey: 'ready_to_ship', title: 'Ready to Ship', count: dashboardCards.ready_to_ship?.total_orders || 0, key: 'ready_to_ship', barColor: 'bg-blue-500' },
                          { filterKey: 'cancelled', title: 'Cancelled', count: dashboardCards.cancelled?.total_orders || 0, key: 'cancelled', barColor: 'bg-slate-500' },
                          { filterKey: 'returned', title: 'Returned by Customer', count: (dashboardCards.all_orders?.breakdown?.all_returns || 0), key: 'all_returns', barColor: 'bg-rose-500' },
                        ].map((stage, idx) => {
                          const total = Number(dashboardCards.all_orders?.total_orders || 1);
                          const percentage = total > 0 ? Math.round((Number(stage.count) / total) * 100) : 0;
                          
                          return (
                            <div key={idx} className="space-y-1 cursor-pointer" onClick={() => setOrdersFilter(stage.filterKey)}>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-600 uppercase tracking-tight text-[10px]">{stage.title}</span>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-black text-slate-800">{formatCount(stage.count)}</span>
                                  <span className="text-[10px] font-bold text-slate-400">({percentage}%)</span>
                                </div>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ease-out ${stage.barColor}`} style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Operational Disputes & Claims */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                            <FiAlertCircle size={16} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Disputes & Claims</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Track courier disputes and reimbursement status</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {[
                            { filterKey: 'unsettled-pickup', title: 'Unsettled Pickups', key: 'unsettled_pickup', bg: 'bg-violet-50/50 text-violet-700 border-violet-100' },
                            { filterKey: 'cancel-pickup', title: 'Cancelled Pickups', key: 'cancel_pickup', bg: 'bg-fuchsia-50/50 text-fuchsia-700 border-fuchsia-100' },
                            { filterKey: 'approved-claims', title: 'Approved Claims', key: 'approved_claims', bg: 'bg-emerald-50/50 text-emerald-700 border-emerald-100' },
                            { filterKey: 'pending-claims', title: 'Pending Claims', key: 'pending_claims', bg: 'bg-amber-50/50 text-amber-700 border-amber-100' },
                          ].map((item, idx) => {
                            const dataObj = dashboardCards[item.key] || {};
                            return (
                              <div 
                                key={idx} 
                                onClick={() => setOrdersFilter(item.filterKey)} 
                                className={`p-3 rounded-xl border ${item.bg} flex flex-col justify-between cursor-pointer hover:shadow-sm transition-all ${
                                  ordersFilter === item.filterKey ? 'ring-2 ring-primary bg-primary/5' : ''
                                }`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider">{item.title}</span>
                                <div className="mt-3 flex items-baseline justify-between">
                                  <h5 className="text-lg font-black">{formatCount(dataObj.total_orders)}</h5>
                                  <span className="text-[10px] font-bold opacity-80">₹{formatCount(dataObj.total_cost || 0)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div 
                        className={`mt-5 p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 transition-all ${
                          ordersFilter === 'wrong-return-claims' ? 'bg-primary/5 border-primary ring-2 ring-primary/20' : 'bg-slate-50 border-slate-100'
                        }`}
                        onClick={() => setOrdersFilter('wrong-return-claims')}
                      >
                        <span className="font-extrabold text-slate-600">Wrong Returns Claims Filed</span>
                        <h6 className="font-black text-red-600">
                          {formatCount(dashboardCards.wrong_return_claims?.total_orders)} <span className="text-[10px] text-slate-400">orders</span>
                        </h6>
                      </div>
                    </div>

                  </div>

                  {/* Interactive Details Table & Sidebar Grid */}
                  <div className={`grid gap-3 xl:gap-3 ${dashboardSidebarOpen ? 'xl:grid-cols-[320px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
                    
                    {dashboardSidebarOpen && (
                      <OrdersSidebarSection>
                        <SummaryTable
                          {...summaryTableProps}
                          title="Order Date Summary"
                          rows={ordersSummaries.orderDateSummaryRows}
                          cols={[
                            { key: 'date', label: 'Order Date', color: () => 'text-text' },
                            { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                        <SummaryTable
                          {...summaryTableProps}
                          title="Status Summary"
                          rows={ordersSummaries.statusSummaryRows}
                          cols={[
                            {
                              key: 'status',
                              label: 'Status',
                              color: (row) => (row.status.startsWith('RTO') ? 'text-rose-600 font-bold' : row.status === 'DELIVERED' ? 'text-emerald-600 font-bold' : 'text-text'),
                            },
                            { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                        <SummaryTable
                          {...summaryTableProps}
                          title="Courier Summary"
                          rows={ordersSummaries.courierSummaryRows}
                          cols={[
                            { key: 'courier', label: 'Courier', color: () => 'text-text' },
                            { key: 'pickup', label: 'Pickup', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                      </OrdersSidebarSection>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            {ordersFilter === 'all' && 'All Orders'}
                            {ordersFilter === 'delivered' && 'Delivered Orders'}
                            {ordersFilter === 'cancelled' && 'Cancelled Orders'}
                            {ordersFilter === 'ready_to_ship' && 'Ready to Ship Orders'}
                            {ordersFilter === 'out_for_delivery' && 'Out for Delivery Orders'}
                            {ordersFilter === 'returned' && 'Returned Orders'}
                            {ordersFilter === 'pending' && 'Pending Payment Orders'}
                            {ordersFilter === 'sla' && 'Unsettled Pickup Orders'}
                            {ordersFilter === 'unsettled-pickup' && 'Unsettled Pickup Orders'}
                            {ordersFilter === 'cancel-pickup' && 'Cancelled Pickup Orders'}
                            {ordersFilter === 'approved-claims' && 'Approved Claims Records'}
                            {ordersFilter === 'pending-claims' && 'Pending Claims Records'}
                            {ordersFilter === 'wrong-return-claims' && 'Wrong Return Claims Records'}
                          </h3>
                          <span className="bg-indigo-50 text-indigo-600 text-xs font-extrabold px-2.5 py-1 rounded-full">{formatCount(ordersTotal)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                          <select
                            value={ordersLimit}
                            onChange={(e) => {
                              const nextLimit = Number(e.target.value);
                              setOrdersLimit(nextLimit);
                              setOrdersPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary shadow-soft cursor-pointer"
                          >
                            {[10, 25, 50, 100].map((option) => (
                              <option key={option} value={option}>
                                {option} / page
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => setDashboardSidebarOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft cursor-pointer transition-all"
                          >
                            <FiSidebar size={14} />
                            <span>{dashboardSidebarOpen ? 'Hide Summary' : 'Show Summary'}</span>
                          </button>

                          <button
                            onClick={() => fetchOrdersAnalysis()}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft cursor-pointer transition-all"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>

                      {/* Orders Analysis Filters */}
                      <div className="crm-panel-muted p-4 sm:p-5 mb-5 shadow-soft">
                        <div className="flex flex-wrap items-end gap-3">
                          
                          {/* SKU Filter */}
                          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">SKU</label>
                            <div className="relative group">
                              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                              <input
                                type="text"
                                value={ordersSkuDraft}
                                onChange={(e) => setOrdersSkuDraft(e.target.value)}
                                placeholder="Search SKU..."
                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Order ID Filter */}
                          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order ID</label>
                            <div className="relative group">
                              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                              <input
                                type="text"
                                value={ordersOrderIdDraft}
                                onChange={(e) => setOrdersOrderIdDraft(e.target.value)}
                                placeholder="Search Order ID..."
                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Order Status */}
                          <div className="flex flex-col gap-1.5 w-44">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order Status</label>
                            <div className="relative">
                              <select
                                value={ordersStatusDraft}
                                onChange={(e) => setOrdersStatusDraft(e.target.value)}
                                className="h-9 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner hover:border-slate-300"
                              >
                                <option value="all">All Order Status</option>
                                <option value="Unknown">Unknown</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="Delivering Today">Delivering Today</option>
                                <option value="DOOR_STEP_EXCHANGED">DOOR_STEP_EXCHANGED</option>
                                <option value="Exchange">Exchange</option>
                                <option value="HOLD">HOLD</option>
                                <option value="PENDING">PENDING</option>
                                <option value="Picked Up">Picked Up</option>
                                <option value="READY_TO_SHIP">READY_TO_SHIP</option>
                                <option value="Returned">Returned</option>
                                <option value="RTO">RTO</option>
                                <option value="RTO_INITIATED">RTO_INITIATED</option>
                                <option value="RETURN_IN_TRANSIT">RETURN_IN_TRANSIT</option>
                                <option value="IN_TRANSIT">IN_TRANSIT</option>
                                <option value="SHIPPED">SHIPPED</option>
                              </select>
                              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                          </div>

                          {/* Payment Status */}
                          <div className="flex flex-col gap-1.5 w-44">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Payment Status</label>
                            <div className="relative">
                              <select
                                value={ordersPaymentStatusDraft}
                                onChange={(e) => setOrdersPaymentStatusDraft(e.target.value)}
                                className="h-9 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner hover:border-slate-300"
                              >
                                <option value="all">All Payment Status</option>
                                <option value="Settled">Settled</option>
                                <option value="Pending">Pending</option>
                                <option value="Unsettled">Unsettled</option>
                              </select>
                              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                          </div>



                          {/* Action Buttons */}
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={handleApplyOrdersFilters}
                              className="h-9 bg-primary text-white text-xs font-black px-6 rounded-xl shadow-soft hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                            >
                              Apply
                            </button>
                            <button
                              onClick={handleResetOrdersFilters}
                              className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-5 rounded-xl transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>

                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                              <th className="py-3 px-4">Platform Order ID</th>
                              <th className="py-3 px-4">Order Date</th>
                              <th className="py-3 px-4">SKU</th>
                              <th className="py-3 px-4 text-right">Qty</th>
                              {(ordersFilter === 'unsettled-pickup' || ordersFilter === 'sla' || ordersFilter === 'pending') && (
                                <>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4">Order Status</th>
                                  <th className="py-3 px-4">AWB Number</th>
                                  <th className="py-3 px-4">Courier Partner</th>
                                  <th className="py-3 px-4">Customer Name</th>
                                  <th className="py-3 px-4 text-right">Cost Amount</th>
                                  <th className="py-3 px-4">Pickup Date</th>
                                  <th className="py-3 px-4">Dispatch Date</th>
                                  <th className="py-3 px-4">Days</th>
                                </>
                              )}
                              {ordersFilter === 'cancel-pickup' && (
                                <>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4">Order Status</th>
                                  <th className="py-3 px-4 text-right">Selling Amount</th>
                                  <th className="py-3 px-4 text-right">Cost Amount</th>
                                  <th className="py-3 px-4 text-right">Profit / Loss</th>
                                  <th className="py-3 px-4">Courier Partner</th>
                                  <th className="py-3 px-4">AWB Number</th>
                                  <th className="py-3 px-4">Pickup AWB</th>
                                  <th className="py-3 px-4">Pickup Date</th>
                                  <th className="py-3 px-4">Customer Name</th>
                                  <th className="py-3 px-4">Customer Phone</th>
                                </>
                              )}
                              {(ordersFilter !== 'unsettled-pickup' && ordersFilter !== 'sla' && ordersFilter !== 'pending' && ordersFilter !== 'cancel-pickup') && (
                                <>
                                  <th className="py-3 px-4">Courier</th>
                                  <th className="py-3 px-4">AWB Number</th>
                                  <th className="py-3 px-4">Pickup AWB</th>
                                  <th className="py-3 px-4">Order Status</th>
                                  <th className="py-3 px-4">Dispatch Date</th>
                                  <th className="py-3 px-4">Pickup Date</th>
                                  <th className="py-3 px-4 text-right">Total Amount</th>
                                  <th className="py-3 px-4 text-right">Cost Amount</th>
                                  <th className="py-3 px-4 text-right">Shipping Charge</th>
                                  <th className="py-3 px-4 text-right">Settlement Amt</th>
                                  <th className="py-3 px-4">Payment Status</th>
                                  <th className="py-3 px-4 text-right">Profit / Loss</th>
                                  <th className="py-3 px-4">Return Type</th>
                                  <th className="py-3 px-4">Return Date</th>
                                  <th className="py-3 px-4">Return Delivered</th>
                                  <th className="py-3 px-4 text-right">Return Charge</th>
                                  <th className="py-3 px-4">Claim Status</th>
                                  <th className="py-3 px-4 text-right">Claim Amount</th>
                                  <th className="py-3 px-4">Is Lost</th>
                                  <th className="py-3 px-4">Lost Date</th>
                                  <th className="py-3 px-4">Recovery Reason</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {ordersLoading ? (
                              <tr>
                                <td colSpan={25} className="py-10 text-center text-xs font-bold text-slate-400">
                                  <div className="flex flex-col items-center gap-2 justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                                    <span>Loading detailed records...</span>
                                  </div>
                                </td>
                              </tr>
                            ) : ordersList.length === 0 ? (
                              <tr>
                                <td colSpan={25} className="py-10 text-center text-xs font-bold text-slate-400">No records found.</td>
                              </tr>
                            ) : (
                              ordersList.map((order, i) => (
                                <tr key={order.id || i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                                  <td className="py-4 px-4 font-black text-primary select-all">{order.platform_order_id}</td>
                                  <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                    {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </td>
                                  <td className="py-4 px-4 max-w-[200px]">
                                    <div className="font-extrabold text-amber-700 truncate" title={order.sku}>{order.sku}</div>
                                  </td>
                                  <td className="py-4 px-4 text-right font-bold text-slate-700">{order.qty || '-'}</td>
                                  
                                  {(ordersFilter === 'unsettled-pickup' || ordersFilter === 'sla' || ordersFilter === 'pending') && (
                                    <>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-50 text-slate-600">
                                          {order.status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600">
                                          {order.order_status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 font-mono text-slate-600 text-[10px]">{order.awb_number || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.courier_partner || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.customer_name || '-'}</td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-700">₹{formatCount(order.cost_amount || 0)}</td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.dispatch_date ? new Date(order.dispatch_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-700">{order.days || '-'}</td>
                                    </>
                                  )}

                                  {ordersFilter === 'cancel-pickup' && (
                                    <>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-50 text-slate-600">
                                          {order.status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600">
                                          {order.order_status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 text-right font-black text-slate-700">₹{formatCount(order.selling_amount || 0)}</td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-600">₹{formatCount(order.cost_amount || 0)}</td>
                                      <td className={`py-4 px-4 text-right font-black ${
                                        (Number(order.profit_loss) || 0) >= 0 ? 'text-green-600' : 'text-rose-600'
                                      }`}>
                                        ₹{formatCount(order.profit_loss || 0)}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.courier_partner || '-'}</td>
                                      <td className="py-4 px-4 font-mono text-slate-600 text-[10px]">{order.awb_number || '-'}</td>
                                      <td className="py-4 px-4 font-mono text-slate-600 text-[10px]">{order.pickup_awb_number || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.customer_name || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.customer_phone || '-'}</td>
                                    </>
                                  )}

                                  {(ordersFilter !== 'unsettled-pickup' && ordersFilter !== 'sla' && ordersFilter !== 'pending' && ordersFilter !== 'cancel-pickup') && (
                                    <>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.courier_partner || '-'}</td>
                                      <td className="py-4 px-4 font-mono text-slate-600 text-[10px]">{order.awb_number || '-'}</td>
                                      <td className="py-4 px-4 font-mono text-slate-600 text-[10px]">{order.pickup_awb_number || '-'}</td>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600">
                                          {order.order_status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.dispatch_date ? new Date(order.dispatch_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 text-right font-black text-slate-700">₹{formatCount(order.total_amount || 0)}</td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-600">₹{formatCount(order.cost_amount || 0)}</td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-600">₹{formatCount(order.shipping_charge || 0)}</td>
                                      <td className="py-4 px-4 text-right font-bold text-emerald-600">₹{formatCount(order.settlement_amount || 0)}</td>
                                      <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                          order.payment_status === 'Settled' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                          {order.payment_status || '-'}
                                        </span>
                                      </td>
                                      <td className={`py-4 px-4 text-right font-black ${
                                        (Number(order.profit_loss) || 0) >= 0 ? 'text-green-600' : 'text-rose-600'
                                      }`}>
                                        ₹{formatCount(order.profit_loss || 0)}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.return_type || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.return_date ? new Date(order.return_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.return_delivered ? new Date(order.return_delivered).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 text-right font-bold text-rose-600">₹{formatCount(order.return_shipping_charge || 0)}</td>
                                      <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                          order.claim_status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : order.claim_status ? 'bg-amber-50 text-amber-600' : ''
                                        }`}>
                                          {order.claim_status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-600">₹{formatCount(order.claim_amount || 0)}</td>
                                      <td className="py-4 px-4 text-center">
                                        {order.is_lost ? <span className="text-red-600 font-black">Yes</span> : <span className="text-slate-400">-</span>}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.lost_date ? new Date(order.lost_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.recovery_reason || '-'}</td>
                                    </>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {ordersTotal > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-bold">
                          <div>
                            Showing {Math.min((ordersPage - 1) * ordersLimit + 1, ordersTotal)} - {Math.min(ordersPage * ordersLimit, ordersTotal)} of {ordersTotal}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={ordersPage === 1}
                              onClick={() => setOrdersPage(p => Math.max(p - 1, 1))}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <FiChevronLeft size={16} />
                            </button>
                            <span className="font-extrabold text-slate-700">Page {ordersPage} of {Math.ceil(ordersTotal / ordersLimit) || 1}</span>
                            <button
                              disabled={ordersPage >= Math.ceil(ordersTotal / ordersLimit)}
                              onClick={() => setOrdersPage(p => p + 1)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <FiChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: PAYMENTS ANALYSIS */}
              {activeTab === 'payments-analysis' && (
                <div className="space-y-4">
                  
                  {/* Settlement status list */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                    
                    {/* Payment cycle tracker */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                            <FiCreditCard size={16} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Settlement Stages</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Payment settlement statuses</p>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          {[
                            { filterKey: 'received', key: 'received_payment', title: 'Settled & Received', color: 'text-emerald-600', icon: FiCheckCircle, bg: 'bg-emerald-50' },
                            { filterKey: 'pending', key: 'pending_payment', title: 'Pending Payments', color: 'text-amber-600', icon: FiClock, bg: 'bg-amber-50' },
                            { filterKey: 'mismatch', key: 'payment_mismatch', title: 'Wrong/Unmatched Payments', color: 'text-rose-600', icon: FiAlertCircle, bg: 'bg-rose-50' },
                          ].map(p => {
                            const live = dashboardCards[p.key] || {};
                            return (
                              <div 
                                key={p.key} 
                                onClick={() => setPaymentsFilter(p.filterKey)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                  paymentsFilter === p.filterKey ? 'bg-primary/5 border-primary shadow-sm' : 'bg-slate-50/30 border-slate-100 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`p-1.5 rounded-lg ${p.bg} ${p.color}`}>
                                    <p.icon size={14} />
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{p.title}</div>
                                    <div className="mt-1 text-xs font-black text-slate-800">{formatCount(live.total_orders)} orders</div>
                                  </div>
                                </div>
                                <div className={`text-sm font-black ${p.color}`}>₹{formatCount(live.total_cost)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-500">Money Credited in Bank</span>
                        <span className="font-black text-emerald-600 font-bold select-all">₹{formatCount(headlineMetrics.received_bank_amount)}</span>
                      </div>
                    </div>

                    {/* Margins Pie Chart */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                          <FiPieChart size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Profit Margin Analysis</h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">margins vs expenses breakdown</p>
                        </div>
                      </div>

                      <div className="flex-1 min-h-[170px] w-full flex items-center justify-center">
                        {[
                          { name: 'Net Profit', value: Math.max(0, Number(accountStatus.net_profit || 0)), color: '#10b981' },
                          { name: 'Ad Spend', value: Number(headlineMetrics.advertisement_cost || 0), color: '#f59e0b' },
                          { name: 'Return Loss', value: Number(accountStatus.return_not_received_loss || 0), color: '#ef4444' },
                          { name: 'Payment Loss', value: Number(accountStatus.payment_loss || 0), color: '#f43f5e' },
                        ].filter(d => d.value > 0).length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Net Profit', value: Math.max(0, Number(accountStatus.net_profit || 0)) },
                                  { name: 'Ad Spend', value: Number(headlineMetrics.advertisement_cost || 0) },
                                  { name: 'Return Loss', value: Number(accountStatus.return_not_received_loss || 0) },
                                  { name: 'Payment Loss', value: Number(accountStatus.payment_loss || 0) },
                                ].filter(d => d.value > 0)}
                                innerRadius={45}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {[
                                  '#10b981', '#f59e0b', '#ef4444', '#f43f5e'
                                ].map((color, index) => (
                                  <Cell key={`cell-${index}`} fill={color} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip formatter={(val) => `₹${formatCount(val)}`} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-slate-400 py-6 text-xs font-bold">Awaiting settlement data</div>
                        )}
                      </div>

                      <div className="flex justify-center gap-4 flex-wrap text-[10px] font-bold text-slate-500 mt-2">
                        {[
                          { l: 'Profit', c: 'bg-emerald-500' },
                          { l: 'Ads', c: 'bg-amber-500' },
                          { l: 'Returns', c: 'bg-red-500' },
                          { l: 'Payments', c: 'bg-rose-500' },
                        ].map(leg => (
                          <div key={leg.l} className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${leg.c}`} />
                            <span>{leg.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Leakages Summary */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                            <FiTrendingDown size={16} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Revenue Leakages</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Top loss factors & payouts</p>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4 text-xs font-bold text-slate-500 uppercase">
                          {[
                            { l: 'RTO Packaging Loss', v: accountStatus.rto_packaging_loss, c: 'text-slate-800' },
                            { l: 'Unreturned Packages Loss', v: accountStatus.return_not_received_loss, c: 'text-red-500' },
                            { l: 'Mismatch & Wrong Return Loss', v: accountStatus.wrong_damage_missing_returns, c: 'text-red-500' },
                            { l: 'Payment Leakage Loss', v: accountStatus.payment_loss, c: 'text-red-500' },
                          ].map((row, idx) => (
                            <div key={idx} className="flex items-center justify-between pb-1 border-b border-slate-50">
                              <span className="text-[10px] font-black text-slate-400">{row.l}</span>
                              <span className={`font-black ${row.c}`}>₹{formatCount(row.v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-green-50/50 border border-green-100 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-green-700">Net Profit (Your Earnings)</span>
                        <h4 className="font-black text-green-800 text-base select-all">₹{formatCount(accountStatus.net_profit)}</h4>
                      </div>
                    </div>

                  </div>

                  {/* Interactive Payments Table & Sidebar Grid */}
                  <div className={`grid gap-3 xl:gap-3 ${dashboardSidebarOpen ? 'xl:grid-cols-[320px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
                    
                    {dashboardSidebarOpen && (
                      <OrdersSidebarSection>
                        <SummaryTable
                          {...summaryTableProps}
                          title="Order Date Summary"
                          rows={paymentsSummaries.orderDateSummaryRows}
                          cols={[
                            { key: 'date', label: 'Order Date', color: () => 'text-text' },
                            { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                        <SummaryTable
                          {...summaryTableProps}
                          title="Status Summary"
                          rows={paymentsSummaries.statusSummaryRows}
                          cols={[
                            {
                              key: 'status',
                              label: 'Status',
                              color: (row) => (row.status.startsWith('RTO') ? 'text-rose-600 font-bold' : row.status === 'DELIVERED' ? 'text-emerald-600 font-bold' : 'text-text'),
                            },
                            { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                        <SummaryTable
                          {...summaryTableProps}
                          title="Courier Summary"
                          rows={paymentsSummaries.courierSummaryRows}
                          cols={[
                            { key: 'courier', label: 'Courier', color: () => 'text-text' },
                            { key: 'pickup', label: 'Pickup', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                      </OrdersSidebarSection>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            {paymentsFilter === 'received' && 'Settled & Received Records'}
                            {paymentsFilter === 'pending' && 'Pending Payments Records'}
                            {paymentsFilter === 'mismatch' && 'Payment Mismatches Records'}
                          </h3>
                          <span className="bg-emerald-50 text-emerald-600 text-xs font-extrabold px-2.5 py-1 rounded-full">{formatCount(paymentsTotal)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                          <select
                            value={paymentsLimit}
                            onChange={(e) => {
                              const nextLimit = Number(e.target.value);
                              setPaymentsLimit(nextLimit);
                              setPaymentsPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary shadow-soft cursor-pointer"
                          >
                            {[10, 25, 50, 100].map((option) => (
                              <option key={option} value={option}>
                                {option} / page
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => setDashboardSidebarOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft cursor-pointer transition-all"
                          >
                            <FiSidebar size={14} />
                            <span>{dashboardSidebarOpen ? 'Hide Summary' : 'Show Summary'}</span>
                          </button>

                          <button
                            onClick={() => fetchPaymentsAnalysis()}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft cursor-pointer transition-all"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>

                      {/* Payments Analysis Filters */}
                      <div className="crm-panel-muted p-4 sm:p-5 mb-5 shadow-soft">
                        <div className="flex flex-wrap items-end gap-3">
                          
                          {/* SKU Filter */}
                          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">SKU</label>
                            <div className="relative group">
                              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                              <input
                                type="text"
                                value={paymentsSkuDraft}
                                onChange={(e) => setPaymentsSkuDraft(e.target.value)}
                                placeholder="Search SKU..."
                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Order ID Filter */}
                          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order ID</label>
                            <div className="relative group">
                              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                              <input
                                type="text"
                                value={paymentsOrderIdDraft}
                                onChange={(e) => setPaymentsOrderIdDraft(e.target.value)}
                                placeholder="Search Order ID..."
                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Order Filter */}
                          <div className="flex flex-col gap-1.5 w-44">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order Filter</label>
                            <div className="relative">
                              <select
                                value={paymentsOrderFilterDraft}
                                onChange={(e) => setPaymentsOrderFilterDraft(e.target.value)}
                                className="h-9 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner hover:border-slate-300"
                              >
                                <option value="All">All Orders</option>
                                <option value="Profit">Profit Orders Only</option>
                                <option value="Loss">Loss Orders Only</option>
                              </select>
                              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                          </div>



                          {/* Action Buttons */}
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={handleApplyPaymentsFilters}
                              className="h-9 bg-primary text-white text-xs font-black px-6 rounded-xl shadow-soft hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                            >
                              Apply
                            </button>
                            <button
                              onClick={handleResetPaymentsFilters}
                              className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-5 rounded-xl transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>

                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                              <th className="py-3 px-4">Platform Order ID</th>
                              <th className="py-3 px-4">Order Date</th>
                              <th className="py-3 px-4">SKU</th>
                              <th className="py-3 px-4 text-right">Qty</th>
                              {paymentsFilter === 'received' && (
                                <>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4">Order Status</th>
                                  <th className="py-3 px-4 text-right">Selling Amount</th>
                                  <th className="py-3 px-4 text-right">Received Payment</th>
                                  <th className="py-3 px-4 text-right">Cost Amount</th>
                                  <th className="py-3 px-4 text-right">Profit / Loss</th>
                                  <th className="py-3 px-4 text-right">Payment Entry Count</th>
                                  <th className="py-3 px-4">First Payment Date</th>
                                  <th className="py-3 px-4">Last Payment Date</th>
                                </>
                              )}
                              {paymentsFilter === 'pending' && (
                                <>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4">Order Status</th>
                                  <th className="py-3 px-4">AWB Number</th>
                                  <th className="py-3 px-4">Courier Partner</th>
                                  <th className="py-3 px-4">Customer Name</th>
                                  <th className="py-3 px-4 text-right">Cost Amount</th>
                                  <th className="py-3 px-4">Pickup Date</th>
                                  <th className="py-3 px-4">Dispatch Date</th>
                                  <th className="py-3 px-4">Days</th>
                                </>
                              )}
                              {paymentsFilter === 'mismatch' && (
                                <>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4">Order Status</th>
                                  <th className="py-3 px-4 text-right">Selling Amount</th>
                                  <th className="py-3 px-4 text-right">Cost Amount</th>
                                  <th className="py-3 px-4 text-right">Profit / Loss</th>
                                  <th className="py-3 px-4 text-right">Settlement Amount</th>
                                  <th className="py-3 px-4">Courier Partner</th>
                                  <th className="py-3 px-4">AWB Number</th>
                                  <th className="py-3 px-4">Customer Name</th>
                                  <th className="py-3 px-4">Customer Phone</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {paymentsLoading ? (
                              <tr>
                                <td colSpan={15} className="py-10 text-center text-xs font-bold text-slate-400">
                                  <div className="flex flex-col items-center gap-2 justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                                    <span>Loading payment records...</span>
                                  </div>
                                </td>
                              </tr>
                            ) : paymentsList.length === 0 ? (
                              <tr>
                                <td colSpan={15} className="py-10 text-center text-xs font-bold text-slate-400">No records found.</td>
                              </tr>
                            ) : (
                              paymentsList.map((order, i) => (
                                <tr key={order.id || i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                                  <td className="py-4 px-4 font-black text-primary select-all">{order.platform_order_id}</td>
                                  <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                    {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </td>
                                  <td className="py-4 px-4 max-w-[200px]">
                                    <div className="font-extrabold text-amber-700 truncate" title={order.sku}>{order.sku}</div>
                                  </td>
                                  <td className="py-4 px-4 text-right font-bold text-slate-700">{order.qty || '-'}</td>
                                  
                                  {paymentsFilter === 'received' && (
                                    <>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-50 text-slate-600">
                                          {order.status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600">
                                          {order.order_status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 text-right font-black text-slate-700">₹{formatCount(order.selling_amount || 0)}</td>
                                      <td className="py-4 px-4 text-right font-black text-emerald-600">₹{formatCount(order.received_payment || 0)}</td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-600">₹{formatCount(order.cost_amount || 0)}</td>
                                      <td className={`py-4 px-4 text-right font-black ${
                                        (Number(order.profit_loss) || 0) >= 0 ? 'text-green-600' : 'text-rose-600'
                                      }`}>
                                        ₹{formatCount(order.profit_loss || 0)}
                                      </td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-700">{order.payment_entry_count || 0}</td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.first_payment_date ? new Date(order.first_payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.last_payment_date ? new Date(order.last_payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                    </>
                                  )}

                                  {paymentsFilter === 'pending' && (
                                    <>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-50 text-slate-600">
                                          {order.status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600">
                                          {order.order_status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 font-mono text-slate-600 text-[10px]">{order.awb_number || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.courier_partner || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.customer_name || '-'}</td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-700">₹{formatCount(order.cost_amount || 0)}</td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap">
                                        {order.dispatch_date ? new Date(order.dispatch_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-700">{order.days || '-'}</td>
                                    </>
                                  )}

                                  {paymentsFilter === 'mismatch' && (
                                    <>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-50 text-slate-600">
                                          {order.status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600">
                                          {order.order_status || '-'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 text-right font-black text-slate-700">₹{formatCount(order.selling_amount || 0)}</td>
                                      <td className="py-4 px-4 text-right font-bold text-slate-600">₹{formatCount(order.cost_amount || 0)}</td>
                                      <td className={`py-4 px-4 text-right font-black ${
                                        (Number(order.profit_loss) || 0) >= 0 ? 'text-green-600' : 'text-rose-600'
                                      }`}>
                                        ₹{formatCount(order.profit_loss || 0)}
                                      </td>
                                      <td className={`py-4 px-4 text-right font-black ${
                                        (Number(order.settlement_amount) || 0) >= 0 ? 'text-green-600' : 'text-rose-600'
                                      }`}>
                                        ₹{formatCount(order.settlement_amount || 0)}
                                      </td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.courier_partner || '-'}</td>
                                      <td className="py-4 px-4 font-mono text-slate-600 text-[10px]">{order.awb_number || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.customer_name || '-'}</td>
                                      <td className="py-4 px-4 font-bold text-slate-600">{order.customer_phone || '-'}</td>
                                    </>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {paymentsTotal > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-bold">
                          <div>
                            Showing {Math.min((paymentsPage - 1) * paymentsLimit + 1, paymentsTotal)} - {Math.min(paymentsPage * paymentsLimit, paymentsTotal)} of {paymentsTotal}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={paymentsPage === 1}
                              onClick={() => setPaymentsPage(p => Math.max(p - 1, 1))}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <FiChevronLeft size={16} />
                            </button>
                            <span className="font-extrabold text-slate-700">Page {paymentsPage} of {Math.ceil(paymentsTotal / paymentsLimit) || 1}</span>
                            <button
                              disabled={paymentsPage >= Math.ceil(paymentsTotal / paymentsLimit)}
                              onClick={() => setPaymentsPage(p => p + 1)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <FiChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: ADS ANALYSIS */}
              {activeTab === 'ads-analysis' && (
                <div className="space-y-4">
                  
                  {/* Six Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { title: 'Total Views', value: 0, icon: FiUsers, color: { bg: 'bg-blue-50/80 border border-blue-100', text: 'text-blue-600' } },
                      { title: 'Total Clicks', value: 0, icon: FiArrowUpRight, color: { bg: 'bg-purple-50/80 border border-purple-100', text: 'text-purple-600' } },
                      { title: 'Units Sold (Direct+Indirect)', value: 0, icon: FiBox, color: { bg: 'bg-emerald-50/80 border border-emerald-100', text: 'text-emerald-600' } },
                      { title: 'Revenue', value: 0, icon: FiDollarSign, prefix: '₹', color: { bg: 'bg-amber-50/80 border border-amber-100', text: 'text-amber-600' } },
                      { title: 'Avg. ROI', value: 0, icon: FiTrendingUp, color: { bg: 'bg-rose-50/80 border border-rose-100', text: 'text-rose-600' } },
                      { title: 'Conversion Rate', value: 0, icon: FiPercent, suffix: '%', color: { bg: 'bg-indigo-50/80 border border-indigo-100', text: 'text-indigo-600' } },
                    ].map((card, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all flex items-start justify-between">
                        <div className="space-y-3">
                          <div className={`p-2.5 rounded-xl ${card.color.bg} ${card.color.text} w-fit`}>
                            <card.icon size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{card.title}</p>
                            <h4 className="text-xl font-black text-slate-800 mt-2">
                              {card.prefix || ''}{formatCount(card.value)}{card.suffix || ''}
                            </h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Top Campaigns List */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-l-2 border-primary pl-2">Top Performing Campaigns</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                            <th className="py-3 px-4">Campaign</th>
                            <th className="py-3 px-4">Views</th>
                            <th className="py-3 px-4">Clicks</th>
                            <th className="py-3 px-4">Units</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-xs font-bold text-slate-400 italic">No campaign data available</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: RETURNS ANALYSIS */}
              {activeTab === 'returns-analysis' && (
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                    
                    {/* Returns stages distribution summary */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                            <FiCalendar size={16} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Returned Stages</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Return logistics distribution</p>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          {[
                            { filterKey: 'transit', key: 'return_in_transit', title: 'On The Way', color: 'text-amber-500', bg: 'bg-amber-50' },
                            { filterKey: 'received', key: 'return_received', title: 'Received Returns', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { filterKey: 'not-received', key: 'return_not_received', title: 'Pending/Unreturned', color: 'text-rose-500', bg: 'bg-rose-50' },
                            { filterKey: 'mismatch', key: 'return_mismatch', title: 'Damaged / Wrong Returns', color: 'text-red-500', bg: 'bg-red-50' },
                          ].map(stage => {
                            const live = dashboardCards[stage.key] || {};
                            return (
                              <div 
                                key={stage.key} 
                                onClick={() => setReturnsFilter(stage.filterKey)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                  returnsFilter === stage.filterKey ? 'bg-primary/5 border-primary shadow-sm' : 'bg-slate-50/30 border-slate-100 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`h-2.5 w-2.5 rounded-full ${stage.color.replace('text', 'bg')}`} />
                                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{stage.title}</div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xs font-black text-slate-800">{formatCount(live.total_orders)} orders</span>
                                  <span className="text-[10px] font-bold text-slate-400">₹{formatCount(live.total_cost)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-500">Average Return Logistics Cost</span>
                        <span className="font-black text-red-600">₹{formatCount(dashboardData?.averages?.avg_return_charge)}</span>
                      </div>
                    </div>

                    {/* Bar Chart stage visualization */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft flex flex-col lg:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                          <FiTrendingUp size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Returned Orders stage Tracking</h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Distribution graph of courier return stages</p>
                        </div>
                      </div>

                      <div className="flex-1 min-h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={returnsChartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(val) => [`${formatCount(val)} Orders`]} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                              {returnsChartData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* Interactive Returns Table & Sidebar Grid */}
                  <div className={`grid gap-3 xl:gap-3 ${dashboardSidebarOpen ? 'xl:grid-cols-[320px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
                    
                    {dashboardSidebarOpen && (
                      <OrdersSidebarSection>
                        <SummaryTable
                          {...summaryTableProps}
                          title="Order Date Summary"
                          rows={returnsSummaries.orderDateSummaryRows}
                          cols={[
                            { key: 'date', label: 'Order Date', color: () => 'text-text' },
                            { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                        <SummaryTable
                          {...summaryTableProps}
                          title="Status Summary"
                          rows={returnsSummaries.statusSummaryRows}
                          cols={[
                            {
                              key: 'status',
                              label: 'Status',
                              color: (row) => (row.status.startsWith('RTO') ? 'text-rose-600 font-bold' : row.status === 'DELIVERED' ? 'text-emerald-600 font-bold' : 'text-text'),
                            },
                            { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                        <SummaryTable
                          {...summaryTableProps}
                          title="Courier Summary"
                          rows={returnsSummaries.courierSummaryRows}
                          cols={[
                            { key: 'courier', label: 'Courier', color: () => 'text-text' },
                            { key: 'pickup', label: 'Pickup', right: true, color: () => 'text-primary text-right font-extrabold' },
                            { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                          ]}
                        />
                      </OrdersSidebarSection>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5 border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            {returnsFilter === 'transit' && 'Return In Transit Records'}
                            {returnsFilter === 'received' && 'Received Returns Records'}
                            {returnsFilter === 'not-received' && 'Pending/Unreturned Records'}
                            {returnsFilter === 'mismatch' && 'Damaged / Wrong Returns Records'}
                          </h3>
                          <span className="bg-amber-50 text-amber-600 text-xs font-extrabold px-2.5 py-1 rounded-full">{formatCount(returnsTotal)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                          <select
                            value={returnsLimit}
                            onChange={(e) => {
                              const nextLimit = Number(e.target.value);
                              setReturnsLimit(nextLimit);
                              setReturnsPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary shadow-soft cursor-pointer"
                          >
                            {[10, 25, 50, 100].map((option) => (
                              <option key={option} value={option}>
                                {option} / page
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => setDashboardSidebarOpen((prev) => !prev)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft cursor-pointer transition-all"
                          >
                            <FiSidebar size={14} />
                            <span>{dashboardSidebarOpen ? 'Hide Summary' : 'Show Summary'}</span>
                          </button>

                          <button
                            onClick={() => fetchReturnsAnalysis()}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft cursor-pointer transition-all"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>

                      {/* Returns Analysis Filters */}
                      <div className="crm-panel-muted p-4 sm:p-5 mb-5 shadow-soft">
                        <div className="flex flex-wrap items-end gap-3">
                          
                          {/* SKU Filter */}
                          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">SKU</label>
                            <div className="relative group">
                              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                              <input
                                type="text"
                                value={returnsSkuDraft}
                                onChange={(e) => setReturnsSkuDraft(e.target.value)}
                                placeholder="Search SKU..."
                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Order ID Filter */}
                          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                            <label className="ml-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order ID</label>
                            <div className="relative group">
                              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                              <input
                                type="text"
                                value={returnsOrderIdDraft}
                                onChange={(e) => setReturnsOrderIdDraft(e.target.value)}
                                placeholder="Search Order ID..."
                                className="h-9 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all shadow-inner"
                              />
                            </div>
                          </div>



                          {/* Action Buttons */}
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={handleApplyReturnsFilters}
                              className="h-9 bg-primary text-white text-xs font-black px-6 rounded-xl shadow-soft hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                            >
                              Apply
                            </button>
                            <button
                              onClick={handleResetReturnsFilters}
                              className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-5 rounded-xl transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>

                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                              <th className="py-3 px-4">Order ID</th>
                              <th className="py-3 px-4">Order Date</th>
                              <th className="py-3 px-4">SKU</th>
                              <th className="py-3 px-4">Courier Partner</th>
                              <th className="py-3 px-4 text-right">Return Logistics Valuation</th>
                              <th className="py-3 px-4 text-right">Return Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {returnsLoading ? (
                              <tr>
                                <td colSpan={6} className="py-10 text-center text-xs font-bold text-slate-400">
                                  <div className="flex flex-col items-center gap-2 justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                                    <span>Loading returns records...</span>
                                  </div>
                                </td>
                              </tr>
                            ) : returnsList.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-10 text-center text-xs font-bold text-slate-400">No records found.</td>
                              </tr>
                            ) : (
                              returnsList.map((order, i) => (
                                <tr key={order.id || i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                                  <td className="py-4 px-4 font-black text-primary select-all">{order.platform_order_id}</td>
                                  <td className="py-4 px-4 font-bold text-slate-500">
                                    {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </td>
                                  <td className="py-4 px-4 max-w-[280px]">
                                    <div className="font-extrabold text-amber-700 truncate" title={order.sku}>{order.sku}</div>
                                  </td>
                                  <td className="py-4 px-4 font-bold text-slate-600">{order.courier_partner || '-'}</td>
                                  <td className="py-4 px-4 text-right font-black text-slate-700">₹{formatCount(order.total_amount || 0)}</td>
                                  <td className="py-4 px-4 text-right">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                      returnsFilter === 'received' ? 'bg-emerald-50 text-emerald-600' :
                                      returnsFilter === 'mismatch' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                      {returnsFilter === 'transit' ? 'In Transit' :
                                       returnsFilter === 'received' ? 'Received' :
                                       returnsFilter === 'not-received' ? 'Not Received' : 'Mismatch'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {returnsTotal > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 font-bold">
                          <div>
                            Showing {Math.min((returnsPage - 1) * returnsLimit + 1, returnsTotal)} - {Math.min(returnsPage * returnsLimit, returnsTotal)} of {returnsTotal}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={returnsPage === 1}
                              onClick={() => setReturnsPage(p => Math.max(p - 1, 1))}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <FiChevronLeft size={16} />
                            </button>
                            <span className="font-extrabold text-slate-700">Page {returnsPage} of {Math.ceil(returnsTotal / returnsLimit) || 1}</span>
                            <button
                              disabled={returnsPage >= Math.ceil(returnsTotal / returnsLimit)}
                              onClick={() => setReturnsPage(p => p + 1)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            >
                              <FiChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </motion.div>

      {/* SYSTEM MODALS INHERITED FROM MAIN PORT */}
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
