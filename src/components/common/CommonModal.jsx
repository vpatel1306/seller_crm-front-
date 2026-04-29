import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import Button from '../ui/Button';

const sizeClasses = {
  sm: 'max-w-[480px]',
  md: 'max-w-[640px]',
  lg: 'max-w-[900px]',
  xl: 'max-w-[1240px]',
  full: 'h-[92vh] max-w-[1540px]',
};

const headerStyleClasses = {
  default: 'border-b border-slate-100 bg-white text-slate-900',
  gradient: 'bg-primary text-white',
  danger: 'bg-error text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  dark: 'bg-dark text-white',
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
  onOpen = () => { },
  onAfterClose = () => { },
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
      className="fixed inset-0 z-[1150] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-default bg-surface shadow-card animate-slide-up ${sizeClasses[size]} ${customClass}`}>
        {showHeader ? (
          <div className={`flex items-center justify-between gap-4 px-6 py-5 ${headerStyleClasses[headerStyle]}`}>
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            {showCloseButton ? (
              <button
                className="group flex h-10 w-10 items-center justify-center rounded-inner transition-colors hover:bg-black/5"
                onClick={onClose}
              >
                <FiX size={20} className="opacity-60 group-hover:opacity-100" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
          {children}
        </div>

        {showFooter ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5">
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
