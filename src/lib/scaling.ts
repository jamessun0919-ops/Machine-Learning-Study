export interface ScalingStats {
  mean: number;
  std: number;
  min: number;
  max: number;
}

export function computeStats(values: number[]): ScalingStats {
  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  return {
    mean,
    std: Math.sqrt(variance),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function zScoreScale(values: number[]): number[] {
  const { mean, std } = computeStats(values);
  return values.map((v) => (v - mean) / std);
}

export function minMaxScale(values: number[]): number[] {
  const { min, max } = computeStats(values);
  const range = max - min;
  return values.map((v) => (v - min) / range);
}
