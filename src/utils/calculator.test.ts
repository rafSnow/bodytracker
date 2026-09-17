import { describe, it, expect } from 'vitest';
import { 
  calculateUSNavyBF, calculateRFM, calculateBoerLBM, 
  calculateKatchMcArdleBMR, calculateTDEE,
  calculateIMC, calculateRCQ, calculateRCEst, calculateDeurenbergBF,
  calculateIBW, calculateMacrosAndGoals,
  calculateBAI, calculateBRI, calculateCI
} from './calculator';

describe('Calculator Functions - Business Logic', () => {
  
  describe('US Navy Body Fat Formula', () => {
    it('deve calcular corretamente para homem', () => {
      const result = calculateUSNavyBF('M', 178, 38, 86);
      expect(result).toBeCloseTo(17.2, 1);
    });

    it('deve calcular corretamente para mulher', () => {
      const result = calculateUSNavyBF('F', 165, 34, 70, 95);
      expect(result).toBeCloseTo(23.82, 1);
    });
    
    it('deve retornar 0 se os parametros forem invalidos ou menores que zero', () => {
      expect(calculateUSNavyBF('M', 0, 38, 86)).toBe(0);
      expect(calculateUSNavyBF('M', -10, 38, 86)).toBe(0);
      expect(calculateUSNavyBF('F', 165, 34, 70, 0)).toBe(0); 
    });

    it('deve retornar 0 se a diferenca entre cintura e pescoco for negativa ou zero (Homens)', () => {
      expect(calculateUSNavyBF('M', 178, 90, 80)).toBe(0);
    });
  });

  describe('Relative Fat Mass (RFM)', () => {
    it('deve calcular corretamente para homem', () => {
      expect(calculateRFM('M', 178, 86)).toBe(22.6);
    });

    it('deve calcular corretamente para mulher', () => {
      expect(calculateRFM('F', 165, 70)).toBe(28.86);
    });

    it('deve retornar 0 para evitar divisao por zero se a cintura for 0', () => {
      expect(calculateRFM('M', 178, 0)).toBe(0);
      expect(calculateRFM('F', 178, -5)).toBe(0);
    });
  });

  describe('calculateBoerLBM', () => {
    it('deve calcular massa magra corretamente para homens', () => {
      expect(calculateBoerLBM('M', 80, 180)).toBe(61.42);
    });

    it('deve calcular massa magra corretamente para mulheres', () => {
      expect(calculateBoerLBM('F', 65, 165)).toBe(46.13);
    });
  });

  describe('calculateKatchMcArdleBMR', () => {
    it('deve calcular TMB baseada em Massa Magra', () => {
      expect(calculateKatchMcArdleBMR(60)).toBe(1666);
    });

    it('deve retornar 0 para massa magra <= 0', () => {
      expect(calculateKatchMcArdleBMR(0)).toBe(0);
      expect(calculateKatchMcArdleBMR(-5)).toBe(0);
    });
  });

  describe('calculateTDEE', () => {
    it('deve calcular TDEE multiplicando TMB pelo fator de atividade', () => {
      expect(calculateTDEE(1666, 1.55)).toBe(2582.3);
    });

    it('deve retornar 0 se inputs forem invalidos', () => {
      expect(calculateTDEE(0, 1.2)).toBe(0);
      expect(calculateTDEE(2000, 0)).toBe(0);
    });
  });

  describe('Formula Deurenberg (Baseada no IMC)', () => {
    it('deve calcular corretamente para homem', () => {
      expect(calculateDeurenbergBF('M', 80, 178, 30)).toBeCloseTo(21.0, 1);
    });

    it('deve calcular corretamente para mulher', () => {
      expect(calculateDeurenbergBF('F', 65, 165, 28)).toBeCloseTo(29.68, 1);
    });

    it('deve retornar 0 se peso ou altura forem invalidos', () => {
      expect(calculateDeurenbergBF('M', 0, 178, 30)).toBe(0);
      expect(calculateDeurenbergBF('M', 80, 0, 30)).toBe(0);
    });
  });

  describe('Indices Basicos (IMC, RCQ, RCEst)', () => {
    it('deve calcular o IMC corretamente e nao quebrar com altura 0', () => {
      expect(calculateIMC(80, 178)).toBe(25.25);
      expect(calculateIMC(80, 0)).toBe(0);
    });

    it('deve calcular RCQ e tratar divisao por zero', () => {
      expect(calculateRCQ(80, 100)).toBe(0.8);
      expect(calculateRCQ(80, 0)).toBe(0);
    });

    it('deve calcular RCEst e tratar divisao por zero', () => {
      expect(calculateRCEst(80, 160)).toBe(0.5);
      expect(calculateRCEst(80, 0)).toBe(0);
    });
  });

  describe('calculateIBW', () => {
    it('deve calcular os quatro pesos ideais para homem', () => {
      const res = calculateIBW('M', 180);
      expect(res.devine).toBeCloseTo(74.99, 1);
      expect(res.robinson).toBeCloseTo(72.65, 1);
      expect(res.hamwi).toBeCloseTo(78.36, 1);
    });

    it('deve calcular os quatro pesos ideais para mulher', () => {
      const res = calculateIBW('F', 165);
      expect(res.devine).toBeCloseTo(56.91, 1);
    });

    it('deve retornar base zero se altura for <= 0', () => {
      const res = calculateIBW('M', 0);
      expect(res.devine).toBe(0);
    });
  });

  describe('calculateMacrosAndGoals', () => {
    it('deve calcular emagrecimento (-500 kcal)', () => {
      const res = calculateMacrosAndGoals(2500, 'emagrecimento');
      expect(res.targetCalories).toBe(2000);
      expect(res.grams.protein).toBe(200);
      expect(res.grams.carbs).toBe(150);
      expect(res.grams.fat).toBe(67);
    });

    it('nao deve descer abaixo de 1200 kcal', () => {
      const res = calculateMacrosAndGoals(1500, 'emagrecimento');
      expect(res.targetCalories).toBe(1200);
    });
  });

  describe('Índices Avançados de Risco', () => {
    it('deve calcular BAI (Body Adiposity Index)', () => {
      // quadril = 100cm, altura = 1.70m -> 1.70^1.5 ≈ 2.217
      // (100 / 2.217) - 18 = 45.1 - 18 = 27.1
      expect(calculateBAI(100, 170)).toBeCloseTo(27.1, 1);
      expect(calculateBAI(0, 170)).toBe(0);
    });

    it('deve calcular BRI (Body Roundness Index)', () => {
      // cintura = 80cm, altura = 1.70m -> 0.8, 1.7
      // base = 0.8 / (PI * 1.7) = 0.8 / 5.34 = 0.1498
      // raiz = 1 - (0.1498^2) = 0.9775
      // bri = 364.2 - 365.5 * sqrt(0.9775) = 364.2 - 365.5 * 0.9887 = 364.2 - 361.37 = 2.83
      expect(calculateBRI(80, 170)).toBeCloseTo(2.83, 1);
      expect(calculateBRI(0, 170)).toBe(0);
    });

    it('deve calcular CI (Conicity Index)', () => {
      // cintura = 80cm (0.8m), peso = 70kg, altura = 1.70m
      // denom = 0.109 * sqrt(70 / 1.70) = 0.109 * sqrt(41.17) = 0.109 * 6.417 = 0.6994
      // ci = 0.8 / 0.6994 = 1.14
      expect(calculateCI(80, 70, 170)).toBeCloseTo(1.14, 1);
      expect(calculateCI(80, 0, 170)).toBe(0);
    });
  });
});
