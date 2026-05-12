import React from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { CHART_COLORS, tooltipContentStyle } from './ChartConstants';
import { useGoal } from '../../hooks/useGoal';

interface WeightChartProps {
  data: { date: string; weight: number; trend?: number; projection?: number }[];
}

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const { goal } = useGoal();
  
  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500">Registre mais dados para ver este gráfico</p>
      </div>
    );
  }

  // Preparar dados de projeção se houver meta com data
  const projectionPoints = React.useMemo(() => {
    if (!goal || !goal.targetDate || data.length === 0) return [];
    
    const latest = data[data.length - 1];
    return [
      { date: latest.date, projection: latest.weight },
      { date: goal.targetDate, projection: goal.targetWeightKg }
    ];
  }, [goal, data]);

  // Mesclar dados para o eixo X contemplar a data futura
  const combinedData = React.useMemo(() => {
    if (projectionPoints.length === 0) return data;
    
    // Garantir que a data da meta está no futuro
    const lastDate = new Date(data[data.length - 1].date);
    const targetDate = new Date(projectionPoints[1].date);
    
    if (targetDate <= lastDate) return data;

    // Criar um set de dados que inclui os pontos originais e os de projeção
    // O Recharts lida bem com campos faltantes
    const merged = [...data];
    merged.push({
      date: projectionPoints[1].date,
      weight: undefined as any,
      projection: projectionPoints[1].projection
    });
    
    // Adicionar o campo projection ao último ponto real para conectar a linha
    merged[data.length - 1] = {
      ...merged[data.length - 1],
      projection: projectionPoints[0].projection
    };

    return merged;
  }, [data, projectionPoints]);

  const isLongList = combinedData.length > 90;

  return (
    <div className="h-[220px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combinedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={['dataMin - 2', 'dataMax + 2']} 
            fontSize={10}
            tick={{ fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={tooltipContentStyle}
            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
            formatter={(value: any, name: any) => {
              if (name === 'weight') return [value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg', 'Peso'];
              if (name === 'projection') return [value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg', 'Projeção'];
              return [value, name];
            }}
          />
          
          {goal && (
            <ReferenceLine 
              y={goal.targetWeightKg} 
              stroke={CHART_COLORS.success} 
              strokeDasharray="3 3"
              label={{ 
                value: 'Meta', 
                position: 'right', 
                fill: CHART_COLORS.success,
                fontSize: 10
              }} 
            />
          )}

          <Area
            type="monotone"
            dataKey="weight"
            stroke="none"
            fillOpacity={1}
            fill="url(#colorWeight)"
            isAnimationActive={!isLongList}
          />
          
          <Line
            type="monotone"
            dataKey="weight"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={data.length < 30}
            activeDot={{ r: 4 }}
            isAnimationActive={!isLongList}
          />

          <Line
            type="monotone"
            dataKey="trend"
            stroke={CHART_COLORS.secondary}
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
            isAnimationActive={!isLongList}
          />

          {projectionPoints.length > 0 && (
            <Line
              type="monotone"
              dataKey="projection"
              stroke={CHART_COLORS.success}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
              isAnimationActive={!isLongList}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
