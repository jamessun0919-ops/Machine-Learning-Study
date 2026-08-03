import { describe, it, expect } from 'vitest';
import { fitLinearRegression, fitRidgeRegression, predict, rSquared, rmse } from './regression';

describe('fitLinearRegression', () => {
  it('recovers exact coefficients for a noiseless linear relationship', () => {
    // y = 1 + 2*x1 + 3*x2, 六個一致的樣本點（過度定義但完全一致，應精確還原係數）
    const features = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
    ];
    const target = [1, 3, 4, 6, 8, 9];

    const { coefficients } = fitLinearRegression(features, target);

    expect(coefficients[0]).toBeCloseTo(1, 5);
    expect(coefficients[1]).toBeCloseTo(2, 5);
    expect(coefficients[2]).toBeCloseTo(3, 5);
  });

  it('throws when features and target lengths mismatch', () => {
    expect(() => fitLinearRegression([[1, 2]], [1, 2])).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => fitLinearRegression([], [])).toThrow();
  });
});

describe('predict', () => {
  it('computes intercept plus weighted sum of features', () => {
    expect(predict([1, 2, 3], [1, 1])).toBeCloseTo(6, 10);
  });
});

describe('rSquared', () => {
  it('returns 1 for a perfect fit', () => {
    const actual = [1, 3, 4, 6, 8, 9];
    expect(rSquared(actual, actual)).toBeCloseTo(1, 10);
  });

  it('returns 0 when predictions equal the mean', () => {
    const actual = [1, 2, 3, 4, 5];
    const predicted = actual.map(() => 3);
    expect(rSquared(actual, predicted)).toBeCloseTo(0, 10);
  });
});

describe('rmse', () => {
  it('returns 0 for a perfect fit', () => {
    const actual = [1, 2, 3];
    expect(rmse(actual, actual)).toBeCloseTo(0, 10);
  });

  it('computes root mean squared error correctly', () => {
    // errors = 3, 4 -> squared = 9, 16 -> mean = 12.5 -> sqrt = 3.5355339
    expect(rmse([0, 0], [3, 4])).toBeCloseTo(3.5355339, 5);
  });
});

describe('fitRidgeRegression', () => {
  const features = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ];
  const target = [1, 3, 4, 6, 8, 9];

  it('reduces to fitLinearRegression when lambda is 0', () => {
    const ridge = fitRidgeRegression(features, target, 0);
    const ols = fitLinearRegression(features, target);

    expect(ridge.coefficients[0]).toBeCloseTo(ols.coefficients[0], 8);
    expect(ridge.coefficients[1]).toBeCloseTo(ols.coefficients[1], 8);
    expect(ridge.coefficients[2]).toBeCloseTo(ols.coefficients[2], 8);
  });

  it('shrinks non-intercept coefficients toward zero as lambda increases, without penalizing the intercept', () => {
    const lambda1 = fitRidgeRegression(features, target, 1);
    expect(lambda1.coefficients[0]).toBeCloseTo(1.892857, 5);
    expect(lambda1.coefficients[1]).toBeCloseTo(1.630952, 5);
    expect(lambda1.coefficients[2]).toBeCloseTo(2.297619, 5);

    const lambda10 = fitRidgeRegression(features, target, 10);
    expect(lambda10.coefficients[0]).toBeCloseTo(4.048780, 5);
    expect(lambda10.coefficients[1]).toBeCloseTo(0.587398, 5);
    expect(lambda10.coefficients[2]).toBeCloseTo(0.754065, 5);

    const magnitudeAtLambda1 =
      Math.abs(lambda1.coefficients[1]) + Math.abs(lambda1.coefficients[2]);
    const magnitudeAtLambda10 =
      Math.abs(lambda10.coefficients[1]) + Math.abs(lambda10.coefficients[2]);
    expect(magnitudeAtLambda10).toBeLessThan(magnitudeAtLambda1);
  });

  it('throws when features and target lengths mismatch', () => {
    expect(() => fitRidgeRegression([[1, 2]], [1, 2], 1)).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => fitRidgeRegression([], [], 1)).toThrow();
  });
});
