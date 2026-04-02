import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiDownload,
  FiFilter,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiTruck,
  FiX,
} from 'react-icons/fi';
import { MdOutlineBarChart } from 'react-icons/md';
import DataTable from '../../components/ui/DataTable';
import OrdersActionBar from '../../components/ui/OrdersActionBar';
import SummaryTable from '../../components/ui/SummaryTable';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DEMO_ORDERS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  order_number: `172${2661023640 + i * 19}_${i + 1}`,
  order_date: `${String(Math.min(30, (i % 9) + 1)).padStart(2, '0')}/07/2025`,
  order_status: i % 3 === 0 ? 'CUSTOMER RETURN' : 'RTO',
  create_date: '09/07/2025',
  days: i % 3,
  exp_date: i % 3 === 0 ? '27/07/2025' : '24/07/2025',
  courier: ['PocketShip', 'Valmo', 'Shadowfax', 'Delhivery', 'Xpress Bees', 'Ecom Express'][i % 6],
  awb_number: `VL008152${String(42000 + i * 13).padStart(5, '0')}`,
  sku_id: ['STR-Green-Chiku@', 'SQ_PINK', 'SQ_Black[Pan]@Q:', 'Anya_Black@', 'BoXX-Black_Black', 'Butterfly_Rust'][i % 6],
}));

const RETURN_TYPE_SUMMARY = [
  { type: 'RTO', count: 110, cost: '27430.00' },
  { type: 'CUSTOMER RETU', count: 14, cost: '10375.00' },
];

const COURIER_SUMMARY = [
  { courier: 'PocketShip', count: 96, cost: '23950.00' },
  { courier: 'Valmo', count: 16, cost: '4015.00' },
  { courier: 'Shadowfax', count: 14, cost: '3540.00' },
  { courier: 'Delhivery', count: 14, cost: '3660.00' },
  { courier: 'Xpress Bees', count: 9, cost: '2385.00' },
  { courier: 'Ecom Express', count: 1, cost: '255.00' },
];

const RECOVERY = {
  customer: { pending: { count: 38, amt: '0.00 Rs.' }, paid: { count: 2, amt: '-328.00 Rs.' } },
  rto: { pending: { count: 4, amt: '0.00 Rs.' }, paid: { count: 0, amt: '0.00 Rs.' } },
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

function RecoveryBox({ title, data, colorClass, accentClass }) {
  return (
    <div className={`mx-2 mb-3 overflow-hidden rounded-2xl border ${colorClass} bg-white shadow-sm`}>
      <div className={`px-3 py-2 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-slate-700 ${accentClass}`}>{title}</div>
      <div className="flex divide-x divide-slate-200">
        <div className="flex-1 px-1 py-2 text-center">
          <div className="text-[0.55rem] font-semibold text-slate-500">Pending</div>
          <div className="text-sm font-extrabold text-amber-500">{data.pending.count}</div>
          <div className="text-[0.6rem] text-slate-500">{data.pending.amt}</div>
        </div>
        <div className="flex-1 px-1 py-2 text-center">
          <div className="text-[0.55rem] font-semibold text-slate-500">Paid</div>
          <div className="text-sm font-extrabold text-emerald-600">{data.paid.count}</div>
          <div className="text-[0.6rem] text-rose-500">{data.paid.amt}</div>
        </div>
      </div>
    </div>
  );
}

export default function ReturnInTransit() {
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
        params: { from_date: fromDate, to_date: toDate, status: 'RETURN_IN_TRANSIT' },
      });
      const raw = res.data?.data || res.data || [];
      const list = raw.filter((o) =>
        ['RTO', 'CUSTOMER RETURN', 'RETURN_IN_TRANSIT', 'IN_TRANSIT'].includes((o.order_status || '').toUpperCase())
      );
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
      (o.awb_number || '').toLowerCase().includes(q) ||
      (o.sku_id || '').toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const va = a[sortKey] ?? '';
    const vb = b[sortKey] ?? '';
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const statusStyle = (status = '') => {
    const s = status.toUpperCase();
    if (s === 'RTO') return 'font-extrabold text-red-600';
    if (s.includes('CUSTOMER')) return 'font-bold text-orange-600';
    return 'text-slate-600';
  };

  const columns = [
    { key: 'order_number', label: 'Order Number (F1)', className: () => 'font-bold text-indigo-600' },
    { key: 'order_date', label: 'Order Date (F2)', className: () => 'text-slate-600' },
    { key: 'order_status', label: 'Order Status', className: (row, isSelected) => `font-bold ${isSelected ? 'text-slate-900' : statusStyle(row.order_status)}` },
    { key: 'create_date', label: 'Create Date (F3)', className: () => 'text-slate-600' },
    {
      key: 'days',
      label: 'Days',
      right: true,
      className: (row, isSelected) =>
        `text-right font-bold ${isSelected ? 'text-slate-900' : row.days === 0 ? 'text-green-600' : row.days >= 2 ? 'text-red-600' : 'text-amber-500'}`,
    },
    { key: 'exp_date', label: 'Exp. Date (F4)', className: () => 'text-slate-600' },
    { key: 'courier', label: 'Courier', className: (_, isSelected) => `font-semibold ${isSelected ? 'text-slate-900' : 'text-amber-600'}` },
    { key: 'awb_number', label: 'AWB Number (F5)', className: () => 'text-sky-600' },
    { key: 'sku_id', label: 'SKU ID (F6)', className: (_, isSelected) => (isSelected ? 'text-slate-900' : 'text-violet-600') },
  ];

  const footerActions = [
    { key: 'export', label: 'Export CSV', icon: FiDownload, className: 'bg-teal-600 text-white shadow-sm hover:bg-teal-700' },
    { key: 'analytics', label: 'Analytics', icon: MdOutlineBarChart, className: 'bg-purple-600 text-white shadow-sm hover:bg-purple-700' },
    { key: 'track', label: 'Track Courier', icon: FiTruck, disabled: !selectedId, className: selectedId ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' : 'cursor-not-allowed bg-slate-200 text-slate-400' },
    { key: 'details', label: 'Order Details', icon: FiInfo, disabled: !selectedId, className: selectedId ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' : 'cursor-not-allowed bg-slate-200 text-slate-400' },
    { key: 'refresh', label: 'Refresh', icon: FiRefreshCw, onClick: loadOrders, className: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700' },
    { key: 'close', label: 'Close', icon: FiX, onClick: () => navigate('/dashboard'), className: 'ml-auto border border-slate-300 bg-white text-slate-700 hover:bg-slate-50' },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm shrink-0 flex-wrap">
        <h1 className="text-sm font-extrabold tracking-wide text-slate-900">
          Returns in transit - <span className="text-orange-600">{accountName}</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs text-orange-700">
            <span className="font-semibold">Search On Order Number (F1) -&gt;</span>
          </div>
          <div className="relative">
            <FiSearch size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="(F1) Search..."
              className="w-52 rounded-xl border border-slate-300 bg-white py-2 pl-7 pr-7 text-xs text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {search && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setSearch('')}>
                <FiX size={12} />
              </button>
            )}
          </div>
          <div className="whitespace-nowrap text-[0.75rem] font-semibold text-slate-600">
            Total Rows - <span className="font-extrabold text-orange-600">{filtered.length}</span>
            <span className="text-slate-400"> / {orders.length}</span>
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
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[0.78rem] text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <span className="text-[0.7rem] font-semibold text-slate-500">To Date</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setSelectedDateRange({ ...selectedDateRange, to: e.target.value })}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[0.78rem] text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <button
          onClick={loadOrders}
          className="flex items-center gap-1 rounded-xl bg-orange-600 px-3 py-2 text-[0.75rem] font-bold text-white transition-colors hover:bg-orange-700 active:scale-95"
        >
          <FiCalendar size={11} /> Change Date (F2)
        </button>
        <button
          className="ml-auto rounded-xl border border-slate-300 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100"
          onClick={() => setLeftOpen((o) => !o)}
          title="Toggle left panel"
        >
          <FiFilter size={12} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {leftOpen && (
          <div className="flex min-h-0 w-full flex-col justify-between overflow-y-auto border-b border-slate-200 bg-white md:w-[250px] md:min-w-[250px] md:flex-shrink-0 md:border-b-0 md:border-r [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
            <div>
              <SummaryTable
                {...summaryTableProps}
                title="Return Type"
                rows={RETURN_TYPE_SUMMARY}
                cols={[
                  {
                    key: 'type',
                    label: 'Return Type',
                    color: (r) => (r.type === 'RTO' ? 'font-bold text-red-600' : 'font-bold text-orange-600'),
                  },
                  { key: 'count', label: 'Count', right: true, color: () => 'text-orange-600 text-right font-bold' },
                  { key: 'cost', label: 'Cost AMT', right: true, color: () => 'text-emerald-600 text-right font-semibold' },
                ]}
              />

              <SummaryTable
                {...summaryTableProps}
                title="Courier"
                rows={COURIER_SUMMARY}
                cols={[
                  { key: 'courier', label: 'Courier', color: () => 'text-slate-700' },
                  { key: 'count', label: 'Count', right: true, color: () => 'text-orange-600 text-right font-bold' },
                  { key: 'cost', label: 'Cost AMT', right: true, color: () => 'text-emerald-600 text-right font-semibold' },
                ]}
              />
            </div>

            <div>
              <RecoveryBox
                title="Customer Return Recovery"
                data={RECOVERY.customer}
                colorClass="border-orange-200"
                accentClass="bg-orange-50"
              />
              <RecoveryBox title="RTO Return Recovery" data={RECOVERY.rto} colorClass="border-rose-200" accentClass="bg-rose-50" />
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
              loadingText="Loading returns in transit..."
              emptyText="No return-in-transit orders found."
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
              onSort={handleSort}
              sortKey={sortKey}
              sortDir={sortDir}
              wrapperClassName="h-full"
              selectedClass="bg-orange-50 text-slate-900"
            />
          </div>

          <OrdersActionBar variant="light" actions={footerActions} />
        </div>
      </div>
    </div>
  );
}
