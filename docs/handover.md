# 交接文件 Handover

> 最後更新：2026-07-31（第 13 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression`、`機器學習介紹` 三章節。

## 已完成進度 (Completed)

- **移除「機器學習介紹」章節的概念關聯圖片**：原本展示效果不佳的 Excalidraw 手繪風格概念關聯圖片（`ml-curriculum-concept-map.png`，展示 6 組演算法關聯）已完全移除，改由既有的 8 階段互動連結（`CourseKnowledgeMap.tsx` 內建「相關：」連結）承載關聯資訊。相關 schema 欄位（`conceptMapImage`）、`[slug].astro` 渲染區塊、`.knowledge-map__concept-image` CSS、PNG、原始 HTML 資產檔、渲染腳本皆一併刪除，無孤兒殘留。
- **跨章節關聯文字化**：`multiple-linear-regression.md` 簡介段落新增與 Logistic Regression 關聯的獨立段落（含 KaTeX 行內公式，瀏覽器實測渲染正確）。`docs/specs/chapter_template_guide.md` 新增 1.1 節「跨章節關聯段落」規則與 5 組關聯對照表（Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means、Logistic Regression↔Multiple Linear Regression），供未來對應章節建置時參考使用。
- **依 Subagent-Driven Development 執行 5 個 Task**，每個 Task 皆經任務審查（spec + 品質）通過，最終整體審查（Opus）判定 Ready to merge with fixes：發現 1 項 Important（跨章節關聯規則字面條件對唯一實作範例本身不成立，因 `curriculum.ts` 該關聯僅單向標註）+ 3 項 Minor（對照表計數與出處文字、Markdown 表格空行、內文誇大連結可點擊性），皆已修正並複審確認無新增問題。
- 知識地圖 8 階段清單畫面經開發者親自本機瀏覽器確認渲染正確（無頭 Edge 對 `client:only` React island 水合狀態的自動化截圖驗證有已知工具限制，詳見下方「關鍵設定」）。
- 全部測試通過（20/20）、`astro check`（0 錯誤/0 警告）、`npm run build`（4 頁面成功產出）。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。本階段工作已完成並通過最終審查（含 fix wave 複審），待收工流程（本文件、worklog、chatlog 已生成 + push）完成後即可視為結案。

## 下一步行動 (Next Steps)

1. **下一階段起改用獨立 git worktree 執行 subagent-driven-development**（開發者已於本階段明確指示，已記錄至 Claude 記憶系統，開工時不需再次詢問 main vs worktree）。
2. **`curriculum.ts` 中 Multiple Linear Regression↔Logistic Regression 的 `relatedTo` 目前僅單向標註**（僅 Logistic Regression 側有 `relatedTo: ['Multiple Linear Regression（多元線性回歸）']`，MLR 自己沒有對應欄位）。最終審查建議下階段補上雙向標註，讓知識地圖從 MLR 側也能顯示此關聯；本階段依計畫凍結範圍未處理，開工時可與開發者確認是否處理。
3. **其餘 4 組跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means。規則與對照表已記錄於 `docs/specs/chapter_template_guide.md` 1.1 節，建置對應章節時依規則在簡介段落補上關聯文字。
4. **交接文件中原第 10 階段記錄的另一項工作**：調整 `simple-linear-regression` 章節互動內容（2D 散布圖改為表格點擊列移動資料點 + 新增其他互動操作），仍待安排，開工時需與開發者另行討論方案。
5. **下一個章節規劃**：依 `docs/config/curriculum.ts` 順序，下一個候選章節為「CRISP-DM 資料分析方法」（階段一）或「特徵工程與標準化」等階段二主題，開工時需與開發者確認優先順序，並依 `brainstorming` 技能重新走一輪需求確認（不可預設沿用機器學習介紹章節的範本結構）。
6. ~~原留待處理的 3 項概念圖外觀類 Minor（PNG 底部色帶、箭頭 canvas 尺寸、paradigm 徽章配色）~~：已隨概念圖整體移除而失效，不再需要處理。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`（schema 見 `src/content.config.ts`，`summary` 為 optional；`conceptMapImage` 欄位本階段已移除，不再存在於 schema）。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段、展開到子項層級，匯出 `curriculum`/`allTopics`/`findTopicByName`/`CurriculumTopic`/`CurriculumParadigm` 型別，供 `CourseKnowledgeMap.tsx` 使用；`relatedTo` 欄位標註跨主題關聯（**注意：目前部分關聯僅單向標註**，例如 Logistic Regression→Multiple Linear Regression，新增主題或關聯時留意方向性）。
- **跨章節關聯段落規則**：`docs/specs/chapter_template_guide.md` 1.1 節——若該主題在 `curriculum.ts` 中設有 `relatedTo`，或被其他主題的 `relatedTo` 指向，「簡介」段落須針對每個關聯主題各補一段獨立段落（格式：「**與 {主題} 的關係**：{一句核心比喻}。{1-2 句延伸說明}。」）。對應頁面尚未建置時暫不處理。5 組待處理關聯已列表記錄在該節。
- **非演算法章節範本**：5 區塊——簡介／機器學習的分類／典型應用場景／常見誤區／全課程知識地圖，取代演算法章節的九大區塊範本，供後續 CRISP-DM 等同類章節參考；但個別章節內容仍需逐一與開發者確認，不可預設套用。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**，開工時不再詢問。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`，新資產 HTML 以 `<script src="rough-engine.js"></script>` 引入，不要逐檔複製整段引擎程式碼。規則詳見 `docs/specs/chapter_template_guide.md` 第 5 節（已移除對本階段刪除的 `ml-curriculum-concept-map.png` 之範例引用）。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`（Bash 環境需用 `npx astro dev stop`），或以 `astro dev status` 確認狀態；`npm run preview` 為背景 node 行程，`TaskStop` 未必能確實終止，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止，並再次 `netstat` 確認無殘留 LISTENING 項目。收工前務必確認 Agent 自己啟動的 server 已關閉。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用既有的無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`/`--dump-dom`）。**已知限制**：`client:only="react"` 的 React island（例如 `CourseKnowledgeMap`、互動式回歸圖表）在單次無頭截圖中可能因非同步水合（dynamic import + fetch + render）尚未完成而停留在 loading skeleton，即使該元件實際運作正常；此為工具時序限制，非程式碼缺陷（第 12、13 階段皆遇到同類現象）。遇到此情況時，依 CLAUDE.md 規則列出可能原因與開發者討論，不可自行猜測修改截圖手法反覆重跑；必要時改用開發者本機手動瀏覽器確認。圖片優化端點（Astro `_image`）首次請求需要建置時間，必要時先 `curl` 預熱該端點再截圖。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：第 10-13 階段皆直接在 `main` 分支執行 Subagent-Driven Development（無獨立 worktree）。**開發者已指示第 14 階段起改用獨立 git worktree**，執行 `subagent-driven-development`/`using-git-worktrees` 技能時應預設建立 worktree，不需再次詢問。
