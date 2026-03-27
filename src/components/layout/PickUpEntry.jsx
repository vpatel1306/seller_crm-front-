import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

const PickUpEntry = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [pendingLabels, setPendingLabels] = useState([
    { seller: "CHAITANYA_ENTERPRISE", orderNo: "15207610943726400_1", awb: "1490813056188363" },
    { seller: "CHAITANYA_ENTERPRISE", orderNo: "153818098695217792_1", awb: "VL0081121968696" },
    { seller: "DIGITECHIFIED B-333", orderNo: "OD334873404344674100", awb: "FMPQ4977103874" },
  ]);

  const [labelFiles, setLabelFiles] = useState([
    { time: "10/07/2025 03:44:22 PM", name: "Sub_Order_Labels_7eeeab79-fb5-4cc4-bee2-53c05e3..." }
  ]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center bg-danger text-white p-2 rounded mb-2">
        <div className="fw-bold small small-md fs-6">
          IMPORT LABEL FILE (PICK-UP) - venus times store
        </div>
        <button className="btn btn-sm btn-light" onClick={() => navigate("/dashboard")}>
          <FaTimes />
        </button>
      </div>

      <div className="row">
        {/* Left Panel */}
        <div className="col-md-4 mb-3">
            <div className="custom-box">
                <span className="title fw-bold">PENDING PICK-UP LABELS ({pendingLabels.length})</span>
                <div className="table-responsive flex-grow-1">
                <table className="table table-sm table-bordered mt-2">
                    <thead className="table-warning">
                    <tr>
                        <th>Seller Name</th>
                        <th>Order No.</th>
                        <th>AWB Number</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pendingLabels.map((label, index) => (
                        <tr key={index}>
                        <td>{label.seller}</td>
                        <td>{label.orderNo}</td>
                        <td>{label.awb}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
                
            <div className="custom-box">
                <span className="title fw-bold">LABEL FILES IN DIRECTORY ({labelFiles.length})</span>
                <div className="table-responsive flex-grow-0">
                    <table className="table table-sm table-bordered mt-2">
                    <thead className="table-warning">
                        <tr>
                            <th>Time</th>
                            <th>Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        {labelFiles.map((file, index) => (
                            <tr
                            key={index}
                            className={selectedFile === file ? "table-primary" : ""}
                            onClick={() => handleFileSelect(file)}
                            style={{ cursor: "pointer" }}
                            >
                            <td>{file.time}</td>
                            <td>{file.name}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex mt-2">
                <input
                    type="text"
                    className="form-control me-2"
                    placeholder="C:\\Users\\Mantra\\Desktop\\Pickup"
                />
                <button className="btn btn-success">Get Labels</button>
                </div>
            </div>
        </div>

        {/* Right Panel */}
        <div className="col-md-8 mb-3">
          <div className="border p-2 h-100 d-flex flex-column">
            <h6>Order Details</h6>
            <div className="table-responsive flex-grow-1">
              <table className="table table-sm table-bordered mt-2">
                <thead className="table-warning">
                  <tr>
                    <th>Order No.</th>
                    <th>Order Date</th>
                    <th>AWB</th>
                    <th>Courier</th>
                    <th>Buyer Name</th>
                    <th>Seller</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No data selected
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-2 align-items-center">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="deleteAfterImport" />
                <label className="form-check-label" htmlFor="deleteAfterImport">
                  Delete Text File After Import
                </label>
              </div>

              <div>
                <button className="btn btn-warning me-2">Save</button>
                <button className="btn btn-secondary">Close</button>
              </div>
            </div>
            <small className="text-muted mt-1">* Please, Check all entry before import</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickUpEntry;