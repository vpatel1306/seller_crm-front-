import { useMemo } from 'react';
import CommonOrderPage from '../../../components/orders/CommonOrderPage';
import OrdersSidebarSection from '../../../components/orders/OrdersSidebarSection';
import SummaryTable from '../../../components/ui/SummaryTable';

const formatCurrency = (value) => `Rs. ${(Number(value) || 0).toFixed(2)}`;
const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN');
};

const STATUS_COLOR = {
  Processing: 'text-amber-600',
  DELIVERED: 'text-emerald-600',
  SHIPPED: 'text-sky-600',
  CANCELLED: 'text-slate-500',
  Approved: 'text-emerald-600',
  Pending: 'text-amber-600',
  Rejected: 'text-rose-600',
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
    className: 'min-w-[140px]',
    render: (row) => <span className="text-text-muted">{formatDateTime(row.order_date)}</span>,
  },
  {
    key: 'order_status',
    label: 'Order Status',
    className: 'min-w-[150px]',
    render: (row) => (
      <span className={`rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] ${STATUS_COLOR[row.order_status] || 'text-text'}`}>
        {row.order_status || '-'}
      </span>
    ),
  },
  {
    key: 'settlement_amount',
    label: 'Settlement Amount',
    right: true,
    className: 'min-w-[150px]',
    render: (row) => <span className="font-bold text-emerald-600">{formatCurrency(row.settlement_amount)}</span>,
  },
  {
    key: 'claim_amount',
    label: 'Claim Amount',
    right: true,
    className: 'min-w-[130px]',
    render: (row) => <span className="font-bold text-primary">{formatCurrency(row.claim_amount)}</span>,
  },
  {
    key: 'claim_status',
    label: 'Claim Status',
    className: 'min-w-[130px]',
    render: (row) => (
      <span className={`rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] ${STATUS_COLOR[row.claim_status] || 'text-text-muted'}`}>
        {row.claim_status || '-'}
      </span>
    ),
  },
];

const summaryTableProps = {
  containerClassName: 'overflow-hidden rounded-[22px] border border-border bg-white shadow-sm',
  titleClassName: 'bg-surface-alt px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text',
  headRowClassName: 'bg-white text-text-muted',
  headerCellClassName: 'border-b border-border px-4 py-3 text-left text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap',
  cellClassName: 'px-4 py-3 whitespace-nowrap text-[0.72rem]',
  bodyWrapperClassName: 'max-h-60',
  hoverClass: 'hover:bg-surface-alt',
  rowClassName: (_, i) => (i % 2 === 0 ? 'border-b border-border bg-white' : 'border-b border-border bg-surface-alt/45'),
};

function buildRequestPayload({ filterData, page, limit }) {
  return {
    start_date: filterData.start_date || '',
    end_date: filterData.end_date || '',
    // order_filter: 'All',
    page_no: page,
    limit,
  };
}

function mapResponse(payload, { page, limit }) {
  const list = Array.isArray(payload.data) ? payload.data : [];
  const total = Number(payload.total) || list.length;
  const resolvedTotalPages = Math.max(Math.ceil(total / limit), 1);

  const monthWise = (payload.summaries?.month_wise || []).map((item) => ({
    month_year: item.month_year || '-',
    count: item.count ?? 0,
    claim_received: (Number(item.claim_received) || 0).toFixed(2),
    settled_amt: (Number(item.settled_amt) || 0).toFixed(2),
  }));

  return {
    list,
    total,
    resolvedPage: page,
    resolvedPageSize: limit,
    resolvedTotalPages,
    summaryData: { monthWise },
  };
}

function ApproveSidebar({ groupedData }) {
  const { monthWise = [] } = groupedData;

  return (
    <OrdersSidebarSection>
      <SummaryTable
        {...summaryTableProps}
        title="Month Wise Summary"
        rows={monthWise}
        cols={[
          { key: 'month_year', label: 'Month', color: () => 'text-text font-semibold' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'claim_received', label: 'Claim Recv.', right: true, color: () => 'text-emerald-600 text-right font-bold' },
          { key: 'settled_amt', label: 'Settled', right: true, color: () => 'text-sky-600 text-right font-bold' },
        ]}
      />
    </OrdersSidebarSection>
  );
}

export default function ApproveClaim() {
  const renderSidebar = useMemo(
    () =>
      ({ groupedData }) =>
        <ApproveSidebar groupedData={groupedData} />,
    []
  );

  return (
    <CommonOrderPage
      title="Approve Claim"
      breadcrumbLabel="Approve Claim"
      recordTitle="Claim Orders"
      loadingText="Loading claim orders..."
      emptyText="No claim orders found."
      endpoint="/get-approved-claim-orders"
      requestMethod="post"
      buildRequestPayload={buildRequestPayload}
      mapResponse={mapResponse}
      columns={COLUMNS}
      renderSidebar={renderSidebar}
      showSidebar
    />
  );
}
