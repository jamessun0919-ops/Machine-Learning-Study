# 交接文件 Handover

> 最後更新：2026-07-31（第 15 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression`、`機器學習介紹` 三章節；第 4 個章節「CRISP-DM 資料分析方法」已完成規劃（設計文件＋實作計畫），**尚未執行**。

## 已完成進度 (Completed)

- **（第 13 階段）移除「機器學習介紹」章節的概念關聯圖片**：改由既有的 8 階段互動連結（`CourseKnowledgeMap.tsx` 內建「相關：」連結）承載關聯資訊，相關 schema 欄位、渲染程式碼、資產檔皆一併刪除。`multiple-linear-regression.md` 簡介新增與 Logistic Regression 關聯的段落；`chapter_template_guide.md` 新增 1.1 節跨章節關聯規則與對照表。
- **（第 14 階段）`simple-linear-regression` 2D 散布圖互動調整**：取消 Plotly 預設的圖表點擊效果，只保留特徵切換按鈕；新增 X／Y 軸對應數值說明。「多元線性回歸」學習摘要圖表改為 Excalidraw 風格，案例分析採用真實計算的 3 特徵迴歸數據。
- **（第 15 階段）CRISP-DM 章節完成規劃，尚未實作**：確立本站第三種章節範本（方法論／流程類：簡介／核心流程／常見誤區／學習摘要圖表，無案例分析、無互動元件）。設計文件（`docs/superpowers/specs/2026-07-31-crisp-dm-chapter-design.md`）與實作計畫（`docs/superpowers/plans/2026-07-31-crisp-dm-chapter.md`，3 個 Task）皆已撰寫、與開發者逐段確認、提交 git。開發者確認執行方式採 Subagent-Driven Development，但指示本階段到此結束，**留待下階段執行**。
- 全部測試通過（20/20）、`astro check`（0 錯誤/0 警告）、`npm run build`（4 頁面成功產出，CRISP-DM 尚未建置故仍是 4 頁）。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞，純進度安排。CRISP-DM 章節的設計與計畫皆已核准完畢，是「待執行」而非「待決策」的狀態。

## 下一步行動 (Next Steps)

1. **【下階段開工第一件事】依已核准的實作計畫執行 CRISP-DM 章節建置**：`docs/superpowers/plans/2026-07-31-crisp-dm-chapter.md`（3 個 Task：章節內文與課程資料串接、Excalidraw 學習摘要圖表含新的六階段循環圖視覺元件、全站最終驗證）。開發者已確認採用 **Subagent-Driven Development，且需先建立獨立 git worktree**（不再詢問 main vs worktree）。計畫本身已規劃好一項容易遺漏的細節：`curriculum.test.ts` 有一項「恰好三個已建置章節」的斷言需要同步更新為四個，已排入 Task 1。
2. **`curriculum.ts` 中 Multiple Linear Regression↔Logistic Regression 的 `relatedTo` 目前僅單向標註**（僅 Logistic Regression 側有欄位，MLR 自己沒有）。第 13 階段最終審查建議補上雙向標註；仍待安排，非本次 CRISP-DM 計畫範圍。
3. **其餘 4 組跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means。規則與對照表已記錄於 `docs/specs/chapter_template_guide.md` 1.1 節。
4. **CRISP-DM 之後的下一個章節規劃**：依 `docs/config/curriculum.ts` 順序，候選為「特徵工程與標準化」等階段二主題，開工時需與開發者確認優先順序，並依 `brainstorming` 技能重新走一輪需求確認（CRISP-DM 建立的「方法論／流程類」範本可供參考，但個別章節內容仍需逐一確認，不可預設套用）。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`（schema 見 `src/content.config.ts`，`summary` 為 optional；`conceptMapImage` 欄位已於第 13 階段移除，不再存在於 schema）。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，匯出 `curriculum`/`allTopics`/`findTopicByName`/`CurriculumTopic`/`CurriculumParadigm` 型別，供 `CourseKnowledgeMap.tsx` 使用；`relatedTo` 欄位標註跨主題關聯（**注意：目前部分關聯僅單向標註**，例如 Logistic Regression→Multiple Linear Regression，新增主題或關聯時留意方向性）。
- **跨章節關聯段落規則**：`docs/specs/chapter_template_guide.md` 1.1 節——若該主題在 `curriculum.ts` 中設有 `relatedTo`，或被其他主題的 `relatedTo` 指向，「簡介」段落須針對每個關聯主題各補一段獨立段落（格式：「**與 {主題} 的關係**：{一句核心比喻}。{1-2 句延伸說明}。」）。對應頁面尚未建置時暫不處理。5 組待處理關聯已列表記錄在該節。
- **非演算法章節範本**：5 區塊——簡介／機器學習的分類／典型應用場景／常見誤區／全課程知識地圖，取代演算法章節的九大區塊範本，供後續 CRISP-DM 等同類章節參考；但個別章節內容仍需逐一與開發者確認，不可預設套用。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**（`simple-linear-regression-summary.png`、`multiple-linear-regression-summary.png` 皆已採用），開工時不再詢問。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`，新資產 HTML 以 `<script src="rough-engine.js"></script>` 引入，不要逐檔複製整段引擎程式碼。每個資產各自的渲染腳本（`scripts/render-*.ps1`）為一次性、路徑寫死的獨立檔案，非通用工具。規則詳見 `docs/specs/chapter_template_guide.md` 第 5 節。
- **Excalidraw 資產渲染的視窗高度校正法**：`.page` 容器高度應貼合實際內容（不用 `min-height:297mm`）。若渲染出現捲軸殘留或留白過多，不要憑猜測反覆調整 `--window-size`，改用精確量測：對 HTML 暫存複本注入一段小 script，於 `window.onload` 後將 `document.getElementById('page').getBoundingClientRect().height` 寫入 `document.title`，再用無頭 Edge `--dump-dom` 讀出精確像素值校正渲染腳本的 `--window-size` 高度（第 14 階段用此法一次校正成功，範例見該階段 chatlog）。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`（Bash 環境需用 `npx astro dev stop`），或以 `astro dev status` 確認狀態；`npm run preview` 為背景 node 行程，`TaskStop` 未必能確實終止，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止，並再次 `netstat` 確認無殘留 LISTENING 項目。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容，reload 無效。** 收工前務必確認 Agent 自己啟動的 server 已關閉。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用既有的無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`）。**已知限制 1**：`client:only="react"` 的 React island（例如 `CourseKnowledgeMap`、互動式回歸圖表）在單次無頭截圖中可能因非同步水合尚未完成而停留在 loading skeleton，即使該元件實際運作正常；此為工具時序限制，非程式碼缺陷（第 12、13 階段皆遇到）。遇到此情況時依 CLAUDE.md 規則列出可能原因與開發者討論，必要時改用開發者本機手動瀏覽器確認。**已知限制 2**：圖片優化端點（Astro `_image`/`_astro/*.webp`）首次請求需要建置時間，若截圖顯示圖片區塊空白，先 `curl` 預熱該端點再重新截圖，不要誤判為程式碼缺陷。**已知限制 3**：`--dump-dom` 對本機 preview 伺服器曾連續多次回傳空白（第 14 階段遇到），原因不明但與程式碼變更無關；此時不要在同一方法上反覆試錯，改用已驗證可行的 `--screenshot` 全頁截圖驗證。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：第 10-15 階段皆直接在 `main` 分支進行（第 14 階段為小型內容/樣式調整未使用 SDD；第 15 階段純規劃、未執行任何程式碼變更）。**開發者已指示：日後若使用 Subagent-Driven Development 建置新章節，需改用獨立 git worktree**，執行 `subagent-driven-development`/`using-git-worktrees` 技能時應預設建立 worktree，不需再次詢問——**CRISP-DM 章節的實作計畫是第一個會實際套用此規則的案例**，下階段開工時務必先建立 worktree 再開始派工。
