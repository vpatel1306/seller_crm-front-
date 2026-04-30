import { FiTrendingDown, FiTrendingUp, FiActivity, FiTarget } from 'react-icons/fi';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function DashboardMetricsRow({ metrics = [], className = '', mode = 'all' }) {
  // Separate metrics into groups
  const averageMetrics = metrics.filter(m => m.label.includes('Avg'));
  const todayMetrics = metrics.filter(m => m.label.includes("Today's"));

  // Data for Radar (Averages)
  const radarData = averageMetrics.map(m => ({
    subject: m.label.replace('Avg.', '').trim(),
    value: parseFloat(String(m.value).replace(/[^0-9.]/g, '')) || 0,
    full: 100
  }));

  // Data for Bars (Today's Activity)
  const barData = todayMetrics.map(m => ({
    name: m.label.replace("Today's", '').trim(),
    value: parseFloat(String(m.value).replace(/[^0-9.]/g, '')) || 0,
    original: m.value
  }));

  return (
    <div className={`flex flex-col gap-3 h-full ${className}`.trim()}>

      {/* AVERAGES RADAR */}
      {(mode === 'all' || mode === 'radar') && (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-soft flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <FiTarget size={12} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 leading-none">Averages</span>
          </div>
          <div className="flex-1 min-h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} />
                <Radar
                  name="Averages"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TODAY'S PULSE BAR */}
      {(mode === 'all' || mode === 'pulse') && (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-soft flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <FiActivity size={12} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 leading-none">Today's Pulse</span>
          </div>
          <div className="flex-1 min-h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 15, right: 5, left: 5, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 900, fill: '#475569' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase' }}
                  formatter={(val, name, props) => [`${props.payload.original}`, '']}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} barSize={24}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {todayMetrics.map(m => (
              <div key={m.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-tight">{m.label.replace("Today's", '').trim()}</div>
                <div className="text-sm font-black text-slate-900">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
