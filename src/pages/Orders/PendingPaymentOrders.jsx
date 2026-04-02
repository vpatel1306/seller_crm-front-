import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDownload,
  FiRefreshCw,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { MdOutlineBarChart } from 'react-icons/md';
import DataTable from '../../components/ui/DataTable';
import SummaryTable from '../../components/ui/SummaryTable';
import { useAuth } from '../../context/AuthContext';

const DEMO_ORDERS = [
  {
    id: 1,
    order_number: '165387691782080448_1',
    order_date: '14/06/2025',
    pickup_date: '18/06/2025',
    days: 26,
    status: 'SHIPPED',
    awb_number: 'VL0081368908010',
    courier: 'Valmo',
    packet_qr_id: 'TJDNPGC02016534',
    buyer_name: 'Name Manojraghav village kil',
    sku_id: 'Str_Yellow',
  },
  {
    id: 2,
    order_number: '166950385244998848_1',
    order_date: '18/06/2025',
    pickup_date: '19/06/2025',
    days: 22,
    status: 'DELIVERED',
    awb_number: 'VL0081404803071',
    courier: 'Valmo',
    packet_qr_id: 'TAAASDF40553947',
    buyer_name: 'Rohit Gori Karimiganj - Agarta',
    sku_id: 'STAR_Orange',
  },
  {
    id: 3,
    order_number: '167553432985633280_1',
    order_date: '20/06/2025',
    pickup_date: '21/06/2025',
    days: 20,
    status: 'DELIVERED',
    awb_number: 'VL0081415908498',
    courier: 'Valmo',
    packet_qr_id: 'TAAASDF40553721',
    buyer_name: 'Ramesh mylapalli 282 mppsct',
    sku_id: 'SQ_PINK',
  },
  {
    id: 4,
    order_number: '168012782564901696_1',
    order_date: '21/06/2025',
    pickup_date: '23/06/2025',
    days: 19,
    status: 'DELIVERED',
    awb_number: 'VL0081426178993',
    courier: 'Valmo',
    packet_qr_id: 'TJDNPGC02018357',
    buyer_name: 'afina 247 perinthalmanna ro',
    sku_id: 'SQ_Black',
  },
  {
    id: 5,
    order_number: '168677627622687552_1',
    order_date: '23/06/2025',
    pickup_date: '24/06/2025',
    days: 17,
    status: 'DELIVERED',
    awb_number: 'VL0081442386214',
    courier: 'Valmo',
    packet_qr_id: 'TAAASDF40554002',
    buyer_name: 'sunil kumar 18/276 gautam.n',
    sku_id: 'Anya_Black',
  },
  {
    id: 6,
    order_number: '168697446179374208_1',
    order_date: '23/06/2025',
    pickup_date: '24/06/2025',
    days: 17,
    status: 'SHIPPED',
    awb_number: 'VL0081442386215',
    courier: 'Valmo',
    packet_qr_id: 'TAAASDF40554135',
    buyer_name: 'Anjali Dwivedi Govt. high. sec.',
    sku_id: 'Chahat-B',
  },
  {
    id: 7,
    order_number: '169065776251438400_1',
    order_date: '24/06/2025',
    pickup_date: '26/06/2025',
    days: 16,
    status: 'DELIVERED',
    awb_number: 'VL0081449591111',
    courier: 'Valmo',
    packet_qr_id: 'TAAASDF40554281',
    buyer_name: 'Tani Thakur panday para Balo',
    sku_id: 'Chahat-B',
  },
  {
    id: 8,
    order_number: '169111506351391488_1',
    order_date: '24/06/2025',
    pickup_date: '26/06/2025',
    days: 16,
    status: 'DELIVERED',
    awb_number: 'VL0081450273329',
    courier: 'Valmo',
    packet_qr_id: 'TAAASDF40554276',
    buyer_name: 'Dipankar Shee potka potka',
    sku_id: 'SQ_PINK',
  },
];

const ORDER_DATE_SUMMARY = [
  { date: '08/07/2025', count: 17, amount: '4820.00' },
  { date: '07/07/2025', count: 33, amount: '9475.00' },
  { date: '06/07/2025', count: 58, amount: '14255.00' },
  { date: '05/07/2025', count: 32, amount: '8875.00' },
  { date: '04/07/2025', count: 21, amount: '6095.00' },
  { date: '03/07/2025', count: 21, amount: '6815.00' },
  { date: '02/07/2025', count: 29, amount: '7450.00' },
];

const COURIER_SUMMARY = [
  { courier: 'Valmo', pickup: 267, amount: '67550.00' },
  { courier: 'Delhivery', pickup: 36, amount: '9235.00' },
  { courier: '', pickup: 23, amount: '6910.00' },
  { courier: 'Shadowfax', pickup: 17, amount: '4830.00' },
  { courier: 'Xpress Bees', pickup: 1, amount: '350.00' },
];

const STATUS_SUMMARY = [
  { status: 'SHIPPED', count: 172, amount: '46455.00' },
  { status: 'DELIVERED', count: 172, amount: '42420.00' },
];

function PayoutSummaryCard() {
  return (
    <div className="border border-[#d7d7d7] bg-white">
      <div className="border-b border-[#e6e6e6] px-1.5 py-1 text-[11px] font-semibold text-[#6e543a]">
        Payout Order Summary
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#e6e6e6] text-center">
        <div className="px-1 py-2">
          <div className="text-[12px] font-bold text-[#4aa04a]">Clear</div>
        </div>
        <div className="px-1 py-2">
          <div className="text-[12px] font-bold text-[#cf8c3f]">Pending</div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-[#e6e6e6] text-center text-[11px]">
        <div className="border-r border-[#e6e6e6] px-1 py-2">
          <div className="font-bold text-[#d45555]">Total</div>
        </div>
        <div className="border-r border-[#e6e6e6] px-1 py-2">
          <div className="font-bold text-[#4aa04a]">Clear</div>
        </div>
        <div className="px-1 py-2">
          <div className="font-bold text-[#cf8c3f]">Pending</div>
        </div>
      </div>
    </div>
  );
}

export default function PendingPaymentOrders() {
  const navigate = useNavigate();
  const { activeAccount, selectedDateRange, setSelectedDateRange } = useAuth();
  const searchRef = useRef(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
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
        order.status,
        order.courier,
        order.awb_number,
        order.packet_qr_id,
        order.buyer_name,
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
    { key: 'pickup_date', label: 'Pick-Up Date (F3)', className: () => 'text-[#555]' },
    { key: 'days', label: 'Days', right: true, className: () => 'text-right text-[#555]' },
    {
      key: 'status',
      label: 'Status',
      className: (_, isSelected) => (isSelected ? 'text-[#222] font-semibold' : 'text-[#5a9ea7] font-semibold'),
    },
    { key: 'awb_number', label: 'AWB Number (F4)', className: () => 'text-[#555]' },
    { key: 'courier', label: 'Courier', className: () => 'text-[#555]' },
    { key: 'packet_qr_id', label: 'Packet QR / ID (F5)', className: () => 'text-[#555]' },
    { key: 'buyer_name', label: 'Buyer Name (F6)', className: () => 'text-[#555]' },
    { key: 'sku_id', label: 'SKU-ID (F', className: () => 'text-[#555]' },
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
              Pending Payment Orders - {accountName}
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
              Total Rows - 344
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col xl:flex-row">
          <aside className="w-full shrink-0 border-b border-[#d8d8d8] bg-[#d8e5ec] xl:w-[205px] xl:border-b-0 xl:border-r">
            <div className="space-y-1 p-1">
              <SummaryTable
                title="Order Date"
                rows={ORDER_DATE_SUMMARY}
                cols={[
                  { key: 'date', label: 'Order Date', color: () => 'text-[#48646d]' },
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
                  { key: 'pickup', label: 'Pickup', right: true, color: () => 'text-right text-[#555]' },
                  { key: 'amount', label: 'Cost Amt', right: true, color: () => 'text-right text-[#555]' },
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
                title="Status"
                rows={STATUS_SUMMARY}
                cols={[
                  { key: 'status', label: 'Status', color: () => 'text-[#48646d]' },
                  { key: 'count', label: 'Count', right: true, color: () => 'text-right text-[#555]' },
                  { key: 'amount', label: 'Cost Amt', right: true, color: () => 'text-right text-[#555]' },
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

              <div className="pt-16">
                <PayoutSummaryCard />
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
                  emptyText="No pending payment orders found."
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  wrapperClassName="h-full"
                  tableClassName="min-w-[1500px] bg-[#f7f6df] text-[12px] text-[#444]"
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

            <div className="border-t border-[#d5d5d5] bg-[#efefef] px-2 py-2">
              <div className="grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4 xl:grid-cols-8">
                <button className="border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  <span className="inline-flex items-center justify-center gap-1">
                    <FiDownload size={12} />
                    Export Excel
                  </span>
                </button>
                <button className="border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  <span className="inline-flex items-center justify-center gap-1">
                    <MdOutlineBarChart size={13} />
                    Analytics
                  </span>
                </button>
                <button className="border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  Edit Order
                </button>
                <div className="hidden border border-[#d4d4d4] bg-[#f8f8d8] xl:block" />
                <div className="hidden border border-[#d4d4d4] bg-[#f8f8d8] xl:block" />
                <button className="border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  Order Status
                </button>
                <button className="border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  <span className="inline-flex items-center justify-center gap-1">
                    <FiRefreshCw size={12} />
                    Refresh
                  </span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]"
                >
                  <span className="inline-flex items-center justify-center gap-1">
                    <FiX size={12} />
                    Close
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
