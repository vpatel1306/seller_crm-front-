import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiDownload,
  FiEdit2,
  FiFileText,
  FiFilter,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { MdOutlineBarChart } from 'react-icons/md';
import DataTable from '../../components/ui/DataTable';
import OrdersActionBar from '../../components/ui/OrdersActionBar';
import SummaryTable from '../../components/ui/SummaryTable';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DEMO_ORDERS = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  order_number: `173${4079513846 + i * 17}_${i + 1}`,
  order_date: `0${(i % 9) + 1}/07/2025`,
  order_status: 'CANCELLED',
  pickup_date: `0${(i % 9) + 1}/07/2025`,
  pickup_awb: '',
  courier: '',
  packet_qr: '',
  selling: [470, 310, 749, 249, 310, 470, 359, 749, 310, 310][i % 10],
  qty: 1,
  payout: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0][i % 10],
  cost: [320, 215, 495, 180, 215, 320, 260, 495, 215, 215][i % 10],
  pl: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0][i % 10],
}));

const DATE_SUMMARY = [
  { date: '09/07/2025', count: 2, cost: '535.00' },
  { date: '08/07/2025', count: 2, cost: '675.00' },
  { date: '07/07/2025', count: 5, cost: '1505.00' },
  { date: '06/07/2025', count: 9, cost: '2150.00' },
  { date: '05/07/2025', count: 4, cost: '905.00' },
  { date: '04/07/2025', count: 2, cost: '430.00' },
  { date: '03/07/2025', count: 4, cost: '1145.00' },
  { date: '02/07/2025', count: 10, cost: '3550.00' },
  { date: '01/07/2025', count: 5, cost: '1280.00' },
];

const COURIER_SUMMARY = [
  { courier: 'Valmo', pickup: 113, cost: '31010.00' },
  { courier: 'Shadowfax', pickup: 17, cost: '4645.00' },
  { courier: 'Delhivery', pickup: 13, cost: '3420.00' },
  { courier: 'Ecom Expres', pickup: 9, cost: '2250.00' },
];

const STATUS_SUMMARY = [{ status: 'CANCELLED', count: 852, cost: '229041.00' }];

const summaryTableProps = {
  containerClassName: 'mx-2 mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
  titleClassName: 'bg-slate-100 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-700',
  headRowClassName: 'bg-slate-50 text-slate-500',
  headerCellClassName: 'px-3 py-2 text-left text-[0.62rem] font-semibold whitespace-nowrap',
  cellClassName: 'px-3 py-2 whitespace-nowrap text-[0.68rem]',
  bodyWrapperClassName: 'max-h-56',
  hoverClass: 'hover:bg-slate-50',
  rowClassName: (_, i) => (i % 2 === 0 ? 'bg-white border-b border-slate-200' : 'bg-slate-50/70 border-b border-slate-200'),
};

export default function CancelledOrders() {
  const navigate = useNavigate();
  const { activeAccount, selectedDateRange, setSelectedDateRange } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [sortKey, setSortKey] = useState('order_date');
  const [sortDir, setSortDir] = useState('desc');
  const [leftOpen, setLeftOpen] = useState(true);
  const searchRef = useRef(null);
  const fromDate = selectedDateRange.from;
  const toDate = selectedDateRange.to;
  const accountName = activeAccount?.account_name || 'No account selected';

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders-list/', {
        params: { from_date: fromDate, to_date: toDate, status: 'CANCELLED' },
      });
      const list = (res.data?.data || res.data || []).filter((o) => (o.order_status || '').toUpperCase() === 'CANCELLED');
      setOrders(list.length ? list : DEMO_ORDERS);
    } catch {
      setOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.order_date || '').toLowerCase().includes(q) ||
      (o.courier || '').toLowerCase().includes(q) ||
      (o.pickup_awb || '').toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const va = a[sortKey] ?? '';
    const vb = b[sortKey] ?? '';
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const columns = [
    { key: 'order_number', label: 'Order Number (F1)', className: () => 'font-bold text-indigo-600' },
    { key: 'order_date', label: 'Order Date (F2)', className: () => 'text-slate-600' },
    { key: 'order_status', label: 'Order Status', className: (_, isSelected) => `font-extrabold ${isSelected ? 'text-slate-900' : 'text-rose-600'}` },
    { key: 'pickup_date', label: 'Pickup Date (F3)', className: () => 'text-slate-500' },
    { key: 'pickup_awb', label: 'Pickup AWB (F4)', className: () => 'text-sky-600' },
    { key: 'courier', label: 'Pick-Up Courier', className: () => 'font-semibold text-amber-600' },
    { key: 'packet_qr', label: 'Packet QR (F5)', className: () => 'text-violet-600' },
    { key: 'selling', label: 'Selling', right: true, className: () => 'text-right font-bold text-slate-900' },
    { key: 'qty', label: 'Qty', right: true, className: () => 'text-right text-slate-600' },
    { key: 'payout', label: 'Payout', right: true, className: (_, isSelected) => `text-right font-bold ${isSelected ? 'text-slate-900' : 'text-slate-500'}` },
    { key: 'cost', label: 'Cost', right: true, className: () => 'text-right font-bold text-emerald-600' },
    { key: 'pl', label: 'P/L', right: true, className: (row) => `text-right font-bold ${row.pl >= 0 ? 'text-green-600' : 'text-red-600'}` },
  ];

  const footerActions = [
    { key: 'export', label: 'Export CSV', icon: FiDownload, className: 'bg-teal-600 text-white shadow-sm hover:bg-teal-700' },
    { key: 'analytics', label: 'Analytics', icon: MdOutlineBarChart, className: 'bg-purple-600 text-white shadow-sm hover:bg-purple-700' },
    { key: 'edit', label: 'Edit Order', icon: FiEdit2, disabled: !selectedId, className: selectedId ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' : 'cursor-not-allowed bg-slate-200 text-slate-400' },
    { key: 'delete', label: 'Delete Order', icon: FiTrash2, disabled: !selectedId, className: selectedId ? 'bg-red-600 text-white shadow-sm hover:bg-red-700' : 'cursor-not-allowed bg-slate-200 text-slate-400' },
    { key: 'pickup-files', label: 'Check Pickup Files', icon: FiFileText, className: 'bg-amber-500 text-white shadow-sm hover:bg-amber-600' },
    { key: 'details', label: 'Order Details', icon: FiInfo, disabled: !selectedId, className: selectedId ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' : 'cursor-not-allowed bg-slate-200 text-slate-400' },
    { key: 'refresh', label: 'Refresh', icon: FiRefreshCw, onClick: loadOrders, className: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' },
    { key: 'close', label: 'Close', icon: FiX, onClick: () => navigate('/dashboard'), className: 'ml-auto border border-slate-300 bg-white text-slate-700 hover:bg-slate-50' },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm shrink-0 flex-wrap">
        <h1 className="text-sm font-extrabold tracking-wide text-slate-900">
          Cancelled Orders - <span className="text-rose-600">{accountName}</span>
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
            <span className="font-semibold">Search On Order Number (F1) -&gt;</span>
          </div>
          <div className="relative">
            <FiSearch size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="(F1) Order number..."
              className="w-52 rounded-xl border border-slate-300 bg-white py-2 pl-7 pr-7 text-xs text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            {search && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setSearch('')}>
                <FiX size={12} />
              </button>
            )}
          </div>
          <button
            className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
            onClick={() => navigate('/dashboard')}
          >
            <FiX size={12} /> Close
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 shrink-0 flex-wrap">
        <span className="text-[0.7rem] font-semibold text-slate-500">Orders From Date</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setSelectedDateRange({ ...selectedDateRange, from: e.target.value })}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[0.78rem] text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <span className="text-[0.7rem] font-semibold text-slate-500">To Date</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setSelectedDateRange({ ...selectedDateRange, to: e.target.value })}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[0.78rem] text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <button
          onClick={loadOrders}
          className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-[0.75rem] font-bold text-white transition-colors hover:bg-rose-700 active:scale-95"
        >
          <FiCalendar size={11} /> Change Date (F2)
        </button>
        <div className="ml-auto text-[0.75rem] font-semibold text-slate-600">
          Total Rows - <span className="font-extrabold text-rose-600">{filtered.length}</span>
          <span className="text-slate-400"> / {orders.length}</span>
        </div>
        <button
          className="rounded-xl border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100"
          onClick={() => setLeftOpen((o) => !o)}
          title="Toggle left panel"
        >
          <FiFilter size={12} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {leftOpen && (
          <div className="min-h-0 w-full overflow-y-auto border-b border-slate-200 bg-white md:w-[250px] md:min-w-[250px] md:flex-shrink-0 md:border-b-0 md:border-r [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
            <SummaryTable
              {...summaryTableProps}
              title="Order Date Summary"
              rows={DATE_SUMMARY}
              cols={[
                { key: 'date', label: 'Order Date', color: () => 'text-slate-700' },
                { key: 'count', label: 'Count', right: true, color: () => 'text-rose-600 text-right font-bold' },
                { key: 'cost', label: 'Cost AMT', right: true, color: () => 'text-emerald-600 text-right font-semibold' },
              ]}
            />

            <SummaryTable
              {...summaryTableProps}
              title="Courier Summary"
              rows={COURIER_SUMMARY}
              cols={[
                { key: 'courier', label: 'Courier', color: () => 'text-slate-700' },
                { key: 'pickup', label: 'Pickup', right: true, color: () => 'text-rose-600 text-right font-bold' },
                { key: 'cost', label: 'Cost AMT', right: true, color: () => 'text-emerald-600 text-right font-semibold' },
              ]}
            />

            <SummaryTable
              {...summaryTableProps}
              title="Status Summary"
              rows={STATUS_SUMMARY}
              cols={[
                { key: 'status', label: 'Status', color: () => 'text-rose-600 font-bold' },
                { key: 'count', label: 'Count', right: true, color: () => 'text-rose-600 text-right font-bold' },
                { key: 'cost', label: 'Cost AMT', right: true, color: () => 'text-emerald-600 text-right font-semibold' },
              ]}
            />

            <div className="mx-2 mb-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-center">
              <div className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-rose-700">Cancellation Rate</div>
              <div className="text-2xl font-extrabold text-amber-500">10.00%</div>
              <div className="mt-1 text-[0.6rem] text-slate-500">of all received orders</div>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto md:bg-white">
            <DataTable
              mobileCardView={false}
              columns={columns}
              data={sorted}
              loading={loading}
              loadingText="Loading cancelled orders..."
              emptyText="No cancelled orders found."
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
              onSort={handleSort}
              sortKey={sortKey}
              sortDir={sortDir}
              wrapperClassName="h-full"
              selectedClass="bg-rose-50 text-slate-900"
            />
          </div>

          <OrdersActionBar variant="light" actions={footerActions} />
        </div>
      </div>
    </div>
  );
}
