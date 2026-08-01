# 訓練/測試切分與交叉驗證 章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「訓練/測試切分與交叉驗證」章節，套用第 17 階段建立的「技巧/技術類」章節範本（簡介／常見方法／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示），並串接進課程知識地圖與章節導覽。

**Architecture:** 新增一個純函式函式庫（固定洗牌排列 + 兩種切分邏輯，TDD）、一個新的互動式 React 元件（橫向點狀圖比較切分前後的樣本分組），與既有章節相同的內容+curriculum 串接機制，外加 Excalidraw 風格學習摘要資訊圖表。五個任務：(1) 資料切分函式庫、(2) 互動元件與頁面掛載、(3) 章節內文與課程資料串接、(4) 資訊圖表、(5) 全站最終驗證。**本次沿用既有範本，不需修改 `chapter_template_guide.md`。**

**Tech Stack:** Astro (Content Layer API) + TypeScript + React (`client:only="react"`) + Plotly.js + Markdown frontmatter；資訊圖表沿用 rough.js（`docs/specs/assets-src/rough-engine.js`）+ 無頭 Microsoft Edge 渲染，無新增依賴。

## Global Constraints

- 依已核准設計文件 `docs/superpowers/specs/2026-08-01-train-test-split-cross-validation-chapter-design.md`：本章僅涵蓋 Train/Test Split 與 k-fold 交叉驗證（固定 k=5），**不涉及** Leave-One-Out、Stratified k-fold 等進階變體。
- 章節沿用「技巧/技術類」6 大區塊範本：簡介／常見方法／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示。**不含**「分類方式」「數學原理」「運用範例」「評估指標」「案例分析」等區塊。
- 資訊圖表為純概念圖表，**不列**實際計算數字。
- 互動元件使用**固定的洗牌排列常數**（非執行期隨機亂數），確保畫面可重現。
- `docs/specs/assets-src/rough-engine.js` 為共用檔案，任何任務都不得刪除或修改。
- **本次不修改 `docs/specs/chapter_template_guide.md`**——範本已於第 17 階段記錄在 1.3 節，本章僅是套用既有範本。
- 新章節的 `chapterOrder` 插入位置固定在「特徵工程與標準化」與「簡單線性回歸」之間：機器學習介紹 → CRISP-DM → 特徵工程與標準化 → **訓練/測試切分與交叉驗證** → 簡單線性回歸 → 多元線性回歸。
- 互動元件比照第 14、17 階段確立的慣例：關閉 Plotly 內建拖曳縮放（`dragmode: false`），不開放圖表點擊/縮放等額外互動，只保留模式/選項切換按鈕。
- 每個涉及程式碼/內容變更的任務改動後必須執行 `npx astro check`（預期 0 錯誤/0 警告）與 `npm run build`（預期成功產出頁面），驗證通過才能進入下一任務。

---

### Task 1: 資料切分函式庫（TDD）

**Files:**
- Create: `src/lib/dataSplit.ts`
- Create: `src/lib/dataSplit.test.ts`

**Interfaces:**
- Consumes: 無（本任務起點，純函式，不依賴其他任務）
- Produces: `SHUFFLED_INDICES: number[]`（50 個索引的固定洗牌排列）、`trainTestSplit(trainRatio: number): { trainIndices: number[]; testIndices: number[] }`、`kFoldSplit(currentFold: number, k?: number): { trainIndices: number[]; validationIndices: number[] }`，供 Task 2 的 `TrainTestSplitComparison.tsx` 使用

- [ ] **Step 1: 寫失敗測試 `src/lib/dataSplit.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { SHUFFLED_INDICES, trainTestSplit, kFoldSplit } from './dataSplit';

describe('SHUFFLED_INDICES', () => {
  it('is a permutation of 0-49 (50 unique indices, no gaps)', () => {
    expect(SHUFFLED_INDICES).toHaveLength(50);
    const sorted = [...SHUFFLED_INDICES].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });
});

describe('trainTestSplit', () => {
  it('splits 50 samples into 35/15 for a 0.7 train ratio', () => {
    const { trainIndices, testIndices } = trainTestSplit(0.7);
    expect(trainIndices).toHaveLength(35);
    expect(testIndices).toHaveLength(15);
  });

  it('splits 50 samples into 40/10 for a 0.8 train ratio', () => {
    const { trainIndices, testIndices } = trainTestSplit(0.8);
    expect(trainIndices).toHaveLength(40);
    expect(testIndices).toHaveLength(10);
  });

  it('splits 50 samples into 45/5 for a 0.9 train ratio', () => {
    const { trainIndices, testIndices } = trainTestSplit(0.9);
    expect(trainIndices).toHaveLength(45);
    expect(testIndices).toHaveLength(5);
  });

  it('covers every index exactly once with no overlap', () => {
    const { trainIndices, testIndices } = trainTestSplit(0.8);
    const combined = [...trainIndices, ...testIndices].sort((a, b) => a - b);
    expect(combined).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });
});

describe('kFoldSplit', () => {
  it('assigns 10 samples to validation and 40 to training for each fold', () => {
    for (let fold = 0; fold < 5; fold++) {
      const { trainIndices, validationIndices } = kFoldSplit(fold);
      expect(validationIndices).toHaveLength(10);
      expect(trainIndices).toHaveLength(40);
    }
  });

  it('every index appears in validation exactly once across all 5 folds', () => {
    const allValidation = [0, 1, 2, 3, 4].flatMap((fold) => kFoldSplit(fold).validationIndices);
    const sorted = [...allValidation].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });

  it('train and validation sets never overlap within a fold', () => {
    const { trainIndices, validationIndices } = kFoldSplit(2);
    const overlap = trainIndices.filter((i) => validationIndices.includes(i));
    expect(overlap).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run src/lib/dataSplit.test.ts`
Expected: FAIL（`./dataSplit` 模組不存在）

- [ ] **Step 3: 撰寫最小實作 `src/lib/dataSplit.ts`**

```ts
// Fixed shuffle of indices 0-49 (an affine permutation, i -> (i*17+7) mod 50),
// so the interactive demo is reproducible across renders instead of using
// runtime randomness, while still visually scattering the assignment.
export const SHUFFLED_INDICES: number[] = [
  7, 24, 41, 8, 25, 42, 9, 26, 43, 10,
  27, 44, 11, 28, 45, 12, 29, 46, 13, 30,
  47, 14, 31, 48, 15, 32, 49, 16, 33, 0,
  17, 34, 1, 18, 35, 2, 19, 36, 3, 20,
  37, 4, 21, 38, 5, 22, 39, 6, 23, 40,
];

export interface SplitResult {
  trainIndices: number[];
  testIndices: number[];
}

export function trainTestSplit(trainRatio: number): SplitResult {
  const trainCount = Math.round(SHUFFLED_INDICES.length * trainRatio);
  return {
    trainIndices: SHUFFLED_INDICES.slice(0, trainCount),
    testIndices: SHUFFLED_INDICES.slice(trainCount),
  };
}

export interface FoldResult {
  trainIndices: number[];
  validationIndices: number[];
}

export function kFoldSplit(currentFold: number, k = 5): FoldResult {
  const foldSize = SHUFFLED_INDICES.length / k;
  const start = currentFold * foldSize;
  const end = start + foldSize;
  const validationIndices = SHUFFLED_INDICES.slice(start, end);
  const trainIndices = [
    ...SHUFFLED_INDICES.slice(0, start),
    ...SHUFFLED_INDICES.slice(end),
  ];
  return { trainIndices, validationIndices };
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run src/lib/dataSplit.test.ts`
Expected: PASS（8 個測試全數通過）

- [ ] **Step 5: Commit**

```bash
git add src/lib/dataSplit.ts src/lib/dataSplit.test.ts
git commit -m "$(cat <<'EOF'
Add data split calculation library

Pure functions for the Train/Test Split & Cross-Validation chapter's
interactive comparison: a fixed reproducible shuffle of 50 sample
indices, train/test ratio splitting, and k-fold assignment.
EOF
)"
```

---

### Task 2: 互動元件與頁面掛載

**Files:**
- Create: `src/components/charts/TrainTestSplitComparison.tsx`
- Modify: `src/pages/chapters/[slug].astro`

**Interfaces:**
- Consumes: `SHUFFLED_INDICES`/`trainTestSplit`/`kFoldSplit`（Task 1 的 `src/lib/dataSplit.ts`）
- Produces: `TrainTestSplitComparison` 預設匯出的 React 元件；`[slug].astro` 新增 `interactiveComponent === 'train-test-split-comparison'` 的字面 JSX 渲染分支，供 Task 3 的章節內容透過 frontmatter 觸發顯示

- [ ] **Step 1: 建立互動元件 `src/components/charts/TrainTestSplitComparison.tsx`**

```tsx
import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { trainTestSplit, kFoldSplit } from '../../lib/dataSplit';

type ViewMode = 'split' | 'kfold';
type SplitRatio = 0.7 | 0.8 | 0.9;

const splitOptions: { ratio: SplitRatio; label: string }[] = [
  { ratio: 0.7, label: '70/30' },
  { ratio: 0.8, label: '80/20' },
  { ratio: 0.9, label: '90/10' },
];

const foldOptions = [0, 1, 2, 3, 4];

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

export default function TrainTestSplitComparison() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitRatio, setSplitRatio] = useState<SplitRatio>(0.8);
  const [currentFold, setCurrentFold] = useState(0);

  const { trainIndices, secondaryIndices, secondaryLabel } = useMemo(() => {
    if (viewMode === 'split') {
      const { trainIndices, testIndices } = trainTestSplit(splitRatio);
      return { trainIndices, secondaryIndices: testIndices, secondaryLabel: '測試集' };
    }
    const { trainIndices, validationIndices } = kFoldSplit(currentFold);
    return {
      trainIndices,
      secondaryIndices: validationIndices,
      secondaryLabel: `驗證集（第 ${currentFold + 1} 折）`,
    };
  }, [viewMode, splitRatio, currentFold]);

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        <button
          type="button"
          className={viewMode === 'split' ? 'is-active' : ''}
          onClick={() => setViewMode('split')}
        >
          Train/Test Split
        </button>
        <button
          type="button"
          className={viewMode === 'kfold' ? 'is-active' : ''}
          onClick={() => setViewMode('kfold')}
        >
          k-fold 交叉驗證
        </button>
      </div>
      {viewMode === 'split' ? (
        <div className="regression-chart__controls">
          {splitOptions.map((opt) => (
            <button
              key={opt.ratio}
              type="button"
              className={opt.ratio === splitRatio ? 'is-active' : ''}
              onClick={() => setSplitRatio(opt.ratio)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="regression-chart__controls">
          {foldOptions.map((fold) => (
            <button
              key={fold}
              type="button"
              className={fold === currentFold ? 'is-active' : ''}
              onClick={() => setCurrentFold(fold)}
            >
              第 {fold + 1} 折
            </button>
          ))}
        </div>
      )}
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto' }}
      >
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: trainIndices,
              y: trainIndices.map(() => '樣本'),
              marker: { size: 8, color: '#5ee6d0', opacity: 0.8 },
              name: '訓練集',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: secondaryIndices,
              y: secondaryIndices.map(() => '樣本'),
              marker: { size: 8, color: '#e6a15e', opacity: 0.9 },
              name: secondaryLabel,
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
              title: '資料編號（洗牌後順序）',
              range: [-1, 50],
              ...axisStyle,
            },
            yaxis: {
              ...axisStyle,
              automargin: true,
            },
            margin: { l: 60, r: 20, t: 30, b: 50 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '200px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>訓練集筆數</dt>
          <dd>{trainIndices.length}</dd>
        </div>
        <div>
          <dt>{secondaryLabel}筆數</dt>
          <dd>{secondaryIndices.length}</dd>
        </div>
      </dl>
    </div>
  );
}
```

注意：`className="regression-chart"` 及其子元素類名沿用 `src/styles/global.css` 既有的通用圖表樣式，**不需要**新增任何 CSS。

- [ ] **Step 2: 在 `[slug].astro` 掛載新元件**

在 `src/pages/chapters/[slug].astro` 中：

```astro
<!-- import 區塊修改前 -->
import FeatureScalingComparison from '../../components/charts/FeatureScalingComparison';

<!-- import 區塊修改後 -->
import FeatureScalingComparison from '../../components/charts/FeatureScalingComparison';
import TrainTestSplitComparison from '../../components/charts/TrainTestSplitComparison';
```

```astro
<!-- 在既有的 feature-scaling-comparison 條件區塊之後新增 -->
    {chapter.data.interactiveComponent === 'train-test-split-comparison' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        <TrainTestSplitComparison client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">互動圖表載入中……</div>
        </TrainTestSplitComparison>
      </section>
    )}
```

- [ ] **Step 3: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**6 個頁面**正常產出（本任務尚未新增章節內容，頁面數不變）

Run: `npm run test`
Expected: 全數測試通過（含 Task 1 新增的 `dataSplit.test.ts`）

注意：本任務尚無章節內容引用 `interactiveComponent: 'train-test-split-comparison'`，因此無法在瀏覽器實測此元件的實際互動行為——這會在 Task 3（章節內容建立後）第一次驗證。

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/TrainTestSplitComparison.tsx src/pages/chapters/\[slug\].astro
git commit -m "$(cat <<'EOF'
Add train/test split comparison interactive component

Horizontal dot-strip chart showing which samples fall into
train/test (3 ratio options) or which fold is held out for
validation (5-fold, one fold selectable at a time). Not yet
reachable from any chapter page — wired up in the next task.
EOF
)"
```

---

### Task 3: 章節內文與課程資料串接

**Files:**
- Create: `src/content/chapters/train-test-split-cross-validation.md`
- Modify: `src/config/curriculum.ts`
- Modify: `src/config/chapters.ts`
- Modify: `src/config/curriculum.test.ts`

**Interfaces:**
- Consumes: Task 2 已將 `train-test-split-comparison` 字面分支掛載在 `[slug].astro`
- Produces: `train-test-split-cross-validation` 章節頁面可透過 `/chapters/train-test-split-cross-validation/` 存取（無學習摘要圖表，Task 4 會補上）；`curriculum.ts` 該主題具備 `slug`；`chapterOrder` 具備完整鏈結供 Task 5 驗證知識地圖與導覽

- [ ] **Step 1: 新增章節內容檔 `src/content/chapters/train-test-split-cross-validation.md`**

完整內容：

```markdown
---
title: 訓練/測試切分與交叉驗證
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: train-test-split-comparison
---

## 簡介

若拿訓練模型時用過的同一批資料來評估模型表現，得到的分數會過度樂觀——模型可能只是「背下」了訓練資料，而非真正學會可類推到新資料的規律。因此在訓練模型之前，必須先把資料切出一部分「留到最後才用」的測試集，只用剩下的訓練集來配適模型，最後才拿測試集檢驗其在未見過資料上的表現。當資料量較小時（例如本站的 50 Startups 僅有 50 筆），單次切分的結果可能因為切法不同而有明顯落差，這時交叉驗證（Cross-Validation）能提供更穩定可靠的評估方式。

## 常見方法

- **Train/Test Split（訓練/測試切分）**：把資料隨機切成兩份不重疊的子集，直接用切好的訓練集配適模型，再用測試集評估一次。常見比例為 70/30、80/20、90/10——訓練集比例越高，模型能學到的資料越多，但用來評估的測試集就越小、評估結果的不確定性也越高。
- **k-fold 交叉驗證（Cross-Validation）**：把資料平均切成 k 份（例如 k=5），輪流讓其中一份當驗證集、其餘 k-1 份當訓練集，總共訓練並驗證 k 次，最後把 k 次的評估結果平均，作為模型表現的最終估計。相較於單次切分，交叉驗證讓每一筆資料都輪流當過訓練與驗證的角色，評估結果較不受「切分方式運氣好壞」影響，尤其適合資料量較小的情況。

## 適用情境與限制

- **Train/Test Split**：資料量夠大、追求快速實驗、運算資源有限（只需訓練一次）時適用。
- **k-fold 交叉驗證**：資料量較小（例如僅 50 筆的 50 Startups）、需要更穩定可靠的評估、能負擔多次訓練運算成本時適用；本站聚焦最常用的 k=5。
- 不論哪種方法，切分前都應先隨機打亂資料，避免原始資料若本身有排序（例如依時間或類別排列）導致訓練/測試集分佈不均。

## 常見誤區

- **用測試集反覆調整模型參數**：測試集只能在所有調參流程結束後、最終評估時使用一次；若在調參過程中反覆查看測試集表現來挑選最佳設定，等於間接把測試集資訊洩漏進模型選擇過程，最終評估結果會過度樂觀。正確做法是另外切出驗證集，或直接用交叉驗證來調參。
- **切分前忘記隨機打亂資料**：未打亂就依序切分，容易讓訓練集與測試集的資料分佈不一致。
- **資料量太小卻只做一次切分**：切一次的結果可能剛好把「難預測」的樣本集中分到某一邊，導致評估結果不穩定，此時應改用交叉驗證。
```

注意：本步驟**故意不加入 `summary` frontmatter 欄位**（學習摘要圖表尚未存在，`content.config.ts` 的 `summary.image` 使用 Astro `image()` schema helper，引用不存在的檔案會導致建置失敗）。`summary` 欄位會在 Task 4 資訊圖表產出後才加入。

- [ ] **Step 2: 在 `curriculum.ts` 為「訓練/測試切分與交叉驗證」主題補上 `slug`**

在 `src/config/curriculum.ts` 中：

```ts
// 修改前
      { name: '訓練/測試切分與交叉驗證' },

// 修改後
      { name: '訓練/測試切分與交叉驗證', slug: 'train-test-split-cross-validation' },
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
```

- [ ] **Step 4: 更新 `curriculum.test.ts` 既有測試以反映新增的第 6 個已建置章節**

在 `src/config/curriculum.test.ts` 中：

```ts
// 修改前
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

// 修改後
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
```

- [ ] **Step 5: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**7 個頁面**正常產出（首頁 + 6 章節，包含新的 `/chapters/train-test-split-cross-validation/`）

Run: `npm run test`
Expected: 全數測試通過（含 Step 4 更新後的 `curriculum.test.ts`）

- [ ] **Step 6: 瀏覽器實測互動元件（第一次真正可觸發）**

啟動 `npm run preview`（背景執行），用 `curl` 預熱 `/chapters/train-test-split-cross-validation/` 頁面後，用無頭 Microsoft Edge 截圖確認：
- 頁首跳轉徽章只有「互動操作」，**沒有**「資訊圖表」（因尚未加入 `summary` 欄位）
- 「簡介」「常見方法」「適用情境與限制」「常見誤區」四個區塊文字完整呈現
- 「互動式操作與演示」區塊正確顯示橫向點狀圖，預設「Train/Test Split」＋「80/20」模式下可見 40 個訓練集點（teal）與 10 個測試集點（橘色）散佈在編號 0-49 的橫軸上（非連續區塊，因為採用固定洗牌排列）

若需驗證按鈕點擊後的即時互動效果（而非僅初始畫面），可參考第 17 階段 Task 3 使用過的 Chrome DevTools Protocol（CDP）點擊驅動方式：啟動帶 `--remote-debugging-port` 的無頭 Edge，透過 WebSocket 呼叫 `Runtime.evaluate` 執行按鈕 `.click()`，再用 `Page.captureScreenshot` 截圖佐證；驗證完成後需額外確認 CDP 驅動用的 Edge 行程（監聽該 debugging port）也一併關閉。

驗證完成後依 `docs/handover.md` 規則關閉預覽伺服器（`netstat -ano` 找 PID，`taskkill //PID <pid> //F`，再次 `netstat` 確認無殘留）。

- [ ] **Step 7: Commit**

```bash
git add src/content/chapters/train-test-split-cross-validation.md src/config/curriculum.ts src/config/chapters.ts src/config/curriculum.test.ts
git commit -m "$(cat <<'EOF'
Add Train/Test Split & Cross-Validation chapter content and wire into curriculum/navigation

Reuses the technique/skill-based chapter template established for
Feature Engineering & Standardization. Inserted mid-chain between
feature-engineering-standardization and simple-linear-regression,
rewiring both neighbors' prerequisite/next links.
EOF
)"
```

---

### Task 4: Excalidraw 風格學習摘要資訊圖表

**Files:**
- Create: `docs/specs/assets-src/train-test-split-cross-validation-summary.html`
- Create: `scripts/render-train-test-split-cross-validation-infographic.ps1`
- Create: `src/assets/chapters/train-test-split-cross-validation-summary.png`（渲染輸出）
- Modify: `src/content/chapters/train-test-split-cross-validation.md`

**Interfaces:**
- Consumes: Task 3 已建立 `train-test-split-cross-validation.md`（尚無 `summary` 欄位）
- Produces: `train-test-split-cross-validation.md` frontmatter 具備完整 `summary`，供 Task 5 驗證頁面「學習摘要」區塊

- [ ] **Step 1: 建立資訊圖表來源檔 `docs/specs/assets-src/train-test-split-cross-validation-summary.html`**

完整內容（比照既有 `feature-engineering-standardization-summary.html` 的 CSS 變數、`.page`/`.card`/`sketch-bg`/`two-col` 基礎樣式與繪製腳本結構；4 個視覺區塊，「常見方法」卡的主視覺為 5 格橫向摺疊示意圖）：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>訓練/測試切分與交叉驗證 資訊圖表（Excalidraw 風格）</title>
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
      font-size: 40px;
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
      top: 52px;
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

    /* ---- k-fold 5 格橫向摺疊示意 ---- */
    .fold-caption {
      font-family: "Segoe UI", sans-serif;
      font-size: 13px;
      color: var(--ink-soft);
      margin: 0 0 4px;
    }
    .fold-strip {
      position: relative;
      display: flex;
      gap: 10px;
      margin: 24px 0 10px;
      padding-top: 22px;
    }
    .fold-strip__canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .fold-box {
      position: relative;
      z-index: 1;
      flex: 1;
      text-align: center;
      padding: 12px 6px;
      border: 2px solid var(--formula);
      border-radius: 8px;
      background: var(--formula-fill);
      font-family: "Segoe UI", sans-serif;
      font-size: 13px;
      color: var(--ink);
    }
    .fold-box.is-current {
      border-color: var(--scope);
      background: var(--scope-fill);
    }
    .fold-box__tag {
      display: block;
      margin-top: 4px;
      font-family: "Segoe Print", cursive;
      font-size: 12px;
      color: var(--scope);
    }
    .fold-note {
      font-family: "Segoe UI", sans-serif;
      font-size: 13.5px;
      color: var(--ink);
      margin: 4px 0 0;
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
    <h1 class="main-title">訓練/測試切分與交叉驗證</h1>
    <div class="subtitle">Train/Test Split &amp; Cross-Validation · 方法論基礎</div>
    <canvas class="title-underline" id="title-underline"></canvas>
  </header>

  <section class="card intro" data-sketch="intro">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">①</span><h2>簡介</h2></div>
      <div class="card-body">
        拿訓練模型時用過的同一批資料來評估表現，得到的分數會過度樂觀。必須先把資料切出「留到最後才用」的測試集，只用剩下的訓練集配適模型；資料量較小時，交叉驗證能提供更穩定可靠的評估方式。
        <div class="tag-row">
          <span class="tag" data-sketch="tag1"><canvas class="sketch-bg"></canvas><span>模型評估</span></span>
          <span class="tag" data-sketch="tag2"><canvas class="sketch-bg"></canvas><span>訓練/測試切分</span></span>
          <span class="tag" data-sketch="tag3"><canvas class="sketch-bg"></canvas><span>k-fold 交叉驗證</span></span>
        </div>
      </div>
    </div>
  </section>

  <section class="card formula" data-sketch="formula">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">②</span><h2>常見方法</h2></div>
      <div class="card-body">
        <p class="fold-caption">k-fold 交叉驗證（k=5）：依序輪流讓其中一折當驗證集，其餘當訓練集</p>
        <div class="fold-strip" id="fold-strip">
          <canvas class="fold-strip__canvas" id="fold-canvas"></canvas>
          <div class="fold-box">第 1 折</div>
          <div class="fold-box">第 2 折</div>
          <div class="fold-box is-current">第 3 折<span class="fold-box__tag">目前驗證</span></div>
          <div class="fold-box">第 4 折</div>
          <div class="fold-box">第 5 折</div>
        </div>
        <p class="fold-note">Train/Test Split：把資料切成兩份不重疊子集，分別作為訓練集與測試集，只評估一次。</p>
      </div>
    </div>
  </section>

  <section class="card scope" data-sketch="scope">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">③</span><h2>適用情境</h2></div>
      <div class="card-body two-col scope-cols">
        <div>
          <h3 class="good">✓ Train/Test Split</h3>
          <ul>
            <li>資料量夠大、追求快速實驗</li>
            <li>運算資源有限，只需訓練一次</li>
          </ul>
        </div>
        <div>
          <h3 class="neutral">○ k-fold 交叉驗證</h3>
          <ul>
            <li>資料量較小，單次切分結果不穩定</li>
            <li>能負擔多次訓練運算成本</li>
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
          <li><b>用測試集反覆調整模型參數</b>——等於間接把測試集資訊洩漏進模型選擇過程，應改用驗證集或交叉驗證來調參。</li>
          <li><b>切分前忘記隨機打亂資料</b>——容易讓訓練集與測試集的資料分佈不一致。</li>
          <li><b>資料量太小卻只做一次切分</b>——評估結果可能因切法運氣而不穩定，應改用交叉驗證。</li>
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

  function drawFoldArrow() {
    var canvas = document.getElementById('fold-canvas');
    var container = document.getElementById('fold-strip');
    if (!canvas || !container) return;
    var rect = container.getBoundingClientRect();
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
    var y = 14;
    var x1 = w * 0.08;
    var x2 = w * 0.92;
    var midY = y - 10;
    rc.curve([[x1, y], [w * 0.5, midY], [x2, y]], {
      roughness: 1.6,
      bowing: 1.4,
      stroke: '#2f8f7a',
      strokeWidth: 2.4,
    });
    var angle = Math.atan2(y - midY, x2 - w * 0.5);
    var headLen = 12;
    var a1 = angle + Math.PI - 0.4;
    var a2 = angle + Math.PI + 0.4;
    rc.line(x2, y, x2 + headLen * Math.cos(a1), y + headLen * Math.sin(a1), {
      roughness: 1.6, stroke: '#2f8f7a', strokeWidth: 2.4,
    });
    rc.line(x2, y, x2 + headLen * Math.cos(a2), y + headLen * Math.sin(a2), {
      roughness: 1.6, stroke: '#2f8f7a', strokeWidth: 2.4,
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

    drawFoldArrow();

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

- [ ] **Step 2: 建立渲染腳本 `scripts/render-train-test-split-cross-validation-infographic.ps1`**

```powershell
# Render Train/Test Split & Cross-Validation Infographic HTML to PNG
$htmlPath = "C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/train-test-split-cross-validation-summary.html"
$outputPath = "C:/Users/User/Desktop/Machine Learning Study/src/assets/chapters/train-test-split-cross-validation-summary.png"

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

若本任務在獨立 worktree 內執行：此腳本的路徑固定指向**主倉庫 checkout**（不含 `.claude/worktrees/...` 片段），比照既有三支渲染腳本的慣例。在 worktree 內實際執行渲染時，須用「複製資產（含 HTML 與已存在的 `rough-engine.js`）到主 checkout 對應路徑渲染、複製輸出 PNG 回 worktree、清除主 checkout 暫存檔」的可逆方式（`docs/handover.md` 已記錄此做法），確認主 checkout 事後 `git status --short` 乾淨。

- [ ] **Step 3: 首次渲染，並校正視窗高度**

Run: `powershell -File scripts/render-train-test-split-cross-validation-infographic.ps1`

用 Read 工具開啟 `src/assets/chapters/train-test-split-cross-validation-summary.png` 檢查：是否有捲軸殘留痕跡（視窗高度設太小）或留白過多（視窗高度設太大）。

若需校正，優先用 DOM 量測法（暫存複本注入量測腳本，`window.onload` 後讀取 `.page` 元素 `getBoundingClientRect().height` 寫入 `document.title`，用無頭 Edge `--dump-dom` 讀出，**務必加上與正式渲染相同的 `--force-device-scale-factor=3` 旗標**——第 16、17 階段皆曾因漏加此旗標導致量測結果自相矛盾）：

```bash
sed 's#</body>#<script>window.addEventListener("load",function(){setTimeout(function(){document.title="HEIGHT:"+document.getElementById("page").getBoundingClientRect().height;},200);});</script></body>#' "docs/specs/assets-src/train-test-split-cross-validation-summary.html" > "docs/specs/assets-src/.train-test-split-cross-validation-measure.html"
```

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=2000 --force-device-scale-factor=3 --dump-dom --window-size=794,3000 "file:///C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/.train-test-split-cross-validation-measure.html" 2>$null | Select-String -Pattern "HEIGHT:" | Select-Object -First 1
```

若量測結果出現任何自相矛盾的訊號（例如量出的寬度與 CSS 指定值 210mm≈794px 不符），不可直接採信盲目重跑，改用替代驗證法：直接對渲染輸出 PNG 做像素分析（掃描紙張色 `#f3efe2` 與外框背景色 `#d8d2bd` 的交界列、檢查右側邊緣有無捲軸色 `(44,44,44)`）＋二分搜尋候選視窗高度。

刪除暫存檔，將定案的高度填入渲染腳本的 `--window-size=794,<高度>`，重新執行渲染腳本，再次用 Read 檢查畫面乾淨無捲軸殘留、無過多留白。

**「常見方法」卡視覺檢查**：確認 5 個「第 N 折」方塊等寬排成一列、第 3 折方塊底色與邊框顏色與其他 4 格不同（標示為目前驗證）、方塊上方有一條平滑弧線箭頭橫跨整排（不與方塊重疊、箭頭清楚指向右側），文字「目前驗證」標籤在第 3 折方塊內清楚可讀、無裁切。若方塊行有明顯跑版或箭頭與方塊重疊，檢查 `.fold-strip` 的 `padding-top` 是否留了足夠空間給箭頭（不涉及座標同步問題，因箭頭是依容器實際寬度動態繪製，非寫死座標）。

- [ ] **Step 4: 將學習摘要圖表接入章節 frontmatter**

在 `src/content/chapters/train-test-split-cross-validation.md` 中：

```markdown
<!-- frontmatter 修改前 -->
---
title: 訓練/測試切分與交叉驗證
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: train-test-split-comparison
---

<!-- frontmatter 修改後 -->
---
title: 訓練/測試切分與交叉驗證
stage: 方法論基礎
category:
  - 方法論基礎
interactiveComponent: train-test-split-comparison
summary:
  formulas: []
  keyStats: []
  image: ../../assets/chapters/train-test-split-cross-validation-summary.png
---
```

- [ ] **Step 5: 驗證型別檢查與建置**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，7 個頁面正常產出，`train-test-split-cross-validation-summary.png` 出現在「generating optimized images」清單中

- [ ] **Step 6: Commit**

```bash
git add docs/specs/assets-src/train-test-split-cross-validation-summary.html scripts/render-train-test-split-cross-validation-infographic.ps1 src/assets/chapters/train-test-split-cross-validation-summary.png src/content/chapters/train-test-split-cross-validation.md
git commit -m "$(cat <<'EOF'
Add Train/Test Split & Cross-Validation summary infographic and wire into chapter frontmatter

Excalidraw-style infographic with 4 panels (intro / 5-fold rotation
strip + train-test-split note / applicability / pitfalls), conceptual
only (no computed numbers) — the interactive component covers live
sample counts separately.
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
Expected: 建置成功，7 個頁面正常產出

- [ ] **Step 4: 啟動本機預覽伺服器**

Run: `npm run preview`（背景執行）

- [ ] **Step 5: 瀏覽器實測「訓練/測試切分與交叉驗證」頁面**

先用 `curl` 預熱頁面與圖片優化端點：

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321/Machine-Learning-Study/chapters/train-test-split-cross-validation/"
```

再用無頭 Microsoft Edge 對整頁截圖，用 Read 檢查：
- 導覽列／頁首出現「訓練/測試切分與交叉驗證」，且有「資訊圖表」與「互動操作」兩個跳轉連結
- 「簡介」「常見方法」「適用情境與限制」「常見誤區」四個文字區塊完整呈現
- 「學習摘要」區塊正確顯示 Task 4 產出的圖表，含「點擊放大」提示
- 「互動式操作與演示」區塊的橫向點狀圖與兩層模式切換按鈕運作正常

- [ ] **Step 6: 瀏覽器實測知識地圖與既有章節無迴歸**

對「機器學習介紹」頁面截圖，確認下方知識地圖清單中「訓練/測試切分與交叉驗證」項目已從「即將推出」變成可點擊連結，且位於「階段二：方法論基礎」區塊內、「特徵工程與標準化」之後。

對「CRISP-DM 資料分析方法」「特徵工程與標準化」「簡單線性回歸」「多元線性回歸」頁面各截圖一次，確認：
- 既有內容與圖表無迴歸
- 導覽列的章節順序正確反映新鏈：機器學習介紹 → CRISP-DM → 特徵工程與標準化 → 訓練/測試切分與交叉驗證 → 簡單線性回歸 → 多元線性回歸（尤其「簡單線性回歸」頁面前一項應為「訓練/測試切分與交叉驗證」，而非「特徵工程與標準化」）

- [ ] **Step 7: 關閉本機預覽伺服器**

依 `docs/handover.md` 規則：`netstat -ano` 找出監聽該連接埠的 PID，`taskkill //PID <pid> //F` 強制終止，再次 `netstat` 確認無殘留 LISTENING 項目。

- [ ] **Step 8: 確認無殘留未提交變更**

Run: `git status --short`
Expected: 無輸出（所有變更皆已在 Task 1-4 提交）
