export default function Button({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    outline: 'bg-transparent border border-primary/30 text-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    success: 'bg-success text-white hover:opacity-90 shadow-sm',
    warning: 'bg-warning text-white hover:opacity-90 shadow-sm',
    danger: 'bg-error text-white hover:opacity-90 shadow-sm',
    dark: 'bg-dark text-white hover:opacity-90 shadow-sm',
    create: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm',
    edit: 'bg-sky-100 text-sky-700 hover:bg-sky-200 border border-sky-200',
    delete: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    refresh: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
    cancel: 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50',
    save: 'bg-primary text-white hover:bg-primary-hover',
    view: 'bg-indigo-600 text-white hover:bg-indigo-700',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs font-semibold rounded-inner',
    md: 'h-10 px-4 text-sm font-semibold rounded-inner',
    lg: 'h-12 px-6 text-base font-bold rounded-default',
    icon: 'h-9 w-9 p-0 rounded-inner',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
