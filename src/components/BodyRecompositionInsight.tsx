import { useMemo } from 'react';
import type { JoinedEvaluation } from './LatestEvaluationCard';
import { Dumbbell, Flame, TrendingDown, TrendingUp } from 'lucide-react';

interface BodyRecompositionInsightProps {
  evaluations: JoinedEvaluation[];
}

export function BodyRecompositionInsight({ evaluations }: BodyRecompositionInsightProps) {
  const insight = useMemo(() => {
    if (!evaluations || evaluations.length < 2) return null;

    // evaluations are sorted descending (latest first) in the dashboard
    // so evaluations[0] is the newest, evaluations[evaluations.length - 1] is the oldest
    const newest = evaluations[0];
    const oldest = evaluations[evaluations.length - 1];

    const initialWeight = oldest.avaliacao.peso_kg;
    const currentWeight = newest.avaliacao.peso_kg;
    const weightDiff = currentWeight - initialWeight;

    // Use BF Navy as standard for fat % if available
    const initialBf = oldest.resultado?.calculos?.bfNavy || 0;
    const currentBf = newest.resultado?.calculos?.bfNavy || 0;

    if (!initialBf || !currentBf) return null; // Can't calculate fat mass without BF

    const initialFatMass = initialWeight * (initialBf / 100);
    const currentFatMass = currentWeight * (currentBf / 100);
    const fatDiff = currentFatMass - initialFatMass;

    const initialLeanMass = initialWeight - initialFatMass;
    const currentLeanMass = currentWeight - currentFatMass;
    const leanDiff = currentLeanMass - initialLeanMass;

    return {
      weightDiff,
      fatDiff,
      leanDiff,
      currentFatMass,
      currentLeanMass,
      initialFatMass,
      initialLeanMass
    };
  }, [evaluations]);

  if (!insight) return null;

  const isGainingMuscle = insight.leanDiff > 0;
  const isLosingFat = insight.fatDiff < 0;
  const isWeightUp = insight.weightDiff > 0;

  // Recomposition Logic State
  let messageTitle = "";
  let messageBody = "";
  let badgeColor = "";
  let badgeText = "";

  if (isGainingMuscle && isLosingFat && isWeightUp) {
    messageTitle = "A balança está mentindo para você!";
    messageBody = `Você está mais pesado(a) (${insight.weightDiff > 0 ? '+' : ''}${insight.weightDiff.toFixed(1)}kg), mas não se assuste: você perdeu gordura e ganhou massa muscular. O músculo é mais denso que a gordura, por isso o peso subiu, mas suas medidas e saúde estão melhores.`;
    badgeColor = "bg-emerald-100 text-emerald-700";
    badgeText = "Recomposição Corporal Perfeita";
  } else if (isGainingMuscle && isLosingFat && !isWeightUp) {
    messageTitle = "Evolução Dupla!";
    messageBody = `Incrível! Você perdeu peso na balança (${insight.weightDiff.toFixed(1)}kg), derreteu gordura e ainda conseguiu ganhar massa muscular ao mesmo tempo. O cenário dos sonhos.`;
    badgeColor = "bg-emerald-100 text-emerald-700";
    badgeText = "Queima & Hipertrofia";
  } else if (!isGainingMuscle && isLosingFat) {
    messageTitle = "Secando com sucesso";
    messageBody = `Você eliminou ${Math.abs(insight.fatDiff).toFixed(1)}kg de gordura pura. Houve uma leve perda de massa magra, o que é normal em dietas de déficit calórico. Mantenha as proteínas altas e os treinos intensos!`;
    badgeColor = "bg-indigo-100 text-indigo-700";
    badgeText = "Fase de Emagrecimento";
  } else if (isGainingMuscle && !isLosingFat) {
    messageTitle = "Construção Muscular";
    messageBody = `Você adicionou ${insight.leanDiff.toFixed(1)}kg de massa magra! Como o ganho de peso veio com um pouco de gordura (${insight.fatDiff > 0 ? '+' : ''}${insight.fatDiff.toFixed(1)}kg), você provavelmente está em Superávit Calórico (Bulking).`;
    badgeColor = "bg-blue-100 text-blue-700";
    badgeText = "Fase de Hipertrofia";
  } else {
    messageTitle = "Alerta de Estagnação";
    messageBody = `Parece que você perdeu massa muscular e ganhou gordura em relação à sua primeira avaliação. Considere revisar o volume dos seus treinos na esteira/musculação e a ingestão de proteínas diárias.`;
    badgeColor = "bg-orange-100 text-orange-700";
    badgeText = "Atenção aos Treinos";
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-lg border border-slate-700 p-6 overflow-hidden relative">
      {/* Background Graphic */}
      <div className="absolute -right-6 -top-6 opacity-10">
        <Dumbbell size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{messageTitle}</h3>
        <p className="text-slate-300 text-[15px] leading-relaxed mb-6">
          {messageBody}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Massa Gorda</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-extrabold text-white">
                {insight.fatDiff > 0 ? '+' : ''}{insight.fatDiff.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-400 mb-1">kg</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium">
              {insight.fatDiff < 0 ? (
                <span className="text-emerald-400 flex items-center"><TrendingDown size={12} className="mr-0.5" /> Reduziu</span>
              ) : (
                <span className="text-red-400 flex items-center"><TrendingUp size={12} className="mr-0.5" /> Aumentou</span>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell size={16} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Massa Magra</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-extrabold text-white">
                {insight.leanDiff > 0 ? '+' : ''}{insight.leanDiff.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-400 mb-1">kg</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium">
              {insight.leanDiff > 0 ? (
                <span className="text-emerald-400 flex items-center"><TrendingUp size={12} className="mr-0.5" /> Aumentou</span>
              ) : (
                <span className="text-orange-400 flex items-center"><TrendingDown size={12} className="mr-0.5" /> Perdeu</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
