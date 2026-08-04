export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export interface LogisticRegressionResult {
  coefficients: number[];
  converged: boolean;
}

// Cross-entropy loss 對 β 是非線性的，沒有閉式解，改用批次梯度下降：每輪疊代用
// 全部訓練資料算一次梯度、更新一次係數。與 fitLassoRegression（coordinate descent
// + soft-thresholding）是不同的迭代策略，因為兩者的損失函數形狀不同——L1 懲罰項
// 在 0 處不可微分需要 soft-thresholding，cross-entropy 處處可微，一般梯度下降即可。
export function fitLogisticRegression(
  features: number[][],
  target: number[],
  learningRate = 0.3,
  maxIter = 20000,
  tol = 1e-6
): LogisticRegressionResult {
  if (features.length !== target.length) {
    throw new Error('features and target must have the same number of rows');
  }
  if (features.length === 0) {
    throw new Error('features must contain at least one row');
  }

  const n = features.length;
  const p = features[0].length;
  const beta = new Array(p + 1).fill(0); // beta[0] 是截距

  let converged = false;
  for (let iter = 0; iter < maxIter; iter++) {
    const gradient = new Array(p + 1).fill(0);
    for (let i = 0; i < n; i++) {
      const z = beta[0] + features[i].reduce((sum, value, j) => sum + value * beta[j + 1], 0);
      const error = sigmoid(z) - target[i];
      gradient[0] += error;
      for (let j = 0; j < p; j++) gradient[j + 1] += error * features[i][j];
    }

    let maxGradient = 0;
    for (let k = 0; k <= p; k++) {
      gradient[k] /= n;
      beta[k] -= learningRate * gradient[k];
      if (Math.abs(gradient[k]) > maxGradient) maxGradient = Math.abs(gradient[k]);
    }

    if (maxGradient < tol) {
      converged = true;
      break;
    }
  }

  return { coefficients: beta, converged };
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export function confusionMatrix(actual: number[], predicted: number[]): ConfusionMatrix {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === 1 && predicted[i] === 1) tp++;
    else if (actual[i] === 0 && predicted[i] === 1) fp++;
    else if (actual[i] === 1 && predicted[i] === 0) fn++;
    else tn++;
  }
  return { tp, fp, fn, tn };
}

export function accuracy(cm: ConfusionMatrix): number {
  return (cm.tp + cm.tn) / (cm.tp + cm.fp + cm.fn + cm.tn);
}

export function precision(cm: ConfusionMatrix): number {
  return cm.tp / (cm.tp + cm.fp);
}

export function recall(cm: ConfusionMatrix): number {
  return cm.tp / (cm.tp + cm.fn);
}

export function f1Score(cm: ConfusionMatrix): number {
  const p = precision(cm);
  const r = recall(cm);
  return (2 * p * r) / (p + r);
}
