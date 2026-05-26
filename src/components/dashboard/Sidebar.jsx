import { FiTrendingUp, FiPieChart } from 'react-icons/fi';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';

export default function Sidebar({ accountDetails = null, navigate }) {
  navigate = useNavigate();

  const accountStatus = accountDetails || {};
  const netProfit = Number(accountStatus.net_profit) || 0;
  const netProfitPct = Number(accountStatus.net_profit_percentage) || 0;
  const lossBreakdown = accountStatus.loss_breakdown || {};

  const lossRows = [
    { l: 'Returned Orders Loss', v: accountStatus.customer_return_charge_pending, c: lossBreakdown.customer_return_pending?.count ?? 0 },
    { l: 'Advertising Cost (Ads)', v: accountStatus.advertisement, c: lossBreakdown.advertisement?.count ?? 0 },
    { l: 'RTO Packaging Damage Loss', v: accountStatus.rto_packaging_loss, c: lossBreakdown.rto_packaging_loss?.count ?? 0 },
    { l: 'Payment Mismatch Loss', v: accountStatus.payment_loss, c: lossBreakdown.payment_loss?.count ?? 0 },
    { l: 'Damaged / Wrong Return Loss', v: accountStatus.wrong_damage_missing_returns, c: lossBreakdown.wrong_damage_missing_returns?.count ?? 0 },
    { l: 'Unreturned Items Loss', v: accountStatus.return_not_received_loss, c: lossBreakdown.return_not_received_loss?.count ?? 0 },
  ].map(r => ({...r,  v: Number(r.v) || 0 })).sort((a, b) => b.v - a.v); 

  const alerts = [
    { l: 'Payment Issues', c: lossBreakdown.payment_loss?.count ?? 0, color: 'text-amber-600' },
    { l: 'Missing Returns', c: lossBreakdown.return_not_received_loss?.count ?? 0, color: 'text-rose-600' },
  ].filter(a => a.c > 10);

  const fmtAmt = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <Card
      title="Profit & Loss Summary"
      subtitle="Comprehensive view of earnings and leakages"
      icon={FiPieChart}
      iconColor="text-emerald-600 bg-emerald-50/80 border-emerald-100"
      className="h-full flex flex-col"
      contentClassName="p-3 bg-gradient-to-b from-white via-white to-slate-50/80 flex-1 flex flex-col"
    >
      <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3 shadow-inner flex-1 flex flex-col">
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Profit Margin (%)</div>
              <div className="mt-0.5 text-2xl font-black text-emerald-600">{netProfitPct}%</div>
            </div>
            <div className="h-12 w-12">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="60%" 
                  outerRadius="100%" 
                  barSize={10} 
                  data={[{ name: 'Profit', value: netProfitPct || 0, fill: '#10b981' }]} 
                  startAngle={90} 
                  endAngle={90 + (3.6 * (netProfitPct || 0))}
                >
                  <RadialBar 
                     background={{ fill: '#f1f5f9' }} 
                     dataKey="value" 
                     cornerRadius={10} 
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="h-px bg-gray-200/50" />

          {/* KEY METRICS SECTION */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white p-2 shadow-sm border border-slate-100">
              <div className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-tight">Money Received in Bank</div>
              <div className="text-xs font-black text-slate-900">₹{fmtAmt(accountStatus.total_settlement)}</div>
            </div>
            <div className="rounded-lg bg-white p-2 shadow-sm border border-slate-100">
              <div className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-tight">Total Money Lost</div>
              <div className="text-xs font-black text-rose-600">₹{fmtAmt(accountStatus.total_losses)}</div>
            </div>
          </div>

          <div className="h-px bg-gray-200/50" />

          {/* LOSS BREAKDOWN */}
          <div>
            <div className="mb-1.5 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Where Did You Lose Money?</div>

            <div className="mt-1 space-y-1.5">
              {lossRows.slice(0, 6).map((row, idx) => (
                <div key={row.l} className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${idx === 0 ? 'bg-rose-500' : 'bg-rose-300'}`} />
                    <span className="truncate">{row.l}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-slate-300">({row.c})</span>
                    <span className="text-rose-500 font-black">₹{fmtAmt(row.v)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-200/50 mt-auto" />
          
          <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-2">
            <div>
              <h5 className="text-[0.65rem] font-black uppercase tracking-wider text-green-700">Your Net Profit (Earnings)</h5>
              <h5 className="mt-0.5 text-lg font-black leading-none text-green-800">₹{fmtAmt(netProfit)}</h5>
            </div>

            <div className="h-6 w-6 rounded-full bg-green-200/50 flex items-center justify-center">
              <FiTrendingUp className="text-green-700" size={14} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate('/sku-list')}>
            <h5 className="text-[0.75rem] font-bold text-slate-700 uppercase tracking-tight">Product SKU Details</h5>
            <h6 className="mt-1 text-xs font-black text-slate-900">
              Total SKUs: {accountStatus.total_sku} | Missing Price: {accountStatus.without_cost_sku}
            </h6>
            <span className="text-[0.6rem] font-bold text-primary mt-0.5">Click here to manage products & costs</span>
          </div>
        </div>
    </Card>
  );
}
