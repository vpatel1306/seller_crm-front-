import { useState, useCallback } from "react";
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
import { useNavigate } from "react-router-dom";

/* ================================================================
   DATA  — 5 months: Aug–Dec 2025
   ================================================================ */
const MONTHLY_DATA = [
  {
    month: "08/2025",
    claim:        180,
    recovery:     90,
    compensation: 4200,
    advertisement:110,
    bankReceived: 54200,
  },
  {
    month: "09/2025",
    claim:        520,
    recovery:     320,
    compensation: 180,
    advertisement:210,
    bankReceived: 37800,
  },
  {
    month: "10/2025",
    claim:        6800,
    recovery:     420,
    compensation: 280,
    advertisement:350,
    bankReceived: 122400,
  },
  {
    month: "11/2025",
    claim:        9200,
    recovery:     580,
    compensation: 340,
    advertisement:420,
    bankReceived: 91200,
  },
  {
    month: "12/2025",
    claim:        7800,
    recovery:     480,
    compensation: 260,
    advertisement:380,
    bankReceived: 79800,
  },
];

/* ================================================================
   BAR CONFIG
   ================================================================ */
const BARS = [
  { key: "claim",         label: "Claim",         color: "#228B22" },
  { key: "recovery",      label: "Recovery",       color: "#FFB6C1" },
  { key: "compensation",  label: "Compensation",   color: "#1a1a1a" },
  { key: "advertisement", label: "Advertisement",  color: "#9370DB" },
  { key: "bankReceived",  label: "Bank Received",  color: "#b0b0b0" },
];

/* ================================================================
   AXIS TICKS  — matching screenshot values
   ================================================================ */
const MAX_VAL = 128164.17;
const Y_TICKS = [
  0, 8548, 17092, 25636, 34180, 42724, 51268,
  59812, 68356, 76900, 85444, 93988, 102532,
  111076, 119620, 128164,
];

/* ================================================================
   HELPERS
   ================================================================ */
const fmtNum = (n) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ================================================================
   CUSTOM TOOLTIP
   ================================================================ */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const rows = payload.filter((p) => p.value > 0);
  return (
    <div className="pg-tooltip">
      <div className="pg-tooltip-month">{label}</div>
      {rows.map((p) => (
        <div key={p.dataKey} className="pg-tooltip-row">
          <span className="pg-tooltip-dot" style={{ backgroundColor: p.fill }} />
          <span className="pg-tooltip-label">{p.name}</span>
          <span className="pg-tooltip-value">₹{p.value.toLocaleString("en-IN")}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   LEFT AXIS CUSTOM TICK
   ================================================================ */
function LeftAxisTick({ x, y, payload }) {
  return (
    <text x={x - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#444">
      {fmtNum(payload.value)}
    </text>
  );
}

/* ================================================================
   COMPONENT
   ================================================================ */
export default function PayoutGraph() {
    const navigate = useNavigate();
  const [visible, setVisible] = useState(
    Object.fromEntries(BARS.map((b) => [b.key, true]))
  );

  const toggle = useCallback(
    (key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] })),
    []
  );

  const chartHeight = 720;

  return (
    <div className="pg-page">
      <div className="pg-card">

        {/* ── Title Bar ── */}
        <div className="pg-titlebar">
          <span className="pg-title">Payout Graph - Dev E-Com</span>
          <button className="pg-close-btn" onClick={() => navigate(-1)}>
            X
          </button>
        </div>

        {/* ── Legend Row ── */}
        <div className="pg-legend-row">
          {BARS.map((bar) => (
            <div
              key={bar.key}
              className={`pg-legend-item${!visible[bar.key] ? " pg-inactive" : ""}`}
              onClick={() => toggle(bar.key)}
            >
              <span
                className="pg-legend-color"
                style={{ backgroundColor: bar.color }}
              />
              {bar.label}
            </div>
          ))}
        </div>

        {/* ── Hindi Hint ── */}
        <div className="pg-hindi-hint">
          कलर बार के ऊपर माउस का कर्सर ले जाने से मान (value) दिखाई देगी।
        </div>

        {/* ── Chart Body ── */}
        <div className="pg-body">

          {/* Left Y-Axis Labels */}
          <div className="pg-yaxis-left">
            <div className="pg-yaxis-ticks" style={{ height: chartHeight }}>
              {[...Y_TICKS].reverse().map((v, i) => (
                <div key={i} className="pg-yaxis-tick">{fmtNum(v)} -</div>
              ))}
            </div>
            <div className="pg-yaxis-bottom" />
          </div>

          {/* Center: chart + month labels */}
          <div className="pg-chart-content">

            {/* Recharts BarChart */}
            <div className="pg-recharts-wrap" style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MONTHLY_DATA}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  barCategoryGap="25%"
                  barGap={2}
                >
                  {/* Grid — horizontal lines only */}
                  <CartesianGrid
                    vertical={false}
                    stroke="#e4e4e4"
                    strokeWidth={0.8}
                  />

                  {/* Reference line at avg (119620) — blue line from screenshot */}
                  <ReferenceLine
                    y={119620}
                    stroke="#5555cc"
                    strokeWidth={1.2}
                    strokeDasharray="0"
                  />

                  <XAxis dataKey="month" hide={true} />
                  <YAxis
                    hide={true}
                    domain={[0, MAX_VAL]}
                    ticks={Y_TICKS}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />

                  {/* Bars */}
                  {BARS.map((bar) =>
                    visible[bar.key] ? (
                      <Bar
                        key={bar.key}
                        dataKey={bar.key}
                        name={bar.label}
                        fill={bar.color}
                        stroke="rgba(0,0,0,0.15)"
                        strokeWidth={0.4}
                        maxBarSize={18}
                        isAnimationActive={true}
                        animationDuration={600}
                      />
                    ) : null
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Month label row */}
            <div className="pg-months-row">
              {MONTHLY_DATA.map((d, i) => (
                <div key={i} className="pg-month-col">
                  <div className="pg-month-label">{d.month}</div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end pg-body */}

        {/* ── Updated Notice ── */}
        <div className="pg-updated">The payment is updated till 12/12/2025.</div>

      </div>{/* end pg-card */}
    </div>
  );
}