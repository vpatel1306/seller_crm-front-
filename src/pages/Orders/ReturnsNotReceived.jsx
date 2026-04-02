import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDownload,
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
import { useAuth } from '../../context/AuthContext';

const DEMO_ORDERS = [
  {
    id: 1,
    order_number: '169718611883834752_1',
    order_date: '26/06/2025',
    order_status: 'RTO',
    delivered_on_panel: '09/07/2025',
    days: 1,
    awb_number: 'VL0081465422203',
    courier: 'PocketShip',
    selling: '310.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
    sku_id: 'BoXX-B',
  },
  {
    id: 2,
    order_number: '168950489401296195_1',
    order_date: '24/06/2025',
    order_status: 'CUSTOMER RETURN',
    delivered_on_panel: '09/07/2025',
    days: 1,
    awb_number: 'R1300990320FPL',
    courier: 'Shadowfax',
    selling: '604.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
    sku_id: 'PQ7vI>',
  },
  {
    id: 3,
    order_number: '167854649591301440_1',
    order_date: '21/06/2025',
    order_status: 'CUSTOMER RETURN',
    delivered_on_panel: '09/07/2025',
    days: 1,
    awb_number: 'M00972862881',
    courier: 'Valmo',
    selling: '299.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
    sku_id: 'Star-M',
  },
  {
    id: 4,
    order_number: '165008426913793856_1',
    order_date: '13/06/2025',
    order_status: 'RTO',
    delivered_on_panel: '09/07/2025',
    days: 1,
    awb_number: 'VL0081358758345',
    courier: 'PocketShip',
    selling: '299.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
    sku_id: '6YhpQ',
  },
  {
    id: 5,
    order_number: '170446443768632832_1',
    order_date: '28/06/2025',
    order_status: 'RTO',
    delivered_on_panel: '09/07/2025',
    days: 1,
    awb_number: 'VL0081484013969',
    courier: 'PocketShip',
    selling: '310.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
    sku_id: 'BoXX-B',
  },
  {
    id: 6,
    order_number: '167090158769046976_1',
    order_date: '19/06/2025',
    order_status: 'RTO',
    delivered_on_panel: '09/07/2025',
    days: 1,
    awb_number: '149081461699823',
    courier: 'Delhivery',
    selling: '299.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
    sku_id: 'Star-Be',
  },
  {
    id: 7,
    order_number: '169055495183764864_1',
    order_date: '24/06/2025',
    order_status: 'RTO',
    delivered_on_panel: '09/07/2025',
    days: 1,
    awb_number: 'SF1822389439FPL',
    courier: 'Shadowfax',
    selling: '320.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
    sku_id: 'STR_Nz',
  },
  {
    id: 8,
    order_number: '169055584484691328_1',
    order_date: '24/06/2025',
    order_status: 'RTO',
    delivered_on_panel: '09/07/2025',
    days: 1,
    awb_number: 'SF1822389439FPL',
    courier: 'Shadowfax',
    selling: '320.00',
    qty: 1,
    payout: '0.00',
    claim: '0.00',
    sku_id: 'STR_Re',
  },
];

const RETURN_TYPE_SUMMARY = [
  { type: 'RTO', count: 13, amount: '3185.00' },
  { type: 'CUSTOMER RE', count: 10, amount: '2855.00' },
];

const COURIER_SUMMARY = [
  { courier: 'PocketShip', count: 8, amount: '2005.00' },
  { courier: 'Xpress Bees', count: 6, amount: '1395.00' },
  { courier: 'Shadowfax', count: 5, amount: '1570.00' },
  { courier: 'Delhivery', count: 3, amount: '855.00' },
  { courier: 'Valmo', count: 1, amount: '215.00' },
];

const DATE_WISE_SUMMARY = [
  { date: '09/07/2025', count: 12, amount: '3150.00' },
  { date: '08/07/2025', count: 5, amount: '1075.00' },
  { date: '05/07/2025', count: 1, amount: '320.00' },
  { date: '03/07/2025', count: 1, amount: '320.00' },
  { date: '21/06/2025', count: 1, amount: '320.00' },
  { date: '18/06/2025', count: 1, amount: '215.00' },
];

const BOX_STATS = {
  customerRecovery: {
    pending: 8,
    pendingAmt: '-1461.20 Rs.(Apx)',
    paid: 2,
    paidAmt: '-365.30 Rs.',
  },
  rtoRecovery: {
    pending: 0,
    pendingAmt: '0.00 Rs.',
    paid: 13,
    paidAmt: '0.00 Rs.',
  },
  paidCharges: {
    max: '-203.00',
    min: '-162.30',
    avg: '-182.65',
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

export default function ReturnsNotReceived() {
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
        params: { from_date: fromDate, to_date: toDate, status: 'RETURN_SCAN_PENDING' },
      });
      const raw = res.data?.data || res.data || [];
      const list = raw.filter((o) =>
        ['RETURN SCAN PENDING', 'RETURN_SCAN_PENDING', 'CUSTOMER RETURN', 'RTO'].includes(
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
    { key: 'delivered_on_panel', label: 'Delivered On Panel', className: () => 'text-[#555]' },
    {
      key: 'days',
      label: 'Days',
      right: true,
      className: (_, isSelected) => (isSelected ? 'text-right text-[#222]' : 'text-right text-[#5a9ea7]'),
    },
    { key: 'awb_number', label: 'AWB Number (F5)', className: () => 'text-[#555]' },
    { key: 'courier', label: 'Courier', className: () => 'text-[#555]' },
    { key: 'selling', label: 'Selling', right: true, className: () => 'text-right text-[#555]' },
    { key: 'qty', label: 'Qty.', right: true, className: () => 'text-right text-[#555]' },
    { key: 'payout', label: 'Payout', right: true, className: () => 'text-right text-[#555]' },
    { key: 'claim', label: 'Claim', right: true, className: () => 'text-right text-[#555]' },
    { key: 'sku_id', label: 'SKU ID', className: () => 'text-[#555]' },
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
              Returns Not Received - {accountName}
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
              Total Rows - {filteredOrders.length} / 23
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
                  title="Date wise"
                  rows={DATE_WISE_SUMMARY}
                  cols={[
                    { key: 'date', label: 'Date wise', color: () => 'text-[#48646d]' },
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
                  title="Customer return recovery"
                  leftLabel="Pending"
                  leftValue={BOX_STATS.customerRecovery.pending}
                  leftAmount={BOX_STATS.customerRecovery.pendingAmt}
                  rightLabel="Paid"
                  rightValue={BOX_STATS.customerRecovery.paid}
                  rightAmount={BOX_STATS.customerRecovery.paidAmt}
                  accent="#c86262"
                />

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
                  loadingText="Loading returns not received..."
                  emptyText="No returns-not-received records found."
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  wrapperClassName="h-full"
                  tableClassName="min-w-[1320px] bg-[#f7f6df] text-[12px] text-[#444]"
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
                { key: 'track-courier', label: 'Track Courier', icon: FiTruck },
                { key: 'move', label: 'Move To Received' },
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
