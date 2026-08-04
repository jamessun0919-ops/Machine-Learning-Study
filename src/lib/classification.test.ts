import { describe, it, expect } from 'vitest';
import {
  sigmoid,
  fitLogisticRegression,
  confusionMatrix,
  accuracy,
  precision,
  recall,
  f1Score,
} from './classification';

describe('sigmoid', () => {
  it('returns exactly 0.5 at z=0', () => {
    expect(sigmoid(0)).toBe(0.5);
  });

  it('approaches 1 for large positive z', () => {
    expect(sigmoid(20)).toBeCloseTo(1, 6);
  });

  it('approaches 0 for large negative z', () => {
    expect(sigmoid(-20)).toBeCloseTo(0, 6);
  });
});

describe('fitLogisticRegression', () => {
  it('converges to a positive coefficient when higher x trends toward class 1, even with some class overlap', () => {
    // x=-1 and x=1 each appear twice with opposite labels, so the data is not
    // perfectly separable — the loss has an interior minimum and gradient
    // descent should settle rather than diverge.
    const features = [[-3], [-2], [-1], [-1], [-0.5], [0.5], [1], [1], [2], [3]];
    const target = [0, 0, 0, 1, 0, 1, 1, 0, 1, 1];

    const result = fitLogisticRegression(features, target, 0.5, 5000, 1e-6);

    expect(result.converged).toBe(true);
    expect(result.coefficients[1]).toBeGreaterThan(0.5);
  });

  it('does not converge within a too-small iteration budget on perfectly separable data', () => {
    // x<0 is always class 0 and x>0 is always class 1 — a clean gap with no
    // overlap, so the true MLE coefficients are unbounded (this is the same
    // pathology that ruled out Iris setosa-vs-versicolor for this chapter's
    // dataset — see the chapter design doc). With a deliberately small
    // maxIter, the descent should still be climbing, not settled.
    const features = [[-3], [-2], [-1], [1], [2], [3]];
    const target = [0, 0, 0, 1, 1, 1];

    const result = fitLogisticRegression(features, target, 0.5, 50, 1e-6);

    expect(result.converged).toBe(false);
  });

  it('throws when features and target lengths mismatch', () => {
    expect(() => fitLogisticRegression([[1, 2]], [1, 2])).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => fitLogisticRegression([], [])).toThrow();
  });
});

describe('confusionMatrix and metrics', () => {
  // Hand-verified: actual [1,1,1,0,0,0,1,0] vs predicted [1,0,1,0,1,0,1,1]
  // -> TP=3 (indices 0,2,6), FN=1 (index 1), TN=2 (indices 3,5), FP=2 (indices 4,7).
  const actual = [1, 1, 1, 0, 0, 0, 1, 0];
  const predicted = [1, 0, 1, 0, 1, 0, 1, 1];
  const cm = confusionMatrix(actual, predicted);

  it('computes the confusion matrix correctly', () => {
    expect(cm).toEqual({ tp: 3, fp: 2, fn: 1, tn: 2 });
  });

  it('computes accuracy, precision, recall, and F1 correctly from the confusion matrix', () => {
    expect(accuracy(cm)).toBeCloseTo(0.625, 8);
    expect(precision(cm)).toBeCloseTo(0.6, 8);
    expect(recall(cm)).toBeCloseTo(0.75, 8);
    expect(f1Score(cm)).toBeCloseTo(0.6666666667, 8);
  });
});
