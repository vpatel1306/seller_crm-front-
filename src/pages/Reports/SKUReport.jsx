import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiDownload, FiEye, FiRefreshCw, FiX, FiBarChart2, FiTrendingUp, FiTrendingDown, FiPackage, FiInfo, FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const SKUReport = () => {
  // State Management
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const accountName = activeAccount?.account_name || 'No account selected';
  const [skuData, setSkuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSize, setSearchSize] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'profit', 'loss'
  const itemsPerPage = 10;

  // Summary metrics
  const [summary, setSummary] = useState({
    picked: 0,
    shipped: 0,
    rto: 0,
    delivered: 0,
    returned: 0,
    delivery: 0,
    pickedPercent: 0,
    shippedPercent: 0,
    deliveredPercent: 0,
    returnPercent: 0,
    deliveryPercent: 0
  });

  const fetchSKUData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get(`/sku-list/?limit=10000`);
      const resData = response.data;

      let dataArray = resData.data || [];

      if (searchTerm.trim()) {
        dataArray = dataArray.filter(item =>
          item.sku_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (searchSize.trim()) {
        dataArray = dataArray.filter(item =>
          item.box_size?.toLowerCase().includes(searchSize.toLowerCase())
        );
      }

      if (activeFilter === 'profit') {
        dataArray = dataArray.filter(item => (item.profit_loss || 0) > 0);
      } else if (activeFilter === 'loss') {
        dataArray = dataArray.filter(item => (item.profit_loss || 0) < 0);
      }

      setTotalItems(dataArray.length);

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setSkuData(dataArray.slice(start, end));

      if (dataArray.length > 0) {
        const totalPicked = dataArray.reduce((sum, item) => sum + (item.picked || 0), 0);
        const totalShipped = dataArray.reduce((sum, item) => sum + (item.shipped || 0), 0);
        const totalRto = dataArray.reduce((sum, item) => sum + (item.rto || 0), 0);
        const totalDelivered = dataArray.reduce((sum, item) => sum + (item.delivery || 0), 0);
        const totalReturned = dataArray.reduce((sum, item) => sum + (item.return_qty || 0), 0);
        const totalDeliverySuccess = dataArray.reduce((sum, item) => sum + (item.delivery_success || 0), 0);
        const totalOrders = dataArray.reduce((sum, item) => sum + (item.orders || 0), 0);

        setSummary({
          picked: totalPicked,
          shipped: totalShipped,
          rto: totalRto,
          delivered: totalDelivered,
          returned: totalReturned,
          delivery: totalDeliverySuccess,
          pickedPercent: totalOrders ? ((totalPicked / totalOrders) * 100).toFixed(2) : 0,
          shippedPercent: totalOrders ? ((totalShipped / totalOrders) * 100).toFixed(2) : 0,
          deliveredPercent: totalOrders ? ((totalDelivered / totalOrders) * 100).toFixed(2) : 0,
          returnPercent: totalOrders ? ((totalReturned / totalOrders) * 100).toFixed(2) : 0,
          deliveryPercent: totalOrders ? ((totalDeliverySuccess / totalOrders) * 100).toFixed(2) : 0
        });
      }
    } catch {
      // Keep the current report state when the API request fails.
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchSize, activeFilter, currentPage]);

  useEffect(() => {
    fetchSKUData();
  }, [searchTerm, searchSize, activeFilter, currentPage, fetchSKUData]);

  const totalSales = skuData.reduce((sum, item) => sum + (item.profit_loss || 0), 0);
  const totalProfit = skuData.reduce((sum, item) => sum + (item.profit_loss || 0), 0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToCSV = () => {
    const headers = ['Sku ID', 'SIZE', 'PROFIT/LOSS', 'ORDERS', 'HOLD', 'PROING', 'CANCELED', 'R.T.S.', 'PICKED', 'SHIPPED', 'RTO', 'RETURN', 'DELIVERY', 'N/A', 'Avg. PJ%'];
    const csvContent = [headers, ...skuData.map(item => [
      item.sku_id, item.box_size, item.profit_loss, item.orders, item.hold, item.proing,
      item.canceled, item.rts, item.picked, item.shipped, item.rto, item.return_qty,
      item.delivery, item.na || '', item.avg_pj
    ])].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sku_report.csv';
    link.click();
  };

  if (loading && skuData.length === 0) {
    return (
      <div className="flex items-center justify-center min-vh-100 bg-bg">
        <div className="text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing Report Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 lg:p-8 space-y-6 font-sans">
      {/* Header Info Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-gray-100/50 flex flex-col lg:grid lg:grid-cols-12 gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        {/* Left Info & Filters */}
        <div className="lg:col-span-12 xl:col-span-6 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-2xl">
                  <FiBarChart2 className="text-primary" size={28} />
                </div>
                SKU Report
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.4em] ml-1">{accountName} Operations</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                  placeholder="SKU ID (F3)"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="relative group">
                <FiPackage size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                  placeholder="Size (F4)"
                  value={searchSize}
                  onChange={(e) => { setSearchSize(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Universal View', icon: <FiRefreshCw size={12} /> },
              { id: 'profit', label: 'Profit Assets', icon: <FiTrendingUp size={12} /> },
              { id: 'loss', label: 'Loss Markers', icon: <FiTrendingDown size={12} /> }
            ].map(btn => (
              <button
                key={btn.id}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeFilter === btn.id ? 'bg-primary text-white shadow-lg shadow-primary/20 -translate-y-1' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                onClick={() => setActiveFilter(btn.id)}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Performance Metrics Table */}
        <div className="lg:col-span-12 xl:col-span-6">
          <div className="bg-gray-900 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="px-6 py-4 bg-white/5 text-white/40 text-[0.6rem] font-black uppercase tracking-widest text-center border-b border-white/5">Overall SKU Performance Matrix</div>
            <div className="overflow-auto scroll-none">
              <table className="w-full text-center border-collapse">
                <thead className="text-[0.65rem] text-gray-400 font-black uppercase tracking-tighter bg-white/5">
                  <tr>
                    <th className="px-4 py-3">Picked</th>
                    <th className="px-4 py-3">Shipped</th>
                    <th className="px-4 py-3 text-red-400/80">RTO</th>
                    <th className="px-4 py-3">Delivered</th>
                    <th className="px-4 py-3 text-amber-400/80">Return</th>
                    <th className="px-4 py-3 text-cyan-400/80">Success</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-black text-white divide-y divide-white/5">
                  <tr>
                    <td className="px-4 py-4">{summary.picked}</td>
                    <td className="px-4 py-4">{summary.shipped}</td>
                    <td className="px-4 py-4 text-red-500">{summary.rto}</td>
                    <td className="px-4 py-4">{summary.delivered}</td>
                    <td className="px-4 py-4">{summary.returned}</td>
                    <td className="px-4 py-4">{summary.delivery}</td>
                  </tr>
                  <tr className="bg-white/5 text-xs text-primary">
                    <td className="px-4 py-2 opacity-80">{summary.pickedPercent}%</td>
                    <td className="px-4 py-2 opacity-80">{summary.shippedPercent}%</td>
                    <td className="px-4 py-2 text-red-400">—</td>
                    <td className="px-4 py-2 opacity-80">{summary.deliveredPercent}%</td>
                    <td className="px-4 py-2 text-amber-400">{summary.returnPercent}%</td>
                    <td className="px-4 py-2 text-cyan-400">{summary.deliveryPercent}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-primary/5 border border-gray-100/50 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.75rem] border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-5">Sku Identity</th>
                <th className="px-4 py-5">Size</th>
                <th className="px-4 py-5">± Net Val</th>
                <th className="px-4 py-5">Orders</th>
                <th className="px-4 py-5 opacity-40">Hold</th>
                <th className="px-4 py-5 opacity-40">Proing</th>
                <th className="px-4 py-5">Cancel</th>
                <th className="px-4 py-5">R.T.S</th>
                <th className="px-4 py-5">Picked</th>
                <th className="px-4 py-5">Ship</th>
                <th className="px-4 py-5 text-red-500/60">RTO</th>
                <th className="px-4 py-5 text-amber-500/60">Ret</th>
                <th className="px-4 py-5 text-green-500/60">Del</th>
                <th className="px-4 py-5">N/A</th>
                <th className="px-6 py-5">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
              {skuData.map((item, idx) => {
                const isProfit = (item.profit_loss || 0) >= 0;
                return (
                  <tr key={idx} className="hover:bg-primary/5 transition-all cursor-default group">
                    <td className="px-6 py-4 font-black text-gray-900 group-hover:text-primary transition-colors underline decoration-primary/20 decoration-2 underline-offset-4">{item.sku_id}</td>
                    <td className="px-4 py-4 italic uppercase text-[0.65rem] font-bold text-gray-400">{item.box_size || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-lg font-black text-[0.7rem] ${isProfit ? 'text-green-600 bg-green-50 border border-green-100' : 'text-red-600 bg-red-50 border border-red-100'}`}>
                        ₹{item.profit_loss || '0.00'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-black text-gray-900">{item.orders || '0'}</td>
                    <td className="px-4 py-4 opacity-40">{item.hold || '0'}</td>
                    <td className="px-4 py-4 opacity-40">{item.proing || '0'}</td>
                    <td className={`px-4 py-4 ${item.canceled > 50 ? 'text-red-500 font-black' : ''}`}>{item.canceled || '0'}</td>
                    <td className="px-4 py-4">{item.rts || '0'}</td>
                    <td className="px-4 py-4">{item.picked || '0'}</td>
                    <td className="px-4 py-4 font-bold text-gray-800">{item.shipped || '0'}</td>
                    <td className="px-4 py-4 font-bold text-red-600/70">{item.rto || '0'}</td>
                    <td className="px-4 py-4 font-bold text-amber-600/70">{item.return_qty || '0'}</td>
                    <td className="px-4 py-4 font-black text-green-600">{item.delivery || '0'}</td>
                    <td className="px-4 py-4">{item.na || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${item.avg_pj}%` }} />
                        </div>
                        <span className="font-mono font-bold text-primary text-[0.7rem]">{item.avg_pj}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Internal Stats */}
        <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 flex flex-wrap gap-8 text-[0.7rem] font-black uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <FiPackage className="text-gray-400" size={16} />
            <span className="text-gray-400">Box Units: <span className="text-gray-900">{skuData.length} / {totalItems}</span></span>
          </div>
          <div className="flex items-center gap-3">
            <FiTrendingUp className="text-green-500" size={16} />
            <span className="text-gray-400">Cumul. Revenue: <span className="text-gray-900">₹{totalSales.toLocaleString()}</span></span>
          </div>
          <div className="flex items-center gap-3">
            <FiBarChart2 className="text-primary" size={16} />
            <span className="text-gray-400">Projected Yield: <span className="text-primary underline decoration-2">₹{totalProfit.toLocaleString()}</span></span>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm w-fit">
          <FiCalendar className="text-primary" />
          <div className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">
            Timeframe Coverage: <span className="text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 ml-2">21/07/2025 – 13/12/2025</span>
          </div>
        </div>

        <div className="flex flex-wrap lg:justify-end gap-3">
          <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest text-gray-600 hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm">
            <FiDownload />
            Dump to CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest text-gray-600 hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm">
            <FiEye />
            Cost Inspect
          </button>
          <button onClick={fetchSKUData} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">
            <FiRefreshCw />
            Sync Data
          </button>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-2xl text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95">
            <FiX />
            Exit Report
          </button>
        </div>
      </div>

      {/* Pagination Container */}
      {totalItems > itemsPerPage && (
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">
            <FiInfo size={12} />
            Indexing Result {startIndex} – {endIndex} of {totalItems}
          </div>

          <nav className="flex items-center bg-gray-100 rounded-2xl overflow-hidden p-1 shadow-inner">
            <button
              className={`p-2.5 rounded-xl transition-all ${currentPage === 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-600 hover:bg-white'}`}
              onClick={() => goToPage(currentPage - 1)}
            >
              <FiChevronLeft size={18} />
            </button>

            <div className="flex gap-1 px-1">
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`min-w-[40px] h-10 rounded-xl text-xs font-black transition-all ${currentPage === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-white'}`}
                      onClick={() => goToPage(i)}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}
            </div>

            <button
              className={`p-2.5 rounded-xl transition-all ${currentPage === totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-600 hover:bg-white'}`}
              onClick={() => goToPage(currentPage + 1)}
            >
              <FiChevronRight size={18} />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SKUReport;

