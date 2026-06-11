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
  FiX,
  FiCamera
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
import ReturnScannerModal from './ReturnScannerModal';
import CommonModal from '../common/CommonModal';

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
  const isMobileScanner = localStorage.getItem('isMobileScannerSession') === 'true';

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedAwbSession, setScannedAwbSession] = useState([]);
  const [recentReturnsData, setRecentReturnsData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Reset scanner session when modal opens
  useEffect(() => {
    if (isScannerOpen) {
      setScannedAwbSession([]);
      setRecentReturnsData(null);
    }
  }, [isScannerOpen]);

  const fetchRecentReturns = async (awbNumbers) => {
    setSummaryLoading(true);
    setIsSummaryOpen(true);
    try {
      const response = await api.post('/get-recent-returns', {
        awb_numbers: awbNumbers
      }, {
        headers: { account: activeAccount?.id || '' },
      });
      setRecentReturnsData(response.data);
    } catch (err) {
      console.error("Failed to fetch recent returns:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleScannerClose = async () => {
    setIsScannerOpen(false);
    if (scannedAwbSession.length > 0) {
      await fetchRecentReturns(scannedAwbSession);
    }
  };

  // Auto-focus on mount and auto-open camera scanner on mobile sessions
  useEffect(() => {
    inputRef.current?.focus();
    if (isMobileScanner) {
      setIsScannerOpen(true);
    }
  }, [isMobileScanner]);

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
  
  const handleScanSuccess = (awb, responseData) => {
    const orderData = responseData?.data || responseData?.order || {};
    const newItem = {
      id: Date.now(),
      platform_order_id: orderData.platform_order_id || orderData.order_id || 'Scanned Return',
      order_id: orderData.order_id || 'Scanned Return',
      return_awb: awb,
      qty: orderData.qty || 1,
      reason: 'Scanned Return Parcel',
      scan_time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setAcceptedList((prev) => [newItem, ...prev]);

    // Track scanned AWB numbers in the session state
    setScannedAwbSession((prev) => {
      if (awb && !prev.includes(awb)) {
        return [...prev, awb];
      }
      return prev;
    });
  };

  const hasResults = searchResults.length > 0;

  const returnsList = recentReturnsData?.data || [];
  const totalScanned = scannedAwbSession.length;
  const totalFound = returnsList.length;
  
  // Find which scanned AWBs were not found in the recent returns API response
  const foundAwbs = returnsList.map(r => (r.awb_number || '').toLowerCase().trim());
  const unmatchedAwbs = scannedAwbSession.filter(awb => awb && !foundAwbs.includes(awb.toLowerCase().trim()));

  const totalRto = returnsList.filter(r => (r.return_type || '').toUpperCase() === 'RTO').length;
  const totalCustReturn = returnsList.filter(r => (r.return_type || '').toUpperCase() !== 'RTO').length;
  const totalValue = returnsList.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-full space-y-4 px-2 sm:px-0">
        <OrdersPageHeader
          breadcrumbs={isMobileScanner ? [
            { label: 'Return Terminal', current: true },
          ] : [
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: 'Return Terminal', current: true },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-2 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                onClick={() => setIsScannerOpen(true)}
              >
                <FiCamera size={14} />
                <span>Scan Return Parcel</span>
              </Button>
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-1.5 text-[0.65rem] font-bold uppercase text-text-muted border border-border shadow-sm">
                <FiArchive size={14} className="text-primary" />
                Session: <span className="text-primary font-black ml-1">{acceptedList.length}</span>
              </div>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div className="h-full min-h-[250px] lg:min-h-[500px] flex flex-col items-center justify-center text-center p-6 sm:p-10 rounded-default border-2 border-dashed border-border bg-surface-alt/20">
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
                  showIndex
                  wrapperClassName="rounded-b-default"
                  tableClassName="min-w-full"
                  headClassName="bg-surface-alt/50 sticky top-0 z-10"
                  headerCellClassName="px-2.5 py-2 text-[0.62rem] font-black uppercase tracking-widest text-text-muted border-b border-border"
                  cellClassName="px-2.5 py-2 border-b border-border/40 text-xs"
                  hoverClass="hover:bg-slate-50"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <ReturnScannerModal
        isOpen={isScannerOpen}
        onClose={handleScannerClose}
        onScanSuccess={handleScanSuccess}
      />

      <CommonModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        title="Scanned Returns Session Summary"
        size="xl"
        headerStyle="gradient"
        footerButtons={[
          {
            label: 'Done',
            type: 'primary',
            onClick: () => setIsSummaryOpen(false),
          }
        ]}
      >
        {summaryLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
              Fetching return details from API...
            </p>
          </div>
        ) : recentReturnsData ? (
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-wider">Total Scanned</span>
                <span className="text-xl font-black text-slate-800 mt-1">{totalScanned}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                <span className="text-[0.6rem] font-black text-emerald-500 uppercase tracking-wider">Matched Returns</span>
                <span className="text-xl font-black text-emerald-700 mt-1">{totalFound}</span>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                <span className="text-[0.6rem] font-black text-blue-500 uppercase tracking-wider">RTO Count</span>
                <span className="text-xl font-black text-blue-700 mt-1">{totalRto}</span>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                <span className="text-[0.6rem] font-black text-violet-500 uppercase tracking-wider">Cust Returns</span>
                <span className="text-xl font-black text-violet-700 mt-1">{totalCustReturn}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[0.6rem] font-black text-amber-500 uppercase tracking-wider">Total Value</span>
                <span className="text-xl font-black text-amber-700 mt-1">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Unmatched Warning Alert */}
            {unmatchedAwbs.length > 0 && (
              <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase mb-2">
                  <FiAlertCircle size={16} className="text-rose-500 animate-pulse" />
                  <span>Unmatched AWB Numbers ({unmatchedAwbs.length}) - Not Found in Database</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {unmatchedAwbs.map((awb) => (
                    <span key={awb} className="px-2.5 py-1 bg-white text-rose-600 font-mono text-[0.7rem] font-bold rounded-lg border border-rose-200 shadow-sm">
                      {awb}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details Table */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Return Order Details
                </h4>
                <span className="text-[0.65rem] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Showing {totalFound} records
                </span>
              </div>

              {returnsList.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider">
                  No return parcel details were retrieved.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto max-h-[400px] [scrollbar-width:thin]">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3.5 text-left text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Order / AWB</th>
                          <th className="px-4 py-3.5 text-left text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">SKU & Qty</th>
                          <th className="px-4 py-3.5 text-left text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Courier</th>
                          <th className="px-4 py-3.5 text-left text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Type</th>
                          <th className="px-4 py-3.5 text-left text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="px-4 py-3.5 text-right text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                          <th className="px-4 py-3.5 text-left text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Dates</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {returnsList.map((item, idx) => {
                          const isRto = (item.return_type || '').toUpperCase() === 'RTO';
                          const statusText = item.status || 'Return Received';
                          const isSuccessStatus = statusText.toLowerCase().includes('received') || statusText.toLowerCase().includes('delivered');

                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-slate-800 text-xs">{item.platform_order_id || 'N/A'}</span>
                                  <span className="font-mono text-[0.65rem] text-slate-400 mt-0.5 select-all">{item.awb_number || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col max-w-[160px]">
                                  <span className="font-bold text-slate-700 text-xs truncate" title={item.sku}>{item.sku || 'N/A'}</span>
                                  <span className="text-[0.65rem] text-slate-400 mt-0.5">Qty: <span className="font-extrabold text-slate-600">{item.qty || 1}</span></span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-[0.65rem] font-black uppercase text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">
                                  {item.courier_partner || 'PocketShip'}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider ${
                                  isRto 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                    : 'bg-violet-50 text-violet-700 border border-violet-100'
                                }`}>
                                  {item.return_type || 'RTO'}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider ${
                                  isSuccessStatus 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {statusText}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex flex-col items-end">
                                  <span className="text-xs font-black text-slate-800">₹{Number(item.total_amount || 0).toFixed(2)}</span>
                                  {Number(item.cost_amount) > 0 && (
                                    <span className="text-[0.6rem] text-slate-400 mt-0.5">Cost: ₹{Number(item.cost_amount).toFixed(2)}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col text-[0.65rem] text-slate-500 leading-normal">
                                  <div>Order: <span className="text-slate-700 font-bold">{formatDate(item.order_date)}</span></div>
                                  <div>Delivered: <span className="text-slate-700 font-bold">{formatDate(item.return_delivered || item.return_date)}</span></div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            No return details found.
          </div>
        )}
      </CommonModal>
    </AppShell>
  );
}
