import { describe, it, expect } from 'vitest';
import { positionSalaryData } from './positionSalaryData';

describe('positionSalaryData', () => {
  it('contains exactly 10 records', () => {
    expect(positionSalaryData).toHaveLength(10);
  });

  it('each record has the expected fields', () => {
    positionSalaryData.forEach((record) => {
      expect(typeof record.position).toBe('string');
      expect(typeof record.level).toBe('number');
      expect(typeof record.salary).toBe('number');
    });
  });

  it('levels run from 1 to 10 in order', () => {
    expect(positionSalaryData.map((r) => r.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('salary increases monotonically with level (non-linear growth, not a straight line)', () => {
    for (let i = 1; i < positionSalaryData.length; i++) {
      expect(positionSalaryData[i].salary).toBeGreaterThan(positionSalaryData[i - 1].salary);
    }
  });

  it('matches the known classic dataset endpoints', () => {
    expect(positionSalaryData[0]).toEqual({ position: 'Business Analyst', level: 1, salary: 45000 });
    expect(positionSalaryData[9]).toEqual({ position: 'CEO', level: 10, salary: 1000000 });
  });
});
