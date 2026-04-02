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
    order_number: '127254023011372288_1',
    order_date: '01/03/2025',
    pickup_date: '05/03/2025',
    days: 131,
    status: 'CANCELLED',
    awb_number: 'M00912474914',
    courier: 'Valmo',
    packet_qr_id: 'TNF022500397082',
    buyer_name: 'Dolly Dollysinghrajput Canar',
    sku: 'S',
  },
  {
    id: 2,
    order_number: '128317158223741120_1',
    order_date: '04/03/2025',
    pickup_date: '05/03/2025',
    days: 128,
    status: 'CANCELLED',
    awb_number: 'M00914756142',
    courier: 'Valmo',
    packet_qr_id: '',
    buyer_name: 'Neha aswal pur chauraha',
    sku: 'S',
  },
  {
    id: 3,
    order_number: '129609901794947776_1',
    order_date: '07/03/2025',
    pickup_date: '08/03/2025',
    days: 125,
    status: 'CANCELLED',
    awb_number: 'M00920435619',
    courier: 'Valmo',
    packet_qr_id: 'TSD122401100835',
    buyer_name: 'Sasikala No. 6 Aanandha pett',
    sku: 'C',
  },
  {
    id: 4,
    order_number: '130220001138542592_1',
    order_date: '09/03/2025',
    pickup_date: '10/03/2025',
    days: 123,
    status: 'CANCELLED',
    awb_number: '10595063393',
    courier: 'Ecom Express',
    packet_qr_id: 'TNF022500397387',
    buyer_name: 'hema new no 27 old no 12',
    sku: 'B',
  },
  {
    id: 5,
    order_number: '131449772577325184_1',
    order_date: '12/03/2025',
    pickup_date: '13/03/2025',
    days: 120,
    status: 'CANCELLED',
    awb_number: 'VL0080632485507',
    courier: 'Valmo',
    packet_qr_id: 'TNF022503127246',
    buyer_name: 'Neha Raj barbonia shah mark',
    sku: 'B',
  },
  {
    id: 6,
    order_number: '132043809323452416_1',
    order_date: '14/03/2025',
    pickup_date: '15/03/2025',
    days: 118,
    status: 'CANCELLED',
    awb_number: '1490811168431406',
    courier: 'Delhivery',
    packet_qr_id: 'TSD122401100960',
    buyer_name: 'Divya bhura devigad devigad',
    sku: 'S',
  },
  {
    id: 7,
    order_number: '132135825046734848_1',
    order_date: '14/03/2025',
    pickup_date: '15/03/2025',
    days: 118,
    status: 'CANCELLED',
    awb_number: 'VL0080644975817',
    courier: 'Valmo',
    packet_qr_id: '',
    buyer_name: 'Joba Bauri Huchuk Para Durg',
    sku: 'S',
  },
  {
    id: 8,
    order_number: '132450409549070464_1',
    order_date: '15/03/2025',
    pickup_date: '17/03/2025',
    days: 117,
    status: 'CANCELLED',
    awb_number: 'SF1633838792FPL',
    courier: 'Shadowfax',
    packet_qr_id: '',
    buyer_name: 'sunita p chavan 257 uma sad',
    sku: 'S',
  },
];

const PICKUP_DATE_SUMMARY = [
  { date: '04/07/2025', count: 1, amount: '215.00' },
  { date: '03/07/2025', count: 2, amount: '565.00' },
  { date: '01/07/2025', count: 1, amount: '320.00' },
  { date: '30/06/2025', count: 4, amount: '1205.00' },
  { date: '26/06/2025', count: 1, amount: '430.00' },
  { date: '24/06/2025', count: 1, amount: '215.00' },
  { date: '23/06/2025', count: 2, amount: '535.00' },
  { date: '18/06/2025', count: 4, amount: '1335.00' },
];

const COURIER_SUMMARY = [
  { courier: 'Valmo', pickup: 72, amount: '20185.00' },
  { courier: 'Shadowfax', pickup: 13, amount: '3575.00' },
  { courier: 'Ecom Express', pickup: 9, amount: '2250.00' },
  { courier: 'Delhivery', pickup: 6, amount: '1565.00' },
];

const CANCEL_AFTER_PICKUP_SUMMARY = {
  receivedPct: '0.00 %',
  notReceivedPct: '0.00 %',
  total: 0,
  received: 0,
  notReceived: 100,
};

function CancelSummaryCard() {
  return (
    <div className="border border-[#d7d7d7] bg-white">
      <div className="border-b border-[#e6e6e6] px-1.5 py-1 text-[11px] font-semibold text-[#c86262]">
        Cancel After/At Pickup Summary
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#e6e6e6] text-center">
        <div className="px-1 py-2">
          <div className="text-[12px] font-bold text-[#4aa04a]">Received</div>
          <div className="mt-1 text-[14px] font-bold text-[#4aa04a]">{CANCEL_AFTER_PICKUP_SUMMARY.receivedPct}</div>
        </div>
        <div className="px-1 py-2">
          <div className="text-[12px] font-bold text-[#cf8c3f]">Not Received</div>
          <div className="mt-1 text-[14px] font-bold text-[#cf8c3f]">{CANCEL_AFTER_PICKUP_SUMMARY.notReceivedPct}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-[#e6e6e6] text-center text-[11px]">
        <div className="border-r border-[#e6e6e6] px-1 py-2">
          <div className="font-bold text-[#d45555]">Total Can.</div>
          <div className="mt-1 text-[14px] font-bold text-[#d45555]">{CANCEL_AFTER_PICKUP_SUMMARY.total}</div>
        </div>
        <div className="border-r border-[#e6e6e6] px-1 py-2">
          <div className="font-bold text-[#4aa04a]">Receive</div>
          <div className="mt-1 text-[14px] font-bold text-[#4aa04a]">{CANCEL_AFTER_PICKUP_SUMMARY.received}</div>
        </div>
        <div className="px-1 py-2">
          <div className="font-bold text-[#cf8c3f]">Not Rec.</div>
          <div className="mt-1 text-[14px] font-bold text-[#cf8c3f]">{CANCEL_AFTER_PICKUP_SUMMARY.notReceived}</div>
        </div>
      </div>
    </div>
  );
}

export default function CancelPickup() {
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
    { key: 'order_date', label: 'Order Date (F3)', className: () => 'text-[#555]' },
    { key: 'pickup_date', label: 'Pick-Up Date (F4)', className: () => 'text-[#555]' },
    { key: 'days', label: 'Days (F5)', right: true, className: () => 'text-right text-[#555]' },
    {
      key: 'status',
      label: 'Status',
      className: (_, isSelected) => (isSelected ? 'text-[#222] font-semibold' : 'text-[#5a9ea7] font-semibold'),
    },
    { key: 'awb_number', label: 'AWB Number (F6)', className: () => 'text-[#555]' },
    { key: 'courier', label: 'Courier', className: () => 'text-[#555]' },
    { key: 'packet_qr_id', label: 'Packet QR / ID (F7)', className: () => 'text-[#555]' },
    { key: 'buyer_name', label: 'Buyer Name (F8)', className: () => 'text-[#555]' },
    { key: 'sku', label: 'S', className: () => 'text-[#555]' },
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
              {accountName} - Cancel At/After Pickup
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
              Total Rows - 100
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col xl:flex-row">
          <aside className="w-full shrink-0 border-b border-[#d8d8d8] bg-[#d8e5ec] xl:w-[205px] xl:border-b-0 xl:border-r">
            <div className="space-y-1 p-1">
              <SummaryTable
                title="Pickup Date"
                rows={PICKUP_DATE_SUMMARY}
                cols={[
                  { key: 'date', label: 'Pickup Date', color: () => 'text-[#48646d]' },
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

              <div className="pt-44">
                <CancelSummaryCard />
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
                  emptyText="No cancel pickup records found."
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
                  Edit Pickup
                </button>
                <button className="border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  Delete Single Pickup
                </button>
                <button className="border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  Delete Unpacked Pickups
                </button>
                <div className="hidden border border-[#d4d4d4] bg-[#f8f8d8] xl:block" />
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
