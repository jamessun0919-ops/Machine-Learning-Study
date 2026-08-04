# 設計方案：Logistic Regression（邏輯斯迴歸）章節

> 日期：2026-08-04（第 24 個工作階段）

## 背景與問題

依 `curriculum.ts`／`dir.txt` 順序，本主題是階段三「監督式學習－迴歸」的最後一個主題，建置完即代表階段三全數完成、可進入階段四（監督式學習－分類）。與先前 Simple/Multiple/Polynomial/Ridge/Lasso 五個 Linear Regression 家族章節不同，**本章是分類任務、非迴歸**，數學原理、評估指標、運用範例皆需重新設計，不可直接沿用既有內容（僅沿用九大區塊演算法類範本的「結構」）。

**教學切入點**：作為「迴歸走向分類的橋樑」，`multiple-linear-regression.md` 已預埋單側關聯段落——當預測目標從連續數值變成類別，同樣的線性組合 $\beta_0+\beta_1x_1+\cdots+\beta_nx_n$ 搭配 Sigmoid 函數轉換成機率，就成為 Logistic Regression。本章需補上另一側關聯段落。

## 範圍界定

### 案例資料集：貸款違約預測（Loan Default）

- **全新的「真實感」合成資料**（非重用既有 50-startups／多項式資料，也非採用經典公開資料集如 Iris/乳癌診斷——經評估 Iris 等資料集在單一特徵下近乎完美線性可分，會讓梯度下降的係數持續發散、`converged` 永遠是 false，此陷阱與第 23 階段 Lasso 的 λ=0 收斂問題同一類）。
- **兩個固定特徵**：`debtToIncomeRatio`（負債佔收入比）、`creditScore`（信用分數）。
- **200 筆資料，故意設計成不平衡類別**（違約約 20~30%），直接呼應「評估指標」區塊要談的 Accuracy 陷阱。
- **生成方式**：一次性 Node 腳本（非執行期程式碼），固定 LCG 種子（42）+ Box-Muller 常態分布產生特徵；用一個真實的底層關係 $z = \beta_0 + \beta_1\cdot DTI + \beta_2\cdot creditScore$（$\beta_1=11.0$ 正相關違約、$\beta_2=-0.022$ 負相關違約）算出機率、再用同一顆種子做 Bernoulli 抽樣產生 0/1 標籤；$\beta_0$ 用二分搜尋校準到母體平均機率 25%。最終實測整體違約率 25.5%（51/200），完全落在設計目標區間。輸出寫死存成 `src/data/loan-default.json`，不在網頁執行期重新生成。
- **train/test 切分**：200 筆需要新的固定索引（現有 `dataSplit.ts` 的 `SHUFFLED_INDICES` 長度寫死 50，不適用於 200 筆）。設計階段驗證用仿射排列 $i\mapsto(i\times97+13)\bmod200$（$\gcd(97,200)=1$，為合法排列），75/25 切分為訓練 150／測試 50。實作時會在 `src/lib/loanDefault.ts` 內提供這組固定索引（決定性、非執行期隨機，與 `dataSplit.ts` 同一設計原則但獨立成陣列，不擴充 `dataSplit.ts` 本身以免影響既有 50 筆資料的章節）。
- 實測切分後：訓練集違約率 24%（36/150）、測試集違約率 30%（15/50），兩邊都在合理範圍、無極端偏斜。

### 求解器：批次梯度下降（無閉式解）

- **新檔案 `src/lib/classification.ts`**（不塞進 `regression.ts`——分類的求解器與評估函式與既有迴歸邏輯關注點不同，比照 `polynomialFit.ts`／`positionSalaryData.ts` 的單一用途檔案慣例獨立成檔）。
- `sigmoid(z) = 1/(1+e^{-z})`。
- `fitLogisticRegression(features, target, learningRate, maxIter, tol)`：批次梯度下降求解 Cross-Entropy Loss，回傳 `{ coefficients, converged }`（沿用第 23 階段訂下的「迭代法必須有 converged 信號」規則）。**函式內部不做標準化**——比照 `fitLinearRegression`／`fitRidgeRegression` 的既有慣例，標準化由呼叫端（互動元件／資料生成腳本）用既有 `scaling.ts` 處理後再傳入。
- **標準化為必要前置步驟**：兩個特徵原始尺度差異極大（負債比約 0~1、信用分數約 350~850），不標準化會讓梯度下降收斂極慢或需要極小學習率。訓練集算出的 mean/std 套用到訓練/測試/決策邊界端點。
- **生產參數（已用驗證腳本實測，非猜測）**：`learningRate=0.3, maxIter=20000, tol=1e-6`。此組合在最終資料集上於 3576 次疊代內收斂（實測 31ms），比收斂所需的最小疊代數（約 3500+）留有近 6 倍安全邊際；`tol` 判準為「所有梯度分量的最大絕對值 < tol」。
- 評估函式：`confusionMatrix(actual, predicted)` 回傳 `{tp, fp, fn, tn}`；`accuracy`／`precision`／`recall`／`f1Score` 皆基於混淆矩陣計算；`predicted` 由 `sigmoid(predict(coefficients, features)) >= 0.5` 決定類別（門檻固定 0.5，不提供調整介面）。

### 驗證數據（供實作階段對照，設計階段腳本實測）

**標準化空間下的擬合係數**：截距 = -2.9604、$\beta_{DTI}$ = 2.6531、$\beta_{creditScore}$ = -2.6729（符號與生成資料時的真實方向一致：負債比越高、信用分數越低，違約對數勝算越高）。

| 資料集 | Accuracy | Precision | Recall | F1 | 混淆矩陣 (TP/FP/FN/TN) |
|---|---|---|---|---|---|
| 訓練集 (n=150) | 0.8667 | 0.75 | 0.6667 | 0.7059 | 24 / 8 / 12 / 106 |
| 測試集 (n=50) | 0.88 | 0.9091 | 0.6667 | 0.7692 | 10 / 1 / 5 / 34 |

**教學敘事重點**：測試集 Accuracy 高達 88%，乍看是個不錯的模型，但 Recall 只有 66.7%——代表 15 個真正違約的客戶中，模型漏掉了 5 個。這正是「評估指標」區塊要談的 Accuracy 陷阱：不平衡資料下，模型只要把大多數樣本判成多數類別（未違約）就能拿到不錯的 Accuracy，但 Recall 才反映了模型有沒有真正抓到少數但關鍵的違約案例。

## 章節內文（九大區塊）

### 簡介

定義 Logistic Regression 是「用線性組合 + Sigmoid 函數把預測值壓縮到 0~1 機率，再以門檻切出類別」的分類演算法；核心問題：目標變數是類別而非連續值時，線性回歸的輸出無界（可能小於 0 或大於 1），無法直接當機率解讀。

**與 Multiple Linear Regression 的關係**（本側新增，MLR 章節已預埋另一側）：當預測目標從連續數值變成類別，同樣的線性組合 $\beta_0+\beta_1x_1+\cdots+\beta_nx_n$ 搭配 Sigmoid 函數轉換成機率，就成為 Logistic Regression，是本課程從迴歸過渡到分類的第一步——**這也是本站第一個分類任務章節**。

### 分類方式

- 學習類型：監督式學習
- **任務類型：分類（Classification）——非迴歸**
- 模型類型：廣義線性模型（Generalized Linear Model）

### 數學原理

$$\sigma(z) = \frac{1}{1+e^{-z}}, \quad z = \beta_0+\beta_1x_1+\cdots+\beta_px_p$$

Sigmoid 函數把線性組合 $z$（值域 $(-\infty,\infty)$）壓縮到 $(0,1)$，可解讀為「屬於正類別的機率」$\hat p = \sigma(z)$。

損失函數改用 Cross-Entropy Loss（而非線性回歸的平方誤差）：

$$J(\beta) = -\frac{1}{n}\sum_{i=1}^n\left[y_i\log\hat p_i + (1-y_i)\log(1-\hat p_i)\right]$$

這個損失函數對 $\beta$ 是非線性的，**沒有閉式解**，需用迭代法求解。本站採用批次梯度下降，每輪疊代用全部訓練資料計算梯度並更新：

$$\beta \leftarrow \beta - \alpha \cdot \frac{1}{n}X^\top(\hat p - y)$$

其中 $\alpha$ 是學習率。使用前需先標準化特徵（原始尺度差異過大會讓收斂極慢）。

### 運用範例

- **貸款違約預測**（本章案例）：依借款人財務特徵預測是否違約
- **醫療診斷**：依檢驗數值預測是否罹患某疾病
- **行銷轉換預測**：依使用者行為預測是否會點擊/購買

### 適用情境與限制

**適合使用的情境：**
- 目標變數是二元類別（是/否、有/無）
- 資料近似線性可分
- 需要可解釋的機率輸出（而非只有硬性分類標籤）

**限制與假設：**
- **決策邊界本質是線性的**：無法處理非線性可分的資料，需搭配特徵工程（如多項式特徵）或改用非線性模型
- **係數是 log-odds，不是直接的機率變化量**：不能像線性回歸那樣直接解讀「x 增加 1，y 增加 β」
- **類別不平衡時需搭配 Precision/Recall，不能只看 Accuracy**（本章案例即為示範）

### 評估指標

- **混淆矩陣**：TP（真陽性）/FP（偽陽性）/FN（偽陰性）/TN（真陰性）四格，是其餘指標的基礎
- **Accuracy（準確率）**：$(TP+TN)/n$，但類別不平衡時容易失真
- **Precision（精確率）**：$TP/(TP+FP)$，預測為正的樣本中有多少真的是正
- **Recall（召回率）**：$TP/(TP+FN)$，真正的正樣本中有多少被抓出來
- **F1-Score**：Precision 與 Recall 的調和平均，兩者需兼顧時的綜合指標

### 常見誤區

- **誤用 Accuracy 評估不平衡資料**：本章案例 Accuracy 高達 88%，但 Recall 只有 66.7%——高 Accuracy 可能只是模型傾向猜多數類別
- **把 Sigmoid 輸出的機率當成絕對真理**：機率是模型估計值，不代表校準良好（calibration 是獨立的議題）
- **誤以為決策邊界必然是複雜曲線**：Logistic Regression 本身的決策邊界就是線性的，能學到的分界只能是（超）平面
- **誤把未標準化的係數大小當「特徵重要性」解讀**：特徵尺度不同時，係數大小不可直接比較

## 互動元件規劃

新元件 `LogisticRegressionFit.tsx`：

- **單一 2D 決策邊界圖**：x 軸＝負債佔收入比、y 軸＝信用分數，全部 200 筆資料點依實際類別上色（違約＝橘色 `#e6a15e`、未違約＝青色 `#5ee6d0`），疊上決策邊界線（紫色 `#7c5ee6`，與其他章節擬合線同色）。決策邊界只用訓練集 150 筆配適，但圖上同時畫出全部 200 筆點，讓學生能直接看到測試集裡有哪些點落在邊界錯誤的一側。
  - 決策邊界線＝標準化空間中 $z=0$ 的等式解出兩個端點（在特徵範圍 min/max 處），換算回原始座標畫線，比照 Ridge/Lasso「用 min/max x 算兩個端點」的既有手法。
- **無控制項**（無按鈕、無下拉選單、無門檻滑桿）：純靜態展示固定配適結果，呼應本章互動範圍只聚焦決策邊界一個核心重點的決定。
- **統計數據區塊**（`dl.regression-chart__stats`，比照既有章節）：訓練 Accuracy／測試 Accuracy 並列（呼應 Ridge/Lasso 並列訓練/測試指標的慣例）、測試集 Precision／Recall／F1-Score。
- **混淆矩陣**：獨立的 2×2 HTML 小表格（非 Plotly 圖表），呈現測試集 TP/FP/FN/TN 四格。

## 資訊圖表規劃

Excalidraw 手繪風格，延續九大區塊範本的 6 個視覺區塊結構（`chapter_template_guide.md` 第 5 節）：

1. **簡介卡**：濃縮自章節簡介段落，點出「本站第一個分類任務」。
2. **模型公式卡**：Sigmoid 函數與 Cross-Entropy Loss 公式。
3. **適用情境卡**：適合二元分類、決策邊界為線性、係數為 log-odds。
4. **評估指標卡**：混淆矩陣 + Accuracy/Precision/Recall/F1 四項定義。
5. **常見誤區卡**。
6. **案例分析**（深色 footer/黑板樣式，固定在最底部）：標題「案例分析：Loan Default（貸款違約預測）」，呈現測試集 Accuracy 0.88／Precision 0.9091／Recall 0.6667／F1 0.7692、違約比例 25.5%，數據洞察文字點出「Accuracy 88% 看似不錯，但 Recall 只有 66.7%，代表模型漏掉了三分之一的違約客戶」。

## 技術規劃

| 檔案 | 動作 |
|---|---|
| `src/data/loan-default.json` | 新增：200 筆固定資料（`debtToIncomeRatio`／`creditScore`／`isDefault`），由一次性 Node 生成腳本產出後寫死存檔 |
| `src/lib/loanDefault.ts` + `.test.ts` | 新增：匯出 `LoanRecord` 介面、`loans: LoanRecord[]`、欄位中英對照標籤、200 筆固定切分索引（獨立於 `dataSplit.ts`，不擴充其既有 50 筆版本）；測試驗證筆數、型別、違約比例落在 20~30%、切分索引為合法排列 |
| `src/lib/classification.ts` + `.test.ts` | 新增：`sigmoid`、`fitLogisticRegression(features, target, learningRate, maxIter?, tol?)`、`confusionMatrix`、`accuracy`、`precision`、`recall`、`f1Score`；測試涵蓋 sigmoid 邊界值、已知可分資料的收斂與係數方向、混淆矩陣/四指標的手算範例核對 |
| `src/components/charts/LogisticRegressionFit.tsx` | 新增：靜態展示型元件（2D 決策邊界散佈圖 + 統計數據 dl + 混淆矩陣小表格），無控制項 |
| `src/content/chapters/logistic-regression.md` | 新增：frontmatter `title: 邏輯斯迴歸`、`stage: 監督式學習－迴歸`、`interactiveComponent: logistic-regression-fit`；內文依上方九大區塊；`summary:` 區塊留到資訊圖表 PNG 產生的同一 commit 再寫入（依既有規則避免 build 時 `image()` schema 驗證失敗） |
| `src/pages/chapters/[slug].astro` | 修改：新增 `interactiveComponent === 'logistic-regression-fit'` 的字面 JSX 渲染分支 |
| `src/config/curriculum.ts` | 修改：「Logistic Regression（邏輯斯迴歸）」項目補上 `slug: 'logistic-regression'`（`relatedTo` 雙向已預先存在，本次不需再改） |
| `src/config/chapters.ts` | 修改：`lasso-regression.nextSlug = 'logistic-regression'`；新增 `logistic-regression`（`prerequisiteSlug: 'lasso-regression'`，無 `nextSlug`，暫為鏈尾） |
| `src/content/chapters/multiple-linear-regression.md` | 修改：簡介段落補上「與 Logistic Regression 的關係」關聯段落（本側，MLR 側目前已有預埋段落，Logistic 側需要新增；若 MLR 側段落用詞需要微調以呼應本章實際內容，一併確認） |
| `src/config/curriculum.test.ts` | 修改：「恰好 N 個已建置章節」斷言 10→11，插入新章節名稱於正確位置 |
| `docs/specs/chapter_template_guide.md` | 修改：1.1 節核心關聯對照表「Multiple Linear Regression / Logistic Regression」該列狀態從「A 側已補充；B 側建置時補上」改為「兩側已補」 |
| `docs/specs/assets-src/logistic-regression-summary.html` | 新增：Excalidraw 風格資訊圖表來源檔，引用共用 `rough-engine.js` |
| `scripts/render-logistic-regression-infographic.ps1` | 新增：比照既有渲染腳本模式（動態路徑推導）的專用渲染腳本 |
| `src/assets/chapters/logistic-regression-summary.png` | 新增（渲染輸出） |

## 驗證方式

- `npx astro check`：0 錯誤/0 警告
- `npm run build`：12 頁面成功產出（新增本章頁面）
- `npm run test`：新增測試全過（`classification.test.ts`／`loanDefault.test.ts`）；`curriculum.test.ts` 更新後仍通過；既有測試不受影響
- 實作階段需以 TDD 重新驗證上方驗證數據表（本設計文件的數字來自設計階段的驗證腳本，正式 `fitLogisticRegression`／資料生成腳本實作完成後需用單元測試與元件內數值再次確認一致）
- 資訊圖表渲染後親自用 Read 工具開圖檢視（依既有規則，不可只靠子審查 subagent 通過就視為完成）
- 瀏覽器實測：新頁面九區塊正確渲染；互動元件的決策邊界圖、統計數據、混淆矩陣正確顯示且與驗證數據表一致；`chapterOrder` 接續 `lasso-regression` 後鏈結正確；頂部導覽列用 `curl` 核對順序（非截圖，因軌道可能裁切）；Multiple Linear Regression 章節新增的關聯段落正確顯示、既有內容無回歸

## 風險與注意事項

- Multiple Linear Regression 章節屬既有上線頁面的小幅編輯（新增一段關聯段落），需確認不影響既有內容與資訊圖表（資訊圖表本身不需要重新渲染）。
- **本章是本站第一個分類任務**：九大區塊範本本身的區塊「順序」不變，但「分類方式」「數學原理」「評估指標」「運用範例」的具體內容與既有迴歸家族章節完全不同，實作時需注意不要誤用迴歸章節的既有段落當模板複製。
- 資料生成腳本本身不是產品程式碼、不納入 `src/`，僅用於一次性產出 `loan-default.json`；產出後的 JSON 檔才是實際被消費的資料。
- 200 筆資料的固定切分索引獨立於 `dataSplit.ts` 現有的 50 筆版本，兩者不互相影響，也不修改 `dataSplit.ts` 本身。
- 建立 worktree 前依既有慣例先確認本機 main 已推送至 origin。
