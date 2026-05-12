import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'danger' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  action?: { label: string; onClick: () => void };
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', isVisible, onClose, action }) => {
  useEffect(() => {
    if (isVisible && !action) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, action]);

  const icons = {
    success: <CheckCircle className="text-success" size={20} />,
    danger: <XCircle className="text-danger" size={20} />,
    warning: <AlertCircle className="text-warning" size={20} />,
    info: <Info className="text-primary" size={20} />,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 z-[100] flex justify-center pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between space-x-3 max-w-sm w-full pointer-events-auto border border-slate-700">
            <div className="flex items-center space-x-3">
              {icons[type]}
              <p className="text-sm font-medium">{message}</p>
            </div>
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className="text-xs font-bold text-primary uppercase tracking-wider px-2 py-1 hover:bg-white/10 rounded transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
