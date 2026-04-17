import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiDownload,
  FiEdit2,
  FiFilter,
  FiInfo,
  FiPackage,
  FiPlusCircle,
  FiRotateCcw,
  FiSettings,
  FiUpload,
  FiX,
} from 'react-icons/fi';
import api from '../services/api';
import SKUCostModal from '../components/layout/SKUCostModal';
import { useAuth } from '../context/AuthContext';
import CommonModal from '../components/common/CommonModal';
import AppShell from '../components/layout/AppShell';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DataTable from '../components/ui/DataTable';

const FILTER_FIELDS = [
  { key: 'keyword1', label: 'SKU Keyword' },
  { key: 'size', label: 'Size' },
];

const initialAddSkuForm = {
  sku_id: '',
  product_name: '',
  box_size: '',
  basic_cost: '',
  gst_percentage: '18',
  packing_charge: '',
};

const initialQuickFilters = {
  keyword1: '',
  keyword2: '',
  keyword3: '',
  size: '',
  minSelling: '',
  maxSelling: '',
  minCost: '',
  maxCost: '',
};

const calculateFinalCost = (item) => {
  const basic = Number(item.basic_cost) || 0;
  const gst = Number(item.gst_percentage) || 0;
  const packing = Number(item.packing_charge) || 0;
  return basic + (basic * gst / 100) + packing;
};

const formatCurrency = (value) => `Rs. ${(Number(value) || 0).toFixed(2)}`;
const PRODUCT_NAME_WORD_LIMIT = 4;

export default function SkuList() {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const [showSKUCostModal, setShowSKUCostModal] = useState(false);
  const [showAddSkuModal, setShowAddSkuModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [skuList, setSkuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addSkuSubmitting, setAddSkuSubmitting] = useState(false);
  const [addSkuError, setAddSkuError] = useState('');
  const [addSkuForm, setAddSkuForm] = useState(initialAddSkuForm);
  const [editingSku, setEditingSku] = useState(null);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [productInfoSku, setProductInfoSku] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSKUs, setTotalSKUs] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [skuFilter, setSkuFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('this-account');
  const [quickFilters, setQuickFilters] = useState(initialQuickFilters);

  const accountName = activeAccount?.account_name || 'No account selected';
  const activeAccountId = activeAccount?.id;
  const accountHeaderValue = accountFilter === 'all-accounts' ? null : activeAccountId;

  const getNumericCount = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  };

  const resetAddSkuForm = () => {
    setAddSkuForm(initialAddSkuForm);
    setAddSkuError('');
    setEditingSku(null);
  };

  const handleClearFilters = () => {
    setQuickFilters(initialQuickFilters);
    setSkuFilter('all');
    setAccountFilter('this-account');
    setCurrentPage(1);
  };

  const fetchSkuList = useCallback(async (page = 1, perPageCount = perPage) => {
    if (accountFilter === 'this-account' && !activeAccount?.id) {
      setSkuList([]);
      setTotalSKUs(0);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    try {
      const skip = (page - 1) * perPageCount;
      const response = await api.get(`/sku-list/?skip=${skip}&limit=${perPageCount}&page=${page}`, {
        headers: {
          account: accountHeaderValue,
        },
      });

      const payload = response.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload)
            ? payload
            : [];

      const total =
        getNumericCount(payload?.total_count) ??
        getNumericCount(payload?.total) ??
        getNumericCount(payload?.count) ??
        list.length;

      const resolvedPage = getNumericCount(payload?.current_page) ?? page;
      const resolvedTotalPages =
        getNumericCount(payload?.total_pages) ??
        (total > 0 ? Math.ceil(total / perPageCount) : 0);

      setSkuList(list);
      setTotalSKUs(total);
      setTotalPages(Math.max(resolvedTotalPages, 1));
      setCurrentPage(resolvedPage);
    } catch {
      setSkuList([]);
      setTotalSKUs(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [accountFilter, accountHeaderValue, activeAccount?.id, perPage]);

  useEffect(() => {
    fetchSkuList();
  }, [fetchSkuList]);

  useEffect(() => {
    if (!showMobileFilters) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showMobileFilters]);

  const filteredSkuList = useMemo(() => {
    return skuList.filter((item) => {
      const finalCost = calculateFinalCost(item);
      const selling = Number(item.selling) || 0;

      if (skuFilter === 'without-cost' && finalCost > 0) return false;
      if (skuFilter === 'cost-set' && finalCost <= 0) return false;

      const keywordChecks = [quickFilters.keyword1, quickFilters.keyword2, quickFilters.keyword3]
        .filter(Boolean)
        .every((keyword) =>
          [item.sku_id, item.product_name, item.box_size]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(keyword.toLowerCase())
        );

      if (!keywordChecks) return false;
      if (quickFilters.size && !(item.box_size || '').toLowerCase().includes(quickFilters.size.toLowerCase())) return false;
      if (quickFilters.minSelling && selling < Number(quickFilters.minSelling)) return false;
      if (quickFilters.maxSelling && selling > Number(quickFilters.maxSelling)) return false;
      if (quickFilters.minCost && finalCost < Number(quickFilters.minCost)) return false;
      if (quickFilters.maxCost && finalCost > Number(quickFilters.maxCost)) return false;

      return true;
    });
  }, [quickFilters, skuFilter, skuList]);

  const resultStart = totalSKUs === 0 ? 0 : ((currentPage - 1) * perPage) + 1;
  const resultEnd = totalSKUs === 0 ? 0 : Math.min(currentPage * perPage, totalSKUs);
  const activeQuickFilterCount = Object.values(quickFilters).filter(Boolean).length + (skuFilter !== 'all' ? 1 : 0) + (accountFilter !== 'this-account' ? 1 : 0);

  const handleRowClick = (sku) => {
    setSelectedSKU(sku);
    setSelectedRowId(sku.id || sku.sku_id);
  };

  const handleEditSku = (sku) => {
    setEditingSku(sku);
    setAddSkuError('');
    setAddSkuForm({
      sku_id: sku.sku_id || '',
      product_name: sku.product_name || '',
      box_size: sku.box_size || '',
      basic_cost: sku.basic_cost ?? '',
      gst_percentage: sku.gst_percentage ?? '18',
      packing_charge: sku.packing_charge ?? '',
    });
    setShowAddSkuModal(true);
  };

  const handleOpenSkuCost = (sku) => {
    setSelectedSKU(sku);
    setSelectedRowId(sku.id || sku.sku_id);
    setShowSKUCostModal(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchSkuList(page, perPage);
    }
  };

  const exportToCSV = () => {
    const headers = ['SKU ID', 'Size', 'Orders', 'Selling', 'Basic Cost', 'GST %', 'Packing', 'Final Cost', 'Last Update'];
    const csvData = filteredSkuList.map((item) => [
      item.sku_id || '-',
      item.box_size || 'Free Size',
      item.orders || 0,
      item.selling || 0,
      item.basic_cost || 0,
      item.gst_percentage || 0,
      item.packing_charge || 0,
      calculateFinalCost(item).toFixed(2),
      item.updated_at || '-',
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sku_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSkuInputChange = (key, value) => {
    setAddSkuForm((prev) => ({ ...prev, [key]: value }));
    if (addSkuError) {
      setAddSkuError('');
    }
  };

  const handleCloseAddSkuModal = () => {
    setShowAddSkuModal(false);
    setAddSkuSubmitting(false);
    setAddSkuError('');
    setEditingSku(null);
  };

  const handleAddSkuSubmit = async () => {
    if (!addSkuForm.sku_id.trim() || !addSkuForm.product_name.trim() || !addSkuForm.box_size.trim()) {
      setAddSkuError('SKU ID, product name and box size are required.');
      return;
    }

    const basicCost = Number(addSkuForm.basic_cost);
    const gstPercentage = Number(addSkuForm.gst_percentage);
    const packingCharge = Number(addSkuForm.packing_charge);

    if ([basicCost, gstPercentage, packingCharge].some((value) => Number.isNaN(value))) {
      setAddSkuError('Basic cost, GST percentage and packing charge must be valid numbers.');
      return;
    }

    setAddSkuSubmitting(true);
    setAddSkuError('');

    try {
      const payload = {
        sku_id: addSkuForm.sku_id.trim(),
        product_name: addSkuForm.product_name.trim(),
        box_size: addSkuForm.box_size.trim(),
        basic_cost: basicCost,
        gst_percentage: gstPercentage,
        packing_charge: packingCharge,
      };

      if (editingSku?.id) {
        await api.post(`/update-sku/${editingSku.id}`, {
          box_size: payload.box_size,
          product_name: payload.product_name,
          basic_cost: payload.basic_cost,
          gst_percentage: payload.gst_percentage,
          packing_charge: payload.packing_charge,
        });
      } else {
        await api.post('/add-sku', payload);
      }

      handleCloseAddSkuModal();
      fetchSkuList(1, perPage);
    } catch (error) {
      setAddSkuError(error.response?.data?.message || error.response?.data?.detail || 'Unable to add SKU right now.');
    } finally {
      setAddSkuSubmitting(false);
    }
  };

  const getPaginationNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= totalPages; i += 1) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((page) => {
      if (last) {
        if (page - last === 2) rangeWithDots.push(last + 1);
        else if (page - last !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      last = page;
    });

    return rangeWithDots;
  };

  const columns = [
    {
      key: 'sku_id',
      label: 'SKU ID',
      className: 'min-w-[220px] max-w-[240px] whitespace-nowrap',
      render: (row) => (
        <div className="max-w-[220px]">
          <div className="font-extrabold text-text">{row.sku_id || '-'}</div>
        </div>
      ),
    },
    {
      key: 'product_name',
      label: 'Product Name',
      className: 'min-w-[320px] max-w-[380px] sm:min-w-[420px] sm:max-w-[520px]',
      render: (row) => {
        const fullName = row.product_name || 'Unnamed product';
        const words = fullName.trim().split(/\s+/).filter(Boolean);
        const hasMoreContent = words.length > PRODUCT_NAME_WORD_LIMIT;
        const previewText = hasMoreContent
          ? `${words.slice(0, PRODUCT_NAME_WORD_LIMIT).join(' ')}...`
          : fullName;

        return (
          <div className="max-w-[320px] sm:max-w-[520px]">
            <div className="flex items-center gap-2 text-sm leading-6 text-text-muted">
              <span className="truncate">{previewText}</span>
              {hasMoreContent ? (
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary-hover"
                  onClick={(event) => {
                    event.stopPropagation();
                    setProductInfoSku(row);
                  }}
                >
                  <FiInfo size={11} />
                  More
                </button>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      key: 'box_size',
      label: 'Size',
      className: 'min-w-[92px]',
      render: (row) => <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-text">{row.box_size || 'Free Size'}</span>,
    },
    {
      key: 'orders',
      label: 'Orders',
      right: true,
      className: 'min-w-[72px]',
      render: (row) => <span className="font-bold tabular-nums text-text">{row.orders || 0}</span>,
    },
    {
      key: 'selling',
      label: 'Selling',
      right: true,
      className: 'min-w-[92px]',
      render: (row) => <span className="font-bold text-text">{formatCurrency(row.selling)}</span>,
    },
    {
      key: 'basic_cost',
      label: 'Basic Cost',
      right: true,
      className: 'min-w-[96px]',
      render: (row) => <span className="text-text-muted">{formatCurrency(row.basic_cost)}</span>,
    },
    {
      key: 'gst_percentage',
      label: 'GST %',
      right: true,
      className: 'min-w-[82px]',
      render: (row) => <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{row.gst_percentage || 0}%</span>,
    },
    {
      key: 'packing_charge',
      label: 'Packing',
      right: true,
      className: 'min-w-[92px]',
      render: (row) => <span className="text-text-muted">{formatCurrency(row.packing_charge)}</span>,
    },
    {
      key: 'final_cost',
      label: 'Final Cost',
      right: true,
      className: 'min-w-[100px]',
      render: (row) => <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">{formatCurrency(calculateFinalCost(row))}</span>,
    },
    {
      key: 'updated_at',
      label: 'Last Update',
      className: 'min-w-[150px]',
      render: (row) => <span className="text-xs text-text-muted">{row.updated_at || '-'}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      className: 'min-w-[88px]',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="info"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              handleEditSku(row);
            }}
            title="Edit SKU"
          >
            <FiEdit2 size={15} />
          </Button>
          {/* <Button
            variant="success"
            size="sm"
            className="h-8 rounded-[10px] px-3 text-[0.68rem] tracking-[0.14em]"
            onClick={(event) => {
              event.stopPropagation();
              handleOpenSkuCost(row);
            }}
          >
            Set Cost
          </Button> */}
        </div>
      ),
    },
  ];

  const quickStats = [
    { label: 'Server Total', value: totalSKUs, icon: FiDatabase },
    { label: 'Visible Rows', value: filteredSkuList.length, icon: FiPackage },
    { label: 'Per Page', value: perPage, icon: FiFilter },
  ];

  const filterPanelContent = (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)_minmax(0,0.78fr)_minmax(0,0.78fr)_minmax(0,0.78fr)_minmax(0,0.78fr)_minmax(0,0.9fr)_minmax(0,1fr)_56px]">
        {FILTER_FIELDS.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            value={quickFilters[field.key]}
            onChange={(event) => setQuickFilters((prev) => ({ ...prev, [field.key]: event.target.value }))}
            placeholder={`Search ${field.label.toLowerCase()}`}
          />
        ))}

        <Input
          label="Min Selling"
          type="number"
          value={quickFilters.minSelling}
          onChange={(event) => setQuickFilters((prev) => ({ ...prev, minSelling: event.target.value }))}
          placeholder="0"
        />
        <Input
          label="Max Selling"
          type="number"
          value={quickFilters.maxSelling}
          onChange={(event) => setQuickFilters((prev) => ({ ...prev, maxSelling: event.target.value }))}
          placeholder="500"
        />
        <Input
          label="Min Cost"
          type="number"
          value={quickFilters.minCost}
          onChange={(event) => setQuickFilters((prev) => ({ ...prev, minCost: event.target.value }))}
          placeholder="0"
        />
        <Input
          label="Max Cost"
          type="number"
          value={quickFilters.maxCost}
          onChange={(event) => setQuickFilters((prev) => ({ ...prev, maxCost: event.target.value }))}
          placeholder="500"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">Cost Status</label>
          <div className="relative">
            <select
              value={skuFilter}
              onChange={(event) => setSkuFilter(event.target.value)}
              className="w-full appearance-none rounded-[16px] border border-border bg-white px-4 py-3 pr-11 text-sm font-medium text-text outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="all">All SKUs</option>
              <option value="without-cost">Without Cost</option>
              <option value="cost-set">Cost Set</option>
            </select>
            <FiChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">Account Scope</label>
          <div className="relative">
            <select
              value={accountFilter}
              onChange={(event) => {
                setAccountFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none rounded-[16px] border border-border bg-white px-4 py-3 pr-11 text-sm font-medium text-text outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="this-account">This Account</option>
              <option value="all-accounts">All Accounts</option>
            </select>
            <FiChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-transparent select-none">Clear</label>
          <Button
            type="button"
            variant="secondary"
            className="h-[50px] w-full min-w-0 px-0"
            onClick={handleClearFilters}
            title="Clear Filters"
          >
            <FiRotateCcw size={16} />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="shrink-0">
             <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <FiArrowLeft size={16} />
              Back
            </Button>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
            <Button
              variant="primary"
              size="sm"
              className="h-10 rounded-[14px] px-4 text-[0.72rem] tracking-[0.18em] shadow-md shadow-primary/20 sm:w-auto"
              onClick={() => { resetAddSkuForm(); setShowAddSkuModal(true); }}
            >
              <FiPlusCircle size={16} />
              Add SKU
            </Button>
            {/* <Button
              variant="info"
              size="sm"
              className="h-10 rounded-[14px] px-4 text-[0.72rem] tracking-[0.18em] shadow-md shadow-sky-600/20"
            >
              <FiSettings size={16} />
              Bulk Update
            </Button>
            <Button
              variant="warning"
              size="sm"
              className="h-10 rounded-[14px] px-4 text-[0.72rem] tracking-[0.18em] shadow-md shadow-accent/20"
              onClick={exportToCSV}
            >
              <FiDownload size={16} />
              Export
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-10 rounded-[14px] border-border/90 px-4 text-[0.72rem] tracking-[0.18em] shadow-sm"
            >
              <FiUpload size={16} />
              Import
            </Button> */}
           
          </div>
        </div>

        <div className="xl:hidden">
          <Button variant="secondary" className="w-full justify-between" onClick={() => setShowMobileFilters(true)}>
            <span className="inline-flex items-center gap-2">
              <FiFilter size={16} />
              Filters
            </span>
            <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-text">
              {activeQuickFilterCount} Active
            </span>
          </Button>
        </div>

        <CommonModal
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          title="Apply Quick Filters"
          size="md"
          headerStyle="default"
          showFooter={false}
          customClass="xl:hidden max-w-[620px] bg-[#f8f6f1]"
        >
          <div className="space-y-4">
            <p className="text-sm text-text-muted">Set filters and tap apply to update the list.</p>

            <div className="max-h-[calc(80vh-180px)] overflow-y-auto pr-1">
              {filterPanelContent}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border bg-white/90 pt-4">
              <Button variant="secondary" className="w-full" onClick={handleClearFilters}>
                Clear
              </Button>
              <Button variant="primary" className="w-full" onClick={() => setShowMobileFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </CommonModal>

        <div className="space-y-5 xl:space-y-6">
          <Card
            title="Apply Quick Filters"
            muted
            className="hidden xl:block"
          >
            {filterPanelContent}
          </Card>

          <div className="min-w-0 space-y-5 xl:space-y-6">
            <Card
              title="SKU Records"
              action={(
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <select
                    value={perPage}
                    onChange={(event) => {
                      const nextPerPage = Number(event.target.value);
                      setPerPage(nextPerPage);
                      fetchSkuList(1, nextPerPage);
                    }}
                    className="w-full rounded-[14px] border border-border bg-white px-3 py-2 text-sm font-bold text-text outline-none focus:border-primary sm:w-auto"
                  >
                    {[10, 25, 50, 100].map((option) => (
                      <option key={option} value={option}>
                        {option} / page
                      </option>
                    ))}
                    
                  </select>

                  <Button variant="secondary" size="sm" className="hidden sm:inline-flex sm:w-auto" onClick={() => fetchSkuList(currentPage, perPage)}>
                    Refresh
                  </Button>
                </div>
              )}
              contentClassName="p-0"
            >
              <DataTable
                columns={columns}
                data={filteredSkuList}
                loading={loading}
                loadingText="Fetching SKU records..."
                emptyText="No data found for the current criteria."
                mobileCardView={false}
                stickyFirstColumn
                selectedId={selectedRowId}
                getRowId={(row) => row.id || row.sku_id}
                onRowClick={handleRowClick}
                wrapperClassName="rounded-b-[24px] pb-2"
                tableClassName="min-w-[1160px] xl:min-w-[1260px]"
                headClassName="top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
                headerCellClassName="border-b border-border px-2 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap sm:px-4 sm:py-4 sm:text-[0.68rem] sm:tracking-[0.18em]"
                indexHeaderClassName="sticky left-0 z-20 w-10 border-b border-r border-border bg-surface-alt/95 px-2 py-3 text-center text-[0.62rem] font-extrabold sm:w-12 sm:px-4 sm:py-4 sm:text-[0.68rem]"
                indexCellClassName="sticky left-0 z-10 border-r border-border bg-surface-alt/95 px-2 py-3 text-center font-medium text-text-muted sm:px-4 sm:py-4"
                cellClassName="px-2 py-3 text-xs text-text sm:px-4 sm:py-4 sm:text-sm"
                selectedClass="bg-primary/10 text-text"
                hoverClass="hover:bg-surface-alt"
              />
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-bold text-text-muted">
                Results {resultStart}-{resultEnd} of {totalSKUs}
              </div>

              <nav className="flex max-w-full items-center overflow-x-auto rounded-[18px] border border-border bg-white shadow-sm [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                <button
                  className={`p-3 transition-colors hover:bg-surface-alt ${currentPage === 1 ? 'cursor-not-allowed text-slate-300' : 'text-text'}`}
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft size={18} />
                </button>

                <div className="flex items-center">
                  {getPaginationNumbers().map((page, index) =>
                    page === '...' ? (
                      <span key={`dots-${index}`} className="px-3 text-xs font-bold text-text-muted">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`px-3 py-3 text-sm font-bold transition-colors sm:px-4 ${currentPage === page ? 'bg-primary text-white' : 'text-text hover:bg-surface-alt'}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  className={`p-3 transition-colors hover:bg-surface-alt ${currentPage === totalPages ? 'cursor-not-allowed text-slate-300' : 'text-text'}`}
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight size={18} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <CommonModal
        isOpen={showAddSkuModal}
        onClose={handleCloseAddSkuModal}
        title={editingSku ? 'Edit SKU' : 'Add SKU'}
        size="md"
        headerStyle="gradient"
        footerButtons={[
          { label: 'Cancel', type: 'secondary', onClick: handleCloseAddSkuModal },
          { label: addSkuSubmitting ? (editingSku ? 'Updating...' : 'Saving...') : (editingSku ? 'Update SKU' : 'Save SKU'), type: 'success', onClick: handleAddSkuSubmit, loading: addSkuSubmitting, disabled: addSkuSubmitting, autoClose: false },
        ]}
      >
        <div className="space-y-5">

          {addSkuError ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {addSkuError}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="SKU ID"
              value={addSkuForm.sku_id}
              onChange={(event) => handleAddSkuInputChange('sku_id', event.target.value)}
              placeholder="SKU0012"
              disabled={Boolean(editingSku)}
            />
            <Input
              label="Box Size"
              value={addSkuForm.box_size}
              onChange={(event) => handleAddSkuInputChange('box_size', event.target.value)}
              placeholder="10x10x10 cm"
            />
          </div>

          <Input
            label="Product Name"
            value={addSkuForm.product_name}
            onChange={(event) => handleAddSkuInputChange('product_name', event.target.value)}
            placeholder="Sample Product"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Basic Cost"
              type="number"
              min="0"
              step="0.01"
              value={addSkuForm.basic_cost}
              onChange={(event) => handleAddSkuInputChange('basic_cost', event.target.value)}
              placeholder="150.00"
            />
            <Input
              label="GST %"
              type="number"
              min="0"
              step="0.01"
              value={addSkuForm.gst_percentage}
              onChange={(event) => handleAddSkuInputChange('gst_percentage', event.target.value)}
              placeholder="18"
            />
            <Input
              label="Packing Charge"
              type="number"
              min="0"
              step="0.01"
              value={addSkuForm.packing_charge}
              onChange={(event) => handleAddSkuInputChange('packing_charge', event.target.value)}
              placeholder="10.00"
            />
          </div>

          <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="crm-section-label !text-emerald-700">Estimated Final Cost</div>
            <div className="mt-2 text-2xl font-black text-emerald-700">
              {formatCurrency(
                (Number(addSkuForm.basic_cost) || 0) +
                ((Number(addSkuForm.basic_cost) || 0) * (Number(addSkuForm.gst_percentage) || 0) / 100) +
                (Number(addSkuForm.packing_charge) || 0)
              )}
            </div>
          </div>
        </div>
      </CommonModal>

      <SKUCostModal
        key={`${selectedSKU?.sku_id || 'sku'}-${selectedRowId}-${showSKUCostModal ? 'open' : 'closed'}`}
        isOpen={showSKUCostModal}
        onClose={() => setShowSKUCostModal(false)}
        skuData={selectedSKU}
      />

      <CommonModal
        isOpen={Boolean(productInfoSku)}
        onClose={() => setProductInfoSku(null)}
        title="Product Information"
        size="md"
        headerStyle="default"
        footerButtons={[
          { label: 'Close', type: 'secondary', onClick: () => setProductInfoSku(null) },
        ]}
      >
        {productInfoSku ? (
          <div className="space-y-4">
            <div className="rounded-[18px] border border-primary/15 bg-primary/5 px-4 py-4">
              <div className="crm-section-label">SKU ID</div>
              <div className="mt-2 text-base font-extrabold text-text">{productInfoSku.sku_id || '-'}</div>
            </div>

            <div className="rounded-[18px] border border-border bg-white px-4 py-4">
              <div className="crm-section-label">Product Name</div>
              <div className="mt-3 text-sm leading-7 text-text">{productInfoSku.product_name || 'Unnamed product'}</div>
            </div>
          </div>
        ) : null}
      </CommonModal>
    </AppShell>
  );
}
