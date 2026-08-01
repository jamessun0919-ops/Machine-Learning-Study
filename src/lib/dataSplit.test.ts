import { describe, it, expect } from 'vitest';
import { SHUFFLED_INDICES, trainTestSplit, kFoldSplit } from './dataSplit';

describe('SHUFFLED_INDICES', () => {
  it('is a permutation of 0-49 (50 unique indices, no gaps)', () => {
    expect(SHUFFLED_INDICES).toHaveLength(50);
    const sorted = [...SHUFFLED_INDICES].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });
});

describe('trainTestSplit', () => {
  it('splits 50 samples into 35/15 for a 0.7 train ratio', () => {
    const { trainIndices, testIndices } = trainTestSplit(0.7);
    expect(trainIndices).toHaveLength(35);
    expect(testIndices).toHaveLength(15);
  });

  it('splits 50 samples into 40/10 for a 0.8 train ratio', () => {
    const { trainIndices, testIndices } = trainTestSplit(0.8);
    expect(trainIndices).toHaveLength(40);
    expect(testIndices).toHaveLength(10);
  });

  it('splits 50 samples into 45/5 for a 0.9 train ratio', () => {
    const { trainIndices, testIndices } = trainTestSplit(0.9);
    expect(trainIndices).toHaveLength(45);
    expect(testIndices).toHaveLength(5);
  });

  it('covers every index exactly once with no overlap', () => {
    const { trainIndices, testIndices } = trainTestSplit(0.8);
    const combined = [...trainIndices, ...testIndices].sort((a, b) => a - b);
    expect(combined).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });
});

describe('kFoldSplit', () => {
  it('assigns 10 samples to validation and 40 to training for each fold', () => {
    for (let fold = 0; fold < 5; fold++) {
      const { trainIndices, validationIndices } = kFoldSplit(fold);
      expect(validationIndices).toHaveLength(10);
      expect(trainIndices).toHaveLength(40);
    }
  });

  it('every index appears in validation exactly once across all 5 folds', () => {
    const allValidation = [0, 1, 2, 3, 4].flatMap((fold) => kFoldSplit(fold).validationIndices);
    const sorted = [...allValidation].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });

  it('train and validation sets never overlap within a fold', () => {
    const { trainIndices, validationIndices } = kFoldSplit(2);
    const overlap = trainIndices.filter((i) => validationIndices.includes(i));
    expect(overlap).toHaveLength(0);
  });
});
