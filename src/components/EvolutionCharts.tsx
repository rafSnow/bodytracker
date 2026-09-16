import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { JoinedEvaluation } from './LatestEvaluationCard';

interface EvolutionChartsProps {
  evaluations: JoinedEvaluation[];
}

export function EvolutionCharts({ evaluations }: EvolutionChartsProps) {
  const chartData = useMemo(() => {
    if (!evaluations) return [];
    
    // Gráficos de evolução precisam estar em ordem cronológica (crescente)
    return [...evaluations]
      .sort((a, b) => new Date(a.avaliacao.data_avaliacao).getTime() - new Date(b.avaliacao.data_avaliacao).getTime())
      .map(ev => ({
        dateRaw: ev.avaliacao.data_avaliacao,
        dateFormatted: format(new Date(ev.avaliacao.data_avaliacao), "dd MMM", { locale: ptBR }),
        peso: ev.avaliacao.peso_kg,
        bfNavy: ev.resultado?.calculos?.bfNavy || 0,
        bfRfm: ev.resultado?.calculos?.bfRfm || 0,
        lbm: ev.resultado?.calculos?.lbmBoer || 0
      }));
  }, [evaluations]);

  if (chartData.length < 2) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-sm p-6 mb-6 text-center text-slate-500 text-sm">
        Faça pelo menos mais uma avaliação para visualizar os gráficos de evolução temporal.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-lg">
          <p className="font-medium text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-6 mb-6">
      {/* Gráfico de Peso e Massa Magra */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-4 pt-6">
        <h3 className="text-base font-semibold text-slate-800 mb-6 px-2">Evolução de Peso e Massa Magra (kg)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="dateFormatted" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                dy={10}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Line 
                type="monotone" 
                name="Peso Total" 
                dataKey="peso" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                name="Massa Magra" 
                dataKey="lbm" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de BF% */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-4 pt-6">
        <h3 className="text-base font-semibold text-slate-800 mb-6 px-2">Percentual de Gordura (%)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="dateFormatted" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                dy={10}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Line 
                type="monotone" 
                name="US Navy" 
                dataKey="bfNavy" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                name="RFM" 
                dataKey="bfRfm" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
