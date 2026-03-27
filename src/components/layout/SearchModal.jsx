import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import { FaSearch, FaFilter } from 'react-icons/fa';

const SearchModal = ({ isOpen, onClose, onSearch, onClear }) => {
  const [searchData, setSearchData] = useState({
    ordersByProfit: 'all', // all, profit, loss
    ordersByStatus: 'all', // all, delivered, rto, customer_return, exchange
    ordersByReturn: 'all', // all, wrong_missing, no_issue
    ordersByClaims: 'all', // all, approved, pending
    orderNumber: '',
    awbBagQrCode: '',
    sku: '',
    size: '',
    customerState: '',
    matchCase: false
  });

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
    if (onSearch) {
      onSearch(filters);
    }
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
    
    if (onClear) {
      onClear();
    }
    onClose();
  };

  const footerButtons = [
    {
      label: 'Clear Search',
      onClick: handleClear,
      type: 'secondary',
      className: 'd-flex align-items-center gap-2',
      autoClose: false
    },
    {
      label: 'Search',
      onClick: handleSearch,
      type: 'primary',
      className: 'd-flex align-items-center gap-2',
      autoClose: false
    }
  ];

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Search Dashboard"
      size="full"
      footerButtons={footerButtons}
      showCloseButton={true}
      closeOnOverlayClick={true}
      closeOnEsc={true}
      headerStyle="default"
      customClass="search-modal"
    >
    <div className="container-fluid p-3" style={{ background: "#f5f5f5" }}>

      {/* Filters Section */}
      <div className="p-3 rounded" style={{ background: "#f2efd9" }}>
        
        <div className="row">

          {/* Orders by Profit/Loss */}
          <div className="col-md-3">
            <h6 className="text-danger border-bottom border-danger pb-1">Orders By Profit / Loss</h6>
            {["all", "profit", "loss"].map((item) => (
              <div className="form-check form-check-inline" key={item}>
                <input
                  type="radio"
                  className="form-check-input"
                  checked={filters.profitLoss === item}
                  onChange={() => handleChange("profitLoss", item)}
                />
                <label className="form-check-label text-capitalize">
                  {item}
                </label>
              </div>
            ))}
          </div>

          {/* Orders by Status */}
          <div className="col-md-5">
            <h6 className="text-primary border-bottom border-primary pb-1">Orders By Status</h6>
            {["all", "delivered", "rto", "customer return", "exchange"].map((item) => (
              <div className="form-check form-check-inline" key={item}>
                <input
                  type="radio"
                  className="form-check-input"
                  checked={filters.status === item}
                  onChange={() => handleChange("status", item)}
                />
                <label className="form-check-label text-capitalize">
                  {item}
                </label>
              </div>
            ))}
          </div>

          {/* Return Condition */}
          <div className="col-md-4">
            <h6 className="text-success border-bottom border-success pb-1">Orders By Return Condition</h6>
            {["all", "wrong/missing", "no issue"].map((item) => (
              <div className="form-check form-check-inline" key={item}>
                <input
                  type="radio"
                  className="form-check-input"
                  checked={filters.returnCondition === item}
                  onChange={() => handleChange("returnCondition", item)}
                />
                <label className="form-check-label text-capitalize">
                  {item}
                </label>
              </div>
            ))}
          </div>

        </div>

        {/* Claims */}
        <div className="mt-3">
          <h6 className="text-purple border-bottom border-purple pb-1">
            Orders By Claims
          </h6>
          {["all", "approved", "pending"].map((item) => (
            <div className="form-check form-check-inline" key={item}>
              <input
                type="radio"
                className="form-check-input"
                checked={filters.claims === item}
                onChange={() => handleChange("claims", item)}
              />
              <label className="form-check-label text-capitalize">
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

       {/* Table Filters */}
        <div className="row mt-4">
          {["Order Number", "AWB / Bag QR Code", "SKU", "Size", "Customer State"].map((label) => (
            <div className="col-md-2" key={label}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={label}
              />
            </div>
          ))}
        </div>

        {/* Suggestion */}
        <div className="text-center text-danger mt-2 small">
          Suggestion
        </div>
    </div>
    </CommonModal>
  );
};

export default SearchModal;
