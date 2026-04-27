import { useState, useEffect, useCallback, useRef } from 'react';
import { FiRefreshCw, FiEdit2, FiPlus } from 'react-icons/fi';
import { FaChartBar, FaClipboardList, FaCog } from 'react-icons/fa';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';
import api from '../../services/api';
import AccountModal from '../layout/AccountModal';
import AccountSelectModal from '../layout/AccountSelectModal';
import { useNavigate } from 'react-router-dom';
import ReportModal from '../layout/ReportModal';
import SearchButton from '../layout/SearchButton';
import { useAuth } from '../../context/AuthContext';
import DateSectionModal from '../layout/DateSectionModal';
import ReturnModal from '../layout/ReturnModal';
import ImportDataModal from '../layout/ImportDataModal';
import Button from '../ui/Button';

const fmtDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN');
};

const todayStr = () => new Date().toLocaleDateString('en-IN');
const fmt = (val) => val || '-';

export default function Sidebar({ accountDetails = null }) {
  const accountStatus = accountDetails || {};
  const { activeAccount, setActiveAccount, selectedDateRange } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [showAccountSelectModal, setShowAccountSelectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const navigate = useNavigate();
  const activeAccountRef = useRef(activeAccount);

  useEffect(() => { activeAccountRef.current = activeAccount; }, [activeAccount]);

  const fetchAccounts = useCallback(async (preserveActive = false) => {
    setLoading(true);
    try {
      const res = await api.get('/accounts-list/?skip=0&limit=100');
      const list = res.data?.data || [];
      const currentActive = activeAccountRef.current;
      setAccounts(list);

      if (!currentActive) {
        const savedId = localStorage.getItem('activeAccountId');
        const matched = savedId ? list.find((acc) => String(acc.id) === savedId) : null;
        setActiveAccount(matched || null);
      } else if (preserveActive) {
        const latestActive = list.find((acc) => acc.id === currentActive.id);
        setActiveAccount(latestActive || null);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [setActiveAccount]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const requiresAccountSetup = !loading && accounts.length === 0;
  const requiresAccountSelection = !loading && accounts.length > 0 && !activeAccount;

  useEffect(() => {
    if (requiresAccountSetup) {
      setModal('add');
      setShowAccountSelectModal(false);
      setShowReportModal(false);
      setShowReturnModal(false);
      setShowImportModal(false);
      setShowDateModal(false);
    } else if (requiresAccountSelection) {
      setShowAccountSelectModal(true);
      setModal(null);
      setShowReportModal(false);
      setShowReturnModal(false);
      setShowImportModal(false);
      setShowDateModal(false);
    }
  }, [requiresAccountSetup, requiresAccountSelection]);

  const currentAccount = activeAccount || {};
  const canEditAccount = Boolean(activeAccount);

  const salesProfit = Number(accountStatus.sales_profit) || 0;
  const advertisement = Number(accountStatus.advertisement) || 0;
  const grossProfit = salesProfit - Math.abs(advertisement);
  const netProfit = Number(accountStatus.net_profit) || 0;
  const netProfitPct = Number(accountStatus.net_profit_pct) || 0;
  const totalSku = accountStatus.total_sku ?? 0;
  const withoutCostSku = accountStatus.without_cost_sku ?? 0;

  const lossRows = [
    { l: 'Wrong / Damage / Missing Returns', v: accountStatus.wrong_damage_missing_returns },
    { l: 'Return Not Received Loss', v: accountStatus.return_not_received_loss },
    { l: 'Payment Loss', v: accountStatus.payment_loss },
    { l: 'RTO Packaging Loss', v: accountStatus.rto_packaging_loss },
    { l: 'Customer Return Pending', v: accountStatus.customer_return_charge_pending },
  ];

  const fmtAmt = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 rounded-t-3xl bg-slate-950 p-4 text-white">
          <Button variant="create" size="sm" onClick={() => setModal('add')}>
            <FiPlus size={12} /> Add New
          </Button>
          <Button variant="refresh" size="sm" onClick={() => fetchAccounts(true)}>
            <FiRefreshCw size={12} /> REFRESH
          </Button>
        </div>

        <div className="flex-1 bg-gradient-to-b from-white via-white to-slate-50/80">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
          ) : (
            <div className="h-full space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="max-w-[150px] truncate font-bold leading-tight text-gray-900">{fmt(currentAccount.account_name || 'N/A')}</div>
                  <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-500">GST: {fmt(currentAccount.gst_no || 'N/A')}</div>
                  {requiresAccountSetup ? <div className="text-[0.7rem] font-bold uppercase tracking-wider text-amber-600">Create your first account to continue</div> : null}
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  {canEditAccount ? (
                    <Button variant="edit" size="sm" onClick={() => setModal('edit')}>
                      <FiEdit2 size={12} /> Edit
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex flex-col gap-2 rounded-xl bg-gray-900 p-3">
                <div className="flex justify-center gap-4 text-[0.7rem] font-bold text-white">
                  <span className="opacity-70">FROM - {selectedDateRange.from ? fmtDate(selectedDateRange.from) : '-'}</span>
                  <span className="opacity-70">TO - {selectedDateRange.to ? fmtDate(selectedDateRange.to) : todayStr()}</span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowDateModal(true)}
                  disabled={requiresAccountSetup}
                >
                  CHANGE DATE
                </Button>
              </div>

              <div className="space-y-3.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 shadow-inner">
                <span className="block border-b border-gray-100 pb-2 text-sm font-bold uppercase tracking-widest text-gray-900">Account Status</span>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <h5 className="text-sm font-bold text-green-600">Sales Profits</h5>
                    <h5 className="text-lg font-extrabold leading-none text-green-700">{fmtAmt(salesProfit)}</h5>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-gray-500">Advertisement</span>
                    <span className="text-red-500">{fmtAmt(advertisement)}</span>
                  </div>
                </div>
                <div className="h-px bg-gray-200/50" />
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <h5 className="text-sm font-bold text-green-600">Gross Profits</h5>
                    <h5 className="text-lg font-extrabold leading-none text-green-700">{fmtAmt(grossProfit)}</h5>
                  </div>
                  <div className="space-y-3.5 pt-2">
                    {lossRows.map((row) => (
                      <div key={row.l} className="flex justify-between text-[11px] font-bold uppercase text-gray-400">
                        <span>{row.l}</span>
                        <span className="text-red-400">{fmtAmt(row.v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-gray-200/50" />
                <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-2">
                  <h5 className="text-sm font-bold text-green-700">Net Profits ({netProfitPct}%)</h5>
                  <h5 className="text-lg font-extrabold text-green-800">{fmtAmt(netProfit)}</h5>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="save"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/sku-list')}
                  disabled={requiresAccountSetup}
                >
                  Total SKU - {totalSku} / Without Cost - {withoutCostSku}
                </Button>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <SearchButton onSearch={() => {}} onClear={() => {}} />
                  <div className={`rounded-lg border border-gray-100 p-2 shadow-sm transition-colors ${requiresAccountSetup ? 'opacity-40' : 'hover:bg-gray-50'}`}><FaMoneyBillTrendUp size={20} className="text-green-600" /></div>
                  <div className={`rounded-lg border border-gray-100 p-2 shadow-sm transition-colors ${requiresAccountSetup ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-gray-50'}`} onClick={() => !requiresAccountSetup && navigate('/business-growth-chart')}><FaChartBar size={20} className="text-gray-600" /></div>
                  <div className={`rounded-lg border border-gray-100 p-2 shadow-sm transition-colors ${requiresAccountSetup ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-gray-50'}`} onClick={() => !requiresAccountSetup && setShowReportModal(true)}><FaClipboardList size={20} className="text-gray-600" /></div>
                  <Button variant="cancel" size="sm" disabled={requiresAccountSetup}>Clear All Search</Button>
                  <div className={`rounded-lg border border-gray-100 p-2 shadow-sm transition-colors ${requiresAccountSetup ? 'opacity-40' : 'hover:bg-gray-50'}`}><FaCog size={20} className="text-gray-600" /></div>
                </div>

                <div className="mt-6 space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 shadow-inner">
                  <span className="block border-b border-gray-100 pb-2 text-xs font-bold uppercase tracking-widest text-gray-900">Daily Task</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="warning" size="sm" onClick={() => navigate('/pick-up-entry')} disabled={requiresAccountSetup}>PICK-UP ENTRY</Button>
                    <Button variant="warning" size="sm" onClick={() => setShowReturnModal(true)} disabled={requiresAccountSetup}>RETURN ENTRY</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="warning" size="sm" className="flex-1" onClick={() => setShowImportModal(true)} disabled={requiresAccountSetup}>IMPORT DATA</Button>
                    <Button variant="cancel" size="sm">...</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal ? (
        <AccountModal
          mode={modal}
          initialData={modal === 'edit' ? activeAccount : null}
          disableClose={requiresAccountSetup && modal === 'add'}
          onClose={() => { if (requiresAccountSetup && modal === 'add') return; setModal(null); }}
          onSuccess={() => { setModal(null); fetchAccounts(true); }}
        />
      ) : null}
      {showReportModal ? <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} /> : null}
      {showReturnModal ? <ReturnModal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} /> : null}
      {showDateModal ? <DateSectionModal isOpen={showDateModal} onClose={() => setShowDateModal(false)} onDateSelect={() => setShowDateModal(false)} /> : null}
      <ImportDataModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
      {showAccountSelectModal ? (
        <AccountSelectModal 
          isOpen={showAccountSelectModal} 
          onClose={() => {
            if (!requiresAccountSelection) {
              setShowAccountSelectModal(false);
            }
          }} 
        />
      ) : null}
    </>
  );
}
