import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiFileText, FiFolder, FiSave, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const PickUpEntry = () => {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const accountName = activeAccount?.account_name || "No account selected";
  const [pendingLabels] = useState([
    { seller: "CHAITANYA_ENTERPRISE", orderNo: "15207610943726400_1", awb: "1490813056188363" },
    { seller: "CHAITANYA_ENTERPRISE", orderNo: "153818098695217792_1", awb: "VL0081121968696" },
    { seller: "DIGITECHIFIED B-333", orderNo: "OD334873404344674100", awb: "FMPQ4977103874" },
  ]);

  const [labelFiles] = useState([
    { time: "10/07/2025 03:44:22 PM", name: "Sub_Order_Labels_7eeeab79-fb5-4cc4-bee2-53c05e3..." }
  ]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  return (
    <div className="min-h-screen bg-bg p-4 flex flex-col gap-4 font-sans max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-4 rounded-2xl flex justify-between items-center shadow-lg shadow-red-600/20">
        <div className="flex items-center gap-3">
          <FiFileText size={20} className="text-white/80" />
          <h1 className="font-black tracking-tight text-lg uppercase">
            Import Label File (Pick-Up) <span className="text-white/60 font-medium">— {accountName}</span>
          </h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90" onClick={() => navigate("/dashboard")}>
          <FiX size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 flex-1">
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col max-h-[400px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Labels ({pendingLabels.length})</span>
              <FiAlertCircle size={14} className="text-amber-500" />
            </div>
            <div className="overflow-auto flex-1 rounded-xl border border-gray-50 shadow-inner">
              <table className="w-full text-left text-[0.7rem] border-collapse">
                <thead className="sticky top-0 bg-amber-50 text-amber-800 font-bold uppercase tracking-tighter">
                  <tr>
                    <th className="px-3 py-2 border-b border-amber-100">Seller Name</th>
                    <th className="px-3 py-2 border-b border-amber-100">Order/AWB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingLabels.map((label, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 font-bold text-gray-700">{label.seller}</td>
                      <td className="px-3 py-2">
                        <div className="font-mono text-gray-500">{label.orderNo}</div>
                        <div className="font-black text-gray-900">{label.awb}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Files in Directory ({labelFiles.length})</span>
              <FiFolder size={14} className="text-primary" />
            </div>
            <div className="overflow-auto rounded-xl border border-gray-50 shadow-inner max-h-[250px]">
              <table className="w-full text-left text-[0.7rem] border-collapse">
                <thead className="sticky top-0 bg-amber-50 text-amber-800 font-bold uppercase tracking-tighter">
                  <tr>
                    <th className="px-3 py-2 border-b border-amber-100">Timestamp</th>
                    <th className="px-3 py-2 border-b border-amber-100">Filename</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {labelFiles.map((file, index) => (
                    <tr
                      key={index}
                      className={`cursor-pointer transition-all ${selectedFile === file ? "bg-primary/10 text-primary" : "hover:bg-gray-50"}`}
                      onClick={() => handleFileSelect(file)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">{file.time}</td>
                      <td className="px-3 py-2 font-medium truncate max-w-[150px]">{file.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex mt-4 gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-inner"
                placeholder="C:\Users\Mantra\Desktop\Pickup"
                defaultValue="C:\Users\Mantra\Desktop\Pickup"
              />
              <button className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all active:scale-95">Fetch</button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />

          <div className="flex items-center gap-2 mb-6 text-gray-900">
            <h2 className="text-lg font-black tracking-tight uppercase">Order Details Preview</h2>
            <div className="h-px flex-1 bg-gray-50" />
          </div>

          <div className="flex-1 overflow-auto rounded-2xl border border-gray-50 shadow-inner bg-gray-50/20">
            <table className="w-full text-left text-[0.7rem] border-collapse">
              <thead className="sticky top-0 bg-amber-50 text-amber-800 font-bold uppercase tracking-tighter">
                <tr>
                  <th className="px-4 py-3 border-b border-amber-100">Order No.</th>
                  <th className="px-4 py-3 border-b border-amber-100">Order Date</th>
                  <th className="px-4 py-3 border-b border-amber-100">AWB Number</th>
                  <th className="px-4 py-3 border-b border-amber-100">Courier</th>
                  <th className="px-4 py-3 border-b border-amber-100">Buyer</th>
                  <th className="px-4 py-3 border-b border-amber-100">Seller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td colSpan="6" className="px-4 py-32 text-center text-gray-400 font-bold uppercase tracking-widest italic opacity-50">
                    Select a label file to preview contents
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="peer sr-only" id="deleteAfterImport" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-red-500 transition-colors" />
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:left-6 transition-all" />
              </div>
              <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700 uppercase tracking-tighter transition-colors">Delete File After Import</span>
            </label>

            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 flex items-center gap-2">
                <FiSave size={14} />
                Save Data
              </button>
              <button className="px-6 py-2.5 bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all active:scale-95" onClick={() => navigate("/dashboard")}>Close</button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest">
            <FiCheckCircle size={12} className="opacity-50" />
            * Please verify all entries before committing to import
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickUpEntry;
