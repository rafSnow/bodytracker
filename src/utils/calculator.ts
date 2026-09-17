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

/**
 * Calcula a Taxa Metabólica Basal (BMR) usando a fórmula de Katch-McArdle.
 * É considerada mais precisa para pessoas com histórico de composição corporal pois usa a Massa Magra.
 * @param lbm_kg Massa Magra em quilogramas (Lean Body Mass)
 */
export const calculateKatchMcArdleBMR = (lbm_kg: number): number => {
  if (lbm_kg <= 0) return 0;
  return round2(370 + (21.6 * lbm_kg));
};

/**
 * Calcula o Gasto Energético Total Diário (TDEE).
 * @param bmr Taxa Metabólica Basal
 * @param activityMultiplier Fator de Atividade (1.2 sedentário a 1.9 muito ativo)
 */
export const calculateTDEE = (bmr: number, activityMultiplier: number): number => {
  if (bmr <= 0 || activityMultiplier <= 0) return 0;
  return round2(bmr * activityMultiplier);
};

// --- FASE 6: Peso Ideal (IBW) e Metas Nutricionais ---

/**
 * Calcula o Peso Ideal (IBW) usando as 4 fórmulas principais.
 * Utiliza a base de 152.4 cm (5 feet) para o cálculo de polegadas/cm extras.
 */
export const calculateIBW = (sexo: 'M' | 'F', altura_cm: number) => {
  if (altura_cm <= 0) {
    return { devine: 0, robinson: 0, miller: 0, hamwi: 0 };
  }

  const alturaBaseCm = 152.4;
  const cmExtras = Math.max(0, altura_cm - alturaBaseCm);
  const inchesExtras = cmExtras / 2.54;

  let devine, robinson, miller, hamwi;

  if (sexo === 'M') {
    devine = 50.0 + (2.3 * inchesExtras);
    robinson = 52.0 + (1.9 * inchesExtras);
    miller = 56.2 + (1.41 * inchesExtras);
    hamwi = 48.0 + (1.1 * cmExtras);
  } else {
    devine = 45.5 + (2.3 * inchesExtras);
    robinson = 49.0 + (1.7 * inchesExtras);
    miller = 53.1 + (1.36 * inchesExtras);
    hamwi = 45.0 + (0.9 * cmExtras);
  }

  return {
    devine: round2(devine),
    robinson: round2(robinson),
    miller: round2(miller),
    hamwi: round2(hamwi),
  };
};

export type Objetivo = 'emagrecimento' | 'manutencao' | 'hipertrofia';

/**
 * Calcula a meta de calorias diárias e a divisão de macronutrientes 
 * com base no TDEE e no objetivo selecionado.
 */
export const calculateMacrosAndGoals = (tdee: number, objetivo: Objetivo) => {
  if (tdee <= 0) {
    return {
      targetCalories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
      grams: { protein: 0, carbs: 0, fat: 0 }
    };
  }

  let targetCalories = tdee;
  let proteinPct = 0;
  let carbsPct = 0;
  let fatPct = 0;

  switch (objetivo) {
    case 'emagrecimento':
      targetCalories = tdee - 500; // Déficit de 500kcal (~0.5kg/semana)
      proteinPct = 0.40; // High protein para segurar massa magra
      carbsPct = 0.30;
      fatPct = 0.30;
      break;
    case 'manutencao':
      targetCalories = tdee;
      proteinPct = 0.30;
      carbsPct = 0.40;
      fatPct = 0.30;
      break;
    case 'hipertrofia':
      targetCalories = tdee + 300; // Superávit de 300kcal para clean bulk
      proteinPct = 0.25; // Suficiente p/ hipertrofia (resto é energia)
      carbsPct = 0.50;
      fatPct = 0.25;
      break;
  }

  // Prevenir calorias alvo perigosamente baixas
  if (targetCalories < 1200) targetCalories = 1200;

  // 1g prot = 4kcal, 1g carb = 4kcal, 1g gordura = 9kcal
  const proteinCals = targetCalories * proteinPct;
  const carbsCals = targetCalories * carbsPct;
  const fatCals = targetCalories * fatPct;

  return {
    targetCalories: round2(targetCalories),
    macros: {
      protein: Math.round(proteinPct * 100),
      carbs: Math.round(carbsPct * 100),
      fat: Math.round(fatPct * 100),
    },
    grams: {
      protein: Math.round(proteinCals / 4),
      carbs: Math.round(carbsCals / 4),
      fat: Math.round(fatCals / 9),
    }
  };
};

// --- FASE 7: Índices Avançados de Risco ---

/**
 * Body Adiposity Index (BAI)
 * Fórmula: (quadril(cm) / altura(m)^1.5) - 18
 */
export const calculateBAI = (quadril_cm: number, altura_cm: number): number => {
  if (quadril_cm <= 0 || altura_cm <= 0) return 0;
  const altura_m = altura_cm / 100;
  const bai = (quadril_cm / Math.pow(altura_m, 1.5)) - 18;
  return round2(bai);
};

/**
 * Body Roundness Index (BRI)
 * Fórmula: 364.2 - 365.5 * sqrt(1 - (cintura(m) / (pi * altura(m)))^2)
 */
export const calculateBRI = (cintura_cm: number, altura_cm: number): number => {
  if (cintura_cm <= 0 || altura_cm <= 0) return 0;
  const cintura_m = cintura_cm / 100;
  const altura_m = altura_cm / 100;
  
  const base = cintura_m / (Math.PI * altura_m);
  const valor_raiz = 1 - (base * base);
  if (valor_raiz < 0) return 0;
  
  const bri = 364.2 - 365.5 * Math.sqrt(valor_raiz);
  return round2(bri);
};

/**
 * Índice de Conicidade (CI)
 * Fórmula: cintura(m) / (0.109 * sqrt(peso(kg) / altura(m)))
 */
export const calculateCI = (cintura_cm: number, peso_kg: number, altura_cm: number): number => {
  if (cintura_cm <= 0 || peso_kg <= 0 || altura_cm <= 0) return 0;
  const cintura_m = cintura_cm / 100;
  const altura_m = altura_cm / 100;
  
  const denominator = 0.109 * Math.sqrt(peso_kg / altura_m);
  if (denominator === 0) return 0;
  
  const ci = cintura_m / denominator;
  return round2(ci);
};
