# 設計方案：特徵工程與標準化 章節

> 日期：2026-08-01（第 17 個工作階段）

## 背景與問題

依 `curriculum.ts` 順序，階段二（方法論基礎）有 3 個候選主題，開發者選定「特徵工程與標準化」作為下一章節。開發者要求先確認範本方向：本站既有三種範本（導覽類、演算法類九大區塊、CRISP-DM 建立的方法論／流程類四大區塊）皆不適合——這個主題本質是「技巧/技術」，不是流程也不是要配適評估的演算法，因此建立第四種「技巧/技術類」章節範本。

## 範圍界定

「特徵工程與標準化」標題本身涵蓋範圍可以很廣（還包含特徵創造、對數轉換等），本次確認只涵蓋兩類最基礎常用的技巧：

1. 數值特徵**標準化/縮放**（Z-score、Min-Max）
2. 類別特徵**編碼**（One-Hot Encoding、Label Encoding）

不涉及特徵創造、對數轉換等其他特徵工程主題。

## 範本結構（本次確認，供未來同類技巧/技術主題參考）

6 個區塊：簡介／常見方法／適用情境與限制／常見誤區／學習摘要資訊圖表／互動式操作與演示。

與既有三種範本的差異：
- 有互動元件與數學公式（演算法範本才有），但無「數學原理」獨立區塊（公式併入「常見方法」）、無「運用範例」、無「評估指標」、無「案例分析」（沒有單一要配適/評估的模型）。
- 與方法論／流程類（CRISP-DM）的差異：CRISP-DM 完全靜態、無互動元件；本範本因主題本質是「技巧」（縮放前後效果最適合親眼比較），需要互動元件實際展示轉換效果。

## 章節內文

### 簡介

> 不同特徵的數值尺度差異，會讓某些機器學習演算法產生偏差判斷。例如「研發支出」（十萬美元級）與「行銷支出」（數十萬美元級）若直接輸入 KNN 或使用梯度下降訓練的模型，數值範圍較大的行銷支出會不成比例地主導距離計算或梯度更新，即使研發支出對預測更重要。特徵工程（Feature Engineering）泛指所有讓原始資料更適合模型學習的前處理技巧，本章聚焦其中最基礎、最常用的兩類：數值特徵的**標準化/縮放**，以及類別特徵的**編碼**。

### 常見方法

**數值特徵縮放：**
1. **Z-score 標準化**：$z=(x-\mu)/\sigma$，轉換後平均值為 0、標準差為 1，不限定範圍，仍保留離群值的相對位置。
2. **Min-Max 縮放**：$x'=(x-\min)/(\max-\min)$，轉換後固定落在 [0,1] 範圍，但對離群值敏感（一個極端值就能把其餘資料壓縮到很窄的一段）。

**類別變數編碼：**
1. **One-Hot Encoding**：把類別展開成多個 0/1 欄位（例如 State: New York/California/Florida → 3 個獨立欄位），不會誤導模型解讀類別間有大小關係，但類別數多時欄位數會暴增。
2. **Label Encoding**：把類別直接編成整數，欄位精簡，但只適合類別間**本身有順序**的情況，若用在無序類別會讓模型誤以為類別間存在大小/距離關係。

### 適用情境與限制

- **需要標準化的模型**：以「距離」或「梯度」為核心運算的模型（KNN、SVM、梯度下降訓練的迴歸/邏輯斯迴歸、神經網路、K-Means）。
- **不需要標準化的模型**：樹狀模型（Decision Tree、Random Forest、Boosting）以「切分點」而非距離運算，特徵尺度不影響判斷。
- **編碼選擇**：類別本身有序（如教育程度）適合 Label Encoding；類別間無序（如城市、顏色）應用 One-Hot Encoding。

### 常見誤區

- **用整個資料集（含測試集）一起計算標準化參數**：正確做法是只用訓練集算出縮放參數再套用到測試集，否則會造成 Data Leakage、評估結果過度樂觀。
- **對無序類別使用 Label Encoding**：模型會誤讀類別間的大小/距離關係。
- **忘記標準化就套用距離型演算法**：尺度大的特徵會不成比例主導距離計算，且不會報錯，容易被忽略。

## 互動元件規劃

新元件 `FeatureScalingComparison.tsx`：

- **資料**：沿用 `src/data/50-startups.json`，取 `rdSpend`（數十萬級）與 `marketingSpend`（數百萬級）兩欄，尺度差異懸殊，最適合展示標準化前後的對比。
- **視覺形式**：橫向點狀圖（Plotly `scatter`，`y` 為類別軸「R&D Spend」/「Marketing Spend」，`x` 為數值），50 筆資料點各自畫在對應的水平軸線上。
- **切換模式**：三個按鈕「原始值／Z-score 標準化／Min-Max 縮放」，切換時重新計算並重繪兩條軸線的資料點位置。
- **統計量顯示**：圖表下方顯示當前模式下兩個特徵各自的 mean/std/min/max（比照既有圖表的軸說明樣式，例如 `RegressionScatter3D.tsx` 的 `regression-chart__axis-legend`）。
- **互動限制**：比照第 14 階段確立的慣例，關閉 Plotly 內建拖曳縮放與圖例點擊切換（`dragmode: false`、`legend.itemclick/itemdoubleclick: false`），只保留模式切換按鈕。
- **新增函式庫** `src/lib/scaling.ts`（TDD，含 `scaling.test.ts`）：`computeStats(values)`（mean/std/min/max）、`zScoreScale(values)`、`minMaxScale(values)` 三個純函式。

## 資訊圖表規劃

Excalidraw 手繪風格，延續本站慣例。因無案例分析數據（不列實際計算數字），版面為 4 個視覺區塊：

1. **簡介卡**：濃縮自章節簡介段落。
2. **縮放方法卡**：Z-score／Min-Max 公式並列對比（純概念，不含 50 Startups 實際計算數字）。
3. **適用情境卡**：需要／不需要標準化的模型分類。
4. **常見誤區卡**：一般淺色卡片，比照 CRISP-DM 風格。

## 技術規劃

| 檔案 | 動作 |
|---|---|
| `src/lib/scaling.ts` + `scaling.test.ts` | 新增：統計量與兩種縮放轉換的純函式（TDD） |
| `src/components/charts/FeatureScalingComparison.tsx` | 新增：互動元件，橫向點狀圖 + 模式切換 + 統計量顯示 |
| `src/content/chapters/feature-engineering-standardization.md` | 新增：frontmatter `title: 特徵工程與標準化`、`stage: 方法論基礎`、`category: [方法論基礎]`、`interactiveComponent: feature-scaling-comparison`；`summary.image` 指向新 PNG，`summary.formulas`/`summary.keyStats` 設為空陣列（schema 必填但圖片模式下不渲染，比照 CRISP-DM 的既有做法）；內文依上方四段落（簡介／常見方法／適用情境與限制／常見誤區） |
| `src/pages/chapters/[slug].astro` | 修改：新增 `interactiveComponent === 'feature-scaling-comparison'` 的字面 JSX 渲染分支（比照既有三個分支的模式） |
| `src/config/curriculum.ts` | 修改：「特徵工程與標準化」主題項目補上 `slug: 'feature-engineering-standardization'` |
| `src/config/chapters.ts` | 修改：`chapterOrder` 插入新章節於 CRISP-DM 與 Simple Linear Regression 之間（機器學習介紹 → CRISP-DM → 特徵工程與標準化 → 簡單線性回歸 → 多元線性回歸），調整前後項目的 `prerequisiteSlug`/`nextSlug` |
| `src/config/curriculum.test.ts` | 修改：「恰好四個已建置章節」斷言更新為五個 |
| `docs/specs/chapter_template_guide.md` | 修改：新增「技巧/技術類」範本說明（比照 1.2 節 CRISP-DM 範本的寫法新增 1.3 節），並在第 5 節補充此範本的資訊圖表版面規則——本次直接同步，避免重蹈 CRISP-DM 範本文件沒同步的缺口 |
| `docs/specs/assets-src/feature-engineering-standardization-summary.html` | 新增：Excalidraw 風格資訊圖表來源檔，引用共用 `rough-engine.js` |
| `scripts/render-feature-engineering-standardization-infographic.ps1` | 新增：比照既有渲染腳本模式的專用渲染腳本 |
| `src/assets/chapters/feature-engineering-standardization-summary.png` | 新增（渲染輸出） |

## 驗證方式

- `src/lib/scaling.ts` 的 TDD 單元測試（統計量與兩種縮放公式的正確性）
- `npx astro check`：0 錯誤/0 警告
- `npm run build`：6 頁面成功產出（新增 feature-engineering-standardization 頁面）
- `npm run test`：既有測試不受影響（`curriculum.test.ts` 需確認新增 `slug` 欄位後仍通過）
- 資訊圖表渲染後視覺檢查（沿用第 14 階段建立的 `.page` 高度精確量測法，若量測結果自相矛盾則改用第 16 階段確立的像素分析＋二分搜尋替代法）
- 瀏覽器實測：新頁面「簡介／常見方法／適用情境與限制／常見誤區／學習摘要／互動式操作與演示」六區塊正確渲染；互動元件三種模式切換正確更新圖表與統計量；知識地圖頁面確認新章節項目已可點擊；首頁導覽列與既有 4 章節的上一頁/下一頁鏈結未受影響

## 風險與注意事項

- `chapterOrder` 插入中間位置會同時修改 `crisp-dm` 與 `simple-linear-regression` 兩個既有項目的 `prerequisiteSlug`/`nextSlug`，需注意不要漏改任一側。
- 本次確立的「技巧/技術類」6 區塊範本可供未來同類主題（例如「訓練/測試切分與交叉驗證」等）參考，但個別章節內容仍需與開發者逐一確認，不可預設套用。
- `chapter_template_guide.md` 的文件同步已排入本次實作計畫（而非留待下階段），避免重蹈 CRISP-DM 章節的缺口。
