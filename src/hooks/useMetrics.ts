import { useMemo } from 'react';
import { useCheckins } from './useCheckins';
import { useProfile } from './useProfile';
import { calculateAllMetrics } from '../lib/formulas';
import { CalculatedMetrics } from '../types/metrics';
import { CheckIn } from '../types/checkin';

export function useMetrics(): {
  metrics: CalculatedMetrics | null;
  latestCheckin: CheckIn | null;
  loading: boolean;
} {
  const { checkins, loading: checkinsLoading } = useCheckins();
  const { profile, loading: profileLoading } = useProfile();

  const loading = checkinsLoading || profileLoading;

  const latestCheckin = useMemo(() => {
    if (!checkins || checkins.length === 0) return null;
    return checkins[0]; // checkins já vem ordenado por data descendente
  }, [checkins]);

  const metrics = useMemo(() => {
    if (!latestCheckin || !profile) return null;
    return calculateAllMetrics(latestCheckin, profile);
  }, [latestCheckin, profile]);

  return {
    metrics,
    latestCheckin,
    loading,
  };
}
