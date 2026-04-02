import React from 'react';

function ActionButton({ action, variant }) {
  const {
    label,
    icon: Icon,
    onClick,
    disabled = false,
    className = '',
    type = 'button',
  } = action;

  if (type === 'spacer') {
    return variant === 'classic' ? (
      <div className={`hidden border border-[#d4d4d4] bg-[#f8f8d8] xl:block ${className}`} />
    ) : (
      <div className={className} />
    );
  }

  const baseClassName =
    variant === 'light'
      ? 'flex items-center gap-1.5 rounded-xl px-3 py-2 text-[0.65rem] font-bold transition-all active:scale-95'
      : 'border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]';

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClassName} ${className}`}>
      <span className="inline-flex items-center justify-center gap-1">
        {Icon ? <Icon size={12} /> : null}
        {label}
      </span>
    </button>
  );
}

export default function OrdersActionBar({
  actions,
  variant = 'classic',
  wrapperClassName = '',
  innerClassName = '',
}) {
  const wrapperBaseClassName =
    variant === 'light'
      ? 'border-t border-slate-200 bg-white px-4 py-3 shrink-0'
      : 'border-t border-[#d5d5d5] bg-[#efefef] px-2 py-2';

  const innerBaseClassName =
    variant === 'light'
      ? 'flex items-center gap-2 flex-wrap'
      : 'grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4 xl:grid-cols-8';

  return (
    <div className={`${wrapperBaseClassName} ${wrapperClassName}`}>
      <div className={`${innerBaseClassName} ${innerClassName}`}>
        {actions.map((action) => (
          <ActionButton
            key={action.key || action.label}
            action={action}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}
