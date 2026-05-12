import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { CHART_COLORS, tooltipContentStyle } from './ChartConstants';

interface BMIChartProps {
  data: { date: string; bmi: number }[];
}

export const BMIChart: React.FC<BMIChartProps> = ({ data }) => {
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
            domain={[15, (dataMax: number) => Math.max(dataMax + 2, 40)]}
            fontSize={10}
            tick={{ fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={tooltipContentStyle}
            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
            formatter={(value: any) => [Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), 'IMC']}
          />

          <ReferenceArea y1={18.5} y2={24.9} fill={CHART_COLORS.bmi.normal} fillOpacity={0.1} />
          <ReferenceArea y1={25} y2={29.9} fill={CHART_COLORS.bmi.overweight} fillOpacity={0.1} />
          <ReferenceArea y1={30} y2={34.9} fill={CHART_COLORS.bmi.obese1} fillOpacity={0.1} />
          <ReferenceArea y1={35} y2={45} fill={CHART_COLORS.bmi.obese2} fillOpacity={0.1} />
          
          <Line
            type="monotone"
            dataKey="bmi"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={data.length < 30}
            isAnimationActive={!isLongList}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
