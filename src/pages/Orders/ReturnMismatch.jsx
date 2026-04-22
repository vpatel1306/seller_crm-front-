import CommonOrderPage from '../../components/orders/CommonOrderPage';

const formatCurrency = (value) => `Rs. ${(Number(value) || 0).toFixed(2)}`;
const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN');
};

const STATUS_COLOR = {
  'Customer Return': 'text-amber-600',
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
    key: 'order_status',
    label: 'Order Status',
    className: 'min-w-[160px]',
    render: (row) => (
      <span className={`rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] ${STATUS_COLOR[row.order_status] || 'text-text'}`}>
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
    className: 'min-w-[140px]',
    render: (row) => <span className="text-text-muted">{row.courier_partner || '-'}</span>,
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
    key: 'settlement_amount',
    label: 'Settlement',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => (
      <span className={`font-bold ${Number(row.settlement_amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
        {formatCurrency(row.settlement_amount)}
      </span>
    ),
  },
];

function buildRequestPayload({ filterData, page, limit }) {
  return {
    filter_data: filterData,
    start_date: filterData.start_date || '',
    end_date: filterData.end_date || '',
    page_no: page,
    limit,
  };
}

function mapResponse(payload, { page, limit }) {
  const list = Array.isArray(payload.data) ? payload.data : [];
  const total = Number(payload.total) || list.length;
  const resolvedTotalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    list,
    total,
    resolvedPage: page,
    resolvedPageSize: limit,
    resolvedTotalPages,
    summaryData: {},
  };
}

export default function ReturnMismatch() {
  return (
    <CommonOrderPage
      title="Return Mismatch"
      breadcrumbLabel="Return Mismatch"
      recordTitle="Return Mismatch Orders"
      loadingText="Loading return mismatch orders..."
      emptyText="No return mismatch records found."
      endpoint="/get-return-mismatch-returns"
      requestMethod="post"
      buildRequestPayload={buildRequestPayload}
      mapResponse={mapResponse}
      columns={COLUMNS}
      showSidebar={false}
      orderSearchFieldKey="order_id"
      orderSearchLabel="Order ID"
    />
  );
}
