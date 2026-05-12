import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useChartData } from '../hooks/useChartData';
import { PeriodFilter } from '../components/charts/PeriodFilter';
import { WeightChart } from '../components/charts/WeightChart';
import { BodyCompositionChart } from '../components/charts/BodyCompositionChart';
import { MeasurementsChart } from '../components/charts/MeasurementsChart';
import { RecompositionChart } from '../components/charts/RecompositionChart';
import { BMIChart } from '../components/charts/BMIChart';
import { TDEEChart } from '../components/charts/TDEEChart';
import { MonthlyComparisonChart } from '../components/charts/MonthlyComparisonChart';
import { Card } from '../components/ui/Card';
import { 
  LineChart as LineChartIcon, 
  Layers, 
  Ruler, 
  Activity, 
  User, 
  Zap, 
  BarChart2 
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export const ChartsPage: React.FC = () => {
  const {
    weightData,
    compositionData,
    measurementsData,
    recompositionData,
    bmiData,
    tdeeData,
    monthlyData,
    loading,
    period,
    setPeriod,
  } = useChartData();

  const charts = [
    {
      title: 'Evolução do Peso',
      icon: LineChartIcon,
      component: <WeightChart data={weightData || []} />,
    },
    {
      title: 'Composição Corporal',
      icon: Layers,
      component: <BodyCompositionChart data={compositionData || []} />,
    },
    {
      title: 'Medidas Corporais',
      icon: Ruler,
      component: <MeasurementsChart data={measurementsData || []} />,
    },
    {
      title: 'Recomposição',
      icon: Activity,
      component: <RecompositionChart data={recompositionData || []} />,
    },
    {
      title: 'Histórico de IMC',
      icon: User,
      component: <BMIChart data={bmiData || []} />,
    },
    {
      title: 'Gasto Energético (TDEE)',
      icon: Zap,
      component: <TDEEChart data={tdeeData || []} />,
    },
    {
      title: 'Comparativo Mensal',
      icon: BarChart2,
      component: <MonthlyComparisonChart data={monthlyData || []} />,
    },
  ];

  return (
    <MainLayout title="Gráficos">
      <div className="space-y-6 pb-24">
        <div className="sticky top-0 z-10 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md pt-2 -mt-2">
          <PeriodFilter current={period} onChange={setPeriod} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-48 w-full rounded-lg" />
              </Card>
            ))
          ) : (
            charts.map((chart, index) => (
              <Card key={index}>
                <div className="flex items-center gap-2 mb-4">
                  <chart.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{chart.title}</h3>
                </div>
                {chart.component}
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};
