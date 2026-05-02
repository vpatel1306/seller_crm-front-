import { FiTarget } from 'react-icons/fi';

export default function DashboardMetricsRow({ metrics = [], className = '', mode = 'all' }) {
  // Separate metrics into groups
  const averageMetrics = metrics.filter(m => m.label.includes('Avg'));

  return (
    <div className={`flex flex-col gap-3 h-full ${className}`.trim()}>

      {/* AVERAGES */}
      {(mode === 'all' || mode === 'radar') && (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-soft flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <FiTarget size={12} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 leading-none">Averages Overview</span>
          </div>
          <div className="flex flex-col gap-2">
            {averageMetrics.map(m => (
              <div key={m.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-tight">{m.label.replace('Avg.', '').trim()}</div>
                <div className="text-sm font-black text-slate-900">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
