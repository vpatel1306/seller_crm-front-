import { useMemo } from 'react';
import CommonOrderPage from '../../components/orders/CommonOrderPage';
import OrdersSidebarSection from '../../components/orders/OrdersSidebarSection';
import SummaryTable from '../../components/ui/SummaryTable';

import { formatCurrency, formatDate as formatDateTime } from '../../utils/formatters';

const STATUS_COLOR = {
  DELIVERED: 'text-emerald-600',
  SHIPPED: 'text-sky-600',
  CANCELLED: 'text-slate-500',
  RTO: 'text-rose-600',
};

const COLUMNS = [
  {
    key: 'platform_order_id',
    label: 'Platform Order ID',
    className: 'min-w-[220px]',
    render: (row) => <span className="font-extrabold text-primary">{row.platform_order_id || '-'}</span>,
  },
  {
    key: 'order_date',
    label: 'Order Date',
    className: 'min-w-[130px]',
    render: (row) => <span className="text-text-muted">{formatDateTime(row.order_date)}</span>,
  },
  {
    key: 'pickup_date',
    label: 'Pickup Date',
    className: 'min-w-[130px]',
    render: (row) => <span className="text-text-muted">{formatDateTime(row.pickup_date)}</span>,
  },
  {
    key: 'days',
    label: 'Days',
    right: true,
    className: 'min-w-[72px]',
    render: (row) => <span className="font-bold tabular-nums text-text">{row.days ?? '-'}</span>,
  },
  {
    key: 'order_status',
    label: 'Order Status',
    className: 'min-w-[140px]',
    render: (row) => (
      <span className={`rounded-full bg-surface-alt px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap ${STATUS_COLOR[row.order_status] || 'text-text'}`}>
        {row.order_status || '-'}
      </span>
    ),
  },
  {
    key: 'awb_number',
    label: 'AWB Number',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-violet-700">{row.awb_number || '-'}</span>,
  },
  {
    key: 'courier_partner',
    label: 'Courier Partner',
    className: 'min-w-[150px]',
    render: (row) => <span className="text-text-muted">{row.courier_partner || '-'}</span>,
  },
  {
    key: 'customer_name',
    label: 'Customer Name',
    className: 'min-w-[160px]',
    render: (row) => <span className="text-text">{row.customer_name || '-'}</span>,
  },
  {
    key: 'sku',
    label: 'SKU',
    className: 'min-w-[200px]',
    render: (row) => <span className="font-semibold text-amber-700">{row.sku || '-'}</span>,
  },
  {
    key: 'qty',
    label: 'Qty',
    right: true,
    className: 'min-w-[72px]',
    render: (row) => <span className="tabular-nums text-text-muted">{row.qty ?? 0}</span>,
  },
  {
    key: 'cost_amount',
    label: 'Cost Amount',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="font-bold text-text">{formatCurrency(row.cost_amount)}</span>,
  },
];

const summaryTableProps = {
  containerClassName: 'overflow-hidden rounded-default border border-border bg-white shadow-sm',
  titleClassName: 'bg-surface-alt px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text',
  headRowClassName: 'bg-white text-text-muted',
  headerCellClassName: 'border-b border-border px-1.5 py-1 text-left text-[0.55rem] font-extrabold uppercase tracking-[0.12em] whitespace-nowrap',
  cellClassName: 'px-1.5 py-1 whitespace-nowrap text-[0.65rem]',
  bodyWrapperClassName: 'max-h-60',
  hoverClass: 'hover:bg-surface-alt',
  rowClassName: (_, i) => (i % 2 === 0 ? 'border-b border-border bg-white' : 'border-b border-border bg-surface-alt/45'),
};

function buildRequestPayload({ filterData, page, limit }) {
  return {
    filter_data: filterData,
    page_no: page,
    limit,
  };
}

function mapResponse(payload, { page, limit }) {
  const list = Array.isArray(payload.data) ? payload.data : [];
  const total = Number(payload.total) || list.length;
  const resolvedTotalPages = Math.max(Math.ceil(total / limit), 1);

  const courierWise = (payload.summaries?.courier_wise || []).map((item) => ({
    courier: item.courier || 'Unknown',
    count: item.count ?? 0,
    cost_amt: formatCurrency(item.cost_amt),
  }));

  const pickupDateWise = (payload.summaries?.pickup_date_wise || []).map((item) => ({
    date: item.date || '-',
    count: item.count ?? 0,
    cost_amt: formatCurrency(item.cost_amt),
  }));

  const mergedStatus = {};
  (payload.summaries?.status_wise || []).forEach((item) => {
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

  const statusWise = Object.values(mergedStatus).map((item) => ({
    status: item.status,
    count: item.count,
    cost_amt: formatCurrency(item.costVal),
  }));


  return {
    list,
    total,
    resolvedPage: page,
    resolvedPageSize: limit,
    resolvedTotalPages,
    summaryData: { courierWise, pickupDateWise, statusWise },
  };
}

function UnsettledSidebar({ groupedData }) {
  const { courierWise = [], pickupDateWise = [], statusWise = [] } = groupedData;

  return (
    <OrdersSidebarSection>
      <SummaryTable
        {...summaryTableProps}
        title="Courier Wise"
        rows={courierWise}
        cols={[
          { key: 'courier', label: 'Courier', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'cost_amt', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />
      <SummaryTable
        {...summaryTableProps}
        title="Pickup Date Wise"
        rows={pickupDateWise}
        cols={[
          { key: 'date', label: 'Pickup Date', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'cost_amt', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />
      <SummaryTable
        {...summaryTableProps}
        title="Status Wise"
        rows={statusWise}
        cols={[
          { key: 'status', label: 'Status', color: (row) => (row.status === 'DELIVERED' ? 'text-emerald-600 font-bold' : row.status === 'CANCELLED' ? 'text-slate-500' : 'text-text') },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'cost_amt', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />
    </OrdersSidebarSection>
  );
}

export default function UnsettledPickup() {
  const renderSidebar = useMemo(
    () =>
      ({ groupedData }) =>
        <UnsettledSidebar groupedData={groupedData} />,
    []
  );

  return (
    <CommonOrderPage
      title="Unsettled Pickup"
      breadcrumbLabel="Unsettled Pickup"
      recordTitle="Unsettled Pickup Orders"
      loadingText="Loading unsettled pickup orders..."
      emptyText="No unsettled pickup orders found."
      endpoint="/get-unsettled-pickup-orders"
      requestMethod="post"
      buildRequestPayload={buildRequestPayload}
      mapResponse={mapResponse}
      columns={COLUMNS}
      renderSidebar={renderSidebar}
      showSidebar
      orderSearchFieldKey="order_id"
      orderSearchLabel="Order ID"
    />
  );
}
