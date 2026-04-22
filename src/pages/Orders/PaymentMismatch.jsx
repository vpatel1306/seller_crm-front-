import CommonOrderPage from '../../components/orders/CommonOrderPage';

const PAYMENT_MISMATCH_COLUMNS = [
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
    className: 'min-w-[240px]',
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

function mapPaymentMismatchResponse(payload, { page, limit }) {
  const list = Array.isArray(payload.data) ? payload.data : [];
  const total = Number(payload.total_count ?? payload.total_rows ?? payload.total) || list.length;

  return {
    list,
    total,
    resolvedPage: page,
    resolvedPageSize: limit,
    resolvedTotalPages: Math.max(Math.ceil(total / limit), 1),
    summaryData: {},
  };
}

export default function PaymentMismatch() {
  return (
    <CommonOrderPage
      title="Payment Mismatch Orders"
      breadcrumbLabel="Payment Mismatch Orders"
      recordTitle="Payment Mismatch Records"
      loadingText="Loading payment mismatch orders..."
      emptyText="No payment mismatch orders found."
      endpoint="/get-payment-mismatch-orders"
      buildRequestPayload={({ filterData, fromDate, toDate, page, limit }) => ({
        filter_data: filterData,
        start_date: fromDate,
        end_date: toDate,
        page_no: page,
        limit,
      })}
      mapResponse={mapPaymentMismatchResponse}
      columns={PAYMENT_MISMATCH_COLUMNS}
      showSidebar={false}
      orderSearchFieldKey="order_id"
      orderSearchLabel="Order ID"
    />
  );
}
