import React from 'react';
import { clsx } from 'clsx';
import { Period } from '../../hooks/useChartData';

interface PeriodFilterProps {
  current: Period;
  onChange: (period: Period) => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({ current, onChange }) => {
  const options: { label: string; value: Period }[] = [
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '6m', value: '6m' },
    { label: '1a', value: '1y' },
    { label: 'Tudo', value: 'all' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap',
            current === option.value
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
              : 'bg-surface dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
