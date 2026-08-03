import { describe, it, expect } from 'vitest';
import { computeStats, zScoreScale, minMaxScale, applyZScore } from './scaling';

describe('computeStats', () => {
  it('computes mean, population standard deviation, min, and max', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const stats = computeStats(values);
    expect(stats.mean).toBeCloseTo(5, 10);
    expect(stats.std).toBeCloseTo(2, 10);
    expect(stats.min).toBe(2);
    expect(stats.max).toBe(9);
  });
});

describe('zScoreScale', () => {
  it('transforms values using population mean and standard deviation', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const scaled = zScoreScale(values);
    expect(scaled).toEqual([-1.5, -0.5, -0.5, -0.5, 0, 0, 1, 2]);
  });

  it('produces a result with zero mean and unit standard deviation', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const { mean, std } = computeStats(zScoreScale(values));
    expect(mean).toBeCloseTo(0, 10);
    expect(std).toBeCloseTo(1, 10);
  });
});

describe('minMaxScale', () => {
  it('transforms values into the 0-1 range', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const scaled = minMaxScale(values);
    expect(scaled[0]).toBeCloseTo(0, 10);
    expect(scaled[1]).toBeCloseTo(2 / 7, 10);
    expect(scaled[5]).toBeCloseTo(3 / 7, 10);
    expect(scaled[7]).toBeCloseTo(1, 10);
  });

  it('produces a result with min 0 and max 1', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const { min, max } = computeStats(minMaxScale(values));
    expect(min).toBeCloseTo(0, 10);
    expect(max).toBeCloseTo(1, 10);
  });
});

describe('applyZScore', () => {
  it('applies previously-computed stats to a value from the original array, matching zScoreScale', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const stats = computeStats(values); // mean=5, std=2
    expect(applyZScore(9, stats)).toBeCloseTo(2, 10);
  });

  it('applies previously-computed stats to a new value not in the original array', () => {
    const stats = computeStats([2, 4, 4, 4, 5, 5, 7, 9]); // mean=5, std=2
    expect(applyZScore(11, stats)).toBeCloseTo(3, 10);
    expect(applyZScore(1, stats)).toBeCloseTo(-2, 10);
  });
});
