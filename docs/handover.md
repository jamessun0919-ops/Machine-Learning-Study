# 交接文件 Handover

> 最後更新：2026-07-28（第 2 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前子專案範圍：**網站骨架 + Multiple Linear Regression pilot 章節**，驗證架構後再逐章擴充。

## 已完成進度 (Completed)

- Git/worktree：主倉庫 `https://github.com/jamessun0919-ops/Machine-Learning-Study`（`main`），實作在 worktree 分支 `worktree-ml-site-skeleton-pilot`（已 push 到遠端），本機路徑：
  `C:\Users\User\Desktop\Machine Learning Study\.claude\worktrees\ml-site-skeleton-pilot`
- **Task 1-11 全部完成並通過 task reviewer 審查**，最新 commit `9c57fe1`。本階段（第 2 階段）新增/變更的 commit：
  - `eb12a59` Task 10 收尾：`src/pages/index.astro` 改為讀取 `src/config/chapters.ts` 的 `chapterOrder`（跟 `Nav.astro` 對齊）
  - `e0d01b8` Task 11：套用 `design-taste-frontend` skill 完成視覺打磨（排版節奏/間距/動效/字體層級），reviewer Approved（12 項 Minor 已記錄延後）
  - `cdd27d7` 把 `.chapter h2::before` 的捲動漸入效果從 CSS `animation-timeline: view()`（僅 Chrome/Edge 115+ 支援）改成 vanilla JavaScript `IntersectionObserver`（跨瀏覽器），reviewer Approved
  - `9c57fe1` 依開發者實際瀏覽器回饋微調：強調線寬度改為對齊標題文字寬度、動效時間依序調整為 1800ms
- Task 10 的完整診斷過程：上一階段交接文件記載的「標準解法」（單純把 `client:load` 換成 `client:only`）從未被完整驗證；本階段重新診斷發現真正需要的修法是「拿掉 `Record` 動態查找表、改成字面 JSX 直接引用 `RegressionScatter3D` + `client:only="react"`」（詳見 worktree 內 `.superpowers/sdd/2026-07-28-ml-site-skeleton-pilot-chapter/task-10-report.md`）
- SDD ledger（`.superpowers/sdd/2026-07-28-ml-site-skeleton-pilot-chapter/progress.md`，worktree 內）記錄 Task 1-11 完整審查歷程，包含所有延後處理的 Minor 發現

## 目前的瓶頸或停頓點 (Current Blocker/Status)

沒有阻塞性問題。Task 1-11 功能正確且已通過開發者實際瀏覽器驗證。**有兩項開發者明確要求記錄、下次處理的視覺待辦事項**（尚未討論具體實作方式）：

1. **3D 迴歸圖表座標軸需要固定**：`src/components/charts/RegressionScatter3D.tsx` 目前三個預設特徵組合切換時，座標軸範圍會各自根據資料自動縮放（`buildScatterPlaneData` 的 grid 邊界跟著該特徵組合的 min/max 走），開發者希望改成固定/一致的座標軸範圍。**尚未討論**：固定範圍要取三組合的聯集、還是給每個特徵各自的固定值、或是其他方式。
2. **3D 圖表外框需要放大**：目前 `.regression-chart__frame` 高度固定 480px（見 `global.css`），開發者反映長寬都需要放大，**尚未指定目標尺寸**。

另有一項**尚未決定是否處理**的次要發現：`.reading-progress`（頂部閱讀進度條，`global.css:117-141` 一帶）用的 `animation-timeline: scroll(root block)` 跟本階段修掉的強調線效果是同一種 Chromium-only 相容性問題（Firefox/Safari 會直接看不到進度條，但不會報錯或壞版面）。是否要比照強調線的做法也改成 JS 版本，待開發者決定。

## 下一步行動 (Next Steps)

1. 跟開發者討論「3D 圖表座標軸固定」的具體規則（聯集範圍？還是別的方式？）與「外框放大」的目標尺寸，確認後再派 implementer 修改
2. 詢問開發者 `.reading-progress` 的 Chromium-only 效果要不要一併改成 JS 版本
3. 上述視覺調整完成、開發者驗證通過後，繼續 **Task 12**（GitHub Pages 部署）：`astro.config.mjs` 加 `site`/`base`、建立 `.github/workflows/deploy.yml`、啟用 GitHub Pages（Source: GitHub Actions）、push 後用 `gh run watch` 驗證部署成功
4. Task 12 完成後，依原計畫進行 12 個任務的最終整體審查（final code review），通過後依 finishing-a-development-branch skill 決定 worktree 分支要 merge 進 main 或建 PR
5. 進入下一子專案（逐章節填入 `dir.txt` 其餘章節內容）前，先確認這個 pilot 章節的骨架架構是否需要根據本階段的經驗（例如 `client:only` 寫法、IntersectionObserver 捲動效果）調整成更明確的「未來章節共用範本」文件

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro（Content Layer API）、React island（`client:only="react"` 用於含 Plotly 等瀏覽器限定函式庫的元件，且必須是**字面 JSX 直接引用**，不能透過動態查找表/變數間接引用——這是本階段 Task 10 踩過的坑，Astro 編譯器需要靜態可分析的元件引用才能正確排除 SSR）、TypeScript、Plotly.js、KaTeX、Vitest、GitHub Pages（純靜態，無後端）
- **互動元件原則**：預先設計好的展示，非自由調參工具；資料集白名單制
- **視覺風格**：深色科技風（`--color-bg:#0f1117`、`--color-accent:#5ee6d0`、`--color-accent-secondary:#7c5ee6`，`#7c5ee6` 對背景色對比度僅 4.16:1，未達 WCAG AA 文字標準，目前只用在裝飾性漸層線條，**不可用於文字顏色**）
- **捲動動效原則**：`animation-timeline: view()`/`scroll()` 等 CSS scroll-driven animation 目前僅 Chrome/Edge 115+ 支援，本專案已決定**優先用 vanilla JavaScript `IntersectionObserver`** 達成跨瀏覽器一致的捲動觸發效果，而非依賴新版 CSS API（見 `src/pages/chapters/[slug].astro` 內的 `<script is:inline>` 寫法）
- **`design-taste-frontend` skill 套件位置**：只安裝在主倉庫根目錄 `.agents/skills/`（gitignore），**worktree 建立時不會自動帶過去**，若下次需要在 worktree 內用到任何 taste-skill 系列 skill，需要先手動 `cp -r` 複製過去
- **章節頁面固定九區塊**：簡介、分類方式、數學原理、運用範例、適用情境與限制、評估指標、常見誤區、學習摘要資訊圖表、互動式操作與演示
- **測驗題目**：明確不做成網頁功能，開發者另行以口頭/紙本試卷測試
- **章節排序來源**：`dir.txt`（main 分支）為唯一真實來源（人類決策層，不被程式碼讀取）；`src/config/chapters.ts` 才是程式碼實際讀取的排序設定檔，`Nav.astro` 與 `index.astro` 都必須從這裡讀取順序，不可各自用 `getCollection` 原始順序
- **SDD ledger**：`.superpowers/sdd/2026-07-28-ml-site-skeleton-pilot-chapter/progress.md`（worktree 內），下次接手前應先讀這份 ledger 確認哪些 task 真的完成、不要重複派工；已記錄本階段所有 Minor 延後項目與待辦事項
- **對話語言**：與開發者對話一律使用繁體中文
