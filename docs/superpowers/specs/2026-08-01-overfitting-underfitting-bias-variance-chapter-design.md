# 設計方案：過擬合/欠擬合與偏差-變異數權衡 章節

> 日期：2026-08-01（第 19 個工作階段）

## 背景與問題

依 `curriculum.ts` 順序，本主題是階段二（方法論基礎）的最後一個候選主題，緊接在「訓練/測試切分與交叉驗證」之後、「Simple Linear Regression」之前。與前兩個方法論基礎章節（CRISP-DM 為流程類、特徵工程/訓練測試切分為技巧類）不同，本主題的核心概念天生需要「模型配適 + train/test 誤差曲線」的量化視覺化，開發者確認**沿用技巧/技術類範本**（1.3 節，6 大區塊），不修改 `chapter_template_guide.md`。

## 範圍界定

- 只涵蓋過擬合/欠擬合的診斷（如何從 train/test 誤差判斷）與應對策略清單，**不深入**個別解法本身的細節（例如正則化的完整數學推導留給 Ridge/Lasso 章節）。
- Bias²+Variance+不可避免誤差分解公式寫入內文，但不做完整的統計推導證明，只說明每一項的意義與來源。
- curriculum.ts **不新增** `relatedTo`（與 Ridge/Lasso Regression 的關聯，待該章節建置時再處理）。

## 章節內文

### 簡介

> 過擬合（Overfitting）指模型過度學習了訓練資料中的雜訊與細節，導致在訓練集上表現極佳，卻無法類推到新資料；欠擬合（Underfitting）則相反，模型過於簡單，連訓練資料本身的規律都學不好。兩者的核心都是模型複雜度與泛化能力之間的取捨——這正是機器學習方法論中最基礎、也最貫穿全課程的權衡問題。

### 診斷與應對

- **判斷依據**：欠擬合＝train 誤差與 test 誤差都偏高、且兩者接近；過擬合＝train 誤差低、test 誤差高，兩者差距明顯。
- **Bias-Variance 分解公式**（KaTeX）：

  $$\text{Err}(x) = \text{Bias}[\hat f(x)]^2 + \text{Var}[\hat f(x)] + \sigma^2$$

  逐項說明：Bias（偏差）代表模型假設過於簡化、系統性偏離真實規律的程度（對應欠擬合）；Variance（變異數）代表模型對訓練資料的微小變動過度敏感的程度（對應過擬合）；$\sigma^2$ 是資料本身雜訊造成的不可避免誤差，無法透過調整模型消除。
- **應對欠擬合**：提高模型複雜度、增加/工程化特徵、降低正則化強度。
- **應對過擬合**：增加資料量、降低模型複雜度、加入正則化、以交叉驗證挑選模型複雜度、提早停止訓練。

### 適用情境與限制

- 此診斷框架適用於任何監督式學習模型（迴歸與分類皆然），是貫穿後續所有演算法章節的共通概念。
- 限制：真實的 Bias／Variance 無法直接測量（因為真實函數未知），實務上只能透過 train/test 誤差或交叉驗證間接估計、近似。
- 不同模型的「複雜度旋鈕」不同（例如樹的深度、多項式次數、正則化係數），本章僅示範多項式次數這一種，其餘留給對應演算法章節說明。

### 常見誤區

- **只看訓練誤差判斷模型好壞**：訓練誤差極低甚至趨近於 0，反而可能是過擬合的警訊，而非模型優秀的證明。
- **以為增加複雜度/特徵是萬靈丹**：複雜度提升到一定程度後，test 誤差會反轉上升，並非越複雜越好。
- **用 test set 反覆調整模型複雜度**：呼應前一章「訓練/測試切分與交叉驗證」已提過的資訊洩漏問題——挑選模型複雜度應使用驗證集或交叉驗證，test set 只留到最終評估用一次。

## 互動元件規劃

新元件 `OverfittingUnderfittingComparison.tsx`：

- **資料集**：新建合成 1D 資料集，非沿用既有 50 Startups（多元特徵不適合畫多項式曲線）。約 40 個點，`x` 落在固定範圍（暫定 $[-3, 3]$），真實函數用明顯非線性的 sine 型曲線（暫定 $y = \sin(1.5x) \times \text{amplitude} + \text{trend}$，實作時依實際擬合效果微調常數），疊加**固定的確定性雜訊**（沿用 `dataSplit.ts` 已確立的「固定公式常數」慣例，不用 `Math.random()`，確保畫面可重現）。
- **切分**：用既有 `trainTestSplit`（`src/lib/dataSplit.ts`）切成固定 train/test（沿用該檔既有比例常數或另訂固定比例，實作時視資料量微調，避免任一子集過小）。
- **複雜度控制**：白名單按鈕，多項式次數 1／3／5／9／15（非自由滑桿），符合技巧類範本「預先設計展示、非自由調參」規範。
- **雙圖**（Plotly）：
  1. 上圖：train／test 資料點（不同顏色/符號區分）＋目前選中次數的多項式擬合曲線（在 x 範圍內取密集取樣點畫平滑曲線）。
  2. 下圖：train 誤差／test 誤差（RMSE）隨白名單次數變化的固定曲線（5 個次數各算一次，非即時運算），並標記目前選中的次數。
- **統計量顯示**：圖表下方顯示目前次數的 train RMSE／test RMSE 數值。
- **互動限制**：比照既有互動元件慣例，關閉 Plotly 內建拖曳縮放與圖例點擊切換，只保留次數切換按鈕。

## 新增函式庫規劃

`src/lib/polynomialFit.ts`（TDD），最大化重用既有純函式，不重寫矩陣運算：

- 合成資料生成（固定公式，純函式，回傳 `{x, y}[]`）。
- 建構多項式特徵：將純量 $x$ 轉為 $[x, x^2, ..., x^d]$ 特徵陣列，餵給既有 `regression.ts` 的 `fitLinearRegression`／`predict`。
- 逐次數計算 train/test RMSE：對白名單中每個次數，用 `fitLinearRegression` 配適、`predict` 預測、既有 `rmse()` 計算誤差，回傳次數對應誤差的陣列供下圖使用。

**風險**：高次多項式（次數 15）在小樣本、無特徵縮放下可能使 `regression.ts` 的 `solveLinearSystem` 遇到病態矩陣（接近奇異）而拋錯。實作時需視測試結果決定是否縮小 $x$ 範圍、對多項式特徵做標準化，或調整白名單次數上限；此為實作階段依 TDD 實際驗證調整的細節，非本設計文件需要預先鎖死的決策。

## 資訊圖表規劃

Excalidraw 手繪風格，延續本站慣例，4 個視覺區塊（技巧/技術類範本 1.3 節結構）：

1. **簡介卡**：濃縮自章節簡介段落。
2. **方法卡（主視覺）**：三段式曲線對比圖——欠擬合（直線硬套彎曲資料）／很適合（平滑追隨趨勢）／過擬合（重扭鋸齒狀線歪曲包住每個點）三張小圖並列，與互動元件上圖視覺呼應。
3. **適用情境卡**：沿用「適用情境與限制」內容。
4. **常見誤區卡**：一般淺色卡片，比照既有章節風格，不用深色黑板樣式。

## 技術規劃

| 檔案 | 動作 |
|---|---|
| `src/lib/polynomialFit.ts` + `.test.ts` | 新增：合成資料生成、多項式特徵建構、逐次數 train/test RMSE 計算（TDD，重用 `regression.ts`/`dataSplit.ts`） |
| `src/components/charts/OverfittingUnderfittingComparison.tsx` | 新增：互動元件，雙圖（擬合曲線圖＋誤差曲線圖）+ 次數白名單按鈕 + 誤差數值顯示 |
| `src/content/chapters/overfitting-underfitting-bias-variance.md` | 新增：frontmatter `title: 過擬合/欠擬合與偏差-變異數權衡`、`stage: 方法論基礎`、`category: [方法論基礎]`、`interactiveComponent: overfitting-underfitting-comparison`；`summary.image` 指向新 PNG；內文依上方四段落 |
| `src/pages/chapters/[slug].astro` | 修改：新增 `interactiveComponent === 'overfitting-underfitting-comparison'` 的字面 JSX 渲染分支 |
| `src/config/curriculum.ts` | 修改：「過擬合/欠擬合與偏差-變異數權衡」主題項目補上 `slug: 'overfitting-underfitting-bias-variance'` |
| `src/config/chapters.ts` | 修改：`chapterOrder` 插入新章節於「訓練/測試切分與交叉驗證」與「Simple Linear Regression」之間，調整前後項目的 `prerequisiteSlug`/`nextSlug` |
| `src/config/curriculum.test.ts` | 修改：「恰好六個已建置章節」斷言更新為七個，插入新章節名稱於正確位置 |
| `docs/specs/assets-src/overfitting-underfitting-bias-variance-summary.html` | 新增：Excalidraw 風格資訊圖表來源檔，引用共用 `rough-engine.js` |
| `scripts/render-overfitting-underfitting-bias-variance-infographic.ps1` | 新增：比照既有渲染腳本模式的專用渲染腳本 |
| `src/assets/chapters/overfitting-underfitting-bias-variance-summary.png` | 新增（渲染輸出） |

**本次不需修改 `docs/specs/chapter_template_guide.md`**——技巧/技術類範本已於 1.3 節記錄，本章僅是套用既有範本。

## 驗證方式

- `npx astro check`：0 錯誤/0 警告
- `npm run build`：8 頁面成功產出（新增本章頁面）
- `npm run test`：`polynomialFit.test.ts` 新測試全過；`curriculum.test.ts` 更新後仍通過；既有測試不受影響
- 資訊圖表渲染後視覺檢查（優先 DOM 量測法，若矛盾則改用像素分析＋二分搜尋替代法）
- 瀏覽器實測：新頁面六區塊正確渲染；互動元件次數白名單切換正確更新雙圖與誤差數值；`chapterOrder` 插入中段後前後鄰居（訓練/測試切分與交叉驗證、Simple Linear Regression）鏈結正確更新，既有章節無迴歸；頂部導覽列用 `curl` 核對順序（非截圖，因軌道可能裁切）

## 風險與注意事項

- `chapterOrder` 插入中間位置會同時修改「訓練/測試切分與交叉驗證」與「Simple Linear Regression」兩個既有項目的 `prerequisiteSlug`/`nextSlug`，需注意不要漏改任一側。
- 高次多項式擬合的數值穩定性（見上方「新增函式庫規劃」風險段落）需在 TDD 階段實際驗證，若白名單次數上限（15）造成矩陣病態，需與開發者討論調整範圍，不可自行放寬/縮小後略過不報告。
- 合成資料集的固定雜訊公式與真實函數常數，實作時需先寫測試釘住「資料可重現」與「不同次數確實呈現欠擬合→適合→過擬合」的視覺效果，避免曲線在小範圍內看不出明顯差異。
- 建立 worktree 前依既有慣例先確認本機 main 已推送至 origin。
