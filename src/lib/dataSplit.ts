// Fixed shuffle of indices 0-49 (an affine permutation, i -> (i*17+7) mod 50),
// so the interactive demo is reproducible across renders instead of using
// runtime randomness, while still visually scattering the assignment.
export const SHUFFLED_INDICES: number[] = [
  7, 24, 41, 8, 25, 42, 9, 26, 43, 10,
  27, 44, 11, 28, 45, 12, 29, 46, 13, 30,
  47, 14, 31, 48, 15, 32, 49, 16, 33, 0,
  17, 34, 1, 18, 35, 2, 19, 36, 3, 20,
  37, 4, 21, 38, 5, 22, 39, 6, 23, 40,
];

export interface SplitResult {
  trainIndices: number[];
  testIndices: number[];
}

export function trainTestSplit(trainRatio: number): SplitResult {
  const trainCount = Math.round(SHUFFLED_INDICES.length * trainRatio);
  return {
    trainIndices: SHUFFLED_INDICES.slice(0, trainCount),
    testIndices: SHUFFLED_INDICES.slice(trainCount),
  };
}

export interface FoldResult {
  trainIndices: number[];
  validationIndices: number[];
}

export function kFoldSplit(currentFold: number, k = 5): FoldResult {
  const foldSize = SHUFFLED_INDICES.length / k;
  const start = currentFold * foldSize;
  const end = start + foldSize;
  const validationIndices = SHUFFLED_INDICES.slice(start, end);
  const trainIndices = [
    ...SHUFFLED_INDICES.slice(0, start),
    ...SHUFFLED_INDICES.slice(end),
  ];
  return { trainIndices, validationIndices };
}
