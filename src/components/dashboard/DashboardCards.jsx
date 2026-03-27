import { useState } from "react";

const cardData = {
  allOrders: {
    title: "All Received Orders",
    bg: "#1a6ba0",
    text: "white",
    subtitle: "Last Order 13/12/2025",
    costLabel: "Cost Amount",
    cost: "586131.00",
    value: "4441",
    badge: null,
  },
  cancelled: {
    title: "Cancelled",
    bg: "#4a4a4a",
    text: "white",
    costLabel: "Cost Amount",
    cost: "65370.00",
    value: "444",
    badge: "10.00 %",
    badgeColor: "#f0c040",
  },
  readyToShip: {
    title: "Ready To Ship",
    bg: "#4a4a4a",
    text: "white",
    costLabel: "Cost Amount",
    cost: "914.00",
    value: "10",
    badge: null,
  },
  shipped: {
    title: "Shipped",
    bg: "#4a4a4a",
    text: "white",
    costLabel: "Cost Amount",
    cost: "26203.00",
    value: "270",
    badge: null,
  },
  returnInTransit: {
    title: "Return In Transit",
    bg: "#4a4a4a",
    text: "white",
    costLabel: "Cost Amount",
    cost: "14035.00",
    value: "116",
    badge: "2.90 %",
    badgeColor: "#f0c040",
  },
  outForDelivery: {
    title: "Out For Delivery",
    bg: "#4a4a4a",
    text: "white",
    costLabel: "Cost Amount",
    cost: "870.00",
    value: "8",
    badge: null,
  },
  returnReceived: {
    title: "Return Received",
    bg: "#2d7a2d",
    text: "white",
    costLabel: "Cost Amount",
    cost: "105645.00",
    value: "683",
    badge: "17.09 %",
    badgeColor: "#f0c040",
  },
  returnScanPending: {
    title: "Return Scan Pending",
    bg: "#c0392b",
    text: "white",
    costLabel: "Cost Amount",
    cost: "0.00",
    value: "0",
    badge: "0.00",
    badgeColor: "#f0c040",
  },
  returnMismatch: {
    title: "Return Mismatch",
    bg: "#c0392b",
    text: "white",
    costLabel: "Cost Amount",
    cost: "1940.00",
    value: "5",
  },
  paymentMismatch: {
    title: "Payment Mismatch",
    bg: "#c0392b",
    text: "white",
    costLabel: "Cost Amount",
    cost: "0.00",
    value: "0",
    badge: "0.00",
    badgeColor: "#f0c040",
  },
  receivedPayment: {
    title: "Received Payment",
    bg: "#1a6ba0",
    text: "white",
    costLabel: "Amount",
    cost: "401120.54",
    value: "3289",
    badge: null,
  },
  pendingPayment: {
    title: "Pending Payment",
    bg: "#1a5c1a",
    text: "white",
    costLabel: "Cost Amount",
    cost: "63012.00",
    value: "621",
    badge: null,
  },
  unsettledPickup: {
    title: "Unsettled Pickup",
    bg: "#7b1fa2",
    text: "white",
    costLabel: "Cost Amount",
    cost: "63928.00",
    value: "631",
    badge: null,
  },
  cancelPickup: {
    title: "Cancel Pickup",
    bg: "#c0392b",
    text: "white",
    costLabel: "Cost Amount",
    cost: "0.00",
    value: "0",
    badge: "0.00",
    badgeColor: "#f0c040",
  },
};

function StatCard({ title, bg, text, subtitle, costLabel, cost, value, badge, badgeColor }) {
  return (
    <div className="h-100">
      <div
        className="stat-card h-100"
        style={{
          backgroundColor: bg,
          color: text,
        }}
      >
        <div className="stat-card-header">
          <span className="stat-card-title">{title}</span>
          {badge && (
            <span className="stat-card-badge" style={{ color: badgeColor || "#f0c040" }}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <div className="stat-card-subtitle float-end">{subtitle}</div>}
        <div className="stat-card-content">
          <div className="stat-card-cost-value">
            <div className="flex-column row ">
              <div className="stat-card-cost-label">{costLabel}</div>
              <span className="stat-card-cost">{cost}</span>
            </div>
            <span className="stat-card-value">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardCards() {
  return (
    <div>
      <div className="container-fluid">
        {/* Row 1 */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.allOrders} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.cancelled} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.readyToShip} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.shipped} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.returnInTransit} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.outForDelivery} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.returnReceived} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.returnScanPending} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.returnMismatch} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.paymentMismatch} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.receivedPayment} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.pendingPayment} />
          </div>
        </div>

        {/* Row 4 — Unsettled, Cancel, Claim, Smart Tickets */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.unsettledPickup} />
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <StatCard {...cardData.cancelPickup} />
          </div>

          {/* Claim Card */}
          <div className="col-12 col-sm-6 col-md-3">
            <div className="h-100">
              <div className="claim-card h-100">
                <div className="claim-card-title">Claim</div>
                <div className="row g-0">
                  <div className="col-6 text-center">
                    <div className="claim-approved-label">Approved</div>
                    <div className="claim-approved-value">91</div>
                    <div className="claim-approved-amount">18410.98 Rs</div>
                  </div>
                  <div className="col-6 text-center">
                    <div className="claim-pending-label">Pending</div>
                    <div className="claim-pending-value">150</div>
                    <div className="claim-pending-amount">21142.00 Rs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Tickets Card */}
          <div className="col-12 col-sm-6 col-md-3">
            <div className="h-100">
              <div className="smart-tickets-card h-100">
                <div className="smart-tickets-title">Smart Tickets</div>
                <div className="row g-0 text-center">
                  <div className="col-4">
                    <div className="smart-tickets-label">New Found</div>
                    <div className="smart-tickets-value">136</div>
                    <div className="smart-tickets-amount">19030.00</div>
                  </div>
                  <div className="col-4">
                    <div className="smart-tickets-label">Total Open</div>
                    <div className="smart-tickets-value">146</div>
                    <div className="smart-tickets-amount">20461.00</div>
                  </div>
                  <div className="col-4">
                    <div className="smart-tickets-label">Closed</div>
                    <div className="smart-tickets-value">60</div>
                    <div className="smart-tickets-amount">10232.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 5 — Advertisement, Bank, Business Insights */}
        <div className="row g-3 mb-3">
          {/* Advertisement */}
          <div className="col-12 col-sm-6 col-md-3">
            <div className="h-100">
              <div className="advertisement-card h-100">
                <div className="advertisement-header flex-wrap">
                  <span className="advertisement-title">Advertisement</span>
                  <span className="advertisement-per-order">0.55<br />RS. Per Order</span>
                </div>
                <div className="row g-0 mt-4 text-center">
                  <div className="col-6">
                    <div className="advertisement-label">Paid</div>
                    <div className="advertisement-amount">2458.89</div>
                  </div>
                  <div className="col-6">
                    <div className="advertisement-label">Used</div>
                    <div className="advertisement-amount">2458.19</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Received In Bank */}
          <div className="col-12 col-sm-6 col-md-3">
            <div className="h-100">
              <div className="bank-card h-100">
                <div className="bank-header flex-wrap">
                  <span className="bank-title">Received In Bank Acc.</span>
                  <span className="bank-last-payment float-end">Last Payment 12/12/2025</span>
                </div>
                <div className="flex-cloumn row mt-4">
                  <div className="bank-amount-label">Amount</div>
                  <div className="bank-amount-value">398661.65</div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Insights */}
          <div className="col-12 col-sm-6 col-md-6">
            <div className="h-100">
              <div className="business-insights-card h-100">

                {/* Header */}
                <div className="business-insights-header">
                  <h6 className="business-insights-title">Business Insights</h6>
                  <small className="business-insights-link">Click here for more details</small>
                </div>

                {/* Insights Grid */}
                <div className="business-insights-grid">

                  {[
                    { label: "PICKED", value: "3948", sub: null, color: "dark" },
                    { label: "SHIPPED", value: "270", sub: "6.84 %", color: "dark" },
                    { label: "RTO", value: "452", sub: "11.45 %", color: "danger" },
                    { label: "DELIVERED", value: "3226", sub: "81.71 %", color: "dark" },
                    { label: "RETURN", value: "355", sub: "11.00 %", color: "danger" },
                    { label: "DELIVERY", value: "2871", sub: "89.00 %", color: "success" },
                  ].map((item) => (
                    <div key={item.label} className="business-insights-item">

                      <div className={`business-insight-label text-${item.color}`}>
                        {item.label}
                      </div>

                      <div className={`business-insight-value text-${item.color}`}>
                        {item.value}
                      </div>

                      {item.sub && (
                        <div className={`business-insight-sub text-${item.color}`}>
                          {item.sub}
                        </div>
                      )}

                    </div>
                  ))}

                </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</div>
);
}
