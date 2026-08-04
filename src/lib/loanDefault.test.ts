import { describe, it, expect } from 'vitest';
import { loans, SHUFFLED_INDICES, trainIndices, testIndices } from './loanDefault';

describe('loans', () => {
  it('produces 200 records with correct field types and plausible ranges', () => {
    expect(loans).toHaveLength(200);
    loans.forEach((record) => {
      expect(typeof record.debtToIncomeRatio).toBe('number');
      expect(record.debtToIncomeRatio).toBeGreaterThanOrEqual(0.05);
      expect(record.debtToIncomeRatio).toBeLessThanOrEqual(0.85);
      expect(typeof record.creditScore).toBe('number');
      expect(record.creditScore).toBeGreaterThanOrEqual(350);
      expect(record.creditScore).toBeLessThanOrEqual(850);
      expect([0, 1]).toContain(record.isDefault);
    });
  });

  it('has an overall default rate between 20% and 30%', () => {
    const defaultRate = loans.filter((r) => r.isDefault === 1).length / loans.length;
    expect(defaultRate).toBeGreaterThanOrEqual(0.2);
    expect(defaultRate).toBeLessThanOrEqual(0.3);
  });
});

describe('SHUFFLED_INDICES', () => {
  it('is a permutation of 0-199 (200 unique indices, no gaps)', () => {
    expect(SHUFFLED_INDICES).toHaveLength(200);
    const sorted = [...SHUFFLED_INDICES].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 200 }, (_, i) => i));
  });
});

describe('trainIndices / testIndices', () => {
  it('splits into 150 train and 50 test indices covering every index exactly once', () => {
    expect(trainIndices).toHaveLength(150);
    expect(testIndices).toHaveLength(50);
    const combined = [...trainIndices, ...testIndices].sort((a, b) => a - b);
    expect(combined).toEqual(Array.from({ length: 200 }, (_, i) => i));
  });
});
