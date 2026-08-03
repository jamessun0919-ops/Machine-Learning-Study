# 設計方案：Ridge Regression（Ridge 迴歸，正則化）章節

> 日期：2026-08-03（第 22 個工作階段）

## 背景與問題

依 `curriculum.ts` 順序，本主題緊接在「Polynomial Regression」之後、「Lasso Regression」之前。屬於需要配適模型、有 R²/RMSE 評估指標、有真實案例佐證的具體演算法，開發者確認**沿用九大區塊演算法類範本**（`chapter_template_guide.md` 第 1 節），不修改範本本身。

**教學切入點**：以「多項式係數爆炸」情境展示 L2 正則化如何抑制係數、改善泛化能力——直接重用 Overfitting 章節既有的合成資料與 train/test 切分，不新建資料集，讓 Ridge Regression 成為「Polynomial Regression → 過擬合/欠擬合 → 正則化」這條教學故事線的具體延續。

## 範圍界定

- 重用 `polynomialFit.ts` 已匯出的 `TRAIN_SET`／`TEST_SET`（sin 曲線加雜訊合成資料），**固定次數 15**，不提供次數切換——避免與 Overfitting／Polynomial 章節既有的次數切換元件重複展示，本章聚焦 λ 本身的效果。
  - **次數選擇已用 Node 腳本實際驗證修正**：設計初稿原訂次數 9，但實測發現次數 9 在此資料集上並未嚴重過擬合（λ=0 時 test RMSE=0.2716，加入正則化後只會單調變差，無法展示「改善泛化」的核心論述）。次數 15 才是 Overfitting 章節已驗證的嚴重過擬合案例：λ=0（無正則化）時 test RMSE=0.8024、係數最大絕對值高達 **1450.078**；加入 λ=0.01 後 test RMSE 降到 0.3204（改善 60%）、係數最大絕對值降到 5.7643（收縮約 250 倍）。故改用次數 15，且不提供次數切換（維持固定，僅次數改變）。
- 特徵標準化為必要步驟：$x^1,\ldots,x^{15}$ 各自標準化（用訓練集算出的 mean/std，重用 `scaling.ts` 的 `computeStats`）後才做 ridge 擬合；**不正則化截距項**。
- 評估指標沿用 train/test 雙集顯示（呼應 Overfitting 章節的 train/test RMSE 概念）：λ 從 0 增加時，train RMSE 上升、test RMSE 先降後升，直接展示正則化改善泛化能力的核心效果（實測 λ=0.01 為此 λ 白名單中 test RMSE 最低點）。
- **λ 白名單定案為 `0, 0.01, 0.1, 1, 10`**（Node 腳本實測完整掃過，涵蓋「嚴重過擬合→最佳點→逐漸欠擬合」全曲線，見下方互動元件規劃的實測數據表）。
- `curriculum.ts` 新增 `relatedTo: ['Polynomial Regression（多項式回歸）', '過擬合/欠擬合與偏差-變異數權衡', '特徵工程與標準化']`（三組皆已上線，需回頭在三側都補上關聯段落）。
- 不涉及多重共線性/多特徵情境（該情境留給未來若有需要時再處理，不在本次範圍）。

## 章節內文

### 簡介

Ridge Regression 是在線性回歸的損失函數中加入 L2 正則化項（係數平方和），透過懲罰過大的係數來抑制過擬合、提升模型的泛化能力。核心概念：在「配適訓練資料」與「保持係數合理大小」之間取捨，用一點點偏差換取更低的變異數。

**與 Polynomial Regression 的關係**：多項式回歸在高次項時容易出現係數爆炸、曲線劇烈震盪，Ridge Regression 正是抑制這種爆炸的具體工具——本章的案例分析直接沿用高次多項式特徵，示範加入正則化前後的係數與曲線差異。

**與過擬合/欠擬合的關係**：正則化是「應對過擬合」的其中一種具體手段（該章節已提及「加入正則化」），Ridge 用 λ 這個超參數，把 bias-variance 權衡變成一個可連續調整的旋鈕：λ 越大，偏差越高、變異數越低。

**與特徵工程與標準化的關係**：Ridge 的懲罰項是對係數大小做懲罰，若特徵尺度不同，懲罰力道就會不公平地偏向小尺度特徵的係數——這正是該章節「標準化」的實務意義所在，Ridge 是標準化「為什麼重要」的具體範例。

### 分類方式

- 學習類型：監督式學習
- 任務類型：迴歸
- 模型類型：正則化線性模型

### 數學原理

$$J(\beta) = \sum_{i=1}^{n}(y_i - \hat y_i)^2 + \lambda \sum_{j=1}^{p}\beta_j^2$$

（懲罰項不含截距 $\beta_0$）

閉式解：

$$\hat\beta = (X^\top X + \lambda I')^{-1}X^\top y$$

其中 $I'$ 是截距項所在列/行為 0 的單位矩陣變體，避免懲罰截距。推導重點：

- $\lambda=0$ 時退化為既有 `fitLinearRegression`（普通最小平方法），與 Multiple/Polynomial Regression 使用同一套求解基礎。
- 使用前必須先將特徵標準化，否則不同尺度的係數受懲罰程度不一致（詳見「與特徵工程與標準化的關係」段落）。

### 運用範例

- **高次多項式係數穩定化**（本章案例）：抑制高次多項式回歸的係數爆炸與曲線劇烈震盪
- **高維度特徵資料**：基因體學、文字特徵等，特徵數可能大於樣本數的情境
- **具多重共線性的資料**：財務或社會科學資料中特徵間高度相關時，穩定係數估計

### 適用情境與限制

**適合使用的情境：**
- 特徵數多、疑似過擬合
- 特徵間有相關性（多重共線性）
- 仍想保留所有特徵、只是要抑制係數過大

**限制與假設：**
- λ 需要調整（可用交叉驗證挑選，呼應已上線的「訓練/測試切分與交叉驗證」章節）
- 係數會被縮小但不會恰好變成 0，無法做特徵選擇
- 前提是特徵已標準化，否則懲罰力道不公平

### 評估指標

- R²（決定係數）
- RMSE（均方根誤差），train/test 雙集顯示

### 常見誤區

- **忘記標準化就直接套用 Ridge**：懲罰力道被特徵尺度差異扭曲，係數收縮不公平
- **誤以為 λ 越大一定越好**：λ 過大會導致嚴重欠擬合，係數被壓縮到接近 0，模型退化成意義不大的常數預測
- **誤以為正則化能把不重要的特徵徹底排除**：Ridge 只會縮小係數幅度，不會將其變成恰好 0（不做特徵選擇）

## 互動元件規劃

新元件 `RidgeRegressionFit.tsx`，雙區塊設計：

- **上方**：Plotly 散佈圖＋配適曲線（次數固定 15，重用 `polynomialFit.ts` 已匯出的 `TRAIN_SET`/`TEST_SET`；`polynomialFeatures()` 依既有 Polynomial Regression 章節慣例局部複寫於元件內，不與 `polynomialFit.ts` 共用）。
- **下方**：係數條形圖，顯示標準化空間下的 $|\beta_1|,\ldots,|\beta_{15}|$（不含截距，取絕對值）。**Y 軸改用對數座標（log scale）**，理由：λ=0 時最大係數絕對值 1450，λ=0.01 之後最大係數只剩個位數，相差 200 倍以上，線性固定軸會讓除 λ=0 外的所有長條視覺上貼齊 0；改用 log 軸後每個 λ 都能看到清楚的長條變化，是 ML 教學展示正則化係數收縮的標準做法。圖表需標註「係數絕對值（對數座標）」避免使用者誤讀為原始係數。
- **λ 白名單按鈕**：定案為 `0, 0.01, 0.1, 1, 10`（已用 Node 腳本實測驗證，見下表）。
- 下方數值顯示 train RMSE／test RMSE。
- **標準化流程**：用訓練集算出的 mean/std（重用 `scaling.ts` 的 `computeStats`，並新增 `applyZScore` 套用到訓練/測試/曲線取樣點），統一標準化管線；不與既有 `CURVE_FITS`（未標準化的 OLS 結果）混用，避免 λ=0 與 λ>0 呈現方式不一致。

**實測數據（次數 15，供實作階段對照驗證）：**

| λ | train RMSE | test RMSE | test R² | 最大 \|係數\| |
|---|---|---|---|---|
| 0 | 0.1865 | 0.8024 | 0.8118 | 1450.078 |
| 0.01 | 0.2062 | 0.3204 | 0.9700 | 5.7643 |
| 0.1 | 0.2718 | 0.3785 | 0.9581 | 4.9249 |
| 1 | 0.5951 | 0.7536 | 0.8341 | 3.3954 |
| 10 | 1.2042 | 1.3658 | 0.4549 | 1.5154 |

λ=0.01 是白名單中 test RMSE 最低點（泛化能力最佳），適合作為資訊圖表案例分析的「建議 λ」示範值。

## 資訊圖表規劃

Excalidraw 手繪風格，延續本站慣例，九大區塊範本的 6 個視覺區塊結構（`chapter_template_guide.md` 第 5 節）：

1. **簡介卡**：濃縮自章節簡介段落。
2. **模型公式卡**：$J(\beta)=\sum(y_i-\hat y_i)^2+\lambda\sum\beta_j^2$，並標註「λ=0 退化為 OLS」。
3. **適用情境卡**：特徵多/共線性高時適用、λ 需調整、不做特徵選擇。
4. **評估指標卡**：R²/RMSE。
5. **常見誤區卡**。
6. **案例分析**（深色 footer/黑板樣式，固定在最底部）：標題「案例分析：Polynomial Coefficient Shrinkage（多項式係數收縮，次數 15）」，展示 λ=0（test RMSE=0.8024、最大係數絕對值 1450.078）vs λ=0.01（test RMSE=0.3204、最大係數絕對值 5.7643）的對比，數值取自上方「互動元件規劃」實測數據表。

## 技術規劃

| 檔案 | 動作 |
|---|---|
| `src/lib/regression.ts` + `.test.ts` | 新增 `fitRidgeRegression(features, target, lambda)`：重用既有私有輔助函式（`transpose`/`multiply`/`multiplyVector`/`solveLinearSystem`），懲罰項跳過截距（index 0）；新增測試驗證 λ=0 等同 `fitLinearRegression`、λ 增加時係數幅度遞減 |
| `src/lib/scaling.ts` + `.test.ts` | 新增 `applyZScore(value, stats)`：用既有 `ScalingStats` 對新資料點套用相同的標準化轉換（訓練集之外的曲線取樣點/測試集需要用訓練集算出的 stats，而非重新計算） |
| `src/components/charts/RidgeRegressionFit.tsx` | 新增：雙區塊互動元件（配適曲線圖＋係數條形圖），λ 白名單按鈕 |
| `src/content/chapters/ridge-regression.md` | 新增：frontmatter `title: Ridge Regression（Ridge 迴歸，正則化）`、`stage: 監督式學習－迴歸`、`interactiveComponent: ridge-regression-fit`；`summary.image` 指向新 PNG；內文依上方九大區塊 |
| `src/pages/chapters/[slug].astro` | 修改：新增 `interactiveComponent === 'ridge-regression-fit'` 的字面 JSX 渲染分支 |
| `src/config/curriculum.ts` | 修改：「Ridge Regression」主題項目補上 `slug: 'ridge-regression'`、`relatedTo: ['Polynomial Regression（多項式回歸）', '過擬合/欠擬合與偏差-變異數權衡', '特徵工程與標準化']` |
| `src/config/chapters.ts` | 修改：`polynomial-regression.nextSlug = 'ridge-regression'`；新增 `ridge-regression`（`prerequisiteSlug: 'polynomial-regression'`，無 `nextSlug`） |
| `src/content/chapters/polynomial-regression.md` | 修改：簡介段落補上「與 Ridge Regression 的關係」關聯段落 |
| `src/content/chapters/overfitting-underfitting-bias-variance.md` | 修改：簡介段落補上「與 Ridge Regression 的關係」關聯段落 |
| `src/content/chapters/feature-engineering-standardization.md` | 修改：簡介段落補上「與 Ridge Regression 的關係」關聯段落 |
| `src/config/curriculum.test.ts` | 修改：「恰好 N 個已建置章節」斷言 8→9，插入新章節名稱於正確位置 |
| `docs/specs/chapter_template_guide.md` | 修改：1.1 節核心關聯對照表新增 3 列（Ridge Regression↔Polynomial Regression、Ridge Regression↔過擬合/欠擬合、Ridge Regression↔特徵工程與標準化） |
| `docs/specs/assets-src/ridge-regression-summary.html` | 新增：Excalidraw 風格資訊圖表來源檔，引用共用 `rough-engine.js` |
| `scripts/render-ridge-regression-infographic.ps1` | 新增：比照既有渲染腳本模式（`$repoRoot = Split-Path -Parent $PSScriptRoot` 動態路徑）的專用渲染腳本 |
| `src/assets/chapters/ridge-regression-summary.png` | 新增（渲染輸出） |

**本次不需修改 `docs/specs/chapter_template_guide.md` 的範本結構本身**（第 1、5 節九大區塊定義不變），僅新增 1.1 節關聯對照表的 3 列。

## 驗證方式

- `npx astro check`：0 錯誤/0 警告
- `npm run build`：10 頁面成功產出（新增本章頁面）
- `npm run test`：`regression.test.ts`／`scaling.test.ts` 新測試全過；`curriculum.test.ts` 更新後仍通過；既有測試不受影響
- 資訊圖表渲染後親自用 Read 工具開圖檢視（依既有規則，不可只靠子審查 subagent 通過就視為完成，因其無法檢視二進位圖片）
- 瀏覽器實測：新頁面九區塊正確渲染；互動元件 λ 白名單切換正確更新配適曲線、係數條形圖（含固定 Y 軸範圍下的收縮視覺效果）、train/test RMSE 數值；`chapterOrder` 接續 `polynomial-regression` 後鏈結正確；頂部導覽列用 `curl` 核對順序（非截圖，因軌道可能裁切）；三個關聯章節（Polynomial Regression、過擬合/欠擬合、特徵工程與標準化）新增的關聯段落正確顯示、既有內容無回歸

## 風險與注意事項

- 三處回頭修改已上線章節（Polynomial Regression、過擬合/欠擬合、特徵工程與標準化）屬既有頁面的小幅編輯，需確認不影響各頁面既有內容與資訊圖表（資訊圖表本身不需要重新渲染，只有內文新增一段）。
- 實作階段需以 TDD 重新驗證上方實測數據表（本設計文件的數字來自設計階段的驗證腳本，正式 `fitRidgeRegression`/`applyZScore` 實作完成後需用單元測試與元件內數值再次確認一致）。
- `applyZScore` 是否需要處理 `std === 0` 的邊界情況（若某特徵欄位所有值相同），需在 TDD 階段依實際資料驗證是否會發生（本章固定次數 15 的多項式特徵欄位理論上不會出現，但仍需測試確認）。
- 建立 worktree 前依既有慣例先確認本機 main 已推送至 origin。
