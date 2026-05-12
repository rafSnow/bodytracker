import { useState, useMemo } from 'react';
import { useCheckins } from './useCheckins';
import { useProfile } from './useProfile';
import { CheckIn } from '../types/checkin';
import { Profile } from '../types/profile';
import { calculateAllMetrics } from '../lib/formulas';
import { linearRegression } from '../lib/trendLine';

export type Period = '30d' | '90d' | '6m' | '1y' | 'all';

export function prepareChartData(checkins: CheckIn[], profile: Profile) {
  if (checkins.length === 0) return null;

  const sortedCheckins = [...checkins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 2. Preparar dados de Peso + Tendência
  const weightPoints = sortedCheckins.map((c) => ({
    x: new Date(c.date).getTime(),
    y: c.weightKg,
  }));
  const trend = linearRegression(weightPoints);
  const weightData = sortedCheckins.map((c) => ({
    date: c.date,
    weight: c.weightKg,
    trend: trend.predict(new Date(c.date).getTime()),
  }));

  // 3. Preparar outras métricas para cada ponto
  const allCalculated = sortedCheckins.map((c) => ({
    checkin: c,
    metrics: calculateAllMetrics(c, profile),
  }));

  const compositionData = allCalculated.map((item) => ({
    date: item.checkin.date,
    leanMass: item.metrics.leanMassKg || 0,
    fatMass: item.metrics.fatMassKg || 0,
    bodyFatPct: item.metrics.bodyFatPct || 0,
  }));

  const measurementsData = sortedCheckins.map((c) => ({
    date: c.date,
    waist: c.waistCm,
    hip: c.hipCm,
    neck: c.neckCm,
  }));

  const recompositionData = allCalculated.map((item) => ({
    date: item.checkin.date,
    weight: item.checkin.weightKg,
    bodyFatPct: item.metrics.bodyFatPct || 0,
  }));

  const bmiData = allCalculated.map((item) => ({
    date: item.checkin.date,
    bmi: item.metrics.bmi || 0,
  }));

  const tdeeData = allCalculated.map((item) => ({
    date: item.checkin.date,
    tdee: item.metrics.tdee || 0,
    bmr: item.metrics.bmr || 0,
  }));

  // 4. Monthly Comparison (Dados agrupados por mês)
  const monthlyGroups: Record<string, { weight: number[]; waist: number[]; count: number }> = {};
  sortedCheckins.forEach((c) => {
    const d = new Date(c.date);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthlyGroups[key]) {
      monthlyGroups[key] = { weight: [], waist: [], count: 0 };
    }
    monthlyGroups[key].weight.push(c.weightKg);
    if (c.waistCm) monthlyGroups[key].waist.push(c.waistCm);
    monthlyGroups[key].count++;
  });

  const monthlyData = Object.keys(monthlyGroups)
    .sort()
    .map((key) => {
      const [year, month] = key.split('-');
      const group = monthlyGroups[key];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return {
        month: `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`,
        avgWeight: group.weight.reduce((a, b) => a + b, 0) / group.weight.length,
        avgWaist: group.waist.length > 0 ? group.waist.reduce((a, b) => a + b, 0) / group.waist.length : undefined,
      };
    });

  return {
    weightData,
    compositionData,
    measurementsData,
    recompositionData,
    bmiData,
    tdeeData,
    monthlyData,
  };
}

export function useChartData() {
  const { checkins, loading: checkinsLoading } = useCheckins();
  const { profile, loading: profileLoading } = useProfile();
  const [period, setPeriod] = useState<Period>('90d');

  const loading = checkinsLoading || profileLoading;

  const chartData = useMemo(() => {
    if (!checkins || !profile || checkins.length === 0) return null;

    // 1. Filtrar check-ins pelo período
    const now = new Date();
    const filterDate = new Date();
    
    if (period === '30d') filterDate.setDate(now.getDate() - 30);
    else if (period === '90d') filterDate.setDate(now.getDate() - 90);
    else if (period === '6m') filterDate.setMonth(now.getMonth() - 6);
    else if (period === '1y') filterDate.setFullYear(now.getFullYear() - 1);
    else filterDate.setFullYear(now.getFullYear() - 100); // "all"

    const filteredCheckins = checkins
      .filter((c) => new Date(c.date) >= filterDate);

    return prepareChartData(filteredCheckins, profile);
  }, [checkins, profile, period]);

  return {
    ...chartData,
    loading,
    period,
    setPeriod,
  };
}
