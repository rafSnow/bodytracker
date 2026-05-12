import { ActivityLevel } from '../../types/profile';

export function calculateMetabolism(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel
): {
  bmr: number;
  tdee: number;
  tdeeDeficit: { low: number; high: number };
  tdeeSurplus: { low: number; high: number };
} {
  // TMB Mifflin-St Jeor:
  // Masc: (10 × peso) + (6.25 × altura) − (5 × idade) + 5
  // Fem:  (10 × peso) + (6.25 × altura) − (5 × idade) − 161
  let bmr: number;

  if (sex === 'M') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
  }

  const tdee = bmr * activityLevel;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    tdeeDeficit: {
      low: Math.round(tdee - 500),
      high: Math.round(tdee - 300),
    },
    tdeeSurplus: {
      low: Math.round(tdee + 200),
      high: Math.round(tdee + 300),
    },
  };
}
