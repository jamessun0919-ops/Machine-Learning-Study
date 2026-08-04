# Lasso Regression（Lasso 迴歸，正則化）章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Lasso Regression（Lasso 迴歸，正則化）" chapter — a new page reachable at `/chapters/lasso-regression`, wired into the chapter chain right after Ridge Regression, using the nine-block algorithm template.

**Architecture:** A new pure-function solver (`fitLassoRegression`, coordinate descent with soft-thresholding — Lasso has no closed form, unlike Ridge's normal-equation solve) feeds a new client-only React island (`LassoRegressionFit.tsx`) that reuses the same fixed-degree-15 synthetic dataset and z-score standardization pipeline as `RidgeRegressionFit.tsx`, letting the user flip between 5 whitelisted λ values to see the fitted curve, a **linear-scale** coefficient bar chart (zeroed coefficients shown in a muted color), and train/test RMSE plus a zero-coefficient count. The chapter's Markdown content, its Excalidraw-style summary infographic (case study: same-λ Ridge vs Lasso comparison), and one "related chapter" paragraph (back into Ridge Regression) complete the page.

**Tech Stack:** Astro (Content Layer API) + React island (`client:only="react"`) + TypeScript + Plotly.js (`react-plotly.js`) + Vitest.

## Global Constraints

- Never use root-absolute paths (`/css/...`) for internal links/assets — always prefix with `import.meta.env.BASE_URL` (site is served from `/Machine-Learning-Study/`). Not touched by this plan (no new raw links).
- React components that use Plotly must be mounted with `client:only="react"` in `.astro` files, and referenced via literal JSX (no dynamic component lookup tables).
- Chapter interactive components are "pre-designed demos", not free-form tools: parameters are whitelisted buttons, never free sliders/inputs.
- All chat with the developer is in Traditional Chinese; this plan and its code comments (where unavoidable) are in the project's existing mixed English/Chinese style — match whichever file you're editing.
- Design doc for this chapter: `docs/superpowers/specs/2026-08-04-lasso-regression-chapter-design.md` — read it if you need the full rationale; this plan already extracts everything you need to implement.
- **λ whitelist is `0.01, 0.05, 0.1, 1, 10` — it deliberately excludes 0 and any value below 0.01.** This is not an oversight: a verification script during design showed coordinate descent on this exact feature set never converges at λ=0 (the design matrix is near-singular there), and λ values below 0.01 have unpredictable, sometimes multi-second convergence cost (λ=0.002 needed 4.7M iterations in testing) due to a known coordinate-descent pathology near the zero-threshold boundary. Do not add smaller λ values "to be thorough" — this was an explicit developer decision (performance/robustness over completeness) after verification, not a shortcut.
- **All numeric values below (RMSE, coefficients, zero-counts) were computed by a verification script replicating the exact production logic** (`dataSplit.ts` + `polynomialFit.ts` + `regression.ts` + `scaling.ts`, with `maxIter=200000, tol=1e-12`). Task 1's tests will catch any implementation drift from the small hand-verifiable cases; Task 2's reference table lets you sanity-check the full pipeline. If your implementation produces different numbers, that's a real bug — stop and re-check your code against this plan rather than adjusting the expected numbers.
- **Do not loosen `tol` or shrink `maxIter` below the values specified in Task 1** without checking with the developer first. During design, a looser `tol=1e-10` combined with `maxIter=300000` silently produced wrong zero-counts (the algorithm exited before truly converging) — this looked like a working implementation (no errors, plausible-looking numbers) but was numerically wrong. `maxIter=200000, tol=1e-12` was verified sufficient for the whole λ whitelist (worst case converged in 56,056 iterations) and is fast (~227ms for all 5 λ values combined).

---

### Task 1: Lasso regression solver

**Files:**
- Modify: `src/lib/regression.ts`
- Modify: `src/lib/regression.test.ts`

**Interfaces:**
- Consumes: nothing new — this is a self-contained pure function using only plain JS array/math operations (no reuse of Ridge's `transpose`/`multiply`/`solveLinearSystem` helpers, since Lasso has no matrix closed-form; it needs its own coordinate-descent loop).
- Produces: `fitLassoRegression(features: number[][], target: number[], lambda: number, maxIter?: number, tol?: number): RegressionResult` — exported from `src/lib/regression.ts`. Task 2 imports this.

- [ ] **Step 1: Write the failing tests for `fitLassoRegression`**

In `src/lib/regression.test.ts`, change the import line from:

```ts
import { fitLinearRegression, fitRidgeRegression, predict, rSquared, rmse } from './regression';
```

to:

```ts
import { fitLinearRegression, fitRidgeRegression, fitLassoRegression, predict, rSquared, rmse } from './regression';
```

Add this new `describe` block at the end of the file:

```ts
describe('fitLassoRegression', () => {
  it('recovers the exact OLS slope on a single perfectly-linear feature when lambda is 0', () => {
    // y = 2x, x mean-centered (-2..2), so the intercept is exactly 0 and the
    // slope is hand-verifiable: rho = sum(x*y) = 20, colSqSum = sum(x^2) = 10,
    // softThreshold(20, 0) / 10 = 2.
    const features = [[-2], [-1], [0], [1], [2]];
    const target = [-4, -2, 0, 2, 4];

    const lasso = fitLassoRegression(features, target, 0);
    const ols = fitLinearRegression(features, target);

    expect(lasso.coefficients[0]).toBeCloseTo(ols.coefficients[0], 8);
    expect(lasso.coefficients[1]).toBeCloseTo(ols.coefficients[1], 8);
    expect(lasso.coefficients[1]).toBeCloseTo(2, 8);
  });

  it('soft-thresholds a single coefficient below the OLS value once lambda is large enough to bite', () => {
    // Same data as above: rho = 20, colSqSum = 10. Threshold is lambda/2 = 5,
    // so beta = softThreshold(20, 5) / 10 = (20 - 5) / 10 = 1.5 (shrunk, not zero).
    const features = [[-2], [-1], [0], [1], [2]];
    const target = [-4, -2, 0, 2, 4];

    const lasso = fitLassoRegression(features, target, 10);
    expect(lasso.coefficients[0]).toBeCloseTo(0, 8);
    expect(lasso.coefficients[1]).toBeCloseTo(1.5, 8);
  });

  it('zeroes out a coefficient entirely once lambda exceeds twice the correlation magnitude', () => {
    // Threshold is lambda/2 = 25, which exceeds |rho| = 20, so beta is forced to exactly 0
    // and the intercept collapses to the plain mean of y (0 here).
    const features = [[-2], [-1], [0], [1], [2]];
    const target = [-4, -2, 0, 2, 4];

    const lasso = fitLassoRegression(features, target, 50);
    expect(lasso.coefficients[0]).toBeCloseTo(0, 8);
    expect(lasso.coefficients[1]).toBe(0);
  });

  it('matches OLS on a multi-feature dataset when lambda is 0, and zeroes both coefficients at a large lambda', () => {
    const features = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
    ];
    const target = [1, 3, 4, 6, 8, 9];

    const lasso0 = fitLassoRegression(features, target, 0);
    const ols = fitLinearRegression(features, target);
    expect(lasso0.coefficients[0]).toBeCloseTo(ols.coefficients[0], 6);
    expect(lasso0.coefficients[1]).toBeCloseTo(ols.coefficients[1], 6);
    expect(lasso0.coefficients[2]).toBeCloseTo(ols.coefficients[2], 6);

    const lasso1 = fitLassoRegression(features, target, 1);
    expect(lasso1.coefficients[0]).toBeCloseTo(1.227273, 5);
    expect(lasso1.coefficients[1]).toBeCloseTo(1.863636, 5);
    expect(lasso1.coefficients[2]).toBeCloseTo(2.863636, 5);

    const lasso50 = fitLassoRegression(features, target, 50);
    expect(lasso50.coefficients[0]).toBeCloseTo(5.166667, 5);
    expect(lasso50.coefficients[1]).toBe(0);
    expect(lasso50.coefficients[2]).toBe(0);

    // Shrinkage is monotonic with lambda on this dataset.
    const magnitude1 = Math.abs(lasso1.coefficients[1]) + Math.abs(lasso1.coefficients[2]);
    const magnitude50 = Math.abs(lasso50.coefficients[1]) + Math.abs(lasso50.coefficients[2]);
    expect(magnitude50).toBeLessThan(magnitude1);
  });

  it('throws when features and target lengths mismatch', () => {
    expect(() => fitLassoRegression([[1, 2]], [1, 2], 1)).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => fitLassoRegression([], [], 1)).toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- regression.test.ts`
Expected: FAIL — `fitLassoRegression` is not exported from `./regression` (TypeScript/import error or `is not a function`).

- [ ] **Step 3: Implement `fitLassoRegression`**

In `src/lib/regression.ts`, add this after the existing `fitRidgeRegression` function (before `predict`):

```ts
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
    if (maxChange < tol) break;
  }

  const intercept = yMean - featureMeans.reduce((sum, m, j) => sum + m * beta[j], 0);
  return { coefficients: [intercept, ...beta] };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -- regression.test.ts`
Expected: PASS — all tests in the file, including the new `fitLassoRegression` block.

- [ ] **Step 5: Run the full test suite to check for regressions**

Run: `npm run test`
Expected: all existing tests still pass, plus the new ones (total test count increases by 7).

- [ ] **Step 6: Commit**

```bash
git add src/lib/regression.ts src/lib/regression.test.ts
git commit -m "$(cat <<'EOF'
Add fitLassoRegression

Coordinate descent with soft-thresholding, since L1 regularization has
no closed form (unlike fitRidgeRegression's normal-equation solve).
Column-centers features and target internally so the intercept can be
computed directly, unpenalized, without adding it to the descent loop.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `LassoRegressionFit.tsx` interactive component

**Files:**
- Create: `src/components/charts/LassoRegressionFit.tsx`

**Interfaces:**
- Consumes:
  - `TRAIN_SET: DataPoint[]`, `TEST_SET: DataPoint[]` (`DataPoint = { x: number; y: number }`) from `../../lib/polynomialFit`.
  - `fitLassoRegression(features: number[][], target: number[], lambda: number): RegressionResult`, `predict(coefficients: number[], features: number[]): number`, `rmse(actual: number[], predicted: number[]): number` from `../../lib/regression` (Task 1).
  - `computeStats(values: number[]): ScalingStats`, `applyZScore(value: number, stats: ScalingStats): number` from `../../lib/scaling` (both already exist, added in the Ridge Regression chapter's plan).
- Produces: default export `LassoRegressionFit` (a React component with no props), consumed by Task 3's `[slug].astro` edit as `<LassoRegressionFit client:only="react">`.

This task has no automated test file — this codebase verifies chart components via `astro check` + `npm run build` + manual/CDP browser verification, not Vitest, because they're thin Plotly wiring with no independently-meaningful pure logic of their own (the real logic lives in `src/lib/*.ts`, which Task 1 already tested). Follow that same pattern here.

- [ ] **Step 1: Create the component file**

Create `src/components/charts/LassoRegressionFit.tsx` with this exact content:

```tsx
import { useState } from 'react';
import Plot from 'react-plotly.js';
import { TRAIN_SET, TEST_SET } from '../../lib/polynomialFit';
import { fitLassoRegression, predict, rmse } from '../../lib/regression';
import { computeStats, applyZScore, type ScalingStats } from '../../lib/scaling';

const DEGREE = 15;
const LAMBDA_OPTIONS = [0.01, 0.05, 0.1, 1, 10] as const;
type Lambda = (typeof LAMBDA_OPTIONS)[number];

// 判定係數是否「恰好歸零」的門檻——coordinate descent 收斂後真正歸零的係數會是精確的
// 0，這個門檻只是為了容許極小的浮點數誤差，不是在做「近似歸零」的模糊判斷。
const ZERO_THRESHOLD = 1e-6;

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

const legendStyle = {
  bgcolor: 'rgba(0,0,0,0)',
  x: 0.02,
  y: 0.98,
  itemclick: false as const,
  itemdoubleclick: false as const,
  font: { color: '#e4e6eb' },
};

function polynomialFeatures(x: number, degree: number): number[] {
  const features: number[] = [];
  for (let d = 1; d <= degree; d++) features.push(x ** d);
  return features;
}

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};
function toSuperscript(n: number): string {
  return String(n)
    .split('')
    .map((digit) => SUPERSCRIPT_DIGITS[digit])
    .join('');
}
const FEATURE_LABELS: string[] = Array.from({ length: DEGREE }, (_, i) => `x${toSuperscript(i + 1)}`);

const ALL_X = [...TRAIN_SET, ...TEST_SET].map((p) => p.x);
const X_MIN = Math.min(...ALL_X);
const X_MAX = Math.max(...ALL_X);
const CURVE_SAMPLE_COUNT = 61;
const CURVE_SAMPLE_X: number[] = Array.from(
  { length: CURVE_SAMPLE_COUNT },
  (_, i) => X_MIN + (X_MAX - X_MIN) * (i / (CURVE_SAMPLE_COUNT - 1))
);

const trainRawFeatures = TRAIN_SET.map((p) => polynomialFeatures(p.x, DEGREE));
const testRawFeatures = TEST_SET.map((p) => polynomialFeatures(p.x, DEGREE));
const trainY = TRAIN_SET.map((p) => p.y);
const testY = TEST_SET.map((p) => p.y);

// 用「訓練集」算出的每一欄 mean/std，套用到訓練/測試/曲線取樣點，避免用測試集自己的統計量（那會造成資訊洩漏）
const COLUMN_STATS: ScalingStats[] = Array.from({ length: DEGREE }, (_, col) =>
  computeStats(trainRawFeatures.map((row) => row[col]))
);

function standardizeRow(row: number[]): number[] {
  return row.map((v, col) => applyZScore(v, COLUMN_STATS[col]));
}

const trainStdFeatures = trainRawFeatures.map(standardizeRow);
const testStdFeatures = testRawFeatures.map(standardizeRow);

interface LambdaFit {
  lambda: Lambda;
  curve: { x: number; y: number }[];
  trainRmse: number;
  testRmse: number;
  coefficients: number[]; // 標準化空間下的 β₁..β₁₅（不含截距）
  zeroCount: number;
}

function computeForLambda(lambda: Lambda): LambdaFit {
  const { coefficients } = fitLassoRegression(trainStdFeatures, trainY, lambda);
  const trainPredicted = trainStdFeatures.map((f) => predict(coefficients, f));
  const testPredicted = testStdFeatures.map((f) => predict(coefficients, f));
  const curve = CURVE_SAMPLE_X.map((x) => {
    const standardized = standardizeRow(polynomialFeatures(x, DEGREE));
    return { x, y: predict(coefficients, standardized) };
  });
  const betaOnly = coefficients.slice(1);

  return {
    lambda,
    curve,
    trainRmse: rmse(trainY, trainPredicted),
    testRmse: rmse(testY, testPredicted),
    coefficients: betaOnly,
    zeroCount: betaOnly.filter((c) => Math.abs(c) < ZERO_THRESHOLD).length,
  };
}

const LAMBDA_FITS: Record<Lambda, LambdaFit> = Object.fromEntries(
  LAMBDA_OPTIONS.map((lambda) => [lambda, computeForLambda(lambda)])
) as Record<Lambda, LambdaFit>;

// Ridge 版本用 log 座標（係數量級跨越 200 倍以上）；Lasso 白名單內最大係數全部落在
// 個位數到十位數（同一量級），改用線性座標——log(0) 無法顯示「恰好歸零」的長條，
// 線性座標才能正確呈現這個效果。
const COLOR_NONZERO = '#7c5ee6';
const COLOR_ZERO = '#4a5164';
function barColors(coefficients: number[]): string[] {
  return coefficients.map((c) => (Math.abs(c) < ZERO_THRESHOLD ? COLOR_ZERO : COLOR_NONZERO));
}

export default function LassoRegressionFit() {
  const [lambda, setLambda] = useState<Lambda>(LAMBDA_OPTIONS[0]);
  const fit = LAMBDA_FITS[lambda];

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {LAMBDA_OPTIONS.map((l) => (
          <button
            key={l}
            type="button"
            className={l === lambda ? 'is-active' : ''}
            onClick={() => setLambda(l)}
          >
            λ = {l}
          </button>
        ))}
      </div>
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto', marginBottom: '16px' }}
      >
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: TRAIN_SET.map((p) => p.x),
              y: TRAIN_SET.map((p) => p.y),
              marker: { size: 7, color: '#5ee6d0', opacity: 0.8 },
              name: '訓練集',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: TEST_SET.map((p) => p.x),
              y: TEST_SET.map((p) => p.y),
              marker: { size: 7, color: '#e6a15e', opacity: 0.9 },
              name: '測試集',
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: fit.curve.map((p) => p.x),
              y: fit.curve.map((p) => p.y),
              line: { color: '#7c5ee6', width: 3 },
              name: `λ=${lambda} 擬合曲線`,
            },
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: '#0f1117',
            plot_bgcolor: '#0f1117',
            font: { color: '#e4e6eb' },
            hoverlabel: {
              bgcolor: '#161922',
              bordercolor: '#262a35',
              font: { color: '#e4e6eb' },
            },
            dragmode: false,
            legend: legendStyle,
            title: { text: '模型擬合曲線（次數 15）', font: { color: '#e4e6eb', size: 14 } },
            xaxis: { title: 'x', ...axisStyle },
            yaxis: { title: 'y', ...axisStyle },
            margin: { l: 50, r: 20, t: 40, b: 45 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '300px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto' }}
      >
        <Plot
          data={[
            {
              type: 'bar',
              x: FEATURE_LABELS,
              y: fit.coefficients.map((c) => Math.abs(c)),
              marker: { color: barColors(fit.coefficients) },
              name: `λ=${lambda} 標準化係數`,
            },
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: '#0f1117',
            plot_bgcolor: '#0f1117',
            font: { color: '#e4e6eb' },
            hoverlabel: {
              bgcolor: '#161922',
              bordercolor: '#262a35',
              font: { color: '#e4e6eb' },
            },
            dragmode: false,
            showlegend: false,
            title: {
              text: '標準化係數（|βⱼ|，線性座標，灰色＝已歸零）',
              font: { color: '#e4e6eb', size: 14 },
            },
            xaxis: { title: '多項式特徵項', ...axisStyle },
            yaxis: { title: '係數絕對值', ...axisStyle },
            margin: { l: 55, r: 20, t: 40, b: 45 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '260px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>λ={lambda} — 訓練 RMSE</dt>
          <dd>{fit.trainRmse.toFixed(4)}</dd>
        </div>
        <div>
          <dt>λ={lambda} — 測試 RMSE</dt>
          <dd>{fit.testRmse.toFixed(4)}</dd>
        </div>
        <div>
          <dt>λ={lambda} — 已歸零係數</dt>
          <dd>{fit.zeroCount} / {DEGREE}</dd>
        </div>
      </dl>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors, 0 warnings. If there's a type error on the `LAMBDA_FITS` cast, double check `LAMBDA_OPTIONS` is declared `as const` (it is, above) — that's what makes `Lambda` a union of literal numbers instead of `number`.

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/LassoRegressionFit.tsx
git commit -m "$(cat <<'EOF'
Add LassoRegressionFit interactive component

Reuses RidgeRegressionFit's fixed-degree-15 dataset and standardization
pipeline. Unlike Ridge's log-scale bar chart, this uses a linear scale
(Lasso's whitelisted coefficients stay within one order of magnitude,
and log(0) can't render an exactly-zeroed coefficient) with zeroed bars
shown in a muted color, plus a zero-coefficient count stat.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Chapter content + routing/config wiring

**Files:**
- Create: `src/content/chapters/lasso-regression.md`
- Modify: `src/pages/chapters/[slug].astro`
- Modify: `src/config/chapters.ts`
- Modify: `src/config/curriculum.ts`

**Interfaces:**
- Consumes: `LassoRegressionFit` default export from Task 2 (`src/components/charts/LassoRegressionFit.tsx`).
- Produces: a live page at `/chapters/lasso-regression`; `chapterOrder` and `curriculum` entries Task 4's `curriculum.test.ts` edit depends on.

- [ ] **Step 1: Create the chapter content file**

Create `src/content/chapters/lasso-regression.md`. **Do not include a `summary:` field yet** — the `image:` path inside it would point at a PNG that doesn't exist until Task 5, and Astro's `image()` schema helper validates the referenced file exists at build time, so a premature `summary.image` reference fails `npm run build` with `ImageNotFound`. This matches the established precedent for every prior chapter in this codebase (see `docs/superpowers/plans/2026-08-03-ridge-regression-chapter.md` Task 3 Step 1 for the full history). Task 5 of this plan adds `summary:` to this file the same way — see Task 5 Step 0 below.

```md
---
title: Lasso 迴歸
stage: 監督式學習－迴歸
category:
  - 監督式學習
  - 迴歸
interactiveComponent: lasso-regression-fit
---

## 簡介

Lasso Regression 在線性回歸的損失函數中加入 L1 正則化項（係數絕對值之和），與 Ridge 的 L2 懲罰不同之處在於：L1 懲罰會把不重要的係數直接壓成恰好 0，等於在訓練模型的同時自動做「特徵選擇」。

**與 Ridge Regression 的關係**：兩者都是抑制係數過大的正則化手段，差異在懲罰項的形狀——Ridge 用平方項（處處可微），Lasso 用絕對值（在 0 處不可微），這個數學差異直接導致 Lasso 會把係數壓到恰好 0、Ridge 不會。本章案例延續 Ridge 章節同一組次數 15 多項式資料，在相同 λ 下直接對比兩者的係數收縮方式：同樣 λ=0.01，Ridge 保留全部 15 個係數，Lasso 則有 7 個係數恰好歸零。

## 分類方式

- **學習類型**：監督式學習（Supervised Learning）
- **任務類型**：迴歸（Regression）——預測連續數值，而非類別標籤
- **模型類型**：正則化線性模型（Regularized Linear Model）

## 數學原理

Lasso Regression 在普通最小平方法的損失函數上，加入係數絕對值之和的懲罰項：

$$
J(\beta) = \sum_{i=1}^{n}(y_i - \hat y_i)^2 + \lambda \sum_{j=1}^{p}|\beta_j|
$$

懲罰項不包含截距 $\beta_0$。與 Ridge 不同，L1 懲罰項在 $\beta_j=0$ 處不可微分，**沒有閉式解**，需用迭代演算法求解——本站採用 coordinate descent，逐一更新每個係數：

$$
\beta_j \leftarrow \frac{S(\rho_j,\ \lambda/2)}{\sum_i x_{ij}^2}
$$

其中 $S(z,\gamma)=\text{sign}(z)\max(|z|-\gamma,0)$ 是軟門檻算子（soft-thresholding），$\rho_j$ 是排除 $\beta_j$ 貢獻後的殘差相關性。當 $|\rho_j|$ 小於門檻 $\lambda/2$ 時，$\beta_j$ 會被直接設為 0——這正是特徵選擇效果的數學來源。

**使用前必須先將特徵標準化**，理由與 Ridge 相同：若特徵尺度不同，同樣大小的 $\lambda$ 對不同特徵的懲罰力道會不公平。本章節互動演示固定使用次數 15 的多項式特徵，與 Ridge 章節共用同一套標準化管線。

## 運用範例

- **高次多項式係數自動篩選**（本章案例）：延續 Ridge 資料，展示 L1 正則化不只收縮、還會篩掉冗餘的高次項
- **高維稀疏建模**：特徵數遠大於樣本數、且僅少數特徵真正有效的情境（如基因體學、文字特徵）
- **需要精簡模型、丟棄冗餘特徵以利解讀時**

## 適用情境與限制

**適合使用的情境：**

- 想自動做特徵選擇、精簡模型
- 特徵數多、懷疑許多特徵是雜訊或冗餘
- 需要可解釋性較高、係數較稀疏的模型

**限制與假設：**

- **沒有閉式解**：需迭代求解（coordinate descent），計算成本較 Ridge 高，且在特徵高度相關時可能收斂緩慢
- **特徵選擇結果不穩定**：特徵間高度相關時，Lasso 傾向從相關的一群特徵中挑一個保留、其餘設為 0，換一批資料可能選到不同特徵
- **前提是特徵已標準化**：否則懲罰力道被特徵尺度扭曲

## 評估指標

- **R²（決定係數）**：模型解釋了目標變數變異量的比例，範圍 0～1，越接近 1 代表模型解釋力越強
- **RMSE（均方根誤差）**：預測值與實際值誤差的平方平均後開根號，train/test 雙集顯示可看出正則化對泛化能力的影響
- **歸零係數數量**：Lasso 特有的指標，量化特徵選擇的效果——數量越多，代表模型認為越多特徵是冗餘的

## 常見誤區

- **誤以為 Lasso 和 Ridge 只是「換一個公式」、效果差不多**：L1/L2 的可微性差異直接導致行為質變（歸零 vs 平滑收縮），同一個 λ 值下兩者的模型結構可能完全不同
- **誤以為 Lasso 選出的特徵組合就是「真正重要」的特徵**：當特徵高度相關時，被選中或被歸零可能只是任意的（見上方限制）
- **忘記標準化就直接套用 Lasso**：與 Ridge 同理，懲罰力道會被特徵尺度扭曲
```

- [ ] **Step 2: Wire the interactive component into `[slug].astro`**

In `src/pages/chapters/[slug].astro`, add the import right after the existing `RidgeRegressionFit` import line (currently line 13):

```astro
import RidgeRegressionFit from '../../components/charts/RidgeRegressionFit';
import LassoRegressionFit from '../../components/charts/LassoRegressionFit';
```

Then add a new conditional render block right after the existing `ridge-regression-fit` block (after its closing `)}` at line 111, before the closing `</main>` at line 112):

```astro
    {chapter.data.interactiveComponent === 'lasso-regression-fit' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        <LassoRegressionFit client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">互動圖表載入中……</div>
        </LassoRegressionFit>
      </section>
    )}
```

- [ ] **Step 3: Extend the chapter chain in `chapters.ts`**

In `src/config/chapters.ts`, the file currently ends with:

```ts
  {
    slug: 'ridge-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'polynomial-regression',
  },
];
```

Replace it with:

```ts
  {
    slug: 'ridge-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'polynomial-regression',
    nextSlug: 'lasso-regression',
  },
  {
    slug: 'lasso-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'ridge-regression',
  },
];
```

- [ ] **Step 4: Wire `curriculum.ts`**

In `src/config/curriculum.ts`, replace:

```ts
      { name: 'Lasso Regression（Lasso 迴歸，正則化）' },
```

with:

```ts
      {
        name: 'Lasso Regression（Lasso 迴歸，正則化）',
        slug: 'lasso-regression',
        relatedTo: ['Ridge Regression（Ridge 迴歸，正則化）'],
      },
```

Then, in the same file, add `'Lasso Regression（Lasso 迴歸，正則化）'` to the existing Ridge Regression topic's `relatedTo` array (making the link bidirectional). Change:

```ts
      {
        name: 'Ridge Regression（Ridge 迴歸，正則化）',
        slug: 'ridge-regression',
        relatedTo: [
          'Polynomial Regression（多項式回歸）',
          '過擬合/欠擬合與偏差-變異數權衡',
          '特徵工程與標準化',
        ],
      },
```

to:

```ts
      {
        name: 'Ridge Regression（Ridge 迴歸，正則化）',
        slug: 'ridge-regression',
        relatedTo: [
          'Polynomial Regression（多項式回歸）',
          '過擬合/欠擬合與偏差-變異數權衡',
          '特徵工程與標準化',
          'Lasso Regression（Lasso 迴歸，正則化）',
        ],
      },
```

- [ ] **Step 5: Type-check and build**

Run: `npx astro check`
Expected: 0 errors, 0 warnings.

Run: `npm run build`
Expected: build succeeds, 11 pages produced (10 existing — 9 chapters + `index.astro` — plus the new `lasso-regression` chapter).

- [ ] **Step 6: Commit**

```bash
git add src/content/chapters/lasso-regression.md "src/pages/chapters/[slug].astro" src/config/chapters.ts src/config/curriculum.ts
git commit -m "$(cat <<'EOF'
Add Lasso Regression chapter page

Nine-block content, wired into the chapter chain after Ridge Regression,
with its LassoRegressionFit interactive component mounted and a
bidirectional curriculum.ts relatedTo link to/from Ridge Regression.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Ridge Regression's relatedTo paragraph + test/doc updates

**Files:**
- Modify: `src/content/chapters/ridge-regression.md`
- Modify: `src/config/curriculum.test.ts`
- Modify: `docs/specs/chapter_template_guide.md`

**Interfaces:** None — this task only edits Markdown prose, a test assertion list, and a doc table. No functions or types are produced or consumed.

- [ ] **Step 1: Add the relation paragraph to Ridge Regression's 簡介**

In `src/content/chapters/ridge-regression.md`, after the existing line:

```md
**與特徵工程與標準化的關係**：Ridge 的懲罰項是對係數大小做懲罰，若特徵尺度不同，懲罰力道就會不公平地偏向小尺度特徵的係數——這正是該章節「標準化」的實務意義所在，Ridge 是標準化「為什麼重要」的具體範例。
```

add a new paragraph immediately after it (still inside the `## 簡介` section, before `## 分類方式`):

```md

**與 Lasso Regression 的關係**：兩者都是抑制係數過大的正則化手段，差異在懲罰項的形狀——Ridge 用平方項（處處可微，係數平滑收縮但不會恰好變成 0），Lasso 用絕對值（在 0 處不可微，會把不重要的係數直接壓成恰好 0，等於自動做特徵選擇）。同樣 λ=0.01，Ridge 保留全部 15 個係數，Lasso 則有 7 個係數恰好歸零。
```

- [ ] **Step 2: Update `curriculum.test.ts`'s built-chapter assertion**

In `src/config/curriculum.test.ts`, the test currently named `'marks exactly the nine currently-built chapters as having a slug'` expects a 9-item array ending in `'Ridge Regression（Ridge 迴歸，正則化）'`. Update the test name to `'ten'` and insert the new chapter name right after Ridge Regression:

```ts
  it('marks exactly the ten currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'CRISP-DM 資料分析方法',
      '特徵工程與標準化',
      '訓練/測試切分與交叉驗證',
      '過擬合/欠擬合與偏差-變異數權衡',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
      'Polynomial Regression（多項式回歸）',
      'Ridge Regression（Ridge 迴歸，正則化）',
      'Lasso Regression（Lasso 迴歸，正則化）',
    ]);
  });
```

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: all tests pass, including the updated `curriculum.test.ts` assertion (the `every relatedTo reference points to an existing topic name` test should also still pass, since Lasso's `relatedTo` target — Ridge Regression — already exists as a topic name, and Ridge's new `relatedTo` target — Lasso Regression — was added in Task 3).

- [ ] **Step 4: Update the cross-chapter relation table in `chapter_template_guide.md`**

In `docs/specs/chapter_template_guide.md`, the 1.1 section's table currently has 9 rows. Add 1 new row after the existing `Ridge Regression | 特徵工程與標準化` row:

```md
   | Ridge Regression | Lasso Regression | L2 平滑收縮 vs L1 特徵選擇的直接對比 | 兩側已補 |
```

Also update the introductory sentence above the table (currently says `目前 9 組核心關聯對照表`) to say `目前 10 組核心關聯對照表`.

- [ ] **Step 5: Verify build and full checks**

Run: `npx astro check`
Expected: 0 errors, 0 warnings.

Run: `npm run build`
Expected: 11 pages produced successfully.

Run: `npm run test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/content/chapters/ridge-regression.md src/config/curriculum.test.ts docs/specs/chapter_template_guide.md
git commit -m "$(cat <<'EOF'
Wire Lasso Regression's relatedTo paragraph into Ridge Regression

Adds the "與 Lasso Regression 的關係" paragraph to the already-shipped
Ridge Regression chapter, and updates curriculum.test.ts and the
chapter_template_guide.md relation table to match.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Excalidraw-style summary infographic

**Files:**
- Modify: `src/content/chapters/lasso-regression.md` (add the `summary:` frontmatter field — deferred here from Task 3; see Task 3 Step 1's note)
- Create: `docs/specs/assets-src/lasso-regression-summary.html`
- Create: `scripts/render-lasso-regression-infographic.ps1`
- Create (rendered output, via Step 3 below): `src/assets/chapters/lasso-regression-summary.png`

**Interfaces:** None — this is a standalone static HTML asset rendered to PNG by a headless-Edge screenshot script, matching the existing pattern used by every other chapter's infographic (`docs/specs/assets-src/ridge-regression-summary.html` is the reference — copy it, don't start from scratch). It is consumed via the `image:` path added to `lasso-regression.md` in Step 0 below, which `ChapterSummaryCard.astro` reads generically — no code changes needed there.

- [ ] **Step 0: Add the `summary:` frontmatter field to `lasso-regression.md`**

Task 3 deliberately shipped `lasso-regression.md` without a `summary:` field (a premature `image:` reference would have failed `npm run build` before this PNG existed). Add this block to the frontmatter, right after the existing `interactiveComponent: lasso-regression-fit` line (before the closing `---`):

```yaml
summary:
  formulas:
    - "J(\\beta) = \\sum_{i=1}^{n}(y_i - \\hat y_i)^2 + \\lambda \\sum_{j=1}^{p}|\\beta_j|"
    - "\\beta_j \\leftarrow S(\\rho_j,\\ \\lambda/2) / \\sum_i x_{ij}^2"
  keyStats:
    - label: 適用資料型態
      value: 想做特徵選擇、疑似有冗餘特徵
    - label: 常用評估指標
      value: R², RMSE，歸零係數數量
    - label: 訓練方式
      value: 標準化特徵＋coordinate descent（無閉式解）
  image: ../../assets/chapters/lasso-regression-summary.png
```

- [ ] **Step 1: Create the infographic HTML source**

Create `docs/specs/assets-src/lasso-regression-summary.html`. Copy `docs/specs/assets-src/ridge-regression-summary.html` verbatim as the starting point (same `<style>` block, same rough.js wiring script at the bottom, same `palette` object in the script — none of that needs to change), then replace only the `<head><title>`, and the `<body>` content between `<div class="page" id="page">` and the closing `</div>` before `<script src="rough-engine.js">`, exactly as follows:

`<title>`:
```html
  <title>Lasso Regression 資訊圖表（Excalidraw 風格）</title>
```

Header block:
```html
  <header class="title-block">
    <canvas class="doodle" id="doodle"></canvas>
    <h1 class="main-title">Lasso 迴歸</h1>
    <div class="subtitle">Lasso Regression · 監督式學習－迴歸</div>
    <canvas class="title-underline" id="title-underline"></canvas>
  </header>
```

Card ①簡介:
```html
  <section class="card intro" data-sketch="intro">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">①</span><h2>簡介</h2></div>
      <div class="card-body">
        Lasso Regression 在線性回歸的損失函數中加入 L1 正則化項（係數絕對值之和）。與 Ridge 不同，L1 懲罰會把不重要的係數直接壓成恰好 0，等於在訓練模型的同時自動做「特徵選擇」。
        <div class="tag-row">
          <span class="tag" data-sketch="tag1"><canvas class="sketch-bg"></canvas><span>監督式學習</span></span>
          <span class="tag" data-sketch="tag2"><canvas class="sketch-bg"></canvas><span>迴歸任務</span></span>
          <span class="tag" data-sketch="tag3"><canvas class="sketch-bg"></canvas><span>L1 正則化</span></span>
        </div>
      </div>
    </div>
  </section>
```

Card ②模型公式:
```html
  <section class="card formula" data-sketch="formula">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">②</span><h2>模型公式</h2></div>
      <div class="card-body">
        <div class="formula-block">
          <div class="eq">J(β) &nbsp;=&nbsp; Σ(yᵢ − ŷᵢ)² + λΣ|βⱼ|</div>
          <div class="eq">βⱼ &nbsp;←&nbsp; S(ρⱼ, λ/2) / Σxᵢⱼ²</div>
        </div>
        懲罰項不包含截距 β₀。L1 項在 βⱼ=0 處不可微分，<b>沒有閉式解</b>，需用 coordinate descent 迭代求解——這是與 Ridge 最根本的差異。
      </div>
    </div>
  </section>
```

Card ③適用情境與假設限制:
```html
  <section class="card scope" data-sketch="scope">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">③</span><h2>適用情境與假設限制</h2></div>
      <div class="card-body two-col scope-cols">
        <div>
          <h3 class="good">✓ 適合使用的情境</h3>
          <ul>
            <li>想自動做特徵選擇、精簡模型</li>
            <li>特徵數多，懷疑許多是雜訊或冗餘</li>
            <li>需要可解釋性較高、係數較稀疏的模型</li>
          </ul>
        </div>
        <div>
          <h3 class="bad">⚠ 假設與限制</h3>
          <ul>
            <li>沒有閉式解，計算成本較 Ridge 高</li>
            <li>特徵高度相關時，特徵選擇結果不穩定</li>
            <li>前提是特徵已標準化，否則懲罰力道不公平</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

Card ④評估指標:
```html
  <section class="card metric" data-sketch="metric">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">④</span><h2>評估指標</h2></div>
      <div class="card-body metric-grid">
        <div class="metric-box" data-sketch="m1">
          <canvas class="sketch-bg"></canvas>
          <div class="card-inner">
            <h4>RMSE（均方根誤差）</h4>
            <div class="eq" style="font-size:15px">RMSE &nbsp;=&nbsp; √( mean( (yᵢ−ŷᵢ)² ) )</div>
            <p>train/test 雙集顯示，可看出正則化對泛化能力的影響。</p>
          </div>
        </div>
        <div class="metric-box" data-sketch="m2">
          <canvas class="sketch-bg"></canvas>
          <div class="card-inner">
            <h4>歸零係數數量</h4>
            <div class="eq" style="font-size:15px">count( |βⱼ| = 0 )</div>
            <p>Lasso 特有指標，量化特徵選擇的效果——數量越多，代表模型認為越多特徵是冗餘的。</p>
          </div>
        </div>
      </div>
    </div>
  </section>
```

Card ⑤常見誤區:
```html
  <section class="card pitfall" data-sketch="pitfall">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">⑤</span><h2>常見誤區</h2></div>
      <div class="card-body">
        <ul>
          <li><b>誤以為 Lasso 和 Ridge 效果差不多</b>——可微性差異直接導致行為質變（歸零 vs 平滑收縮）。</li>
          <li><b>誤以為選出的特徵組合就是「真正重要」的特徵</b>——特徵高度相關時，被選中或歸零可能是任意的。</li>
          <li><b>忘記標準化就直接套用 Lasso</b>——懲罰力道會被特徵尺度扭曲。</li>
        </ul>
      </div>
    </div>
  </section>
```

Card ⑥案例分析 (board):
```html
  <section class="board" data-sketch="board">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <h2>案例分析：Ridge vs Lasso 係數收縮方式對比（多項式次數 15，λ=0.01）</h2>
      <div class="board-sub">重用過擬合/欠擬合章節的合成資料，固定多項式次數 15 與 λ=0.01，比較 Ridge 與 Lasso 的係數收縮方式</div>

      <div class="metabar">
        <div class="meta-item"><div class="label">資料集</div><div class="value">合成 sin 曲線資料</div></div>
        <div class="meta-item"><div class="label">訓練/測試</div><div class="value">35 / 15 筆</div></div>
        <div class="meta-item"><div class="label">特徵</div><div class="value">x¹ ~ x¹⁵</div></div>
        <div class="meta-item"><div class="label">λ</div><div class="value">0.01</div></div>
        <div class="meta-item"><div class="label">求解方式</div><div class="value">標準化＋coordinate descent</div></div>
      </div>

      <div class="board-grid">
        <div>
          <table class="coef-table">
            <thead>
              <tr><th>指標</th><th>Ridge（λ=0.01）</th><th>Lasso（λ=0.01）</th></tr>
            </thead>
            <tbody>
              <tr><td>Test RMSE</td><td>0.3204</td><td>0.2764</td></tr>
              <tr><td>最大係數絕對值</td><td>5.7643</td><td>7.6830</td></tr>
              <tr><td>歸零係數數(/15)</td><td>0</td><td>7</td></tr>
            </tbody>
          </table>
          <div class="big-stats">
            <div class="big-stat"><div class="label">Lasso 歸零特徵</div><div class="value">7 / 15</div></div>
            <div class="big-stat"><div class="label">Lasso Test RMSE 更優</div><div class="value">−13.7%</div></div>
          </div>
        </div>
        <ul class="insight-list">
          <li>同樣 λ=0.01，Ridge 平滑收縮全部 15 個係數，Lasso 卻讓其中 <span class="hl">7 個</span>係數恰好歸零——L1 懲罰項不可微分的數學性質，直接導致這個行為質變。</li>
          <li>Lasso 在此案例的 test RMSE（<span class="hl">0.2764</span>）甚至優於 Ridge（0.3204），特徵選擇進一步降低了模型複雜度。</li>
          <li>兩者都是正則化工具，但解決的問題不同：Ridge 適合「保留所有特徵、只是要抑制係數過大」，Lasso 適合「想自動篩掉不重要的特徵」。</li>
          <li>本案例沿用 Ridge Regression 章節同一組次數 15 多項式資料與標準化管線，呼應該章節「與 Lasso Regression 的關係」段落。</li>
        </ul>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Create the render script**

Create `scripts/render-lasso-regression-infographic.ps1`, copying the exact structure of `scripts/render-ridge-regression-infographic.ps1` (which already uses the `$repoRoot = Split-Path -Parent $PSScriptRoot` dynamic path pattern — do not hardcode an absolute checkout path):

```powershell
# Render Lasso Regression Infographic HTML to PNG
$repoRoot = Split-Path -Parent $PSScriptRoot
$htmlPath = Join-Path $repoRoot "docs/specs/assets-src/lasso-regression-summary.html"
$outputPath = Join-Path $repoRoot "src/assets/chapters/lasso-regression-summary.png"

# Detect Edge Path
$edgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Microsoft\Edge\Application\msedge.exe"
)

$edgePath = $null
foreach ($path in $edgePaths) {
    if (Test-Path $path) {
        $edgePath = $path
        break
    }
}

if (-not $edgePath) {
    Write-Error "Could not find Microsoft Edge installation path."
    exit 1
}

Write-Host "Rendering HTML with Edge..."
Write-Host "Source: $htmlPath"
Write-Host "Output: $outputPath"

# Run screenshot
& $edgePath --headless --disable-gpu --screenshot="$outputPath" --window-size=794,1960 --force-device-scale-factor=3 "file:///$htmlPath"

if (Test-Path $outputPath) {
    Write-Host "Rendering completed successfully!"
} else {
    Write-Error "Rendering failed. PNG was not created."
}
```

- [ ] **Step 3: Render the PNG**

Run: `powershell -File scripts/render-lasso-regression-infographic.ps1`
Expected: `src/assets/chapters/lasso-regression-summary.png` is created. If the Edge headless screenshot races ahead of the rough.js canvas paint (a known, previously-documented issue across every chapter's render script, not specific to this one), or `Test-Path` reports success/failure unreliably (also previously documented — see this chapter's design doc's "第 22 階段最終審查記錄的建議事項" note), just re-run the same command and personally check the output file's timestamp/content; do not add delays or modify the script's logic without checking with the developer first.

- [ ] **Step 4: Personally view the rendered PNG**

Use the Read tool to open `src/assets/chapters/lasso-regression-summary.png` and visually inspect it. This step cannot be delegated to a reviewer subagent — sub-review agents cannot view binary image files, and this codebase has a documented past incident (phase 20) where a subagent-reviewed infographic passed review with a rendering bug that only surfaced when a human/the primary agent actually looked at the image. Check specifically:
- All 6 cards render (no blank cards, no missing rough.js sketch borders).
- No literal `$...$`, `\ldots`, `\beta` or other LaTeX/math source text is visible anywhere (this HTML has no KaTeX engine — all math must already be plain Unicode, which the card content above already uses, but double-check nothing slipped through).
- The title-underline decoration under "Lasso 迴歸" doesn't overlap or clip against the doodle icon (compare visually against `ridge-regression-summary.png`'s title-block spacing since "Lasso 迴歸" is a similarly short title).
- The board (case-study) section's table and big-stats numbers match Task 5 Step 1's content exactly (0.3204 / 0.2764 / 5.7643 / 7.6830 / 0 / 7).

If anything is wrong, fix the HTML and re-render (Step 3) before proceeding — do not commit a broken image.

- [ ] **Step 5: Verify the chapter page displays the image**

Run: `npm run build`, then `npm run preview` (background), then either fetch the built HTML or use headless Edge to confirm `/chapters/lasso-regression` renders the `ChapterSummaryCard` image without a broken-image icon. Stop the preview server afterward (find its PID via `netstat -ano` on the preview port, then `taskkill //PID <pid> //F`) — do not leave it running.

- [ ] **Step 6: Commit**

```bash
git add src/content/chapters/lasso-regression.md docs/specs/assets-src/lasso-regression-summary.html scripts/render-lasso-regression-infographic.ps1 src/assets/chapters/lasso-regression-summary.png
git commit -m "$(cat <<'EOF'
Add Lasso Regression summary infographic

Excalidraw-style, six-card layout matching the existing algorithm-chapter
template. Case study contrasts Ridge and Lasso at the same lambda=0.01
on the shared degree-15 dataset: Ridge keeps all 15 coefficients
nonzero (test RMSE=0.3204), Lasso zeroes 7 of 15 (test RMSE=0.2764).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Final Verification (after all 5 tasks)

- [ ] `npx astro check` — 0 errors, 0 warnings
- [ ] `npm run build` — 11 pages produced
- [ ] `npm run test` — all tests pass
- [ ] Browser/CDP verification: λ whitelist buttons (`0.01, 0.05, 0.1, 1, 10`) update the curve, the linear-scale coefficient bar chart (with zeroed bars in the muted color), and train/test RMSE + zero-count correctly. Specifically click λ=0.01 and λ=10 and confirm the displayed numbers match this plan's design-doc reference table (λ=0.01: train 0.1985 / test 0.2764 / zeros 7; λ=10: train 0.9012 / test 0.9128 / zeros 12) — if the on-page numbers don't match, that's a real bug (likely a centering or soft-threshold mistake), stop and investigate rather than adjusting the reference numbers. Confirm the component mounts without a noticeable freeze (the whole 5-λ precompute should be well under 300ms). Also confirm `chapterOrder` via `curl` on the built HTML (not a screenshot — the top nav track can clip visually) showing `polynomial-regression → ridge-regression → lasso-regression` with correct `aria-current`; the Ridge Regression page's new relatedTo paragraph renders correctly with no regression to that page's existing content.
- [ ] Close any dev/preview server started during this work (per project convention — check `netstat` on 4321/9333, `taskkill` if anything is still listening).
