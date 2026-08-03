import { fitLinearRegression, predict, rmse } from './regression';
import { SHUFFLED_INDICES, trainTestSplit } from './dataSplit';

export interface DataPoint {
  x: number;
  y: number;
}

const POINT_COUNT = SHUFFLED_INDICES.length;
const TRUE_X_MIN = -3;
const TRUE_X_MAX = 3;
const NOISE_AMPLITUDE = 0.4;

function trueFunction(x: number): number {
  return Math.sin(1.3 * x) * 2.5 + 0.4 * x;
}

// Deterministic pseudo-random hash (classic GLSL-style sine hash), not Math.random(),
// so the synthetic dataset is reproducible across renders.
function hashNoise(i: number): number {
  const value = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export const SYNTHETIC_DATASET: DataPoint[] = Array.from({ length: POINT_COUNT }, (_, i) => {
  const x = TRUE_X_MIN + (TRUE_X_MAX - TRUE_X_MIN) * (i / (POINT_COUNT - 1));
  const noise = (hashNoise(i) - 0.5) * 2 * NOISE_AMPLITUDE;
  return { x, y: trueFunction(x) + noise };
});

const { trainIndices, testIndices } = trainTestSplit(0.7);
export const TRAIN_SET: DataPoint[] = trainIndices.map((i) => SYNTHETIC_DATASET[i]);
export const TEST_SET: DataPoint[] = testIndices.map((i) => SYNTHETIC_DATASET[i]);

const datasetYValues = SYNTHETIC_DATASET.map((p) => p.y);
export const Y_AXIS_RANGE: [number, number] = [
  Math.min(...datasetYValues) - 0.5,
  Math.max(...datasetYValues) + 0.5,
];

export const DEGREE_OPTIONS = [1, 2, 3, 5, 9, 15] as const;
export type PolynomialDegree = (typeof DEGREE_OPTIONS)[number];

export interface CurveFit {
  degree: PolynomialDegree;
  curve: DataPoint[];
  trainRmse: number;
  testRmse: number;
}

function polynomialFeatures(x: number, degree: number): number[] {
  const features: number[] = [];
  for (let d = 1; d <= degree; d++) features.push(x ** d);
  return features;
}

const CURVE_SAMPLE_COUNT = 61;
const CURVE_SAMPLE_X: number[] = Array.from(
  { length: CURVE_SAMPLE_COUNT },
  (_, i) => TRUE_X_MIN + (TRUE_X_MAX - TRUE_X_MIN) * (i / (CURVE_SAMPLE_COUNT - 1))
);

function fitPolynomialForDegree(degree: PolynomialDegree): CurveFit {
  const { coefficients } = fitLinearRegression(
    TRAIN_SET.map((p) => polynomialFeatures(p.x, degree)),
    TRAIN_SET.map((p) => p.y)
  );

  const trainPredicted = TRAIN_SET.map((p) => predict(coefficients, polynomialFeatures(p.x, degree)));
  const testPredicted = TEST_SET.map((p) => predict(coefficients, polynomialFeatures(p.x, degree)));
  const curve = CURVE_SAMPLE_X.map((x) => ({
    x,
    y: predict(coefficients, polynomialFeatures(x, degree)),
  }));

  return {
    degree,
    curve,
    trainRmse: rmse(TRAIN_SET.map((p) => p.y), trainPredicted),
    testRmse: rmse(TEST_SET.map((p) => p.y), testPredicted),
  };
}

export const CURVE_FITS: Record<PolynomialDegree, CurveFit> = Object.fromEntries(
  DEGREE_OPTIONS.map((degree) => [degree, fitPolynomialForDegree(degree)])
) as Record<PolynomialDegree, CurveFit>;
