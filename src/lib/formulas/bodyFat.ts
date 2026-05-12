export function calculateNavyBodyFat(
  waistCm: number | undefined,
  neckCm: number | undefined,
  heightCm: number,
  sex: 'M' | 'F',
  hipCm?: number
): { bodyFatPct: number; bodyFatCategory: string } | null {
  if (!waistCm || !neckCm || (sex === 'F' && !hipCm)) {
    return null;
  }

  // As constantes da fórmula da Marinha (86.010, 70.041, etc) são para POLEGADAS.
  // Para usar com CM, convertemos as entradas.
  const waistIn = waistCm / 2.54;
  const neckIn = neckCm / 2.54;
  const heightIn = heightCm / 2.54;
  const hipIn = (hipCm || 0) / 2.54;

  let bodyFatPct: number;

  if (sex === 'M') {
    // Masculino (Inches): 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
    bodyFatPct =
      86.01 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
  } else {
    // Feminino (Inches): 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
    bodyFatPct =
      163.205 * Math.log10(waistIn + hipIn - neckIn) -
      97.684 * Math.log10(heightIn) -
      78.387;
  }

  let bodyFatCategory = '';

  if (sex === 'M') {
    if (bodyFatPct < 14) bodyFatCategory = 'Atlético';
    else if (bodyFatPct < 18) bodyFatCategory = 'Fitness';
    else if (bodyFatPct < 25) bodyFatCategory = 'Aceitável';
    else bodyFatCategory = 'Obesidade';
  } else {
    if (bodyFatPct < 21) bodyFatCategory = 'Atlético';
    else if (bodyFatPct < 25) bodyFatCategory = 'Fitness';
    else if (bodyFatPct < 32) bodyFatCategory = 'Aceitável';
    else bodyFatCategory = 'Obesidade';
  }

  return {
    bodyFatPct: parseFloat(bodyFatPct.toFixed(1)),
    bodyFatCategory,
  };
}
