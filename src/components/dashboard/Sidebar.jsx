import { FiTrendingUp } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';

export default function Sidebar({ accountDetails = null }) {
  const accountStatus = accountDetails || {};
  const netProfit = Number(accountStatus.net_profit) || 0;
  const netProfitPct = Number(accountStatus.net_profit_percentage) || 0;
  const lossBreakdown = accountStatus.loss_breakdown || {};

  const lossRows = [
    { l: 'Wrong / Damage / Missing Returns', v: accountStatus.wrong_damage_missing_returns, c: lossBreakdown.wrong_damage_missing_returns?.count ?? 0 },
    { l: 'Return Not Received Loss', v: accountStatus.return_not_received_loss, c: lossBreakdown.return_not_received_loss?.count ?? 0 },
    { l: 'Payment Loss', v: accountStatus.payment_loss, c: lossBreakdown.payment_loss?.count ?? 0 },
    { l: 'RTO Packaging Loss', v: accountStatus.rto_packaging_loss, c: lossBreakdown.rto_packaging_loss?.count ?? 0 },
    { l: 'Customer Return Pending', v: accountStatus.customer_return_charge_pending, c: lossBreakdown.customer_return_pending?.count ?? 0 },
  ];

  const fmtAmt = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-full">
      <div className="bg-gradient-to-b from-white via-white to-slate-50/80 p-3 flex-1 flex flex-col">
        <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3 shadow-inner flex-1 flex flex-col">
          <span className="block border-b border-gray-100 pb-1.5 text-xs font-bold uppercase tracking-widest text-gray-900">Account Analysis</span>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Net Profit Margin</div>
              <div className="mt-0.5 text-2xl font-black text-emerald-600">{netProfitPct}%</div>
            </div>
            <div className="h-12 w-12">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="60%" 
                  outerRadius="100%" 
                  data={[{ name: 'Profit', value: netProfitPct, fill: '#10b981' }]} 
                  startAngle={90} 
                  endAngle={90 + (3.6 * netProfitPct)}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="h-px bg-gray-200/50" />

          <div>
            <div className="mb-1.5 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Loss Breakdown</div>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={lossRows.filter(r => (Number(r.v) || 0) > 0)}
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="l" 
                    type="category" 
                    hide
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(15, 23, 42, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg bg-slate-900/95 backdrop-blur-md px-3 py-2 text-[0.65rem] font-bold text-white shadow-2xl border border-white/10">
                            <div className="mb-1 opacity-50 uppercase tracking-widest">{payload[0].payload.l}</div>
                            <div className="text-sm font-black text-white">₹{fmtAmt(payload[0].value)}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={8}>
                    {lossRows.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#fb7185'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 space-y-1">
              {lossRows.slice(0, 3).map((row, idx) => (
                <div key={row.l} className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                  <div className="flex items-center gap-1 overflow-hidden">
                    <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${idx === 0 ? 'bg-rose-500' : 'bg-rose-300'}`} />
                    <span className="truncate">{row.l}</span>
                  </div>
                  <span className="shrink-0 text-rose-500">₹{fmtAmt(row.v)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-200/50" />
          
          <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-2">
            <div>
              <h5 className="text-[0.65rem] font-black uppercase tracking-wider text-green-700">Net Profits</h5>
              <h5 className="mt-0.5 text-lg font-black leading-none text-green-800">₹{fmtAmt(netProfit)}</h5>
            </div>
            <div className="h-6 w-6 rounded-full bg-green-200/50 flex items-center justify-center">
              <FiTrendingUp className="text-green-700" size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
