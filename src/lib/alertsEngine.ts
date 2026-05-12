import { CheckIn } from '../types/checkin';
import { Goal } from '../types/goal';
import { 
  Zap, 
  TrendingUp, 
  Calendar, 
  Target,
  LucideIcon 
} from 'lucide-react';

export type AlertType = 'recomposition' | 'fast_pace' | 'long_absence' | 'goal_near';

export interface Alert {
  type: AlertType;
  message: string;
  color: 'blue' | 'green' | 'orange' | 'red';
  icon: LucideIcon;
}

export function detectAlerts(checkins: CheckIn[], goal: Goal | null): Alert[] {
  const alerts: Alert[] = [];
  if (!checkins || checkins.length === 0) return alerts;

  const latest = checkins[0];
  const now = new Date();
  const latestDate = new Date(latest.date);

  // 1. Ausência longa: último check-in há > 14 dias
  const daysSinceLatest = (now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLatest > 14) {
    alerts.push({
      type: 'long_absence',
      message: `Faz ${Math.floor(daysSinceLatest)} dias que você não se registra. Vamos atualizar os dados?`,
      color: 'orange',
      icon: Calendar,
    });
  }

  // 2. Meta próxima: data alvo em ≤ 7 dias
  if (goal?.targetDate) {
    const targetDate = new Date(goal.targetDate);
    const daysUntilTarget = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    // Se o peso alvo ainda não foi atingido
    const weightReached = goal.objective === 'lose' 
      ? latest.weightKg <= goal.targetWeightKg 
      : latest.weightKg >= goal.targetWeightKg;

    if (daysUntilTarget >= 0 && daysUntilTarget <= 7 && !weightReached) {
      alerts.push({
        type: 'goal_near',
        message: `Faltam apenas ${Math.ceil(daysUntilTarget)} dias para sua data alvo! Mantenha o foco.`,
        color: 'blue',
        icon: Target,
      });
    }
  }

  // Lógica para Recomposição e Ritmo Acelerado requer pelo menos 2 registros
  if (checkins.length < 2) return alerts;

  // 3. Ritmo acelerado: perda/ganho > 1% do peso por semana nas últimas 2 semanas
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(now.getDate() - 14);
  
  const recentCheckins = checkins.filter(c => new Date(c.date) >= twoWeeksAgo);
  if (recentCheckins.length >= 2) {
    const firstOfRecent = recentCheckins[recentCheckins.length - 1];
    const weightDiff = latest.weightKg - firstOfRecent.weightKg;
    const timeDiffDays = (new Date(latest.date).getTime() - new Date(firstOfRecent.date).getTime()) / (1000 * 60 * 60 * 24);
    
    if (timeDiffDays >= 3) { // Garantir um intervalo mínimo para o cálculo
      const weeklyRatePct = (weightDiff / firstOfRecent.weightKg) / (timeDiffDays / 7);
      
      if (Math.abs(weeklyRatePct) > 0.01) {
        alerts.push({
          type: 'fast_pace',
          message: `Seu ritmo de ${weeklyRatePct > 0 ? 'ganho' : 'perda'} está acelerado (${(Math.abs(weeklyRatePct) * 100).toFixed(1)}%/sem). Cuidado com a saúde!`,
          color: 'red',
          icon: Zap,
        });
      }
    }
  }

  // 4. Recomposição: peso variou < 1% nos últimos 30 dias MAS cintura reduziu > 2cm
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const monthCheckins = checkins.filter(c => new Date(c.date) >= thirtyDaysAgo);
  
  if (monthCheckins.length >= 2) {
    const startOfMonth = monthCheckins[monthCheckins.length - 1];
    const weightVarPct = Math.abs(latest.weightKg - startOfMonth.weightKg) / startOfMonth.weightKg;
    
    if (latest.waistCm && startOfMonth.waistCm) {
      const waistDiff = startOfMonth.waistCm - latest.waistCm;
      
      if (weightVarPct < 0.01 && waistDiff >= 2) {
        alerts.push({
          type: 'recomposition',
          message: 'Detectamos uma recomposição corporal! Seu peso está estável mas suas medidas diminuíram. Incrível!',
          color: 'green',
          icon: TrendingUp,
        });
      }
    }
  }

  return alerts;
}
