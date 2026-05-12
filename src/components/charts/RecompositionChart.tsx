import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, tooltipContentStyle } from './ChartConstants';

interface RecompositionChartProps {
  data: { date: string; weight: number; bodyFatPct: number }[];
}

export const RecompositionChart: React.FC<RecompositionChartProps> = ({ data }) => {
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
        <ComposedChart data={data} margin={{ top: 5, right: -20, left: -20, bottom: 0 }}>
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
            yAxisId="left"
            domain={['dataMin - 1', 'dataMax + 1']} 
            fontSize={10}
            tick={{ fill: CHART_COLORS.primary }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={['dataMin - 1', 'dataMax + 1']} 
            fontSize={10}
            tick={{ fill: CHART_COLORS.fat }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={tooltipContentStyle}
            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
            formatter={(value: any, name: any) => {
              const unit = name?.includes('Peso') ? 'kg' : '%';
              return [`${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${unit}`, name];
            }}
          />
          
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="weight"
            name="Peso (kg)"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={data.length < 30}
            isAnimationActive={!isLongList}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="bodyFatPct"
            name="% Gordura"
            stroke={CHART_COLORS.fat}
            strokeWidth={2}
            dot={data.length < 30}
            isAnimationActive={!isLongList}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
