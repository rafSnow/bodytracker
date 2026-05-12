import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, tooltipContentStyle } from './ChartConstants';

interface TDEEChartProps {
  data: { date: string; tdee: number; bmr: number }[];
}

export const TDEEChart: React.FC<TDEEChartProps> = ({ data }) => {
  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500">Registre mais dados para ver este gráfico</p>
      </div>
    );
  }

  const isLongList = data.length > 90;

  return (
    <div className="h-[220px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => {
              const date = new Date(str);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
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
            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
            formatter={(value: any, name: any) => {
              const label = name === 'tdee' ? 'Gasto Total (TDEE)' : 'Metabolismo Basal (TMB)';
              return [`${Math.round(Number(value)).toLocaleString('pt-BR')} kcal`, label];
            }}
          />
          
          <Line
            type="monotone"
            dataKey="tdee"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={data.length < 30}
            isAnimationActive={!isLongList}
          />
          <Line
            type="monotone"
            dataKey="bmr"
            stroke={CHART_COLORS.secondary}
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={!isLongList}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
