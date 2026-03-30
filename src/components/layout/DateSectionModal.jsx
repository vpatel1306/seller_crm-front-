import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiRefreshCw, FiArrowRight } from 'react-icons/fi';

const DateSectionModal = ({ isOpen, onClose, onDateSelect }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  // Format date to DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Apply
  const handleApply = () => {
    if (startDate && endDate) {
      onDateSelect({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
      navigate('/date-wise-report', { state: { startDate, endDate } });
      onClose();
    }
  };

  // Clear
  const handleClear = () => {
    setStartDate('');
    setEndDate('');
  };

  // Set Month (example logic)
  const setMonth = (monthIndex) => {
    const year = new Date().getFullYear();
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const footerButtons = [
    {
      label: 'Apply Filter',
      type: 'success',
      onClick: handleApply
    },
    {
      label: 'Close',
      type: 'secondary',
      onClick: onClose
    }
  ];

  const months = [
    { name: 'November', index: 10 },
    { name: 'October', index: 9 },
    { name: 'September', index: 8 },
    { name: 'August', index: 7 },
    { name: 'July', index: 6 },
    { name: 'June', index: 5 },
    { name: 'May', index: 4 },
    { name: 'April', index: 3 }
  ];

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Date Range Filter"
      size="sm"
      footerButtons={footerButtons}
      headerStyle="gradient"
    >
      <div className="space-y-6">

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest px-1">From</label>
            <div className="relative">
              <input
                type="date"
                className="w-full pl-3 pr-2 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-sm font-mono"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest px-1">To</label>
            <div className="relative">
              <input
                type="date"
                className="w-full pl-3 pr-2 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-sm font-mono"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex justify-between items-center group">
          <span className="text-[0.65rem] text-indigo-400 font-bold uppercase tracking-widest">System Timestamp</span>
          <span className="text-xs font-bold text-indigo-700 italic group-hover:scale-105 transition-transform">{new Date().toLocaleString()}</span>
        </div>

        {/* Shortcuts */}
        <div className="space-y-3 pt-2">
          <button
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2 uppercase tracking-wide"
            onClick={() => setMonth(new Date().getMonth())}
          >
            <FiCalendar size={14} />
            <span>This Month</span>
            <FiArrowRight size={14} className="opacity-50" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            {months.map((m, i) => (
              <button
                key={i}
                className="py-2.5 bg-white border border-gray-100 rounded-xl text-[0.65rem] font-extrabold text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all active:scale-95 shadow-sm uppercase px-2 truncate"
                onClick={() => setMonth(m.index)}
              >
                {m.name} {new Date().getFullYear()}
              </button>
            ))}
          </div>
        </div>

        <button
          className="w-full py-2.5 border border-red-100 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest mt-4"
          onClick={handleClear}
        >
          <FiRefreshCw size={12} />
          <span>Clear Filter</span>
        </button>

      </div>
    </CommonModal>
  );
};

export default DateSectionModal;