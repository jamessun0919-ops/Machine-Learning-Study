# 設計方案：Polynomial Regression（多項式回歸）章節

> 日期：2026-08-02（第 20 個工作階段）

## 背景與問題

依 `curriculum.ts` 順序，本主題緊接在「Multiple Linear Regression」之後、「Ridge Regression」之前（Ridge/Lasso 尚未建置）。屬於需要配適模型、有 R²/RMSE 評估指標、有真實案例佐證的具體演算法，開發者確認**沿用九大區塊演算法類範本**（`chapter_template_guide.md` 第 1 節），不修改範本本身。

**與第 19 階段 Overfitting/Underfitting 章節的區隔**：該章節的 `OverfittingUnderfittingComparison.tsx` 使用合成 1D 資料（$\sin$ 曲線加雜訊）＋train/test RMSE 曲線，目的是展示 bias-variance 現象本身，非真實案例。本章節聚焦「Polynomial Regression 作為一種演算法」，需要真實案例分析（符合九大區塊範本第 5 節「案例分析」要求），互動元件設計、資料集皆與 Overfitting 章節區隔，不重複既有展示。

## 範圍界定

- 案例分析僅涵蓋「單一特徵、明顯非線性關係」的教學情境（職等→薪資），不涉及多特徵多項式（特徵交互作用留給更進階主題，不在本章範圍）。
- 互動元件不做 train/test 切分——案例資料集僅 10 筆，切分沒有統計意義；內文會加一句說明，避免學生誤以為所有章節都要切分。
- `curriculum.ts` 新增 `relatedTo: ['過擬合/欠擬合與偏差-變異數權衡']`（次數選擇即 bias-variance 權衡的具體案例），並回頭替已上線的 `overfitting-underfitting-bias-variance.md` 補上對應關聯段落（依 `chapter_template_guide.md` 1.1 節規則，兩側互相指向）。

## 章節內文

### 簡介

多項式回歸是線性回歸的延伸：透過將特徵轉換為 $x, x^2, \ldots, x^d$ 等高次項，讓模型能夠配適曲線關係，而非僅限直線。核心概念：**雖然預測值是 $x$ 的非線性函數，但對係數 $\beta$ 而言仍是線性組合**——因此仍可用既有的最小平方法（常態方程式）求解，不需要新的求解器。

**與過擬合/欠擬合章節的關係**：次數 $d$ 的選擇就是 bias-variance 權衡的具體案例——次數太低欠擬合（配不出曲線的彎曲程度）、次數太高過擬合（曲線在資料點間劇烈擺動、無法類推到新資料）。

### 分類方式

- 學習類型：監督式學習
- 任務類型：迴歸

### 數學原理

$$y = \beta_0 + \beta_1 x + \beta_2 x^2 + \cdots + \beta_d x^d + \varepsilon$$

推導重點：把 $x^2, \ldots, x^d$ 視為新特徵欄位，代入既有多元線性回歸的常態方程式 $\hat\beta = (X^\top X)^{-1}X^\top y$ 求解，說明本章互動元件的運算基礎與 Multiple Linear Regression 完全相同，只是特徵是同一個 $x$ 的不同次方。

### 運用範例

- **職等-薪資預測**：本章節示範資料集（Position Salaries），用職等預測薪資，兩者呈指數型成長關係
- **生長曲線建模**：生物體重/身高隨時間的非線性成長
- **傳染病初期擴散**：感染人數隨時間的非線性成長趨勢

### 適用情境與限制

**適合使用的情境：**
- 特徵與目標變數在散布圖上呈現明顯曲線（非直線）趨勢
- 仍需要一定可解釋性，但關係不是簡單線性

**限制與假設：**
- 次數選擇是 bias-variance 權衡：次數太低欠擬合、太高過擬合（詳見「與過擬合/欠擬合章節的關係」段落）
- 外插風險比線性回歸更嚴重：高次多項式在訓練範圍外會劇烈發散，比線性回歸的外插誤差成長更快
- 仍是「對係數線性」模型，本質上是線性回歸的特例，不適合用於特徵與目標間沒有多項式型態關係的資料

### 評估指標

- R²（決定係數）
- RMSE（均方根誤差）

### 常見誤區

- **只看訓練集 R² 判斷次數好壞**：次數越高，訓練集 R² 幾乎必然越高（甚至趨近 1），但這不代表模型真的更好——呼應過擬合章節「只看訓練誤差判斷模型好壞」的誤區
- **把多項式回歸和非線性模型混為一談**：多項式回歸對係數而言仍是線性模型，只是特徵做了非線性轉換，與決策樹、神經網路等「真正的非線性模型」在數學性質上不同
- **忽略外插風險**：高次多項式曲線在訓練資料範圍外可能劇烈偏離合理範圍，比線性回歸更危險，不能拿模型去預測訓練範圍外的職等（例如職等 15）

## 互動元件規劃

新元件 `PolynomialRegressionFit.tsx`，架構比照既有 `RegressionScatter2D.tsx`（單圖、全資料配適、白名單按鈕、顯示 R²/RMSE），與 Overfitting 章節的雙圖 train/test 誤差曲線設計區隔：

- **資料集**：新建 `src/lib/positionSalaryData.ts`，內建職等-薪資資料集（10 筆固定常數，職等 1-10，薪資呈指數型成長），純前端白名單常數，比照 `datasets.ts`（50 Startups）做法，不需外部檔案讀取。
- **次數白名單按鈕**：1／2／3／4／5（次數 4 是這份經典資料集常見的「最佳配適」次數，白名單涵蓋欠擬合到過擬合的視覺差異）。
- **配適方式**：對全部 10 筆資料配適（不做 train/test 切分），沿用既有 `regression.ts` 的 `fitLinearRegression`／`predict`／`rSquared`／`rmse`，多項式特徵建構手法沿用 `polynomialFit.ts` 已驗證的 `polynomialFeatures()` 邏輯（實作階段決定抽成共用函式或精簡複寫一份）。
- **圖表**：單一 Plotly 散佈圖＋密集取樣的配適曲線（x 軸＝職等，y 軸＝薪資），下方顯示 R²/RMSE 數值，比照 `RegressionScatter2D.tsx` 的樣式與互動限制（關閉拖曳縮放、圖例點擊切換）。
- **數值穩定性**：不需額外標準化。既有 `polynomialFit.ts` 已在 $x\in[-3,3]$、次數達 15（$3^{15}\approx1.4\times10^7$）的情況下驗證常態方程式求解穩定；本次職等 1-10、次數上限 5（$10^5=10^5$）數值範圍更溫和，直接沿用 `regression.ts` 現有高斯消去法（含部分主元選取）即可，TDD 階段仍需實際驗證。

## 資訊圖表規劃

Excalidraw 手繪風格，延續本站慣例，九大區塊範本的 6 個視覺區塊結構（`chapter_template_guide.md` 第 5 節）：

1. **簡介卡**：濃縮自章節簡介段落。
2. **模型公式卡**：$y=\beta_0+\beta_1x+\cdots+\beta_dx^d$，並標註「對 $\beta$ 仍是線性」的關鍵概念。
3. **適用情境卡**：次數選擇＝bias-variance 權衡、外插風險。
4. **評估指標卡**：R²/RMSE。
5. **常見誤區卡**。
6. **案例分析**（深色 footer/黑板樣式，固定在最底部）：標題「案例分析：Position Salaries（職等-薪資資料集）」，內容含次數 4 的擬合曲線示意、R²/RMSE 數值。

標題「多項式回歸」共 5 字，明顯短於第 19 階段「過擬合/欠擬合與偏差-變異數權衡」（16 字，歷來最長），預期不會遇到當時的標題底線/塗鴉重疊問題，但仍依規則主動核對 `.title-underline` 寬度與同列裝飾元素間距。

## 技術規劃

| 檔案 | 動作 |
|---|---|
| `src/lib/positionSalaryData.ts` + `.test.ts` | 新增：職等-薪資固定資料集常數 |
| `src/lib/polynomialFit.ts` 或新檔 | 視實作階段決定：多項式特徵建構函式是否抽成共用（供 Overfitting 與本章共用），或本章精簡複寫一份 |
| `src/components/charts/PolynomialRegressionFit.tsx` | 新增：互動元件，單圖配適曲線＋次數白名單按鈕（1/2/3/4/5）＋R²/RMSE 顯示 |
| `src/content/chapters/polynomial-regression.md` | 新增：frontmatter `title: 多項式回歸`、`stage: 監督式學習－迴歸`、`interactiveComponent: polynomial-regression-fit`；`summary.image` 指向新 PNG；內文依上方九大區塊 |
| `src/pages/chapters/[slug].astro` | 修改：新增 `interactiveComponent === 'polynomial-regression-fit'` 的字面 JSX 渲染分支 |
| `src/config/curriculum.ts` | 修改：「Polynomial Regression」主題項目補上 `slug: 'polynomial-regression'`、`relatedTo: ['過擬合/欠擬合與偏差-變異數權衡']` |
| `src/config/chapters.ts` | 修改：`multiple-linear-regression.nextSlug = 'polynomial-regression'`；新增 `polynomial-regression`（`prerequisiteSlug: 'multiple-linear-regression'`，無 `nextSlug`） |
| `src/content/chapters/overfitting-underfitting-bias-variance.md` | 修改：簡介段落補上「與 Polynomial Regression 的關係」關聯段落（回頭補上，因該章節已上線） |
| `src/config/curriculum.test.ts` | 修改：「恰好七個已建置章節」斷言更新為八個，插入新章節名稱於正確位置 |
| `docs/specs/chapter_template_guide.md` | 修改：1.1 節核心關聯對照表新增「Polynomial Regression ↔ 過擬合/欠擬合」一列，狀態標記「兩側已補」 |
| `docs/specs/assets-src/polynomial-regression-summary.html` | 新增：Excalidraw 風格資訊圖表來源檔，引用共用 `rough-engine.js` |
| `scripts/render-polynomial-regression-infographic.ps1` | 新增：比照既有渲染腳本模式的專用渲染腳本 |
| `src/assets/chapters/polynomial-regression-summary.png` | 新增（渲染輸出） |

**本次不需修改 `docs/specs/chapter_template_guide.md` 的範本結構本身**（第 1、5 節九大區塊定義不變），僅新增 1.1 節關聯對照表的一列。

## 驗證方式

- `npx astro check`：0 錯誤/0 警告
- `npm run build`：9 頁面成功產出（新增本章頁面）
- `npm run test`：`positionSalaryData.test.ts` 新測試全過；`curriculum.test.ts` 更新後仍通過；既有測試不受影響
- 資訊圖表渲染後視覺檢查（優先 DOM 量測法，若矛盾則改用像素分析＋二分搜尋替代法），並主動核對標題底線寬度與裝飾元素間距
- 瀏覽器實測：新頁面九區塊正確渲染；互動元件次數白名單切換正確更新曲線與 R²/RMSE 數值；`chapterOrder` 接續 `multiple-linear-regression` 後鏈結正確；頂部導覽列用 `curl` 核對順序（非截圖，因軌道可能裁切）；`overfitting-underfitting-bias-variance` 頁面新增的關聯段落正確顯示、既有內容無回歸

## 風險與注意事項

- 高次多項式（次數 4-5）在 10 筆小樣本上配適的數值穩定性仍需在 TDD 階段實際驗證，雖然預期比既有 `polynomialFit.ts` 的次數 15 情境更溫和，但不可預設一定沒問題就跳過驗證。
- 回頭修改已上線的 `overfitting-underfitting-bias-variance.md` 屬於既有頁面的小幅編輯，需確認不影響該頁面既有內容與資訊圖表（資訊圖表本身不需要重新渲染，只有內文新增一段）。
- `polynomialFeatures()` 是否抽成共用函式（供 Overfitting 與本章共用）或各自保留一份，留待實作階段依 TDD 實際情況決定，不在設計階段預先鎖死。
- 建立 worktree 前依既有慣例先確認本機 main 已推送至 origin。
