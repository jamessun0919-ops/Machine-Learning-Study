# 「機器學習介紹」章節（非演算法章節範本）設計文件

日期：2026-07-30
子專案：`dir.txt` 階段一課程導覽 — 機器學習介紹章節（含全課程知識地圖）

## 1. 背景與範圍

前一份骨架設計文件（`2026-07-28-ml-learning-site-skeleton-design.md`）已建立演算法章節的
九大區塊範本，並於第 5 節預留「全課程知識地圖」需求，待後續子專案實作。

本章節是全站第一個「非演算法章節」（純內容導覽，不含單一數學模型），因此需要另訂一套不同於
九大區塊的內容範本，作為後續 CRISP-DM 等同類章節的參考範例。

**範圍**：本子專案只交付「機器學習介紹」一個章節；範本本身（區塊結構、共用範本調整方式）供後續
非演算法章節沿用，但個別章節的內容項目仍需逐一與開發者確認，不可預設套用。

## 2. 非演算法章節內容範本（本章節即為範例）

依序 5 個區塊，取代演算法章節的九大區塊：

1. `## 簡介` — 什麼是機器學習、本站/本課程要教什麼
2. `## 機器學習的分類` — 說明兩個分類維度：
   - **學習方式**：監督式 / 非監督式 / 強化學習
   - **任務類型**：迴歸 / 分類 / 分群
   - （參數 vs 非參數模型暫不加入，避免介紹章節過於艱澀）
3. `## 典型應用場景` — 5 個跨領域案例：房價預測、垃圾郵件分類、客戶分群、影像辨識、推薦系統
4. `## 常見誤區` — 4 點：
   1. 機器學習等同於人工智慧（ML = AI）
   2. 資料量越多，模型一定越好
   3. 模型越複雜，效果一定越好
   4. 相關性不等於因果性
5. `## 全課程知識地圖` — 對應演算法章節的「互動式操作與演示」區塊位置，內容見第 3 節

不包含：分類方式（併入區塊 2）、數學原理、評估指標、適用情境與限制、學習摘要資訊圖表
（ChapterSummaryCard，本章節不適用，見第 4 節）。

## 3. 全課程知識地圖

分兩部分，由上而下排列：

### 3a. 靜態概念關聯圖（全貌概覽，置於上方）

- 一張 Excalidraw 手繪風格的靜態 PNG，呈現演算法之間的概念關聯（非逐項列出全部 24 個主題）
- **關聯內容（6 條）**：
  1. Logistic Regression ← Linear Regression（迴歸走向分類的橋樑）
  2. Random Forest ← Decision Tree（Bagging 組成元件）
  3. Boosting ← Decision Tree（弱學習器組成元件）
  4. PCA → Clustering（常作為分群前的降維前處理）
  5. KNN ↔ Clustering（同屬距離基礎方法）
  6. 監督式學習 ↔ 非監督式學習（呈現整體地圖的大分類骨架，而非單一演算法對）
- **製作方式**：依 `docs/specs/chapter_template_guide.md` 第 5 節既有流程 —— HTML/CSS 排版
  （rough.js 手繪渲染 + 手寫字體）存於 `docs/specs/assets-src/ml-curriculum-concept-map.html`，
  用無頭 Edge 瀏覽器渲染成 PNG，輸出至 `src/assets/chapters/ml-curriculum-concept-map.png`
- **掛載方式**：新增 frontmatter 選填欄位 `conceptMapImage`（`image().optional()`），由
  `[slug].astro` 在 `interactiveComponent === 'course-knowledge-map'` 分支中，於
  `CourseKnowledgeMap` 元件上方渲染此圖

### 3b. 互動式分階段清單（詳細導覽，置於下方）

- 新元件 `src/components/CourseKnowledgeMap.tsx`（React island，`client:only="react"`；非
  Plotly 圖表類，故不放在 `components/charts/`）
- 新資料檔 `src/config/curriculum.ts`：依 `dir.txt` 完整列出 8 階段、展開到子項層級（例如
  Linear Regression 家族的 Simple/Multiple/Polynomial/Ridge/Lasso 各自為獨立節點），資料結構：

  ```ts
  export interface CurriculumTopic {
    name: string;       // 顯示名稱，如 'Simple Linear Regression（簡單線性回歸）'
    slug?: string;      // 對應章節 slug；未建置章節留空
    relatedTo?: string[]; // 關聯主題名稱（對應第 3a 節 6 條關聯），用於清單下方文字標註
  }

  export interface CurriculumStage {
    stage: string;       // 如 '階段三：監督式學習－迴歸'
    topics: CurriculumTopic[];
  }

  export const curriculum: CurriculumStage[] = [ /* 8 階段，依 dir.txt 順序 */ ];
  ```

- **版面**：依階段分組（accordion 或分段卡片皆可，實作時依全站深色科技風視覺再定），非自由節點
  佈局的網狀圖
- **互動行為**：
  - 已建置章節（目前僅 Simple/Multiple Linear Regression）節點可點擊，直接跳轉至該章節頁面
  - 未建置節點反灰、顯示「即將推出」提示文字，不可點擊
  - 有 `relatedTo` 的節點，下方加一行小字標註關聯項目（例如 Random Forest 節點下標註
    「組成元件：Decision Tree」），可點擊跳轉至關聯節點（若關聯節點已建置）
- **暫定事項**：子項展開後節點數量較多（約 24 項），若視覺上過於擁擠，屆時再調整（例如部分階段
  改為可收合）——本次先以全展開實作，非本 spec 最終定案的排版細節

## 4. 共用範本調整（影響全站，非本章節獨有檔案）

因本章節不需要 ChapterSummaryCard 摘要圖表，需將其改為條件渲染：

- **`src/content.config.ts`**：`summary` 欄位改為 optional（`summary: z.object({...}).optional()`）；
  新增 `conceptMapImage: image().optional()` 欄位（見 3a 節）
- **`src/pages/chapters/[slug].astro`**：
  - `<ChapterSummaryCard>` 與導覽列「資訊圖表」連結，改為 `{chapter.data.summary && (...)}` 條件渲染
  - 新增 `interactiveComponent === 'course-knowledge-map'` 分支：先渲染 `conceptMapImage`
    （若存在），再掛載 `<CourseKnowledgeMap client:only="react">`
  - import 新元件 `CourseKnowledgeMap`

其餘既有章節（Simple/Multiple Linear Regression）的 frontmatter 與渲染結果不受影響（`summary`
欄位仍照舊提供）。

## 5. 章節註冊

`src/config/chapters.ts` 新增：

```ts
{
  slug: 'machine-learning-introduction',
  stage: '課程導覽',
  // 無 prerequisiteSlug：全站入口章節
  // nextSlug 暫不設定：CRISP-DM 尚未建置，且此欄位目前全站未有實際渲染消費它
}
```

排序：置於 `chapterOrder` 陣列最前面，對應 `dir.txt` 階段一。

新檔案：`src/content/chapters/machine-learning-introduction.md`

## 6. 明確排除範圍（YAGNI）

- 不做節點自由拖曳佈局的網狀概念圖（互動元件維持分階段清單；概念關聯圖以靜態圖呈現）
- 不對全部 24 個主題逐一標註概念關聯，僅第 3a 節列出的 6 條
- 不在本階段實作 `prerequisiteSlug`/`nextSlug` 的頁面渲染（沿用骨架既有的「已定義但未消費」狀態）
- 不做參數 vs 非參數模型的分類說明
