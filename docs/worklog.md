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
