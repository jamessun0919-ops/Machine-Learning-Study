# 交接文件 Handover

> 最後更新：2026-08-02（第 19 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression`、`機器學習介紹`、`CRISP-DM 資料分析方法`、`特徵工程與標準化`、`訓練/測試切分與交叉驗證`、`過擬合/欠擬合與偏差-變異數權衡` 七個章節，皆已上線。**階段二（方法論基礎）三個章節已全數完成上線。**

## 已完成進度 (Completed)

- **（第 19 階段）「過擬合/欠擬合與偏差-變異數權衡」章節完整上線**，為階段二（方法論基礎）最後一個章節，沿用第四種「技巧/技術類」範本：
  1. `src/lib/polynomialFit.ts`（TDD）：合成 1D 資料集＋多項式擬合＋train/test RMSE 計算，最大化重用既有 `regression.ts`（最小平方法求解器）／`dataSplit.ts`（train/test 切分），未重寫矩陣運算或洗牌邏輯。
  2. 互動元件 `src/components/charts/OverfittingUnderfittingComparison.tsx`：雙圖（擬合曲線圖＋誤差曲線圖）＋次數白名單按鈕（1／2／3／5／9／15，非自由滑桿），關閉拖曳縮放與可點擊圖例。
  3. 章節內文與課程資料串接，`chapterOrder` 插入「訓練/測試切分與交叉驗證」與「簡單線性回歸」之間（兩側鄰居 `prerequisiteSlug`/`nextSlug` 皆已改寫）。
  4. Excalidraw 風格學習摘要資訊圖表：4 卡片版面，「診斷與應對」卡主視覺為三格欠擬合／很適合／過擬合手繪對比圖＋Bias-Variance 分解公式。
  5. 全站最終驗證：測試 42/42、`astro check` 0 錯誤/0 警告、`build` 8 頁成功、互動元件雙圖與按鈕、知識地圖連結、既有 5 章節無迴歸、導覽鏈順序（HTML 原始碼 `aria-current` 核對，非截圖）皆實測通過。
- 最終整體審查（Ready to merge: Yes）發現 1 項 Important 已修正並複審通過：資訊圖表右上角手繪塗鴉裝飾因本章標題較長（16 字，歷來最長）而與標題最後一字「衡」重疊約 24px——`.title-underline` 已依比例加寬（500px→660px）但 `.doodle` 裝飾沿用舊章節寫死座標未同步調整；已將 `.doodle` 由 92×72px 縮小並重新定位至 50×39px、等比例縮放所有手繪座標，重新渲染確認不再重疊，`.title-underline` 寬度與共用檔 `rough-engine.js` 皆未受影響。
- **本階段實為兩段 session 接續同一工作**：前段 session（2026-08-01 晚間）完成設計規格、實作計畫、Task 1-3，因 API 額度中斷未及寫入 worklog/chatlog/handover 便結束；本階段開工時靠比對 worktree git log 與 SDD ledger（`.superpowers/sdd/.../progress.md`）重建進度、確認正確接續點（詳見下方「關鍵設定與規則」）。過程中 Task 4 implementer（網路暫斷）與最終整體審查 subagent（session 額度限制）各中止一次，皆以 `SendMessage` 恢復同一 agent 的 transcript 接續完成，未重新從頭派工。
- 已本機 `merge --ff-only` 回 `main`、清理 worktree 與已合併分支、`git push origin main` 成功，觸發 GitHub Pages 部署，「過擬合/欠擬合與偏差-變異數權衡」章節正式上線。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。階段二（方法論基礎）三個章節全數完成上線，本階段收尾完成。下一步需與開發者確認階段三/四的規劃方向（見下方）。

## 下一步行動 (Next Steps)

1. **其餘 4 組跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means。規則與對照表已記錄於 `docs/specs/chapter_template_guide.md` 1.1 節。
2. **下一個章節規劃**：階段二（方法論基礎）已全數完成。開工時需與開發者確認下一步方向——是否進入階段三（監督式學習－迴歸，已完成 Simple/Multiple Linear Regression，可能還有其他迴歸主題如 Ridge/Lasso）、或依 `docs/config/curriculum.ts`／`dir.txt` 列出的其他階段主題，並依 `brainstorming` 技能重新走一輪需求確認（不可預設套用既有範本或章節範圍）。
3. **以下 Minor 已於第 19 階段最終審查記錄，延後處理，非阻塞**：
   - `OverfittingUnderfittingComparison.tsx` 的圖表間距修正硬編碼 `marginBottom: '16px'`，可改用設計 token `var(--space-md)`（數值相同，僅一致性考量）。
   - `polynomialFit.ts` 與 `dataSplit.ts` 之間存在資料集長度（50）的隱性耦合（`SHUFFLED_INDICES` 長度），目前有測試覆蓋（涵蓋每個資料點恰一次），建議之後補一行註解說明此依賴，非必要修改。
   - Excalidraw 資產的 DOM 量測法（`--dump-dom`）在捲軸臨界值附近可能不準確（詳見下方規則），建議之後補充進校正檢查清單。
4. **前期已記錄的 Minor（第 18 階段）仍延後**：`dataSplit.ts` 的 `kFoldSplit` 邊界檢查、`train-test-split-cross-validation-summary.html` 未使用 CSS 變數——皆判定排除在範圍外。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`。目前 `chapterOrder` 鏈結順序：`machine-learning-introduction → crisp-dm → feature-engineering-standardization → train-test-split-cross-validation → overfitting-underfitting-bias-variance → simple-linear-regression → multiple-linear-regression`。**本站沒有字面文字的「上一步/下一步」按鈕元件**，這個語意是由 `chapterOrder` 透過 `Nav.astro` 轉譯為頂部導覽列的左右排列順序呈現。**注意：頂部導覽列是單行、可水平捲動的軌道（`overflow-x: auto`），在任何寬度的截圖中都可能視覺裁切看不到完整清單**——驗證章節順序時應改用 `curl` 取得頁面原始 HTML、核對 `aria-current="page"` 與各 `<a>` 項目順序，不能只靠截圖判斷（第 18 階段的教訓，第 19 階段持續適用）。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，`relatedTo` 欄位標註跨主題關聯，其餘關聯（Decision Tree↔Random Forest/Boosting、PCA↔K-Means、KNN↔K-Means）仍待對應章節建置時處理，詳見 `chapter_template_guide.md` 1.1 節。
- **四套章節範本**（皆已記錄於 `docs/specs/chapter_template_guide.md`）：導覽類、演算法類（九大區塊，1 節）、方法論／流程類（CRISP-DM，4 大區塊，1.2 節）、技巧/技術類（特徵工程與標準化／訓練測試切分／過擬合欠擬合皆屬此類，6 大區塊，1.3 節）。**沿用既有範本建置新章節時，若範本本身無需異動，實作計畫不需要修改 `chapter_template_guide.md`**。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`。每個資產的渲染腳本（`scripts/render-*.ps1`）**路徑寫死指向主倉庫 checkout**（不含 worktree 路徑片段），在 worktree 內開發時若需重新渲染，須用「複製資產到主 checkout 渲染、複製輸出回 worktree、清除主 checkout 暫存檔」的可逆方式（第 12、16、17、18、19 階段皆用此法）。
- **資訊圖表標題底線寬度需依標題長度調整**：`.title-underline` 的 `width` 是每個章節 HTML 源檔各自的常數（非共用範本的一部分），若新章節標題字數明顯多於既有章節（例如超過 10 個字），預設沿用舊寬度可能導致底線只涵蓋標題中段、視覺上呈現「刪除線」效果（第 18 階段遇到並修正為 500px）。**建立新資訊圖表時應主動核對標題長度是否需要加寬此值**，不要預設沿用上一章節的數值。
- **標題附近的裝飾元素（`.doodle` 等）也需隨標題長度同步調整，不只是底線寬度**：第 19 階段「過擬合/欠擬合與偏差-變異數權衡」（16 字，歷來最長）遇到 `.title-underline` 已依比例加寬，但右上角 `.doodle` 裝飾沿用舊章節寫死的 `right`/`width` 座標未同步調整，導致與標題最後一字重疊約 24px，直到最終整體審查才被發現（單一 Task 審查未涵蓋此檢查點）。**建立新資訊圖表時，任何與標題同一水平列的裝飾元素都應一併檢查是否隨標題長度／字級留出足夠水平空間**，並且應在該資產的 Task 審查階段就檢查（不要留到最終整體審查才發現）。
- **Canvas 疊層繪製注意事項**：若用 `<canvas>` 繪製連接線/箭頭，**優先採用「依容器實際渲染尺寸動態計算座標」的方式**，而非把節點/箭頭座標寫死成常數（第 16 階段 CRISP-DM 循環圖曾因此導致箭頭被節點方塊遮擋，第 18 階段起改用動態計算座標）。
- **多條 Plotly trace 共用同一 y 類別時要小心圖例缺失**：若元件關閉 `showlegend`（本站慣例），且多條 trace 的顏色差異是唯一視覺區分依據，務必讓每條 trace 使用**不同的 y 軸類別標籤**，而非共用同一類別文字（第 18 階段最終審查發現並修正）。**若圖表是連續數值座標（散佈+曲線圖），則改為開啟圖例但關閉互動切換**（`itemclick: false`／`itemdoubleclick: false`，第 19 階段 `OverfittingUnderfittingComparison.tsx` 採用此模式，因為此類圖表無法用 y 類別標籤取代圖例）。
- **Excalidraw 資產渲染的視窗高度校正法**：優先用 DOM 量測法（**務必加上與正式渲染相同的 `--force-device-scale-factor` 旗標**）。**若 `--dump-dom` 在當次環境完全無回應**（連對簡單外部頁面測試都是空白輸出），改用「對渲染輸出 PNG 做像素分析＋二分搜尋候選視窗高度」的替代驗證法。**第 19 階段新發現：DOM 量測值與像素分析實測邊界可能存在系統性落差（約 20px），且在該落差區間內嘗試收緊視窗高度會觸發「捲軸出現後因內容重排、寬度變窄而使高度需求增加」的遲滯效應（一旦出現捲軸，即使再放寬幾 px 仍可能維持捲軸）**——遇到此情況時應以 DOM 量測值為準（重新驗證確認無捲軸即可鎖定），不要執著把視窗高度壓到像素分析認定的最小值。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`；`npm run preview` 為背景 node 行程，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止並確認無殘留。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容。**
- **建立 worktree 前務必確認本機 main 是否已推送至 origin**：原生 `EnterWorktree` 工具預設從 `origin/<default-branch>` 分支，若本機 main 領先 origin，新建的 worktree 會缺少尚未推送的 commit——建立 worktree 前先 `git push origin main` 是標準檢查項目。
- **Worktree 清理注意事項**：若刪除 worktree 目錄失敗（檔案被鎖定），先檢查本次 session 內是否有遺留、忘記關閉的 `astro preview`/`astro dev` 行程佔用該路徑。**若合併回主分支後 `npm run test` 顯示的測試數量翻倍**，是已知問題（vitest 不讀 `.gitignore`，殘留的 worktree 目錄內同一份程式碼被重複執行），清除 worktree 後即恢復正常（第 5、16、17、18、19 階段皆遇到同一根因）。
- **Subagent 因外部因素（非程式問題）中止時，優先用 `SendMessage` 恢復同一 agent 接續，而非重新從頭派工**：第 19 階段兩次中止——implementer 因網路連線暫斷（`API Error: ENOTFOUND`）、最終審查 subagent 因 session API 額度限制（訊息會顯示重置時間，如台北時間 17:20）——皆用 `SendMessage` 帶著「你被中斷，並非任務失敗，請從中斷處接續」的訊息恢復同一 agent 的 transcript，成功保留其既有進度與脈絡，避免重工。額度限制中止的情況需先確認系統時間已過重置時間再恢復，避免立即重試又撞到同一限制。
- **若開工時交接文件記錄的階段落後於 worktree 實際進度**（例如前段 session 因額度或連線問題中斷、未及收尾寫入 worklog/chatlog/handover），**應比對 worktree 的 `git log` 與 SDD ledger（`.superpowers/sdd/<plan-basename>/progress.md`）重建實際進度，而非預設交接文件是最新狀態**——第 19 階段開工時即用此法發現前段 session 已完成 Task 1-3、且 Task 3 的 review package 已生成但尚未派審，因而正確地從「補派 Task 3 審查」接續，而非重跑或從 Task 4 開始。
- **最終審查 subagent 可能因 API 使用額度超限而中止**（非程式碼問題，錯誤訊息會顯示重置時間），此時直接重新派工（或用 `SendMessage` 恢復）即可，不需更動審查內容或範圍。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`）。已知限制：React island 水合延遲、Astro 圖片優化端點首次請求延遲、`--dump-dom` 對本機 preview 伺服器不穩定、全頁截圖圖片區塊偶發黑色空白。**單純的 `--screenshot` 無法驗證按鈕點擊等互動行為**，改用 Chrome DevTools Protocol（CDP，`--remote-debugging-port` + Node `WebSocket` + `Runtime.evaluate` 呼叫 `.click()` + `Page.captureScreenshot`）直接驅動點擊佐證；驗證完成後需確認 CDP 驅動用的額外 Edge 行程也一併關閉。**頂部導覽列是可捲動軌道，截圖驗證章節順序前務必先確認這一點**。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：凡使用 Subagent-Driven Development 建置新章節，一律先建立獨立 git worktree（優先使用原生 `EnterWorktree` 工具，且需先確認本機 main 已推送至 origin），不再詢問 main vs worktree。SDD 流程中所有 Task 的 implementer/reviewer 都應共用同一個技能層級建立的 worktree，**不可**額外對個別 subagent 派工加上 `isolation: "worktree"` 參數。
