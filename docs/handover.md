# 交接文件 Handover

> 最後更新：2026-07-30（第 9 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前網站骨架與 `Multiple Linear Regression`、`Simple Linear Regression` 兩章節內容/元件已開發完成，且已修復圖表邊框壓字問題，但尚未 commit/push。

## 已完成進度 (Completed)

- **壓字模糊問題修復**：修改了 `simple-linear-regression` 的 Excalidraw 風格圖表 HTML 排版，將黑板容器 padding 左右擴展至 `40px`、標題字型大小調降為 `23px`。
- **原始碼與輔助指令腳本留存**：
  - 排版用 HTML 原始碼已儲存至專案庫：`docs/specs/assets-src/simple-linear-regression-summary.html`
  - 新增 PowerShell 輔助渲染指令腳本：`scripts/render-infographic.ps1`（全 ASCII 英文，防止中文 Big5 編碼解析出錯）
- **圖檔手動渲染更新**：開發者已順利執行 `.\scripts\render-infographic.ps1` 渲染出最新的 PNG 圖檔，覆蓋並更新了 `src/assets/chapters/simple-linear-regression-summary.png`。
- **定位 IDE 執行器故障成因**：確認本次連線中 Agent 指令執行器失效為 Windows API 在 `NUL` ACL 寫入時被系統或防護軟體攔截拒絕存取（`Access is denied`）所致。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

- **IDE 連線環境限制**：Agent 在本次 Session 中因安全沙盒 `NUL` 權限阻擋而無法執行本機任何命令。開發者指示關閉本階段以重啟 IDE。
- **尚未 commit/push**：第 6、7、8、9 階段的所有程式碼、圖片與腳本變更均保留在 working directory。

## 下一步行動 (Next Steps)

1.  **驗證 Agent 命令工具修復狀態**：重啟 IDE 進入新 Session 後，首要任務是測試 `run_command` 是否已回復正常（例如執行簡單的 `git status`）。
2.  **執行專案驗證**：若 Agent 指令功能恢復，執行 `npm run test`、`npx astro check` 與 `npm run build` 確認程式碼及更新後的圖檔皆無建置錯誤。
3.  **分支提交與推送**：確認無誤後，將累積的所有變更一併 commit 並 push 至 `origin/main` 倉庫。
4.  **規劃下一章節**：開始下一個章節（例如 `Polynomial Regression`），並在**開工時向開發者詢問該章節資訊圖表要使用 Excalidraw 風格還是白底向量風格**。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js Regular/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **圖檔渲染規則**：`simple-linear-regression-summary.png` 源檔以 3x DPI 保留高清晰度（Astro build 會自動優化為 688KB webp）。未來若需重新渲染，可執行 `.\scripts\render-infographic.ps1`。
- **Astro dev server 關閉方法**：使用 `astro dev stop`，或以 `astro dev status` 確認伺服器狀態。
- **對話語言**：與開發者對話一律使用繁體中文。
