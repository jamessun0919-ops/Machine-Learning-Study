# 交接文件 Handover

> 最後更新：2026-08-01（第 17 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression`、`機器學習介紹`、`CRISP-DM 資料分析方法`、`特徵工程與標準化` 五個章節，皆已上線。

## 已完成進度 (Completed)

- **（第 17 階段）補齊第 16 階段遺留的兩項小型待辦**：
  1. `chapter_template_guide.md` 補上 1.2 節「方法論／流程類章節範本」說明與第 5 節對應資訊圖表版面規則（CRISP-DM 建立此範本時文件沒同步的缺口）。
  2. `curriculum.ts` 補上 Multiple Linear Regression → Logistic Regression 的 `relatedTo` 反向標註，知識地圖雙向連結已實測正確顯示。
- **（第 17 階段）「特徵工程與標準化」章節完整上線**，確立本站**第四種**章節範本（技巧/技術類：簡介／常見方法／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示）：
  1. 新增 `src/lib/scaling.ts`（TDD）：`computeStats`（母體標準差，非樣本標準差，比照 sklearn `StandardScaler`）、`zScoreScale`、`minMaxScale` 三個純函式。
  2. 新增互動元件 `src/components/charts/FeatureScalingComparison.tsx`：橫向點狀圖比較 R&D Spend／Marketing Spend 在「原始值／Z-score 標準化／Min-Max 縮放」三種模式下的分佈，即時計算並顯示統計量，重用既有 `regression-chart*` 通用 CSS 類別（未新增任何 CSS）。
  3. 章節內文（簡介／常見方法／適用情境與限制／常見誤區）與 `curriculum.ts`/`chapters.ts`/`curriculum.test.ts` 串接；`chapterOrder` **插入中段**（機器學習介紹 → CRISP-DM → **特徵工程與標準化** → 簡單線性回歸 → 多元線性回歸），兩側鄰居的 `prerequisiteSlug`/`nextSlug` 皆已改寫。
  4. Excalidraw 風格學習摘要資訊圖表（簡介卡／縮放方法卡／適用情境卡／常見誤區卡，純概念不列實際數字）。
  5. 全站最終驗證：測試 25/25、`astro check` 0 錯誤/0 警告、`build` 6 頁成功、互動元件三模式切換、知識地圖連結、prerequisite 鏈重排（simple-linear-regression 前一步正確變為新章節）皆實測通過。
- 最終整體審查（Ready to merge: with fixes）發現 1 項 Important 已修正並複審通過：章節簡介的資料集數量級描述誇大（「研發支出數十萬美元級／行銷支出數百萬美元級」，實際最大值僅 16.5 萬／47.2 萬，且被同頁互動元件即時印出的真實數字當場拆穿），已修正為「十萬美元級／數十萬美元級」，並同步修正設計文件兩處相同錯誤描述。
- 已本機 merge 回 `main`（fast-forward）、清理 worktree 與已合併分支、`git push origin main` 成功，觸發 GitHub Pages 部署，「特徵工程與標準化」章節正式上線。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。兩項小型待辦與新章節皆已完整上線，本階段收尾完成。

## 下一步行動 (Next Steps)

1. **其餘 4 組跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means。規則與對照表已記錄於 `docs/specs/chapter_template_guide.md` 1.1 節。
2. **下一個章節規劃**：依 `docs/config/curriculum.ts` 順序，階段二（方法論基礎）剩餘 2 個候選主題——「訓練/測試切分與交叉驗證」「過擬合/欠擬合與偏差-變異數權衡」。開工時需與開發者確認優先順序，並依 `brainstorming` 技能重新走一輪需求確認（本站現有 4 種範本：導覽類／演算法類九大區塊／方法論流程類 CRISP-DM／技巧技術類特徵工程，可供參考但個別章節內容仍需逐一確認，不可預設套用）。
3. **以下 Minor 已於第 17 階段最終審查記錄，延後處理，非阻塞**：
   - `feature-engineering-standardization-summary.html` 資訊圖表簡介卡文字誤寫「本站」應為「本章」（源自設計文件逐字內容），修正需重新渲染 PNG，成本大於效益，留待下次該圖有其他改動時一併處理。
   - `src/lib/scaling.ts` 的 `computeStats`/`zScoreScale`/`minMaxScale` 對空陣列或零變異數輸入未做防禦（會產生 NaN/Infinity），計畫明文排除在範圍外（固定真實資料集、無防禦性錯誤處理需求），已補上約定註解說明母體標準差慣例，未加 guard。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`（schema 見 `src/content.config.ts`，`summary`／`interactiveComponent` 皆為 optional）。目前 `chapterOrder` 鏈結順序：`machine-learning-introduction → crisp-dm → feature-engineering-standardization → simple-linear-regression → multiple-linear-regression`。**注意：本站沒有字面文字的「上一步/下一步」按鈕元件**，這個語意是由 `chapterOrder` 透過 `Nav.astro` 轉譯為頂部導覽列的左右排列順序呈現。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，`relatedTo` 欄位標註跨主題關聯。**Multiple Linear Regression↔Logistic Regression 現已雙向標註**（第 17 階段補上，先前僅 Logistic Regression 側）；其餘關聯（Decision Tree↔Random Forest/Boosting、PCA↔K-Means、KNN↔K-Means）仍待對應章節建置時處理，詳見 `chapter_template_guide.md` 1.1 節。
- **四套章節範本**（皆已記錄於 `docs/specs/chapter_template_guide.md`）：
  1. 導覽類（機器學習介紹：分類／應用場景／常見誤區／知識地圖）。
  2. 演算法類（Simple/Multiple Linear Regression：九大區塊含案例分析與互動元件，1 節）。
  3. 方法論／流程類（CRISP-DM：簡介／核心流程／常見誤區／學習摘要資訊圖表，4 大區塊，無案例分析、無互動元件，1.2 節）。
  4. **技巧/技術類（特徵工程與標準化：簡介／常見方法／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示，6 大區塊，1.3 節）**——有互動元件與數學公式（公式併入「常見方法」），但無案例分析、無評估指標、無運用範例區塊；本次建置時已同步將範本說明寫入 `chapter_template_guide.md`（吸取 CRISP-DM 當時文件沒同步的教訓，往後新章節範本應比照此做法，同一 commit 波次內完成文件同步）。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**，開工時不再詢問。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`。每個資產的渲染腳本（`scripts/render-*.ps1`）**路徑寫死指向主倉庫 checkout**（不含 worktree 路徑片段），在 worktree 內開發時若需重新渲染，須用「複製資產到主 checkout 渲染、複製輸出回 worktree、清除主 checkout 暫存檔」的可逆方式（第 12、16、17 階段皆用此法）。規則詳見 `docs/specs/chapter_template_guide.md` 第 5 節。
- **Canvas 疊層繪製注意事項**：若用 `<canvas>` 繪製連接線/箭頭且端點與不透明 HTML 元素重疊，箭頭可能被該元素完全遮擋（第 16 階段 CRISP-DM 循環圖曾遇到）；繪製前應依方向向量縮短線段，讓端點落在元素間的視覺間隙。
- **Excalidraw 資產渲染的視窗高度校正法**：優先用 DOM 量測法（暫存複本注入量測腳本，**務必加上與正式渲染相同的 `--force-device-scale-factor` 旗標**，否則量測環境不一致會給出自相矛盾的數值——第 16、17 階段皆連續遇到同一問題）。若量測結果出現自相矛盾訊號（例如量出的寬度與 CSS 指定值不符），不可盲目採信重跑，改用「直接對渲染輸出 PNG 做像素分析＋二分搜尋候選視窗高度」的替代驗證法。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`；`npm run preview` 為背景 node 行程，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止並確認無殘留。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容。**
- **Worktree 清理注意事項**：若刪除 worktree 目錄失敗（檔案被鎖定），先檢查本次 session 內是否有遺留、忘記關閉的 `astro preview`/`astro dev` 行程佔用該路徑（`netstat -ano` 找監聽埠對應 PID，`Get-CimInstance Win32_Process -Filter "ProcessId=<pid>"` 確認 `CommandLine`）。**若合併回主分支後 `npm run test` 顯示的測試數量翻倍**，是已知問題（vitest 不讀 `.gitignore`，殘留的 worktree 目錄內同一份程式碼被重複執行），清除 worktree 後即恢復正常（第 5、16、17 階段皆遇到同一根因）。**建立 worktree 前務必確認本機 main 是否已推送至 origin**：原生 `EnterWorktree` 工具預設從 `origin/<default-branch>` 分支（`worktree.baseRef: fresh`），若本機 main 領先 origin，新建的 worktree 會缺少尚未推送的 commit（第 17 階段遇到，用 `git merge main --ff-only` 在 worktree 內補上解決，未動 origin）。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用既有的無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`）。**已知限制 1**：`client:only="react"` React island 單次無頭截圖可能因水合未完成而停留在 loading skeleton，非程式碼缺陷。**已知限制 2**：Astro 圖片優化端點首次請求需要建置時間，截圖空白時先 `curl` 預熱該端點再重新截圖。**已知限制 3**：`--dump-dom` 對本機 preview 伺服器曾多次回傳空白，改用 `--screenshot` 全頁截圖。**已知限制 4**：全頁截圖中圖片區塊偶發純黑色空白且與視窗高度設定有關，與已知限制 2 不同（curl 預熱無法解決），此現象在完全未修改的既有頁面上同樣會出現，屬工具限制非迴歸。**單純的 `--screenshot` 無法驗證按鈕點擊等互動行為**——第 17 階段驗證新互動元件的三種模式切換時，改用 Chrome DevTools Protocol（CDP，`--remote-debugging-port` + Node `WebSocket` 連線，用 `Runtime.evaluate` 呼叫 `.click()` 後 `Page.captureScreenshot`）直接驅動點擊並截圖佐證，比單張截圖更能證明互動功能真正運作；驗證完成後需確認 CDP 驅動用的額外 Edge 行程（監聽 `--remote-debugging-port` 指定的埠）也一併關閉，不只是 `npm run preview` 本身。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：凡使用 Subagent-Driven Development 建置新章節，一律先建立獨立 git worktree（優先使用原生 `EnterWorktree` 工具），不再詢問 main vs worktree。**注意**：Agent 工具（派 subagent）本身也有 `isolation: "worktree"` 參數，但在 SDD 流程中所有 Task 的 implementer/reviewer 都應共用同一個技能層級建立的 worktree，**不可**額外對個別 subagent 派工加上 `isolation: "worktree"` 參數（第 16 階段 Task 1 首次派工時誤用過一次，已即時用 `TaskStop` 終止並確認無殘留才重派）。
