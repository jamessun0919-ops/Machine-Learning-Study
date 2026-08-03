# 交接文件 Handover

> 最後更新：2026-08-04（第 22 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`機器學習介紹`、`CRISP-DM 資料分析方法`、`特徵工程與標準化`、`訓練/測試切分與交叉驗證`、`過擬合/欠擬合與偏差-變異數權衡`、`Simple Linear Regression`、`Multiple Linear Regression`、`Polynomial Regression`、`Ridge Regression` 九個章節，皆已上線。**階段二（方法論基礎）三個章節已全數完成上線；階段三（監督式學習－迴歸）已完成 4/5 個主題（Simple/Multiple/Polynomial/Ridge Regression），尚缺 Lasso Regression、Logistic Regression。**

## 已完成進度 (Completed)

- **（第 22 階段）「Ridge Regression（Ridge 迴歸，正則化）」章節完整上線**，接續在 Polynomial Regression 之後，沿用九大區塊演算法類範本：
  1. **教學切入點**：多項式係數爆炸——重用 Overfitting 章節既有的合成 sin 曲線資料與訓練/測試切分（`polynomialFit.ts` 已匯出的 `TRAIN_SET`/`TEST_SET`），**固定次數 15**（非最初設計的次數 9——實測後發現次數 9 不會嚴重過擬合，加正則化只會單調變差，次數 15 才是真正已驗證的嚴重過擬合案例）。
  2. `src/lib/regression.ts` 新增 `fitRidgeRegression(features, target, lambda)`：L2 正則化常態方程式求解器，懲罰項跳過截距，重用既有私有輔助函式。`src/lib/scaling.ts` 新增 `applyZScore(value, stats)`：用訓練集算出的 stats 套用到新資料點（測試集/曲線取樣點），避免資料洩漏。
  3. 新元件 `RidgeRegressionFit.tsx`：雙區塊設計——上方配適曲線圖（次數固定 15）、下方係數條形圖（**對數座標顯示係數絕對值**——因 λ=0 時最大係數絕對值達 1450，與其餘 λ 相差 200 倍以上，線性軸會讓長條圖失真）；λ 白名單按鈕 `0, 0.01, 0.1, 1, 10`；標準化管線用訓練集算出的 mean/std 統一套用到訓練/測試/曲線取樣點。
  4. 章節內文與課程資料串接：`chapterOrder` 接續在 `polynomial-regression` 之後（目前鏈尾）；`curriculum.ts` 新增 `relatedTo: ['Polynomial Regression（多項式回歸）', '過擬合/欠擬合與偏差-變異數權衡', '特徵工程與標準化']`（三組皆雙向補齊，回頭在三個已上線章節補上關聯段落）；`chapter_template_guide.md` 1.1 節對照表同步新增 3 列（共 9 組）。
  5. Excalidraw 風格學習摘要資訊圖表：六卡片版面，案例分析對比 λ=0（test RMSE=0.8024、最大係數絕對值 1450.078）與 λ=0.01（test RMSE=0.3204、5.7643，改善約 60%／收縮約 252 倍）。
  6. 全站最終驗證：測試 53/53、`astro check` 0 錯誤/0 警告、`build` 10 頁成功；最終審查獨立重新複算所有數值，逐位確認計畫/設計文件/資訊圖表/程式碼四方一致。
- **設計階段用驗證腳本抓到兩個關鍵問題並與開發者確認修正**：(1) 原訂固定次數 9，實測後改為次數 15；(2) 係數條形圖原訂線性固定軸，因尺度差異過大改為對數座標。皆先停下用腳本驗證、列出數據給開發者選擇，非憑感覺調整。
- **實作階段（Task 3）implementer 正確抓到一個真正的計畫文件 bug**：計畫原訂 Task 3 就要在 frontmatter 寫入 `summary.image`，但該 PNG 要到 Task 5 才產生，導致 build 失敗。implementer 依規則停下回報 BLOCKED，Agent 核實後（比對 Polynomial Regression 章節的既有 git 歷史，確認修正方向唯一明確）直接修正計畫文件並 resume 同一 implementer 完成。
- **Task 5（資訊圖表渲染）遇到渲染腳本成功/失敗訊號不可靠的環境問題**：`Test-Path` 誤報失敗（其實部分寫入壞圖）、誤報成功（其實是偵測到殘留舊檔案）、最終正確檔案由背景 Edge 行程非同步延遲約 1 分鐘才寫入。implementer 未修改腳本、僅用唯讀診斷後親自開圖驗證正確；最終審查確認此為**全站既有腳本的既有模式**（`render-polynomial-regression-infographic.ps1` 同樣寫法），非本分支引入，記錄為未來可另案處理的建議（例如刪除舊檔案後改用輪詢檔案穩定性取代 `Test-Path`），不阻塞本次合併。
- **最終全分支審查（opus model，Ready to merge: Yes）**：獨立重跑三道驗證關卡（測試/astro check/build）、獨立寫腳本複算所有數值、逐項觸診 3 個延後 Minor 發現皆判定不阻塞，另有 4 項純觀察性 Minor（皆為既有慣例或合理取捨，不需修正）。
- 已本機 `merge`（fast-forward）回 `main`、用 `ExitWorktree` 清理 worktree 與已合併分支（6 個 commit 已安全存在於 main）、`git push origin main` 成功，觸發 GitHub Pages 部署，「Ridge Regression」章節正式上線。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。第 22 階段工作已全數完成並推送上線。階段三已完成 Simple/Multiple/Polynomial/Ridge Regression 四個主題，下一步需與開發者確認是否接續階段三最後一個主題（Lasso Regression）或 Logistic Regression（跨入分類任務）。

## 下一步行動 (Next Steps)

1. **下一個章節規劃**：依 `curriculum.ts`／`dir.txt` 順序，階段三（監督式學習－迴歸）剩餘 Lasso Regression、Logistic Regression 兩個主題。開工時需與開發者確認方向，並依 `brainstorming` 技能重新走一輪需求確認（不可預設套用既有範本或章節範圍）。若選擇 Lasso Regression，設計時應注意：Ridge Regression 常見誤區已提及「Ridge 不做特徵選擇、係數不會恰好變成 0」，Lasso 正是這個對比的另一半，教學切入點可考慮直接延續 Ridge 的次數 15 案例做「Ridge vs Lasso 係數收縮方式對比」，但仍需與開發者逐項確認、不可預設。
2. **其餘 3 組跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means（Polynomial Regression↔過擬合/欠擬合、Ridge Regression↔三組關聯已於第 20、22 階段補齊，共 9 組中已補 5 組）。規則與對照表已記錄於 `docs/specs/chapter_template_guide.md` 1.1 節。
3. **第 22 階段最終審查記錄的建議事項待未來討論**：渲染腳本（`scripts/render-*.ps1`）的 `Test-Path` 成功判定過於薄弱（會誤判殘留舊檔案為成功、無法偵測背景 Edge 行程非同步延遲寫入），此為全站既有腳本共用模式（非單一章節問題），若未來想修正建議改為「先刪除舊檔案，再輪詢檔案穩定性（比較 `LastWriteTime` 與腳本啟動時間、或連續兩次檔案大小相同）」取代單純 `Test-Path`，需先與開發者討論再動手（依規則不可未經確認就修改腳本邏輯）。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`。目前 `chapterOrder` 鏈結順序：`machine-learning-introduction → crisp-dm → feature-engineering-standardization → train-test-split-cross-validation → overfitting-underfitting-bias-variance → simple-linear-regression → multiple-linear-regression → polynomial-regression → ridge-regression`（鏈尾，尚無 `nextSlug`）。**本站沒有字面文字的「上一步/下一步」按鈕元件**，這個語意是由 `chapterOrder` 透過 `Nav.astro` 轉譯為頂部導覽列的左右排列順序呈現。**頂部導覽列是單行、可水平捲動的軌道（`overflow-x: auto`），任何寬度的截圖都可能視覺裁切看不到完整清單**——驗證章節順序時應改用 `curl` 取得頁面原始 HTML、核對 `aria-current="page"` 與各 `<a>` 項目順序，不能只靠截圖判斷。**`chapters.ts` 的 `prerequisiteSlug`/`nextSlug` 欄位目前實際上沒有任何程式碼讀取**（`Nav.astro` 只依賴陣列順序），第 22 階段最終審查已確認此為既有欄位、非本分支引入的死碼，依規則不主動刪除。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，`relatedTo` 欄位標註跨主題關聯，目前已補 5 組雙向（Multiple Linear Regression↔Logistic Regression 單側、Polynomial Regression↔過擬合/欠擬合雙側、Ridge Regression↔Polynomial Regression／過擬合-欠擬合／特徵工程與標準化 三組雙側），其餘 4 組（Decision Tree↔Random Forest/Boosting、PCA↔K-Means、KNN↔K-Means）仍待對應章節建置時處理，詳見 `chapter_template_guide.md` 1.1 節。**該對照表僅涵蓋目前 `curriculum.ts` 已定義的 `relatedTo` 邊，新增章節時若有新關聯，需同步在該表新增列（不限於原始 6 組，已於第 22 階段驗證此擴充模式無問題）。**
- **四套章節範本**（皆已記錄於 `docs/specs/chapter_template_guide.md`）：導覽類、演算法類（九大區塊，1 節，Simple/Multiple/Polynomial/Ridge Linear Regression 皆屬此類）、方法論／流程類（CRISP-DM，4 大區塊，1.2 節）、技巧/技術類（特徵工程與標準化／訓練測試切分／過擬合欠擬合皆屬此類，6 大區塊，1.3 節）。
- **【第 22 階段新規則】九大區塊範本的 frontmatter `summary:` 區塊，若對應的資訊圖表 PNG 尚未產生，該章節內文建置任務（通常是「章節內文＋路由串接」的那個任務）不可提前寫入 `summary:` 欄位**——Astro 的 `image()` schema 驗證器會在 build 時驗證圖片檔案真的存在，提前寫入會讓 build 失敗。正確順序：內文建置任務先不寫 `summary:`；資訊圖表任務產生 PNG 的同一個 commit，才把整個 `summary:` 區塊（formulas＋keyStats＋image）一次寫入。此為 Polynomial Regression 章節（第 20 階段）就已採用的既有模式，第 22 階段規劃時一度誤把兩者順序寫反，已修正並記錄於此，未來規劃新章節實作計畫時應直接遵循此順序，不要重蹈覆轍。
- **【第 22 階段新發現】渲染腳本（`scripts/render-*.ps1`）的 `Test-Path $outputPath` 成功判定過於薄弱**：無法區分「這次渲染真的成功」與「偵測到前一次殘留的舊檔案」，也無法感知 headless Edge 的 `--screenshot` 可能非同步延遲寫入（腳本已回報失敗、行程已看似結束，但檔案在之後約 1 分鐘才真正寫入完成）。這是**全站既有腳本的共用模式**（第 20 階段的 Polynomial Regression 渲染腳本也是同樣寫法），非單一章節新引入的問題。**未來若要修正，需先與開發者討論方案**（例如先刪除舊檔案再輪詢檔案穩定性），不可依規則自行修改腳本邏輯。此期間唯一可靠的驗證方式仍是 Agent 本人用 Read 工具開圖親自檢視，不能只信任腳本的 exit code 或 `Write-Host` 輸出。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`。7 支既有渲染腳本已於第 21 階段全數改用動態路徑推導；第 22 階段新增的 `render-ridge-regression-infographic.ps1` 沿用相同模式（共 8 支）。
- **【延續第 20 階段規則，第 22 階段再次驗證有效】建立/修改任何資訊圖表任務後，Agent 本人必須親自用 Read 工具開圖檢視，不能只靠任務審查通過就視為完成**——子審查 subagent 無法檢視二進位圖片檔案，只能明確標記為 ⚠️ 待 controller 確認事項；第 22 階段的 Task 5 審查正是如此運作，且 Agent 本人開圖後確認內容完全正確（無延續第 20 階段的 LaTeX 語法錯誤等問題），流程按設計運作。
- **Ridge Regression 的核心教學設計决策**（供未來 Lasso Regression 章節規劃參考）：固定多項式次數 15（不提供次數切換）、λ 白名單 `0, 0.01, 0.1, 1, 10`、標準化管線（訓練集算 stats、套用到訓練/測試/曲線取樣點）、係數條形圖用對數座標顯示絕對值。這些數值與設計決策皆已用 Node 驗證腳本實測確認，記錄在 `docs/superpowers/specs/2026-08-03-ridge-regression-chapter-design.md`。**若 Lasso Regression 章節打算延續同一個次數 15 案例做對比教學，仍需重新確認 Lasso 在該資料集下的實際數值表現（不可預設 Lasso 的行為會跟 Ridge 類似），且需與開發者確認是否採用此教學切入點**。
- **Canvas 疊層繪製注意事項**：若用 `<canvas>` 繪製連接線/箭頭，優先採用「依容器實際渲染尺寸動態計算座標」的方式，而非把節點/箭頭座標寫死成常數。
- **多條 Plotly trace 共用同一 y 類別時要小心圖例缺失**：若元件關閉 `showlegend`，且多條 trace 的顏色差異是唯一視覺區分依據，務必讓每條 trace 使用不同的 y 軸類別標籤；若圖表是連續數值座標（散佈+曲線圖），改為開啟圖例但關閉互動切換（`itemclick: false`／`itemdoubleclick: false`）。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`；`npm run preview` 為背景 node 行程，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止並確認無殘留。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容。**
- **建立 worktree 前務必確認本機 main 是否已推送至 origin**：原生 `EnterWorktree` 工具預設從 `origin/<default-branch>` 分支，若本機 main 領先 origin，新建的 worktree 會缺少尚未推送的 commit——建立 worktree 前先 `git push origin main` 是標準檢查項目。
- **用原生 `ExitWorktree` 工具清理已合併的 worktree 時，即使分支已成功 fast-forward 併入 main，工具仍會因偵測到「該分支有 N 個 commit」而要求二次確認**（回傳錯誤要求加上 `discard_changes: true`）。這是工具本身無法得知這些 commit 已經安全存在於 main 分支上，屬於預期行為、非異常——先用 `git log <base>..HEAD --oneline` 或合併後的 `git log` 確認這些 commit 確實都已在 main 上，再加上 `discard_changes: true` 重新呼叫即可，不需要因為看到「permanently delete」等字眼而卻步或另外詢問開發者。
- **Worktree 清理注意事項**：若刪除 worktree 目錄失敗（檔案被鎖定），先檢查本次 session 內是否有遺留、忘記關閉的 `astro preview`/`astro dev` 行程佔用該路徑。**若合併回主分支後 `npm run test` 顯示的測試數量翻倍**，是已知問題（vitest 不讀 `.gitignore`，殘留的 worktree 目錄內同一份程式碼被重複執行），清除 worktree 後即恢復正常（第 5、16-22 階段皆遇到同一根因）。
- **Subagent 因外部因素（非程式問題）中止時，優先用 `SendMessage` 恢復同一 agent 接續，而非重新從頭派工**：第 22 階段最終審查 subagent 因 session API 額度限制中斷一次（訊息顯示重置時間台北時間 00:30），確認系統時間已過重置時間（過了約 6 小時，遠超安全邊界）後用 `SendMessage` 恢復完成。
- **若發現「計畫文件本身寫錯」而非「subagent 實作偏離計畫」，應由 Agent 本人核實後直接修正計畫文件（連同一則說明性 commit），不需要每次都詢問開發者**：僅當修正方向本身存在多種合理解讀、或牽涉架構決策時才需要詢問（第 22 階段 Task 3 的 `summary:` 欄位順序 bug、第 21 階段的頁數筆誤、第 20 階段的資訊圖表 LaTeX 語法錯誤，修正方向都是唯一且明確的，直接修正即可）。
- **實作前用驗證腳本先確認設計假設是否成立，比事後才發現更省成本**：第 22 階段在寫實作計畫階段（尚未派工 subagent）就用 Node 腳本驗證了「次數 9 是否真的會展現正則化改善效果」，發現與最初推薦理由不符，及早改為次數 15，避免了後續整個章節基於錯誤前提建置完才發現問題。**這類「教學論述是否有真實數據支撐」的假設，只要涉及具體數值，都應該在設計/計畫階段就寫腳本驗證，不要只憑直覺或既有章節的類比就假設成立。**
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`）。已知限制：React island 水合延遲、Astro 圖片優化端點首次請求延遲、`--dump-dom` 對本機 preview 伺服器不穩定、全頁截圖圖片區塊偶發黑色空白、Edge 無頭截圖可能搶在 rough.js canvas 畫完前擷取（timing race）；**第 22 階段新增觀察：`render-*.ps1` 腳本的 `Test-Path` 成功判定本身也可能因此類非同步寫入而失準，詳見上方新發現**。**單純的 `--screenshot` 無法驗證按鈕點擊等互動行為**，改用 Chrome DevTools Protocol（CDP）直接驅動點擊佐證；驗證完成後需確認 CDP 驅動用的額外 Edge 行程也一併關閉。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：凡使用 Subagent-Driven Development 建置新章節，一律先建立獨立 git worktree（優先使用原生 `EnterWorktree` 工具，且需先確認本機 main 已推送至 origin），不再詢問 main vs worktree。SDD 流程中所有 Task 的 implementer/reviewer 都應共用同一個技能層級建立的 worktree，**不可**額外對個別 subagent 派工加上 `isolation: "worktree"` 參數。
