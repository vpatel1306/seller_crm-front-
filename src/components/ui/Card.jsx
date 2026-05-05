export default function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  contentClassName = '',
  muted = false,
  noHeaderBorder = false,
}) {
  return (
    <section className={`${muted ? 'crm-panel-muted' : 'crm-panel'} ${className}`}>
      {(title || subtitle || action) ? (
        <div className={`flex flex-wrap items-start justify-between gap-3 px-5 py-2 sm:px-6 ${noHeaderBorder ? '' : 'border-b border-border/70'}`}>
          <div>
            {title ? <h3 className="text-lg font-extrabold tracking-tight text-text">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-text-muted">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={contentClassName || 'p-2 sm:p-4'}>{children}</div>
    </section>
  );
}
