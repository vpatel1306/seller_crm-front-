import { useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { useNavigate } from 'react-router-dom';


const MONTHLY_DATA = [
  {
    month: "07/2025 (Jul)",
    pickup: 16805,
    shipped: 0,
    courierReturn: 1250,
    customerReturn: 820,
    delivery: 6500,
    advertisement: 0,
    otherLoss: 210,
    pendingPayment: 0,
    netProfit: 2900,
    netLoss: 0,
    addCost: 3.63, rto: 15.54, cr: 12.00, dlvry: 88.00,
    netProfitPct: 18.78, isLoss: false,
  },
  {
    month: "08/2025 (Aug)",
    pickup: 43000,
    shipped: 0,
    courierReturn: 3200,
    customerReturn: 1950,
    delivery: 30000,
    advertisement: 220,
    otherLoss: 380,
    pendingPayment: 0,
    netProfit: 1550,
    netLoss: 0,
    addCost: 4.22, rto: 13.49, cr: 10.85, dlvry: 89.15,
    netProfitPct: 3.67, isLoss: false,
  },
  {
    month: "09/2025 (Sep)",
    pickup: 84028,
    shipped: 0,
    courierReturn: 7200,
    customerReturn: 5400,
    delivery: 64000,
    advertisement: 280,
    otherLoss: 620,
    pendingPayment: 0,
    netProfit: 3100,
    netLoss: 0,
    addCost: 0.42, rto: 12.46, cr: 11.29, dlvry: 88.71,
    netProfitPct: 4.19, isLoss: false,
  },
  {
    month: "10/2025 (Oct)",
    pickup: 96000,
    shipped: 0,
    courierReturn: 8800,
    customerReturn: 6400,
    delivery: 73000,
    advertisement: 380,
    otherLoss: 870,
    pendingPayment: 0,
    netProfit: 7400,
    netLoss: 0,
    addCost: 0.09, rto: 13.38, cr: 10.97, dlvry: 89.03,
    netProfitPct: 8.46, isLoss: false,
  },
  {
    month: "11/2025 (Nov)",
    pickup: 157000,
    shipped: 2600,
    courierReturn: 11500,
    customerReturn: 10500,
    delivery: 113000,
    advertisement: 580,
    otherLoss: 1150,
    pendingPayment: 0,
    netProfit: 10800,
    netLoss: 0,
    addCost: 0.00, rto: 11.60, cr: 11.41, dlvry: 83.05,
    netProfitPct: 7.54, isLoss: false,
  },
  {
    month: "12/2025 (Dec)",
    pickup: 72000,
    shipped: 12000,
    courierReturn: 3100,
    customerReturn: 2100,
    delivery: 37000,
    advertisement: 480,
    otherLoss: 820,
    pendingPayment: 55000,
    netProfit: 0,
    netLoss: 42000,
    addCost: 0.19, rto: 5.53, cr: 4.85, dlvry: 60.87,
    netProfitPct: -59.04, isLoss: true,
  },
];

/* ================================================================
   LEGEND / BAR CONFIG
   ================================================================ */
const BARS = [
  { key: "pickup",         label: "Pickup",          color: "#b0b0b0" },
  { key: "shipped",        label: "Shipped",          color: "#a8d8f0" },
  { key: "courierReturn",  label: "Courier Return",   color: "#e8c020" },
  { key: "customerReturn", label: "Customer Return",  color: "#b03000" },
  { key: "delivery",       label: "Delivery",         color: "#b0e860" },
  { key: "advertisement",  label: "Advertisement",    color: "#00c0c0" },
  { key: "otherLoss",      label: "Other Loss",       color: "#f8a0b0" },
  { key: "pendingPayment", label: "Pending Payment",  color: "#7030a0" },
  { key: "netProfit",      label: "Net Profit",       color: "#008000" },
  { key: "netLoss",        label: "Net Loss",         color: "#cc0000" },
];

/* ================================================================
   AXIS CONFIG
   ================================================================ */
const MAX_AMOUNT  = 168056.2;
const Y_TICKS     = [168056.2, 151250.58, 134444.96, 117639.34,
                     100833.72, 84028.10,  67222.48,  50416.86,
                     33611.24,  16805.62,  0];

const fmtNum = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

/* ================================================================
   CUSTOM TOOLTIP
   ================================================================ */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const rows = payload.filter((p) => p.value > 0);
  return (
    <div className="bgc-tooltip">
      <div className="bgc-tooltip-month">{label}</div>
      {rows.map((p) => (
        <div key={p.dataKey} className="bgc-tooltip-row">
          <span className="bgc-tooltip-dot" style={{ backgroundColor: p.fill }} />
          <span className="bgc-tooltip-label">{p.name}</span>
          <span className="bgc-tooltip-value">₹{p.value.toLocaleString("en-IN")}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   LEFT AXIS TICK
   ================================================================ */
function LeftTick({ x, y, payload }) {
  return (
    <text x={x - 4} y={y + 3} textAnchor="end" fontSize={9} fill="#555">
      {fmtNum(payload.value)}
    </text>
  );
}

/* ================================================================
   COMPONENT
   ================================================================ */
export default function BusinessGrowthChart() {
    const navigate = useNavigate();
  const [visible, setVisible] = useState(
    Object.fromEntries(BARS.map((b) => [b.key, true]))
  );

  const toggle = useCallback(
    (key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] })),
    []
  );

  /* Dynamic chart height based on viewport */
  const chartHeight = 350;

  /* Stats row height = match chart axis spacer */
  const statsHeight = 148;

  return (
    <div className="bgc-page">
      <div className="bgc-card">

        {/* ── Title Bar ── */}
        <div className="bgc-titlebar">
          <span className="bgc-title">Business Growth Chart - Dev E-Com</span>
          <div className="bgc-titlebar-right">
            <span className="bgc-hindi-hint">
              कलर बार के ऊपर माउस का कर्सर ले जाने से मान (value) दिखाई देगी।
            </span>
            <button className="bgc-close-btn"  onClick={() => navigate("/dashboard")}>X</button>
          </div>
        </div>

        {/* ── Updated Notice ── */}
        <div className="bgc-updated">The payment is updated till 12/12/2025.</div>

        {/* ── Legend ── */}
        <div className="bgc-legend">
          {BARS.map((bar) => (
            <div
              key={bar.key}
              className={`bgc-legend-item${!visible[bar.key] ? " bgc-inactive" : ""}`}
              onClick={() => toggle(bar.key)}
            >
              <span className="bgc-legend-color" style={{ backgroundColor: bar.color }} />
              {bar.label}
            </div>
          ))}
          <span className="bgc-legend-custom">(Custom)</span>
        </div>

        {/* ── Chart Body ── */}
        <div className="bgc-body">

          {/* Left Y-Axis Labels */}
          <div className="bgc-yaxis-left">
            <div
              className="bgc-yaxis-left-ticks"
              style={{ height: chartHeight }}
            >
              {Y_TICKS.map((v, i) => (
                <div key={i} className="bgc-yaxis-tick">{fmtNum(v)}</div>
              ))}
            </div>
            <div className="bgc-yaxis-left-label">
              <span>Amount</span>
            </div>
            <div
              className="bgc-yaxis-stats-spacer"
              style={{ height: statsHeight }}
            />
          </div>

          {/* Center: Recharts + Month stats */}
          <div className="bgc-chart-content">

            {/* Recharts BarChart */}
            <div className="bgc-recharts-wrap" style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MONTHLY_DATA}
                  margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                  barCategoryGap="20%"
                  barGap={1}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#e0e0e0"
                    strokeWidth={0.7}
                  />
                  <XAxis
                    dataKey="month"
                    hide={true}
                  />
                  <YAxis
                    hide={true}
                    domain={[0, MAX_AMOUNT]}
                    ticks={Y_TICKS}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  {/* Reference baseline */}
                  <ReferenceLine y={0} stroke="#999" strokeWidth={1} />

                  {/* Render each bar series */}
                  {BARS.map((bar) =>
                    visible[bar.key] ? (
                      <Bar
                        key={bar.key}
                        dataKey={bar.key}
                        name={bar.label}
                        fill={bar.color}
                        stroke="rgba(0,0,0,0.18)"
                        strokeWidth={0.4}
                        maxBarSize={14}
                        isAnimationActive={true}
                        animationDuration={600}
                      />
                    ) : null
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Month labels + stats */}
            <div className="bgc-months-row">
              {MONTHLY_DATA.map((d, i) => (
                <div key={i} className="bgc-month-col">
                  <div className="bgc-month-label">{d.month}</div>
                  <div className="bgc-month-stats">
                    <div>Add. Cost : {d.addCost.toFixed(2)} Rs.</div>
                    <div>RTO : {d.rto} %</div>
                    <div>C.R. : {d.cr} %</div>
                    <div>DLVRY : {d.dlvry} %</div>
                    <div className={`bgc-profit-badge ${d.isLoss ? "loss" : "profit"}`}>
                      {d.isLoss
                        ? `Net Loss : ${Math.abs(d.netProfitPct).toFixed(2)} %`
                        : `Net Profit : ${d.netProfitPct.toFixed(2)} %`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Y-Axis Labels */}
          <div className="bgc-yaxis-right">
            <div
              className="bgc-yaxis-right-ticks"
              style={{ height: chartHeight }}
            >
              {[0, 136, 272, 408, 544, 680, 816, 952, 1088, 1224, 1360]
                .reverse()
                .map((v, i) => (
                  <div key={i} className="bgc-yaxis-right-tick">- {v}</div>
                ))}
            </div>
            <div className="bgc-yaxis-right-label">
              <span>Orders</span>
            </div>
            <div
              className="bgc-yaxis-stats-spacer-right"
              style={{ height: statsHeight }}
            />
          </div>

        </div>{/* end bgc-body */}

        {/* ── Bottom Hint ── */}
        <div className="bgc-hint">
          कलर बार के ऊपर माउस का कर्सर ले जाने से मान (value) दिखाई देगी।
        </div>

      </div>{/* end bgc-card */}
    </div>
  );
}