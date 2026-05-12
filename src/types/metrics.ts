export interface CalculatedMetrics {
  bmi: number | null;
  bmiCategory: string | null;
  bodyFatPct: number | null;
  bodyFatCategory: string | null;
  fatMassKg: number | null;
  leanMassKg: number | null;
  bmr: number | null;
  tdee: number | null;
  tdeeDeficit: { low: number; high: number } | null;
  tdeeSurplus: { low: number; high: number } | null;
  whr: number | null;
  whrRisk: string | null;
  whtr: number | null;
  whtrCategory: string | null;
  idealWeightKg: { min: number; max: number } | null;
}
