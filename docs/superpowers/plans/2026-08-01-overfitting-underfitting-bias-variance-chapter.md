# 過擬合/欠擬合與偏差-變異數權衡 章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「過擬合/欠擬合與偏差-變異數權衡」章節，套用既有「技巧/技術類」章節範本（簡介／診斷與應對／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示），並串接進課程知識地圖與章節導覽，作為階段二（方法論基礎）的最後一個章節。

**Architecture:** 新增一個純函式函式庫 `polynomialFit.ts`（合成 1D 資料集 + 多項式擬合 + train/test RMSE 計算，TDD），最大化重用既有的 `regression.ts`（最小平方法求解器）與 `dataSplit.ts`（train/test 切分）——不重寫矩陣運算或洗牌邏輯。新的互動式 React 元件是雙圖（擬合曲線圖 + 誤差曲線圖）+ 次數白名單按鈕。內文與 curriculum 串接機制、Excalidraw 風格學習摘要資訊圖表皆比照既有章節慣例。五個任務：(1) 多項式擬合函式庫、(2) 互動元件與頁面掛載、(3) 章節內文與課程資料串接、(4) 資訊圖表、(5) 全站最終驗證。**本次沿用既有範本，不需修改 `chapter_template_guide.md`。**

**Tech Stack:** Astro (Content Layer API) + TypeScript + React (`client:only="react"`) + Plotly.js + Markdown frontmatter；資訊圖表沿用 rough.js（`docs/specs/assets-src/rough-engine.js`）+ 無頭 Microsoft Edge 渲染，無新增依賴。

## Global Constraints

- 依已核准設計文件 `docs/superpowers/specs/2026-08-01-overfitting-underfitting-bias-variance-chapter-design.md`：本章只涵蓋過擬合/欠擬合的診斷（train/test 誤差判斷）與應對策略清單，**不深入**個別解法（正則化完整推導留給 Ridge/Lasso 章節）；Bias²+Variance+不可避免誤差分解公式寫入內文，但不做完整統計證明。
- 章節沿用「技巧/技術類」6 大區塊範本：簡介／診斷與應對／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示。**不含**「分類方式」「數學原理」「運用範例」「評估指標」「案例分析」等區塊。
- `curriculum.ts` **不新增** `relatedTo`（與 Ridge/Lasso Regression 的關聯待該章節建置時再處理）。
- 合成資料集與雜訊須用**固定的確定性公式**（非 `Math.random()`），確保畫面可重現；本計畫已預先用 Node 腳本驗證過實際數值（詳見各任務內的精確數字），實作時**直接抄錄**，不可自行更換公式常數。
- 互動元件的多項式次數為**白名單按鈕**（1／2／3／5／9／15），非自由滑桿，符合技巧類範本「預先設計展示、非自由調參」規範。
- `docs/specs/assets-src/rough-engine.js` 為共用檔案，任何任務都不得刪除或修改。
- **本次不修改 `docs/specs/chapter_template_guide.md`**——「技巧/技術類」範本已於 1.3 節記錄，本章僅是套用既有範本。
- 新章節的 `chapterOrder` 插入位置固定在「訓練/測試切分與交叉驗證」與「Simple Linear Regression」之間：機器學習介紹 → CRISP-DM → 特徵工程與標準化 → 訓練/測試切分與交叉驗證 → **過擬合/欠擬合與偏差-變異數權衡** → 簡單線性回歸 → 多元線性回歸。
- 互動元件比照既有慣例：關閉 Plotly 內建拖曳縮放（`dragmode: false`），圖例只顯示不可點擊切換（`itemclick: false`／`itemdoubleclick: false`，比照 `RegressionScatter2D.tsx` 既有模式，因為本章圖表是連續數值座標的散佈+曲線圖，不是可用 y 類別標籤取代圖例的橫向點狀圖）。
- 每個涉及程式碼/內容變更的任務改動後必須執行 `npx astro check`（預期 0 錯誤/0 警告）與 `npm run build`（預期成功產出頁面），驗證通過才能進入下一任務。

---

### Task 1: 多項式擬合函式庫（TDD）

**Files:**
- Create: `src/lib/polynomialFit.ts`
- Create: `src/lib/polynomialFit.test.ts`

**Interfaces:**
- Consumes: `fitLinearRegression`/`predict`/`rmse`（既有 `src/lib/regression.ts`）、`trainTestSplit`（既有 `src/lib/dataSplit.ts`）
- Produces: `DataPoint`、`SYNTHETIC_DATASET: DataPoint[]`、`TRAIN_SET: DataPoint[]`、`TEST_SET: DataPoint[]`、`Y_AXIS_RANGE: [number, number]`、`DEGREE_OPTIONS`、`PolynomialDegree`、`CurveFit`、`CURVE_FITS: Record<PolynomialDegree, CurveFit>`，供 Task 2 的 `OverfittingUnderfittingComparison.tsx` 使用

**背景（已用 Node 腳本驗證，非猜測）**：合成資料集固定為 50 個點，`x` 均勻分布於 $[-3, 3]$，真實函數 $y = \sin(1.3x) \times 2.5 + 0.4x$，疊加確定性雜訊（振幅 0.4，用固定的 sine-hash 公式，非 `Math.random()`）。用既有 `trainTestSplit(0.7)`（`dataSplit.ts` 的 `SHUFFLED_INDICES` 為 50 個索引的固定洗牌排列）切成 35 訓練／15 測試。已驗證此設定在多項式次數 1／2／3／5／9／15 下皆能成功求解（無矩陣病態拋錯），且呈現清楚的欠擬合→適合→過擬合故事線：

| 次數 | Train RMSE | Test RMSE |
|---|---|---|
| 1 | 1.615 | 1.457 |
| 2 | 1.584 | 1.647 |
| 3 | 0.470 | 0.551 |
| 5 | 0.209 | 0.218 |
| 9 | 0.198 | 0.272 |
| 15 | 0.187 | 0.802 |

- [ ] **Step 1: 寫失敗測試 `src/lib/polynomialFit.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  SYNTHETIC_DATASET,
  TRAIN_SET,
  TEST_SET,
  DEGREE_OPTIONS,
  CURVE_FITS,
} from './polynomialFit';

describe('SYNTHETIC_DATASET', () => {
  it('has exactly 50 points spanning x from -3 to 3', () => {
    expect(SYNTHETIC_DATASET).toHaveLength(50);
    expect(SYNTHETIC_DATASET[0].x).toBeCloseTo(-3, 5);
    expect(SYNTHETIC_DATASET[49].x).toBeCloseTo(3, 5);
  });

  it('generates deterministic y values from a fixed formula (not Math.random)', () => {
    expect(SYNTHETIC_DATASET[0].y).toBeCloseTo(0.2657, 3);
    expect(SYNTHETIC_DATASET[49].y).toBeCloseTo(-0.1312, 3);
  });
});

describe('TRAIN_SET / TEST_SET', () => {
  it('splits the 50 points into 35 train and 15 test, reusing dataSplit.ts', () => {
    expect(TRAIN_SET).toHaveLength(35);
    expect(TEST_SET).toHaveLength(15);
  });

  it('covers every dataset point exactly once with no overlap', () => {
    const combined = [...TRAIN_SET, ...TEST_SET];
    expect(combined).toHaveLength(50);
    const uniqueX = new Set(combined.map((p) => p.x));
    expect(uniqueX.size).toBe(50);
  });
});

describe('CURVE_FITS', () => {
  it('has a fit for every degree in DEGREE_OPTIONS, each with a 61-point curve', () => {
    DEGREE_OPTIONS.forEach((degree) => {
      expect(CURVE_FITS[degree]).toBeDefined();
      expect(CURVE_FITS[degree].curve).toHaveLength(61);
    });
  });

  it('degree 1 (underfit) has high train and test error that stay close to each other', () => {
    const fit = CURVE_FITS[1];
    expect(fit.trainRmse).toBeGreaterThan(1.0);
    expect(fit.testRmse).toBeGreaterThan(1.0);
    expect(Math.abs(fit.trainRmse - fit.testRmse)).toBeLessThan(0.5);
  });

  it('train error is non-increasing as degree grows', () => {
    for (let i = 1; i < DEGREE_OPTIONS.length; i++) {
      const prevDegree = DEGREE_OPTIONS[i - 1];
      const currentDegree = DEGREE_OPTIONS[i];
      expect(CURVE_FITS[currentDegree].trainRmse).toBeLessThanOrEqual(
        CURVE_FITS[prevDegree].trainRmse + 1e-6
      );
    }
  });

  it('degree 15 (overfit) has much higher test error than degree 5 (good fit), despite lower train error', () => {
    const good = CURVE_FITS[5];
    const overfit = CURVE_FITS[15];
    expect(overfit.trainRmse).toBeLessThan(good.trainRmse);
    expect(overfit.testRmse).toBeGreaterThan(good.testRmse * 2);
  });

  it('matches the pre-computed RMSE values for the locked-in dataset (regression guard)', () => {
    expect(CURVE_FITS[1].trainRmse).toBeCloseTo(1.615, 1);
    expect(CURVE_FITS[1].testRmse).toBeCloseTo(1.457, 1);
    expect(CURVE_FITS[5].trainRmse).toBeCloseTo(0.209, 1);
    expect(CURVE_FITS[5].testRmse).toBeCloseTo(0.218, 1);
    expect(CURVE_FITS[15].trainRmse).toBeCloseTo(0.187, 1);
    expect(CURVE_FITS[15].testRmse).toBeCloseTo(0.802, 1);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run src/lib/polynomialFit.test.ts`
Expected: FAIL（`./polynomialFit` 模組不存在）

- [ ] **Step 3: 撰寫實作 `src/lib/polynomialFit.ts`**

```ts
import { fitLinearRegression, predict, rmse } from './regression';
import { trainTestSplit } from './dataSplit';

export interface DataPoint {
  x: number;
  y: number;
}

const POINT_COUNT = 50;
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
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run src/lib/polynomialFit.test.ts`
Expected: PASS（10 個測試全數通過）

- [ ] **Step 5: Commit**

```bash
git add src/lib/polynomialFit.ts src/lib/polynomialFit.test.ts
git commit -m "$(cat <<'EOF'
Add polynomial fit library for overfitting/underfitting demo

Pure functions reusing regression.ts's least-squares solver and
dataSplit.ts's train/test split: a fixed deterministic 1D synthetic
dataset (sine-based true function + hashed noise, no Math.random),
and per-degree polynomial fits with train/test RMSE for the
Overfitting/Underfitting & Bias-Variance Tradeoff chapter's
interactive comparison.
EOF
)"
```

---

### Task 2: 互動元件與頁面掛載

**Files:**
- Create: `src/components/charts/OverfittingUnderfittingComparison.tsx`
- Modify: `src/pages/chapters/[slug].astro`

**Interfaces:**
- Consumes: `TRAIN_SET`/`TEST_SET`/`CURVE_FITS`/`DEGREE_OPTIONS`/`Y_AXIS_RANGE`/`PolynomialDegree`（Task 1 的 `src/lib/polynomialFit.ts`）
- Produces: `OverfittingUnderfittingComparison` 預設匯出的 React 元件；`[slug].astro` 新增 `interactiveComponent === 'overfitting-underfitting-comparison'` 的字面 JSX 渲染分支，供 Task 3 的章節內容透過 frontmatter 觸發顯示

- [ ] **Step 1: 建立互動元件 `src/components/charts/OverfittingUnderfittingComparison.tsx`**

```tsx
import { useState } from 'react';
import Plot from 'react-plotly.js';
import {
  TRAIN_SET,
  TEST_SET,
  CURVE_FITS,
  DEGREE_OPTIONS,
  Y_AXIS_RANGE,
  type PolynomialDegree,
} from '../../lib/polynomialFit';

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

export default function OverfittingUnderfittingComparison() {
  const [degree, setDegree] = useState<PolynomialDegree>(3);
  const fit = CURVE_FITS[degree];

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {DEGREE_OPTIONS.map((d) => (
          <button
            key={d}
            type="button"
            className={d === degree ? 'is-active' : ''}
            onClick={() => setDegree(d)}
          >
            次數 {d}
          </button>
        ))}
      </div>
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto' }}
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
              name: `次數 ${degree} 擬合曲線`,
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
            title: { text: '模型擬合曲線', font: { color: '#e4e6eb', size: 14 } },
            xaxis: { title: 'x', range: [-3.3, 3.3], ...axisStyle },
            yaxis: { title: 'y', range: Y_AXIS_RANGE, ...axisStyle },
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
              type: 'scatter',
              mode: 'lines+markers',
              x: DEGREE_OPTIONS.map(String),
              y: DEGREE_OPTIONS.map((d) => CURVE_FITS[d].trainRmse),
              line: { color: '#5ee6d0' },
              marker: { size: 8, color: '#5ee6d0' },
              name: '訓練誤差 RMSE',
            },
            {
              type: 'scatter',
              mode: 'lines+markers',
              x: DEGREE_OPTIONS.map(String),
              y: DEGREE_OPTIONS.map((d) => CURVE_FITS[d].testRmse),
              line: { color: '#e6a15e' },
              marker: { size: 8, color: '#e6a15e' },
              name: '測試誤差 RMSE',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: [String(degree)],
              y: [CURVE_FITS[degree].testRmse],
              marker: { size: 16, color: 'rgba(0,0,0,0)', line: { width: 2, color: '#ffffff' } },
              name: '目前選中次數',
              showlegend: false,
              hoverinfo: 'skip',
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
            title: {
              text: 'Train/Test 誤差 vs. 模型複雜度（多項式次數）',
              font: { color: '#e4e6eb', size: 14 },
            },
            xaxis: { title: '多項式次數', type: 'category', ...axisStyle },
            yaxis: { title: 'RMSE', ...axisStyle },
            margin: { l: 50, r: 20, t: 40, b: 45 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '240px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>次數 {degree} — 訓練 RMSE</dt>
          <dd>{fit.trainRmse.toFixed(4)}</dd>
        </div>
        <div>
          <dt>次數 {degree} — 測試 RMSE</dt>
          <dd>{fit.testRmse.toFixed(4)}</dd>
        </div>
      </dl>
    </div>
  );
}
```

注意：`className="regression-chart"` 及其子元素類名沿用 `src/styles/global.css` 既有的通用圖表樣式（同一個 `.regression-chart__frame` 類別重複用在兩個 `<Plot>` 外層，比照既有多圖表元件慣例），**不需要**新增任何 CSS。

- [ ] **Step 2: 在 `[slug].astro` 掛載新元件**

在 `src/pages/chapters/[slug].astro` 中：

```astro
<!-- import 區塊修改前 -->
import TrainTestSplitComparison from '../../components/charts/TrainTestSplitComparison';

<!-- import 區塊修改後 -->
import TrainTestSplitComparison from '../../components/charts/TrainTestSplitComparison';
import OverfittingUnderfittingComparison from '../../components/charts/OverfittingUnderfittingComparison';
```

```astro
<!-- 在既有的 train-test-split-comparison 條件區塊之後新增 -->
    {chapter.data.interactiveComponent === 'overfitting-underfitting-comparison' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        <OverfittingUnderfittingComparison client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">互動圖表載入中……</div>
        </OverfittingUnderfittingComparison>
      </section>
    )}
```

- [ ] **Step 3: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**7 個頁面**正常產出（本任務尚未新增章節內容，頁面數不變）

Run: `npm run test`
Expected: 全數測試通過（含 Task 1 新增的 `polynomialFit.test.ts`）

注意：本任務尚無章節內容引用 `interactiveComponent: 'overfitting-underfitting-comparison'`，因此無法在瀏覽器實測此元件的實際互動行為——這會在 Task 3（章節內容建立後）第一次驗證。

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/OverfittingUnderfittingComparison.tsx src/pages/chapters/\[slug\].astro
git commit -m "$(cat <<'EOF'
Add overfitting/underfitting comparison interactive component

Dual-chart display: a curve-fit scatter+line chart for the selected
polynomial degree, and a train/test RMSE-vs-degree chart showing the
classic U-shaped validation curve across the fixed degree whitelist
(1/2/3/5/9/15). Not yet reachable from any chapter page — wired up in
the next task.
EOF
)"
```

---

### Task 3: 章節內文與課程資料串接

**Files:**
- Create: `src/content/chapters/overfitting-underfitting-bias-variance.md`
- Modify: `src/config/curriculum.ts`
- Modify: `src/config/chapters.ts`
- Modify: `src/config/curriculum.test.ts`

**Interfaces:**
- Consumes: Task 2 已將 `overfitting-underfitting-comparison` 字面分支掛載在 `[slug].astro`
- Produces: `overfitting-underfitting-bias-variance` 章節頁面可透過 `/chapters/overfitting-underfitting-bias-variance/` 存取（無學習摘要圖表，Task 4 會補上）；`curriculum.ts` 該主題具備 `slug`；`chapterOrder` 具備完整鏈結供 Task 5 驗證知識地圖與導覽

- [ ] **Step 1: 新增章節內容檔 `src/content/chapters/overfitting-underfitting-bias-variance.md`**

完整內容：

```markdown
---
title: 過擬合/欠擬合與偏差-變異數權衡
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: overfitting-underfitting-comparison
---

## 簡介

過擬合（Overfitting）指模型過度學習了訓練資料中的雜訊與細節，導致在訓練集上表現極佳，卻無法類推到新資料；欠擬合（Underfitting）則相反，模型過於簡單，連訓練資料本身的規律都學不好。兩者的核心都是模型複雜度與泛化能力之間的取捨——這正是機器學習方法論中最基礎、也最貫穿全課程的權衡問題。

## 診斷與應對

- **判斷依據**：欠擬合＝train 誤差與 test 誤差都偏高、且兩者接近；過擬合＝train 誤差低、test 誤差高，兩者差距明顯。
- **Bias-Variance 分解公式**：

$$
\text{Err}(x) = \text{Bias}[\hat f(x)]^2 + \text{Var}[\hat f(x)] + \sigma^2
$$

  Bias（偏差）代表模型假設過於簡化、系統性偏離真實規律的程度，對應欠擬合；Variance（變異數）代表模型對訓練資料的微小變動過度敏感的程度，對應過擬合；$\sigma^2$ 是資料本身雜訊造成的不可避免誤差，無法透過調整模型消除。
- **應對欠擬合**：提高模型複雜度、增加/工程化特徵、降低正則化強度。
- **應對過擬合**：增加資料量、降低模型複雜度、加入正則化、以交叉驗證挑選模型複雜度、提早停止訓練。

## 適用情境與限制

- 此診斷框架適用於任何監督式學習模型（迴歸與分類皆然），是貫穿後續所有演算法章節的共通概念。
- 限制：真實的 Bias／Variance 無法直接測量（因為真實函數未知），實務上只能透過 train/test 誤差或交叉驗證間接估計、近似。
- 不同模型的「複雜度旋鈕」不同（例如樹的深度、多項式次數、正則化係數），本章僅示範多項式次數這一種，其餘留給對應演算法章節說明。

## 常見誤區

- **只看訓練誤差判斷模型好壞**：訓練誤差極低甚至趨近於 0，反而可能是過擬合的警訊，而非模型優秀的證明。
- **以為增加複雜度/特徵是萬靈丹**：複雜度提升到一定程度後，test 誤差會反轉上升，並非越複雜越好。
- **用 test set 反覆調整模型複雜度**：呼應前一章「訓練/測試切分與交叉驗證」已提過的資訊洩漏問題——挑選模型複雜度應使用驗證集或交叉驗證，test set 只留到最終評估用一次。
```

注意：本步驟**故意不加入 `summary` frontmatter 欄位**（學習摘要圖表尚未存在，`content.config.ts` 的 `summary.image` 使用 Astro `image()` schema helper，引用不存在的檔案會導致建置失敗）。`summary` 欄位會在 Task 4 資訊圖表產出後才加入。

- [ ] **Step 2: 在 `curriculum.ts` 為「過擬合/欠擬合與偏差-變異數權衡」主題補上 `slug`**

在 `src/config/curriculum.ts` 中：

```ts
// 修改前
      { name: '過擬合/欠擬合與偏差-變異數權衡' },

// 修改後
      { name: '過擬合/欠擬合與偏差-變異數權衡', slug: 'overfitting-underfitting-bias-variance' },
```

- [ ] **Step 3: 在 `chapters.ts` 的 `chapterOrder` 插入新章節**

在 `src/config/chapters.ts` 中：

```ts
// 修改前
export const chapterOrder: ChapterMeta[] = [
  {
    slug: 'machine-learning-introduction',
    stage: '課程導覽',
    nextSlug: 'crisp-dm',
  },
  {
    slug: 'crisp-dm',
    stage: '課程導覽',
    prerequisiteSlug: 'machine-learning-introduction',
    nextSlug: 'feature-engineering-standardization',
  },
  {
    slug: 'feature-engineering-standardization',
    stage: '方法論基礎',
    prerequisiteSlug: 'crisp-dm',
    nextSlug: 'train-test-split-cross-validation',
  },
  {
    slug: 'train-test-split-cross-validation',
    stage: '方法論基礎',
    prerequisiteSlug: 'feature-engineering-standardization',
    nextSlug: 'simple-linear-regression',
  },
  {
    slug: 'simple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'train-test-split-cross-validation',
    nextSlug: 'multiple-linear-regression',
  },
  {
    slug: 'multiple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'simple-linear-regression',
  },
];

// 修改後
export const chapterOrder: ChapterMeta[] = [
  {
    slug: 'machine-learning-introduction',
    stage: '課程導覽',
    nextSlug: 'crisp-dm',
  },
  {
    slug: 'crisp-dm',
    stage: '課程導覽',
    prerequisiteSlug: 'machine-learning-introduction',
    nextSlug: 'feature-engineering-standardization',
  },
  {
    slug: 'feature-engineering-standardization',
    stage: '方法論基礎',
    prerequisiteSlug: 'crisp-dm',
    nextSlug: 'train-test-split-cross-validation',
  },
  {
    slug: 'train-test-split-cross-validation',
    stage: '方法論基礎',
    prerequisiteSlug: 'feature-engineering-standardization',
    nextSlug: 'overfitting-underfitting-bias-variance',
  },
  {
    slug: 'overfitting-underfitting-bias-variance',
    stage: '方法論基礎',
    prerequisiteSlug: 'train-test-split-cross-validation',
    nextSlug: 'simple-linear-regression',
  },
  {
    slug: 'simple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'overfitting-underfitting-bias-variance',
    nextSlug: 'multiple-linear-regression',
  },
  {
    slug: 'multiple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'simple-linear-regression',
  },
];
```

- [ ] **Step 4: 更新 `curriculum.test.ts` 既有測試以反映新增的第 7 個已建置章節**

在 `src/config/curriculum.test.ts` 中：

```ts
// 修改前
  it('marks exactly the six currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'CRISP-DM 資料分析方法',
      '特徵工程與標準化',
      '訓練/測試切分與交叉驗證',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
    ]);
  });

// 修改後
  it('marks exactly the seven currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'CRISP-DM 資料分析方法',
      '特徵工程與標準化',
      '訓練/測試切分與交叉驗證',
      '過擬合/欠擬合與偏差-變異數權衡',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
    ]);
  });
```

- [ ] **Step 5: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**8 個頁面**正常產出（首頁 + 7 章節，包含新的 `/chapters/overfitting-underfitting-bias-variance/`）

Run: `npm run test`
Expected: 全數測試通過（含 Step 4 更新後的 `curriculum.test.ts`）

- [ ] **Step 6: 瀏覽器實測互動元件（第一次真正可觸發）**

啟動 `npm run preview`（背景執行），用 `curl` 預熱 `/chapters/overfitting-underfitting-bias-variance/` 頁面後，用無頭 Microsoft Edge 截圖確認：
- 頁首跳轉徽章只有「互動操作」，**沒有**「資訊圖表」（因尚未加入 `summary` 欄位）
- 「簡介」「診斷與應對」「適用情境與限制」「常見誤區」四個區塊文字完整呈現，KaTeX 公式（Bias-Variance 分解式）正確渲染
- 「互動式操作與演示」區塊正確顯示雙圖：上圖預設次數 3 的擬合曲線 + 訓練/測試散佈點，下圖 U 型誤差曲線且次數 3 處有白色圈選標記

若需驗證按鈕點擊切換次數後的即時互動效果，可參考既有階段使用過的 Chrome DevTools Protocol（CDP）點擊驅動方式：啟動帶 `--remote-debugging-port` 的無頭 Edge，透過 WebSocket 呼叫 `Runtime.evaluate` 執行按鈕 `.click()`，再用 `Page.captureScreenshot` 截圖佐證；驗證完成後需額外確認 CDP 驅動用的 Edge 行程（監聽該 debugging port）也一併關閉。

驗證完成後依 `docs/handover.md` 規則關閉預覽伺服器（`netstat -ano` 找 PID，`taskkill //PID <pid> //F`，再次 `netstat` 確認無殘留）。

- [ ] **Step 7: Commit**

```bash
git add src/content/chapters/overfitting-underfitting-bias-variance.md src/config/curriculum.ts src/config/chapters.ts src/config/curriculum.test.ts
git commit -m "$(cat <<'EOF'
Add Overfitting/Underfitting & Bias-Variance Tradeoff chapter content and wire into curriculum/navigation

Reuses the technique/skill-based chapter template. Inserted mid-chain
between train-test-split-cross-validation and simple-linear-regression,
rewiring both neighbors' prerequisite/next links. Final chapter in
stage two (方法論基礎).
EOF
)"
```

---

### Task 4: Excalidraw 風格學習摘要資訊圖表

**Files:**
- Create: `docs/specs/assets-src/overfitting-underfitting-bias-variance-summary.html`
- Create: `scripts/render-overfitting-underfitting-bias-variance-infographic.ps1`
- Create: `src/assets/chapters/overfitting-underfitting-bias-variance-summary.png`（渲染輸出）
- Modify: `src/content/chapters/overfitting-underfitting-bias-variance.md`

**Interfaces:**
- Consumes: Task 3 已建立 `overfitting-underfitting-bias-variance.md`（尚無 `summary` 欄位）
- Produces: `overfitting-underfitting-bias-variance.md` frontmatter 具備完整 `summary`，供 Task 5 驗證頁面「學習摘要」區塊

**標題長度注意**：本章標題「過擬合/欠擬合與偏差-變異數權衡」共 16 個字元，明顯長於前一章節「訓練/測試切分與交叉驗證」（12 字元、底線寬度 500px）。依比例換算（500px × 16/12 ≈ 667px），本步驟的 `.title-underline` 初始寬度設為 **660px**，仍須在 Step 3 視覺檢查時確認底線是否完整涵蓋標題、非「刪除線」效果，不足則再加寬。

- [ ] **Step 1: 建立資訊圖表來源檔 `docs/specs/assets-src/overfitting-underfitting-bias-variance-summary.html`**

完整內容（比照既有 `feature-engineering-standardization-summary.html` 的 CSS 變數、`.page`/`.card`/`sketch-bg` 基礎樣式與繪製腳本結構；4 個視覺區塊，「診斷與應對」卡的主視覺為三格欠擬合/很適合/過擬合手繪對比圖）：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>過擬合/欠擬合與偏差-變異數權衡 資訊圖表（Excalidraw 風格）</title>
  <style>
    :root {
      --paper: #f3efe2;
      --ink: #2b2a33;
      --ink-soft: #4a4854;
      --intro: #5b5f97;
      --intro-fill: #e4e5f3;
      --formula: #2f8f7a;
      --formula-fill: #dcf0ec;
      --scope: #c07f2e;
      --scope-fill: #f7e9d2;
      --pitfall: #b5533c;
      --pitfall-fill: #f6e0d8;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      background: #d8d2bd;
      font-family: "Segoe UI", "Microsoft JhengHei", sans-serif;
    }

    body {
      display: flex;
      justify-content: center;
      padding: 0;
      background: #f3efe2;
    }

    .page {
      position: relative;
      width: 210mm;
      background: var(--paper);
      box-shadow: none;
      padding: 14mm 14mm 12mm;
      color: var(--ink);
      font-family: "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive;
    }

    header.title-block {
      position: relative;
      text-align: center;
      padding: 4px 0 18px;
      margin-bottom: 14px;
    }

    h1.main-title {
      font-size: 34px;
      margin: 0 0 2px;
      color: var(--ink);
      letter-spacing: 1px;
    }

    .subtitle {
      font-family: "Segoe UI", sans-serif;
      font-size: 14px;
      color: var(--ink-soft);
      letter-spacing: 0.5px;
    }

    .doodle {
      position: absolute;
      top: 2px;
      right: 6px;
      width: 92px;
      height: 72px;
    }

    .title-underline {
      position: absolute;
      left: 50%;
      top: 46px;
      transform: translateX(-50%);
      width: 660px;
      height: 20px;
    }

    section.card {
      position: relative;
      margin: 0 0 16px;
      padding: 16px 20px 18px;
    }

    .sketch-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none;
    }

    .card-inner {
      position: relative;
      z-index: 1;
    }

    .card-head {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 8px;
    }

    .card-head .num {
      font-size: 26px;
      line-height: 1;
    }

    .card-head h2 {
      margin: 0;
      font-size: 24px;
      font-weight: normal;
    }

    .card-body {
      font-family: "Segoe UI", "Microsoft JhengHei", sans-serif;
      font-size: 14.5px;
      line-height: 1.65;
      color: var(--ink);
    }

    .card.intro .card-head { color: var(--intro); }
    .card.formula .card-head { color: var(--formula); }
    .card.scope .card-head { color: var(--scope); }
    .card.pitfall .card-head { color: var(--pitfall); }

    .tag-row {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .tag {
      font-family: "Segoe Print", cursive;
      font-size: 13px;
      padding: 3px 12px 5px;
      color: var(--intro);
      position: relative;
    }
    .tag .sketch-bg { z-index: 0; }
    .tag span { position: relative; z-index: 1; }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .two-col h3 {
      margin: 0 0 6px;
      font-size: 15px;
      font-family: "Segoe Print", cursive;
    }
    .two-col.scope-cols h3.good { color: #3f7a3f; }
    .two-col.scope-cols h3.neutral { color: var(--ink-soft); }

    .card-body ul {
      margin: 0;
      padding-left: 20px;
    }
    .card-body li { margin-bottom: 6px; }
    .card-body li:last-child { margin-bottom: 0; }

    /* ---- 三格欠擬合/很適合/過擬合對比 ---- */
    .fit-caption {
      font-family: "Segoe UI", sans-serif;
      font-size: 13px;
      color: var(--ink-soft);
      margin: 0 0 10px;
    }
    .fit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .fit-box {
      position: relative;
      height: 130px;
      border: 2px solid var(--formula);
      border-radius: 8px;
      background: var(--formula-fill);
      overflow: hidden;
    }
    .fit-box__canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .fit-box__label {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 4px;
      text-align: center;
      font-family: "Segoe Print", cursive;
      font-size: 13px;
      color: var(--ink);
      z-index: 1;
    }
    .formula-line {
      font-family: "Segoe Print", cursive;
      font-size: 16px;
      color: var(--ink);
      margin: 6px 0 0;
      text-align: center;
    }

    @media print {
      body { background: none; padding: 0; }
      .page { box-shadow: none; }
    }
  </style>
</head>
<body>
<div class="page" id="page">
  <header class="title-block">
    <canvas class="doodle" id="doodle"></canvas>
    <h1 class="main-title">過擬合/欠擬合與偏差-變異數權衡</h1>
    <div class="subtitle">Overfitting/Underfitting &amp; Bias-Variance Tradeoff · 方法論基礎</div>
    <canvas class="title-underline" id="title-underline"></canvas>
  </header>

  <section class="card intro" data-sketch="intro">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">①</span><h2>簡介</h2></div>
      <div class="card-body">
        過擬合指模型過度學習了訓練資料中的雜訊，導致在訓練集上表現極佳卻無法類推到新資料；欠擬合則相反，模型過於簡單，連訓練資料本身的規律都學不好。兩者的核心都是模型複雜度與泛化能力之間的取捨。
        <div class="tag-row">
          <span class="tag" data-sketch="tag1"><canvas class="sketch-bg"></canvas><span>過擬合</span></span>
          <span class="tag" data-sketch="tag2"><canvas class="sketch-bg"></canvas><span>欠擬合</span></span>
          <span class="tag" data-sketch="tag3"><canvas class="sketch-bg"></canvas><span>Bias-Variance 權衡</span></span>
        </div>
      </div>
    </div>
  </section>

  <section class="card formula" data-sketch="formula">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">②</span><h2>診斷與應對</h2></div>
      <div class="card-body">
        <p class="fit-caption">同一批資料點，用不同複雜度的模型配適：</p>
        <div class="fit-grid">
          <div class="fit-box" data-fit="under">
            <canvas class="fit-box__canvas"></canvas>
            <span class="fit-box__label">欠擬合</span>
          </div>
          <div class="fit-box" data-fit="good">
            <canvas class="fit-box__canvas"></canvas>
            <span class="fit-box__label">很適合</span>
          </div>
          <div class="fit-box" data-fit="over">
            <canvas class="fit-box__canvas"></canvas>
            <span class="fit-box__label">過擬合</span>
          </div>
        </div>
        <p class="formula-line">Err(x) = Bias² + Variance + σ²（不可避免誤差）</p>
      </div>
    </div>
  </section>

  <section class="card scope" data-sketch="scope">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">③</span><h2>適用情境與限制</h2></div>
      <div class="card-body two-col scope-cols">
        <div>
          <h3 class="good">✓ 適用範圍</h3>
          <ul>
            <li>任何監督式學習模型（迴歸/分類皆然）</li>
            <li>貫穿後續所有演算法章節的共通概念</li>
          </ul>
        </div>
        <div>
          <h3 class="neutral">○ 限制</h3>
          <ul>
            <li>真實 Bias/Variance 無法直接測量，只能間接估計</li>
            <li>不同模型的「複雜度旋鈕」不同，需個別章節說明</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="card pitfall" data-sketch="pitfall">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">④</span><h2>常見誤區</h2></div>
      <div class="card-body">
        <ul>
          <li><b>只看訓練誤差判斷模型好壞</b>——訓練誤差趨近於 0 反而可能是過擬合警訊，而非模型優秀的證明。</li>
          <li><b>以為增加複雜度是萬靈丹</b>——複雜度提升到一定程度後，test 誤差會反轉上升。</li>
          <li><b>用 test set 反覆調整模型複雜度</b>——應改用驗證集或交叉驗證來挑選模型複雜度。</li>
        </ul>
      </div>
    </div>
  </section>
</div>

<script src="rough-engine.js"></script>
<script>
(function () {
  function seedFor(el, fallback) {
    var s = el.getAttribute('data-sketch') || fallback || 'x';
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 2147483647 || 1;
  }

  function drawFrame(el, opts) {
    var canvas = el.querySelector(':scope > canvas.sketch-bg') || el.querySelector('canvas.sketch-bg');
    if (!canvas) return;
    var rect = el.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var rc = rough.canvas(canvas, { options: {} });
    var seed = seedFor(el);
    var margin = opts.margin || 6;
    rc.rectangle(margin, margin, w - margin * 2, h - margin * 2, {
      seed: seed,
      roughness: opts.roughness || 1.6,
      bowing: opts.bowing || 1.8,
      stroke: opts.stroke,
      strokeWidth: opts.strokeWidth || 2.4,
      fill: opts.fill,
      fillStyle: opts.fillStyle || 'hachure',
      fillWeight: opts.fillWeight || 1.4,
      hachureGap: opts.hachureGap || 5,
      curveFitting: 1,
    });
  }

  var FIT_POINTS = [
    [0.08, 0.72], [0.20, 0.45], [0.33, 0.58], [0.46, 0.28],
    [0.58, 0.40], [0.70, 0.18], [0.85, 0.32], [0.94, 0.55],
  ];

  function drawFitBox(el, kind) {
    var canvas = el.querySelector('canvas.fit-box__canvas');
    if (!canvas) return;
    var rect = el.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var rc = rough.canvas(canvas, {});
    var pad = 10;
    var toXY = function (p) {
      return [pad + p[0] * (w - pad * 2), pad + p[1] * (h - pad * 2 - 18)];
    };

    var lineColor = kind === 'under' ? '#b5533c' : kind === 'good' ? '#2f8f7a' : '#c07f2e';

    if (kind === 'under') {
      var a = toXY([0.04, 0.60]);
      var b = toXY([0.96, 0.28]);
      rc.line(a[0], a[1], b[0], b[1], { roughness: 1.6, bowing: 1.2, stroke: lineColor, strokeWidth: 3 });
    } else if (kind === 'good') {
      var smoothPts = [[0.04, 0.66], [0.25, 0.46], [0.45, 0.30], [0.62, 0.27], [0.80, 0.20], [0.96, 0.34]].map(toXY);
      rc.curve(smoothPts, { roughness: 1.4, bowing: 1.3, stroke: lineColor, strokeWidth: 3 });
    } else {
      var jaggedPts = FIT_POINTS.map(toXY);
      rc.curve(jaggedPts, { roughness: 1.8, bowing: 0.6, stroke: lineColor, strokeWidth: 2.6 });
    }

    FIT_POINTS.forEach(function (p) {
      var xy = toXY(p);
      rc.circle(xy[0], xy[1], 7, { roughness: 1.6, fill: '#2b2a33', fillStyle: 'solid', stroke: '#2b2a33', strokeWidth: 1 });
    });
  }

  var palette = {
    intro:   { stroke: '#5b5f97', fill: '#e4e5f3' },
    formula: { stroke: '#2f8f7a', fill: '#dcf0ec' },
    scope:   { stroke: '#c07f2e', fill: '#f7e9d2' },
    pitfall: { stroke: '#b5533c', fill: '#f6e0d8' },
    tag1:    { stroke: '#5b5f97', fill: 'none' },
    tag2:    { stroke: '#5b5f97', fill: 'none' },
    tag3:    { stroke: '#5b5f97', fill: 'none' },
  };

  function paintAll() {
    document.querySelectorAll('[data-sketch]').forEach(function (el) {
      var key = el.getAttribute('data-sketch');
      var p = palette[key] || { stroke: '#2b2a33', fill: 'none' };
      var isTag = key.indexOf('tag') === 0;
      drawFrame(el, {
        stroke: p.stroke,
        fill: p.fill === 'none' ? undefined : p.fill,
        fillStyle: 'hachure',
        roughness: isTag ? 2.2 : 1.5,
        bowing: isTag ? 2.5 : 1.6,
        strokeWidth: isTag ? 1.8 : 2.6,
        margin: isTag ? 3 : 6,
      });
    });

    ['under', 'good', 'over'].forEach(function (kind) {
      var el = document.querySelector('.fit-box[data-fit="' + kind + '"]');
      if (el) drawFitBox(el, kind);
    });

    var ul = document.getElementById('title-underline');
    if (ul) {
      var r = ul.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      ul.width = r.width * dpr;
      ul.height = r.height * dpr;
      var ctx = ul.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var rc = rough.canvas(ul, {});
      rc.line(4, 10, r.width - 4, 10, { roughness: 1.8, bowing: 3, stroke: '#2b2a33', strokeWidth: 3 });
      rc.line(30, 15, r.width - 30, 15, { roughness: 2.4, bowing: 4, stroke: '#5b5f97', strokeWidth: 2 });
    }

    var dd = document.getElementById('doodle');
    if (dd) {
      var dr = dd.getBoundingClientRect();
      var dpr2 = window.devicePixelRatio || 1;
      dd.width = dr.width * dpr2;
      dd.height = dr.height * dpr2;
      var dctx = dd.getContext('2d');
      dctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
      var rc2 = rough.canvas(dd, {});
      rc2.line(8, 62, 84, 62, { roughness: 1.4, stroke: '#8a8570', strokeWidth: 1.5 });
      rc2.line(8, 62, 8, 8, { roughness: 1.4, stroke: '#8a8570', strokeWidth: 1.5 });
      var pts = [[16,50],[28,44],[34,50],[44,34],[52,38],[60,24],[70,20],[76,14]];
      pts.forEach(function (pt) {
        rc2.circle(pt[0], pt[1], 5, { roughness: 2, fill: '#5b5f97', fillStyle: 'solid', stroke: '#2b2a33', strokeWidth: 1 });
      });
      rc2.line(14, 54, 80, 12, { roughness: 1.6, bowing: 2, stroke: '#2f8f7a', strokeWidth: 2.5 });
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(paintAll, 30);
  } else {
    window.addEventListener('load', function () { setTimeout(paintAll, 30); });
  }
  window.addEventListener('resize', function () {
    clearTimeout(window.__rsz);
    window.__rsz = setTimeout(paintAll, 150);
  });
})();
</script>
</body>
</html>
```

- [ ] **Step 2: 建立渲染腳本 `scripts/render-overfitting-underfitting-bias-variance-infographic.ps1`**

```powershell
# Render Overfitting/Underfitting & Bias-Variance Tradeoff Infographic HTML to PNG
$htmlPath = "C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/overfitting-underfitting-bias-variance-summary.html"
$outputPath = "C:/Users/User/Desktop/Machine Learning Study/src/assets/chapters/overfitting-underfitting-bias-variance-summary.png"

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
& $edgePath --headless --disable-gpu --screenshot="$outputPath" --window-size=794,1300 --force-device-scale-factor=3 "file:///$htmlPath"

if (Test-Path $outputPath) {
    Write-Host "Rendering completed successfully!"
} else {
    Write-Error "Rendering failed. PNG was not created."
}
```

若本任務在獨立 worktree 內執行：此腳本的路徑固定指向**主倉庫 checkout**（不含 `.claude/worktrees/...` 片段），比照既有渲染腳本的慣例。在 worktree 內實際執行渲染時，須用「複製資產（含 HTML 與已存在的 `rough-engine.js`）到主 checkout 對應路徑渲染、複製輸出 PNG 回 worktree、清除主 checkout 暫存檔」的可逆方式（`docs/handover.md` 已記錄此做法），確認主 checkout 事後 `git status --short` 乾淨。

- [ ] **Step 3: 首次渲染，並校正視窗高度與標題底線寬度**

Run: `powershell -File scripts/render-overfitting-underfitting-bias-variance-infographic.ps1`

用 Read 工具開啟 `src/assets/chapters/overfitting-underfitting-bias-variance-summary.png` 檢查：
1. **標題底線**：底線是否完整涵蓋「過擬合/欠擬合與偏差-變異數權衡」全部文字，而非只蓋住中段（若像刪除線，需加寬 `.title-underline` 的 `width`，目前初始值 660px 僅為估算，需視實際渲染結果調整）。
2. **是否有捲軸殘留痕跡**（視窗高度設太小）或**留白過多**（視窗高度設太大）。
3. **「診斷與應對」卡的三格對比視覺**：欠擬合格子應顯示一條明顯偏離多數點的直線；很適合格子應顯示一條平滑貼近點群趨勢但不逐點相交的曲線；過擬合格子應顯示一條逐點折繞、明顯扭曲鋸齒的曲線。三格文字標籤（欠擬合／很適合／過擬合）需清楚可讀、無裁切。

若視窗高度需校正，優先用 DOM 量測法（暫存複本注入量測腳本，`window.onload` 後讀取 `.page` 元素 `getBoundingClientRect().height` 寫入 `document.title`，用無頭 Edge `--dump-dom` 讀出，**務必加上與正式渲染相同的 `--force-device-scale-factor=3` 旗標**）：

```bash
sed 's#</body>#<script>window.addEventListener("load",function(){setTimeout(function(){document.title="HEIGHT:"+document.getElementById("page").getBoundingClientRect().height;},200);});</script></body>#' "docs/specs/assets-src/overfitting-underfitting-bias-variance-summary.html" > "docs/specs/assets-src/.overfitting-underfitting-bias-variance-measure.html"
```

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=2000 --force-device-scale-factor=3 --dump-dom --window-size=794,3000 "file:///C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/.overfitting-underfitting-bias-variance-measure.html" 2>$null | Select-String -Pattern "HEIGHT:" | Select-Object -First 1
```

若量測結果出現任何自相矛盾的訊號，不可直接採信盲目重跑，改用替代驗證法：直接對渲染輸出 PNG 做像素分析（掃描紙張色 `#f3efe2` 與外框背景色 `#d8d2bd` 的交界列、檢查右側邊緣有無捲軸色）＋二分搜尋候選視窗高度。

刪除暫存檔，將定案的高度填入渲染腳本的 `--window-size=794,<高度>`，若標題底線寬度需調整則同步修改 HTML 原始檔的 `.title-underline` `width` 值，重新執行渲染腳本，再次用 Read 檢查畫面乾淨無捲軸殘留、無過多留白、標題底線完整涵蓋標題。

- [ ] **Step 4: 將學習摘要圖表接入章節 frontmatter**

在 `src/content/chapters/overfitting-underfitting-bias-variance.md` 中：

```markdown
<!-- frontmatter 修改前 -->
---
title: 過擬合/欠擬合與偏差-變異數權衡
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: overfitting-underfitting-comparison
---

<!-- frontmatter 修改後 -->
---
title: 過擬合/欠擬合與偏差-變異數權衡
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: overfitting-underfitting-comparison
summary:
  formulas: []
  keyStats: []
  image: ../../assets/chapters/overfitting-underfitting-bias-variance-summary.png
---
```

- [ ] **Step 5: 驗證型別檢查與建置**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，8 個頁面正常產出，`overfitting-underfitting-bias-variance-summary.png` 出現在「generating optimized images」清單中

- [ ] **Step 6: Commit**

```bash
git add docs/specs/assets-src/overfitting-underfitting-bias-variance-summary.html scripts/render-overfitting-underfitting-bias-variance-infographic.ps1 src/assets/chapters/overfitting-underfitting-bias-variance-summary.png src/content/chapters/overfitting-underfitting-bias-variance.md
git commit -m "$(cat <<'EOF'
Add Overfitting/Underfitting & Bias-Variance summary infographic and wire into chapter frontmatter

Excalidraw-style infographic with 4 panels (intro / three-panel
underfit-goodfit-overfit curve comparison + Bias-Variance formula /
applicability & limits / pitfalls), conceptual only (no computed
numbers) — the interactive component covers live RMSE values
separately.
EOF
)"
```

---

### Task 5: 全站最終驗證

**Files:**
- 無新增/修改檔案（純驗證任務）

**Interfaces:**
- Consumes: Task 1-4 的全部變更
- Produces: 無

- [ ] **Step 1: 執行完整測試套件**

Run: `npm run test`
Expected: 全數測試通過

- [ ] **Step 2: 型別檢查**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

- [ ] **Step 3: 全站建置**

Run: `npm run build`
Expected: 建置成功，8 個頁面正常產出

- [ ] **Step 4: 啟動本機預覽伺服器**

Run: `npm run preview`（背景執行）

- [ ] **Step 5: 瀏覽器實測「過擬合/欠擬合與偏差-變異數權衡」頁面**

先用 `curl` 預熱頁面與圖片優化端點：

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321/Machine-Learning-Study/chapters/overfitting-underfitting-bias-variance/"
```

再用無頭 Microsoft Edge 對整頁截圖，用 Read 檢查：
- 導覽列／頁首出現「過擬合/欠擬合與偏差-變異數權衡」，且有「資訊圖表」與「互動操作」兩個跳轉連結
- 「簡介」「診斷與應對」「適用情境與限制」「常見誤區」四個文字區塊完整呈現，Bias-Variance 分解公式 KaTeX 正確渲染
- 「學習摘要」區塊正確顯示 Task 4 產出的圖表，含「點擊放大」提示
- 「互動式操作與演示」區塊的雙圖（擬合曲線圖＋誤差曲線圖）與次數白名單按鈕運作正常

- [ ] **Step 6: 瀏覽器實測知識地圖與既有章節無迴歸**

對「機器學習介紹」頁面截圖，確認下方知識地圖清單中「過擬合/欠擬合與偏差-變異數權衡」項目已從「即將推出」變成可點擊連結，且位於「階段二：方法論基礎」區塊內、「訓練/測試切分與交叉驗證」之後（階段二三個項目皆已建置完成）。

對「CRISP-DM 資料分析方法」「特徵工程與標準化」「訓練/測試切分與交叉驗證」「簡單線性回歸」「多元線性回歸」頁面各截圖一次，確認：
- 既有內容與圖表無迴歸
- 導覽列的章節順序正確反映新鏈：機器學習介紹 → CRISP-DM → 特徵工程與標準化 → 訓練/測試切分與交叉驗證 → 過擬合/欠擬合與偏差-變異數權衡 → 簡單線性回歸 → 多元線性回歸（尤其「簡單線性回歸」頁面前一項應為「過擬合/欠擬合與偏差-變異數權衡」，而非「訓練/測試切分與交叉驗證」）

**注意**：頂部導覽列是可水平捲動的軌道（`overflow-x: auto`），任何寬度的截圖都可能視覺裁切看不到完整清單——驗證章節順序時改用 `curl` 取得頁面原始 HTML、核對 `aria-current="page"` 與各 `<a>` 項目順序，不能只靠截圖判斷。

- [ ] **Step 7: 關閉本機預覽伺服器**

依 `docs/handover.md` 規則：`netstat -ano` 找出監聽該連接埠的 PID，`taskkill //PID <pid> //F` 強制終止，再次 `netstat` 確認無殘留 LISTENING 項目。

- [ ] **Step 8: 確認無殘留未提交變更**

Run: `git status --short`
Expected: 無輸出（所有變更皆已在 Task 1-4 提交）
