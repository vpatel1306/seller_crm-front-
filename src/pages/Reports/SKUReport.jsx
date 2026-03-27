import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const SKUReport = () => {
  // State Management
  const navigate = useNavigate();
  const [skuData, setSkuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSize, setSearchSize] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'profit', 'loss'
  const itemsPerPage = 10;
  const [allSkuData, setAllSkuData] = useState([]);

  // Summary metrics from the image
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

  // Mock API function - Replace with your actual API call

const fetchSKUData = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    // Fetch ALL data without pagination
    const response = await api.get(`/sku-list/?limit=10000`); // Fetch all or use a large limit
    const resData = response.data;
    
    let dataArray = resData.data || [];
    
    // Apply filters on all data
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
    
    // Store all filtered data
    setAllSkuData(dataArray);
    setTotalItems(dataArray.length);
    
    // Apply pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setSkuData(dataArray.slice(start, end));
    
    // Calculate summary metrics from filtered data
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

  } catch (err) {
    setError(err.message || 'Failed to fetch SKU data');
  } finally {
    setLoading(false);
  }
}, [searchTerm, searchSize, activeFilter, currentPage]);

useEffect(() => {
  fetchSKUData();
}, [searchTerm, searchSize, activeFilter, currentPage, fetchSKUData]);
  // Calculate totals
  const totalSales = skuData.reduce((sum, item) => sum + (item.profit_loss || 0), 0);
  const totalProfit = skuData.reduce((sum, item) => sum + (item.profit_loss || 0), 0);
  const totalOrders = skuData.reduce((sum, item) => sum + (item.orders || 0), 0);

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Sku ID', 'SIZE', 'PROFIT/LOSS', 'ORDERS', 'HOLD', 'PROING', 'CANCELED', 'R.T.S.', 'PICKED', 'SHIPPED', 'RTO', 'RETURN', 'DELIVERY', 'N/A', 'Avg. PJ%'];
    const csvData = skuData.map(item => [
      item.sku_id, item.box_size, item.profit_loss, item.orders, item.hold, item.proing,
      item.canceled, item.rts, item.picked, item.shipped, item.rto, item.return_qty,
      item.delivery, item.na || '', item.avg_pj
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sku_report.csv';
    link.click();
  };

  if (loading && skuData.length === 0) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading SKU data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light px-3 px-md-4 py-4 min-vh-100">
      {/* Header Card - Matching Image Design */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body p-4">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h1 className="h2 mb-1 fw-semibold" style={{ color: '#1a2c3e' }}>SKU Wise Report</h1>
                  <p className="text-muted mb-0">Dev E-Com</p>
                </div>
                <div className="d-flex gap-3">
                  <div>
                    <span className="text-muted me-2">Search On SKU-ID (F3)</span>
                    <input
                      type="text"
                      className="form-control form-control-sm d-inline-block w-auto"
                      placeholder="SKU ID"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{ width: '150px' }}
                    />
                  </div>
                  <div>
                    <span className="text-muted me-2">Search On Size (F4)</span>
                    <input
                      type="text"
                      className="form-control form-control-sm d-inline-block w-auto"
                      placeholder="Size"
                      value={searchSize}
                      onChange={(e) => {
                        setSearchSize(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
              </div>
                {/* Filter Buttons */}
                <div className="d-flex gap-2 mb-4">
                  <button
                    className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All SKU
                  </button>
                  <button
                    className={`btn btn-sm ${activeFilter === 'profit' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setActiveFilter('profit')}
                  >
                    Profit SKU
                  </button>
                  <button
                    className={`btn btn-sm ${activeFilter === 'loss' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setActiveFilter('loss')}
                  >
                    Loss SKU
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                {/* Overall SKU Performance Table */}
                <div className="border rounded overflow-hidden">
                  <table className="table table-bordered mb-0" style={{ fontSize: '0.875rem' }}>
                    <thead className="table-secondary">
                      <tr className="text-center">
                        <th colSpan="6" className="fw-semibold">Overall SKU performance</th>
                      </tr>
                      <tr className="text-center">
                        <th className="fw-semibold">PICKED</th>
                        <th className="fw-semibold">SHIPPED</th>
                        <th className="fw-semibold">RTO</th>
                        <th className="fw-semibold">DELIVERED</th>
                        <th className="fw-semibold">RETURN</th>
                        <th className="fw-semibold">DELIVERY</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center">
                        <td className="fw-bold">{summary.picked}</td>
                        <td className="fw-bold">{summary.shipped}</td>
                        <td className="fw-bold text-danger">{summary.rto}</td>
                        <td className="fw-bold">{summary.delivered}</td>
                        <td className="fw-bold">{summary.returned}</td>
                        <td className="fw-bold">{summary.delivery}</td>
                      </tr>
                      <tr className="text-center">
                        <td className="text-success fw-semibold">{summary.pickedPercent} %</td>
                        <td className="text-success fw-semibold">{summary.shippedPercent} %</td>
                        <td className="text-danger fw-semibold">-</td>
                        <td className="text-success fw-semibold">{summary.deliveredPercent} %</td>
                        <td className="text-warning fw-semibold">{summary.returnPercent} %</td>
                        <td className="text-success fw-semibold">{summary.deliveryPercent} %</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover table-bordered mb-0" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th className="fw-semibold py-3">Sku ID</th>
                <th className="fw-semibold py-3">SIZE</th>
                <th className="fw-semibold py-3">PROFIT / LOSS</th>
                <th className="fw-semibold py-3">ORDERS</th>
                <th className="fw-semibold py-3">HOLD</th>
                <th className="fw-semibold py-3">PROING</th>
                <th className="fw-semibold py-3">CANCELED</th>
                <th className="fw-semibold py-3">R.T.S.</th>
                <th className="fw-semibold py-3">PICKED</th>
                <th className="fw-semibold py-3">SHIPPED</th>
                <th className="fw-semibold py-3">RTO</th>
                <th className="fw-semibold py-3">RETURN</th>
                <th className="fw-semibold py-3">DELIVERY</th>
                <th className="fw-semibold py-3">N/A</th>
                <th className="fw-semibold py-3">Avg. PJ%</th>
              </tr>
            </thead>
            <tbody>
              {skuData.length > 0 ? (
                skuData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="fw-semibold text-primary">{item.sku_id}</td>
                    <td>{item.box_size || '-'}</td>
                    <td className={`fw-semibold ${(item.profit_loss || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                      {item.profit_loss || '0.00'}
                    </td>
                    <td className="fw-semibold">{item.orders || '0'}</td>
                    <td>{item.hold || '0'}</td>
                    <td>{item.proing || '0'}</td>
                    <td className={item.canceled > 50 ? 'text-danger fw-semibold' : ''}>{item.canceled || '0'}</td>
                    <td>{item.rts || '0'}</td>
                    <td>{item.picked || '0'}</td>
                    <td>{item.shipped || '0'}</td>
                    <td>{item.rto || '0'}</td>
                    <td>{item.return_qty || '0'}</td>
                    <td>{item.delivery || '0'}</td>
                    <td>{item.na || '-'}</td>
                    <td className="fw-semibold text-info">{item.avg_pj}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" className="text-center py-5">
                    <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                    <p className="text-muted mb-0">No SKU data found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        <div className="bg-light border-top p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-box-seam text-secondary"></i>
                <span className="text-secondary">Total Boxes: {skuData.length} / {totalItems}</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-currency-dollar text-success"></i>
                <span><strong>Total Sales:</strong> ${totalSales.toFixed(2)}</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-graph-up text-info"></i>
                <span><strong>Total Profit:</strong> ${totalProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Card */}
      <div className="card shadow-sm mt-3 border-0">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-calendar3 text-muted"></i>
              <span className="text-muted small">Orders From Date 21/07/2025 To Date 13/12/2025</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button onClick={exportToCSV} className="btn btn-sm btn-outline-primary">
                <i className="bi bi-download me-1"></i> Export CSV
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-eye me-1"></i> View SKU Cost
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-speedometer2 me-1"></i> SKU Dashboard
              </button>
              <button onClick={() => fetchSKUData(currentPage, searchTerm, searchSize, activeFilter)} className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-arrow-repeat me-1"></i> Refresh
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => navigate('/dashboard')}>
                <i className="bi bi-x-lg me-1"></i> Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Card */}
      {totalItems > 0 && (
        <div className="card shadow-sm mt-3 border-0">
          <div className="card-body p-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                Showing {startIndex} to {endIndex} of {totalItems} entries
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    
                    if (endPage - startPage + 1 < maxVisible) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => goToPage(i)}>
                            {i}
                          </button>
                        </li>
                      );
                    }
                    return pages;
                  })()}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SKUReport;