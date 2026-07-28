# 機器學習學習網站：骨架 + Multiple Linear Regression Pilot 章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Astro 網站骨架（導覽、章節頁面範本、深色科技風主題）並交付一個完整的示範章節（Multiple Linear Regression），驗證整體架構足以支撐後續十幾個章節的填充。

**Architecture:** Astro 靜態網站，內容用 Markdown Content Collections 撰寫，互動圖表用 React island（`client:load`）搭配 Plotly.js 渲染，回歸運算與圖表資料轉換以純函式（TypeScript）實作並用 Vitest 做單元測試，數學公式用 KaTeX（markdown 內用 remark-math/rehype-katex，結構化摘要卡用 katex 套件伺服器端渲染）。全站零後端，部署到 GitHub Pages。

**Tech Stack:** Astro, React, TypeScript, Plotly.js (`react-plotly.js`), KaTeX, Vitest, GitHub Actions (GitHub Pages 部署)

## Global Constraints

- 內容語言：繁體中文單語版（不維護英文版）
- 演算法運算：前端 TypeScript 自行實作，不採用 Python 後端或 Pyodide
- 互動元件：預先設計好的展示，不是自由調參工具；資料集為白名單制，不開放使用者上傳
- 部署目標：GitHub Pages（純靜態），repo 為 `https://github.com/jamessun0919-ops/Machine-Learning-Study`，`main` 分支
- 視覺風格：深色科技風（Dark Tech）；本計畫先實作功能正確的版本，最後一個任務再套用第三方 skill `design-taste-frontend`（已安裝於 `.agents/skills/`）做排版/動效/間距的品味調整
- 章節頁面固定九個區塊：簡介、分類方式、數學原理、運用範例、適用情境與限制、評估指標、常見誤區、學習摘要資訊圖表、互動式操作與演示
- 不做使用者帳號/進度追蹤/測驗小遊戲、不做自由資料上傳或自由調參工具
- 章節排序與跨章節關聯資料（供未來知識地圖使用）需集中在設定檔管理，不寫死在頁面範本

---

## File Structure

```
astro.config.mjs                          — 站台設定、React 整合、KaTeX markdown 外掛、GitHub Pages site/base
src/
  content.config.ts                       — Content Collections schema 定義（chapters collection）
  content/
    chapters/
      multiple-linear-regression.md       — Pilot 章節內容（frontmatter + 9 區塊 markdown 正文）
  data/
    50-startups.json                      — 50 Startups 資料集（靜態打包）
  lib/
    regression.ts                         — OLS 常態方程式、predict、R²、RMSE（純函式，Vitest 測試）
    regressionPlaneData.ts                — 把資料點+係數轉成 Plotly 3D 散布圖/平面所需的資料結構（純函式，Vitest 測試）
    datasets.ts                           — 50 Startups 資料型別、載入、3 組預設特徵組合定義
  config/
    chapters.ts                           — 章節順序、所屬階段、前置/延伸章節中繼資料
  layouts/
    BaseLayout.astro                      — HTML 外殼，載入全域 CSS 與 KaTeX CSS
  components/
    Nav.astro                             — 站台導覽，讀取 config/chapters.ts + content collection
    ChapterSummaryCard.astro              — 學習摘要資訊圖表（簡化版：公式卡 + 關鍵統計數字）
    charts/
      RegressionScatter3D.tsx             — React island：3D 散布圖 + 回歸平面 + 預設特徵組合切換
  pages/
    index.astro                           — 首頁，列出章節清單
    chapters/
      [slug].astro                        — 章節頁面範本，組裝 Content + ChapterSummaryCard + 互動元件
  styles/
    global.css                            — 深色科技風主題變數與基礎樣式
.github/
  workflows/
    deploy.yml                            — GitHub Pages 部署 workflow
```

---

### Task 1: 專案骨架與工具鏈

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`（由 Astro CLI 產生）
- Modify: `astro.config.mjs`（加入 React 整合與 KaTeX markdown 外掛）

**Interfaces:**
- Produces: 可執行的 Astro 專案（`npm run dev` / `npm run build` 可用），已安裝 `react`, `katex`, `remark-math`, `rehype-katex`, `react-plotly.js`, `plotly.js`

此任務純屬 scaffolding，沒有失敗測試可寫；用「dev server 成功啟動並回應」作為驗證。

- [ ] **Step 1: 用 Astro CLI 建立專案**

在專案根目錄（`c:\Users\User\Desktop\Machine Learning Study`，目前已有 `dir.txt`、`CLAUDE.md`、`docs/`、`pic/`、`.git/` 等既有檔案，非空目錄）執行：

```bash
npm create astro@latest . -- --template minimal --install --no-git --typescript strict
```

若 CLI 因非空目錄跳出確認提示，確認繼續（目前的檔案都是文件/設定，不會與 Astro 專案結構衝突）。`--no-git` 是因為這個資料夾已經是既有 git repository，不要讓 CLI 重新 `git init`。

- [ ] **Step 2: 加入 React 整合**

```bash
npx astro add react -y
```

這個指令會自動修改 `astro.config.mjs` 加入 `@astrojs/react` 整合並安裝相依套件。

- [ ] **Step 3: 安裝 KaTeX / markdown 數學公式外掛與圖表套件**

```bash
npm install katex remark-math rehype-katex react-plotly.js plotly.js
npm install -D @types/react-plotly.js
```

- [ ] **Step 4: 設定 astro.config.mjs 加入 KaTeX markdown 外掛**

編輯 `astro.config.mjs`，在既有的 `defineConfig({...})` 中加入 `markdown` 設定（保留 Step 2 自動加入的 `integrations: [react()]`）：

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  integrations: [react()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
```

- [ ] **Step 5: 驗證 dev server 啟動**

```bash
npm run dev
```

Expected: 終端機顯示本地伺服器網址（如 `http://localhost:4321/`），瀏覽器打開後看到 Astro 預設歡迎頁（尚未有我們的內容），無錯誤訊息。確認後按 Ctrl+C 關閉 dev server。

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src
git commit -m "Scaffold Astro project with React and KaTeX markdown support"
```

---

### Task 2: 深色科技風主題與版面骨架

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/config/chapters.ts`
- Create: `src/components/Nav.astro`

**Interfaces:**
- Consumes: 無（第一個站台層元件）
- Produces:
  - `BaseLayout.astro` — Props: `{ title: string }`，提供 `<slot />`
  - `chapterOrder: ChapterMeta[]`，`ChapterMeta = { slug: string; stage: string; prerequisiteSlug?: string; nextSlug?: string }`
  - `Nav.astro` — 無 props，內部讀取 `chapterOrder` 與 content collection

此任務是 CSS/版面，沒有適合的自動化測試；用瀏覽器手動檢查驗證。

- [ ] **Step 1: 建立全域深色科技風樣式**

Create `src/styles/global.css`：

```css
:root {
  --color-bg: #0f1117;
  --color-bg-elevated: #161922;
  --color-border: #262a35;
  --color-text: #e4e6eb;
  --color-text-muted: #8b93a7;
  --color-accent: #5ee6d0;
  --color-accent-secondary: #7c5ee6;
  --font-sans: -apple-system, "Segoe UI", "PingFang TC", "Noto Sans TC", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  line-height: 1.7;
}

a {
  color: var(--color-accent);
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.site-nav__brand {
  font-weight: bold;
  text-decoration: none;
  color: var(--color-text);
}

.site-nav ul {
  display: flex;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.chapter,
.home {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.summary-card {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.summary-card__stats {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  padding: 0;
  margin-top: 1rem;
}

.summary-card__stats li {
  display: flex;
  flex-direction: column;
}

.summary-card__stat-label {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.regression-chart__controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.regression-chart__controls button {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.regression-chart__controls button.is-active {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.regression-chart__stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.chapter-list {
  list-style: none;
  padding: 0;
}

.chapter-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}
```

- [ ] **Step 2: 建立 BaseLayout**

Create `src/layouts/BaseLayout.astro`：

```astro
---
import '../styles/global.css';
import 'katex/dist/katex.min.css';

interface Props {
  title: string;
}
const { title } = Astro.props;
---
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: 建立章節設定檔**

Create `src/config/chapters.ts`：

```typescript
export interface ChapterMeta {
  slug: string;
  stage: string;
  prerequisiteSlug?: string;
  nextSlug?: string;
}

export const chapterOrder: ChapterMeta[] = [
  { slug: 'multiple-linear-regression', stage: '監督式學習－迴歸' },
];
```

（`prerequisiteSlug` / `nextSlug` 目前用不到，先保留欄位，供之後章節增加時建立知識地圖關聯，不需要現在就填值。）

- [ ] **Step 4: 建立 Nav 元件**

Create `src/components/Nav.astro`：

```astro
---
import { getCollection } from 'astro:content';
import { chapterOrder } from '../config/chapters';

const chapters = await getCollection('chapters');
const chapterById = new Map(chapters.map((c) => [c.id, c]));
---
<nav class="site-nav">
  <a class="site-nav__brand" href="/">機器學習互動學習網站</a>
  <ul>
    {chapterOrder.map((meta) => {
      const chapter = chapterById.get(meta.slug);
      if (!chapter) return null;
      return (
        <li>
          <a href={`/chapters/${meta.slug}/`}>{chapter.data.title}</a>
        </li>
      );
    })}
  </ul>
</nav>
```

> **注意**：這裡用 `chapter.id` 來對應 slug。Astro 的 Content Collections API 在新版（Content Layer API，glob loader）用 `id`，舊版（`type: 'content'`）用 `slug`。Task 3 會定義 collection 本身；執行到這一步時，先確認 Task 3 用的是哪種寫法，用同一個欄位名稱（`id` 或 `slug`）保持一致。

- [ ] **Step 5: 手動驗證（此步驟先跳過完整渲染，等 Task 10 有頁面後再實際檢查 Nav 顯示）**

這個 Step 標記為待 Task 10 補充驗證，此處不需要動作，直接進入 commit。

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/config/chapters.ts src/components/Nav.astro
git commit -m "Add dark-tech theme, base layout, and chapter nav shell"
```

---

### Task 3: Content Collection Schema

**Files:**
- Create: `src/content.config.ts`

**Interfaces:**
- Consumes: 無
- Produces: `chapters` collection，每個 entry 的 `data` 型別為：
  ```typescript
  {
    title: string;
    stage: string;
    category: string[];
    interactiveComponent?: string;
    summary: {
      formulas: string[];
      keyStats: { label: string; value: string }[];
    };
  }
  ```
  Content 檔案位置：`src/content/chapters/*.md`

> **版本風險提醒**：以下用的是 Astro Content Layer API（`glob` loader，Astro 5+ 的寫法，設定檔放在 `src/content.config.ts`）。如果 Task 1 安裝到的 Astro 版本行為不同（例如仍是舊版 `type: 'content'` collections，設定檔在 `src/content/config.ts`），請對照當時 `npx astro --version` 顯示的版本號查閱官方 Content Collections 文件調整 loader 語法；下面的 `schema` 欄位定義本身不受影響，可以直接沿用。

- [ ] **Step 1: 建立 content.config.ts**

Create `src/content.config.ts`：

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chapters' }),
  schema: z.object({
    title: z.string(),
    stage: z.string(),
    category: z.array(z.string()),
    interactiveComponent: z.string().optional(),
    summary: z.object({
      formulas: z.array(z.string()),
      keyStats: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ),
    }),
  }),
});

export const collections = { chapters };
```

- [ ] **Step 2: 建立空的 content/chapters 目錄佔位**

```bash
mkdir -p src/content/chapters
```

（此目錄暫時是空的，Task 7 會放入實際章節內容。Astro 在目錄為空時 build 仍可成功，因為 collection 允許零筆資料。）

- [ ] **Step 3: 驗證型別檢查通過**

```bash
npx astro sync
npx astro check
```

Expected: 兩個指令都無錯誤結束（`astro sync` 會產生 `.astro/types.d.ts`，`astro check` 驗證型別）。

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts
git commit -m "Define chapters content collection schema"
```

---

### Task 4: OLS 線性回歸運算（TDD）

**Files:**
- Create: `src/lib/regression.ts`
- Test: `src/lib/regression.test.ts`
- Modify: `package.json`（加入 vitest test script）

**Interfaces:**
- Consumes: 無（純數學函式，無外部相依）
- Produces:
  - `fitLinearRegression(features: number[][], target: number[]): { coefficients: number[] }` — `coefficients[0]` 是截距，之後依序對應每個特徵
  - `predict(coefficients: number[], features: number[]): number`
  - `rSquared(actual: number[], predicted: number[]): number`
  - `rmse(actual: number[], predicted: number[]): number`

- [ ] **Step 1: 安裝 Vitest**

```bash
npm install -D vitest
```

編輯 `package.json`，在 `"scripts"` 裡加入：

```json
"test": "vitest run"
```

- [ ] **Step 2: 寫失敗的測試**

Create `src/lib/regression.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { fitLinearRegression, predict, rSquared, rmse } from './regression';

describe('fitLinearRegression', () => {
  it('recovers exact coefficients for a noiseless linear relationship', () => {
    // y = 1 + 2*x1 + 3*x2, 六個一致的樣本點（過度定義但完全一致，應精確還原係數）
    const features = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
    ];
    const target = [1, 3, 4, 6, 8, 9];

    const { coefficients } = fitLinearRegression(features, target);

    expect(coefficients[0]).toBeCloseTo(1, 5);
    expect(coefficients[1]).toBeCloseTo(2, 5);
    expect(coefficients[2]).toBeCloseTo(3, 5);
  });

  it('throws when features and target lengths mismatch', () => {
    expect(() => fitLinearRegression([[1, 2]], [1, 2])).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => fitLinearRegression([], [])).toThrow();
  });
});

describe('predict', () => {
  it('computes intercept plus weighted sum of features', () => {
    expect(predict([1, 2, 3], [1, 1])).toBeCloseTo(6, 10);
  });
});

describe('rSquared', () => {
  it('returns 1 for a perfect fit', () => {
    const actual = [1, 3, 4, 6, 8, 9];
    expect(rSquared(actual, actual)).toBeCloseTo(1, 10);
  });

  it('returns 0 when predictions equal the mean', () => {
    const actual = [1, 2, 3, 4, 5];
    const predicted = actual.map(() => 3);
    expect(rSquared(actual, predicted)).toBeCloseTo(0, 10);
  });
});

describe('rmse', () => {
  it('returns 0 for a perfect fit', () => {
    const actual = [1, 2, 3];
    expect(rmse(actual, actual)).toBeCloseTo(0, 10);
  });

  it('computes root mean squared error correctly', () => {
    // errors = 3, 4 -> squared = 9, 16 -> mean = 12.5 -> sqrt = 3.5355339
    expect(rmse([0, 0], [3, 4])).toBeCloseTo(3.5355339, 5);
  });
});
```

- [ ] **Step 3: 執行測試，確認失敗**

```bash
npx vitest run src/lib/regression.test.ts
```

Expected: FAIL，因為 `src/lib/regression.ts` 還不存在（`Cannot find module './regression'`）。

- [ ] **Step 4: 實作 regression.ts**

Create `src/lib/regression.ts`：

```typescript
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
```

- [ ] **Step 5: 執行測試，確認通過**

```bash
npx vitest run src/lib/regression.test.ts
```

Expected: 所有測試 PASS。

- [ ] **Step 6: Commit**

```bash
git add package.json src/lib/regression.ts src/lib/regression.test.ts
git commit -m "Add OLS linear regression with normal equation (TDD)"
```

---

### Task 5: 3D 散布圖/回歸平面資料轉換（TDD）

**Files:**
- Create: `src/lib/regressionPlaneData.ts`
- Test: `src/lib/regressionPlaneData.test.ts`

**Interfaces:**
- Consumes: 無直接相依（純函式；輸入的 `coefficients` 型態與 Task 4 的 `fitLinearRegression` 回傳的 `coefficients` 陣列相容，`coefficients = [intercept, b1, b2]`）
- Produces: `buildScatterPlaneData(points, coefficients, gridSize?): ScatterPlaneData`，其中：
  ```typescript
  interface ScatterPlaneData {
    scatter: { x: number[]; y: number[]; z: number[] };
    plane: { x: number[]; y: number[]; z: number[][] };
  }
  ```
  `plane.z` 是 Plotly `surface` trace 需要的二維網格（`z[yIndex][xIndex]`）。

- [ ] **Step 1: 寫失敗的測試**

Create `src/lib/regressionPlaneData.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { buildScatterPlaneData } from './regressionPlaneData';

describe('buildScatterPlaneData', () => {
  const points = [
    { x1: 0, x2: 0, y: 1 },
    { x1: 1, x2: 0, y: 3 },
    { x1: 0, x2: 1, y: 4 },
  ];
  const coefficients = [1, 2, 3]; // y = 1 + 2*x1 + 3*x2

  it('extracts raw scatter coordinates from points', () => {
    const { scatter } = buildScatterPlaneData(points, coefficients);
    expect(scatter.x).toEqual([0, 1, 0]);
    expect(scatter.y).toEqual([0, 0, 1]);
    expect(scatter.z).toEqual([1, 3, 4]);
  });

  it('builds a grid surface where every point satisfies the plane equation', () => {
    const { plane } = buildScatterPlaneData(points, coefficients, 4);
    expect(plane.x).toHaveLength(5);
    expect(plane.y).toHaveLength(5);
    expect(plane.z).toHaveLength(5);
    plane.z.forEach((row, yi) => {
      row.forEach((z, xi) => {
        const expected =
          coefficients[0] +
          coefficients[1] * plane.x[xi] +
          coefficients[2] * plane.y[yi];
        expect(z).toBeCloseTo(expected, 10);
      });
    });
  });
});
```

- [ ] **Step 2: 執行測試，確認失敗**

```bash
npx vitest run src/lib/regressionPlaneData.test.ts
```

Expected: FAIL（`Cannot find module './regressionPlaneData'`）。

- [ ] **Step 3: 實作 regressionPlaneData.ts**

Create `src/lib/regressionPlaneData.ts`：

```typescript
export interface DataPoint {
  x1: number;
  x2: number;
  y: number;
}

export interface ScatterPlaneData {
  scatter: { x: number[]; y: number[]; z: number[] };
  plane: { x: number[]; y: number[]; z: number[][] };
}

export function buildScatterPlaneData(
  points: DataPoint[],
  coefficients: number[],
  gridSize = 10
): ScatterPlaneData {
  const scatter = {
    x: points.map((p) => p.x1),
    y: points.map((p) => p.x2),
    z: points.map((p) => p.y),
  };

  const x1Min = Math.min(...scatter.x);
  const x1Max = Math.max(...scatter.x);
  const x2Min = Math.min(...scatter.y);
  const x2Max = Math.max(...scatter.y);

  const xAxis: number[] = [];
  const yAxis: number[] = [];
  for (let i = 0; i <= gridSize; i++) {
    xAxis.push(x1Min + ((x1Max - x1Min) * i) / gridSize);
    yAxis.push(x2Min + ((x2Max - x2Min) * i) / gridSize);
  }

  const zGrid: number[][] = yAxis.map((x2) =>
    xAxis.map((x1) => coefficients[0] + coefficients[1] * x1 + coefficients[2] * x2)
  );

  return { scatter, plane: { x: xAxis, y: yAxis, z: zGrid } };
}
```

- [ ] **Step 4: 執行測試，確認通過**

```bash
npx vitest run src/lib/regressionPlaneData.test.ts
```

Expected: 所有測試 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/lib/regressionPlaneData.ts src/lib/regressionPlaneData.test.ts
git commit -m "Add scatter/plane data transform for 3D regression chart (TDD)"
```

---

### Task 6: 50 Startups 資料集與特徵組合設定

**Files:**
- Create: `src/data/50-startups.json`
- Create: `src/lib/datasets.ts`
- Test: `src/lib/datasets.test.ts`

**Interfaces:**
- Consumes: 無
- Produces:
  - `startups: StartupRecord[]`，`StartupRecord = { rdSpend: number; administration: number; marketingSpend: number; state: string; profit: number }`
  - `featurePresets: FeaturePreset[]`，`FeaturePreset = { id: string; label: string; xKey: keyof StartupRecord; yKey: keyof StartupRecord; targetKey: keyof StartupRecord }`

這個任務的資料來源是真實世界資料，不是憑空捏造：50 Startups 是機器學習教學圈很知名的公開資料集（50 筆新創公司的 R&D Spend／Administration／Marketing Spend／State／Profit）。因為手動謄寫 50 列數字風險很高（容易謄錯，且開發者提供的參考圖 `pic/CRISPDM.png` 已經用這個資料集算出 R&D Spend 與 Profit 相關係數 ≈0.97、R²=0.8987，我們的資料如果謄錯會對不上這個已知基準），所以這一步要求「查證後取得真實資料」，而不是使用計畫文件裡寫死的數字。

- [ ] **Step 1: 取得真實資料集**

用 WebSearch 搜尋「50 Startups dataset csv machine learning」，找到可信來源（例如 Kaggle 上的 50-startups 資料集頁面、或知名 ML 教學課程 GitHub repo 內的 `50_Startups.csv`）。用 WebFetch 或直接下載取得 CSV 內容，確認：
- 恰好 50 筆資料列（不含表頭）
- 欄位包含：R&D Spend、Administration、Marketing Spend、State、Profit

- [ ] **Step 2: 轉換成專案要用的 JSON 格式**

把 CSV 轉成陣列，每筆物件用以下鍵名（camelCase，對應 Step 3 的 TypeScript 型別）：

```json
[
  {
    "rdSpend": 165349.2,
    "administration": 136897.8,
    "marketingSpend": 471784.1,
    "state": "New York",
    "profit": 192261.83
  }
]
```

存成 `src/data/50-startups.json`（完整 50 筆）。

- [ ] **Step 3: 建立 datasets.ts**

Create `src/lib/datasets.ts`：

```typescript
import startupsData from '../data/50-startups.json';

export interface StartupRecord {
  rdSpend: number;
  administration: number;
  marketingSpend: number;
  state: string;
  profit: number;
}

export interface FeaturePreset {
  id: string;
  label: string;
  xKey: keyof Pick<StartupRecord, 'rdSpend' | 'administration' | 'marketingSpend'>;
  yKey: keyof Pick<StartupRecord, 'rdSpend' | 'administration' | 'marketingSpend'>;
  targetKey: keyof Pick<StartupRecord, 'profit'>;
}

export const startups: StartupRecord[] = startupsData as StartupRecord[];

export const featurePresets: FeaturePreset[] = [
  {
    id: 'rd-marketing',
    label: 'R&D Spend + Marketing Spend',
    xKey: 'rdSpend',
    yKey: 'marketingSpend',
    targetKey: 'profit',
  },
  {
    id: 'rd-admin',
    label: 'R&D Spend + Administration',
    xKey: 'rdSpend',
    yKey: 'administration',
    targetKey: 'profit',
  },
  {
    id: 'marketing-admin',
    label: 'Marketing Spend + Administration',
    xKey: 'marketingSpend',
    yKey: 'administration',
    targetKey: 'profit',
  },
];
```

- [ ] **Step 4: 寫測試驗證資料完整性**

Create `src/lib/datasets.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { startups, featurePresets } from './datasets';

describe('startups dataset', () => {
  it('contains exactly 50 records', () => {
    expect(startups).toHaveLength(50);
  });

  it('each record has the expected numeric and categorical fields', () => {
    startups.forEach((record) => {
      expect(typeof record.rdSpend).toBe('number');
      expect(typeof record.administration).toBe('number');
      expect(typeof record.marketingSpend).toBe('number');
      expect(typeof record.state).toBe('string');
      expect(typeof record.profit).toBe('number');
    });
  });

  it('R&D Spend correlates strongly with Profit (sanity check against known dataset properties)', () => {
    const rd = startups.map((s) => s.rdSpend);
    const profit = startups.map((s) => s.profit);
    const meanRd = rd.reduce((a, b) => a + b, 0) / rd.length;
    const meanProfit = profit.reduce((a, b) => a + b, 0) / profit.length;
    const cov = rd.reduce((sum, v, i) => sum + (v - meanRd) * (profit[i] - meanProfit), 0);
    const stdRd = Math.sqrt(rd.reduce((sum, v) => sum + (v - meanRd) ** 2, 0));
    const stdProfit = Math.sqrt(profit.reduce((sum, v) => sum + (v - meanProfit) ** 2, 0));
    const correlation = cov / (stdRd * stdProfit);

    // 開發者提供的參考資料（pic/CRISPDM.png）顯示此資料集 R&D vs Profit 相關係數 ≈ 0.97
    expect(correlation).toBeGreaterThan(0.9);
  });
});

describe('featurePresets', () => {
  it('defines three preset feature combinations', () => {
    expect(featurePresets).toHaveLength(3);
  });
});
```

- [ ] **Step 5: 執行測試**

```bash
npx vitest run src/lib/datasets.test.ts
```

Expected: 所有測試 PASS。如果「R&D Spend 與 Profit 相關係數 > 0.9」這個測試失敗，代表 Step 1-2 取得/轉換的資料有誤，回頭檢查資料來源與欄位對應，不要調整測試門檻來遷就錯誤資料。

- [ ] **Step 6: Commit**

```bash
git add src/data/50-startups.json src/lib/datasets.ts src/lib/datasets.test.ts
git commit -m "Add 50 Startups dataset and feature preset definitions"
```

---

### Task 7: Multiple Linear Regression 章節內容

**Files:**
- Create: `src/content/chapters/multiple-linear-regression.md`

**Interfaces:**
- Consumes: `src/content.config.ts` 定義的 `chapters` collection schema（Task 3）
- Produces: 一筆符合 schema 的章節內容，`interactiveComponent: 'regression-scatter-3d'`（Task 9 的元件會註冊這個 key）

- [ ] **Step 1: 寫章節內容**

Create `src/content/chapters/multiple-linear-regression.md`：

```markdown
---
title: 多元線性回歸
stage: 監督式學習－迴歸
category:
  - 監督式學習
  - 迴歸
interactiveComponent: regression-scatter-3d
summary:
  formulas:
    - "y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\cdots + \\beta_n x_n + \\varepsilon"
    - "\\hat{\\beta} = (X^\\top X)^{-1} X^\\top y"
  keyStats:
    - label: 適用資料型態
      value: 連續數值目標變數
    - label: 常用評估指標
      value: R², RMSE
    - label: 訓練方式
      value: 最小平方法（常態方程式）
---

## 簡介

多元線性回歸（Multiple Linear Regression）是簡單線性回歸的延伸：用兩個以上的自變數（特徵）來預測一個連續的目標變數。例如，用一間新創公司在研發（R&D Spend）、行政（Administration）、行銷（Marketing Spend）上的支出，預測它的獲利（Profit）。跟簡單線性回歸一樣，它假設目標變數和每個特徵之間存在線性關係，只是現在這條「線」變成了一個高維度的「平面」或「超平面」。

## 分類方式

- **學習類型**：監督式學習（Supervised Learning）
- **任務類型**：迴歸（Regression）——預測連續數值，而非類別標籤

## 數學原理

給定 $n$ 個特徵 $x_1, x_2, \ldots, x_n$，多元線性回歸假設目標變數 $y$ 可以表示為：

$$
y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \cdots + \beta_n x_n + \varepsilon
$$

其中 $\beta_0$ 是截距（intercept）、$\beta_1, \ldots, \beta_n$ 是各特徵的係數（coefficients）、$\varepsilon$ 是誤差項。

模型訓練的目標是找到一組係數 $\hat{\beta}$，使預測值與實際值之間的**殘差平方和**（Sum of Squared Residuals）最小：

$$
\hat{\beta} = \arg\min_{\beta} \sum_{i=1}^{m} \left( y_i - X_i \beta \right)^2
$$

這個最佳化問題有封閉解（closed-form solution），稱為**常態方程式**（Normal Equation）：

$$
\hat{\beta} = (X^\top X)^{-1} X^\top y
$$

其中 $X$ 是把所有樣本的特徵排成的矩陣（每一列多加一個值為 1 的欄位，對應截距項），$y$ 是目標值向量。這也是本章節互動演示背後實際使用的運算方式。

## 運用範例

- **新創公司獲利預測**：本章節示範資料集 50 Startups，用研發、行政、行銷支出預測獲利
- **房價預測**：用坪數、屋齡、與市中心距離等特徵預測房屋售價
- **業績預測**：用廣告預算、業務人力、季節性等特徵預測月營收

## 適用情境與限制

**適合使用的情境：**

- 目標變數是連續數值，且與特徵之間大致呈線性關係
- 需要模型「可解釋」——每個係數直接告訴你該特徵每增加一單位對目標值的影響

**限制與假設：**

- **線性關係假設**：若目標變數與特徵之間是明顯的非線性關係（如指數成長），線性回歸會系統性地預測不準，此時應考慮 Polynomial Regression 或其他非線性模型
- **殘差獨立同分布**：模型假設誤差項彼此獨立、變異數固定（同質變異，homoscedasticity）。若違反（例如誤差隨特徵值增加而變大），標準誤與信賴區間會不準確
- **多重共線性（Multicollinearity）**：當特徵之間高度相關時（例如行銷支出與業務支出通常同步增減），係數估計會變得不穩定，難以判斷「單一特徵」真正的影響力

## 評估指標

- **R²（決定係數）**：模型解釋了目標變數變異量的比例，範圍 0～1，越接近 1 代表模型解釋力越強
- **RMSE（均方根誤差）**：預測值與實際值誤差的平方平均後開根號，單位與目標變數相同（本範例中單位是「獲利金額」），越小代表預測越準

## 常見誤區

- **把相關性當因果**：R&D 支出與獲利高度相關，不代表「花更多錢在研發上」必然「因果上」導致獲利提高，可能兩者都受第三個因素（如公司規模）影響
- **忽略多重共線性**：看到某特徵的係數很小，就直接判斷「這個特徵不重要」，但如果它跟另一個特徵高度相關，係數的大小可能只是反映了共線性，而非真實的影響力
- **外插（Extrapolation）**：模型只在訓練資料的數值範圍內可靠。訓練資料的 R&D 支出如果最高只到 15 萬，就不該用模型去預測 R&D 支出 100 萬時的獲利——超出範圍的線性關係不保證成立
```

- [ ] **Step 2: 驗證 frontmatter 符合 schema**

```bash
npx astro sync
npx astro check
```

Expected: 無 schema 驗證錯誤（若 YAML frontmatter 格式有誤，`astro check` 或後續 build 會報錯，屆時檢查 YAML 縮排與陣列語法）。

- [ ] **Step 3: Commit**

```bash
git add src/content/chapters/multiple-linear-regression.md
git commit -m "Write Multiple Linear Regression chapter content"
```

---

### Task 8: 學習摘要資訊圖表元件（簡化版）

**Files:**
- Create: `src/components/ChapterSummaryCard.astro`

**Interfaces:**
- Consumes: `katex`（npm 套件，Task 1 已安裝）
- Produces: `ChapterSummaryCard.astro` — Props: `{ formulas: string[]; keyStats: { label: string; value: string }[] }`

> 設計備註：原設計文件（`docs/superpowers/specs/2026-07-28-ml-learning-site-skeleton-design.md`）把這個元件列為 `.tsx`（React），但摘要卡本身沒有互動狀態，純粹是伺服器端渲染的靜態內容，改用 `.astro` 元件可以避免多開一個不必要的 React island（更符合「island 只用在真的需要互動的地方」的架構原則）。

- [ ] **Step 1: 實作元件**

Create `src/components/ChapterSummaryCard.astro`：

```astro
---
import katex from 'katex';

interface Props {
  formulas: string[];
  keyStats: { label: string; value: string }[];
}

const { formulas, keyStats } = Astro.props;
const renderedFormulas = formulas.map((f) =>
  katex.renderToString(f, { throwOnError: false })
);
---
<section class="summary-card">
  <h2>學習摘要</h2>
  <div class="summary-card__formulas">
    {renderedFormulas.map((html) => <div class="katex-formula" set:html={html} />)}
  </div>
  <ul class="summary-card__stats">
    {keyStats.map((stat) => (
      <li>
        <span class="summary-card__stat-label">{stat.label}</span>
        <span class="summary-card__stat-value">{stat.value}</span>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 2: 驗證型別檢查通過**

```bash
npx astro check
```

Expected: 無錯誤（實際渲染效果留到 Task 10 頁面組裝完成後一起手動檢查）。

- [ ] **Step 3: Commit**

```bash
git add src/components/ChapterSummaryCard.astro
git commit -m "Add simplified chapter summary card component"
```

---

### Task 9: 3D 回歸互動元件（React Island）

**Files:**
- Create: `src/components/charts/RegressionScatter3D.tsx`

**Interfaces:**
- Consumes:
  - `startups`, `featurePresets` from `src/lib/datasets.ts`（Task 6）
  - `fitLinearRegression`, `predict`, `rSquared`, `rmse` from `src/lib/regression.ts`（Task 4）
  - `buildScatterPlaneData` from `src/lib/regressionPlaneData.ts`（Task 5）
- Produces: `RegressionScatter3D`，一個無 props 的 React 預設匯出元件，供 `[slug].astro` 以 `client:load` 掛載

- [ ] **Step 1: 實作元件**

Create `src/components/charts/RegressionScatter3D.tsx`：

```tsx
import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { startups, featurePresets, type FeaturePreset } from '../../lib/datasets';
import { fitLinearRegression, predict, rSquared, rmse } from '../../lib/regression';
import { buildScatterPlaneData } from '../../lib/regressionPlaneData';

function computeForPreset(preset: FeaturePreset) {
  const points = startups.map((row) => ({
    x1: row[preset.xKey],
    x2: row[preset.yKey],
    y: row[preset.targetKey],
  }));

  const { coefficients } = fitLinearRegression(
    points.map((p) => [p.x1, p.x2]),
    points.map((p) => p.y)
  );

  const predicted = points.map((p) => predict(coefficients, [p.x1, p.x2]));
  const r2 = rSquared(points.map((p) => p.y), predicted);
  const rmseValue = rmse(points.map((p) => p.y), predicted);
  const planeData = buildScatterPlaneData(points, coefficients);

  return { coefficients, r2, rmseValue, planeData };
}

export default function RegressionScatter3D() {
  const [presetId, setPresetId] = useState(featurePresets[0].id);
  const preset = featurePresets.find((p) => p.id === presetId)!;
  const { r2, rmseValue, planeData } = useMemo(() => computeForPreset(preset), [preset]);

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {featurePresets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === presetId ? 'is-active' : ''}
            onClick={() => setPresetId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Plot
        data={[
          {
            type: 'scatter3d',
            mode: 'markers',
            x: planeData.scatter.x,
            y: planeData.scatter.y,
            z: planeData.scatter.z,
            marker: { size: 4, color: '#5ee6d0' },
            name: '樣本資料',
          },
          {
            type: 'surface',
            x: planeData.plane.x,
            y: planeData.plane.y,
            z: planeData.plane.z,
            opacity: 0.5,
            showscale: false,
            colorscale: [
              [0, '#7c5ee6'],
              [1, '#7c5ee6'],
            ],
            name: '回歸平面',
          },
        ]}
        layout={{
          autosize: true,
          paper_bgcolor: '#0f1117',
          plot_bgcolor: '#0f1117',
          font: { color: '#e4e6eb' },
          scene: {
            xaxis: { title: preset.xKey },
            yaxis: { title: preset.yKey },
            zaxis: { title: preset.targetKey },
          },
          margin: { l: 0, r: 0, t: 20, b: 0 },
        }}
        useResizeHandler
        style={{ width: '100%', height: '480px' }}
        config={{ displaylogo: false }}
      />
      <dl className="regression-chart__stats">
        <div>
          <dt>R²</dt>
          <dd>{r2.toFixed(4)}</dd>
        </div>
        <div>
          <dt>RMSE</dt>
          <dd>{rmseValue.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
```

- [ ] **Step 2: 手動驗證（此步驟需要 Task 10 完成頁面組裝後才能實際在瀏覽器測試，先確認型別檢查通過）**

```bash
npx astro check
```

Expected: 無型別錯誤。完整互動行為（3D 圖能旋轉/縮放、切換預設特徵組合會更新平面與 R²/RMSE 數值）的瀏覽器驗證，併入 Task 10 Step 4 一起做。

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/RegressionScatter3D.tsx
git commit -m "Add 3D regression scatter/plane React island with preset switcher"
```

---

### Task 10: 章節頁面範本與首頁組裝

**Files:**
- Create: `src/pages/chapters/[slug].astro`
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes:
  - `chapters` collection（Task 3）
  - `BaseLayout`（Task 2）、`Nav`（Task 2）、`ChapterSummaryCard`（Task 8）、`RegressionScatter3D`（Task 9）
- Produces: 可瀏覽的完整網站（首頁 `/`、章節頁 `/chapters/multiple-linear-regression/`）

- [ ] **Step 1: 建立章節頁面範本**

Create `src/pages/chapters/[slug].astro`：

```astro
---
import { getCollection, render, type CollectionEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import ChapterSummaryCard from '../../components/ChapterSummaryCard.astro';
import RegressionScatter3D from '../../components/charts/RegressionScatter3D';

export async function getStaticPaths() {
  const chapters = await getCollection('chapters');
  return chapters.map((chapter) => ({
    params: { slug: chapter.id },
    props: { chapter },
  }));
}

interface Props {
  chapter: CollectionEntry<'chapters'>;
}

const { chapter } = Astro.props;
const { Content } = await render(chapter);

const interactiveComponents: Record<string, typeof RegressionScatter3D> = {
  'regression-scatter-3d': RegressionScatter3D,
};
const InteractiveComponent = chapter.data.interactiveComponent
  ? interactiveComponents[chapter.data.interactiveComponent]
  : undefined;
---
<BaseLayout title={chapter.data.title}>
  <Nav />
  <main class="chapter">
    <h1>{chapter.data.title}</h1>
    <Content />
    <ChapterSummaryCard
      formulas={chapter.data.summary.formulas}
      keyStats={chapter.data.summary.keyStats}
    />
    {InteractiveComponent && (
      <section class="chapter__interactive">
        <h2>互動式操作與演示</h2>
        <InteractiveComponent client:load />
      </section>
    )}
  </main>
</BaseLayout>
```

> **注意**：`render(chapter)` 是 Content Layer API 的渲染方式（從 `astro:content` 匯入 `render` 函式）。如果 Task 3 實際安裝的 Astro 版本是舊版 collections（`type: 'content'`），改用 `chapter.render()` 方法呼叫方式，並把 `getStaticPaths` 裡的 `chapter.id` 換成 `chapter.slug`（Task 2 的 Nav.astro 也要同步改）。以當時 `npx astro check` 是否報錯為準。

- [ ] **Step 2: 建立首頁**

Create `src/pages/index.astro`：

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';

const chapters = await getCollection('chapters');
---
<BaseLayout title="機器學習互動學習網站">
  <Nav />
  <main class="home">
    <h1>機器學習互動學習網站</h1>
    <p>從入門到進階，透過互動演示理解機器學習核心演算法。</p>
    <ul class="chapter-list">
      {chapters.map((chapter) => (
        <li>
          <a href={`/chapters/${chapter.id}/`}>{chapter.data.title}</a>
        </li>
      ))}
    </ul>
  </main>
</BaseLayout>
```

- [ ] **Step 3: 執行完整 build**

```bash
npm run build
```

Expected: build 成功完成，`dist/` 目錄產生 `index.html` 與 `chapters/multiple-linear-regression/index.html`。若出現 content collection API（`id` vs `slug`、`render()` vs `render(entry)`）相關錯誤，依照 Step 1 的注意事項調整。

- [ ] **Step 4: 手動瀏覽器驗證（完整走一次，這是唯一能驗證互動圖表實際行為的方式）**

```bash
npm run dev
```

打開瀏覽器造訪本地網址，依序確認：
- 首頁顯示導覽列與「多元線性回歸」連結
- 點進章節頁，九個區塊（簡介、分類方式、數學原理、運用範例、適用情境與限制、評估指標、常見誤區、學習摘要資訊圖表、互動式操作與演示）都有內容顯示
- 數學公式正確渲染成 KaTeX 排版（不是顯示原始 `$...$` 文字）
- 摘要卡的公式與統計數字正確顯示
- 互動圖表：3D 散布圖與半透明回歸平面正確顯示，可用滑鼠旋轉/縮放；點擊三個特徵組合按鈕，平面與 R²/RMSE 數值會跟著更新且數值合理（R² 介於 0～1）

確認後關閉 dev server。

- [ ] **Step 5: Commit**

```bash
git add src/pages/chapters/[slug].astro src/pages/index.astro
git commit -m "Assemble chapter page template and home page"
```

---

### Task 11: 視覺品味調整（design-taste-frontend）

**Files:**
- Modify: `src/styles/global.css`、`src/layouts/BaseLayout.astro`、`src/components/**`、`src/pages/**`（實際修改範圍由 skill 執行後決定）

**Interfaces:**
- Consumes: Task 1-10 完成的功能完整版網站
- Produces: 視覺打磨後的同一個網站（功能不變）

- [ ] **Step 1: 套用 design-taste-frontend skill**

在對話中呼叫 skill：

```
Skill: design-taste-frontend
```

把已完成的深色科技風骨架（`npm run dev` 可預覽）交給這個 skill，要求它針對排版節奏、間距、動效、字體層級做打磨，維持既有的深色配色（`--color-bg: #0f1117`、`--color-accent: #5ee6d0`、`--color-accent-secondary: #7c5ee6`）與資訊架構（九區塊順序、摘要卡、互動圖表位置皆不變），只做視覺品質提升。

- [ ] **Step 2: 手動瀏覽器複查**

```bash
npm run dev
```

確認 Task 10 Step 4 列出的九個檢查項目在視覺調整後依然全部成立（功能沒有被打磨過程破壞）。

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Apply design-taste-frontend visual polish pass"
```

---

### Task 12: GitHub Pages 部署

**Files:**
- Modify: `astro.config.mjs`（加入 `site` / `base`）
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: 完整的 Astro 專案（Task 1-11）
- Produces: 可透過 `https://jamessun0919-ops.github.io/Machine-Learning-Study/` 存取的線上網站

- [ ] **Step 1: 設定 site/base**

編輯 `astro.config.mjs`，在 `defineConfig({...})` 加入：

```js
export default defineConfig({
  site: 'https://jamessun0919-ops.github.io',
  base: '/Machine-Learning-Study',
  integrations: [react()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
```

- [ ] **Step 2: 建立部署 workflow**

Create `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: 啟用 GitHub Pages（Source: GitHub Actions）**

```bash
gh api repos/jamessun0919-ops/Machine-Learning-Study/pages -X POST -f build_type=workflow
```

若此指令失敗（例如帳號尚未啟用過 Pages 功能導致權限錯誤），改為手動設定：到 GitHub repo → Settings → Pages → Source，選擇「GitHub Actions」。

- [ ] **Step 4: Commit 並推送**

```bash
git add astro.config.mjs .github/workflows/deploy.yml
git commit -m "Configure GitHub Pages deployment"
git push
```

- [ ] **Step 5: 驗證部署成功**

```bash
gh run watch
```

等待 workflow 執行完成（Expected: 綠色勾選，成功）。完成後在瀏覽器開啟 `https://jamessun0919-ops.github.io/Machine-Learning-Study/`，確認能看到首頁與章節頁，且互動圖表可以正常運作（跟 Task 10 Step 4 一樣的檢查項目，這次在正式部署的網址上做一次）。

---

## Self-Review Notes

- **Spec coverage**：設計文件的九個章節區塊（Task 7）、深色科技風＋design-taste-frontend（Task 2、11）、Plotly 3D 圖＋預設特徵組合切換（Task 9）、50 Startups 白名單資料集（Task 6）、前端 TS 運算非 Python 後端（Task 4、5）、GitHub Pages 部署（Task 12）、章節設定檔預留關聯欄位供未來知識地圖使用（Task 2 Step 3）都對應到具體任務。
- **Placeholder scan**：已移除所有 TBD/待補內容；章節內容（Task 7）、CSS（Task 2）、所有程式碼區塊都是可直接使用的完整內容，唯一保留「需查證調整」的地方是 Content Collections API 版本差異（Task 3、Nav、[slug].astro），已明確標註原因與調整方式，不是含糊的占位符。
- **Type consistency**：`coefficients: number[]`（Task 4 產生）在 Task 5、Task 9 中維持同樣的陣列型態與索引意義（`[0]`=截距）；`FeaturePreset`（Task 6）的 `xKey`/`yKey`/`targetKey` 在 Task 9 直接用來索引 `StartupRecord`，型別一致；`chapter.id` 在 Task 2 Nav 與 Task 10 `[slug].astro` 使用一致的欄位名稱。
