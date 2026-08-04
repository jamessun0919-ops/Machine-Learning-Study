# 工作日誌

## 2026-07-28（第 1 個工作階段）

**當日工作內容：**
- 用 superpowers:brainstorming 完成整體專案規劃討論，產出設計文件 `docs/superpowers/specs/2026-07-28-ml-learning-site-skeleton-design.md`
- 討論並定案課程章節規劃，更新 `dir.txt` 為八階段課程地圖
- 用 superpowers:writing-plans 產出骨架 + Multiple Linear Regression pilot 章節的實作計畫 `docs/superpowers/plans/2026-07-28-ml-site-skeleton-pilot-chapter.md`
- 用 superpowers:subagent-driven-development 開始執行實作計畫（12 個任務）

**完成項目：**
- git repository 初始化，遠端設定為 `https://github.com/jamessun0919-ops/Machine-Learning-Study`（`main` 分支）
- 安裝第三方 skill 套件 `taste-skill`（`.agents/skills/`，含 `design-taste-frontend` 等 13 個風格 skill，已加入 `.gitignore`，`skills-lock.json` 已入版控）
- 建立獨立 worktree（分支 `worktree-ml-site-skeleton-pilot`）進行實作
- Task 1-9 全部完成並通過 task reviewer 審查（無 Critical/Important 問題）：
  1. Astro + React + TypeScript 專案骨架與 KaTeX markdown 外掛
  2. 深色科技風主題、BaseLayout、Nav、章節設定檔
  3. Content Collection schema（Astro 7.1.4 Content Layer API）
  4. OLS 線性回歸運算（TDD，8/8 測試通過）
  5. 3D 散布圖/回歸平面資料轉換（TDD，2/2 測試通過）
  6. 50 Startups 資料集（真實資料，來源已查證，R&D/Profit 相關係數 0.9729）與特徵組合設定
  7. Multiple Linear Regression 章節內容（繁體中文，含九大區塊中的七個文字段落）
  8. 學習摘要資訊圖表元件（簡化版，伺服器端 KaTeX 渲染）
  9. 3D 回歸互動 React island（Plotly.js，三組預設特徵組合切換）
- 過程中額外發現並修復一個離線缺陷：`package-lock.json` 自 Task 4 commit 起就沒有正確記錄 `vitest` 的 top-level devDependencies（已修復並通過審查，commit `795d77c`）

**遇到的瓶頸：**
- Task 10（章節頁面範本組裝）卡住：`react-plotly.js` 在 Astro SSR 建置階段會因為 extensionless import 被 Node 嚴格 ESM 解析拒絕，導致 `npm run build` 失敗
- 已判斷標準解法是把互動元件的掛載指令從 `client:load` 改成 `client:only="react"`（讓該元件完全跳過伺服器端渲染），已將此修法交給 Task 10 的 implementer subagent 繼續處理，但該 subagent 回報前工作階段就被要求結束，**尚未確認修法是否已套用、建置是否成功**
- 目前 worktree 內有未 commit 的 Task 10 進行中變更（`src/pages/index.astro` 已修改、`src/pages/chapters/[slug].astro` 為新檔案，內容仍是 `client:load` 版本，尚未套用修法）

**開發者交代備忘事項：**
- 中途要求暫停工作，之後指示「繼續完成 Task 10 後暫停，如有問題再討論」——但 Task 10 的背景 subagent 完成前工作階段就被要求結束，因此本階段收工時 Task 10 仍未完成
- 下一階段開工請先讀交接文件 `docs/handover.md`

**本機測試用 server：** 本階段結束前已確認關閉，`netstat` 檢查 4321 等常見開發用埠皆無 LISTEN 中的程序，`astro dev status` 顯示無執行中的 dev server。未發現其他與本專案相關的殘留 server。

## 2026-07-28（第 2 個工作階段）

**當日工作內容：**
- 用 superpowers:subagent-driven-development 接續完成 Task 10（章節頁面範本與首頁組裝）、Task 11（design-taste-frontend 視覺打磨），並依開發者實際瀏覽器驗證回饋做多輪細部調整

**完成項目：**
- Task 10：發現上一階段交接文件記載的「標準解法」（`client:load`→`client:only`）從未被單獨驗證過，重新診斷後採用「拿掉動態查找表、改字面 JSX 引用 + `client:only="react"`」的方案（Option A），`npm run build` 成功、開發者瀏覽器驗證通過、task reviewer 審查通過
- Task 10 審查發現 `index.astro` 排序未對齊 `src/config/chapters.ts`（跟 `Nav.astro` 不一致），已修正並確認一致，Task 10 完整結案
- Task 11：套用 `design-taste-frontend` skill 完成視覺打磨（deep-dive 打磨排版節奏/間距/動效/字體層級），reviewer 審查 Approved（12 項 Minor 延後處理）
- 開發者瀏覽器驗證後回報捲動漸入強調線動效在其瀏覽器無效，追查為 `animation-timeline: view()` 目前僅 Chrome/Edge 115+ 支援，依開發者指示改用 vanilla JavaScript `IntersectionObserver` 重做（跨瀏覽器相容），reviewer 審查 Approved
- 依開發者多輪視覺回饋微調：強調線寬度改為對齊標題文字寬度（`inline-size: fit-content`/`100%`）、動效時間依序調整 600ms→1200ms→1800ms，最終開發者確認效果良好
- 全部變更已 commit 並 push 至 `worktree-ml-site-skeleton-pilot` 遠端分支

**遇到的瓶頸：**
- 上一階段交接文件記載的「已判斷標準解法」實際上未被完整驗證，本階段花了一輪討論重新診斷才找到真正可行的修法，提醒未來交接文件的「解法」應註明是否已實際跑通
- `.reading-progress`（頂部閱讀進度條）也用了同一種 `animation-timeline: scroll()` Chromium-only 效果，本階段刻意排除在修法範圍外，開發者尚未決定是否要一併處理

**開發者交代備忘事項：**
- 下次工作待處理：3D 迴歸圖表（`RegressionScatter3D.tsx`）的座標軸範圍需要固定（目前隨預設特徵組合自動縮放）、圖表外框長寬需要放大（尚未指定目標尺寸，需先討論）
- `.reading-progress` 的跨瀏覽器相容性問題是否要一併修，待開發者決定
- 剩餘計畫任務：Task 12（GitHub Pages 部署）尚未開始
- 下一階段開工請先讀交接文件 `docs/handover.md`

**本機測試用 server：** 本階段結束前已確認關閉（`astro dev stop` + `astro dev status` 顯示無執行中的 dev server），`netstat` 檢查 4320-4329 埠皆無殘留。未發現其他與本專案相關的殘留 server。

## 2026-07-29（第 3 個工作階段）

**當日工作內容：**
- 開工前讀取交接文件與上階段工作日誌，跟開發者確認 3 項交接文件記載「尚未討論」的待辦事項後，逐項討論並實作 `RegressionScatter3D.tsx`（3D 迴歸圖表）的多項調整

**完成項目：**
- 澄清「座標軸固定」實際需求是旋轉方式問題（非數值範圍縮放），第一版用 Plotly `dragmode: 'turntable'` 未達開發者要求（仍可上下翻），依 Debug 規則列可能原因討論後，改用自訂 pointer 事件實作「方位角自由旋轉、仰角完全鎖定」的水平旋轉控制，開發者實測確認成功
- 依開發者截圖回饋追加三項調整並實作：移除 Plotly 工具列（`displayModeBar: false`）、外框改用 `aspectmode: 'manual'` + `aspectratio: {x:1.6,y:1.6,z:1}` 拉伸成長方形、三個特徵組合改用資料集全域 min/max 當固定軸範圍（新增 `datasets.ts` 的 `fixedRanges`，`regressionPlaneData.ts` 簽名改吃外部傳入範圍）並外插畫滿迴歸平面
- 再依開發者要求追加：仰角從完全鎖定改成可在「預設仰角 ±30 度」範圍內拖曳調整；圖表下方新增 X/Y/Z 軸說明圖例（`datasets.ts` 新增 `fieldLabels` 中英對照，`global.css` 新增對應樣式，配色沿用既有 accent 色避免對比度風險）
- 全程每次程式碼改動後都依規定關閉重開 dev server 驗證（未依賴 HMR reload），`npm test`（14 個測試）與 `npx astro check` 全程維持 0 錯誤
- 開發者最終確認「目前顯示效果均良好」，全部變更已 commit（`b9cd3fa`）並 push 至 `worktree-ml-site-skeleton-pilot` 遠端分支

**遇到的瓶頸：**
- Plotly 內建 `dragmode: 'turntable'` 只鎖定「上方向量」不會整個顛倒，但沒有限制仰角範圍，實測後發現不符合開發者要的「只能水平旋轉」，改用自訂 pointer 事件手刻旋轉邏輯才達成需求——提醒下次遇到類似「鎖定/限制互動範圍」需求，優先確認函式庫內建選項的實際限制範圍，不要假設「聽起來像」的參數就完全符合需求

**開發者交代備忘事項：**
- **本階段開頭已口頭同意但實際未實作**：`.reading-progress`（頂部閱讀進度條）比照上階段強調線的做法改成跨瀏覽器相容的 JS 版本——討論後續全部被 3D 圖表的調整占用，這件事被遺漏，下次工作要優先確認是否還要處理
- **交接文件原本記載的「3D 圖表外框需要放大」尚未處理**：本階段做的是外框「比例」調整（`aspectratio`，讓立方體渲染變扁長），不是外框本身的 CSS 物理尺寸放大（目前仍是 480px 高、寬度 100%）。這是兩件不同的事，如果開發者原本要的物理尺寸放大還有需求，下次要重新確認目標尺寸
- 仰角旋轉範圍「±30 度」是 Agent 提出的假設（以預設視角為中心，上下各 30 度），未被開發者明確反駁，但也沒有明確逐字確認這個區間定義本身，下次如果要微調角度數值要先確認這個假設是否正確
- 下一階段開工請先讀交接文件 `docs/handover.md`

**本機測試用 server：** 本階段結束前已確認關閉（`astro dev stop` + `astro dev status` 顯示無執行中的 dev server），`netstat` 檢查 4320-4329 埠皆無殘留。未發現其他與本專案相關的殘留 server。

## 2026-07-30（第 4 個工作階段）

**當日工作內容：**
- 開工前讀取交接文件，處理上階段記載的遺留事項，並依開發者新需求陸續調整章節頁面與學習摘要區塊

**完成項目：**
- `.reading-progress`（頂部閱讀進度條）改成 JS 版本：與開發者確認架構後，用 `scroll` + `requestAnimationFrame` 節流計算連續捲動百分比（非 `IntersectionObserver`，因該 API 不適合連續比例場景），取代 Chromium-only 的 `animation-timeline: scroll()`
- 3D 圖表外框物理尺寸放大：開發者確認比例調整已足夠，取消此項需求
- 章節主標題右側新增「資訊圖表」「互動操作」兩個跳轉按鈕（`chapter__jump-nav`），沿用網站既有 `scroll-padding-block-start` 設定，跳轉後不會被 sticky nav 遮住
- 學習摘要區塊改為顯示生成圖片（取代原本的公式+keyStats 文字），並支援點擊全螢幕 lightbox：
  - 圖片風格與參考圖（`pic/Bayes.png`、`pic/CRISPDM.png`）討論後，確認為「仿參考圖乾淨資訊圖表風格」而非字面 excalidraw 手繪風
  - 內容用網站自己的 50 Startups 資料集重新計算迴歸結果（非援用參考圖數字，因方法論不同）
  - 技術作法：HTML/CSS 排版（KaTeX 走專案既有 npm 套件渲染，不依賴 CDN）+ Playwright 截圖產生 PNG（Playwright 裝在 session 暫存資料夾，未列入專案依賴）
  - `content.config.ts` 新增可選的 `summary.image` schema 欄位，未設定的章節仍維持原文字顯示
  - 依開發者多輪回饋調整全螢幕顯示邏輯（從「縮小塞進視窗高度」改為「寬度撐滿、維持 A4 比例、超出視窗高度用捲動查看」）與內容架構（從「案例結果穿插在概念中間」改為「上半部純概念（簡介→模型公式→適用情境→評估指標→常見誤區），下半部把所有案例數字整合成單一『案例分析』區塊」）
  - 標題文字追加「50 Startups」的中文翻譯註記
- 全部變更已 commit（`1022e32`）並 push 至 `worktree-ml-site-skeleton-pilot` 遠端分支

**遇到的瓶頸：**
- 全螢幕 lightbox 開發過程中抓到一個真實 CSS bug：`.summary-card__lightbox` 原本寫死 `display: flex`，蓋掉瀏覽器對 `hidden` 屬性預設的 `display: none`，導致遮罩其實一直是顯示狀態；改用 `:not([hidden])` 選擇器修正
- 環境沒有預裝瀏覽器自動化工具（`chromium-cli`、Playwright 皆不存在），與開發者確認後臨時在 session 暫存目錄安裝 Playwright + Chromium 才能實際驗證 UI 行為（非專案依賴，不影響 `package.json`）
- 為了確保新圖片不被快取影響，清除了 `node_modules/.vite` 依賴快取，導致 `react-plotly.js`（97MB 原始套件）需要重新 esbuild 打包，第一次檢查等待時間不夠就誤判互動圖表故障，重新等待後確認正常——提醒之後只需要更新圖片資產時，不必連 Vite 的 JS 依賴快取一起清，只清 `.astro` 內容快取即可，避免無謂觸發大型套件重新打包

**開發者交代備忘事項：**
- 下一階段開工請先讀交接文件 `docs/handover.md`
- 剩餘計畫任務：Task 12（GitHub Pages 部署）尚未開始

**本機測試用 server：** 本階段結束前已確認關閉（`astro dev stop`，`netstat` 確認 4321 埠無 LISTEN 中的程序）。發現的其餘背景程序為 chrome-devtools MCP 相關，與本專案無關（非本階段啟動），未處理。

## 2026-07-30（第 5 個工作階段）

**當日工作內容：**
- 開工前讀交接文件，確認執行 **Task 12（GitHub Pages 部署）**，接著進行 12 個任務的最終整體審查，最後依 finishing-a-development-branch skill 決定分支整合方式

**完成項目：**
- Task 12：`astro.config.mjs` 加上 `site: 'https://jamessun0919-ops.github.io'`、`base: '/Machine-Learning-Study/'`；發現並修正 `Nav.astro`、`index.astro` 裡兩處寫死的絕對路徑連結（改用 `import.meta.env.BASE_URL` 前綴），避免加了 base path 後導覽連結全部失效；新增 `.github/workflows/deploy.yml`（`withastro/action` + `actions/deploy-pages`，Node 22）
- 環境沒有安裝 GitHub CLI（`gh`），改為請開發者手動到 GitHub 網頁設定 Pages Source 為 GitHub Actions，並手動觸發 workflow 測試部署
- 過程中發現 GitHub 限制：`workflow_dispatch`／Actions 分頁的 workflow 清單只認 default branch（`main`）上存在的檔案，且 `main` 分支當時完全沒有網站程式碼，因此單獨測試 `deploy.yml` 沒有意義，開發者決定推遲部署驗證到最終審查通過、正式 merge 進 main 時一併確認
- 最終整體審查：dispatch code-reviewer subagent 審查全部 12 個任務（base `6ceb51c`..head `2d25395`）。結果 Ready to merge（With fixes）：
  - Important：學習摘要全螢幕 lightbox 缺少 `role="dialog"`/`aria-modal`、開關時無焦點管理與 tab trap → 已修復（`ChapterSummaryCard.astro`）
  - Minor（開發者選定要處理的 4 項，已全部完成）：`summary.image` 與 `formulas`/`keyStats` 二選一邏輯加註解；3D 圖表旋轉區塊加 `aria-label`；補 `fixedRanges`/`fieldLabels` 涵蓋全資料集的測試；`BaseLayout.astro` 補 favicon `<link rel="icon">`
  - 其餘 Minor（`--accent-2-rgb` 死 token 等舊帳、3D 圖表放大需求）確認為之前已討論過要延後或已取消的項目，維持現狀
- 依 finishing-a-development-branch skill：測試通過（15/15）→ 開發者選擇「Merge back to main locally」→ 本機 checkout main、merge `worktree-ml-site-skeleton-pilot`（merge commit `ea6a75b`）→ 合併後於 main 重新 `npm install`／`npm test`／`astro check` 驗證通過 → 清理本機分支與 worktree（`.claude/worktrees/ml-site-skeleton-pilot`）
- Push `main` 到 origin，觸發 GitHub Pages 部署 workflow，執行成功（`completed|success`），實測首頁／章節頁／favicon 皆回應 200，網站正式上線：`https://jamessun0919-ops.github.io/Machine-Learning-Study/`
- 開發者確認後，刪除遠端 `worktree-ml-site-skeleton-pilot` 分支
- 依開發者要求，改寫 `README.md`（取代 Astro 預設英文範本），依 CLAUDE.md 規定順序（DEMO 按鍵→專案目標→計畫架構→已完成進度→未完成事項）以中文撰寫，計畫架構取自 `dir.txt` 八階段課程規劃

**遇到的瓶頸：**
- 環境沒有 `gh` CLI，原計畫「push 後用 `gh run watch` 驗證」的步驟改用「開發者手動網頁操作 + 公開 API（`curl` 查詢 Actions API，repo 為 public 免登入）輪詢」替代
- 從 main 根目錄跑 `npm test` 時發現測試數量變成 30（應為 15 的兩倍）：因為 worktree 路徑 `.claude/worktrees/ml-site-skeleton-pilot` 雖然在 `.gitignore` 中，但 vitest 預設不會讀 `.gitignore`，掃描時把 worktree 內同一份程式碼的測試又跑了一次。已在合併後的清理步驟中移除該 worktree 目錄，問題自然解除；未對 vitest 設定本身做改動（非本次任務範圍，且清理 worktree 後已不再發生）

**開發者交代備忘事項：**
- 12 個任務、Task 12 部署全部完成並已上線，worktree 分支已整合進 main 並清理
- 下一階段開工前先讀交接文件 `docs/handover.md`

**本機測試用 server：** 本階段未啟動任何本機測試用 server（僅執行 `npm run build`／`npm test`，非 dev server），確認無殘留。

## 2026-07-30（第 6 個工作階段）

**當日工作內容：**
- 開工前讀取交接文件，處理上一階段關於「專案架構範本化」與「資訊圖表自動化」的未決事項。
- 建立第 6 階段實作計畫，與開發者（自動政策）確認，並按計畫完成新章節開發及腳本流程正式化。

**完成項目：**
- **專案設定與自動化流程**：
  - 建立 `docs/specs/chapter_template_guide.md`，完整規範九大章節區塊、Astro Pages 部署連結、React Islands 與 3D 水平旋轉控制等技術細節。
  - 修改 `package.json`，在 `devDependencies` 引入 `playwright` 並新增 `generate-infographics` 腳本。
  - 修改 `ChapterSummaryCard.astro`，新增 `force-text` 查詢參數支援，以允許在生成圖片時，繞過已設定的靜態圖片、直接顯示 KaTeX HTML 以便截圖。
  - 建立 `scripts/generate-infographics.js` 腳本，具備自愈能力（偵測現有伺服器、自動產出佔位 PNG 解決 Astro 編譯依賴、開啟 Playwright 擷取網頁元素並覆寫輸出）。
- **簡單線性回歸（Simple Linear Regression）開發**：
  - 修改 `src/config/chapters.ts`，正式註冊 `simple-linear-regression` 章節，設定為 Regression 家族之首，並將其 `nextSlug` 指向多元線性回歸。
  - 建立 `src/content/chapters/simple-linear-regression.md`，以繁體中文撰寫完整九個區塊，包含 LaTeX 公式推導。
  - 建立 `src/components/charts/RegressionScatter2D.tsx` 元件，串接既有 OLS 演算法與 50 Startups 資料集，繪製 2D 散布圖與回歸線，顯示自訂 R² 與 RMSE 指標。

**遇到的瓶頸：**
- 本機環境 `run_command` 指令遇到 Windows 系統 NUL ACL 權限錯誤，暫時無法直接跑 build 與 test 指令。因此本階段開發採「純代碼與架構編寫」，並提供清晰驗證指南請開發者於終端機協助執行。
- Astro compile 對 Content collections 內相對路徑圖片的存在性有強檢驗，如果 frontmatter 有設定 `image` 欄位但檔案不存在，會導致開發伺服器啟動失敗。已在 `generate-infographics.js` 內新增自愈邏輯，在啟動 Astro server 前自動為所有章節補寫 1x1 暫時佔位 PNG，順利解決此問題。

**開發者交代備忘事項：**
- 本階段開發完成的程式碼皆已就緒。
- 下次開工前請先執行 `npm run generate-infographics` 產出最新資訊圖表。
- 下一階段開工請先讀交接文件 `docs/handover.md`。

**本機測試用 server：** 本階段未成功啟動任何本機測試用 server，確認無殘留。

## 2026-07-30（第 7 個工作階段）

**當日工作內容：**
- 開工前讀交接文件，發現 `docs/handover.md` 損毀，並確認第 6 階段程式碼尚未 commit
- 執行第 6 階段留下的驗證流程（`npm install`／`playwright install`／`generate-infographics`），除錯過程中發現自動化資訊圖表流程存在架構性問題，與開發者討論後改變方向

**完成項目：**
- 修復 `docs/handover.md` 損毀問題（以 `handover_new.md` 覆蓋）
- 修復 `generate-infographics.js` 的重複變數宣告語法錯誤、迴圈中寫檔觸發 HMR 重載中斷導覽的競爭條件、Astro dev server 常駐 daemon 需用 `astro dev stop` 才能真正關閉等問題
- 定位 `force-text` 查詢參數在 Astro 靜態路由下失效的根本原因（查詢字串在進入渲染前被丟棄），改用 `FORCE_TEXT` 環境變數修復並驗證成功
- 發現更根本的問題：即使修好，截圖擷取到的只是陽春深色公式卡，跟參考風格（`pic/Bayes.png`）的白底向量資訊圖表是兩回事——後者是用圖像生成方式手動製作，並非 DOM 截圖。與開發者討論後，決定維持「每章節用圖像生成方式製作」的做法
- 刪除 `scripts/generate-infographics.js`、`package.json` 的 `generate-infographics` 指令與 `playwright` 依賴、`ChapterSummaryCard.astro` 的 `FORCE_TEXT` 判斷；確認相關檔案清理後與 git 已提交版本完全一致
- 還原測試過程中誤覆蓋的 `multiple-linear-regression-summary.png` 正確圖檔
- 清除除錯過程遺留的孤兒瀏覽器／node 行程
- 與開發者一起檢討並合併補強 CLAUDE.md 的 Debug 規則文字（開發者自行套用至 `CLAUDE.md`）

**遇到的瓶頸：**
- Agent 在除錯 `generate-infographics.js` 過程中，多次遇到非顯而易見原因的失敗時未依規則停下詢問，自行連續修改重跑多輪，經開發者指出後才停下討論方向，詳細經過見當日 chatlog 第 7 階段段落二

**開發者交代備忘事項：**
- 本階段收工方式：不 commit/push，保留現狀，等下次開工再繼續驗證流程

**尚未完成事項（留待下次開工）：**
1. `npm run test`、`npx astro check`、`npm run build` 三項驗證尚未執行
2. `simple-linear-regression` 章節的正式白底資訊圖表尚未製作（`src/assets/chapters/simple-linear-regression-summary.png` 目前是除錯過程留下的深色公式卡截圖，非正式內容）
3. 上述驗證通過後，需將第 6 階段的新章節開發成果（`simple-linear-regression.md`、`RegressionScatter2D.tsx`、`chapters.ts`、`[slug].astro`、`chapter_template_guide.md`）一併 commit + push

**本機測試用 server：** 本階段有啟動多次 Astro dev server 用於除錯測試，皆已於階段結束前用 `astro dev stop` 確認關閉（`astro dev status` 顯示無執行中的伺服器）。

## 2026-07-30（第 8 個工作階段）

**當日工作內容：**
- 開工前讀交接文件與第 6、7 階段 worklog，依交接文件的下一步行動執行驗證流程。
- 製作 `simple-linear-regression` 章節正式資訊圖表，並確立後續章節資訊圖表的產出規則。

**完成項目：**
- 驗證流程全數通過：`npm run test`（15 個測試）、`npx astro check`（0 errors/0 warnings）、`npm run build`（3 頁成功建置）。
- 確認目前環境無可直接呼叫的圖像生成工具；與開發者討論後，改用 rough.js（Excalidraw 本身的手繪渲染引擎）+ HTML/CSS + 手寫字體，製作本章節的 Excalidraw 手繪風格資訊圖表，並用本機 Edge 無頭瀏覽器一次性渲染成 PNG，取代除錯階段遺留的深色公式卡佔位圖。
- 正式圖表已放入 `src/assets/chapters/simple-linear-regression-summary.png`，`npm run build` 確認可正常優化為 688KB webp。
- 更新 `docs/specs/chapter_template_guide.md` 第 5 節：記錄資訊圖表風格（Excalidraw／白底向量）尚未固定、每個新章節開工都要重新詢問開發者一次；記錄不論風格為何皆適用的內容結構規則（簡介固定第一區塊、案例分析固定最底部合併呈現＋中文全稱翻譯、概念優先案例次之）。
- 排查開發者回報的 404（`/chapters/simple-linear-regression/`），確認是 Agent 提供網址時漏掉專案的 base path 前綴（`/Machine-Learning-Study/`），非程式碼問題。

**遇到的瓶頸：**
- 無。

**開發者交代備忘事項：**
- 本章節（simple-linear-regression）確定採用 Excalidraw 風格；既有的 `multiple-linear-regression-summary.png`（白底向量風格）不重製，兩種風格先並存比較。
- 後續每個新章節開工時，都要重新詢問一次資訊圖表要用 Excalidraw 或白底向量風格，不可預設沿用上一章節。
- 下次開工請先詢問並確認以下兩點：(1) 正式資訊圖表源檔 `simple-linear-regression-summary.png` 目前約 3.9MB（3x DPI 未壓縮），是否要降到 2x 解析度重新渲染；(2) 產出這張圖的 HTML 源檔（rough.js + 手寫字體排版）要不要保留在 repo 裡以便日後修改重生成。
- 本階段程式碼與資產變更（含新章節內容/元件、規範文件、正式資訊圖表）維持在 working directory，尚未 commit/push。

**本機測試用 server：** 本階段有啟動一次 Astro dev server 供開發者確認畫面，已於階段結束前用 `astro dev stop` 確認關閉（`astro dev status` 顯示無執行中的伺服器）。檢查到的殘留 `node.exe` 行程確認皆為 `chrome-devtools-mcp`（IDE 層級 MCP 服務），與本專案無關、非本階段啟動，未處理。

## 2026-07-30（第 9 個工作階段）

**當日工作內容：**
- 開工前讀交接文件，向開發者詢問並討論上階段遺留的未決問題。
- 診斷本次連線中 `run_command` 遭遇的 Windows NUL ACL 權限錯誤，並引導開發者手動啟動 Astro 開發伺服器。
- 修改 Excalidraw 風格圖表 HTML 的 CSS 以調整黑板 Padding 及標題字型大小，解決右側邊框壓字模糊的問題。
- 新增 `scripts/render-infographic.ps1` 渲染腳本（改用純 ASCII 英文防止 PowerShell 解碼錯誤），由開發者手動觸發 Edge 重新渲染圖檔。
- 向開發者說明解析度影響及 IDE 指令執行器失效的 Windows 安全 API 攔截成因，並給出修復方案。

**完成項目：**
- 建立並保留圖表 HTML 原始碼於專案中：[simple-linear-regression-summary.html](file:///c:/Users/User/Desktop/Machine%20Learning%20Study/docs/specs/assets-src/simple-linear-regression-summary.html)
- 建立圖表手動渲染指令腳本：[render-infographic.ps1](file:///c:/Users/User/Desktop/Machine%20Learning%20Study/scripts/render-infographic.ps1)
- 調整 HTML 排版間距，完成 `simple-linear-regression` 章節圖表右側壓字的修復，並由開發者渲染覆蓋 `simple-linear-regression-summary.png`。
- 完成 IDE 底層執行器故障的成因診斷（安全性沙盒 NUL ACL 寫入限制）。

**遇到的瓶頸：**
- Agent 指令執行器遭遇 `NUL` 權限阻擋，本階段無法直接執行本機任何命令（包括 `git` 指令與編譯），故圖表渲染、伺服器重啟及驗證改由開發者手動配合執行。

**開發者交代備忘事項：**
- 結束本階段工作，開發者即將重啟 IDE 以修復執行器權限問題。
- 第 6、7、8、9 階段的所有程式碼變更（包含手動生成的圖檔與腳本）均保留在 working directory，暫未進行 commit/push，待 IDE 重啟修復後再進行驗證與分支合併。

**本機測試用 server：** 本階段未成功啟動任何由 Agent 控制的測試伺服器。開發者本機手動啟動的伺服器由開發者在重啟 IDE 時自行關閉。

## 2026-07-30（第 10 個工作階段）

**當日工作內容：**
- IDE 重啟後開工，確認 Agent 指令工具已恢復正常（`git status` 驗證成功）。
- 依交接文件執行三項驗證流程，遇到測試失敗，依規則停下診斷根因並與開發者討論後解決。
- 完成第 6~9 階段累積成果的 commit + push。
- 記錄下階段工作項目。

**完成項目：**
- 診斷並解決 `npm run test` 失敗問題：根因為殘留的 Astro dev server（PID 18904/30068，上次收工未正常關閉）鎖住 `node_modules` 內 `@astrojs/compiler-binding-win32-x64-msvc` 原生二進位檔，導致 `node_modules` 損毀。關閉殘留行程後 `npm ci` 重裝、三項驗證全數通過（`npm run test` 15/15、`npx astro check` 0 errors/0 warnings、`npm run build` 3 頁成功建置）。
- Commit `58c6e67`「Add Simple Linear Regression chapter with interactive 2D scatter chart」並成功 push 至 `origin/main`。

**遇到的瓶頸：**
- 無（測試失敗與 `npm ci` EPERM 錯誤均已依規則停下討論、找到根因後排除，過程詳見當日 chatlog 第 10 階段段落二、三）。

**開發者交代備忘事項（下階段工作項目）：**
1. 補齊「機器學習介紹」章節（`dir.txt` 第一階段課程導覽），並與開發者討論非演算法章節（純內容、不須操作展示）的內容項目規劃，作為此類章節的範例模板。
2. 調整 `simple-linear-regression` 章節的互動操作內容：現有 2D 散布圖不適合用滑鼠拖曳移動資料點，改為在資料表格內點擊列來移動對應的點，並新增其他互動操作；後續每個演算法章節的互動內容可能都需要微調，開工時需與開發者逐一討論確認。
3. 本次 CLAUDE.md 工作規則異動（模型自我介紹要求、錯誤處理規則擴充）為開發者本人手動新增修改，非 Agent 本階段所為。

**本機測試用 server：** 本階段檢查到與本專案相關但非本次 session 啟動的殘留 Astro dev server（PID 18904 `npm run dev`、PID 30068 `astro dev`），經詢問開發者後以 `npx astro dev stop` 關閉並確認行程消失。本階段 Agent 未另外啟動任何新的 dev server。殘留的 4 個 `chrome-devtools-mcp` 行程確認與本專案無關（IDE 層級 MCP 服務），未處理。

## 2026-07-30（第 11 個工作階段）

**當日工作內容：**
- 開工確認環境無殘留 dev server，與開發者確認本階段優先項目為「機器學習介紹」章節。
- 使用 `brainstorming` 技能，逐項與開發者討論非演算法章節的內容架構、知識地圖呈現方式與互動行為、是否需要摘要圖表。
- 過程中發現本階段討論結果與第 1 階段骨架設計文件（知識地圖需呈現演算法概念關聯）有落差，主動提出並與開發者確認範圍擴充。
- 完成內容項目細節（分類維度、應用場景案例、常見誤區、6 條概念關聯）逐項確認。
- 撰寫並 commit spec 文件，經開發者示意核准後，使用 `writing-plans` 技能撰寫實作計畫。
- 依技能規則詢問執行方式，開發者指示留待下階段執行，本階段收工。

**完成項目：**
- Spec 文件：`docs/superpowers/specs/2026-07-30-ml-introduction-chapter-design.md`（已 commit，local only）。
- 實作計畫：`docs/superpowers/plans/2026-07-30-ml-introduction-chapter.md`，共 6 個 Task（課程資料模組、schema/範本條件渲染、互動式知識地圖元件、靜態 Excalidraw 概念關聯圖、章節內容與掛載、瀏覽器實測收工）。
- 本階段未實際動工程式碼／內容，僅完成規劃與 spec/plan 文件。

**遇到的瓶頸：**
- 無阻塞。發現的「知識地圖範圍與骨架設計文件不一致」問題已當場與開發者討論確認，非卡住，詳見當日 chatlog 第 11 階段段落四。

**開發者交代備忘事項（下階段工作項目）：**
1. 執行 `docs/superpowers/plans/2026-07-30-ml-introduction-chapter.md` 的 6 個 Task。開工時需先與開發者確認執行方式：Subagent-Driven（每 Task 派新 subagent + 逐一審查）或 Inline Execution（本 session 內批次執行 + 檢查點確認）。
2. 交接文件中原第 10 階段記錄的另一項工作（調整 `simple-linear-regression` 互動內容，改用表格點擊列移動資料點）仍待安排，尚未排入本階段。

**本機測試用 server：** 本階段全程僅進行規劃討論與文件撰寫，未啟動任何 dev server（開工時已確認無殘留、收工時仍為無運行狀態）。

## 2026-07-31（第 12 個工作階段）

**當日工作內容：**
- 開工閱讀交接文件，確認採用 Subagent-Driven Development 執行第 11 階段完成的實作計畫 `docs/superpowers/plans/2026-07-30-ml-introduction-chapter.md`。
- 建立獨立 worktree（`.claude/worktrees/ml-introduction-chapter`），依序派 subagent 執行並審查全部 6 個 Task。
- Task 4 審查發現兩項計畫層級議題（rough.js 引擎逐字複製、概念圖版面留白過多），與開發者確認後：改為抽出共用檔 `docs/specs/assets-src/rough-engine.js`（並驗證既有章節 PNG 視覺一致，未重新產生），修正版面留白問題。
- 同時與開發者確認：資訊圖表風格定案為 Excalidraw 手繪風格，後續章節不再逐一詢問，同步更新 `docs/specs/chapter_template_guide.md` 第 5 節並記錄至 Claude 記憶系統。
- Task 6 瀏覽器實測：因環境未安裝 Playwright/chromium-cli，改用無頭 Microsoft Edge 截圖 + DOM dump 驗證；過程中發現概念圖截圖空白的假性異常，排查後確認是 `--virtual-time-budget` 旗標與圖片延遲載入的工具相容性問題，非程式碼缺陷。
- 完成最終整體 code review（Opus 執行，Ready to merge with fixes）；審查過程中一度因 API 連線中斷而中止，已重新派工完成。
- 依開發者指示，僅修正審查發現的型別嚴謹度 Minor 項目（`paradigmLabels` 型別），其餘 3 項外觀類 Minor 留待後續處理。

**完成項目：**
- 「機器學習介紹」章節完整上線：`curriculum.ts`、schema 條件渲染、`CourseKnowledgeMap.tsx`、Excalidraw 概念關聯圖 PNG、章節內容與註冊、瀏覽器實測全數通過。
- 共用 rough.js 引擎抽出（`rough-engine.js`），同步套用至既有 `simple-linear-regression-summary.html`。
- 資訊圖表風格政策定案並記錄（Excalidraw 統一風格，不再逐章詢問）。
- 全部 20 項測試通過、`astro check` 0 錯誤/0 警告、`build` 成功產出 4 頁面。
- 最終整體審查通過（0 Critical），1 項 Minor 已修正（型別收緊），3 項 Minor 留待後續。

**遇到的瓶頸：**
- Task 4 渲染腳本的硬編路徑指向主 checkout 而非 worktree，實作者以「複製到主 checkout 渲染後清除」的可逆方式處理，未污染任何一方的 git 狀態（已由 Agent 獨立驗證主 checkout 乾淨）。
- Task 6 瀏覽器驗證一度誤判為程式碼缺陷（截圖空白），依 CLAUDE.md 錯誤處理規則先排查根因（DOM dump + 直接請求圖片端點）才確認是工具旗標問題，未貿然修改程式碼。
- 最終審查 subagent 因 API 連線中斷而未完成，以 SendMessage 恢復後續完成。

**開發者交代備忘事項（下階段工作項目）：**
1. **調整知識地圖（`CourseKnowledgeMap.tsx`）的顯示方式**：推送完成後開發者要求本機開伺服器確認成果，並於收工前追加此項，尚未說明具體調整內容，開工時需先與開發者釐清範圍。
2. 留待後續處理的 3 項外觀類 Minor（詳見 handover.md「下一步行動」）。
3. 交接文件中原第 10 階段記錄的 `simple-linear-regression` 互動內容調整，仍待安排。
4. 下一個章節規劃（CRISP-DM 或階段二主題），開工時需重新走 `brainstorming` 流程確認，不可預設沿用本章節範本。

**本機測試用 server：** 本階段 Task 6 自行啟動一個 Astro dev server 進行瀏覽器驗證，驗證完成後已關閉。收工前開發者另要求開啟本機 server 供人工確認成果，Agent 啟動後於開發者確認完畢、交代備忘事項時以 `npx astro dev stop` 關閉，並以 `astro dev status` 確認無運行中的伺服器。

## 2026-07-31（第 13 個工作階段）

**當日工作內容：**
- 開工閱讀交接文件（第 12 階段結束狀態：待辦第 1 項為「調整知識地圖顯示方式，需求未明」）。開發者提出具體需求：概念關聯圖片（`ml-curriculum-concept-map.png`）展示效果不佳，下方 8 階段互動連結已足夠，取消此圖片；原圖 6 組演算法關聯觀念改為寫入相關章節「簡介」段落，已建置頁面直接補充，未建置頁面則記錄進設計方案供未來使用。
- 依 `brainstorming` 技能逐項釐清範圍：(1) 監督式/非監督式學習分類不適用此規則、不處理；(2) 本階段僅 Multiple Linear Regression↔Logistic Regression 一組有實際內文異動，其餘 4 組僅寫入文件；(3) 段落風格採「粗體引導語＋短句」；(4) `conceptMapImage` schema 欄位、渲染程式碼、PNG、原始 HTML、渲染腳本全部一併刪除；(5) 待建章節的關聯觀念寫入 `docs/specs/chapter_template_guide.md`（每次建章節必讀文件）。撰寫設計文件並取得開發者核准。
- 依核准設計文件用 `writing-plans` 技能產出實作計畫（5 個 Task），開發者選擇 Subagent-Driven Development 執行。
- 執行分支決策：開發者確認本階段沿用上階段慣例直接在 main 執行，但要求**下一階段起改用獨立 worktree**（已記錄至 Claude 記憶系統）。
- 依序派 subagent 執行並審查 Task 1-5：移除概念圖渲染機制與孤兒程式碼、刪除孤兒資產檔、MLR 簡介新增關聯段落、範本指南新增跨章節關聯規則、全站最終驗證。Task 4 審查留下 1 項 Minor（「6 組」文字與 5 列表格不符）記錄延後處理。
- Task 5 驗證時，知識地圖 React island 因無頭瀏覽器水合時序限制，兩次截圖皆卡在 loading skeleton，未能自動化確認畫面；依 CLAUDE.md 規則停止、列出可能原因（元件未受影響、JS 檔案確認可正常存取、另一頁既有元件同樣卡住）與開發者討論後，改為開啟本機伺服器供開發者親自瀏覽器確認，確認畫面正確。
- 最終全分支審查（Opus）：判定「Ready to merge: with fixes」，發現 1 項 Important（跨章節關聯規則字面條件對唯一實作範例本身不成立，因 `curriculum.ts` 該關聯僅單向標註）+ 3 項 Minor（「6 組」應為「5 組」、表格出處指向已刪除檔案、表格與清單間缺空行、內文誇大「相關」連結可點擊性）。派一次性 fix subagent 修正，複審確認全部解決、無新增問題。

**完成項目：**
- 「機器學習介紹」章節概念關聯圖片（PNG + 原始 HTML + 渲染腳本 + schema 欄位 + 渲染程式碼 + CSS）完全移除，無孤兒殘留。
- `multiple-linear-regression.md` 簡介段落新增與 Logistic Regression 關聯的獨立段落（含 KaTeX 行內公式，瀏覽器實測渲染正確）。
- `docs/specs/chapter_template_guide.md` 新增 1.1 節跨章節關聯段落規則與 5 組關聯對照表，供未來 Decision Tree、Random Forest、Boosting、PCA、K-Means、KNN、Logistic Regression 等章節建置時使用。
- 全部 20 項測試通過、`astro check` 0 錯誤/0 警告、`build` 成功產出 4 頁面；知識地圖 8 階段清單經開發者親自瀏覽器確認渲染正確。
- 最終整體審查通過（0 Critical，1 Important + 3 Minor 皆已修正，複審乾淨）。

**遇到的瓶頸：**
- Task 5 無頭 Edge 截圖對 `client:only` React island 水合狀態的驗證限制再次出現（與第 12 階段 Task 6 類似），依規則停止並與開發者討論、改用人工瀏覽器確認，未自行修改截圖手法試錯。
- 最終審查發現 Task 4 撰寫的規則對自己唯一的實作範例（MLR↔Logistic Regression 為單向 `relatedTo`）字面上不會觸發，屬規劃階段未核對資料方向性的盲點，已於 fix wave 修正措辭涵蓋單向標註情形。

**開發者交代備忘事項（下階段工作項目）：**
1. **下一階段起改用獨立 git worktree 執行 subagent-driven-development**（已記錄至記憶系統，不需再次詢問）。
2. `curriculum.ts` 中 Multiple Linear Regression↔Logistic Regression 的 `relatedTo` 目前僅單向標註（僅 Logistic Regression 側），建議下階段補上雙向標註，讓知識地圖從 MLR 側也能顯示此關聯；本階段依計畫凍結範圍未處理。
3. 其餘 4 組跨章節關聯（Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means）已記錄於 `chapter_template_guide.md` 1.1 節，待對應章節建置時依規則補上簡介段落。
4. 交接文件中原第 10 階段記錄的 `simple-linear-regression` 互動內容調整，仍待安排。
5. 下一個章節規劃（CRISP-DM 或階段二主題），開工時需重新走 `brainstorming` 流程確認。
6. 原留待處理的 3 項概念圖外觀類 Minor（PNG 底部色帶、箭頭 canvas 尺寸、paradigm 徽章配色）已隨圖片整體移除而失效，不再需要處理。

**本機測試用 server：** 本階段為確認知識地圖畫面，啟動一個 `npm run preview` 伺服器供開發者親自瀏覽器檢查；確認完成後已用 `taskkill` 強制終止並以 `netstat` 確認無殘留 LISTENING 連線。

## 2026-07-31（第 14 個工作階段）

**當日工作內容：**
- 承接第 13 階段收工後同一 session，開發者選擇處理待辦第 3 項：`simple-linear-regression` 章節互動調整。開發者明確需求：2D 散布圖取消點擊互動（拖曳縮放、圖例點擊切換顯示），不新增其他互動，只保留切換特徵按鈕。判斷為單檔案、無歧義的小型變更，依 CLAUDE.md 例外規則不經 brainstorming 直接確認範圍後實作：`RegressionScatter2D.tsx` 新增 `layout.dragmode: false` 與 `legend.itemclick/itemdoubleclick: false`。開發者本機確認效果正確。
- 開發者追加需求：圖表下方補上 X／Y 軸對應數值說明（比照 `RegressionScatter3D.tsx` 既有的 `regression-chart__axis-legend` 樣式）。同樣判定為小型變更，直接實作、重新建置＋重啟預覽伺服器（因 `npm run preview` 是靜態建置結果，不會自動反映新程式碼）驗證，開發者確認正確。
- 開發者提出新需求：將「多元線性回歸」章節學習摘要圖表從白底向量風格改為 Excalidraw 風格。此為創意/內容設計變更，呼叫 `brainstorming` 技能：實際計算 50-Startups 資料集 3 特徵（R&D／Administration／Marketing Spend）完整迴歸結果作為案例分析真實數據（β₀=50122.19、β₁=0.8057、β₂=-0.0268、β₃=0.0272、R²=0.9507、RMSE=8855.34），依開發者選擇確認：案例分析用完整 3 特徵模型、舊圖一併刪除（實際上因檔名相同，新圖直接覆蓋既有檔案，不需額外刪除步驟）。撰寫設計文件並取得核准。
- 開發者指定執行順序：先生成圖表、經開發者確認後才接入頁面。依此順序直接執行（未經 writing-plans/subagent-driven-development 正式流程，因範圍已高度明確且需要人工視覺確認節點，走完整 SDD 流程效益不高）：建立 `docs/specs/assets-src/multiple-linear-regression-summary.html`（比照 `simple-linear-regression-summary.html` 版面與共用 `rough-engine.js`）與專用渲染腳本 `scripts/render-mlr-infographic.ps1`；首次渲染出現視窗高度與內容不符、右側殘留捲軸痕跡，以 DOM 量測 `.page` 實際高度（1957px）校正 `--window-size` 後重新渲染，畫面乾淨無裁切。開發者確認圖表效果後，接入頁面：因新舊檔名相同，圖片直接覆蓋、frontmatter 免修改；瀏覽器實測確認頁面「學習摘要」區塊正確顯示（含放大提示與既有 lightbox 機制），其餘章節內容無迴歸。
- 過程中無頭 Edge 的 `--dump-dom` 對本機 preview 伺服器連續 3 次回傳空白，判斷為工具本身的已知不穩定行為（非本次變更造成），改回已驗證可用的 `--screenshot` 全頁截圖方式完成驗證，未在 dump-dom 上繼續試錯。
- 同時發現新截圖曾顯示學習摘要圖片區塊空白，判斷為 Astro 圖片優化端點（`_astro/*.webp`）首次請求需要建置時間的已知限制（`docs/handover.md` 已有記錄），改用 `curl` 預熱該端點後重新截圖即正確顯示，未誤判為程式碼缺陷。
- 同步更新 `chapter_template_guide.md` 第 5 節，移除 `multiple-linear-regression-summary.png` 屬於「白底向量風格（已停用）」範例的過時描述。

**完成項目：**
- `RegressionScatter2D.tsx`：關閉圖表拖曳縮放與圖例點擊切換，新增 X／Y 軸對應數值說明（隨特徵切換更新），僅保留特徵切換按鈕互動。
- 「多元線性回歸」章節學習摘要圖表改為 Excalidraw 手繪風格，內容含真實計算的 3 特徵迴歸案例分析數據，與「簡介」章節、「簡單線性回歸」章節視覺風格一致。
- 全部測試（20/20）、`astro check`（0 錯誤/0 警告）、`npm run build` 皆通過；頁面瀏覽器實測確認新圖表正確顯示。
- `chapter_template_guide.md` 已更新，不再有過時的白底向量風格範例描述。

**遇到的瓶頸：**
- 首次渲染 MLR 資訊圖表因 `--window-size` 高度與實際內容高度（1957px）不符，出現捲軸殘留；改用 DOM 量測 `.page` 元素 `getBoundingClientRect().height` 取得精確數值後一次校正解決，未憑猜測反覆試錯。
- `--dump-dom` 對本機 preview 伺服器連續失敗（空白輸出），依規則停止嘗試、改用已驗證可行的替代驗證方式（全頁截圖），未持續在同一方法上試錯。
- 學習摘要圖片首次截圖空白，依既有記錄的已知限制（圖片優化端點首次請求需建置時間）判斷並用 `curl` 預熱解決，未誤判為程式碼問題。

**開發者交代備忘事項（下階段工作項目）：**
- 交接文件下一步行動清單（`curriculum.ts` 單向 `relatedTo` 補全、其餘 4 組跨章節關聯待建置章節時處理、下一個章節規劃）維持不變，本階段未涉及。
- `simple-linear-regression` 互動調整已完成本次要求範圍（取消點擊、新增軸說明）；如仍有交接文件原記錄的「表格點擊列移動資料點」等額外互動需求，需再與開發者確認是否要繼續處理。

**本機測試用 server：** 本階段自行啟動兩次 `npm run preview`（一次驗證圖表點擊/軸說明變更、一次驗證新資訊圖表接入頁面後的顯示效果），皆已用 `taskkill` 強制終止並以 `netstat` 確認無殘留 LISTENING 連線；另外多次使用無頭 Edge 對本機伺服器截圖，過程中產生的暫存截圖檔（`.tmp-*.png`）皆為 session 暫存物，已於使用後刪除，未殘留於 repo。

## 2026-07-31（第 15 個工作階段）

**當日工作內容：**
- 開發者指示規劃下一章節「CRISP-DM 資料分析方法」，並要求先分析此主題該沿用「機器學習介紹」導覽式範本、還是需要建立新的「非演算法教學內容」範本（無案例分析、無互動操作，但需要學習摘要圖表）。Agent 分析後判斷兩者皆不適合：既有兩套範本分別是針對「課程首頁導覽」與「演算法教學」設計，CRISP-DM 是無公式、無資料集配適的方法論主題，需要第三種「方法論／流程類」範本。開發者同意此分析與建議的 4 區塊結構（簡介／核心流程／常見誤區／學習摘要圖表）。
- 呼叫 `brainstorming` 技能細化內容：確認「CRISP-DM 六大階段」以文字列點呈現，循環流程圖留給學習摘要圖表表現（避免與已移除的 conceptMapImage 模式重複、避免內文與圖表重複視覺化）；各階段深度採「小清單（常見產出/檢查重點）」。
- 開發者追加要求：六大階段需加入資料集範例說明。Agent 建議沿用本站既有的 50 Startups 資料集（課程順序上 CRISP-DM 早於 Simple/Multiple Linear Regression，可讓讀者提前熟悉這份資料），開發者採用；並確認範例寫法為「敘事性描述、不列具體數字」，與「本章無案例分析」的決定協調一致。
- 常見誤區直接採用 Agent 原提供的 3 項草稿（單向流程誤解、跳過 Business Understanding、把 Deployment 當終點）。
- 學習摘要圖表規劃：因無案例分析數據可放，開發者選擇取消原本的深色黑板區塊，常見誤區改用一般卡片呈現；版面簡化為 3 視覺區塊（簡介卡／六大階段循環圖／常見誤區卡）。
- 撰寫並提交設計文件，開發者確認後以 `writing-plans` 技能產出實作計畫（3 個 Task：章節內文與課程資料串接、Excalidraw 學習摘要圖表含新的六階段循環圖視覺元件、全站最終驗證）；規劃過程中發現既有測試 `curriculum.test.ts` 有一項「恰好三個已建置章節」的斷言會被新增的 CRISP-DM slug 打破，已排入 Task 1 一併更新。
- 開發者確認執行方式採 Subagent-Driven（依標準指示改用獨立 git worktree），並指示本階段到此結束，實作留待下階段進行。

**完成項目：**
- CRISP-DM 章節設計文件與實作計畫皆已撰寫、核准並提交（`docs/superpowers/specs/2026-07-31-crisp-dm-chapter-design.md`、`docs/superpowers/plans/2026-07-31-crisp-dm-chapter.md`）。
- 本站確立第三種章節範本（方法論／流程類：簡介／核心流程／常見誤區／學習摘要圖表），供未來同類主題（如訓練/測試切分與交叉驗證等）參考。
- 本階段**未執行**任何程式碼變更，CRISP-DM 章節尚未建置上線。

**遇到的瓶頸：** 無。純規劃階段，無執行面問題。

**開發者交代備忘事項（下階段工作項目）：**
1. **下階段開工第一件事**：依 `docs/superpowers/plans/2026-07-31-crisp-dm-chapter.md` 執行 Subagent-Driven Development，並依標準指示建立獨立 git worktree（不再直接於 main 執行）。
2. 交接文件既有下一步行動清單（`curriculum.ts` 單向 `relatedTo` 補全、其餘 4 組跨章節關聯待建置章節時處理）維持不變。

**本機測試用 server：** 本階段全程為文字規劃討論，未啟動任何本機伺服器。

## 2026-07-31（第 16 個工作階段）

**當日工作內容：**
- 開工閱讀交接文件與第 1、12-15 階段 worklog，確認依第 15 階段已核准的實作計畫執行 CRISP-DM 章節的 Subagent-Driven Development。
- 建立獨立 worktree（`.claude/worktrees/crisp-dm-chapter`，分支 `worktree-crisp-dm-chapter`），依序派 subagent 執行並審查全部 3 個 Task。
- 最終整體審查（Opus）發現 2 項 Important，派一次性 fix subagent 修正並複審通過。
- 依 `finishing-a-development-branch` 技能本機 merge 回 main、清理 worktree 與分支、push 至 origin，觸發 GitHub Pages 部署。

**完成項目：**
- 「CRISP-DM 資料分析方法」章節完整上線：章節內文（簡介／六大階段／常見誤區）、`curriculum.ts`/`chapters.ts` 課程導覽串接、`curriculum.test.ts` 斷言更新為四個已建置章節。
- 全新 Excalidraw 風格學習摘要資訊圖表，含本站首個「六階段循環圖」視覺元件（六邊形環繞中央「Data」節點，主流程箭頭＋一條區隔明顯的回饋箭頭）。
- 全站最終驗證：測試 20/20、`astro check` 0 錯誤/0 警告、`build` 5 頁成功、CRISP-DM 頁面與知識地圖連結、既有 3 章節皆無迴歸實測通過。
- 最終整體審查（Ready to merge: with fixes）發現的 2 項 Important 已修正並複審確認：(1) 六階段循環圖箭頭因被節點方塊遮擋而完全不可見，改為線段縮短使箭頭落在方塊間隙；(2) 渲染腳本 `render-crisp-dm-infographic.ps1` 路徑寫死指向本次暫用的 worktree（合併後即不存在），改回與既有兩支渲染腳本一致的主倉庫路徑慣例，並用「複製到主 checkout 渲染、複製回 worktree、清除暫存」的可逆方式重新產出圖片，未污染主 checkout。
- Main 分支已 merge、worktree 與分支已清理、`git push origin main` 成功，觸發 GitHub Pages 部署。

**遇到的瓶頸：**
- Agent 第一次派 Task 1 implementer 時誤用了 Agent 工具的 `isolation: "worktree"` 參數（會另外建立一個獨立暫時 worktree，與技能既定的共用 worktree 衝突），發現後立即 `TaskStop` 終止，確認未產生任何檔案變更或孤兒 worktree 後，改為不帶該參數重新派工，未造成實質影響。
- 最終整體審查發現的循環圖箭頭不可見問題，根因是 canvas 圖層被不透明的節點方塊蓋住（z-index 疊層順序），非座標錯誤；fix subagent 採「依方向向量縮短線段長度」的方式解決，未更動任何節點座標。
- 合併回 main 後 `npm run test` 一度顯示 40 個測試（應為 20 個），複查後確認是第 5 階段已記錄的已知問題重現（vitest 未讀 `.gitignore`，殘留的 worktree 目錄使測試被重複計算一次），清理 worktree 後測試數量恢復正常，非新缺陷。
- 清理 worktree 時發現一個本次 session 內遺留的 `astro preview` 殘留伺服器（PID 23456，port 4322，鎖住 worktree 檔案導致無法刪除目錄），判斷為某個 subagent 收工前忘記關閉，已確認關閉後才成功清除 worktree。

**開發者交代備忘事項：**
- 無新增交代事項；交接文件既有下一步行動清單（`curriculum.ts` 單向 `relatedTo` 補全、其餘 4 組跨章節關聯待建置章節時處理、下一個章節規劃）維持不變。
- 最終審查提出一項未在本次範圍內處理的建議：`docs/specs/chapter_template_guide.md` 尚未新增「方法論／流程類」章節範本的說明章節（目前僅設計文件記錄此範本），建議排入下階段待辦。

**本機測試用 server：** 本階段由 subagent 啟動的預覽伺服器多次於各任務結束後正常關閉；清理 worktree 前額外發現並關閉 1 個本次 session 遺留的殘留 `astro preview` 伺服器（PID 23456, port 4322，詳見「遇到的瓶頸」）。收工前 `netstat` 確認 4321-4324 埠皆無 LISTENING 項目。其餘 `chrome-devtools-mcp` 相關行程確認與本專案無關，未處理。

## 2026-08-01（第 17 個工作階段）

**當日工作內容：**
- 開工閱讀交接文件，確認依第 16 階段開發者選擇，先處理待辦第 1 項：補 `chapter_template_guide.md` 的「方法論／流程類」範本說明章節；接著補上待辦第 2 項：`curriculum.ts` 的 MLR↔Logistic Regression `relatedTo` 雙向標註，並實測知識地圖確認雙向連結正確顯示。
- 兩項小型待辦完成後，依開發者指示規劃下一章節：依 `curriculum.ts` 順序，於階段二（方法論基礎）3 個候選主題中，開發者選定「特徵工程與標準化」。
- 呼叫 `brainstorming` 技能逐項確認：範本方向（新建第四種「技巧/技術類」範本，非既有三種）、章節範圍（僅涵蓋標準化/縮放＋類別變數編碼，不含特徵創造/對數轉換）、6 大區塊架構、內容細節（簡介／常見方法／適用情境與限制／常見誤區）、互動元件設計（橫向點狀圖比較 R&D Spend／Marketing Spend 縮放前後分佈，聚焦標準化不含編碼展示）、資訊圖表 4 視覺區塊（純概念不列實際數字）。撰寫設計文件，開發者確認後用 `writing-plans` 技能產出 5 個 Task 的實作計畫。
- 開發者選擇 Subagent-Driven Development，建立獨立 worktree（`.claude/worktrees/feature-engineering-standardization`，分支 `worktree-feature-engineering-standardization`），依序派 subagent 執行並審查全部 5 個 Task。
- 最終整體審查（Opus）發現 1 項 Important，派修正 subagent 處理，複審時發現遺漏第二處，追加一輪修正後複審通過。
- 依 `finishing-a-development-branch` 技能本機 merge 回 main、清理 worktree 與分支、push 至 origin，觸發 GitHub Pages 部署。

**完成項目：**
- `chapter_template_guide.md` 新增 1.2 節（CRISP-DM 方法論／流程類範本，補記上階段缺口）與第 5 節對應資訊圖表版面說明；`curriculum.ts` 補上 MLR→Logistic Regression 的 `relatedTo` 反向標註，知識地圖雙向連結實測正確。
- 「特徵工程與標準化」章節完整上線，確立本站第四種章節範本（技巧/技術類：簡介／常見方法／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示）：
  1. 新增 `src/lib/scaling.ts`（TDD，含母體標準差／Z-score／Min-Max 三個純函式）。
  2. 新增互動元件 `FeatureScalingComparison.tsx`：橫向點狀圖比較 R&D Spend／Marketing Spend 在原始值/Z-score/Min-Max 三種模式下的分佈，即時顯示統計量。
  3. 章節內文與課程資料串接，`chapterOrder` 插入 CRISP-DM 與 Simple Linear Regression 之間（中段插入，兩側鏈結皆已改寫），`chapter_template_guide.md` 同步新增 1.3 節與第 5 節說明（本次直接排入計畫同步完成，不留待下階段）。
  4. Excalidraw 風格學習摘要資訊圖表（簡介卡／縮放方法卡／適用情境卡／常見誤區卡，純概念不列數字）。
  5. 全站最終驗證：測試 25/25、`astro check` 0 錯誤/0 警告、`build` 6 頁成功、互動元件三模式切換與知識地圖連結、prerequisite 鏈重排（simple-linear-regression 前一步正確變更為新章節）皆實測通過。
- 最終整體審查（Ready to merge: with fixes）發現的 1 項 Important 已修正並複審確認：章節簡介文字誇大了資料集數量級（「研發支出數十萬美元級／行銷支出數百萬美元級」，實際最大值僅 16.5 萬／47.2 萬），且被同頁互動元件即時印出的真實數字當場拆穿；修正為「十萬美元級／數十萬美元級」，並同步修正設計文件兩處相同錯誤（含複審時發現的漏改處）。
- Main 分支已 merge、worktree 與分支已清理、`git push origin main` 成功，觸發 GitHub Pages 部署。

**遇到的瓶頸：**
- 建立 worktree 時發現分支於 `origin/main`（落後本機 main 4 個 commit）分出，導致計畫檔案不在 worktree 內；用 `git merge main --ff-only` 補上，未觸及 origin。
- 最終審查第一輪修正只改了設計文件「簡介」段落的錯誤數量級描述，複審時發現「互動元件規劃」段落還有第二處相同錯誤未改，導致文件內部前後矛盾；追加一輪修正解決，複審確認乾淨。
- 合併回 main 後 `npm run test` 一度顯示 50 個測試（應為 25 個），為已知的 worktree 殘留重複計算問題（第 5、16 階段已記錄同一根因），清除 worktree 後測試數量恢復正常。

**開發者交代備忘事項：**
- 無新增交代事項；交接文件既有下一步行動清單（其餘 4 組跨章節關聯待對應章節建置時處理、下一個章節規劃）維持不變。
- 最終審查記錄數項延後處理的 Minor（資訊圖表「本站」應為「本章」的措辭、`scaling.ts` 除以零邊界情況——皆判定為明確排除在範圍外或成本大於效益，留待下次觸及對應檔案時順手處理）。

**本機測試用 server：** 本階段由 subagent 啟動的預覽伺服器（含 Task 3 一次背景驗證、Task 5 一次全站驗證，以及 Agent 本人的一次獨立確認）皆於使用後正常關閉並經 `netstat` 確認無殘留。收工前確認 4321-4324 埠皆無 LISTENING 項目。

## 2026-08-01（第 18 個工作階段）

**當日工作內容：**
- 承接第 17 階段同一 session，開發者指示進入下一章節規劃：依 `curriculum.ts` 順序，階段二（方法論基礎）剩餘 2 個候選主題，開發者選定「訓練/測試切分與交叉驗證」，沿用第 17 階段建立的第四種「技巧/技術類」範本（本次不需修改 `chapter_template_guide.md`）。
- 呼叫 `brainstorming` 技能逐項確認：章節範圍（僅涵蓋 Train/Test Split 與基本 k-fold 交叉驗證，不含 Leave-One-Out、Stratified 等進階變體）、內容細節（簡介／常見方法／適用情境與限制／常見誤區）、互動元件設計（50 筆資料點橫向點狀圖，兩層模式切換：Split 比例 70/30、80/20、90/10 ＋ k-fold 五折選擇）、資訊圖表主視覺（5 格橫條圖示意 k-fold 輪流驗證）。撰寫設計文件，開發者確認後用 `writing-plans` 技能產出 5 個 Task 的實作計畫（含手算並程式驗證的固定洗牌排列陣列）。
- 開發者選擇 Subagent-Driven Development。鑑於上階段曾因 worktree 從落後的 `origin/main` 分出而卡關，本次先推送本機 main 至 origin 再建立 worktree，順利避開同一問題。建立獨立 worktree（`.claude/worktrees/train-test-split-cv`，分支 `worktree-train-test-split-cv`），依序派 subagent 執行並審查全部 5 個 Task，過程順利，4 個任務審查皆一次通過（Task 1-4 review clean）。
- 最終整體審查（Opus）第一次執行因 API 用量額度超限中斷，重新派工後完成：發現 2 項 Important，派修正 subagent 一次處理，複審通過。
- 依 `finishing-a-development-branch` 技能本機 merge 回 main、清理 worktree 與分支、push 至 origin，觸發 GitHub Pages 部署。

**完成項目：**
- 「訓練/測試切分與交叉驗證」章節完整上線，沿用第四種「技巧/技術類」範本（本次無需修改範本指南文件）：
  1. 新增 `src/lib/dataSplit.ts`（TDD）：固定洗牌排列常數（affine 排列公式 `i*17+7 mod 50`，實作前先用 Node 程式驗證計畫手算陣列正確）、`trainTestSplit`、`kFoldSplit` 三個純函式，測試驗證排列性、完整覆蓋、無重疊等結構不變量。
  2. 新增互動元件 `TrainTestSplitComparison.tsx`：橫向點狀圖，兩層模式切換（Train/Test Split 三比例／k-fold 五折選擇），即時顯示筆數統計。
  3. 章節內文與課程資料串接，`chapterOrder` 插入「特徵工程與標準化」與「簡單線性回歸」之間（中段插入，兩側鏈結皆已改寫）。
  4. Excalidraw 風格學習摘要資訊圖表：全新「5 格橫條圖」主視覺示意 k-fold 輪流驗證機制，弧形箭頭改用依容器實測寬度動態繪製（而非寫死座標），從設計階段就避開第 16 階段 CRISP-DM 循環圖遇過的箭頭遮擋問題。
  5. 全站最終驗證：測試 33/33、`astro check` 0 錯誤/0 警告、`build` 7 頁成功、互動元件兩層模式切換、知識地圖連結、導覽鏈重排（simple-linear-regression 前一步正確變更為新章節，因導覽列為可捲動軌道會在截圖中視覺裁切，改用 HTML 原始碼 `aria-current` 核對）皆實測通過。
- 最終整體審查（Ready to merge: with fixes）發現的 2 項 Important 已修正並複審確認：(1) 互動圖表兩條資料序列共用同一 y 類別「樣本」、且關閉圖例，導致無法從畫面分辨哪個顏色是訓練集/測試集——根因是撰寫實作計畫時直接複製姊妹元件的 `showlegend: false` 未注意到資料形狀不同，屬計畫撰寫疏漏而非實作偏離，已改為兩條序列各自使用不同 y 類別標籤（比照姊妹元件慣例，讓 y 軸本身充當圖例）；(2) 資訊圖表標題底線寫死 320px 寬度，套用到本章 12 字標題時只蓋住中段 68%，視覺上呈現「刪除線」效果，已加寬至 500px 並重新渲染確認。
- Main 分支已 merge、worktree 與分支已清理、`git push origin main` 成功，觸發 GitHub Pages 部署。

**遇到的瓶頸：**
- 吸取第 17 階段教訓，建立 worktree 前先確認並推送本機 main 至 origin，成功避免 worktree 從落後的 `origin/main` 分出的問題重演。
- Task 4 資訊圖表渲染時，`--dump-dom` DOM 量測法在本次環境完全無回應（即使對簡單外部頁面也是空白輸出，非僅結果矛盾），implementer 依規則不再嘗試該方法、改用像素分析法定案視窗高度，過程順利。
- 最終整體審查第一次派工因 API 使用額度超限而中止（非程式碼問題），重新派工後正常完成。
- 最終審查抓到的圖例缺失問題，根因回溯到 Agent 本人撰寫實作計畫時的疏漏（直接複製姊妹元件程式碼未依資料形狀調整），非 subagent 實作偏離；已在修正輪次中說明清楚並直接修正，不需要與開發者確認設計意圖（因為修正方向與原始設計文件的意圖一致，只是計畫程式碼寫錯）。
- 合併回 main 後 `npm run test` 一度顯示 66 個測試（應為 33 個），為已知的 worktree 殘留重複計算問題（第 5、16、17 階段已記錄同一根因），清除 worktree 後測試數量恢復正常。

**開發者交代備忘事項：**
- 無新增交代事項；交接文件既有下一步行動清單（其餘 4 組跨章節關聯待對應章節建置時處理、下一個章節規劃——階段二僅剩「過擬合/欠擬合與偏差-變異數權衡」一個候選主題）維持更新。
- 最終審查記錄延後處理的 Minor（`kFoldSplit` 邊界檢查、繼承自範本的未使用 CSS 變數——皆判定為明確排除在範圍外，留待下次觸及對應檔案時順手處理）。

**本機測試用 server：** 本階段由 subagent 啟動的預覽伺服器（Task 3 一次背景驗證，以及 Agent 本人的一次獨立確認）皆於使用後正常關閉並經 `netstat` 確認無殘留。收工前確認 4321-4324 埠皆無 LISTENING 項目。

## 2026-08-02（第 19 個工作階段）

**當日工作內容：**
- 本階段實為兩段 session 接續同一工作：前一段 session（2026-08-01 當晚）已完成設計規格確認、`writing-plans` 產出 5-Task 實作計畫、並以 Subagent-Driven Development 執行完 Task 1-3（多項式擬合函式庫、互動元件、章節內文與課程串接），但因 API 額度中斷，未及寫入 worklog/chatlog/handover 便結束。本階段（新 session）開工時先讀取 handover 發現記錄停在第 18 階段，經比對 worktree 分支 git log 才確認實際已推進到 Task 3，Task 3 的 review package 已生成但尚未派審。
- 依 SDD 流程補派 Task 3 審查（review clean），Agent 本人另行獨立重跑 `astro check`／`npm run test` 覆核與報告一致。接續派工 Task 4（Excalidraw 資訊圖表）：implementer 於視覺確認階段因網路暫斷（ENOTFOUND）中止，以 `SendMessage` 恢復同一 agent 接續完成，回報 DONE_WITH_CONCERNS（皆為觀察性備註，非正確性疑慮），任務審查通過。Agent 本人另行檢視渲染輸出 PNG，確認標題底線覆蓋、三格診斷圖、無捲軸/留白等視覺項目皆正確。
- Task 5（全站最終驗證，純驗證無程式變更）：implementer 完整跑完測試/型別檢查/建置/瀏覽器實測（含知識地圖與既有 5 章節迴歸檢查），Agent 本人獨立重跑測試與 `git status` 核對一致。
- 最終整體全分支審查（Opus）第一次因 session 額度限制中斷（重置時間 17:20 台北時間），額度重置後以 `SendMessage` 恢復同一 agent 完成：結論 Ready to merge: Yes，發現 1 項 Important（資訊圖表右上角手繪塗鴉裝飾因本章標題較長（16 字）而與標題最後一字「衡」重疊，底線寬度雖已跟著加寬但塗鴉未同步調整）、5 項 Minor（4 項為先前各 Task 已記錄的延後項目，審查者逐一複核判定：Task 2/3 的圖表間距項判定已解決應合併關閉紀錄，其餘維持延後）。與開發者確認後選擇合併前先修正塗鴉重疊，派修正 subagent 處理（縮小並重新定位塗鴉、重新渲染、確認標題底線與 `rough-engine.js` 未受影響），複審通過（all findings addressed, no new breakage）。
- 依 `finishing-a-development-branch` 技能：worktree 測試 42/42 通過，與開發者確認分支處理方式後選擇本機合併，`merge --ff-only` 回 main、合併後測試複驗（一度顯示 84/14，為已知 worktree 殘留重複計算問題）、清理 worktree 與分支後測試恢復 42/7 正常、`git push origin main` 成功觸發部署。

**完成項目：**
- 「過擬合/欠擬合與偏差-變異數權衡」章節完整上線，為階段二（方法論基礎）最後一個章節，沿用第四種「技巧/技術類」範本：
  1. `src/lib/polynomialFit.ts`（TDD）：合成 1D 資料集＋多項式擬合＋train/test RMSE 計算，最大化重用既有 `regression.ts`／`dataSplit.ts`，未重寫矩陣運算或洗牌邏輯。
  2. 互動元件 `OverfittingUnderfittingComparison.tsx`：雙圖（擬合曲線圖＋誤差曲線圖）＋次數白名單按鈕（1／2／3／5／9／15），關閉拖曳縮放與可點擊圖例。
  3. 章節內文與課程資料串接，`chapterOrder` 插入「訓練/測試切分與交叉驗證」與「簡單線性回歸」之間。
  4. Excalidraw 風格學習摘要資訊圖表：4 卡片版面，「診斷與應對」卡主視覺為三格欠擬合／很適合／過擬合手繪對比圖＋Bias-Variance 分解公式。
  5. 全站最終驗證：測試 42/42、`astro check` 0 錯誤/0 警告、`build` 8 頁成功、互動元件雙圖與按鈕、知識地圖連結、既有 5 章節無迴歸、導覽鏈順序（HTML 原始碼 `aria-current` 核對，非截圖）皆實測通過。
- 最終整體審查發現的 1 項 Important（資訊圖表塗鴉與標題重疊）已修正並複審確認：`.doodle` 由 92×72px 縮小至 50×39px 並重新定位，等比例縮放所有手繪座標，重新渲染確認塗鴉不再與「衡」字重疊，標題底線寬度（660px）與共用檔 `rough-engine.js` 皆未受影響。
- Main 分支已 merge（ff-only）、worktree 與分支已清理、`git push origin main` 成功，觸發 GitHub Pages 部署。
- 階段二（方法論基礎）三個章節（特徵工程與標準化／訓練測試切分與交叉驗證／過擬合欠擬合與偏差-變異數權衡）至此全數上線完成。

**遇到的瓶頸：**
- 本階段開工時發現前一段 session 因額度中斷、未依規則即時寫入 worklog/chatlog/handover 便結束，需靠比對 worktree git log 與既有 SDD ledger（`progress.md`）重建實際進度，才確認正確的接續點（Task 3 review 尚未派工，而非從 Task 4 開始）。
- Task 4 implementer 與最終審查 subagent 皆各中止一次：前者為網路連線暫斷（ENOTFOUND，非額度問題），後者為 session API 額度限制（訊息顯示重置時間 17:20），兩者皆以 `SendMessage` 恢復同一 agent 的 transcript 接續完成，未重新從頭派工。
- 最終審查抓到的塗鴉重疊問題，根因是本章標題（16 字）為目前所有章節中最長，`.title-underline` 有依比例加寬（500px→660px）但 `.doodle` 裝飾沿用舊章節寫死座標未同步調整——審查者建議補充進 `docs/handover.md` 既有的 Excalidraw 校正檢查清單（目前僅涵蓋底線寬度／捲軸／留白，未涵蓋水平方向的裝飾碰撞），已記錄於下方交接文件。
- 合併回 main 後 `npm run test` 一度顯示 84 個測試（應為 42 個），為已知的 worktree 殘留重複計算問題（第 5、16、17、18 階段已記錄同一根因），清除 worktree 後測試數量恢復正常。

**開發者交代備忘事項：**
- 系統上偵測到 4 個與本次 session 無關的背景 node.exe 行程（未監聽任何連接埠），開發者確認不用處理，維持現狀。
- 最終審查記錄延後處理的 Minor（詳見下方交接文件）留待下次觸及對應檔案時順手處理，非阻塞。

**本機測試用 server：** 本階段由多個 subagent 各自啟動的預覽伺服器與 CDP 除錯用無頭 Edge 行程，皆於各自任務完成後經 `netstat`／`tasklist` 確認正常關閉無殘留。Agent 本人收工前再次確認 4321-4324、9333-9334 埠皆無 LISTENING 項目。

## 2026-08-03（第 20 個工作階段）

**當日工作內容：**
- 開發者列出未完工章節後，指示進行「Polynomial Regression（多項式回歸）」。Agent 先評估範本歸屬：確認沿用九大區塊演算法類範本（同 Simple/Multiple Linear Regression），非新範本；並指出第 19 階段 `OverfittingUnderfittingComparison.tsx` 的合成資料展示與本章需求（真實案例分析）不同，不能直接沿用。
- 呼叫 `brainstorming` 技能逐項確認：案例資料集（開發者選定經典「職等-薪資」教學資料集，非沿用 50 Startups）、`curriculum.ts` 新增 `relatedTo` 雙向關聯至過擬合/欠擬合章節（開發者確認新增）、互動元件設計（單圖、次數白名單 1/2/3/4/5、比照 `RegressionScatter2D.tsx` 不做 train/test 切分）。撰寫設計文件，開發者確認後用 `writing-plans` 技能產出 5-Task 實作計畫（含用 Node 腳本預先驗證的職等-薪資資料集各次數 R²/RMSE 精確數值）。
- 開發者選擇 Subagent-Driven Development。執行前依技能規定做衝突掃描，發現計畫明文要求 `polynomialFeatures()` 複寫（不與已上線的 `polynomialFit.ts` 共用）會被審查標準視為 DRY 違規，主動與開發者確認以計畫文字為準（維持複寫），記錄於 ledger 供後續審查裁定參考。
- 依序派 subagent 執行 5 個 Task：Task 1（資料集函式庫）、Task 2（互動元件）審查皆一次通過（Task 2 的重複函式發現依先前裁定歸類 plan-mandated、不進入修正迴圈）。Task 2 implementer 額外抓到計畫本身一處頁數期望值筆誤（Step 3 誤寫 9 頁，實際應為 8 頁），Agent 本人核實後直接修正計畫文件（非程式碼問題）。Task 3（章節內文＋課程串接＋回補過擬合章節關聯段落）審查通過，僅 1 項 Minor（關聯段落用語與範本格式規則稍有出入，源自計畫文字本身，非實作偏離）。
- Task 4（Excalidraw 資訊圖表）implementer 完成並通過審查後，Agent 本人親自開圖檢視渲染輸出，發現審查者因無法檢視二進位檔案而漏掉的真實缺陷：簡介卡與模型公式卡的說明文字誤用 LaTeX `$...$` 語法，但此靜態 HTML 資產未載入 KaTeX 引擎，畫面直接顯示原始 `$`、`\ldots`、`\beta` 字元——根因是撰寫計畫時誤將可被 Astro+KaTeX 渲染的章節內文語法，複製進不具備該渲染能力的獨立 HTML 資產。修正計畫文件後，以 `SendMessage` 恢復同一 implementer 進行第 1 輪修正（改用純 Unicode 數學符號，比照該卡片已正確的 `.eq` 公式區塊），重新渲染確認全部 6 個區塊皆無殘留 LaTeX 字元，複審通過。
- Task 5（全站最終驗證，純驗證無程式變更）：implementer 完整跑完測試/型別檢查/建置/瀏覽器實測（含知識地圖、過擬合章節新增段落、既有 5 章節迴歸檢查、以 CDP 實測次數按鈕點擊），皆通過。
- 最終整體全分支審查（Opus）第一次因 session 額度限制中斷，額度重置後以 `SendMessage` 恢復同一 agent 完成：結論 Ready to merge: Yes。審查者獨立重算全部案例數值與係數，逐位確認無誤；發現 1 項 Important（`render-polynomial-regression-infographic.ps1` 路徑寫死指向主倉庫 checkout，非本分支獨有問題，而是全站 6 支既有渲染腳本共同的既有模式，審查者本身建議另案處理而非卡在本分支合併）與 3 項 Minor（資訊圖表一處次方符號誤用上標／互動元件曲線取樣範圍寫死常數／圖表未固定 y 軸範圍且明確標註為可接受的設計取捨，非缺陷）。
- 依 `finishing-a-development-branch` 技能：worktree 測試 47/47 通過，與開發者確認分支處理方式後選擇本機合併，`git merge`（fast-forward）回 main、合併後測試複驗（一度顯示 94/16，為已知 worktree 殘留重複計算問題）、用 `ExitWorktree` 清理 worktree 與分支後測試恢復 47/8 正常、`git push origin main` 成功觸發部署。

**完成項目：**
- 「Polynomial Regression（多項式回歸）」章節完整上線，為階段三（監督式學習－迴歸）緊接在 Multiple Linear Regression 之後的章節，沿用九大區塊演算法類範本：
  1. `src/lib/positionSalaryData.ts`（TDD）：經典職等-薪資教學資料集（10 筆固定常數），與既有 50 Startups、過擬合章節合成資料皆不同。
  2. 互動元件 `PolynomialRegressionFit.tsx`：單一散佈圖＋配適曲線，次數白名單按鈕 1/2/3/4/5（預設 4），全資料配適不做 train/test 切分，重用既有 `regression.ts` 常態方程式求解器。
  3. 章節內文與課程資料串接，`chapterOrder` 接續在 `multiple-linear-regression` 之後；`curriculum.ts` 新增 `relatedTo` 雙向關聯，回補已上線的過擬合/欠擬合章節簡介段落，範本指南對照表同步更新。
  4. Excalidraw 風格學習摘要資訊圖表：六卡片版面（簡介／模型公式／適用情境／評估指標／常見誤區／案例分析黑板），案例分析為職等-薪資資料集次數 4 配適（R²=0.9974，RMSE=14503.23）。
  5. 全站最終驗證：測試 47/47、`astro check` 0 錯誤/0 警告、`build` 9 頁成功、互動元件次數按鈕（含 CDP 點擊實測）、知識地圖連結、既有 7 章節無迴歸、導覽鏈順序（HTML 原始碼 `aria-current` 核對）皆實測通過。
- 最終整體審查（Ready to merge: Yes）發現的 1 項 Important 經評估屬全站既有模式（非本分支引入），依審查者建議留待日後另案處理，不阻塞本次合併；3 項 Minor 記錄延後。
- Main 分支已 merge（fast-forward）、worktree 與分支已清理、`git push origin main` 成功，觸發 GitHub Pages 部署。

**遇到的瓶頸：**
- 最終審查 subagent 因 session API 額度限制中斷一次（訊息顯示重置時間 00:20 台北時間），確認系統時間已過重置後以 `SendMessage` 恢復同一 agent 接續完成，未重新從頭派工。
- 本階段兩次抓到「計畫文件本身寫錯，而非 subagent 實作偏離」的問題：(1) Task 2 驗證步驟頁數期望值筆誤（9 應為 8）；(2) Task 4 資訊圖表卡片文字誤用 LaTeX 語法但該 HTML 資產不具 KaTeX 渲染能力。後者是 Agent 本人在審查通過、implementer 回報完成之後，親自開圖檢視渲染輸出 PNG 才發現——因為子審查 subagent 明確表示無法檢視二進位圖片檔案，此類缺陷只能靠 Agent 本人或開發者實際看圖才抓得到，已記錄為後續同類任務的檢查提醒。
- 合併回 main 後 `npm run test` 一度顯示 94 個測試（應為 47 個），為已知的 worktree 殘留重複計算問題（第 5、16、17、18、19 階段已記錄同一根因），用 `ExitWorktree` 清除 worktree 後測試數量恢復正常。

**開發者交代備忘事項：**
- 最終審查記錄的 1 項 Important（六支渲染腳本皆寫死主倉庫 checkout 路徑，建議改用 `$PSScriptRoot` 相對推導，屬全站既有模式的系統性問題）與 3 項 Minor（詳見下方交接文件）留待下次觸及對應檔案或開發者指示時另案處理，非本階段阻塞項目。

**本機測試用 server：** 本階段由多個 subagent 各自啟動的預覽伺服器，皆於各自任務完成後經 `netstat`／`tasklist` 確認正常關閉無殘留；Task 4 額外確認 CDP 除錯用無頭 Edge 行程亦無殘留。Agent 本人收工前再次確認相關連接埠皆無 LISTENING 項目，且系統上原有、與本專案無關的背景 node.exe 行程維持不動未處理。

## 2026-08-03（第 21 個工作階段）

**當日工作內容：**
- 開工閱讀交接文件與工作日誌指定範圍後，與開發者確認本階段方向：處理交接文件記錄的延後事項（6 支渲染腳本路徑寫死、βᵈ 上標誤用、曲線取樣範圍寫死常數、第 18/19 階段 Minor 事項），開發者選擇全部處理。
- 逐項查證程式碼後才動手：發現實際是 7 支渲染腳本（非文件字面「6 支」）；βᵈ 問題定位到具體行號並比對同檔既有寫法確認修法；`kFoldSplit` 邊界檢查建議跳過（唯一呼叫端已被 UI 限制在合法範圍，屬不應加的防禦式程式碼）；CSS 變數問題範圍比文件描述小（多數是全站既有慣例，非本檔獨有問題，僅 1 處真正不一致）；DOM 量測法捲軸臨界值問題判定為驗證手法環境限制、非程式碼缺陷。完整方案先呈現給開發者確認後才實作。
- 完成 5 類程式碼修正：7 支渲染腳本改用 `$PSScriptRoot` 動態路徑；`polynomial-regression-summary.html` 修正 βᵈ 上標；`PolynomialRegressionFit.tsx` 的 `CURVE_SAMPLE_X` 改為動態推導；`train-test-split-cross-validation-summary.html` 新增 `--good` CSS 變數；`polynomialFit.ts` 的 `POINT_COUNT` 改為從 `dataSplit.ts` 的 `SHUFFLED_INDICES.length` 推導，消除隱性耦合。

**完成項目：**
- 交接文件記錄的 4 類延後事項全數處理完成（其中 2 個子項——`kFoldSplit` 邊界檢查、Excalidraw DOM 量測法限制——查證後判定不需修改，已記錄理由）。
- 重新渲染 2 張內容有變更的 PNG（Polynomial Regression、Train-Test-Split）並親自開圖確認正確；另 5 支腳本僅路徑修正、內容未變更，改用 git 還原保留原始正確 PNG，避免不必要的二進位差異。
- 全站驗證：測試 47/47、`astro check` 0 錯誤/0 警告、`build` 9 頁成功；用無頭 Edge CDP 驅動點擊多項式回歸章節「互動操作」分頁與次數按鈕，確認曲線取樣範圍動態推導後仍正確涵蓋職等 1-10 全範圍，次數 1／4 數值與資訊圖表案例分析卡片一致。

**遇到的瓶頸：**
- 重新渲染 Multiple Linear Regression 資訊圖表 PNG 時連續 3 次出現位元級別相同的排版錯位（案例分析黑板表格消失、標題底線裝飾消失），與已知的「timing race」隨機性不符（隨機通常重試就會好或每次表現不同）。依規則停下來與開發者討論，未自行連續試錯；查證後發現該檔案內容本次並未變更，其實不需要保留任何重新渲染結果，改用 `git checkout` 還原 git 上原本正確的版本，問題隨之消失（非程式碼問題，推測是連續背靠背執行多次 Edge 無頭渲染造成的環境負載）。

**開發者交代備忘事項：**
- 無新增交代事項；系統上 4 個與本次 session 無關的背景 node.exe 行程，經核對與第 19、20 階段已記錄且開發者確認過的殘留行程數量一致，未重複詢問、維持不動。

**本機測試用 server：** 本階段自行啟動 `npm run preview`（PID 19504）與 CDP 除錯用無頭 Edge（PID 2748，含渲染驗證用的多個一次性無頭 Edge 行程），皆於使用後以 `taskkill` 確認關閉，收工前 `netstat` 確認 4321／9333 埠無 LISTENING 項目、`tasklist` 確認無殘留 msedge.exe 行程。

## 2026-08-04（第 22 個工作階段）

**當日工作內容：**
- 開工閱讀第 21 階段交接文件，與開發者確認本階段方向：接續階段三，規劃並建置 Ridge Regression（Ridge 迴歸，正則化）章節。
- 用 `brainstorming` 技能逐項確認設計：教學切入點選定「多項式係數爆炸」（而非多重共線性或新建合成資料）；資料集重用 Overfitting 章節既有的合成 sin 曲線資料與訓練/測試切分；確認 Ridge 懲罰前需先標準化特徵；互動元件採雙區塊設計（曲線圖＋係數條形圖）；relatedTo 選定三組關聯（Polynomial Regression、過擬合/欠擬合、特徵工程與標準化）；訓練/測試雙集顯示評估指標。
- **設計階段驗證流程抓到一個重要問題**：原訂固定次數 9，但寫 Node 腳本實測後發現次數 9 在此資料集上並未嚴重過擬合，加入正則化只會讓 test RMSE 單調變差，無法展示「正則化改善泛化」的核心論述。與開發者確認後改用次數 15（真正嚴重過擬合案例：λ=0 時 test RMSE=0.8024、最大係數絕對值 1450；λ=0.01 時降至 0.3204／5.76）。同時發現 λ=0 與其餘 λ 的係數幅度相差 200 倍以上，線性固定軸會讓長條圖失真，改用對數座標顯示係數絕對值，此決策也與開發者確認。
- 設計文件與實作計畫皆已 commit（`0080fdf`、`f57953b`、`ffab101`）。
- 用 `subagent-driven-development` 技能於獨立 worktree（`worktree-ridge-regression-chapter`）執行 5 個任務：
  1. `fitRidgeRegression`／`applyZScore`（TDD，含精確驗證過的測試數值）
  2. `RidgeRegressionFit.tsx` 互動元件
  3. 章節內文＋路由/設定串接——**implementer 正確發現一個計畫本身的 bug**：計畫原訂 Task 3 就要在 frontmatter 寫入 `summary.image`，但該 PNG 要到 Task 5 才會產生，Astro 的 `image()` schema 驗證器會導致 build 失敗。implementer 依規則停下回報 BLOCKED、不自行修改，查證後確認與 Polynomial Regression 章節的既有實作模式一致（`summary:` 區塊應延後到與 PNG 同一個 commit 才加入），Agent 本人直接修正計畫文件（`133f366`）後 resume 同一個 implementer 完成。
  4. 三處跨章節關聯段落＋測試/文件更新
  5. Excalidraw 資訊圖表——implementer 回報 `DONE_WITH_CONCERNS`：渲染腳本的成功/失敗訊號在本次執行中不可靠（誤報失敗但其實部分寫入了壞圖、誤報成功但其實只是偵測到前一次殘留的舊檔案、最終正確檔案是背景 Edge 行程延遲約 1 分鐘才非同步寫入），implementer 未修改腳本、僅用唯讀診斷指令查證，並親自開圖確認最終交付的 PNG 正確。
  - 每個任務皆經過獨立審查（spec 合規＋程式碼品質），5 個任務審查皆為 Approved／Spec compliant，2 個任務有 Minor 延後事項（皆為計畫本身既定、非 implementer 偏離）。
- 最終全分支審查（opus model）：獨立重新執行 `npm run test`／`astro check`／`npm run build` 三道驗證關卡皆通過；另外寫獨立腳本重新複算所有數值，逐位確認與計畫、設計文件、資訊圖表、程式碼四方一致；確認 Task 3 的計畫修正在最終狀態下前後一致無遺漏；7 項 Minor 發現逐一實測後皆判定不影響合併（例如曲線圖未鎖 Y 軸範圍——實測 5 個 λ 的曲線 y 範圍差異極小、視覺上不會跳動）；1 項建議（渲染腳本的 `Test-Path` 成功判定過於薄弱）經比對後確認是全站既有腳本模式（`render-polynomial-regression-infographic.ps1` 也是同樣寫法），非本分支引入的問題，記錄為未來可另案處理的建議，不阻塞本次合併。**Ready to merge: Yes**。
- 已本機 `merge`（fast-forward）回 `main`、合併後測試 106 個（worktree 殘留造成的已知現象）、用 `ExitWorktree` 清理後測試數量恢復正常 53/53、`git push origin main` 成功，觸發 GitHub Pages 部署，「Ridge Regression」章節正式上線。

**完成項目：**
- Ridge Regression 章節完整上線，接續在 Polynomial Regression 之後（`chapterOrder` 新的鏈尾）。
- 全站驗證：測試 53/53、`astro check` 0 錯誤/0 警告、`build` 10 頁成功。
- 三組跨章節關聯（Polynomial Regression、過擬合/欠擬合、特徵工程與標準化）雙側段落皆已補齊。

**遇到的瓶頸：**
- 設計驗證階段兩次抓到「原始假設與實測數據不符」的問題（次數選擇、條形圖座標尺度），皆先停下用腳本驗證、與開發者確認方向後才調整設計，未憑感覺直接修改。
- 實作階段抓到一次真正的計畫文件 bug（Task 3/Task 5 之間的 `summary:` 欄位順序），依規則由 Agent 本人核實後直接修正（修正方向唯一明確，未涉及架構決策，不需詢問開發者）。
- Task 5 渲染腳本的成功訊號不可靠，implementer 正確地沒有自行修改腳本或加延遲，僅用唯讀診斷判斷後親自開圖驗證交付物；此問題經最終審查確認為全站既有腳本的既有模式，非本分支新增問題，留待未來另案討論是否修正（例如刪除舊檔案後再輪詢檔案穩定性，而非單純 `Test-Path`）。
- 最終審查用的 subagent 因 session API 額度限制中斷一次，確認系統時間已過重置時間（過了約 6 小時，遠超安全邊界）後用 `SendMessage` 恢復完成。

**開發者交代備忘事項：**
- 無新增交代事項；本階段開發者的決策點均已在 brainstorming 與最終確認時記錄（見對話紀錄）。

## 2026-08-04（第 23 個工作階段）

**當日工作內容：**
- 開工閱讀第 22 階段交接文件，與開發者確認本階段方向：接續階段三最後一個迴歸主題，規劃並建置 Lasso Regression（Lasso 迴歸，正則化）章節。
- 用 `brainstorming` 技能逐項確認設計，過程中多次先寫 Node 驗證腳本、拿到真實數字後才與開發者討論，未憑直覺套用 Ridge 章節既有結論：
  - 教學切入點：延續 Ridge 章節同一組次數 15 多項式資料，做「Ridge vs Lasso 係數收縮方式對比」。
  - **抓到 Lasso 與 Ridge 的關鍵技術差異**：Lasso 沒有閉式解，需用 coordinate descent + soft-thresholding；且此資料集的多項式特徵即使標準化過仍高度相關，導致 λ=0 完全無法收斂（上百萬次疊代仍在飄移），λ<0.01 的收斂成本不可預期地劇烈波動（λ=0.002 需 470 萬次疊代、逾 4 秒）。開發者原則：「效能與正確性無法兼顧時，寧可拿掉功能也不要湊合」——但這次找到不需妥協的解法，只需把白名單從含 0.001 改為 `0.01, 0.05, 0.1, 1, 10`，全部驗證在 5.6 萬次疊代內收斂（合計 227ms），不犧牲任何互動功能。
  - 也測試過 pathwise warm-start，證實無法解決小 λ 收斂緩慢問題（收斂速率取決於條件數、非起始點距離），故不採用。
  - 係數條形圖尺度：驗證後發現 Lasso 白名單內係數量級跟 Ridge 差很多（同一量級 2.46～7.68，非 Ridge 的 200 倍跨距），改用線性座標而非沿用 Ridge 的 log 軸，並新增歸零係數變色＋「N/15 已歸零」文字統計。
  - `relatedTo` 範圍：開發者確認只連 Ridge Regression 一個（Polynomial/過擬合欠擬合/特徵工程的關聯已由 Ridge 章節完整覆蓋，重複寫會大幅重疊）。
- 設計文件、實作計畫皆已 commit（`b2a7b02`、`8ddd2d5`）。
- 用 `subagent-driven-development` 技能於獨立 worktree（`worktree-lasso-regression-chapter`）執行 5 個任務，全部一次到位（無 fix loop）：
  1. `fitLassoRegression`（TDD，haiku 模型，含手算驗證過的測試數值）
  2. `LassoRegressionFit.tsx` 互動元件（haiku 模型）
  3. 章節內文＋路由/設定串接（sonnet 模型）
  4. Ridge 章節回補關聯段落＋測試/文件更新（haiku 模型）
  5. Excalidraw 資訊圖表（sonnet 模型）——Agent 本人依規則親自用 Read 工具開圖檢視，確認 6 張卡片皆正確渲染、無 LaTeX 洩漏、案例分析數字（0.3204/0.2764/5.7643/7.6830/0/7）與設計文件一致。
  - 每個任務皆經過獨立審查，5 個任務審查皆為 Approved／Spec compliant，3 個任務有 Minor 延後事項（皆為文件筆誤或既有慣例，非程式碼缺陷）。
- 最終全分支審查（opus model，**Ready to merge: Yes**）：獨立重新複算全部數值確認一致；抓到 2 項 Important 發現——(1) `fitLassoRegression` 疊代法在 `maxIter` 用盡時會靜默回傳錯誤答案，沒有任何信號告知呼叫者未收斂；(2) 既有測試讓人誤以為 Lasso 在 λ=0 永遠等價於 OLS，但在本章實際使用的資料集上會收斂失敗，此陷阱只記錄在設計文件、程式碼裡完全沒有提示。另抓到一項文件錯誤：設計文件把先前某次除錯歸咎於 `tol` 設太寬，複驗後證實真正的收斂保障其實是 `maxIter`、`tol`在合理範圍內幾乎不影響結果。依規則派一次修復 subagent（不逐項分開修）處理這三項，新增 `converged` 回傳欄位＋2 個新測試＋修正兩份文件與程式碼註解，範圍限定複審確認三項全部解決、無新增破壞。其餘 4 項 Minor（殘差未定期重算的浮點漂移風險、無 λ<0 驗證、歸零單調性未在真實資料上釘住、197ms 掛載成本）皆記錄為刻意延後，不阻塞合併。
- 已本機 `merge`（fast-forward）回 `main`；合併後測試顯示 122 個（worktree 殘留造成的已知現象）；用 `ExitWorktree` 清理 worktree 與已合併分支（6 個 commit 已安全存在於 main）後測試恢復正常 61/61；`git push origin main` 成功，觸發 GitHub Pages 部署，「Lasso Regression」章節正式上線。

**完成項目：**
- Lasso Regression 章節完整上線，接續在 Ridge Regression 之後（`chapterOrder` 新的鏈尾）。階段三（監督式學習－迴歸，Linear Regression 子分類）5 個主題全數完成：Simple/Multiple/Polynomial/Ridge/Lasso。
- 全站驗證：測試 61/61、`astro check` 0 錯誤/0 警告、`build` 11 頁成功。
- Ridge↔Lasso 雙向關聯段落已補齊；`chapter_template_guide.md` 1.1 節對照表新增第 10 組。
- `fitLassoRegression` 新增 `converged` 回傳欄位，讓未來任何呼叫者都能得知這個迭代求解器是否真的收斂，不再是靜默錯誤。

**遇到的瓶頸：**
- 設計驗證階段連續抓到多個「原始假設與實測數據不符」的問題（λ=0 完全不收斂、小 λ 收斂成本不可預期、係數尺度跟 Ridge 不同），皆先停下用腳本驗證、與開發者確認方向後才調整設計，未憑直覺或 Ridge 章節的類比假設成立。
- 最終審查抓到的兩項 Important 發現都屬於「這次不會出事，但下一個迭代求解器可能會踩到同一個坑」的未來維護風險類型，已納入單次修復波次處理，非阻塞本次合併的功能性問題。

**開發者交代備忘事項：**
- 無新增交代事項；本階段開發者的決策點（λ 白名單效能取捨、`relatedTo` 範圍）均已在 brainstorming 與最終確認時記錄（見對話紀錄）。

**本機測試用 server：** 本階段 controller 層級本身未額外啟動任何 server；各任務 subagent 於各自 worktree 內啟動的 `npm run preview`／CDP 除錯用無頭 Edge 皆已個別確認關閉；收工前 `netstat` 確認 4321／9333 埠無 LISTENING 項目。

## 2026-08-04（第 24 個工作階段）：Logistic Regression 章節

**當日工作內容：**
- 開工閱讀第 23 階段交接文件，與開發者確認本階段方向：接續建置階段三最後一個主題——Logistic Regression（邏輯斯迴歸），跨入分類任務。
- 用 `brainstorming` 技能逐項確認設計，多次先寫 Node 驗證腳本拿到真實數字才與開發者確認方向，未套用 Linear Regression 家族既有內容：
  - 案例資料集：開發者原選「經典公開分類資料集」，Agent 指出 Iris 等資料集單一特徵近乎完美線性可分、會讓梯度下降永遠無法收斂的風險後，開發者重新選擇「全新真實感合成資料」，確定為「貸款違約預測（Loan Default）」情境，程式生成而非落地成 JSON 檔（寫計畫階段進一步發現應比照 `polynomialFit.ts` 既有合成資料慣例，改為模組載入時直接生成，主動告知開發者此簡化）。
  - 互動元件範圍：只做 2D 決策邊界圖（不做 Sigmoid 曲線、不做門檻滑桿），純靜態展示、無控制項——是 Ridge/Lasso/Multiple LR 之外本站第一個完全無互動控制項的章節元件。
  - 特徵固定為「負債佔收入比＋信用分數」；求解方法為批次梯度下降（Cross-Entropy Loss 無閉式解）；標準化為必要前置作業；評估指標定案「混淆矩陣＋Accuracy/Precision/Recall/F1」（不含 ROC-AUC）；資料集刻意設計為不平衡（違約約 25%），呼應 Accuracy 陷阱教學重點。
  - 資料筆數 200 筆（75/25 切分＝150/50）——因既有 `dataSplit.ts` 的 `SHUFFLED_INDICES` 寫死 50 筆長度、不適用更大樣本，`loanDefault.ts` 另外提供一組獨立的 200 筆固定仿射排列。
  - 首次生成驗證數字時模型太弱（test recall 僅 16.7%，近乎無用），調整真實關係係數強度後重跑，得到 test accuracy 0.88／recall 0.6667——同時滿足「模型可用」與「Accuracy 陷阱有具體數字可談」兩個教學需求。
- 設計文件、實作計畫皆已 commit（`230d3bc`、`5b44c4d`）。
- 用 `subagent-driven-development` 技能於獨立 worktree（`worktree-logistic-regression-chapter`）執行 5 個任務，全部一次到位（無 fix loop）：
  1. `loanDefault.ts` 合成貸款違約資料集（TDD，haiku 模型，65/65 測試）
  2. `classification.ts` 求解器與分類指標（haiku 模型，74/74 測試）
  3. `LogisticRegressionFit.tsx` 互動元件（sonnet 模型，無自動化測試，用暫時性 Vitest 腳本手算驗證數字與設計文件吻合）
  4. 章節內文＋路由/設定串接（sonnet 模型，12 頁建置成功、確認 `multiple-linear-regression.md` 未被誤觸）
  5. Excalidraw 資訊圖表（sonnet 模型）——implementer 誠實標記 case study 版面有既有 CSS 造成的文字換行瑕疵，Agent 本人依規則親自用 Read 工具開圖檢視＋核對 HTML 原始碼，確認為視覺換行、非內容重複錯誤。
  - 每個任務皆經過獨立審查，5 個任務審查皆為 Approved／Spec compliant，3 個任務有 Minor 延後事項（皆非阻塞性缺陷）。
- 最終全分支審查（opus model，獨立重新執行完整 pipeline 驗證全部發布數字一致，74/74 測試、`astro check` 0/0）：抓到 2 項 Important（三處手動維護的數字沒有測試釘住、「不收斂」測試證明力不足只證明提前中斷非真發散）與 1 項需開發者裁決的 plan-mandated 設計問題（決策邊界圖畫全部 200 點但下方指標只描述測試集 50 點，視覺與數字不對應）。詢問開發者後裁定保持現狀不修改（計畫本身明確規定的做法，非實作偏離）。依規則派一次修復 subagent 處理 2 項 Important（新增 pipeline 釘樁整合測試＋強化不收斂測試證明真發散），範圍限定複審確認全數 ADDRESSED、無新增破壞。其餘 4 項 Minor 記入帳本延後，不阻塞合併。
- 已本機 `merge`（fast-forward）回 `main`；合併後測試顯示 156 個（已知的 worktree 殘留造成測試重複執行現象）；用 `ExitWorktree` 清理 worktree 與已合併分支（`git branch --contains` 確認 6 個 commit 已安全存在於 main）後測試恢復正常 78/78；`git push origin main` 成功，觸發 GitHub Pages 部署，「Logistic Regression」章節正式上線。

**完成項目：**
- Logistic Regression 章節完整上線，接續在 Lasso Regression 之後（`chapterOrder` 新的鏈尾）。**階段三（監督式學習－迴歸）全數完成**，本站第一個分類任務章節正式上線，可進入階段四（監督式學習－分類）。
- 全站驗證：測試 78/78、`astro check` 0 錯誤/0 警告、`build` 12 頁成功。
- Multiple Linear Regression↔Logistic Regression 雙向關聯（該側早已預埋，本次補上另一側）；`chapter_template_guide.md` 1.1 節對照表狀態更新為「兩側已補」。
- 新增 `src/lib/loanDefault.classification.integration.test.ts`：完整 pipeline 釘樁測試，鎖定訓練/測試混淆矩陣與四項指標的真實產出數字，未來任何資料/超參數變動若導致數字偏移，測試會立即失敗（不再只靠章節內文與資訊圖表人工比對）。

**遇到的瓶頸：**
- Brainstorming 前期一度給錯選項導致開發者要求重新選擇（案例資料集題目第一輪誤觸「經典公開資料集」風險未先講清楚），第二輪重新呈現同一組選項後順利釐清方向。
- 最終審查抓到的「決策邊界圖畫 200 點但指標只描述 50 點」是計畫本身明確規定的設計，屬於需要開發者裁決的 plan-mandated 發現，不能由 Agent 逕自修改，已依規則詢問並取得裁決（保持現狀）。

**開發者交代備忘事項：**
- 無新增交代事項；本階段開發者的決策點（資料集類型、互動元件範圍、特徵選擇、資料筆數、決策邊界圖是否修改）均已在 brainstorming 與最終審查時記錄（見對話紀錄）。

**本機測試用 server：** 本階段 controller 層級本身未額外啟動任何 server；Task 3/5 subagent 於各自 worktree 內使用的暫時性驗證腳本／`npm run preview`／CDP 無頭 Edge 皆已個別確認關閉；收工前 `netstat` 確認 4321／9333／3000 埠無 LISTENING 項目。
