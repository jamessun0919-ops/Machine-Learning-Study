export interface RegressionResult {
  coefficients: number[];
}

function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

function multiply(a: number[][], b: number[][]): number[][] {
  return a.map((row) =>
    b[0].map((_, j) => row.reduce((sum, val, k) => sum + val * b[k][j], 0))
  );
}

function multiplyVector(a: number[][], v: number[]): number[] {
  return a.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

// 用高斯消去法（含部分主元選取）解線性方程組 Ax = b
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivotRow][col])) {
        pivotRow = row;
      }
    }
    [M[col], M[pivotRow]] = [M[pivotRow], M[col]];

    if (Math.abs(M[col][col]) < 1e-10) {
      throw new Error(
        'Matrix is singular; cannot fit regression (check for duplicate or perfectly collinear features)'
      );
    }

    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let k = col; k <= n; k++) {
        M[row][k] -= factor * M[col][k];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = M[row][n];
    for (let col = row + 1; col < n; col++) {
      sum -= M[row][col] * x[col];
    }
    x[row] = sum / M[row][row];
  }
  return x;
}

export function fitLinearRegression(
  features: number[][],
  target: number[]
): RegressionResult {
  if (features.length !== target.length) {
    throw new Error('features and target must have the same number of rows');
  }
  if (features.length === 0) {
    throw new Error('features must contain at least one row');
  }

  const X = features.map((row) => [1, ...row]); // 補上截距欄位
  const Xt = transpose(X);
  const XtX = multiply(Xt, X);
  const XtY = multiplyVector(Xt, target);
  const coefficients = solveLinearSystem(XtX, XtY);

  return { coefficients };
}

export function fitRidgeRegression(
  features: number[][],
  target: number[],
  lambda: number
): RegressionResult {
  if (features.length !== target.length) {
    throw new Error('features and target must have the same number of rows');
  }
  if (features.length === 0) {
    throw new Error('features must contain at least one row');
  }

  const X = features.map((row) => [1, ...row]); // 補上截距欄位
  const Xt = transpose(X);
  const XtX = multiply(Xt, X);
  // 懲罰項只加在非截距的對角線上（index 0 是截距，不正則化）
  for (let i = 1; i < XtX.length; i++) {
    XtX[i][i] += lambda;
  }
  const XtY = multiplyVector(Xt, target);
  const coefficients = solveLinearSystem(XtX, XtY);

  return { coefficients };
}

export function predict(coefficients: number[], features: number[]): number {
  return (
    coefficients[0] +
    features.reduce((sum, val, i) => sum + val * coefficients[i + 1], 0)
  );
}

export function rSquared(actual: number[], predicted: number[]): number {
  const mean = actual.reduce((sum, v) => sum + v, 0) / actual.length;
  const ssTotal = actual.reduce((sum, v) => sum + (v - mean) ** 2, 0);
  const ssResidual = actual.reduce(
    (sum, v, i) => sum + (v - predicted[i]) ** 2,
    0
  );
  return 1 - ssResidual / ssTotal;
}

export function rmse(actual: number[], predicted: number[]): number {
  const n = actual.length;
  const sumSquaredError = actual.reduce(
    (sum, v, i) => sum + (v - predicted[i]) ** 2,
    0
  );
  return Math.sqrt(sumSquaredError / n);
}
