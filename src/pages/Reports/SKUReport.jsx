import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiDownload, FiRefreshCw, FiSearch, FiTrendingDown, FiTrendingUp, FiX } from 'react-icons/fi';
import AppShell from '../../components/layout/AppShell';
import OrdersPageHeader from '../../components/orders/OrdersPageHeader';
import OrdersFilterSection from '../../components/orders/OrdersFilterSection';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const fmt = (v) => (Number(v) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (v) => Number(v ?? 0).toLocaleString('en-IN');
const getNumericCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const COLUMNS = [
  {
    key: 'sku_id', label: 'SKU ID', className: 'min-w-[200px]',
    render: (row) => (
      <div>
        <div className="font-extrabold text-text">{row.sku_id || '-'}</div>
        <div className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">{row.size || 'Free Size'}</div>
      </div>
    ),
  },
  {
    key: 'profit_loss', label: '± P/L', right: true, className: 'min-w-[110px]',
    render: (row) => (
      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${Number(row.profit_loss) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
        Rs. {fmt(row.profit_loss)}
      </span>
    ),
  },
  { key: 'orders', label: 'Orders', right: true, className: 'min-w-[72px]', render: (row) => <span className="font-bold tabular-nums">{fmtN(row.orders)}</span> },
  { key: 'hold', label: 'Hold', right: true, className: 'min-w-[60px]', render: (row) => <span className="text-text-muted tabular-nums">{fmtN(row.hold)}</span> },
  { key: 'pending', label: 'Pending', right: true, className: 'min-w-[72px]', render: (row) => <span className="text-text-muted tabular-nums">{fmtN(row.pending)}</span> },
  { key: 'cancelled', label: 'Cancel', right: true, className: 'min-w-[72px]', render: (row) => <span className={`tabular-nums font-bold ${Number(row.cancelled) > 50 ? 'text-rose-600' : 'text-text-muted'}`}>{fmtN(row.cancelled)}</span> },
  { key: 'rts', label: 'RTS', right: true, className: 'min-w-[60px]', render: (row) => <span className="text-text-muted tabular-nums">{fmtN(row.rts)}</span> },
  { key: 'picked', label: 'Picked', right: true, className: 'min-w-[72px]', render: (row) => <span className="font-bold tabular-nums text-text">{fmtN(row.picked)}</span> },
  {
    key: 'shipped', label: 'Shipped', right: true, className: 'min-w-[80px]',
    render: (row) => (
      <div className="text-right">
        <div className="font-bold tabular-nums text-sky-600">{fmtN(row.shipped)}</div>
        <div className="text-[0.62rem] text-text-muted">{row.shipped_pct ?? 0}%</div>
      </div>
    ),
  },
  {
    key: 'rto', label: 'RTO', right: true, className: 'min-w-[72px]',
    render: (row) => (
      <div className="text-right">
        <div className="font-bold tabular-nums text-rose-600">{fmtN(row.rto)}</div>
        <div className="text-[0.62rem] text-text-muted">{row.rto_pct ?? 0}%</div>
      </div>
    ),
  },
  {
    key: 'delivered', label: 'Delivered', right: true, className: 'min-w-[88px]',
    render: (row) => (
      <div className="text-right">
        <div className="font-bold tabular-nums text-emerald-600">{fmtN(row.delivered)}</div>
        <div className="text-[0.62rem] text-text-muted">{row.delivered_pct ?? 0}%</div>
      </div>
    ),
  },
  {
    key: 'return', label: 'Return', right: true, className: 'min-w-[80px]',
    render: (row) => (
      <div className="text-right">
        <div className="font-bold tabular-nums text-amber-600">{fmtN(row.return)}</div>
        <div className="text-[0.62rem] text-text-muted">{row.return_pct ?? 0}%</div>
      </div>
    ),
  },
  {
    key: 'delivery', label: 'Delivery', right: true, className: 'min-w-[80px]',
    render: (row) => (
      <div className="text-right">
        <div className="font-bold tabular-nums text-emerald-700">{fmtN(row.delivery)}</div>
        <div className="text-[0.62rem] text-text-muted">{row.delivery_pct ?? 0}%</div>
      </div>
    ),
  },
  { key: 'na', label: 'N/A', right: true, className: 'min-w-[60px]', render: (row) => <span className="text-text-muted tabular-nums">{fmtN(row.na)}</span> },
  {
    key: 'avg_pl', label: 'Avg P/L', right: true, className: 'min-w-[90px]',
    render: (row) => (
      <span className={`font-extrabold tabular-nums ${Number(row.avg_pl) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {fmt(row.avg_pl)}
      </span>
    ),
  },
];

const SUMMARY_STATS = [
  { key: 'picked', label: 'Picked', color: 'text-text' },
  { key: 'shipped', label: 'Shipped', pctKey: 'shipped_pct', color: 'text-sky-600' },
  { key: 'rto', label: 'RTO', pctKey: 'rto_pct', color: 'text-rose-600' },
  { key: 'delivered', label: 'Delivered', pctKey: 'delivered_pct', color: 'text-emerald-600' },
  { key: 'return', label: 'Return', pctKey: 'return_pct', color: 'text-amber-600' },
  { key: 'delivery', label: 'Delivery', pctKey: 'delivery_pct', color: 'text-emerald-700' },
  { key: 'grand_total', label: 'Grand Total', color: 'text-primary' },
  { key: 'grand_pl', label: 'Grand P/L', isCurrency: true, color: 'text-primary' },
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function SKUReport() {
  const navigate = useNavigate();
  const { activeAccount, selectedDateRange } = useAuth();

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [plFilter, setPlFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedId, setSelectedId] = useState(null);
  const [dateRange, setDateRange] = useState(() => ({
    from: selectedDateRange?.from || '',
    to: selectedDateRange?.to || '',
  }));
  const [dateDraft, setDateDraft] = useState(() => ({
    from: selectedDateRange?.from || '',
    to: selectedDateRange?.to || '',
  }));

  const fromDate = dateRange.from;
  const toDate = dateRange.to;

  const fetchData = useCallback(async (appliedDateRange = dateRange) => {
    if (!activeAccount?.id) return;
    setLoading(true);
    try {
      const requestFromDate = appliedDateRange?.from || '';
      const requestToDate = appliedDateRange?.to || '';
      const res = await api.post('/get-sku-wise-report', {
        start_date: requestFromDate,
        end_date: requestToDate,
        order_filter: plFilter,
        page_no: currentPage,
        limit: perPage,
      }, { headers: { account: activeAccount.id } });

      const payload = res.data || {};
      const list = Array.isArray(payload.data) ? payload.data : [];
      const resolvedTotal = getNumericCount(payload.total_count) ?? getNumericCount(payload.count) ?? list.length;
      const resolvedPage = getNumericCount(payload.current_page) ?? currentPage;
      const resolvedPageSize = getNumericCount(payload.page_size) ?? perPage;
      const resolvedTotalPages = getNumericCount(payload.total_pages) ?? Math.max(Math.ceil(resolvedTotal / resolvedPageSize), 1);

      setData(list);
      setSummary(payload.summary || {});
      setTotal(resolvedTotal);
      setTotalPages(Math.max(resolvedTotalPages, 1));
      setCurrentPage(resolvedPage);
      setPerPage(resolvedPageSize);
    } catch {
      setData([]);
      setSummary({});
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [activeAccount?.id, currentPage, dateRange, perPage, plFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tableData = useMemo(() =>
    data.map((row, i) => ({ ...row, id: row.sku_id || i })),
    [data]
  );

  const getPaginationNumbers = () => {
    const delta = 1; const range = []; const result = []; let last;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) range.push(i);
    }
    range.forEach((page) => {
      if (last && page - last !== 1) result.push(page - last === 2 ? last + 1 : '...');
      result.push(page); last = page;
    });
    return result;
  };

  const handleApply = () => {
    const nextDateRange = { from: dateDraft.from || '', to: dateDraft.to || '' };
    setDateRange(nextDateRange);
    setCurrentPage(1);
    fetchData(nextDateRange);
    setShowMobileFilters(false);
  };
  const handleClear = () => {
    setPlFilter('all');
    setDateDraft({ from: '', to: '' });
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ['SKU ID', 'Size', 'P/L', 'Orders', 'Hold', 'Pending', 'Cancelled', 'RTS', 'Picked', 'Shipped', 'Shipped%', 'RTO', 'RTO%', 'Delivered', 'Delivered%', 'Return', 'Return%', 'Delivery', 'Delivery%', 'N/A', 'Avg P/L'];
    const rows = data.map((r) => [r.sku_id, r.size, r.profit_loss, r.orders, r.hold, r.pending, r.cancelled, r.rts, r.picked, r.shipped, r.shipped_pct, r.rto, r.rto_pct, r.delivered, r.delivered_pct, r.return, r.return_pct, r.delivery, r.delivery_pct, r.na, r.avg_pl]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `sku_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filterContent = (
    <div className="grid gap-4 xl:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_minmax(180px,1fr)_72px_72px] xl:items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">P/L Filter</label>
        <select value={plFilter} onChange={(e) => setPlFilter(e.target.value)}
          className="w-full rounded-default border border-border bg-white px-4 py-3 text-sm font-medium text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">

          <option value="all">All SKUs</option>
          <option value="profit">Profit Only</option>
          <option value="loss">Loss Only</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">From Date</label>
        <input type="date" value={dateDraft.from} onChange={(e) => setDateDraft((prev) => ({ ...prev, from: e.target.value }))}
          className="h-[50px] rounded-default border border-border bg-white px-4 text-sm text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />

      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">To Date</label>
        <input type="date" value={dateDraft.to} onChange={(e) => setDateDraft((prev) => ({ ...prev, to: e.target.value }))}
          className="h-[50px] rounded-default border border-border bg-white px-4 text-sm text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />

      </div>
      <Button variant="primary" className="h-[50px] w-full px-0 self-end" onClick={handleApply} title="Apply Filters"><FiSearch size={18} /></Button>
      <Button variant="secondary" className="h-[50px] w-full px-0 self-end" onClick={handleClear} title="Clear Filters"><FiX size={18} /></Button>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <OrdersPageHeader
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: 'Reports' },
            { label: 'SKU Report', current: true },
          ]}
          actions={(
            <>
              {/* <Button variant="success" size="sm" onClick={exportCSV}><FiDownload size={14} />Export CSV</Button> */}
              <Button variant="secondary" size="sm" onClick={fetchData}><FiRefreshCw size={14} />Refresh</Button>
            </>
          )}
        />


        <OrdersFilterSection
          mobileTitle="SKU Report Filters"
          mobileDescription="Filter SKU report by P/L status and date range."
          activeCount={[plFilter !== 'all', dateDraft.from, dateDraft.to].filter(Boolean).length}
          isModalOpen={showMobileFilters}
          onOpenModal={() => setShowMobileFilters(true)}
          onCloseModal={() => setShowMobileFilters(false)}
          onClear={handleClear}
          onApply={handleApply}
        >
          {filterContent}
        </OrdersFilterSection>

        {/* Summary Stats */}
        <Card title="Overall Performance" subtitle={`${total} SKUs total`} muted>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {SUMMARY_STATS.map(({ key, label, pctKey, color, isCurrency }) => (
              <div key={key} className="rounded-default border border-border/70 bg-white p-3 text-center">

                <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-text-muted">{label}</div>
                <div className={`mt-2 text-lg font-black ${color}`}>
                  {isCurrency ? `Rs. ${fmt(summary[key])}` : fmtN(summary[key])}
                </div>
                {pctKey ? <div className="text-[0.65rem] font-bold text-text-muted">{summary[pctKey] ?? 0}%</div> : null}
              </div>
            ))}
          </div>
        </Card>

        {/* Data Table */}
        <Card
          title="SKU Records"
          subtitle={`Showing ${data.length} of ${total} SKUs`}
          contentClassName="p-0"
          noHeaderBorder
          action={(
            <div className="flex items-center gap-3">
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="rounded-inner border border-border bg-white px-3 py-2 text-sm font-bold text-text outline-none focus:border-primary">

                {PER_PAGE_OPTIONS.map((o) => <option key={o} value={o}>{o} / page</option>)}
              </select>
              <Button variant="secondary" size="sm" onClick={fetchData}><FiRefreshCw size={14} /></Button>
            </div>
          )}
        >
          <DataTable
            columns={COLUMNS}
            data={tableData}
            loading={loading}
            loadingText="Loading SKU report..."
            emptyText="No SKU data found for the selected filters."
            mobileCardView={false}
            showIndex
            stickyFirstColumn
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
            wrapperClassName="rounded-b-default pb-2"

            tableClassName="min-w-[1400px]"
            headClassName="sticky top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
            headerCellClassName="px-3 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap border-b border-border sm:px-4"
            indexHeaderClassName="sticky left-0 z-20 w-10 border-b border-r border-border bg-surface-alt/95 px-3 py-3 text-center text-[0.62rem] font-extrabold"
            indexCellClassName="sticky left-0 z-10 border-r border-border bg-surface-alt/95 px-3 py-3 text-center font-medium text-text-muted"
            cellClassName="px-3 py-3 whitespace-nowrap text-xs text-text sm:px-4"
            selectedClass="bg-primary/10 text-text"
            hoverClass="hover:bg-surface-alt"
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-bold text-text-muted">
                {total === 0 ? 0 : ((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, total)} of {total}
              </span>
              <nav className="flex items-center overflow-x-auto rounded-default border border-border bg-white shadow-sm">

                <button className={`p-3 transition-colors hover:bg-surface-alt ${currentPage === 1 ? 'cursor-not-allowed text-slate-300' : 'text-text'}`}
                  onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                  <FiChevronLeft size={16} />
                </button>
                {getPaginationNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span key={`d-${idx}`} className="px-3 text-xs font-bold text-text-muted">...</span>
                  ) : (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`px-3 py-3 text-sm font-bold transition-colors ${currentPage === page ? 'bg-primary text-white' : 'text-text hover:bg-surface-alt'}`}>
                      {page}
                    </button>
                  )
                )}
                <button className={`p-3 transition-colors hover:bg-surface-alt ${currentPage === totalPages ? 'cursor-not-allowed text-slate-300' : 'text-text'}`}
                  onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                  <FiChevronRight size={16} />
                </button>
              </nav>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
