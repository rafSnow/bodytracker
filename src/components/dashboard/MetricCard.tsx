import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: number;          // variation (positive = up, negative = down)
  deltaLabel?: string;     // e.g.: "since start"
  category?: string;       // e.g.: "Normal", "Fitness"
  categoryColor?: 'green' | 'yellow' | 'red' | 'blue';
  icon?: LucideIcon;
  loading?: boolean;
  inverse?: boolean;       // if true, positive delta is "bad" (red), negative is "good" (green)
}

export const MetricCard = React.memo<MetricCardProps>(({
  title,
  value,
  unit,
  delta,
  deltaLabel,
  category,
  categoryColor = 'blue',
  icon: Icon,
  loading,
  inverse = false,
}) => {
  if (loading) {
    return (
      <Card className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-32" />
      </Card>
    );
  }

  const isPositive = delta ? delta > 0 : false;
  const isNegative = delta ? delta < 0 : false;
  
  const deltaColor = inverse 
    ? (isPositive ? 'text-danger' : isNegative ? 'text-success' : 'text-slate-500')
    : (isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-slate-500');

  const categoryColors = {
    green: 'bg-success/10 text-success border-success/20',
    yellow: 'bg-warning/10 text-warning border-warning/20',
    red: 'bg-danger/10 text-danger border-danger/20',
    blue: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <Card className="p-4 flex flex-col h-full relative overflow-hidden group">
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 mt-auto">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2">
        {delta !== undefined && (
          <div 
            className={clsx('flex items-center text-xs font-bold', deltaColor)}
            aria-label={`${isPositive ? 'Aumento' : isNegative ? 'Redução' : 'Variação'} de ${Math.abs(delta).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${unit || ''} ${deltaLabel || ''}`}
          >
            {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(delta).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{unit || ''}
            {deltaLabel && <span className="ml-1 font-medium text-slate-400 dark:text-slate-500">{deltaLabel}</span>}
          </div>
        )}
        
        {category && (
          <span className={twMerge(
            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border',
            categoryColors[categoryColor]
          )}>
            {category}
          </span>
        )}
      </div>
    </Card>
  );
});
