import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDownload,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { MdOutlineBarChart } from 'react-icons/md';
import DataTable from '../../components/ui/DataTable';
import OrdersActionBar from '../../components/ui/OrdersActionBar';
import SummaryTable from '../../components/ui/SummaryTable';
import { useAuth } from '../../context/AuthContext';

const DEMO_ORDERS = [
  {
    id: 1,
    order_number: 'RM172845001_1',
    order_date: '24/06/2025',
    days: 3,
    order_status: 'RETURN MISMATCH',
    pickup_date: '28/06/2025',
    pickup_courier: 'Shadowfax',
    pickup_awb: 'SF1825543901FPL',
    sku_id: 'SQ_Black(Pan)',
    size: 'M',
  },
  {
    id: 2,
    order_number: 'RM172845002_1',
    order_date: '26/06/2025',
    days: 2,
    order_status: 'RETURN MISMATCH',
    pickup_date: '29/06/2025',
    pickup_courier: 'PocketShip',
    pickup_awb: 'VL0081454022331',
    sku_id: 'BoXX-Black',
    size: 'XL',
  },
];

const RETURN_TYPE_SUMMARY = [
  { type: 'MISMATCH', count: 5, amount: '1940.00' },
];

const COURIER_SUMMARY = [
  { courier: 'Shadowfax', count: 2, amount: '820.00' },
  { courier: 'PocketShip', count: 2, amount: '760.00' },
  { courier: 'Xpress Bees', count: 1, amount: '360.00' },
];

const RECOVERY = {
  customer: { pending: 0, pendingAmt: '0.00 Rs.', paid: 0, paidAmt: '0.00 Rs.' },
  rto: { pending: 0, pendingAmt: '0.00 Rs.', paid: 0, paidAmt: '0.00 Rs.' },
};

function SmallStatCard({ title, leftLabel, leftValue, leftAmount, rightLabel, rightValue, rightAmount, accent = '#c86262' }) {
  return (
    <div className="border border-[#d7d7d7] bg-white">
      <div className="border-b border-[#e6e6e6] px-1.5 py-1 text-[11px] font-semibold" style={{ color: accent }}>
        {title}
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#e6e6e6]">
        <div className="px-1 py-1 text-center">
          <div className="text-[10px] font-semibold text-[#666]">{leftLabel}</div>
          <div className="text-[22px] leading-none text-[#777]">{leftValue}</div>
          <div className="mt-1 text-[10px] text-[#777]">{leftAmount}</div>
        </div>
        <div className="px-1 py-1 text-center">
          <div className="text-[10px] font-semibold text-[#666]">{rightLabel}</div>
          <div className="text-[22px] leading-none text-[#777]">{rightValue}</div>
          <div className="mt-1 text-[10px] text-[#777]">{rightAmount}</div>
        </div>
      </div>
    </div>
  );
}

export default function ReturnMismatch() {
  const navigate = useNavigate();
  const { activeAccount, selectedDateRange, setSelectedDateRange } = useAuth();
  const searchRef = useRef(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [sortKey, setSortKey] = useState('order_date');
  const [sortDir, setSortDir] = useState('desc');
  const [leftOpen, setLeftOpen] = useState(true);
  const fromDate = selectedDateRange.from;
  const toDate = selectedDateRange.to;
  const accountName = activeAccount?.account_name || 'No account selected';

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
    if (!query) return DEMO_ORDERS;

    return DEMO_ORDERS.filter((order) =>
      [
        order.order_number,
        order.order_status,
        order.pickup_courier,
        order.pickup_awb,
        order.sku_id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [search]);

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
      key: 'days',
      label: 'Days',
      right: true,
      className: (_, isSelected) => (isSelected ? 'text-right text-[#222]' : 'text-right text-[#5a9ea7]'),
    },
    {
      key: 'order_status',
      label: 'Order Status',
      className: (_, isSelected) => (isSelected ? 'text-[#222] font-semibold' : 'text-[#5a9ea7] font-semibold'),
    },
    { key: 'pickup_date', label: 'Pickup Date (F4)', className: () => 'text-[#555]' },
    { key: 'pickup_courier', label: 'Pickup Courier', className: () => 'text-[#555]' },
    { key: 'pickup_awb', label: 'Pickup AWB (F5)', className: () => 'text-[#555]' },
    { key: 'sku_id', label: 'SKU ID (F6)', className: () => 'text-[#555]' },
    { key: 'size', label: 'Size (F7)', className: () => 'text-[#555]' },
  ];

  const summaryTitleClass = 'bg-[#f3ddb9] px-1.5 py-1 text-[11px] font-semibold text-[#6e543a]';
  const summaryTableClass = 'w-full text-[11px]';
  const summaryHeadClass = 'bg-[#f3ddb9] text-[#6e543a]';
  const summaryHeaderCellClass = 'px-1.5 py-1 text-left font-semibold whitespace-nowrap';
  const summaryRowClass = () => 'border-b border-[#d1dde3] bg-transparent';
  const summaryCellClass = 'px-1.5 py-1 whitespace-nowrap';

  return (
    <div className="min-h-screen bg-[#ececec] text-[#333]">
      <div className="mx-auto flex min-h-screen w-full flex-col border-x border-[#d0d0d0] bg-[#f5f5e8]">
        <div className="border-b border-[#d8d8d8] bg-[#f4f4f4]">
          <div className="flex flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="bg-[#e31d1d] px-2 py-0.5 text-[13px] font-bold leading-none text-white sm:text-[14px]">
              Return Mismatch - {accountName}
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
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#dddddd] px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
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
              <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5977c4] hover:underline">
                Change Date ( F2 )
              </button>
              <button
                onClick={() => setLeftOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5977c4] hover:underline xl:hidden"
              >
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
            <aside className="w-full flex flex-col flex-wrap justify-between shrink-0 border-b border-[#d8d8d8] bg-[#d8e5ec] xl:w-[210px] xl:border-b-0 xl:border-r">
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
                  titleClassName={summaryTitleClass}
                  tableClassName={summaryTableClass}
                  headRowClassName={summaryHeadClass}
                  headerCellClassName={summaryHeaderCellClass}
                  rowClassName={summaryRowClass}
                  cellClassName={summaryCellClass}
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
                  containerClassName="mb-2"
                  titleClassName={summaryTitleClass}
                  tableClassName={summaryTableClass}
                  headRowClassName={summaryHeadClass}
                  headerCellClassName={summaryHeaderCellClass}
                  rowClassName={summaryRowClass}
                  cellClassName={summaryCellClass}
                  hoverClass="hover:bg-[#cbd8e0]"
                />
              </div>

              <div className="p-1">
                <SmallStatCard
                  title="Customer return recovery"
                  leftLabel="Pending"
                  leftValue={RECOVERY.customer.pending}
                  leftAmount={RECOVERY.customer.pendingAmt}
                  rightLabel="Paid"
                  rightValue={RECOVERY.customer.paid}
                  rightAmount={RECOVERY.customer.paidAmt}
                />

                <div className="mt-1">
                  <SmallStatCard
                    title="RTO return recovery"
                    leftLabel="Pending"
                    leftValue={RECOVERY.rto.pending}
                    leftAmount={RECOVERY.rto.pendingAmt}
                    rightLabel="Paid"
                    rightValue={RECOVERY.rto.paid}
                    rightAmount={RECOVERY.rto.paidAmt}
                  />
                </div>
              </div>
            </aside>
          )}

          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-hidden bg-[#f7f6df]">
              <div className="overflow-hidden border-b border-[#d0d0d0]">
                <DataTable
                  mobileCardView={false}
                  columns={columns}
                  data={sortedOrders}
                  loading={false}
                  emptyText="No return mismatch records found."
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  wrapperClassName="h-full"
                  tableClassName="min-w-[1180px] bg-[#f7f6df] text-[12px] text-[#444]"
                  headClassName="sticky top-0 z-10 bg-[#f3ddb9] text-[#6e543a]"
                  headerCellClassName="px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                  indexHeaderClassName="px-1.5 py-1.5 text-[11px] font-semibold w-8 text-center"
                  indexCellClassName="px-1.5 py-1 text-center text-[#666]"
                  cellClassName="px-2 py-1 whitespace-nowrap"
                  emptyCellClassName="py-20 text-center text-[#777] italic text-xs"
                  rowClassName={() => 'border-b border-[#e3dfcb] cursor-pointer bg-transparent hover:bg-[#f0e8c9]'}
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
                { key: 'move', label: 'Move To Received' },
                { key: 'details', label: 'Order Details', icon: FiInfo },
                { key: 'refresh', label: 'Refresh', icon: FiRefreshCw },
                { key: 'close', label: 'Close', icon: FiX, onClick: () => navigate('/dashboard') },
              ]}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
