import React from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function DataTable({
  columns,
  data,
  loading,
  loadingText = 'Loading data...',
  emptyText = 'No data found.',
  selectedId,
  onRowClick,
  onRowDoubleClick,
  sortKey,
  sortDir,
  onSort,
  showIndex = true,
  mobileCardView = true,
  selectedClass = 'bg-indigo-50 text-slate-900',
  hoverClass = 'hover:bg-slate-50',
  wrapperClassName = '',
  tableClassName = '',
  headClassName = 'sticky top-0 z-10 bg-slate-100/95 text-slate-700 backdrop-blur',
  headerCellClassName = 'px-3 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] whitespace-nowrap select-none transition-colors border-b border-slate-200',
  indexHeaderClassName = 'w-10 border-b border-slate-200 px-3 py-3 text-center text-[0.68rem] font-semibold',
  rowClassName,
  indexCellClassName = 'px-3 py-3 text-center font-medium text-slate-500',
  cellClassName = 'px-3 py-3 whitespace-nowrap text-slate-700',
  emptyCellClassName = 'py-20 text-center text-slate-500 italic text-sm',
}) {
  const SortIcon = ({ k }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <FiChevronUp size={10} className="ml-0.5 inline" /> : <FiChevronDown size={10} className="ml-0.5 inline" />
    ) : null;

  const getCellContent = (row, col, isSelected) => (col.render ? col.render(row, isSelected) : row[col.key] || '-');

  const getResolvedCellClassName = (row, col, isSelected) =>
    col.className ? (typeof col.className === 'function' ? col.className(row, isSelected) : col.className) : '';

  return (
    <div className={`flex-1 min-h-0 overflow-auto bg-white ${wrapperClassName}`}>
      {loading ? (
        <div className="flex h-full min-h-[260px] items-center justify-center gap-2 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
          {loadingText}
        </div>
      ) : (
        <>
          {mobileCardView ? (
          <div className="space-y-3 p-3 md:hidden">
            {data.length === 0 ? (
              <div className={emptyCellClassName}>{emptyText}</div>
            ) : (
              data.map((row, idx) => {
                const isSelected = selectedId === row.id;
                const resolvedRowClassName =
                  typeof rowClassName === 'function' ? rowClassName(row, idx, isSelected) : rowClassName || '';

                return (
                  <div
                    key={row.id || idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
                    className={`rounded-2xl border border-slate-200 p-4 transition-colors ${
                      isSelected ? selectedClass : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    } ${resolvedRowClassName}`}
                  >
                    {showIndex && (
                      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Row</span>
                        <span className="text-sm font-semibold text-slate-600">{idx + 1}</span>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {columns.map((col, cIdx) => (
                        <div key={cIdx} className="flex items-start justify-between gap-3">
                          <span className="min-w-0 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {col.label}
                          </span>
                          <span
                            className={`min-w-0 text-right text-sm font-medium text-slate-700 ${getResolvedCellClassName(
                              row,
                              col,
                              isSelected
                            )}`}
                          >
                            {getCellContent(row, col, isSelected)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          ) : null}

          <div className={`${mobileCardView ? 'hidden md:block' : 'block'} overflow-x-auto`}>
            <table className={`w-full min-w-[900px] border-collapse text-left text-[0.78rem] ${tableClassName}`}>
              <thead className={headClassName}>
                <tr>
                  {showIndex && <th className={indexHeaderClassName}>#</th>}
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      onClick={() => col.sortable !== false && onSort && col.key && onSort(col.key)}
                      className={`${headerCellClassName} ${
                        col.sortable !== false && col.key && onSort ? 'cursor-pointer hover:bg-slate-200/80' : ''
                      } ${col.right ? 'text-right' : 'text-left'}`}
                    >
                      {col.label}
                      {col.sortable !== false && col.key && <SortIcon k={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (showIndex ? 1 : 0)} className={emptyCellClassName}>
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => {
                    const isSelected = selectedId === row.id;
                    const resolvedRowClassName =
                      typeof rowClassName === 'function' ? rowClassName(row, idx, isSelected) : rowClassName || '';

                    return (
                      <tr
                        key={row.id || idx}
                        onClick={() => onRowClick && onRowClick(row)}
                        onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
                        className={`cursor-pointer border-b border-slate-200 transition-colors ${
                          isSelected
                            ? selectedClass
                            : idx % 2 === 0
                            ? `bg-white ${hoverClass}`
                            : `bg-slate-50/70 ${hoverClass}`
                        } ${resolvedRowClassName}`}
                      >
                        {showIndex && <td className={indexCellClassName}>{idx + 1}</td>}
                        {columns.map((col, cIdx) => (
                          <td
                            key={cIdx}
                            className={`${cellClassName} ${col.right ? 'text-right' : ''} ${getResolvedCellClassName(
                              row,
                              col,
                              isSelected
                            )}`}
                          >
                            {getCellContent(row, col, isSelected)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
