import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

let listeners = [];

export const toast = {
  success: (message) => listeners.forEach((l) => l('success', message)),
  error: (message) => listeners.forEach((l) => l('error', message)),
  info: (message) => listeners.forEach((l) => l('info', message)),
  warning: (message) => listeners.forEach((l) => l('warning', message)),
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_TYPES = {
  success: {
    icon: <FiCheckCircle className="text-emerald-500" size={20} />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-900'
  },
  error: {
    icon: <FiXCircle className="text-rose-500" size={20} />,
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    text: 'text-rose-900'
  },
  info: {
    icon: <FiInfo className="text-blue-500" size={20} />,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-900'
  },
  warning: {
    icon: <FiAlertCircle className="text-amber-500" size={20} />,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-900'
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = (message) => addToast('success', message);
  const error = (message) => addToast('error', message || 'Something went wrong');
  const info = (message) => addToast('info', message);
  const warning = (message) => addToast('warning', message);

  // Subscribe to global toast calls
  React.useEffect(() => {
    const listener = (type, message) => addToast(type, message);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex min-w-[320px] max-w-[420px] items-start gap-3 rounded-xl border-2 p-4 shadow-2xl backdrop-blur-md ${config.bg} ${config.border}`}
              >
                <div className="mt-0.5">{config.icon}</div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${config.text}`}>{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="mt-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
