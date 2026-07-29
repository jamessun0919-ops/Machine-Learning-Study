# 交接文件 Handover

> 最後更新：2026-07-29（第 3 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前子專案範圍：**網站骨架 + Multiple Linear Regression pilot 章節**，驗證架構後再逐章擴充。

## 已完成進度 (Completed)

- Git/worktree：主倉庫 `https://github.com/jamessun0919-ops/Machine-Learning-Study`（`main`），實作在 worktree 分支 `worktree-ml-site-skeleton-pilot`（已 push 到遠端），本機路徑：
  `C:\Users\User\Desktop\Machine Learning Study\.claude\worktrees\ml-site-skeleton-pilot`
- **Task 1-11 全部完成並通過 task reviewer 審查**（詳見上一份交接文件記錄，本階段沒有再動 Task 1-11 的範圍）
- 本階段（第 3 階段）針對 `src/components/charts/RegressionScatter3D.tsx`（3D 迴歸圖表）完成多項調整，commit `b9cd3fa`：
  1. **旋轉方式改為「水平方位角自由旋轉＋仰角限制在 ±30 度」**：完全放棄 Plotly 內建的 `dragmode`（`turntable` 實測仍可拖到上下顛倒，不符需求），改用自訂 pointer 事件手刻旋轉邏輯，透過三角函數換算 `scene.camera.eye`。仰角範圍以 Plotly 預設視角（`(1.25,1.25,1.25)`，換算約 35.26°）為中心，上下各 30 度（**這個「±30 度以預設視角為中心」的區間定義是 Agent 提出的假設，開發者未逐字確認過這個定義本身，只確認了測試效果良好**）
  2. **移除 Plotly 工具列**：`config.displayModeBar: false`
  3. **外框比例拉伸成長方形**：`scene.aspectmode: 'manual'` + `aspectratio: {x:1.6, y:1.6, z:1}`（開發者確認幅度可以，未要求再調整數字）
  4. **三個特徵組合共用固定軸範圍**：新增 `src/lib/datasets.ts` 的 `fixedRanges`（`rdSpend`/`administration`/`marketingSpend`/`profit` 各自在全部 50 筆資料中的全域 min/max），`src/lib/regressionPlaneData.ts` 的 `buildScatterPlaneData` 簽名改為接受外部傳入的 `x1Range`/`x2Range`（原本自己從當前 preset 的資料算 min/max），迴歸平面採外插畫滿整個固定範圍（開發者選項 a）
  5. **X/Y/Z 軸說明圖例**：新增 `src/lib/datasets.ts` 的 `fieldLabels`（中英對照，沿用章節內文既有中文用詞：研發支出 R&D Spend／行政支出 Administration／行銷支出 Marketing Spend／獲利 Profit），圖表外框下方新增 `.regression-chart__axis-legend`（`global.css` 新增對應樣式，配色沿用既有 `--color-accent` 避免引入未驗證對比度的新色）
- `npm test`（14 個測試）與 `npx astro check` 全程維持 0 錯誤，每次程式碼改動後都依規定關閉重開 dev server 驗證（未依賴 HMR reload）

## 目前的瓶頸或停頓點 (Current Blocker/Status)

沒有阻塞性問題，開發者已確認本階段所有改動「顯示效果均良好」。但有**兩項本階段口頭同意、實際未完成**的事項需要下次接手時優先確認：

1. **`.reading-progress`（頂部閱讀進度條）尚未改成 JS 版本**：本階段開頭開發者已同意「一併改成 JS 版本」（比照上階段強調線的 `IntersectionObserver` 做法，解決 `animation-timeline: scroll(root block)` 的 Chromium-only 相容性問題），但後續討論全程被 3D 圖表調整占用，這件事被遺漏，**目前 `.reading-progress` 仍是原本的 CSS scroll-driven animation，未修改**。
2. **3D 圖表外框的物理尺寸放大尚未處理**：上一份交接文件記載的「圖表外框需要放大」（`.regression-chart__frame` / Plot 的 `height: '480px'`）指的是外框本身的 CSS 尺寸，本階段做的是外框「比例」調整（`aspectratio`，讓立方體渲染變扁長，讓 3D 內容更好地填滿既有的 480px 高框），**框本身的高度/寬度數值完全沒有變動**。如果開發者原本要的物理尺寸放大需求還在，需要重新確認目標尺寸（上一份交接文件也沒有給出具體數字）。

## 下一步行動 (Next Steps)

1. 跟開發者確認上述兩項是否還要處理：`.reading-progress` 的 JS 改寫、`.regression-chart__frame` 的物理尺寸放大（若要，需先問目標數值）
2. 確認後派工修改，開發者驗證通過後，繼續 **Task 12**（GitHub Pages 部署）：`astro.config.mjs` 加 `site`/`base`、建立 `.github/workflows/deploy.yml`、啟用 GitHub Pages（Source: GitHub Actions）、push 後用 `gh run watch` 驗證部署成功
3. Task 12 完成後，依原計畫進行 12 個任務的最終整體審查（final code review），通過後依 finishing-a-development-branch skill 決定 worktree 分支要 merge 進 main 或建 PR
4. 進入下一子專案（逐章節填入 `dir.txt` 其餘章節內容）前，先確認這個 pilot 章節的骨架架構是否需要根據本階段的經驗（例如 3D 圖表自訂旋轉控制的寫法）調整成更明確的「未來章節共用範本」文件

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro（Content Layer API）、React island（`client:only="react"` 用於含 Plotly 等瀏覽器限定函式庫的元件，且必須是**字面 JSX 直接引用**，不能透過動態查找表/變數間接引用）、TypeScript、Plotly.js、KaTeX、Vitest、GitHub Pages（純靜態，無後端）
- **互動元件原則**：預先設計好的展示，非自由調參工具；資料集白名單制
- **視覺風格**：深色科技風（`--color-bg:#0f1117`、`--color-accent:#5ee6d0`、`--color-accent-secondary:#7c5ee6`，`#7c5ee6` 對背景色對比度僅 4.16:1，未達 WCAG AA 文字標準，**不可用於文字顏色**，只用在裝飾性漸層線條）
- **捲動動效原則**：`animation-timeline: view()`/`scroll()` 等 CSS scroll-driven animation 目前僅 Chrome/Edge 115+ 支援，本專案已決定**優先用 vanilla JavaScript `IntersectionObserver`** 達成跨瀏覽器一致效果，而非依賴新版 CSS API。`.chapter h2::before` 的強調線已於上階段改完，**`.reading-progress` 仍未改（見上方 Blocker）**
- **3D 圖表旋轉控制原則（本階段新建立）**：Plotly 內建 `dragmode`（`orbit`/`turntable`）都無法滿足「限制旋轉範圍」的教學需求（`turntable` 只鎖上方向量，不限制仰角），本專案改用「關閉內建 dragmode、自訂 pointer 事件手刻旋轉、透過三角函數換算 `camera.eye`」的模式；未來其他章節如果也有 3D 圖表且需要限制旋轉範圍，可以參考 `RegressionScatter3D.tsx` 的 `cameraEyeFromAngles`/`clampElevation` 寫法
- **`design-taste-frontend` skill 套件位置**：只安裝在主倉庫根目錄 `.agents/skills/`（gitignore），**worktree 建立時不會自動帶過去**，需要時要先手動 `cp -r` 複製過去
- **章節頁面固定九區塊**：簡介、分類方式、數學原理、運用範例、適用情境與限制、評估指標、常見誤區、學習摘要資訊圖表、互動式操作與演示
- **測驗題目**：明確不做成網頁功能，開發者另行以口頭/紙本試卷測試
- **章節排序來源**：`dir.txt`（main 分支）為唯一真實來源；`src/config/chapters.ts` 才是程式碼實際讀取的排序設定檔
- **SDD ledger**：`.superpowers/sdd/2026-07-28-ml-site-skeleton-pilot-chapter/progress.md`（worktree 內），記錄 Task 1-11 完整審查歷程
- **對話語言**：與開發者對話一律使用繁體中文
