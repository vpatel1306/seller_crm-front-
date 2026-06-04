import CommonOrderPage from '../../components/orders/CommonOrderPage';
import { formatCurrency, formatDateTime as formatDate } from '../../utils/formatters';

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
    key: 'customer_name',
    label: 'Customer Name',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{row.customer_name || '-'}</span>,
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
    key: 'pickup_date',
    label: 'Pickup Date',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.pickup_date)}</span>,
  },
  {
    key: 'dispatch_date',
    label: 'Dispatch Date',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.dispatch_date)}</span>,
  },
  {
    key: 'awb_number',
    label: 'AWB Number',
    className: 'min-w-[150px]',
    render: (row) => <span className="text-text-muted">{row.awb_number || '-'}</span>,
  },
  {
    key: 'courier_partner',
    label: 'Courier Partner',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{row.courier_partner || '-'}</span>,
  },
  {
    key: 'days',
    label: 'Days',
    right: true,
    className: 'min-w-[80px]',
    render: (row) => <span className="text-text-muted">{row.days ?? '-'}</span>,
  },
 
];


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
      date_wise: Array.isArray(payload.summaries?.date_wise) ? payload.summaries.date_wise : [],
      courier_wise: Array.isArray(payload.summaries?.courier_wise) ? payload.summaries.courier_wise : [],
      status_wise: Array.isArray(payload.summaries?.status_wise) ? payload.summaries.status_wise : [],
    },
  };
}

function MetricCard({ label, value, tone = 'text-text' }) {
  return (
    <div className="rounded-default border border-border bg-white p-3.5 shadow-sm min-w-0">
      <div className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-text-muted truncate" title={label}>{label}</div>
      <div className={`mt-1.5 text-lg font-black tracking-tighter leading-tight break-words ${tone}`} title={String(value)}>
        {value}
      </div>
    </div>
  );
}

function SummaryOverview({ dateWiseRows, courierRows, statusRows }) {
  const totalDateCount = dateWiseRows.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const totalCourierCount = courierRows.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const totalStatusCount = statusRows.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MetricCard label="Date Groups" value={dateWiseRows.length} tone="text-primary" />
      <MetricCard label="Courier Groups" value={courierRows.length} tone="text-violet-700" />
      <MetricCard label="Status Groups" value={statusRows.length} tone="text-amber-600" />
      <MetricCard label="Date Wise Orders" value={totalDateCount} tone="text-emerald-600" />
      <MetricCard label="Courier Wise Orders" value={totalCourierCount} tone="text-sky-600" />
      <MetricCard label="Status Wise Orders" value={totalStatusCount} tone="text-rose-600" />
    </div>
  );
}

function renderReceivedPaymentSidebar({ groupedData, summaryTableProps }) {
  const dateWiseRows = (groupedData.date_wise || []).map((item, index) => ({
    id: `date-${index}`,
    date: item.date || '-',
    count: item.count ?? 0,
    cost_amt: formatCurrency(item.cost_amt),
  }));

  const courierRows = (groupedData.courier_wise || []).map((item, index) => ({
    id: `courier-${index}`,
    courier: item.courier || 'Unknown',
    count: item.count ?? 0,
    cost_amt: formatCurrency(item.cost_amt),
  }));

  const mergedStatus = {};
  (groupedData.status_wise || []).forEach((item) => {
    const rawStatus = item.status || 'Unknown';
    const key = rawStatus.toUpperCase().trim();
    if (!mergedStatus[key]) {
      mergedStatus[key] = {
        status: rawStatus,
        count: 0,
        costVal: 0,
      };
    }
    mergedStatus[key].count += Number(item.count ?? 0);
    mergedStatus[key].costVal += Number(item.cost_amt ?? 0);
  });

  const statusRows = Object.values(mergedStatus).map((item, index) => ({
    id: `status-${index}`,
    status: item.status,
    count: item.count,
    cost_amt: formatCurrency(item.costVal),
  }));


  return (
    <OrdersSidebarSection>
      {/* <SummaryOverview dateWiseRows={dateWiseRows} courierRows={courierRows} statusRows={statusRows} /> */}

      <SummaryTable
        {...summaryTableProps}
        title="Date Wise Summary"
        rows={dateWiseRows}
        cols={[
          { key: 'date', label: 'Date', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'cost_amt', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />

      <SummaryTable
        {...summaryTableProps}
        title="Courier Wise Summary"
        rows={courierRows}
        cols={[
          { key: 'courier', label: 'Courier', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'cost_amt', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />

      <SummaryTable
        {...summaryTableProps}
        title="Status Wise Summary"
        rows={statusRows}
        cols={[
          { key: 'status', label: 'Status', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'cost_amt', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />
    </OrdersSidebarSection>
  );
}

export default function PendingPaymentOrders() {
  const navigate = useNavigate();

  return (
    <CommonOrderPage
      title="Pending Payment Orders"
      breadcrumbLabel="Pending Payment Orders"
      recordTitle="Pending Payment Records"
      loadingText="Loading Pending payment orders..."
      emptyText="No Pending payment orders found."
      endpoint="/get-pending-payment-orders"
      buildRequestPayload={({ filterData, filters, page, limit }) => ({
        filter_data: filterData,
        order_filter: filters.order_filter || 'All',
        page_no: page,
        limit,
      })}
      mapResponse={mapReceivedPaymentResponse}
      columns={RECEIVED_PAYMENT_COLUMNS}
      renderSidebar={renderReceivedPaymentSidebar}
      rowActions={[

        {
          key: 'payment-details',
          label: 'Payment Details',
          icon: FiCreditCard,
          className: 'border-sky-200 text-sky-700 hover:bg-sky-50',
          disabled: (row) => !row.platform_order_id,
          onClick: (row) => navigate(`/payment-details/${encodeURIComponent(row.platform_order_id)}`),
        },
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
              className="h-9 w-full appearance-none rounded-default border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary shadow-sm hover:border-slate-300"
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
