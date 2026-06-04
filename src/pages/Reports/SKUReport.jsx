import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiDownload, FiRefreshCw, FiSearch, FiTrendingDown, FiTrendingUp, FiX, FiDollarSign, FiPackage, FiTruck, FiAlertCircle } from 'react-icons/fi';
import AppShell from '../../components/layout/AppShell';
import OrdersPageHeader from '../../components/orders/OrdersPageHeader';
import OrdersFilterSection from '../../components/orders/OrdersFilterSection';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CommonModal from '../../components/common/CommonModal';

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

  // Redesign state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSkuData, setSelectedSkuData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const visibleColumns = useMemo(() => {
    if (activeTab === 'all') return COLUMNS;
    const tabKeys = {
      overview: ['sku_id', 'profit_loss', 'orders', 'delivered', 'return', 'avg_pl'],
      pipeline: ['sku_id', 'orders', 'hold', 'pending', 'cancelled', 'rts', 'picked', 'shipped'],
      delivery: ['sku_id', 'orders', 'shipped', 'rto', 'delivered', 'return', 'delivery', 'avg_pl'],
    };
    const allowed = tabKeys[activeTab] || tabKeys.overview;
    return COLUMNS.filter((col) => allowed.includes(col.key));
  }, [activeTab]);

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

  const handleRowClick = (row) => {
    setSelectedId(row.id);
    setSelectedSkuData(row);
    setIsModalOpen(true);
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
          className="h-9 w-full rounded-default border border-border bg-white px-4 text-sm font-medium text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
          <option value="all">All SKUs</option>
          <option value="profit">Profit Only</option>
          <option value="loss">Loss Only</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">From Date</label>
        <input type="date" value={dateDraft.from} onChange={(e) => setDateDraft((prev) => ({ ...prev, from: e.target.value }))}
          className="h-9 rounded-default border border-border bg-white px-4 text-sm text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">To Date</label>
        <input type="date" value={dateDraft.to} onChange={(e) => setDateDraft((prev) => ({ ...prev, to: e.target.value }))}
          className="h-9 rounded-default border border-border bg-white px-4 text-sm text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
      </div>
      <Button variant="primary" className="!h-9 w-full px-0 self-end" onClick={handleApply} title="Apply Filters"><FiSearch size={18} /></Button>
      <Button variant="secondary" className="!h-9 w-full px-0 self-end" onClick={handleClear} title="Clear Filters"><FiX size={18} /></Button>
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

        {/* Overall Performance Redesign (Compact) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Grand Profit/Loss Card */}
          <div className={`p-3.5 rounded-default border flex flex-col justify-between shadow-xs relative overflow-hidden transition-all duration-300 ${
            Number(summary.grand_pl) >= 0
              ? 'bg-emerald-50/50 border-emerald-100/60 shadow-emerald-500/5'
              : 'bg-rose-50/50 border-rose-100/60 shadow-rose-500/5'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[0.62rem] font-extrabold text-slate-400 uppercase tracking-widest block">Net Profit / Loss</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                Number(summary.grand_pl) >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
              }`}>
                {Number(summary.grand_pl) >= 0 ? <FiTrendingUp size={15} /> : <FiTrendingDown size={15} />}
              </div>
            </div>
            <div className={`text-xl font-black mt-1.5 ${
              Number(summary.grand_pl) >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              Rs. {fmt(summary.grand_pl)}
            </div>
          </div>

          {/* 2. Total Orders Card */}
          <div className="p-3.5 rounded-default border border-slate-200 bg-white flex flex-col justify-between shadow-xs shadow-slate-100/50">
            <div className="flex items-center justify-between">
              <span className="text-[0.62rem] font-extrabold text-slate-400 uppercase tracking-widest block">Total Order Volume</span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FiPackage size={15} />
              </div>
            </div>
            <div className="text-xl font-black mt-1.5 text-slate-800">
              {fmtN(summary.grand_total)} <span className="text-xs font-semibold text-slate-400">Orders</span>
            </div>
          </div>

          {/* 3. Delivery Success Card */}
          <div className="p-3.5 rounded-default border border-slate-200 bg-white flex flex-col justify-between shadow-xs shadow-slate-100/50 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-[0.62rem] font-extrabold text-slate-400 uppercase tracking-widest block">Net Delivery Rate</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <FiTruck size={15} />
              </div>
            </div>
            <div className="text-xl font-black mt-1.5 text-emerald-700 flex items-baseline gap-1.5">
              <span>{summary.delivery_pct ?? 0}%</span>
              <span className="text-[10px] font-bold text-slate-400">({fmtN(summary.delivery)} orders)</span>
            </div>
          </div>
        </div>

        {/* Logistics Pipeline Stats Row (Compact) */}
        <div className="bg-white rounded-default border border-slate-200/80 shadow-xs p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {/* Picked */}
            <div className="rounded-lg bg-slate-50/50 border border-slate-100/80 p-2 text-center">
              <div className="text-[0.58rem] font-extrabold uppercase tracking-widest text-slate-400">Picked</div>
              <div className="mt-1 text-base font-black text-slate-700">{fmtN(summary.picked)}</div>
            </div>

            {/* Shipped */}
            <div className="rounded-lg bg-slate-50/50 border border-slate-100/80 p-2 text-center">
              <div className="text-[0.58rem] font-extrabold uppercase tracking-widest text-slate-400">Shipped</div>
              <div className="mt-1 text-base font-black text-sky-600">{fmtN(summary.shipped)} <span className="text-[10px] font-bold text-slate-400">({summary.shipped_pct ?? 0}%)</span></div>
            </div>

            {/* Delivered */}
            <div className="rounded-lg bg-slate-50/50 border border-slate-100/80 p-2 text-center">
              <div className="text-[0.58rem] font-extrabold uppercase tracking-widest text-slate-400">Delivered</div>
              <div className="mt-1 text-base font-black text-emerald-600">{fmtN(summary.delivered)} <span className="text-[10px] font-bold text-slate-400">({summary.delivered_pct ?? 0}%)</span></div>
            </div>

            {/* RTO */}
            <div className="rounded-lg bg-slate-50/50 border border-slate-100/80 p-2 text-center">
              <div className="text-[0.58rem] font-extrabold uppercase tracking-widest text-slate-400">RTO</div>
              <div className="mt-1 text-base font-black text-rose-600">{fmtN(summary.rto)} <span className="text-[10px] font-bold text-slate-400">({summary.rto_pct ?? 0}%)</span></div>
            </div>

            {/* Return */}
            <div className="rounded-lg bg-slate-50/50 border border-slate-100/80 p-2 text-center">
              <div className="text-[0.58rem] font-extrabold uppercase tracking-widest text-slate-400">Return</div>
              <div className="mt-1 text-base font-black text-amber-600">{fmtN(summary.return)} <span className="text-[10px] font-bold text-slate-400">({summary.return_pct ?? 0}%)</span></div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Card
          title="SKU Records"
          subtitle={`Showing ${data.length} of ${total} SKUs • Click a row to view visual breakdown`}
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
          {/* Tab Selector */}
          <div className="border-b border-border bg-surface-alt/45 p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
              {[
                { id: 'overview', label: '📊 Overview' },
                { id: 'pipeline', label: '🚚 Pipeline' },
                { id: 'delivery', label: '📈 Outcomes' },
                { id: 'all', label: '📋 All Columns' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-primary shadow-sm font-extrabold'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-[0.68rem] font-bold text-text-muted italic hidden md:block">
              💡 Click any SKU row to view graphical metrics & pipeline details.
            </div>
          </div>

          <DataTable
            columns={visibleColumns}
            data={tableData}
            loading={loading}
            loadingText="Loading SKU report..."
            emptyText="No SKU data found for the selected filters."
            mobileCardView={false}
            showIndex
            stickyFirstColumn
            selectedId={selectedId}
            onRowClick={handleRowClick}
            wrapperClassName="rounded-b-default pb-2"
            tableClassName={activeTab === 'all' ? 'min-w-[1400px]' : 'min-w-[1000px] w-full'}
            headClassName="sticky top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
            headerCellClassName="px-3 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap border-b border-border sm:px-4"
            indexHeaderClassName="sticky left-0 z-20 w-10 border-b border-r border-border bg-surface-alt/95 px-3 py-3 text-center text-[0.62rem] font-extrabold"
            indexCellClassName="sticky left-0 z-10 border-r border-border bg-surface-alt/95 px-3 py-3 text-center font-medium text-text-muted"
            cellClassName="px-3 py-3 whitespace-nowrap text-xs text-text sm:px-4 cursor-pointer"
            selectedClass="bg-primary/5 text-text"
            hoverClass="hover:bg-surface-alt/70"
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

      {/* SKU Detail Modal */}
      {selectedSkuData && (
        <CommonModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSkuData(null);
          }}
          title="SKU Performance Details"
          size="lg"
          headerStyle="gradient"
          showFooter={false}
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">
                  {selectedSkuData.sku_id}
                </h4>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                  Size: <span className="text-slate-700 font-extrabold">{selectedSkuData.size || 'Free Size'}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[0.62rem] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                  Performance Summary
                </span>
              </div>
            </div>

            {/* Financial Performance KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-default border flex flex-col justify-between shadow-sm relative overflow-hidden ${
                Number(selectedSkuData.profit_loss) >= 0
                  ? 'bg-emerald-50/50 border-emerald-100'
                  : 'bg-rose-50/50 border-rose-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">Net Profit / Loss</span>
                  {Number(selectedSkuData.profit_loss) >= 0 ? (
                    <FiTrendingUp className="text-emerald-500" size={18} />
                  ) : (
                    <FiTrendingDown className="text-rose-500" size={18} />
                  )}
                </div>
                <div className={`text-2xl font-black mt-3 ${
                  Number(selectedSkuData.profit_loss) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  Rs. {fmt(selectedSkuData.profit_loss)}
                </div>
              </div>

              <div className={`p-4 rounded-default border bg-white flex flex-col justify-between shadow-sm border-slate-200 ${
                Number(selectedSkuData.avg_pl) >= 0 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">Avg P/L per Order</span>
                  <FiDollarSign className="text-primary/70" size={16} />
                </div>
                <div className={`text-2xl font-black mt-3 ${
                  Number(selectedSkuData.avg_pl) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  Rs. {fmt(selectedSkuData.avg_pl)}
                </div>
              </div>

              <div className="p-4 rounded-default border border-slate-200 bg-white flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                  <FiPackage className="text-primary/70" size={16} />
                </div>
                <div className="text-2xl font-black mt-3 text-slate-800">
                  {fmtN(selectedSkuData.orders)}
                </div>
              </div>
            </div>

            {/* Performance Rates - Progress Bars */}
            <div className="bg-white rounded-default border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
              <h5 className="text-[0.75rem] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FiTruck size={14} className="text-primary" /> Delivery & Logistics Rates
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Delivered Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">Delivered Rate</span>
                    <span className="text-emerald-600">{selectedSkuData.delivered_pct ?? 0}% ({fmtN(selectedSkuData.delivered)} orders)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Number(selectedSkuData.delivered_pct) || 0, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Net Delivery Success */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">Net Delivery Success Rate</span>
                    <span className="text-emerald-700">{selectedSkuData.delivery_pct ?? 0}% ({fmtN(selectedSkuData.delivery)} orders)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Number(selectedSkuData.delivery_pct) || 0, 100)}%` }}
                    />
                  </div>
                </div>

                {/* RTO Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">RTO Rate</span>
                    <span className="text-rose-600">{selectedSkuData.rto_pct ?? 0}% ({fmtN(selectedSkuData.rto)} orders)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Number(selectedSkuData.rto_pct) || 0, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Return Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600">Customer Return Rate</span>
                    <span className="text-amber-600">{selectedSkuData.return_pct ?? 0}% ({fmtN(selectedSkuData.return)} orders)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Number(selectedSkuData.return_pct) || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Group 1: Processing */}
              <div className="bg-slate-50/50 rounded-default border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h6 className="text-[0.68rem] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                    1. Warehouse Processing
                  </h6>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">On Hold</span>
                      <span className="font-bold text-slate-700 tabular-nums">{fmtN(selectedSkuData.hold)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">Pending Entry</span>
                      <span className="font-bold text-slate-700 tabular-nums">{fmtN(selectedSkuData.pending)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-dashed border-slate-200 text-[0.62rem] text-slate-400 font-semibold">
                  Orders yet to be packed/shipped.
                </div>
              </div>

              {/* Group 2: Shipping Pipeline */}
              <div className="bg-slate-50/50 rounded-default border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h6 className="text-[0.68rem] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                    2. Fulfillment Pipeline
                  </h6>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">RTS (Ready to Ship)</span>
                      <span className="font-bold text-slate-700 tabular-nums">{fmtN(selectedSkuData.rts)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">Picked</span>
                      <span className="font-bold text-slate-700 tabular-nums">{fmtN(selectedSkuData.picked)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">Shipped</span>
                      <div className="text-right">
                        <span className="font-bold text-sky-600 tabular-nums">{fmtN(selectedSkuData.shipped)}</span>
                        <span className="text-[0.62rem] text-slate-400 block">{selectedSkuData.shipped_pct ?? 0}% of total</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-dashed border-slate-200 text-[0.62rem] text-slate-400 font-semibold">
                  Fulfillment operations & logistics handoff.
                </div>
              </div>

              {/* Group 3: Outcomes */}
              <div className="bg-slate-50/50 rounded-default border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h6 className="text-[0.68rem] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                    3. Final Outcomes
                  </h6>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">Delivered</span>
                      <span className="font-bold text-emerald-600 tabular-nums">{fmtN(selectedSkuData.delivered)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">RTO (Returned)</span>
                      <span className="font-bold text-rose-600 tabular-nums">{fmtN(selectedSkuData.rto)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">Customer Return</span>
                      <span className="font-bold text-amber-600 tabular-nums">{fmtN(selectedSkuData.return)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">Cancelled</span>
                      <span className="font-bold text-rose-700 tabular-nums">{fmtN(selectedSkuData.cancelled)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-500">N/A / Other</span>
                      <span className="font-bold text-slate-500 tabular-nums">{fmtN(selectedSkuData.na)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[0.62rem] text-slate-400 font-semibold">
                  End states of all period orders.
                </div>
              </div>
            </div>
          </div>
        </CommonModal>
      )}
    </AppShell>
  );
}
