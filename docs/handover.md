# 交接文件 Handover

> 最後更新：2026-08-01（第 18 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression`、`機器學習介紹`、`CRISP-DM 資料分析方法`、`特徵工程與標準化`、`訓練/測試切分與交叉驗證` 六個章節，皆已上線。

## 已完成進度 (Completed)

- **（第 18 階段）「訓練/測試切分與交叉驗證」章節完整上線**，沿用第 17 階段建立的第四種「技巧/技術類」範本（本次無需修改 `chapter_template_guide.md`，範本已存在）：
  1. 新增 `src/lib/dataSplit.ts`（TDD）：固定洗牌排列常數（affine 排列公式 `i*17+7 mod 50`）、`trainTestSplit`、`kFoldSplit` 三個純函式，零依賴於任何資料集（比特徵工程章節的 `scaling.ts` 更純粹的關注點分離）。
  2. 新增互動元件 `src/components/charts/TrainTestSplitComparison.tsx`：50 個資料點橫向點狀圖，兩層模式切換（Train/Test Split 三比例按鈕／k-fold 五折選擇按鈕），即時顯示筆數統計。
  3. 章節內文與 `curriculum.ts`/`chapters.ts`/`curriculum.test.ts` 串接；`chapterOrder` **插入中段**（機器學習介紹 → CRISP-DM → 特徵工程與標準化 → **訓練/測試切分與交叉驗證** → 簡單線性回歸 → 多元線性回歸），兩側鄰居的 `prerequisiteSlug`/`nextSlug` 皆已改寫。
  4. Excalidraw 風格學習摘要資訊圖表：全新「5 格橫條圖」主視覺示意 k-fold 輪流驗證機制，弧形箭頭依容器實測寬度動態繪製（非寫死座標），從設計階段就避開了第 16 階段 CRISP-DM 循環圖遇過的箭頭遮擋問題。
  5. 全站最終驗證：測試 33/33、`astro check` 0 錯誤/0 警告、`build` 7 頁成功皆通過。
- 最終整體審查（Ready to merge: with fixes）發現 2 項 Important 已修正並複審通過：(1) 互動圖表兩條資料序列原共用同一 y 類別「樣本」且圖例被關閉，導致無法從畫面分辨顏色代表訓練集或測試集——已改為兩條序列各自使用不同 y 類別標籤（比照姊妹元件慣例，讓 y 軸本身充當圖例）；(2) 資訊圖表標題底線原寫死 320px，套用到本章 12 字標題時視覺上呈現「刪除線」效果，已加寬至 500px 並重新渲染。
- **兩個章節從規劃到上線都在同一天內完成**（第 17、18 階段皆為 2026-08-01）：「特徵工程與標準化」與「訓練/測試切分與交叉驗證」，皆採 Subagent-Driven Development + 獨立 worktree 流程。
- 已本機 merge 回 `main`（fast-forward）、清理 worktree 與已合併分支、`git push origin main` 成功，觸發 GitHub Pages 部署，「訓練/測試切分與交叉驗證」章節正式上線。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。新章節已完整上線，本階段收尾完成。

## 下一步行動 (Next Steps)

1. **其餘 4 組跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means。規則與對照表已記錄於 `docs/specs/chapter_template_guide.md` 1.1 節。
2. **下一個章節規劃**：依 `docs/config/curriculum.ts` 順序，階段二（方法論基礎）**僅剩最後 1 個候選主題**——「過擬合/欠擬合與偏差-變異數權衡」。開工時需與開發者確認是否進行此主題，並依 `brainstorming` 技能重新走一輪需求確認（本站現有 4 種範本可供參考，但個別章節內容仍需逐一確認，不可預設套用）。階段二完成後，下一步將進入階段三（監督式學習－迴歸，已完成 Simple/Multiple Linear Regression）之後的階段四主題。
3. **以下 Minor 已於第 18 階段最終審查記錄，延後處理，非阻塞**：
   - `src/lib/dataSplit.ts` 的 `kFoldSplit` 對超出範圍的 `currentFold`（非 0-4）或無法整除 50 的 `k` 值未做防禦性檢查，計畫明文排除在範圍外（固定 k=5、folds 0-4 的實際用法不會觸發此邊界）。
   - `train-test-split-cross-validation-summary.html` 有 `--intro-fill`/`--pitfall-fill` 兩個未使用的 CSS 變數，繼承自前一章節範本的既有模式，非本次任務引入。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`。目前 `chapterOrder` 鏈結順序：`machine-learning-introduction → crisp-dm → feature-engineering-standardization → train-test-split-cross-validation → simple-linear-regression → multiple-linear-regression`。**本站沒有字面文字的「上一步/下一步」按鈕元件**，這個語意是由 `chapterOrder` 透過 `Nav.astro` 轉譯為頂部導覽列的左右排列順序呈現。**注意：頂部導覽列是單行、可水平捲動的軌道（`overflow-x: auto`），在任何寬度的截圖中都可能視覺裁切看不到完整清單**——驗證章節順序時應改用 `curl` 取得頁面原始 HTML、核對 `aria-current="page"` 與各 `<a>` 項目順序，不能只靠截圖判斷（第 18 階段的教訓）。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，`relatedTo` 欄位標註跨主題關聯，其餘關聯（Decision Tree↔Random Forest/Boosting、PCA↔K-Means、KNN↔K-Means）仍待對應章節建置時處理，詳見 `chapter_template_guide.md` 1.1 節。
- **四套章節範本**（皆已記錄於 `docs/specs/chapter_template_guide.md`）：導覽類、演算法類（九大區塊，1 節）、方法論／流程類（CRISP-DM，4 大區塊，1.2 節）、技巧/技術類（特徵工程與標準化／訓練測試切分皆屬此類，6 大區塊，1.3 節）。**沿用既有範本建置新章節時，若範本本身無需異動，實作計畫不需要修改 `chapter_template_guide.md`**（第 18 階段的訓練/測試切分章節即為此例，區別於第 17 階段建立新範本時需要同步文件）。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`。每個資產的渲染腳本（`scripts/render-*.ps1`）**路徑寫死指向主倉庫 checkout**（不含 worktree 路徑片段），在 worktree 內開發時若需重新渲染，須用「複製資產到主 checkout 渲染、複製輸出回 worktree、清除主 checkout 暫存檔」的可逆方式（第 12、16、17、18 階段皆用此法）。
- **資訊圖表標題底線寬度需依標題長度調整**：`.title-underline` 的 `width` 是每個章節 HTML 源檔各自的常數（非共用範本的一部分），若新章節標題字數明顯多於既有章節（例如超過 10 個字），預設沿用舊寬度（如 320px）可能導致底線只涵蓋標題中段、視覺上呈現「刪除線」效果（第 18 階段的訓練/測試切分章節遇到並修正為 500px）。**建立新資訊圖表時應主動核對標題長度是否需要加寬此值**，不要預設沿用上一章節的數值。
- **Canvas 疊層繪製注意事項**：若用 `<canvas>` 繪製連接線/箭頭，**優先採用「依容器實際渲染尺寸動態計算座標」的方式**（例如用 `getBoundingClientRect()` 取得寬度後按比例定位箭頭），而非把節點/箭頭座標寫死成常數——第 16 階段 CRISP-DM 循環圖曾因寫死座標與 CSS 排版不同步導致箭頭被節點方塊遮擋，第 18 階段的「5 格橫條圖＋弧形箭頭」設計從一開始就採用動態計算座標，避免了同一類問題，後續新增類似視覺元件應以此為範例。
- **多條 Plotly trace 共用同一 y 類別時要小心圖例缺失**：若元件關閉 `showlegend`（本站慣例，避免使用者誤觸圖例切換顯示/隱藏），且多條 trace 的顏色差異是唯一的視覺區分依據，務必讓每條 trace 使用**不同的 y 軸類別標籤**（讓 y 軸刻度本身充當圖例），而不是共用同一個類別文字（例如都寫「樣本」）——否則使用者無法在不 hover 的情況下分辨顏色代表什麼（第 18 階段最終審查發現此問題，源自撰寫實作計畫時直接複製姊妹元件程式碼、未依資料形狀調整所致，非開發者設計意圖模糊，可直接當程式錯誤修正、不需詢問開發者）。
- **Excalidraw 資產渲染的視窗高度校正法**：優先用 DOM 量測法（**務必加上與正式渲染相同的 `--force-device-scale-factor` 旗標**）。**若 `--dump-dom` 在當次環境完全無回應（連對簡單外部頁面測試都是空白輸出，而非僅結果矛盾）**，不要在同一方法上反覆嘗試，直接改用「對渲染輸出 PNG 做像素分析＋二分搜尋候選視窗高度」的替代驗證法（第 18 階段遇到 `--dump-dom` 完全失效的情況，與先前階段「量測結果自相矛盾」的情況略有不同，但處置原則相同：不可靠就換方法，不要盲目重試）。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`；`npm run preview` 為背景 node 行程，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止並確認無殘留。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容。**
- **建立 worktree 前務必確認本機 main 是否已推送至 origin**：原生 `EnterWorktree` 工具預設從 `origin/<default-branch>` 分支，若本機 main 領先 origin，新建的 worktree 會缺少尚未推送的 commit（第 17 階段遇到並用 `git merge main --ff-only` 補救；第 18 階段吸取教訓，改為建立 worktree 前先 `git push origin main`，成功避免問題重演——**這是往後建立 worktree 前的標準檢查項目**）。
- **Worktree 清理注意事項**：若刪除 worktree 目錄失敗（檔案被鎖定），先檢查本次 session 內是否有遺留、忘記關閉的 `astro preview`/`astro dev` 行程佔用該路徑。**若合併回主分支後 `npm run test` 顯示的測試數量翻倍**，是已知問題（vitest 不讀 `.gitignore`，殘留的 worktree 目錄內同一份程式碼被重複執行），清除 worktree 後即恢復正常（第 5、16、17、18 階段皆遇到同一根因）。
- **最終審查 subagent 可能因 API 使用額度超限而中止**（非程式碼問題，錯誤訊息會顯示重置時間），此時直接重新派工即可，不需更動審查內容或範圍。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`）。已知限制：React island 水合延遲、Astro 圖片優化端點首次請求延遲、`--dump-dom` 對本機 preview 伺服器不穩定、全頁截圖圖片區塊偶發黑色空白。**單純的 `--screenshot` 無法驗證按鈕點擊等互動行為**，改用 Chrome DevTools Protocol（CDP，`--remote-debugging-port` + Node `WebSocket` + `Runtime.evaluate` 呼叫 `.click()` + `Page.captureScreenshot`）直接驅動點擊佐證；驗證完成後需確認 CDP 驅動用的額外 Edge 行程也一併關閉。**頂部導覽列是可捲動軌道，截圖驗證章節順序前務必先確認這一點**（見上方「章節資料結構」）。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：凡使用 Subagent-Driven Development 建置新章節，一律先建立獨立 git worktree（優先使用原生 `EnterWorktree` 工具，且需先確認本機 main 已推送至 origin），不再詢問 main vs worktree。SDD 流程中所有 Task 的 implementer/reviewer 都應共用同一個技能層級建立的 worktree，**不可**額外對個別 subagent 派工加上 `isolation: "worktree"` 參數。
