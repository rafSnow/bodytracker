/**
 * Helper para arredondar valores para 2 casas decimais.
 */
const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Calcula o Índice de Massa Corporal (IMC)
 * @param peso_kg Peso em quilogramas
 * @param altura_cm Altura em centímetros
 */
export const calculateIMC = (peso_kg: number, altura_cm: number): number => {
  if (altura_cm <= 0) return 0;
  const altura_m = altura_cm / 100;
  return round2(peso_kg / (altura_m * altura_m));
};

/**
 * Calcula a Relação Cintura-Quadril (RCQ)
 */
export const calculateRCQ = (cintura_cm: number, quadril_cm: number): number => {
  if (quadril_cm <= 0) return 0;
  return round2(cintura_cm / quadril_cm);
};

/**
 * Calcula a Relação Cintura-Estatura (RCEst)
 */
export const calculateRCEst = (cintura_cm: number, altura_cm: number): number => {
  if (altura_cm <= 0) return 0;
  return round2(cintura_cm / altura_cm);
};

/**
 * Calcula o percentual de gordura pelo método US Navy
 */
export const calculateUSNavyBF = (
  sexo: 'M' | 'F',
  altura_cm: number,
  pescoco_cm: number,
  cintura_cm: number,
  quadril_cm: number = 0
): number => {
  if (altura_cm <= 0 || pescoco_cm <= 0 || cintura_cm <= 0) return 0;
  let d = 0;

  if (sexo === 'M') {
    const diff = cintura_cm - pescoco_cm;
    if (diff <= 0) return 0;
    d = 1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(altura_cm);
  } else {
    const sum = cintura_cm + quadril_cm - pescoco_cm;
    if (sum <= 0 || quadril_cm <= 0) return 0;
    d = 1.29579 - 0.35004 * Math.log10(sum) + 0.22100 * Math.log10(altura_cm);
  }

  if (d <= 0) return 0;
  return round2(495 / d - 450);
};

/**
 * Calcula a Relative Fat Mass (RFM)
 */
export const calculateRFM = (sexo: 'M' | 'F', altura_cm: number, cintura_cm: number): number => {
  if (cintura_cm <= 0) return 0;
  const genderFactor = sexo === 'M' ? 0 : 1;
  return round2(64 - 20 * (altura_cm / cintura_cm) + 12 * genderFactor);
};

/**
 * Calcula o percentual de gordura via fórmula de Deurenberg
 */
export const calculateDeurenbergBF = (
  sexo: 'M' | 'F',
  peso_kg: number,
  altura_cm: number,
  idade: number
): number => {
  const imc = calculateIMC(peso_kg, altura_cm);
  if (imc <= 0) return 0;
  const genderFactor = sexo === 'M' ? 1 : 0;
  return round2(1.2 * imc + 0.23 * idade - 10.8 * genderFactor - 5.4);
};

/**
 * Calcula a Massa Magra (Lean Body Mass - LBM) usando a fórmula de Boer
 */
export const calculateBoerLBM = (sexo: 'M' | 'F', peso_kg: number, altura_cm: number): number => {
  if (sexo === 'M') {
    return round2(0.407 * peso_kg + 0.267 * altura_cm - 19.2);
  } else {
    return round2(0.252 * peso_kg + 0.473 * altura_cm - 48.3);
  }
};
