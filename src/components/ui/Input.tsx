import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, suffix, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                error && 'border-danger focus:ring-danger/50',
                suffix && 'pr-12',
                className
              )
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-danger font-medium ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
