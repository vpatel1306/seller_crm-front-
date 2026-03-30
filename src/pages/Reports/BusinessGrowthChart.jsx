import { useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
import { FiX, FiInfo, FiTrendingUp, FiTrendingDown, FiPieChart, FiBarChart2 } from "react-icons/fi";

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

const BARS = [
  { key: "pickup", label: "Pickup", color: "#b0b0b0" },
  { key: "shipped", label: "Shipped", color: "#a8d8f0" },
  { key: "courierReturn", label: "Courier Return", color: "#e8c020" },
  { key: "customerReturn", label: "Customer Return", color: "#b03000" },
  { key: "delivery", label: "Delivery", color: "#b0e860" },
  { key: "advertisement", label: "Advertisement", color: "#00c0c0" },
  { key: "otherLoss", label: "Other Loss", color: "#f8a0b0" },
  { key: "pendingPayment", label: "Pending Payment", color: "#7030a0" },
  { key: "netProfit", label: "Net Profit", color: "#008000" },
  { key: "netLoss", label: "Net Loss", color: "#cc0000" },
];

const MAX_AMOUNT = 168056.2;
const Y_TICKS = [168056.2, 151250.58, 134444.96, 117639.34, 100833.72, 84028.10, 67222.48, 50416.86, 33611.24, 16805.62, 0];
const ORDER_TICKS = [1360, 1224, 1088, 952, 816, 680, 544, 408, 272, 136, 0];

const fmtNum = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const rows = payload.filter((p) => p.value > 0);
  return (
    <div className="bg-white/90 backdrop-blur-md border border-gray-100 p-4 rounded-2xl shadow-2xl animate-in zoom-in duration-200 min-w-[220px]">
      <div className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 mb-3">{label} Metrics</div>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
              <span className="text-xs font-bold text-gray-600">{p.name}</span>
            </div>
            <span className="text-xs font-black text-gray-900 font-mono">₹{p.value.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessGrowthChart() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(Object.fromEntries(BARS.map((b) => [b.key, true])));
  const toggle = useCallback((key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] })), []);

  return (
    <div className="min-h-screen bg-bg p-4 lg:p-8 flex flex-col gap-6 font-sans">

      {/* Header Info */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-gray-100/50 flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-primary/20 p-3 rounded-2xl border border-white/5">
            <FiPieChart size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-tight">Business Growth Tracker</h1>
            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.4em]">Analytics Module — Dev E-Com</p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-[0.65rem] font-bold italic">
            <FiInfo size={14} />
            Payments reconciled up to 12 Dec 2025
          </div>
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-900 text-white hover:bg-black transition-all active:scale-90 shadow-lg" onClick={() => navigate("/dashboard")}>
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Legend Area */}
      <div className="bg-white/50 backdrop-blur-sm px-6 py-4 rounded-[2rem] border border-gray-100/50 shadow-sm flex flex-wrap gap-3 justify-center">
        {BARS.map((bar) => (
          <button
            key={bar.key}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-tight transition-all active:scale-95 border-2 ${visible[bar.key] ? 'border-primary/5 bg-white shadow-sm' : 'border-transparent bg-transparent opacity-30 grayscale'}`}
            onClick={() => toggle(bar.key)}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bar.color }} />
            {bar.label}
          </button>
        ))}
        <div className="px-4 py-2 text-[0.6rem] font-black text-primary/40 uppercase tracking-widest flex items-center italic">(Filtered View)</div>
      </div>

      {/* Chart Layout Container */}
      <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-primary/10 border border-gray-100/50 flex flex-col gap-1 relative overflow-hidden">

        <div className="flex h-[450px]">
          {/* Left Y-Axis */}
          <div className="w-20 lg:w-32 flex flex-col shrink-0 relative pr-4">
            <div className="flex-1 flex flex-col justify-between items-end text-[0.65rem] font-bold text-gray-400 font-mono italic">
              {Y_TICKS.map((v, i) => <span key={i} className="leading-none">{fmtNum(v)}</span>)}
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[0.6rem] font-black text-gray-300 uppercase tracking-[0.5em] mt-[-10px]">Currency (₹)</div>
          </div>

          {/* Chart Core */}
          <div className="flex-1 min-w-0">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MONTHLY_DATA}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  barCategoryGap="25%"
                  barGap={2}
                >
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={[0, MAX_AMOUNT]} ticks={Y_TICKS} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                  <ReferenceLine y={0} stroke="#eee" />

                  {BARS.map((bar) =>
                    visible[bar.key] ? (
                      <Bar
                        key={bar.key}
                        dataKey={bar.key}
                        name={bar.label}
                        fill={bar.color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={16}
                        strokeWidth={0}
                        isAnimationActive={true}
                        animationDuration={1000}
                      />
                    ) : null
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Y-Axis */}
          <div className="w-16 flex flex-col shrink-0 relative pl-4 opacity-50">
            <div className="flex-1 flex flex-col justify-between items-start text-[0.65rem] font-black text-indigo-400 font-mono">
              {ORDER_TICKS.map((v, i) => <span key={i} className="leading-none">{v}</span>)}
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 origin-center text-[0.6rem] font-black text-indigo-200 uppercase tracking-[0.5em] mt-[-10px]">Volume</div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-auto w-full max-w-[calc(100%-140px)] my-4" />

        {/* Month Stats Footer Row */}
        <div className="flex pl-20 lg:pl-32 pr-16">
          {MONTHLY_DATA.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 min-w-0">
              <div className="text-[0.65rem] font-black text-gray-900 group-hover:text-primary transition-colors text-center px-1 truncate w-full">{d.month}</div>
              <div className="w-full px-2 space-y-1 scale-90 xxl:scale-100 origin-top">
                <div className="flex justify-between items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                  <span className="text-[0.5rem] font-bold text-gray-400 uppercase">Cost</span>
                  <span className="text-[0.6rem] font-black text-gray-700">₹{d.addCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[0.5rem] font-bold text-red-300 uppercase">RTO</span>
                  <span className="text-[0.6rem] font-black text-red-500">{d.rto}%</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[0.5rem] font-bold text-amber-300 uppercase">C.R.</span>
                  <span className="text-[0.6rem] font-black text-amber-500">{d.cr}%</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[0.5rem] font-bold text-green-300 uppercase">Del</span>
                  <span className="text-[0.6rem] font-black text-green-500">{d.dlvry}%</span>
                </div>
                <div className={`mt-2 py-2 rounded-xl text-center shadow-inner border relative overflow-hidden group/badge ${d.isLoss ? "bg-red-50 border-red-100 text-red-600" : "bg-green-50 border-green-100 text-green-600"}`}>
                  <div className="text-[0.5rem] font-black uppercase tracking-tighter self-center relative z-10">Net {d.isLoss ? 'Loss' : 'Gain'}</div>
                  <div className="text-[0.7rem] font-black tracking-tighter relative z-10">{Math.abs(d.netProfitPct).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Hints */}
      <div className="bg-gray-900/5 backdrop-blur-md rounded-2xl p-4 flex items-center justify-center gap-3">
        <FiBarChart2 className="text-gray-400" />
        <p className="text-[0.65rem] font-black text-gray-500 uppercase tracking-[0.2em] italic">
          Hover over interactive data segments to expose granular valuation metrics
        </p>
      </div>
    </div>
  );
}