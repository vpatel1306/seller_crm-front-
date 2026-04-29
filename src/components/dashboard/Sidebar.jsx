import { useState, useEffect, useCallback, useRef } from 'react';
import { FiRefreshCw, FiEdit2, FiPlus, FiTrendingUp } from 'react-icons/fi';

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
import Button from '../ui/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';


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
      setShowDateModal(false);
    } else if (requiresAccountSelection) {
      setShowAccountSelectModal(true);
      setModal(null);
      setShowReportModal(false);
      setShowReturnModal(false);
      setShowDateModal(false);
    }
  }, [requiresAccountSetup, requiresAccountSelection]);

  const currentAccount = activeAccount || {};
  const canEditAccount = Boolean(activeAccount);

  const salesProfit = Number(accountStatus.sales_profit) || 0;
  const advertisement = Number(accountStatus.advertisement) || 0;
  const grossProfit = Number(accountStatus.gross_profit) || (salesProfit - Math.abs(advertisement));
  const netProfit = Number(accountStatus.net_profit) || 0;
  const netProfitPct = Number(accountStatus.net_profit_percentage) || 0;
  const totalSku = accountStatus.total_sku ?? 0;
  const withoutCostSku = accountStatus.without_cost_sku ?? 0;
  const lossBreakdown = accountStatus.loss_breakdown || {};

  const lossRows = [
    { l: 'Wrong / Damage / Missing Returns', v: accountStatus.wrong_damage_missing_returns, c: lossBreakdown.wrong_damage_missing_returns?.count ?? 0 },
    { l: 'Return Not Received Loss', v: accountStatus.return_not_received_loss, c: lossBreakdown.return_not_received_loss?.count ?? 0 },
    { l: 'Payment Loss', v: accountStatus.payment_loss, c: lossBreakdown.payment_loss?.count ?? 0 },
    { l: 'RTO Packaging Loss', v: accountStatus.rto_packaging_loss, c: lossBreakdown.rto_packaging_loss?.count ?? 0 },
    { l: 'Customer Return Pending', v: accountStatus.customer_return_charge_pending, c: lossBreakdown.customer_return_pending?.count ?? 0 },
  ];

  const fmtAmt = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* <div className="flex items-center justify-between gap-2 rounded-t-3xl bg-slate-950 p-4 text-white">
          <Button variant="create" size="sm" onClick={() => setModal('add')}>
            <FiPlus size={12} /> Add New
          </Button>
          <Button variant="refresh" size="sm" onClick={() => fetchAccounts(true)}>
            <FiRefreshCw size={12} /> REFRESH
          </Button>
        </div> */}

        <div className="bg-gradient-to-b from-white via-white to-slate-50/80">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
          ) : (
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="max-w-[150px] truncate font-bold leading-tight text-gray-900">{fmt(currentAccount.account_name || 'N/A')}</div>
                  <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-500">GST: {fmt(currentAccount.gst_no || 'N/A')}</div>
                  {requiresAccountSetup ? <div className="text-[0.7rem] font-bold uppercase tracking-wider text-amber-600">Create your first account to continue</div> : null}
                </div>
                <div className="flex flex-shrink-0 flex-row items-center gap-2">
                  {canEditAccount ? (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => navigate('/account')}>
                        <FiRefreshCw size={12} /> Change Account
                      </Button>
                      <Button variant="edit" size="sm" onClick={() => setModal('edit')}>
                        <FiEdit2 size={12} />
                      </Button>
                    </>
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
                  <span className="block border-b border-gray-100 pb-2 text-sm font-bold uppercase tracking-widest text-gray-900">Account Analysis</span>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Net Profit Margin</div>
                      <div className="mt-1 text-2xl font-black text-emerald-600">{netProfitPct}%</div>
                    </div>
                    <div className="h-16 w-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          innerRadius="60%" 
                          outerRadius="100%" 
                          data={[{ name: 'Profit', value: netProfitPct, fill: '#10b981' }]} 
                          startAngle={90} 
                          endAngle={90 + (3.6 * netProfitPct)}
                        >
                          <RadialBar background dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200/50" />

                  <div>
                    <div className="mb-3 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Loss Breakdown</div>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={lossRows.filter(r => (Number(r.v) || 0) > 0)}
                          margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="l" 
                            type="category" 
                            hide
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(15, 23, 42, 0.05)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-xl bg-slate-900/95 backdrop-blur-md px-4 py-3 text-[0.65rem] font-bold text-white shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
                                    <div className="mb-2 opacity-50 uppercase tracking-[0.2em]">{payload[0].payload.l}</div>
                                    <div className="text-base font-black text-white">₹{fmtAmt(payload[0].value)}</div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                      <span className="text-[0.6rem] opacity-70 tracking-widest uppercase">{payload[0].payload.c} Total Issues</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                          <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={12}>
                            {lossRows.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#fb7185'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {lossRows.slice(0, 3).map((row, idx) => (
                        <div key={row.l} className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${idx === 0 ? 'bg-rose-500' : 'bg-rose-300'}`} />
                            <span className="truncate">{row.l}</span>
                          </div>
                          <span className="shrink-0 text-rose-500">₹{fmtAmt(row.v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gray-200/50" />
                  
                  <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-2.5">
                    <div>
                      <h5 className="text-[0.6rem] font-black uppercase tracking-wider text-green-700">Net Profits</h5>
                      <h5 className="mt-0.5 text-lg font-black leading-none text-green-800">₹{fmtAmt(netProfit)}</h5>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-green-200/50 flex items-center justify-center">
                      <FiTrendingUp className="text-green-700" size={16} />
                    </div>
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
                  <SearchButton onSearch={() => { }} onClear={() => { }} />
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
                    <Button variant="warning" size="sm" className="flex-1" onClick={() => navigate('/daily-import')} disabled={requiresAccountSetup}>DAILY IMPORT FLOW</Button>
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
