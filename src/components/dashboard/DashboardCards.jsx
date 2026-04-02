import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

function StatCard({ title, bg, text, subtitle, costLabel, cost, value, badge, badgeColor, onClick }) {
  return (
    <div className="h-full">
      <div
        className={`stat-card h-full ${onClick ? 'cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-white/30 transition-all active:scale-95' : ''}`}
        style={{ backgroundColor: bg, color: text }}
        onClick={onClick}
      >
        <div className="stat-card-header">
          <span className="stat-card-title">{title}</span>
          {badge && (
            <span className="stat-card-badge" style={{ color: badgeColor || "#f0c040" }}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <div className="stat-card-subtitle text-right">{subtitle}</div>}
        <div className="stat-card-content">
          <div className="stat-card-cost-value">
            <div className="flex flex-col">
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
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <div className="px-0">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          <StatCard {...cardData.allOrders} onClick={() => navigate('/all-orders')} />
          <StatCard {...cardData.cancelled} onClick={() => navigate('/cancelled-orders')} />
          <StatCard {...cardData.readyToShip} />
          <StatCard {...cardData.shipped} />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          <StatCard {...cardData.returnInTransit} onClick={() => navigate('/return-in-transit')} />
          <StatCard {...cardData.outForDelivery} onClick={() => navigate('/out-for-delivery')} />
          <StatCard {...cardData.returnReceived} onClick={() => navigate('/received-returns')} />
          <StatCard {...cardData.returnScanPending} onClick={() => navigate('/returns-not-received')} />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          <StatCard {...cardData.returnMismatch} onClick={() => navigate('/return-mismatch')} />
          <StatCard {...cardData.paymentMismatch} onClick={() => navigate('/payment-mismatch')} />
          <StatCard {...cardData.receivedPayment} onClick={() => navigate('/received-payment-orders')} />
          <StatCard {...cardData.pendingPayment} onClick={() => navigate('/pending-payment-orders')} />
        </div>

        {/* Row 4 — Unsettled, Cancel, Claim, Smart Tickets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          <StatCard {...cardData.unsettledPickup} onClick={() => navigate('/unsettled-pickup')} />
          <StatCard {...cardData.cancelPickup} onClick={() => navigate('/cancel-pickup')} />

          {/* Claim Card */}
          <div className="h-full">
            <div className="claim-card h-full">
              <div className="claim-card-title text-white">Claim</div>
              <div className="flex">
                <div className="w-1/2 text-center border-r border-white/20">
                  <div className="claim-approved-label">Approved</div>
                  <div className="claim-approved-value">91</div>
                  <div className="claim-approved-amount font-bold">18410.98 Rs</div>
                </div>
                <div className="w-1/2 text-center p-0">
                  <div className="claim-pending-label">Pending</div>
                  <div className="claim-pending-value">150</div>
                  <div className="claim-pending-amount font-bold">21142.00 Rs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Tickets Card */}
          <div className="h-full">
            <div
              className="smart-tickets-card h-full cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-white/30 transition-all active:scale-95"
              onClick={() => navigate('/smart-tickets')}
            >
              <div className="smart-tickets-title text-white">Smart Tickets</div>
              <div className="flex text-center">
                <div className="w-1/3 border-r border-white/20">
                  <div className="smart-tickets-label">New Found</div>
                  <div className="smart-tickets-value">136</div>
                  <div className="smart-tickets-amount">19030.00</div>
                </div>
                <div className="w-1/3 border-r border-white/20">
                  <div className="smart-tickets-label">Total Open</div>
                  <div className="smart-tickets-value">146</div>
                  <div className="smart-tickets-amount">20461.00</div>
                </div>
                <div className="w-1/3">
                  <div className="smart-tickets-label">Closed</div>
                  <div className="smart-tickets-value">60</div>
                  <div className="smart-tickets-amount">10232.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 5 — Advertisement, Bank, Business Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          {/* Advertisement */}
          <div className="h-full">
            <div className="advertisement-card h-full">
              <div className="advertisement-header flex-wrap">
                <span className="advertisement-title text-white">Advertisement</span>
                <span className="advertisement-per-order">0.55<br />RS. Per Order</span>
              </div>
              <div className="flex mt-4 text-center">
                <div className="w-1/2 border-r border-white/20">
                  <div className="advertisement-label">Paid</div>
                  <div className="advertisement-amount">2458.89</div>
                </div>
                <div className="w-1/2">
                  <div className="advertisement-label">Used</div>
                  <div className="advertisement-amount">2458.19</div>
                </div>
              </div>
            </div>
          </div>

          {/* Received In Bank */}
          <div className="h-full">
            <div
              className="bank-card h-full cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-white/30 transition-all active:scale-95"
              onClick={() => navigate('/bank-credit-statement')}
            >
              <div className="bank-header flex-wrap">
                <span className="bank-title text-white">Received In Bank Acc.</span>
              </div>
                <div className="bank-last-payment text-right">Last Payment 12/12/2025</div>
              <div className="flex flex-col mt-4">
                <div className="bank-amount-label">Amount</div>
                <div className="bank-amount-value">398661.65</div>
              </div>
            </div>
          </div>

          {/* Business Insights */}
          <div className="sm:col-span-2 h-full" onClick={() => navigate('/sku-report')}>
            <div className="business-insights-card h-full">

              {/* Header */}
              <div className="business-insights-header">
                <h6 className="business-insights-title">Business Insights</h6>
                <small className="business-insights-link">Click here for more details</small>
              </div>

              {/* Insights Grid */}
              <div className="business-insights-grid">
                {[
                  { label: "PICKED", value: "3948", sub: null, color: "text-gray-900" },
                  { label: "SHIPPED", value: "270", sub: "6.84 %", color: "text-gray-900" },
                  { label: "RTO", value: "452", sub: "11.45 %", color: "text-red-600" },
                  { label: "DELIVERED", value: "3226", sub: "81.71 %", color: "text-gray-900" },
                  { label: "RETURN", value: "355", sub: "11.00 %", color: "text-red-600" },
                  { label: "DELIVERY", value: "2871", sub: "89.00 %", color: "text-green-600" },
                ].map((item) => (
                  <div key={item.label} className="business-insight-item border-r border-border">
                    <div className={`business-insight-label ${item.color}`}>
                      {item.label}
                    </div>
                    <div className={`business-insight-value ${item.color}`}>
                      {item.value}
                    </div>
                    {item.sub && (
                      <div className={`business-insight-sub ${item.color}`}>
                        {item.sub}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Daily Metrics Bar */}
        <div
          className="mt-3 rounded-lg overflow-hidden"
          style={{ backgroundColor: '#111827', border: '1px solid #1f2937' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 py-4">
            {[
              { label: 'Monthly Avg. Orders', value: null, color: '#4ade80' },
              { label: 'Daily Avg. Orders', value: '31', color: '#4ade80' },
              { label: 'Avg. Return Charge', value: '-160.35', color: '#f87171' },
              { label: 'Avg. P/L Per Order', value: '9.92', color: '#4ade80' },
              { label: "Today's Pickup", value: '73', color: '#4ade80' },
              { label: "Today's Returns Received", value: '5', color: '#f87171' },
              { label: "Today's Bank Credit", value: '0.00', color: '#d1d5db' },
            ].map((item, i, arr) => (
              <div
                key={i}
                className={[
                  'flex flex-col items-center justify-center py-4 px-2 text-center',
                  i < arr.length - 1 ? 'border-r border-gray-700' : '',
                  'border-b border-gray-700 lg:border-b-0',
                ].join(' ')}
              >
                <span
                  className="text-[0.8rem] sm:text-[0.8rem] font-bold uppercase tracking-wide leading-tight mb-2"
                  style={{ color: '#9ca3af' }}
                >
                  {item.label}
                </span>
                {item.value !== null ? (
                  <span
                    className="text-sm sm:text-base font-extrabold leading-none tabular-nums"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                ) : (
                  <span className="text-sm sm:text-base font-extrabold leading-none" style={{ color: '#6b7280' }}>—</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
