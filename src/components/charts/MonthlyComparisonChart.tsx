import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_COLORS, tooltipContentStyle } from './ChartConstants';

interface MonthlyComparisonChartProps {
  data: { month: string; avgWeight: number; avgWaist?: number }[];
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ data }) => {
  if (data.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500">Registre dados de pelo menos um mês para ver este gráfico</p>
      </div>
    );
  }

  const isLongList = data.length > 90;

  return (
    <div className="h-[220px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            fontSize={10}
            tick={{ fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            fontSize={10}
            tick={{ fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={tooltipContentStyle}
            formatter={(value: any, name: any) => {
              const label = name === 'avgWeight' ? 'Peso Médio' : 'Cintura Média';
              const unit = name === 'avgWeight' ? 'kg' : 'cm';
              return [`${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unit}`, label];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          
          <Bar
            dataKey="avgWeight"
            name="avgWeight"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
            isAnimationActive={!isLongList}
          />
          <Bar
            dataKey="avgWaist"
            name="avgWaist"
            fill={CHART_COLORS.success}
            radius={[4, 4, 0, 0]}
            isAnimationActive={!isLongList}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
