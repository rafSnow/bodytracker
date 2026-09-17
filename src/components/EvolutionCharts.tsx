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
    const sorted = [...evaluations].sort(
      (a, b) => new Date(a.avaliacao.data_avaliacao).getTime() - new Date(b.avaliacao.data_avaliacao).getTime()
    );

    // Calcula regressão linear simples para Peso e Gordura Corporal (Trendline)
    const n = sorted.length;
    let sumX = 0, sumY_peso = 0, sumXY_peso = 0, sumXX = 0;
    let sumY_bf = 0, sumXY_bf = 0;

    sorted.forEach((ev, i) => {
      const peso = ev.avaliacao.peso_kg;
      const bf = ev.resultado?.calculos?.bfNavy || 0;
      sumX += i;
      sumY_peso += peso;
      sumXY_peso += i * peso;
      sumXX += i * i;
      sumY_bf += bf;
      sumXY_bf += i * bf;
    });

    const denominator = (n * sumXX - sumX * sumX) || 1; // Previne divisão por 0
    const slope_peso = (n * sumXY_peso - sumX * sumY_peso) / denominator;
    const intercept_peso = (sumY_peso - slope_peso * sumX) / n;

    const slope_bf = (n * sumXY_bf - sumX * sumY_bf) / denominator;
    const intercept_bf = (sumY_bf - slope_bf * sumX) / n;

    return sorted.map((ev, index) => {
      const prev = index > 0 ? sorted[index - 1] : null;
      
      const peso = ev.avaliacao.peso_kg;
      const bfNavy = ev.resultado?.calculos?.bfNavy || 0;
      const bfRfm = ev.resultado?.calculos?.bfRfm || 0;
      const lbm = ev.resultado?.calculos?.lbmBoer || 0;

      // Cálculo dos Deltas (Diferença em relação à avaliação anterior)
      const deltaPeso = prev ? peso - prev.avaliacao.peso_kg : 0;
      const deltaBfNavy = prev ? bfNavy - (prev.resultado?.calculos?.bfNavy || 0) : 0;
      const deltaBfRfm = prev ? bfRfm - (prev.resultado?.calculos?.bfRfm || 0) : 0;
      const deltaLbm = prev ? lbm - (prev.resultado?.calculos?.lbmBoer || 0) : 0;

      return {
        dateRaw: ev.avaliacao.data_avaliacao,
        dateFormatted: format(new Date(ev.avaliacao.data_avaliacao), "dd MMM", { locale: ptBR }),
        peso,
        deltaPeso,
        pesoTrend: slope_peso * index + intercept_peso,
        bfNavy,
        deltaBfNavy,
        bfTrend: slope_bf * index + intercept_bf,
        bfRfm,
        deltaBfRfm,
        lbm,
        deltaLbm
      };
    });
  }, [evaluations]);

  if (chartData.length < 2) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-sm p-6 mb-6 text-center text-slate-500 text-sm">
        Faça pelo menos mais uma avaliação para visualizar os gráficos de evolução temporal.
      </div>
    );
  }

  // Tooltip customizado com Inteligência (Deltas e Cores)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-100 rounded-2xl shadow-xl min-w-[220px]">
          <p className="font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-100">{label}</p>
          <div className="flex flex-col gap-2.5">
            {payload.map((entry: any, index: number) => {
              // Não mostramos a linha de tendência (Trend) dentro do tooltip de detalhes diários
              if (entry.dataKey.includes('Trend')) return null;

              // Identifica o delta correspondente com base no dataKey
              const keyName = entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1);
              const delta = data[`delta${keyName}`];
              
              let deltaFormatted = '';
              let deltaColor = 'text-slate-400';
              
              if (delta !== undefined && delta !== 0) {
                const isPositive = delta > 0;
                
                // Lógica de Cores Inteligentes:
                // Para Massa Magra (LBM), ganhar (positivo) é bom = Verde
                // Para Peso e Gordura, perder (negativo) é bom = Verde
                if (entry.dataKey === 'lbm') {
                  deltaColor = isPositive ? 'text-emerald-500' : 'text-rose-500';
                } else {
                  deltaColor = isPositive ? 'text-rose-500' : 'text-emerald-500';
                }
                
                const icon = isPositive ? '↑' : '↓';
                deltaFormatted = `${icon} ${Math.abs(delta).toFixed(1)}`;
              }

              return (
                <div key={`item-${index}`} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-medium text-slate-600">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {entry.value.toFixed(1)}
                    </span>
                    {deltaFormatted && (
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-50 ${deltaColor}`}>
                        {deltaFormatted}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              
              <Line 
                type="monotone" 
                name="Tendência de Peso" 
                dataKey="pesoTrend" 
                stroke="#cbd5e1" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={false} 
                activeDot={false} 
              />
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
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              
              <Line 
                type="monotone" 
                name="Tendência de BF" 
                dataKey="bfTrend" 
                stroke="#cbd5e1" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={false} 
                activeDot={false} 
              />
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
