import { describe, it, expect } from 'vitest';
import { calculateBMI } from '../bmi';

describe('calculateBMI', () => {
  it('should calculate BMI correctly', () => {
    const { bmi, bmiCategory } = calculateBMI(70, 175);
    expect(bmi).toBe(22.9);
    expect(bmiCategory).toBe('Peso normal');
  });

  it('should categorize "Abaixo do peso" correctly', () => {
    const { bmiCategory } = calculateBMI(50, 175);
    expect(bmiCategory).toBe('Abaixo do peso');
  });

  it('should categorize "Sobrepeso" correctly', () => {
    const { bmiCategory } = calculateBMI(85, 175);
    expect(bmiCategory).toBe('Sobrepeso');
  });

  it('should categorize "Obesidade" levels correctly', () => {
    expect(calculateBMI(100, 175).bmiCategory).toBe('Obesidade Grau I');
    expect(calculateBMI(110, 175).bmiCategory).toBe('Obesidade Grau II');
    expect(calculateBMI(130, 175).bmiCategory).toBe('Obesidade Grau III');
  });
});
