import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'bg-card dark:bg-card-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-all',
          onClick && 'cursor-pointer active:scale-[0.98]',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
