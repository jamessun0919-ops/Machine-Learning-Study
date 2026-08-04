export interface RegressionResult {
  coefficients: number[];
  // 只有 fitLassoRegression（迭代法）會填這個欄位；fitLinearRegression／fitRidgeRegression
  // 是閉式解，永遠精確收斂，不需要也不會回傳這個欄位。
  converged?: boolean;
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

function softThreshold(z: number, gamma: number): number {
  if (z > gamma) return z - gamma;
  if (z < -gamma) return z + gamma;
  return 0;
}

// Lasso 沒有閉式解（L1 懲罰項在 0 處不可微分），改用 coordinate descent + soft-thresholding。
// 對每一欄先做置中處理（column-centering），讓截距可以在迴圈外用一次代數運算求出、不需要
// 加入懲罰項；這是業界標準做法（glmnet／scikit-learn 皆採此法），也讓這個函式對任意（不一定
// 事先標準化過的）特徵矩陣都能正確運作，不只是本站已標準化過的多項式特徵這個特例。
export function fitLassoRegression(
  features: number[][],
  target: number[],
  lambda: number,
  // maxIter 是實際的收斂保障：本站次數 15 多項式特徵高度共線，在白名單最小的 λ=0.01 時
  // 需要約 56,000+ 次迭代才能真正收斂；隨意調低 maxIter 會讓迴圈提前跳出、回傳看似合理
  // 但其實錯誤的係數（converged 會回傳 false）。tol 在合理範圍內對收斂與否影響不大，
  // 不要誤以為調緊 tol 能彌補調低 maxIter 的風險。
  maxIter = 200000,
  tol = 1e-12
): RegressionResult {
  if (features.length !== target.length) {
    throw new Error('features and target must have the same number of rows');
  }
  if (features.length === 0) {
    throw new Error('features must contain at least one row');
  }

  const n = features.length;
  const p = features[0].length;

  const featureMeans = new Array(p).fill(0);
  for (let j = 0; j < p; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += features[i][j];
    featureMeans[j] = sum / n;
  }
  const centeredFeatures = features.map((row) => row.map((v, j) => v - featureMeans[j]));

  const yMean = target.reduce((sum, v) => sum + v, 0) / n;
  const centeredTarget = target.map((v) => v - yMean);

  const colSqSum = new Array(p).fill(0);
  for (let j = 0; j < p; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += centeredFeatures[i][j] ** 2;
    colSqSum[j] = sum;
  }

  const beta = new Array(p).fill(0);
  const residual = centeredTarget.slice();

  let converged = false;
  for (let iter = 0; iter < maxIter; iter++) {
    let maxChange = 0;
    for (let j = 0; j < p; j++) {
      if (colSqSum[j] === 0) continue;
      let rho = 0;
      for (let i = 0; i < n; i++) {
        rho += centeredFeatures[i][j] * (residual[i] + centeredFeatures[i][j] * beta[j]);
      }
      const newBetaJ = softThreshold(rho, lambda / 2) / colSqSum[j];
      const delta = newBetaJ - beta[j];
      if (delta !== 0) {
        for (let i = 0; i < n; i++) residual[i] -= centeredFeatures[i][j] * delta;
      }
      beta[j] = newBetaJ;
      if (Math.abs(delta) > maxChange) maxChange = Math.abs(delta);
    }
    if (maxChange < tol) {
      converged = true;
      break;
    }
  }

  const intercept = yMean - featureMeans.reduce((sum, m, j) => sum + m * beta[j], 0);
  return { coefficients: [intercept, ...beta], converged };
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
