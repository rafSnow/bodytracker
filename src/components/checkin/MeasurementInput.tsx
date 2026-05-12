import React from 'react';
import { Info } from 'lucide-react';
import { Input } from '../ui/Input';
import { Tooltip } from '../ui/Tooltip';

interface MeasurementInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  suffix: 'kg' | 'cm';
  hint?: string;
  error?: string;
  required?: boolean;
}

export const MeasurementInput = React.memo<MeasurementInputProps>(({
  label,
  suffix,
  hint,
  error,
  required,
  ...props
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-1 ml-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
        {hint && (
          <Tooltip content={hint}>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          </Tooltip>
        )}
      </div>
      <Input
        type="number"
        step="0.01"
        inputMode="decimal"
        suffix={suffix}
        error={error}
        {...props}
      />
    </div>
  );
});
