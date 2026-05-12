import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Alert } from '../../lib/alertsEngine';
import { clsx } from 'clsx';

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (type: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
    orange: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800',
    red: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800',
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      <AnimatePresence>
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={alert.type}
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              role="alert"
              aria-live="polite"
              className={clsx(
                'relative flex items-center gap-3 p-4 rounded-2xl border shadow-sm overflow-hidden',
                colorClasses[alert.color]
              )}
            >
              <div className="shrink-0 p-2 rounded-xl bg-white/50 dark:bg-black/20">
                <Icon size={20} />
              </div>
              
              <p className="text-sm font-medium leading-tight pr-6">
                {alert.message}
              </p>

              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.type)}
                  className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
