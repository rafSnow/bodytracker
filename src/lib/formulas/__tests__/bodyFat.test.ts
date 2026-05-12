import { describe, it, expect } from 'vitest';
import { calculateNavyBodyFat } from '../bodyFat';

describe('calculateNavyBodyFat', () => {
  it('should calculate male body fat correctly', () => {
    // Valores de referência aproximados
    const result = calculateNavyBodyFat(80, 38, 175, 'M');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.bodyFatPct).toBeCloseTo(12.8, 1);
      expect(result.bodyFatCategory).toBe('Atlético');
    }
  });

  it('should calculate female body fat correctly', () => {
    const result = calculateNavyBodyFat(70, 32, 165, 'F', 95);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.bodyFatPct).toBeCloseTo(25.1, 1);
      expect(result.bodyFatCategory).toBe('Aceitável');
    }
  });

  it('should return null if required fields are missing', () => {
    expect(calculateNavyBodyFat(undefined, 38, 175, 'M')).toBeNull();
    expect(calculateNavyBodyFat(80, undefined, 175, 'M')).toBeNull();
    expect(calculateNavyBodyFat(70, 32, 165, 'F', undefined)).toBeNull();
  });
});
