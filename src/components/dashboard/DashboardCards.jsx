import { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Maps API status → card config (static design props only)
const CARD_CONFIG = [
  { apiStatus: 'All Received Orders', title: 'All Received Orders', amountLabel: 'Cost Amount', tone: 'from-sky-700 to-blue-700', route: '/all-orders' },
  { apiStatus: 'Cancelled Orders', title: 'Cancelled', amountLabel: 'Cost Amount', tone: 'from-slate-700 to-slate-800', route: '/cancelled-orders' },
  { apiStatus: 'Processing', title: 'Ready To Ship', amountLabel: 'Cost Amount', tone: 'from-slate-700 to-slate-800', route: '/ready-to-ship' },
  { apiStatus: 'Shipped Out For Delivery', title: 'Shipped', amountLabel: 'Cost Amount', tone: 'from-slate-600 to-slate-700', route: '/shipped' },
  { apiStatus: 'Return In Transit', title: 'Return In Transit', amountLabel: 'Cost Amount', tone: 'from-amber-600 to-orange-700', route: '/return-in-transit' },
  { apiStatus: 'Out For Delivery', title: 'Out For Delivery', amountLabel: 'Cost Amount', tone: 'from-emerald-600 to-green-700', route: '/out-for-delivery' },
  { apiStatus: 'Return Received', title: 'Return Received', amountLabel: 'Cost Amount', tone: 'from-emerald-700 to-teal-700', route: '/received-returns' },
  { apiStatus: 'Return Not Received', title: 'Return Not Receive', amountLabel: 'Cost Amount', tone: 'from-rose-700 to-red-700', route: '/returns-not-received' },
  { apiStatus: 'Return Mismatch', title: 'Return Mismatch', amountLabel: 'Cost Amount', tone: 'from-rose-700 to-red-700', route: '/return-mismatch' },
  { apiStatus: 'Payment Mismatch', title: 'Payment Mismatch', amountLabel: 'Cost Amount', tone: 'from-rose-700 to-red-700', route: '/payment-mismatch' },
  { apiStatus: 'Received Payment', title: 'Received Payment', amountLabel: 'Amount', tone: 'from-sky-700 to-indigo-700', route: '/received-payment-orders' },
  { apiStatus: 'Pending Payment', title: 'Pending Payment', amountLabel: 'Cost Amount', tone: 'from-teal-700 to-cyan-700', route: '/pending-payment-orders' },
  { apiStatus: 'Unsettled Pickup', title: 'Unsettled Pickup', amountLabel: 'Cost Amount', tone: 'from-violet-700 to-fuchsia-700', route: '/unsettled-pickup' },
  { apiStatus: 'Cancel Pickup', title: 'Cancel Pickup', amountLabel: 'Cost Amount', tone: 'from-rose-700 to-pink-700', route: '/cancel-pickup' },
];

const formatAmount = (val) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function MetricCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={item.route ? onClick : undefined}
      className={`relative flex min-h-[130px] w-full flex-col justify-between overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br ${item.tone} p-4 sm:p-5 text-left text-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-1 ${item.route ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start gap-3">
        <div>
          <div className="text-sm font-extrabold">{item.title}</div>
          {item.note ? <div className="mt-1 mb-2 text-xs text-white/70">{item.note}</div> : null}
        </div>
        {item.badge ? <span className="rounded-full bg-white/12 px-2.5 py-1 text-[0.65rem] font-extrabold tracking-[0.2em] text-amber-200">{item.badge}</span> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/60">{item.amountLabel}</div>
          <div className="mt-2 text-[1.5rem] font-black leading-none">{item.amount}</div>
        </div>
        <div className="text-right">
          <div className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/60">Orders</div>
          <div className="mt-2 text-[1.5rem] font-black leading-none">{item.count}</div>
        </div>
      </div>

      {item.route ? <FiArrowUpRight size={18} className="absolute right-5 top-5 text-white/70" /> : null}
    </button>
  );
}

function InsightSplitCard({ title, tone, columns, route, onColumnClick }) {
  return (
    <button
      type="button"
      onClick={route}
      className={`flex min-h-[100px] w-full flex-col rounded-[24px] bg-gradient-to-br ${tone} p-4 text-left text-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-1 sm:p-[18px]`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-base font-extrabold sm:text-lg">{title}</div>
        {route ? <FiArrowUpRight size={18} className="text-white/75" /> : null}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2.5 sm:gap-3">
        {columns.map((column) => (
          <div
            key={column.label}
            className="rounded-[18px] border border-white/10 bg-white/10 p-3 text-center backdrop-blur-sm sm:p-4"
            onClick={(event) => {
              event.stopPropagation();
              onColumnClick?.(column);
            }}
          >
            <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/70">{column.label}</div>
            <div className="mt-2 text-[1.35rem] font-black leading-none sm:mt-3 sm:text-[1.5rem]">{column.value}</div>
            <div className="mt-1.5 text-sm font-semibold text-white/85 sm:mt-2">{column.subtext}</div>
          </div>
        ))}
      </div>
    </button>
  );
}

export function useDashboardMetrics(averages) {
  return [
    { label: 'Monthly Avg. Orders', value: String(averages.monthly_avg_orders ?? '-') },
    { label: 'Daily Avg. Orders', value: String(averages.daily_avg_orders ?? '-'), positive: Number(averages.daily_avg_orders) > 0 },
    { label: 'Avg. Return Charge', value: formatAmount(averages.avg_return_charge), negative: Number(averages.avg_return_charge) < 0 },
    { label: 'Avg. P/L Per Order', value: formatAmount(averages.avg_pl_per_order), positive: Number(averages.avg_pl_per_order) >= 0, negative: Number(averages.avg_pl_per_order) < 0 },
    { label: "Today's Pickup", value: String(averages.today_pickup ?? '-'), positive: Number(averages.today_pickup) > 0 },
    { label: "Today's Returns Received", value: String(averages.today_returns_received ?? '-'), negative: Number(averages.today_returns_received) > 0 },
    { label: "Today's Bank Credit", value: formatAmount(averages.today_bank_credit) },
  ];
}

export function useAccountDetails(accountStatus) {
  return [
    { label: 'Sales Profits', value: formatAmount(accountStatus.sales_profit) },
    { label: 'RTO Packaging Loss', value: String(accountStatus.rto_packaging_loss ?? '-') },
    { label: 'Customer Return Pending', value: formatAmount(accountStatus.customer_return_charge_pending) },
    { label: 'Total SKU', value: String(accountStatus.total_sku ?? '-') }
  ];
}

export default function DashboardCards({ onMetricsReady, onAccountDetail }) {
  const navigate = useNavigate();
  const [summaryMap, setSummaryMap] = useState({});
  const [accountStatus, setAccountStatus] = useState({});
  const [businessInsights, setBusinessInsights] = useState({});
  const [averages, setAverages] = useState({});
  const { activeAccount } = useAuth();

  useEffect(() => {api.get('/get-dashboard-summary',{
    headers: {'account': activeAccount?.id || ''},
  })
      .then((res) => {
        const payload = res.data || {};
        const map = {};
        (payload.data || []).forEach((item) => { map[item.status] = item; });
        setSummaryMap(map);
        setAccountStatus(payload.account_status || {});
        setBusinessInsights(payload.business_insights || {});
        const resolvedAverages = payload.averages || {};
        const accountDetails = payload.account_status || {};
        setAverages(resolvedAverages);
        onMetricsReady?.(useDashboardMetrics(resolvedAverages));
        onAccountDetail?.(accountDetails);
      })
      .catch(() => {});
  }, [activeAccount?.id]);

  const claimSummary = summaryMap.Claim || {};
  const advertisementSummary = summaryMap.Advertisement || {};
  const bankSummary = summaryMap['Received In Bank Acc.'] || {};

  const resolvedBusinessInsights = [
    { label: 'Picked', value: String(businessInsights.picked ?? 0), tone: 'text-text' },
    { label: 'Shipped', value: String(businessInsights.shipped ?? 0), tone: 'text-text' },
    { label: 'RTO', value: String(businessInsights.rto ?? 0), tone: 'text-red-600' },
    { label: 'Delivered', value: String(businessInsights.delivered ?? 0), tone: 'text-text' },
    { label: 'Return', value: String(businessInsights.return ?? 0), tone: 'text-red-600' },
    { label: 'Delivery', value: String(businessInsights.delivery ?? 0), tone: 'text-green-700' },
  ];

  const orderCards = CARD_CONFIG.map((cfg) => {
    const live = cfg.apiStatus ? summaryMap[cfg.apiStatus] : null;
    return {
      ...cfg,
      amount: live ? formatAmount(live.total_cost) : '—',
      count: live ? String(live.total_orders) : '—',
    };
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {orderCards.slice(0, 4).map((item) => (
          <MetricCard key={item.title} item={item} onClick={() => item.route && navigate(item.route)} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {orderCards.slice(4, 8).map((item) => (
          <MetricCard key={item.title} item={item} onClick={() => item.route && navigate(item.route)} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard item={orderCards[8]} onClick={() => navigate(orderCards[8].route)} />
        <MetricCard item={orderCards[9]} onClick={() => navigate(orderCards[9].route)} />
        <MetricCard item={orderCards[10]} onClick={() => navigate(orderCards[10].route)} />
        <MetricCard item={orderCards[11]} onClick={() => navigate(orderCards[11].route)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr_1.2fr] 2xl:grid-cols-[1fr_1fr_1.3fr_1.3fr]">
        <MetricCard item={orderCards[12]} onClick={() => navigate(orderCards[12].route)} />
        <MetricCard item={orderCards[13]} onClick={() => navigate(orderCards[13].route)} />
        <InsightSplitCard
          title="Claim"
          tone="from-violet-700 to-fuchsia-700"
          onColumnClick={(column) => column.path && navigate(column.path)}
          columns={[
            { label: 'Approved', value: String(claimSummary.approved_count ?? 0), subtext: `${formatAmount(claimSummary.approved_amount)} Rs`, path: '/approve-claim' },
            { label: 'Pending', value: String(claimSummary.pending_count ?? 0), subtext: `${formatAmount(claimSummary.pending_amount)} Rs` },
          ]}
        />
        <InsightSplitCard
          title="Smart Tickets"
          tone="from-sky-700 to-indigo-700"
          // route={() => navigate('/smart-tickets')}
          columns={[
            { label: 'New Found', value: '136', subtext: '19,030.00' },
            { label: 'Open + Closed', value: '206', subtext: '20,461.00 / 10,232.00' },
          ]}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1.2fr] 2xl:grid-cols-[1fr_1fr_1.4fr]">
        <div className="rounded-[24px] bg-gradient-to-br from-amber-600 to-orange-600 p-4 text-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] sm:p-5">
          <div className="text-base font-extrabold sm:text-lg">Advertisement</div>
          <div className="mt-1 text-xs font-medium text-white/75">0.55 Rs. per order</div>
          <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
            <div className="rounded-[18px] border border-white/10 bg-white/10 p-3.5 sm:p-4">
              <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/70">Paid</div>
              <div className="mt-1 text-[1.5rem] font-black leading-none">{formatAmount(advertisementSummary.total_cost)}</div>
              <div className="mt-1 text-sm font-semibold text-white/85">Campaign wallet</div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/10 p-3.5 sm:p-4">
              <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/70">Used</div>
              <div className="mt-1 text-[1.5rem] font-black leading-none">{advertisementSummary.total_orders ?? 0}</div>
              <div className="mt-1 text-sm font-semibold text-white/85">Campaign orders</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/bank-credit-statement')}
          className="rounded-[24px] bg-gradient-to-br from-emerald-700 to-green-700 p-4 text-left text-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-1 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-extrabold sm:text-lg">Received In Bank Acc.</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">Last Payment {bankSummary.last_payment_date || '-'}</div>
            </div>
            <FiArrowUpRight size={18} className="mt-1 text-white/75" />
          </div>

          <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
            <div className="rounded-[18px] border border-white/10 bg-white/10 p-3.5 sm:p-4">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/65">Amount</div>
              <div className="mt-1 text-[1.5rem] font-black leading-none">{formatAmount(bankSummary.total_cost)}</div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/10 p-3.5 sm:p-4">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/65">Total SKU</div>
              <div className="mt-1 text-xl font-black">{accountStatus.total_sku ?? 0}</div>
              <div className="mt-1 text-sm font-semibold text-white/80">Available catalog count</div>
            </div>
          </div>
        </button>

        <Card
          className="overflow-hidden"
          title="Business Insights"
          subtitle="Click through to inspect detailed SKU analytics"
          action={
            <button type="button" className="text-sm font-bold text-primary" onClick={() => navigate('/sku-report')}>
              View report
            </button>
          }
        >
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {resolvedBusinessInsights.map((item) => (
              <div key={item.label} className="rounded-[18px] border border-border/70 bg-surface-alt p-3.5 sm:p-4">
                <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">{item.label}</div>
                <div className={`text-[1.5rem] font-black ${item.tone}`}>{item.value}</div>
                <div className={`text-sm font-bold ${item.tone}`}>{item.sub || 'Stable trend'}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
