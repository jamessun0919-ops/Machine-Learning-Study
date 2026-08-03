# Ridge Regression（Ridge 迴歸，正則化）章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Ridge Regression（Ridge 迴歸，正則化）" chapter — a new page reachable at `/chapters/ridge-regression`, wired into the chapter chain right after Polynomial Regression, using the nine-block algorithm template.

**Architecture:** Two small pure-function library additions (a ridge-regression solver and a "apply previously-computed z-score stats" helper) feed a new client-only React island (`RidgeRegressionFit.tsx`) that reuses the Overfitting chapter's existing synthetic dataset at a fixed polynomial degree of 15, standardizes the polynomial features, and lets the user flip between 5 whitelisted λ values to see the fitted curve, a log-scale coefficient-shrinkage bar chart, and train/test RMSE. The chapter's Markdown content, its Excalidraw-style summary infographic, and three small "related chapter" paragraphs (Polynomial Regression, Overfitting/Underfitting, Feature Engineering & Standardization) complete the page.

**Tech Stack:** Astro (Content Layer API) + React island (`client:only="react"`) + TypeScript + Plotly.js (`react-plotly.js`) + Vitest.

## Global Constraints

- Never use root-absolute paths (`/css/...`) for internal links/assets — always prefix with `import.meta.env.BASE_URL` (site is served from `/Machine-Learning-Study/`). Not touched by this plan (no new raw links), but keep in mind if any task needs one.
- React components that use Plotly must be mounted with `client:only="react"` in `.astro` files, and referenced via literal JSX (no dynamic component lookup tables).
- Chapter interactive components are "pre-designed demos", not free-form tools: parameters are whitelisted buttons, never free sliders/inputs.
- All chat with the developer is in Traditional Chinese; this plan and its code comments (where unavoidable) are in the project's existing mixed English/Chinese style — match whichever file you're editing.
- Design doc for this chapter: `docs/superpowers/specs/2026-08-03-ridge-regression-chapter-design.md` — read it if you need the full rationale; this plan already extracts everything you need to implement.
- Degree is fixed at **15** (not 9 — an earlier design draft assumed 9, but a verification script showed degree 9 doesn't overfit on this dataset; degree 15 is the actually-verified severe-overfit case). Do not "fix" this back to 9.
- All numeric values below (RMSE, coefficients, λ) were computed by a verification script replicating the exact production logic (`dataSplit.ts` + `polynomialFit.ts` + `regression.ts` + `scaling.ts`). Task 1 and Task 2 include tests that will catch any implementation drift from these numbers — if your implementation produces different numbers, that's a real bug, stop and re-check your code against this plan rather than adjusting the expected numbers.

---

### Task 1: Ridge regression solver + z-score application helper

**Files:**
- Modify: `src/lib/regression.ts`
- Modify: `src/lib/regression.test.ts`
- Modify: `src/lib/scaling.ts`
- Modify: `src/lib/scaling.test.ts`

**Interfaces:**
- Consumes: existing private helpers in `regression.ts` (`transpose`, `multiply`, `multiplyVector`, `solveLinearSystem`) and the existing `RegressionResult` interface; existing `ScalingStats` interface and `computeStats` function in `scaling.ts`.
- Produces:
  - `fitRidgeRegression(features: number[][], target: number[], lambda: number): RegressionResult` — exported from `src/lib/regression.ts`. Task 2 imports this.
  - `applyZScore(value: number, stats: ScalingStats): number` — exported from `src/lib/scaling.ts`. Task 2 imports this.

- [ ] **Step 1: Write the failing tests for `fitRidgeRegression`**

Append to `src/lib/regression.test.ts` (add the import and the new `describe` block; keep all existing content unchanged):

```ts
import { describe, it, expect } from 'vitest';
import { fitLinearRegression, fitRidgeRegression, predict, rSquared, rmse } from './regression';
```

(Replace the existing `import { fitLinearRegression, predict, rSquared, rmse } from './regression';` line with the line above — it just adds `fitRidgeRegression` to the same import.)

Add this new `describe` block at the end of the file:

```ts
describe('fitRidgeRegression', () => {
  const features = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ];
  const target = [1, 3, 4, 6, 8, 9];

  it('reduces to fitLinearRegression when lambda is 0', () => {
    const ridge = fitRidgeRegression(features, target, 0);
    const ols = fitLinearRegression(features, target);

    expect(ridge.coefficients[0]).toBeCloseTo(ols.coefficients[0], 8);
    expect(ridge.coefficients[1]).toBeCloseTo(ols.coefficients[1], 8);
    expect(ridge.coefficients[2]).toBeCloseTo(ols.coefficients[2], 8);
  });

  it('shrinks non-intercept coefficients toward zero as lambda increases, without penalizing the intercept', () => {
    const lambda1 = fitRidgeRegression(features, target, 1);
    expect(lambda1.coefficients[0]).toBeCloseTo(1.892857, 5);
    expect(lambda1.coefficients[1]).toBeCloseTo(1.630952, 5);
    expect(lambda1.coefficients[2]).toBeCloseTo(2.297619, 5);

    const lambda10 = fitRidgeRegression(features, target, 10);
    expect(lambda10.coefficients[0]).toBeCloseTo(4.048780, 5);
    expect(lambda10.coefficients[1]).toBeCloseTo(0.587398, 5);
    expect(lambda10.coefficients[2]).toBeCloseTo(0.754065, 5);

    const magnitudeAtLambda1 =
      Math.abs(lambda1.coefficients[1]) + Math.abs(lambda1.coefficients[2]);
    const magnitudeAtLambda10 =
      Math.abs(lambda10.coefficients[1]) + Math.abs(lambda10.coefficients[2]);
    expect(magnitudeAtLambda10).toBeLessThan(magnitudeAtLambda1);
  });

  it('throws when features and target lengths mismatch', () => {
    expect(() => fitRidgeRegression([[1, 2]], [1, 2], 1)).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => fitRidgeRegression([], [], 1)).toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- regression.test.ts`
Expected: FAIL — `fitRidgeRegression` is not exported from `./regression` (TypeScript/import error or `is not a function`).

- [ ] **Step 3: Implement `fitRidgeRegression`**

In `src/lib/regression.ts`, add this function after the existing `fitLinearRegression` function (the private helpers `transpose`, `multiply`, `multiplyVector`, `solveLinearSystem` are already defined above it in the same file and are reused as-is):

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -- regression.test.ts`
Expected: PASS — all tests in the file, including the new `fitRidgeRegression` block.

- [ ] **Step 5: Write the failing test for `applyZScore`**

In `src/lib/scaling.test.ts`, change the import line from:

```ts
import { computeStats, zScoreScale, minMaxScale } from './scaling';
```

to:

```ts
import { computeStats, zScoreScale, minMaxScale, applyZScore } from './scaling';
```

Add this new `describe` block at the end of the file:

```ts
describe('applyZScore', () => {
  it('applies previously-computed stats to a value from the original array, matching zScoreScale', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const stats = computeStats(values); // mean=5, std=2
    expect(applyZScore(9, stats)).toBeCloseTo(2, 10);
  });

  it('applies previously-computed stats to a new value not in the original array', () => {
    const stats = computeStats([2, 4, 4, 4, 5, 5, 7, 9]); // mean=5, std=2
    expect(applyZScore(11, stats)).toBeCloseTo(3, 10);
    expect(applyZScore(1, stats)).toBeCloseTo(-2, 10);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm run test -- scaling.test.ts`
Expected: FAIL — `applyZScore` is not exported from `./scaling`.

- [ ] **Step 7: Implement `applyZScore`**

In `src/lib/scaling.ts`, add this function after `computeStats` (before or after `zScoreScale`, either position is fine — put it directly after `computeStats`):

```ts
export function applyZScore(value: number, stats: ScalingStats): number {
  return (value - stats.mean) / stats.std;
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm run test -- scaling.test.ts`
Expected: PASS — all tests in the file, including the new `applyZScore` block.

- [ ] **Step 9: Run the full test suite to check for regressions**

Run: `npm run test`
Expected: all existing tests still pass, plus the new ones (total test count increases).

- [ ] **Step 10: Commit**

```bash
git add src/lib/regression.ts src/lib/regression.test.ts src/lib/scaling.ts src/lib/scaling.test.ts
git commit -m "$(cat <<'EOF'
Add fitRidgeRegression and applyZScore

fitRidgeRegression adds L2 regularization to the existing normal-equation
solver, skipping the intercept term in the penalty. applyZScore lets
previously-computed training-set stats be applied to new values (test
set, curve sample points) instead of recomputing stats from scratch,
which would leak information from the new data.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `RidgeRegressionFit.tsx` interactive component

**Files:**
- Create: `src/components/charts/RidgeRegressionFit.tsx`

**Interfaces:**
- Consumes:
  - `TRAIN_SET: DataPoint[]`, `TEST_SET: DataPoint[]` (`DataPoint = { x: number; y: number }`) from `../../lib/polynomialFit` (Task 1 did not touch this file — it already exports these).
  - `fitRidgeRegression(features: number[][], target: number[], lambda: number): RegressionResult`, `predict(coefficients: number[], features: number[]): number`, `rmse(actual: number[], predicted: number[]): number` from `../../lib/regression` (Task 1).
  - `computeStats(values: number[]): ScalingStats`, `applyZScore(value: number, stats: ScalingStats): number` from `../../lib/scaling` (Task 1 added `applyZScore`; `computeStats` already existed).
- Produces: default export `RidgeRegressionFit` (a React component with no props), consumed by Task 3's `[slug].astro` edit as `<RidgeRegressionFit client:only="react">`.

This task has no automated test file — this codebase verifies chart components (`PolynomialRegressionFit.tsx`, `OverfittingUnderfittingComparison.tsx`, etc.) via `astro check` + `npm run build` + manual/CDP browser verification, not Vitest, because they're thin Plotly wiring with no independently-meaningful pure logic of their own (the real logic lives in `src/lib/*.ts`, which Task 1 already tested). Follow that same pattern here.

- [ ] **Step 1: Create the component file**

Create `src/components/charts/RidgeRegressionFit.tsx` with this exact content:

```tsx
import { useState } from 'react';
import Plot from 'react-plotly.js';
import { TRAIN_SET, TEST_SET } from '../../lib/polynomialFit';
import { fitRidgeRegression, predict, rmse } from '../../lib/regression';
import { computeStats, applyZScore, type ScalingStats } from '../../lib/scaling';

const DEGREE = 15;
const LAMBDA_OPTIONS = [0, 0.01, 0.1, 1, 10] as const;
type Lambda = (typeof LAMBDA_OPTIONS)[number];

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
}

function computeForLambda(lambda: Lambda): LambdaFit {
  const { coefficients } = fitRidgeRegression(trainStdFeatures, trainY, lambda);
  const trainPredicted = trainStdFeatures.map((f) => predict(coefficients, f));
  const testPredicted = testStdFeatures.map((f) => predict(coefficients, f));
  const curve = CURVE_SAMPLE_X.map((x) => {
    const standardized = standardizeRow(polynomialFeatures(x, DEGREE));
    return { x, y: predict(coefficients, standardized) };
  });

  return {
    lambda,
    curve,
    trainRmse: rmse(trainY, trainPredicted),
    testRmse: rmse(testY, testPredicted),
    coefficients: coefficients.slice(1),
  };
}

const LAMBDA_FITS: Record<Lambda, LambdaFit> = Object.fromEntries(
  LAMBDA_OPTIONS.map((lambda) => [lambda, computeForLambda(lambda)])
) as Record<Lambda, LambdaFit>;

// log 座標無法顯示 0，且不同 λ 之間係數幅度可能相差超過 200 倍，取絕對值後設下限避免 log(0)
const MIN_BAR_VALUE = 0.001;
function safeAbsForLog(value: number): number {
  return Math.max(Math.abs(value), MIN_BAR_VALUE);
}

const maxAbsCoefficient = Math.max(
  ...LAMBDA_OPTIONS.flatMap((lambda) => LAMBDA_FITS[lambda].coefficients.map((c) => Math.abs(c)))
);
const BAR_Y_RANGE: [number, number] = [
  Math.log10(MIN_BAR_VALUE),
  Math.log10(maxAbsCoefficient * 1.2),
];

export default function RidgeRegressionFit() {
  const [lambda, setLambda] = useState<Lambda>(0);
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
              y: fit.coefficients.map(safeAbsForLog),
              marker: { color: '#7c5ee6' },
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
              text: '標準化係數收縮（|βⱼ|，對數座標）',
              font: { color: '#e4e6eb', size: 14 },
            },
            xaxis: { title: '多項式特徵項', ...axisStyle },
            yaxis: { title: '係數絕對值（log）', type: 'log', range: BAR_Y_RANGE, ...axisStyle },
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
      </dl>
    </div>
  );
}
```

- [ ] **Step 2: Verify `ScalingStats` is exported from `scaling.ts`**

Open `src/lib/scaling.ts` and confirm the `ScalingStats` interface has `export` in front of it (it already does — this step is just a sanity check before moving on, since the component above imports it as a type).

- [ ] **Step 3: Type-check**

Run: `npx astro check`
Expected: 0 errors, 0 warnings. If there's a type error on the `LAMBDA_FITS` cast or the `Record<Lambda, LambdaFit>` construction, double check `LAMBDA_OPTIONS` is declared `as const` (it is, above) — that's what makes `Lambda` a union of literal numbers instead of `number`.

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/RidgeRegressionFit.tsx
git commit -m "$(cat <<'EOF'
Add RidgeRegressionFit interactive component

Fixed at polynomial degree 15 (the Overfitting chapter's verified
severe-overfit case), reusing its TRAIN_SET/TEST_SET. Standardizes the
15 polynomial features using training-set stats, then lets the user
flip between 5 whitelisted lambda values to see the fitted curve, a
log-scale coefficient-shrinkage bar chart, and train/test RMSE.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Chapter content + routing/config wiring

**Files:**
- Create: `src/content/chapters/ridge-regression.md`
- Modify: `src/pages/chapters/[slug].astro`
- Modify: `src/config/chapters.ts`
- Modify: `src/config/curriculum.ts`

**Interfaces:**
- Consumes: `RidgeRegressionFit` default export from Task 2 (`src/components/charts/RidgeRegressionFit.tsx`).
- Produces: a live page at `/chapters/ridge-regression`; `chapterOrder` and `curriculum` entries later tasks (Task 4's `curriculum.test.ts` edit) depend on.

- [ ] **Step 1: Create the chapter content file**

Create `src/content/chapters/ridge-regression.md`:

```md
---
title: Ridge 迴歸
stage: 監督式學習－迴歸
category:
  - 監督式學習
  - 迴歸
interactiveComponent: ridge-regression-fit
summary:
  formulas:
    - "J(\\beta) = \\sum_{i=1}^{n}(y_i - \\hat y_i)^2 + \\lambda \\sum_{j=1}^{p}\\beta_j^2"
    - "\\hat{\\beta} = (X^\\top X + \\lambda I')^{-1} X^\\top y"
  keyStats:
    - label: 適用資料型態
      value: 多特徵、疑似過擬合或共線性
    - label: 常用評估指標
      value: R², RMSE
    - label: 訓練方式
      value: 標準化特徵＋L2 正則化常態方程式
  image: ../../assets/chapters/ridge-regression-summary.png
---

## 簡介

Ridge Regression 是在線性回歸的損失函數中加入 L2 正則化項（係數平方和），透過懲罰過大的係數來抑制過擬合、提升模型的泛化能力。核心概念：在「配適訓練資料」與「保持係數合理大小」之間取捨，用一點點偏差換取更低的變異數。

**與 Polynomial Regression 的關係**：多項式回歸在高次項時容易出現係數爆炸、曲線劇烈震盪，Ridge Regression 正是抑制這種爆炸的具體工具——本章的案例分析直接沿用高次多項式特徵，示範加入正則化前後的係數與曲線差異。

**與過擬合/欠擬合的關係**：正則化是「應對過擬合」的其中一種具體手段（該章節已提及「加入正則化」），Ridge 用 λ 這個超參數，把 bias-variance 權衡變成一個可連續調整的旋鈕：λ 越大，偏差越高、變異數越低。

**與特徵工程與標準化的關係**：Ridge 的懲罰項是對係數大小做懲罰，若特徵尺度不同，懲罰力道就會不公平地偏向小尺度特徵的係數——這正是該章節「標準化」的實務意義所在，Ridge 是標準化「為什麼重要」的具體範例。

## 分類方式

- **學習類型**：監督式學習（Supervised Learning）
- **任務類型**：迴歸（Regression）——預測連續數值，而非類別標籤
- **模型類型**：正則化線性模型（Regularized Linear Model）

## 數學原理

Ridge Regression 在普通最小平方法的損失函數上，額外加入係數平方和的懲罰項：

$$
J(\beta) = \sum_{i=1}^{n}(y_i - \hat y_i)^2 + \lambda \sum_{j=1}^{p}\beta_j^2
$$

懲罰項不包含截距 $\beta_0$——只懲罰特徵的權重，不懲罰整體平移。這個損失函數同樣有閉式解：

$$
\hat{\beta} = (X^\top X + \lambda I')^{-1} X^\top y
$$

其中 $I'$ 是截距項所在列/行為 0 的單位矩陣變體，確保 $\lambda$ 不會壓縮截距。當 $\lambda=0$ 時，這個公式退化為既有的普通最小平方法（與 Multiple/Polynomial Regression 使用同一套常態方程式）。

**使用前必須先將特徵標準化**：若特徵尺度不同（例如 $x$ 與 $x^{15}$ 的數值範圍可能相差好幾個數量級），同樣大小的 $\lambda$ 對不同特徵的懲罰力道會不公平——尺度小的特徵，係數會被過度壓縮。本章節互動演示固定使用次數 15 的多項式特徵（重用過擬合/欠擬合章節的合成資料與訓練/測試切分），因為該次數已知會在不加正則化時嚴重過擬合（係數劇烈爆炸），方便直接對照加入 $\lambda$ 前後的差異。

## 運用範例

- **高次多項式係數穩定化**（本章案例）：抑制高次多項式回歸的係數爆炸與曲線劇烈震盪
- **高維度特徵資料**：基因體學、文字特徵等，特徵數可能大於樣本數的情境
- **具多重共線性的資料**：財務或社會科學資料中特徵間高度相關時，穩定係數估計

## 適用情境與限制

**適合使用的情境：**

- 特徵數多、疑似過擬合
- 特徵間有相關性（多重共線性）
- 仍想保留所有特徵、只是要抑制係數過大

**限制與假設：**

- **λ 需要調整**：可用交叉驗證挑選（呼應已上線的「訓練/測試切分與交叉驗證」章節）
- **不做特徵選擇**：係數會被縮小但不會恰好變成 0
- **前提是特徵已標準化**：否則懲罰力道不公平

## 評估指標

- **R²（決定係數）**：模型解釋了目標變數變異量的比例，範圍 0～1，越接近 1 代表模型解釋力越強
- **RMSE（均方根誤差）**：預測值與實際值誤差的平方平均後開根號，train/test 雙集顯示可看出正則化對泛化能力的影響

## 常見誤區

- **忘記標準化就直接套用 Ridge**：懲罰力道被特徵尺度差異扭曲，係數收縮不公平
- **誤以為 λ 越大一定越好**：λ 過大會導致嚴重欠擬合，係數被壓縮到接近 0，模型退化成意義不大的常數預測
- **誤以為正則化能把不重要的特徵徹底排除**：Ridge 只會縮小係數幅度，不會將其變成恰好 0（不做特徵選擇）
```

- [ ] **Step 2: Wire the interactive component into `[slug].astro`**

In `src/pages/chapters/[slug].astro`, add the import alongside the existing chart component imports (after the `PolynomialRegressionFit` import line):

```astro
import PolynomialRegressionFit from '../../components/charts/PolynomialRegressionFit';
import RidgeRegressionFit from '../../components/charts/RidgeRegressionFit';
```

Then add a new conditional render block after the existing `polynomial-regression-fit` block (after its closing `)}` and before the closing `</main>`):

```astro
    {chapter.data.interactiveComponent === 'ridge-regression-fit' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        <RidgeRegressionFit client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">互動圖表載入中……</div>
        </RidgeRegressionFit>
      </section>
    )}
```

- [ ] **Step 3: Extend the chapter chain in `chapters.ts`**

In `src/config/chapters.ts`, add `nextSlug: 'ridge-regression'` to the existing `polynomial-regression` entry (it currently has no `nextSlug` since it was the chain's tail):

```ts
  {
    slug: 'polynomial-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'multiple-linear-regression',
    nextSlug: 'ridge-regression',
  },
  {
    slug: 'ridge-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'polynomial-regression',
  },
];
```

(This replaces the old `polynomial-regression` object — which ended with `prerequisiteSlug: 'multiple-linear-regression',` and no `nextSlug` — and the line `];` right after it, with the two objects shown above followed by `];`.)

- [ ] **Step 4: Wire `curriculum.ts`**

In `src/config/curriculum.ts`, replace:

```ts
      { name: 'Ridge Regression（Ridge 迴歸，正則化）' },
```

with:

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

- [ ] **Step 5: Type-check and build**

Run: `npx astro check`
Expected: 0 errors, 0 warnings.

Run: `npm run build`
Expected: build succeeds, 10 pages produced (9 existing — 8 chapters + `index.astro` — plus the new `ridge-regression` chapter; note Task 4 doesn't add pages, only edits content of existing ones, so 10 is the final count from here on).

- [ ] **Step 6: Commit**

```bash
git add src/content/chapters/ridge-regression.md src/pages/chapters/[slug].astro src/config/chapters.ts src/config/curriculum.ts
git commit -m "$(cat <<'EOF'
Add Ridge Regression chapter page

Nine-block content, wired into the chapter chain after Polynomial
Regression, with its RidgeRegressionFit interactive component mounted
and curriculum.ts relatedTo links to Polynomial Regression,
Overfitting/Underfitting, and Feature Engineering & Standardization.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Cross-chapter relatedTo paragraphs + test/doc updates

**Files:**
- Modify: `src/content/chapters/polynomial-regression.md`
- Modify: `src/content/chapters/overfitting-underfitting-bias-variance.md`
- Modify: `src/content/chapters/feature-engineering-standardization.md`
- Modify: `src/config/curriculum.test.ts`
- Modify: `docs/specs/chapter_template_guide.md`

**Interfaces:** None — this task only edits Markdown prose, a test assertion list, and a doc table. No functions or types are produced or consumed.

- [ ] **Step 1: Add the relation paragraph to Polynomial Regression's 簡介**

In `src/content/chapters/polynomial-regression.md`, after the existing line:

```md
**與過擬合/欠擬合章節的關係**：次數 $d$ 的選擇就是 bias-variance 權衡的具體案例——次數太低欠擬合（配不出曲線的彎曲程度）、次數太高過擬合（曲線在資料點間劇烈擺動、無法類推到新資料）。
```

add a new paragraph immediately after it (still inside the `## 簡介` section, before `## 分類方式`):

```md

**與 Ridge Regression 的關係**：多項式次數越高，越容易出現係數爆炸、曲線劇烈震盪——Ridge Regression 就是抑制這種爆炸的正則化工具，透過懲罰過大的係數，在配適能力與係數穩定性之間取得平衡。
```

- [ ] **Step 2: Add the relation paragraph to Overfitting/Underfitting's 簡介**

In `src/content/chapters/overfitting-underfitting-bias-variance.md`, after the existing line:

```md
**與 Polynomial Regression 的關係**：多項式次數的選擇是 bias-variance 權衡最直觀的具體案例——次數太低欠擬合（配不出資料的彎曲程度），次數太高過擬合（曲線在資料點間劇烈擺動、無法類推到新資料）。
```

add a new paragraph immediately after it (still before `## 診斷與應對`):

```md

**與 Ridge Regression 的關係**：本章節提到的「加入正則化」正是 Ridge Regression 的核心手段——用 λ 這個超參數把 bias-variance 權衡變成一個可連續調整的旋鈕，λ 越大偏差越高、變異數越低。
```

- [ ] **Step 3: Add the relation paragraph to Feature Engineering & Standardization's 簡介**

In `src/content/chapters/feature-engineering-standardization.md`, after the existing single 簡介 paragraph (the one ending in `…標準化/縮放**，以及類別特徵的**編碼**。`), add a new paragraph immediately after it (still before `## 常見方法`):

```md

**與 Ridge Regression 的關係**：Ridge 的正則化懲罰項是對係數大小做懲罰，若特徵尺度不同，懲罰力道會不公平地偏向小尺度特徵的係數——這正是標準化的實務意義所在，Ridge 是「為什麼要先標準化」的具體範例。
```

- [ ] **Step 4: Update `curriculum.test.ts`'s built-chapter assertion**

In `src/config/curriculum.test.ts`, the test `'marks exactly the eight currently-built chapters as having a slug'` currently expects an 8-item array ending in `'Polynomial Regression（多項式回歸）'`. Update the test name to `'nine'` and insert the new chapter name right after Polynomial Regression:

```ts
  it('marks exactly the nine currently-built chapters as having a slug', () => {
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
    ]);
  });
```

- [ ] **Step 5: Run the full test suite**

Run: `npm run test`
Expected: all tests pass, including the updated `curriculum.test.ts` assertion (the `every relatedTo reference points to an existing topic name` test should also still pass, since all three of Ridge's `relatedTo` targets — added in Task 3 — already exist as topic names in `curriculum.ts`).

- [ ] **Step 6: Update the cross-chapter relation table in `chapter_template_guide.md`**

In `docs/specs/chapter_template_guide.md`, the 1.1 section's table currently has 6 rows. Add 3 new rows after the existing `Polynomial Regression | 過擬合/欠擬合與偏差-變異數權衡` row:

```md
   | Ridge Regression | Polynomial Regression | 抑制多項式高次項係數爆炸的正則化工具 | 兩側已補 |
   | Ridge Regression | 過擬合/欠擬合與偏差-變異數權衡 | λ 是可連續調整的 bias-variance 旋鈕 | 兩側已補 |
   | Ridge Regression | 特徵工程與標準化 | 正則化前必須先標準化，否則懲罰力道不公平 | 兩側已補 |
```

Also update the introductory sentence above the table (currently says `目前 6 組核心關聯對照表`) to say `目前 9 組核心關聯對照表`.

- [ ] **Step 7: Verify build and full checks**

Run: `npx astro check`
Expected: 0 errors, 0 warnings.

Run: `npm run build`
Expected: 10 pages produced successfully.

Run: `npm run test`
Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/content/chapters/polynomial-regression.md src/content/chapters/overfitting-underfitting-bias-variance.md src/content/chapters/feature-engineering-standardization.md src/config/curriculum.test.ts docs/specs/chapter_template_guide.md
git commit -m "$(cat <<'EOF'
Wire Ridge Regression's three relatedTo paragraphs into existing chapters

Adds the "與 Ridge Regression 的關係" paragraph to Polynomial Regression,
Overfitting/Underfitting, and Feature Engineering & Standardization
(all already shipped), and updates curriculum.test.ts and the
chapter_template_guide.md relation table to match.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Excalidraw-style summary infographic

**Files:**
- Create: `docs/specs/assets-src/ridge-regression-summary.html`
- Create: `scripts/render-ridge-regression-infographic.ps1`
- Create (rendered output, via Step 3 below): `src/assets/chapters/ridge-regression-summary.png`

**Interfaces:** None — this is a standalone static HTML asset rendered to PNG by a headless-Edge screenshot script, matching the existing pattern used by every other chapter's infographic (`docs/specs/assets-src/polynomial-regression-summary.html` is the reference). It is consumed only via the `image:` path already set in Task 3's `ridge-regression.md` frontmatter (`../../assets/chapters/ridge-regression-summary.png`), which `ChapterSummaryCard.astro` reads generically — no code changes needed there.

- [ ] **Step 1: Create the infographic HTML source**

Create `docs/specs/assets-src/ridge-regression-summary.html`. Copy `docs/specs/assets-src/polynomial-regression-summary.html` verbatim as the starting point (same `<style>` block, same rough.js wiring script at the bottom, same `palette` object in the script — none of that needs to change), then replace only the `<head><title>`, the `<body>` content between `<div class="page" id="page">` and the closing `</div>` before `<script src="rough-engine.js">`, exactly as follows:

`<title>`:
```html
  <title>Ridge Regression 資訊圖表（Excalidraw 風格）</title>
```

Header block:
```html
  <header class="title-block">
    <canvas class="doodle" id="doodle"></canvas>
    <h1 class="main-title">Ridge 迴歸</h1>
    <div class="subtitle">Ridge Regression · 監督式學習－迴歸</div>
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
        Ridge Regression 在線性回歸的損失函數中加入 L2 正則化項（係數平方和），透過懲罰過大的係數來抑制過擬合、提升泛化能力。核心概念：用一點點偏差換取更低的變異數。
        <div class="tag-row">
          <span class="tag" data-sketch="tag1"><canvas class="sketch-bg"></canvas><span>監督式學習</span></span>
          <span class="tag" data-sketch="tag2"><canvas class="sketch-bg"></canvas><span>迴歸任務</span></span>
          <span class="tag" data-sketch="tag3"><canvas class="sketch-bg"></canvas><span>L2 正則化</span></span>
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
          <div class="eq">J(β) &nbsp;=&nbsp; Σ(yᵢ − ŷᵢ)² + λΣβⱼ²</div>
          <div class="eq">β̂ &nbsp;=&nbsp; (Xᵀ X + λI′)⁻¹ Xᵀ y</div>
        </div>
        懲罰項不包含截距 β₀；λ=0 時退化為普通最小平方法（OLS）。使用前必須先將特徵標準化，否則不同尺度的係數受懲罰程度不一致。
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
            <li>特徵數多、疑似過擬合</li>
            <li>特徵間有相關性（多重共線性）</li>
            <li>仍想保留所有特徵，只是要抑制係數過大</li>
          </ul>
        </div>
        <div>
          <h3 class="bad">⚠ 假設與限制</h3>
          <ul>
            <li>λ 需要調整，可用交叉驗證挑選</li>
            <li>係數會縮小但不會恰好變成 0，無法做特徵選擇</li>
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
            <h4>R²（決定係數）</h4>
            <div class="eq" style="font-size:15px">
              R² &nbsp;=&nbsp; 1 −
              <span class="frac">
                <span class="num-row">Σ(yᵢ − ŷᵢ)²</span>
                <span class="den-row">Σ(yᵢ − ȳ)²</span>
              </span>
            </div>
            <p>範圍 0～1，越接近 1 代表模型解釋力越強。</p>
          </div>
        </div>
        <div class="metric-box" data-sketch="m2">
          <canvas class="sketch-bg"></canvas>
          <div class="card-inner">
            <h4>RMSE（均方根誤差）</h4>
            <div class="eq" style="font-size:15px">RMSE &nbsp;=&nbsp; √( mean( (yᵢ−ŷᵢ)² ) )</div>
            <p>train/test 雙集顯示，可看出正則化對泛化能力的影響。</p>
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
          <li><b>忘記標準化就直接套用 Ridge</b>——懲罰力道被特徵尺度差異扭曲，係數收縮不公平。</li>
          <li><b>誤以為 λ 越大一定越好</b>——λ 過大會嚴重欠擬合，係數被壓縮到接近 0。</li>
          <li><b>誤以為正則化能把不重要特徵徹底排除</b>——Ridge 只縮小係數，不會將其歸零。</li>
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
      <h2>案例分析：Polynomial Coefficient Shrinkage（多項式係數收縮，次數 15）</h2>
      <div class="board-sub">重用過擬合/欠擬合章節的合成資料，固定多項式次數 15，比較 λ=0（無正則化）與 λ=0.01 的差異</div>

      <div class="metabar">
        <div class="meta-item"><div class="label">資料集</div><div class="value">合成 sin 曲線資料</div></div>
        <div class="meta-item"><div class="label">訓練/測試</div><div class="value">35 / 15 筆</div></div>
        <div class="meta-item"><div class="label">特徵</div><div class="value">x¹ ~ x¹⁵</div></div>
        <div class="meta-item"><div class="label">次數</div><div class="value">15</div></div>
        <div class="meta-item"><div class="label">求解方式</div><div class="value">標準化＋L2 正則化常態方程式</div></div>
      </div>

      <div class="board-grid">
        <div>
          <table class="coef-table">
            <thead>
              <tr><th>指標</th><th>λ=0</th><th>λ=0.01</th></tr>
            </thead>
            <tbody>
              <tr><td>最大係數絕對值</td><td>1450.078</td><td>5.7643</td></tr>
              <tr><td>Train RMSE</td><td>0.1865</td><td>0.2062</td></tr>
              <tr><td>Test RMSE</td><td>0.8024</td><td>0.3204</td></tr>
              <tr><td>Test R²</td><td>0.8118</td><td>0.9700</td></tr>
            </tbody>
          </table>
          <div class="big-stats">
            <div class="big-stat"><div class="label">係數收縮倍數</div><div class="value">≈252 倍</div></div>
            <div class="big-stat"><div class="label">Test RMSE 改善</div><div class="value">≈60%</div></div>
          </div>
        </div>
        <ul class="insight-list">
          <li>λ=0（無正則化）時，次數 15 的係數最大絕對值高達 <span class="hl">1450</span>，是典型的係數爆炸案例。</li>
          <li>加入 λ=0.01 後，係數最大絕對值降到 <span class="hl">5.76</span>（收縮約 252 倍），test RMSE 從 0.8024 降到 <span class="hl">0.3204</span>（改善約 60%）。</li>
          <li>λ 白名單（0, 0.01, 0.1, 1, 10）掃過後，λ=0.01 是本資料集的最佳點；λ 再往上（如 10）test RMSE 反而回升至 1.3658，代表過度正則化導致欠擬合。</li>
          <li>本案例沿用過擬合/欠擬合章節的訓練/測試切分，呼應該章節「加入正則化」作為應對過擬合手段的說法。</li>
        </ul>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Create the render script**

Create `scripts/render-ridge-regression-infographic.ps1`, copying the exact structure of `scripts/render-polynomial-regression-infographic.ps1` (which already uses the `$repoRoot = Split-Path -Parent $PSScriptRoot` dynamic path pattern fixed in phase 21 — do not hardcode an absolute checkout path):

```powershell
# Render Ridge Regression Infographic HTML to PNG
$repoRoot = Split-Path -Parent $PSScriptRoot
$htmlPath = Join-Path $repoRoot "docs/specs/assets-src/ridge-regression-summary.html"
$outputPath = Join-Path $repoRoot "src/assets/chapters/ridge-regression-summary.png"

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

Run: `powershell -File scripts/render-ridge-regression-infographic.ps1`
Expected: `src/assets/chapters/ridge-regression-summary.png` is created. If the Edge headless screenshot races ahead of the rough.js canvas paint (a known, previously-documented issue — see `docs/superpowers/specs/2026-08-03-ridge-regression-chapter-design.md`'s referenced handover notes) and produces a blank/broken image, just re-run the same command; do not add delays or modify the script without checking with the developer first.

- [ ] **Step 4: Personally view the rendered PNG**

Use the Read tool to open `src/assets/chapters/ridge-regression-summary.png` and visually inspect it. This step cannot be delegated to a reviewer subagent — this codebase has a documented incident (phase 20) where a subagent-reviewed infographic passed review with a LaTeX-syntax rendering bug that only surfaced when a human/the primary agent actually looked at the image, because sub-review agents cannot view binary image files. Check specifically:
- All 6 cards render (no blank cards, no missing rough.js sketch borders).
- No literal `$...$`, `\ldots`, `\beta` or other LaTeX source text is visible anywhere (this HTML has no KaTeX engine — all math must already be plain Unicode, which the card content above already uses, but double-check nothing slipped through).
- The title-underline decoration under "Ridge 迴歸" doesn't overlap or clip against the doodle icon (compare visually against `multiple-linear-regression-summary.png` or `polynomial-regression-summary.png`'s title-block spacing since "Ridge 迴歸" is a similarly short title).
- The board (case-study) section's table and big-stats numbers match Task 5 Step 1's content exactly (1450.078 / 5.7643 / 0.1865 / 0.2062 / 0.8024 / 0.3204 / 0.8118 / 0.9700).

If anything is wrong, fix the HTML and re-render (Step 3) before proceeding — do not commit a broken image.

- [ ] **Step 5: Verify the chapter page displays the image**

Run: `npm run build`, then `npm run preview` (background), then either fetch the built HTML or use headless Edge to confirm `/chapters/ridge-regression` renders the `ChapterSummaryCard` image without a broken-image icon. Stop the preview server afterward (find its PID via `netstat -ano` on the preview port, then `taskkill //PID <pid> //F`) — do not leave it running.

- [ ] **Step 6: Commit**

```bash
git add docs/specs/assets-src/ridge-regression-summary.html scripts/render-ridge-regression-infographic.ps1 src/assets/chapters/ridge-regression-summary.png
git commit -m "$(cat <<'EOF'
Add Ridge Regression summary infographic

Excalidraw-style, six-card layout matching the existing algorithm-chapter
template. Case study contrasts lambda=0 (severe coefficient explosion,
max|beta|=1450, test RMSE=0.8024) against lambda=0.01 (max|beta|=5.76,
test RMSE=0.3204) at polynomial degree 15.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Final Verification (after all 5 tasks)

- [ ] `npx astro check` — 0 errors, 0 warnings
- [ ] `npm run build` — 10 pages produced
- [ ] `npm run test` — all tests pass
- [ ] Browser/CDP verification: λ whitelist buttons update the curve, the log-scale coefficient bar chart, and train/test RMSE correctly. Specifically click λ=0 and λ=0.01 and confirm the displayed train/test RMSE match Task 2's reference table (λ=0: train 0.1865 / test 0.8024; λ=0.01: train 0.2062 / test 0.3204) — if the on-page numbers don't match, that's a real bug (likely a standardization or intercept-penalty mistake), stop and investigate rather than adjusting the reference numbers. Also confirm `chapterOrder` via `curl` on the built HTML (not a screenshot — the top nav track can clip visually) showing `multiple-linear-regression → polynomial-regression → ridge-regression` with correct `aria-current`; the three relatedTo paragraphs render correctly on their respective existing pages with no regression to those pages' existing content.
- [ ] Close any dev/preview server started during this work (per project convention — check `netstat` on 4321/9333, `taskkill` if anything is still listening).
