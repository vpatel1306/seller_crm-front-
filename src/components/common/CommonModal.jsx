import React, { useEffect } from 'react';

const CommonModal = ({
  isOpen,
  onClose,
  title,
  size = 'md', // sm, md, lg, xl, full
  children,
  footerButtons = [],
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  headerStyle = 'default', // default, gradient, danger, success, warning, dark
  showHeader = true,
  showFooter = true,
  customClass = '',
  onOpen = () => { },
  onAfterClose = () => { }
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      onOpen();
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
      if (!isOpen) {
        onAfterClose();
      }
    };
  }, [isOpen, closeOnEsc, onClose, onOpen, onAfterClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-[400px]',
    md: 'max-w-[500px]',
    lg: 'max-w-[800px]',
    xl: 'max-w-[1140px]',
    full: 'w-[95%] max-w-[1400px] h-[90vh]'
  };

  // Header style classes
  const headerStyleClasses = {
    default: 'bg-white text-gray-900',
    gradient: 'bg-gradient-to-r from-primary to-violet-600 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-700 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-700 text-white',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-700 text-white',
    dark: 'bg-gradient-to-r from-gray-800 to-gray-950 text-white'
  };

  const btnTypeClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20',
    info: 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/20',
    dark: 'bg-gray-800 text-white hover:bg-gray-900'
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1150] p-4 animate-fade-in" onClick={handleOverlayClick}>
      <div className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up w-full ${sizeClasses[size]} ${customClass}`}>
        {/* Header */}
        {showHeader && (
          <div className={`px-6 py-4 flex justify-between items-center ${headerStyleClasses[headerStyle]}`}>
            <h3 className="text-lg font-bold">{title}</h3>
            {showCloseButton && (
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 transition-colors text-2xl leading-none" onClick={onClose}>
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-wrap">
            {footerButtons.length > 0 ? (
              footerButtons.map((button, index) => {
                const {
                  label,
                  onClick,
                  type = 'secondary',
                  disabled = false,
                  loading = false,
                  className = ''
                } = button;

                const handleClick = () => {
                  if (onClick) onClick();
                  if (button.autoClose !== false) onClose();
                };

                return (
                  <button
                    key={index}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60 ${btnTypeClasses[type]} ${className}`}
                    onClick={handleClick}
                    disabled={disabled || loading}
                  >
                    {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {label}
                  </button>
                );
              })
            ) : (
              <button
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonModal;