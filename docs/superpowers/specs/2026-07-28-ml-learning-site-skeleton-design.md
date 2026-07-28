# 機器學習互動學習網站 — 骨架 + Pilot 章節 設計文件

日期：2026-07-28
子專案：網站骨架 + Multiple Linear Regression（多元線性回歸）示範章節

## 1. 專案背景與範圍拆分

整體目標：建立一個互動式機器學習學習網站，涵蓋 `dir.txt` 列出的章節（機器學習介紹、CRISP-DM、
Linear/Polynomial/Logistic Regression、SVM、Decision Tree、Naive Bayes、K-Means、Ensemble Model、
Clustering、神經網路），從入門到進階，內容含簡介、分類方式、數學原理、範例、摘要資訊圖表、互動演示。

因涵蓋章節多、每章互動需求不輕，決定拆成多個子專案：

1. **本子專案**：網站骨架 + 一個 pilot 章節（Multiple Linear Regression），驗證架構、範本、互動元件、
   資料集載入流程。
2. **後續子專案**：沿用本子專案驗證過的範本，逐一填入其餘章節內容。dir.txt 的章節順序尚未定案，
   由獨立設定檔管理，不寫死在頁面範本或導覽元件中。

## 2. 全站互動需求（技術選型時已納入考量）

- 2D / 3D 散布圖（原始樣本分布）
- 分類邊界視覺化（線性 decision boundary、SVM 的面/超平面等）
- 常見公開資料集切換（鳶尾花、50 Startups、Boston Housing 等，白名單制，不開放使用者上傳）
- 每章節的摘要資訊圖表（infographic 性質，非即時運算）
- 數學公式呈現（LaTeX 語法）
- K-Means、Clustering、神經網路可能需要「逐步迭代動畫」（訓練過程視覺化）

**設計原則（開發者明確要求）**：每個章節的互動元件是「預先設計好的展示」，不是開放式自由調參工具。
資料集白名單、樣本數固定或分段選擇、參數組合為預設選項而非自由輸入。教學目的清楚展示概念優先於自由探索。

## 3. 技術棧

| 項目 | 選擇 | 理由 |
|---|---|---|
| 網站框架 | Astro | 內容（文字/數學）用 Markdown/MDX 靜態渲染；互動圖表用 island 元件按需載入 JS；內容與互動分離清楚，非互動頁面載入快 |
| 互動元件 | React（作為 Astro island） | 開發者已熟悉的生態，元件化管理圖表狀態 |
| 圖表庫 | Plotly.js | 2D/3D 散布圖、回歸面/分類邊界、旋轉縮放皆內建，3D 需求集中在少數章節（Multiple Linear Regression、K-Means/Clustering，進階可選 SVM 核技巧、神經網路 loss surface） |
| 數學公式 | KaTeX | 渲染快、LaTeX 語法、Astro 整合方案成熟 |
| 演算法運算 | 前端 JS/TS 自行實作（本 pilot 為 OLS 常態方程式） | 維持純靜態部署；不採用 Python 後端或 Pyodide（避免伺服器維運或首次載入過重） |
| 部署 | GitHub Pages | 免費、純靜態，已確認足以支援所有 2D/3D 前端運算+渲染需求 |
| 內容語言 | 繁體中文單語 | 依 dir.txt 現況，不同步維護英文版 |
| 視覺風格 | 深色科技風（Dark Tech） | 深底、青綠/紫色系重點色，資料科學/coding 氛圍；經三選一視覺比較後選定 |
| 設計品味調整 | 第三方 skill `taste-skill`（已安裝於本專案 `.agents/skills/`），實作階段套用主 skill `design-taste-frontend`（v2） | 開發者要求在實作時用專門 skill 調整排版/動效/間距的設計品味，避免樣板感 UI |

## 4. 章節頁面範本

每個演算法章節頁面固定包含以下區塊：

1. **簡介** — 這個演算法是什麼、解決什麼問題
2. **分類方式** — 監督式/非監督式、迴歸/分類等定位標籤
3. **數學原理** — 公式推導（KaTeX 渲染）
4. **運用範例** — 真實情境舉例
5. **學習摘要資訊圖表** — 重點整理（非即時運算）
6. **互動式操作與演示** — Plotly.js 圖表 + 預設參數組合切換

### 摘要資訊圖表 — 待確認事項

開發者提供了兩張參考圖（`pic/Bayes.png`、`pic/CRISPDM.png`），資訊密度遠高於原本預期
（含公式卡、流程步驟卡、EDA 圖表、統計數值、決策規則等密集排版），但為白底傳統資訊圖表配色，
與本站深色科技風不一致。

**決議**：pilot 階段先做簡化版摘要區塊（重點公式卡 + 關鍵統計數字），不追求兩張參考圖的密度。
待 pilot 示範網頁完成、開發者實際看過效果後，再決定摘要區塊是否要往參考圖的資訊密度/結構靠攏
（若靠攏，需重新以深色主題排版實作，而非直接嵌入原始 PNG）。

## 5. 網站結構

```
src/
  content/
    chapters/
      multiple-linear-regression.md   ← 章節文字內容（簡介/分類方式/數學原理/範例）
  data/
    50-startups.json                  ← 靜態打包的資料集
  components/
    charts/
      RegressionScatter3D.tsx         ← React island：3D 散布圖 + 回歸面，含特徵組合切換
    ChapterSummaryCard.tsx            ← 摘要資訊圖表元件（簡化版）
  config/
    chapters.ts                       ← 章節清單與順序設定（集中管理排序，方便後續調整 dir.txt 順序）
  pages/
    chapters/[slug].astro             ← 章節頁面範本，讀取 content + 對應互動元件
```

## 6. Pilot 章節規格：Multiple Linear Regression

- **資料集**：50 Startups（靜態 JSON，打包進站台，白名單制，不開放使用者上傳）
- **互動圖表**：3D 散布圖 + 回歸平面（Plotly.js）
- **可調範圍**：從 2-3 組預設特徵組合中切換（例如「R&D Spend + Marketing Spend」
  「R&D Spend + Administration」），非自由選特徵、非自由調參
- **運算方式**：前端 TS 實作 OLS 常態方程式（Normal Equation），選中特徵組合後即時算出回歸平面係數
- **摘要資訊圖表**：簡化版，重點公式卡 + 關鍵統計數字（見第 4 節待確認事項）
- **數學原理區塊**：多元線性回歸公式、最小平方法推導（KaTeX）

## 7. 部署與版控

- 部署：GitHub Pages（純靜態），確認足以支援所有 3D 互動需求
- 版控：已初始化 git repository，遠端倉庫為 https://github.com/jamessun0919-ops/Machine-Learning-Study
  （`main` 分支）。`.agents/`、`.claude/`（taste-skill 本機安裝）排除在版控外，保留 `skills-lock.json`
  供其他機器重新安裝

## 8. 明確排除範圍（YAGNI）

- 不做使用者帳號/進度追蹤/測驗小遊戲等功能（開發者未提出需求）
- 不做自由資料上傳或自由調參的通用互動工具
- 不做中英雙語同步維護
- 不採用 Python 後端或 Pyodide 運算方案
