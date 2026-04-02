import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDownload,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { MdOutlineBarChart } from 'react-icons/md';
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import OrdersActionBar from '../../components/ui/OrdersActionBar';
import SummaryTable from '../../components/ui/SummaryTable';
import { useAuth } from '../../context/AuthContext';

const DEMO_ORDERS = [
  {
    id: 1,
    order_number: '166202193874227776_1',
    order_date: '16/06/2025',
    order_status: 'CUSTOMER RETURN',
    receive_scan_time: '08/07/2025 02:31:32 PM',
    days: 22,
    awb_number: 'R1294000720FPL',
    courier: 'Shadowfax',
    selling: '320.00',
    qty: 1,
    payout: '-169.30',
    claim: '0.00',
  },
  {
    id: 2,
    order_number: '166607473703748736_1',
    order_date: '17/06/2025',
    order_status: 'CUSTOMER RETURN',
    receive_scan_time: '08/07/2025 02:29:51 PM',
    days: 21,
    awb_number: 'R1300270498FPL',
    courier: 'Shadowfax',
    selling: '249.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
  },
  {
    id: 3,
    order_number: '16926380916325376_1',
    order_date: '25/06/2025',
    order_status: 'RTO',
    receive_scan_time: '08/07/2025 02:29:45 PM',
    days: 13,
    awb_number: 'SF1822223507FPL',
    courier: 'Shadowfax',
    selling: '320.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
  },
  {
    id: 4,
    order_number: '16799827634222088_1',
    order_date: '21/06/2025',
    order_status: 'RTO',
    receive_scan_time: '08/07/2025 02:29:37 PM',
    days: 17,
    awb_number: 'VL0081426179012',
    courier: 'PocketShip',
    selling: '359.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
  },
  {
    id: 5,
    order_number: '167588138184180800_1',
    order_date: '20/06/2025',
    order_status: 'RTO',
    receive_scan_time: '08/07/2025 02:28:44 PM',
    days: 18,
    awb_number: 'SF1810106695FPL',
    courier: 'Shadowfax',
    selling: '499.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
  },
  {
    id: 6,
    order_number: '170089410791574912_1',
    order_date: '27/06/2025',
    order_status: 'RTO',
    receive_scan_time: '08/07/2025 02:28:41 PM',
    days: 11,
    awb_number: 'VL0081477581805',
    courier: 'PocketShip',
    selling: '310.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
  },
];

const RETURN_TYPE_SUMMARY = [
  { type: 'RTO', count: 888, amount: '224750.00' },
  { type: 'CUSTOMER RE', count: 471, amount: '125235.00' },
  { type: 'DELIVERED', count: 56, amount: '13870.00' },
  { type: 'CANCELLED', count: 52, amount: '13750.00' },
];

const COURIER_SUMMARY = [
  { courier: 'PocketShip', count: 688, amount: '174425.00' },
  { courier: 'Shadowfax', count: 263, amount: '69180.00' },
  { courier: 'Valmo', count: 229, amount: '60555.00' },
  { courier: 'Delhivery', count: 139, amount: '35365.00' },
  { courier: 'Xpress Bees', count: 55, amount: '14940.00' },
];

const DATE_WISE_SUMMARY = [
  { date: '08/07/2025', count: 32, amount: '7270.00' },
  { date: '07/07/2025', count: 8, amount: '1935.00' },
  { date: '05/07/2025', count: 7, amount: '1770.00' },
];

const BOX_STATS = {
  wrongRec: { value: 3, amount: '865.00 Rs.' },
  claimRec: { value: 3, amount: '865.00 Rs.' },
  customerRecovery: {
    pending: 15,
    pendingAmt: '-2532.00 Rs.(Apx)',
    paid: 456,
    paidAmt: '-71697.44 Rs.',
  },
  rtoRecovery: {
    pending: 6,
    pendingAmt: '0.00 Rs.',
    paid: 882,
    paidAmt: '0.00 Rs.',
  },
  paidCharges: {
    max: '-406.00',
    min: '164.37',
    avg: '-168.80',
  },
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

function PaidChargesCard({ data }) {
  return (
    <div className="border border-[#d7d7d7] bg-white">
      <div className="border-b border-[#e6e6e6] px-1.5 py-1 text-[11px] font-semibold text-[#c86262]">
        Paid return charges
      </div>
      <div className="grid grid-cols-3 divide-x divide-[#e6e6e6]">
        {[
          { label: 'Max', value: data.max, color: '#d95858' },
          { label: 'Min', value: data.min, color: '#4da468' },
          { label: 'Avg', value: data.avg, color: '#6d6d6d' },
        ].map((item) => (
          <div key={item.label} className="px-1 py-1 text-center">
            <div className="text-[10px] font-semibold text-[#666]">{item.label}</div>
            <div className="mt-1 text-[17px] leading-none" style={{ color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReceivedReturns() {
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
        params: { from_date: fromDate, to_date: toDate, status: 'RETURN_RECEIVED' },
      });
      const raw = res.data?.data || res.data || [];
      const list = raw.filter((o) =>
        ['RETURN RECEIVED', 'RETURN_RECEIVED', 'CUSTOMER RETURN', 'RTO', 'DELIVERED', 'CANCELLED'].includes(
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
    { key: 'receive_scan_time', label: 'Receive Scan Time (F3)', className: () => 'text-[#555]' },
    {
      key: 'days',
      label: 'Days',
      right: true,
      className: (_, isSelected) => (isSelected ? 'text-right text-[#222]' : 'text-right text-[#5a9ea7]'),
    },
    { key: 'awb_number', label: 'AWB Number (F4)', className: () => 'text-[#555]' },
    { key: 'courier', label: 'Courier', className: () => 'text-[#555]' },
    { key: 'selling', label: 'Selling', right: true, className: () => 'text-right text-[#555]' },
    { key: 'qty', label: 'Qty.', right: true, className: () => 'text-right text-[#555]' },
    { key: 'payout', label: 'Payout', right: true, className: () => 'text-right text-[#555]' },
    { key: 'claim', label: 'Claim', right: true, className: () => 'text-right text-[#555]' },
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
          <div className="flex flex-col gap-2 px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="bg-[#e31d1d] px-2 py-0.5 text-[13px] font-bold leading-none text-white sm:text-[14px]">
              Received Returns - {accountName}
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
              Total Rows - {filteredOrders.length} / 1467
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col xl:flex-row">
          {leftOpen && (
            <aside className="w-full shrink-0 border-b border-[#d8d8d8] bg-[#d8e5ec] xl:w-[210px] xl:border-b-0 xl:border-r">
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
                  title="Date Wise"
                  rows={DATE_WISE_SUMMARY}
                  cols={[
                    { key: 'date', label: 'Date Wise', color: () => 'text-[#48646d]' },
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

                <SmallStatCard
                  title="Wrong Rec."
                  leftLabel="Wrong Rec."
                  leftValue={BOX_STATS.wrongRec.value}
                  leftAmount={BOX_STATS.wrongRec.amount}
                  rightLabel="Claim Rec."
                  rightValue={BOX_STATS.claimRec.value}
                  rightAmount={BOX_STATS.claimRec.amount}
                  accent="#d95a5a"
                />

                <div className="mt-1">
                  <SmallStatCard
                    title="Customer return recovery"
                    leftLabel="Pending"
                    leftValue={BOX_STATS.customerRecovery.pending}
                    leftAmount={BOX_STATS.customerRecovery.pendingAmt}
                    rightLabel="Paid"
                    rightValue={BOX_STATS.customerRecovery.paid}
                    rightAmount={BOX_STATS.customerRecovery.paidAmt}
                    accent="#c86262"
                  />
                </div>

                <div className="mt-1">
                  <SmallStatCard
                    title="RTO return recovery"
                    leftLabel="Pending"
                    leftValue={BOX_STATS.rtoRecovery.pending}
                    leftAmount={BOX_STATS.rtoRecovery.pendingAmt}
                    rightLabel="Paid"
                    rightValue={BOX_STATS.rtoRecovery.paid}
                    rightAmount={BOX_STATS.rtoRecovery.paidAmt}
                    accent="#c86262"
                  />
                </div>

                <div className="mt-1">
                  <PaidChargesCard data={BOX_STATS.paidCharges} />
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
                  loading={loading}
                  loadingText="Loading received returns..."
                  emptyText="No received returns found."
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  wrapperClassName="h-full"
                  tableClassName="min-w-[1250px] bg-[#f7f6df] text-[12px] text-[#444]"
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
                { key: 'track-pod', label: 'Track POD' },
                { key: 'delete', label: 'Delete Received' },
                { key: 'condition', label: 'Change Return Condition' },
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
