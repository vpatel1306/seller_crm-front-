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
    order_number: '132480370608968064_1',
    order_date: '15/03/2025',
    order_status: 'DELIVERED',
    selling: '498.00',
    qty: 1,
    payout: '-100.00',
    cost: '430.00',
    pl: '-100.00',
    recovery_reason: 'Return pickup wrongly shown as cancell',
    sku_id: 'KP-R - 219(Grey)',
  },
  {
    id: 2,
    order_number: '134161931987814400_1',
    order_date: '20/03/2025',
    order_status: 'DELIVERED',
    selling: '299.00',
    qty: 1,
    payout: '-100.00',
    cost: '255.00',
    pl: '-100.00',
    recovery_reason: 'Return pickup wrongly shown as cancell',
    sku_id: 'Sliver Line_White',
  },
  {
    id: 3,
    order_number: '167254911996745792_1',
    order_date: '19/06/2025',
    order_status: 'DELIVERED',
    selling: '310.00',
    qty: 1,
    payout: '-883.75',
    cost: '215.00',
    pl: '-883.75',
    recovery_reason: 'Recovery for sellers who have subscribe',
    sku_id: 'BoXX-Black_Black',
  },
];

const STATUS_SUMMARY = [
  { status: 'DELIVERED', count: 3, amount: '900.00' },
];

export default function PaymentMismatch() {
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
        order.recovery_reason,
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
    { key: 'selling', label: 'Selling', right: true, className: () => 'text-right text-[#555]' },
    { key: 'qty', label: 'Qty', right: true, className: () => 'text-right text-[#555]' },
    { key: 'payout', label: 'Payout', right: true, className: () => 'text-right text-[#555]' },
    { key: 'cost', label: 'Cost', right: true, className: () => 'text-right text-[#555]' },
    { key: 'pl', label: 'PL', right: true, className: () => 'text-right text-[#555]' },
    { key: 'recovery_reason', label: 'Recovery Reason', className: () => 'text-[#555]' },
    { key: 'sku_id', label: 'SKU ID (F6)', className: () => 'text-[#555]' },
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
            <div className="bg-[#e31d1d] px-2 py-1 text-[13px] font-bold leading-none text-white sm:text-[14px]">
              Payout Mismatch - {accountName}
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
            </div>
            <div className="text-right text-[12px] font-semibold text-[#d14f4f]">
              Total Rows - {filteredOrders.length} / 3
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col xl:flex-row">
          <aside className="w-full shrink-0 border-b border-[#d8d8d8] bg-[#d8e5ec] xl:w-[250px] xl:border-b-0 xl:border-r">
            <div className="p-1">
              <SummaryTable
                title="Order Status"
                rows={STATUS_SUMMARY}
                cols={[
                  { key: 'status', label: 'Order Status', color: () => 'text-[#48646d]' },
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

              <div className="mt-[395px] border border-[#d7d7d7] bg-white">
                <div className="h-16" />
              </div>
              <div className="mt-1 border border-[#d7d7d7] bg-white">
                <div className="h-16" />
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
                  emptyText="No payout mismatch records found."
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  wrapperClassName="h-full"
                  tableClassName="min-w-[1300px] bg-[#f7f6df] text-[13px] text-[#444]"
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
                { key: 'spacer-3', type: 'spacer' },
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
