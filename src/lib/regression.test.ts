import { describe, it, expect } from 'vitest';
import { fitLinearRegression, predict, rSquared, rmse } from './regression';

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
