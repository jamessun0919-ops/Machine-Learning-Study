# Logistic Regression（邏輯斯迴歸）章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Logistic Regression（邏輯斯迴歸）" chapter — a new page reachable at `/chapters/logistic-regression`, wired into the chapter chain right after Lasso Regression, using the nine-block algorithm template. This is the site's **first classification chapter** (every prior chapter — Simple/Multiple/Polynomial/Ridge/Lasso Linear Regression — was a regression task).

**Architecture:** A new synthetic-but-realistic dataset (`loanDefault.ts`, 200 loan-default records generated deterministically at module load, not from a JSON file or a separate script) feeds a new pure-function solver (`fitLogisticRegression` in a new `classification.ts` file, batch gradient descent on Cross-Entropy Loss — logistic regression has no closed form, unlike the existing regression solvers' matrix algebra), which in turn feeds a new client-only React island (`LogisticRegressionFit.tsx`) that renders a static (no buttons/sliders) 2D decision-boundary scatter plot plus train/test Accuracy and test-set Precision/Recall/F1/confusion-matrix. The chapter's Markdown content and its Excalidraw-style summary infographic (case study: the loan-default Accuracy-vs-Recall paradox) complete the page.

**Tech Stack:** Astro (Content Layer API) + React island (`client:only="react"`) + TypeScript + Plotly.js (`react-plotly.js`) + Vitest.

## Global Constraints

- Never use root-absolute paths (`/css/...`) for internal links/assets — always prefix with `import.meta.env.BASE_URL` (site is served from `/Machine-Learning-Study/`). Not touched by this plan (no new raw links).
- React components that use Plotly must be mounted with `client:only="react"` in `.astro` files, and referenced via literal JSX (no dynamic component lookup tables).
- Chapter interactive components are "pre-designed demos", not free-form tools. This chapter's component has **no controls at all** (not even whitelisted buttons) — it's a single static fit, per an explicit developer decision during design (see design doc).
- All chat with the developer is in Traditional Chinese; this plan and its code comments (where unavoidable) are in the project's existing mixed English/Chinese style — match whichever file you're editing.
- Design doc for this chapter: `docs/superpowers/specs/2026-08-04-logistic-regression-chapter-design.md` — read it if you need the full rationale; this plan already extracts everything you need to implement. **One deviation from that doc, decided during plan-writing and confirmed with the developer:** the design doc describes a separate `loan-default.json` file plus a one-off Node generation script. While writing this plan, `src/lib/polynomialFit.ts` (the closest existing precedent for a *synthetic*, non-real dataset — as opposed to `50-startups.json`, which is real data) turned out to generate its dataset inline in TypeScript at module load, using a deterministic hash-based function instead of `Math.random()`, with no JSON file and no separate script. This plan follows that closer, simpler precedent instead: `src/lib/loanDefault.ts` generates its 200 rows inline using a seeded LCG + Box-Muller transform. The generation algorithm, constants, and resulting numbers are unchanged from the design doc — only *where the generation code lives* changed.
- **All numeric values below (default rate, fitted coefficients, accuracy/precision/recall/F1) were computed by a verification script during design that replicates the exact production logic** (same LCG seed, same Box-Muller order of calls, same affine train/test permutation, same standardization, same batch-gradient-descent solver). Task 1 and Task 2's tests will catch any implementation drift from the small hand-verifiable cases; Task 3's reference numbers let you sanity-check the full pipeline. If your implementation produces different numbers, that's a real bug — stop and re-check your code against this plan (especially RNG call order — see Task 1) rather than adjusting the expected numbers.
- **Why the dataset isn't Iris, breast cancer, or any other classic public dataset**: verified during design that several classic pairings (e.g. Iris setosa-vs-versicolor) are near-perfectly linearly separable on a single feature, which makes the Cross-Entropy Loss unbounded below — gradient descent's coefficients diverge forever and `converged` never becomes `true`. This is the same class of problem the Lasso Regression chapter hit with `λ=0` (see that chapter's design doc). The loan-default dataset was deliberately generated with class overlap (noisy Bernoulli sampling around a true probability, not a hard rule) specifically to avoid this.
- **Why the default rate is imbalanced (20–30%, not 50/50)**: an explicit developer decision so the "評估指標" (evaluation metrics) section's Accuracy-can-be-misleading point has a concrete, real number to point at instead of being purely abstract. Do not "fix" the class balance to make the dataset look tidier — the imbalance is the point.
- **Why there's no threshold slider, feature-preset switcher, or any other control on the interactive component**: an explicit developer decision (YAGNI scope call during design) — the component is a single static demonstration of the decision boundary, unlike Ridge/Lasso's λ-whitelist buttons or Multiple Linear Regression's feature-preset dropdown. Do not add one "for consistency" with those chapters.
- `multiple-linear-regression.md` already has a **complete, correctly-worded** "與 Logistic Regression 的關係" paragraph (added when that chapter shipped, anticipating this one) — checked during plan-writing and confirmed it needs no edit. This chapter only needs to add the *other side* of that relation (in its own 簡介 section, done in Task 4). Unlike the Lasso Regression plan (which had a whole task dedicated to editing the already-shipped Ridge chapter), **this plan has no task that touches `multiple-linear-regression.md`** — do not add one.

---

### Task 1: Synthetic loan-default dataset

**Files:**
- Create: `src/lib/loanDefault.ts`
- Create: `src/lib/loanDefault.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `interface LoanRecord { debtToIncomeRatio: number; creditScore: number; isDefault: 0 | 1 }`
  - `loans: LoanRecord[]` (200 items)
  - `fieldLabels: Record<'debtToIncomeRatio' | 'creditScore', string>`
  - `SHUFFLED_INDICES: number[]` (200 items, a permutation of 0–199)
  - `trainIndices: number[]` (150 items), `testIndices: number[]` (50 items)
  - Task 3 imports `loans`, `fieldLabels`, `trainIndices`, `testIndices` from this file.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/loanDefault.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { loans, SHUFFLED_INDICES, trainIndices, testIndices } from './loanDefault';

describe('loans', () => {
  it('produces 200 records with correct field types and plausible ranges', () => {
    expect(loans).toHaveLength(200);
    loans.forEach((record) => {
      expect(typeof record.debtToIncomeRatio).toBe('number');
      expect(record.debtToIncomeRatio).toBeGreaterThanOrEqual(0.05);
      expect(record.debtToIncomeRatio).toBeLessThanOrEqual(0.85);
      expect(typeof record.creditScore).toBe('number');
      expect(record.creditScore).toBeGreaterThanOrEqual(350);
      expect(record.creditScore).toBeLessThanOrEqual(850);
      expect([0, 1]).toContain(record.isDefault);
    });
  });

  it('has an overall default rate between 20% and 30%', () => {
    const defaultRate = loans.filter((r) => r.isDefault === 1).length / loans.length;
    expect(defaultRate).toBeGreaterThanOrEqual(0.2);
    expect(defaultRate).toBeLessThanOrEqual(0.3);
  });
});

describe('SHUFFLED_INDICES', () => {
  it('is a permutation of 0-199 (200 unique indices, no gaps)', () => {
    expect(SHUFFLED_INDICES).toHaveLength(200);
    const sorted = [...SHUFFLED_INDICES].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 200 }, (_, i) => i));
  });
});

describe('trainIndices / testIndices', () => {
  it('splits into 150 train and 50 test indices covering every index exactly once', () => {
    expect(trainIndices).toHaveLength(150);
    expect(testIndices).toHaveLength(50);
    const combined = [...trainIndices, ...testIndices].sort((a, b) => a - b);
    expect(combined).toEqual(Array.from({ length: 200 }, (_, i) => i));
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- loanDefault.test.ts`
Expected: FAIL — cannot find module `./loanDefault` (it doesn't exist yet).

- [ ] **Step 3: Implement `loanDefault.ts`**

Create `src/lib/loanDefault.ts` with this exact content. **The RNG call order matters** — it must match exactly (feature generation loop first, in `i=0..199` order calling `gaussian(dti-params)` then `gaussian(credit-params)` per row, then a *second* full loop calling `rng()` once per row for the label) or the resulting dataset will differ from every validated number in this plan and the design doc:

```ts
export interface LoanRecord {
  debtToIncomeRatio: number;
  creditScore: number;
  isDefault: 0 | 1;
}

const N = 200;

// 決定性線性同餘生成器（LCG，非 Math.random()），確保合成資料集在每次建置都完全一致可重現。
function makeLcg(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// Box-Muller transform：把兩個均勻分布亂數轉成一個常態分布亂數，並快取另一個副產品值供下次呼叫使用。
function makeGaussian(rng: () => number): (mean: number, std: number) => number {
  let spare: number | null = null;
  return function next(mean: number, std: number): number {
    if (spare !== null) {
      const value = spare;
      spare = null;
      return mean + std * value;
    }
    let u1 = 0;
    do {
      u1 = rng();
    } while (u1 <= 1e-12);
    const u2 = rng();
    const mag = Math.sqrt(-2 * Math.log(u1));
    spare = mag * Math.sin(2 * Math.PI * u2);
    return mean + std * mag * Math.cos(2 * Math.PI * u2);
  };
}

function clip(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

const rng = makeLcg(42);
const gaussian = makeGaussian(rng);

const rawDti: number[] = [];
const rawCreditScore: number[] = [];
for (let i = 0; i < N; i++) {
  rawDti.push(clip(gaussian(0.38, 0.16), 0.05, 0.85));
  rawCreditScore.push(clip(gaussian(620, 85), 350, 850));
}

// 真實的底層生成關係（只用於產生標籤，不是模型要學習還原的「正確答案」，且不對外匯出）：
// 負債比越高、信用分數越低，違約對數勝算越高。TRUE_INTERCEPT 是用二分搜尋校準到母體
// 平均違約機率 25% 所得到的值（設計階段驗證腳本算出，此處直接沿用結果，不在此重新搜尋）。
const TRUE_INTERCEPT = 7.4149621442728595;
const TRUE_DTI_WEIGHT = 11.0;
const TRUE_CREDIT_WEIGHT = -0.022;

export const loans: LoanRecord[] = Array.from({ length: N }, (_, i) => {
  const z = TRUE_INTERCEPT + TRUE_DTI_WEIGHT * rawDti[i] + TRUE_CREDIT_WEIGHT * rawCreditScore[i];
  const probability = sigmoid(z);
  const isDefault: 0 | 1 = rng() < probability ? 1 : 0;
  return { debtToIncomeRatio: rawDti[i], creditScore: rawCreditScore[i], isDefault };
});

export const fieldLabels: Record<'debtToIncomeRatio' | 'creditScore', string> = {
  debtToIncomeRatio: '負債佔收入比（Debt-to-Income Ratio）',
  creditScore: '信用分數（Credit Score）',
};

// 固定仿射排列 i -> (i*97+13) mod 200（gcd(97,200)=1，為合法排列）。與 dataSplit.ts 既有
// 的 50 筆版本（不同公式、不同長度）各自獨立，不修改、也不依賴那個檔案。
export const SHUFFLED_INDICES: number[] = Array.from({ length: N }, (_, i) => (i * 97 + 13) % N);

const TRAIN_COUNT = 150;
export const trainIndices: number[] = SHUFFLED_INDICES.slice(0, TRAIN_COUNT);
export const testIndices: number[] = SHUFFLED_INDICES.slice(TRAIN_COUNT);
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -- loanDefault.test.ts`
Expected: PASS — all 4 tests. If the default-rate test fails, do not adjust the 20–30% bounds — stop and check the RNG call order against Step 3's note instead (this is a very likely place to introduce a subtle bug that still "runs" but produces different numbers).

- [ ] **Step 5: Run the full test suite to check for regressions**

Run: `npm run test`
Expected: all existing 61 tests still pass, plus the 4 new ones (65 total).

- [ ] **Step 6: Commit**

```bash
git add src/lib/loanDefault.ts src/lib/loanDefault.test.ts
git commit -m "$(cat <<'EOF'
Add synthetic loan-default dataset

200 records generated deterministically at module load (seeded LCG +
Box-Muller), not from a JSON file — following polynomialFit.ts's
existing pattern for synthetic (as opposed to real, like 50-startups.json)
datasets. Deliberately imbalanced (~25% default rate) and deliberately
not perfectly separable, both by design (see chapter design doc).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Logistic regression solver and classification metrics

**Files:**
- Create: `src/lib/classification.ts`
- Create: `src/lib/classification.test.ts`

**Interfaces:**
- Consumes: nothing new — pure functions, no imports from other project files.
- Produces:
  - `sigmoid(z: number): number`
  - `interface LogisticRegressionResult { coefficients: number[]; converged: boolean }`
  - `fitLogisticRegression(features: number[][], target: number[], learningRate?: number, maxIter?: number, tol?: number): LogisticRegressionResult`
  - `interface ConfusionMatrix { tp: number; fp: number; fn: number; tn: number }`
  - `confusionMatrix(actual: number[], predicted: number[]): ConfusionMatrix`
  - `accuracy(cm: ConfusionMatrix): number`, `precision(cm: ConfusionMatrix): number`, `recall(cm: ConfusionMatrix): number`, `f1Score(cm: ConfusionMatrix): number`
  - Task 3 imports all of the above, plus `predict` from `./regression` (already exists, unchanged).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/classification.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  sigmoid,
  fitLogisticRegression,
  confusionMatrix,
  accuracy,
  precision,
  recall,
  f1Score,
} from './classification';

describe('sigmoid', () => {
  it('returns exactly 0.5 at z=0', () => {
    expect(sigmoid(0)).toBe(0.5);
  });

  it('approaches 1 for large positive z', () => {
    expect(sigmoid(20)).toBeCloseTo(1, 6);
  });

  it('approaches 0 for large negative z', () => {
    expect(sigmoid(-20)).toBeCloseTo(0, 6);
  });
});

describe('fitLogisticRegression', () => {
  it('converges to a positive coefficient when higher x trends toward class 1, even with some class overlap', () => {
    // x=-1 and x=1 each appear twice with opposite labels, so the data is not
    // perfectly separable — the loss has an interior minimum and gradient
    // descent should settle rather than diverge.
    const features = [[-3], [-2], [-1], [-1], [-0.5], [0.5], [1], [1], [2], [3]];
    const target = [0, 0, 0, 1, 0, 1, 1, 0, 1, 1];

    const result = fitLogisticRegression(features, target, 0.5, 5000, 1e-6);

    expect(result.converged).toBe(true);
    expect(result.coefficients[1]).toBeGreaterThan(0.5);
  });

  it('does not converge within a too-small iteration budget on perfectly separable data', () => {
    // x<0 is always class 0 and x>0 is always class 1 — a clean gap with no
    // overlap, so the true MLE coefficients are unbounded (this is the same
    // pathology that ruled out Iris setosa-vs-versicolor for this chapter's
    // dataset — see the chapter design doc). With a deliberately small
    // maxIter, the descent should still be climbing, not settled.
    const features = [[-3], [-2], [-1], [1], [2], [3]];
    const target = [0, 0, 0, 1, 1, 1];

    const result = fitLogisticRegression(features, target, 0.5, 50, 1e-6);

    expect(result.converged).toBe(false);
  });

  it('throws when features and target lengths mismatch', () => {
    expect(() => fitLogisticRegression([[1, 2]], [1, 2])).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => fitLogisticRegression([], [])).toThrow();
  });
});

describe('confusionMatrix and metrics', () => {
  // Hand-verified: actual [1,1,1,0,0,0,1,0] vs predicted [1,0,1,0,1,0,1,1]
  // -> TP=3 (indices 0,2,6), FN=1 (index 1), TN=2 (indices 3,5), FP=2 (indices 4,7).
  const actual = [1, 1, 1, 0, 0, 0, 1, 0];
  const predicted = [1, 0, 1, 0, 1, 0, 1, 1];
  const cm = confusionMatrix(actual, predicted);

  it('computes the confusion matrix correctly', () => {
    expect(cm).toEqual({ tp: 3, fp: 2, fn: 1, tn: 2 });
  });

  it('computes accuracy, precision, recall, and F1 correctly from the confusion matrix', () => {
    expect(accuracy(cm)).toBeCloseTo(0.625, 8);
    expect(precision(cm)).toBeCloseTo(0.6, 8);
    expect(recall(cm)).toBeCloseTo(0.75, 8);
    expect(f1Score(cm)).toBeCloseTo(0.6666666667, 8);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- classification.test.ts`
Expected: FAIL — cannot find module `./classification` (it doesn't exist yet).

- [ ] **Step 3: Implement `classification.ts`**

Create `src/lib/classification.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -- classification.test.ts`
Expected: PASS — all 9 tests.

- [ ] **Step 5: Run the full test suite to check for regressions**

Run: `npm run test`
Expected: 74 total tests passing (65 from after Task 1, plus 9 new).

- [ ] **Step 6: Commit**

```bash
git add src/lib/classification.ts src/lib/classification.test.ts
git commit -m "$(cat <<'EOF'
Add fitLogisticRegression and classification metrics

Batch gradient descent on Cross-Entropy Loss (no closed form, unlike
the existing regression solvers). New file rather than adding to
regression.ts, since classification metrics are a distinct concern
from regression's R²/RMSE — mirrors polynomialFit.ts/positionSalaryData.ts's
existing pattern of single-purpose lib files.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `LogisticRegressionFit.tsx` interactive component

**Files:**
- Create: `src/components/charts/LogisticRegressionFit.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes:
  - `loans: LoanRecord[]`, `fieldLabels`, `trainIndices: number[]`, `testIndices: number[]` from `../../lib/loanDefault` (Task 1).
  - `sigmoid`, `fitLogisticRegression`, `confusionMatrix`, `accuracy`, `precision`, `recall`, `f1Score` from `../../lib/classification` (Task 2).
  - `predict(coefficients: number[], features: number[]): number` from `../../lib/regression` (already exists, unchanged).
  - `computeStats(values: number[]): ScalingStats`, `applyZScore(value: number, stats: ScalingStats): number` from `../../lib/scaling` (already exists, unchanged).
- Produces: default export `LogisticRegressionFit` (a React component with no props), consumed by Task 4's `[slug].astro` edit as `<LogisticRegressionFit client:only="react">`.

This task has no automated test file — this codebase verifies chart components via `astro check` + `npm run build` + manual/CDP browser verification, not Vitest, because they're thin Plotly wiring with no independently-meaningful pure logic of their own (the real logic lives in `src/lib/*.ts`, which Tasks 1–2 already tested). Follow that same pattern here.

- [ ] **Step 1: Add confusion-matrix table styles to `global.css`**

In `src/styles/global.css`, right after the existing `.regression-chart__stats dd { ... }` block (ends around line 663, just before the closing of the "Interactive regression chart" section), add:

```css
.regression-chart__confusion-matrix {
  border-collapse: collapse;
  margin-block: var(--space-md) 0;
  font-size: var(--step--1);
}

.regression-chart__confusion-matrix caption {
  text-align: left;
  margin-block-end: var(--space-xs);
  color: var(--color-text-muted);
}

.regression-chart__confusion-matrix th,
.regression-chart__confusion-matrix td {
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-border);
  text-align: center;
}

.regression-chart__confusion-matrix th {
  color: var(--color-text-muted);
  font-weight: 600;
  background: var(--color-bg-elevated);
}

.regression-chart__confusion-matrix td {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}
```

This reuses the same design tokens (`--color-text`, `--color-text-muted`, `--color-border`, `--color-bg-elevated`, `--space-*`, `--font-mono`) as every other `.regression-chart__*` rule in this file, so contrast is consistent with the rest of the site in both themes without introducing new colors.

- [ ] **Step 2: Create the component file**

Create `src/components/charts/LogisticRegressionFit.tsx` with this exact content:

```tsx
import Plot from 'react-plotly.js';
import { loans, fieldLabels, trainIndices, testIndices } from '../../lib/loanDefault';
import { predict } from '../../lib/regression';
import {
  sigmoid,
  fitLogisticRegression,
  confusionMatrix,
  accuracy,
  precision,
  recall,
  f1Score,
} from '../../lib/classification';
import { computeStats, applyZScore, type ScalingStats } from '../../lib/scaling';

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

function toRawFeatures(indices: number[]): number[][] {
  return indices.map((i) => [loans[i].debtToIncomeRatio, loans[i].creditScore]);
}

const trainRawFeatures = toRawFeatures(trainIndices);
const testRawFeatures = toRawFeatures(testIndices);
const trainTarget = trainIndices.map((i) => loans[i].isDefault);
const testTarget = testIndices.map((i) => loans[i].isDefault);

// 用訓練集算出的 mean/std 套用到訓練/測試/決策邊界端點，避免用測試集自己的統計量造成資訊洩漏
const DTI_STATS: ScalingStats = computeStats(trainRawFeatures.map((row) => row[0]));
const CREDIT_STATS: ScalingStats = computeStats(trainRawFeatures.map((row) => row[1]));

function standardizeRow(row: number[]): number[] {
  return [applyZScore(row[0], DTI_STATS), applyZScore(row[1], CREDIT_STATS)];
}

const trainStdFeatures = trainRawFeatures.map(standardizeRow);
const testStdFeatures = testRawFeatures.map(standardizeRow);

const FIT = fitLogisticRegression(trainStdFeatures, trainTarget);
// FIT.converged 目前未被消費——設計階段已用驗證腳本確認這組資料在預設超參數下
// 必定收斂（約 3576 次疊代內），元件不需要對此做任何反應。若未來資料集或超參數
// 調整，需要重新評估是否要在畫面上顯示這個狀態。

function classify(standardizedFeatures: number[]): 0 | 1 {
  return sigmoid(predict(FIT.coefficients, standardizedFeatures)) >= 0.5 ? 1 : 0;
}

const trainPredicted = trainStdFeatures.map(classify);
const testPredicted = testStdFeatures.map(classify);

const TRAIN_CM = confusionMatrix(trainTarget, trainPredicted);
const TEST_CM = confusionMatrix(testTarget, testPredicted);

const TRAIN_ACCURACY = accuracy(TRAIN_CM);
const TEST_ACCURACY = accuracy(TEST_CM);
const TEST_PRECISION = precision(TEST_CM);
const TEST_RECALL = recall(TEST_CM);
const TEST_F1 = f1Score(TEST_CM);

// 決策邊界線：標準化空間中 z=0 的等式解出 creditScore（依 dti 求解），在資料範圍
// 的兩端各算一個端點再換算回原始座標畫線，比照 Ridge/Lasso「用 min/max x 算兩個
// 端點」的既有手法。
function boundaryCreditScoreAt(rawDti: number): number {
  const standardizedDti = applyZScore(rawDti, DTI_STATS);
  const standardizedCredit =
    -(FIT.coefficients[0] + FIT.coefficients[1] * standardizedDti) / FIT.coefficients[2];
  return standardizedCredit * CREDIT_STATS.std + CREDIT_STATS.mean;
}

const ALL_DTI = loans.map((loan) => loan.debtToIncomeRatio);
const DTI_MIN = Math.min(...ALL_DTI);
const DTI_MAX = Math.max(...ALL_DTI);
const BOUNDARY_LINE = [
  { x: DTI_MIN, y: boundaryCreditScoreAt(DTI_MIN) },
  { x: DTI_MAX, y: boundaryCreditScoreAt(DTI_MAX) },
];

const DEFAULTED = loans.filter((loan) => loan.isDefault === 1);
const NOT_DEFAULTED = loans.filter((loan) => loan.isDefault === 0);

export default function LogisticRegressionFit() {
  return (
    <div className="regression-chart">
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto' }}
      >
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: NOT_DEFAULTED.map((loan) => loan.debtToIncomeRatio),
              y: NOT_DEFAULTED.map((loan) => loan.creditScore),
              marker: { size: 7, color: '#5ee6d0', opacity: 0.8 },
              name: '未違約',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: DEFAULTED.map((loan) => loan.debtToIncomeRatio),
              y: DEFAULTED.map((loan) => loan.creditScore),
              marker: { size: 7, color: '#e6a15e', opacity: 0.9 },
              name: '違約',
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: BOUNDARY_LINE.map((p) => p.x),
              y: BOUNDARY_LINE.map((p) => p.y),
              line: { color: '#7c5ee6', width: 3 },
              name: '決策邊界',
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
            title: { text: '違約分類決策邊界', font: { color: '#e4e6eb', size: 14 } },
            xaxis: { title: fieldLabels.debtToIncomeRatio, ...axisStyle },
            yaxis: { title: fieldLabels.creditScore, ...axisStyle },
            margin: { l: 60, r: 20, t: 40, b: 50 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '480px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>訓練 Accuracy</dt>
          <dd>{TRAIN_ACCURACY.toFixed(4)}</dd>
        </div>
        <div>
          <dt>測試 Accuracy</dt>
          <dd>{TEST_ACCURACY.toFixed(4)}</dd>
        </div>
        <div>
          <dt>測試 Precision</dt>
          <dd>{TEST_PRECISION.toFixed(4)}</dd>
        </div>
        <div>
          <dt>測試 Recall</dt>
          <dd>{TEST_RECALL.toFixed(4)}</dd>
        </div>
        <div>
          <dt>測試 F1-Score</dt>
          <dd>{TEST_F1.toFixed(4)}</dd>
        </div>
      </dl>
      <table className="regression-chart__confusion-matrix">
        <caption>測試集混淆矩陣</caption>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">預測：違約</th>
            <th scope="col">預測：未違約</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">實際：違約</th>
            <td>{TEST_CM.tp}</td>
            <td>{TEST_CM.fn}</td>
          </tr>
          <tr>
            <th scope="row">實際：未違約</th>
            <td>{TEST_CM.fp}</td>
            <td>{TEST_CM.tn}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx astro check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Sanity-check the computed numbers**

This component has no automated test, so before moving on, temporarily add one throwaway line at the bottom of the module scope (above the `export default function`) — `console.log(TRAIN_ACCURACY, TEST_ACCURACY, TEST_PRECISION, TEST_RECALL, TEST_F1, TEST_CM)` — and run `npx astro build` or open the page in dev mode to check the printed numbers against this plan's validated reference: **train accuracy ≈0.8667, test accuracy=0.88, test precision≈0.9091, test recall≈0.6667, test F1≈0.7692, test confusion matrix `{tp:10, fp:1, fn:5, tn:34}`**. If they don't match, stop — this means Task 1's dataset or this component's standardization/split logic diverged from the plan, and that's worth understanding before continuing (do not proceed with different numbers and just update the chapter text to match). Remove the `console.log` line once confirmed.

- [ ] **Step 5: Commit**

```bash
git add src/components/charts/LogisticRegressionFit.tsx src/styles/global.css
git commit -m "$(cat <<'EOF'
Add LogisticRegressionFit interactive component

Static 2D decision-boundary scatter plot (no controls, unlike the
Ridge/Lasso/Multiple-LR charts' whitelisted buttons/preset dropdowns —
an explicit YAGNI scope decision for this chapter) plus train/test
accuracy and test-set precision/recall/F1/confusion matrix. Adds a
small confusion-matrix table style to global.css, reusing existing
design tokens.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Chapter content + routing/config wiring

**Files:**
- Create: `src/content/chapters/logistic-regression.md`
- Modify: `src/pages/chapters/[slug].astro`
- Modify: `src/config/chapters.ts`
- Modify: `src/config/curriculum.ts`
- Modify: `src/config/curriculum.test.ts`
- Modify: `docs/specs/chapter_template_guide.md`

**Interfaces:**
- Consumes: `LogisticRegressionFit` default export from Task 3 (`src/components/charts/LogisticRegressionFit.tsx`).
- Produces: a live page at `/chapters/logistic-regression`.

- [ ] **Step 1: Create the chapter content file**

Create `src/content/chapters/logistic-regression.md`. **Do not include a `summary:` field yet** — the `image:` path inside it would point at a PNG that doesn't exist until Task 5, and Astro's `image()` schema helper validates the referenced file exists at build time, so a premature `summary.image` reference fails `npm run build` with `ImageNotFound`. This matches established precedent for every prior chapter in this codebase (see the Lasso Regression plan's Task 3 Step 1 for the full history). Task 5 of this plan adds `summary:` to this file — see Task 5 Step 0.

```md
---
title: 邏輯斯迴歸
stage: 監督式學習－迴歸
category:
  - 監督式學習
  - 分類
interactiveComponent: logistic-regression-fit
---

## 簡介

Logistic Regression（邏輯斯迴歸）是一種分類演算法：用線性組合 $\beta_0+\beta_1x_1+\cdots+\beta_px_p$ 搭配 Sigmoid 函數，把預測值壓縮到 0~1 之間的機率，再以門檻切出類別。核心問題：當目標變數是類別（例如「是否違約」）而非連續數值時，線性回歸的輸出無界（可能小於 0 或大於 1），無法直接當機率解讀——這正是 Logistic Regression 要解決的問題。

**與 Multiple Linear Regression 的關係**：當預測目標從連續數值變成類別，同樣的線性組合 $\beta_0+\beta_1x_1+\cdots+\beta_nx_n$ 搭配 Sigmoid 函數轉換成機率，就成為 Logistic Regression，是本課程從迴歸過渡到分類的第一步——**這也是本站第一個分類任務章節**。

## 分類方式

- **學習類型**：監督式學習（Supervised Learning）
- **任務類型**：分類（Classification）——預測類別標籤，而非連續數值
- **模型類型**：廣義線性模型（Generalized Linear Model）

## 數學原理

$$
\sigma(z) = \frac{1}{1+e^{-z}}, \quad z = \beta_0+\beta_1x_1+\cdots+\beta_px_p
$$

Sigmoid 函數把線性組合 $z$（值域 $(-\infty,\infty)$）壓縮到 $(0,1)$，可解讀為「屬於正類別的機率」$\hat p = \sigma(z)$。

損失函數改用 Cross-Entropy Loss（而非線性回歸的平方誤差）：

$$
J(\beta) = -\frac{1}{n}\sum_{i=1}^n\left[y_i\log\hat p_i + (1-y_i)\log(1-\hat p_i)\right]
$$

這個損失函數對 $\beta$ 是非線性的，**沒有閉式解**，需用迭代法求解。本站採用批次梯度下降，每輪疊代用全部訓練資料計算梯度並更新：

$$
\beta \leftarrow \beta - \alpha \cdot \frac{1}{n}X^\top(\hat p - y)
$$

其中 $\alpha$ 是學習率。使用前需先標準化特徵（原始尺度差異過大會讓收斂極慢）。

## 運用範例

- **貸款違約預測**（本章案例）：依借款人財務特徵預測是否違約
- **醫療診斷**：依檢驗數值預測是否罹患某疾病
- **行銷轉換預測**：依使用者行為預測是否會點擊/購買

## 適用情境與限制

**適合使用的情境：**

- 目標變數是二元類別（是/否、有/無）
- 資料近似線性可分
- 需要可解釋的機率輸出（而非只有硬性分類標籤）

**限制與假設：**

- **決策邊界本質是線性的**：無法處理非線性可分的資料，需搭配特徵工程（如多項式特徵）或改用非線性模型
- **係數是 log-odds，不是直接的機率變化量**：不能像線性回歸那樣直接解讀「x 增加 1，y 增加 β」
- **類別不平衡時需搭配 Precision/Recall，不能只看 Accuracy**（本章案例即為示範）

## 評估指標

- **混淆矩陣**：TP（真陽性）/FP（偽陽性）/FN（偽陰性）/TN（真陰性）四格，是其餘指標的基礎
- **Accuracy（準確率）**：$(TP+TN)/n$，但類別不平衡時容易失真
- **Precision（精確率）**：$TP/(TP+FP)$，預測為正的樣本中有多少真的是正
- **Recall（召回率）**：$TP/(TP+FN)$，真正的正樣本中有多少被抓出來
- **F1-Score**：Precision 與 Recall 的調和平均，兩者需兼顧時的綜合指標

## 常見誤區

- **誤用 Accuracy 評估不平衡資料**：本章案例 Accuracy 高達 88%，但 Recall 只有 66.7%——高 Accuracy 可能只是模型傾向猜多數類別
- **把 Sigmoid 輸出的機率當成絕對真理**：機率是模型估計值，不代表校準良好（calibration 是獨立的議題）
- **誤以為決策邊界必然是複雜曲線**：Logistic Regression 本身的決策邊界就是線性的，能學到的分界只能是（超）平面
- **誤把未標準化的係數大小當「特徵重要性」解讀**：特徵尺度不同時，係數大小不可直接比較
```

- [ ] **Step 2: Wire the interactive component into `[slug].astro`**

In `src/pages/chapters/[slug].astro`, add the import right after the existing `LassoRegressionFit` import line (currently line 14):

```astro
import LassoRegressionFit from '../../components/charts/LassoRegressionFit';
import LogisticRegressionFit from '../../components/charts/LogisticRegressionFit';
```

Then add a new conditional render block right after the existing `lasso-regression-fit` block (after its closing `)}` at line 120, before the closing `</main>` at line 121):

```astro
    {chapter.data.interactiveComponent === 'logistic-regression-fit' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        <LogisticRegressionFit client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">互動圖表載入中……</div>
        </LogisticRegressionFit>
      </section>
    )}
```

- [ ] **Step 3: Extend the chapter chain in `chapters.ts`**

In `src/config/chapters.ts`, the file currently ends with:

```ts
  {
    slug: 'lasso-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'ridge-regression',
  },
];
```

Replace it with:

```ts
  {
    slug: 'lasso-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'ridge-regression',
    nextSlug: 'logistic-regression',
  },
  {
    slug: 'logistic-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'lasso-regression',
  },
];
```

- [ ] **Step 4: Wire `curriculum.ts`**

In `src/config/curriculum.ts`, the "Logistic Regression（邏輯斯迴歸）" topic already has a `relatedTo` pointing at Multiple Linear Regression (added when that chapter shipped) but no `slug` yet:

```ts
      {
        name: 'Logistic Regression（邏輯斯迴歸）',
        relatedTo: ['Multiple Linear Regression（多元線性回歸）'],
      },
```

Replace it with (adding only `slug` — the `relatedTo` link is already correct and already bidirectional, since `multiple-linear-regression`'s topic entry already lists `relatedTo: ['Logistic Regression（邏輯斯迴歸）']`; do not touch that entry):

```ts
      {
        name: 'Logistic Regression（邏輯斯迴歸）',
        slug: 'logistic-regression',
        relatedTo: ['Multiple Linear Regression（多元線性回歸）'],
      },
```

- [ ] **Step 5: Update `curriculum.test.ts`'s built-chapter assertion**

In `src/config/curriculum.test.ts`, the test currently named `'marks exactly the ten currently-built chapters as having a slug'` expects a 10-item array ending in `'Lasso Regression（Lasso 迴歸，正則化）'`. Update the test name to `eleven` and append the new chapter name:

```ts
  it('marks exactly the eleven currently-built chapters as having a slug', () => {
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
      'Logistic Regression（邏輯斯迴歸）',
    ]);
  });
```

- [ ] **Step 6: Update the cross-chapter relation table status in `chapter_template_guide.md`**

In `docs/specs/chapter_template_guide.md`, section 1.1's table already has a row for this relation (added when Multiple Linear Regression shipped), currently reading:

```md
   | Multiple Linear Regression | Logistic Regression | 迴歸走向分類的橋樑 | A 側已補充；B 側建置時補上 |
```

Change only the last cell:

```md
   | Multiple Linear Regression | Logistic Regression | 迴歸走向分類的橋樑 | 兩側已補 |
```

This does **not** add a new row (the row already existed) and does **not** change the "目前 10 組核心關聯對照表" count sentence above the table — the count of *rows* is unchanged, only this row's status column changes.

- [ ] **Step 7: Type-check and build**

Run: `npx astro check`
Expected: 0 errors, 0 warnings.

Run: `npm run build`
Expected: build succeeds, 12 pages produced (11 existing — 10 chapters + `index.astro` — plus the new `logistic-regression` chapter).

- [ ] **Step 8: Run the full test suite**

Run: `npm run test`
Expected: 74 tests pass, including the updated `curriculum.test.ts` assertion (the `every relatedTo reference points to an existing topic name` test should also still pass — Logistic Regression's `relatedTo` target, Multiple Linear Regression, already exists as a topic name, and Multiple Linear Regression's `relatedTo` target, Logistic Regression, already existed before this task).

- [ ] **Step 9: Commit**

```bash
git add src/content/chapters/logistic-regression.md "src/pages/chapters/[slug].astro" src/config/chapters.ts src/config/curriculum.ts src/config/curriculum.test.ts docs/specs/chapter_template_guide.md
git commit -m "$(cat <<'EOF'
Add Logistic Regression chapter page

Nine-block content — this site's first classification-task chapter,
with its own math (Sigmoid + Cross-Entropy Loss), evaluation metrics
(confusion matrix + accuracy/precision/recall/F1), and pitfalls, not
copied from the Linear Regression family. Wired into the chapter chain
after Lasso Regression, with its LogisticRegressionFit interactive
component mounted. curriculum.ts's relatedTo link to Multiple Linear
Regression was already bidirectional before this commit; this only
adds the slug.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Excalidraw-style summary infographic

**Files:**
- Modify: `src/content/chapters/logistic-regression.md` (add the `summary:` frontmatter field — deferred here from Task 4; see Task 4 Step 1's note)
- Create: `docs/specs/assets-src/logistic-regression-summary.html`
- Create: `scripts/render-logistic-regression-infographic.ps1`
- Create (rendered output, via Step 3 below): `src/assets/chapters/logistic-regression-summary.png`

**Interfaces:** None — this is a standalone static HTML asset rendered to PNG by a headless-Edge screenshot script, matching the existing pattern used by every other chapter's infographic (`docs/specs/assets-src/ridge-regression-summary.html` is the reference — copy it, don't start from scratch). It is consumed via the `image:` path added to `logistic-regression.md` in Step 0 below, which `ChapterSummaryCard.astro` reads generically — no code changes needed there.

- [ ] **Step 0: Add the `summary:` frontmatter field to `logistic-regression.md`**

Task 4 deliberately shipped `logistic-regression.md` without a `summary:` field (a premature `image:` reference would have failed `npm run build` before this PNG existed). Add this block to the frontmatter, right after the existing `interactiveComponent: logistic-regression-fit` line (before the closing `---`):

```yaml
summary:
  formulas:
    - "\\sigma(z) = 1 / (1+e^{-z})"
    - "J(\\beta) = -\\frac{1}{n}\\sum_{i=1}^n[y_i\\log\\hat p_i + (1-y_i)\\log(1-\\hat p_i)]"
  keyStats:
    - label: 適用資料型態
      value: 二元類別目標變數
    - label: 常用評估指標
      value: Accuracy, Precision, Recall, F1
    - label: 訓練方式
      value: 標準化特徵＋批次梯度下降（無閉式解）
  image: ../../assets/chapters/logistic-regression-summary.png
```

- [ ] **Step 1: Create the infographic HTML source**

Create `docs/specs/assets-src/logistic-regression-summary.html`. Copy `docs/specs/assets-src/ridge-regression-summary.html` verbatim as the starting point (same `<style>` block, same rough.js wiring script at the bottom, same `palette` object in the script — none of that needs to change), then replace only the `<head><title>`, and the `<body>` content between `<div class="page" id="page">` and the closing `</div>` before `<script src="rough-engine.js">`, exactly as follows:

`<title>`:
```html
  <title>Logistic Regression 資訊圖表（Excalidraw 風格）</title>
```

Header block:
```html
  <header class="title-block">
    <canvas class="doodle" id="doodle"></canvas>
    <h1 class="main-title">邏輯斯迴歸</h1>
    <div class="subtitle">Logistic Regression · 監督式學習－迴歸（分類任務）</div>
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
        Logistic Regression 用線性組合搭配 Sigmoid 函數，把預測值壓縮成 0~1 之間的機率，再以門檻切出類別。是本站第一個分類任務章節，也是迴歸走向分類的橋樑。
        <div class="tag-row">
          <span class="tag" data-sketch="tag1"><canvas class="sketch-bg"></canvas><span>監督式學習</span></span>
          <span class="tag" data-sketch="tag2"><canvas class="sketch-bg"></canvas><span>分類任務</span></span>
          <span class="tag" data-sketch="tag3"><canvas class="sketch-bg"></canvas><span>Sigmoid</span></span>
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
          <div class="eq">σ(z) &nbsp;=&nbsp; 1 / (1 + e⁻ᶻ)</div>
          <div class="eq" style="font-size:15px">J(β) &nbsp;=&nbsp; −(1/n)Σ[yᵢlog p̂ᵢ + (1−yᵢ)log(1−p̂ᵢ)]</div>
        </div>
        Sigmoid 把線性組合 z 壓縮到 (0,1)，解讀為「屬於正類別的機率」。Cross-Entropy Loss 對 β 非線性，<b>沒有閉式解</b>，需用批次梯度下降迭代求解——這是與 Linear/Ridge/Lasso Regression 最根本的差異。
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
            <li>目標變數是二元類別（是/否、有/無）</li>
            <li>資料近似線性可分</li>
            <li>需要可解釋的機率輸出</li>
          </ul>
        </div>
        <div>
          <h3 class="bad">⚠ 假設與限制</h3>
          <ul>
            <li>決策邊界本質是線性的，無法處理非線性可分資料</li>
            <li>係數是 log-odds，不是直接的機率變化量</li>
            <li>類別不平衡時需搭配 Precision/Recall，不能只看 Accuracy</li>
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
            <h4>混淆矩陣</h4>
            <p style="margin-top:4px">TP／FP／FN／TN 四格，是其餘指標的基礎——分別代表真陽性、偽陽性、偽陰性、真陰性。</p>
          </div>
        </div>
        <div class="metric-box" data-sketch="m2">
          <canvas class="sketch-bg"></canvas>
          <div class="card-inner">
            <h4>Accuracy / Precision / Recall / F1</h4>
            <div class="eq" style="font-size:13px">Acc=(TP+TN)/n　Prec=TP/(TP+FP)</div>
            <div class="eq" style="font-size:13px">Recall=TP/(TP+FN)　F1=2PR/(P+R)</div>
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
          <li><b>誤用 Accuracy 評估不平衡資料</b>——本章案例 Accuracy 高達 88%，但 Recall 只有 66.7%。</li>
          <li><b>把 Sigmoid 輸出的機率當成絕對真理</b>——機率是模型估計值，不代表校準良好。</li>
          <li><b>誤以為決策邊界必然是複雜曲線</b>——Logistic Regression 本身的決策邊界就是線性的。</li>
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
      <h2>案例分析：Loan Default（貸款違約預測）</h2>
      <div class="board-sub">200 筆合成貸款資料（負債佔收入比、信用分數），依 75/25 切分訓練/測試集</div>

      <div class="metabar">
        <div class="meta-item"><div class="label">資料集</div><div class="value">合成貸款違約資料</div></div>
        <div class="meta-item"><div class="label">訓練/測試</div><div class="value">150 / 50 筆</div></div>
        <div class="meta-item"><div class="label">特徵</div><div class="value">負債比、信用分數</div></div>
        <div class="meta-item"><div class="label">違約比例</div><div class="value">25.5%</div></div>
        <div class="meta-item"><div class="label">求解方式</div><div class="value">標準化＋批次梯度下降</div></div>
      </div>

      <div class="board-grid">
        <div>
          <table class="coef-table">
            <thead>
              <tr><th>指標</th><th>訓練集</th><th>測試集</th></tr>
            </thead>
            <tbody>
              <tr><td>Accuracy</td><td>0.8667</td><td>0.8800</td></tr>
              <tr><td>Precision</td><td>0.7500</td><td>0.9091</td></tr>
              <tr><td>Recall</td><td>0.6667</td><td>0.6667</td></tr>
              <tr><td>F1-Score</td><td>0.7059</td><td>0.7692</td></tr>
            </tbody>
          </table>
          <div class="big-stats">
            <div class="big-stat"><div class="label">測試 Accuracy</div><div class="value">88%</div></div>
            <div class="big-stat"><div class="label">測試 Recall</div><div class="value">66.7%</div></div>
          </div>
        </div>
        <ul class="insight-list">
          <li>測試集 Accuracy 高達 <span class="hl">88%</span>，乍看是個不錯的模型。</li>
          <li>但 Recall 只有 <span class="hl">66.7%</span>——15 個真正違約的客戶中，模型漏掉了 5 個，這正是不平衡資料（違約僅佔 25.5%）下 Accuracy 容易失真的典型案例。</li>
          <li>兩個特徵的係數方向都與直覺一致：負債佔收入比越高、信用分數越低，違約機率越高。</li>
          <li>與 Multiple Linear Regression 的關係：同樣的線性組合，換一個 Sigmoid 轉換與 Cross-Entropy 損失函數，就從迴歸變成了分類。</li>
        </ul>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Create the render script**

Create `scripts/render-logistic-regression-infographic.ps1`, copying the exact structure of `scripts/render-ridge-regression-infographic.ps1` (which already uses the `$repoRoot = Split-Path -Parent $PSScriptRoot` dynamic path pattern — do not hardcode an absolute checkout path):

```powershell
# Render Logistic Regression Infographic HTML to PNG
$repoRoot = Split-Path -Parent $PSScriptRoot
$htmlPath = Join-Path $repoRoot "docs/specs/assets-src/logistic-regression-summary.html"
$outputPath = Join-Path $repoRoot "src/assets/chapters/logistic-regression-summary.png"

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

Run: `powershell -File scripts/render-logistic-regression-infographic.ps1`
Expected: `src/assets/chapters/logistic-regression-summary.png` is created. If the Edge headless screenshot races ahead of the rough.js canvas paint, or `Test-Path` reports success/failure unreliably (both previously documented, known issues across every chapter's render script, not specific to this one — see the design doc's "瀏覽器實測工具與已知限制" note), just re-run the same command and personally check the output file's timestamp/content; do not add delays or modify the script's logic without checking with the developer first.

- [ ] **Step 4: Personally view the rendered PNG**

Use the Read tool to open `src/assets/chapters/logistic-regression-summary.png` and visually inspect it. This step cannot be delegated to a reviewer subagent — sub-review agents cannot view binary image files, and this codebase has a documented past incident (phase 20) where a subagent-reviewed infographic passed review with a rendering bug that only surfaced when a human/the primary agent actually looked at the image. Check specifically:
- All 6 cards render (no blank cards, no missing rough.js sketch borders).
- No literal `$...$`, `\ldots`, `\beta`, `\sigma` or other LaTeX/math source text is visible anywhere (this HTML has no KaTeX engine — all math must already be plain Unicode/HTML, which the card content above already uses, but double-check nothing slipped through).
- The metric card's two boxes both fit their content without visibly overflowing or clipping (this card's content differs in shape from Ridge/Lasso's two formula-heavy boxes — one box here is prose, the other is two compact formula lines).
- The board (case-study) section's table and big-stats numbers match Step 1's content exactly (0.8667 / 0.8800 / 0.7500 / 0.9091 / 0.6667 (both rows) / 0.7059 / 0.7692 / 88% / 66.7%).

If anything is wrong, fix the HTML and re-render (Step 3) before proceeding — do not commit a broken image.

- [ ] **Step 5: Verify the chapter page displays the image**

Run: `npm run build`, then `npm run preview` (background), then either fetch the built HTML or use headless Edge to confirm `/chapters/logistic-regression` renders the `ChapterSummaryCard` image without a broken-image icon. Stop the preview server afterward (find its PID via `netstat -ano` on the preview port, then `taskkill //PID <pid> //F`) — do not leave it running.

- [ ] **Step 6: Commit**

```bash
git add src/content/chapters/logistic-regression.md docs/specs/assets-src/logistic-regression-summary.html scripts/render-logistic-regression-infographic.ps1 src/assets/chapters/logistic-regression-summary.png
git commit -m "$(cat <<'EOF'
Add Logistic Regression summary infographic

Excalidraw-style, six-card layout matching the existing algorithm-chapter
template. Case study is the loan-default Accuracy-vs-Recall paradox:
test accuracy 88% looks good, but recall is only 66.7% — the model
misses a third of actual defaulters, on a deliberately imbalanced
(~25% default rate) dataset.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Final Verification (after all 5 tasks)

- [ ] `npx astro check` — 0 errors, 0 warnings
- [ ] `npm run build` — 12 pages produced
- [ ] `npm run test` — 74 tests pass
- [ ] Browser/CDP verification: the decision-boundary scatter plot renders with two colored point classes (未違約/違約) and one boundary line; the stats `dl` shows train accuracy ≈0.8667, test accuracy 0.8800, test precision ≈0.9091, test recall ≈0.6667, test F1 ≈0.7692; the confusion-matrix table shows `{tp:10, fp:1, fn:5, tn:34}`. If the on-page numbers don't match this plan's reference table, that's a real bug (likely an RNG-order or standardization mistake) — stop and investigate rather than adjusting the reference numbers. Confirm `chapterOrder` via `curl` on the built HTML (not a screenshot — the top nav track can clip visually) showing `ridge-regression → lasso-regression → logistic-regression` with correct `aria-current`.
- [ ] Confirm the Multiple Linear Regression page's existing "與 Logistic Regression 的關係" paragraph still renders correctly (this plan did not touch that file, but it's worth a sanity check since it's the other half of a now-bidirectional-in-both-chapters relation).
- [ ] Close any dev/preview server started during this work (per project convention — check `netstat` on 4321/9333, `taskkill` if anything is still listening).
