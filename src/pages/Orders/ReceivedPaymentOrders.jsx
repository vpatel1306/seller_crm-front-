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
import { useAuth } from '../../context/AuthContext';

const DEMO_ORDERS = [
  {
    id: 1,
    order_number: '172266102364062528_1',
    order_date: '03/07/2025',
    order_status: 'RTO',
    sku_id: 'STR-Green-Chiku@@',
    size: 'Free Size',
    qty: 1,
    selling: '299.00',
    payout: '0.00',
    cost_price: '215.00',
    pl: '0.00',
  },
  {
    id: 2,
    order_number: '172315520417760576_1',
    order_date: '03/07/2025',
    order_status: 'RTO',
    sku_id: 'SQ_Black(Pan)@Q:',
    size: 'Free Size',
    qty: 1,
    selling: '359.00',
    payout: '0.00',
    cost_price: '260.00',
    pl: '0.00',
  },
  {
    id: 3,
    order_number: '171870396370310656_1',
    order_date: '02/07/2025',
    order_status: 'RTO',
    sku_id: 'KP-R- 232 (PINK)',
    size: 'Free Size',
    qty: 1,
    selling: '499.00',
    payout: '0.00',
    cost_price: '330.00',
    pl: '0.00',
  },
  {
    id: 4,
    order_number: '171930354482512576_1',
    order_date: '02/07/2025',
    order_status: 'RTO',
    sku_id: 'SQ_PINK-',
    size: 'Free Size',
    qty: 1,
    selling: '470.00',
    payout: '0.00',
    cost_price: '320.00',
    pl: '0.00',
  },
  {
    id: 5,
    order_number: '171885391094842240_1',
    order_date: '02/07/2025',
    order_status: 'RTO',
    sku_id: 'BoXX-Black_Black',
    size: 'Free Size',
    qty: 1,
    selling: '310.00',
    payout: '0.00',
    cost_price: '215.00',
    pl: '0.00',
  },
];

const PERFORMANCE_CARDS = [
  {
    title: 'RTO',
    bg: '#7f7f7f',
    total: '1002',
    profit: '322.77',
    loss: '-45.43',
    max: '-23.54',
    min: '-21.89',
    avg: '-22.72',
  },
  {
    title: 'Cus. Return',
    bg: '#d60000',
    total: '461',
    profit: '47.16',
    loss: '-7177.90',
    max: '-406.00',
    min: '64.06',
    avg: '-170.01',
  },
  {
    title: 'Delivery',
    bg: '#0c7a0c',
    total: '2339',
    profit: '218060.73',
    loss: '-1715.16',
    max: '-428.51',
    min: '-883.75',
    avg: '92.49',
  },
  {
    title: 'Others',
    bg: '#0e8f92',
    total: '2',
    profit: '0.00',
    loss: '-28.03',
    max: '',
    min: '',
    avg: '',
  },
];

function PerformanceCard({ card }) {
  return (
    <div className="overflow-hidden border border-[#5e5e5e] text-white" style={{ backgroundColor: card.bg }}>
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[13px] font-bold">{card.title}</span>
        <span className="text-[15px] font-bold">{card.total}</span>
      </div>
      <div className="grid grid-cols-2 gap-y-1 px-2 py-1 text-[11px]">
        <span className="font-semibold">Profit</span>
        <span className="text-right font-semibold">Loss</span>
        <span>{card.profit}</span>
        <span className="text-right">{card.loss}</span>
      </div>
      <div className="grid grid-cols-3 border-t border-white/20 text-[11px]">
        {[
          { label: 'Max', value: card.max },
          { label: 'Min', value: card.min },
          { label: 'Avg', value: card.avg },
        ].map((item) => (
          <div key={item.label} className="border-r border-white/20 px-2 py-1 text-center last:border-r-0">
            <div className="font-semibold">{item.label}</div>
            <div>{item.value || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReceivedPaymentOrders() {
  const navigate = useNavigate();
  const { activeAccount, selectedDateRange, setSelectedDateRange } = useAuth();
  const searchRef = useRef(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(2);
  const [sortKey, setSortKey] = useState('order_date');
  const [sortDir, setSortDir] = useState('desc');
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
      key: 'order_status',
      label: 'Order Status',
      className: (_, isSelected) => (isSelected ? 'text-[#222] font-semibold' : 'text-[#5a9ea7] font-semibold'),
    },
    { key: 'sku_id', label: 'SKU-ID (F3)', className: () => 'text-[#555]' },
    { key: 'size', label: 'Size (F4)', className: () => 'text-[#555]' },
    { key: 'qty', label: 'Qty', right: true, className: () => 'text-right text-[#555]' },
    { key: 'selling', label: 'Selling', right: true, className: () => 'text-right text-[#555]' },
    { key: 'payout', label: 'Payout (F5)', right: true, className: () => 'text-right text-[#555]' },
    { key: 'cost_price', label: 'Cost Price (F6)', right: true, className: () => 'text-right text-[#555]' },
    { key: 'pl', label: 'P / L', right: true, className: () => 'text-right text-[#555]' },
  ];

  return (
    <div className="min-h-screen bg-[#ececec] text-[#333]">
      <div className="mx-auto flex min-h-screen w-full flex-col border-x border-[#d0d0d0] bg-[#f5f5e8]">
        <div className="border-b border-[#d8d8d8] bg-[#f4f4f4]">
          <div className="flex flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="bg-[#e31d1d] px-2 py-0.5 text-[13px] font-bold leading-none text-white sm:text-[14px]">
              Received Payment Orders - {accountName}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#d14f4f]">
              <span>Search On Order Number (F1) -</span>
              <span className="text-[#666]">( F1 )</span>
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
              <span className="font-semibold text-[#666]">Orders</span>
              <span className="font-semibold text-[#666]">From Date</span>
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
            </div>
            <div className="text-right text-[12px] font-semibold text-[#4b6290]">
              Total Rows - {filteredOrders.length} / 3804
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col xl:flex-row">
          <aside className="w-full shrink-0 border-b border-[#d8d8d8] bg-[#d8e5ec] xl:w-[300px] xl:border-b-0 xl:border-r">
            <div className="space-y-1 p-1">
              {PERFORMANCE_CARDS.map((card) => (
                <PerformanceCard key={card.title} card={card} />
              ))}

              <div className="rounded border border-[#bdbdbd] bg-white px-2 py-2 text-[11px] text-[#555]">
                <div className="font-bold text-[#4a4a4a]">Order Filter</div>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="order-filter" defaultChecked />
                    <span>All</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="order-filter" />
                    <span>Profit</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="order-filter" />
                    <span>Loss</span>
                  </label>
                </div>
              </div>

              <div className="rounded border border-[#bdbdbd] bg-[#d8e5ec] px-2 py-2 text-[11px] text-[#2a602a]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4a4a4a]">Received Payment</span>
                  <span className="font-bold">743030.14</span>
                </div>
              </div>

              <div className="rounded border border-[#bdbdbd] bg-[#d8e5ec] px-2 py-2 text-[11px] text-[#178717]">
                <div className="flex items-center justify-between">
                  <span className="bg-[#22a522] px-1 py-0.5 font-bold text-white">Gross Profit</span>
                  <span className="bg-[#1ca01c] px-1 py-0.5 font-bold text-white">138924.14</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-hidden bg-[#f7f6df]">
              <div className="overflow-hidden border-b border-[#d0d0d0]">
                <DataTable
                  mobileCardView={false}
                  columns={columns}
                  data={sortedOrders}
                  loading={false}
                  emptyText="No received payment orders found."
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  wrapperClassName="h-full"
                  tableClassName="min-w-[1280px] bg-[#f7f6df] text-[12px] text-[#444]"
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
                { key: 'export', label: 'Export Excel', icon: FiDownload },
                { key: 'analytics', label: 'Analytics', icon: MdOutlineBarChart },
                { key: 'edit', label: 'Edit Order' },
                { key: 'cost', label: 'Set Cost Price' },
                { key: 'payment', label: 'Payment Details' },
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
