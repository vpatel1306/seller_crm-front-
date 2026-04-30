import { useState } from 'react';
import { BsArrowLeftCircleFill } from 'react-icons/bs';
import { FiCheckCircle, FiRefreshCcw, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppShell from './AppShell';
import Button from '../ui/Button';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import OrdersPageHeader from '../orders/OrdersPageHeader';
import api from '../../services/api';

const CONDITION_OPTIONS = [
  { value: '', label: 'No Issue In Return' },
  { value: 'I have received wrong return', label: 'I have received wrong return' },
  { value: 'Item/s are missing in my return', label: 'Item/s are missing in my return' },
];

const SEARCH_COLS = [
  { key: 'order_date', label: 'Date', className: 'min-w-[100px]', render: (row) => <span className="text-text-muted">{row.order_date || '-'}</span> },
  { key: 'platform_order_id', label: 'Order#', className: 'min-w-[200px]', render: (row) => <span className="font-extrabold text-primary">{row.platform_order_id || '-'}</span> },
  { key: 'return_awb', label: 'Return AWB', className: 'min-w-[160px]', render: (row) => <span className="text-violet-700">{row.return_awb || '-'}</span> },
  { key: 'return_courier', label: 'R-Courier', className: 'min-w-[120px]' },
  { key: 'awb_number', label: 'Pickup AWB', className: 'min-w-[160px]', render: (row) => <span className="text-violet-700">{row.awb_number || '-'}</span> },
  { key: 'courier_partner', label: 'P-Courier', className: 'min-w-[120px]' },
  { key: 'return_create_date', label: 'Return Create', className: 'min-w-[120px]' },
  { key: 'qty', label: 'Qty', right: true, className: 'min-w-[60px]', render: (row) => <span className="tabular-nums">{row.qty ?? '-'}</span> },
  { key: 'sku', label: 'SKU ID', className: 'min-w-[180px]', render: (row) => <span className="font-semibold text-amber-700">{row.sku || '-'}</span> },
  { key: 'position', label: 'Position', className: 'min-w-[100px]' },
];

const ACCEPTED_COLS = [
  { key: 'platform_order_id', label: 'Order/AWB', className: 'min-w-[200px]', render: (row) => <span className="font-extrabold text-primary">{row.platform_order_id || row.order_id || '-'}</span> },
  { key: 'order_date', label: 'Date', className: 'min-w-[100px]', render: (row) => <span className="text-text-muted">{row.order_date || '-'}</span> },
  { key: 'return_awb', label: 'Return AWB', className: 'min-w-[160px]', render: (row) => <span className="text-violet-700">{row.return_awb || '-'}</span> },
  { key: 'qty', label: 'Qty', right: true, className: 'min-w-[60px]' },
  { key: 'reason', label: 'Issue', className: 'min-w-[180px]', render: (row) => <span className="text-text-muted">{row.reason || 'No Issue'}</span> },
  { key: 'scan_time', label: 'Scan Time', className: 'min-w-[140px]', render: (row) => <span className="text-text-muted">{row.scan_time || new Date().toLocaleString('en-IN')}</span> },
];

export default function ReturnEntryAccountWise() {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [condition, setCondition] = useState('');
  const [reason, setReason] = useState('');

  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [acceptedList, setAcceptedList] = useState([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSelectedOrder(null);
    setCondition('');
    setReason('');
    try {
      const res = await api.post('/search-orders', { search: searchQuery.trim() }, {
        headers: { account: activeAccount?.id || '' },
      });
      const data = res.data?.data || res.data || [];
      setSearchResults(Array.isArray(data) ? data : [data]);
    } catch {
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRowSelect = (row) => {
    setSelectedOrder(row);
    setCondition('');
    setReason('');
    setAcceptError('');
  };

  const handleAcceptReturn = async () => {
    if (!selectedOrder) return;
    setAcceptLoading(true);
    setAcceptError('');
    try {
      const payload = {
        order_id: selectedOrder.platform_order_id || selectedOrder.order_id,
        reason: reason || condition || 'No Issue In Return',
      };
      if (selectedOrder.awb_number) payload.awb_number = selectedOrder.awb_number;

      const res = await api.post('/receive-return', payload, {
        headers: { account: activeAccount?.id || '' },
      });

      const responseData = res.data?.data || res.data || {};
      setAcceptedList((prev) => [
        { ...selectedOrder, ...responseData, reason: payload.reason, scan_time: new Date().toLocaleString('en-IN'), id: Date.now() },
        ...prev,
      ]);
      setSelectedOrder(null);
      setSearchQuery('');
      setSearchResults([]);
      setCondition('');
      setReason('');
    } catch (err) {
      setAcceptError(err?.response?.data?.message || err?.response?.data?.detail || 'Accept return failed.');
    } finally {
      setAcceptLoading(false);
    }
  };

  const canAccept = Boolean(selectedOrder);
  const isCustomReason = condition !== '' && condition !== 'No Issue In Return';

  return (
    <AppShell>
      <div className="space-y-4">
        <OrdersPageHeader
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: 'Return Entry (Account Wise)', current: true },
          ]}
          actions={
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>Close</Button>
          }
        />

        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12">
          {/* LEFT - Accepted Table */}
          <div className="lg:col-span-7">
            <Card
              title="Accepted Returns"
              subtitle={`${acceptedList.length} returns accepted this session`}
              contentClassName="p-0"
            >
              <DataTable
                columns={ACCEPTED_COLS}
                data={acceptedList}
                loading={false}
                emptyText="Waiting for scans..."
                mobileCardView={false}
                showIndex
                wrapperClassName="rounded-b-default"
                tableClassName="min-w-[700px]"
                headClassName="sticky top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
                headerCellClassName="px-3 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap border-b border-border"
                cellClassName="px-3 py-3 whitespace-nowrap text-xs text-text"
                hoverClass="hover:bg-surface-alt"
              />
            </Card>
          </div>

          {/* CENTER ARROW */}
          <div className="hidden lg:col-span-1 lg:flex flex-col items-center justify-center">
            <div className="text-center">
              <BsArrowLeftCircleFill size={48} className="text-red-500 animate-pulse" />
              <div className="text-red-600 font-black text-3xl mt-2">{acceptedList.length}</div>
              <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Accepted</div>
            </div>
          </div>

          {/* RIGHT - Inputs */}
          <div className="lg:col-span-4">
            <Card title="Scan Terminal" subtitle="Search order then accept return">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-wide">AWB / Order No. / Pack QR</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 rounded-[14px] border border-border bg-surface-alt px-4 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all"
                      placeholder="Scan or type here..."
                    />
                    <Button variant="primary" size="sm" loading={searchLoading} onClick={handleSearch}>
                      <FiSearch size={14} />
                    </Button>
                  </div>
                  {searchError ? <p className="text-xs text-rose-600 font-medium">{searchError}</p> : null}
                </div>

                {/* Order Info Preview */}
                <div className="grid grid-cols-2 gap-3 rounded-[16px] border border-dashed border-border bg-surface-alt/50 p-4">
                  {[
                    { label: 'Order#', value: selectedOrder?.platform_order_id || selectedOrder?.order_id },
                    { label: 'Date', value: selectedOrder?.order_date },
                    { label: 'AWB#', value: selectedOrder?.awb_number },
                    { label: 'Courier', value: selectedOrder?.courier_partner },
                    { label: 'SKU', value: selectedOrder?.sku },
                    { label: 'Qty', value: selectedOrder?.qty },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-0.5">
                      <span className="text-[0.6rem] font-bold text-text-muted uppercase block">{label}</span>
                      <span className={`text-[0.72rem] font-mono ${value ? 'text-text font-semibold' : 'text-text-muted italic'}`}>
                        {value || 'Pending...'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Received Condition */}
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-wide">Received Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => { setCondition(e.target.value); setReason(''); }}
                    disabled={!canAccept}
                    className="w-full rounded-[14px] border border-border bg-white px-4 py-2.5 text-sm font-medium text-text outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                  >
                    {CONDITION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Reason text input — shown when custom condition selected */}
                {isCustomReason ? (
                  <div className="space-y-1.5">
                    <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-wide">Reason</label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Describe the issue..."
                      className="w-full rounded-[14px] border border-border bg-surface-alt px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all"
                    />
                  </div>
                ) : null}

                {acceptError ? (
                  <p className="rounded-[12px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{acceptError}</p>
                ) : null}

                <div className="flex flex-1 gap-2 pt-2">
                  <Button
                    variant="success"
                    className="w-full"
                    disabled={!canAccept}
                    loading={acceptLoading}
                    onClick={handleAcceptReturn}
                  >
                    <FiCheckCircle size={14} />
                    Accept Return
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={() => navigate('/dashboard')}>
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* BOTTOM - Search Results */}
        <Card
          title="Search Results"
          subtitle={searchResults.length ? `${searchResults.length} record(s) found — click a row to select` : 'Search for records to display data'}
          contentClassName="p-0"
          action={
            searchResults.length ? (
              <Button variant="secondary" size="sm" onClick={() => { setSearchResults([]); setSelectedOrder(null); setSearchQuery(''); }}>
                Clear
              </Button>
            ) : null
          }
        >
          <DataTable
            columns={SEARCH_COLS}
            data={searchResults.map((r, i) => ({ ...r, id: r.platform_order_id || r.order_id || i }))}
            loading={searchLoading}
            loadingText="Searching..."
            emptyText="Search for records to display data"
            mobileCardView={false}
            showIndex
            selectedId={selectedOrder?.platform_order_id || selectedOrder?.order_id}
            getRowId={(row) => row.platform_order_id || row.order_id}
            onRowClick={handleRowSelect}
            wrapperClassName="rounded-b-default"
            tableClassName="min-w-[1000px]"
            headClassName="sticky top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
            headerCellClassName="px-3 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap border-b border-border"
            cellClassName="px-3 py-3 whitespace-nowrap text-xs text-text"
            selectedClass="bg-primary/10 text-text"
            hoverClass="hover:bg-surface-alt"
          />
        </Card>
      </div>
    </AppShell>
  );
}
