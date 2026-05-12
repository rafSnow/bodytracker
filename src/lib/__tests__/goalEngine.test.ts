import { describe, it, expect } from 'vitest';
import { calculateGoalMetrics } from '../goalEngine';
import { CheckIn } from '../../types/checkin';

describe('goalEngine', () => {
  const mockRecentCheckins: CheckIn[] = [
    {
      date: '2026-05-12T08:00:00Z',
      weightKg: 80,
      createdAt: '',
      updatedAt: ''
    },
    {
      date: '2026-05-05T08:00:00Z',
      weightKg: 81,
      createdAt: '',
      updatedAt: ''
    }
  ];

  it('should correctly identify "lose" objective', () => {
    const result = calculateGoalMetrics(80, 75, undefined, []);
    expect(result.objective).toBe('lose');
  });

  it('should correctly identify "gain" objective', () => {
    const result = calculateGoalMetrics(80, 85, undefined, []);
    expect(result.objective).toBe('gain');
  });

  it('should calculate correct weekly rate and calorie adjustment for weight loss', () => {
    // 80kg -> 75kg in 10 weeks (approx 70 days)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 70);
    
    const result = calculateGoalMetrics(80, 75, targetDate.toISOString(), []);
    
    expect(result.weeklyRateKg).toBeCloseTo(0.5, 1);
    expect(result.weeklyRatePct).toBe(0.63);
    // 0.5kg/week * 7700 kcal/kg / 7 days = 550 kcal/day
    expect(result.dailyCalorieAdjustment).toBeCloseTo(550, 0);
    expect(result.isRateSafe).toBe(true);
  });

  it('should warn when weight loss rate is too fast (> 1%/week)', () => {
    // 80kg -> 70kg in 10 weeks = 1kg/week = 1.25%/week
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 70);
    
    const result = calculateGoalMetrics(80, 70, targetDate.toISOString(), []);
    
    expect(result.isRateSafe).toBe(false);
    expect(result.rateWarning).toContain('perda agressivo');
  });

  it('should warn when weight gain rate is too fast (> 0.5%/week)', () => {
    // 80kg -> 85kg in 5 weeks = 1kg/week = 1.25%/week
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 35);
    
    const result = calculateGoalMetrics(80, 85, targetDate.toISOString(), []);
    
    expect(result.isRateSafe).toBe(false);
    expect(result.rateWarning).toContain('ganho agressivo');
  });

  it('should estimate completion date based on trend line', () => {
    // 81kg -> 80kg in 7 days = -1kg/week
    const result = calculateGoalMetrics(80, 75, undefined, mockRecentCheckins);
    
    expect(result.estimatedCompletionDate).toBeDefined();
    if (result.estimatedCompletionDate) {
      const completionDate = new Date(result.estimatedCompletionDate);
      const today = new Date();
      // Perda de 1kg a cada 7 dias, para perder mais 5kg faltam 35 dias
      const diffDays = (completionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(30);
      expect(diffDays).toBeLessThan(40);
    }
  });
});
