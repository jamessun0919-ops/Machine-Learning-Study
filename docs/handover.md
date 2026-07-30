# 交接文件 Handover

> 最後更新：2026-07-30（第 11 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression` 兩章節（已 push 至 `origin/main`，commit `58c6e67`）；本階段完成「機器學習介紹」章節的完整規劃（spec + 實作計畫），尚未動工程式碼。

## 已完成進度 (Completed)

- **「機器學習介紹」章節規劃完成**：透過 `brainstorming` 技能與開發者逐項確認內容架構、知識地圖呈現方式（互動清單 + 靜態概念關聯圖雙軌並用）、共用範本調整範圍，寫成 spec 文件並經開發者核准。
- **實作計畫完成**：用 `writing-plans` 技能將 spec 拆解為 6 個可執行 Task（含具體程式碼、測試、驗證步驟），存於 `docs/superpowers/plans/2026-07-30-ml-introduction-chapter.md`。
- Spec 文件已 commit（local only，尚未 push）：`docs/superpowers/specs/2026-07-30-ml-introduction-chapter-design.md`。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。開發者要求本階段先停在「規劃完成、尚未執行」，執行方式（Subagent-Driven vs Inline）留待下階段開工時決定。**本階段沒有任何程式碼/內容變更**，僅新增 spec 與 plan 兩份文件。

## 下一步行動 (Next Steps)

1. **開工第一件事**：與開發者確認執行 `docs/superpowers/plans/2026-07-30-ml-introduction-chapter.md` 的方式——
   - **Subagent-Driven（技能推薦）**：每個 Task 派一個新 subagent 執行，Task 間逐一審查
   - **Inline Execution**：本 session 內批次執行，於檢查點停下確認
2. 依所選方式執行計畫 6 個 Task：課程資料模組 `curriculum.ts` → schema/`[slug].astro` 條件渲染 → `CourseKnowledgeMap.tsx` 互動元件 → Excalidraw 手繪風格靜態概念關聯圖（PNG）→ 章節內容撰寫與掛載 → 瀏覽器實測收工。
3. 計畫執行完成後，另一項延宕的工作項目仍待安排：調整 `simple-linear-regression` 章節互動內容（2D 散布圖改為表格點擊列移動資料點 + 新增其他互動操作），開工時需與開發者另行討論方案。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`（schema 見 `src/content.config.ts`，本次計畫會將 `summary` 欄位改為 optional、新增 `conceptMapImage` 欄位）。
- **非演算法章節範本**（本次新定案，見 spec 第 2 節）：5 區塊——簡介／機器學習的分類／典型應用場景／常見誤區／全課程知識地圖，取代演算法章節的九大區塊範本，供後續 CRISP-DM 等同類章節參考；但個別章節內容仍需逐一與開發者確認，不可預設套用。
- **知識地圖設計**（spec 第 3 節）：新資料檔 `src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段、展開到子項層級；新元件 `src/components/CourseKnowledgeMap.tsx`（互動分階段清單，已建置章節可點擊跳轉、未建置反灰標「即將推出」）；另有一張 Excalidraw 手繪風格靜態 PNG 呈現 6 條演算法概念關聯（Logistic Regression←Linear Regression、Random Forest←Decision Tree、Boosting←Decision Tree、PCA→Clustering、KNN↔K-Means、監督式↔非監督式）。
- **資訊圖表規則**：每個新章節開工時都要重新詢問開發者風格要用 Excalidraw 手繪風格還是白底向量風格，不可預設沿用上一章節；規則細節見 `docs/specs/chapter_template_guide.md` 第 5 節。本次「機器學習介紹」章節已確認採 Excalidraw 手繪風格。
- **Astro dev server 關閉方法**：使用 `astro dev stop`（Bash 環境需用 `npx astro dev stop`），或以 `astro dev status` 確認伺服器狀態。收工前務必確認 Agent 自己啟動的 dev server 已關閉。
- **對話語言**：與開發者對話一律使用繁體中文。
