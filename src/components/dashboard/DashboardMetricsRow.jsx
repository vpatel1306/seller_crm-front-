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

export default function DashboardMetricsRow({ metrics = [], className = '' }) {
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
    <div className={`grid w-full gap-4 lg:grid-cols-[1fr_1.5fr] rounded-default border border-slate-200 bg-white p-6 shadow-soft ${className}`.trim()}>
      
      {/* LEFT: AVERAGES RADAR */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-inner bg-indigo-50 text-indigo-600">
            <FiTarget size={16} />
          </div>
          <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Business Profile (Averages)</span>
        </div>
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} />
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

      {/* RIGHT: TODAY'S PULSE BAR */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-inner bg-emerald-50 text-emerald-600">
            <FiActivity size={16} />
          </div>
          <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Today's Performance Pulse</span>
        </div>
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '900' }}
                formatter={(val, name, props) => [`${props.payload.original}`, 'Value']}
              />

              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {todayMetrics.map(m => (
            <div key={m.label} className="text-center px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-[0.55rem] font-bold text-slate-400 uppercase truncate">{m.label.replace("Today's", '')}</div>
              <div className="text-sm font-black text-slate-900">{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
