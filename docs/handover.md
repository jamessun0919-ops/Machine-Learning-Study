# 交接文件 Handover

> 最後更新：2026-07-30（第 5 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。**網站骨架 + Multiple Linear Regression pilot 章節** 子專案已全部完成並正式上線，下一步是規劃逐章節擴充 `dir.txt` 其餘章節內容。

## 已完成進度 (Completed)

- **子專案「網站骨架 + Multiple Linear Regression pilot 章節」12 個任務全部完成，已通過最終整體審查，已 merge 進 `main` 並正式上線**
  - 線上網址：`https://jamessun0919-ops.github.io/Machine-Learning-Study/`（已實測首頁／章節頁／favicon 皆回應 200）
  - `main` 分支 merge commit：`ea6a75b`
  - worktree 分支 `worktree-ml-site-skeleton-pilot` 已完成階段性任務，本機與遠端分支皆已刪除，本機 worktree 目錄（`.claude/worktrees/ml-site-skeleton-pilot`）已清理
- 本階段（第 5 階段）完成事項：
  1. **Task 12（GitHub Pages 部署）**：`astro.config.mjs` 設定 `site`/`base`（`base: '/Machine-Learning-Study/'`，因為是 project site 非 user/org site）；修正 `Nav.astro`／`index.astro` 三處寫死的絕對路徑連結（改用 `import.meta.env.BASE_URL` 前綴），否則加了 base path 後導覽會全部失效；新增 `.github/workflows/deploy.yml`（`withastro/action@v3` + `actions/deploy-pages@v4`）
  2. **最終整體審查**（12 個任務整體，base `6ceb51c`..head `2d25395`）：Ready to merge with fixes。修復項目：
     - Important：學習摘要全螢幕 lightbox 補上 `role="dialog"`/`aria-modal`、開關焦點管理、Tab focus trap（`ChapterSummaryCard.astro`）
     - Minor（開發者選定處理）：`summary.image`/`formulas`+`keyStats` 二選一邏輯加註解；3D 圖表旋轉區塊加 `aria-label`；補 `fixedRanges`/`fieldLabels` 涵蓋全資料集的測試；`BaseLayout.astro` 補 favicon `<link rel="icon">`
     - 其餘 Minor（`--accent-2-rgb` 死 token 等）確認為之前已討論過要延後的舊帳，維持現狀不處理
  3. **finishing-a-development-branch 流程**：開發者選擇「Merge back to main locally」→ 本機 merge → 合併後於 `main` 重新驗證測試通過 → 清理本機分支與 worktree → push `main` → 部署 workflow 執行成功 → 開發者確認後刪除遠端 worktree 分支
- `npm test`（15 個測試，merge 後在 `main` 驗證）與 `npx astro check` 全程維持 0 錯誤

## 目前的瓶頸或停頓點 (Current Blocker/Status)

沒有阻塞性問題。子專案已完整收尾並上線，目前是**兩個子專案之間的交接點**。

**環境限制記錄**（供下次接手參考，非待辦事項）：
- 本機環境沒有安裝 GitHub CLI（`gh`），本階段部署驗證改用「開發者手動網頁操作 GitHub Pages 設定與 workflow 觸發」+「Agent 用公開 Actions API（repo 為 public，免登入）輪詢執行結果」替代 `gh run watch`。若之後需要更頻繁的 CI/CD 操作，可考慮詢問開發者是否要安裝 `gh` CLI。
- 上階段安裝在 session 暫存目錄的 Playwright + Chromium，重開新 session 後不會保留，如需瀏覽器驗證要重新安裝或詢問開發者（本階段沒有用到瀏覽器驗證）。

## 下一步行動 (Next Steps)

1. **規劃下一子專案**：依 `dir.txt` 的章節順序，決定下一個要開發的章節（`src/config/chapters.ts` 需要對應更新排序設定）
2. 進入新章節開發前，先確認交接文件先前提出的兩個懸而未決的架構問題：
   - pilot 章節的骨架架構是否需要調整成更明確的「未來章節共用範本」文件（例如 3D 圖表自訂旋轉控制的寫法、學習摘要資訊圖表的生成流程）
   - 學習摘要資訊圖表目前是**手動執行腳本 + Playwright 截圖**產生單一靜態 PNG（腳本未納入專案版控，僅存於 session 暫存目錄），未來若要幫每個章節都做一張，需要討論是否要正式化這個流程（例如寫成專案內的 npm script 並把 Playwright 加入 `devDependencies`）
3. 建議在正式開發新章節前，先跑一次 `npm install`／`npm test`／`npx astro check` 確認 `main` 分支目前的乾淨狀態（本階段 merge 後已驗證過一次，但兩個子專案交接間隔期間如有其他變動應重新確認）

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro（Content Layer API）、React island（`client:only="react"` 用於含 Plotly 等瀏覽器限定函式庫的元件，且必須是**字面 JSX 直接引用**，不能透過動態查找表/變數間接引用）、TypeScript、Plotly.js、KaTeX、Vitest、GitHub Pages（純靜態，無後端）
- **GitHub Pages 部署設定（本階段新建立）**：`astro.config.mjs` 的 `site`/`base` 已設定為 project site 型態（`base: '/Machine-Learning-Study/'`），**任何新增的內部連結／靜態資源路徑都必須透過 `import.meta.env.BASE_URL` 前綴或 Astro 的 `<Image>`/相對路徑機制處理，絕對不能寫死 `/xxx` 開頭的絕對路徑**，否則部署後會 404。`.github/workflows/deploy.yml` 觸發條件是 `push` 到 `main`（`workflow_dispatch`/Actions 分頁清單只認 default branch 上存在的檔案，無法在未合併的分支上測試）
- **互動元件原則**：預先設計好的展示，非自由調參工具；資料集白名單制
- **視覺風格**：深色科技風（`--color-bg:#0f1117`、`--color-accent:#5ee6d0`、`--color-accent-secondary:#7c5ee6`，`#7c5ee6` 對背景色對比度僅 4.16:1，未達 WCAG AA 文字標準，**不可用於文字顏色**，只用在裝飾性漸層線條）
- **學習摘要資訊圖表風格原則**：仿照參考圖（`pic/Bayes.png`／`pic/CRISPDM.png`）的乾淨向量資訊圖表風格（白底、色塊分區、KaTeX 公式、清楚的圖標/色彩語意），**不是**字面上的 excalidraw 手繪風；內容架構原則是「概念學習優先、案例數字次之」——章節概念性內容（簡介/公式/適用情境/評估指標/常見誤區）放在圖表上半部且不含任何案例特定數字，所有案例相關數字（資料集資訊、係數、R²/RMSE、相關係數、基於案例的洞察文字）集中整合成單一「案例分析」區塊放在最下方；`summary.image` 與 `formulas`/`keyStats` 為互斥顯示模式（設定 image 後文字欄位不會顯示，但 schema 仍要求填寫）
- **捲動動效原則**：`animation-timeline: view()`/`scroll()` 等 CSS scroll-driven animation 目前僅 Chrome/Edge 115+ 支援，本專案已決定**優先用 vanilla JavaScript** 達成跨瀏覽器一致效果；「進入視野觸發」類效果用 `IntersectionObserver`，「連續比例」類效果用 `scroll` 事件 + `requestAnimationFrame` 節流——**兩者不可混用**
- **3D 圖表旋轉控制原則**：Plotly 內建 `dragmode` 無法限制旋轉範圍，本專案改用「關閉內建 dragmode、自訂 pointer 事件手刻旋轉、透過三角函數換算 `camera.eye`」的模式，參考 `RegressionScatter3D.tsx` 的 `cameraEyeFromAngles`/`clampElevation` 寫法；旋轉區塊已加 `role="img"`/`aria-label`，但**目前沒有鍵盤替代操作**（已知限制，未來如有無障礙需求可再討論）
- **測試環境注意事項（本階段踩雷記錄）**：若專案根目錄下方存在（或曾存在）一個巢狀的 git worktree 目錄（例如本次的 `.claude/worktrees/xxx`），即使該路徑列在 `.gitignore`，**vitest 預設不會讀取 `.gitignore` 來排除掃描範圍**，會把該 worktree 內的測試檔案重複計入，導致 `npm test` 顯示的測試數量異常翻倍。確認方式：檢查 `npx vitest run --reporter=verbose` 的完整清單是否有重複的檔案路徑。本次是靠移除該 worktree 目錄自然解決，未修改 vitest 設定
- **`design-taste-frontend` skill 套件位置**：只安裝在主倉庫根目錄 `.agents/skills/`（gitignore）
- **章節頁面固定九區塊**：簡介、分類方式、數學原理、運用範例、適用情境與限制、評估指標、常見誤區、學習摘要資訊圖表、互動式操作與演示
- **測驗題目**：明確不做成網頁功能，開發者另行以口頭/紙本試卷測試
- **章節排序來源**：`dir.txt`（main 分支）為唯一真實來源；`src/config/chapters.ts` 才是程式碼實際讀取的排序設定檔
- **SDD ledger**：`.superpowers/sdd/2026-07-28-ml-site-skeleton-pilot-chapter/progress.md`，記錄 Task 1-11 完整審查歷程（此子專案已結束，供歷史參考）
- **對話語言**：與開發者對話一律使用繁體中文
