import { describe, it, expect } from 'vitest';
import { calculateWHR, calculateWHTR } from '../ratios';

describe('calculateWHR', () => {
  it('should calculate WHR and risk correctly for males', () => {
    expect(calculateWHR(80, 95, 'M')?.whrRisk).toBe('Baixo');
    expect(calculateWHR(92, 95, 'M')?.whrRisk).toBe('Moderado');
    expect(calculateWHR(100, 95, 'M')?.whrRisk).toBe('Alto');
  });

  it('should calculate WHR and risk correctly for females', () => {
    expect(calculateWHR(70, 95, 'F')?.whrRisk).toBe('Baixo');
    expect(calculateWHR(78, 95, 'F')?.whrRisk).toBe('Moderado');
    expect(calculateWHR(85, 95, 'F')?.whrRisk).toBe('Alto');
  });
});

describe('calculateWHTR', () => {
  it('should calculate WHtR and categories correctly', () => {
    expect(calculateWHTR(65, 175)?.whtrCategory).toBe('Abaixo do esperado');
    expect(calculateWHTR(80, 175)?.whtrCategory).toBe('Saudável');
    expect(calculateWHTR(95, 175)?.whtrCategory).toBe('Risco aumentado');
    expect(calculateWHTR(110, 175)?.whtrCategory).toBe('Risco muito alto');
  });
});
