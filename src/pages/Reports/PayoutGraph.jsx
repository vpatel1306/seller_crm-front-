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
import { FiX, FiInfo, FiTrendingUp, FiCreditCard, FiActivity } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const MONTHLY_DATA = [
  { month: "08/2025", claim: 180, recovery: 90, compensation: 4200, advertisement: 110, bankReceived: 54200 },
  { month: "09/2025", claim: 520, recovery: 320, compensation: 180, advertisement: 210, bankReceived: 37800 },
  { month: "10/2025", claim: 6800, recovery: 420, compensation: 280, advertisement: 350, bankReceived: 122400 },
  { month: "11/2025", claim: 9200, recovery: 580, compensation: 340, advertisement: 420, bankReceived: 91200 },
  { month: "12/2025", claim: 7800, recovery: 480, compensation: 260, advertisement: 380, bankReceived: 79800 },
];

const BARS = [
  { key: "claim", label: "Claim", color: "#10b981" },
  { key: "recovery", label: "Recovery", color: "#f472b6" },
  { key: "compensation", label: "Compensation", color: "#111827" },
  { key: "advertisement", label: "Advertisement", color: "#8b5cf6" },
  { key: "bankReceived", label: "Bank Received", color: "#d1d5db" },
];

const MAX_VAL = 128164.17;
const Y_TICKS = [0, 8548, 17092, 25636, 34180, 42724, 51268, 59812, 68356, 76900, 85444, 93988, 102532, 111076, 119620, 128164];

const fmtNum = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-gray-100 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 min-w-[200px]">
      <div className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-2 mb-3">{label} Analysis</div>
      <div className="space-y-2.5">
        {payload.filter(p => p.value > 0).map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.fill }} />
              <span className="text-[0.65rem] font-bold text-gray-600 uppercase">{p.name}</span>
            </div>
            <span className="text-xs font-black text-gray-900 font-mono">₹{p.value.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PayoutGraph() {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const accountName = activeAccount?.account_name || "No account selected";
  const [visible, setVisible] = useState(Object.fromEntries(BARS.map((b) => [b.key, true])));
  const toggle = useCallback((key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] })), []);

  return (
    <div className="min-h-screen bg-bg p-4 lg:p-8 flex flex-col gap-6 font-sans">

      {/* Header Info */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-gray-100/50 flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/5">
            <FiCreditCard size={28} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-tight">Payout Velocity Analytics</h1>
            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.4em]">Settlement Engine - {accountName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-700 text-[0.65rem] font-bold italic">
            <FiActivity size={14} className="animate-pulse" />
            Index Sync: 12 Dec 2025
          </div>
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-900 text-white hover:bg-black transition-all active:scale-90 shadow-lg" onClick={() => navigate(-1)}>
            <FiX size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 flex-1">

        {/* Main Chart Card */}
        <div className="lg:col-span-9 bg-white rounded-[3rem] p-10 shadow-2xl shadow-primary/10 border border-gray-100/50 flex flex-col relative overflow-hidden">
          <div className="absolute top-10 right-10 flex gap-2">
            {BARS.map((bar) => (
              <button
                key={bar.key}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-tight transition-all active:scale-95 border ${visible[bar.key] ? 'border-primary/10 bg-gray-50 shadow-sm' : 'border-transparent bg-transparent opacity-20 grayscale'}`}
                onClick={() => toggle(bar.key)}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bar.color }} />
                {bar.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 h-[600px] mt-12">
            {/* Y-Axis */}
            <div className="w-24 shrink-0 flex flex-col justify-between items-end pr-6 text-[0.65rem] font-black text-gray-300 font-mono leading-none">
              {[...Y_TICKS].reverse().map((v, i) => <span key={i}>{fmtNum(v)}</span>)}
            </div>

            {/* Chart Core */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MONTHLY_DATA}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                  barCategoryGap="30%"
                  barGap={4}
                >
                  <CartesianGrid vertical={false} stroke="#f8fafc" />
                  <ReferenceLine y={119620} stroke="#6366f1" strokeWidth={2} strokeDasharray="8 8" label={{ position: 'top', value: 'TARGET THRESHOLD', fill: '#6366f1', fontSize: 10, fontWeight: 900 }} />
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={[0, MAX_VAL]} ticks={Y_TICKS} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.01)" }} />

                  {BARS.map((bar) =>
                    visible[bar.key] ? (
                      <Bar
                        key={bar.key}
                        dataKey={bar.key}
                        name={bar.label}
                        fill={bar.color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                        isAnimationActive={true}
                        animationDuration={1200}
                      />
                    ) : null
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Month Labels */}
          <div className="flex pl-24 pr-0 mt-6">
            {MONTHLY_DATA.map((d, i) => (
              <div key={i} className="flex-1 text-center font-black text-gray-400 text-[0.7rem] uppercase tracking-widest">{d.month}</div>
            ))}
          </div>
        </div>

        {/* Side Info */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <FiTrendingUp size={32} className="opacity-40 mb-6" />
              <h4 className="text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-60">Highest Settlement</h4>
              <div className="text-4xl font-black mt-1 leading-none">₹1.22L</div>
              <div className="mt-4 text-[0.65rem] font-bold bg-white/10 px-3 py-1.5 rounded-xl w-fit border border-white/10">OCT 2025 PEAK</div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 overflow-hidden">
              <div className="w-3/4 h-full bg-white animate-pulse" />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex-1 flex flex-col">
            <h4 className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest mb-6">Valuation Hints</h4>
            <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                <div className="w-1.5 h-12 bg-indigo-500 rounded-full shrink-0" />
                <p className="text-[0.65rem] font-bold text-gray-500 leading-relaxed uppercase tracking-tight">Interactive bars allow for granular inspection of daily settlement batches.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-12 bg-gray-200 rounded-full shrink-0" />
                <p className="text-[0.65rem] font-bold text-gray-400 leading-relaxed uppercase tracking-tight">Dotted threshold line represents the optimized revenue target index.</p>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-[0.6rem] font-black text-gray-300 uppercase tracking-widest">
              <span>Ref 12.12.25</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Index</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


