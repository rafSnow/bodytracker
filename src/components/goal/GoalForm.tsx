import React, { useState, useEffect } from 'react';
import { Target, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { calculateGoalMetrics } from '../../lib/goalEngine';
import { CheckIn } from '../../types/checkin';
import { Goal } from '../../types/goal';
import { PaceWarning } from './PaceWarning';

interface GoalFormProps {
  currentWeight: number;
  recentCheckins: CheckIn[];
  initialValues?: Goal | null;
  onSubmit: (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel?: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  currentWeight,
  recentCheckins,
  initialValues,
  onSubmit,
  onCancel
}) => {
  const [targetWeight, setTargetWeight] = useState(initialValues?.targetWeightKg?.toString() || '');
  const [targetDate, setTargetDate] = useState(initialValues?.targetDate || '');
  const [objective, setObjective] = useState<Goal['objective']>(initialValues?.objective || 'lose');
  const [loading, setLoading] = useState(false);

  const targetWeightNum = parseFloat(targetWeight);
  const isValidWeight = !isNaN(targetWeightNum) && targetWeightNum > 20 && targetWeightNum < 300;
  const isDifferentWeight = targetWeightNum !== currentWeight;

  const metrics = isValidWeight 
    ? calculateGoalMetrics(currentWeight, targetWeightNum, targetDate || undefined, recentCheckins)
    : null;

  useEffect(() => {
    if (isValidWeight && !initialValues) {
      if (targetWeightNum < currentWeight) setObjective('lose');
      else if (targetWeightNum > currentWeight) setObjective('gain');
      else setObjective('maintain');
    }
  }, [targetWeightNum, currentWeight, isValidWeight, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidWeight || !isDifferentWeight) return;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    setLoading(true);
    try {
      await onSubmit({
        targetWeightKg: targetWeightNum,
        targetDate: targetDate || undefined,
        objective
      });
    } finally {
      setLoading(false);
    }
  };

  const adjustDeadline = () => {
    if (!isValidWeight || !isDifferentWeight) return;
    
    // Sugerir data baseada em 0.75% por semana (perda) ou 0.4% (ganho)
    const weightDiff = Math.abs(currentWeight - targetWeightNum);
    const safeRatePct = objective === 'lose' ? 0.75 : 0.4;
    const safeRateKg = (currentWeight * safeRatePct) / 100;
    const weeksNeeded = weightDiff / safeRateKg;
    const daysNeeded = Math.ceil(weeksNeeded * 7);
    
    const suggestedDate = new Date();
    suggestedDate.setDate(suggestedDate.getDate() + daysNeeded);
    setTargetDate(suggestedDate.toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-primary" />
          <h3 className="font-bold text-slate-900 dark:text-white">Configurar Meta</h3>
        </div>

        <div className="space-y-4">
          <Input
            label="Peso Alvo (kg)"
            type="number"
            step="0.1"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder="Ex: 75.0"
            required
          />

          {!isDifferentWeight && targetWeight !== '' && (
            <p className="text-xs text-orange-500 font-medium">O peso alvo deve ser diferente do peso atual.</p>
          )}

          <Input
            label="Data Alvo (Opcional)"
            type="date"
            value={targetDate ? targetDate.split('T')[0] : ''}
            onChange={(e) => setTargetDate(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
          />

          <Select
            label="Objetivo Visual"
            value={objective}
            onChange={(e) => setObjective(e.target.value as Goal['objective'])}
            options={[
              { value: 'lose', label: 'Perder gordura / cutting' },
              { value: 'gain', label: 'Ganhar massa / bulking' },
              { value: 'maintain', label: 'Manutenção / recomposição' },
            ]}
          />
        </div>
      </Card>

      {metrics && targetDate && (
        <div className="space-y-4">
          <Card className="p-4 bg-primary/5 border-primary/10">
            <h4 className="text-xs font-bold text-primary uppercase mb-3 flex items-center gap-2">
              <Info size={14} />
              Resumo do Ritmo
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Kg / Semana</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{metrics.weeklyRateKg} kg</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">% Peso / Semana</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{metrics.weeklyRatePct}%</p>
              </div>
            </div>
          </Card>

          <PaceWarning 
            isRateSafe={metrics.isRateSafe} 
            rateWarning={metrics.rateWarning}
            onAdjustDeadline={adjustDeadline}
          />
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button variant="ghost" type="button" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button 
          variant="primary" 
          type="submit" 
          className="flex-1" 
          disabled={!isValidWeight || !isDifferentWeight || loading}
          isLoading={loading}
        >
          {initialValues ? 'Atualizar Meta' : 'Definir Meta'}
        </Button>
      </div>
    </form>
  );
};
