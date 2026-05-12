import { describe, it, expect } from 'vitest';
import { calculateMetabolism } from '../metabolism';
import { ActivityLevel } from '../../../types/profile';

describe('calculateMetabolism', () => {
  it('should calculate male BMR and TDEE correctly', () => {
    const result = calculateMetabolism(70, 175, 30, 'M', ActivityLevel.ModeratelyActive);
    expect(result.bmr).toBe(1649); // 10*70 + 6.25*175 - 5*30 + 5 = 1648.75
    expect(result.tdee).toBe(2556); // 1648.75 * 1.55 = 2555.56
  });

  it('should calculate female BMR and TDEE correctly', () => {
    const result = calculateMetabolism(60, 165, 25, 'F', ActivityLevel.Sedentary);
    expect(result.bmr).toBe(1345); // 10*60 + 6.25*165 - 5*25 - 161 = 1345.25
    expect(result.tdee).toBe(1614); // 1345.25 * 1.2 = 1614.3
  });

  it('should calculate deficit and surplus ranges', () => {
    const result = calculateMetabolism(70, 175, 30, 'M', ActivityLevel.ModeratelyActive);
    expect(result.tdeeDeficit.low).toBe(2056);
    expect(result.tdeeDeficit.high).toBe(2256);
    expect(result.tdeeSurplus.low).toBe(2756);
    expect(result.tdeeSurplus.high).toBe(2856);
  });
});
