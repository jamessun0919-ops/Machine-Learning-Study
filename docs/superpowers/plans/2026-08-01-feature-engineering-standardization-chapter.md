# 特徵工程與標準化 章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「特徵工程與標準化」章節，作為本站第四種章節範本（技巧/技術類：簡介／常見方法／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示），並串接進課程知識地圖與章節導覽。

**Architecture:** 新增一個純函式函式庫（標準化/縮放的統計計算，TDD）、一個新的互動式 React 元件（橫向點狀圖比較縮放前後效果），與既有三章節相同的內容+curriculum 串接機制，外加 Excalidraw 風格學習摘要資訊圖表。五個任務：(1) 縮放計算函式庫、(2) 互動元件與頁面掛載、(3) 章節內文與課程資料串接（含範本文件同步）、(4) 資訊圖表、(5) 全站最終驗證。

**Tech Stack:** Astro (Content Layer API) + TypeScript + React (`client:only="react"`) + Plotly.js + Markdown frontmatter；資訊圖表沿用 rough.js（`docs/specs/assets-src/rough-engine.js`）+ 無頭 Microsoft Edge 渲染，無新增依賴。

## Global Constraints

- 依已核准設計文件 `docs/superpowers/specs/2026-08-01-feature-engineering-standardization-chapter-design.md`：本章僅涵蓋標準化/縮放（Z-score、Min-Max）與類別變數編碼（One-Hot、Label Encoding）兩類技巧，**不涉及**特徵創造、對數轉換等其他特徵工程主題。
- 章節採用新的「技巧/技術類」6 大區塊範本：簡介／常見方法／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示。**不含**「分類方式」「數學原理」（公式併入「常見方法」）「運用範例」「評估指標」「案例分析」等區塊。
- 資訊圖表為純概念圖表，**不列**實際計算數字（互動元件本身即時計算並顯示真實統計量，屬於互動展示，兩者職責不同、不衝突）。
- Z-score 標準化使用**母體標準差**（population std，除以 n，非 n-1），與 sklearn `StandardScaler` 一致。
- `docs/specs/assets-src/rough-engine.js` 為共用檔案，任何任務都不得刪除或修改。
- 新章節的 `chapterOrder` 插入位置固定在 CRISP-DM 與 Simple Linear Regression 之間：機器學習介紹 → CRISP-DM → **特徵工程與標準化** → 簡單線性回歸 → 多元線性回歸。
- 互動元件比照第 14 階段確立的慣例：關閉 Plotly 內建拖曳縮放（`dragmode: false`），不開放圖表點擊/縮放等額外互動，只保留模式切換按鈕。
- 每個涉及程式碼/內容變更的任務改動後必須執行 `npx astro check`（預期 0 錯誤/0 警告）與 `npm run build`（預期成功產出頁面），驗證通過才能進入下一任務。

---

### Task 1: 縮放計算函式庫（TDD）

**Files:**
- Create: `src/lib/scaling.ts`
- Create: `src/lib/scaling.test.ts`

**Interfaces:**
- Consumes: 無（本任務起點，純函式，不依賴其他任務）
- Produces: `computeStats(values: number[]): { mean: number; std: number; min: number; max: number }`、`zScoreScale(values: number[]): number[]`、`minMaxScale(values: number[]): number[]`，供 Task 2 的 `FeatureScalingComparison.tsx` 使用

- [ ] **Step 1: 寫失敗測試 `src/lib/scaling.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { computeStats, zScoreScale, minMaxScale } from './scaling';

describe('computeStats', () => {
  it('computes mean, population standard deviation, min, and max', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const stats = computeStats(values);
    expect(stats.mean).toBeCloseTo(5, 10);
    expect(stats.std).toBeCloseTo(2, 10);
    expect(stats.min).toBe(2);
    expect(stats.max).toBe(9);
  });
});

describe('zScoreScale', () => {
  it('transforms values using population mean and standard deviation', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const scaled = zScoreScale(values);
    expect(scaled).toEqual([-1.5, -0.5, -0.5, -0.5, 0, 0, 1, 2]);
  });

  it('produces a result with zero mean and unit standard deviation', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const { mean, std } = computeStats(zScoreScale(values));
    expect(mean).toBeCloseTo(0, 10);
    expect(std).toBeCloseTo(1, 10);
  });
});

describe('minMaxScale', () => {
  it('transforms values into the 0-1 range', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const scaled = minMaxScale(values);
    expect(scaled[0]).toBeCloseTo(0, 10);
    expect(scaled[1]).toBeCloseTo(2 / 7, 10);
    expect(scaled[5]).toBeCloseTo(3 / 7, 10);
    expect(scaled[7]).toBeCloseTo(1, 10);
  });

  it('produces a result with min 0 and max 1', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const { min, max } = computeStats(minMaxScale(values));
    expect(min).toBeCloseTo(0, 10);
    expect(max).toBeCloseTo(1, 10);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run src/lib/scaling.test.ts`
Expected: FAIL（`./scaling` 模組不存在）

- [ ] **Step 3: 撰寫最小實作 `src/lib/scaling.ts`**

```ts
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
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run src/lib/scaling.test.ts`
Expected: PASS（7 個測試全數通過）

- [ ] **Step 5: Commit**

```bash
git add src/lib/scaling.ts src/lib/scaling.test.ts
git commit -m "$(cat <<'EOF'
Add feature scaling calculation library

Pure functions for the Feature Engineering & Standardization chapter's
interactive comparison: population mean/std/min/max, Z-score
standardization, and Min-Max normalization.
EOF
)"
```

---

### Task 2: 互動元件與頁面掛載

**Files:**
- Create: `src/components/charts/FeatureScalingComparison.tsx`
- Modify: `src/pages/chapters/[slug].astro`

**Interfaces:**
- Consumes: `computeStats`/`zScoreScale`/`minMaxScale`（Task 1 的 `src/lib/scaling.ts`）；既有的 `startups`/`fieldLabels`（`src/lib/datasets.ts`，無需修改）
- Produces: `FeatureScalingComparison` 預設匯出的 React 元件；`[slug].astro` 新增 `interactiveComponent === 'feature-scaling-comparison'` 的字面 JSX 渲染分支，供 Task 3 的章節內容透過 frontmatter 觸發顯示

- [ ] **Step 1: 建立互動元件 `src/components/charts/FeatureScalingComparison.tsx`**

```tsx
import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { startups, fieldLabels } from '../../lib/datasets';
import { computeStats, zScoreScale, minMaxScale } from '../../lib/scaling';

type ScalingMode = 'raw' | 'zscore' | 'minmax';

interface ScalingModeOption {
  id: ScalingMode;
  label: string;
  axisTitle: string;
  decimals: number;
}

const scalingModes: ScalingModeOption[] = [
  { id: 'raw', label: '原始值', axisTitle: '金額（美元）', decimals: 2 },
  { id: 'zscore', label: 'Z-score 標準化', axisTitle: 'Z-score', decimals: 4 },
  { id: 'minmax', label: 'Min-Max 縮放', axisTitle: 'Min-Max 縮放值（0–1）', decimals: 4 },
];

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

function scaleValues(mode: ScalingMode, values: number[]): number[] {
  if (mode === 'zscore') return zScoreScale(values);
  if (mode === 'minmax') return minMaxScale(values);
  return values;
}

export default function FeatureScalingComparison() {
  const [modeId, setModeId] = useState<ScalingMode>('raw');
  const mode = scalingModes.find((m) => m.id === modeId)!;

  const rdSpendRaw = useMemo(() => startups.map((row) => row.rdSpend), []);
  const marketingSpendRaw = useMemo(() => startups.map((row) => row.marketingSpend), []);

  const rdSpendScaled = useMemo(
    () => scaleValues(modeId, rdSpendRaw),
    [modeId, rdSpendRaw]
  );
  const marketingSpendScaled = useMemo(
    () => scaleValues(modeId, marketingSpendRaw),
    [modeId, marketingSpendRaw]
  );

  const rdStats = useMemo(() => computeStats(rdSpendScaled), [rdSpendScaled]);
  const marketingStats = useMemo(
    () => computeStats(marketingSpendScaled),
    [marketingSpendScaled]
  );

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {scalingModes.map((m) => (
          <button
            key={m.id}
            type="button"
            className={m.id === modeId ? 'is-active' : ''}
            onClick={() => setModeId(m.id)}
          >
            {m.label}
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
              x: rdSpendScaled,
              y: rdSpendScaled.map(() => fieldLabels.rdSpend),
              marker: { size: 7, color: '#5ee6d0', opacity: 0.7 },
              name: fieldLabels.rdSpend,
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: marketingSpendScaled,
              y: marketingSpendScaled.map(() => fieldLabels.marketingSpend),
              marker: { size: 7, color: '#7c5ee6', opacity: 0.7 },
              name: fieldLabels.marketingSpend,
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
            xaxis: {
              title: mode.axisTitle,
              ...axisStyle,
            },
            yaxis: {
              ...axisStyle,
              automargin: true,
            },
            margin: { l: 140, r: 20, t: 30, b: 50 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '280px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>{fieldLabels.rdSpend} — 平均值</dt>
          <dd>{rdStats.mean.toFixed(mode.decimals)}</dd>
        </div>
        <div>
          <dt>{fieldLabels.rdSpend} — 標準差</dt>
          <dd>{rdStats.std.toFixed(mode.decimals)}</dd>
        </div>
        <div>
          <dt>{fieldLabels.rdSpend} — 範圍</dt>
          <dd>
            {rdStats.min.toFixed(mode.decimals)} ～ {rdStats.max.toFixed(mode.decimals)}
          </dd>
        </div>
        <div>
          <dt>{fieldLabels.marketingSpend} — 平均值</dt>
          <dd>{marketingStats.mean.toFixed(mode.decimals)}</dd>
        </div>
        <div>
          <dt>{fieldLabels.marketingSpend} — 標準差</dt>
          <dd>{marketingStats.std.toFixed(mode.decimals)}</dd>
        </div>
        <div>
          <dt>{fieldLabels.marketingSpend} — 範圍</dt>
          <dd>
            {marketingStats.min.toFixed(mode.decimals)} ～ {marketingStats.max.toFixed(mode.decimals)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
```

注意：`className="regression-chart"` 及其子元素類名（`regression-chart__controls`／`regression-chart__frame`／`regression-chart__stats`）沿用 `src/styles/global.css` 既有的通用圖表樣式（`RegressionScatter2D.tsx`/`RegressionScatter3D.tsx` 已使用），**不需要**新增任何 CSS。

- [ ] **Step 2: 在 `[slug].astro` 掛載新元件**

在 `src/pages/chapters/[slug].astro` 中：

```astro
<!-- import 區塊修改前 -->
import CourseKnowledgeMap from '../../components/CourseKnowledgeMap';

<!-- import 區塊修改後 -->
import CourseKnowledgeMap from '../../components/CourseKnowledgeMap';
import FeatureScalingComparison from '../../components/charts/FeatureScalingComparison';
```

```astro
<!-- 在既有的 course-knowledge-map 條件區塊之後新增 -->
    {chapter.data.interactiveComponent === 'feature-scaling-comparison' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        <FeatureScalingComparison client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">互動圖表載入中……</div>
        </FeatureScalingComparison>
      </section>
    )}
```

- [ ] **Step 3: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**5 個頁面**正常產出（本任務尚未新增章節內容，頁面數不變；本步驟僅確認新元件與 import 不破壞既有建置）

Run: `npm run test`
Expected: 全數測試通過（含 Task 1 新增的 `scaling.test.ts`）

注意：本任務尚無章節內容引用 `interactiveComponent: 'feature-scaling-comparison'`，因此無法在瀏覽器實測此元件的實際互動行為——這會在 Task 3（章節內容建立後）第一次驗證。

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/FeatureScalingComparison.tsx src/pages/chapters/\[slug\].astro
git commit -m "$(cat <<'EOF'
Add feature scaling comparison interactive component

Horizontal dot-strip chart comparing R&D Spend and Marketing Spend
under raw/Z-score/Min-Max scaling, with live-computed statistics.
Not yet reachable from any chapter page — wired up in the next task.
EOF
)"
```

---

### Task 3: 章節內文與課程資料串接（含範本文件同步）

**Files:**
- Create: `src/content/chapters/feature-engineering-standardization.md`
- Modify: `src/config/curriculum.ts`
- Modify: `src/config/chapters.ts`
- Modify: `src/config/curriculum.test.ts`
- Modify: `docs/specs/chapter_template_guide.md`

**Interfaces:**
- Consumes: Task 2 已將 `feature-scaling-comparison` 字面分支掛載在 `[slug].astro`
- Produces: `feature-engineering-standardization` 章節頁面可透過 `/chapters/feature-engineering-standardization/` 存取（無學習摘要圖表，Task 4 會補上）；`curriculum.ts` 該主題具備 `slug`；`chapterOrder` 具備完整鏈結供 Task 5 驗證知識地圖與導覽

- [ ] **Step 1: 新增章節內容檔 `src/content/chapters/feature-engineering-standardization.md`**

完整內容：

```markdown
---
title: 特徵工程與標準化
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: feature-scaling-comparison
---

## 簡介

不同特徵的數值尺度差異，會讓某些機器學習演算法產生偏差判斷。例如「研發支出」（數十萬美元級）與「行銷支出」（數百萬美元級）若直接輸入 KNN 或使用梯度下降訓練的模型，數值範圍較大的行銷支出會不成比例地主導距離計算或梯度更新，即使研發支出對預測更重要。特徵工程（Feature Engineering）泛指所有讓原始資料更適合模型學習的前處理技巧，本章聚焦其中最基礎、最常用的兩類：數值特徵的**標準化/縮放**，以及類別特徵的**編碼**。

## 常見方法

**數值特徵縮放：**

1. **Z-score 標準化**：$z=(x-\mu)/\sigma$，轉換後平均值為 0、標準差為 1，不限定範圍，仍保留離群值的相對位置。
2. **Min-Max 縮放**：$x'=(x-\min)/(\max-\min)$，轉換後固定落在 [0,1] 範圍，但對離群值敏感（一個極端值就能把其餘資料壓縮到很窄的一段）。

**類別變數編碼：**

1. **One-Hot Encoding**：把類別展開成多個 0/1 欄位（例如 State: New York/California/Florida → 3 個獨立欄位），不會誤導模型解讀類別間有大小關係，但類別數多時欄位數會暴增。
2. **Label Encoding**：把類別直接編成整數，欄位精簡，但只適合類別間**本身有順序**的情況，若用在無序類別會讓模型誤以為類別間存在大小/距離關係。

## 適用情境與限制

- **需要標準化的模型**：以「距離」或「梯度」為核心運算的模型（KNN、SVM、梯度下降訓練的迴歸/邏輯斯迴歸、神經網路、K-Means）。
- **不需要標準化的模型**：樹狀模型（Decision Tree、Random Forest、Boosting）以「切分點」而非距離運算，特徵尺度不影響判斷。
- **編碼選擇**：類別本身有序（如教育程度）適合 Label Encoding；類別間無序（如城市、顏色）應用 One-Hot Encoding。

## 常見誤區

- **用整個資料集（含測試集）一起計算標準化參數**：正確做法是只用訓練集算出縮放參數再套用到測試集，否則會造成 Data Leakage、評估結果過度樂觀。
- **對無序類別使用 Label Encoding**：模型會誤讀類別間的大小/距離關係。
- **忘記標準化就套用距離型演算法**：尺度大的特徵會不成比例主導距離計算，且不會報錯，容易被忽略。
```

注意：本步驟**故意不加入 `summary` frontmatter 欄位**（學習摘要圖表尚未存在，`content.config.ts` 的 `summary.image` 使用 Astro `image()` schema helper，引用不存在的檔案會導致建置失敗）。`summary` 欄位會在 Task 4 資訊圖表產出後才加入。

- [ ] **Step 2: 在 `curriculum.ts` 為「特徵工程與標準化」主題補上 `slug`**

在 `src/config/curriculum.ts` 中：

```ts
// 修改前
      { name: '特徵工程與標準化' },

// 修改後
      { name: '特徵工程與標準化', slug: 'feature-engineering-standardization' },
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
    nextSlug: 'simple-linear-regression',
  },
  {
    slug: 'simple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'crisp-dm',
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
    nextSlug: 'simple-linear-regression',
  },
  {
    slug: 'simple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'feature-engineering-standardization',
    nextSlug: 'multiple-linear-regression',
  },
  {
    slug: 'multiple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'simple-linear-regression',
  },
];
```

- [ ] **Step 4: 更新 `curriculum.test.ts` 既有測試以反映新增的第 5 個已建置章節**

在 `src/config/curriculum.test.ts` 中：

```ts
// 修改前
  it('marks exactly the four currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'CRISP-DM 資料分析方法',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
    ]);
  });

// 修改後
  it('marks exactly the five currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'CRISP-DM 資料分析方法',
      '特徵工程與標準化',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
    ]);
  });
```

- [ ] **Step 5: 同步更新 `chapter_template_guide.md`，新增「技巧/技術類」範本說明**

在 `docs/specs/chapter_template_guide.md` 第 1 節，緊接在既有的「**1.2 方法論／流程類章節範本（4 大區塊）**」段落之後（該段落目前結尾於「...不可預設套用。」，其後直接接 `---` 分隔線），插入：

```markdown
**1.3 技巧/技術類章節範本（6 大區塊）**：若該章節是**技巧/技術類**主題（非流程、非需配適評估的演算法，例如特徵工程與標準化），改採此範本：

1. **簡介** (`## 簡介`)——與九大區塊範本相同，跨章節關聯段落規則（1.1 節）同樣適用。
2. **常見方法**（標題依主題定義）——列出該主題下的具體技巧/方法，可包含 KaTeX 公式。
3. **適用情境與限制** (`## 適用情境與限制`)
4. **常見誤區** (`## 常見誤區`)
5. **學習摘要資訊圖表** (`## 學習摘要`)
6. **互動式操作與演示** (`## 互動式操作與演示`)——展示技巧效果的對比，例如轉換前後的數值分佈變化。

不包含「分類方式」「數學原理」（公式併入「常見方法」）「運用範例」「評估指標」「案例分析」等區塊。範例：特徵工程與標準化（設計文件 `docs/superpowers/specs/2026-08-01-feature-engineering-standardization-chapter-design.md`）。此範本可供未來同類技巧/技術主題參考，但個別章節內容仍需與開發者逐一確認，不可預設套用。
```

接著在第 5 節，緊接在既有的「**內容結構——方法論／流程類範本專用（1.2 節）**」條列項目之後（該項目結尾於「...範例：`crisp-dm-summary.png`（`docs/specs/assets-src/crisp-dm-summary.html`）。」）、「**內容優先順序**」項目之前，插入：

```markdown
* **內容結構——技巧/技術類範本專用（1.3 節）**：此類章節無案例分析數據、無單一模型指標，資訊圖表改為 4 個視覺區塊：
  1. **簡介卡**：濃縮自章節簡介段落。
  2. **方法卡**（主視覺）：該主題下具體技巧的公式或方法對比（例如 Z-score／Min-Max 公式並列）。
  3. **適用情境卡**：適合/不適合的模型或情境分類。
  4. **常見誤區卡**：一般淺色卡片，比照其他章節風格，不用深色黑板樣式。
  範例：`feature-engineering-standardization-summary.png`（`docs/specs/assets-src/feature-engineering-standardization-summary.html`）。
```

- [ ] **Step 6: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**6 個頁面**正常產出（首頁 + 5 章節，包含新的 `/chapters/feature-engineering-standardization/`）

Run: `npm run test`
Expected: 全數測試通過（含 Step 4 更新後的 `curriculum.test.ts`）

- [ ] **Step 7: 瀏覽器實測互動元件（第一次真正可觸發）**

啟動 `npm run preview`（背景執行），用 `curl` 預熱 `/chapters/feature-engineering-standardization/` 頁面後，用無頭 Microsoft Edge 截圖確認：
- 頁首跳轉徽章只有「互動操作」，**沒有**「資訊圖表」（因尚未加入 `summary` 欄位）
- 「簡介」「常見方法」（含 Z-score／Min-Max 公式、One-Hot／Label Encoding 說明）「適用情境與限制」「常見誤區」四個區塊文字完整呈現
- 「互動式操作與演示」區塊正確顯示橫向點狀圖，預設「原始值」模式下 R&D Spend 與 Marketing Spend 兩排資料點的數值範圍明顯不同（尺度懸殊）；點擊「Z-score 標準化」「Min-Max 縮放」按鈕後圖表與下方統計量正確更新

驗證完成後依 `docs/handover.md` 規則關閉預覽伺服器（`netstat -ano` 找 PID，`taskkill //PID <pid> //F`，再次 `netstat` 確認無殘留）。

- [ ] **Step 8: Commit**

```bash
git add src/content/chapters/feature-engineering-standardization.md src/config/curriculum.ts src/config/chapters.ts src/config/curriculum.test.ts docs/specs/chapter_template_guide.md
git commit -m "$(cat <<'EOF'
Add Feature Engineering & Standardization chapter content and wire into curriculum/navigation

Establishes the site's fourth chapter template (technique/skill-based:
intro, common methods, applicability, pitfalls, summary infographic,
interactive demo) and documents it in chapter_template_guide.md in the
same commit wave, unlike the CRISP-DM template which left the guide
sync as an unscheduled follow-up.
EOF
)"
```

---

### Task 4: Excalidraw 風格學習摘要資訊圖表

**Files:**
- Create: `docs/specs/assets-src/feature-engineering-standardization-summary.html`
- Create: `scripts/render-feature-engineering-standardization-infographic.ps1`
- Create: `src/assets/chapters/feature-engineering-standardization-summary.png`（渲染輸出）
- Modify: `src/content/chapters/feature-engineering-standardization.md`

**Interfaces:**
- Consumes: Task 3 已建立 `feature-engineering-standardization.md`（尚無 `summary` 欄位）
- Produces: `feature-engineering-standardization.md` frontmatter 具備完整 `summary`，供 Task 5 驗證頁面「學習摘要」區塊

- [ ] **Step 1: 建立資訊圖表來源檔 `docs/specs/assets-src/feature-engineering-standardization-summary.html`**

完整內容（比照既有 `crisp-dm-summary.html` 的 CSS 變數、`.page`/`.card`/`sketch-bg`/`formula-block`/`eq`/`frac`/`two-col` 基礎樣式與繪製腳本結構；4 個視覺區塊，不含黑板案例分析）：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>特徵工程與標準化 資訊圖表（Excalidraw 風格）</title>
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
      font-size: 42px;
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
      top: 54px;
      transform: translateX(-50%);
      width: 320px;
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

    .eq {
      font-family: "Segoe Print", cursive;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .frac {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      vertical-align: middle;
      font-size: 14px;
      margin: 0 4px;
    }
    .frac .num-row, .frac .den-row { padding: 0 4px; white-space: nowrap; }
    .frac .num-row { border-bottom: 2px solid var(--ink); padding-bottom: 2px; }
    .frac .den-row { padding-top: 2px; }

    .method-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 6px;
    }

    .method-box {
      position: relative;
      padding: 10px 14px 12px;
    }
    .method-box h4 {
      margin: 0 0 6px;
      font-size: 14.5px;
      font-family: "Segoe Print", cursive;
      color: var(--formula);
    }
    .method-box p {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--ink-soft);
    }

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
    <h1 class="main-title">特徵工程與標準化</h1>
    <div class="subtitle">Feature Engineering & Standardization · 方法論基礎</div>
    <canvas class="title-underline" id="title-underline"></canvas>
  </header>

  <section class="card intro" data-sketch="intro">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">①</span><h2>簡介</h2></div>
      <div class="card-body">
        不同特徵的數值尺度差異，會讓某些機器學習演算法產生偏差判斷。特徵工程（Feature Engineering）泛指所有讓原始資料更適合模型學習的前處理技巧，本站聚焦其中最基礎、最常用的兩類：數值特徵的標準化/縮放，以及類別特徵的編碼。
        <div class="tag-row">
          <span class="tag" data-sketch="tag1"><canvas class="sketch-bg"></canvas><span>特徵工程</span></span>
          <span class="tag" data-sketch="tag2"><canvas class="sketch-bg"></canvas><span>標準化與縮放</span></span>
          <span class="tag" data-sketch="tag3"><canvas class="sketch-bg"></canvas><span>類別變數編碼</span></span>
        </div>
      </div>
    </div>
  </section>

  <section class="card formula" data-sketch="formula">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">②</span><h2>縮放方法</h2></div>
      <div class="card-body method-grid">
        <div class="method-box" data-sketch="m1">
          <canvas class="sketch-bg"></canvas>
          <div class="card-inner">
            <h4>Z-score 標準化</h4>
            <div class="eq">z &nbsp;=&nbsp; <span class="frac"><span class="num-row">x − μ</span><span class="den-row">σ</span></span></div>
            <p>平均值為 0、標準差為 1，仍保留離群值的相對位置。</p>
          </div>
        </div>
        <div class="method-box" data-sketch="m2">
          <canvas class="sketch-bg"></canvas>
          <div class="card-inner">
            <h4>Min-Max 縮放</h4>
            <div class="eq">x' &nbsp;=&nbsp; <span class="frac"><span class="num-row">x − min</span><span class="den-row">max − min</span></span></div>
            <p>固定落在 [0, 1] 範圍，但對離群值敏感。</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="card scope" data-sketch="scope">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">③</span><h2>適用情境</h2></div>
      <div class="card-body two-col scope-cols">
        <div>
          <h3 class="good">✓ 需要標準化的模型</h3>
          <ul>
            <li>以「距離」為核心運算：KNN、SVM、K-Means</li>
            <li>以「梯度」為核心運算：梯度下降訓練的迴歸/邏輯斯迴歸、神經網路</li>
          </ul>
        </div>
        <div>
          <h3 class="neutral">○ 不需要標準化的模型</h3>
          <ul>
            <li>樹狀模型：Decision Tree、Random Forest、Boosting</li>
            <li>以「切分點」而非距離運算，特徵尺度不影響判斷</li>
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
          <li><b>用整個資料集一起計算標準化參數</b>——正確做法是只用訓練集算出縮放參數再套用到測試集，否則會造成 Data Leakage、評估結果過度樂觀。</li>
          <li><b>對無序類別使用 Label Encoding</b>——模型會誤讀類別間的大小/距離關係。</li>
          <li><b>忘記標準化就套用距離型演算法</b>——尺度大的特徵會不成比例主導距離計算，且不會報錯，容易被忽略。</li>
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

  var palette = {
    intro:   { stroke: '#5b5f97', fill: '#e4e5f3' },
    formula: { stroke: '#2f8f7a', fill: '#dcf0ec' },
    scope:   { stroke: '#c07f2e', fill: '#f7e9d2' },
    pitfall: { stroke: '#b5533c', fill: '#f6e0d8' },
    tag1:    { stroke: '#5b5f97', fill: 'none' },
    tag2:    { stroke: '#5b5f97', fill: 'none' },
    tag3:    { stroke: '#5b5f97', fill: 'none' },
    m1:      { stroke: '#2f8f7a', fill: '#eef7f4' },
    m2:      { stroke: '#3f7ea6', fill: '#eef6fa' },
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

- [ ] **Step 2: 建立渲染腳本 `scripts/render-feature-engineering-standardization-infographic.ps1`**

```powershell
# Render Feature Engineering & Standardization Infographic HTML to PNG
$htmlPath = "C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/feature-engineering-standardization-summary.html"
$outputPath = "C:/Users/User/Desktop/Machine Learning Study/src/assets/chapters/feature-engineering-standardization-summary.png"

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

若本任務在獨立 worktree 內執行：此腳本的路徑固定指向**主倉庫 checkout**（不含 `.claude/worktrees/...` 片段），比照 `render-infographic.ps1`／`render-mlr-infographic.ps1`／`render-crisp-dm-infographic.ps1` 的既有慣例。在 worktree 內實際執行渲染時，須用「複製資產（含 `feature-engineering-standardization-summary.html`）到主 checkout 對應路徑渲染、複製輸出 PNG 回 worktree、清除主 checkout 暫存檔」的可逆方式（`docs/handover.md` 已記錄此做法，第 12、16 階段皆用過），確認主 checkout 事後 `git status --short` 乾淨。

- [ ] **Step 3: 首次渲染，並校正視窗高度**

Run: `powershell -File scripts/render-feature-engineering-standardization-infographic.ps1`

用 Read 工具開啟 `src/assets/chapters/feature-engineering-standardization-summary.png` 檢查：是否有捲軸殘留痕跡（視窗高度設太小）或留白過多（視窗高度設太大）。

若需校正，優先用 DOM 量測法（暫存複本注入量測腳本，`window.onload` 後讀取 `.page` 元素 `getBoundingClientRect().height` 寫入 `document.title`，用無頭 Edge `--dump-dom` 讀出）：

```bash
sed 's#</body>#<script>window.addEventListener("load",function(){setTimeout(function(){document.title="HEIGHT:"+document.getElementById("page").getBoundingClientRect().height;},200);});</script></body>#' "docs/specs/assets-src/feature-engineering-standardization-summary.html" > "docs/specs/assets-src/.feature-engineering-standardization-measure.html"
```

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=2000 --force-device-scale-factor=3 --dump-dom --window-size=794,3000 "file:///C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/.feature-engineering-standardization-measure.html" 2>$null | Select-String -Pattern "HEIGHT:" | Select-Object -First 1
```

**注意**（第 16 階段的教訓）：此量測呼叫務必加上與正式渲染相同的 `--force-device-scale-factor=3` 旗標，否則量測環境與正式渲染環境不一致，量出的數值可能自相矛盾（例如寬度與 CSS 指定值不符）。若量測結果出現任何自相矛盾的訊號，**不可**直接採信盲目重跑，改用替代驗證法：直接對渲染輸出 PNG 做像素分析（掃描紙張色 `#f3efe2` 與外框背景色 `#d8d2bd` 的交界列、檢查右側邊緣有無捲軸色 `(44,44,44)`）＋二分搜尋候選視窗高度，以實際渲染結果而非量測公式作為判斷依據。

刪除暫存檔（`docs/specs/assets-src/.feature-engineering-standardization-measure.html`），將定案的高度填入 `render-feature-engineering-standardization-infographic.ps1` 的 `--window-size=794,<高度>`，重新執行渲染腳本，再次用 Read 檢查畫面乾淨無捲軸殘留、無過多留白。

**版面視覺檢查**：確認「縮放方法」卡內兩個公式子方塊（Z-score／Min-Max）左右並排、公式清晰可讀、無重疊或裁切；「適用情境」卡內兩欄（需要／不需要標準化）左右對齊、文字完整。若有明顯跑版，檢查 CSS Grid（`method-grid`／`two-col`）欄寬是否足夠，調整後重新渲染。

- [ ] **Step 4: 將學習摘要圖表接入章節 frontmatter**

在 `src/content/chapters/feature-engineering-standardization.md` 中：

```markdown
<!-- frontmatter 修改前 -->
---
title: 特徵工程與標準化
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: feature-scaling-comparison
---

<!-- frontmatter 修改後 -->
---
title: 特徵工程與標準化
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: feature-scaling-comparison
summary:
  formulas: []
  keyStats: []
  image: ../../assets/chapters/feature-engineering-standardization-summary.png
---
```

- [ ] **Step 5: 驗證型別檢查與建置**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告（確認 `image()` schema 能正確解析新圖片路徑）

Run: `npm run build`
Expected: 建置成功，6 個頁面正常產出，`feature-engineering-standardization-summary.png` 出現在「generating optimized images」清單中

- [ ] **Step 6: Commit**

```bash
git add docs/specs/assets-src/feature-engineering-standardization-summary.html scripts/render-feature-engineering-standardization-infographic.ps1 src/assets/chapters/feature-engineering-standardization-summary.png src/content/chapters/feature-engineering-standardization.md
git commit -m "$(cat <<'EOF'
Add Feature Engineering & Standardization summary infographic and wire into chapter frontmatter

Excalidraw-style infographic with 4 panels (intro / scaling-method
formula comparison / applicability / pitfalls), conceptual only (no
computed numbers) — the interactive component covers live statistics
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
Expected: 建置成功，6 個頁面正常產出

- [ ] **Step 4: 啟動本機預覽伺服器**

Run: `npm run preview`（背景執行）

- [ ] **Step 5: 瀏覽器實測「特徵工程與標準化」頁面**

先用 `curl` 預熱頁面與圖片優化端點：

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321/Machine-Learning-Study/chapters/feature-engineering-standardization/"
```

再用無頭 Microsoft Edge 對整頁截圖（視窗高度需設定足夠大以完整涵蓋頁面），用 Read 檢查：
- 導覽列／頁首出現「特徵工程與標準化」，且有「資訊圖表」與「互動操作」兩個跳轉連結（因為同時有 `summary` 與 `interactiveComponent`）
- 「簡介」「常見方法」「適用情境與限制」「常見誤區」四個文字區塊完整呈現
- 「學習摘要」區塊正確顯示 Task 4 產出的圖表，含「點擊放大」提示
- 「互動式操作與演示」區塊的橫向點狀圖與模式切換按鈕運作正常（原始值/Z-score/Min-Max 三種模式皆可切換，圖表與統計量隨之更新）

- [ ] **Step 6: 瀏覽器實測知識地圖與既有章節無迴歸**

對「機器學習介紹」頁面截圖，確認下方知識地圖清單中「特徵工程與標準化」項目已從「即將推出」變成可點擊連結，且位於 CRISP-DM 與 Simple Linear Regression 之間的「階段二：方法論基礎」區塊。

對「CRISP-DM 資料分析方法」「簡單線性回歸」「多元線性回歸」頁面各截圖一次，確認：
- 既有內容與圖表無迴歸
- 導覽列的上一頁/下一頁鏈結正確反映新的章節順序（尤其「簡單線性回歸」頁面的「上一步」應指向「特徵工程與標準化」，而非舊有的「CRISP-DM 資料分析方法」）

- [ ] **Step 7: 關閉本機預覽伺服器**

依 `docs/handover.md` 規則：`netstat -ano` 找出監聽該連接埠的 PID，`taskkill //PID <pid> //F` 強制終止，再次 `netstat` 確認無殘留 LISTENING 項目。

- [ ] **Step 8: 確認無殘留未提交變更**

Run: `git status --short`
Expected: 無輸出（所有變更皆已在 Task 1-4 提交）
