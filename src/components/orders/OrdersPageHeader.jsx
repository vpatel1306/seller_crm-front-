import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';

export default function OrdersPageHeader({
  breadcrumbs = [],
  actions,
}) {
  return (
    <section className="mb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-slate-400">
          {breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <FiChevronRight size={12} className="text-slate-300" />}
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className={`transition hover:text-primary ${crumb.current ? 'text-slate-900 font-black' : ''}`}
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={crumb.current ? 'text-slate-900 font-black' : ''}>{crumb.label}</span>
              )}
            </div>
          ))}
        </div>

        {actions ? <div className="flex flex-wrap items-center justify-end gap-2.5">{actions}</div> : null}
      </div>
    </section>
  );
}
