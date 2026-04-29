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
  selectedClass = 'bg-primary/5 text-primary font-semibold',
  hoverClass = 'hover:bg-slate-50/80',
  wrapperClassName = '',
  tableClassName = '',
  headClassName = 'sticky top-0 z-10 bg-slate-50/95 border-b border-slate-200 backdrop-blur',
  headerCellClassName = 'px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 transition-colors',
  indexHeaderClassName = 'w-12 border-b border-slate-200 px-4 py-3.5 text-center text-[0.7rem] font-bold text-slate-400',
  rowClassName,
  indexCellClassName = 'px-4 py-4 text-center text-xs font-medium text-slate-400',
  cellClassName = 'px-4 py-4 text-sm text-slate-600 border-b border-slate-100',
  emptyCellClassName = 'py-24 text-center text-slate-400 font-medium text-sm',
  getRowId = (row) => row.id,
}) {
  const SortIcon = ({ k }) =>
    sortKey === k ? (
      sortDir === 'asc'
        ? <FiChevronUp size={12} className="ml-1 inline text-primary font-bold" />
        : <FiChevronDown size={12} className="ml-1 inline text-primary font-bold" />
    ) : null;

  const getCellContent = (row, col, isSelected) =>
    col.render ? col.render(row, isSelected) : row[col.key] || '-';

  const getResolvedCellClassName = (row, col, isSelected) =>
    col.className
      ? typeof col.className === 'function'
        ? col.className(row, isSelected)
        : col.className
      : '';

  const getResolvedHeaderClassName = (col) =>
    col.headerClassName
      ? typeof col.headerClassName === 'function'
        ? col.headerClassName(col)
        : col.headerClassName
      : col.className && typeof col.className !== 'function'
        ? col.className
        : '';

  const getStickyHeaderClassName = (col) => {
    if (col.sticky === 'left') return 'sticky left-0 z-20 bg-inherit';
    if (col.sticky === 'right') return 'sticky right-0 z-20 bg-inherit';
    return '';
  };

  const getStickyCellClassName = (col, isSelected, index) => {
    if (!col.sticky) return '';

    const rowBg = isSelected ? 'bg-primary/5' : 'bg-white';

    if (col.sticky === 'left') return `sticky left-0 z-10 ${rowBg}`;
    if (col.sticky === 'right') return `sticky right-0 z-10 ${rowBg}`;
    return '';
  };

  return (
    <div className={`flex-1 min-h-0 overflow-hidden bg-white crm-table-container ${wrapperClassName}`}>
      {loading ? (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-sm text-slate-400">
          <svg className="h-8 w-8 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          {mobileCardView && (
            <div className="space-y-4 p-4 md:hidden">
              {data.length === 0 ? (
                <div className={emptyCellClassName}>{emptyText}</div>
              ) : (
                data.map((row, idx) => {
                  const rowId = getRowId(row) ?? idx;
                  const isSelected = selectedId === rowId;

                  return (
                    <div
                      key={rowId}
                      onClick={() => onRowClick && onRowClick(row)}
                      onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
                      className={`rounded-xl border border-slate-100 p-5 shadow-sm transition-all ${isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'bg-white active:bg-slate-50'
                        }`}
                    >
                      {showIndex && (
                        <div className="mb-4 flex items-center justify-between opacity-60">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider">Record #{idx + 1}</span>
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {columns.map((col, cIdx) => (
                          <div key={cIdx} className="flex items-center justify-between gap-4">
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                              {col.label}
                            </span>
                            <span className="text-sm font-medium text-slate-700 text-right">
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
          )}

          {/* TABLE VIEW */}
          <div className={`${mobileCardView ? 'hidden md:block' : 'block'} h-full overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent`}>
            <table className={`w-full border-collapse ${tableClassName}`}>
              <thead className={headClassName}>
                <tr>
                  {showIndex && <th className={indexHeaderClassName}>#</th>}

                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      onClick={() =>
                        col.sortable !== false &&
                        onSort &&
                        col.key &&
                        onSort(col.key)
                      }
                      className={`${headerCellClassName} ${col.sortable !== false && col.key && onSort
                          ? 'cursor-pointer hover:bg-slate-100/50 hover:text-primary'
                          : ''
                        } ${col.right ? 'text-right' : 'text-left'} ${getResolvedHeaderClassName(col)} ${getStickyHeaderClassName(col)}`}
                    >
                      <span>{col.label}</span>
                      {col.sortable !== false && col.key && (
                        <SortIcon k={col.key} />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (showIndex ? 1 : 0)} className={emptyCellClassName}>
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => {
                    const rowId = getRowId(row) ?? idx;
                    const isSelected = selectedId === rowId;

                    return (
                      <tr
                        key={rowId}
                        onClick={() => onRowClick && onRowClick(row)}
                        className={`group transition-colors ${isSelected
                            ? selectedClass
                            : `bg-white ${hoverClass}`
                          }`}
                      >
                        {showIndex && (
                          <td className={indexCellClassName}>
                            {idx + 1}
                          </td>
                        )}

                        {columns.map((col, cIdx) => (
                          <td
                            key={cIdx}
                            className={`${cellClassName} ${col.right ? 'text-right' : ''
                              } ${getResolvedCellClassName(row, col, isSelected)} ${getStickyCellClassName(col, isSelected, idx)}`}
                          >
                            <div className={col.right ? 'flex justify-end' : ''}>
                              {getCellContent(row, col, isSelected)}
                            </div>
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
