import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const DateWiseReport = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;

      const res = await api.get(
        `/sku-list?skip=${skip}&limit=${limit}`
      );

      setData(res.data.data || []);
      setTotal(res.data.count || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container-fluid report-wrapper">

      {/* HEADER */}
      <div className="report-title">
        Date Wise Order Report - Dev E-Com
      </div>

      <div className="row g-0">

        {/* TABLE */}
        <div className="col-lg-10">
          <div className="table-responsive report-table-wrapper">

            <table className="table table-bordered table-sm mb-0">
              <thead className="table-header">
                <tr>
                  <th>Order Date</th>
                  <th>Orders</th>
                  <th>Hold</th>
                  <th>Pending</th>
                  <th>Cancel</th>
                  <th>Pickup</th>
                  <th>Shipped</th>
                  <th>RTO</th>
                  <th>Return</th>
                  <th>Delivery</th>
                  <th>Gross P/L</th>
                  <th>Other Loss</th>
                  <th>Net P/L</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="13" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  data.map((item, i) => (
                    <tr key={i}>
                      <td>{item.date || "N/A"}</td>
                      <td>{item.orders || 0}</td>
                      <td>{item.hold || 0}</td>
                      <td>{item.pending || 0}</td>
                      <td>{item.cancel || 0}</td>
                      <td>{item.pickup || 0}</td>
                      <td>{item.shipped || 0}</td>
                      <td>{item.rto || 0}</td>
                      <td>{item.return || 0}</td>
                      <td>{item.delivery || 0}</td>
                      <td>{item.gross_pl || 0}</td>
                      <td>{item.other_loss || 0}</td>
                      <td className={item.net_pl  >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                        {item.net_pl || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* TOTAL ROW */}
              <tfoot>
                <tr className="total-row">
                  <td>Total →</td>
                  <td>4441</td>
                  <td>14</td>
                  <td>25</td>
                  <td>444</td>
                  <td>3948</td>
                  <td>270</td>
                  <td>452</td>
                  <td>355</td>
                  <td>2871</td>
                  <td>55162</td>
                  <td>2280</td>
                  <td>29900</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="d-flex justify-content-end mt-2">
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 && "disabled"}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    Prev
                  </button>
                </li>

                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 && "active"}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${page === totalPages && "disabled"}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="col-lg-2 side-panel">
          <h6>Day Performance Analytics</h6>
          <p className="text-success">Max Day</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="report-footer d-flex justify-content-between align-items-center mt-2">

        <div className="total-days">
          Total Days 136 / 136
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-light btn-sm">Export CSV</button>
          <button className="btn btn-light btn-sm">View % Calculation</button>
          <button className="btn btn-light btn-sm">Day Dashboard</button>
          <button className="btn btn-light btn-sm" onClick={fetchData}>Refresh</button>
          <button className="btn btn-danger btn-sm" onClick={() => navigate("/dashboard")}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default DateWiseReport;