# 交接文件 Handover

> 最後更新：2026-07-30（第 4 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前子專案範圍：**網站骨架 + Multiple Linear Regression pilot 章節**，驗證架構後再逐章擴充。

## 已完成進度 (Completed)

- Git/worktree：主倉庫 `https://github.com/jamessun0919-ops/Machine-Learning-Study`（`main`），實作在 worktree 分支 `worktree-ml-site-skeleton-pilot`（已 push 到遠端，最新 commit `1022e32`），本機路徑：
  `C:\Users\User\Desktop\Machine Learning Study\.claude\worktrees\ml-site-skeleton-pilot`
- **Task 1-11 全部完成並通過 task reviewer 審查**（詳見更早的交接文件記錄）
- 本階段（第 4 階段）完成事項：
  1. **`.reading-progress`（頂部閱讀進度條）改成 JS 版本**：`BaseLayout.astro` 新增 inline script，用 `scroll` 事件 + `requestAnimationFrame` 節流計算 `scrollTop/(scrollHeight-innerHeight)` 連續百分比並設定 `transform: scaleX()`，取代 Chromium-only 的 `animation-timeline: scroll()`；`prefers-reduced-motion: reduce` 時不執行（維持原本 scaleX(0) 隱藏）
  2. **章節主標題右側跳轉導覽**：`[slug].astro` 新增 `.chapter__header`（包住 `<h1>` + `.chapter__jump-nav`），兩個按鈕連到 `#summary`／`#interactive` 錨點（互動操作按鈕依 `chapter.data.interactiveComponent` 是否存在條件顯示），沿用網站既有全域 `scroll-padding-block-start` 設定，跳轉不會被 sticky nav 遮住
  3. **學習摘要區塊改為生成圖片**：`ChapterSummaryCard.astro` 新增可選 `image` prop（對應 `content.config.ts` 新增的 `summary.image` schema 欄位，用 Astro `image()` helper），有設定時顯示縮圖＋點擊全螢幕 lightbox，未設定時維持原本文字（formulas + keyStats）顯示，供未來章節漸進採用
     - 圖片內容：HTML/CSS 排版（仿 `pic/Bayes.png`／`pic/CRISPDM.png` 的乾淨向量資訊圖表風格，**非**字面 excalidraw 手繪風，已與開發者確認），KaTeX 走專案既有 npm 套件伺服器端渲染，Playwright 截圖產生 PNG（A4 直式比例，2480×3444px）
     - 內容數字：用網站自己的 `src/data/50-startups.json` 重新計算常態方程式迴歸結果（截距 50122.19、R&D 係數 0.8057、Administration -0.0268、Marketing 0.0272，R²=0.9507，RMSE=8855.34），**非**援用 `pic/CRISPDM.png` 的數字（該圖用了 train/test split＋標準化＋State 類別編碼，方法論跟本章節「全樣本＋僅3特徵＋常態方程式」的教學設定不一致）
     - 內容架構（開發者兩輪回饋後定案）：**上半部純概念**（1簡介→2模型公式→3適用情境與假設限制→4評估指標→5常見誤區，皆不含任何案例數字），**下半部單一「案例分析」區塊**整合所有案例相關數字（原頂部 metabar 的資料集資訊＋係數表＋R²/RMSE＋相關係數長條圖＋洞察文字），深色底＋teal 高亮跟其餘白底區塊做視覺區隔
     - 標題含中文翻譯：「案例分析：50 Startups（50 家新創公司財務資料及利潤預測）迴歸結果」
     - 全螢幕 lightbox：寬度撐滿容器（`inline-size: 100%`）、`overflow-y: auto` 讓使用者捲動查看全圖（**不是**縮小塞進視窗高度），關閉按鈕 `position: fixed` 固定於畫面右上角
  4. **PNG 資產生成腳本**（未納入專案版控，僅供未來章節複用參考）：`C:\Users\User\AppData\Local\Temp\claude\...\scratchpad\pw-check\infographic\generate.js`（HTML/KaTeX 排版）+ `shoot.js`（Playwright 截圖），Playwright 裝在 session 暫存目錄、非專案 `package.json` 依賴
- `npm test`（14 個測試）與 `npx astro check` 全程維持 0 錯誤，每次程式碼改動後都依規定關閉重開 dev server 驗證

## 目前的瓶頸或停頓點 (Current Blocker/Status)

沒有阻塞性問題，開發者已確認本階段所有改動「測試正常」。

**環境限制記錄**（供下次接手參考，非待辦事項）：本機環境原本沒有安裝瀏覽器自動化工具（`chromium-cli`、Playwright 皆不存在），本階段經開發者同意在 **session 暫存目錄**（非專案內）安裝 Playwright + Chromium 用於驗證 UI 行為，重開新 session 後這個安裝不會保留，如需要瀏覽器驗證要重新安裝或詢問開發者。

## 下一步行動 (Next Steps)

1. 依原計畫進行 **Task 12**（GitHub Pages 部署）：`astro.config.mjs` 加 `site`/`base`、建立 `.github/workflows/deploy.yml`、啟用 GitHub Pages（Source: GitHub Actions）、push 後用 `gh run watch` 驗證部署成功
2. Task 12 完成後，依原計畫進行 12 個任務的最終整體審查（final code review），通過後依 finishing-a-development-branch skill 決定 worktree 分支要 merge 進 main 或建 PR
3. 進入下一子專案（逐章節填入 `dir.txt` 其餘章節內容）前，先確認：
   - pilot 章節的骨架架構是否需要調整成更明確的「未來章節共用範本」文件（例如 3D 圖表自訂旋轉控制的寫法、學習摘要資訊圖表的生成流程）
   - 學習摘要資訊圖表目前是**手動執行腳本 + Playwright 截圖**產生單一靜態 PNG，未來若要幫每個章節都做一張，需要討論是否要把這個流程正式化（例如寫成專案內的 npm script，或維持手動流程）

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro（Content Layer API）、React island（`client:only="react"` 用於含 Plotly 等瀏覽器限定函式庫的元件，且必須是**字面 JSX 直接引用**，不能透過動態查找表/變數間接引用）、TypeScript、Plotly.js、KaTeX、Vitest、GitHub Pages（純靜態，無後端）
- **互動元件原則**：預先設計好的展示，非自由調參工具；資料集白名單制
- **視覺風格**：深色科技風（`--color-bg:#0f1117`、`--color-accent:#5ee6d0`、`--color-accent-secondary:#7c5ee6`，`#7c5ee6` 對背景色對比度僅 4.16:1，未達 WCAG AA 文字標準，**不可用於文字顏色**，只用在裝飾性漸層線條）
- **學習摘要資訊圖表風格原則（本階段新建立）**：仿照參考圖（`pic/Bayes.png`／`pic/CRISPDM.png`）的乾淨向量資訊圖表風格（白底、色塊分區、KaTeX 公式、清楚的圖標/色彩語意），**不是**字面上的 excalidraw 手繪風；內容架構原則是「概念學習優先、案例數字次之」——章節概念性內容（簡介/公式/適用情境/評估指標/常見誤區）放在圖表上半部且不含任何案例特定數字，所有案例相關數字（資料集資訊、係數、R²/RMSE、相關係數、基於案例的洞察文字）集中整合成單一「案例分析」區塊放在最下方
- **捲動動效原則**：`animation-timeline: view()`/`scroll()` 等 CSS scroll-driven animation 目前僅 Chrome/Edge 115+ 支援，本專案已決定**優先用 vanilla JavaScript** 達成跨瀏覽器一致效果，而非依賴新版 CSS API；「進入視野觸發」類效果（如標題強調線）用 `IntersectionObserver`，「連續比例」類效果（如閱讀進度條）用 `scroll` 事件 + `requestAnimationFrame` 節流——**兩者不可混用**，`IntersectionObserver` 不適合連續比例場景
- **3D 圖表旋轉控制原則**：Plotly 內建 `dragmode`（`orbit`/`turntable`）都無法滿足「限制旋轉範圍」的教學需求，本專案改用「關閉內建 dragmode、自訂 pointer 事件手刻旋轉、透過三角函數換算 `camera.eye`」的模式，參考 `RegressionScatter3D.tsx` 的 `cameraEyeFromAngles`/`clampElevation` 寫法
- **開發環境注意事項（本階段踩雷記錄）**：
  - 清除 `node_modules/.vite` 依賴快取後重啟 dev server，會觸發 Vite 對所有依賴（含 `react-plotly.js` 背後的 `plotly.js`，97MB 原始套件）重新用 esbuild 打包，**需要數十秒到一分鐘以上**，這段期間互動元件會短暫回報 `504 (Outdated Optimize Dep)`／hydration 失敗，屬正常現象非程式碼問題，等待打包完成即恢復（可用 `npx astro dev logs` 確認是否還停在 `[optimizer] bundling dependencies...`）
  - 只是要讓新的靜態資產（如圖片）生效時，只需清除 `.astro` 內容快取即可，**不需要**連 `node_modules/.vite` 一起清，避免觸發不必要的大型套件重新打包
  - `astro dev` 是背景 daemon 架構，`npm run dev &` 這種前景啟動方式的 shell log 只會抓到啟動時的初始 banner，實際持續運行的 log 要用 `npx astro dev logs` 查看；`npx astro dev status`／`npx astro dev stop` 可查詢/停止背景 daemon
- **`design-taste-frontend` skill 套件位置**：只安裝在主倉庫根目錄 `.agents/skills/`（gitignore），**worktree 建立時不會自動帶過去**，需要時要先手動 `cp -r` 複製過去
- **章節頁面固定九區塊**：簡介、分類方式、數學原理、運用範例、適用情境與限制、評估指標、常見誤區、學習摘要資訊圖表、互動式操作與演示
- **測驗題目**：明確不做成網頁功能，開發者另行以口頭/紙本試卷測試
- **章節排序來源**：`dir.txt`（main 分支）為唯一真實來源；`src/config/chapters.ts` 才是程式碼實際讀取的排序設定檔
- **SDD ledger**：`.superpowers/sdd/2026-07-28-ml-site-skeleton-pilot-chapter/progress.md`（worktree 內），記錄 Task 1-11 完整審查歷程
- **對話語言**：與開發者對話一律使用繁體中文
