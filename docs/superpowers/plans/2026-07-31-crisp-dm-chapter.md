# CRISP-DM 資料分析方法 章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「CRISP-DM 資料分析方法」章節，作為本站第三種章節範本（方法論／流程類：簡介／核心流程／常見誤區／學習摘要圖表，無案例分析、無互動元件），並串接進課程知識地圖與章節導覽。

**Architecture:** 純內容擴充，不涉及新的 Astro 元件或 schema 變更（`interactiveComponent`／`summary` 皆已是 optional，直接沿用既有渲染機制）。分三個任務：(1) 章節內文與課程資料串接（不含圖片，避免 Astro `image()` schema 因引用不存在的檔案而建置失敗）、(2) Excalidraw 風格學習摘要資訊圖表（含新的六階段循環圖視覺元件）、(3) 全站最終驗證。

**Tech Stack:** Astro (Content Layer API) + TypeScript + Markdown frontmatter；資訊圖表沿用 rough.js（`docs/specs/assets-src/rough-engine.js`）+ 無頭 Microsoft Edge 渲染，無新增依賴。

## Global Constraints

- 依已核准設計文件 `docs/superpowers/specs/2026-07-31-crisp-dm-chapter-design.md`：章節僅 3 個 Markdown 區塊（簡介／CRISP-DM 六大階段／常見誤區），**不設定** `interactiveComponent` frontmatter 欄位。
- 六大階段的 50 Startups 範例為敘事性描述，**不得包含具體計算數字**（例如迴歸係數、R²、RMSE 等），避免與「本章無案例分析」的決定衝突。
- 資訊圖表版面為 3 視覺區塊（簡介卡／六大階段循環圖／常見誤區卡），**不包含**其他章節既有的深色黑板案例分析區塊。
- `docs/specs/assets-src/rough-engine.js` 為共用檔案，任何任務都不得刪除或修改。
- 每個涉及程式碼/內容變更的任務改動後必須執行 `npx astro check`（預期 0 錯誤/0 警告）與 `npm run build`（預期成功產出頁面），驗證通過才能進入下一任務。

---

### Task 1: 章節內文與課程資料串接

**Files:**
- Create: `src/content/chapters/crisp-dm.md`
- Modify: `src/config/curriculum.ts`
- Modify: `src/config/chapters.ts`
- Modify: `src/config/curriculum.test.ts`

**Interfaces:**
- Consumes: 無（本任務起點，基於目前 main 分支現狀）
- Produces: `crisp-dm` 章節頁面可透過 `/chapters/crisp-dm/` 存取（無學習摘要圖表，Task 2 會補上）；`curriculum.ts` 的 CRISP-DM 主題項目具備 `slug: 'crisp-dm'`，供 Task 2 的資訊圖表與後續瀏覽器驗證使用；`chapterOrder` 具備完整的四章節鏈結，供 Task 3 驗證導覽列與知識地圖使用。

- [ ] **Step 1: 新增章節內容檔 `src/content/chapters/crisp-dm.md`**

完整內容：

```markdown
---
title: CRISP-DM 資料分析方法
stage: 課程導覽
category:
  - 課程導覽
---

## 簡介

CRISP-DM（Cross-Industry Standard Process for Data Mining，跨產業資料探勘標準流程）是資料科學／機器學習專案最廣泛採用的標準作業流程，最早由多家企業於 1990 年代共同制定。它把一個資料分析專案拆解成六個階段，從釐清業務目標開始，一路到模型上線後的維護，提供一套可依循的檢查清單，避免專案「一頭栽進建模，卻忘了要解決什麼問題」。

## CRISP-DM 六大階段

範例情境：一間新創加速器想用「50 Startups」財務資料集，預測新創公司的獲利，以篩選潛在投資標的。

- **Business Understanding（業務理解）**
  - 將業務問題轉譯成資料科學問題（這是一個迴歸任務：用公司的支出結構預測獲利金額）
  - 定義可衡量的成功指標（例如：模型預測誤差要能控制在可接受範圍內）
  - 初步評估手上是否有足夠資料可支撐這個目標
- **Data Understanding（資料理解）**
  - 盤點欄位：研發支出、行政支出、行銷支出、所在州別、獲利
  - 檢查資料品質：有沒有缺失值、異常的支出或獲利數字
  - 初步觀察哪些欄位看起來與獲利比較有關聯
- **Data Preparation（資料準備）**
  - 處理類別欄位（例如「所在州別」需要轉換成模型看得懂的數值編碼）
  - 檢查並處理極端值（例如某筆支出或獲利明顯異常）
  - 切分訓練／測試資料集，準備進入建模階段
- **Modeling（建模）**
  - 這是連續數值預測，選擇線性回歸類模型（例如 Multiple Linear Regression）
  - 訓練模型，估計每項支出對獲利的影響程度
  - 若效果不理想，可能回頭調整 Data Preparation（例如嘗試不同的特徵組合）
- **Evaluation（評估）**
  - 不只看模型的統計配適度，更要確認預測結果對投資決策實際有幫助
  - 檢查模型在特定類型公司（例如高研發支出）上是否有系統性誤差
  - 確認結果符合 Business Understanding 階段設定的目標，才能進入下一階段
- **Deployment（部署）**
  - 整合進投資篩選流程或決策儀表板
  - 建立監控機制，追蹤模型上線後的預測是否仍然準確
  - 規劃未來有新公司資料進來時，如何定期重新訓練模型

## 常見誤區

- **把 CRISP-DM 當成單向線性流程**：實際上各階段（尤其 Data Preparation↔Modeling、Evaluation↔Business Understanding）經常需要反覆回頭調整，是一個循環，而非一次性通過的檢查清單。
- **跳過 Business Understanding 直接建模**：沒有先定義清楚業務目標與成功標準，容易做出「技術指標很好看，卻解決不了實際問題」的模型。
- **把 Deployment 當成專案終點**：模型上線後若沒有持續監控資料與模型表現的變化（Data Drift／Model Drift），預測品質會隨時間推移而劣化。
```

注意：本步驟**故意不加入 `summary` frontmatter 欄位**（學習摘要圖表尚未存在，`content.config.ts` 的 `summary.image` 使用 Astro `image()` schema helper，引用不存在的檔案會導致建置失敗）。`summary` 欄位會在 Task 2 資訊圖表產出後才加入。

- [ ] **Step 2: 在 `curriculum.ts` 為 CRISP-DM 主題補上 `slug`**

在 `src/config/curriculum.ts` 中：

```ts
// 修改前
      { name: '機器學習介紹（含全課程知識地圖）', slug: 'machine-learning-introduction' },
      { name: 'CRISP-DM 資料分析方法' },

// 修改後
      { name: '機器學習介紹（含全課程知識地圖）', slug: 'machine-learning-introduction' },
      { name: 'CRISP-DM 資料分析方法', slug: 'crisp-dm' },
```

- [ ] **Step 3: 在 `chapters.ts` 的 `chapterOrder` 串接 CRISP-DM**

在 `src/config/chapters.ts` 中：

```ts
// 修改前
export const chapterOrder: ChapterMeta[] = [
  {
    slug: 'machine-learning-introduction',
    stage: '課程導覽',
  },
  {
    slug: 'simple-linear-regression',
    stage: '監督式學習－迴歸',
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
```

- [ ] **Step 4: 更新 `curriculum.test.ts` 既有測試以反映新增的第 4 個已建置章節**

在 `src/config/curriculum.test.ts` 中：

```ts
// 修改前
  it('marks exactly the three currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
    ]);
  });

// 修改後
  it('marks exactly the four currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'CRISP-DM 資料分析方法',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
    ]);
  });
```

- [ ] **Step 5: 驗證型別檢查、建置與測試**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，**5 個頁面**正常產出（首頁 + 4 章節，包含新的 `/chapters/crisp-dm/`）

Run: `npm run test`
Expected: 全數測試通過（含 Step 4 更新後的 `curriculum.test.ts`）

- [ ] **Step 6: Commit**

```bash
git add src/content/chapters/crisp-dm.md src/config/curriculum.ts src/config/chapters.ts src/config/curriculum.test.ts
git commit -m "$(cat <<'EOF'
Add CRISP-DM chapter content and wire into curriculum/navigation

Establishes the site's third chapter template (methodology/process:
intro, core process, pitfalls, summary infographic — no case study,
no interactive component). Summary infographic frontmatter is added
in a follow-up commit once the image asset exists.
EOF
)"
```

---

### Task 2: Excalidraw 風格學習摘要資訊圖表

**Files:**
- Create: `docs/specs/assets-src/crisp-dm-summary.html`
- Create: `scripts/render-crisp-dm-infographic.ps1`
- Create: `src/assets/chapters/crisp-dm-summary.png`（渲染輸出）
- Modify: `src/content/chapters/crisp-dm.md`

**Interfaces:**
- Consumes: Task 1 已建立 `crisp-dm.md`（尚無 `summary` 欄位），且 `curriculum.ts`/`chapters.ts` 已完成串接
- Produces: `crisp-dm.md` frontmatter 具備完整 `summary`（`formulas`/`keyStats`/`image`），供 Task 3 驗證頁面「學習摘要」區塊

- [ ] **Step 1: 建立資訊圖表來源檔 `docs/specs/assets-src/crisp-dm-summary.html`**

完整內容（比照既有 `simple-linear-regression-summary.html` 的 CSS 變數、`.page`/`.card`/`sketch-bg` 基礎樣式與繪製腳本結構；新增六階段循環圖專屬的 `.cycle-*` 樣式與繪製邏輯）：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>CRISP-DM 資料分析方法 資訊圖表（Excalidraw 風格）</title>
  <style>
    :root {
      --paper: #f3efe2;
      --paper-edge: #e8e1cd;
      --ink: #2b2a33;
      --ink-soft: #4a4854;
      --intro: #5b5f97;
      --intro-fill: #e4e5f3;
      --formula: #2f8f7a;
      --formula-fill: #dcf0ec;
      --pitfall: #b5533c;
      --pitfall-fill: #f6e0d8;
      --board: #24433a;
      --chalk-accent: #e8d97a;
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
    .card.cycle .card-head { color: var(--formula); }
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

    .card-body ul {
      margin: 0;
      padding-left: 20px;
    }
    .card-body li { margin-bottom: 6px; }
    .card-body li:last-child { margin-bottom: 0; }

    /* ---- 六階段循環圖 ---- */
    .cycle-scenario {
      font-family: "Segoe UI", "Microsoft JhengHei", sans-serif;
      font-size: 13.5px;
      color: var(--ink-soft);
      margin: 0 0 4px;
    }

    .cycle-diagram {
      position: relative;
      width: 480px;
      height: 480px;
      margin: 14px auto 6px;
    }
    .cycle-diagram__canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .cycle-node {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 136px;
      padding: 8px 10px;
      text-align: center;
      background: var(--formula-fill);
      border: 2px solid var(--formula);
      border-radius: 8px;
      z-index: 1;
    }
    .cycle-node__title {
      font-family: "Segoe UI", sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--ink);
      line-height: 1.25;
    }
    .cycle-node__sub {
      font-family: "Segoe Print", cursive;
      font-size: 12px;
      color: var(--ink-soft);
      margin-top: 2px;
    }
    .cycle-hub {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: var(--board);
      color: var(--chalk-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe Print", cursive;
      font-size: 17px;
      z-index: 1;
    }
    .cycle-legend {
      display: flex;
      gap: 18px;
      justify-content: center;
      list-style: none;
      margin: 4px 0 0;
      padding: 0;
      font-family: "Segoe UI", sans-serif;
      font-size: 12.5px;
      color: var(--ink-soft);
    }
    .cycle-legend li { display: flex; align-items: center; gap: 6px; }
    .cycle-legend__swatch { display: inline-block; width: 18px; height: 3px; border-radius: 2px; }
    .cycle-legend__swatch--main { background: var(--formula); }
    .cycle-legend__swatch--feedback { background: var(--pitfall); }

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
    <h1 class="main-title">CRISP-DM 資料分析方法</h1>
    <div class="subtitle">Cross-Industry Standard Process for Data Mining · 課程導覽</div>
    <canvas class="title-underline" id="title-underline"></canvas>
  </header>

  <section class="card intro" data-sketch="intro">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">①</span><h2>簡介</h2></div>
      <div class="card-body">
        CRISP-DM（跨產業資料探勘標準流程）把一個資料分析專案拆解成六個階段，從釐清業務目標到模型上線後的維護，提供一套可依循的檢查清單，避免專案一頭栽進建模卻忘了要解決什麼問題。
        <div class="tag-row">
          <span class="tag" data-sketch="tag1"><canvas class="sketch-bg"></canvas><span>資料科學方法論</span></span>
          <span class="tag" data-sketch="tag2"><canvas class="sketch-bg"></canvas><span>六階段循環流程</span></span>
          <span class="tag" data-sketch="tag3"><canvas class="sketch-bg"></canvas><span>業界標準流程</span></span>
        </div>
      </div>
    </div>
  </section>

  <section class="card cycle" data-sketch="cycle">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">②</span><h2>CRISP-DM 六大階段</h2></div>
      <div class="card-body">
        <p class="cycle-scenario">範例情境：一間新創加速器想用「50 Startups」財務資料集，預測新創公司的獲利，以篩選潛在投資標的。</p>
        <div class="cycle-diagram" id="cycle-diagram">
          <canvas class="cycle-diagram__canvas" id="cycle-canvas"></canvas>
          <div class="cycle-node" style="left:240px; top:50px;">
            <div class="cycle-node__title">1. Business Understanding</div>
            <div class="cycle-node__sub">業務理解</div>
          </div>
          <div class="cycle-node" style="left:405px; top:145px;">
            <div class="cycle-node__title">2. Data Understanding</div>
            <div class="cycle-node__sub">資料理解</div>
          </div>
          <div class="cycle-node" style="left:405px; top:335px;">
            <div class="cycle-node__title">3. Data Preparation</div>
            <div class="cycle-node__sub">資料準備</div>
          </div>
          <div class="cycle-node" style="left:240px; top:430px;">
            <div class="cycle-node__title">4. Modeling</div>
            <div class="cycle-node__sub">建模</div>
          </div>
          <div class="cycle-node" style="left:75px; top:335px;">
            <div class="cycle-node__title">5. Evaluation</div>
            <div class="cycle-node__sub">評估</div>
          </div>
          <div class="cycle-node" style="left:75px; top:145px;">
            <div class="cycle-node__title">6. Deployment</div>
            <div class="cycle-node__sub">部署</div>
          </div>
          <div class="cycle-hub" style="left:240px; top:240px;">Data</div>
        </div>
        <ul class="cycle-legend">
          <li><span class="cycle-legend__swatch cycle-legend__swatch--main"></span>主要流程</li>
          <li><span class="cycle-legend__swatch cycle-legend__swatch--feedback"></span>常見回頭調整</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="card pitfall" data-sketch="pitfall">
    <canvas class="sketch-bg"></canvas>
    <div class="card-inner">
      <div class="card-head"><span class="num">③</span><h2>常見誤區</h2></div>
      <div class="card-body">
        <ul>
          <li><b>當成單向流程</b>——各階段（尤其 Data Preparation↔Modeling、Evaluation↔Business Understanding）常需反覆回頭調整，是循環而非一次性檢查清單。</li>
          <li><b>跳過 Business Understanding</b>——沒先定義清楚業務目標與成功標準，容易做出「指標好看卻解決不了問題」的模型。</li>
          <li><b>把 Deployment 當終點</b>——上線後若沒有持續監控資料與模型表現的漂移（Data／Model Drift），預測品質會隨時間劣化。</li>
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

  function drawArrow(rc, x1, y1, x2, y2, opts) {
    rc.line(x1, y1, x2, y2, opts);
    var angle = Math.atan2(y2 - y1, x2 - x1);
    var headLen = 14;
    function head(px, py, dirAngle) {
      var a1 = dirAngle + Math.PI - 0.4;
      var a2 = dirAngle + Math.PI + 0.4;
      rc.line(px, py, px + headLen * Math.cos(a1), py + headLen * Math.sin(a1), opts);
      rc.line(px, py, px + headLen * Math.cos(a2), py + headLen * Math.sin(a2), opts);
    }
    head(x2, y2, angle);
  }

  function drawCycleDiagram() {
    var canvas = document.getElementById('cycle-canvas');
    var container = document.getElementById('cycle-diagram');
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

    var nodes = {
      p1: [240, 50], p2: [405, 145], p3: [405, 335],
      p4: [240, 430], p5: [75, 335], p6: [75, 145],
    };
    var hub = [240, 240];

    var mainOpts = { roughness: 1.6, bowing: 1.8, stroke: '#2f8f7a', strokeWidth: 2.6 };
    var spokeOpts = { roughness: 1.4, bowing: 1.4, stroke: '#a9a48f', strokeWidth: 1.4 };
    var feedbackOpts = { roughness: 2.2, bowing: 3, stroke: '#b5533c', strokeWidth: 2.2 };

    Object.keys(nodes).forEach(function (key) {
      rc.line(hub[0], hub[1], nodes[key][0], nodes[key][1], spokeOpts);
    });

    var ring = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
    for (var i = 0; i < ring.length; i++) {
      var from = nodes[ring[i]];
      var to = nodes[ring[(i + 1) % ring.length]];
      drawArrow(rc, from[0], from[1], to[0], to[1], mainOpts);
    }

    drawArrow(rc, nodes.p4[0], nodes.p4[1], nodes.p3[0], nodes.p3[1], feedbackOpts);
  }

  var palette = {
    intro: { stroke: '#5b5f97', fill: '#e4e5f3' },
    cycle: { stroke: '#2f8f7a', fill: '#dcf0ec' },
    pitfall: { stroke: '#b5533c', fill: '#f6e0d8' },
    tag1: { stroke: '#5b5f97', fill: 'none' },
    tag2: { stroke: '#5b5f97', fill: 'none' },
    tag3: { stroke: '#5b5f97', fill: 'none' },
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

    drawCycleDiagram();

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

- [ ] **Step 2: 建立渲染腳本 `scripts/render-crisp-dm-infographic.ps1`**

```powershell
# Render CRISP-DM Infographic HTML to PNG
$htmlPath = "C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/crisp-dm-summary.html"
$outputPath = "C:/Users/User/Desktop/Machine Learning Study/src/assets/chapters/crisp-dm-summary.png"

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
& $edgePath --headless --disable-gpu --screenshot="$outputPath" --window-size=794,1550 --force-device-scale-factor=3 "file:///$htmlPath"

if (Test-Path $outputPath) {
    Write-Host "Rendering completed successfully!"
} else {
    Write-Error "Rendering failed. PNG was not created."
}
```

- [ ] **Step 3: 首次渲染，並用 DOM 量測法校正視窗高度**

Run: `powershell -File scripts/render-crisp-dm-infographic.ps1`

用 Read 工具開啟 `src/assets/chapters/crisp-dm-summary.png` 檢查：是否有捲軸殘留痕跡（視窗高度設太小）或留白過多（視窗高度設太大）。

若需校正，比照第 14 階段建立的方法：建立一份暫存複本，於 `</body>` 前注入量測腳本，用無頭 Edge `--dump-dom` 讀出 `.page` 元素精確高度後更新渲染腳本的 `--window-size`：

```bash
sed 's#</body>#<script>window.addEventListener("load",function(){setTimeout(function(){document.title="HEIGHT:"+document.getElementById("page").getBoundingClientRect().height;},200);});</script></body>#' "docs/specs/assets-src/crisp-dm-summary.html" > "docs/specs/assets-src/.crisp-dm-measure.html"
```

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --headless --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=2000 --dump-dom --window-size=794,3000 "file:///C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/.crisp-dm-measure.html" 2>$null | Select-String -Pattern "HEIGHT:" | Select-Object -First 1
```

刪除暫存檔（`docs/specs/assets-src/.crisp-dm-measure.html`），將量測出的高度（無條件進位到整數）填入 `render-crisp-dm-infographic.ps1` 的 `--window-size=794,<高度>`，重新執行渲染腳本，再次用 Read 檢查畫面乾淨無捲軸殘留、無過多留白。

**六階段循環圖視覺檢查**：確認 6 個階段方塊圍繞中央「Data」圓形排列成六邊形，方塊之間有帶箭頭的綠色主流程線依序連接（1→2→3→4→5→6→1），中央有 6 條淺色線連到「Data」，Modeling→Data Preparation 之間有一條橘紅色回饋箭頭。若方塊與箭頭有明顯重疊、方塊擋住箭頭方向難以辨識、或橘紅色回饋箭頭與旁邊的綠色主流程線完全重疊看不出兩條線，調整對應節點的 `left`/`top` 值（同時要同步修改 HTML 內兩處：`.cycle-node`/`.cycle-hub` 的 inline style 與 JS 內 `nodes`/`hub` 物件座標，兩者必須一致）後重新渲染，直到畫面可清楚辨識六邊形環狀流程、中央 Data 節點、以及一條明顯區隔於主流程的回饋箭頭。

- [ ] **Step 4: 將學習摘要圖表接入章節 frontmatter**

在 `src/content/chapters/crisp-dm.md` 中：

```markdown
<!-- frontmatter 修改前 -->
---
title: CRISP-DM 資料分析方法
stage: 課程導覽
category:
  - 課程導覽
---

<!-- frontmatter 修改後 -->
---
title: CRISP-DM 資料分析方法
stage: 課程導覽
category:
  - 課程導覽
summary:
  formulas: []
  keyStats: []
  image: ../../assets/chapters/crisp-dm-summary.png
---
```

- [ ] **Step 5: 驗證型別檢查與建置**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告（確認 `image()` schema 能正確解析新圖片路徑）

Run: `npm run build`
Expected: 建置成功，5 個頁面正常產出，`crisp-dm-summary.png` 出現在「generating optimized images」清單中

- [ ] **Step 6: Commit**

```bash
git add docs/specs/assets-src/crisp-dm-summary.html scripts/render-crisp-dm-infographic.ps1 src/assets/chapters/crisp-dm-summary.png src/content/chapters/crisp-dm.md
git commit -m "$(cat <<'EOF'
Add CRISP-DM summary infographic and wire into chapter frontmatter

Excalidraw-style infographic with a new six-phase cycle diagram
component (phases arranged around a central "Data" hub with a main
flow ring and one highlighted feedback loop), replacing the dark
case-analysis board used by algorithm chapters since this chapter has
no fitted-model results to report.
EOF
)"
```

---

### Task 3: 全站最終驗證

**Files:**
- 無新增/修改檔案（純驗證任務）

**Interfaces:**
- Consumes: Task 1-2 的全部變更
- Produces: 無

- [ ] **Step 1: 執行完整測試套件**

Run: `npm run test`
Expected: 全數測試通過

- [ ] **Step 2: 型別檢查**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

- [ ] **Step 3: 全站建置**

Run: `npm run build`
Expected: 建置成功，5 個頁面正常產出

- [ ] **Step 4: 啟動本機預覽伺服器**

Run: `npm run preview`（背景執行）

- [ ] **Step 5: 瀏覽器實測「CRISP-DM 資料分析方法」頁面**

先用 `curl` 預熱頁面與圖片優化端點（避免無頭截圖時圖片區塊空白）：

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321/Machine-Learning-Study/chapters/crisp-dm/"
```

再用無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw --screenshot`）對整頁截圖（視窗高度需設定足夠大以完整涵蓋頁面，如 `--window-size=1280,4500`），用 Read 檢查：
- 導覽列／頁首出現「CRISP-DM 資料分析方法」，且有「資訊圖表」跳轉連結（因為有 `summary`）、**沒有**「互動操作」跳轉連結（因為沒有 `interactiveComponent`）
- 「簡介」「CRISP-DM 六大階段」「常見誤區」三個區塊文字完整呈現
- 「學習摘要」區塊正確顯示 Task 2 產出的圖表，含「點擊放大」提示
- 頁面**沒有**「互動式操作與演示」區塊（因為沒有 `interactiveComponent`）

- [ ] **Step 6: 瀏覽器實測知識地圖與既有章節無迴歸**

對「機器學習介紹」頁面截圖，確認下方知識地圖清單中「CRISP-DM 資料分析方法」項目已從「即將推出」變成可點擊連結。

對「簡單線性回歸」「多元線性回歸」頁面各截圖一次，確認既有內容無迴歸（第 13、14 階段的變更皆維持正常）。

- [ ] **Step 7: 關閉本機預覽伺服器**

依 `docs/handover.md` 規則：`netstat -ano` 找出監聽該連接埠的 PID，`taskkill //PID <pid> //F` 強制終止，再次 `netstat` 確認無殘留 LISTENING 項目。

- [ ] **Step 8: 確認無殘留未提交變更**

Run: `git status --short`
Expected: 無輸出（所有變更皆已在 Task 1-2 提交）
