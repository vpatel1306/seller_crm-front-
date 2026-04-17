import CommonOrderPage from '../../components/orders/CommonOrderPage';
import OrdersSidebarSection from '../../components/orders/OrdersSidebarSection';
import SummaryTable from '../../components/ui/SummaryTable';

const RETURNS_NOT_RECEIVED_COLUMNS = [
  {
    key: 'platform_order_id',
    label: 'Platform Order ID',
    className: 'min-w-[220px]',
    render: (row) => <span className="font-extrabold text-primary">{row.platform_order_id || '-'}</span>,
  },
  {
    key: 'id',
    label: 'Order ID',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{row.id || '-'}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    className: 'min-w-[160px]',
    render: (row) => (
      <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-text">
        {row.status || '-'}
      </span>
    ),
  },
  {
    key: 'order_status',
    label: 'Return Type',
    className: 'min-w-[160px]',
    render: (row) => (
      <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">
        {row.order_status || '-'}
      </span>
    ),
  },
  {
    key: 'return_date',
    label: 'Return Date',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.return_date)}</span>,
  },
  {
    key: 'dispatch_date',
    label: 'Dispatch Date',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.dispatch_date)}</span>,
  },
  {
    key: 'courier_partner',
    label: 'Courier',
    className: 'min-w-[150px]',
    render: (row) => <span className="text-text-muted">{row.courier_partner || '-'}</span>,
  },
  {
    key: 'awb_number',
    label: 'AWB Number',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-violet-700">{row.awb_number || '-'}</span>,
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
    key: 'total_amount',
    label: 'Total Amount',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="font-bold text-text">{formatCurrency(row.total_amount)}</span>,
  },
  {
    key: 'settlement_amount',
    label: 'Settlement',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="font-bold text-emerald-600">{formatCurrency(row.settlement_amount)}</span>,
  },
  {
    key: 'claim_amount',
    label: 'Claim Amount',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="text-text-muted">{formatCurrency(row.claim_amount)}</span>,
  },
  {
    key: 'cost_amount',
    label: 'Cost Amount',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="text-text-muted">{formatCurrency(row.cost_amount)}</span>,
  },
  {
    key: 'profit_loss',
    label: 'P/L',
    right: true,
    className: 'min-w-[96px]',
    render: (row) => (
      <span className={`font-extrabold ${(Number(row.profit_loss) || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {formatCurrency(row.profit_loss)}
      </span>
    ),
  },
  {
    key: 'shipping_charge',
    label: 'Shipping Charge',
    right: true,
    className: 'min-w-[130px]',
    render: (row) => <span className="text-text-muted">{formatCurrency(row.shipping_charge)}</span>,
  },
  {
    key: 'return_shipping_charge',
    label: 'Return Shipping',
    right: true,
    className: 'min-w-[140px]',
    render: (row) => <span className="text-text-muted">{formatCurrency(row.return_shipping_charge)}</span>,
  },
  {
    key: 'payment_status',
    label: 'Payment Status',
    className: 'min-w-[160px]',
    render: (row) => <span className="font-semibold text-sky-700">{String(row.payment_status || '-').trim()}</span>,
  },
  {
    key: 'claim_status',
    label: 'Claim Status',
    className: 'min-w-[140px]',
    render: (row) => <span className="text-text-muted">{row.claim_status || '-'}</span>,
  },
  {
    key: 'order_date',
    label: 'Order Date',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.order_date)}</span>,
  },
  {
    key: 'updated_at',
    label: 'Updated At',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.updated_at)}</span>,
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

function getCountValue(item) {
  return (
    item?.count ??
    item?.total_orders ??
    item?.total_rows ??
    item?.rows ??
    item?.qty ??
    item?.value ??
    0
  );
}

function getAmountValue(item) {
  return (
    item?.cost_amt ??
    item?.cost_amount ??
    item?.total_cost_amount ??
    item?.amount ??
    item?.total_amount ??
    0
  );
}

function normalizeSummaryRows(summaryData, config) {
  return Object.entries(summaryData || {}).map(([key, value], index) => ({
    id: `${config.fallbackLabel}-${index}`,
    label: key,
    count: typeof value === 'object' ? getCountValue(value) : Number(value) || 0,
    amount: typeof value === 'object' ? Number(getAmountValue(value) || 0).toFixed(2) : '0.00',
  }));
}

function buildPendingReturnsPayload({ page, limit, fromDate, toDate }) {
  return {
    start_date: fromDate,
    end_date: toDate,
    page_no: page,
    limit,
  };
}

function mapPendingReturnsResponse(payload, { page, limit }) {
  const list = Array.isArray(payload.data) ? payload.data : [];
  const total = Number(payload.total_rows) || list.length;

  return {
    list,
    total,
    resolvedPage: page,
    resolvedPageSize: limit,
    resolvedTotalPages: Math.max(Math.ceil(total / limit), 1),
    summaryData: {
      date_wise_rows: normalizeSummaryRows(payload.summary?.date_wise, {
        fallbackLabel: 'Date',
      }),
      return_type_rows: normalizeSummaryRows(payload.summary?.return_type, {
        fallbackLabel: 'Type',
      }),
      courier_rows: normalizeSummaryRows(payload.summary?.courier, {
        fallbackLabel: 'Courier',
      }),
      customer_recovery: payload.summary?.customer_recovery || {},
      rto_recovery: payload.summary?.rto_recovery || {},
      total_rows: total,
    },
  };
}

function OverviewCard({ totalRows, returnTypes, couriers, dates }) {
  const metrics = [
    { label: 'Total Rows', value: totalRows, tone: 'text-primary' },
    { label: 'Return Types', value: returnTypes, tone: 'text-amber-600' },
    { label: 'Couriers', value: couriers, tone: 'text-violet-700' },
    { label: 'Date Groups', value: dates, tone: 'text-emerald-600' },
  ];

  return (
    <div className="overflow-hidden rounded-[22px] border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-surface-alt px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text">
        Received Return Overview
      </div>
      <div className="grid grid-cols-2 gap-px bg-border">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white px-4 py-4 text-center">
            <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text-muted">{metric.label}</div>
            <div className={`mt-2 text-2xl font-extrabold ${metric.tone}`}>{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecoveryCard({ title, data }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-surface-alt px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text">
        {title}
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="px-4 py-4 text-center">
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text-muted">Pending</div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">{data?.pending_count ?? 0}</div>
          <div className="mt-1 text-sm text-text-muted">{formatCurrency(data?.pending_amount)}</div>
        </div>
        <div className="px-4 py-4 text-center">
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text-muted">Paid</div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{data?.paid_count ?? 0}</div>
          <div className="mt-1 text-sm text-text-muted">{formatCurrency(data?.paid_amount)}</div>
        </div>
      </div>
    </div>
  );
}

function renderPendingReturnsSidebar({ groupedData, summaryTableProps }) {
  const dateWiseRows = groupedData.date_wise_rows || [];
  const returnTypeRows = groupedData.return_type_rows || [];
  const courierRows = groupedData.courier_rows || [];

  return (
    <OrdersSidebarSection>
      {/* <OverviewCard
        totalRows={groupedData.total_rows ?? 0}
        returnTypes={returnTypeRows.length}
        couriers={courierRows.length}
        dates={dateWiseRows.length}
      /> */}

      <SummaryTable
        {...summaryTableProps}
        title="Return Type Summary"
        rows={returnTypeRows}
        cols={[
          { key: 'label', label: 'Return Type', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'amount', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />

      <SummaryTable
        {...summaryTableProps}
        title="Courier Summary"
        rows={courierRows}
        cols={[
          { key: 'label', label: 'Courier', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'amount', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />

      <SummaryTable
        {...summaryTableProps}
        title="Date Wise Summary"
        rows={dateWiseRows}
        cols={[
          { key: 'label', label: 'Date', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'amount', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />

      <RecoveryCard title="Customer Recovery" data={groupedData.customer_recovery} />
      <RecoveryCard title="RTO Recovery" data={groupedData.rto_recovery} />
    </OrdersSidebarSection>
  );
}

export default function ReturnsNotReceived() {
  return (
    <CommonOrderPage
      title="Returns Not Received"
      breadcrumbLabel="Returns Not Received"
      recordTitle="Pending Return Records"
      loadingText="Loading pending returns..."
      emptyText="No pending return records found."
      endpoint="/get-pending-returns"
      buildRequestPayload={buildPendingReturnsPayload}
      mapResponse={mapPendingReturnsResponse}
      columns={RETURNS_NOT_RECEIVED_COLUMNS}
      renderSidebar={renderPendingReturnsSidebar}
    />
  );
}
