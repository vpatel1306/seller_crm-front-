export default function Button({ children, loading, variant = 'primary', ...props }) {
  const styles = {
    primary: '!bg-primary text-white hover:!bg-primary-hover shadow-sm hover:shadow-md active:scale-[0.98]',
    outline: 'bg-transparent text-primary border border-primary hover:!bg-primary/5 active:scale-[0.98]'
  };

  return (
    <button
      className={`px-5 py-2.5 rounded-default text-sm font-semibold transition-all duration-200 outline-none inline-flex items-center justify-center gap-2 ${styles[variant]} ${props.className || ''} disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:ring-2 focus:ring-primary/40`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
}
