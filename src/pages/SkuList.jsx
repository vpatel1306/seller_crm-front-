import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SKUCostModal from '../components/layout/SKUCostModal';
import { useAuth } from '../context/AuthContext';
import CommonModal from '../components/common/CommonModal';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiDownload,
  FiFilter,
  FiPlusCircle,
  FiSettings,
  FiUpload,
  FiX,
} from 'react-icons/fi';

export default function SkuList() {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const [showSKUCostModal, setShowSKUCostModal] = useState(false);
  const [showAddSkuModal, setShowAddSkuModal] = useState(false);
  const [skuList, setSkuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addSkuSubmitting, setAddSkuSubmitting] = useState(false);
  const [addSkuError, setAddSkuError] = useState('');
  const [addSkuForm, setAddSkuForm] = useState({
    sku_id: '',
    product_name: '',
    box_size: '',
    basic_cost: '',
    gst_percentage: '18',
    packing_charge: '',
  });
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSKUs, setTotalSKUs] = useState(0);
  const [showPerPageOptions, setShowPerPageOptions] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const accountName = activeAccount?.account_name || 'No account selected';

  const resetAddSkuForm = () => {
    setAddSkuForm({
      sku_id: '',
      product_name: '',
      box_size: '',
      basic_cost: '',
      gst_percentage: '18',
      packing_charge: '',
    });
    setAddSkuError('');
  };

  const fetchSkuList = useCallback(async (page = 1, perPageCount = perPage) => {
    setLoading(true);
    try {
      const skip = (page - 1) * perPageCount;
      const res = await api.get(`/sku-list/?skip=${skip}&limit=${perPageCount}`);

      let list = [];
      let total = 0;

      if (res.data) {
        if (Array.isArray(res.data)) {
          list = res.data;
          total = res.data.length;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          list = res.data.data;
          try {
            const totalRes = await api.get('/sku-list/');
            if (totalRes.data && Array.isArray(totalRes.data)) {
              total = totalRes.data.length;
            } else if (totalRes.data && totalRes.data.data && Array.isArray(totalRes.data.data)) {
              total = totalRes.data.data.length;
            }
          } catch {
            total = res.data.count || res.data.total || res.data.data.length;
          }
        } else if (res.data.results && Array.isArray(res.data.results)) {
          list = res.data.results;
          total = res.data.count || res.data.results.length;
        }
      }

      setSkuList(list);
      setTotalSKUs(total);
      setTotalPages(total > 0 ? Math.ceil(total / perPageCount) : 1);
      setCurrentPage(page);
    } catch {
      setSkuList([]);
      setTotalSKUs(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  const handleRowClick = (sku, index) => {
    setSelectedSKU(sku);
    setSelectedRowIndex(index);
    setShowSKUCostModal(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchSkuList(page, perPage);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setShowPerPageOptions(false);
    fetchSkuList(1, newPerPage);
  };

  const exportToCSV = () => {
    const headers = ['SKU ID', 'Size', 'Orders', 'Selling', 'Basic Cost', 'GST %', 'Packing', 'Final Cost', 'Last Update'];
    const csvData = skuList.map((item) => [
      item.sku_id || '-',
      item.box_size || 'Free Size',
      item.orders || 0,
      item.selling || 0,
      item.basic_cost || 0,
      item.gst_percentage || 0,
      item.packing_charge || 0,
      ((item.basic_cost || 0) + ((item.basic_cost || 0) * (item.gst_percentage || 0) / 100) + (item.packing_charge || 0)).toFixed(2),
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

  const handleOpenAddSkuModal = () => {
    resetAddSkuForm();
    setShowAddSkuModal(true);
  };

  const handleCloseAddSkuModal = () => {
    setShowAddSkuModal(false);
    setAddSkuSubmitting(false);
    setAddSkuError('');
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
      await api.post('/add-sku', {
        sku_id: addSkuForm.sku_id.trim(),
        product_name: addSkuForm.product_name.trim(),
        box_size: addSkuForm.box_size.trim(),
        basic_cost: basicCost,
        gst_percentage: gstPercentage,
        packing_charge: packingCharge,
      });

      handleCloseAddSkuModal();
      fetchSkuList(1, perPage);
    } catch (error) {
      setAddSkuError(error.response?.data?.message || error.response?.data?.detail || 'Unable to add SKU right now.');
    } finally {
      setAddSkuSubmitting(false);
    }
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= totalPages; i += 1) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (last) {
        if (i - last === 2) rangeWithDots.push(last + 1);
        else if (i - last !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      last = i;
    });

    return rangeWithDots;
  };

  useEffect(() => {
    fetchSkuList();
  }, [fetchSkuList]);

  return (
    <div className="flex min-h-screen flex-col bg-bg font-sans lg:h-screen lg:overflow-hidden">
      <header className="z-20 flex flex-col gap-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4 py-3 text-white shadow-md lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2">
            <FiDatabase size={20} className="text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            SKU MASTER <span className="font-medium text-primary/80">- {accountName}</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
          <span className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Timeframe:</span>
          <span className="text-xs font-mono">21/07/2025</span>
          <FiChevronRight size={12} className="text-primary" />
          <span className="text-xs font-mono">13/12/2025</span>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:overflow-hidden">
        <aside className="z-10 flex w-full flex-col space-y-4 border-b border-gray-100 bg-white p-3 shadow-sm lg:w-72 lg:flex-shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2 text-primary">
            <FiFilter size={16} />
            <h2 className="text-sm font-bold uppercase tracking-wider">Refine Search</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'SKU Keyword 1', shortcut: 'F3' },
              { label: 'SKU Keyword 2', shortcut: null },
              { label: 'SKU Keyword 3', shortcut: null },
              { label: 'Size', shortcut: 'F4' },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <label className="flex justify-between text-[0.7rem] font-bold uppercase tracking-tighter text-gray-400">
                  {field.label}
                  {field.shortcut ? <span className="text-primary/50">{field.shortcut}</span> : null}
                </label>
                <input className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:bg-white focus:ring-1 focus:ring-primary" />
              </div>
            ))}

            <div className="space-y-1">
              <label className="flex justify-between text-[0.7rem] font-bold uppercase tracking-tighter text-gray-400">
                Sell Price Range <span className="text-primary/50">F6</span>
              </label>
              <div className="flex gap-2">
                <input className="w-1/2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary" placeholder="Min" />
                <input className="w-1/2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary" placeholder="Max" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="flex justify-between text-[0.7rem] font-bold uppercase tracking-tighter text-gray-400">
                Cost Range <span className="text-primary/50">F7</span>
              </label>
              <div className="flex gap-2">
                <input className="w-1/2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary" placeholder="Min" />
                <input className="w-1/2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary" placeholder="Max" />
              </div>
            </div>

            <button className="mt-1 w-full rounded-lg bg-gray-100 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:bg-gray-200 active:scale-95">
              Clear Filters
            </button>
          </div>

          <div className="space-y-3 border-t border-gray-50 pt-4">
            <div className="space-y-1.5">
              {['All SKUs', 'Without Cost SKUs', 'Cost Set SKUs'].map((opt, i) => (
                <label key={opt} className="group flex cursor-pointer items-center gap-3">
                  <input type="radio" name="sku-filter" defaultChecked={i === 0} className="h-4 w-4 accent-primary" />
                  <span className="text-sm font-medium text-gray-600 transition-colors group-hover:text-primary">{opt}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1.5 border-t border-gray-50/50 pt-3">
              {['This Account SKUs', 'All Account SKUs'].map((opt, i) => (
                <label key={opt} className="group flex cursor-pointer items-center gap-3">
                  <input type="radio" name="account-filter" defaultChecked={i === 0} className="h-4 w-4 accent-primary" />
                  <span className="text-sm font-medium text-gray-600 transition-colors group-hover:text-primary">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col bg-white lg:min-h-0 lg:overflow-hidden">
          <div className="flex-1 overflow-visible p-3 sm:p-4 lg:min-h-0 lg:overflow-auto lg:p-6">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {loading ? (
                <div className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Fetching records...</span>
                  </div>
                </div>
              ) : skuList.length === 0 ? (
                <div className="px-5 py-20 text-center italic text-gray-400">No data found in this criteria</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50 text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
                          <th className="px-5 py-4">SKU ID</th>
                          <th className="px-5 py-4">Size</th>
                          <th className="px-5 py-4">Orders</th>
                          <th className="px-5 py-4">Selling</th>
                          <th className="px-5 py-4">Basic Cost</th>
                          <th className="px-5 py-4">GST %</th>
                          <th className="px-5 py-4">Packing</th>
                          <th className="px-5 py-4">Final Cost</th>
                          <th className="px-5 py-4">Last Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-[0.8rem]">
                        {skuList.map((item, index) => {
                          const isActive = index === selectedRowIndex;
                          const finalCost =
                            (item.basic_cost || 0) +
                            ((item.basic_cost || 0) * (item.gst_percentage || 0) / 100) +
                            (item.packing_charge || 0);

                          return (
                            <tr
                              key={index}
                              className={`group cursor-pointer transition-colors hover:bg-indigo-50/30 ${isActive ? 'bg-indigo-50/70 shadow-inner' : ''}`}
                              onClick={() => handleRowClick(item, index)}
                            >
                              <td className="px-5 py-4 font-bold text-gray-900 group-hover:text-primary">{item.sku_id || '-'}</td>
                              <td className="px-5 py-4 font-medium uppercase italic text-gray-600">{item.box_size || 'Free Size'}</td>
                              <td className="px-5 py-4 font-mono font-bold">{item.orders || 0}</td>
                              <td className="px-5 py-4 font-bold text-gray-900">Rs. {item.selling || 0}</td>
                              <td className="px-5 py-4 text-gray-600">Rs. {item.basic_cost || 0}</td>
                              <td className="px-5 py-4">
                                <span className="rounded bg-gray-100 px-2 py-0.5 font-bold text-gray-500">{item.gst_percentage || 0}%</span>
                              </td>
                              <td className="px-5 py-4 text-gray-600">Rs. {item.packing_charge || 0}</td>
                              <td className="px-5 py-4">
                                <span className="rounded-lg bg-primary/5 px-2 py-1 font-bold text-primary">Rs. {finalCost.toFixed(2)}</span>
                              </td>
                              <td className="whitespace-nowrap px-5 py-4 text-[0.7rem] text-gray-400">{item.updated_at || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4 px-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {totalSKUs > 0
                  ? `Results: ${((currentPage - 1) * perPage) + 1} - ${Math.min(currentPage * perPage, totalSKUs)} total ${totalSKUs}`
                  : 'No records'}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="relative">
                  <button
                    className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition-all hover:border-primary active:scale-95"
                    onClick={() => setShowPerPageOptions(!showPerPageOptions)}
                  >
                    <span>Show {perPage}</span>
                    <FiChevronDown size={14} className={showPerPageOptions ? 'rotate-180' : ''} />
                  </button>
                  {showPerPageOptions ? (
                    <div className="absolute bottom-full z-30 mb-2 w-32 origin-bottom overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl duration-200 animate-in fade-in slide-in-from-bottom-2">
                      {[10, 25, 50, 100].map((opt) => (
                        <button
                          key={opt}
                          className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors hover:bg-gray-50 ${perPage === opt ? 'bg-primary/5 text-primary' : 'text-gray-500'}`}
                          onClick={() => handlePerPageChange(opt)}
                        >
                          {opt} per page
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <nav className="flex items-center overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                  <button
                    className={`p-2 transition-colors hover:bg-gray-50 ${currentPage === 1 ? 'cursor-not-allowed text-gray-200' : 'text-gray-600'}`}
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft size={18} />
                  </button>

                  <div className="flex items-center">
                    {getPaginationNumbers().map((page, index) =>
                      page === '...' ? (
                        <span key={`dots-${index}`} className="px-3 text-[0.7rem] font-bold text-gray-300">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`px-4 py-2 text-xs font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-inner' : 'text-gray-500 hover:bg-gray-50'}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className={`p-2 transition-colors hover:bg-gray-50 ${currentPage === totalPages ? 'cursor-not-allowed text-gray-200' : 'text-gray-600'}`}
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <FiChevronRight size={18} />
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <footer className="z-20 flex flex-col gap-4 border-t border-gray-100 bg-gray-50 p-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-900 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-widest text-white">
              <span className="opacity-50">Page Statistics</span>
              <span className="font-mono text-primary">
                {currentPage} of {totalPages}
              </span>
              <span className="text-lg opacity-20">|</span>
              <span>Total Count: {totalSKUs}</span>
            </div>

            <div className="grid grid-cols-1 justify-end gap-2 sm:grid-cols-2 xl:ml-auto xl:flex xl:flex-wrap xl:justify-end xl:items-stretch">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider italic text-gray-500 shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95 xl:w-auto">
                <span>No SKU Search Result</span>
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-95 xl:w-auto"
                onClick={handleOpenAddSkuModal}
              >
                <FiPlusCircle size={14} />
                <span>Add SKU</span>
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95 xl:w-auto"
                onClick={() => setShowSKUCostModal(true)}
              >
                <FiPlusCircle size={14} />
                <span>Set Single SKU Cost</span>
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600 active:scale-95 xl:w-auto">
                <FiSettings size={14} />
                <span>Bulk Update</span>
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95 xl:w-auto"
                onClick={exportToCSV}
              >
                <FiDownload size={14} />
                <span>Export Excel</span>
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-600 active:scale-95 xl:w-auto">
                <FiUpload size={14} />
                <span>Import Excel</span>
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 xl:w-auto"
                onClick={() => navigate('/dashboard')}
              >
                <FiX size={14} />
                <span>Exit</span>
              </button>
            </div>
          </footer>
        </main>
      </div>

      <CommonModal
        isOpen={showAddSkuModal}
        onClose={handleCloseAddSkuModal}
        title="Add SKU"
        size="md"
        headerStyle="gradient"
        footerButtons={[
          { label: 'Cancel', type: 'secondary', onClick: handleCloseAddSkuModal },
          { label: addSkuSubmitting ? 'Saving...' : 'Save SKU', type: 'success', onClick: handleAddSkuSubmit, loading: addSkuSubmitting, disabled: addSkuSubmitting, autoClose: false },
        ]}
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
            <div className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-primary/70">Active Account</div>
            <div className="mt-1 text-sm font-bold text-gray-900">{accountName}</div>
          </div>

          {addSkuError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {addSkuError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gray-400">SKU ID</label>
              <input
                type="text"
                value={addSkuForm.sku_id}
                onChange={(e) => handleAddSkuInputChange('sku_id', e.target.value)}
                placeholder="SKU0012"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gray-400">Box Size</label>
              <input
                type="text"
                value={addSkuForm.box_size}
                onChange={(e) => handleAddSkuInputChange('box_size', e.target.value)}
                placeholder="10x10x10 cm"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gray-400">Product Name</label>
            <input
              type="text"
              value={addSkuForm.product_name}
              onChange={(e) => handleAddSkuInputChange('product_name', e.target.value)}
              placeholder="Sample Product"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gray-400">Basic Cost</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={addSkuForm.basic_cost}
                onChange={(e) => handleAddSkuInputChange('basic_cost', e.target.value)}
                placeholder="150.00"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gray-400">GST %</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={addSkuForm.gst_percentage}
                onChange={(e) => handleAddSkuInputChange('gst_percentage', e.target.value)}
                placeholder="18"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gray-400">Packing Charge</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={addSkuForm.packing_charge}
                onChange={(e) => handleAddSkuInputChange('packing_charge', e.target.value)}
                placeholder="10.00"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-emerald-600">Estimated Final Cost</div>
            <div className="mt-1 text-xl font-black text-emerald-700">
              Rs. {(
                (Number(addSkuForm.basic_cost) || 0) +
                ((Number(addSkuForm.basic_cost) || 0) * (Number(addSkuForm.gst_percentage) || 0) / 100) +
                (Number(addSkuForm.packing_charge) || 0)
              ).toFixed(2)}
            </div>
          </div>
        </div>
      </CommonModal>

      <SKUCostModal
        key={`${selectedSKU?.sku_id || 'sku'}-${selectedRowIndex}-${showSKUCostModal ? 'open' : 'closed'}`}
        isOpen={showSKUCostModal}
        onClose={() => setShowSKUCostModal(false)}
        skuData={selectedSKU}
      />
    </div>
  );
}
