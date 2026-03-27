import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { useNavigate } from "react-router-dom";
import SKUCostModal from '../components/layout/SKUCostModal';
import CommonModal from '../components/common/CommonModal';

export default function SkuList() {
    const navigate = useNavigate();
    const [showSKUCostModal, setShowSKUCostModal] = useState(false);
    const [skuList, setSkuList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSKU, setSelectedSKU] = useState(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSKUs, setTotalSKUs] = useState(0);
    const [showPerPageOptions, setShowPerPageOptions] = useState(false);
    const [perPage, setPerPage] = useState(10);

    const fetchSkuList = async (page = 1, perPageCount = perPage) => {
        setLoading(true);
        try {
            const skip = (page - 1) * perPageCount;
            const res = await api.get(`/sku-list/?skip=${skip}&limit=${perPageCount}`);
            
            // Handle different API response structures
            let list = [];
            let total = 0;
            
            if (res.data) {
                // If data is directly in response
                if (Array.isArray(res.data)) {
                    list = res.data;
                    total = res.data.length;
                }
                // If data is nested (your current API structure)
                else if (res.data.data && Array.isArray(res.data.data)) {
                    list = res.data.data;
                    
                    // Get total count dynamically by fetching all records without limit
                    try {
                        const totalRes = await api.get('/sku-list/');
                        if (totalRes.data && Array.isArray(totalRes.data)) {
                            total = totalRes.data.length;
                        } else if (totalRes.data && totalRes.data.data && Array.isArray(totalRes.data.data)) {
                            total = totalRes.data.data.length;
                        }
                    } catch (totalErr) {
                        total = res.data.count || res.data.total || res.data.data.length;
                    }
                }
                // If response has other structure
                else if (res.data.results && Array.isArray(res.data.results)) {
                    list = res.data.results;
                    total = res.data.count || res.data.results.length;
                }
            }
            
            setSkuList(list);
            setTotalSKUs(total);

            const calculatedTotalPages = total > 0 ? Math.ceil(total / perPageCount) : 1;
            setTotalPages(calculatedTotalPages);
            setCurrentPage(page);
        } catch (err) {

            setSkuList([]);
            setTotalSKUs(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchTotalSKUs = async () => {
        try {
            const res = await api.get('/sku-list/count');
            const total = res.data.count;
            setTotalSKUs(total);
        } catch (err) {
        }
    };

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
        // Create CSV headers
        const headers = ['SKU ID', 'Size', 'Orders', 'Selling', 'Basic Cost', 'GST %', 'Packing', 'Final Cost', 'Last Update'];
        
        // Create CSV data from skuList
        const csvData = skuList.map(item => [
            item.sku_id || '-',
            item.box_size || 'Free Size',
            item.orders || 0,
            item.selling || 0,
            item.basic_cost || 0,
            item.gst_percentage || 0,
            item.packing_charge || 0,
            ((item.basic_cost || 0) + ((item.basic_cost || 0) * (item.gst_percentage || 0) / 100) + (item.packing_charge || 0)).toFixed(2),
            item.updated_at || '-'
        ]);
        
        // Combine headers and data
        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        // Create blob and download
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

    const getPaginationNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    useEffect(() => {
        fetchSkuList();
    }, []);

    return (
    <div className="sku-page">

      {/* HEADER */}
      <div className="header-bar d-flex justify-content-between">
        <div className="sku-title">SKU MASTER - Dev E-Com</div>
        <div className="date-text">
          Orders From Date <b>21/07/2025</b> To Date <b>13/12/2025</b>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-layout">

        {/* SIDEBAR */}
        <div className="sidebar">

          <h6 className="section-title">SKU Filter For Cost SET</h6>

          <label>SKUs Keyword 1 (F3)</label>
          <input className="form-control filter-input" />

          <label>SKUs Keyword 2</label>
          <input className="form-control filter-input" />

          <label>SKUs Keyword 3</label>
          <input className="form-control filter-input" />

          <label>Size (F4)</label>
          <input className="form-control filter-input" />

          <label>Sell Price Range (F6)</label>
          <div className="d-flex gap-2">
            <input className="form-control" placeholder="0.00" />
            <input className="form-control" placeholder="0.00" />
          </div>

          <label className="mt-2">Cost Range (F7)</label>
          <div className="d-flex gap-2">
            <input className="form-control" placeholder="0.00" />
            <input className="form-control" placeholder="0.00" />
          </div>

          <button className="btn btn-light w-100 mt-2">
            Clear Search
          </button>

          <div className="radio-box mt-3">
            <div><input type="radio" name="sku" defaultChecked /> All SKUs</div>
            <div><input type="radio" name="sku" /> Without Cost SKUs</div>
            <div><input type="radio" name="sku" /> Cost Set SKUs</div>
          </div>

          <div className="radio-box mt-3">
            <div><input type="radio" name="account" defaultChecked /> This Account SKUs</div>
            <div><input type="radio" name="account" /> All Account SKUs</div>
          </div>

        </div>

        {/* CONTENT */}
        <div className="content">

          {/* TABLE */}
          <div className="sku-table">
            <table className="table table-bordered table-sm mb-0">
              <thead>
                <tr>
                  <th>SKU ID</th>
                  <th>Size</th>
                  <th>Orders</th>
                  <th>Selling</th>
                  <th>Basic Cost</th>
                  <th>GST %</th>
                  <th>Packing</th>
                  <th>Final Cost</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr>
                    <td colSpan="9" className="text-center">Loading...</td>
                    </tr>
                ) : skuList.length === 0 ? (
                    <tr>
                    <td colSpan="9" className="text-center">No Data Found</td>
                    </tr>
                ) : (
                    skuList.map((item, index) => (
                    <tr 
                        key={index} 
                        className={index === selectedRowIndex ? "active-row" : ""} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRowClick(item, index)}
                    >
                        <td>{item.sku_id || "-"}</td>
                        <td>{item.box_size || "Free Size"}</td>
                        <td>{item.orders || 0}</td>
                        <td>{item.selling || 0}</td>
                        <td>{item.basic_cost || 0}</td>
                        <td>{item.gst_percentage || 0}</td>
                        <td>{item.packing_charge || 0}</td>
                        <td>
                            {((item.basic_cost || 0) + ((item.basic_cost || 0) * (item.gst_percentage || 0) / 100) + (item.packing_charge || 0)).toFixed(2)}
                        </td>
                        <td>{item.updated_at || "-"}</td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            
              {/* Laravel-style Pagination */}
            <div className="laravel-pagination d-flex justify-content-between align-items-center mt-3">
                <div className="pagination-info">
                    <span className="text-muted">
                        {totalSKUs > 0 ? 
                            `Showing ${((currentPage - 1) * perPage) + 1} to ${Math.min(currentPage * perPage, totalSKUs)} of ${totalSKUs} entries` :
                            'No entries found'
                        }
                    </span>
                </div>
                
                <div className="d-flex align-items-center gap-3">
                    {/* Per Page Dropdown */}
                    <div className="per-page-dropdown">
                        <div className="dropdown">
                            <button 
                                className="btn btn-outline-secondary btn-sm dropdown-toggle" 
                                type="button"
                                onClick={() => setShowPerPageOptions(!showPerPageOptions)}
                            >
                                {perPage} per page
                            </button>
                            {showPerPageOptions && (
                                <div className="dropdown-menu show" style={{position: 'absolute', top: '100%', left: 0, zIndex: 1000}}>
                                    {[10, 25, 50, 100].map(option => (
                                        <button 
                                            key={option}
                                            className={`dropdown-item ${perPage === option ? 'active' : ''}`}
                                            onClick={() => handlePerPageChange(option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Pagination Numbers */}
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? '' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                    style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    Previous
                                </button>
                            </li>
                            
                            {getPaginationNumbers().map((page, index) => (
                                page === '...' ? (
                                    <li key={`dots-${index}`} className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                ) : (
                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                        <button 
                                            className="page-link" 
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                )
                            ))}
                            
                            <li className={`page-item ${currentPage === totalPages ? '' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                    style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

          </div>

          {/* FOOTER */}
            <div className="footer-bar">
                <div className="total-box">TOTAL SKUS ( {currentPage} / {totalPages} ) - {totalSKUs} Total</div>

                <div className="btn-group-footer">
                    <button className="btn btn-secondary">Please, Search SKUs</button>
                   <button className="btn btn-success"  onClick={() => setShowSKUCostModal(true)}>SET COST ON SINGLE SKU</button>
                    <button className="btn btn-light">COMMON COST UPDATE</button>
                    <button className="btn btn-warning" onClick={exportToCSV}>Export Excel</button>
                    <button className="btn btn-success">Upload Excel</button>
                    <button className="btn btn-danger"  onClick={() => {navigate("/dashboard"); }}>CLOSE</button>
                </div>
                <SKUCostModal 
                    isOpen={showSKUCostModal} 
                    onClose={() => setShowSKUCostModal(false)} 
                    skuData={selectedSKU}
                />
            </div>

        </div>
      </div>
    </div>
  );
}