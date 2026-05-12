export interface CheckIn {
  id?: number;
  date: string;
  weightKg: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  forearmCm?: number;
  wristCm?: number;
  thighCm?: number;
  calfCm?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
