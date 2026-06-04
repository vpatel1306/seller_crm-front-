import React, { useState } from 'react';
import { FiList, FiBarChart2 } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

function getCourierIconUrl(name) {
  const normalized = String(name || '').toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('delhivery')) return '/couriers/delhivery.png';
  if (normalized.includes('pocketship')) return '/couriers/pocketship.png';
  if (normalized.includes('shadowfax') || normalized.includes('shadowfx')) return '/couriers/shadowfx.png';
  if (normalized.includes('valmo')) return '/couriers/valmo.png';
  if (normalized.includes('xpressbees') || normalized.includes('xpresbees')) return '/couriers/xpresbees.png';
  return null;
}

export default function SummaryTable({
  title,
  rows = [],
  cols = [],
  hoverClass = 'hover:bg-gray-700',
  containerClassName = '',
  titleClassName = 'bg-gray-800 text-gray-300 text-[0.6rem] font-bold uppercase tracking-wider px-2 py-1',
  tableClassName = 'w-full text-[0.62rem]',
  headRowClassName = 'bg-gray-700 text-gray-300',
  headerCellClassName = 'px-1.5 py-1 text-left font-semibold whitespace-nowrap',
  rowClassName,
  cellClassName = 'px-1.5 py-1 whitespace-nowrap',
  bodyWrapperClassName = ''
}) {
  const [viewMode, setViewMode] = useState('chart'); // 'table' | 'chart'

  // Auto-detect chart keys
  const nameKey = cols[0]?.key;
  const valueKey = cols.find(c => ['count', 'pickup', 'total_orders', 'qty', 'orders'].includes(c.key))?.key || cols[1]?.key;

  const isCourierSummary = String(title || '').toLowerCase().includes('courier');

  // Prepare chart data (ensure values are numeric)
  const chartData = (rows || []).map(r => ({
    name: String(r[nameKey] || '').trim() || 'Unknown',
    value: Number(r[valueKey]) || 0
  }));

  const hasChartData = chartData.some(d => d.value > 0);

  return (
    <div className={`mb-3 flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm ${containerClassName}`}>
      
      {/* Header section with toggle */}
      <div className={`flex items-center justify-between border-b border-slate-100 ${titleClassName}`}>
        <span>{title}</span>
        {hasChartData && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('chart')}
              className={`p-1 rounded transition-colors ${viewMode === 'chart' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-500'}`}
              title="Chart View"
            >
              <FiBarChart2 size={13} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded transition-colors ${viewMode === 'table' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-500'}`}
              title="Table View"
            >
              <FiList size={13} />
            </button>
          </div>
        )}
      </div>

      {viewMode === 'table' || !hasChartData ? (
        <div
          className={`max-w-full overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent ${bodyWrapperClassName}`}
        >
          <table className={`${tableClassName} min-w-full`}>
            <thead>
              <tr className={headRowClassName}>
                {cols.map((c) => (
                  <th key={c.key} className={headerCellClassName}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-100 cursor-pointer transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'
                  } ${hoverClass} ${typeof rowClassName === 'function' ? rowClassName(row, i) : rowClassName || ''}`}
                >
                  {cols.map((c) => {
                    const isCourier = 
                      c.key === 'courier' || 
                      c.key === 'courier_partner' || 
                      (c.key === 'label' && String(c.label || '').toLowerCase().includes('courier'));
                    
                    const cellVal = row[c.key];

                    return (
                      <td
                        key={c.key}
                        className={`${cellClassName}
                          ${c.right ? 'text-right' : ''}
                          ${c.color ? c.color(row) : 'text-slate-600'}`}
                      >
                        {isCourier && cellVal ? (
                          <div className="flex items-center gap-2">
                            {getCourierIconUrl(cellVal) ? (
                              <img
                                src={getCourierIconUrl(cellVal)}
                                alt={cellVal}
                                className="h-5 w-5 rounded object-contain bg-slate-50 border border-slate-200/60 p-0.5 flex-shrink-0 shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="truncate">{cellVal}</span>
                          </div>
                        ) : (
                          cellVal
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-3 bg-white flex flex-col justify-center items-center h-48 animate-fade-in">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                interval={isCourierSummary ? 0 : 'preserveEnd'}
                tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 8)}..` : val}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                labelStyle={{ fontWeight: 'bold' }}
                formatter={(value) => [`${value} orders`, 'Count']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {chartData.map((entry, index) => {
                  const lowerName = entry.name.toLowerCase();
                  let barColor = '#3b82f6'; // Default primary blue
                  
                  if (lowerName.includes('deliver')) {
                    barColor = '#10b981'; // Emerald green
                  } else if (lowerName.includes('cancel') || lowerName.includes('rto')) {
                    barColor = '#ef4444'; // Red
                  } else if (lowerName.includes('pending') || lowerName.includes('transit')) {
                    barColor = '#f59e0b'; // Amber
                  }
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={barColor} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
