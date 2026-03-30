import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import { FiSearch, FiFilter, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const SearchModal = ({ isOpen, onClose, onSearch, onClear }) => {
  const [filters, setFilters] = useState({
    profitLoss: "all",
    status: "all",
    returnCondition: "all",
    claims: "all",
    matchCase: false,
  });

  const handleChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    if (onSearch) onSearch(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      profitLoss: "all",
      status: "all",
      returnCondition: "all",
      claims: "all",
      matchCase: false,
    });
    if (onClear) onClear();
    onClose();
  };

  const footerButtons = [
    {
      label: 'Clear Search',
      onClick: handleClear,
      type: 'secondary',
      autoClose: false
    },
    {
      label: 'Apply Smart Search',
      onClick: handleSearch,
      type: 'primary',
      autoClose: false
    }
  ];

  const SectionTitle = ({ label, color }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      <div className={`w-1.5 h-6 rounded-full bg-${color}-500`} />
      <h6 className={`text-[0.7rem] font-black uppercase tracking-widest text-${color}-600`}>{label}</h6>
    </div>
  );

  const RadioGroup = ({ options, current, onChange, name }) => (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${current === opt ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'}`}>
          <input
            type="radio"
            name={name}
            className="w-4 h-4 accent-primary sr-only"
            checked={current === opt}
            onChange={() => onChange(opt)}
          />
          <div className={`w-2 h-2 rounded-full ${current === opt ? 'bg-primary' : 'bg-gray-200'}`} />
          <span className="text-xs font-bold uppercase tracking-tight">{opt}</span>
          {current === opt && <FiCheckCircle size={14} className="ml-1" />}
        </label>
      ))}
    </div>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Search Terminal"
      size="full"
      footerButtons={footerButtons}
      headerStyle="dark"
    >
      <div className="space-y-8 max-w-[1200px] mx-auto py-4">

        {/* Main Filters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50/50 p-8 rounded-3xl border border-gray-100 shadow-inner">

          {/* Left Col */}
          <div className="space-y-8">
            <div>
              <SectionTitle label="Profitability Filter" color="red" />
              <RadioGroup
                options={["all", "profit", "loss"]}
                current={filters.profitLoss}
                onChange={(val) => handleChange("profitLoss", val)}
                name="profit-filter"
              />
            </div>

            <div>
              <SectionTitle label="Order Status" color="blue" />
              <RadioGroup
                options={["all", "delivered", "rto", "customer return", "exchange"]}
                current={filters.status}
                onChange={(val) => handleChange("status", val)}
                name="status-filter"
              />
            </div>
          </div>

          {/* Right Col */}
          <div className="space-y-8">
            <div>
              <SectionTitle label="Return Conditions" color="green" />
              <RadioGroup
                options={["all", "wrong/missing", "no issue"]}
                current={filters.returnCondition}
                onChange={(val) => handleChange("returnCondition", val)}
                name="return-filter"
              />
            </div>

            <div>
              <SectionTitle label="Claims Monitoring" color="violet" />
              <RadioGroup
                options={["all", "approved", "pending"]}
                current={filters.claims}
                onChange={(val) => handleChange("claims", val)}
                name="claims-filter"
              />
            </div>
          </div>
        </div>

        {/* Individual Field Search */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <FiFilter size={18} className="text-gray-400 font-black" />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Detailed Identity Search</h3>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {["Order Number", "AWB / Bag QR Code", "SKU", "Size", "Customer State"].map((label) => (
              <div key={label} className="space-y-1.5 focus-within:z-10">
                <label className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                  placeholder={`Search ${label}...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Toggle */}
        <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={filters.matchCase}
                onChange={(e) => handleChange("matchCase", e.target.checked)}
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-colors" />
              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:left-6 transition-all" />
            </div>
            <span className="text-[0.7rem] font-bold text-gray-400 group-hover:text-gray-800 uppercase tracking-widest transition-colors">Case Sensitive Matching</span>
          </label>

          <div className="flex items-center gap-2 text-[0.65rem] text-primary/60 font-medium italic underline underline-offset-4 pointer-events-none">
            <FiRefreshCw className="animate-spin-slow" />
            Real-time dashboard indexing active
          </div>
        </div>
      </div>
    </CommonModal>
  );
};

export default SearchModal;
