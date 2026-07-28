# 交接文件 Handover

> 最後更新：2026-07-28（第 1 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前子專案範圍：**網站骨架 + Multiple Linear Regression pilot 章節**，驗證架構後再逐章擴充。

## 已完成進度 (Completed)

- 設計文件：`docs/superpowers/specs/2026-07-28-ml-learning-site-skeleton-design.md`（main 分支）
- 章節路線圖：`dir.txt`（main 分支，八階段課程地圖，含子項目分組原則）
- 實作計畫：`docs/superpowers/plans/2026-07-28-ml-site-skeleton-pilot-chapter.md`（main 分支，12 個任務）
- Git/worktree：主倉庫 `https://github.com/jamessun0919-ops/Machine-Learning-Study`（`main`），實作在 worktree 分支 `worktree-ml-site-skeleton-pilot`（已 push 到遠端備份），本機路徑：
  `C:\Users\User\Desktop\Machine Learning Study\.claude\worktrees\ml-site-skeleton-pilot`
- **Task 1-9 全部完成，已通過 task reviewer 審查（無 Critical/Important 遺留問題），最新 commit `795d77c`（含 Task 1-9 + package-lock.json 修復）加上 Task 7-9 的三個後續 commit（`9ea300f`、`d93e980`、`2017ae0`）**：
  1. Astro + React + TypeScript 專案骨架，KaTeX/remark-math/rehype-katex 設定
  2. 深色科技風主題（`src/styles/global.css`）、`BaseLayout.astro`、`Nav.astro`、`src/config/chapters.ts`
  3. `src/content.config.ts`（Astro 7.1.4 Content Layer API，`glob` loader，entries 用 `.id`）
  4. `src/lib/regression.ts`（OLS 常態方程式，TDD，8/8 測試）
  5. `src/lib/regressionPlaneData.ts`（3D 散布圖/回歸平面資料轉換，TDD，2/2 測試）
  6. `src/data/50-startups.json` + `src/lib/datasets.ts`（真實資料，來源 `Avik-Jain/100-Days-Of-ML-Code`，R&D/Profit 相關係數 0.9729，已獨立驗證）
  7. `src/content/chapters/multiple-linear-regression.md`（繁體中文章節內容）
  8. `src/components/ChapterSummaryCard.astro`（伺服器端 KaTeX 渲染）
  9. `src/components/charts/RegressionScatter3D.tsx`（Plotly.js 3D 散布圖+回歸平面，3 組預設特徵組合切換）

## 目前的瓶頸或停頓點 (Current Blocker/Status)

**Task 10（章節頁面範本與首頁組裝）未完成，卡在一個已知且已有解法的 build 錯誤：**

- 問題：`npm run build` 在建置 `/chapters/multiple-linear-regression/` 頁面時失敗。根因是 `react-plotly.js` 編譯後對 `plotly.js/dist/plotly` 的 extensionless import，在 Astro SSR（Node 嚴格 ESM 解析）階段被拒絕。`index.astro`（不含互動元件）建置正常，問題僅出在含 `RegressionScatter3D` island 的頁面。
- **已判斷的標準解法**：把 `src/pages/chapters/[slug].astro` 裡互動元件的掛載方式從
  ```astro
  <InteractiveComponent client:load />
  ```
  改成
  ```astro
  <InteractiveComponent client:only="react" />
  ```
  這會讓該元件完全跳過伺服器端渲染（只在瀏覽器端掛載），避開 Node 端對 `plotly.js` 的 import 解析問題。這是 Astro 官方對「瀏覽器限定函式庫（canvas/WebGL/圖表庫）在 SSR 框架下」的標準寫法，不是臆測性修法。
- **目前 worktree 內的實際檔案狀態**（尚未 commit）：
  - `src/pages/index.astro`：已修改為完整版本（讀取 chapters collection、渲染章節清單），內容正確
  - `src/pages/chapters/[slug].astro`：新檔案已存在，但**內容仍是 `client:load`（修法尚未套用）**，因此目前這個檔案存在的話 `npm run build` 會失敗
  - 已指示負責 Task 10 的 implementer subagent（agent id `a069be2accddccfb1`）套用上述修法並重新驗證，但該 subagent 在完成回報前，工作階段就被要求結束——**修法是否已實際套用、build 是否已成功，目前未知，需要下一階段重新確認**

## 下一步行動 (Next Steps)

1. 進入 worktree（`C:\Users\User\Desktop\Machine Learning Study\.claude\worktrees\ml-site-skeleton-pilot`，分支 `worktree-ml-site-skeleton-pilot`），檢查 `git status` 確認上述未 commit 檔案是否還在、內容是否已是 `client:only="react"` 版本
2. 若修法尚未套用：手動或重新派 subagent 套用上述修法，執行 `npm run build` 確認成功產出 `dist/index.html` 與 `dist/chapters/multiple-linear-regression/index.html`
3. Build 成功後，仍需**真人在瀏覽器實際打開頁面確認**：3D 圖表能旋轉/縮放、三個預設特徵組合按鈕能正確切換平面與 R²/RMSE 數值、KaTeX 數學公式正確渲染（agent 無法在此環境視覺驗證這件事）
4. 確認無誤後 commit（訊息需註明 `client:load`→`client:only="react"` 的偏離原因），跑 task reviewer 審查此 diff
5. Task 10 審查通過後，依原計畫繼續 Task 11（design-taste-frontend 視覺打磨）、Task 12（GitHub Pages 部署）
6. 全部 12 個任務完成、最終整體審查（final code review）通過後，依 finishing-a-development-branch skill 決定 worktree 分支要 merge 進 main 或建 PR

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro（Content Layer API，`src/content.config.ts` + `glob` loader）、React island（僅用於需要互動的元件，`client:only="react"` 用於含 Plotly 的元件、其餘用 `client:load`）、TypeScript、Plotly.js（`react-plotly.js`）、KaTeX（markdown 用 `remark-math`/`rehype-katex`，結構化摘要卡用 `katex.renderToString` 伺服器端渲染）、Vitest、GitHub Pages（純靜態，無後端）
- **互動元件原則**：預先設計好的展示，非自由調參工具；資料集白名單制
- **視覺風格**：深色科技風（`--color-bg:#0f1117`、`--color-accent:#5ee6d0`、`--color-accent-secondary:#7c5ee6`），Task 11 才套用第三方 skill `design-taste-frontend`（已安裝於 `.agents/skills/`，需在 worktree 內才看得到，main 分支已 gitignore）
- **章節頁面固定九區塊**：簡介、分類方式、數學原理、運用範例、適用情境與限制、評估指標、常見誤區、學習摘要資訊圖表、互動式操作與演示
- **測驗題目**：明確不做成網頁功能，開發者另行以口頭/紙本試卷測試
- **章節排序來源**：`dir.txt`（main 分支）為唯一真實來源，八階段；`src/config/chapters.ts` 集中管理排序與跨章節關聯中繼資料（供未來知識地圖使用）
- **SDD ledger**：`.superpowers/sdd/2026-07-28-ml-site-skeleton-pilot-chapter/progress.md`（worktree 內），記錄每個 task 的完成狀態與審查結果，下次接手前應先讀這份 ledger 確認哪些 task 真的完成、不要重複派工
- **對話語言**：與開發者對話一律使用繁體中文
