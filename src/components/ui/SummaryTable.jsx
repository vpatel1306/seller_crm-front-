import React from 'react';

export default function SummaryTable({
  title,
  rows,
  cols,
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
  return (
    <div className={`mb-2 flex min-h-0 flex-col ${containerClassName}`}>
      <div className={titleClassName}>
        {title}
      </div>
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
                className={`border-b border-gray-700 cursor-pointer transition-colors ${
                  i % 2 === 0 ? 'bg-gray-800' : 'bg-[#111827]'
                } ${hoverClass} ${typeof rowClassName === 'function' ? rowClassName(row, i) : rowClassName || ''}`}
              >
                {cols.map((c) => (
                  <td
                    key={c.key}
                    className={`${cellClassName}
                      ${c.right ? 'text-right' : ''}
                      ${c.color ? c.color(row) : 'text-gray-300'}`}
                  >
                    {row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
