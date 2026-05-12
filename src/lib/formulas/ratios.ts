export function calculateWHR(
  waistCm: number | undefined,
  hipCm: number | undefined,
  sex: 'M' | 'F'
): { whr: number; whrRisk: string } | null {
  if (!waistCm || !hipCm) return null;

  const whr = waistCm / hipCm;
  let whrRisk = '';

  if (sex === 'M') {
    if (whr < 0.9) whrRisk = 'Baixo';
    else if (whr < 1.0) whrRisk = 'Moderado';
    else whrRisk = 'Alto';
  } else {
    if (whr < 0.8) whrRisk = 'Baixo';
    else if (whr < 0.85) whrRisk = 'Moderado';
    else whrRisk = 'Alto';
  }

  return {
    whr: parseFloat(whr.toFixed(2)),
    whrRisk,
  };
}

export function calculateWHTR(
  waistCm: number | undefined,
  heightCm: number
): { whtr: number; whtrCategory: string } | null {
  if (!waistCm) return null;

  const whtr = waistCm / heightCm;
  let whtrCategory = '';

  if (whtr < 0.4) whtrCategory = 'Abaixo do esperado';
  else if (whtr < 0.5) whtrCategory = 'Saudável';
  else if (whtr < 0.6) whtrCategory = 'Risco aumentado';
  else whtrCategory = 'Risco muito alto';

  return {
    whtr: parseFloat(whtr.toFixed(2)),
    whtrCategory,
  };
}
