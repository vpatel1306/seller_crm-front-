import React from "react";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ReturnEntryAccountWise = () => {

  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container-fluid py-2">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center bg-danger text-white p-2 rounded mb-2">
        <div className="fw-bold small small-md fs-6">
          venus times store - Return Entry (Account Wise)
        </div>

        <button className="btn btn-sm btn-light" onClick={handleClose}>
          <FaTimes />
        </button>
      </div>

      <div className="row g-2">

        {/* LEFT SIDE */}
        <div className="col-12 col-lg-7">

          <div className="border p-2 h-100">

            <small className="fw-bold d-block mb-2">
              Accepted Return AWB Or Order Numbers
            </small>

            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Order Number</th>
                    <th>AWB Number</th>
                    <th>Order Date</th>
                    <th>Return Create</th>
                    <th>Qty</th>
                    <th>Issue</th>
                    <th>Scan Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No Data
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* CENTER ARROW */}
        <div className="col-12 col-lg-1 d-flex align-items-center justify-content-center">

          <div className="text-center">
            <BsArrowLeftCircleFill size={40} className="text-danger" />
            <div className="text-danger fw-bold fs-5 mt-1">0</div>
            <small className="fw-bold">Accepted</small>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="col-12 col-lg-4">

          <div className="border p-3 h-100">

            <small className="fw-bold d-block text-center mb-3">
              Fetch Scan Mode
            </small>

            {/* Inputs */}
            <div className="mb-2">
              <label className="form-label">AWB / Pack QR</label>
              <input type="text" className="form-control form-control-sm" />
            </div>

            <div className="mb-2">
              <label className="form-label">Order No.</label>
              <input type="text" className="form-control form-control-sm" />
            </div>

            <div className="mb-2">
              <label className="form-label">Rec. Condition</label>
              <select className="form-select form-select-sm">
                <option>No Issue In Return</option>
                <option>I have received wrong return</option>
                <option>Item/s are missing in my return</option>
              </select>
            </div>

            {/* Info Fields */}
            <div className="small text-muted mb-3">
              <div className="row">
                <div className="col-6">
                  <div>Order Number</div>
                  <div>Order Date</div>
                </div>
                <div className="col-6">
                  <div>AWB Number</div>
                  <div>Courier</div>
                </div>
                <div className="col-12 mt-2">
                  <div>Current Position</div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-success btn-sm w-100 w-md-auto">
                Accept Return
              </button>
              <button className="btn btn-secondary btn-sm w-100 w-md-auto">
                Close
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM TABLE */}
      <div className="border p-2 mt-3">

        <small className="fw-bold">Search Result - 0</small>

        <div className="table-responsive">
          <table className="table table-bordered table-sm mt-2">
            <thead className="table-light">
              <tr>
                <th>Order Date</th>
                <th>Order Number</th>
                <th>Return AWB</th>
                <th>Return Courier</th>
                <th>Pickup AWB</th>
                <th>Pickup Courier</th>
                <th>Return Create</th>
                <th>Qty</th>
                <th>SKU ID</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="10" className="text-center text-muted">
                  No Data
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