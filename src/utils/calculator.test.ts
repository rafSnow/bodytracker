import { describe, it, expect } from 'vitest';
import { 
  calculateUSNavyBF, calculateRFM, calculateBoerLBM, 
  calculateIMC, calculateRCQ, calculateRCEst, calculateDeurenbergBF 
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
    
    // Edge Cases e Validações
    it('deve retornar 0 se os parâmetros forem inválidos ou menores que zero', () => {
      expect(calculateUSNavyBF('M', 0, 38, 86)).toBe(0);
      expect(calculateUSNavyBF('M', -10, 38, 86)).toBe(0);
      expect(calculateUSNavyBF('F', 165, 34, 70, 0)).toBe(0); // Faltando quadril
    });

    it('deve retornar 0 se a diferença entre cintura e pescoço for negativa ou zero (Homens)', () => {
      expect(calculateUSNavyBF('M', 178, 90, 80)).toBe(0); // Cintura < Pescoço
    });
  });

  describe('Relative Fat Mass (RFM)', () => {
    it('deve calcular corretamente para homem', () => {
      expect(calculateRFM('M', 178, 86)).toBe(22.6);
    });

    it('deve calcular corretamente para mulher', () => {
      expect(calculateRFM('F', 165, 70)).toBe(28.86);
    });

    it('deve retornar 0 para evitar divisão por zero se a cintura for 0', () => {
      expect(calculateRFM('M', 178, 0)).toBe(0);
      expect(calculateRFM('F', 178, -5)).toBe(0); // Valores negativos na cintura
    });
  });

  describe('Massa Magra (Fórmula de Boer)', () => {
    it('deve calcular corretamente para homem', () => {
      expect(calculateBoerLBM('M', 80, 178)).toBe(60.89);
    });

    it('deve calcular corretamente para mulher', () => {
      expect(calculateBoerLBM('F', 65, 165)).toBe(46.13);
    });
  });

  describe('Fórmula Deurenberg (Baseada no IMC)', () => {
    it('deve calcular corretamente para homem', () => {
      // Peso: 80, Altura: 178 -> IMC: 25.25
      // Deurenberg H: (1.20 * 25.25) + (0.23 * 30) - (10.8 * 1) - 5.4 = 30.3 + 6.9 - 10.8 - 5.4 = 21.0
      expect(calculateDeurenbergBF('M', 80, 178, 30)).toBeCloseTo(21.0, 1);
    });

    it('deve calcular corretamente para mulher', () => {
      // Peso: 65, Altura: 165 -> IMC: 23.87
      // Deurenberg M: (1.2 * 23.87) + (0.23 * 28) - (10.8 * 0) - 5.4 = 28.64 + 6.44 - 5.4 = 29.68
      expect(calculateDeurenbergBF('F', 65, 165, 28)).toBeCloseTo(29.68, 1);
    });

    it('deve retornar 0 se peso ou altura forem inválidos', () => {
      expect(calculateDeurenbergBF('M', 0, 178, 30)).toBe(0);
      expect(calculateDeurenbergBF('M', 80, 0, 30)).toBe(0);
    });
  });

  describe('Índices Básicos (IMC, RCQ, RCEst)', () => {
    it('deve calcular o IMC corretamente e não quebrar com altura 0', () => {
      expect(calculateIMC(80, 178)).toBe(25.25);
      expect(calculateIMC(80, 0)).toBe(0);
    });

    it('deve calcular RCQ e tratar divisão por zero', () => {
      expect(calculateRCQ(80, 100)).toBe(0.8);
      expect(calculateRCQ(80, 0)).toBe(0);
    });

    it('deve calcular RCEst e tratar divisão por zero', () => {
      expect(calculateRCEst(80, 160)).toBe(0.5);
      expect(calculateRCEst(80, 0)).toBe(0);
    });
  });
});
