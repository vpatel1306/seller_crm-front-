import CommonOrderPage from '../../components/orders/CommonOrderPage';
import OrdersSidebarSection from '../../components/orders/OrdersSidebarSection';
import SummaryTable from '../../components/ui/SummaryTable';

const RECEIVED_RETURNS_COLUMNS = [
  {
    key: 'platform_order_id',
    label: 'Platform Order ID',
    className: 'min-w-[220px]',
    render: (row) => <span className="font-extrabold text-primary">{row.platform_order_id || row.order_number || '-'}</span>,
  },
  {
    key: 'id',
    label: 'Order ID',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{row.id || row.order_id || '-'}</span>,
  },
  {
    key: 'order_status',
    label: 'Order Status',
    className: 'min-w-[160px]',
    render: (row) => (
      <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">
        {row.order_status || row.status || '-'}
      </span>
    ),
  },
  {
    key: 'return_date',
    label: 'Return Date',
    className: 'min-w-[180px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.return_date || row.receive_scan_time)}</span>,
  },
  {
    key: 'days',
    label: 'Days',
    right: true,
    className: 'min-w-[80px]',
    render: (row) => <span className="font-semibold text-text">{row.days ?? '-'}</span>,
  },
  {
    key: 'courier',
    label: 'Courier',
    className: 'min-w-[150px]',
    render: (row) => <span className="text-text-muted">{row.courier || row.courier_partner || '-'}</span>,
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
    label: 'Selling',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="font-bold text-text">{formatCurrency(row.total_amount || row.selling)}</span>,
  },
  {
    key: 'settlement_amount',
    label: 'Payout',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="font-bold text-emerald-600">{formatCurrency(row.settlement_amount || row.payout)}</span>,
  },
  {
    key: 'claim_amount',
    label: 'Claim',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => <span className="text-text-muted">{formatCurrency(row.claim_amount || row.claim)}</span>,
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
  return item?.count ?? item?.total_orders ?? item?.total_rows ?? item?.rows ?? item?.qty ?? item?.value ?? 0;
}

function getAmountValue(item) {
  return item?.cost_amt ?? item?.cost_amount ?? item?.total_cost_amount ?? item?.amount ?? item?.total_amount ?? 0;
}

function normalizeSummaryRows(summaryData, config) {
  if (Array.isArray(summaryData)) {
    return summaryData.map((item, index) => {
      if (item && typeof item === 'object') {
        const label = config.labelKeys
          .map((key) => item[key])
          .find((value) => value !== undefined && value !== null && value !== '');

        return {
          id: `${config.fallbackLabel}-${index}`,
          label: label || `${config.fallbackLabel} ${index + 1}`,
          count: getCountValue(item),
          amount: Number(getAmountValue(item) || 0).toFixed(2),
        };
      }

      return {
        id: `${config.fallbackLabel}-${index}`,
        label: item || `${config.fallbackLabel} ${index + 1}`,
        count: 0,
        amount: '0.00',
      };
    });
  }

  return Object.entries(summaryData || {}).map(([key, value], index) => ({
    id: `${config.fallbackLabel}-${index}`,
    label: key,
    count: typeof value === 'object' ? getCountValue(value) : Number(value) || 0,
    amount: typeof value === 'object' ? Number(getAmountValue(value) || 0).toFixed(2) : '0.00',
  }));
}

function buildReceivedReturnsPayload({ fromDate, toDate, page, limit }) {
  return {
    start_date: fromDate || '',
    end_date: toDate || '',
    page_no: page,
    limit,
  };
}

function mapReceivedReturnsResponse(payload, { page, limit }) {
  const list = Array.isArray(payload.data) ? payload.data : [];
  const total = Number(payload.total_count) || list.length;
  const resolvedPage = Number(payload.current_page) || page;
  const resolvedTotalPages = Number(payload.total_pages) || Math.max(Math.ceil(total / limit), 1);
  const resolvedPageSize = Number(payload.page_size) || limit;

  return {
    list,
    total,
    resolvedPage,
    resolvedPageSize,
    resolvedTotalPages,
    summaryData: {
      return_date_rows: normalizeSummaryRows(payload.summary?.return_date, {
        labelKeys: ['return_date', 'date', 'label'],
        fallbackLabel: 'Date',
      }),
      order_status_rows: normalizeSummaryRows(payload.summary?.order_status, {
        labelKeys: ['order_status', 'status', 'label'],
        fallbackLabel: 'Status',
      }),
      courier_rows: normalizeSummaryRows(payload.summary?.courier, {
        labelKeys: ['courier', 'courier_partner', 'label'],
        fallbackLabel: 'Courier',
      }),
      total_rows: total,
    },
  };
}

function OverviewCard({ totalRows, returnDates, statuses, couriers }) {
  const metrics = [
    { label: 'Total Rows', value: totalRows, tone: 'text-primary' },
    { label: 'Return Dates', value: returnDates, tone: 'text-emerald-600' },
    { label: 'Statuses', value: statuses, tone: 'text-amber-600' },
    { label: 'Couriers', value: couriers, tone: 'text-violet-700' },
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

function renderReceivedReturnsSidebar({ groupedData, summaryTableProps }) {
  const returnDateRows = groupedData.return_date_rows || [];
  const statusRows = groupedData.order_status_rows || [];
  const courierRows = groupedData.courier_rows || [];

  return (
    <OrdersSidebarSection>
      {/* <OverviewCard
        totalRows={groupedData.total_rows ?? 0}
        returnDates={returnDateRows.length}
        statuses={statusRows.length}
        couriers={courierRows.length}
      /> */}

      <SummaryTable
        {...summaryTableProps}
        title="Return Date Summary"
        rows={returnDateRows}
        cols={[
          { key: 'label', label: 'Return Date', color: () => 'text-text' },
          { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
          { key: 'amount', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
        ]}
      />

      <SummaryTable
        {...summaryTableProps}
        title="Order Status Summary"
        rows={statusRows}
        cols={[
          { key: 'label', label: 'Status', color: () => 'text-text' },
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
    </OrdersSidebarSection>
  );
}

export default function ReceivedReturns() {
  return (
    <CommonOrderPage
      title="Received Returns"
      breadcrumbLabel="Received Returns"
      recordTitle="Received Return Records"
      loadingText="Loading received returns..."
      emptyText="No received return records found."
      endpoint="/get-received-returns"
      buildRequestPayload={buildReceivedReturnsPayload}
      mapResponse={mapReceivedReturnsResponse}
      columns={RECEIVED_RETURNS_COLUMNS}
      renderSidebar={renderReceivedReturnsSidebar}
    />
  );
}
