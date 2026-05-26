export default function Card({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-slate-600 bg-slate-50 border-slate-100',
  action,
  children,
  className = '',
  contentClassName = '',
  muted = false,
  noHeaderBorder = false,
}) {
  return (
    <section className={`crm-panel flex flex-col group ${muted ? 'crm-panel-muted' : ''} ${className}`}>
      
      {(title || subtitle || action) ? (
        <div className={`flex flex-wrap items-center justify-between gap-3 px-3 py-3  ${noHeaderBorder ? '' : 'border-b border-slate-100'}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${iconColor}`}>
                <Icon size={18} />
              </div>
            )}
            <div>
              {title ? <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 leading-tight transition-colors group-hover:text-slate-950">{title}</h3> : null}
              {subtitle ? <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider leading-none">{subtitle}</p> : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={contentClassName || 'p-2 sm:p-4'}>{children}</div>
    </section>
  );
}
