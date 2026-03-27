import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';

const SKUCostModal = ({ isOpen, onClose, skuData }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [basicCost, setBasicCost] = useState(skuData?.basic_cost || 70);
  const [gst, setGst] = useState(skuData?.gst_percentage || 0);
  const [packing, setPacking] = useState(skuData?.packing_charge || 5);
  const [weight, setWeight] = useState('');

  const finalCost = basicCost + packing + (basicCost * gst / 100);

  const footerButtons = [
    { label: 'Close', type: 'secondary', onClick: onClose },
    {
      label: 'Set Cost',
      type: 'success',
      onClick: () => {
        alert(`✅ Cost Updated!\nFrom: ${fromDate}\nTo: ${toDate}\nFinal Cost: ₹${finalCost.toFixed(2)}`);
      }
    }
  ];

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="SKU Cost Set"
      size="lg"
      footerButtons={footerButtons}
      headerStyle="gradient"
    >
      <div className="container-fluid">

        {/* Example Box */}
        <div className="bg-light p-3 rounded border-start border-4 border-success mb-4">
          <strong>उदाहरण:</strong>
          <p className="mb-2">
            प्रारंभ लिखित (From Date): 01/12/2024 <br />
            समाप्ति लिखित (To Date): 12/12/2024
          </p>
          <strong>Today : {new Date().toLocaleString()}</strong>
        </div>

        {/* Title */}
        <div className="text-center">
          <h5 className="fw-bold text-danger border-top  pt-2" >{skuData?.sku_id || 'SKU ID'}</h5>
          <p className="text-muted mb-4 fs-6">{skuData?.box_size || 'Free Size'}</p>
        </div>

        {/* Date Fields */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fs-6">From Date</label>
            <input
              type="date"
              className="form-control"
              placeholder="DD/MM/YYYY"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fs-6">To Date</label>
            <input
              type="date"
              className="form-control"
              placeholder="DD/MM/YYYY"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          
          <div className="col-md-4">
            {/* Weight Section */}
            <div className='d-flex justify-content-between align-items-center py-2 flex-wrap mt-3'>
              <label className="form-label fs-6">Item Weight</label>
              <select
                  className="form-select form-select-sm w-50"
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
           

            {/* Cost Fields */}
            <div className="d-flex justify-content-between align-items-center py-2 flex-wrap">
              <span className="fs-6">Basic Cost</span>
              <input
                type="number"
                className="form-control w-50"
                value={basicCost}
                onChange={(e) => setBasicCost(Number(e.target.value))}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center py-2 flex-wrap">
              <span className="fs-6">GST %</span>
              <input
                type="number"
                className="form-control w-50"
                value={gst}
                onChange={(e) => setGst(Number(e.target.value))}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center py-2 flex-wrap">
              <span className="fs-6">Packing Cost</span>
              <input
                type="number"
                className="form-control w-50"
                value={packing}
                onChange={(e) => setPacking(Number(e.target.value))}
              />
            </div>

            {/* Final Cost */}
            <div className="d-flex justify-content-between align-items-center border-top pt-2 flex-wrap">
              <span className='fs-6 fw-bold text-danger'>Final Cost</span>
              <span className='fs-6 fw-bold btn btn-success w-50'>₹{finalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

    

      </div>
    </CommonModal>
  );
};

export default SKUCostModal;