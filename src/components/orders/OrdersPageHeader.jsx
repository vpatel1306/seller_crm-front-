import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';

export default function OrdersPageHeader({
  breadcrumbs = [],
  actions,
}) {
  return (
    <section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between align-center">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center text-[13px] gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text-muted">
            {breadcrumbs.map((crumb, index) => (
              <div key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
                {index > 0 ? <FiChevronRight size={13} className="text-text-muted/70" /> : null}
                {crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className={`transition hover:text-text ${crumb.current ? 'text-text' : ''}`}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={crumb.current ? 'text-text' : ''}>{crumb.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {actions ? <div className="flex flex-wrap items-center justify-end gap-2.5">{actions}</div> : null}
      </div>
    </section>
  );
}
