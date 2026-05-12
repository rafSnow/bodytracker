import React, { useState } from 'react';
import { Target, Edit2, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { useGoal } from '../hooks/useGoal';
import { useCheckins } from '../hooks/useCheckins';
import { useMetrics } from '../hooks/useMetrics';
import { useChartData } from '../hooks/useChartData';
import { GoalForm } from '../components/goal/GoalForm';
import { GoalProjection } from '../components/goal/GoalProjection';
import { PaceWarning } from '../components/goal/PaceWarning';
import { WeightChart } from '../components/charts/WeightChart';
import { calculateGoalMetrics } from '../lib/goalEngine';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';

export const GoalPage: React.FC = () => {
  const { goal, loading: goalLoading, saveGoal, deleteGoal } = useGoal();
  const { checkins, loading: checkinsLoading } = useCheckins();
  const { latestCheckin, loading: metricsLoading } = useMetrics();
  const { weightData, loading: chartLoading } = useChartData();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loading = goalLoading || checkinsLoading || metricsLoading || chartLoading;

  if (loading) {
    return (
      <MainLayout title="Meta">
        <div className="space-y-6 p-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </MainLayout>
    );
  }

  const currentWeight = latestCheckin?.weightKg || 0;
  
  // Últimos 30 dias para a tendência
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCheckins = checkins.filter(c => new Date(c.date) >= thirtyDaysAgo);

  const metrics = goal 
    ? calculateGoalMetrics(currentWeight, goal.targetWeightKg, goal.targetDate, recentCheckins)
    : null;

  const handleSave = async (data: any) => {
    await saveGoal(data);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteGoal();
    setShowDeleteModal(false);
  };

  // Se não tem meta ou está editando
  if (!goal || isEditing) {
    return (
      <MainLayout 
        title={isEditing ? "Editar Meta" : "Nova Meta"}
        headerLeftAction={isEditing ? (
          <button onClick={() => setIsEditing(false)} className="p-2 -ml-2 text-slate-600 dark:text-slate-400">
            <ArrowLeft size={20} />
          </button>
        ) : undefined}
      >
        <div className="p-4 max-w-2xl mx-auto">
          {currentWeight === 0 ? (
            <Card className="p-10 text-center flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full">
                <Plus size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum registro encontrado</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-1">
                  Você precisa registrar seu peso atual antes de definir uma meta.
                </p>
              </div>
              <Button variant="primary" onClick={() => window.location.hash = '/checkin/new'}>
                Fazer primeiro registro
              </Button>
            </Card>
          ) : (
            <GoalForm 
              currentWeight={currentWeight}
              recentCheckins={recentCheckins}
              initialValues={isEditing ? goal : null}
              onSubmit={handleSave}
              onCancel={isEditing ? () => setIsEditing(false) : undefined}
            />
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Sua Meta"
      headerRightAction={
        <div className="flex gap-1">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <Edit2 size={20} />
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-danger transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      }
    >
      <div className="p-4 space-y-6 max-w-2xl mx-auto pb-20">
        <GoalProjection 
          currentWeight={currentWeight}
          targetWeight={goal.targetWeightKg}
          weeklyRateKg={metrics?.weeklyRateKg || 0}
          weeklyRatePct={metrics?.weeklyRatePct || 0}
          dailyCalorieAdjustment={metrics?.dailyCalorieAdjustment || 0}
          estimatedCompletionDate={metrics?.estimatedCompletionDate || null}
          objective={goal.objective}
        />

        {metrics && (
          <PaceWarning 
            isRateSafe={metrics.isRateSafe} 
            rateWarning={metrics.rateWarning}
          />
        )}

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-primary" />
            <h3 className="font-bold text-slate-900 dark:text-white">Evolução e Meta</h3>
          </div>
          <WeightChart data={weightData || []} />
        </Card>

        <div className="flex flex-col gap-3">
          <Button variant="secondary" className="w-full" onClick={() => setIsEditing(true)}>
            <Edit2 size={18} className="mr-2" />
            Editar Meta
          </Button>
          <Button variant="ghost" className="w-full text-slate-400 hover:text-danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={18} className="mr-2" />
            Arquivar Meta
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Arquivar Meta"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Deseja realmente arquivar sua meta atual? Seus registros de progresso não serão afetados.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
