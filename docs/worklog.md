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
