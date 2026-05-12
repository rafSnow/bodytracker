import { describe, it, expect } from 'vitest';
import { detectAlerts } from '../alertsEngine';
import { CheckIn } from '../../types/checkin';
import { Goal } from '../../types/goal';

describe('alertsEngine', () => {
  const now = new Date();
  
  const mockCheckin: CheckIn = {
    date: now.toISOString(),
    weightKg: 80,
    waistCm: 85,
    createdAt: '',
    updatedAt: ''
  };

  it('should detect long absence (> 14 days)', () => {
    const oldDate = new Date();
    oldDate.setDate(now.getDate() - 15);
    const oldCheckin: CheckIn = { ...mockCheckin, date: oldDate.toISOString() };
    
    const alerts = detectAlerts([oldCheckin], null);
    expect(alerts.some(a => a.type === 'long_absence')).toBe(true);
  });

  it('should detect goal near (<= 7 days and not reached)', () => {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + 5);
    
    const goal: Goal = {
      id: 1,
      targetWeightKg: 75,
      targetDate: targetDate.toISOString(),
      objective: 'lose',
      createdAt: '',
      updatedAt: ''
    };
    
    const alerts = detectAlerts([mockCheckin], goal);
    expect(alerts.some(a => a.type === 'goal_near')).toBe(true);
  });

  it('should not detect goal near if already reached', () => {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + 5);
    
    const goal: Goal = {
      id: 1,
      targetWeightKg: 80, // reached
      targetDate: targetDate.toISOString(),
      objective: 'lose',
      createdAt: '',
      updatedAt: ''
    };
    
    const alerts = detectAlerts([mockCheckin], goal);
    expect(alerts.some(a => a.type === 'goal_near')).toBe(false);
  });

  it('should detect fast pace (> 1%/week)', () => {
    const firstDate = new Date();
    firstDate.setDate(now.getDate() - 7);
    const firstCheckin: CheckIn = { date: firstDate.toISOString(), weightKg: 82, createdAt: '', updatedAt: '' };
    const latestCheckin: CheckIn = { date: now.toISOString(), weightKg: 80, createdAt: '', updatedAt: '' };
    
    // Perda de 2kg em 1 semana (2.4% do peso inicial)
    const alerts = detectAlerts([latestCheckin, firstCheckin], null);
    expect(alerts.some(a => a.type === 'fast_pace')).toBe(true);
  });

  it('should detect recomposition (stable weight, reduced waist)', () => {
    const firstDate = new Date();
    firstDate.setDate(now.getDate() - 20);
    const firstCheckin: CheckIn = { date: firstDate.toISOString(), weightKg: 80, waistCm: 90, createdAt: '', updatedAt: '' };
    const latestCheckin: CheckIn = { date: now.toISOString(), weightKg: 80.2, waistCm: 87, createdAt: '', updatedAt: '' };
    
    const alerts = detectAlerts([latestCheckin, firstCheckin], null);
    expect(alerts.some(a => a.type === 'recomposition')).toBe(true);
  });
});
