import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import OrdersPageHeader from '../orders/OrdersPageHeader';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppShell from '../layout/AppShell';
import Button from '../ui/Button';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';

const TABLE_COLUMNS = [
  { key: 'order_no', label: 'Order No.' },
  { key: 'po_number', label: 'PO Number' },
  { key: 'invoice_no', label: 'Invoice No.' },
  { key: 'order_date', label: 'Order Date' },
  { key: 'invoice_date', label: 'Invoice Date' },
  { key: 'customer_name', label: 'Customer Name' },
  {
    key: 'full_address',
    label: 'Full Address',
    className: 'min-w-[260px] whitespace-normal',
    render: (row) => <div className="min-w-[260px] whitespace-normal text-xs">{row.full_address || '—'}</div>,
  },
  { key: 'sku_name', label: 'SKU Name' },
  { key: 'size', label: 'Size' },
  { key: 'qty', label: 'Qty', right: true },
  { key: 'color', label: 'Color' },
  { key: 'grand_total', label: 'Grand Total', right: true },
  {
    key: 'order_items_summary',
    label: 'Order Items',
    className: 'min-w-[260px] whitespace-normal',
    render: (row) => <div className="min-w-[260px] whitespace-normal text-xs">{row.order_items_summary || '—'}</div>,
  },
];

const formatOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return '—';
  return items.map((item) => `${item?.product || 'Item'} | Qty: ${item?.qty ?? '—'} | Total: ${item?.total ?? '—'}`).join(' ; ');
};

export default function PickUpEntry() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { activeAccount } = useAuth();
  const activeAccountId = activeAccount?.id;
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedRows, setUploadedRows] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const tableRows = useMemo(
    () =>
      uploadedRows.map((row, index) => ({
        ...row,
        id: row?.order_no || row?.invoice_no || `${index}`,
        order_items_summary: formatOrderItems(row?.order_items),
      })),
    [uploadedRows]
  );

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF files are allowed.');
      setSuccessMessage('');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload-label', formData, {
        headers: { account: activeAccountId },
      });

      const responseData = response?.data || {};
      if (responseData?.status === false) throw new Error(responseData?.message || 'Upload failed.');

      const rows = responseData?.data || [];
      setUploadedRows(Array.isArray(rows) ? rows : []);
      setUploadedFileName(file.name);
      setSuccessMessage(responseData?.message || 'PDF uploaded successfully.');
    } catch (error) {
      setUploadedRows([]);
      setUploadedFileName('');
      setErrorMessage(error?.message || 'PDF upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileUpload}
        />

        <OrdersPageHeader
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: 'PickUp Entry', current: true },
          ]}
          actions={
            <div className="flex items-center gap-3 flex-wrap">
              {uploadedFileName ? (
                <span className="text-xs font-bold text-text-muted">
                  File: <span className="text-text normal-case">{uploadedFileName}</span>
                </span>
              ) : null}
              <Button
                variant="primary"
                size="sm"
                loading={isUploading}
                disabled={!activeAccountId || isUploading}
                onClick={() => !isUploading && activeAccountId && fileInputRef.current?.click()}
              >
                <FiUploadCloud size={14} />
                {isUploading ? 'Uploading...' : 'Upload Label'}
              </Button>
            </div>
          }
        />

        {errorMessage ? (
          <div className="flex items-center gap-2 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <FiAlertCircle size={16} />
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-center gap-2 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <FiCheckCircle size={16} />
            {successMessage}
          </div>
        ) : null}

        <Card
          title="Pick-up Entry Preview h-auto"
          subtitle={`Total Rows: ${tableRows.length}`}
          contentClassName="p-0"
        >
          <DataTable
            columns={TABLE_COLUMNS}
            data={tableRows}
            loading={isUploading}
            loadingText="Processing PDF..."
            emptyText="Upload a PDF label file to preview contents"
            mobileCardView={false}
            showIndex
            wrapperClassName="rounded-b-default"
            tableClassName="min-w-[1400px]"
            headClassName="sticky top-0 z-10 bg-amber-50/95 text-amber-800 backdrop-blur"
            headerCellClassName="px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] whitespace-nowrap border-b border-amber-100"
            indexHeaderClassName="w-10 border-b border-amber-100 px-3 py-3 text-center text-[0.68rem] font-extrabold"
            cellClassName="px-4 py-3 whitespace-nowrap text-xs text-text"
          />
        </Card>

        <div className="flex items-center gap-2 text-[0.68rem] font-bold text-amber-600 uppercase tracking-widest">
          <FiCheckCircle size={12} className="opacity-50" />
          * Please verify all entries before committing to import
        </div>
      </div>
    </AppShell>
  );
}
