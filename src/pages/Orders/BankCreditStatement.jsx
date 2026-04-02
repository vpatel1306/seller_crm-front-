import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import DataTable from '../../components/ui/DataTable';
import SummaryTable from '../../components/ui/SummaryTable';
import { useAuth } from '../../context/AuthContext';

const MONTH_WISE_BANK_CREDIT = [
  { month: '03/2025', claim: '372.83', recovery: '-191.99', comp: '0.00', settlement: '59025.55', advt: '1445.92', bank_received: '57579.63' },
  { month: '04/2025', claim: '1783.31', recovery: '-1225.30', comp: '0.00', settlement: '205740.45', advt: '0.00', bank_received: '205740.45' },
  { month: '05/2025', claim: '2707.74', recovery: '-6.14', comp: '0.00', settlement: '210557.75', advt: '715.55', bank_received: '209842.20' },
  { month: '06/2025', claim: '1166.75', recovery: '-1274.94', comp: '0.00', settlement: '191754.46', advt: '14215.51', bank_received: '177538.95' },
  { month: '07/2025', claim: '808.43', recovery: '-24.73', comp: '0.00', settlement: '75951.93', advt: '5058.59', bank_received: '70893.34' },
];

const DAY_WISE_BANK_CREDIT = [
  { date: '02/05/2025', claim: '437.01', recovery: '0.00', comp: '0.00', settlement: '21075.43', advt: '0.00', bank_received: '21075.43' },
  { date: '05/05/2025', claim: '0.00', recovery: '0.00', comp: '0.00', settlement: '25358.07', advt: '0.00', bank_received: '25358.07' },
  { date: '06/05/2025', claim: '0.00', recovery: '0.00', comp: '0.00', settlement: '7704.56', advt: '0.00', bank_received: '7704.56' },
  { date: '07/05/2025', claim: '0.00', recovery: '-6.14', comp: '0.00', settlement: '7253.13', advt: '0.00', bank_received: '7253.13' },
  { date: '08/05/2025', claim: '0.00', recovery: '0.00', comp: '0.00', settlement: '7614.81', advt: '0.00', bank_received: '7614.81' },
  { date: '09/05/2025', claim: '345.20', recovery: '0.00', comp: '0.00', settlement: '4207.86', advt: '0.00', bank_received: '4207.86' },
  { date: '13/05/2025', claim: '0.00', recovery: '0.00', comp: '0.00', settlement: '28506.41', advt: '0.00', bank_received: '28506.41' },
  { date: '14/05/2025', claim: '0.00', recovery: '0.00', comp: '0.00', settlement: '5387.04', advt: '0.00', bank_received: '5387.04' },
  { date: '15/05/2025', claim: '273.74', recovery: '0.00', comp: '0.00', settlement: '2843.81', advt: '0.00', bank_received: '2843.81' },
];

const SETTLEMENT_TYPES = [
  { title: 'RTO', amount: '0.00', count: '249', color: 'text-[#8d1f1f]' },
  { title: 'CUSTOMER RETURN', amount: '-24526.49', count: '142', color: 'text-[#ba3b3b]' },
  { title: 'DELIVERED', amount: '227340.81', count: '617', color: 'text-[#3c963c]' },
  { title: 'OTHERS', amount: '7743.43', count: '25', color: 'text-[#333]' },
];

const RECEIVED_SETTLEMENTS = [
  { id: 1, payment_date: '02/06/2025', order_number: '151341376167841024_1', order_date: '06/05/2025', status: 'RETURN', settlement: '-172.00', claim: '0.00', rcvy: '0.00', comp: '0.00' },
  { id: 2, payment_date: '02/06/2025', order_number: '151353482803647104_1', order_date: '06/05/2025', status: 'RETURN', settlement: '-172.00', claim: '0.00', rcvy: '0.00', comp: '0.00' },
  { id: 3, payment_date: '02/06/2025', order_number: '152263621592818560_1', order_date: '09/05/2025', status: 'RETURN', settlement: '-172.00', claim: '0.00', rcvy: '0.00', comp: '0.00' },
  { id: 4, payment_date: '02/06/2025', order_number: '152709593087186496_1', order_date: '10/05/2025', status: 'RETURN', settlement: '-163.00', claim: '0.00', rcvy: '0.00', comp: '0.00' },
  { id: 5, payment_date: '02/06/2025', order_number: '1530718111741980352_1', order_date: '11/05/2025', status: 'RETURN', settlement: '-169.12', claim: '0.00', rcvy: '0.00', comp: '0.00' },
  { id: 6, payment_date: '02/06/2025', order_number: '153102825170987968_1', order_date: '11/05/2025', status: 'RETURN', settlement: '-160.48', claim: '0.00', rcvy: '0.00', comp: '0.00' },
  { id: 7, payment_date: '02/06/2025', order_number: '153406610377642752_1', order_date: '12/05/2025', status: 'RETURN', settlement: '-165.00', claim: '0.00', rcvy: '0.00', comp: '0.00' },
  { id: 8, payment_date: '02/06/2025', order_number: '154653275742133696_1', order_date: '15/05/2025', status: 'DELIVERED', settlement: '449.85', claim: '0.00', rcvy: '0.00', comp: '0.00' },
  { id: 9, payment_date: '02/06/2025', order_number: '154630975379284610_1', order_date: '15/05/2025', status: 'DELIVERED', settlement: '437.19', claim: '0.00', rcvy: '0.00', comp: '0.00' },
];

function SummaryBlock({ title, rows, rowKey, className = '' }) {
  return (
    <div className={`flex min-h-[260px] flex-col overflow-hidden border border-[#d5d5d5] bg-white sm:min-h-[300px] xl:min-h-0 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#d5d5d5] bg-[#f7f7f7] px-2 py-1">
        <div className="bg-[#e31d1d] px-2 py-0.5 text-[12px] font-bold text-white">{title}</div>
        <div className="text-[11px] font-semibold text-[#777]">
          {title === 'Month Wise Bank Credit' ? '5 Months data available.' : 'In 05/2025, payment for 20 days is available.'}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="min-w-full text-[12px]">
          <thead className="bg-[#f6deb9] text-[#6e543a]">
            <tr>
              <th className="px-2 py-1 text-left font-semibold">{rowKey}</th>
              <th className="px-2 py-1 text-right font-semibold">Claim</th>
              <th className="px-2 py-1 text-right font-semibold">Recovery</th>
              <th className="px-2 py-1 text-right font-semibold">Comp.</th>
              <th className="px-2 py-1 text-right font-semibold">Settlement</th>
              <th className="px-2 py-1 text-right font-semibold">Advt.</th>
              <th className="px-2 py-1 text-right font-semibold">Bank Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row[rowKey.toLowerCase().includes('month') ? 'month' : 'date']}
                className={`${idx === 3 && title === 'Month Wise Bank Credit' ? 'bg-[#1883d6] text-white' : idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'} border-b border-[#ececec]`}
              >
                <td className="px-2 py-1">{row.month || row.date}</td>
                <td className="px-2 py-1 text-right">{row.claim}</td>
                <td className="px-2 py-1 text-right">{row.recovery}</td>
                <td className="px-2 py-1 text-right">{row.comp}</td>
                <td className="px-2 py-1 text-right">{row.settlement}</td>
                <td className="px-2 py-1 text-right">{row.advt}</td>
                <td className="px-2 py-1 text-right">{row.bank_received}</td>
              </tr>
            ))}
            <tr className="bg-[#efefef] font-semibold text-[#555]">
              <td className="px-2 py-1">Total -&gt;</td>
              <td className="px-2 py-1 text-right">{rows.reduce((sum, row) => sum + Number(row.claim), 0).toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{rows.reduce((sum, row) => sum + Number(row.recovery), 0).toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{rows.reduce((sum, row) => sum + Number(row.comp), 0).toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{rows.reduce((sum, row) => sum + Number(row.settlement), 0).toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{rows.reduce((sum, row) => sum + Number(row.advt), 0).toFixed(2)}</td>
              <td className="px-2 py-1 text-right">{rows.reduce((sum, row) => sum + Number(row.bank_received), 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BankCreditStatement() {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const searchRef = useRef(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const accountName = activeAccount?.account_name || 'No account selected';

  const filteredSettlements = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return RECEIVED_SETTLEMENTS;
    return RECEIVED_SETTLEMENTS.filter((row) =>
      Object.values(row).some((value) => String(value || '').toLowerCase().includes(q))
    );
  }, [search]);

  const settlementColumns = [
    { key: 'payment_date', label: 'Payment Date', className: () => 'text-[#555]' },
    { key: 'order_number', label: 'Order Number', className: () => 'text-[#5a9ea7] font-semibold' },
    { key: 'order_date', label: 'Order Date', className: () => 'text-[#555]' },
    { key: 'status', label: 'Status', className: () => 'text-[#555]' },
    { key: 'settlement', label: 'Settlement', right: true, className: () => 'text-right text-[#555]' },
    { key: 'claim', label: 'Claim', right: true, className: () => 'text-right text-[#555]' },
    { key: 'rcvy', label: 'Rcvy', right: true, className: () => 'text-right text-[#555]' },
    { key: 'comp', label: 'Comp.', right: true, className: () => 'text-right text-[#555]' },
  ];

  return (
    <div className="min-h-screen bg-[#ececec] text-[#333] xl:h-screen xl:overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full flex-col border-x border-[#d0d0d0] bg-[#f5f5e8] xl:h-screen xl:overflow-hidden">
        <div className="border-b border-[#d8d8d8] bg-[#f4f4f4]">
          <div className="flex flex-col gap-2 px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="bg-[#e31d1d] px-2 py-0.5 text-[13px] font-bold leading-none text-white sm:text-[14px]">
              Bank Credit Statement - {accountName}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#d14f4f]">
              <span>Search</span>
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
        </div>

        <div className="flex-1 min-h-0 p-1 sm:p-2">
          <div className="grid gap-2 xl:h-full xl:min-h-0 xl:grid-cols-[620px_minmax(0,1fr)]">
            <div className="grid gap-2 xl:min-h-0 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
              <SummaryBlock
                title="Month Wise Bank Credit"
                rows={MONTH_WISE_BANK_CREDIT}
                rowKey="Month/Year"
                className="xl:h-full"
              />
              <SummaryBlock
                title="Day Wise Bank Credit"
                rows={DAY_WISE_BANK_CREDIT}
                rowKey="Date"
                className="xl:h-full"
              />
            </div>

            <div className="min-w-0 space-y-2 xl:flex xl:min-h-0 xl:flex-col">
              <div className="overflow-hidden border border-[#d5d5d5] bg-white xl:min-h-[170px] xl:shrink-0">
                <div className="flex items-center justify-between border-b border-[#d5d5d5] bg-[#f7f7f7] px-2 py-1">
                  <div className="bg-[#16979a] px-2 py-0.5 text-[12px] font-bold text-white">Types Of Settlements</div>
                </div>
                <div className="grid gap-2 p-2 sm:grid-cols-2 xl:grid-cols-4">
                  {SETTLEMENT_TYPES.map((item) => (
                    <div key={item.title} className="rounded border border-[#e6e6e6] bg-white p-3">
                      <div className={`text-[12px] font-bold ${item.color}`}>{item.title}</div>
                      <div className="mt-4 flex items-end justify-between">
                        <span className="text-[24px] font-bold text-[#555]">{item.amount}</span>
                        <span className={`text-[28px] font-bold ${item.color}`}>{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden border border-[#d5d5d5] bg-white min-h-[320px] sm:min-h-[420px] xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
                <div className="flex flex-col gap-1 border-b border-[#d5d5d5] bg-[#f7f7f7] px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="bg-[#111] px-2 py-0.5 text-[12px] font-bold text-white">Received Settlements</div>
                  <div className="text-[11px] font-semibold text-[#777]">986 settlement entries have been found.</div>
                </div>
                <div className="overflow-auto bg-[#f7f6df] xl:min-h-0 xl:flex-1">
                  <DataTable
                    mobileCardView={false}
                    columns={settlementColumns}
                    data={filteredSettlements}
                    loading={false}
                    showIndex={false}
                    emptyText="No received settlements found."
                    selectedId={selectedId}
                    onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                    tableClassName="min-w-[900px] bg-[#f7f6df] text-[12px] text-[#444]"
                    headClassName="sticky top-0 z-10 bg-[#f3ddb9] text-[#6e543a]"
                    headerCellClassName="px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                    cellClassName="px-2 py-1 whitespace-nowrap"
                    rowClassName={() => 'border-b border-[#e3dfcb] cursor-pointer bg-transparent hover:bg-[#f0e8c9]'}
                    selectedClass="bg-[#8b8b8b] text-white"
                    hoverClass="hover:bg-[#eee8cd]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-[#d5d5d5] bg-[#efefef] px-2 py-2">
          <div className="flex flex-wrap items-center justify-end gap-2 text-[12px]">
            <button className="min-w-[220px] border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
              Payout verify with bank statement
            </button>
            <button className="min-w-[120px] border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
              <span className="inline-flex items-center justify-center gap-1">
                <FiRefreshCw size={12} />
                Refresh
              </span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="min-w-[120px] border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]"
            >
              <span className="inline-flex items-center justify-center gap-1">
                <FiX size={12} />
                Close
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
