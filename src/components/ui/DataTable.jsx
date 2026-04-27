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
  getRowId = (row) => row.id,
}) {
  const SortIcon = ({ k }) =>
    sortKey === k ? (
      sortDir === 'asc'
        ? <FiChevronUp size={10} className="ml-0.5 inline" />
        : <FiChevronDown size={10} className="ml-0.5 inline" />
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
    if (col.sticky === 'left') return 'sticky left-0 z-20';
    if (col.sticky === 'right') return 'sticky right-0 z-20';
    return '';
  };

  const getStickyCellClassName = (col, isSelected, index) => {
    if (!col.sticky) return '';

    const rowBg = isSelected ? 'bg-primary/10' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

    if (col.sticky === 'left') return `sticky left-0 z-10 ${rowBg}`;
    if (col.sticky === 'right') return `sticky right-0 z-10 ${rowBg}`;
    return '';
  };

  return (
    <div className={`flex-1 min-h-0 overflow-hidden bg-white ${wrapperClassName}`}>
      {loading ? (
        <div className="flex h-full min-h-[260px] items-center justify-center gap-2 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
          {loadingText}
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          {mobileCardView && (
            <div className="space-y-3 p-3 md:hidden">
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
                      className={`rounded-2xl border border-slate-200 p-4 ${
                        isSelected ? selectedClass : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                      }`}
                    >
                      {showIndex && (
                        <div className="mb-3 flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-[0.68rem] text-slate-400">Row</span>
                          <span className="text-sm font-semibold">{idx + 1}</span>
                        </div>
                      )}

                      {columns.map((col, cIdx) => (
                        <div key={cIdx} className="flex justify-between">
                          <span className="text-[0.68rem] text-slate-400">
                            {col.label}
                          </span>
                          <span className="text-sm">
                            {getCellContent(row, col, isSelected)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TABLE VIEW */}
          <div className={`${mobileCardView ? 'hidden md:block' : 'block'} h-full overflow-auto rounded-[inherit] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/80 [&::-webkit-scrollbar-track]:bg-slate-100`}>
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
                      className={`${headerCellClassName} ${
                        col.sortable !== false && col.key && onSort
                          ? 'cursor-pointer hover:bg-slate-200/80'
                          : ''
                      } ${col.right ? 'text-right' : 'text-left'} ${getResolvedHeaderClassName(col)} ${getStickyHeaderClassName(col)}`}
                    >
                      {col.label}
                      {col.sortable !== false && col.key && (
                        <SortIcon k={col.key} />
                      )}
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
                    const rowId = getRowId(row) ?? idx;
                    const isSelected = selectedId === rowId;

                    return (
                      <tr
                        key={rowId}
                        onClick={() => onRowClick && onRowClick(row)}
                        className={`border-b ${
                          isSelected
                            ? selectedClass
                            : idx % 2 === 0
                            ? `bg-white ${hoverClass}`
                            : `bg-slate-50/70 ${hoverClass}`
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
                            className={`${cellClassName} ${
                              col.right ? 'text-right' : ''
                            } ${getResolvedCellClassName(row, col, isSelected)} ${getStickyCellClassName(col, isSelected, idx)}`}
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
