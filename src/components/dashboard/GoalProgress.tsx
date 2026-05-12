import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight } from 'lucide-react';
import { Goal } from '../../types/goal';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';

interface GoalProgressProps {
  goal: Goal | null;
  currentWeight: number;
  startWeight: number;
  loading?: boolean;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  goal,
  currentWeight,
  startWeight,
  loading
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="p-6 mb-6 h-40 animate-pulse bg-slate-100 dark:bg-slate-800" />
    );
  }

  if (!goal) {
    return (
      <Card className="p-6 mb-6 bg-primary/5 border-dashed border-2 border-primary/20 flex flex-col items-center text-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-full">
          <Target size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Defina uma meta</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe seu progresso e mantenha o foco.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/goal')}>
          Definir agora
        </Button>
      </Card>
    );
  }

  const { targetWeightKg, targetDate, objective } = goal;
  
  // Calcular progresso
  // Se perder: progresso = (start - current) / (start - target)
  // Se ganhar: progresso = (current - start) / (target - start)
  let progress = 0;
  if (objective === 'lose') {
    const totalToLose = startWeight - targetWeightKg;
    const lostSoFar = startWeight - currentWeight;
    progress = totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 0;
  } else if (objective === 'gain') {
    const totalToGain = targetWeightKg - startWeight;
    const gainedSoFar = currentWeight - startWeight;
    progress = totalToGain > 0 ? (gainedSoFar / totalToGain) * 100 : 0;
  } else {
    // Manter: se estiver dentro de uma faixa de +- 1kg do alvo, progresso é 100%
    progress = Math.abs(currentWeight - targetWeightKg) <= 1 ? 100 : 0;
  }

  // Clampar progresso entre 0 e 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const daysLeft = targetDate 
    ? Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card 
      className="p-5 mb-6 cursor-pointer hover:border-primary/30 transition-colors group"
      onClick={() => navigate('/goal')}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white">Sua Meta</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {objective === 'lose' ? 'Perder' : objective === 'gain' ? 'Ganhar' : 'Manter'} peso
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-primary">
            {clampedProgress.toFixed(0)}%
          </span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">concluído</p>
        </div>
      </div>

      <ProgressBar 
        progress={clampedProgress} 
        className="h-3 mb-4" 
        color={clampedProgress >= 100 ? 'bg-success' : 'bg-primary'}
      />

      <div className="flex justify-between items-end">
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Atual</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentWeight.toFixed(1)}kg</p>
          </div>
          <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Alvo</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{targetWeightKg.toFixed(1)}kg</p>
          </div>
        </div>
        
        {daysLeft !== null && daysLeft > 0 && (
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Faltam</p>
            <p className="text-sm font-bold text-primary">{daysLeft} dias</p>
          </div>
        )}

        <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:text-primary transition-colors">
          <ChevronRight size={18} />
        </div>
      </div>
    </Card>
  );
};
