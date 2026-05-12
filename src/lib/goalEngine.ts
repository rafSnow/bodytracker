import { CheckIn } from '../types/checkin';
import { linearRegression } from './trendLine';

export function calculateGoalMetrics(
  currentWeightKg: number,
  targetWeightKg: number,
  targetDate: string | undefined,
  recentCheckins: CheckIn[]
): {
  weeklyRateKg: number;
  weeklyRatePct: number;
  dailyCalorieAdjustment: number;
  estimatedCompletionDate: string | null;
  isRateSafe: boolean;
  rateWarning: string | null;
  objective: 'lose' | 'gain' | 'maintain';
} {
  const objective: 'lose' | 'gain' | 'maintain' =
    targetWeightKg < currentWeightKg ? 'lose' : targetWeightKg > currentWeightKg ? 'gain' : 'maintain';

  const weightDiff = Math.abs(currentWeightKg - targetWeightKg);
  
  let weeklyRateKg = 0;
  let weeklyRatePct = 0;
  let dailyCalorieAdjustment = 0;
  let estimatedCompletionDate: string | null = null;
  let isRateSafe = true;
  let rateWarning: string | null = null;

  if (objective !== 'maintain' && targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      const weeks = diffDays / 7;
      weeklyRateKg = weightDiff / weeks;
      weeklyRatePct = (weeklyRateKg / currentWeightKg) * 100;
      
      // Helms et al., 2014: 0.5-1.0% weight loss per week
      // Slater & Phillips, 2011: 0.25-0.5% weight gain per week
      if (objective === 'lose' && weeklyRatePct > 1.0) {
        isRateSafe = false;
        rateWarning = 'Ritmo de perda agressivo (>1%/sem). Risco de perda de massa muscular.';
      } else if (objective === 'gain' && weeklyRatePct > 0.5) {
        isRateSafe = false;
        rateWarning = 'Ritmo de ganho agressivo (>0.5%/sem). Risco de ganho excessivo de gordura.';
      }

      // Estimação calórica aproximada (7700 kcal por kg)
      dailyCalorieAdjustment = (weeklyRateKg * 7700) / 7;
    }
  }

  // Estimar data baseada na tendência dos últimos 30 dias
  if (recentCheckins.length >= 2) {
    const points = recentCheckins.map((c) => ({
      x: new Date(c.date).getTime(),
      y: c.weightKg,
    }));
    
    const regression = linearRegression(points);
    
    if ((objective === 'lose' && regression.slope < 0) || (objective === 'gain' && regression.slope > 0)) {
      const targetTime = (targetWeightKg - regression.intercept) / regression.slope;
      if (targetTime > new Date().getTime()) {
        estimatedCompletionDate = new Date(targetTime).toISOString();
      }
    }
  }

  return {
    weeklyRateKg: parseFloat(weeklyRateKg.toFixed(2)),
    weeklyRatePct: parseFloat(weeklyRatePct.toFixed(2)),
    dailyCalorieAdjustment: Math.round(dailyCalorieAdjustment),
    estimatedCompletionDate,
    isRateSafe,
    rateWarning,
    objective,
  };
}
