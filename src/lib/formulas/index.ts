import { CheckIn } from '../../types/checkin';
import { Profile } from '../../types/profile';
import { CalculatedMetrics } from '../../types/metrics';
import { calculateBMI } from './bmi';
import { calculateNavyBodyFat } from './bodyFat';
import { calculateMetabolism } from './metabolism';
import { calculateWHR, calculateWHTR } from './ratios';
import { calculateIdealWeight } from './idealWeight';

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function calculateAllMetrics(checkin: CheckIn, profile: Profile): CalculatedMetrics {
  const age = getAge(profile.birthDate);
  
  const bmiResults = calculateBMI(checkin.weightKg, profile.heightCm);
  const navyBF = calculateNavyBodyFat(
    checkin.waistCm,
    checkin.neckCm,
    profile.heightCm,
    profile.sex,
    checkin.hipCm
  );
  
  const metabolism = calculateMetabolism(
    checkin.weightKg,
    profile.heightCm,
    age,
    profile.sex,
    profile.activityLevel
  );
  
  const whr = calculateWHR(checkin.waistCm, checkin.hipCm, profile.sex);
  const whtr = calculateWHTR(checkin.waistCm, profile.heightCm);
  const idealWeight = calculateIdealWeight(profile.heightCm, profile.sex);

  let fatMassKg: number | null = null;
  let leanMassKg: number | null = null;

  if (navyBF) {
    fatMassKg = parseFloat((checkin.weightKg * (navyBF.bodyFatPct / 100)).toFixed(1));
    leanMassKg = parseFloat((checkin.weightKg - fatMassKg).toFixed(1));
  }

  return {
    ...bmiResults,
    bodyFatPct: navyBF?.bodyFatPct ?? null,
    bodyFatCategory: navyBF?.bodyFatCategory ?? null,
    fatMassKg,
    leanMassKg,
    ...metabolism,
    whr: whr?.whr ?? null,
    whrRisk: whr?.whrRisk ?? null,
    whtr: whtr?.whtr ?? null,
    whtrCategory: whtr?.whtrCategory ?? null,
    ...idealWeight,
  };
}
