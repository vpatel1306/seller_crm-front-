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
} from 'react-icons/fi';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const formatAmount = (value) =>
  Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

const KPI_CONFIG = [
  {
    key: 'sales',
    title: 'Sales value',
    valueKey: 'total_sales_amount',
    helper: (metrics) => `${formatCount(metrics.total_sales_orders)} orders in selected range`,
    tone: 'from-slate-950 via-slate-900 to-slate-800',
    route: '/all-orders',
    icon: FiLayers,
  },
  {
    key: 'received',
    title: 'Received in bank',
    valueKey: 'received_bank_amount',
    helper: (metrics) => `${formatCount(metrics.received_payment_orders)} settled orders`,
    tone: 'from-emerald-700 via-green-700 to-lime-600',
    route: '/bank-credit-statement',
    icon: FiCreditCard,
  },
  {
    key: 'pending',
    title: 'Pending payment cost',
    valueKey: 'pending_payment_amount',
    helper: (metrics) => `${formatCount(metrics.pending_payment_orders)} orders waiting`,
    tone: 'from-amber-500 via-orange-500 to-red-500',
    route: '/pending-payment-orders',
    icon: FiClock,
  },
  {
    key: 'profit',
    title: 'Net profit',
    valueKey: 'net_profit',
    helper: (metrics) => `${Number(metrics.net_profit_percentage || 0).toFixed(2)}% after losses`,
    tone: 'from-sky-700 via-indigo-700 to-violet-700',
    route: null,
    icon: FiTrendingUp,
  },
];

const FULFILMENT_CARDS = [
  { key: 'all_orders', status: 'All Received Orders', title: 'All orders', route: '/all-orders', tone: 'bg-slate-50 border-slate-200' },
  { key: 'ready_to_ship', status: 'Processing', title: 'Ready to ship', route: '/ready-to-ship', tone: 'bg-blue-50 border-blue-200' },
  { key: 'shipped', status: 'Shipped Out For Delivery', title: 'Shipped', route: '/shipped', tone: 'bg-cyan-50 border-cyan-200' },
  { key: 'out_for_delivery', status: 'Out For Delivery', title: 'Out for delivery', route: '/out-for-delivery', tone: 'bg-emerald-50 border-emerald-200' },
  { key: 'cancelled', status: 'Cancelled Orders', title: 'Cancelled', route: '/cancelled-orders', tone: 'bg-slate-100 border-slate-200' },
];

const RETURNS_CARDS = [
  { key: 'return_in_transit', status: 'Return In Transit', title: 'Return in transit', route: '/return-in-transit', tone: 'bg-amber-50 border-amber-200' },
  { key: 'return_received', status: 'Return Received', title: 'Return received', route: '/received-returns', tone: 'bg-teal-50 border-teal-200' },
  { key: 'return_not_received', status: 'Return Not Received', title: 'Return not received', route: '/returns-not-received', tone: 'bg-rose-50 border-rose-200' },
  { key: 'return_mismatch', status: 'Return Mismatch', title: 'Return mismatch', route: '/return-mismatch', tone: 'bg-red-50 border-red-200' },
];

const SETTLEMENT_CARDS = [
  { key: 'received_payment', status: 'Received Payment', title: 'Received payment', route: '/received-payment-orders', tone: 'bg-emerald-50 border-emerald-200' },
  { key: 'pending_payment', status: 'Pending Payment', title: 'Pending payment', route: '/pending-payment-orders', tone: 'bg-amber-50 border-amber-200' },
  { key: 'payment_mismatch', status: 'Payment Mismatch', title: 'Payment mismatch', route: '/payment-mismatch', tone: 'bg-red-50 border-red-200' },
  { key: 'unsettled_pickup', status: 'Unsettled Pickup', title: 'Unsettled pickup', route: '/unsettled-pickup', tone: 'bg-violet-50 border-violet-200' },
  { key: 'cancel_pickup', status: 'Cancel Pickup', title: 'Cancel pickup', route: '/cancel-pickup', tone: 'bg-fuchsia-50 border-fuchsia-200' },
];

function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function KpiCard({ item, onClick }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={item.route ? onClick : undefined}
      className={`group relative overflow-hidden rounded-[28px] bg-gradient-to-br ${item.tone} p-5 text-left text-white shadow-[0_22px_54px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-1 ${item.route ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
          <Icon size={20} />
        </div>
        {item.route ? <FiArrowUpRight size={18} className="text-white/75 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /> : null}
      </div>
      <div className="mt-8">
        <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.24em] text-white/70">{item.title}</div>
        <div className="mt-3 text-3xl font-black leading-none">Rs. {item.value}</div>
        <div className="mt-3 text-sm font-semibold text-white/80">{item.helper}</div>
      </div>
    </button>
  );
}

function ActionCard({ item, onOpen }) {
  const toneClasses = item.tone === 'critical'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-amber-200 bg-amber-50 text-amber-700';

  return (
    <button
      type="button"
      onClick={() => item.route && onOpen(item.route)}
      className={`w-full rounded-[24px] border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black uppercase tracking-[0.18em]">{item.title}</div>
          <div className="mt-1 text-xs font-semibold opacity-80">{formatCount(item.count)} orders need review</div>
        </div>
        <FiAlertCircle size={18} />
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] opacity-70">Impact amount</div>
          <div className="mt-1 text-2xl font-black">Rs. {formatAmount(item.amount)}</div>
        </div>
        <span className="text-xs font-black uppercase tracking-[0.2em]">Open</span>
      </div>
    </button>
  );
}

function StatusCard({ title, count, amount, tone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[148px] w-full flex-col justify-between rounded-[22px] border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${tone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-black text-slate-900">{title}</div>
        <FiArrowUpRight size={16} className="text-slate-400" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-slate-500">Orders</div>
          <div className="mt-1 text-2xl font-black text-slate-950">{formatCount(count)}</div>
        </div>
        <div className="text-right">
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-slate-500">Amount</div>
          <div className="mt-1 text-lg font-black text-slate-900">Rs. {formatAmount(amount)}</div>
        </div>
      </div>
    </button>
  );
}

function MiniInsight({ label, value, tone = 'text-slate-950', icon }) {
  const Icon = icon;

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-slate-500">{label}</div>
        {Icon ? <Icon size={16} className="text-slate-400" /> : null}
      </div>
      <div className={`mt-3 text-2xl font-black ${tone}`}>{value}</div>
    </div>
  );
}

function useDashboardMetrics(averages) {
  return [
    { label: 'Monthly Avg. Orders', value: String(averages.monthly_avg_orders ?? '-') },
    { label: 'Daily Avg. Orders', value: String(averages.daily_avg_orders ?? '-'), positive: Number(averages.daily_avg_orders) > 0 },
    { label: 'Avg. Return Charge', value: formatAmount(averages.avg_return_charge), negative: Number(averages.avg_return_charge) > 0 },
    { label: 'Avg. P/L Per Order', value: formatAmount(averages.avg_pl_per_order), positive: Number(averages.avg_pl_per_order) >= 0, negative: Number(averages.avg_pl_per_order) < 0 },
    { label: "Today's Pickup", value: String(averages.today_pickup ?? '-') },
    { label: "Today's Return Receipts", value: String(averages.today_returns_received ?? '-') },
    { label: "Today's Bank Credit", value: formatAmount(averages.today_bank_credit), positive: Number(averages.today_bank_credit) > 0 },
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

export default function DashboardCards({ onMetricsReady, onAccountDetail }) {
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
      .catch(() => {});
  }, [activeAccount?.id, selectedDateRange?.from, selectedDateRange?.to, onMetricsReady, onAccountDetail]);

  const headlineMetrics = overview.headline_metrics || {};
  const actionNeeded = Array.isArray(overview.action_needed) ? overview.action_needed : [];

  const kpiCards = useMemo(() => KPI_CONFIG.map((config) => ({
    ...config,
    value: formatAmount(headlineMetrics[config.valueKey]),
    helper: config.helper(headlineMetrics),
  })), [headlineMetrics]);

  const businessTiles = [
    { label: 'Picked', value: formatCount(businessInsights.picked), tone: 'text-slate-950', icon: FiBox },
    { label: 'Shipped', value: formatCount(businessInsights.shipped), tone: 'text-sky-700', icon: FiTrendingUp },
    { label: 'RTO', value: formatCount(businessInsights.rto), tone: 'text-rose-700', icon: FiTrendingDown },
    { label: 'Delivered', value: formatCount(businessInsights.delivered), tone: 'text-emerald-700', icon: FiCheckCircle },
  ];

  const lossTiles = [
    { label: 'Ad spend', value: `Rs. ${formatAmount(headlineMetrics.advertisement_cost)}`, tone: 'text-amber-700' },
    { label: 'Payment loss', value: `Rs. ${formatAmount(accountStatus.payment_loss)}`, tone: 'text-rose-700' },
    { label: 'Return loss', value: `Rs. ${formatAmount(accountStatus.return_not_received_loss)}`, tone: 'text-rose-700' },
    { label: 'Mismatch loss', value: `Rs. ${formatAmount(accountStatus.wrong_damage_missing_returns)}`, tone: 'text-rose-700' },
  ];

  const renderStatusGrid = (items) => (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const live = dashboardCards[item.key] || summaryMap[item.status] || {};
        return (
          <StatusCard
            key={item.key || item.status}
            title={item.title}
            count={live.total_orders}
            amount={live.total_cost}
            tone={item.tone}
            onClick={() => (live.route || item.route) && navigate(live.route || item.route)}
          />
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((item) => (
          <KpiCard key={item.key} item={item} onClick={() => item.route && navigate(item.route)} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card
          className="overflow-hidden"
          title="Action Needed"
          subtitle="Seller-facing issues that should be reviewed first"
          action={
            <button type="button" className="text-sm font-bold text-primary" onClick={() => navigate('/payment-mismatch')}>
              Review issues
            </button>
          }
        >
          <div className="grid gap-3 md:grid-cols-3">
            {actionNeeded.map((item) => (
              <ActionCard key={item.status} item={item} onOpen={navigate} />
            ))}
          </div>
        </Card>

        <Card
          className="overflow-hidden"
          title="Business Pulse"
          subtitle="Quick operational snapshot for the selected range"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {businessTiles.map((item) => (
              <MiniInsight key={item.label} {...item} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card title="Fulfilment Journey" subtitle="Track order movement from intake to dispatch">
          {renderStatusGrid(FULFILMENT_CARDS)}
        </Card>

        <Card title="Settlement Watch" subtitle="Keep payment and pickup follow-up in one place">
          {renderStatusGrid(SETTLEMENT_CARDS)}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card title="Returns And Claims" subtitle="Return exceptions with direct drilldown">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {RETURNS_CARDS.map((item) => {
              const live = dashboardCards[item.key] || summaryMap[item.status] || {};
              return (
                <div key={item.key}>
                  <StatusCard
                    title={item.title}
                    count={live.total_orders}
                    amount={live.total_cost}
                    tone={item.tone}
                    onClick={() => (live.route || item.route) && navigate(live.route || item.route)}
                  />
                </div>
              );
            })}
            <div>
              <StatusCard
                title="Approved claims"
                count={dashboardCards.approved_claims?.total_orders ?? summaryMap.Claim?.approved_count}
                amount={dashboardCards.approved_claims?.total_cost ?? summaryMap.Claim?.approved_amount}
                tone="bg-violet-50 border-violet-200"
                onClick={() => navigate(dashboardCards.approved_claims?.route || '/approve-claim')}
              />
            </div>
            <div>
              <StatusCard
                title="Pending claims"
                count={dashboardCards.pending_claims?.total_orders ?? summaryMap.Claim?.pending_count}
                amount={dashboardCards.pending_claims?.total_cost ?? summaryMap.Claim?.pending_amount}
                tone="bg-fuchsia-50 border-fuchsia-200"
                onClick={() => navigate(dashboardCards.pending_claims?.route || '/approve-claim')}
              />
            </div>
          </div>
        </Card>

        <Card title="Profit Snapshot" subtitle="High-level cost pressure and net outcome">
          <div className="grid gap-3 sm:grid-cols-2">
            {lossTiles.map((item) => (
              <MiniInsight key={item.label} {...item} />
            ))}
            <MiniInsight
              label="Net profit"
              value={`Rs. ${formatAmount(accountStatus.net_profit)}`}
              tone={(Number(accountStatus.net_profit) || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}
              icon={FiTrendingUp}
            />
            <MiniInsight
              label="Total SKU"
              value={formatCount(accountStatus.total_sku)}
              tone="text-slate-950"
              icon={FiLayers}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
