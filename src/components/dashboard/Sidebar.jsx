import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX, FiRefreshCw, FiEdit2, FiPlusCircle,
  FiChevronDown, FiUser, FiCheck, FiSearch,
  FiTrash2, FiDatabase, FiAlertTriangle, FiFolder, FiMonitor,
} from 'react-icons/fi';
import { FaMoneyBill, FaChartBar, FaClipboardList, FaCog, FaSearch, FaMoneyCheck, FaMoneyBillAlt } from 'react-icons/fa';
import api from '../../services/api';
import AccountModal from '../layout/AccountModal';
import { useNavigate } from "react-router-dom";
import CommonModal from '../common/CommonModal';
import ReportModal from '../layout/ReportModal';
import { FaMoneyBillTransfer, FaMoneyBillTrendUp } from 'react-icons/fa6';
import SearchButton from '../layout/SearchButton';
import { useAuth } from '../../context/AuthContext';
import DateSectionModal from '../layout/DateSectionModal';
import ReturnModal from '../layout/ReturnModal';
import PickUpEntry from '../layout/PickUpEntry';
 
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
function AccountSelectModal({ accounts, active, onSelect, onClose, onDelete, onRefresh }) {
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState(new Set());   // selected row IDs
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);       // confirm delete dialog
 
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
 
  // ── Single-select checkbox (radio style — max 1 at a time) ──
  const toggleCheck = (id, e) => {
    e.stopPropagation();
    // If already selected → deselect; else select only this one
    setChecked((prev) => {
      if (prev.has(id)) return new Set();
      return new Set([id]);
    });
    setConfirm(false); // reset confirm if selection changes
  };
 
  const handleOpen = (acc) => {
    onSelect(acc);
    onClose();
  };
 
  // Delete — single account only (API supports single delete)
  const handleDelete = async () => {
    if (checked.size !== 1) return; // guard: exactly 1
    const [id] = [...checked];
    setDeleting(true);
    try {
      await api.delete(`/account-delete/${id}`);
      setChecked(new Set());
      setConfirm(false);
      onRefresh();
    } catch {
    } finally {
      setDeleting(false);
    }
  };
 
  // The single currently checked account
  const selectedAcc = checked.size === 1
    ? accounts.find((a) => checked.has(a.id))
    : null;
 
  return createPortal(
    <div
      className="asm-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="asm-modal" onClick={(e) => e.stopPropagation()}>
 
        {/* ── Header ── */}
        <div className="asm-header">
          <div className="d-flex align-items-center gap-2">
            <FiUser size={16} className="text-primary" />
            <span className="fw-bold fs-6">Change Account</span>
            <span className="badge bg-primary-subtle text-primary ms-1">{accounts.length}</span>
          </div>
          <button className="asm-close-btn" onClick={onClose} title="Close">
            <FiX size={18} />
          </button>
        </div>
 
        {/* ── Search ── */}
        <div className="asm-search-wrap">
          <FiSearch size={14} className="asm-search-icon" />
          <input
            className="asm-search-input"
            type="text"
            placeholder="Search by name, marketplace, mobile, GST…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button className="asm-search-clear" onClick={() => setSearch('')}>
              <FiX size={12} />
            </button>
          )}
        </div>
 
        {/* ── Table ── */}
        <div className="asm-table-wrap">
          <table className="asm-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>#</th>
                <th style={{ width: 36, textAlign: 'center' }} title="Select one account">☑</th>
                <th>Account Name</th>
                <th>Marketplace</th>
                <th>Expiry Date</th>
                <th>First Order Date</th>
                <th>Last Order Date</th>
                <th style={{ textAlign: 'right' }}>Orders</th>
                <th style={{ textAlign: 'right' }}>Account P/L</th>
                <th style={{ textAlign: 'right' }}>Advertisement</th>
                <th>Last Update</th>
                <th>Open PC Name</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="asm-empty">No accounts found</td>
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
                        className={`asm-row${isActive ? ' asm-row-active' : ''}${isChecked ? ' asm-row-checked' : ''}`}
                        onClick={(e) => toggleCheck(acc.id, e)}  // row click = single select (highlight)
                        onDoubleClick={() => handleOpen(acc)}     // double-click = open account
                      >
                        <td className="asm-td-num">{idx + 1}</td>
                        <td className="asm-td-check">
                          {/* radio-style: click anywhere on row selects it */}
                          <input
                            type="radio"
                            name="acc-select"
                            checked={isChecked}
                            onChange={() => toggleCheck(acc.id, { stopPropagation: () => { } })}
                            className="asm-checkbox"
                          />
                        </td>
                        <td>
                          <div className="asm-acc-name">{acc.account_name || '—'}</div>
                          {isActive && (
                            <span className="asm-badge-active ms-1">
                              <FiCheck size={9} /> Active
                            </span>
                          )}
                        </td>
                        <td>
                          {acc.marketplace
                            ? <span className="asm-marketplace">{acc.marketplace}</span>
                            : '—'}
                        </td>
                        <td>{fmtDate(acc.expiry_date) ?? '—'}</td>
                        <td>{fmtDate(acc.first_order_date ?? acc.order_data_from) ?? '—'}</td>
                        <td>{fmtDate(acc.last_order_date) ?? '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {num(acc.orders) !== null ? num(acc.orders).toLocaleString('en-IN') : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {pl !== null
                            ? <span className={pl >= 0 ? 'asm-pos' : 'asm-neg'}>{fmtNum(pl)}</span>
                            : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {num(acc.advertisement) !== null
                            ? <span className="asm-neg">{fmtNum(acc.advertisement)}</span>
                            : '—'}
                        </td>
                        <td className="asm-datetime">{fmtDateTime(acc.updated_at) ?? '—'}</td>
                        <td>
                          {acc.open_pc_name
                            ? <span className="asm-pc-name"><FiMonitor size={11} /> {acc.open_pc_name}</span>
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
 
                  {/* ── Totals Row ── */}
                  <tr className="asm-totals-row">
                    <td colSpan={2} style={{ textAlign: 'right', fontWeight: 700, paddingRight: '0.5rem' }}>
                      TOTAL
                    </td>
                    <td colSpan={5} />
                    <td style={{ textAlign: 'right' }}>
                      <strong>{totalOrders.toLocaleString('en-IN')}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong className={totalPL >= 0 ? 'asm-pos' : 'asm-neg'}>
                        {fmtNum(totalPL)}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong className="asm-neg">{fmtNum(totalAds)}</strong>
                    </td>
                    <td colSpan={2} />
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
 
        {/* ── Delete Confirm Bar (shows when 1 account selected) ── */}
        {selectedAcc && (
          <div className="asm-confirm-bar">
            <FiAlertTriangle size={14} className="text-danger" />
            <span className="text-danger fw-semibold">
              Delete: <strong>{selectedAcc.account_name || 'this account'}</strong>?
            </span>
            {confirm ? (
              <div className="d-flex gap-2 ms-auto">
                <span className="text-danger fw-bold small align-self-center">Sure? This cannot be undone.</span>
                <button
                  className="btn btn-sm btn-danger"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting
                    ? <span className="spinner-border spinner-border-sm" />
                    : <><FiTrash2 size={12} /> Yes, Delete</>}
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setConfirm(false)}
                >
                  No
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2 ms-auto">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setChecked(new Set())}
                >
                  Deselect
                </button>
              </div>
            )}
          </div>
        )}
 
        {/* ── Footer Action Buttons ── */}
        <div className="asm-footer">
          <span className="text-muted small">
            Showing {filtered.length} of {accounts.length} accounts
            {checked.size > 0 && ` · ${checked.size} selected`}
          </span>
 
          <div className="asm-footer-actions">
            {/* Open Account — enabled only when 1 account selected via checkbox */}
            <button
              className="asm-foot-btn asm-foot-open"
              title={selectedAcc ? `Open: ${selectedAcc.account_name}` : 'Select one account first'}
              disabled={!selectedAcc}
              onClick={() => selectedAcc && handleOpen(selectedAcc)}
            >
              <FiFolder size={13} />
              <span>Open Account</span>
            </button>
 
            {/* Open Account with Fixing Error — single selection required */}
            <button
              className="asm-foot-btn asm-foot-fix"
              title={selectedAcc ? 'Open with fixing error mode' : 'Select one account first'}
              disabled={!selectedAcc}
              onClick={() => {
                if (selectedAcc) handleOpen(selectedAcc);
              }}
            >
              <FiAlertTriangle size={13} />
              <span>Open with Fixing Error</span>
            </button>
 
            {/* Backup & Repair Database */}
            <button
              className="asm-foot-btn asm-foot-backup"
              title="Backup & Repair Database"
              onClick={() => alert('Backup & Repair Database — coming soon')}
            >
              <FiDatabase size={13} />
              <span>Backup &amp; Repair DB</span>
            </button>
 
            {/* Delete Account — single account only, API supports 1 at a time */}
            <button
              className="asm-foot-btn asm-foot-delete"
              title={selectedAcc ? `Delete: ${selectedAcc.account_name}` : 'Select one account to delete'}
              disabled={!selectedAcc}
              onClick={() => setConfirm(true)}
            >
              <FiTrash2 size={13} />
              <span>Delete Account</span>
            </button>
 
            {/* Close */}
            <button
              className="asm-foot-btn asm-foot-close"
              onClick={onClose}
            >
              <FiX size={13} />
              <span>Close</span>
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
  const { activeAccount, setActiveAccount } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);    // null | 'add' | 'edit'
  const [selectOpen, setSelectOpen] = useState(false);   // account select modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({ from: null, to: null });
  const navigate = useNavigate();
  // ── API: fetch accounts ────────────────────────────────────
  const fetchAccounts = async (preserveActive = false) => {
    setLoading(true);
    try {
      const res = await api.get('/accounts-list/?skip=0&limit=100');
      const list = res.data?.data || [];
      setAccounts(list);
 
      // Only set active account if it's null or if preserveActive is false
      if (!preserveActive) {
        if (!activeAccount) {
          setActiveAccount(list[0] || null);
        }
      } else {
        // When preserving active, check if the current active account still exists in the list
        if (activeAccount) {
          const stillExists = list.find(acc => acc.id === activeAccount.id);
          if (!stillExists) {
            setActiveAccount(list[0] || null);
          }
        }
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };
 
 
  useEffect(() => { fetchAccounts(); }, []);
 
  // ── account select handler ─────────────────────────────────
  const handleSelect = (acc) => {
    setActiveAccount(acc);
    // Refresh accounts data but preserve the newly selected active account
    fetchAccounts(true);
  };
 
  // ── date change handler ─────────────────────────────────────
  const handleDateChange = () => {
    // Set default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
 
    // Format as YYYY-MM-DD for input fields
    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];
 
    // Pre-populate the date range state
    setSelectedDateRange({
      from: startDate,
      to: endDate
    });
 
    setShowDateModal(true);
  };
 
  const handleDateSelect = (dateRange) => {
    setShowDateModal(false);
    // Update the selected date range state
    setSelectedDateRange({
      from: dateRange.startDate,
      to: dateRange.endDate
    });
    console.log('Selected date range:', dateRange);
    // You might want to update to activeAccount with new date range
    // or navigate to a date-wise report page
  };
 
  return (
    <>
      <div className="acd-panel">
 
        {/* ── Header ── */}
        <div className="acd-header">
 
          {/* Select Account Button → opens table modal */}
          <button
            className="btn btn-info d-flex align-items-center gap-1"
            onClick={() => setSelectOpen(true)}
          >
            <FiUser size={11} />
            <span className="mx-1">
              {'Account Change'}
            </span>
            <FiChevronDown size={11} />
          </button>
 
          {/* Refresh */}
          <button className="btn btn-success" onClick={() => fetchAccounts(true)}>
            <FiRefreshCw size={12} />
            <span className="ms-1">Refresh (F5)</span>
          </button>
 
        </div>
 
        {/* ── Body ── */}
 
          {/* Loading spinner */}
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <span className="spinner-border spinner-border-sm text-primary" />
            </div>
          )}
 
          {/* No account */}
          {!loading && !activeAccount && (
            <p className="text-center text-muted small py-4 mb-0">No account selected</p>
          )}
 
          {/* ── Active account content ── */}
          {!loading && activeAccount && (
            <>
 
              {/* ── Account Info Row ── */}
              <div className="acd-section">
                <div className="d-flex align-items-start justify-content-between gap-2">
                  <div>
                    <div className="fw-bold">{fmt(activeAccount.account_name)}</div>
                    <div className="text-muted">GST: {fmt(activeAccount.gst_no)}</div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <button className="acd-row-link" onClick={() => setModal('edit')}>
                        <FiEdit2 size={11} /> Edit
                      </button>
                      <span className="text-muted">|</span>
                      <button className="acd-row-link" onClick={() => setModal('add')}>
                        <FiPlusCircle size={11} /> Add New
                      </button>
                    </div>
                  </div>
                </div>
              </div>
 
              <div className="acd-divider" />
 
              <div className="acd-section">
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="text-muted">
                    Fulfilment by <br />
                    <span className="text-danger">SELLER (Change)</span>
                  </span>
                  <span className="acd-platform">meesho</span>
                </div>
              </div>
 
              
              <div className="acd-divider" />

              <div className="d-flex align-items-center justify-content-center gap-3 p-2 bg-dark flex-wrap">
                <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 text-center">
                  <div className="text-white small">
                    From - {selectedDateRange.from ? fmtDate(selectedDateRange.from) : '—'}
                  </div>
                  <div className="text-white small">
                    To - {selectedDateRange.to ? fmtDate(selectedDateRange.to) : todayStr()}
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={handleDateChange}>Change Date</button>
              </div>

              <div className="acd-divider"></div>

              {/* ── account details ── */}

              <div className="px-2 mb-2">
                <div className="custom-box mb-2">
                  <span className="title fw-bold">Account Status</span>

                  <div className="d-flex justify-content-between">
                    <h5 className="text-success">Sales Profits</h5>
                    <h5 className="text-success fw-bold">55000.9</h5>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className='text-small'>Advertisement</span>
                    <span className="text-danger fw-bold">-2000.5</span>
                  </div>
                  <div className="acd-divider"></div>

                  {/* ── Gross profit ── */}
                  <div className="py-2">
                    <div className="d-flex justify-content-between">
                      <h5 className="text-success">Gross Profits</h5>
                      <h5 className="text-success fw-bold">52300.9</h5>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-small">Wrong / Damage / Missing Returns</span>
                      <span className="text-danger fw-bold">-2000.5</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-small">Return Not Received Loss</span>
                      <span className="text-danger fw-bold">-2000.5</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-small">Payment Loss</span>
                      <span className="text-danger fw-bold">-2000.5</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-small">RTO Return Packaging Loss</span>
                      <span className="text-danger fw-bold">-2000.5</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-small">Customer Return Charge Pending</span>
                      <span className="text-danger fw-bold">-2000.5</span>
                    </div>
                  </div>
                  <div className="acd-divider"></div>

                  <div className="px-2 pb-0">
                    <div className="d-flex justify-content-between">
                      <h5 className="text-success">Net Profits (4.8 %)</h5>
                      <h5 className="text-success fw-bold">52300.9</h5>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SKU Row ── */}
              <div className="px-2 pt-0">
                <div className="d-grid">
                 <button className="bg-success text-center text-white px-3 py-2 rounded text-sm font-medium" 
                  onClick={() => {
                    navigate("/sku-list");
                  }}>
                    Total SKU - 334 / Without Cost - 0
                  </button>
                </div>
              </div>

              <div className="d-grid gap-1 pt-2 py-2">
                <div className="d-flex justify-content-around flex-wrap gap-y-2">
                  <SearchButton 
                  onSearch={(searchData) => {
                  }}
                  onClear={() => {
                  }}
                />

                  <div className="text-center">
                    <div className="border rounded p-2 "><FaMoneyBillTrendUp size={24} /></div>
                  </div>
                  <div className="text-center">
                    <div className="border rounded p-2 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowReportModal(true)}>
                      <FaChartBar size={24} />
                    </div>
                    <ReportModal 
                      isOpen={showReportModal} 
                      onClose={() => setShowReportModal(false)} 
                    />
                  </div>
                  <div className="text-center">
                    <div className="border rounded p-2"><FaClipboardList size={24} /></div>
                  </div>
                  <div className="text-center">
                    <div className="border rounded p-2"><FaCog size={24} /></div>
                  </div>
                  <div className="text-center">
                    <div className="border rounded p-2 text-red-600 text-sm">Clear All Search</div>
                  </div>
                </div>

                <div className="custom-box m-2">
                  <span className="title fw-bold">Daily Task</span>
                  <div className="d-flex gap-2 mb-3">
                    <button className="btn bg-warning-subtle w-100 px-3 py-2 rounded text-sm" onClick={() => navigate('/pick-up-entry')}>Pick-up Entry</button>
                    <button className="btn bg-warning-subtle w-100 px-3 py-2 rounded text-sm" onClick={() => setShowReturnModal(true)}>Return Entry</button>
                  </div>
                  
                  <ReturnModal 
                    isOpen={showReturnModal} 
                    onClose={() => setShowReturnModal(false)} 
                  />
                  <div className="d-flex align-items-center">
                    <button className="btn bg-warning-subtle w-100 px-3 py-2 rounded text-sm">Import Data</button>
                    <div className="ms-2 px-3 py-2 bg-warning-subtle">⋮⋮</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      {/* </div> */}

      {/* ── Account Select Table Modal ── */}
      {selectOpen && (
        <AccountSelectModal
          accounts={accounts}
          active={activeAccount}
          onSelect={handleSelect}
          onClose={() => setSelectOpen(false)}
          onDelete={() => fetchAccounts(true)}
          onRefresh={() => fetchAccounts(true)}
        />
      )}

      {/* ── Account Modal (Add / Edit) ── */}
      {modal && (
        <AccountModal
          mode={modal}
          initialData={modal === 'edit' ? activeAccount : null}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); fetchAccounts(true); }}
        />
      )}

      {/* ── Date Section Modal ── */}
      {showDateModal && (
        <DateSectionModal
          isOpen={showDateModal}
          onClose={() => setShowDateModal(false)}
          onDateSelect={handleDateSelect}
        />
      )}
    </>
  );
}


