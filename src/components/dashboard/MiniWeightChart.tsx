import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/Card';
import { CheckIn } from '../../types/checkin';

interface MiniWeightChartProps {
  checkins: CheckIn[];
  loading?: boolean;
}

export const MiniWeightChart: React.FC<MiniWeightChartProps> = ({ checkins, loading }) => {
  if (loading) {
    return <Card className="h-32 mb-6 animate-pulse bg-slate-100 dark:bg-slate-800" />;
  }

  if (checkins.length < 2) return null;

  // Pegar os últimos 8 check-ins e reverter para ordem cronológica
  const data = [...checkins]
    .slice(0, 8)
    .reverse()
    .map(c => ({
      weight: c.weightKg,
      date: new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }));

  return (
    <Card className="h-32 mb-6 p-0 overflow-hidden relative group">
      <div className="absolute top-3 left-4 z-10 pointer-events-none">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tendência de Peso</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Últimos {data.length} registros</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded shadow-lg border border-slate-700">
                    <p className="text-[10px] font-bold text-white">{payload[0].value}kg</p>
                    <p className="text-[8px] text-slate-400 font-medium uppercase">{payload[0].payload.date}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="weight" 
            stroke="#4f46e5" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorWeight)" 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
