import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';

const DateSectionModal = ({ isOpen, onClose, onDateSelect }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      label: 'Ok',
      type: 'success', // or 'primary' if your CommonModal supports only bootstrap types
      onClick: handleApply
    },
    {
      label: 'Close',
      type: 'secondary',
      onClick: onClose
    }
  ];

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Date Selection"
      size="sm"
      footerButtons={footerButtons}
    >
      <div className="date-ui">

        {/* From To */}
        <div className="d-flex justify-content-between mb-2">
          <div>
            <label className="small fw-semibold">From</label>
            <input
              type="date"
              className="form-control form-control-sm date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="small fw-semibold">To</label>
            <input
              type="date"
              className="form-control form-control-sm date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Today */}
        <div className="today-text">
          Today : {new Date().toLocaleString()}
        </div>

        {/* Current Month */}
        <button
          className="btn w-100 month-btn mb-2"
          onClick={() => setMonth(new Date().getMonth())}
        >
          Current Month
        </button>

        {/* Month Buttons */}
        <div className="row g-2 mb-2">
          {[
            { name: 'November', index: 10 },
            { name: 'October', index: 9 },
            { name: 'September', index: 8 },
            { name: 'August', index: 7 },
            { name: 'July', index: 6 },
            { name: 'June', index: 5 },
            { name: 'May', index: 4 },
            { name: 'April', index: 3 }
          ].map((m, i) => (
            <div className="col-6" key={i}>
              <button
                className="btn w-100 month-btn"
                onClick={() => setMonth(m.index)}
              >
                {m.name} {new Date().getFullYear()}
              </button>
            </div>
          ))}
        </div>

        {/* Clear */}
        <button className="btn w-100 clear-btn mb-2" onClick={handleClear}>
          Clear Date Filter
        </button>

      </div>
    </CommonModal>
  );
};

export default DateSectionModal;