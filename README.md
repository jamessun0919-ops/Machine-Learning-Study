# 機器學習互動學習網站

## 🌐 DEMO

[**點此進入網站**](https://jamessun0919-ops.github.io/Machine-Learning-Study/)

## 🎯 專案目標

建立一個互動式機器學習學習網站，從入門到進階涵蓋機器學習核心課程，透過可操作的圖表與範例演示幫助理解演算法原理，純靜態部署於 GitHub Pages。

## 🗺️ 計畫架構

課程規劃共八個階段（詳見 [`dir.txt`](dir.txt)）：

| 階段 | 主題 |
| :--- | :--- |
| 一 | 課程導覽（機器學習介紹、CRISP-DM 資料分析方法） |
| 二 | 方法論基礎（特徵工程與標準化、訓練/測試切分與交叉驗證、過擬合/欠擬合與偏差-變異數權衡） |
| 三 | 監督式學習－迴歸（Linear／Polynomial／Ridge／Lasso Regression、Logistic Regression） |
| 四 | 監督式學習－分類（KNN、Naive Bayes、SVM、Decision Tree） |
| 五 | 集成方法（Bagging／Boosting） |
| 六 | 非監督式學習（PCA、K-Means、Hierarchical Clustering、DBSCAN） |
| 七 | 神經網路 |
| 八 | 模型解釋 |

每個章節頁面採固定九區塊結構：簡介、分類方式、數學原理、運用範例、適用情境與限制、評估指標、常見誤區、學習摘要資訊圖表、互動式操作與演示。

**技術棧**：Astro（Content Layer API）＋ React（互動元件 island）＋ TypeScript ＋ Plotly.js（互動圖表）＋ KaTeX（數學公式）＋ Vitest（測試）＋ GitHub Pages（純靜態部署，無後端）

## ✅ 已完成進度

- 網站骨架：深色科技風主題、章節導覽列、章節頁面模板、首頁章節列表
- 第一個示範章節：**Multiple Linear Regression（多元線性回歸）**
  - 常態方程式（Normal Equation）數學原理與程式實作（TDD）
  - 3D 迴歸散點圖／擬合平面互動圖表（自訂旋轉控制、三組特徵組合切換）
  - 學習摘要資訊圖表（生成圖片，概念與案例分析分區呈現）
  - 章節內快速跳轉導覽
- GitHub Pages 自動部署（GitHub Actions，push 到 `main` 即自動建置上線）

## 🚧 未完成事項

- `dir.txt` 其餘七個階段、共約 20 個章節主題尚未開發
- 學習摘要資訊圖表目前為手動執行腳本 + 截圖產生流程，尚未正式化為專案內建 npm script
- 測驗題目功能：明確不做成網頁功能，由開發者另行以口頭/紙本測試
