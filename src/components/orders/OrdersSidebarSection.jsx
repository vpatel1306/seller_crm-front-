export default function OrdersSidebarSection({
  title,
  subtitle,
  children,
  className = '',
  headerClassName = '',
}) {
  return (
    <aside className={`space-y-4 ${className}`}>
      {(title || subtitle) ? (
        <div className={`rounded-[22px] border border-border bg-white px-5 py-4 shadow-sm ${headerClassName}`}>
          {title ? <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-text">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm text-text-muted">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </aside>
  );
}
