import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowUpRight,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiLayers,
  FiTrendingDown,
  FiTrendingUp,
  FiRefreshCw,
  FiXCircle,
} from 'react-icons/fi';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';


const formatAmount = (value) =>
  Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

const KPI_CONFIG = [
  {
    key: 'sales',
    title: 'Gross Sales',
    valueKey: 'total_sales_amount',
    helper: (metrics) => `Generated from ${formatCount(metrics.total_sales_orders)} orders`,
    tone: 'from-teal-600 to-teal-800',
    route: '/all-orders',
    icon: FiLayers,
  },
  {
    key: 'received',
    title: 'Bank Credit',
    valueKey: 'received_bank_amount',
    helper: (metrics) => `${formatCount(metrics.received_payment_orders)} settled payments`,
    tone: 'from-blue-600 to-indigo-800',
    route: '/bank-credit-statement',
    icon: FiCreditCard,
  },
  {
    key: 'pending',
    title: 'Pending Payout',
    valueKey: 'pending_payment_amount',
    helper: (metrics) => `${formatCount(metrics.pending_payment_orders)} orders in process`,
    tone: 'from-amber-500 to-orange-700',
    route: '/pending-payment-orders',
    icon: FiClock,
  },
  {
    key: 'profit',
    title: 'Net Profit',
    valueKey: 'net_profit',
    helper: (metrics) => `${Number(metrics.net_profit_percentage || 0).toFixed(2)}% healthy margin`,
    tone: 'from-emerald-600 to-green-800',
    route: null,
    icon: FiTrendingUp,
  },
];

const FULFILMENT_CARDS = [
  { key: 'all_orders', status: 'All Received Orders', title: 'Total Incoming', route: '/all-orders', tone: 'border-teal-200 bg-teal-50', icon: FiLayers },
  { key: 'ready_to_ship', status: 'Processing', title: 'Processing (Ready)', route: '/ready-to-ship', tone: 'border-blue-200 bg-blue-50', icon: FiClock },
  { key: 'shipped', status: 'Shipped Out For Delivery', title: 'Dispatched', route: '/shipped', tone: 'border-indigo-200 bg-indigo-50', icon: FiBox },
  { key: 'out_for_delivery', status: 'Out For Delivery', title: 'Out for Delivery', route: '/out-for-delivery', tone: 'border-emerald-200 bg-emerald-50', icon: FiCheckCircle },
  { key: 'cancelled', status: 'Cancelled Orders', title: 'Cancelled', route: '/cancelled-orders', tone: 'border-slate-300 bg-slate-100', icon: FiXCircle },
];

const RETURNS_CARDS = [
  { key: 'return_in_transit', status: 'Return In Transit', title: 'In-Transit Returns', route: '/return-in-transit', tone: 'border-amber-200 bg-amber-50', icon: FiRefreshCw },
  { key: 'return_received', status: 'Return Received', title: 'Returns Received', route: '/received-returns', tone: 'border-teal-200 bg-teal-50', icon: FiCheckCircle },
  { key: 'return_not_received', status: 'Return Not Received', title: 'Missing Returns', route: '/returns-not-received', tone: 'border-rose-300 bg-rose-50', icon: FiAlertCircle },
  { key: 'return_mismatch', status: 'Return Mismatch', title: 'Mismatch Issues', route: '/return-mismatch', tone: 'border-red-300 bg-red-50', icon: FiAlertCircle },
];

const SETTLEMENT_CARDS = [
  { key: 'received_payment', status: 'Received Payment', title: 'Settled Payments', route: '/received-payment-orders', tone: 'border-emerald-200 bg-emerald-50', icon: FiCreditCard },
  { key: 'pending_payment', status: 'Pending Payment', title: 'Payment Pending', route: '/pending-payment-orders', tone: 'border-amber-200 bg-amber-50', icon: FiClock },
  { key: 'payment_mismatch', status: 'Payment Mismatch', title: 'Amount Mismatch', route: '/payment-mismatch', tone: 'border-red-300 bg-red-50', icon: FiAlertCircle },
  { key: 'unsettled_pickup', status: 'Unsettled Pickup', title: 'Unsettled Pickup', route: '/unsettled-pickup', tone: 'border-violet-200 bg-violet-50', icon: FiBox },
  { key: 'cancel_pickup', status: 'Cancel Pickup', title: 'Cancelled Pickup', route: '/cancel-pickup', tone: 'border-fuchsia-200 bg-fuchsia-50', icon: FiXCircle },
];

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
    <div>
        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs font-medium text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function KpiCard({ item, onClick }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={item.route ? onClick : undefined}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${item.tone} p-4 text-left text-white shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5 ${item.route ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="rounded-xl bg-white/20 p-3 backdrop-blur-md shrink-0">
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="text-[0.7rem] font-bold uppercase tracking-widest text-white/90 leading-none">{item.title}</div>
        <div className="mt-1.5 text-2xl font-black tabular-nums leading-none">Rs. {item.value}</div>
        <div className="mt-2 text-[0.7rem] font-medium text-white/70 line-clamp-1 leading-none">{item.helper}</div>
      </div>
      {item.route && (
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all">
          <FiArrowUpRight size={14} />
        </div>
      )}
    </button>
  );
}

function ActionCard({ item, onOpen }) {
  const isCritical = item.tone === 'critical';
  const toneClasses = isCritical
    ? 'border-red-100 bg-white text-red-600 hover:border-red-200'
    : 'border-orange-100 bg-white text-orange-600 hover:border-orange-200';

  return (
    <button
      type="button"
      onClick={() => item.route && onOpen(item.route)}
      className={`group w-full rounded-default border p-4 text-left shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5 ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-400">{item.title}</div>
          <div className="mt-1 text-sm font-bold text-slate-900">{formatCount(item.count)} orders</div>
        </div>
        <div className={`rounded-inner p-1.5 ${isCritical ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
          <FiAlertCircle size={16} />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
        <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Impact</div>
        <div className="text-sm font-black text-slate-900">Rs. {formatAmount(item.amount)}</div>
      </div>
    </button>
  );
}

function StatusCard({ title, count, amount, tone, icon: Icon, onClick }) {
  // Extract colors from tone to apply to specific elements
  const isRed = tone.includes('red') || tone.includes('rose');
  const isGreen = tone.includes('emerald') || tone.includes('teal');
  const isOrange = tone.includes('amber') || tone.includes('orange');
  const isBlue = tone.includes('blue') || tone.includes('indigo');
  const isViolet = tone.includes('violet') || tone.includes('fuchsia');

  const accentColor = isRed ? 'bg-red-500' : isGreen ? 'bg-emerald-500' : isOrange ? 'bg-orange-500' : isBlue ? 'bg-blue-500' : isViolet ? 'bg-violet-500' : 'bg-slate-500';
  const textColor = isRed ? 'text-red-700' : isGreen ? 'text-emerald-700' : isOrange ? 'text-orange-700' : isBlue ? 'text-blue-700' : isViolet ? 'text-violet-700' : 'text-slate-700';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full flex-col overflow-hidden rounded-xl border-2 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-card outline-none focus:ring-4 focus:ring-primary/10 ${tone}`}
    >
      {/* Subtle Glow Effect */}
      <div className={`absolute -right-12 -bottom-12 h-24 w-24 rounded-full opacity-5 blur-3xl ${accentColor}`}></div>

      <div className="flex items-center justify-between mb-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5 transition-all group-hover:scale-110`}>
          {Icon ? <Icon size={16} className={textColor} /> : <div className={`h-2 w-2 rounded-full ${accentColor}`} />}
        </div>
        <div className="rounded-full bg-white/80 p-1 opacity-40 group-hover:opacity-100 transition-all">
          <FiArrowUpRight size={14} className={textColor} />
        </div>
      </div>

      <div className="mb-2">
        <h4 className={`text-[0.75rem] font-black tracking-tight leading-none ${textColor}`}>{title}</h4>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-black/5 pt-2">
        <div className="min-w-0">
          <div className="text-[0.6rem] font-bold uppercase tracking-tight text-slate-500/80">Orders</div>
          <div className="mt-0.5 text-sm font-black text-slate-950 tabular-nums">
            {formatCount(count)}
          </div>
        </div>
        <div className="text-right min-w-0">
          <div className="text-[0.6rem] font-bold uppercase tracking-tight text-slate-500/80">Valuation</div>
          <div className="mt-0.5 text-[0.75rem] font-black text-slate-950 tabular-nums">
            <span className="text-[0.55rem] font-bold text-slate-400 mr-0.5">Rs.</span>
            {formatAmount(amount)}
          </div>
        </div>
      </div>
    </button>
  );
}

function MiniInsight({ label, value, tone = 'text-slate-900', icon }) {
  const Icon = icon;

  return (
    <div className="group rounded-default border border-slate-100 bg-white p-4 shadow-soft transition-all hover:shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500">{label}</div>
        {Icon ? <div className="rounded-full bg-slate-50 p-1.5 group-hover:bg-slate-100 transition-colors"><Icon size={14} className="text-slate-400" /></div> : null}
      </div>
      <div className={`mt-3 text-lg font-black tracking-tight ${tone}`}>{value}</div>
    </div>
  );
}

function useDashboardMetrics(averages) {
  return [
    {
      label: 'Monthly Avg. Orders',
      value: String(averages.monthly_avg_orders ?? '-'),
      subValue: averages.monthly_avg_orders ? `Approx. ${(averages.monthly_avg_orders / 30).toFixed(1)} / day` : 'Historical average'
    },
    {
      label: 'Daily Avg. Orders',
      value: String(averages.daily_avg_orders ?? '-'),
      positive: Number(averages.daily_avg_orders) > 0,
      subValue: averages.daily_avg_orders ? `Total ${(averages.daily_avg_orders * 30).toLocaleString()} monthly` : 'Current trend'
    },
    {
      label: 'Avg. Return Charge',
      value: formatAmount(averages.avg_return_charge),
      negative: Number(averages.avg_return_charge) > 0,
      subValue: 'Direct logistics impact'
    },
    {
      label: 'Avg. P/L Per Order',
      value: formatAmount(averages.avg_pl_per_order),
      positive: Number(averages.avg_pl_per_order) >= 0,
      negative: Number(averages.avg_pl_per_order) < 0,
      subValue: 'Unit level profitability'
    },
    {
      label: "Today's Pickup",
      value: String(averages.today_pickup ?? '-'),
      subValue: 'Orders ready for ship'
    },
    {
      label: "Today's Return Receipts",
      value: String(averages.today_returns_received ?? '-'),
      subValue: 'Inbound warehouse activity'
    },
    {
      label: "Today's Bank Credit",
      value: formatAmount(averages.today_bank_credit),
      positive: Number(averages.today_bank_credit) > 0,
      subValue: 'Realized revenue today'
    },
  ];
}

export { useDashboardMetrics };

export function useAccountDetails(accountStatus) {
  return [
    { label: 'Sales Profits', value: formatAmount(accountStatus.sales_profit) },
    { label: 'RTO Packaging Loss', value: String(accountStatus.rto_packaging_loss ?? '-') },
    { label: 'Customer Return Pending', value: formatAmount(accountStatus.customer_return_charge_pending) },
    { label: 'Total SKU', value: String(accountStatus.total_sku ?? '-') },
  ];
}

export default function DashboardCards({ onMetricsReady, onAccountDetail, viewMode = 'all', extraAction = null }) {
  const navigate = useNavigate();
  const [summaryMap, setSummaryMap] = useState({});
  const [dashboardCards, setDashboardCards] = useState({});
  const [accountStatus, setAccountStatus] = useState({});
  const [businessInsights, setBusinessInsights] = useState({});
  const [averages, setAverages] = useState({});
  const [overview, setOverview] = useState({ headline_metrics: {}, action_needed: [] });
  const { activeAccount, selectedDateRange } = useAuth();

  useEffect(() => {
    if (!activeAccount?.id || !selectedDateRange?.from || !selectedDateRange?.to) return;

    api.post('/get-dashboard-summary', {
      start_date: selectedDateRange.from,
      end_date: selectedDateRange.to,
    }, {
      headers: { account: activeAccount.id },
    })
      .then((res) => {
        const payload = res.data || {};
        const map = {};
        (payload.data || []).forEach((item) => { map[item.status] = item; });
        setSummaryMap(map);
        setDashboardCards(payload.dashboard_cards || {});
        setAccountStatus(payload.account_status || {});
        setBusinessInsights(payload.business_insights || {});
        setOverview(payload.overview || { headline_metrics: {}, action_needed: [] });
        const resolvedAverages = payload.averages || {};
        setAverages(resolvedAverages);
        onMetricsReady?.(useDashboardMetrics(resolvedAverages));
        onAccountDetail?.(payload.account_status || {});
      })
      .catch(() => { });
  }, [activeAccount?.id, selectedDateRange?.from, selectedDateRange?.to, onMetricsReady, onAccountDetail]);

  const headlineMetrics = overview.headline_metrics || {};
  const actionNeeded = Array.isArray(overview.action_needed) ? overview.action_needed : [];

  const kpiCards = useMemo(() => KPI_CONFIG.map((config) => ({
    ...config,
    value: formatAmount(headlineMetrics[config.valueKey]),
    helper: config.helper(headlineMetrics),
  })), [headlineMetrics]);

  const businessTiles = useMemo(() => [
    { label: 'Picked', value: Number(businessInsights.picked || 0), tone: 'text-slate-950', icon: FiBox },
    { label: 'Shipped', value: Number(businessInsights.shipped || 0), tone: 'text-sky-700', icon: FiTrendingUp },
    { label: 'RTO', value: Number(businessInsights.rto || 0), tone: 'text-rose-700', icon: FiTrendingDown },
    { label: 'Delivered', value: Number(businessInsights.delivered || 0), tone: 'text-emerald-700', icon: FiCheckCircle },
  ], [businessInsights]);


  const lossTiles = [
    { label: 'Ad spend', value: `Rs. ${formatAmount(headlineMetrics.advertisement_cost)}`, tone: 'text-amber-700' },
    { label: 'Payment loss', value: `Rs. ${formatAmount(accountStatus.payment_loss)}`, tone: 'text-rose-700' },
    { label: 'Return loss', value: `Rs. ${formatAmount(accountStatus.return_not_received_loss)}`, tone: 'text-rose-700' },
    { label: 'Mismatch loss', value: `Rs. ${formatAmount(accountStatus.wrong_damage_missing_returns)}`, tone: 'text-rose-700' },
  ];

  const renderStatusGrid = (items, cols = 'sm:grid-cols-2 xl:grid-cols-3') => (
    <div className={`grid gap-3 ${cols}`}>
      {items.map((item) => {
        const live = dashboardCards[item.key] || summaryMap[item.status] || {};
        return (
          <StatusCard
            key={item.key || item.status}
            title={item.title}
            count={live.total_orders}
            amount={live.total_cost}
            tone={item.tone}
            icon={item.icon}
            onClick={() => (live.route || item.route) && navigate(live.route || item.route)}
          />
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* SECTION 1: EXECUTIVE OVERVIEW CARDS */}
      {(viewMode === 'all' || viewMode === 'executive' || viewMode === 'executive-cards') && (
        <section className="space-y-3">
          <SectionHeader
            title="Executive Overview"
            subtitle="High-level financial performance and health"
            action={extraAction}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((item) => (
              <KpiCard key={item.key} item={item} onClick={() => item.route && navigate(item.route)} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 1.5: EXECUTIVE OVERVIEW CHARTS */}
      {(viewMode === 'all' || viewMode === 'executive' || viewMode === 'executive-charts') && (
        <section className="h-full flex flex-col">
          <Card className="flex-1 flex flex-col" title="Financial Health" contentClassName="flex-1 flex flex-col p-4">
            <div className="flex-1 min-h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Net Profit', value: Math.max(0, Number(accountStatus.net_profit || 0)), color: '#10b981' },
                      { name: 'Ad Spend', value: Number(headlineMetrics.advertisement_cost || 0), color: '#f59e0b' },
                      { name: 'Return Loss', value: Number(accountStatus.return_not_received_loss || 0), color: '#ef4444' },
                      { name: 'Payment Loss', value: Number(accountStatus.payment_loss || 0), color: '#f43f5e' },
                      { name: 'Other Costs', value: Math.max(0, Number(headlineMetrics.total_sales_amount || 0) - Number(accountStatus.net_profit || 0) - Number(headlineMetrics.advertisement_cost || 0) - Number(accountStatus.return_not_received_loss || 0) - Number(accountStatus.payment_loss || 0)), color: '#94a3b8' },
                    ].filter(d => d.value > 0)}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      '#10b981', '#f59e0b', '#ef4444', '#f43f5e', '#94a3b8'
                    ].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `Rs. ${formatAmount(val)}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {[
                { l: 'Profit', c: 'bg-emerald-500' },
                { l: 'Ads', c: 'bg-amber-500' },
                { l: 'Returns', c: 'bg-red-500' },
                { l: 'Payments', c: 'bg-rose-500' },
                { l: 'Others', c: 'bg-slate-400' }
              ].map(leg => (
                <div key={leg.l} className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${leg.c}`} />
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-tight">{leg.l}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <FiLayers size={14} />
                </div>
                <div>
                  <div className="text-[0.65rem] font-bold text-slate-400 uppercase leading-none">SKUs</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{formatCount(accountStatus.total_sku)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[0.65rem] font-bold text-slate-400 uppercase leading-none">Margin</div>
                <div className="text-sm font-black text-emerald-600 mt-0.5">{(Number(accountStatus.net_profit_percentage) || 0).toFixed(1)}%</div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* SECTION 2 & 3: OPERATIONAL COMMAND CENTER */}
      {(viewMode === 'all' || viewMode === 'operational') && (
        <section className="space-y-3 border-t border-slate-200 pt-4">
          <SectionHeader title="Operational Command Center" subtitle="Real-time anomalies & lifecycle insights" />

          <div className="grid gap-3 xl:grid-cols-[1fr_3fr]">
            {/* LEFT: Anomalies (Vertical) */}
            <div className="flex flex-col">
              <Card
                className="h-full border-orange-100 bg-orange-50/20 shadow-none"
                title="System Anomalies"
                subtitle="Issues requiring attention"
                contentClassName="p-3 space-y-3 flex-1 overflow-y-auto max-h-[600px] [scrollbar-width:thin]"
                action={
                  <button type="button" className="text-[0.65rem] font-bold text-orange-600 uppercase tracking-widest hover:underline" onClick={() => navigate('/payment-mismatch')}>
                    Review All
                  </button>
                }
              >
                {actionNeeded.length > 0 ? (
                  actionNeeded.map((item) => (
                    <ActionCard key={item.status} item={item} onOpen={navigate} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3">
                      <FiCheckCircle size={24} />
                    </div>
                    <div className="text-xs font-bold text-slate-500">No anomalies detected</div>
                  </div>
                )}
              </Card>
            </div>

            {/* RIGHT: Charts & Insights */}
            <div className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                {/* Main Lifecycle Chart */}
                <Card title="Order Lifecycle" subtitle="Volume vs Value" contentClassName="p-5 flex flex-col h-full">
                  <div className="h-[420px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...FULFILMENT_CARDS, ...RETURNS_CARDS, ...SETTLEMENT_CARDS].map(c => {
                          const live = dashboardCards[c.key] || summaryMap[c.status] || {};
                          return {
                            name: c.title,
                            orders: Number(live.total_orders || 0),
                            amount: Number(live.total_cost || 0),
                            route: c.route
                          };
                        }).filter(d => d.orders > 0)}
                        margin={{ top: 20, right: 30, left: 10, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          height={90}
                          tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
                        />
                        <Bar yAxisId="left" dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} onClick={(data) => data.route && navigate(data.route)} />
                        <Bar yAxisId="right" dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} onClick={(data) => data.route && navigate(data.route)} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 pb-2 flex justify-center gap-6 border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-indigo-500" />
                      <span className="text-[0.65rem] font-black text-slate-500 uppercase">Order Count</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-[0.65rem] font-black text-slate-500 uppercase">Total Valuation</span>
                    </div>
                  </div>
                </Card>

                {/* Side Insights */}
                <div className="space-y-3 flex flex-col h-full">
                  <Card title="Quick Volume" subtitle="Key indicators" className="flex-1">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={businessTiles}
                          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={70} tick={{ fontSize: 10, fontWeight: 900, fill: '#475569' }} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: 'none', color: '#fff' }} />
                          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}>
                            {businessTiles.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.label === 'Delivered' ? '#10b981' : entry.label === 'RTO' ? '#f43f5e' : '#6366f1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card title="Claim Status" subtitle="Pending/Approved" className="flex-1">
                    <div className="grid grid-cols-2 gap-2 h-full content-center">
                      <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-3 text-center hover:bg-violet-50 transition-colors cursor-pointer" onClick={() => navigate('/approve-claim')}>
                        <div className="text-[0.55rem] font-black text-violet-400 uppercase tracking-widest mb-1">Approved</div>
                        <div className="text-lg font-black text-violet-700">{formatCount(dashboardCards.approved_claims?.total_orders ?? summaryMap.Claim?.approved_count)}</div>
                        <div className="text-[0.6rem] font-bold text-violet-500 mt-1">₹{formatAmount(dashboardCards.approved_claims?.total_cost ?? summaryMap.Claim?.approved_amount)}</div>
                      </div>
                      <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/30 p-3 text-center hover:bg-fuchsia-50 transition-colors cursor-pointer" onClick={() => navigate('/approve-claim')}>
                        <div className="text-[0.55rem] font-black text-fuchsia-400 uppercase tracking-widest mb-1">Pending</div>
                        <div className="text-lg font-black text-fuchsia-700">{formatCount(dashboardCards.pending_claims?.total_orders ?? summaryMap.Claim?.pending_count)}</div>
                        <div className="text-[0.6rem] font-bold text-fuchsia-500 mt-1">₹{formatAmount(dashboardCards.pending_claims?.total_cost ?? summaryMap.Claim?.pending_amount)}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
