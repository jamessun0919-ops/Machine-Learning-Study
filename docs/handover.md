# 交接文件 Handover

> 最後更新：2026-07-31（第 12 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression`、`機器學習介紹` 三章節。

## 已完成進度 (Completed)

- **「機器學習介紹」章節完整實作完成**：用 Subagent-Driven Development 依計畫 `docs/superpowers/plans/2026-07-30-ml-introduction-chapter.md` 執行 6 個 Task，每個 Task 皆經任務審查（spec + 品質）通過：
  1. `src/config/curriculum.ts`：課程資料模組，8 階段完整列出，含測試。
  2. `src/content.config.ts` + `[slug].astro`：`summary` 欄位改為 optional，新增 `conceptMapImage` 欄位，摘要卡片改條件渲染（既有兩章節渲染不受影響）。
  3. `src/components/CourseKnowledgeMap.tsx`：互動式分階段知識地圖 React island。
  4. `src/assets/chapters/ml-curriculum-concept-map.png`：Excalidraw 手繪風格靜態概念關聯圖（6 條演算法關聯）。
  5. `src/content/chapters/machine-learning-introduction.md` + `chapters.ts` 註冊 + `[slug].astro` 掛載：章節上線，5 區塊範本（簡介／機器學習的分類／典型應用場景／常見誤區／全課程知識地圖）。
  6. 瀏覽器實測：以無頭 Edge 截圖 + DOM dump 驗證新章節渲染正確、既有兩章節無迴歸。
- **最終整體審查通過**（Ready to merge，Opus 執行）：0 Critical，跨 Task 介面無漂移，`rough-engine.js` 抽出驗證為逐位元組相同。修正 1 項 Minor（`paradigmLabels` 型別收緊為 `Record<CurriculumParadigm, string>`），其餘 3 項 Minor（PNG 底部細窄色帶、概念圖箭頭畫布尺寸與顯示尺寸不一致造成的輕微壓縮、paradigm 徽章 foundational/other 無專屬色彩）經開發者確認**留待後續處理，非本階段範圍**。
- **資訊圖表風格政策定案**：開發階段中與開發者確認，後續所有章節統一採用 Excalidraw 手繪風格，不再逐章詢問（原「每章節重新詢問」規則已停用）。連帶將 rough.js 手繪引擎抽出為共用檔 `docs/specs/assets-src/rough-engine.js`，`ml-curriculum-concept-map.html` 與既有 `simple-linear-regression-summary.html` 皆改為引用此共用檔（既有章節的已產出 PNG 經驗證位元組級視覺一致，未重新產生）。`docs/specs/chapter_template_guide.md` 第 5 節已同步更新。
- 全部測試通過（20/20）、`astro check`（0 錯誤/0 警告）、`npm run build`（4 頁面成功產出）。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。本階段工作已完成並通過最終審查，待收工流程（本文件、worklog、chatlog 生成 + push）完成後即可視為結案。

## 下一步行動 (Next Steps)

1. **既留待後續的 3 項 Minor 外觀瑕疵**（非緊急，開工時可視情況一併處理或忽略）：
   - `ml-curriculum-concept-map.png` 底部約 18px 高的細窄背景色泄漏色帶（`.page` 移除 `min-height:297mm` 後的殘留，`html` 底色透出）。
   - 概念圖卡片箭頭 `<canvas width="360">` 與實際顯示寬度（約 334px）不一致，箭頭視覺上略微壓縮、B 框略微超出格線。
   - `.knowledge-map__paradigm-badge` 的 `foundational`／`other` 兩個分類沒有專屬色彩（目前退回中性樣式，與「即將推出」徽章視覺相同）。
2. **交接文件中原第 10 階段記錄的另一項工作**：調整 `simple-linear-regression` 章節互動內容（2D 散布圖改為表格點擊列移動資料點 + 新增其他互動操作），仍待安排，開工時需與開發者另行討論方案。
3. **下一個章節規劃**：依 `docs/config/curriculum.ts` 順序，下一個候選章節為「CRISP-DM 資料分析方法」（階段一）或「特徵工程與標準化」等階段二主題，開工時需與開發者確認優先順序，並依 `brainstorming` 技能重新走一輪需求確認（不可預設沿用機器學習介紹章節的範本結構）。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`（`machine-learning-introduction` 現為第一筆）；內容本體在 `src/content/chapters/*.md`（schema 見 `src/content.config.ts`，`summary` 現為 optional，`conceptMapImage` 為新增 optional 欄位）。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段、展開到子項層級，匯出 `curriculum`/`allTopics`/`findTopicByName`/`CurriculumTopic`/`CurriculumParadigm` 型別，供 `CourseKnowledgeMap.tsx` 使用，新增主題須維持這些命名不變。
- **非演算法章節範本**：5 區塊——簡介／機器學習的分類／典型應用場景／常見誤區／全課程知識地圖，取代演算法章節的九大區塊範本，供後續 CRISP-DM 等同類章節參考；但個別章節內容仍需逐一與開發者確認，不可預設套用。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**，開工時不再詢問。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`，新資產 HTML 以 `<script src="rough-engine.js"></script>` 引入，不要逐檔複製整段引擎程式碼。規則詳見 `docs/specs/chapter_template_guide.md` 第 5 節。
- **Excalidraw 風格資產渲染注意事項**：`.page` 容器高度應貼合實際內容（不要沿用滿版 A4 `min-height:297mm`），並讓渲染腳本的 `--window-size` 高度與內容高度相符，避免產出圖片留白過多；若卡片內含手繪箭頭，`<canvas>` 的 `width`/`height` 屬性應與其實際顯示尺寸（CSS 計算後）一致，避免座標壓縮/對不齊。
- **Astro dev server 關閉方法**：使用 `astro dev stop`（Bash 環境需用 `npx astro dev stop`），或以 `astro dev status` 確認伺服器狀態。收工前務必確認 Agent 自己啟動的 dev server 已關閉。
- **瀏覽器實測工具**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用既有的無頭 Microsoft Edge（`--headless --disable-gpu`），搭配 `--screenshot` 截圖與 `--dump-dom` 檢查渲染後 DOM。**注意**：`--virtual-time-budget` 旗標與 lazy-load 圖片/React island 水合搭配時可能截圖不完整（空白區塊），改用 `--run-all-compositor-stages-before-draw` 較穩定；圖片優化端點（Astro `_image`）首次請求需要建置時間，必要時先 `curl` 預熱該端點再截圖。
- **對話語言**：與開發者對話一律使用繁體中文。
