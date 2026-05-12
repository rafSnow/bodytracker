import React from 'react';
import { TrendingUp, Target } from 'lucide-react';
import { Card } from '../ui/Card';

interface GoalProjectionProps {
  currentWeight: number;
  targetWeight: number;
  weeklyRateKg: number;
  weeklyRatePct: number;
  dailyCalorieAdjustment: number;
  estimatedCompletionDate: string | null;
  objective: 'lose' | 'gain' | 'maintain';
}

export const GoalProjection: React.FC<GoalProjectionProps> = ({
  currentWeight,
  targetWeight,
  weeklyRateKg,
  weeklyRatePct,
  dailyCalorieAdjustment,
  estimatedCompletionDate,
  objective
}) => {
  const isLoss = objective === 'lose';
  
  return (
    <Card className="p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-primary" />
        <h3 className="font-bold text-slate-900 dark:text-white">Projeção da Meta</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ritmo Necessário</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-800 dark:text-slate-200">
              {weeklyRateKg} kg
            </span>
            <span className="text-xs text-slate-500">/ semana</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ({weeklyRatePct}% do peso atual)
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
            {isLoss ? 'Déficit' : 'Superávit'} Calórico
          </p>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-black ${isLoss ? 'text-orange-600' : 'text-success'}`}>
              {isLoss ? '-' : '+'}{dailyCalorieAdjustment}
            </span>
            <span className="text-xs text-slate-500">kcal / dia</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Estimativa teórica</p>
        </div>
      </div>

      {estimatedCompletionDate && (
        <div className="mt-4 flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary uppercase">Previsão baseada na tendência</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {new Date(estimatedCompletionDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <span>{currentWeight.toFixed(1)}kg atual</span>
        </div>
        <div className="w-10 h-px bg-slate-200 dark:bg-slate-800 mx-2" />
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>{targetWeight.toFixed(1)}kg alvo</span>
        </div>
      </div>
    </Card>
  );
};
