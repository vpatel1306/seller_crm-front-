import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiCalendar, FiDownload, FiPercent, FiBox, FiRefreshCw, FiX, FiArrowRight, FiChevronLeft, FiChevronRight, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import OrdersPageHeader from "../../components/orders/OrdersPageHeader";

const DateWiseReport = () => {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const accountName = activeAccount?.account_name || "No account selected";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      const res = await api.get(`/sku-list?skip=${skip}&limit=${limit}`);
      setData(res.data.data || []);
      setTotal(res.data.count || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-bg p-4 lg:p-8 flex flex-col gap-6 font-sans">

      {/* Header */}
      <OrdersPageHeader 
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => navigate('/dashboard') },
          { label: 'Date Wise Report', current: true }
        ]}
        actions={
          <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/10 text-white relative z-10 group hover:border-primary/30 transition-all cursor-default">
            <span className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">Active Period</span>
            <span className="text-xs font-mono font-bold">JAN 2025</span>
            <FiArrowRight size={12} className="text-primary group-hover:translate-x-1 transition-transform" />
            <span className="text-xs font-mono font-bold">DEC 2025</span>
          </div>
        }
      />

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 flex-1 overflow-hidden">

        {/* Main Table Content */}
        <div className="lg:col-span-10 flex flex-col bg-white rounded-default shadow-xl shadow-primary/5 border border-gray-100/50 overflow-hidden">

          <div className="flex-1 overflow-auto scroll-none">
            <table className="w-full text-left text-[0.7rem] border-collapse min-w-[1200px]">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gray-50/80 backdrop-blur-md text-gray-400 font-extrabold uppercase tracking-widest border-b border-gray-100">
                  <th className="px-5 py-5 w-32">Order Date</th>
                  <th className="px-3 py-5">Orders</th>
                  <th className="px-3 py-5 opacity-40">Hold</th>
                  <th className="px-3 py-5 opacity-40">Pend</th>
                  <th className="px-3 py-5">Cancel</th>
                  <th className="px-3 py-5">Pickup</th>
                  <th className="px-3 py-5">Ship</th>
                  <th className="px-3 py-5 text-red-500/60">RTO</th>
                  <th className="px-3 py-5 text-amber-500/60">Ret</th>
                  <th className="px-3 py-5 text-green-500/60">Del</th>
                  <th className="px-3 py-5">Gross P/L</th>
                  <th className="px-3 py-5 opacity-30">Others</th>
                  <th className="px-5 py-5 text-center">Net Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="13" className="px-5 py-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[0.65rem] font-black text-gray-300 uppercase tracking-widest">Compiling Daily Metrics...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-5 py-4 font-black text-gray-900">{item.date || "N/A"}</td>
                      <td className="px-3 py-4 font-bold text-gray-700 bg-gray-50/30">{item.orders || 0}</td>
                      <td className="px-3 py-4 opacity-40 italic">{item.hold || 0}</td>
                      <td className="px-3 py-4 opacity-40 italic">{item.pending || 0}</td>
                      <td className="px-3 py-4 text-red-400">{item.cancel || 0}</td>
                      <td className="px-3 py-4">{item.pickup || 0}</td>
                      <td className="px-3 py-4 font-bold">{item.shipped || 0}</td>
                      <td className="px-3 py-4 font-black text-red-600/70">{item.rto || 0}</td>
                      <td className="px-3 py-4 font-black text-amber-600/70">{item.return || 0}</td>
                      <td className="px-3 py-4 font-black text-green-600/80">{item.delivery || 0}</td>
                      <td className="px-3 py-4 font-mono">₹{item.gross_pl || 0}</td>
                      <td className="px-3 py-4 opacity-30 italic">₹{item.other_loss || 0}</td>
                      <td className="px-5 py-4">
                        <div className={`px-4 py-1.5 rounded-full font-black text-center shadow-sm border ${item.net_pl >= 0 ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                          ₹{item.net_pl || 0}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-900 text-white font-black text-[0.72rem] shadow-inner uppercase tracking-tighter">
                <tr className="divide-x divide-white/5">
                  <td className="px-5 py-5 italic text-gray-500 tracking-widest">Total Summary →</td>
                  <td className="px-3 py-5">4441</td>
                  <td className="px-3 py-5 opacity-40">14</td>
                  <td className="px-3 py-5 opacity-40">25</td>
                  <td className="px-3 py-5 text-red-400">444</td>
                  <td className="px-3 py-5 text-primary">3948</td>
                  <td className="px-3 py-5">270</td>
                  <td className="px-3 py-5 text-red-500">452</td>
                  <td className="px-3 py-5 text-amber-500">355</td>
                  <td className="px-3 py-5 text-green-500">2871</td>
                  <td className="px-3 py-5 text-primary">₹55K</td>
                  <td className="px-3 py-5 opacity-40">₹2K</td>
                  <td className="px-5 py-5 text-center text-primary text-sm tracking-normal">₹29,900</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
              Showing Batch {page} of {totalPages} Daily Cycles
            </div>
            <nav className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-0.5">
              <button
                className={`p-1.5 rounded-lg transition-all ${page === 1 ? 'text-gray-200 pointer-events-none' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setPage(page - 1)}
              >
                <FiChevronLeft size={16} />
              </button>
              <div className="flex items-center px-2 font-black text-xs text-primary min-w-[50px] justify-center">
                {page} <span className="mx-1 text-gray-300 font-normal">/</span> {totalPages}
              </div>
              <button
                className={`p-1.5 rounded-lg transition-all ${page === totalPages ? 'text-gray-200 pointer-events-none' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setPage(page + 1)}
              >
                <FiChevronRight size={16} />
              </button>
            </nav>
          </div>
        </div>

        {/* Analytic Sidebar */}
        <aside className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-default border border-gray-100 shadow-sm p-6 overflow-hidden relative group">

            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <h6 className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest mb-4">Top Performance</h6>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FiTrendingUp className="text-green-500" />
                <div>
                  <div className="text-[0.6rem] font-bold text-gray-400 uppercase">Max Yield Day</div>
                  <div className="text-sm font-black text-gray-900 tracking-tighter">13/12/2025</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 italic text-[0.6rem] font-bold text-green-700 leading-tight">
                "Operations reached 94% efficiency during this period."
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-default shadow-xl shadow-primary/20 p-6 text-white relative overflow-hidden group">

            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500" />
            <FiBox size={32} className="opacity-20 mb-4" />
            <div className="text-[0.6rem] font-black uppercase tracking-widest opacity-60">Fleet Statistics</div>
            <div className="text-3xl font-black mt-1">136</div>
            <div className="text-[0.65rem] font-bold opacity-80 mt-1 uppercase tracking-tighter underline">Total Logged Days</div>
          </div>
        </aside>
      </div>

      {/* Footer Controls */}
      <footer className="bg-white rounded-default p-4 lg:p-6 shadow-xl shadow-primary/5 border border-gray-100/50 flex flex-col sm:flex-row justify-between items-center gap-6">


        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
            <FiBox className="text-gray-400" />
          </div>
          <div>
            <div className="text-xs font-black text-gray-900 uppercase tracking-tighter">Day Persistence Index</div>
            <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Audit coverage: 136 / 136 Records</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[0.65rem] font-black text-gray-600 uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm">
            <FiDownload /> Export Analytics
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[0.65rem] font-black text-gray-600 uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm">
            <FiPercent /> Calculation Matrix
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">
            <FiRefreshCw /> Synchronize
          </button>
          <button className="flex items-center gap-2 px-8 py-2.5 bg-red-600 text-white rounded-xl text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95" onClick={() => navigate("/dashboard")}>
            <FiX /> Close
          </button>
        </div>

      </footer>
    </div>
  );
};

export default DateWiseReport;



