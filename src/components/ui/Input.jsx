export default function Input({
  as = 'input',
  label,
  error,
  hint,
  containerClassName = '',
  inputClassName = '',
  ...props
}) {
  const Component = as;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label ? <label className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">{label}</label> : null}
      <Component
        className={`w-full rounded-[16px] border bg-white px-4 py-3 text-sm text-text outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10 ${error ? 'border-error bg-red-50/70' : 'border-border'} ${inputClassName}`}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-error">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
    </div>
  );
}
