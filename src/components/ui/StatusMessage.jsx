import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const STYLE_MAP = {
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: FiCheckCircle,
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-600',
    icon: FiXCircle,
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: FiAlertCircle,
  },
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-700',
    icon: FiInfo,
  },
};

export default function StatusMessage({ type = 'info', message, className = '' }) {
  if (!message) return null;

  const config = STYLE_MAP[type] || STYLE_MAP.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${config.wrapper} ${className}`} role="alert">
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
