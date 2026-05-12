import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'bg-primary',
  className 
}) => {
  return (
    <div className={`w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full ${color}`}
      />
    </div>
  );
};
