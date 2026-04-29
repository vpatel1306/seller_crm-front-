import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';

const SKUCostModal = ({ isOpen, onClose, skuData }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [basicCost, setBasicCost] = useState(skuData?.basic_cost || 0);
  const [gst, setGst] = useState(skuData?.gst_percentage || 0);
  const [packing, setPacking] = useState(skuData?.packing_charge || 5);
  const [weight, setWeight] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);


  const finalCost = basicCost + packing + (basicCost * gst / 100);

  const footerButtons = [
    { label: 'Close', type: 'secondary', onClick: onClose },
    {
      label: 'Set Cost',
      type: 'success',
      onClick: () => {
        setShowSuccess(true);
      }

    }
  ];

  return (
    <>
      <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="SKU Cost Set"
      size="lg"
      footerButtons={footerButtons}
      headerStyle="gradient"
    >
      <div className="space-y-6">

        {/* Example Box */}
        <div className="bg-green-50/50 p-4 rounded-default border-l-4 border-green-500 shadow-sm">

          <strong className="text-green-800 text-sm flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            उदाहरण:
          </strong>
          <div className="text-xs text-green-700/80 space-y-1 font-medium italic">
            <p>प्रारंभ लिखित (From Date): 01/12/2024</p>
            <p>समाप्ति लिखित (To Date): 12/12/2024</p>
          </div>
          <div className="mt-3 pt-2 border-t border-green-100 flex justify-between items-center">
            <span className="text-[0.65rem] text-green-600 uppercase tracking-widest font-bold">Today</span>
            <span className="text-xs font-bold text-green-800">{new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-4 bg-gray-50 rounded-default border border-gray-100/50 relative overflow-hidden group">

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent opacity-50" />
          <h5 className="font-black text-red-600 text-xl tracking-tight group-hover:scale-105 transition-transform duration-300">{skuData?.sku_id || 'SKU ID'}</h5>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{skuData?.box_size || 'Free Size'}</p>
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-default text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-sm"

              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-default text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-sm"

              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4 bg-gray-50/30 p-4 rounded-default border border-gray-100">

            {/* Weight Section */}
            <div className='flex justify-between items-center'>
              <label className="text-[0.7rem] font-bold text-gray-500 uppercase">Weight</label>
              <select
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-primary shadow-sm w-32"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              >
                {['0-100', '100-150', '150-200', '200-250', '250-300'].map((w) => (
                  <option key={w} value={w}>
                    {w} g
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Cost Fields */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-bold text-gray-500 uppercase">Basic Cost</span>
                <input
                  type="number"
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-primary shadow-sm w-32 text-right"
                  value={basicCost}
                  onChange={(e) => setBasicCost(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-bold text-gray-500 uppercase">GST %</span>
                <input
                  type="number"
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-primary shadow-sm w-32 text-right"
                  value={gst}
                  onChange={(e) => setGst(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-bold text-gray-500 uppercase">Packing</span>
                <input
                  type="number"
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-primary shadow-sm w-32 text-right"
                  value={packing}
                  onChange={(e) => setPacking(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Final Cost */}
            <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
              <span className='font-black text-red-600 text-sm uppercase tracking-tighter'>Final Cost</span>
              <div className='bg-green-500 text-white px-6 py-2 rounded-default font-black text-lg shadow-lg shadow-green-500/30 flex items-center justify-center animate-in zoom-in-50 duration-300 min-w-32'>

                ₹{finalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommonModal>

    <CommonModal
      isOpen={showSuccess}
      onClose={() => {
        setShowSuccess(false);
        onClose();
      }}
      title="Success"
      size="sm"
      headerStyle="default"
      footerButtons={[
        { label: 'Done', type: 'primary', onClick: () => { setShowSuccess(false); onClose(); } }
      ]}
    >
      <div className="flex flex-col items-center py-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-1">Cost Updated!</h3>
        <p className="text-sm text-slate-500 font-medium">
          The cost for SKU <span className="text-primary font-bold">{skuData?.sku_id}</span> has been updated successfully.
        </p>
        <div className="mt-4 w-full bg-slate-50 rounded-default p-3 border border-slate-100 text-left space-y-1">

          <div className="flex justify-between text-[0.65rem] font-bold text-slate-400 uppercase">
            <span>Period</span>
            <span className="text-slate-600 italic">Preview Mode</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-700">
             <span>{fromDate || 'N/A'} - {toDate || 'N/A'}</span>
             <span className="text-emerald-600">₹{finalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </CommonModal>
    </>
  );
};

export default SKUCostModal;
