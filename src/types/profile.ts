export enum ActivityLevel {
  Sedentary = 1.2,
  LightlyActive = 1.375,
  ModeratelyActive = 1.55,
  VeryActive = 1.725,
  ExtremelyActive = 1.9,
}

export interface Profile {
  id: 1;
  name: string;
  birthDate: string;
  sex: 'M' | 'F';
  heightCm: number;
  activityLevel: ActivityLevel;
  createdAt: string;
  updatedAt: string;
}
