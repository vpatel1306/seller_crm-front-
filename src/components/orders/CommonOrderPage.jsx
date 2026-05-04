import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit2,
  FiFileText,
  FiInfo,
  FiSearch,
  FiSidebar,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { MdOutlineBarChart } from 'react-icons/md';
import AppShell from '../layout/AppShell';
import OrdersFilterSection from './OrdersFilterSection';
import OrdersPageHeader from './OrdersPageHeader';
import OrdersSidebarSection from './OrdersSidebarSection';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import SummaryTable from '../ui/SummaryTable';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_COLOR = {
  SHIPPED: 'text-sky-600',
  DELIVERED: 'text-emerald-600',
  RTO: 'text-rose-600',
  CANCELLED: 'text-slate-500',
  Cancelled: 'text-slate-500',
  RETURNED: 'text-amber-600',
  RETURN_IN_TRANSIT: 'text-amber-600',
  IN_TRANSIT: 'text-amber-600',
};

const INITIAL_FILTERS = {
  platform_order_id: '',
  sku: '',
  order_status: 'all',
  payment_status: 'all',
};

const EMPTY_FIXED_FILTER_DATA = Object.freeze({});

const summaryTableProps = {
  containerClassName: 'overflow-hidden rounded-default border border-border bg-white shadow-sm',

  titleClassName: 'bg-surface-alt px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text',
  headRowClassName: 'bg-white text-text-muted',
  headerCellClassName: 'border-b border-border px-4 py-3 text-left text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap',
  cellClassName: 'px-4 py-3 whitespace-nowrap text-[0.72rem]',
  bodyWrapperClassName: 'max-h-60',
  hoverClass: 'hover:bg-surface-alt',
  rowClassName: (_, i) => (i % 2 === 0 ? 'border-b border-border bg-white' : 'border-b border-border bg-surface-alt/45'),
};

const formatCurrency = (value) => `Rs. ${(Number(value) || 0).toFixed(2)}`;
const formatDateTime = (value) => {
  if (!value) return '-';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleString('en-IN');
};
const getNumericCount = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

function getEmptySummaryData() {
  return {
    courier: [],
    order_date: [],
    order_summary: [],
    courier_by_order_date: [],
  };
}

function defaultBuildRequestPayload({ filterData, page, limit }) {
  return {
    filter_data: filterData,
    page_no: page,
    limit,
  };
}

function defaultMapResponse(payload, { page, limit }) {
  const list = Array.isArray(payload.data) ? payload.data : [];
  const total = getNumericCount(payload.total_count) ?? getNumericCount(payload.count) ?? list.length;
  const resolvedPage = getNumericCount(payload.current_page) ?? page;
  const resolvedPageSize = getNumericCount(payload.page_size) ?? limit;
  const resolvedTotalPages = getNumericCount(payload.total_pages) ?? Math.max(Math.ceil(total / resolvedPageSize), 1);

  return {
    list,
    total,
    resolvedPage,
    resolvedPageSize,
    resolvedTotalPages,
    summaryData: {
      courier: Array.isArray(payload.grouped?.courier) ? payload.grouped.courier : [],
      order_date: Array.isArray(payload.grouped?.order_date) ? payload.grouped.order_date : [],
      order_summary: Array.isArray(payload.grouped?.order_summary) ? payload.grouped.order_summary : [],
      courier_by_order_date: Array.isArray(payload.grouped?.courier_by_order_date) ? payload.grouped.courier_by_order_date : [],
    },
  };
}
export const ORDER_COLUMNS = [
  { key: 'platform_order_id', label: 'Platform Order ID', className: 'min-w-[220px]', render: (row) => <span className="font-extrabold text-primary">{row.platform_order_id || '-'}</span> },
  { key: 'id', label: 'Order ID', className: 'min-w-[220px]', render: (row) => <span className="text-text-muted">{row.id || '-'}</span> },
  { key: 'status', label: 'Status', className: 'min-w-[170px]', render: (row) => <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-text">{row.status || '-'}</span> },
  { key: 'order_status', label: 'Order Status', className: 'min-w-[140px]', render: (row) => <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] ${STATUS_COLOR[row.order_status] || 'text-text'} bg-surface-alt`}>{row.order_status || '-'}</span> },
  { key: 'payment_status', label: 'Payment Status', className: 'min-w-[140px]', render: (row) => <span className="font-semibold text-sky-700">{row.payment_status || '-'}</span> },
  { key: 'sku', label: 'SKU', className: 'min-w-[200px]', render: (row) => <span className="font-semibold text-amber-700">{row.sku || '-'}</span> },
  { key: 'customer_name', label: 'Customer Name', className: 'min-w-[160px]' },
  { key: 'customer_phone', label: 'Customer Phone', className: 'min-w-[140px]' },
  { key: 'courier_partner', label: 'Courier Partner', className: 'min-w-[150px]' },
  { key: 'awb_number', label: 'AWB Number', className: 'min-w-[180px]', render: (row) => <span className="text-violet-700">{row.awb_number || '-'}</span> },
  { key: 'qty', label: 'Qty', right: true, className: 'min-w-[72px]', render: (row) => <span className="text-text-muted">{row.qty ?? 0}</span> },
  { key: 'total_amount', label: 'Total Amount', right: true, className: 'min-w-[120px]', render: (row) => <span className="font-bold text-text">{formatCurrency(row.total_amount)}</span> },
  { key: 'settlement_amount', label: 'Settlement', right: true, className: 'min-w-[120px]', render: (row) => <span className="font-bold text-emerald-600">{formatCurrency(row.settlement_amount)}</span> },
  { key: 'cost_amount', label: 'Cost Amount', right: true, className: 'min-w-[110px]', render: (row) => <span className="text-text-muted">{formatCurrency(row.cost_amount)}</span> },
  { key: 'profit_loss', label: 'P/L', right: true, className: 'min-w-[96px]', render: (row) => <span className={`font-extrabold ${(Number(row.profit_loss) || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(row.profit_loss)}</span> },
  { key: 'claim_amount', label: 'Claim Amount', right: true, className: 'min-w-[120px]', render: (row) => <span className="text-text-muted">{formatCurrency(row.claim_amount)}</span> },
  { key: 'shipping_charge', label: 'Shipping Charge', right: true, className: 'min-w-[130px]', render: (row) => <span className="text-text-muted">{formatCurrency(row.shipping_charge)}</span> },
  { key: 'return_shipping_charge', label: 'Return Shipping', right: true, className: 'min-w-[140px]', render: (row) => <span className="text-text-muted">{formatCurrency(row.return_shipping_charge)}</span> },
  { key: 'claim_status', label: 'Claim Status', className: 'min-w-[120px]' },
  { key: 'order_date', label: 'Order Date', className: 'min-w-[170px]', render: (row) => <span className="text-text-muted">{formatDateTime(row.order_date)}</span> },
  { key: 'dispatch_date', label: 'Dispatch Date', className: 'min-w-[170px]', render: (row) => <span className="text-text-muted">{formatDateTime(row.dispatch_date)}</span> },
  { key: 'return_date', label: 'Return Date', className: 'min-w-[170px]', render: (row) => <span className="text-text-muted">{formatDateTime(row.return_date)}</span> },
  { key: 'updated_at', label: 'Updated At', className: 'min-w-[170px]', render: (row) => <span className="text-text-muted">{formatDateTime(row.updated_at)}</span> },
  { key: 'shipping_address', label: 'Shipping Address', className: 'min-w-[240px] whitespace-normal', render: (row) => <span className="line-clamp-2 text-text-muted">{row.shipping_address || '-'}</span> },
  { key: 'order_metadata', label: 'Order Metadata', className: 'min-w-[220px] whitespace-normal', render: (row) => <span className="line-clamp-2 text-text-muted">{row.order_metadata ? JSON.stringify(row.order_metadata) : '-'}</span> },
  { key: 'org_id', label: 'Org ID', className: 'min-w-[220px]', render: (row) => <span className="text-text-muted">{row.org_id || '-'}</span> },
];

function buildDefaultFooterActions(navigate) {
  return [
    // { key: 'export', label: 'Export CSV', icon: FiDownload, variant: 'success', className: 'shadow-sm' },
    // { key: 'analytics', label: 'Analytics', icon: MdOutlineBarChart, variant: 'info', className: 'shadow-sm' },
    // { key: 'pickup-files', label: 'Pickup Files', icon: FiFileText, variant: 'warning', className: 'shadow-sm' },
  ];
}

function buildHeaderActions(actions) {
  return actions.map((action) => {
    const Icon = action.icon;

    return (
      <Button
        key={action.key}
        type="button"
        variant={action.variant || 'secondary'}
        size="sm"
        disabled={action.disabled}
        onClick={() => {
          action.onClick?.();
        }}
        className={`${action.key === 'close' ? 'sm:ml-3' : ''} ${action.className || ''}`}
      >
        {Icon ? <Icon size={14} /> : null}
        <span>{action.label}</span>
      </Button>
    );
  });
}

export default function CommonOrderPage({
  title,
  description = 'Review every order, refine filters, and inspect grouped summaries from one place.',
  breadcrumbLabel,
  recordTitle = 'Order Records',
  loadingText = 'Loading orders...',
  emptyText = 'No orders found.',
  endpoint = '/get-orders',
  requestMethod = 'post',
  buildRequestPayload = defaultBuildRequestPayload,
  mapResponse = defaultMapResponse,
  columns = ORDER_COLUMNS,
  renderSidebar,
  showStatusAndPaymentFilters = false,
  fixedFilterData = EMPTY_FIXED_FILTER_DATA,
  extraFilterData,
  additionalInitialFilters = EMPTY_FIXED_FILTER_DATA,
  renderCustomFilters,
  compactSingleRowFilters = false,
  rowActions,
  showSidebar = true,
  orderSearchFieldKey = 'platform_order_id',
  orderSearchLabel = 'Platform Order ID',
}) {
  const navigate = useNavigate();
  const { activeAccount, selectedDateRange } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const mergedInitialFilters = useMemo(
    () => ({ ...INITIAL_FILTERS, ...additionalInitialFilters }),
    [additionalInitialFilters]
  );
  const globalDateRange = useMemo(() => ({
    from: selectedDateRange?.from || '',
    to: selectedDateRange?.to || '',
  }), [selectedDateRange?.from, selectedDateRange?.to]);
  const [filters, setFilters] = useState(mergedInitialFilters);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortKey, setSortKey] = useState('order_date');
  const [sortDir, setSortDir] = useState('desc');
  const [leftOpen, setLeftOpen] = useState(showSidebar);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [groupedData, setGroupedData] = useState(getEmptySummaryData());
  const [dateRange, setDateRange] = useState(() => globalDateRange);
  const [dateDraft, setDateDraft] = useState(() => globalDateRange);
  const fromDate = dateRange.from;
  const toDate = dateRange.to;

  const loadOrders = useCallback(async (page = 1, perPageCount = perPage, appliedDateRange = dateRange) => {
    setLoading(true);
    try {
      const requestFromDate = appliedDateRange?.from || '';
      const requestToDate = appliedDateRange?.to || '';
      const filterData = {
        ...fixedFilterData,
      };

      if (showStatusAndPaymentFilters && filters.order_status !== 'all') filterData.order_status = filters.order_status;
      if (showStatusAndPaymentFilters && filters.payment_status !== 'all') filterData.payment_status = filters.payment_status;
      if (filters.sku.trim()) filterData.sku = filters.sku.trim();
      if (filters.platform_order_id.trim()) filterData[orderSearchFieldKey] = filters.platform_order_id.trim();
      if (requestFromDate) filterData.start_date = requestFromDate;
      if (requestToDate) filterData.end_date = requestToDate;
      
      if (fixedFilterData.status && Array.isArray(fixedFilterData.status)) {
        filterData.status = fixedFilterData.status;
      }
      const finalFilterData = extraFilterData ? extraFilterData(filterData) : filterData;
      const requestPayload = buildRequestPayload({
        filterData: finalFilterData,
        page,
        limit: perPageCount,
        fromDate: requestFromDate,
        toDate: requestToDate,
        filters,
      });
      const requestConfig = {
        headers: {
          account: activeAccount.id,
        },
      };
      const res = requestMethod === 'get'
        ? await api.get(endpoint, { ...requestConfig, params: requestPayload })
        : await api.post(endpoint, requestPayload, requestConfig);
      const payload = res.data || {};
      const {
        list,
        total,
        resolvedPage,
        resolvedPageSize,
        resolvedTotalPages,
        summaryData,
      } = mapResponse(payload, {
        page,
        limit: perPageCount,
        fromDate: requestFromDate,
        toDate: requestToDate,
        filters,
      });
      setOrders(list);
      setTotalOrders(total);
      setPerPage(resolvedPageSize);
      setTotalPages(Math.max(resolvedTotalPages, 1));
      setCurrentPage(resolvedPage);
      setGroupedData(summaryData ?? getEmptySummaryData());
      setSelectedId(null);
    } catch {
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
      setCurrentPage(1);
      setGroupedData(getEmptySummaryData());
    } finally {
      setLoading(false);
    }
  }, [activeAccount?.id, buildRequestPayload, endpoint, extraFilterData, filters, fixedFilterData, mapResponse, orderSearchFieldKey, perPage, requestMethod, showStatusAndPaymentFilters, dateRange]);

  useEffect(() => {
    if (!activeAccount?.id) return;
    const timeoutId = setTimeout(() => {
      loadOrders();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [activeAccount?.id, loadOrders]);

  useEffect(() => {
    if (!showMobileFilters) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showMobileFilters]);

  useEffect(() => {
    setDateRange(globalDateRange);
    setDateDraft(globalDateRange);
  }, [globalDateRange]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setFilters(mergedInitialFilters);
    setDateRange(globalDateRange);
    setDateDraft(globalDateRange);
    setCurrentPage(1);
  };

  const activeQuickFilterCount =
    Object.values(filters).filter((value) => value && value !== 'all').length +
    (dateDraft.from ? 1 : 0) +
    (dateDraft.to ? 1 : 0);

  const sortedOrders = useMemo(() => {
    const list = [...orders];
    list.sort((a, b) => {
      const valueA = a[sortKey] ?? '';
      const valueB = b[sortKey] ?? '';

      if (valueA < valueB) return sortDir === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [orders, sortDir, sortKey]);

  const footerActions = buildDefaultFooterActions(navigate);

  const resolvedRowActions = useMemo(
    () => (rowActions ?? [
      // { key: 'edit', label: 'Edit Order', icon: FiEdit2, className: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' },
      // { key: 'delete', label: 'Delete Order', icon: FiTrash2, className: 'border-rose-200 text-rose-700 hover:bg-rose-50' },
      // { key: 'details', label: 'Order Details', icon: FiInfo, className: 'border-slate-200 text-slate-700 hover:bg-slate-100' },
    ]),
    [rowActions]
  );

  const tableColumns = useMemo(() => {
    if (!resolvedRowActions.length) return columns;

    return [
      ...columns,
      {
        key: '__actions',
        label: 'Actions',
        sortable: false,
        // sticky: 'right',
        // right: true,
        className: '',
        headerClassName: 'min-w-[180px] border-l border-border bg-surface-alt/95',
        render: (row) => (
          <div className="flex items-center justify-start gap-2">
            {resolvedRowActions.map((action) => {
              const Icon = action.icon;
              const isDisabled = typeof action.disabled === 'function' ? action.disabled(row) : Boolean(action.disabled);

              return (
                <button
                  key={action.key}
                  type="button"
                  title={action.label}
                  disabled={isDisabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    action.onClick?.(row);
                  }}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-all ${isDisabled ? 'cursor-not-allowed border-slate-200 text-slate-300' : action.className || 'border-slate-200 text-text hover:bg-surface-alt'}`}
                >
                  {Icon ? <Icon size={16} /> : null}
                </button>
              );
            })}
          </div>
        ),
      },
    ];
  }, [columns, resolvedRowActions]);

  const orderDateSummaryRows = useMemo(
    () => (Array.isArray(groupedData.order_date) ? groupedData.order_date : []).map((item) => ({
      date: item.order_date || 'Unknown',
      count: item.total_orders ?? 0,
      cost: (Number(item.total_cost_amount) || 0).toFixed(2),
    })),
    [groupedData.order_date]
  );

  const statusSummaryRows = useMemo(
    () => (Array.isArray(groupedData.order_summary) ? groupedData.order_summary : []).map((item) => ({
      status: item.order_status || 'Unknown',
      count: item.total_orders ?? 0,
      cost: (Number(item.total_cost_amount) || 0).toFixed(2),
    })),
    [groupedData.order_summary]
  );

  const courierSummaryRows = useMemo(
    () => (Array.isArray(groupedData.courier) ? groupedData.courier : []).map((item) => ({
      courier: item.courier_partner || 'Unknown',
      pickup: item.total_orders ?? 0,
      cost: (Number(item.total_cost_amount) || 0).toFixed(2),
    })),
    [groupedData.courier]
  );

  const courierByOrderDateRows = useMemo(
    () => (Array.isArray(groupedData.courier_by_order_date) ? groupedData.courier_by_order_date : []).map((item) => ({
      order_date: item.order_date || 'Unknown',
      courier_partner: item.courier_partner || 'Unknown',
      total_orders: item.total_orders ?? 0,
      total_cost_amount: (Number(item.total_cost_amount) || 0).toFixed(2),
    })),
    [groupedData.courier_by_order_date]
  );

  const resultStart = totalOrders === 0 ? 0 : ((currentPage - 1) * perPage) + 1;
  const resultEnd = totalOrders === 0 ? 0 : Math.min(currentPage * perPage, totalOrders);

  const handleApplyFilters = () => {
    const nextDateRange = {
      from: dateDraft.from || '',
      to: dateDraft.to || '',
    };
    setDateRange(nextDateRange);
    setCurrentPage(1);
    loadOrders(1, perPage, nextDateRange);
    setShowMobileFilters(false);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadOrders(page, perPage);
    }
  };

  const summaryTableProps = {
    containerClassName: 'overflow-hidden rounded-default border border-slate-200 bg-white shadow-soft transition-all',
    titleClassName: 'bg-slate-50 px-5 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500',
    headRowClassName: 'bg-white',
    headerCellClassName: 'border-b border-slate-100 px-5 py-3 text-left text-[0.62rem] font-bold uppercase tracking-widest text-slate-400',
    cellClassName: 'px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-700',
    bodyWrapperClassName: 'max-h-72 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200',
    hoverClass: 'hover:bg-slate-50',
    rowClassName: (_, i) => (i % 2 === 0 ? 'bg-white border-b border-slate-50/50' : 'bg-slate-50/20 border-b border-slate-50/50'),
  };

  const formatCurrency = (value) => `Rs. ${(Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

  const filterPanelContent = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className={`flex flex-col gap-1.5 ${compactSingleRowFilters ? 'min-w-[200px] flex-[1.2_1_0]' : 'min-w-[200px] flex-[1_1_240px]'}`}>
          <label className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">{orderSearchLabel}</label>
          <div className="relative group">
            <FiSearch size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              value={filters.platform_order_id}
              onChange={(event) => setFilters((prev) => ({ ...prev, platform_order_id: event.target.value }))}
              placeholder={`Search ${orderSearchLabel.toLowerCase()}`}
              className="h-9 w-full rounded-default border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"

            />
          </div>
        </div>

        <div className={`flex flex-col gap-1.5 ${compactSingleRowFilters ? 'min-w-[200px] flex-[1.2_1_0]' : 'min-w-[200px] flex-[1_1_240px]'}`}>
          <label className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">SKU</label>
          <div className="relative group">
            <FiSearch size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              value={filters.sku}
              onChange={(event) => setFilters((prev) => ({ ...prev, sku: event.target.value }))}
              placeholder="Search SKU"
              className="h-9 w-full rounded-default border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"

            />
          </div>
        </div>

        {showStatusAndPaymentFilters ? (
          <>
            <div className="flex min-w-[200px] flex-[0.9_1_0] flex-col gap-1.5">
              <label className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Order Status</label>
              <div className="relative">
                <select
                  value={filters.order_status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, order_status: event.target.value }))}
                  className="h-9 w-full appearance-none rounded-default border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary shadow-sm hover:border-slate-300"

                >
                  <option value="all">All Order Status</option>
                  <option value="Unknown">Unknown</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="Delivering Today">Delivering Today</option>
                  <option value="DOOR_STEP_EXCHANGED">DOOR_STEP_EXCHANGED</option>
                  <option value="Exchange">Exchange</option>
                  <option value="HOLD">HOLD</option>
                  <option value="PENDING">PENDING</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="READY_TO_SHIP">READY_TO_SHIP</option>
                  <option value="Returned">Returned</option>
                  <option value="RTO">RTO</option>
                  <option value="RTO_INITIATED">RTO_INITIATED</option>
                  <option value="RETURN_IN_TRANSIT">RETURN_IN_TRANSIT</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="SHIPPED">SHIPPED</option>
                </select>
                <FiChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="flex min-w-[200px] flex-[0.9_1_0] flex-col gap-1.5">
              <label className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Payment Status</label>
              <div className="relative">
                <select
                  value={filters.payment_status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, payment_status: event.target.value }))}
                  className="h-9 w-full appearance-none rounded-default border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary shadow-sm hover:border-slate-300"

                >
                  <option value="all">All Payment Status</option>
                  <option value="Settled">Settled</option>
                  <option value="Pending">Pending</option>
                  <option value="Unsettled">Unsettled</option>
                </select>
                <FiChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </>
        ) : null}

        {renderCustomFilters ? renderCustomFilters({ filters, setFilters }) : null}

        <div className="flex w-[160px] shrink-0 flex-col gap-1.5">
          <label className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">From Date</label>
          <input
            type="date"
            value={dateDraft.from}
            onChange={(event) => setDateDraft((prev) => ({ ...prev, from: event.target.value }))}
            className="h-9 w-full rounded-default border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary shadow-sm"

          />
        </div>

        <div className="flex w-[160px] shrink-0 flex-col gap-1.5">
          <label className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">To Date</label>
          <input
            type="date"
            value={dateDraft.to}
            onChange={(event) => setDateDraft((prev) => ({ ...prev, to: event.target.value }))}
            className="h-9 w-full rounded-default border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary shadow-sm"

          />
        </div>

        <div className="flex shrink-0 items-end gap-2 xl:self-end">
          <Button
            type="button"
            variant="primary"
            size="md"
            className="!h-9 rounded-default px-5"

            onClick={handleApplyFilters}
            title="Apply Filters"
          >
            Apply
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="!h-9 !w-9 rounded-default"

            onClick={clearFilters}
            title="Clear Filters"
          >
            <FiX size={18} />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-2 sm:space-y-3">
        <OrdersPageHeader
          title={title}
          description={description}
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: breadcrumbLabel || title, current: true },
          ]}
          onBack={() => navigate('/dashboard')}
          actions={buildHeaderActions(footerActions)}
        />

        <OrdersFilterSection
          mobileTitle="Apply Order Filters"
          mobileDescription="Refine the order list, then apply to update the records."
          activeCount={activeQuickFilterCount}
          isModalOpen={showMobileFilters}
          onOpenModal={() => setShowMobileFilters(true)}
          onCloseModal={() => setShowMobileFilters(false)}
          onClear={clearFilters}
          onApply={handleApplyFilters}
        >
          {filterPanelContent}
        </OrdersFilterSection>

        <div className="space-y-5 xl:space-y-6">
          <div className={`grid gap-3 xl:gap-3 ${showSidebar && leftOpen ? 'xl:grid-cols-[320px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
            {showSidebar && leftOpen ? (
              renderSidebar ? (
                renderSidebar({
                  groupedData,
                  summaryTableProps,
                  orderDateSummaryRows,
                  statusSummaryRows,
                  courierSummaryRows,
                  courierByOrderDateRows,
                })
              ) : (
                <OrdersSidebarSection>
                  <SummaryTable
                    {...summaryTableProps}
                    title="Order Date Summary"
                    rows={orderDateSummaryRows}
                    cols={[
                      { key: 'date', label: 'Order Date', color: () => 'text-text' },
                      { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                      { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                    ]}
                  />

                  <SummaryTable
                    {...summaryTableProps}
                    title="Status Summary"
                    rows={statusSummaryRows}
                    cols={[
                      {
                        key: 'status',
                        label: 'Status',
                        color: (row) => (row.status.startsWith('RTO') ? 'text-rose-600 font-bold' : row.status === 'DELIVERED' ? 'text-emerald-600 font-bold' : 'text-text'),
                      },
                      { key: 'count', label: 'Count', right: true, color: () => 'text-primary text-right font-extrabold' },
                      { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                    ]}
                  />

                  <SummaryTable
                    {...summaryTableProps}
                    title="Courier Summary"
                    rows={courierSummaryRows}
                    cols={[
                      { key: 'courier', label: 'Courier', color: () => 'text-text' },
                      { key: 'pickup', label: 'Pickup', right: true, color: () => 'text-primary text-right font-extrabold' },
                      { key: 'cost', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                    ]}
                  />

                  <SummaryTable
                    {...summaryTableProps}
                    title="Courier By Order Date"
                    rows={courierByOrderDateRows}
                    cols={[
                      { key: 'order_date', label: 'Order Date', color: () => 'text-text' },
                      { key: 'courier_partner', label: 'Courier', color: () => 'text-text-muted' },
                      { key: 'total_orders', label: 'Orders', right: true, color: () => 'text-primary text-right font-extrabold' },
                      { key: 'total_cost_amount', label: 'Cost Amt', right: true, color: () => 'text-emerald-600 text-right font-bold' },
                    ]}
                  />
                </OrdersSidebarSection>
              )
            ) : null}

            <div className="min-w-0 space-y-5 xl:space-y-6">
              <Card
                title={recordTitle}
                noHeaderBorder
                action={(
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                    <div className="rounded-full bg-surface-alt px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text">
                      Total Rows {totalOrders}
                    </div>
                    <select
                      value={perPage}
                      onChange={(event) => {
                        const nextPerPage = Number(event.target.value);
                        setPerPage(nextPerPage);
                        loadOrders(1, nextPerPage);
                      }}
                      className="w-full rounded-inner border border-border bg-white px-3 py-2 text-sm font-bold text-text outline-none focus:border-primary sm:w-auto"

                    >
                      {[10, 25, 50, 100].map((option) => (
                        <option key={option} value={option}>
                          {option} / page
                        </option>
                      ))}
                    </select>
                    {showSidebar ? (
                      <Button variant="secondary" size="sm" onClick={() => setLeftOpen((value) => !value)}>
                        <FiSidebar size={16} />
                        {leftOpen ? 'Hide Summary' : 'Show Summary'}
                      </Button>
                    ) : null}
                    <Button variant="secondary" size="sm" className="hidden sm:inline-flex sm:w-auto" onClick={() => loadOrders(currentPage, perPage)}>
                      Refresh
                    </Button>
                  </div>
                )}
                contentClassName="p-0"
              >
                <DataTable
                  mobileCardView={false}
                  columns={tableColumns}
                  data={sortedOrders}
                  loading={loading}
                  loadingText={loadingText}
                  emptyText={emptyText}
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                  onRowDoubleClick={(row) => setSelectedId(row.id)}
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  wrapperClassName="rounded-b-default pb-2"

                  tableClassName="min-w-[3200px]"
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
                  Results {resultStart}-{resultEnd} of {totalOrders}
                </div>

                <nav className="flex max-w-full items-center overflow-x-auto rounded-default border border-border bg-white shadow-sm [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">

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
      </div>
    </AppShell>
  );
}
