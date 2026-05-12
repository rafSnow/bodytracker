import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'center' | 'bottom';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, position = 'center' }) => {
  const isBottom = position === 'bottom';

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Basic focus trap - prevent scrolling on body
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]"
          />
          
          {/* Content Wrapper */}
          <div className={twMerge(
            clsx(
              "fixed inset-0 z-[80] flex p-4 pointer-events-none",
              isBottom ? "items-end p-0 sm:p-4" : "items-center justify-center"
            )
          )}>
            <motion.div
              initial={isBottom ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={isBottom ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isBottom ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={twMerge(
                clsx(
                  "bg-surface dark:bg-card-dark shadow-2xl pointer-events-auto overflow-hidden",
                  isBottom ? "w-full rounded-t-3xl sm:rounded-3xl max-w-lg mx-auto max-h-[90vh] overflow-y-auto" : "w-full max-w-md rounded-3xl"
                )
              )}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-surface dark:bg-card-dark z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
