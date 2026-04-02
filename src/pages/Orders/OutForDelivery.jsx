import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import OrdersActionBar from '../../components/ui/OrdersActionBar';
import SummaryTable from '../../components/ui/SummaryTable';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const DEMO_ORDERS = [
  {
    id: 1,
    order_number: '165797417378754308_1',
    order_date: '15/06/2025',
    order_status: 'CUSTOMER RETURN',
    create_date: '28/06/2025',
    days: 12,
    exp_date: '16/07/2025',
    courier: 'Xpress Bees',
    attempts: 2,
    awb_number: '234095363629404',
    sku_id: 'STR_Royal & Orange_Black(2)',
    cost_amt: '430.00',
  },
  {
    id: 2,
    order_number: '168565730373522944_1',
    order_date: '23/06/2025',
    order_status: 'RTO',
    create_date: '30/06/2025',
    days: 10,
    exp_date: '15/07/2025',
    courier: 'Shadowfax',
    attempts: 1,
    awb_number: 'SF1818550259FPL',
    sku_id: 'SQ_Black(Pan)B',
    cost_amt: '255.00',
  },
];

const RETURN_TYPE_SUMMARY = [
  { type: 'RTO', count: 1, amount: '255.00' },
  { type: 'CUSTOMER RETU', count: 1, amount: '430.00' },
];

const COURIER_SUMMARY = [
  { courier: 'Xpress Bees', count: 1, amount: '430.00' },
  { courier: 'Shadowfax', count: 1, amount: '255.00' },
];

const RECOVERY = {
  customer: { pending: 0, pendingAmt: '0.00 Rs.', paid: 1, paidAmt: '-165.00 Rs.' },
  rto: { pending: 0, pendingAmt: '0.00 Rs.', paid: 1, paidAmt: '1.00 Rs.' },
};

function RecoveryCard({ title, data }) {
  return (
    <div className="border border-[#d7d7d7] bg-white">
      <div className="border-b border-[#e6e6e6] px-1.5 py-1 text-[11px] font-semibold text-[#b15454]">
        {title}
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#e6e6e6]">
        <div className="px-1 py-1 text-center">
          <div className="text-[10px] font-semibold text-[#666]">Pending</div>
          <div className="text-[22px] leading-none text-[#777]">{data.pending}</div>
          <div className="mt-1 text-[10px] text-[#777]">{data.pendingAmt}</div>
        </div>
        <div className="px-1 py-1 text-center">
          <div className="text-[10px] font-semibold text-[#666]">Paid</div>
          <div className="text-[22px] leading-none text-[#777]">{data.paid}</div>
          <div className="mt-1 text-[10px] text-[#777]">{data.paidAmt}</div>
        </div>
      </div>
    </div>
  );
}

export default function OutForDelivery() {
  const navigate = useNavigate();
  const { activeAccount, selectedDateRange, setSelectedDateRange } = useAuth();
  const searchRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [sortKey, setSortKey] = useState('order_date');
  const [sortDir, setSortDir] = useState('desc');
  const [leftOpen, setLeftOpen] = useState(true);
  const fromDate = selectedDateRange.from;
  const toDate = selectedDateRange.to;
  const accountName = activeAccount?.account_name || 'No account selected';

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders-list/', {
        params: { from_date: fromDate, to_date: toDate, status: 'OUT_FOR_DELIVERY' },
      });
      const raw = res.data?.data || res.data || [];
      const list = raw.filter((o) =>
        ['CUSTOMER RETURN', 'RTO', 'OUT FOR DELIVERY', 'OUT_FOR_DELIVERY', 'OFD'].includes(
          (o.order_status || '').toUpperCase()
        )
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
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) =>
      [
        order.order_number,
        order.order_status,
        order.courier,
        order.awb_number,
        order.sku_id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [orders, search]);

  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    list.sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredOrders, sortDir, sortKey]);

  const columns = [
    { key: 'order_number', label: 'Order Number (F1)', className: () => 'text-[#5a9ea7] font-semibold' },
    { key: 'order_date', label: 'Order Date (F2)', className: () => 'text-[#555]' },
    {
      key: 'order_status',
      label: 'Order Status',
      className: (_, isSelected) => (isSelected ? 'text-[#222] font-semibold' : 'text-[#5a9ea7] font-semibold'),
    },
    { key: 'create_date', label: 'Create Date (F3)', className: () => 'text-[#555]' },
    {
      key: 'days',
      label: 'Days',
      right: true,
      className: (_, isSelected) => (isSelected ? 'text-right text-[#222]' : 'text-right text-[#5a9ea7]'),
    },
    { key: 'exp_date', label: 'Exp. Date (F4)', className: () => 'text-[#555]' },
    { key: 'courier', label: 'Courier', className: () => 'text-[#555]' },
    { key: 'attempts', label: 'Attempt', right: true, className: () => 'text-right text-[#555]' },
    { key: 'awb_number', label: 'AWB Number (F5)', className: () => 'text-[#555]' },
    { key: 'sku_id', label: 'SKU ID (F6)', className: () => 'text-[#555]' },
  ];

  return (
    <div className="min-h-screen bg-[#ececec] text-[#333]">
      <div className="mx-auto flex min-h-screen w-full flex-col border-x border-[#d0d0d0] bg-[#f5f5e8]">
        <div className="border-b border-[#d8d8d8] bg-[#f4f4f4]">
          <div className="flex flex-col gap-2 px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="bg-[#e31d1d] px-2 py-0.5 text-[13px] font-bold leading-none text-white sm:text-[14px]">
              Out For Delivery Returns - {accountName}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#d14f4f]">
              <span>Search On Order Number (F1) -</span>
              <div className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
                <FiSearch size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 w-full border border-[#d8d8d8] bg-white pl-7 pr-7 text-[12px] text-[#333] outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#444]"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>
              <Button className="border border-[#d8d8d8] bg-white px-2 py-0.5 text-[12px] text-[#333] hover:bg-[#f0f0f0]" onClick={() => navigate('/dashboard')}>
                <FiX size={14} /> 
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#dddddd] px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
              <span className="font-semibold text-[#666]">Orders From Date</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setSelectedDateRange({ ...selectedDateRange, from: e.target.value })}
                className="h-6 border border-[#d8d8d8] bg-white px-1 text-[12px] text-[#d14f4f] outline-none"
              />
              <span className="font-semibold text-[#666]">To Date</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setSelectedDateRange({ ...selectedDateRange, to: e.target.value })}
                className="h-6 border border-[#d8d8d8] bg-white px-1 text-[12px] text-[#d14f4f] outline-none"
              />
              <button
                onClick={loadOrders}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5977c4] hover:underline"
              >
                <FiCalendar size={12} />
                Change Date ( F2 )
              </button>
              <button
                onClick={() => setLeftOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5977c4] hover:underline xl:hidden"
              >
                <FiFilter size={12} />
                {leftOpen ? 'Hide Summary' : 'Show Summary'}
              </button>
            </div>
            <div className="text-right text-[12px] font-semibold text-[#d14f4f]">
              Total Rows - {filteredOrders.length}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col xl:flex-row">
          {leftOpen && (
            <aside className="min-h-0 w-full shrink-0 flex flex-wrap flex-col justify-between border-b border-[#d8d8d8] bg-[#d8e5ec] xl:w-[250px] xl:min-w-[250px] xl:border-b-0 xl:border-r xl:overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
              <div className="p-1">
                <SummaryTable
                  title="Return Type"
                  rows={RETURN_TYPE_SUMMARY}
                  cols={[
                    { key: 'type', label: 'Return Type', color: () => 'text-[#48646d]' },
                    { key: 'count', label: 'Count', right: true, color: () => 'text-right text-[#555]' },
                    { key: 'amount', label: 'Cost AMT', right: true, color: () => 'text-right text-[#555]' },
                  ]}
                  containerClassName="mb-1"
                  titleClassName="bg-[#f3ddb9] px-1.5 py-1 text-[11px] font-semibold text-[#6e543a]"
                  tableClassName="w-full text-[11px]"
                  bodyWrapperClassName="max-h-56"
                  headRowClassName="bg-[#f3ddb9] text-[#6e543a]"
                  headerCellClassName="px-1.5 py-1 text-left font-semibold whitespace-nowrap"
                  rowClassName={() => 'border-b border-[#d1dde3] bg-transparent'}
                  cellClassName="px-1.5 py-1 whitespace-nowrap"
                  hoverClass="hover:bg-[#cbd8e0]"
                />

                <SummaryTable
                  title="Courier"
                  rows={COURIER_SUMMARY}
                  cols={[
                    { key: 'courier', label: 'Courier', color: () => 'text-[#48646d]' },
                    { key: 'count', label: 'Count', right: true, color: () => 'text-right text-[#555]' },
                    { key: 'amount', label: 'Cost AMT', right: true, color: () => 'text-right text-[#555]' },
                  ]}
                  containerClassName="mb-1"
                  titleClassName="bg-[#f3ddb9] px-1.5 py-1 text-[11px] font-semibold text-[#6e543a]"
                  tableClassName="w-full text-[11px]"
                  bodyWrapperClassName="max-h-56"
                  headRowClassName="bg-[#f3ddb9] text-[#6e543a]"
                  headerCellClassName="px-1.5 py-1 text-left font-semibold whitespace-nowrap"
                  rowClassName={() => 'border-b border-[#d1dde3] bg-transparent'}
                  cellClassName="px-1.5 py-1 whitespace-nowrap"
                  hoverClass="hover:bg-[#cbd8e0]"
                />
              </div>
              <div className="p-1">
                <div className="mt-6 space-y-1">
                  <RecoveryCard title="Customer return recovery" data={RECOVERY.customer} />
                  <RecoveryCard title="RTO return recovery" data={RECOVERY.rto} />
                </div>
              </div>
            </aside>
          )}

          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-auto bg-[#f7f6df] p-2 md:p-3">
              <div className="h-full overflow-hidden rounded-2xl border border-[#d0d0d0] bg-[#f7f6df]">
                <DataTable
                  columns={columns}
                  data={sortedOrders}
                  loading={loading}
                  loadingText="Loading out for delivery returns..."
                  emptyText="No out for delivery returns found."
                  mobileCardView={false}
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  wrapperClassName="h-full rounded-none border-0 bg-transparent shadow-none"
                  tableClassName="min-w-[980px] bg-[#f7f6df] text-[12px] text-[#444]"
                  headClassName="sticky top-0 z-10 bg-[#f3ddb9] text-[#6e543a]"
                  headerCellClassName="px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                  indexHeaderClassName="px-1.5 py-1.5 text-[11px] font-semibold w-8 text-center"
                  indexCellClassName="px-1.5 py-1 text-center text-[#666]"
                  cellClassName="px-2 py-1 whitespace-nowrap"
                  emptyCellClassName="py-20 text-center text-[#777] italic text-xs"
                  rowClassName={() => 'border-b border-[#e3dfcb]'}
                  selectedClass="bg-[#9fa2a2] text-[#1f1f1f]"
                  hoverClass="hover:bg-[#eee8cd]"
                />
              </div>
            </div>

            <OrdersActionBar
              actions={[
                { key: 'export', label: 'Export CSV', icon: FiDownload },
                { key: 'analytics', label: 'Analytics', icon: MdOutlineBarChart },
                { key: 'spacer-1', type: 'spacer' },
                { key: 'spacer-2', type: 'spacer' },
                { key: 'track', label: 'Track Courier', icon: FiTruck },
                { key: 'details', label: 'Order Details', icon: FiInfo },
                { key: 'refresh', label: 'Refresh', icon: FiRefreshCw, onClick: loadOrders },
                { key: 'close', label: 'Close', icon: FiX, onClick: () => navigate('/dashboard') },
              ]}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
