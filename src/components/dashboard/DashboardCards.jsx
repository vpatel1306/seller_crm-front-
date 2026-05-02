import React, { useEffect, useMemo, useState } from 'react';
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
  FiChevronRight,
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
  LabelList,
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
  { key: 'all_orders', status: 'All Received Orders', title: 'All Orders', route: '/all-orders', tone: 'border-teal-200 bg-teal-50', icon: FiLayers },
  { key: 'delivered', status: 'Delivered Orders', title: 'Delivered', route: '/delivered-orders', tone: 'border-emerald-200 bg-emerald-50', icon: FiCheckCircle },
  { key: 'shipped', status: 'Shipped Out For Delivery', title: 'Dispatched', route: '/shipped', tone: 'border-indigo-200 bg-indigo-50', icon: FiBox },
  { key: 'cancelled', status: 'Cancelled Orders', title: 'Cancelled', route: '/cancelled-orders', tone: 'border-slate-300 bg-slate-100', icon: FiXCircle },
  { key: 'return_received', status: 'Return Received', title: 'Returns', route: '/received-returns', tone: 'border-rose-200 bg-rose-50', icon: FiTrendingDown },
  { key: 'ready_to_ship', status: 'Processing', title: 'Processing (Ready)', route: '/ready-to-ship', tone: 'border-blue-200 bg-blue-50', icon: FiClock },
];

const RETURNS_CARDS = [
  { key: 'return_in_transit', status: 'Return In Transit', title: 'In Transit', route: '/return-in-transit', color: '#f59e0b' },
  { key: 'return_received', status: 'Return Received', title: 'Received', route: '/received-returns', color: '#10b981' },
  { key: 'return_not_received', status: 'Return Not Received', title: 'Not Received', route: '/returns-not-received', color: '#f43f5e' },
  { key: 'return_mismatch', status: 'Return Mismatch', title: 'Mismatch', route: '/return-mismatch', color: '#ef4444' },
];

const SEPARATE_CARDS = [
  { key: 'unsettled_pickup', status: 'Unsettled Pickup', title: 'Unsettled Pickup', route: '/unsettled-pickup', tone: 'border-violet-200 bg-violet-50', icon: FiBox },
  { key: 'cancel_pickup', status: 'Cancel Pickup', title: 'Cancelled Pickup', route: '/cancel-pickup', tone: 'border-fuchsia-200 bg-fuchsia-50', icon: FiXCircle },
  { key: 'approved_claims', status: 'Approved Claims', title: 'Approved Claims', route: '/approve-claim', tone: 'border-emerald-200 bg-emerald-50', icon: FiCheckCircle },
  { key: 'pending_claims', status: 'Pending Claims', title: 'Pending Claims', route: '/approve-claim', tone: 'border-amber-200 bg-amber-50', icon: FiClock },
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
      {/* INDEPENDENT PAYMENT CYCLE (Used in executive grid) */}
      {viewMode === 'payment-cycle' && (
        <Card title="Payment Cycle" subtitle="Financial settlement status" className="h-full" contentClassName="p-3.5 space-y-2.5">
          {[
            { key: 'received_payment', status: 'Received Payment', title: 'Received', color: 'text-emerald-600', icon: FiCheckCircle, bg: 'bg-emerald-50', route: '/received-payment-orders' },
            { key: 'pending_payment', status: 'Pending Payment', title: 'Pending', color: 'text-amber-600', icon: FiClock, bg: 'bg-amber-50', route: '/pending-payment-orders' },
            { key: 'payment_mismatch', status: 'Payment Mismatch', title: 'Mismatch', color: 'text-rose-600', icon: FiAlertCircle, bg: 'bg-rose-50', route: '/payment-mismatch' },
            { key: 'received', valueKey: 'received_bank_amount', title: 'Bank Credit', color: 'text-blue-600', icon: FiCreditCard, bg: 'bg-blue-50', route: '/bank-credit-statement' },
          ].map(p => {
            const live = p.key === 'received'
              ? { total_orders: headlineMetrics.received_payment_orders, total_cost: headlineMetrics.received_bank_amount }
              : dashboardCards[p.key] || summaryMap[p.status] || {};

            return (
              <div key={p.key} onClick={() => p.route && navigate(p.route)} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${p.bg} ${p.color}`}>
                    <p.icon size={16} />
                  </div>
                  <div>
                    <div className="text-[0.55rem] font-bold uppercase tracking-widest text-slate-400 leading-none">{p.title}</div>
                    <div className="mt-1 text-xs font-black text-slate-900 leading-none">{formatCount(live.total_orders)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-black ${p.color}`}>₹{formatAmount(live.total_cost)}</div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

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
            <div className="flex-1 min-h-[180px] w-full flex items-center justify-center">
              {[
                { name: 'Net Profit', value: Math.max(0, Number(accountStatus.net_profit || 0)), color: '#10b981' },
                { name: 'Ad Spend', value: Number(headlineMetrics.advertisement_cost || 0), color: '#f59e0b' },
                { name: 'Return Loss', value: Number(accountStatus.return_not_received_loss || 0), color: '#ef4444' },
                { name: 'Payment Loss', value: Number(accountStatus.payment_loss || 0), color: '#f43f5e' },
                { name: 'Other Costs', value: Math.max(0, Number(headlineMetrics.total_sales_amount || 0) - Number(accountStatus.net_profit || 0) - Number(headlineMetrics.advertisement_cost || 0) - Number(accountStatus.return_not_received_loss || 0) - Number(accountStatus.payment_loss || 0)), color: '#94a3b8' },
              ].filter(d => d.value > 0).length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <FiTrendingUp size={32} className="mb-2 opacity-20" />
                  <div className="text-[0.65rem] font-black uppercase tracking-widest">Awaiting Data</div>
                </div>
              )}
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

      {/* RETURNS DISTRIBUTION CHART (Standalone) */}
      {viewMode === 'returns-distribution' && (
        <Card
          title="Returns Distribution"
          subtitle="Volume by return status"
          className="h-full flex flex-col"
          contentClassName="p-4 flex-1 flex flex-col min-h-[300px]"
        >
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={RETURNS_CARDS.map(r => {
                  const live = dashboardCards[r.key] || summaryMap[r.status] || {};
                  return { name: r.title, count: Number(live.total_orders || 0), color: r.color };
                })}
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '800' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                  {RETURNS_CARDS.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* FULFILMENT LIFECYCLE PROGRESS (Standalone) */}
      {viewMode === 'fulfilment-lifecycle' && (
        <Card
          title="Fulfilment Lifecycle"
          subtitle="Stage performance"
          className="h-full flex flex-col"
          contentClassName="p-4 flex-1 flex flex-col justify-center"
        >
          <div className="space-y-6">
            {FULFILMENT_CARDS.map((c, index) => {
              const live = dashboardCards[c.key] || summaryMap[c.status] || {};
              const totalIncoming = dashboardCards.all_orders?.total_orders || summaryMap['Total Orders']?.count || 1;
              const percentage = Math.round((Number(live.total_orders || 0) / totalIncoming) * 100);
              const barColors = ['bg-teal-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-slate-400', 'bg-rose-500', 'bg-blue-500'];
              const textColors = ['group-hover:text-teal-600', 'group-hover:text-emerald-600', 'group-hover:text-indigo-600', 'group-hover:text-slate-600', 'group-hover:text-rose-600', 'group-hover:text-blue-600'];
              const iconBgColors = ['group-hover:bg-teal-50', 'group-hover:bg-emerald-50', 'group-hover:bg-indigo-50', 'group-hover:bg-slate-100', 'group-hover:bg-rose-50', 'group-hover:bg-blue-50'];

              return (
                <div key={c.key} className="space-y-1 group cursor-pointer" onClick={() => (live.route || c.route) && navigate(live.route || c.route)}>
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-md bg-slate-50 text-slate-400 transition-all ${iconBgColors[index]} ${textColors[index]}`}>
                        <c.icon size={11} />
                      </div>
                      <span className={`text-[11px] font-black text-slate-700 uppercase tracking-tight transition-colors ${textColors[index]}`}>{c.title}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[0.65rem] font-black text-slate-900">{formatCount(live.total_orders)}</span>
                      <span className={`text-[0.55rem] font-black ml-0.5 ${textColors[index].replace('group-hover:', '')}`}>({percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-out ${barColors[index]}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* SECTION 2 & 3: OPERATIONAL COMMAND CENTER */}
      {(viewMode === 'all' || viewMode === 'operational') && (
        <section className="space-y-4 border-t border-slate-200 pt-2">
          <SectionHeader title="Operational Insights" subtitle="Logistics and claim management" />

          {/* SEPARATE STATUS CARDS GRID */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-2">
            {SEPARATE_CARDS.map((item) => {
              const live = item.key === 'approved_claims'
                ? { total_orders: summaryMap.Claim?.approved_count, total_cost: summaryMap.Claim?.approved_amount }
                : item.key === 'pending_claims'
                  ? { total_orders: summaryMap.Claim?.pending_count, total_cost: summaryMap.Claim?.pending_amount }
                  : dashboardCards[item.key] || summaryMap[item.status] || {};

              return (
                <StatusCard
                  key={item.key}
                  title={item.title}
                  count={live.total_orders}
                  amount={live.total_cost}
                  tone={item.tone}
                  icon={item.icon}
                  onClick={() => navigate(item.route)}
                />
              );
            })}
          </div>


        </section>
      )}

    </div>
  );
}
