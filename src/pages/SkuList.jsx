import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from "react-router-dom";
import SKUCostModal from '../components/layout/SKUCostModal';
import {
    FiChevronLeft, FiChevronRight, FiDownload, FiUpload, FiX, FiFilter,
    FiDatabase, FiSettings, FiChevronDown, FiPlusCircle
} from 'react-icons/fi';

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

            let list = [];
            let total = 0;

            if (res.data) {
                if (Array.isArray(res.data)) {
                    list = res.data;
                    total = res.data.length;
                }
                else if (res.data.data && Array.isArray(res.data.data)) {
                    list = res.data.data;
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
        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
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
                if (i - l === 2) rangeWithDots.push(l + 1);
                else if (i - l !== 1) rangeWithDots.push('...');
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
        <div className="flex flex-col h-screen bg-bg overflow-hidden font-sans">
            {/* HEADER */}
            <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-md z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <FiDatabase size={20} className="text-primary" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">SKU MASTER <span className="text-primary/80 font-medium">— Dev E-Com</span></h1>
                </div>
                <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <span className="text-[0.7rem] uppercase tracking-widest text-gray-400 font-bold">Timeframe:</span>
                    <span className="text-xs font-mono">21/07/2025</span>
                    <FiChevronRight size={12} className="text-primary" />
                    <span className="text-xs font-mono">13/12/2025</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* SIDEBAR FILTER */}
                <aside className="w-72 bg-white border-r border-gray-100 flex flex-col p-5 overflow-y-auto space-y-6 shadow-sm z-10">
                    <div className="flex items-center gap-2 text-primary border-b border-gray-50 pb-3">
                        <FiFilter size={16} />
                        <h2 className="text-sm font-bold uppercase tracking-wider">Refine Search</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "SKU Keyword 1", shortcut: "F3" },
                            { label: "SKU Keyword 2", shortcut: null },
                            { label: "SKU Keyword 3", shortcut: null },
                            { label: "Size", shortcut: "F4" }
                        ].map((field) => (
                            <div key={field.label} className="space-y-1.5">
                                <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-tighter flex justify-between">
                                    {field.label} {field.shortcut && <span className="text-primary/50">{field.shortcut}</span>}
                                </label>
                                <input className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all text-gray-700" />
                            </div>
                        ))}

                        <div className="space-y-1.5">
                            <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-tighter flex justify-between">
                                Sell Price Range <span className="text-primary/50">F6</span>
                            </label>
                            <div className="flex gap-2">
                                <input className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:bg-white" placeholder="Min" />
                                <input className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:bg-white" placeholder="Max" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-tighter flex justify-between">
                                Cost Range <span className="text-primary/50">F7</span>
                            </label>
                            <div className="flex gap-2">
                                <input className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:bg-white" placeholder="Min" />
                                <input className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary focus:bg-white" placeholder="Max" />
                            </div>
                        </div>

                        <button className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest mt-2 active:scale-95">
                            Clear Filters
                        </button>
                    </div>

                    <div className="pt-6 border-t border-gray-50 space-y-4">
                        <div className="space-y-2">
                            {["All SKUs", "Without Cost SKUs", "Cost Set SKUs"].map((opt, i) => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="sku-filter" defaultChecked={i === 0} className="w-4 h-4 accent-primary" />
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">{opt}</span>
                                </label>
                            ))}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-50/50">
                            {["This Account SKUs", "All Account SKUs"].map((opt, i) => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="account-filter" defaultChecked={i === 0} className="w-4 h-4 accent-primary" />
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 flex flex-col bg-white overflow-hidden">
                    <div className="flex-1 overflow-auto p-6">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 uppercase text-[0.65rem] font-bold text-gray-400 tracking-widest">
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
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="px-5 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching records...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : skuList.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="px-5 py-20 text-center text-gray-400 italic">No data found in this criteria</td>
                                        </tr>
                                    ) : (
                                        skuList.map((item, index) => {
                                            const isActive = index === selectedRowIndex;
                                            const finalCost = (item.basic_cost || 0) + ((item.basic_cost || 0) * (item.gst_percentage || 0) / 100) + (item.packing_charge || 0);
                                            return (
                                                <tr
                                                    key={index}
                                                    className={`hover:bg-indigo-50/30 transition-colors cursor-pointer group ${isActive ? "bg-indigo-50/70 shadow-inner" : ""}`}
                                                    onClick={() => handleRowClick(item, index)}
                                                >
                                                    <td className="px-5 py-4 font-bold text-gray-900 group-hover:text-primary">{item.sku_id || "-"}</td>
                                                    <td className="px-5 py-4 text-gray-600 uppercase italic font-medium">{item.box_size || "Free Size"}</td>
                                                    <td className="px-5 py-4 font-mono font-bold">{item.orders || 0}</td>
                                                    <td className="px-5 py-4 font-bold text-gray-900">₹{item.selling || 0}</td>
                                                    <td className="px-5 py-4 text-gray-600">₹{item.basic_cost || 0}</td>
                                                    <td className="px-5 py-4"><span className="px-2 py-0.5 bg-gray-100 rounded font-bold text-gray-500">{item.gst_percentage || 0}%</span></td>
                                                    <td className="px-5 py-4 text-gray-600">₹{item.packing_charge || 0}</td>
                                                    <td className="px-5 py-4"><span className="text-primary font-bold bg-primary/5 px-2 py-1 rounded-lg">₹{finalCost.toFixed(2)}</span></td>
                                                    <td className="px-5 py-4 text-[0.7rem] text-gray-400 whitespace-nowrap">{item.updated_at || "-"}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex items-center justify-between mt-6 px-2">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {totalSKUs > 0 ?
                                    `Results: ${((currentPage - 1) * perPage) + 1} — ${Math.min(currentPage * perPage, totalSKUs)} total ${totalSKUs}` :
                                    'No records'
                                }
                            </div>

                            <div className="flex items-center gap-4">
                                {/* PER PAGE */}
                                <div className="relative">
                                    <button
                                        className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-primary transition-all flex items-center gap-2 active:scale-95"
                                        onClick={() => setShowPerPageOptions(!showPerPageOptions)}
                                    >
                                        <span>Show {perPage}</span>
                                        <FiChevronDown size={14} className={showPerPageOptions ? 'rotate-180' : ''} />
                                    </button>
                                    {showPerPageOptions && (
                                        <div className="absolute bottom-full mb-2 bg-white border border-gray-100 rounded-xl shadow-xl w-32 overflow-hidden z-30 transform origin-bottom animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            {[10, 25, 50, 100].map(opt => (
                                                <button
                                                    key={opt}
                                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors ${perPage === opt ? 'text-primary bg-primary/5' : 'text-gray-500'}`}
                                                    onClick={() => handlePerPageChange(opt)}
                                                >
                                                    {opt} per page
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* NUMBERS */}
                                <nav className="flex items-center bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        className={`p-2 hover:bg-gray-50 transition-colors ${currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600'}`}
                                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <FiChevronLeft size={18} />
                                    </button>

                                    <div className="flex items-center">
                                        {getPaginationNumbers().map((page, index) => (
                                            page === '...' ? (
                                                <span key={`dots-${index}`} className="px-3 text-gray-300 font-bold text-[0.7rem]">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    className={`px-4 py-2 text-xs font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-inner' : 'text-gray-500 hover:bg-gray-50'}`}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    <button
                                        className={`p-2 hover:bg-gray-50 transition-colors ${currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600'}`}
                                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <FiChevronRight size={18} />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTION BAR */}
                    <footer className="bg-gray-50 border-t border-gray-100 p-4 flex items-center justify-between gap-4 z-20">
                        <div className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[0.7rem] font-bold uppercase tracking-widest flex items-center gap-3">
                            <span className="opacity-50">Page Statistics</span>
                            <span className="text-primary font-mono">{currentPage} of {totalPages}</span>
                            <span className="opacity-20 text-lg">|</span>
                            <span>Total Count: {totalSKUs}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-xl hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center gap-2 shadow-sm uppercase tracking-wider italic">
                                <span>No SKU Search Result</span>
                            </button>
                            <button className="px-5 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 active:bg-green-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-green-500/20 uppercase tracking-widest" onClick={() => setShowSKUCostModal(true)}>
                                <FiPlusCircle size={14} />
                                <span>Set Single SKU Cost</span>
                            </button>
                            <button className="px-5 py-2.5 bg-indigo-500 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 active:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-500/20 uppercase tracking-widest">
                                <FiSettings size={14} />
                                <span>Bulk Update</span>
                            </button>
                            <button className="px-5 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 active:bg-amber-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-amber-500/20 uppercase tracking-widest" onClick={exportToCSV}>
                                <FiDownload size={14} />
                                <span>Export Excel</span>
                            </button>
                            <button className="px-5 py-2.5 bg-cyan-500 text-white text-xs font-bold rounded-xl hover:bg-cyan-600 active:bg-cyan-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-cyan-500/20 uppercase tracking-widest">
                                <FiUpload size={14} />
                                <span>Import Excel</span>
                            </button>
                            <button className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 active:bg-red-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-red-600/20 uppercase tracking-widest" onClick={() => navigate("/dashboard")}>
                                <FiX size={14} />
                                <span>Exit</span>
                            </button>
                        </div>
                    </footer>
                </main>
            </div>

            <SKUCostModal
                isOpen={showSKUCostModal}
                onClose={() => setShowSKUCostModal(false)}
                skuData={selectedSKU}
            />
        </div>
    );
}