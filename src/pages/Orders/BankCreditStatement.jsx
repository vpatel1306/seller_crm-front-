import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import AppShell from '../../components/layout/AppShell';
import OrdersFilterSection from '../../components/orders/OrdersFilterSection';
import OrdersPageHeader from '../../components/orders/OrdersPageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const fmt = (v) => (Number(v) || 0).toFixed(2);

const CREDIT_COLS = [
  { key: '_date', label: 'Period' },
  { key: 'claim', label: 'Claim', right: true, render: (row) => <span>{fmt(row.claim)}</span> },
  { key: 'recovery', label: 'Recovery', right: true, render: (row) => <span className={Number(row.recovery) < 0 ? 'text-rose-600' : ''}>{fmt(row.recovery)}</span> },
  { key: 'comp', label: 'Comp.', right: true, render: (row) => <span>{fmt(row.comp)}</span> },
  { key: 'settlement', label: 'Settlement', right: true, render: (row) => <span className="font-semibold text-emerald-600">{fmt(row.settlement)}</span> },
  { key: 'ads_cost', label: 'Advt.', right: true, render: (row) => <span className={Number(row.ads_cost) < 0 ? 'text-rose-600' : ''}>{fmt(row.ads_cost)}</span> },
  { key: 'bank_received', label: 'Bank Received', right: true, render: (row) => <span className="font-bold text-sky-600">{fmt(row.bank_received)}</span> },
];

const SETTLEMENT_COLUMNS = [
  { key: 'payment_date', label: 'Payment Date', className: 'min-w-[110px]' },
  { key: 'order_number', label: 'Order Number', className: 'min-w-[200px]', render: (row) => <span className="font-extrabold text-primary">{row.order_number || '-'}</span> },
  { key: 'order_date', label: 'Order Date', className: 'min-w-[110px]' },
  {
    key: 'status', label: 'Status', className: 'min-w-[120px]',
    render: (row) => (
      <span className={`rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] ${row.status === 'Delivered' || row.status === 'DELIVERED' ? 'text-emerald-600' : row.status === 'RETURN' ? 'text-rose-600' : 'text-text'}`}>
        {row.status || '-'}
      </span>
    ),
  },
  { key: 'settlement', label: 'Settlement', right: true, className: 'min-w-[110px]', render: (row) => <span className={`font-bold ${Number(row.settlement) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{fmt(row.settlement)}</span> },
  { key: 'claim', label: 'Claim', right: true, className: 'min-w-[90px]', render: (row) => <span className="text-text-muted">{fmt(row.claim)}</span> },
  { key: 'rcvy', label: 'Rcvy', right: true, className: 'min-w-[90px]', render: (row) => <span className={Number(row.rcvy) < 0 ? 'text-rose-600' : 'text-text-muted'}>{fmt(row.rcvy)}</span> },
  { key: 'comp', label: 'Comp.', right: true, className: 'min-w-[90px]', render: (row) => <span className="text-text-muted">{fmt(row.comp)}</span> },
];

const SETTLEMENT_COLORS = {
  RTO: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'CUSTOMER RETURN': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  OTHERS: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function CreditTable({ rows, dateField, loading }) {
  const mapped = rows.map((r) => ({ ...r, _date: r[dateField] || '-', id: r[dateField] }));

  const totalsRow = useMemo(() => {
    if (!rows.length) return null;
    const keys = ['claim', 'recovery', 'comp', 'settlement', 'ads_cost', 'bank_received'];
    const t = keys.reduce((acc, k) => { acc[k] = rows.reduce((s, r) => s + (Number(r[k]) || 0), 0); return acc; }, {});
    return (
      <tr className="border-t-2 border-border bg-surface-alt font-bold text-text">
        <td className="px-4 py-2 text-xs">Total →</td>
        <td className="px-4 py-2 text-right text-xs">{fmt(t.claim)}</td>
        <td className={`px-4 py-2 text-right text-xs ${t.recovery < 0 ? 'text-rose-600' : ''}`}>{fmt(t.recovery)}</td>
        <td className="px-4 py-2 text-right text-xs">{fmt(t.comp)}</td>
        <td className="px-4 py-2 text-right text-xs text-emerald-600">{fmt(t.settlement)}</td>
        <td className="px-4 py-2 text-right text-xs">{fmt(t.ads_cost)}</td>
        <td className="px-4 py-2 text-right text-xs text-sky-600">{fmt(t.bank_received)}</td>
      </tr>
    );
  }, [rows]);

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={CREDIT_COLS}
        data={mapped}
        loading={loading}
        loadingText="Loading..."
        emptyText="No data available."
        mobileCardView={false}
        showIndex={false}
        wrapperClassName="rounded-b-none"
        tableClassName="min-w-[680px]"
        headClassName="sticky top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
        headerCellClassName="px-4 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap border-b border-border"
        cellClassName="px-4 py-2 whitespace-nowrap text-xs text-text"
        hoverClass="hover:bg-surface-alt"
        rowClassName={(_, i) => i % 2 === 0 ? 'border-b border-border bg-white' : 'border-b border-border bg-surface-alt/40'}
      />
      {totalsRow && (
        <table className="w-full min-w-[680px]">
          <tbody>{totalsRow}</tbody>
        </table>
      )}
    </div>
  );
}

export default function BankCreditStatement() {
  const navigate = useNavigate();
  const { activeAccount, selectedDateRange } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [monthWise, setMonthWise] = useState([]);
  const [dayWise, setDayWise] = useState([]);
  const [settlementTypes, setSettlementTypes] = useState({});
  const [receivedSettlements, setReceivedSettlements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
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
      const res = await api.post('/get-bank-credit', {
        start_date: requestFromDate,
        end_date: requestToDate,
      }, { headers: { account: activeAccount.id } });
      const d = res.data || {};
      setMonthWise(Array.isArray(d.month_wise) ? d.month_wise : []);
      setDayWise(Array.isArray(d.day_wise) ? d.day_wise : []);
      setSettlementTypes(d.settlement_types && typeof d.settlement_types === 'object' ? d.settlement_types : {});
      setReceivedSettlements(Array.isArray(d.received_settlements) ? d.received_settlements : []);
      setCurrentPage(1);
    } catch {
      setMonthWise([]); setDayWise([]); setSettlementTypes({}); setReceivedSettlements([]);
    } finally {
      setLoading(false);
    }
  }, [activeAccount?.id, dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredSettlements = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return receivedSettlements;
    return receivedSettlements.filter((row) =>
      Object.values(row).some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [search, receivedSettlements]);

  const totalPages = Math.max(Math.ceil(filteredSettlements.length / perPage), 1);

  const pagedSettlements = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredSettlements.slice(start, start + perPage).map((row, i) => ({ ...row, id: row.order_number || i }));
  }, [filteredSettlements, currentPage, perPage]);

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

  const settlementTypeEntries = Object.entries(settlementTypes).map(([key, val]) => ({
    title: key,
    amount: fmt(val?.amount),
    count: String(val?.count ?? 0),
    colors: SETTLEMENT_COLORS[key] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  }));

  const filterContent = (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
        <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">Search</label>
        <div className="relative">
          <FiSearch size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search settlements"
            className="w-full rounded-[16px] border border-border bg-white py-3 pl-11 pr-11 text-sm text-text outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10" />
          {search ? <button type="button" onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"><FiX size={14} /></button> : null}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">From Date</label>
        <input type="date" value={dateDraft.from} onChange={(e) => setDateDraft((prev) => ({ ...prev, from: e.target.value }))}
          className="h-[50px] rounded-[16px] border border-border bg-white px-4 text-sm text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">To Date</label>
        <input type="date" value={dateDraft.to} onChange={(e) => setDateDraft((prev) => ({ ...prev, to: e.target.value }))}
          className="h-[50px] rounded-[16px] border border-border bg-white px-4 text-sm text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
      </div>
      <Button
        variant="primary"
        className="h-[50px] min-w-[56px] px-0 self-end"
        onClick={() => {
          const nextDateRange = { from: dateDraft.from || '', to: dateDraft.to || '' };
          setDateRange(nextDateRange);
          fetchData(nextDateRange);
        }}
        title="Apply"
      >
        <FiSearch size={18} />
      </Button>
      <Button
        variant="secondary"
        className="h-[50px] min-w-[56px] px-0 self-end"
        onClick={() => {
          setSearch('');
          setDateDraft({ from: '', to: '' });
          setDateRange({ from: '', to: '' });
        }}
        title="Clear"
      >
        <FiX size={18} />
      </Button>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <OrdersPageHeader
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: 'Bank Credit Statement', current: true },
          ]}
          actions={(
            <>
              <Button variant="secondary" size="sm" onClick={fetchData}><FiRefreshCw size={14} />Refresh</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}><FiX size={14} />Cancel</Button>
            </>
          )}
        />

        <OrdersFilterSection
          title="Search Filters"
          mobileTitle="Search Settlements"
          mobileDescription="Filter by date range or search settlement rows."
          activeCount={(search.trim() ? 1 : 0) + (dateDraft.from ? 1 : 0) + (dateDraft.to ? 1 : 0)}
          isModalOpen={showMobileFilters}
          onOpenModal={() => setShowMobileFilters(true)}
          onCloseModal={() => setShowMobileFilters(false)}
          onClear={() => {
            setSearch('');
            setDateDraft({ from: '', to: '' });
            setDateRange({ from: '', to: '' });
          }}
          onApply={() => {
            const nextDateRange = { from: dateDraft.from || '', to: dateDraft.to || '' };
            setDateRange(nextDateRange);
            fetchData(nextDateRange);
            setShowMobileFilters(false);
          }}
        >
          {filterContent}
        </OrdersFilterSection>

        <div className="grid gap-4 xl:grid-cols-2 h-auto">
          <div className="flex flex-col gap-3 flex-1 ">
            <Card title="Month Wise Bank Credit" subtitle={`${monthWise.length} months available`} contentClassName="p-0">
              <CreditTable rows={monthWise} dateField="month_year" loading={loading} />
            </Card>

            <Card title="Day Wise Bank Credit" subtitle={`${dayWise.length} days available`} contentClassName="p-0">
              <CreditTable rows={dayWise} dateField="date" loading={loading} />
            </Card>
          </div>
           <div className="flex flex-col gap-3">
            <Card title="Types Of Settlements" subtitle="Settlement breakdown by type">
              {loading ? (
                <div className="flex h-16 items-center justify-center text-sm text-text-muted">Loading...</div>
              ) : settlementTypeEntries.length === 0 ? (
                <div className="py-6 text-center text-sm text-text-muted">No settlement type data.</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {settlementTypeEntries.map((item) => (
                    <div key={item.title} className={`rounded-[18px] border ${item.colors.border} ${item.colors.bg} p-4`}>
                      <div className={`text-xs font-extrabold uppercase tracking-[0.16em] ${item.colors.text}`}>{item.title}</div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-text-muted">Amount</div>
                          <div className={`text-xl font-black ${Number(item.amount) < 0 ? 'text-rose-600' : item.colors.text}`}>{item.amount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-text-muted">Count</div>
                          <div className={`text-2xl font-black ${item.colors.text}`}>{item.count}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              title="Received Settlements"
              subtitle={`${filteredSettlements.length} settlement entries found`}
              contentClassName="p-0"
              action={(
                <div className="flex items-center gap-3">
                  <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="rounded-[14px] border border-border bg-white px-3 py-2 text-sm font-bold text-text outline-none focus:border-primary">
                    {PER_PAGE_OPTIONS.map((o) => <option key={o} value={o}>{o} / page</option>)}
                  </select>
                  <Button variant="secondary" size="sm" onClick={fetchData}><FiRefreshCw size={14} /></Button>
                </div>
              )}
            >
              <DataTable
                columns={SETTLEMENT_COLUMNS}
                data={pagedSettlements}
                loading={loading}
                loadingText="Loading settlements..."
                emptyText="No received settlements found."
                mobileCardView={false}
                showIndex
                selectedId={selectedId}
                onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                wrapperClassName="rounded-b-[24px]"
                tableClassName="min-w-[860px]"
                headClassName="sticky top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
                headerCellClassName="px-4 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap border-b border-border"
                indexHeaderClassName="w-10 border-b border-border px-3 py-3 text-center text-[0.62rem] font-extrabold"
                cellClassName="px-4 py-3 whitespace-nowrap text-xs text-text"
                selectedClass="bg-primary/10 text-text"
                hoverClass="hover:bg-surface-alt"
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <span className="text-sm font-bold text-text-muted">
                    {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filteredSettlements.length)} of {filteredSettlements.length}
                  </span>
                  <nav className="flex items-center overflow-x-auto rounded-[18px] border border-border bg-white shadow-sm">
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
        </div>

      </div>
    </AppShell>
  );
}
