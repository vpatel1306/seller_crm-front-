import React, { useEffect } from 'react';
import '../../styles/CommanModal.css';
 
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
  onOpen = () => {},
  onAfterClose = () => {}
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
    sm: 'common-modal-sm',
    md: 'common-modal-md',
    lg: 'common-modal-lg',
    xl: 'common-modal-xl',
    full: 'common-modal-full'
  };
 
  // Header style classes
  const headerStyleClasses = {
    default: 'common-modal-header-default',
    gradient: 'common-modal-header-gradient',
    danger: 'common-modal-header-danger',
    success: 'common-modal-header-success',
    warning: 'common-modal-header-warning',
    dark: 'common-modal-header-dark'
  };
 
  return (
    <div className="common-modal-overlay" onClick={handleOverlayClick}>
      <div className={`common-modal-container ${sizeClasses[size]} ${customClass}`}>
        {/* Header */}
        {showHeader && (
          <div className={`common-modal-header ${headerStyleClasses[headerStyle]}`}>
            <h3 className="common-modal-title">{title}</h3>
            {showCloseButton && (
              <button className="common-modal-close" onClick={onClose}>
                ×
              </button>
            )}
          </div>
        )}
 
        {/* Body */}
        <div className="common-modal-body">
          {children}
        </div>
 
        {/* Footer */}
        {showFooter && footerButtons.length > 0 && (
          <div className="common-modal-footer">
            {footerButtons.map((button, index) => {
              const {
                label,
                onClick,
                type = 'secondary',
                disabled = false,
                loading = false,
                className = ''
              } = button;
 
              const handleClick = () => {
                if (onClick) {
                  onClick();
                }
                if (button.autoClose !== false) {
                  onClose();
                }
              };
 
              const btnClass = `common-modal-btn common-modal-btn-${type} ${className} ${loading ? 'loading' : ''}`;
 
              return (
                <button
                  key={index}
                  className={btnClass}
                  onClick={handleClick}
                  disabled={disabled || loading}
                >
                  {loading && <span className="common-modal-spinner"></span>}
                  {label}
                </button>
              );
            })}
          </div>
        )}
 
        {/* Footer with default close button if no buttons provided */}
        {showFooter && footerButtons.length === 0 && (
          <div className="common-modal-footer">
            <button className="common-modal-btn common-modal-btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonModal;