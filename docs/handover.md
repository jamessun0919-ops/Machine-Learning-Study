# 交接文件 Handover

> 最後更新：2026-07-31（第 16 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression`、`機器學習介紹`、`CRISP-DM 資料分析方法` 四個章節，皆已上線。

## 已完成進度 (Completed)

- **（第 15 階段）CRISP-DM 章節完成規劃**：確立本站第三種章節範本（方法論／流程類：簡介／核心流程／常見誤區／學習摘要圖表，無案例分析、無互動元件）。設計文件與實作計畫（3 個 Task）皆已撰寫、核准、提交。
- **（第 16 階段）CRISP-DM 章節完整實作並上線**：依已核准計畫，用 Subagent-Driven Development（獨立 worktree）依序完成 3 個 Task：
  1. 章節內文（簡介／CRISP-DM 六大階段／常見誤區）與 `curriculum.ts`/`chapters.ts`/`curriculum.test.ts` 串接。
  2. 全新 Excalidraw 風格學習摘要資訊圖表，含本站首個「六階段循環圖」視覺元件（六邊形環繞中央「Data」節點，主流程箭頭依序 1→2→3→4→5→6→1，另有一條視覺上明顯區隔的橘紅色回饋箭頭）。
  3. 全站最終驗證（測試/astro check/build/瀏覽器實測知識地圖與既有章節無迴歸）。
- 最終整體審查（Ready to merge: with fixes）發現 2 項 Important 已修正並複審通過：(1) 循環圖箭頭原本被不透明節點方塊完全遮擋、不可見——已改為繪製前依方向向量縮短線段，使箭頭落在方塊間隙；(2) 渲染腳本 `render-crisp-dm-infographic.ps1` 路徑原寫死指向本次暫用的 worktree（合併後即不存在）——已改回與既有兩支渲染腳本一致的主倉庫路徑慣例，並用「複製到主 checkout 渲染、複製回 worktree、清除暫存」的可逆方式重新產出圖片，未污染任一方 git 狀態。
- 已本機 merge 回 `main`（fast-forward）、清理 worktree 與已合併分支、`git push origin main` 成功，觸發 GitHub Pages 部署，CRISP-DM 章節正式上線。
- 全部測試通過（20/20）、`astro check`（0 錯誤/0 警告）、`npm run build`（**5 個頁面**成功產出，含新的 `/chapters/crisp-dm/`）。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。CRISP-DM 章節已完整上線，本階段收尾完成。

## 下一步行動 (Next Steps)

1. **`docs/specs/chapter_template_guide.md` 尚未新增「方法論／流程類」章節範本的說明章節**：目前此範本（簡介／核心流程／常見誤區／學習摘要圖表，無案例分析、無互動元件）僅記錄於設計文件 `docs/superpowers/specs/2026-07-31-crisp-dm-chapter-design.md`，最終整體審查建議補進 `chapter_template_guide.md`（比照第 13 階段其他規則新增的方式），供未來同類主題（如訓練/測試切分與交叉驗證等）建置時參考。此為文件層級的共用規範異動，開工時應先與開發者確認範圍再處理，不可逕自修改。
2. **`curriculum.ts` 中 Multiple Linear Regression↔Logistic Regression 的 `relatedTo` 目前僅單向標註**（僅 Logistic Regression 側有欄位，MLR 自己沒有），第 13 階段最終審查建議補上雙向標註；仍待安排。
3. **其餘 4 組跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means。規則與對照表已記錄於 `docs/specs/chapter_template_guide.md` 1.1 節。
4. **下一個章節規劃**：依 `docs/config/curriculum.ts` 順序，候選為「特徵工程與標準化」等階段二主題，開工時需與開發者確認優先順序，並依 `brainstorming` 技能重新走一輪需求確認（CRISP-DM 建立的「方法論／流程類」範本可供參考，但個別章節內容仍需逐一確認，不可預設套用）。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`（schema 見 `src/content.config.ts`，`summary`／`interactiveComponent` 皆為 optional）。目前 `chapterOrder` 鏈結順序：`machine-learning-introduction → crisp-dm → simple-linear-regression → multiple-linear-regression`。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，`relatedTo` 欄位標註跨主題關聯（**注意：目前部分關聯僅單向標註**，例如 Logistic Regression→Multiple Linear Regression，新增主題或關聯時留意方向性）。
- **跨章節關聯段落規則**：`docs/specs/chapter_template_guide.md` 1.1 節，5 組待處理關聯已列表記錄在該節。
- **三套章節範本**：(1) 導覽類（機器學習介紹：分類／應用場景／常見誤區／知識地圖）；(2) 演算法類（Simple/Multiple Linear Regression：九大區塊含案例分析與互動元件）；(3) **方法論／流程類（CRISP-DM：簡介／核心流程／常見誤區／學習摘要圖表，無案例分析、無互動元件）**——第三套範本目前僅記錄於 CRISP-DM 設計文件，尚未同步進 `chapter_template_guide.md`（見下一步行動第 1 項）。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**，開工時不再詢問。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`，新資產 HTML 以 `<script src="rough-engine.js"></script>` 引入。每個資產各自的渲染腳本（`scripts/render-*.ps1`）為一次性、**路徑寫死指向主倉庫 checkout**（例如 `C:/Users/User/Desktop/Machine Learning Study/...`，不含 worktree 路徑片段）的獨立檔案，非通用工具——**在 worktree 內開發時若需重新渲染，須用「複製資產到主 checkout 渲染、複製輸出回 worktree、清除主 checkout 暫存檔」的可逆方式，維持腳本提交後路徑指向合併後才會存在的主倉庫，而非開發當下暫用的 worktree**（第 12、16 階段皆遇到並用此法解決）。規則詳見 `docs/specs/chapter_template_guide.md` 第 5 節。
- **Canvas 疊層繪製注意事項**：若在 rough.js 資訊圖表內用 `<canvas>` 繪製連接線／箭頭，且線的端點會與其他不透明 HTML 元素（例如卡片、節點方塊）重疊，箭頭若畫在元素的視覺邊界內會被該元素完全遮擋而不可見（第 16 階段 CRISP-DM 六階段循環圖遇到此問題）。繪製前應依方向向量縮短線段長度，讓端點（含箭頭）落在元素之間的視覺間隙，而非直接用元素中心座標繪製到底。
- **Excalidraw 資產渲染的視窗高度校正法**：`.page` 容器高度應貼合實際內容。優先方法是 DOM 量測法（暫存複本注入量測腳本，`window.onload` 後讀取 `getBoundingClientRect().height` 寫入 `document.title`，用無頭 Edge `--dump-dom` 讀出）。**但此法並非絕對可靠**：第 16 階段曾遇到量測環境（未加 `--force-device-scale-factor`）與正式渲染環境不一致，導致量出的高度／寬度與預期不符；若量測結果出現任何自相矛盾的訊號（例如量出的寬度與 CSS 指定值不符），依 CLAUDE.md 規則不可直接採信盲目重跑，改用「直接對渲染輸出 PNG 做像素分析（掃描紙張色與外框背景色的交界列、檢查邊緣有無捲軸色）＋二分搜尋候選視窗高度」的替代驗證法，以實際渲染結果而非量測公式作為判斷依據。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`；`npm run preview` 為背景 node 行程，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止，並再次 `netstat` 確認無殘留 LISTENING 項目。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容，reload 無效。**
- **Worktree 清理注意事項**：若刪除 worktree 目錄失敗（檔案被鎖定），先檢查是否有本次 session 內遺留、忘記關閉的 `astro preview`/`astro dev` 行程佔用該 worktree 內的檔案（用 `netstat -ano` 找出監聽埠對應 PID，`Get-CimInstance Win32_Process -Filter "ProcessId=<pid>"` 確認其 `CommandLine` 是否指向該 worktree 路徑），確認後關閉再重試刪除。**若合併回主分支後 `npm run test` 顯示的測試數量翻倍**（例如 20 變 40），這是已知問題（vitest 不讀 `.gitignore`，殘留的 worktree 目錄內同一份程式碼的測試被重複執行一次），並非新缺陷；清除 worktree 後即恢復正常，第 5、16 階段皆遇到並確認同一根因。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用既有的無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`）。**已知限制 1**：`client:only="react"` 的 React island 在單次無頭截圖中可能因非同步水合尚未完成而停留在 loading skeleton，非程式碼缺陷。**已知限制 2**：圖片優化端點（Astro `_image`/`_astro/*.webp`）首次請求需要建置時間，若截圖顯示圖片區塊空白，先 `curl` 預熱該端點再重新截圖。**已知限制 3**：`--dump-dom` 對本機 preview 伺服器曾多次回傳空白，原因不明但與程式碼變更無關，改用已驗證可行的 `--screenshot` 全頁截圖驗證。**已知限制 4（第 16 階段新增）**：全頁截圖中圖片區塊偶發純黑色空白，且與視窗高度設定有關（某些視窗高度下正常、某些下空白），與已知限制 2 不同（curl 預熱無法解決）；此現象在完全未修改的既有頁面上同樣會出現，屬無頭 Edge 截圖工具對頁內圖片解碼時序的既有限制，非程式碼缺陷或迴歸。排查方式：對既有未變更頁面做相同交叉測試、或直接對圖片 URL 截圖驗證檔案本身正確性，若兩者皆正常即可排除程式碼問題。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：自第 16 階段起，凡使用 Subagent-Driven Development 建置新章節，一律先建立獨立 git worktree（優先使用原生 `EnterWorktree` 工具），不再詢問 main vs worktree。**注意**：Agent 工具（派 subagent）本身也有 `isolation: "worktree"` 參數，但在 SDD 流程中所有 Task 的 implementer/reviewer 都應共用同一個技能層級建立的 worktree，**不可**額外對個別 subagent 派工加上 `isolation: "worktree"` 參數（會建立衝突的獨立暫時 worktree），第 16 階段 Task 1 首次派工時誤用過一次，已即時用 `TaskStop` 終止並確認無殘留才重派，之後全程未再誤用。
