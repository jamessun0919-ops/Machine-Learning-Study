import { describe, it, expect } from 'vitest';
import {
  SYNTHETIC_DATASET,
  TRAIN_SET,
  TEST_SET,
  DEGREE_OPTIONS,
  CURVE_FITS,
} from './polynomialFit';

describe('SYNTHETIC_DATASET', () => {
  it('has exactly 50 points spanning x from -3 to 3', () => {
    expect(SYNTHETIC_DATASET).toHaveLength(50);
    expect(SYNTHETIC_DATASET[0].x).toBeCloseTo(-3, 5);
    expect(SYNTHETIC_DATASET[49].x).toBeCloseTo(3, 5);
  });

  it('generates deterministic y values from a fixed formula (not Math.random)', () => {
    expect(SYNTHETIC_DATASET[0].y).toBeCloseTo(0.2657, 3);
    expect(SYNTHETIC_DATASET[49].y).toBeCloseTo(-0.1312, 3);
  });
});

describe('TRAIN_SET / TEST_SET', () => {
  it('splits the 50 points into 35 train and 15 test, reusing dataSplit.ts', () => {
    expect(TRAIN_SET).toHaveLength(35);
    expect(TEST_SET).toHaveLength(15);
  });

  it('covers every dataset point exactly once with no overlap', () => {
    const combined = [...TRAIN_SET, ...TEST_SET];
    expect(combined).toHaveLength(50);
    const uniqueX = new Set(combined.map((p) => p.x));
    expect(uniqueX.size).toBe(50);
  });
});

describe('CURVE_FITS', () => {
  it('has a fit for every degree in DEGREE_OPTIONS, each with a 61-point curve', () => {
    DEGREE_OPTIONS.forEach((degree) => {
      expect(CURVE_FITS[degree]).toBeDefined();
      expect(CURVE_FITS[degree].curve).toHaveLength(61);
    });
  });

  it('degree 1 (underfit) has high train and test error that stay close to each other', () => {
    const fit = CURVE_FITS[1];
    expect(fit.trainRmse).toBeGreaterThan(1.0);
    expect(fit.testRmse).toBeGreaterThan(1.0);
    expect(Math.abs(fit.trainRmse - fit.testRmse)).toBeLessThan(0.5);
  });

  it('train error is non-increasing as degree grows', () => {
    for (let i = 1; i < DEGREE_OPTIONS.length; i++) {
      const prevDegree = DEGREE_OPTIONS[i - 1];
      const currentDegree = DEGREE_OPTIONS[i];
      expect(CURVE_FITS[currentDegree].trainRmse).toBeLessThanOrEqual(
        CURVE_FITS[prevDegree].trainRmse + 1e-6
      );
    }
  });

  it('degree 15 (overfit) has much higher test error than degree 5 (good fit), despite lower train error', () => {
    const good = CURVE_FITS[5];
    const overfit = CURVE_FITS[15];
    expect(overfit.trainRmse).toBeLessThan(good.trainRmse);
    expect(overfit.testRmse).toBeGreaterThan(good.testRmse * 2);
  });

  it('matches the pre-computed RMSE values for the locked-in dataset (regression guard)', () => {
    expect(CURVE_FITS[1].trainRmse).toBeCloseTo(1.615, 1);
    expect(CURVE_FITS[1].testRmse).toBeCloseTo(1.457, 1);
    expect(CURVE_FITS[5].trainRmse).toBeCloseTo(0.209, 1);
    expect(CURVE_FITS[5].testRmse).toBeCloseTo(0.218, 1);
    expect(CURVE_FITS[15].trainRmse).toBeCloseTo(0.187, 1);
    expect(CURVE_FITS[15].testRmse).toBeCloseTo(0.802, 1);
  });
});
