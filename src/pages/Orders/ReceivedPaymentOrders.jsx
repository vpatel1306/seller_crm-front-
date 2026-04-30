import CommonOrderPage from '../../components/orders/CommonOrderPage';
import OrdersSidebarSection from '../../components/orders/OrdersSidebarSection';
import SummaryTable from '../../components/ui/SummaryTable';
import { FiCreditCard, FiEdit2, FiInfo, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const RECEIVED_PAYMENT_COLUMNS = [
  {
    key: 'platform_order_id',
    label: 'Platform Order ID',
    className: 'min-w-[220px]',
    render: (row) => <span className="font-extrabold text-primary">{row.platform_order_id || '-'}</span>,
  },
  {
    key: 'order_date',
    label: 'Order Date',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.order_date)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    className: 'min-w-[180px]',
    render: (row) => (
      <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-text">
        {row.status || '-'}
      </span>
    ),
  },
  {
    key: 'order_status',
    label: 'Order Status',
    className: 'min-w-[150px]',
    render: (row) => (
      <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">
        {row.order_status || '-'}
      </span>
    ),
  },
  {
    key: 'sku',
    label: 'SKU',
    className: 'min-w-[220px]',
    render: (row) => <span className="font-semibold text-amber-700">{row.sku || '-'}</span>,
  },
  {
    key: 'qty',
    label: 'Qty',
    right: true,
    className: 'min-w-[72px]',
    render: (row) => <span className="text-text-muted">{row.qty ?? 0}</span>,
  },
  {
    key: 'selling_amount',
    label: 'Selling Amount',
    right: true,
    className: 'min-w-[130px]',
    render: (row) => <span className="font-bold text-text">{formatCurrency(row.selling_amount)}</span>,
  },
  {
    key: 'received_payment',
    label: 'Received Payment',
    right: true,
    className: 'min-w-[140px]',
    render: (row) => <span className="font-bold text-emerald-600">{formatCurrency(row.received_payment)}</span>,
  },
  {
    key: 'cost_amount',
    label: 'Cost Amount',
    right: true,
    className: 'min-w-[130px]',
    render: (row) => <span className="text-text-muted">{formatCurrency(row.cost_amount)}</span>,
  },
  {
    key: 'profit_loss',
    label: 'P/L',
    right: true,
    className: 'min-w-[110px]',
    render: (row) => (
      <span className={`font-extrabold ${(Number(row.profit_loss) || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {formatCurrency(row.profit_loss)}
      </span>
    ),
  },
  {
    key: 'payment_entry_count',
    label: 'Payment Entries',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="text-text-muted">{row.payment_entry_count ?? 0}</span>,
  },
  {
    key: 'first_payment_date',
    label: 'First Payment Date',
    className: 'min-w-[190px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.first_payment_date)}</span>,
  },
  {
    key: 'last_payment_date',
    label: 'Last Payment Date',
    className: 'min-w-[190px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.last_payment_date)}</span>,
  },
];

function formatCurrency(value) {
  return `Rs. ${(Number(value) || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '-';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleString('en-IN');
}

function mapReceivedPaymentResponse(payload, { page, limit }) {
  const list = Array.isArray(payload.data) ? payload.data : [];
  const total = Number(payload.total_count ?? payload.total_rows ?? payload.total) || list.length;

  return {
    list,
    total,
    resolvedPage: page,
    resolvedPageSize: limit,
    resolvedTotalPages: Math.max(Math.ceil(total / limit), 1),
    summaryData: {
      status_wise_counts: Array.isArray(payload.summary?.status_wise_counts) ? payload.summary.status_wise_counts : [],
      totals: payload.summary?.totals || {},
    },
  };
}

function MetricCard({ label, value, tone = 'text-text' }) {
  return (
    <div className="rounded-default border border-border bg-white px-4 py-4 shadow-sm">
      <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text-muted">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold ${tone}`}>{value}</div>
    </div>
  );
}

function TotalsGrid({ totals }) {
  const profitOrders = Number(totals?.profit_orders) || 0;
  const lossOrders = Number(totals?.loss_orders) || 0;
  const neutralOrders = Number(totals?.neutral_orders) || 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MetricCard label="Order Count" value={totals?.order_count ?? 0} tone="text-primary" />
      <MetricCard label="Received Payment" value={formatCurrency(totals?.received_payment)} tone="text-emerald-600" />
      <MetricCard label="Cost Amount" value={formatCurrency(totals?.cost_amount)} tone="text-amber-600" />
      <MetricCard label="Profit / Loss" value={formatCurrency(totals?.profit_loss)} tone={(Number(totals?.profit_loss) || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
      <MetricCard label="Profit Orders" value={profitOrders} tone="text-emerald-600" />
      <MetricCard label="Loss Orders" value={lossOrders} tone="text-rose-600" />
      <MetricCard label="Neutral Orders" value={neutralOrders} tone="text-slate-600" />
    </div>
  );
}

function renderReceivedPaymentSidebar({ groupedData, summaryTableProps }) {
  const statusRows = (groupedData.status_wise_counts || []).map((item, index) => ({
    id: `status-${index}`,
    status: item.order_status || 'Unknown',
    orders: item.order_count ?? 0,
    received_payment: formatCurrency(item.received_payment),
    cost_amount: formatCurrency(item.cost_amount),
    profit_loss: formatCurrency(item.profit_loss),
    profitLossTone: (Number(item.profit_loss) || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
  }));

  return (
    <OrdersSidebarSection>
      <TotalsGrid totals={groupedData.totals || {}} />

      <SummaryTable
        {...summaryTableProps}
        title="Status Wise Summary"
        rows={statusRows}
        cols={[
          { key: 'status', label: 'Status', color: () => 'text-text' },
          { key: 'orders', label: 'Orders', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'received_payment', label: 'Received', right: true, color: () => 'text-emerald-600 text-right font-bold' },
          { key: 'cost_amount', label: 'Cost', right: true, color: () => 'text-amber-600 text-right font-bold' },
          { key: 'profit_loss', label: 'P/L', right: true, color: (row) => `${row.profitLossTone} text-right font-extrabold` },
        ]}
      />
    </OrdersSidebarSection>
  );
}

export default function ReceivedPaymentOrders() {
  const navigate = useNavigate();

  return (
    <CommonOrderPage
      title="Received Payment Orders"
      breadcrumbLabel="Received Payment Orders"
      recordTitle="Received Payment Records"
      loadingText="Loading received payment orders..."
      emptyText="No received payment orders found."
      endpoint="/get-received-payment-orders"
      buildRequestPayload={({ filterData, fromDate, toDate, filters, page, limit }) => ({
        filter_data: filterData,
        start_date: fromDate || '',
        end_date: toDate || '',
        order_filter: filters.order_filter || 'All',
        page_no: page,
        limit,
      })}
      mapResponse={mapReceivedPaymentResponse}
      columns={RECEIVED_PAYMENT_COLUMNS}
      renderSidebar={renderReceivedPaymentSidebar}
      rowActions={[
        // { key: 'edit', label: 'Edit Order', icon: FiEdit2, className: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' },
        // { key: 'delete', label: 'Delete Order', icon: FiTrash2, className: 'border-rose-200 text-rose-700 hover:bg-rose-50' },
        {
          key: 'payment-details',
          label: 'Payment Details',
          icon: FiCreditCard,
          className: 'border-sky-200 text-sky-700 hover:bg-sky-50',
          disabled: (row) => !row.platform_order_id,
          onClick: (row) => navigate(`/payment-details/${encodeURIComponent(row.platform_order_id)}`),
        },
        // { key: 'details', label: 'Order Details', icon: FiInfo, className: 'border-slate-200 text-slate-700 hover:bg-slate-100' },
      ]}
      additionalInitialFilters={{ order_filter: 'All' }}
      compactSingleRowFilters
      orderSearchFieldKey="order_id"
      orderSearchLabel="Order ID"
      renderCustomFilters={({ filters, setFilters }) => (
        <div className="flex flex-col gap-1.5 xl:w-[240px]">
          <label className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Order Filter</label>
          <div className="relative">
            <select
              value={filters.order_filter}
              onChange={(event) => setFilters((prev) => ({ ...prev, order_filter: event.target.value }))}
              className="h-[45px] w-full appearance-none rounded-default border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary shadow-sm hover:border-slate-300"
            >
              <option value="All">All</option>
              <option value="Profit">Profit</option>
              <option value="Loss">Loss</option>
            </select>
          </div>
        </div>
      )}
    />
  );
}
