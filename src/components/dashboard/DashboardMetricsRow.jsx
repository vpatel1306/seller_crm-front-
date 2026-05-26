import { FiTarget } from 'react-icons/fi';
import Card from '../ui/Card';

export default function DashboardMetricsRow({ metrics = [], className = '', mode = 'all' }) {
  return (
    <div className={`flex flex-col gap-3 h-full ${className}`.trim()}>

      {/* AVERAGES */}
      {(mode === 'all' || mode === 'radar') && (
        <Card
          title="Average Performance"
          subtitle="Key historical operational averages"
          icon={FiTarget}
          iconColor="text-violet-600 bg-violet-50/80 border-violet-100"
          className="h-full flex flex-col"
          contentClassName="p-3.5 flex-1"
        >
          <div className="flex flex-col gap-2">
            {metrics.map(m => (
              <div key={m.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-tight">{m.label}</div>
                <div className="text-sm font-black text-slate-900">{m.value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
