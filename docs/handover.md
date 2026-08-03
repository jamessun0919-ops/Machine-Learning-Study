# 交接文件 Handover

> 最後更新：2026-08-03（第 21 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`機器學習介紹`、`CRISP-DM 資料分析方法`、`特徵工程與標準化`、`訓練/測試切分與交叉驗證`、`過擬合/欠擬合與偏差-變異數權衡`、`Simple Linear Regression`、`Multiple Linear Regression`、`Polynomial Regression` 八個章節，皆已上線。**階段二（方法論基礎）三個章節已全數完成上線；階段三（監督式學習－迴歸）已完成 3/5 個主題（Simple/Multiple/Polynomial Regression），尚缺 Ridge Regression、Lasso Regression、Logistic Regression。**

## 已完成進度 (Completed)

- **（第 21 階段）處理第 20 階段最終審查記錄的延後事項，非新章節工作**：
  1. 7 支渲染腳本（`scripts/render-*.ps1`，含第 20 階段新增的 polynomial-regression 腳本）全部改用 `$repoRoot = Split-Path -Parent $PSScriptRoot` 動態推導路徑，不再寫死主倉庫 checkout 絕對路徑（解決第 20 階段最終審查記錄的 Important）。
  2. `polynomial-regression-summary.html` 第 384 行 βᵈ 上標誤用修正為純文字 `d`（比照同檔第 381 行既有寫法），重新渲染確認正確。
  3. `PolynomialRegressionFit.tsx` 的 `CURVE_SAMPLE_X` 曲線取樣範圍改用 `Math.min(...LEVELS)`/`Math.max(...LEVELS)` 動態推導，移除寫死常數 1/9。
  4. `train-test-split-cross-validation-summary.html` 新增 `--good` CSS 變數並套用於 `.two-col.scope-cols h3.good`，消除該檔案內部唯一的 CSS 變數不一致處；重新渲染確認正確。
  5. `polynomialFit.ts` 的 `POINT_COUNT` 改為從 `dataSplit.ts` 匯出的 `SHUFFLED_INDICES.length` 動態推導，消除與 `dataSplit.ts` 之間資料集長度各自寫死的隱性耦合。
  6. 兩項延後事項查證後**判定不修**，理由記錄於下方規則：`kFoldSplit` 邊界檢查（唯一呼叫端已被 UI 限制在合法範圍，加防禦式檢查違反「不對不可能發生的情境加防禦」原則）、Excalidraw DOM 量測法在捲軸臨界值附近的限制（屬驗證手法本身的環境限制，非程式碼缺陷）。
  7. 全站驗證：測試 47/47、`astro check` 0 錯誤/0 警告、`build` 9 頁成功、無頭 Edge CDP 驅動點擊多項式回歸章節互動元件次數按鈕確認曲線範圍與數值正確。
  8. **渲染時意外踩到一次值得記錄的環境問題**：重新渲染 Multiple Linear Regression PNG（內容未變更，僅測試路徑修正）連續 3 次出現位元級別相同的排版錯位，非隨機競態；查證後發現該檔案本次無內容變更，其實不需保留任何重新渲染結果，改用 `git checkout` 還原 git 上原本正確版本即解決，非程式碼問題。詳見下方規則。
  9. 尚未 commit/push，待與開發者確認後執行（本次為直接在 main 上進行的小型維護工作，未使用 worktree/SDD，因所有修正方向已於實作前逐項與開發者確認過、範圍明確無架構決策）。

- **（第 20 階段）「Polynomial Regression（多項式回歸）」章節完整上線**，接續在 Multiple Linear Regression 之後，沿用九大區塊演算法類範本：
  1. `src/lib/positionSalaryData.ts`（TDD）：經典職等-薪資教學資料集（10 筆固定常數），與既有 50 Startups、過擬合章節合成資料皆不同——目的是提供明顯非線性的真實案例，供「線性配不好、多項式才配得好」的教學故事使用。
  2. 互動元件 `PolynomialRegressionFit.tsx`：單一散佈圖＋配適曲線，次數白名單按鈕 1/2/3/4/5（預設 4），全資料配適不做 train/test 切分（樣本數僅 10 筆，切分無統計意義），重用既有 `regression.ts` 常態方程式求解器；`polynomialFeatures()` 依開發者確認**直接複寫**於元件內（不與已上線的 `polynomialFit.ts` 共用）。
  3. 章節內文與課程資料串接：`chapterOrder` 接續在 `multiple-linear-regression` 之後（目前鏈尾）；`curriculum.ts` 新增 `relatedTo` 雙向關聯至過擬合/欠擬合章節，並回補該已上線章節的簡介關聯段落；`chapter_template_guide.md` 1.1 節對照表同步新增一列（6 組）。
  4. Excalidraw 風格學習摘要資訊圖表：六卡片版面（簡介／模型公式／適用情境／評估指標／常見誤區／案例分析黑板），案例分析為職等-薪資資料集次數 4 配適（R²=0.9974，RMSE=14503.23，係數皆已用 Node 腳本預先驗證）。
  5. 全站最終驗證：測試 47/47、`astro check` 0 錯誤/0 警告、`build` 9 頁成功、互動元件次數按鈕（含 CDP 點擊實測）、知識地圖連結、既有 7 章節無迴歸、導覽鏈順序（HTML 原始碼 `aria-current` 核對）皆實測通過。
- **最終整體審查（Ready to merge: Yes）**：審查者獨立重算全部案例分析數值與次數 4 係數逐位確認無誤，發現 1 項 Important（渲染腳本路徑寫死問題，評估為全站既有模式、非本分支引入，詳見下方規則）與 3 項 Minor（詳見下方「延後事項」），皆不阻塞合併。
- **本階段兩次抓到「計畫文件本身寫錯，而非 subagent 實作偏離」的問題**：(1) Task 2 implementer 自行發現並用 `git stash` 驗證的頁數期望值筆誤；(2) **Agent 本人在 Task 4 implementer 回報完成、任務審查也已通過之後，親自開圖檢視渲染輸出 PNG 才發現**的 LaTeX 語法渲染錯誤——因為子審查 subagent 明確表示無法檢視二進位圖片檔案，此類「文字內容正確但視覺呈現錯誤」的缺陷，只能靠實際看圖才抓得到。詳見下方「關鍵設定與規則」的新規則。
- 已本機 `merge`（fast-forward）回 `main`、用 `ExitWorktree` 清理 worktree 與已合併分支、`git push origin main` 成功，觸發 GitHub Pages 部署，「Polynomial Regression」章節正式上線。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。第 21 階段的程式碼修正與驗證皆已完成，**待與開發者確認 commit message 後 commit + push**（尚未執行）。階段三已完成 Simple/Multiple/Polynomial Regression 三個主題，下一步需與開發者確認是否接續階段三剩餘主題（Ridge/Lasso/Logistic Regression）或其他階段。

## 下一步行動 (Next Steps)

1. **待 commit + push**：第 21 階段的變更尚未提交，下次開工（或本次收尾）第一件事是與開發者確認 commit message 後執行 `git add`/`commit`/`push origin main`。
2. **下一個章節規劃**：依 `curriculum.ts`／`dir.txt` 順序，階段三（監督式學習－迴歸）剩餘 Ridge Regression、Lasso Regression、Logistic Regression 三個主題（Logistic Regression 已有 Multiple Linear Regression 單側補上的 `relatedTo` 關聯段落，建置時需補上另一側）。開工時需與開發者確認方向，並依 `brainstorming` 技能重新走一輪需求確認（不可預設套用既有範本或章節範圍）。
3. **其餘 3 組跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means（Polynomial Regression↔過擬合/欠擬合已於第 20 階段完成，共 6 組中已補 2 組雙向）。規則與對照表已記錄於 `docs/specs/chapter_template_guide.md` 1.1 節。
4. **第 20 階段最終審查記錄的 Important／Minor 已於第 21 階段全數處理完畢**（渲染腳本路徑、βᵈ 上標、曲線取樣範圍動態推導皆已修正；y 軸範圍未固定維持現狀，這是明確的設計取捨非缺陷，不建議未經開發者確認就自行改動）。
5. **第 18、19 階段記錄的 Minor 已於第 21 階段查證處理完畢**：`train-test-split-cross-validation-summary.html` 的 CSS 變數不一致已修正（新增 `--good`）；`polynomialFit.ts`／`dataSplit.ts` 隱性耦合已消除。以下 2 項查證後判定**不修**，理由已記錄於下方規則，未來若再被提起不必重複討論：`kFoldSplit` 邊界檢查（唯一呼叫端已受 UI 限制，加防禦式檢查屬不必要的程式碼）、Excalidraw DOM 量測法在捲軸臨界值附近的限制（驗證手法本身的環境限制，非程式碼缺陷，無程式碼可修）。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`。目前 `chapterOrder` 鏈結順序：`machine-learning-introduction → crisp-dm → feature-engineering-standardization → train-test-split-cross-validation → overfitting-underfitting-bias-variance → simple-linear-regression → multiple-linear-regression → polynomial-regression`（鏈尾，尚無 `nextSlug`）。**本站沒有字面文字的「上一步/下一步」按鈕元件**，這個語意是由 `chapterOrder` 透過 `Nav.astro` 轉譯為頂部導覽列的左右排列順序呈現。**頂部導覽列是單行、可水平捲動的軌道（`overflow-x: auto`），任何寬度的截圖都可能視覺裁切看不到完整清單**——驗證章節順序時應改用 `curl` 取得頁面原始 HTML、核對 `aria-current="page"` 與各 `<a>` 項目順序，不能只靠截圖判斷。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，`relatedTo` 欄位標註跨主題關聯，目前已補 2 組雙向（Multiple Linear Regression↔Logistic Regression 單側、Polynomial Regression↔過擬合/欠擬合雙側），其餘 4 組（Decision Tree↔Random Forest/Boosting、PCA↔K-Means、KNN↔K-Means）仍待對應章節建置時處理，詳見 `chapter_template_guide.md` 1.1 節。
- **四套章節範本**（皆已記錄於 `docs/specs/chapter_template_guide.md`）：導覽類、演算法類（九大區塊，1 節，Simple/Multiple/Polynomial Linear Regression 皆屬此類）、方法論／流程類（CRISP-DM，4 大區塊，1.2 節）、技巧/技術類（特徵工程與標準化／訓練測試切分／過擬合欠擬合皆屬此類，6 大區塊，1.3 節）。**沿用既有範本建置新章節時，若範本本身無需異動，實作計畫不需要修改 `chapter_template_guide.md`**（僅 1.1 節的跨章節關聯對照表可能需要新增列，這不算範本結構異動）。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`。**7 支渲染腳本（`scripts/render-*.ps1`）已於第 21 階段全數改用 `$repoRoot = Split-Path -Parent $PSScriptRoot` 動態推導路徑（不再寫死主倉庫 checkout 絕對路徑）**，在 worktree 內開發時若需重新渲染，理論上腳本本身已可正確運作，但仍建議延續「複製資產到主 checkout 渲染、複製輸出回 worktree、清除主 checkout 暫存檔」的可逆習慣以策安全（第 12、16-21 階段皆用此法）。
- **【第 21 階段新發現】重新渲染 PNG 前，先確認 HTML 內容是否真的有變更**：若只是測試渲染腳本本身（例如路徑修正），內容未變更的資產不需要保留重新渲染結果，git 上原本的 PNG 已經是正確版本。第 21 階段曾誤以為需要「順便」重新渲染 5 個內容未變更的資產來驗證路徑修正，結果其中 1 個（Multiple Linear Regression）連續 3 次渲染都出現位元級別完全相同的排版錯位（案例分析黑板表格消失、標題底線裝飾消失）——這與已知的「Edge 無頭截圖搶在畫完前擷取」隨機競態不同（隨機競態通常重試就會好、或每次表現不同），推測是連續背靠背執行多支 Edge 無頭渲染造成環境負載偏高、穩定踩到截圖時機問題。**正確處理方式不是繼續試錯或加延遲腳本，而是直接用 `git checkout -- <png路徑>` 還原成 git 上原本正確的版本**（因為內容根本沒變，不需要新渲染）；日後若真的需要重新渲染某個「內容有變更」的資產卻連續遇到同樣的位元級別重複錯誤，才需要考慮加 `Start-Sleep`／`--virtual-time-budget` 等固定延遲，且需先與開發者確認再調整腳本邏輯。
- **【第 20 階段新發現，重要】Excalidraw 資訊圖表 HTML 資產沒有載入 KaTeX 引擎，不會渲染 `$...$` 語法**：這類獨立靜態 HTML（用 rough.js + 無頭瀏覽器渲染成 PNG）與會被 Astro+KaTeX 渲染的章節內文 `.md` 檔案是兩套完全不同的渲染管線。**撰寫資訊圖表卡片內文時，絕對不能直接複製章節 `.md` 內文的 LaTeX `$...$` 語法**，否則畫面會顯示出原始的 `$`、`\ldots`、`\beta` 等字元而非數學符號——必須改用純文字/Unicode 表示（例如 `β₀`、`⋯`、`x²`，比照既有 `.eq` 公式區塊已經使用的寫法）。此類缺陷**只能靠實際開圖檢視才能發現**，子審查 subagent 明確表示無法檢視二進位 PNG 檔案，因此**建立/修改任何資訊圖表任務後，Agent 本人必須親自用 Read 工具開圖檢視，不能只靠任務審查通過就視為完成**（本階段的 bug 正是審查通過、implementer 也回報完成後，才被 Agent 本人開圖抓到）。
- **標題附近的裝飾元素（`.title-underline`／`.doodle` 等）需隨標題長度同步調整**：規則詳見前期記錄（第 18、19 階段），本階段標題「多項式回歸」（5 字）短於既有最長紀錄，沿用舊尺寸未遇到問題，但仍應主動核對，不可預設沿用。
- **Canvas 疊層繪製注意事項**：若用 `<canvas>` 繪製連接線/箭頭，優先採用「依容器實際渲染尺寸動態計算座標」的方式，而非把節點/箭頭座標寫死成常數。
- **多條 Plotly trace 共用同一 y 類別時要小心圖例缺失**：若元件關閉 `showlegend`，且多條 trace 的顏色差異是唯一視覺區分依據，務必讓每條 trace 使用不同的 y 軸類別標籤；若圖表是連續數值座標（散佈+曲線圖），改為開啟圖例但關閉互動切換（`itemclick: false`／`itemdoubleclick: false`）。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`；`npm run preview` 為背景 node 行程，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止並確認無殘留。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容。**
- **建立 worktree 前務必確認本機 main 是否已推送至 origin**：原生 `EnterWorktree` 工具預設從 `origin/<default-branch>` 分支，若本機 main 領先 origin，新建的 worktree 會缺少尚未推送的 commit——建立 worktree 前先 `git push origin main` 是標準檢查項目。
- **【第 20 階段新發現】用原生 `ExitWorktree` 工具清理已合併的 worktree 時，即使分支已成功 fast-forward 併入 main，工具仍會因偵測到「該分支有 N 個 commit」而要求二次確認**（回傳錯誤要求加上 `discard_changes: true`）。這是工具本身無法得知這些 commit 已經安全存在於 main 分支上，屬於預期行為、非異常——先用 `git log <base>..HEAD --oneline` 或合併後的 `git log` 確認這些 commit 確實都已在 main 上，再加上 `discard_changes: true` 重新呼叫即可，不需要因為看到「permanently delete」等字眼而卻步或另外詢問開發者（此為完成開發者已選定的「本機合併」選項的標準收尾步驟，非新的破壞性操作）。
- **Worktree 清理注意事項**：若刪除 worktree 目錄失敗（檔案被鎖定），先檢查本次 session 內是否有遺留、忘記關閉的 `astro preview`/`astro dev` 行程佔用該路徑。**若合併回主分支後 `npm run test` 顯示的測試數量翻倍**，是已知問題（vitest 不讀 `.gitignore`，殘留的 worktree 目錄內同一份程式碼被重複執行），清除 worktree 後即恢復正常（第 5、16、17、18、19、20 階段皆遇到同一根因）。
- **Subagent 因外部因素（非程式問題）中止時，優先用 `SendMessage` 恢復同一 agent 接續，而非重新從頭派工**：第 20 階段最終審查 subagent 因 session API 額度限制中斷一次（訊息顯示重置時間台北時間 00:20），確認系統時間已過重置時間（僅過 6 分鐘，屬安全邊界）後用 `SendMessage` 恢復完成，避免立即重試又撞到同一限制。
- **若發現「計畫文件本身寫錯」而非「subagent 實作偏離計畫」，應由 Agent 本人核實後直接修正計畫文件（連同一則說明性 commit），不需要每次都詢問開發者**：僅當修正方向本身存在多種合理解讀、或牽涉架構決策時才需要詢問（如本階段第 4 頁計畫的頁數筆誤、資訊圖表 LaTeX 語法錯誤，修正方向都是唯一且明確的，直接修正即可）。
- **最終審查發現的 Important 若經評估屬「全站既有模式、非本分支引入」，且審查者本身建議另案處理，可不派修正輪次、直接記錄延後**，不必為了追求零 Important 而勉強在單一分支內處理跨全站的系統性問題（本階段渲染腳本路徑問題即為此類判例）。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`）。已知限制：React island 水合延遲、Astro 圖片優化端點首次請求延遲、`--dump-dom` 對本機 preview 伺服器不穩定、全頁截圖圖片區塊偶發黑色空白、**Edge 無頭截圖可能搶在 rough.js canvas 畫完前擷取（timing race），導致資訊圖表渲染出空白/壞圖，重試通常可解決，非內容錯誤**（第 20 階段 Task 4 兩次渲染皆遇到，若未來持續出現，可考慮替渲染腳本加入固定延遲）。**單純的 `--screenshot` 無法驗證按鈕點擊等互動行為**，改用 Chrome DevTools Protocol（CDP）直接驅動點擊佐證；驗證完成後需確認 CDP 驅動用的額外 Edge 行程也一併關閉。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：凡使用 Subagent-Driven Development 建置新章節，一律先建立獨立 git worktree（優先使用原生 `EnterWorktree` 工具，且需先確認本機 main 已推送至 origin），不再詢問 main vs worktree。SDD 流程中所有 Task 的 implementer/reviewer 都應共用同一個技能層級建立的 worktree，**不可**額外對個別 subagent 派工加上 `isolation: "worktree"` 參數。
