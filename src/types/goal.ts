export interface Goal {
  id: 1;
  targetWeightKg: number;
  targetDate?: string;
  objective: 'lose' | 'gain' | 'maintain';
  createdAt: string;
  updatedAt: string;
}
