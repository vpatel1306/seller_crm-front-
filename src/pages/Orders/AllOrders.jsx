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

const DEMO_ORDERS = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  order_number: `172${1840000 + i * 13}_${i + 1}`,
  order_date: `0${(i % 9) + 1}/07/2025`,
  order_status: ['SHIPPED', 'DELIVERED', 'RTO', 'CANCELLED', 'RETURNED'][i % 5],
  pickup_date: `0${(i % 9) + 1}/07/2025`,
  pickup_awb: `VL00815242000${String(i).padStart(2, '0')}`,
  courier: ['Valmo', 'Delhivery', 'Shadowfax', 'Ecom Express', 'Xpress Bees'][i % 5],
  packet_qr: `TAAASDF${40554550 + i}`,
  selling: [470, 749, 314, 330, 299, 649, 335, 310][i % 8],
  qty: 1,
  payout: [320, 495, 215, 215, 215, 500, 215, 215][i % 8],
  cost: [0, 0, 0, 0, 0, 0, 0, 0][i % 8],
  pl: [0, 0, 0, 0, 0, 0, 0, 0][i % 8],
}));

const DATE_SUMMARY = [
  { date: '10/07/2025', count: 5, cost: '1760.00' },
  { date: '09/07/2025', count: 32, cost: '8200.00' },
  { date: '08/07/2025', count: 26, cost: '8480.00' },
  { date: '07/07/2025', count: 41, cost: '11765.00' },
  { date: '06/07/2025', count: 69, cost: '16835.00' },
];

const STATUS_SUMMARY = [
  { status: 'DELIVERED', count: 3002, cost: '772126.00' },
  { status: 'RTO_COMPLE', count: 857, cost: '216400.00' },
  { status: 'CANCELLED', count: 563, cost: '200381.00' },
  { status: 'SHIPPED', count: 184, cost: '49230.00' },
  { status: 'RTO_LOCKED', count: 159, cost: '39990.00' },
];

const COURIER_SUMMARY = [
  { courier: 'Valmo', pickup: 3387, cost: '871813.00' },
  { courier: 'Delhivery', pickup: 451, cost: '115070.00' },
  { courier: 'Shadowfax', pickup: 286, cost: '73919.00' },
  { courier: 'Ecom Expres', pickup: 173, cost: '42894.00' },
  { courier: 'Xpress Bees', pickup: 33, cost: '8400.00' },
];

const ORDER_SUMMARY = {
  orders: 5120,
  hold: 1,
  pending: 0,
  cancel: 852,
  rts: 47,
  picked: 4220,
  shipped: 173,
  delivery: { count: 2513, pct: '62.80' },
  rto: { count: 1012, pct: '23.98' },
  ret: { count: 522, pct: '17.20' },
};

const STATUS_COLOR = {
  SHIPPED: 'text-blue-600',
  DELIVERED: 'text-green-600',
  RTO: 'font-bold text-red-600',
  CANCELLED: 'text-slate-500',
  RETURNED: 'text-orange-600',
};

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

function FilterBar({ search, setSearch, searchRef, navigate, accountName }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm shrink-0 flex-wrap">
      <h1 className="text-sm font-extrabold tracking-wide text-slate-900">
        All Received Orders - <span className="text-indigo-600">{accountName}</span>
      </h1>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700">
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
            className="w-52 rounded-xl border border-slate-300 bg-white py-2 pl-7 pr-7 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
  );
}

export default function AllOrders() {
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
      const res = await api.get('/orders-list/', { params: { from_date: fromDate, to_date: toDate } });
      const list = res.data?.data || res.data || [];
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
      (o.order_status || '').toLowerCase().includes(q) ||
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
    {
      key: 'order_status',
      label: 'Order Status',
      className: (row, isSelected) => `font-bold ${isSelected ? 'text-slate-900' : STATUS_COLOR[row.order_status] || 'text-slate-600'}`,
    },
    { key: 'pickup_date', label: 'Pickup Date (F3)', className: () => 'text-slate-600' },
    { key: 'pickup_awb', label: 'Pickup AWB (F4)', className: () => 'text-sky-600' },
    { key: 'courier', label: 'Pick-Up Courier', className: (_, isSelected) => `font-semibold ${isSelected ? 'text-slate-900' : 'text-amber-600'}` },
    { key: 'packet_qr', label: 'Packet QR (F5)', className: () => 'text-violet-600' },
    { key: 'selling', label: 'Selling', right: true, className: () => 'text-right font-bold text-slate-900' },
    { key: 'qty', label: 'Qty', right: true, className: () => 'text-right text-slate-600' },
    { key: 'payout', label: 'Payout', right: true, className: () => 'text-right font-bold text-emerald-600' },
    { key: 'cost', label: 'Cost', right: true, className: () => 'text-right text-slate-500' },
    { key: 'pl', label: 'P/L', right: true, className: (row) => `text-right font-bold ${row.pl >= 0 ? 'text-green-600' : 'text-red-600'}` },
  ];

  const footerActions = [
    { key: 'export', label: 'Export CSV', icon: FiDownload, className: 'bg-teal-600 text-white shadow-sm hover:bg-teal-700' },
    { key: 'analytics', label: 'Analytics', icon: MdOutlineBarChart, className: 'bg-purple-600 text-white shadow-sm hover:bg-purple-700' },
    {
      key: 'edit',
      label: 'Edit Order',
      icon: FiEdit2,
      disabled: !selectedId,
      className: selectedId ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' : 'cursor-not-allowed bg-slate-200 text-slate-400',
    },
    {
      key: 'delete',
      label: 'Delete Order',
      icon: FiTrash2,
      disabled: !selectedId,
      className: selectedId ? 'bg-red-600 text-white shadow-sm hover:bg-red-700' : 'cursor-not-allowed bg-slate-200 text-slate-400',
    },
    { key: 'pickup-files', label: 'Check Pickup Files', icon: FiFileText, className: 'bg-amber-500 text-white shadow-sm hover:bg-amber-600' },
    {
      key: 'details',
      label: 'Order Details',
      icon: FiInfo,
      disabled: !selectedId,
      className: selectedId ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' : 'cursor-not-allowed bg-slate-200 text-slate-400',
    },
    { key: 'refresh', label: 'Refresh', icon: FiRefreshCw, onClick: loadOrders, className: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' },
    { key: 'close', label: 'Close', icon: FiX, onClick: () => navigate('/dashboard'), className: 'ml-auto border border-slate-300 bg-white text-slate-700 hover:bg-slate-50' },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <FilterBar search={search} setSearch={setSearch} searchRef={searchRef} navigate={navigate} accountName={accountName} />

      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 shrink-0 flex-wrap">
        <span className="text-[0.7rem] font-semibold text-slate-500">Orders From Date</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setSelectedDateRange({ ...selectedDateRange, from: e.target.value })}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[0.78rem] text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <span className="text-[0.7rem] font-semibold text-slate-500">To Date</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setSelectedDateRange({ ...selectedDateRange, to: e.target.value })}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[0.78rem] text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          onClick={loadOrders}
          className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-[0.75rem] font-bold text-white transition-colors hover:bg-indigo-700 active:scale-95"
        >
          <FiCalendar size={11} /> Change Date (F2)
        </button>
        <div className="ml-auto text-[0.75rem] font-semibold text-slate-600">
          Total Rows - <span className="font-extrabold text-indigo-600">{filtered.length}</span>
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
                { key: 'count', label: 'Count', right: true, color: () => 'text-indigo-600 text-right font-bold' },
                { key: 'cost', label: 'Cost AMT', right: true, color: () => 'text-emerald-600 text-right font-semibold' },
              ]}
            />

            <SummaryTable
              {...summaryTableProps}
              title="Status Summary"
              rows={STATUS_SUMMARY}
              cols={[
                {
                  key: 'status',
                  label: 'Status',
                  color: (r) =>
                    r.status.startsWith('RTO') ? 'text-red-600 font-semibold' : r.status === 'DELIVERED' ? 'text-green-600 font-semibold' : 'text-slate-700',
                },
                { key: 'count', label: 'Count', right: true, color: () => 'text-indigo-600 text-right font-bold' },
                { key: 'cost', label: 'Cost AMT', right: true, color: () => 'text-emerald-600 text-right font-semibold' },
              ]}
            />

            <SummaryTable
              {...summaryTableProps}
              title="Courier Summary"
              rows={COURIER_SUMMARY}
              cols={[
                { key: 'courier', label: 'Courier', color: () => 'text-slate-700' },
                { key: 'pickup', label: 'Pickup', right: true, color: () => 'text-indigo-600 text-right font-bold' },
                { key: 'cost', label: 'Cost AMT', right: true, color: () => 'text-emerald-600 text-right font-semibold' },
              ]}
            />

            <div className="mx-2 mb-3 rounded-2xl border border-emerald-200 bg-emerald-50">
              <div className="rounded-t-2xl bg-emerald-600 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white">
                Orders Summary
              </div>
              <div className="grid grid-cols-3 gap-x-2 gap-y-2 p-3">
                {[
                  { l: 'ORDERS', v: ORDER_SUMMARY.orders, c: 'text-slate-900' },
                  { l: 'HOLD', v: ORDER_SUMMARY.hold, c: 'text-amber-500' },
                  { l: 'PENDING', v: ORDER_SUMMARY.pending, c: 'text-slate-500' },
                  { l: 'CANCEL', v: ORDER_SUMMARY.cancel, c: 'text-rose-600' },
                  { l: 'RTS', v: ORDER_SUMMARY.rts, c: 'text-blue-600' },
                  { l: 'PICKED', v: ORDER_SUMMARY.picked, c: 'text-emerald-600' },
                ].map((r) => (
                  <div key={r.l} className="flex flex-col items-center">
                    <span className="text-[0.55rem] text-slate-500">{r.l}</span>
                    <span className={`text-[0.75rem] font-extrabold ${r.c}`}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 px-3 pb-3">
                {[
                  { l: 'SHIPPED', v: ORDER_SUMMARY.shipped },
                  { l: `DELIVERY (${ORDER_SUMMARY.delivery.pct}%)`, v: ORDER_SUMMARY.delivery.count, c: 'text-green-600' },
                  { l: `RTO (${ORDER_SUMMARY.rto.pct}%)`, v: ORDER_SUMMARY.rto.count, c: 'text-red-600' },
                  { l: `RETURN (${ORDER_SUMMARY.ret.pct}%)`, v: ORDER_SUMMARY.ret.count, c: 'text-orange-600' },
                ].map((r) => (
                  <div key={r.l} className="flex items-center justify-between border-t border-emerald-200 pt-2">
                    <span className="text-[0.55rem] text-slate-500">{r.l}</span>
                    <span className={`text-[0.7rem] font-extrabold ${r.c || 'text-blue-600'}`}>{r.v}</span>
                  </div>
                ))}
              </div>
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
              loadingText="Loading orders..."
              emptyText="No orders found."
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
              onRowDoubleClick={(row) => setSelectedId(row.id)}
              onSort={handleSort}
              sortKey={sortKey}
              sortDir={sortDir}
              wrapperClassName="h-full"
            />
          </div>

          <OrdersActionBar variant="light" actions={footerActions} />
        </div>
      </div>
    </div>
  );
}
