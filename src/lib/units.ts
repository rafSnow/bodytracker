export const kgToLbs = (kg: number): number => kg * 2.20462;
export const lbsToKg = (lbs: number): number => lbs / 2.20462;
export const cmToIn = (cm: number): number => cm / 2.54;
export const inToCm = (inches: number): number => inches * 2.54;

export const formatWeight = (kg: number, unit: 'kg' | 'lbs'): string => {
  const value = unit === 'kg' ? kg : kgToLbs(kg);
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unit}`;
};

export const formatHeight = (cm: number, unit: 'cm' | 'in'): string => {
  const value = unit === 'cm' ? cm : cmToIn(cm);
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unit}`;
};
