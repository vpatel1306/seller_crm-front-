import { useState, useRef, useEffect } from 'react';
import {
  FiSearch,
  FiCheck,
  FiAlertCircle,
  FiPackage,
  FiClock,
  FiShoppingBag,
  FiTruck,
  FiArchive,
  FiActivity,
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppShell from './AppShell';
import Button from '../ui/Button';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import OrdersPageHeader from '../orders/OrdersPageHeader';
import api from '../../services/api';

const CONDITION_OPTIONS = [
  { value: 'No Issue In Return', label: 'Healthy', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'I have received wrong return', label: 'Wrong Item', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'Item/s are missing in my return', label: 'Missing', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'CUSTOM', label: 'Other Issue', color: 'bg-slate-100 text-slate-700 border-slate-300' },
];

const ACCEPTED_COLS = [
  {
    key: 'platform_order_id',
    label: 'Order/AWB',
    className: 'w-[160px]',
    render: (row) => (
      <div className="flex flex-col leading-none">
        <span className="font-extrabold text-primary truncate max-w-[150px]" title={row.platform_order_id || row.order_id}>
          {row.platform_order_id || row.order_id || '-'}
        </span>
        <span className="text-[0.55rem] font-mono text-text-muted truncate max-w-[150px]">{row.return_awb || '-'}</span>
      </div>
    )
  },
  { key: 'qty', label: 'Qty', right: true, className: 'w-10', render: (row) => <span className="font-bold text-[0.7rem]">{row.qty || 1}</span> },
  {
    key: 'reason',
    label: 'Status',
    className: 'min-w-[100px]',
    render: (row) => {
      const isHealthy = row.reason === 'No Issue In Return';
      return (
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[0.52rem] font-black uppercase tracking-tight leading-tight text-center ${isHealthy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {row.reason}
        </span>
      );
    }
  },
  {
    key: 'scan_time',
    label: 'Time',
    className: 'w-16 text-right',
    render: (row) => <span className="text-[0.6rem] font-bold text-text-muted">{row.scan_time}</span>
  },
];

const SEARCH_COLS = [
  { key: 'platform_order_id', label: 'Order ID', className: 'w-[140px]', render: (row) => <span className="font-extrabold text-primary truncate block max-w-[130px]">{row.platform_order_id || row.order_id}</span> },
  { key: 'return_awb', label: 'Return AWB', className: 'w-[120px]', render: (row) => <span className="font-mono text-violet-700 truncate block max-w-[110px]">{row.return_awb || '-'}</span> },
  { key: 'sku', label: 'SKU ID', className: 'w-[140px]', render: (row) => <span className="font-bold text-amber-700 truncate block max-w-[130px]">{row.sku || '-'}</span> },
  { key: 'qty', label: 'Qty', right: true, className: 'w-12' },
];

export default function ReturnEntryAccountWise() {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const inputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [condition, setCondition] = useState('No Issue In Return');
  const [reason, setReason] = useState('');

  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [acceptedList, setAcceptedList] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search logic (2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        handleSearch();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setAcceptError('');
    try {
      const res = await api.post('/search-orders', { search: searchQuery.trim() }, {
        headers: { account: activeAccount?.id || '' },
      });
      const data = res.data?.data || res.data || [];
      const results = Array.isArray(data) ? data : [data];
      setSearchResults(results);

      if (results.length === 1) {
        setSelectedOrder(results[0]);
        setSearchQuery('');
        // We keep searchResults if user wants to see the context, 
        // but for single match we can clear to focus on terminal
        setSearchResults([]);
      } else if (results.length === 0) {
        setSearchError('No record found.');
        setSelectedOrder(null);
      }
    } catch {
      setSearchError('Search failed.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRowSelect = (row) => {
    setSelectedOrder(row);
    setCondition('No Issue In Return');
    setReason('');
    setAcceptError('');
    inputRef.current?.focus();
  };

  const handleAcceptReturn = async () => {
    if (!selectedOrder) return;
    setAcceptLoading(true);
    setAcceptError('');
    try {
      const finalReason = condition === 'CUSTOM' ? reason : condition;
      const payload = {
        order_id: selectedOrder.platform_order_id || selectedOrder.order_id,
        reason: finalReason || 'No Issue In Return',
      };

      if (selectedOrder.awb_number) payload.awb_number = selectedOrder.awb_number;

      await api.post('/receive-return', payload, {
        headers: { account: activeAccount?.id || '' },
      });

      const newItem = {
        ...selectedOrder,
        reason: payload.reason,
        scan_time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        id: Date.now()
      };

      setAcceptedList((prev) => [newItem, ...prev]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      setSelectedOrder(null);
      setSearchQuery('');
      setCondition('No Issue In Return');
      setReason('');
      inputRef.current?.focus();
    } catch (err) {
      setAcceptError(err?.response?.data?.message || 'Failed to accept return.');
    } finally {
      setAcceptLoading(false);
    }
  };

  const hasResults = searchResults.length > 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-full space-y-4 px-2 sm:px-0">
        <OrdersPageHeader
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: 'Return Terminal', current: true },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-1.5 text-[0.65rem] font-bold uppercase text-text-muted border border-border shadow-sm">
                <FiArchive size={14} className="text-primary" />
                Session: <span className="text-primary font-black ml-1">{acceptedList.length}</span>
              </div>
              <Button variant="secondary" size="sm" className="bg-white border-slate-300 text-slate-700 font-bold px-4" onClick={() => navigate('/dashboard')}>
                Close
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
          {/* LEFT: SEARCH & MATCHES */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-4">
            <Card title="Search" subtitle="Scan or Type" contentClassName="p-3">
              <div className="space-y-3">
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="h-10 w-full rounded-default border-2 border-border bg-surface-alt pl-10 pr-9 text-xs font-bold outline-none transition-all focus:border-primary focus:bg-white"
                        placeholder="Scan or Search..."
                      />
                      <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />

                      {searchQuery && !searchLoading && (
                        <button
                          onClick={() => { setSearchQuery(''); setSearchResults([]); inputRef.current?.focus(); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:bg-slate-200 hover:text-text transition-colors"
                        >
                          <FiX size={14} />
                        </button>
                      )}

                      {searchLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                    </div>
                    <Button variant="primary" size="sm" className="h-10 px-3 shrink-0" onClick={handleSearch} loading={searchLoading}>
                      <FiSearch size={16} />
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 divide-y divide-border/30"
                    >
                      <div className="px-1 py-2 flex items-center justify-between border-b border-border/20">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                          <span className="text-[0.55rem] font-black uppercase tracking-widest text-text-muted">
                            Matches ({searchResults.length})
                          </span>
                        </div>
                        <button
                          onClick={() => setSearchResults([])}
                          className="text-[0.5rem] font-black uppercase text-text-muted hover:text-primary transition-colors"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="max-h-[calc(100vh-360px)] overflow-y-auto custom-scrollbar">
                        {searchResults.map((row, idx) => {
                          const isSelected = selectedOrder?.platform_order_id === row.platform_order_id || selectedOrder?.order_id === row.order_id;
                          return (
                            <button
                              key={row.platform_order_id || row.order_id || idx}
                              onClick={() => handleRowSelect(row)}
                              className={`group relative w-full text-left transition-all duration-150 rounded-default mt-1 ${isSelected ? 'bg-primary/5 shadow-sm' : 'bg-transparent hover:bg-surface-alt hover:shadow-sm'
                                }`}
                            >
                              <div className="px-3 py-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FiPackage className={`shrink-0 ${isSelected ? 'text-primary' : 'text-slate-400'}`} size={12} />
                                    <span className={`font-mono text-[0.7rem] font-bold tracking-tight truncate transition-colors ${isSelected ? 'text-primary' : 'text-text'}`}>
                                      {row.platform_order_id || row.order_id}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10">
                                      <FiCheck className="text-primary" size={10} strokeWidth={3} />
                                    </div>
                                  )}
                                </div>

                                <div className="mt-1.5 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[0.55rem] font-black uppercase text-text-muted/60 tracking-tighter">SKU</span>
                                    <span className="text-[0.6rem] font-bold text-text-muted truncate max-w-[120px]">
                                      {row.sku || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[0.55rem] font-black uppercase text-text-muted/60">Qty</span>
                                    <span className={`text-[0.6rem] font-black ${isSelected ? 'text-primary' : 'text-text'}`}>
                                      {row.qty || 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!hasResults && !searchQuery && (
                  <div className="py-10 flex flex-col items-center justify-center opacity-30 border-t border-border border-dashed">
                    <FiPackage size={32} className="text-text-muted mb-2" />
                    <p className="text-[0.55rem] font-bold uppercase tracking-tighter">Waiting for scan</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* CENTER: DETAILS & ACTION */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key="order-details"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                >
                  <Card title="Order Details" subtitle="Review and Accept Return">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Order ID', value: selectedOrder.platform_order_id || selectedOrder.order_id, icon: <FiShoppingBag size={14} />, color: 'text-primary' },
                          { label: 'Pickup AWB', value: selectedOrder.awb_number, icon: <FiTruck size={14} />, color: 'text-violet-600' },
                          { label: 'Return AWB', value: selectedOrder.return_awb, icon: <FiArchive size={14} />, color: 'text-emerald-600' },
                          { label: 'Order Date', value: selectedOrder.order_date, icon: <FiClock size={14} />, color: 'text-slate-600' },
                        ].map((item) => (
                          <div key={item.label} className="rounded-default border border-border bg-surface-alt/30 p-3 shadow-sm hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2 text-[0.6rem] font-black uppercase text-text-muted mb-1">
                              {item.icon} {item.label}
                            </div>
                            <div className={`text-sm font-black truncate ${item.color}`}>{item.value || '-'}</div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-default border border-amber-200 bg-amber-50/50 p-4 border-dashed">
                        <div className="flex items-center gap-2 text-[0.6rem] font-black uppercase text-amber-700 mb-2">
                          <FiPackage size={14} /> SKU & Product Info
                        </div>
                        <div className="text-[0.85rem] font-black text-amber-900 leading-tight">
                          {selectedOrder.sku || 'N/A'}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[0.65rem] font-bold bg-amber-200/50 text-amber-800 px-2 py-0.5 rounded-full uppercase">Quantity: {selectedOrder.qty || 1}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[0.7rem] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                          <FiActivity size={14} /> Select Received Condition
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {CONDITION_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => { setCondition(opt.value); if (opt.value !== 'CUSTOM') setReason(''); }}
                              className={`group relative overflow-hidden rounded-default border p-4 text-left transition-all ${condition === opt.value
                                ? `${opt.color} ring-4 ring-primary/5 border-primary shadow-md scale-[1.02]`
                                : 'border-border bg-white text-text-muted hover:border-primary/30'
                                }`}
                            >
                              <div className="text-[0.75rem] font-black uppercase tracking-tight">{opt.label}</div>
                              <div className={`mt-1 text-[0.6rem] ${condition === opt.value ? 'opacity-80' : 'opacity-40'} group-hover:opacity-80`}>
                                Mark as {opt.label.toLowerCase()}
                              </div>
                              {condition === opt.value && (
                                <div className="absolute right-2 top-2">
                                  <FiCheck className="text-primary" size={16} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {condition === 'CUSTOM' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                          <label className="text-[0.65rem] font-black uppercase text-text-muted">Specify Issue Details</label>
                          <textarea
                            autoFocus
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter specific return issue..."
                            className="w-full h-24 rounded-default border-2 border-border bg-white p-3 text-sm font-bold outline-none focus:border-primary transition-all resize-none"
                          />
                        </div>
                      )}

                      {acceptError && (
                        <div className="rounded-default bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-600 flex items-center gap-3">
                          <FiAlertCircle size={20} className="shrink-0" />
                          <div>{acceptError}</div>
                        </div>
                      )}

                      <Button
                        variant="success"
                        size="lg"
                        className="w-full text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 py-6"
                        loading={acceptLoading}
                        onClick={handleAcceptReturn}
                      >
                        Accept Return
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-10 rounded-default border-2 border-dashed border-border bg-surface-alt/20">
                  <div className="rounded-full bg-white p-8 shadow-xl shadow-slate-200/50 mb-6">
                    <FiSearch size={64} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">No Order Selected</h3>
                  <p className="mt-2 text-slate-500 font-medium max-w-[250px] leading-relaxed">
                    Search and select an order from the left panel to begin processing.
                  </p>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                >
                  <div className="rounded-full bg-emerald-500 px-8 py-4 text-white shadow-2xl shadow-emerald-500/40 flex items-center gap-3 border-2 border-emerald-400">
                    <FiCheck size={24} strokeWidth={4} />
                    <span className="text-lg font-black uppercase tracking-tighter">Received Successfully</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: RECENT ACTIVITY */}
          <div className="lg:col-span-4">
            <Card
              title={`Activity (${acceptedList.length})`}
              subtitle="Current Session Log"
              contentClassName="p-0"
            >
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                <DataTable
                  columns={ACCEPTED_COLS}
                  data={acceptedList}
                  loading={false}
                  emptyText="No items processed."
                  mobileCardView={false}
                  showIndex
                  wrapperClassName="rounded-b-default"
                  tableClassName="min-w-full"
                  headClassName="bg-surface-alt/50 sticky top-0 z-10"
                  headerCellClassName="px-4 py-3 text-[0.6rem] font-black uppercase tracking-widest text-text-muted border-b border-border"
                  cellClassName="px-4 py-3 border-b border-border/40 text-[0.7rem]"
                  hoverClass="hover:bg-slate-50"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
