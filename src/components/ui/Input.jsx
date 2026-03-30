export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 group">
      {label && <label className="text-sm font-semibold text-text group-focus-within:text-primary transition-colors">{label}</label>}
      <input
        className={`px-4 py-2.5 bg-white border rounded-inner text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 ${error ? 'border-error text-error placeholder:text-error/50' : 'border-border focus:border-primary text-text placeholder:text-text-muted'}`}
        {...props}
      />
      {error && <span className="text-xs text-error font-medium animate-fade-in">{error}</span>}
    </div>
  );
}
