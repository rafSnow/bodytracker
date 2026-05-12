import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_COLORS, tooltipContentStyle } from './ChartConstants';

interface MeasurementsChartProps {
  data: { date: string; waist?: number; hip?: number; neck?: number }[];
}

export const MeasurementsChart: React.FC<MeasurementsChartProps> = ({ data }) => {
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>({
    waist: true,
    hip: true,
    neck: true,
  });

  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500">Registre mais dados para ver este gráfico</p>
      </div>
    );
  }

  const isLongList = data.length > 90;

  const toggleSeries = (e: any) => {
    const { dataKey } = e;
    setActiveSeries((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey as string],
    }));
  };

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
              const labels: Record<string, string> = {
                waist: 'Cintura',
                hip: 'Quadril',
                neck: 'Pescoço',
              };
              return [`${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cm`, labels[name] || name];
            }}
          />
          <Legend 
            onClick={toggleSeries}
            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                waist: 'Cintura',
                hip: 'Quadril',
                neck: 'Pescoço',
              };
              return (
                <span style={{ color: activeSeries[value] ? '#1e293b' : '#94a3b8' }}>
                  {labels[value] || value}
                </span>
              );
            }}
          />
          
          <Line
            type="monotone"
            dataKey="waist"
            name="waist"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            hide={!activeSeries.waist}
            dot={data.length < 30}
            isAnimationActive={!isLongList}
          />
          <Line
            type="monotone"
            dataKey="hip"
            name="hip"
            stroke={CHART_COLORS.success}
            strokeWidth={2}
            hide={!activeSeries.hip}
            dot={data.length < 30}
            isAnimationActive={!isLongList}
          />
          <Line
            type="monotone"
            dataKey="neck"
            name="neck"
            stroke={CHART_COLORS.warning}
            strokeWidth={2}
            hide={!activeSeries.neck}
            dot={data.length < 30}
            isAnimationActive={!isLongList}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
