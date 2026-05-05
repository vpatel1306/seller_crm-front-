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
      {label ? (
        <label className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500 ml-1">
          {label}
        </label>
      ) : null}
      <Component
        className={`w-full rounded-inner border bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 ${error ? 'border-error bg-red-50/50' : 'border-slate-200'} ${inputClassName}`}
        {...props}
      />
      {error ? <span className="ml-1 text-[0.65rem] font-bold text-error">{error}</span> : null}
      {!error && hint ? <span className="ml-1 text-[0.65rem] font-medium text-slate-400">{hint}</span> : null}
    </div>
  );
}
