import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, tooltipContentStyle } from './ChartConstants';

interface BodyCompositionChartProps {
  data: { date: string; leanMass: number; fatMass: number; bodyFatPct: number }[];
}

export const BodyCompositionChart: React.FC<BodyCompositionChartProps> = ({ data }) => {
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
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
              const label = name === 'leanMass' ? 'Massa Magra' : 'Massa Gorda';
              return [`${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`, label];
            }}
          />
          
          <Area
            type="monotone"
            dataKey="leanMass"
            stackId="1"
            stroke={CHART_COLORS.lean}
            fill={CHART_COLORS.lean}
            fillOpacity={0.6}
            isAnimationActive={!isLongList}
          />
          <Area
            type="monotone"
            dataKey="fatMass"
            stackId="1"
            stroke={CHART_COLORS.fat}
            fill={CHART_COLORS.fat}
            fillOpacity={0.6}
            isAnimationActive={!isLongList}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
