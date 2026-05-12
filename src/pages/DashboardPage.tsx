import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  Activity, 
  Dna, 
  Zap, 
  CircleDot, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

import { MainLayout } from '../components/layout/MainLayout';
import { MetricCard } from '../components/dashboard/MetricCard';
import { GoalProgress } from '../components/dashboard/GoalProgress';
import { MiniWeightChart } from '../components/dashboard/MiniWeightChart';
import { AlertBanner } from '../components/dashboard/AlertBanner';
import { Button } from '../components/ui/Button';

import { useMetrics } from '../hooks/useMetrics';
import { useCheckins } from '../hooks/useCheckins';
import { useProfile } from '../hooks/useProfile';
import { useGoal } from '../hooks/useGoal';
import { detectAlerts } from '../lib/alertsEngine';
import clsx from 'clsx';

import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { RefreshCcw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { goal, loading: goalLoading } = useGoal();
  const { checkins, loading: checkinsLoading } = useCheckins();
  const { metrics, latestCheckin, loading: metricsLoading } = useMetrics();

  const { isRefreshing, pullProgress } = usePullToRefresh(async () => {
    // Already automatic with Dexie useLiveQuery, but satisfies the requirement
    return new Promise(resolve => setTimeout(resolve, 500));
  });

  const loading = checkinsLoading || metricsLoading || goalLoading;

  // Greetings logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  // Alerts logic
  const alerts = useMemo(() => {
    if (!checkins || checkins.length === 0) return [];
    try {
      return detectAlerts(checkins, goal);
    } catch (error) {
      console.error('Error detecting alerts:', error);
      return [];
    }
  }, [checkins, goal]);

  // Variações desde o início
  const weightDelta = useMemo(() => {
    if (!checkins || checkins.length < 2) return undefined;
    const firstWeight = checkins[checkins.length - 1].weightKg;
    const currentWeight = checkins[0].weightKg;
    return currentWeight - firstWeight;
  }, [checkins]);

  const profileName = profile?.name?.split(' ')[0] || 'usuário';

  if (!loading && (!checkins || checkins.length === 0)) {
    return (
      <MainLayout title={`${greeting}, ${profileName}! 👋`}>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-48 h-48 bg-primary/5 rounded-full flex items-center justify-center mb-8 relative">
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Scale size={80} className="text-primary/30" />
            </motion.div>
            <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-spin-slow" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
            Comece sua jornada!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
            Registre seu primeiro peso e medidas para começar a acompanhar sua evolução científica.
          </p>
          
          <Button 
            size="lg" 
            fullWidth 
            onClick={() => navigate('/checkin/new')}
            className="group"
          >
            Fazer meu primeiro registro
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </MainLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MainLayout title={`${greeting}, ${profileName}! 👋`}>
      {/* Pull to Refresh Indicator */}
      <div 
        className="flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{ height: isRefreshing ? 60 : pullProgress * 60, opacity: pullProgress > 0.1 || isRefreshing ? 1 : 0 }}
      >
        <div className={clsx(
          "bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 transition-transform",
          isRefreshing && "animate-spin"
        )}>
          <RefreshCcw size={20} className="text-primary" />
        </div>
      </div>

      <motion.div 
        className="pb-8 overflow-x-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Alerts Section */}
        <motion.div variants={itemVariants}>
          <AlertBanner alerts={alerts} />
        </motion.div>

        {/* Charts & Goal Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <motion.div variants={itemVariants}>
            <MiniWeightChart checkins={checkins} loading={loading} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GoalProgress 
              goal={goal} 
              currentWeight={latestCheckin?.weightKg || 0} 
              startWeight={checkins?.[checkins.length - 1]?.weightKg || 0}
              loading={loading}
            />
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <MetricCard
              title="Peso Atual"
              value={latestCheckin?.weightKg || '—'}
              unit="kg"
              delta={weightDelta}
              deltaLabel="desde o início"
              icon={Scale}
              loading={loading}
              inverse={goal?.objective === 'lose'}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <MetricCard
              title="% Gordura"
              value={metrics?.bodyFatPct ? metrics.bodyFatPct.toFixed(1) : '—'}
              unit="%"
              category={metrics?.bodyFatCategory || undefined}
              categoryColor={
                metrics?.bodyFatCategory === 'Atlético' || metrics?.bodyFatCategory === 'Fitness' ? 'green' : 
                metrics?.bodyFatCategory === 'Aceitável' ? 'blue' : 'red'
              }
              icon={Activity}
              loading={loading}
              inverse
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <MetricCard
              title="IMC"
              value={metrics?.bmi ? metrics.bmi.toFixed(1) : '—'}
              category={metrics?.bmiCategory || undefined}
              categoryColor={
                metrics?.bmiCategory === 'Peso normal' ? 'green' : 
                metrics?.bmiCategory === 'Abaixo do peso' || metrics?.bmiCategory === 'Sobrepeso' ? 'yellow' : 'red'
              }
              icon={CircleDot}
              loading={loading}
              inverse
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <MetricCard
              title="Gasto Diário (TDEE)"
              value={metrics?.tdee || '—'}
              unit="kcal"
              deltaLabel="para manutenção"
              icon={Zap}
              loading={loading}
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-2 sm:col-span-2 md:col-span-1"
          >
            <MetricCard
              title="Composição"
              value={metrics?.leanMassKg ? `${metrics.leanMassKg.toFixed(1)} / ${metrics.fatMassKg?.toFixed(1)}` : '—'}
              unit="kg"
              deltaLabel="massa magra / gorda"
              icon={Dna}
              loading={loading}
            />
          </motion.div>

          {(metrics?.whr || metrics?.whtr) && (
            <motion.div variants={itemVariants}>
              <MetricCard
                title="Risco (ICQ/ICA)"
                value={metrics?.whr ? metrics.whr.toFixed(2) : (metrics?.whtr?.toFixed(2) || '—')}
                category={metrics?.whrRisk || metrics?.whtrCategory || undefined}
                categoryColor={
                  (metrics?.whrRisk === 'Baixo' || metrics?.whtrCategory === 'Saudável') ? 'green' : 
                  (metrics?.whrRisk === 'Moderado' || metrics?.whtrCategory === 'Risco aumentado') ? 'yellow' : 'red'
                }
                icon={ShieldAlert}
                loading={loading}
                inverse
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};
