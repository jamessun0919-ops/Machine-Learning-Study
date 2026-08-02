# Polynomial Regression（多項式回歸）章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「Polynomial Regression（多項式回歸）」章節，套用既有「九大區塊」演算法類範本，串接進課程知識地圖與章節導覽，作為階段三（監督式學習－迴歸）緊接在 Multiple Linear Regression 之後的章節。

**Architecture:** 新增一個固定資料集函式庫 `positionSalaryData.ts`（職等-薪資經典教學資料集，10 筆，TDD），新的互動式 React 元件 `PolynomialRegressionFit.tsx` 架構比照既有 `RegressionScatter2D.tsx`（單圖、全資料配適、次數白名單按鈕 1-5、顯示 R²/RMSE），最大化重用既有 `regression.ts` 的常態方程式求解器，不做 train/test 切分（樣本數過小）。內文與 curriculum 串接機制、Excalidraw 風格學習摘要資訊圖表皆比照既有九大區塊章節（Multiple Linear Regression）慣例。因為過擬合/欠擬合章節已上線，本次需回頭補上雙向 `relatedTo` 關聯段落。五個任務：(1) 案例資料集函式庫、(2) 互動元件與頁面掛載、(3) 章節內文與課程資料串接（含回補過擬合章節關聯段落與範本指南對照表）、(4) 資訊圖表、(5) 全站最終驗證。

**Tech Stack:** Astro (Content Layer API) + TypeScript + React (`client:only="react"`) + Plotly.js + Markdown frontmatter；資訊圖表沿用 rough.js（`docs/specs/assets-src/rough-engine.js`）+ 無頭 Microsoft Edge 渲染，無新增依賴。

## Global Constraints

- 依已核准設計文件 `docs/superpowers/specs/2026-08-02-polynomial-regression-chapter-design.md`：沿用九大區塊演算法類範本（`chapter_template_guide.md` 第 1 節），**不修改**範本結構本身（第 1、5 節）。
- 案例資料集為**固定常數**（經典職等-薪資教學資料集，10 筆），非隨機生成，確保可重現；本計畫已用 Node 腳本預先驗證過每個次數（1-5）的常態方程式求解與 R²/RMSE 實際數值（詳見 Task 3、4 內的精確數字），實作時**直接抄錄**，不可自行更換資料集數值。
- 互動元件**不做 train/test 切分**（案例資料集僅 10 筆，切分沒有統計意義），內文須明確說明這點，避免學生誤以為所有章節都要切分。
- 次數白名單為 **1／2／3／4／5**（非自由滑桿），預設選中次數 4（該資料集常見的最佳配適次數）。
- `curriculum.ts` 新增 `relatedTo: ['過擬合/欠擬合與偏差-變異數權衡']`，並回頭替**已上線**的 `overfitting-underfitting-bias-variance.md` 補上對應關聯段落（雙向）；`chapter_template_guide.md` 1.1 節核心關聯對照表新增這一列。
- `docs/specs/assets-src/rough-engine.js` 為共用檔案，任何任務都不得刪除或修改。
- `docs/superpowers/plans/2026-07-30-*.md`、`docs/superpowers/specs/2026-07-30-*.md` 等歷史紀錄檔案任何任務都不得修改。
- 多項式特徵建構函式 `polynomialFeatures()` 直接複寫一份精簡版於互動元件內（比照 `RegressionScatter2D.tsx` 把配適邏輯寫在元件內、不額外拆出 lib 檔案並個別測試的既有慣例），不與 `polynomialFit.ts` 共用，不修改該既有檔案。
- 每個涉及程式碼/內容變更的任務改動後必須執行 `npx astro check`（預期 0 錯誤/0 警告）與 `npm run build`（預期成功產出頁面），驗證通過才能進入下一任務。

---

### Task 1: 案例資料集函式庫（TDD）

**Files:**
- Create: `src/lib/positionSalaryData.ts`
- Create: `src/lib/positionSalaryData.test.ts`

**Interfaces:**
- Consumes: 無
- Produces: `PositionSalaryRecord` interface、`positionSalaryData: PositionSalaryRecord[]`，供 Task 2 的 `PolynomialRegressionFit.tsx` 使用

**背景**：經典教學資料集（Position_Salaries，10 筆），職等 1-10、薪資呈指數型成長，職等與薪資之間明顯非線性。

- [ ] **Step 1: 寫失敗測試 `src/lib/positionSalaryData.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { positionSalaryData } from './positionSalaryData';

describe('positionSalaryData', () => {
  it('contains exactly 10 records', () => {
    expect(positionSalaryData).toHaveLength(10);
  });

  it('each record has the expected fields', () => {
    positionSalaryData.forEach((record) => {
      expect(typeof record.position).toBe('string');
      expect(typeof record.level).toBe('number');
      expect(typeof record.salary).toBe('number');
    });
  });

  it('levels run from 1 to 10 in order', () => {
    expect(positionSalaryData.map((r) => r.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('salary increases monotonically with level (non-linear growth, not a straight line)', () => {
    for (let i = 1; i < positionSalaryData.length; i++) {
      expect(positionSalaryData[i].salary).toBeGreaterThan(positionSalaryData[i - 1].salary);
    }
  });

  it('matches the known classic dataset endpoints', () => {
    expect(positionSalaryData[0]).toEqual({ position: 'Business Analyst', level: 1, salary: 45000 });
    expect(positionSalaryData[9]).toEqual({ position: 'CEO', level: 10, salary: 1000000 });
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run src/lib/positionSalaryData.test.ts`
Expected: FAIL（`./positionSalaryData` 模組不存在）

- [ ] **Step 3: 撰寫實作 `src/lib/positionSalaryData.ts`**

```ts
export interface PositionSalaryRecord {
  position: string;
  level: number;
  salary: number;
}

export const positionSalaryData: PositionSalaryRecord[] = [
  { position: 'Business Analyst', level: 1, salary: 45000 },
  { position: 'Junior Consultant', level: 2, salary: 50000 },
  { position: 'Senior Consultant', level: 3, salary: 60000 },
  { position: 'Manager', level: 4, salary: 80000 },
  { position: 'Country Manager', level: 5, salary: 110000 },
  { position: 'Region Manager', level: 6, salary: 150000 },
  { position: 'Partner', level: 7, salary: 200000 },
  { position: 'Senior Partner', level: 8, salary: 300000 },
  { position: 'C-level', level: 9, salary: 500000 },
  { position: 'CEO', level: 10, salary: 1000000 },
];
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run src/lib/positionSalaryData.test.ts`
Expected: PASS（5 個測試全數通過）

- [ ] **Step 5: Commit**

```bash
git add src/lib/positionSalaryData.ts src/lib/positionSalaryData.test.ts
git commit -m "$(cat <<'EOF'
Add Position-Salary dataset for Polynomial Regression chapter

Classic 10-record teaching dataset (职等 1-10 to 薪资) with clear
exponential, non-linear growth — distinct from the 50 Startups dataset
already used by Simple/Multiple Linear Regression, and distinct from
the synthetic sine-curve dataset used by the Overfitting/Underfitting
chapter's demo.
EOF
)"
```

---

### Task 2: 互動元件與頁面掛載

**Files:**
- Create: `src/components/charts/PolynomialRegressionFit.tsx`
- Modify: `src/pages/chapters/[slug].astro`

**Interfaces:**
- Consumes: `positionSalaryData`（Task 1 的 `src/lib/positionSalaryData.ts`）、`fitLinearRegression`/`predict`/`rSquared`/`rmse`（既有 `src/lib/regression.ts`）
- Produces: `PolynomialRegressionFit` 預設匯出的 React 元件；`[slug].astro` 新增 `interactiveComponent === 'polynomial-regression-fit'` 的字面 JSX 渲染分支，供 Task 3 的章節內容透過 frontmatter 觸發顯示

- [ ] **Step 1: 建立互動元件 `src/components/charts/PolynomialRegressionFit.tsx`**

```tsx
import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { positionSalaryData } from '../../lib/positionSalaryData';
import { fitLinearRegression, predict, rSquared, rmse } from '../../lib/regression';

const DEGREE_OPTIONS = [1, 2, 3, 4, 5] as const;
type Degree = (typeof DEGREE_OPTIONS)[number];

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

function polynomialFeatures(x: number, degree: number): number[] {
  const features: number[] = [];
  for (let d = 1; d <= degree; d++) features.push(x ** d);
  return features;
}

const LEVELS = positionSalaryData.map((r) => r.level);
const SALARIES = positionSalaryData.map((r) => r.salary);

const CURVE_SAMPLE_COUNT = 91;
const CURVE_SAMPLE_X: number[] = Array.from(
  { length: CURVE_SAMPLE_COUNT },
  (_, i) => 1 + (9 * i) / (CURVE_SAMPLE_COUNT - 1)
);

function computeForDegree(degree: Degree) {
  const { coefficients } = fitLinearRegression(
    LEVELS.map((x) => polynomialFeatures(x, degree)),
    SALARIES
  );

  const predicted = LEVELS.map((x) => predict(coefficients, polynomialFeatures(x, degree)));
  const r2 = rSquared(SALARIES, predicted);
  const rmseValue = rmse(SALARIES, predicted);
  const curve = CURVE_SAMPLE_X.map((x) => ({
    x,
    y: predict(coefficients, polynomialFeatures(x, degree)),
  }));

  return { curve, r2, rmseValue };
}

export default function PolynomialRegressionFit() {
  const [degree, setDegree] = useState<Degree>(4);
  const { curve, r2, rmseValue } = useMemo(() => computeForDegree(degree), [degree]);

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
              x: LEVELS,
              y: SALARIES,
              marker: { size: 9, color: '#5ee6d0', opacity: 0.85 },
              name: '樣本資料',
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: curve.map((p) => p.x),
              y: curve.map((p) => p.y),
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
            legend: {
              bgcolor: 'rgba(0,0,0,0)',
              x: 0.02,
              y: 0.98,
              itemclick: false,
              itemdoubleclick: false,
            },
            xaxis: { title: '職等（Level）', dtick: 1, ...axisStyle },
            yaxis: { title: '薪資（Salary）', ...axisStyle },
            margin: { l: 70, r: 20, t: 30, b: 50 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '480px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>決定係數 R²</dt>
          <dd>{r2.toFixed(4)}</dd>
        </div>
        <div>
          <dt>均方根誤差 RMSE</dt>
          <dd>{rmseValue.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
```

注意：`className="regression-chart"` 及其子元素類名（`__controls`／`__frame`／`__stats`／`is-active`）沿用 `src/styles/global.css` 既有的通用圖表樣式（`RegressionScatter2D.tsx` 已使用同一套類名），**不需要**新增任何 CSS。曲線取樣範圍固定為職等 1 到 10（資料範圍內插值，非外插），91 個取樣點確保次數 5 的曲線也能平滑顯示。

- [ ] **Step 2: 在 `[slug].astro` 掛載新元件**

在 `src/pages/chapters/[slug].astro` 中：

```astro
<!-- import 區塊修改前 -->
import OverfittingUnderfittingComparison from '../../components/charts/OverfittingUnderfittingComparison';

<!-- import 區塊修改後 -->
import OverfittingUnderfittingComparison from '../../components/charts/OverfittingUnderfittingComparison';
import PolynomialRegressionFit from '../../components/charts/PolynomialRegressionFit';
```

```astro
<!-- 在既有的 overfitting-underfitting-comparison 條件區塊之後新增 -->
    {chapter.data.interactiveComponent === 'polynomial-regression-fit' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        <PolynomialRegressionFit client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">互動圖表載入中……</div>
        </PolynomialRegressionFit>
      </section>
    )}
```

- [ ] **Step 3: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**8 個頁面**正常產出（本任務尚未新增章節內容，頁面數不變）

Run: `npm run test`
Expected: 全數測試通過（含 Task 1 新增的 `positionSalaryData.test.ts`）

注意：本任務尚無章節內容引用 `interactiveComponent: 'polynomial-regression-fit'`，因此無法在瀏覽器實測此元件的實際互動行為——這會在 Task 3（章節內容建立後）第一次驗證。

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/PolynomialRegressionFit.tsx "src/pages/chapters/[slug].astro"
git commit -m "$(cat <<'EOF'
Add Polynomial Regression interactive fit component

Single scatter+curve chart fitting the Position-Salary dataset with a
degree whitelist (1/2/3/4/5, default 4), reusing regression.ts's
normal-equation solver — same pattern as RegressionScatter2D.tsx, no
train/test split since the case dataset only has 10 points. Not yet
reachable from any chapter page — wired up in the next task.
EOF
)"
```

---

### Task 3: 章節內文與課程資料串接（含回補過擬合章節關聯段落）

**Files:**
- Create: `src/content/chapters/polynomial-regression.md`
- Modify: `src/config/curriculum.ts`
- Modify: `src/config/chapters.ts`
- Modify: `src/config/curriculum.test.ts`
- Modify: `src/content/chapters/overfitting-underfitting-bias-variance.md`
- Modify: `docs/specs/chapter_template_guide.md`

**Interfaces:**
- Consumes: Task 2 已將 `polynomial-regression-fit` 字面分支掛載在 `[slug].astro`
- Produces: `polynomial-regression` 章節頁面可透過 `/chapters/polynomial-regression/` 存取（無學習摘要圖表，Task 4 會補上）；`curriculum.ts` 該主題具備 `slug` 與 `relatedTo`；`chapterOrder` 具備完整鏈結供 Task 5 驗證知識地圖與導覽

- [ ] **Step 1: 新增章節內容檔 `src/content/chapters/polynomial-regression.md`**

完整內容：

```markdown
---
title: 多項式回歸
stage: 監督式學習－迴歸
category:
  - 監督式學習
  - 迴歸
interactiveComponent: polynomial-regression-fit
---

## 簡介

多項式回歸（Polynomial Regression）是線性回歸的延伸：透過將特徵轉換為 $x, x^2, \ldots, x^d$ 等高次項，讓模型能夠配適曲線關係，而非僅限直線。核心概念是——雖然預測值是 $x$ 的非線性函數，但對係數 $\beta$ 而言仍是線性組合，因此仍可用最小平方法（常態方程式）求解，不需要新的求解器。

**與過擬合/欠擬合章節的關係**：次數 $d$ 的選擇就是 bias-variance 權衡的具體案例——次數太低欠擬合（配不出曲線的彎曲程度）、次數太高過擬合（曲線在資料點間劇烈擺動、無法類推到新資料）。

## 分類方式

- **學習類型**：監督式學習（Supervised Learning）
- **任務類型**：迴歸（Regression）——預測連續數值，而非類別標籤

## 數學原理

給定單一特徵 $x$ 與次數 $d$，多項式回歸假設目標變數 $y$ 可以表示為：

$$
y = \beta_0 + \beta_1 x + \beta_2 x^2 + \cdots + \beta_d x^d + \varepsilon
$$

把 $x^2, \ldots, x^d$ 視為新的特徵欄位，這個模型對 $x$ 而言是非線性的，但對係數 $\beta_0, \beta_1, \ldots, \beta_d$ 而言仍是線性組合——因此可以直接代入與多元線性回歸相同的常態方程式求解：

$$
\hat{\beta} = (X^\top X)^{-1} X^\top y
$$

其中 $X$ 的每一列是 $[1, x_i, x_i^2, \ldots, x_i^d]$。這也是本章節互動演示背後實際使用的運算方式，與多元線性回歸完全相同，只是所有特徵都來自同一個 $x$ 的不同次方。本章節示範資料集只有 10 筆樣本，互動演示直接對全部資料配適，不做 train/test 切分——樣本數過小時切分沒有統計意義。

## 運用範例

- **職等-薪資預測**：本章節示範資料集（Position Salaries），用職等預測薪資，兩者呈指數型成長關係
- **生長曲線建模**：生物體重／身高隨時間的非線性成長趨勢
- **傳染病初期擴散**：感染人數隨時間的非線性成長趨勢

## 適用情境與限制

**適合使用的情境：**

- 特徵與目標變數在散布圖上呈現明顯曲線（非直線）趨勢
- 仍需要一定可解釋性，但關係不是簡單線性

**限制與假設：**

- **次數選擇是 bias-variance 權衡**：次數太低欠擬合、太高過擬合（詳見上方「與過擬合/欠擬合章節的關係」）
- **外插風險比線性回歸更嚴重**：高次多項式在訓練範圍外會劇烈發散，比線性回歸的外插誤差成長更快
- **本質上仍是線性模型的特例**：對係數而言仍是線性模型，只是特徵做了非線性轉換，不適合特徵與目標間沒有多項式型態關係的資料

## 評估指標

- **R²（決定係數）**：模型解釋了目標變數變異量的比例，範圍 0～1，越接近 1 代表模型解釋力越強
- **RMSE（均方根誤差）**：預測值與實際值誤差的平方平均後開根號，單位與目標變數相同（本範例中單位是「薪資金額」），越小代表預測越準

## 常見誤區

- **只看訓練集 R² 判斷次數好壞**：次數越高，訓練集 R² 幾乎必然越高（甚至趨近 1），但這不代表模型真的更好——呼應過擬合章節「只看訓練誤差判斷模型好壞」的誤區
- **把多項式回歸和非線性模型混為一談**：多項式回歸對係數而言仍是線性模型，只是特徵做了非線性轉換，與決策樹、神經網路等「真正的非線性模型」在數學性質上不同
- **忽略外插風險**：高次多項式曲線在訓練資料範圍外可能劇烈偏離合理範圍，不能拿模型去預測訓練範圍外的職等（例如職等 15）
```

注意：本步驟**故意不加入 `summary` frontmatter 欄位**（學習摘要圖表尚未存在，`content.config.ts` 的 `summary.image` 使用 Astro `image()` schema helper，引用不存在的檔案會導致建置失敗）。`summary` 欄位會在 Task 4 資訊圖表產出後才加入。

- [ ] **Step 2: 在 `curriculum.ts` 為「Polynomial Regression」主題補上 `slug` 與 `relatedTo`**

在 `src/config/curriculum.ts` 中：

```ts
// 修改前
      { name: 'Polynomial Regression（多項式回歸）' },

// 修改後
      {
        name: 'Polynomial Regression（多項式回歸）',
        slug: 'polynomial-regression',
        relatedTo: ['過擬合/欠擬合與偏差-變異數權衡'],
      },
```

- [ ] **Step 3: 在 `chapters.ts` 的 `chapterOrder` 接續新章節**

在 `src/config/chapters.ts` 中：

```ts
// 修改前
  {
    slug: 'multiple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'simple-linear-regression',
  },
];

// 修改後
  {
    slug: 'multiple-linear-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'simple-linear-regression',
    nextSlug: 'polynomial-regression',
  },
  {
    slug: 'polynomial-regression',
    stage: '監督式學習－迴歸',
    prerequisiteSlug: 'multiple-linear-regression',
  },
];
```

- [ ] **Step 4: 更新 `curriculum.test.ts` 既有測試以反映新增的第 8 個已建置章節**

在 `src/config/curriculum.test.ts` 中：

```ts
// 修改前
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

// 修改後
  it('marks exactly the eight currently-built chapters as having a slug', () => {
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
    ]);
  });
```

- [ ] **Step 5: 回補「過擬合/欠擬合與偏差-變異數權衡」章節的關聯段落**

在 `src/content/chapters/overfitting-underfitting-bias-variance.md` 中：

```markdown
<!-- 修改前 -->
## 簡介

過擬合（Overfitting）指模型過度學習了訓練資料中的雜訊與細節，導致在訓練集上表現極佳，卻無法類推到新資料；欠擬合（Underfitting）則相反，模型過於簡單，連訓練資料本身的規律都學不好。兩者的核心都是模型複雜度與泛化能力之間的取捨——這正是機器學習方法論中最基礎、也最貫穿全課程的權衡問題。

## 診斷與應對

<!-- 修改後 -->
## 簡介

過擬合（Overfitting）指模型過度學習了訓練資料中的雜訊與細節，導致在訓練集上表現極佳，卻無法類推到新資料；欠擬合（Underfitting）則相反，模型過於簡單，連訓練資料本身的規律都學不好。兩者的核心都是模型複雜度與泛化能力之間的取捨——這正是機器學習方法論中最基礎、也最貫穿全課程的權衡問題。

**與 Polynomial Regression 的關係**：多項式次數的選擇是 bias-variance 權衡最直觀的具體案例——次數太低欠擬合（配不出資料的彎曲程度），次數太高過擬合（曲線在資料點間劇烈擺動、無法類推到新資料）。

## 診斷與應對
```

- [ ] **Step 6: 更新章節範本指南的核心關聯對照表**

在 `docs/specs/chapter_template_guide.md` 中：

```markdown
<!-- 修改前 -->
   目前 5 組核心關聯對照表（依 `src/config/curriculum.ts` 的 `relatedTo` 定義整理；原概念關聯圖片另有「監督式↔非監督式學習」一組，但那是課程學習典範分類、非 `relatedTo` 邊，已由「機器學習介紹」章節涵蓋，不列入此表、不適用此規則）：

   | 主題 A | 主題 B | 核心關聯 | 狀態 |
   |---|---|---|---|
   | Multiple Linear Regression | Logistic Regression | 迴歸走向分類的橋樑 | A 側已補充；B 側建置時補上 |
   | Decision Tree | Random Forest（Bagging） | Bagging：多顆 Decision Tree 組成 | 待兩側建置 |
   | Decision Tree | Boosting（AdaBoost/GB） | 弱學習器逐步疊加組成 | 待兩側建置 |
   | PCA | K-Means | 常作為分群前的前處理 | 待兩側建置 |
   | KNN | K-Means | 同屬距離基礎方法 | 待兩側建置 |

<!-- 修改後 -->
   目前 6 組核心關聯對照表（依 `src/config/curriculum.ts` 的 `relatedTo` 定義整理；原概念關聯圖片另有「監督式↔非監督式學習」一組，但那是課程學習典範分類、非 `relatedTo` 邊，已由「機器學習介紹」章節涵蓋，不列入此表、不適用此規則）：

   | 主題 A | 主題 B | 核心關聯 | 狀態 |
   |---|---|---|---|
   | Multiple Linear Regression | Logistic Regression | 迴歸走向分類的橋樑 | A 側已補充；B 側建置時補上 |
   | Polynomial Regression | 過擬合/欠擬合與偏差-變異數權衡 | 次數選擇即 bias-variance 權衡 | 兩側已補 |
   | Decision Tree | Random Forest（Bagging） | Bagging：多顆 Decision Tree 組成 | 待兩側建置 |
   | Decision Tree | Boosting（AdaBoost/GB） | 弱學習器逐步疊加組成 | 待兩側建置 |
   | PCA | K-Means | 常作為分群前的前處理 | 待兩側建置 |
   | KNN | K-Means | 同屬距離基礎方法 | 待兩側建置 |
```

- [ ] **Step 7: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**9 個頁面**正常產出（首頁 + 8 章節，包含新的 `/chapters/polynomial-regression/`）

Run: `npm run test`
Expected: 全數測試通過（含 Step 4 更新後的 `curriculum.test.ts`）

- [ ] **Step 8: 瀏覽器實測互動元件（第一次真正可觸發）與關聯段落**

啟動 `npm run preview`（背景執行），用 `curl` 預熱 `/chapters/polynomial-regression/` 與 `/chapters/overfitting-underfitting-bias-variance/` 兩個頁面後，用無頭 Microsoft Edge 截圖確認：
- `polynomial-regression` 頁首跳轉徽章只有「互動操作」，**沒有**「資訊圖表」（因尚未加入 `summary` 欄位）
- 「簡介」（含關聯段落）「分類方式」「數學原理」「運用範例」「適用情境與限制」「評估指標」「常見誤區」七個文字區塊完整呈現，KaTeX 公式正確渲染
- 「互動式操作與演示」區塊正確顯示散佈圖＋預設次數 4 的擬合曲線、R²/RMSE 數值
- `overfitting-underfitting-bias-variance` 頁面的簡介區塊新增的「與 Polynomial Regression 的關係」段落正確顯示，其餘既有內容無回歸

若需驗證按鈕點擊切換次數後的即時互動效果，可參考既有階段使用過的 Chrome DevTools Protocol（CDP，`--remote-debugging-port` + Node `WebSocket` + `Runtime.evaluate` 呼叫 `.click()` + `Page.captureScreenshot`）直接驅動點擊佐證；驗證完成後需額外確認 CDP 驅動用的 Edge 行程也一併關閉。

驗證完成後依 `docs/handover.md` 規則關閉預覽伺服器（`netstat -ano` 找 PID，`taskkill //PID <pid> //F`，再次 `netstat` 確認無殘留）。

- [ ] **Step 9: Commit**

```bash
git add src/content/chapters/polynomial-regression.md src/content/chapters/overfitting-underfitting-bias-variance.md src/config/curriculum.ts src/config/chapters.ts src/config/curriculum.test.ts docs/specs/chapter_template_guide.md
git commit -m "$(cat <<'EOF'
Add Polynomial Regression chapter content and wire into curriculum/navigation

Reuses the nine-block algorithm chapter template. Appended after
multiple-linear-regression in chapterOrder. Backfills a reciprocal
relatedTo paragraph into the already-shipped Overfitting/Underfitting
chapter and records the new relation in the template guide's
cross-chapter table.
EOF
)"
```

---

### Task 4: Excalidraw 風格學習摘要資訊圖表

**Files:**
- Create: `docs/specs/assets-src/polynomial-regression-summary.html`
- Create: `scripts/render-polynomial-regression-infographic.ps1`
- Create: `src/assets/chapters/polynomial-regression-summary.png`（渲染輸出）
- Modify: `src/content/chapters/polynomial-regression.md`

**Interfaces:**
- Consumes: Task 3 已建立 `polynomial-regression.md`（尚無 `summary` 欄位）
- Produces: `polynomial-regression.md` frontmatter 具備完整 `summary`，供 Task 5 驗證頁面「學習摘要」區塊

**案例分析數值（已用 Node 腳本對職等-薪資資料集實際求解常態方程式驗證，非猜測，實作時直接抄錄）：**

| 次數 | R² | RMSE |
|---|---|---|
| 1（線性） | 0.6690 | 163388.74 |
| 2 | 0.9162 | 82212.12 |
| 3 | 0.9812 | 38931.50 |
| **4** | **0.9974** | **14503.23** |
| 5 | 0.9998 | 4047.50 |

次數 4 係數：$\beta_0=184166.67$、$\beta_1=-211002.33$、$\beta_2=94765.44$、$\beta_3=-15463.29$、$\beta_4=890.15$

**標題長度**：本章標題「多項式回歸」共 5 字，短於既有九大區塊範例「多元線性回歸」（6 字，`.title-underline` 寬度 320px、`.doodle` 92×72px）。因為更短，直接沿用 Multiple Linear Regression 資訊圖表相同的 `.title-underline`／`.doodle` 尺寸與座標即可，預期不需加寬，但仍依規則在 Step 3 視覺檢查時主動核對。

- [ ] **Step 1: 建立資訊圖表來源檔 `docs/specs/assets-src/polynomial-regression-summary.html`**

完整內容（直接複製既有 `docs/specs/assets-src/multiple-linear-regression-summary.html` 的 CSS 變數、`.page`/`.card`/`sketch-bg`/`.board` 基礎樣式、標題區 `.doodle`/`.title-underline` 尺寸座標、繪製腳本 `<script>` 區塊**逐字不變**，僅替換以下內容區塊）：

**注意：此 HTML 資產沒有載入 KaTeX，不會渲染 `$...$` 語法**——所有卡片內文須用純文字/Unicode 表示數學符號（比照下方②卡 `.eq` 區塊已經使用的 `β₀`／`⋯`／`ᵈ` 寫法），不可比照 `polynomial-regression.md`（該檔案由 Astro+KaTeX 渲染，`$...$` 才有效）直接複製 LaTeX 語法過來，否則畫面會顯示出原始的 `$`、`\ldots`、`\beta` 字元。

```html
<!-- <head><title> 修改 -->
  <title>多項式回歸 資訊圖表（Excalidraw 風格）</title>

<!-- <header> 修改 -->
  <header class="title-block">
    <canvas class="doodle" id="doodle"></canvas>
    <h1 class="main-title">多項式回歸</h1>
    <div class="subtitle">Polynomial Regression · 監督式學習－迴歸</div>
    <canvas class="title-underline" id="title-underline"></canvas>
  </header>

<!-- ① 簡介卡 修改 -->
  <section class="card intro" data-sketch="intro">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">①</span><h2>簡介</h2></div>
      <div class="card-body">
        多項式回歸是線性回歸的延伸：把特徵轉換為 x, x², …, xᵈ 等高次項，讓模型能配適曲線關係而非僅限直線。雖然預測值是 x 的非線性函數，但對係數 β 而言仍是線性組合，因此仍能用最小平方法求解。
        <div class="tag-row">
          <span class="tag" data-sketch="tag1"><canvas class="sketch-bg"></canvas><span>監督式學習</span></span>
          <span class="tag" data-sketch="tag2"><canvas class="sketch-bg"></canvas><span>迴歸任務</span></span>
          <span class="tag" data-sketch="tag3"><canvas class="sketch-bg"></canvas><span>多項式特徵＋常態方程式</span></span>
        </div>
      </div>
    </div>
  </section>

<!-- ② 模型公式卡 修改 -->
  <section class="card formula" data-sketch="formula">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">②</span><h2>模型公式</h2></div>
      <div class="card-body">
        <div class="formula-block">
          <div class="eq">y &nbsp;=&nbsp; β₀ + β₁x + β₂x² + ⋯ + βdxᵈ + ε</div>
          <div class="eq">β̂ &nbsp;=&nbsp; (Xᵀ X)⁻¹ Xᵀ y</div>
        </div>
        對 x 而言是非線性曲線，但對係數 β₀ … βᵈ 而言仍是線性組合——所以能直接沿用多元線性回歸的常態方程式求解，把 x² … xᵈ 當成新特徵欄位即可。
      </div>
    </div>
  </section>

<!-- ③ 適用情境卡 修改 -->
  <section class="card scope" data-sketch="scope">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">③</span><h2>適用情境與假設限制</h2></div>
      <div class="card-body two-col scope-cols">
        <div>
          <h3 class="good">✓ 適合使用的情境</h3>
          <ul>
            <li>特徵與目標在散布圖上呈現明顯曲線（非直線）趨勢</li>
            <li>仍需要一定可解釋性，但關係不是簡單線性</li>
          </ul>
        </div>
        <div>
          <h3 class="bad">⚠ 假設與限制</h3>
          <ul>
            <li>次數選擇＝bias-variance 權衡：太低欠擬合、太高過擬合</li>
            <li>外插風險比線性回歸更嚴重，訓練範圍外會劇烈發散</li>
            <li>本質仍是線性模型的特例，只是特徵做了非線性轉換</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

<!-- ④ 評估指標卡 修改（沿用 MLR 相同的 R²/RMSE 公式方塊，文字不變） -->

<!-- ⑤ 常見誤區卡 修改 -->
  <section class="card pitfall" data-sketch="pitfall">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">⑤</span><h2>常見誤區</h2></div>
      <div class="card-body">
        <ul>
          <li><b>只看訓練集 R² 判斷次數好壞</b>——次數越高，訓練集 R² 幾乎必然越高，但不代表模型真的更好。</li>
          <li><b>把多項式回歸和非線性模型混為一談</b>——它對係數而言仍是線性模型，與決策樹、神經網路等真正的非線性模型不同。</li>
          <li><b>忽略外插風險</b>——高次多項式曲線在訓練範圍外可能劇烈偏離合理範圍，不能拿模型預測範圍外的職等。</li>
        </ul>
      </div>
    </div>
  </section>

<!-- 案例分析（board）修改 -->
  <section class="board" data-sketch="board">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <h2>案例分析：Position Salaries（職等-薪資資料集）</h2>
      <div class="board-sub">用職等（Level）預測薪資（Salary），示範次數 4 的多項式配適</div>

      <div class="metabar">
        <div class="meta-item"><div class="label">資料集</div><div class="value">Position Salaries</div></div>
        <div class="meta-item"><div class="label">樣本數</div><div class="value">10</div></div>
        <div class="meta-item"><div class="label">特徵</div><div class="value">職等（Level）</div></div>
        <div class="meta-item"><div class="label">目標變數</div><div class="value">Salary</div></div>
        <div class="meta-item"><div class="label">求解方式</div><div class="value">常態方程式（次數 4）</div></div>
      </div>

      <div class="board-grid">
        <div>
          <table class="coef-table">
            <thead>
              <tr><th>係數</th><th>估計值</th></tr>
            </thead>
            <tbody>
              <tr><td>截距 β₀</td><td>184166.67</td></tr>
              <tr><td>x¹ β₁</td><td>-211002.33</td></tr>
              <tr><td>x² β₂</td><td>94765.44</td></tr>
              <tr><td>x³ β₃</td><td>-15463.29</td></tr>
              <tr><td>x⁴ β₄</td><td>890.15</td></tr>
            </tbody>
          </table>
          <div class="big-stats">
            <div class="big-stat"><div class="label">R²（決定係數）</div><div class="value">0.9974</div></div>
            <div class="big-stat"><div class="label">RMSE（均方根誤差）</div><div class="value">14503.23</div></div>
          </div>
        </div>
        <ul class="insight-list">
          <li>次數 1（線性）R² 僅 <span class="hl">0.6690</span>，明顯配不出職等與薪資之間的指數型成長曲線。</li>
          <li>次數 4 大幅改善配適，R² 達 <span class="hl">0.9974</span>，RMSE 從線性的約 16.3 萬大幅降至約 1.45 萬。</li>
          <li>次數 5 R² 更高達 <span class="hl">0.9998</span>，但在僅 10 筆資料下已有過擬合風險——呼應過擬合/欠擬合章節的權衡概念。</li>
          <li>本結果為全樣本配適（非留出測試集），因樣本數過小不適合切分。</li>
        </ul>
      </div>
    </div>
  </section>
```

其餘 `<style>`、`<script src="rough-engine.js">`、繪製邏輯 `<script>` 區塊（含 `palette` 對照表：`intro`/`formula`/`scope`/`metric`/`pitfall`/`board`/`tag1`/`tag2`/`tag3`/`m1`/`m2`）**逐字複製自** `multiple-linear-regression-summary.html`，不需修改（配色鍵名與本檔案的 `data-sketch` 屬性值一一對應，卡片結構完全相同）。

- [ ] **Step 2: 建立渲染腳本 `scripts/render-polynomial-regression-infographic.ps1`**

```powershell
# Render Polynomial Regression Infographic HTML to PNG
$htmlPath = "C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/polynomial-regression-summary.html"
$outputPath = "C:/Users/User/Desktop/Machine Learning Study/src/assets/chapters/polynomial-regression-summary.png"

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

視窗高度 1960 為起始猜測值（與內容區塊數完全相同的 `multiple-linear-regression-summary.html` 相同設定），Step 3 須實際渲染後依 DOM 量測法（`--dump-dom` 加 `--force-device-scale-factor` 旗標）驗證是否需要調整，不可預設一定準確。

- [ ] **Step 3: 執行渲染腳本並視覺檢查**

Run: `pwsh scripts/render-polynomial-regression-infographic.ps1`（或依環境使用對應 PowerShell 呼叫方式）
Expected: `src/assets/chapters/polynomial-regression-summary.png` 產生

檢查項目：
- 六個視覺區塊（簡介／模型公式／適用情境／評估指標／常見誤區／案例分析）皆完整顯示，無捲軸裁切
- 標題「多項式回歸」的 `.title-underline` 完整涵蓋標題文字（非「刪除線」效果），`.doodle` 裝飾未與標題文字重疊——依既有規則主動核對，即使預期因標題較短而無問題
- 案例分析區塊的係數表、R²/RMSE 數值與上方表格一致
- 若視窗高度不足導致內容裁切或出現非預期捲軸，依既有校正法（DOM 量測優先，矛盾時改用像素分析＋二分搜尋）調整 `--window-size` 後重新渲染

- [ ] **Step 4: 為章節內容補上 `summary` frontmatter**

在 `src/content/chapters/polynomial-regression.md` 中：

```markdown
<!-- frontmatter 修改前 -->
---
title: 多項式回歸
stage: 監督式學習－迴歸
category:
  - 監督式學習
  - 迴歸
interactiveComponent: polynomial-regression-fit
---

<!-- frontmatter 修改後 -->
---
title: 多項式回歸
stage: 監督式學習－迴歸
category:
  - 監督式學習
  - 迴歸
interactiveComponent: polynomial-regression-fit
summary:
  formulas:
    - "y = \\beta_0 + \\beta_1 x + \\beta_2 x^2 + \\cdots + \\beta_d x^d + \\varepsilon"
    - "\\hat{\\beta} = (X^\\top X)^{-1} X^\\top y"
  keyStats:
    - label: 適用資料型態
      value: 單一特徵、非線性關係
    - label: 常用評估指標
      value: R², RMSE
    - label: 訓練方式
      value: 最小平方法（多項式特徵＋常態方程式）
  image: ../../assets/chapters/polynomial-regression-summary.png
---
```

- [ ] **Step 5: 驗證型別檢查與建置**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，9 個頁面正常產出

- [ ] **Step 6: Commit**

```bash
git add docs/specs/assets-src/polynomial-regression-summary.html scripts/render-polynomial-regression-infographic.ps1 src/assets/chapters/polynomial-regression-summary.png src/content/chapters/polynomial-regression.md
git commit -m "$(cat <<'EOF'
Add Polynomial Regression summary infographic

Excalidraw-style, six visual blocks (nine-block algorithm template):
intro, model formula, scope/assumptions, metrics, pitfalls, and a
case-analysis board for the Position Salaries dataset at degree 4
(R²=0.9974, RMSE=14503.23).
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
Expected: 建置成功，9 個頁面正常產出

- [ ] **Step 4: 啟動本機預覽伺服器**

Run: `npm run preview`（背景執行）

- [ ] **Step 5: 瀏覽器實測「多項式回歸」頁面**

先用 `curl` 預熱頁面與圖片優化端點：

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321/Machine-Learning-Study/chapters/polynomial-regression/"
```

再用無頭 Microsoft Edge 對整頁截圖，用 Read 檢查：
- 導覽列／頁首出現「多項式回歸」，且有「資訊圖表」與「互動操作」兩個跳轉連結
- 九大區塊全部正確渲染，KaTeX 公式（含「簡介」段落的關聯句、「數學原理」的兩條公式）無渲染錯誤紅字
- 「學習摘要」區塊正確顯示 Task 4 產出的圖表，含「點擊放大」提示
- 「互動式操作與演示」區塊的散佈圖＋擬合曲線與次數白名單按鈕（1/2/3/4/5）運作正常，預設選中次數 4

- [ ] **Step 6: 瀏覽器實測知識地圖、過擬合章節關聯段落與既有章節無迴歸**

對「機器學習介紹」頁面截圖，確認下方知識地圖清單中「Polynomial Regression（多項式回歸）」項目已從「即將推出」變成可點擊連結，且位於「階段三：監督式學習－迴歸」區塊內、Multiple Linear Regression 之後。

對「過擬合/欠擬合與偏差-變異數權衡」頁面截圖，確認簡介區塊新增的「與 Polynomial Regression 的關係」段落正確顯示，其餘既有內容（診斷與應對、適用情境與限制、常見誤區、互動元件）無回歸。

對「CRISP-DM 資料分析方法」「特徵工程與標準化」「訓練/測試切分與交叉驗證」「簡單線性回歸」「多元線性回歸」頁面各截圖一次，確認既有內容與圖表無迴歸。

用 `curl` 取得任一頁面原始 HTML，核對 `aria-current="page"` 與各 `<a>` 項目順序，確認導覽列章節順序正確反映新鏈：機器學習介紹 → CRISP-DM → 特徵工程與標準化 → 訓練/測試切分與交叉驗證 → 過擬合/欠擬合與偏差-變異數權衡 → 簡單線性回歸 → 多元線性回歸 → 多項式回歸。

**注意**：頂部導覽列是可水平捲動的軌道（`overflow-x: auto`），任何寬度的截圖都可能視覺裁切看不到完整清單——驗證章節順序時改用 `curl` 取得頁面原始 HTML，不能只靠截圖判斷。

- [ ] **Step 7: 關閉本機預覽伺服器**

依 `docs/handover.md` 規則：`netstat -ano` 找出監聽該連接埠的 PID，`taskkill //PID <pid> //F` 強制終止，再次 `netstat` 確認無殘留 LISTENING 項目。

- [ ] **Step 8: 確認無殘留未提交變更**

Run: `git status --short`
Expected: 無輸出（所有變更皆已在 Task 1-4 提交）
