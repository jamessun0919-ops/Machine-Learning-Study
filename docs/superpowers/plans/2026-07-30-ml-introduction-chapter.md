# 「機器學習介紹」章節 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立全站第一個非演算法章節「機器學習介紹」（`dir.txt` 階段一），並提供全課程知識地圖（靜態概念關聯圖 + 互動式分階段清單），同時將 `ChapterSummaryCard` 改為條件渲染以支援不需要摘要圖表的章節類型。

**Architecture:** Astro Content Layer 新增一篇 `.md` 章節內容（5 區塊範本，取代九大區塊）；新資料檔 `src/config/curriculum.ts` 描述完整 8 階段課程主題與演算法間關聯；新 React island `CourseKnowledgeMap.tsx` 依該資料渲染可點擊/反灰清單；新靜態 Excalidraw 風格 PNG 呈現 6 條概念關聯；`content.config.ts` 與 `[slug].astro` 調整為條件渲染摘要卡片。

**Tech Stack:** Astro (Content Layer API)、React island（`client:only="react"`）、TypeScript、Vitest、rough.js（既有內嵌手繪引擎）、無頭 Microsoft Edge 渲染 PNG。

## Global Constraints

- 不寫死絕對路徑（`/css/...`）；所有內部連結／靜態資源使用 `import.meta.env.BASE_URL` 前綴。
- React island 一律 `client:only="react"`，Astro 模板中字面 JSX 引用（禁止動態查找表）。
- 互動元件是「預先設計的展示」，不開放自由調參；資料集/清單白名單制。
- Plotly 3D 相關規則本次不適用（本章節無 3D 圖表）。
- 對話與程式內容一律繁體中文；不寫多行註解，只在動機非顯而易見時加單行註解。
- 修改既有共用檔案（`content.config.ts`、`[slug].astro`）時，不得破壞 `simple-linear-regression`／`multiple-linear-regression` 兩個既有章節的渲染。
- 每完成一個 Task 後執行 `npm run test`，確保既有 15 項測試 + 新增測試全數通過，不得讓既有測試變紅。

---

## Task 1: 課程資料模組 `curriculum.ts`

**Files:**
- Create: `src/config/curriculum.ts`
- Test: `src/config/curriculum.test.ts`

**Interfaces:**
- Produces: `CurriculumTopic { name: string; slug?: string; relatedTo?: string[] }`、
  `CurriculumParadigm = 'foundational' | 'supervised' | 'unsupervised' | 'other'`、
  `CurriculumStage { stage: string; paradigm: CurriculumParadigm; topics: CurriculumTopic[] }`、
  `curriculum: CurriculumStage[]`、`allTopics: CurriculumTopic[]`、
  `findTopicByName(name: string): CurriculumTopic | undefined`
  這些名稱與型別供 Task 3（`CourseKnowledgeMap.tsx`）直接 import 使用，不可更動命名。

- [ ] **Step 1: 寫失敗測試**

建立 `src/config/curriculum.test.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { curriculum, allTopics, findTopicByName } from './curriculum';

describe('curriculum', () => {
  it('has exactly 8 stages, matching dir.txt', () => {
    expect(curriculum).toHaveLength(8);
  });

  it('stage order matches dir.txt', () => {
    expect(curriculum[0].stage).toBe('階段一：課程導覽');
    expect(curriculum[2].stage).toBe('階段三：監督式學習－迴歸');
    expect(curriculum[7].stage).toBe('階段八：模型解釋');
  });

  it('every relatedTo reference points to an existing topic name', () => {
    allTopics.forEach((topic) => {
      (topic.relatedTo ?? []).forEach((relatedName) => {
        expect(
          findTopicByName(relatedName),
          `"${topic.name}" 的關聯項目 "${relatedName}" 找不到對應主題`
        ).toBeDefined();
      });
    });
  });

  it('marks exactly the three currently-built chapters as having a slug', () => {
    const builtNames = allTopics.filter((t) => t.slug).map((t) => t.name);
    expect(builtNames).toEqual([
      '機器學習介紹（含全課程知識地圖）',
      'Simple Linear Regression（簡單線性回歸）',
      'Multiple Linear Regression（多元線性回歸）',
    ]);
  });

  it('findTopicByName returns undefined for unknown names', () => {
    expect(findTopicByName('不存在的主題')).toBeUndefined();
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test -- curriculum`
Expected: FAIL（`Cannot find module './curriculum'`）

- [ ] **Step 3: 實作 `curriculum.ts`**

```ts
export interface CurriculumTopic {
  name: string;
  slug?: string;
  relatedTo?: string[];
}

export type CurriculumParadigm = 'foundational' | 'supervised' | 'unsupervised' | 'other';

export interface CurriculumStage {
  stage: string;
  paradigm: CurriculumParadigm;
  topics: CurriculumTopic[];
}

export const curriculum: CurriculumStage[] = [
  {
    stage: '階段一：課程導覽',
    paradigm: 'foundational',
    topics: [
      { name: '機器學習介紹（含全課程知識地圖）', slug: 'machine-learning-introduction' },
      { name: 'CRISP-DM 資料分析方法' },
    ],
  },
  {
    stage: '階段二：方法論基礎',
    paradigm: 'foundational',
    topics: [
      { name: '特徵工程與標準化' },
      { name: '訓練/測試切分與交叉驗證' },
      { name: '過擬合/欠擬合與偏差-變異數權衡' },
    ],
  },
  {
    stage: '階段三：監督式學習－迴歸',
    paradigm: 'supervised',
    topics: [
      { name: 'Simple Linear Regression（簡單線性回歸）', slug: 'simple-linear-regression' },
      { name: 'Multiple Linear Regression（多元線性回歸）', slug: 'multiple-linear-regression' },
      { name: 'Polynomial Regression（多項式回歸）' },
      { name: 'Ridge Regression（Ridge 迴歸，正則化）' },
      { name: 'Lasso Regression（Lasso 迴歸，正則化）' },
      {
        name: 'Logistic Regression（邏輯斯迴歸）',
        relatedTo: ['Multiple Linear Regression（多元線性回歸）'],
      },
    ],
  },
  {
    stage: '階段四：監督式學習－分類',
    paradigm: 'supervised',
    topics: [
      { name: 'KNN（K 最近鄰）', relatedTo: ['K-Means'] },
      { name: 'Naive Bayes（樸素貝氏）' },
      { name: 'Support Vector Machine（SVM）' },
      {
        name: 'Decision Tree（決策樹）',
        relatedTo: ['Bagging（Random Forest，隨機森林）', 'Boosting（AdaBoost / Gradient Boosting）'],
      },
    ],
  },
  {
    stage: '階段五：集成方法',
    paradigm: 'supervised',
    topics: [
      { name: 'Bagging（Random Forest，隨機森林）', relatedTo: ['Decision Tree（決策樹）'] },
      { name: 'Boosting（AdaBoost / Gradient Boosting）', relatedTo: ['Decision Tree（決策樹）'] },
    ],
  },
  {
    stage: '階段六：非監督式學習',
    paradigm: 'unsupervised',
    topics: [
      { name: 'PCA（主成分分析）', relatedTo: ['K-Means'] },
      { name: 'K-Means', relatedTo: ['PCA（主成分分析）', 'KNN（K 最近鄰）'] },
      { name: 'Hierarchical Clustering（階層式分群）' },
      { name: 'DBSCAN' },
    ],
  },
  {
    stage: '階段七：神經網路',
    paradigm: 'other',
    topics: [{ name: '神經網路' }],
  },
  {
    stage: '階段八：模型解釋',
    paradigm: 'foundational',
    topics: [{ name: '模型可解釋性' }],
  },
];

export const allTopics: CurriculumTopic[] = curriculum.flatMap((s) => s.topics);

export function findTopicByName(name: string): CurriculumTopic | undefined {
  return allTopics.find((t) => t.name === name);
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npm run test -- curriculum`
Expected: PASS（5 項測試全過）

- [ ] **Step 5: Commit**

```bash
git add src/config/curriculum.ts src/config/curriculum.test.ts
git commit -m "Add curriculum data module for course knowledge map"
```

---

## Task 2: Schema 與範本改為條件渲染摘要卡片

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/pages/chapters/[slug].astro`

**Interfaces:**
- Consumes: 無（純結構調整）
- Produces: `chapter.data.summary` 型別變為 `optional`；新增 `chapter.data.conceptMapImage?: ImageMetadata`，供 Task 5 使用。

- [ ] **Step 1: 修改 schema，`summary` 改為 optional，新增 `conceptMapImage`**

編輯 `src/content.config.ts`，將：

```ts
      interactiveComponent: z.string().optional(),
      summary: z.object({
        formulas: z.array(z.string()),
        keyStats: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
          })
        ),
        image: image().optional(),
      }),
```

改為：

```ts
      interactiveComponent: z.string().optional(),
      conceptMapImage: image().optional(),
      summary: z
        .object({
          formulas: z.array(z.string()),
          keyStats: z.array(
            z.object({
              label: z.string(),
              value: z.string(),
            })
          ),
          image: image().optional(),
        })
        .optional(),
```

- [ ] **Step 2: `[slug].astro` 改為條件渲染摘要卡片**

編輯 `src/pages/chapters/[slug].astro`，將導覽列這行：

```astro
        <a href="#summary">資訊圖表</a>
```

改為：

```astro
        {chapter.data.summary && <a href="#summary">資訊圖表</a>}
```

並將：

```astro
    <ChapterSummaryCard
      formulas={chapter.data.summary.formulas}
      keyStats={chapter.data.summary.keyStats}
      image={chapter.data.summary.image}
    />
```

改為：

```astro
    {chapter.data.summary && (
      <ChapterSummaryCard
        formulas={chapter.data.summary.formulas}
        keyStats={chapter.data.summary.keyStats}
        image={chapter.data.summary.image}
      />
    )}
```

- [ ] **Step 3: 執行既有測試、型別檢查、build，確認既有章節不受影響**

Run: `npm run test`
Expected: PASS（15 項既有 + Task 1 新增 5 項，共 20 項）

Run: `npx astro check`
Expected: 0 errors / 0 warnings

Run: `npm run build`
Expected: 成功建置，仍只有 3 個頁面（首頁 + 既有 2 章節；本章節內容要到 Task 5 才新增）

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/pages/chapters/[slug].astro
git commit -m "Make chapter summary infographic optional in schema and template"
```

---

## Task 3: 互動式知識地圖元件 `CourseKnowledgeMap.tsx`

**Files:**
- Create: `src/components/CourseKnowledgeMap.tsx`
- Modify: `src/styles/global.css`（新增區塊，附加在檔案末尾）

**Interfaces:**
- Consumes: `curriculum`, `allTopics`, `findTopicByName`, `CurriculumTopic` from `../config/curriculum`（Task 1 產物）
- Produces: `export default function CourseKnowledgeMap()`，無 props，供 Task 5 的 `[slug].astro` 以 `<CourseKnowledgeMap client:only="react">` 掛載。

- [ ] **Step 1: 實作元件**

建立 `src/components/CourseKnowledgeMap.tsx`：

```tsx
import { curriculum, findTopicByName, type CurriculumTopic } from '../config/curriculum';

const paradigmLabels: Record<string, string> = {
  foundational: '基礎',
  supervised: '監督式',
  unsupervised: '非監督式',
  other: '進階',
};

function RelatedLinks({ names, base }: { names: string[]; base: string }) {
  return (
    <p className="knowledge-map__related">
      相關：
      {names.map((name, index) => {
        const related = findTopicByName(name);
        return (
          <span key={name}>
            {index > 0 && '、'}
            {related?.slug ? <a href={`${base}chapters/${related.slug}/`}>{name}</a> : name}
          </span>
        );
      })}
    </p>
  );
}

function TopicItem({ topic, base }: { topic: CurriculumTopic; base: string }) {
  const isBuilt = Boolean(topic.slug);
  return (
    <li className={`knowledge-map__topic ${isBuilt ? 'is-built' : 'is-upcoming'}`}>
      {isBuilt ? (
        <a href={`${base}chapters/${topic.slug}/`}>{topic.name}</a>
      ) : (
        <>
          {topic.name}
          <span className="knowledge-map__badge">即將推出</span>
        </>
      )}
      {topic.relatedTo && topic.relatedTo.length > 0 && (
        <RelatedLinks names={topic.relatedTo} base={base} />
      )}
    </li>
  );
}

export default function CourseKnowledgeMap() {
  const base = import.meta.env.BASE_URL;

  return (
    <div className="knowledge-map">
      {curriculum.map((stageGroup) => (
        <section key={stageGroup.stage} className="knowledge-map__stage">
          <h3 className="knowledge-map__stage-title">
            {stageGroup.stage}
            <span className={`knowledge-map__paradigm-badge is-${stageGroup.paradigm}`}>
              {paradigmLabels[stageGroup.paradigm]}
            </span>
          </h3>
          <ul className="knowledge-map__topics">
            {stageGroup.topics.map((topic) => (
              <TopicItem key={topic.name} topic={topic} base={base} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 新增對應 CSS**

在 `src/styles/global.css` 檔案末尾新增：

```css
/* ---------------------------------------------------------------------------
   Course knowledge map
--------------------------------------------------------------------------- */
.knowledge-map {
  display: grid;
  gap: var(--space-xl);
}

.knowledge-map__stage {
  padding: var(--space-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.knowledge-map__stage-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin: 0 0 var(--space-md);
  font-size: var(--step-1);
  font-weight: 650;
}

.knowledge-map__paradigm-badge {
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-pill);
  font-size: var(--step--1);
  font-weight: 650;
  color: var(--color-text-muted);
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-border-strong);
}

.knowledge-map__paradigm-badge.is-supervised {
  color: var(--color-accent);
  border-color: rgb(var(--accent-rgb) / 0.45);
  background: rgb(var(--accent-rgb) / 0.12);
}

.knowledge-map__paradigm-badge.is-unsupervised {
  color: var(--color-accent-secondary);
  border-color: rgb(var(--accent-2-rgb) / 0.45);
  background: rgb(var(--accent-2-rgb) / 0.12);
}

.knowledge-map__topics {
  display: grid;
  gap: var(--space-sm);
  list-style: none;
  margin: 0;
  padding: 0;
}

.knowledge-map__topic {
  padding-inline-start: var(--space-md);
  border-inline-start: 2px solid var(--color-border-strong);
}

.knowledge-map__topic.is-built a {
  font-weight: 650;
  color: var(--color-text);
  text-decoration: none;
}

.knowledge-map__topic.is-built a:hover {
  color: var(--color-accent);
}

.knowledge-map__topic.is-upcoming {
  color: var(--color-text-muted);
}

.knowledge-map__badge {
  margin-inline-start: var(--space-xs);
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  font-size: var(--step--1);
  color: var(--color-text-muted);
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-border-strong);
}

.knowledge-map__related {
  margin: var(--space-2xs) 0 0;
  font-size: var(--step--1);
  color: var(--color-text-muted);
}

.knowledge-map__related a {
  color: var(--color-accent);
}

.knowledge-map__concept-image {
  display: block;
  max-inline-size: 100%;
  block-size: auto;
  margin: 0 0 var(--space-xl);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
```

- [ ] **Step 3: 型別檢查**

Run: `npx astro check`
Expected: 0 errors / 0 warnings（此元件尚未被任何頁面掛載，但仍會被 TypeScript 專案設定掃到並檢查型別正確性）

- [ ] **Step 4: Commit**

```bash
git add src/components/CourseKnowledgeMap.tsx src/styles/global.css
git commit -m "Add CourseKnowledgeMap interactive component and styles"
```

---

## Task 4: 靜態概念關聯圖（Excalidraw 手繪風格 PNG）

**Files:**
- Create: `docs/specs/assets-src/ml-curriculum-concept-map.html`
- Create: `scripts/render-ml-curriculum-concept-map.ps1`
- Generates: `src/assets/chapters/ml-curriculum-concept-map.png`

**Interfaces:**
- Produces: `src/assets/chapters/ml-curriculum-concept-map.png`，供 Task 5 的 `conceptMapImage` frontmatter 欄位引用。

此圖呈現 6 條演算法概念關聯（見 spec 第 3a 節），版面設計為 2 欄 × 3 列的「關聯卡片」網格，每張卡片內兩個手繪方框 + 一條手繪箭頭連接，卡片下方一行手寫說明文字。視覺語彙（紙張底色、手寫字體、rough.js 手繪引擎）沿用既有 `simple-linear-regression-summary.html`。

- [ ] **Step 1: 建立 HTML 骨架與卡片 CSS**

建立 `docs/specs/assets-src/ml-curriculum-concept-map.html`：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>全課程知識地圖 概念關聯圖（Excalidraw 風格）</title>
  <style>
    :root {
      --paper: #f3efe2;
      --ink: #2b2a33;
      --ink-soft: #4a4854;
      --box-a: #2f8f7a;
      --box-a-fill: #dcf0ec;
      --box-b: #c07f2e;
      --box-b-fill: #f7e9d2;
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
      background: #f3efe2;
    }
    .page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      background: var(--paper);
      padding: 16mm 14mm;
      color: var(--ink);
      font-family: "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive;
    }
    h1.main-title {
      text-align: center;
      font-size: 36px;
      margin: 0 0 24px;
    }
    .concept-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .concept-card {
      position: relative;
      height: 220px;
      border: 2px solid transparent;
    }
    .concept-card__canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .concept-card__box {
      position: absolute;
      width: 150px;
      padding: 10px 12px;
      font-size: 16px;
      line-height: 1.3;
      text-align: center;
      background: var(--box-a-fill);
      border: 2px solid var(--box-a);
      border-radius: 8px;
      z-index: 1;
    }
    .concept-card__box--b {
      background: var(--box-b-fill);
      border-color: var(--box-b);
    }
    .concept-card__box--a { left: 8px; top: 8px; }
    .concept-card__box--b { left: 196px; top: 128px; }
    .concept-card__sub {
      font-family: "Segoe UI", sans-serif;
      font-size: 12px;
      color: var(--ink-soft);
    }
    .concept-card__caption {
      position: absolute;
      left: 8px;
      bottom: 4px;
      right: 8px;
      font-size: 14px;
      color: var(--ink-soft);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="page">
    <h1 class="main-title">全課程知識地圖：演算法概念關聯</h1>
    <div class="concept-grid" id="concept-grid">
      <!-- 6張卡片由 JS 依 CARDS 陣列產生 -->
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 2: 複製既有 rough.js 手繪引擎區塊**

從 `docs/specs/assets-src/simple-linear-regression-summary.html` 複製第 502 行到第 640 行之間的 `<script>...</script>`（rough.js 函式庫本體，內容以
`var rough = function () { ... }()` 開頭），原封不動貼到 `ml-curriculum-concept-map.html` 的
`</body>` 前、下一步驟腳本之前。此區塊是通用手繪渲染引擎，不含任何章節特定內容，可直接重用。

- [ ] **Step 3: 撰寫卡片產生與箭頭繪製腳本**

緊接著在 rough.js 引擎區塊之後，加入：

```html
  <script>
    var CARDS = [
      { a: 'Linear Regression', aSub: '（迴歸）', b: 'Logistic Regression', bSub: '（分類）', caption: '迴歸走向分類的橋樑', both: false },
      { a: 'Decision Tree', aSub: '（單一樹）', b: 'Random Forest', bSub: '（Bagging 集成）', caption: 'Bagging：多顆 Decision Tree 組成', both: false },
      { a: 'Decision Tree', aSub: '（單一樹）', b: 'Boosting', bSub: '（AdaBoost / GB）', caption: '弱學習器逐步疊加組成', both: false },
      { a: 'PCA', aSub: '（降維）', b: 'Clustering', bSub: '（分群）', caption: '常作為分群前的前處理', both: false },
      { a: 'KNN', aSub: '（分類）', b: 'K-Means', bSub: '（分群）', caption: '同屬距離基礎方法', both: true },
      { a: '監督式學習', aSub: '（有標籤）', b: '非監督式學習', bSub: '（無標籤）', caption: '本課程兩大學習典範', both: true },
    ];

    function drawArrow(rc, x1, y1, x2, y2, opts, both) {
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
      if (both) head(x1, y1, angle + Math.PI);
    }

    var grid = document.getElementById('concept-grid');
    CARDS.forEach(function (card) {
      var el = document.createElement('div');
      el.className = 'concept-card';
      el.innerHTML =
        '<canvas class="concept-card__canvas" width="360" height="220"></canvas>' +
        '<div class="concept-card__box concept-card__box--a">' + card.a + '<br><span class="concept-card__sub">' + card.aSub + '</span></div>' +
        '<div class="concept-card__box concept-card__box--b">' + card.b + '<br><span class="concept-card__sub">' + card.bSub + '</span></div>' +
        '<p class="concept-card__caption">' + card.caption + '</p>';
      grid.appendChild(el);

      var canvas = el.querySelector('canvas');
      var rc = rough.canvas(canvas, {});
      drawArrow(rc, 150, 55, 196, 128, { roughness: 1.8, bowing: 2, stroke: '#2b2a33', strokeWidth: 2.5 }, card.both);
    });
  </script>
</body>
```

- [ ] **Step 4: 建立渲染腳本**

複製 `scripts/render-infographic.ps1` 為 `scripts/render-ml-curriculum-concept-map.ps1`，並將檔案路徑改為：

```powershell
$htmlPath = "C:/Users/User/Desktop/Machine Learning Study/docs/specs/assets-src/ml-curriculum-concept-map.html"
$outputPath = "C:/Users/User/Desktop/Machine Learning Study/src/assets/chapters/ml-curriculum-concept-map.png"
```

其餘內容（Edge 路徑偵測、`--window-size=794,1810` 等）維持與原檔一致。

- [ ] **Step 5: 執行渲染並檢視結果**

Run: `powershell -File "scripts/render-ml-curriculum-concept-map.ps1"`
Expected: `Rendering completed successfully!`，`src/assets/chapters/ml-curriculum-concept-map.png` 產生

用 Read 工具開啟該 PNG 檢視渲染結果：確認 6 張卡片排列整齊、文字未截斷或重疊、箭頭有畫出來且方向正確（單向箭頭 4 張、雙向箭頭 2 張）。若座標/間距明顯跑版（例如文字溢出方框、箭頭起訖點對不齊），回到 Step 1/3 微調 `.concept-card__box` 的 `left/top` 或 `drawArrow` 座標後重新渲染，直到版面正常為止。

- [ ] **Step 6: Commit**

```bash
git add docs/specs/assets-src/ml-curriculum-concept-map.html scripts/render-ml-curriculum-concept-map.ps1 src/assets/chapters/ml-curriculum-concept-map.png
git commit -m "Add Excalidraw-style concept relation map for course knowledge map"
```

---

## Task 5: 章節內容、註冊與範本掛載

**Files:**
- Create: `src/content/chapters/machine-learning-introduction.md`
- Modify: `src/config/chapters.ts`
- Modify: `src/pages/chapters/[slug].astro`

**Interfaces:**
- Consumes: `CourseKnowledgeMap`（Task 3）、`ml-curriculum-concept-map.png`（Task 4）、`conceptMapImage`/`summary` optional schema（Task 2）
- Produces: 可存取頁面 `chapters/machine-learning-introduction/`

- [ ] **Step 1: 撰寫章節內容**

建立 `src/content/chapters/machine-learning-introduction.md`：

```markdown
---
title: 機器學習介紹
stage: 課程導覽
category:
  - 課程導覽
interactiveComponent: course-knowledge-map
conceptMapImage: ../../assets/chapters/ml-curriculum-concept-map.png
---

## 簡介

機器學習（Machine Learning, ML）是人工智慧的一個分支，讓電腦系統能從資料中「學習」規律，而不需要工程師針對每一種情況寫死規則。傳統程式設計是「輸入資料 + 規則 → 產出答案」；機器學習則反過來，用「輸入資料 + 已知答案 → 學出規則（模型）」，之後再用這個模型對新資料做預測。本網站以互動視覺化的方式，帶你從最基礎的線性回歸開始，逐步認識監督式學習、非監督式學習、集成方法、神經網路等核心主題，並理解如何為手上的問題選擇合適的方法。

## 機器學習的分類

- **依學習方式**：
  - 監督式學習（Supervised Learning）：訓練資料同時包含輸入與正確答案（標籤），模型學習輸入與答案之間的對應關係，例如用歷史房屋成交價訓練房價預測模型。
  - 非監督式學習（Unsupervised Learning）：訓練資料只有輸入、沒有標籤，模型自行找出資料中的結構或規律，例如將顧客依消費行為分群。
  - 強化學習（Reinforcement Learning）：透過與環境互動、依獎懲訊號調整策略，例如訓練遊戲 AI 或機器人控制（本站暫不涵蓋此主題）。
- **依任務類型**：
  - 迴歸（Regression）：預測連續數值，例如房價、氣溫。
  - 分類（Classification）：預測離散類別，例如垃圾郵件判斷、疾病診斷。
  - 分群（Clustering）：在沒有標籤的情況下，將資料依相似性分組。

## 典型應用場景

- **房價預測**：依地區、坪數、屋齡等特徵，預測房屋成交價格（迴歸）。
- **垃圾郵件分類**：依郵件內容特徵，判斷是否為垃圾郵件（分類）。
- **客戶分群**：依消費行為將顧客分組，作為行銷策略依據（分群）。
- **影像辨識**：辨識照片中的物件類別，例如人臉辨識、醫療影像診斷（分類）。
- **推薦系統**：依使用者過去行為，推薦可能感興趣的商品或內容（結合分類與分群技術）。

## 常見誤區

- **機器學習等同於人工智慧**：機器學習是實現人工智慧的其中一種方法，人工智慧的範疇更廣，還包含符號邏輯推理、專家系統等非資料驅動的方法。
- **資料量越多，模型一定越好**：資料的品質與代表性比單純的數量更重要，充滿雜訊或有偏差的大量資料，反而會讓模型學到錯誤的規律。
- **模型越複雜，效果一定越好**：過於複雜的模型容易發生過擬合（Overfitting），在訓練資料上表現很好，但套用到新資料時表現卻變差。
- **相關性不等於因果性**：兩個變數同時變動，不代表其中一個「造成」另一個發生，可能只是同時受第三個因素影響。

## 全課程知識地圖

下圖整理了本站涵蓋的演算法之間的核心概念關聯；下方清單則依規劃的八個學習階段，列出完整課程主題——已完成的章節可以直接點擊前往，尚未建置的章節會標示「即將推出」。
```

- [ ] **Step 2: 註冊章節於 `chapters.ts`**

編輯 `src/config/chapters.ts`，在 `chapterOrder` 陣列最前面新增一筆，改為：

```ts
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
```

- [ ] **Step 3: 在 `[slug].astro` 掛載互動元件與概念圖**

編輯 `src/pages/chapters/[slug].astro`，於檔案開頭 import 區塊新增：

```astro
import { Image } from 'astro:assets';
import CourseKnowledgeMap from '../../components/CourseKnowledgeMap';
```

在既有 `RegressionScatter2D` 分支之後，新增：

```astro
    {chapter.data.interactiveComponent === 'course-knowledge-map' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        {chapter.data.conceptMapImage && (
          <Image
            src={chapter.data.conceptMapImage}
            alt="全課程演算法概念關聯圖"
            class="knowledge-map__concept-image"
          />
        )}
        <CourseKnowledgeMap client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">知識地圖載入中……</div>
        </CourseKnowledgeMap>
      </section>
    )}
```

- [ ] **Step 4: 執行完整驗證**

Run: `npm run test`
Expected: PASS（20 項全過）

Run: `npx astro check`
Expected: 0 errors / 0 warnings

Run: `npm run build`
Expected: 成功建置，共 4 個頁面（首頁 + 3 章節）

- [ ] **Step 5: Commit**

```bash
git add src/content/chapters/machine-learning-introduction.md src/config/chapters.ts src/pages/chapters/[slug].astro
git commit -m "Add machine-learning-introduction chapter with knowledge map"
```

---

## Task 6: 瀏覽器實測與收工驗證

**Files:** 無新增/修改檔案，僅驗證。

- [ ] **Step 1: 啟動 dev server**

Run: `npm run dev`

- [ ] **Step 2: 瀏覽器檢查（依 CLAUDE.md 規則，UI 變更須實際在瀏覽器測試）**

開啟 `http://localhost:4321/Machine-Learning-Study/chapters/machine-learning-introduction/`，確認：
- 5 個區塊（簡介／機器學習的分類／典型應用場景／常見誤區／全課程知識地圖）依序顯示，標題底線進場動畫正常
- 導覽列（`.chapter__jump-nav`）**不**出現「資訊圖表」連結（因本章節無 `summary`）
- 概念關聯圖 PNG 正常顯示，無破圖
- 互動式清單依 8 階段分組顯示，`Simple/Multiple Linear Regression`、本章節自身節點可點擊且可正確跳轉；其餘節點反灰並顯示「即將推出」
- 有 `relatedTo` 的節點（如 Decision Tree、Random Forest 等）下方顯示「相關：」標註
- 開啟首頁 `http://localhost:4321/Machine-Learning-Study/`，確認章節清單第一項變成「機器學習介紹」
- 確認既有兩個章節（Simple/Multiple Linear Regression）頁面渲染正常、摘要圖表卡片一切如常（回歸測試）

若發現任何顯示異常，停止並與開發者討論方向，不可自行臆測原因直接修改重跑（依 CLAUDE.md 錯誤處理規則）。

- [ ] **Step 3: 關閉 dev server**

Run: `npx astro dev stop`（或依實際啟動方式終止對應行程）

Run: `npx astro dev status`
Expected: `No dev server is running.`

- [ ] **Step 4: 最終確認**

Run: `npm run test && npx astro check && npm run build`
Expected: 三項全數通過，無殘留 dev server

---

## Self-Review 紀錄

- **Spec coverage**：spec 第 2 節（5 區塊內容）→ Task 5 Step 1；第 3a 節（概念關聯圖）→ Task 4；第 3b 節（互動清單）→ Task 1 + Task 3；第 4 節（schema/範本調整）→ Task 2；第 5 節（章節註冊）→ Task 5 Step 2。全數涵蓋。
- **Placeholder scan**：Task 4 Step 5 保留一個「若跑版則微調座標」的有界疊代迴圈——這是視覺類資產的正常作法（原始 `simple-linear-regression-summary.html` 也是透過實際渲染疊代完成），非模糊佔位符，已給出明確的檢查清單與調整目標。其餘步驟皆為完整可執行程式碼。
- **Type consistency**：`CurriculumTopic`／`CurriculumStage`／`findTopicByName` 命名在 Task 1 定義後，Task 3 原樣沿用；`conceptMapImage`／`summary` optional 欄位在 Task 2 定義後，Task 5 原樣沿用；`interactiveComponent === 'course-knowledge-map'` 字串在 Task 5 的 frontmatter 與 `[slug].astro` 分支中一致。
