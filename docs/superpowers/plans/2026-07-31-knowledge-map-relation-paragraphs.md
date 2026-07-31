# 知識地圖關聯段落調整 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除「機器學習介紹」章節中展示效果不佳的概念關聯圖片（及其造成的所有孤兒程式碼/資產），改以「簡介」段落文字承載跨章節關聯，並在章節範本指南中為未來章節記錄剩餘的關聯規則。

**Architecture:** 純內容與設定調整，不涉及新元件或新資料結構。分四個獨立任務：(1) 移除概念圖片渲染機制與其造成的孤兒程式碼，(2) 刪除概念圖片相關的原始資產檔，(3) 在 Multiple Linear Regression 簡介新增與 Logistic Regression 的關聯段落，(4) 在章節範本指南新增跨章節關聯段落規則供未來章節參考。每個任務結束皆以 `npx astro check` + `npm run build` 驗證整站仍可正確建置。

**Tech Stack:** Astro (Content Layer API) + TypeScript + Markdown frontmatter；無需新增依賴。

## Global Constraints

- 依已核准設計文件 `docs/superpowers/specs/2026-07-31-knowledge-map-relation-paragraphs-design.md`：本階段僅處理「Multiple Linear Regression ↔ Logistic Regression」一組關聯的實際內文；其餘 4 組關聯（Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means）僅寫入設計文件/範本指南，不動任何章節內文。
- 「監督式學習 ↔ 非監督式學習」不適用跨章節關聯段落規則，不處理。
- `docs/specs/assets-src/rough-engine.js` 為共用檔案，任何任務都不得刪除或修改。
- `docs/superpowers/plans/2026-07-30-*.md`、`docs/superpowers/specs/2026-07-30-*.md` 為歷史紀錄，任何任務都不得修改。
- `CourseKnowledgeMap.tsx` 元件與 `src/config/curriculum.ts` 的 `relatedTo` 資料結構本次不變動。
- 每個任務改動後必須執行 `npx astro check`（預期 0 錯誤/0 警告）與 `npm run build`（預期成功產出頁面），驗證通過才能進入下一任務。

---

### Task 1: 移除概念關聯圖片的渲染機制與孤兒程式碼

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/pages/chapters/[slug].astro`
- Modify: `src/styles/global.css`
- Modify: `src/content/chapters/machine-learning-introduction.md`

**Interfaces:**
- Consumes: 無（本任務起點，基於目前 main 分支現狀）
- Produces: `chapters` content collection schema 不再有 `conceptMapImage` 欄位；`machine-learning-introduction` 頁面的 `interactiveComponent === 'course-knowledge-map'` 區塊只渲染 `<CourseKnowledgeMap>`，不再有任何 `conceptMapImage` 相關的 JSX 或 CSS class 殘留，供 Task 2 據此安全刪除底層資產檔。

- [ ] **Step 1: 移除 content collection schema 的 `conceptMapImage` 欄位**

在 `src/content.config.ts` 中：

```ts
// 修改前
      interactiveComponent: z.string().optional(),
      conceptMapImage: image().optional(),
      summary: z

// 修改後
      interactiveComponent: z.string().optional(),
      summary: z
```

- [ ] **Step 2: 移除 `[slug].astro` 中未使用的 `Image` import**

在 `src/pages/chapters/[slug].astro` 中：

```astro
// 修改前
import { getCollection, render, type CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';

// 修改後
import { getCollection, render, type CollectionEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
```

- [ ] **Step 3: 移除 `[slug].astro` 中的 `conceptMapImage` 條件渲染區塊**

同一檔案中：

```astro
// 修改前
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

// 修改後
    {chapter.data.interactiveComponent === 'course-knowledge-map' && (
      <section class="chapter__interactive" id="interactive">
        <h2>互動式操作與演示</h2>
        <CourseKnowledgeMap client:only="react">
          <div slot="fallback" class="regression-chart__skeleton">知識地圖載入中……</div>
        </CourseKnowledgeMap>
      </section>
    )}
```

- [ ] **Step 4: 移除 `global.css` 中未使用的 `.knowledge-map__concept-image` 樣式**

在 `src/styles/global.css` 中（`.knowledge-map__related a` 規則之後）：

```css
/* 修改前 */
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

/* 修改後 */
.knowledge-map__related a {
  color: var(--color-accent);
}
```

- [ ] **Step 5: 更新 `machine-learning-introduction.md` — 移除 frontmatter 欄位並改寫引導句**

在 `src/content/chapters/machine-learning-introduction.md` 中：

```markdown
<!-- frontmatter 修改前 -->
---
title: 機器學習介紹
stage: 課程導覽
category:
  - 課程導覽
interactiveComponent: course-knowledge-map
conceptMapImage: ../../assets/chapters/ml-curriculum-concept-map.png
---

<!-- frontmatter 修改後 -->
---
title: 機器學習介紹
stage: 課程導覽
category:
  - 課程導覽
interactiveComponent: course-knowledge-map
---
```

```markdown
<!-- 內文修改前 -->
## 全課程知識地圖

下圖整理了本站涵蓋的演算法之間的核心概念關聯；下方清單則依規劃的八個學習階段，列出完整課程主題——已完成的章節可以直接點擊前往，尚未建置的章節會標示「即將推出」。

<!-- 內文修改後 -->
## 全課程知識地圖

下方清單依規劃的八個學習階段，列出完整課程主題——已完成的章節可以直接點擊前往，尚未建置的章節會標示「即將推出」；主題旁若標示「相關」，代表與其他主題間的核心概念關聯，同樣可以點擊查看。
```

- [ ] **Step 6: 驗證型別檢查與建置**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告（確認 schema 移除欄位後無殘留引用）

Run: `npm run build`
Expected: 建置成功，4 個頁面正常產出，無報錯

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/pages/chapters/[slug].astro src/styles/global.css src/content/chapters/machine-learning-introduction.md
git commit -m "$(cat <<'EOF'
Remove concept-map image rendering from ML introduction chapter

The image displayed poorly and the existing 8-stage interactive
links (with their built-in "相關" related-topic links) already
cover the same information, so the image and its schema field,
render block, and CSS are removed as this change's orphans.
EOF
)"
```

---

### Task 2: 刪除概念關聯圖片的原始資產檔案

**Files:**
- Delete: `src/assets/chapters/ml-curriculum-concept-map.png`
- Delete: `docs/specs/assets-src/ml-curriculum-concept-map.html`
- Delete: `scripts/render-ml-curriculum-concept-map.ps1`
- Modify: `docs/specs/chapter_template_guide.md`

**Interfaces:**
- Consumes: Task 1 已確認 `conceptMapImage` 在程式碼中無任何引用，本任務刪除的檔案在程式碼層面已無任何地方載入。
- Produces: 無（純刪除 + 文件更新，無後續任務依賴此任務產出的介面）

- [ ] **Step 1: 刪除三個孤兒檔案**

```bash
git rm src/assets/chapters/ml-curriculum-concept-map.png
git rm docs/specs/assets-src/ml-curriculum-concept-map.html
git rm scripts/render-ml-curriculum-concept-map.ps1
```

- [ ] **Step 2: 更新 `chapter_template_guide.md` 第 5 節，移除對已刪除檔案的舉例引用**

在 `docs/specs/chapter_template_guide.md` 中：

```markdown
<!-- 修改前 -->
  1. **Excalidraw 手繪風格**（目前唯一採用的風格）：`simple-linear-regression-summary.png`、`ml-curriculum-concept-map.png` 皆採用此風格，實作方式是用 rough.js（Excalidraw 本身的手繪渲染引擎）搭配 HTML/CSS 排版、手寫字體（如 Segoe Print），寫成一頁網頁後，用無頭瀏覽器（headless msedge）渲染輸出成 PNG——**不是**用 AI 圖像生成模型直接畫。rough.js 引擎程式碼統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`，各資產 HTML 以 `<script src="rough-engine.js"></script>` 引入，不再逐檔複製。

<!-- 修改後 -->
  1. **Excalidraw 手繪風格**（目前唯一採用的風格）：`simple-linear-regression-summary.png` 採用此風格，實作方式是用 rough.js（Excalidraw 本身的手繪渲染引擎）搭配 HTML/CSS 排版、手寫字體（如 Segoe Print），寫成一頁網頁後，用無頭瀏覽器（headless msedge）渲染輸出成 PNG——**不是**用 AI 圖像生成模型直接畫。rough.js 引擎程式碼統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`，各資產 HTML 以 `<script src="rough-engine.js"></script>` 引入，不再逐檔複製。
```

- [ ] **Step 3: 驗證型別檢查與建置**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，4 個頁面正常產出

- [ ] **Step 4: Commit**

```bash
git add docs/specs/chapter_template_guide.md
git commit -m "$(cat <<'EOF'
Delete orphaned concept-map source assets

PNG, source HTML, and render script were only used by the removed
concept-map image feature (previous commit). Also drops the now-stale
example reference in the template guide.
EOF
)"
```

---

### Task 3: 在 Multiple Linear Regression 簡介新增與 Logistic Regression 的關聯段落

**Files:**
- Modify: `src/content/chapters/multiple-linear-regression.md`

**Interfaces:**
- Consumes: 無
- Produces: 無（純內容變更）

- [ ] **Step 1: 在「簡介」段落現有內文後新增關聯段落**

在 `src/content/chapters/multiple-linear-regression.md` 中：

```markdown
<!-- 修改前 -->
## 簡介

多元線性回歸（Multiple Linear Regression）是簡單線性回歸的延伸：用兩個以上的自變數（特徵）來預測一個連續的目標變數。例如，用一間新創公司在研發（R&D Spend）、行政（Administration）、行銷（Marketing Spend）上的支出，預測它的獲利（Profit）。跟簡單線性回歸一樣，它假設目標變數和每個特徵之間存在線性關係，只是現在這條「線」變成了一個高維度的「平面」或「超平面」。

## 分類方式

<!-- 修改後 -->
## 簡介

多元線性回歸（Multiple Linear Regression）是簡單線性回歸的延伸：用兩個以上的自變數（特徵）來預測一個連續的目標變數。例如，用一間新創公司在研發（R&D Spend）、行政（Administration）、行銷（Marketing Spend）上的支出，預測它的獲利（Profit）。跟簡單線性回歸一樣，它假設目標變數和每個特徵之間存在線性關係，只是現在這條「線」變成了一個高維度的「平面」或「超平面」。

**與 Logistic Regression 的關係**：迴歸走向分類的橋樑。當預測目標從連續數值變成類別（例如「是否違約」）時，同樣的線性組合 $\beta_0+\beta_1x_1+\cdots+\beta_nx_n$ 搭配 Sigmoid 函數轉換成機率，就成為 Logistic Regression，也是本課程從迴歸過渡到分類的第一步。

## 分類方式
```

- [ ] **Step 2: 驗證型別檢查與建置**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

Run: `npm run build`
Expected: 建置成功，4 個頁面正常產出

- [ ] **Step 3: 瀏覽器實測新段落的 KaTeX 公式渲染**

依 `docs/handover.md` 記錄的既有實測方式，用無頭 Microsoft Edge 對本機預覽伺服器的 `multiple-linear-regression` 頁面截圖與 dump DOM，確認新段落文字與行內公式 `\beta_0+\beta_1x_1+\cdots+\beta_nx_n` 正確渲染（無 KaTeX 錯誤紅字、無未轉譯的原始 LaTeX 語法殘留）。

- [ ] **Step 4: Commit**

```bash
git add src/content/chapters/multiple-linear-regression.md
git commit -m "$(cat <<'EOF'
Add Logistic Regression relation paragraph to Multiple Linear Regression intro

Carries forward the "regression to classification" relationship that
used to live only in the now-removed concept-map image.
EOF
)"
```

---

### Task 4: 在章節範本指南新增跨章節關聯段落規則

**Files:**
- Modify: `docs/specs/chapter_template_guide.md`

**Interfaces:**
- Consumes: 無
- Produces: 供未來建置 Decision Tree、Random Forest、Boosting、PCA、K-Means、KNN、Logistic Regression 等章節時參考的規則與對照表（純文件，無程式碼介面）

- [ ] **Step 1: 在第 1 節「簡介」定義後新增 1.1 小節**

在 `docs/specs/chapter_template_guide.md` 中：

```markdown
<!-- 修改前 -->
1. **簡介** (`## 簡介`)  
   定義該演算法是什麼，並說明其主要解決的核心問題。
2. **分類方式** (`## 分類方式`)  

<!-- 修改後 -->
1. **簡介** (`## 簡介`)  
   定義該演算法是什麼，並說明其主要解決的核心問題。

   **1.1 跨章節關聯段落**：若該主題在 `src/config/curriculum.ts` 中設有 `relatedTo`，「簡介」段落須在既有說明後，針對每個關聯主題各補一段獨立段落，格式比照：「**與 {主題} 的關係**：{一句核心比喻}。{1-2 句延伸說明}。」若對應頁面尚未建置，暫不需處理（等該主題本身被建置時再一併確認關聯段落）。

   目前 6 組核心關聯對照表（依原 `ml-curriculum-concept-map.html` 整理，監督式／非監督式學習分類已由「機器學習介紹」章節涵蓋，不適用此規則）：

   | 主題 A | 主題 B | 核心關聯 | 狀態 |
   |---|---|---|---|
   | Multiple Linear Regression | Logistic Regression | 迴歸走向分類的橋樑 | A 側已補充；B 側建置時補上 |
   | Decision Tree | Random Forest（Bagging） | Bagging：多顆 Decision Tree 組成 | 待兩側建置 |
   | Decision Tree | Boosting（AdaBoost/GB） | 弱學習器逐步疊加組成 | 待兩側建置 |
   | PCA | K-Means | 常作為分群前的前處理 | 待兩側建置 |
   | KNN | K-Means | 同屬距離基礎方法 | 待兩側建置 |
2. **分類方式** (`## 分類方式`)  
```

- [ ] **Step 2: 檢查 Markdown 表格渲染**

`docs/specs/chapter_template_guide.md` 為純文件，非網站建置內容，故不需 `astro check`／`npm run build`。改為直接以文字編輯器/預覽確認 Markdown 表格語法正確（欄位數與分隔線 `---` 對齊，5 行資料）。

- [ ] **Step 3: Commit**

```bash
git add docs/specs/chapter_template_guide.md
git commit -m "$(cat <<'EOF'
Document cross-chapter relation paragraph rule for future chapters

Records the remaining 4 relation pairs (Decision Tree/Random Forest,
Decision Tree/Boosting, PCA/K-Means, KNN/K-Means) plus the Logistic
Regression side of the completed MLR pairing, so future chapter
builds pick them up without re-deriving them.
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
Expected: 全數測試通過（`curriculum.test.ts` 等既有測試不受本次變更影響）

- [ ] **Step 2: 型別檢查**

Run: `npx astro check`
Expected: 0 錯誤 / 0 警告

- [ ] **Step 3: 全站建置**

Run: `npm run build`
Expected: 建置成功，4 個頁面正常產出

- [ ] **Step 4: 啟動本機預覽伺服器**

Run: `npm run preview`（背景執行）

- [ ] **Step 5: 瀏覽器實測「機器學習介紹」頁面**

用無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw`）對 `machine-learning-introduction` 頁面截圖與 dump DOM，確認：
- 「全課程知識地圖」區塊只剩 8 階段清單，無破圖、無空白區塊
- 頁面其餘既有內容（簡介／機器學習的分類／典型應用場景／常見誤區）無迴歸

- [ ] **Step 6: 瀏覽器實測「多元線性回歸」頁面**

同樣方式截圖與 dump DOM，確認「簡介」段落新增的關聯文字與 KaTeX 公式正確顯示，其餘既有章節內容（數學原理、運用範例等）無迴歸。

- [ ] **Step 7: 關閉本機預覽伺服器**

依 `docs/handover.md` 規則，使用 `npx astro dev stop` 或確認 `npm run preview` 的背景程序已終止，避免殘留 server。

- [ ] **Step 8: 確認無殘留未提交變更**

Run: `git status --short`
Expected: 無輸出（所有變更皆已在 Task 1-4 提交）
