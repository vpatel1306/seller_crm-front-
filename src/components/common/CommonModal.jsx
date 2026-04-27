import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import Button from '../ui/Button';

const sizeClasses = {
  sm: 'max-w-[440px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[860px]',
  xl: 'max-w-[1180px]',
  full: 'h-[90vh] max-w-[1400px]',
};

const headerStyleClasses = {
  default: 'border-b border-border bg-surface text-text',
  gradient: 'bg-gradient-to-r from-primary to-teal-600 text-white',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white',
  success: 'bg-gradient-to-r from-emerald-600 to-green-700 text-white',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
  dark: 'bg-gradient-to-r from-slate-900 to-slate-800 text-white',
};

export default function CommonModal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footerButtons = [],
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  headerStyle = 'default',
  showHeader = true,
  showFooter = true,
  customClass = '',
  onOpen = () => {},
  onAfterClose = () => {},
}) {
  useEffect(() => {
    if (!isOpen) {
      onAfterClose();
      return undefined;
    }

    const handleEsc = (event) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEsc);
    onOpen();

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [closeOnEsc, isOpen, onAfterClose, onClose, onOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1150] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[10px] border border-white/40 bg-surface shadow-[0_30px_80px_rgba(15,23,42,0.28)] animate-slide-up ${sizeClasses[size]} ${customClass}`}>
        {showHeader ? (
          <div className={`flex items-center justify-between gap-4 px-6 py-4 ${headerStyleClasses[headerStyle]}`}>
            <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
            {showCloseButton ? (
              <Button
                variant="ghost"
                size="icon"
                className="border border-black/5 bg-white/10 text-current hover:bg-black/10"
                onClick={onClose}
              >
                <FiX size={18} />
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
          {children}
        </div>

        {showFooter ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/80 bg-surface-alt px-5 py-4 sm:px-6">
            {footerButtons.length > 0 ? (
              footerButtons.map((button, index) => {
                const handleClick = () => {
                  button.onClick?.();
                  if (button.autoClose !== false) {
                    onClose();
                  }
                };

                return (
                  <Button
                    key={`${button.label}-${index}`}
                    variant={button.type || 'secondary'}
                    loading={button.loading}
                    disabled={button.disabled}
                    className={button.className || ''}
                    onClick={handleClick}
                  >
                    {button.label}
                  </Button>
                );
              })
            ) : (
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
