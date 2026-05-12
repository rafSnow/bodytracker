export function calculateIdealWeight(
  heightCm: number,
  sex: 'M' | 'F'
): { idealWeightKg: { min: number; max: number } } {
  // Devine: 
  // Masc = 50 + 2.3 × (altura_pol − 60)
  // Fem = 45.5 + 2.3 × (altura_pol − 60)
  
  const heightInches = heightCm / 2.54;
  let baseWeight: number;

  if (sex === 'M') {
    baseWeight = 50 + 2.3 * (heightInches - 60);
  } else {
    baseWeight = 45.5 + 2.3 * (heightInches - 60);
  }

  // Retornar ± 10% como faixa
  return {
    idealWeightKg: {
      min: parseFloat((baseWeight * 0.9).toFixed(1)),
      max: parseFloat((baseWeight * 1.1).toFixed(1)),
    },
  };
}
