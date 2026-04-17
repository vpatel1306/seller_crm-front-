import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

export default function DashboardMetricsRow({ metrics = [] }) {
  return (
    <div className="grid w-full gap-3 rounded-[28px] border border-slate-800 bg-slate-950 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
      {metrics.map((item) => (
        <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-4 text-center">
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
          <div className={`mt-3 inline-flex items-center gap-2 text-lg font-black ${item.positive ? 'text-emerald-400' : item.negative ? 'text-rose-400' : 'text-slate-200'}`}>
            {item.positive ? <FiTrendingUp size={16} /> : null}
            {item.negative ? <FiTrendingDown size={16} /> : null}
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
