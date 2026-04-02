import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX, FiRefreshCw, FiEdit2, FiPlusCircle,
  FiChevronDown, FiUser, FiCheck, FiSearch,
  FiTrash2, FiDatabase, FiAlertTriangle, FiFolder, FiMonitor,
} from 'react-icons/fi';
import { FaChartBar, FaClipboardList, FaCog } from 'react-icons/fa';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';
import api from '../../services/api';
import AccountModal from '../layout/AccountModal';
import { useNavigate } from "react-router-dom";
import ReportModal from '../layout/ReportModal';
import SearchButton from '../layout/SearchButton';
import { useAuth } from '../../context/AuthContext';
import DateSectionModal from '../layout/DateSectionModal';
import ReturnModal from '../layout/ReturnModal';
import ImportDataModal from '../layout/ImportDataModal';

// ── helpers ────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString('en-IN');
};
const fmtDateTime = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt) ? d : `${dt.toLocaleDateString('en-IN')} ${dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};
const todayStr = () => new Date().toLocaleDateString('en-IN');
const fmt = (val) => val || '—';
const num = (val) => (val === null || val === undefined || val === '') ? null : Number(val);
const fmtNum = (val) => {
  const n = num(val);
  return n === null ? '—' : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── Account Select Table Modal ──────────────────────────────────
function AccountSelectModal({ accounts, active, onSelect, onClose, onRefresh }) {
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState(() => new Set(active ? [active.id] : []));   // selected row IDs
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);       // confirm delete dialog

  useEffect(() => {
    setChecked(new Set(active ? [active.id] : []));
    setConfirm(false);
  }, [active]);

  // search filter
  const filtered = accounts.filter((acc) => {
    const q = search.toLowerCase();
    return (
      (acc.account_name || '').toLowerCase().includes(q) ||
      (acc.person_name || '').toLowerCase().includes(q) ||
      (acc.mobile_no || '').toLowerCase().includes(q) ||
      (acc.gst_no || '').toLowerCase().includes(q) ||
      (acc.marketplace || '').toLowerCase().includes(q)
    );
  });

  // totals row
  const totalOrders = filtered.reduce((s, a) => s + (num(a.orders) ?? 0), 0);
  const totalPL = filtered.reduce((s, a) => s + (num(a.profit_loss) ?? 0), 0);
  const totalAds = filtered.reduce((s, a) => s + (num(a.advertisement) ?? 0), 0);

  // Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const toggleCheck = (id, e) => {
    e.stopPropagation();
    setChecked((prev) => {
      if (prev.has(id)) return new Set();
      return new Set([id]);
    });
    setConfirm(false);
  };

  const handleOpen = (acc) => {
    onSelect(acc);
    onClose();
  };

  const handleDelete = async () => {
    if (checked.size !== 1) return;
    const [id] = [...checked];
    setDeleting(true);
    try {
      await api.delete(`/account-delete/${id}`);
      setChecked(new Set());
      setConfirm(false);
      onRefresh();
    } catch {
      // Keep the current modal state when delete fails.
    } finally {
      setDeleting(false);
    }
  };

  const selectedAcc = checked.size === 1
    ? accounts.find((a) => checked.has(a.id))
    : null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1100] p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-[95%] w-[1200px] max-h-[90vh] overflow-hidden flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-violet-600 text-white p-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <FiUser size={18} />
            <span className="font-bold text-lg">Change Account</span>
            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-xs ml-2 font-bold">{accounts.length}</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" onClick={onClose} title="Close">
            <FiX size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 relative flex-shrink-0">
          <FiSearch size={16} className="absolute left-7 text-gray-400" />
          <input
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-gray-50/50"
            type="text"
            placeholder="Search by name, marketplace, mobile, GST…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button className="absolute right-7 text-gray-400 hover:text-gray-600 p-1" onClick={() => setSearch('')}>
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4 pt-0">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b-2 border-gray-100 text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-3 font-bold text-center w-12">#</th>
                <th className="px-3 py-3 font-bold text-center w-10 text-lg">☑</th>
                <th className="px-3 py-3 font-bold">Account Name</th>
                <th className="px-3 py-3 font-bold">Marketplace</th>
                <th className="px-3 py-3 font-bold">Expiry Date</th>
                <th className="px-3 py-3 font-bold">First Order</th>
                <th className="px-3 py-3 font-bold">Last Order</th>
                <th className="px-3 py-3 font-bold text-right">Orders</th>
                <th className="px-3 py-3 font-bold text-right">Account P/L</th>
                <th className="px-3 py-3 font-bold text-right">Ad Spend</th>
                <th className="px-3 py-3 font-bold">Last Update</th>
                <th className="px-3 py-3 font-bold">Open PC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-20 text-center text-gray-400 font-medium text-sm">No accounts found matching your search</td>
                </tr>
              ) : (
                <>
                  {filtered.map((acc, idx) => {
                    const isActive = active?.id === acc.id;
                    const isChecked = checked.has(acc.id);
                    const pl = num(acc.profit_loss);
                    return (
                      <tr
                        key={acc.id}
                        className={`group hover:bg-gray-50 cursor-pointer transition-colors ${isActive ? 'bg-indigo-50/40' : ''} ${isChecked ? 'bg-indigo-50/60' : ''}`}
                        onClick={(e) => toggleCheck(acc.id, e)}
                        onDoubleClick={() => handleOpen(acc)}
                      >
                        <td className="px-3 py-3 text-center text-gray-400 font-medium">{idx + 1}</td>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="radio"
                            name="acc-select"
                            checked={isChecked}
                            onChange={() => toggleCheck(acc.id, { stopPropagation: () => { } })}
                            className="w-4 h-4 accent-primary"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            {acc.account_name || '—'}
                            {isActive && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[0.65rem] font-bold flex items-center gap-0.5">
                                <FiCheck size={10} /> ACTIVE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {acc.marketplace
                            ? <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[0.7rem] font-bold">{acc.marketplace}</span>
                            : '—'}
                        </td>
                        <td className="px-3 py-3 text-gray-600 font-medium">{fmtDate(acc.expiry_date) ?? '—'}</td>
                        <td className="px-3 py-3 text-gray-600 font-medium">{fmtDate(acc.first_order_date ?? acc.order_data_from) ?? '—'}</td>
                        <td className="px-3 py-3 text-gray-600 font-medium">{fmtDate(acc.last_order_date) ?? '—'}</td>
                        <td className="px-3 py-3 text-right font-bold text-gray-900">
                          {num(acc.orders) !== null ? num(acc.orders).toLocaleString('en-IN') : '—'}
                        </td>
                        <td className="px-3 py-3 text-right font-bold">
                          {pl !== null
                            ? <span className={pl >= 0 ? 'text-green-600' : 'text-red-600'}>{fmtNum(pl)}</span>
                            : '—'}
                        </td>
                        <td className="px-3 py-3 text-right font-bold">
                          {num(acc.advertisement) !== null
                            ? <span className="text-red-500">-{fmtNum(acc.advertisement)}</span>
                            : '—'}
                        </td>
                        <td className="px-3 py-3 text-[0.7rem] text-gray-400 whitespace-nowrap">{fmtDateTime(acc.updated_at) ?? '—'}</td>
                        <td className="px-3 py-3">
                          {acc.open_pc_name
                            ? <span className="font-mono text-[0.7rem] px-2 py-0.5 bg-gray-100 text-gray-500 rounded flex items-center gap-1 w-fit border border-gray-200"><FiMonitor size={10} /> {acc.open_pc_name}</span>
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totals Row */}
                  <tr className="bg-gray-50/80 font-bold border-t-2 border-gray-100 sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    <td colSpan={2} className="px-3 py-3 text-right text-gray-500 text-[0.7rem] uppercase tracking-wider">TOTAL</td>
                    <td colSpan={5} />
                    <td className="px-3 py-3 text-right text-gray-900 text-sm">
                      {totalOrders.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right text-sm">
                      <span className={totalPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fmtNum(totalPL)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-red-500">
                      -{fmtNum(totalAds)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirm Bar */}
        {selectedAcc && (
          <div className="px-4 py-3 bg-red-50 border-t border-red-100 flex items-center gap-4 flex-shrink-0">
            <FiAlertTriangle size={16} className="text-red-600 animate-pulse" />
            <span className="text-red-700 font-bold text-sm">
              Confirm Deletion: <span className="underline decoration-2 underline-offset-2">{selectedAcc.account_name || 'this account'}</span>
            </span>
            {confirm ? (
              <div className="flex gap-2 ml-auto">
                <span className="text-red-600 font-bold text-xs self-center">Permanently remove all data?</span>
                <button
                  className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-red-600/20"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting
                    ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><FiTrash2 size={13} /> YES, DELETE</>}
                </button>
                <button
                  className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all active:scale-95"
                  onClick={() => setConfirm(false)}
                >
                  NO
                </button>
              </div>
            ) : (
              <div className="flex gap-2 ml-auto">
                <button
                  className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all"
                  onClick={() => setChecked(new Set())}
                >
                  DESELECT
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-between items-center flex-wrap gap-4 flex-shrink-0">
          <span className="text-gray-500 text-xs font-medium">
            Showing {filtered.length} of {accounts.length} accounts
            {checked.size > 0 && <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold ml-3">{checked.size} selected</span>}
          </span>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-lg ${selectedAcc ? 'bg-primary text-white shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
              title={selectedAcc ? `Open: ${selectedAcc.account_name}` : 'Select one account first'}
              disabled={!selectedAcc}
              onClick={() => selectedAcc && handleOpen(selectedAcc)}
            >
              <FiFolder size={14} />
              <span>OPEN ACCOUNT</span>
            </button>

            <button
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-lg ${selectedAcc ? 'bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600 hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
              disabled={!selectedAcc}
              onClick={() => { if (selectedAcc) handleOpen(selectedAcc); }}
            >
              <FiAlertTriangle size={14} />
              <span>ERROR MODE</span>
            </button>

            <button
              className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:bg-purple-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
              onClick={() => alert('Coming soon')}
            >
              <FiDatabase size={14} />
              <span>BACKUP DB</span>
            </button>

            <button
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-lg ${selectedAcc ? 'bg-red-600 text-white shadow-red-600/30 hover:bg-red-700 hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
              disabled={!selectedAcc}
              onClick={() => setConfirm(true)}
            >
              <FiTrash2 size={14} />
              <span>DELETE</span>
            </button>

            <button
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 hover:border-gray-400 transition-all active:scale-95"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


// ── Main Component ──────────────────────────────────────────────
export default function Sidebar() {
  const { activeAccount, setActiveAccount, selectedDateRange } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const navigate = useNavigate();
  const activeAccountRef = useRef(activeAccount);

  useEffect(() => {
    activeAccountRef.current = activeAccount;
  }, [activeAccount]);

  const fetchAccounts = useCallback(async (preserveActive = false) => {
    setLoading(true);
    try {
      const res = await api.get('/accounts-list/?skip=0&limit=100');
      const list = res.data?.data || [];
      const currentActive = activeAccountRef.current;
      setAccounts(list);
      if (!preserveActive && !currentActive) {
        setActiveAccount(list[0] || null);
      } else if (currentActive) {
        const latestActive = list.find((acc) => acc.id === currentActive.id);
        if (latestActive) {
          setActiveAccount(latestActive);
        } else {
          setActiveAccount(list[0] || null);
        }
      }
    } catch {
      // Keep the last rendered account list when fetch fails.
    } finally {
      setLoading(false);
    }
  }, [setActiveAccount]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSelect = (acc) => {
    setActiveAccount(acc);
    fetchAccounts(true);
  };

  const handleDateChange = () => {
    setShowDateModal(true);
  };

  const handleDateSelect = () => {
    setShowDateModal(false);
  };

  const currentAccount = activeAccount || {};
  const canEditAccount = Boolean(activeAccount);

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="p-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-xs font-bold hover:bg-cyan-600 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            onClick={() => setSelectOpen(true)}
          >
            <FiUser size={13} />
            <span>ACCOUNT CHANGE</span>
            <FiChevronDown size={11} />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 shadow-md shadow-green-500/20 active:scale-95 transition-all" onClick={() => fetchAccounts(true)}>
            <FiRefreshCw size={13} />
            <span>REFRESH (F5)</span>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          <div className="p-4 space-y-2.5">
              <div className="flex items-start flex-wrap justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-gray-900 leading-tight truncate max-w-[150px]">{fmt(currentAccount.account_name || 'N/A')}</div>
                  <div className="text-gray-500 text-[0.7rem] uppercase tracking-wider font-semibold">GST: {fmt(currentAccount.gst_no || 'N/A')}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2 text-[0.7rem] font-bold">
                    {canEditAccount && (
                      <>
                        <button className="text-primary hover:underline hover:text-primary-hover transition-colors" onClick={() => setModal('edit')}>
                          <FiEdit2 size={11} className="inline mr-1" /> EDIT
                        </button>
                        <span className="text-gray-300">|</span>
                      </>
                    )}
                    <button className="text-primary hover:underline hover:text-primary-hover transition-colors" onClick={() => setModal('add')}>
                      <FiPlusCircle size={11} className="inline mr-1" /> ADD NEW
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-500 leading-relaxed italic">
                  Fulfilment by <br />
                  <span className="text-red-500 font-bold not-italic">SELLER</span>
                </span>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[0.7rem] font-bold rounded-md italic">meesho</span>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex flex-col gap-2 p-3 bg-gray-900 rounded-xl">
                <div className="flex justify-center gap-4 text-white text-[0.7rem] font-bold">
                  <span className="opacity-70">FROM - {selectedDateRange.from ? fmtDate(selectedDateRange.from) : '—'}</span>
                  <span className="opacity-70">TO - {selectedDateRange.to ? fmtDate(selectedDateRange.to) : todayStr()}</span>
                </div>
                <button className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md shadow-red-600/20" onClick={handleDateChange}>CHANGE DATE</button>
              </div>

              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2.5 shadow-inner">
                <span className="block text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Account Status</span>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h5 className="text-green-600 font-bold text-sm">Sales Profits</h5>
                    <h5 className="text-green-700 font-extrabold text-lg leading-none">55000.9</h5>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500">Advertisement</span>
                    <span className="text-red-500">-2000.5</span>
                  </div>
                </div>

                <div className="h-px bg-gray-200/50" />

                <div className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <h5 className="text-green-600 font-bold text-sm">Gross Profits</h5>
                    <h5 className="text-green-700 font-extrabold text-base leading-none">52300.9</h5>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {[
                      { l: "Wrong / Damage / Missing Returns", v: "-2000.5" },
                      { l: "Return Not Received Loss", v: "-2000.5" },
                      { l: "Payment Loss", v: "-2000.5" },
                      { l: "RTO Packaging Loss", v: "-2000.5" },
                      { l: "Customer Return Pending", v: "-2000.5" },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                        <span>{row.l}</span>
                        <span className="text-red-400">{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200/50" />

                <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-100">
                  <h5 className="text-green-700 font-bold text-sm">Net Profits (4.8 %)</h5>
                  <h5 className="text-green-800 font-extrabold text-lg">52300.9</h5>
                </div>
              </div>

              <div className="pt-2">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/20 active:scale-95" onClick={() => navigate("/sku-list")}>
                  Total SKU - 334 / Without Cost - 0
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center gap-1.5 flex-wrap">
                  <SearchButton onSearch={() => { }} onClear={() => { }} />
                  <div className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><FaMoneyBillTrendUp size={20} className="text-green-600" /></div>
                  <div className="p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm" onClick={() => navigate('/business-growth-chart')} ><FaChartBar size={20} className="text-gray-600" /></div>
                  <div className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm" onClick={() => setShowReportModal(true)}><FaClipboardList size={20} className="text-gray-600" /></div>
                  <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-xs font-bold text-red-600">Clear All Search</button>
                  <div className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><FaCog size={20} className="text-gray-600" /></div>
                </div>

                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2.5 shadow-inner">
                  <span className="block text-xs font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Daily Task</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-[0.65rem] font-bold hover:bg-amber-200 transition-colors border border-amber-200" onClick={() => navigate('/pick-up-entry')}>PICK-UP ENTRY</button>
                    <button className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-[0.65rem] font-bold hover:bg-amber-200 transition-colors border border-amber-200" onClick={() => setShowReturnModal(true)}>RETURN ENTRY</button>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-[0.65rem] font-bold hover:bg-amber-200 transition-colors border border-amber-200" onClick={() => setShowImportModal(true)}>IMPORT DATA</button>
                    <button className="p-2 bg-amber-100 text-amber-700 rounded-lg border border-amber-200 font-bold">⋮</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {selectOpen && (
        <AccountSelectModal
          accounts={accounts}
          active={activeAccount}
          onSelect={handleSelect}
          onClose={() => setSelectOpen(false)}
          onRefresh={() => fetchAccounts(true)}
        />
      )}

      {modal && (
        <AccountModal
          mode={modal}
          initialData={modal === 'edit' ? activeAccount : null}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); fetchAccounts(true); }}
        />
      )}

      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showReturnModal && (
        <ReturnModal
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
        />
      )}

      {showDateModal && (
        <DateSectionModal
          isOpen={showDateModal}
          onClose={() => setShowDateModal(false)}
          onDateSelect={handleDateSelect}
        />
      )}

      <ImportDataModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </>
  );
}
