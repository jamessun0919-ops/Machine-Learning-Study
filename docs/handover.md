# 交接文件 Handover

> 最後更新：2026-07-30（第 10 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`Multiple Linear Regression`、`Simple Linear Regression` 兩章節，且第 6~9 階段全部累積成果已 commit + push 至 `origin/main`（commit `58c6e67`）。

## 已完成進度 (Completed)

- **環境問題排除**：診斷並解決 `npm run test` 全面失敗問題。根因為上次收工未正常關閉的殘留 Astro dev server（`npm run dev`／`astro dev` 行程）鎖住 `node_modules` 內 `@astrojs/compiler-binding-win32-x64-msvc` 原生二進位檔，導致安裝損毀。關閉殘留行程 + `npm ci` 重裝後恢復正常。
- **三項驗證全數通過**：`npm run test`（15/15）、`npx astro check`（0 errors/0 warnings）、`npm run build`（3 頁成功建置）。
- **完成 commit + push**：第 6~9 階段的新章節內容/元件、資訊圖表規範文件、渲染腳本、CLAUDE.md 規則更新，皆已推送至 `origin/main`（commit `58c6e67`）。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。本階段以記錄下階段工作項目收工，尚未開始實際開發。

## 下一步行動 (Next Steps)

1. **補齊「機器學習介紹」章節**（`dir.txt` 第一階段課程導覽，非演算法章節）：與開發者討論非演算法章節（純內容、不須操作展示）的內容項目規劃，作為此類章節的範例模板，供後續「CRISP-DM」等其他非演算法章節參考。
2. **調整 `simple-linear-regression` 章節互動內容**：
   - 現有 2D 散布圖不適合用滑鼠拖曳移動資料點，改為在資料表格內點擊列來移動對應的點。
   - 新增其他互動操作（細節待開工時與開發者討論）。
   - 提醒：後續每個演算法章節的互動內容都可能需要微調，開工時需逐一與開發者討論確認，不可預設沿用既有模式。
3. 兩項工作皆屬於「有多種合理實作方式」的規劃型任務，依 CLAUDE.md 規則，開工時應先與開發者確認方案架構與內容項目，再進行程式碼編寫。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js Regular/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug` 前後章連結；內容本體在 `src/content/chapters/*.md`（Content Layer schema 見 `src/content.config.ts`）。
- **資訊圖表規則**：每個新章節開工時都要重新詢問開發者風格要用 Excalidraw 手繪風格還是白底向量風格，不可預設沿用上一章節；規則細節見 `docs/specs/chapter_template_guide.md` 第 5 節。
- **Astro dev server 關閉方法**：使用 `astro dev stop`（Bash 環境需用 `npx astro dev stop`），或以 `astro dev status` 確認伺服器狀態。收工前務必確認 Agent 自己啟動的 dev server 已關閉，避免殘留鎖住 `node_modules` 導致下次 `npm ci`/測試失敗（本階段即發生此問題）。
- **CLAUDE.md 規則異動**：本階段生效的規則變更（開工模型自我介紹、錯誤處理規則擴充涵蓋「Agent 自行執行時的非預期失敗」）為開發者本人手動編輯，非 Agent 產出。
- **對話語言**：與開發者對話一律使用繁體中文。
