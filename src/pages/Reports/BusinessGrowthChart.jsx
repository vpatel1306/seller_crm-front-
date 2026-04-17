import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FiBarChart2, FiInfo, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import AppShell from '../../components/layout/AppShell';
import OrdersPageHeader from '../../components/orders/OrdersPageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const MONTHLY_DATA = [
  { month: '07/2025 (Jul)', pickup: 16805, shipped: 0, courierReturn: 1250, customerReturn: 820, delivery: 6500, advertisement: 0, otherLoss: 210, pendingPayment: 0, netProfit: 2900, netLoss: 0, addCost: 3.63, rto: 15.54, cr: 12.00, dlvry: 88.00, netProfitPct: 18.78, isLoss: false },
  { month: '08/2025 (Aug)', pickup: 43000, shipped: 0, courierReturn: 3200, customerReturn: 1950, delivery: 30000, advertisement: 220, otherLoss: 380, pendingPayment: 0, netProfit: 1550, netLoss: 0, addCost: 4.22, rto: 13.49, cr: 10.85, dlvry: 89.15, netProfitPct: 3.67, isLoss: false },
  { month: '09/2025 (Sep)', pickup: 84028, shipped: 0, courierReturn: 7200, customerReturn: 5400, delivery: 64000, advertisement: 280, otherLoss: 620, pendingPayment: 0, netProfit: 3100, netLoss: 0, addCost: 0.42, rto: 12.46, cr: 11.29, dlvry: 88.71, netProfitPct: 4.19, isLoss: false },
  { month: '10/2025 (Oct)', pickup: 96000, shipped: 0, courierReturn: 8800, customerReturn: 6400, delivery: 73000, advertisement: 380, otherLoss: 870, pendingPayment: 0, netProfit: 7400, netLoss: 0, addCost: 0.09, rto: 13.38, cr: 10.97, dlvry: 89.03, netProfitPct: 8.46, isLoss: false },
  { month: '11/2025 (Nov)', pickup: 157000, shipped: 2600, courierReturn: 11500, customerReturn: 10500, delivery: 113000, advertisement: 580, otherLoss: 1150, pendingPayment: 0, netProfit: 10800, netLoss: 0, addCost: 0.00, rto: 11.60, cr: 11.41, dlvry: 83.05, netProfitPct: 7.54, isLoss: false },
  { month: '12/2025 (Dec)', pickup: 72000, shipped: 12000, courierReturn: 3100, customerReturn: 2100, delivery: 37000, advertisement: 480, otherLoss: 820, pendingPayment: 55000, netProfit: 0, netLoss: 42000, addCost: 0.19, rto: 5.53, cr: 4.85, dlvry: 60.87, netProfitPct: -59.04, isLoss: true },
];

const BARS = [
  { key: 'pickup', label: 'Pickup', color: '#b0b0b0' },
  { key: 'shipped', label: 'Shipped', color: '#a8d8f0' },
  { key: 'courierReturn', label: 'Courier Return', color: '#e8c020' },
  { key: 'customerReturn', label: 'Customer Return', color: '#b03000' },
  { key: 'delivery', label: 'Delivery', color: '#b0e860' },
  { key: 'advertisement', label: 'Advertisement', color: '#00c0c0' },
  { key: 'otherLoss', label: 'Other Loss', color: '#f8a0b0' },
  { key: 'pendingPayment', label: 'Pending Payment', color: '#7030a0' },
  { key: 'netProfit', label: 'Net Profit', color: '#008000' },
  { key: 'netLoss', label: 'Net Loss', color: '#cc0000' },
];

const MAX_AMOUNT = 168056.2;
const Y_TICKS = [168056.2, 151250.58, 134444.96, 117639.34, 100833.72, 84028.10, 67222.48, 50416.86, 33611.24, 16805.62, 0];
const ORDER_TICKS = [1360, 1224, 1088, 952, 816, 680, 544, 408, 272, 136, 0];
const fmtNum = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const rows = payload.filter((p) => p.value > 0);
  return (
    <div className="min-w-[220px] rounded-[20px] border border-border bg-white/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3 border-b border-border pb-2 text-[0.7rem] font-black uppercase tracking-widest text-text-muted">{label} Metrics</div>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill }} />
              <span className="text-xs font-bold text-text">{p.name}</span>
            </div>
            <span className="font-mono text-xs font-black text-text">₹{p.value.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessGrowthChart() {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const accountName = activeAccount?.account_name || 'No account selected';
  const [visible, setVisible] = useState(Object.fromEntries(BARS.map((b) => [b.key, true])));
  const toggle = useCallback((key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] })), []);

  return (
    <AppShell>
      <div className="space-y-4">
        <OrdersPageHeader
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: 'Business Growth Chart', current: true },
          ]}
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <FiX size={14} /> Cancel
            </Button>
          }
        />


        {/* Legend */}
        <Card title="Chart Legend" subtitle="Click to toggle series visibility" muted>
          <div className="flex flex-wrap gap-2">
            {BARS.map((bar) => (
              <button
                key={bar.key}
                onClick={() => toggle(bar.key)}
                className={`flex items-center gap-2 rounded-[12px] border-2 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide transition-all active:scale-95 ${
                  visible[bar.key] ? 'border-border bg-white shadow-sm' : 'border-transparent bg-transparent opacity-30 grayscale'
                }`}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: bar.color }} />
                {bar.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Chart */}
        <Card title="Monthly Business Growth" subtitle={`Analytics — ${accountName}`} contentClassName="p-4 sm:p-6">
          <div className="flex h-[450px]">
            {/* Left Y-Axis */}
            <div className="relative flex w-20 shrink-0 flex-col pr-4 lg:w-32">
              <div className="flex flex-1 flex-col items-end justify-between font-mono text-[0.65rem] font-bold italic text-text-muted">
                {Y_TICKS.map((v, i) => <span key={i} className="leading-none">{fmtNum(v)}</span>)}
              </div>
              <div className="absolute left-0 top-1/2 origin-center -translate-y-1/2 -rotate-90 text-[0.6rem] font-black uppercase tracking-[0.5em] text-text-muted/40">Currency (₹)</div>
            </div>

            {/* Chart Core */}
            <div className="min-w-0 flex-1">
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barCategoryGap="25%" barGap={2}>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={[0, MAX_AMOUNT]} ticks={Y_TICKS} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <ReferenceLine y={0} stroke="#eee" />
                  {BARS.map((bar) =>
                    visible[bar.key] ? (
                      <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color} radius={[4, 4, 0, 0]} maxBarSize={16} isAnimationActive animationDuration={1000} />
                    ) : null
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Right Y-Axis */}
            <div className="relative flex w-16 shrink-0 flex-col pl-4 opacity-50">
              <div className="flex flex-1 flex-col items-start justify-between font-mono text-[0.65rem] font-black text-indigo-400">
                {ORDER_TICKS.map((v, i) => <span key={i} className="leading-none">{v}</span>)}
              </div>
              <div className="absolute right-0 top-1/2 origin-center -translate-y-1/2 rotate-90 text-[0.6rem] font-black uppercase tracking-[0.5em] text-indigo-200">Volume</div>
            </div>
          </div>

          <div className="my-4 h-px bg-border" />

          {/* Month Stats Footer */}
          <div className="flex overflow-x-auto pl-20 pr-16 lg:pl-32">
            {MONTHLY_DATA.map((d, i) => (
              <div key={i} className="flex min-w-[80px] flex-1 flex-col items-center gap-3">
                <div className="w-full truncate px-1 text-center text-[0.65rem] font-black text-text">{d.month}</div>
                <div className="w-full space-y-1 px-1">
                  <div className="flex items-center justify-between rounded-[8px] bg-surface-alt px-2 py-1">
                    <span className="text-[0.5rem] font-bold uppercase text-text-muted">Cost</span>
                    <span className="text-[0.6rem] font-black text-text">₹{d.addCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[0.5rem] font-bold uppercase text-rose-300">RTO</span>
                    <span className="text-[0.6rem] font-black text-rose-500">{d.rto}%</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[0.5rem] font-bold uppercase text-amber-300">C.R.</span>
                    <span className="text-[0.6rem] font-black text-amber-500">{d.cr}%</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[0.5rem] font-bold uppercase text-emerald-300">Del</span>
                    <span className="text-[0.6rem] font-black text-emerald-500">{d.dlvry}%</span>
                  </div>
                  <div className={`mt-1 rounded-[10px] border py-1.5 text-center ${d.isLoss ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
                    <div className="text-[0.5rem] font-black uppercase">Net {d.isLoss ? 'Loss' : 'Gain'}</div>
                    <div className="text-[0.7rem] font-black">{Math.abs(d.netProfitPct).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center justify-center gap-2 rounded-[16px] border border-border bg-surface-alt px-4 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-muted">
          <FiBarChart2 size={14} />
          Hover over chart segments to view detailed metrics
        </div>
      </div>
    </AppShell>
  );
}
