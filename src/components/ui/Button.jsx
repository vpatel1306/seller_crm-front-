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
    primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover',
    secondary: 'border border-border bg-white text-text hover:bg-surface-alt',
    outline: 'border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10',
    ghost: 'bg-transparent text-text hover:bg-slate-900/5',
    success: 'bg-success text-white shadow-lg shadow-success/20 hover:bg-green-700',
    warning: 'bg-accent text-white shadow-lg shadow-accent/20 hover:bg-amber-700',
    danger: 'bg-error text-white shadow-lg shadow-error/20 hover:bg-red-700',
    info: 'bg-sky-600 text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700',
    dark: 'bg-dark text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800',
  };

  const sizes = {
    sm: 'h-8 rounded-[12px] px-3.5 text-xs font-bold tracking-[0.2em]',
    md: 'h-10 rounded-[14px] px-4 text-sm font-bold',
    lg: 'h-11 rounded-[16px] px-5 text-sm font-extrabold tracking-[0.16em]',
    icon: 'h-10 w-10 rounded-[14px] p-0',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
      {children}
    </button>
  );
}
