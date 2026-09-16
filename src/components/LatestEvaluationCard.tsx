import type { Avaliacao, Resultados } from '../db/db';
import { ArrowDown, ArrowUp, Minus, Scale, Activity, Droplet } from 'lucide-react';

export interface JoinedEvaluation {
  avaliacao: Avaliacao;
  resultado?: Resultados;
}

interface LatestEvaluationCardProps {
  evaluations: JoinedEvaluation[];
}

export function LatestEvaluationCard({ evaluations }: LatestEvaluationCardProps) {
  if (!evaluations || evaluations.length === 0) {
    return null;
  }

  // Ordena por data decrescente (mais recente primeiro)
  const sorted = [...evaluations].sort(
    (a, b) => new Date(b.avaliacao.data_avaliacao).getTime() - new Date(a.avaliacao.data_avaliacao).getTime()
  );

  const current = sorted[0];
  const previous = sorted.length > 1 ? sorted[1] : null;

  const currentWeight = current.avaliacao.peso_kg;
  const previousWeight = previous?.avaliacao.peso_kg;
  const weightDelta = previousWeight ? currentWeight - previousWeight : 0;

  // Usamos o US Navy como métrica principal de BF% para o card rápido
  const currentBF = current.resultado?.calculos?.bfNavy || 0;
  const previousBF = previous?.resultado?.calculos?.bfNavy || 0;
  const bfDelta = previousBF ? currentBF - previousBF : 0;

  const currentLBM = current.resultado?.calculos?.lbmBoer || 0;
  const previousLBM = previous?.resultado?.calculos?.lbmBoer || 0;
  const lbmDelta = previousLBM ? currentLBM - previousLBM : 0;

  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-sm p-5 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Última Avaliação</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Peso */}
        <MetricCard 
          title="Peso" 
          value={`${currentWeight.toFixed(1)} kg`} 
          delta={weightDelta} 
          icon={<Scale size={18} className="text-blue-500" />} 
          inverseColor={false} 
        />
        
        {/* BF% */}
        <MetricCard 
          title="Gordura" 
          value={`${currentBF.toFixed(1)} %`} 
          delta={bfDelta} 
          icon={<Droplet size={18} className="text-orange-500" />} 
          inverseColor={true} // Menos gordura = positivo (verde)
        />
        
        {/* LBM */}
        <MetricCard 
          title="Massa Magra" 
          value={`${currentLBM.toFixed(1)} kg`} 
          delta={lbmDelta} 
          icon={<Activity size={18} className="text-emerald-500" />} 
          inverseColor={false} // Mais massa magra = positivo (verde)
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 text-center">
        Avaliação realizada em: {new Date(current.avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}

function MetricCard({ 
  title, value, delta, icon, inverseColor 
}: { 
  title: string, value: string, delta: number, icon: React.ReactNode, inverseColor: boolean 
}) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isNeutral = delta === 0;

  // Lógica de cores semânticas (glanceability)
  let deltaColor = "text-slate-400";
  let bgDeltaColor = "bg-slate-50";
  
  if (isPositive) {
    deltaColor = inverseColor ? "text-rose-600" : "text-emerald-600";
    bgDeltaColor = inverseColor ? "bg-rose-50" : "bg-emerald-50";
  } else if (isNegative) {
    deltaColor = inverseColor ? "text-emerald-600" : "text-rose-600";
    bgDeltaColor = inverseColor ? "bg-emerald-50" : "bg-rose-50";
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
        {icon}
        <span className="truncate">{title}</span>
      </div>
      
      <div className="text-xl font-bold text-slate-800">
        {value}
      </div>
      
      <div className={`flex items-center gap-0.5 w-fit px-1.5 py-0.5 rounded-md text-xs font-medium ${bgDeltaColor} ${deltaColor}`}>
        {isPositive && <ArrowUp size={12} strokeWidth={3} />}
        {isNegative && <ArrowDown size={12} strokeWidth={3} />}
        {isNeutral && <Minus size={12} strokeWidth={3} />}
        <span>{Math.abs(delta).toFixed(1)}</span>
      </div>
    </div>
  );
}
