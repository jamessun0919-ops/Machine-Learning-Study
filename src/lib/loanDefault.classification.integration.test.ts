import { describe, it, expect } from 'vitest';
import { loans, trainIndices, testIndices } from './loanDefault';
import { fitLogisticRegression, sigmoid, confusionMatrix, accuracy, precision, recall, f1Score } from './classification';
import { predict } from './regression';
import { computeStats, applyZScore, type ScalingStats } from './scaling';

// Pins the exact numbers produced by the same standardize -> train -> classify -> evaluate
// pipeline LogisticRegressionFit.tsx runs, so a future change to loanDefault.ts's LCG seed,
// TRAIN_COUNT, true-model constants, or fitLogisticRegression's default hyperparameters fails
// this test loudly instead of silently invalidating the chapter prose and the infographic PNG.
describe('loan default logistic regression production pipeline (pinned end-to-end numbers)', () => {
  function toRawFeatures(indices: number[]): number[][] {
    return indices.map((i) => [loans[i].debtToIncomeRatio, loans[i].creditScore]);
  }

  const trainRawFeatures = toRawFeatures(trainIndices);
  const testRawFeatures = toRawFeatures(testIndices);
  const trainTarget = trainIndices.map((i) => loans[i].isDefault);
  const testTarget = testIndices.map((i) => loans[i].isDefault);

  const dtiStats: ScalingStats = computeStats(trainRawFeatures.map((row) => row[0]));
  const creditStats: ScalingStats = computeStats(trainRawFeatures.map((row) => row[1]));

  function standardizeRow(row: number[]): number[] {
    return [applyZScore(row[0], dtiStats), applyZScore(row[1], creditStats)];
  }

  const trainStdFeatures = trainRawFeatures.map(standardizeRow);
  const testStdFeatures = testRawFeatures.map(standardizeRow);

  const fit = fitLogisticRegression(trainStdFeatures, trainTarget);

  function classify(standardizedFeatures: number[]): 0 | 1 {
    return sigmoid(predict(fit.coefficients, standardizedFeatures)) >= 0.5 ? 1 : 0;
  }

  const trainPredicted = trainStdFeatures.map(classify);
  const testPredicted = testStdFeatures.map(classify);

  const trainCm = confusionMatrix(trainTarget, trainPredicted);
  const testCm = confusionMatrix(testTarget, testPredicted);

  it('converges on the default hyperparameters', () => {
    expect(fit.converged).toBe(true);
  });

  it('produces the exact test and train confusion matrices shown in the chapter', () => {
    expect(testCm).toEqual({ tp: 10, fp: 1, fn: 5, tn: 34 });
    expect(trainCm).toEqual({ tp: 24, fp: 8, fn: 12, tn: 106 });
  });

  it('produces the exact accuracy/precision/recall/F1 numbers quoted in the chapter prose', () => {
    expect(accuracy(testCm)).toBeCloseTo(0.88, 4);
    expect(accuracy(trainCm)).toBeCloseTo(0.8667, 4);
    expect(precision(testCm)).toBeCloseTo(0.9091, 4);
    expect(recall(testCm)).toBeCloseTo(0.6667, 4);
    expect(f1Score(testCm)).toBeCloseTo(0.7692, 4);
  });
});
