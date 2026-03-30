import React from "react";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import { FiX, FiCornerDownLeft, FiRefreshCcw, FiCheckCircle, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ReturnEntryAccountWise = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-bg p-4 flex flex-col gap-6 font-sans max-w-[1700px] mx-auto overflow-x-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-4 rounded-2xl flex justify-between items-center shadow-lg shadow-red-600/20">
        <div className="flex items-center gap-3">
          <FiCornerDownLeft size={20} className="text-white/80" />
          <h1 className="font-black tracking-tight text-lg uppercase flex items-center gap-3">
            <span>venus times store</span>
            <span className="opacity-20 text-xl font-thin">|</span>
            <span className="text-white/80 font-medium">Return Entry (Account Wise)</span>
          </h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90" onClick={handleClose}>
          <FiX size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 flex-1">
        {/* LEFT SIDE - Accepted Table */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-green-500" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accepted Returns</span>
            </div>
          </div>

          <div className="overflow-auto flex-1 rounded-2xl border border-gray-50 shadow-inner bg-gray-50/20">
            <table className="w-full text-left text-[0.7rem] border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">
                <tr>
                  <th className="px-3 py-3 border-b border-gray-200">Order/AWB</th>
                  <th className="px-3 py-3 border-b border-gray-200">Date</th>
                  <th className="px-3 py-3 border-b border-gray-200">Return</th>
                  <th className="px-3 py-3 border-b border-gray-200">Qty</th>
                  <th className="px-3 py-3 border-b border-gray-200">Issue</th>
                  <th className="px-3 py-3 border-b border-gray-200">Scan Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td colSpan="6" className="px-3 py-24 text-center text-gray-300 font-bold uppercase tracking-widest italic opacity-50">
                    Waiting for scans...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CENTER INDICATOR (Visible on LG) */}
        <div className="hidden lg:col-span-1 lg:flex flex-col items-center justify-center">
          <div className="text-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <BsArrowLeftCircleFill size={56} className="text-red-600 relative z-10 animate-pulse" />
            </div>
            <div className="text-red-600 font-black text-4xl mt-3 tracking-tighter">0</div>
            <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Accepted</div>
          </div>
        </div>

        {/* RIGHT SIDE - Inputs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

            <div className="flex items-center gap-2 mb-8">
              <FiSearch size={16} className="text-primary" />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scan Terminals</h2>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wide px-1">AWB / Pack QR</label>
                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-inner" placeholder="Scan here..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wide px-1">Order No.</label>
                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-inner" placeholder="0000000..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wide px-1">Received Condition</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary bg-white transition-all shadow-sm">
                  <option>No Issue In Return</option>
                  <option>I have received wrong return</option>
                  <option>Item/s are missing in my return</option>
                </select>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200 grid grid-cols-2 gap-y-4">
                <div className="space-y-1">
                  <span className="text-[0.6rem] font-bold text-gray-300 uppercase block">Order#</span>
                  <span className="text-[0.7rem] font-mono text-gray-400 italic">Pending...</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[0.6rem] font-bold text-gray-300 uppercase block">Date</span>
                  <span className="text-[0.7rem] font-mono text-gray-400 italic">Pending...</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[0.6rem] font-bold text-gray-300 uppercase block">AWB#</span>
                  <span className="text-[0.7rem] font-mono text-gray-400 italic">Pending...</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[0.6rem] font-bold text-gray-300 uppercase block">Courier</span>
                  <span className="text-[0.7rem] font-mono text-gray-400 italic">Pending...</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button className="w-full py-3.5 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <FiCheckCircle size={14} />
                  Accept Return
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM AREA - Search Results */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <FiRefreshCcw className="text-indigo-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Search Results (0)</span>
          </div>
        </div>

        <div className="overflow-auto rounded-2xl border border-gray-50 shadow-inner bg-gray-50/20">
          <table className="w-full text-left text-[0.7rem] border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">
              <tr>
                <th className="px-3 py-3 border-b border-gray-200">Date</th>
                <th className="px-3 py-3 border-b border-gray-200">Order#</th>
                <th className="px-3 py-3 border-b border-gray-200">Return AWB</th>
                <th className="px-3 py-3 border-b border-gray-200">R-Courier</th>
                <th className="px-3 py-3 border-b border-gray-200">Pickup AWB</th>
                <th className="px-3 py-3 border-b border-gray-200">P-Courier</th>
                <th className="px-3 py-3 border-b border-gray-200">Return Create</th>
                <th className="px-3 py-3 border-b border-gray-200">Qty</th>
                <th className="px-3 py-3 border-b border-gray-200">SKU ID</th>
                <th className="px-3 py-3 border-b border-gray-200">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td colSpan="10" className="px-3 py-24 text-center text-gray-300 font-bold uppercase tracking-widest italic opacity-50">
                  Search for records to display data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReturnEntryAccountWise;