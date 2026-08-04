# 設計方案：Lasso Regression（Lasso 迴歸，正則化）章節

> 日期：2026-08-04（第 23 個工作階段）

## 背景與問題

依 `curriculum.ts`／`dir.txt` 順序，本主題緊接在「Ridge Regression」之後（階段三「Linear Regression」子分類的最後一個主題）。屬於需要配適模型、有 R²/RMSE 評估指標、有真實案例佐證的具體演算法，開發者確認**沿用九大區塊演算法類範本**（`chapter_template_guide.md` 第 1 節），不修改範本本身。

**教學切入點**：延續 Ridge Regression 章節用過的「多項式次數 15」合成資料案例（`polynomialFit.ts` 已匯出的 `TRAIN_SET`/`TEST_SET`），做 **Ridge vs Lasso 係數收縮方式對比**——Ridge 常見誤區已提及「係數會被縮小但不會恰好變成 0」，Lasso 正是這個對比的另一半：L1 懲罰項會把不重要的係數直接壓成恰好 0，等於在訓練模型同時自動做「特徵選擇」。

**與 Ridge 的關鍵技術差異（本次設計階段已用 Node 腳本逐項驗證，不可預設兩者行為類似）**：

1. **無閉式解**：L1 懲罰項在 $\beta_j=0$ 處不可微分，Ridge 的 `solveLinearSystem` 矩陣解法不適用，需改用迭代演算法（coordinate descent + soft-thresholding）。
2. **收斂特性與 Ridge 完全不同、且不穩定**：這組次數 15 多項式特徵即使個別標準化過，彼此仍高度相關（同一個 x 的不同次方），導致 $X^\top X$ 接近奇異矩陣。coordinate descent 在 λ 很小時收斂極慢，且收斂所需疊代次數**不隨 λ 平滑遞增，而是不可預期地劇烈波動**（實測 λ=0.02 需 36 萬次疊代、λ=0.002 需 470 萬次疊代／換算逾 4 秒，屬 coordinate descent 係數卡在歸零門檻邊界時的已知病態現象）。λ=0（無正則化）更是完全無法收斂（上百萬次疊代仍在飄移，因為此時 OLS 解不唯一）。
3. **係數量級跟 Ridge 差很多**：Ridge 白名單內最大係數絕對值跨越 1450→5.76（相差 200 倍以上，需要 log 軸）；Lasso 白名單內最大係數全部落在個位數到十位數（2.46～7.68，同一量級），**不需要 log 軸，線性軸即可**，且線性軸才能正確呈現「恰好歸零」的長條（log 軸無法顯示 0）。

## 範圍界定

- 重用 `polynomialFit.ts` 已匯出的 `TRAIN_SET`/`TEST_SET`，**固定次數 15，不提供次數切換**（與 Ridge 一致的理由：本章聚焦 λ 本身的效果）。
- 特徵標準化為必要步驟：重用 `scaling.ts` 的 `computeStats`/`applyZScore`（與 Ridge 共用同一套標準化管線，訓練集算出的 mean/std 套用到訓練/測試/曲線取樣點）；**不正則化截距項**。
- **λ 白名單定案為 `0.01, 0.05, 0.1, 1, 10`**（不含 0.001／0 等更小值）。
  - **排除 λ=0 的理由**：coordinate descent 在此資料集上完全無法收斂於 λ=0（已於上方說明），且真實世界 Lasso 套件（glmnet、scikit-learn）本身也不會在 λ=0 這樣求解。「正則化前」的敘事改為引用 Ridge／Overfitting 章節**已發布**的 OLS 基準線（test RMSE=0.8024），不用 Lasso 求解器重算這個點。
  - **排除 λ<0.01 的理由（開發者決策：效能與正確性無法兼顧時寧可不做，不湊合）**：實測 λ=0.001 需要約 100 萬次疊代（單一 λ 約 2 秒），λ=0.002 更需要 470 萬次疊代（逾 4 秒），且此病態行為不可預期（無法用簡單門檻公式預先判斷哪個 λ 會踩雷），若放進互動白名單會讓元件掛載時有機率性的長時間凍結。改採用 `0.01, 0.05, 0.1, 1, 10`，五個值全部驗證在 5.6 萬次疊代以內收斂（<50ms／值，五個值加總實測 227ms），無效能風險，且不犧牲任何正確性或互動功能。
  - 已測試過 pathwise warm-start（由大 λ 往小 λ 依序求解、用前一個解當起始值）**無法解決**小 λ 的收斂緩慢問題（warm start 後 λ=0.001 仍需近 100 萬次疊代）——因為 coordinate descent 的收斂速率取決於問題本身的條件數，不是取決於起始點與最終解的距離，故不採用此方案。
- **`fitLassoRegression(features, target, lambda)` 求解器**：coordinate descent + soft-thresholding，懲罰項跳過截距（index 0），於 `src/lib/regression.ts` 新增，重用既有 `rmse`/`rSquared`/`predict`；生產參數 `maxIter=200000, tol=1e-12`（已驗證此參數組合在最終白名單五個值皆能真正收斂到正確解，不會因提前跳出而誤判歸零係數數量——設計階段曾誤用過小的 `maxIter=300000` 組合，結果讓 λ=0.01 附近的係數被誤判為未歸零，已排除此陷阱）。**最終審查時已重新驗證：真正的收斂保障是 `maxIter`，不是 `tol`**——對 tol 從 1e-6 到 1e-12 做掃描，只要 `maxIter` 夠大（約 5.6 萬以上），結果完全不受 tol 影響；反之若 `maxIter` 低於約 5.6 萬，即使 `tol=1e-12`（目前生產值）也會重現同樣的錯誤結果。往後調整效能時不要誤以為調緊 tol 可以彌補調低 maxIter 的風險。
- 評估指標沿用 train/test 雙集顯示，另外新增 Lasso 特有指標「歸零係數數量」。
- **同一 λ 值的 Ridge vs Lasso 直接對比**（案例分析核心賣點）：以 λ=0.01 為例，Ridge 收縮但保留全部 15 個係數（test RMSE=0.3204、maxCoef=5.7643、0/15 歸零，已發布數據)；Lasso 在同一 λ 下 test RMSE=0.2764（更低）、maxCoef=7.6830、**7/15 歸零**——同一個懲罰強度，Ridge 平滑收縮、Lasso 自動篩選特徵，效果質變。
- `curriculum.ts` 新增 `relatedTo: ['Ridge Regression（Ridge 迴歸，正則化）']`（**只連 Ridge 一個**，開發者確認：Polynomial/過擬合欠擬合/特徵工程的關聯已由 Ridge 章節完整覆蓋，重複寫三段會與 Ridge 內容大幅重疊；Ridge 章節的 `relatedTo` 也需回頭補上 Lasso，維持雙向）。
- 不涉及 Elastic Net（L1+L2 混合）——不在 `dir.txt` 課程範圍內，不主動引入。

## 最終驗證數據（次數 15，`maxIter=200000, tol=1e-12`，供實作階段對照）

| λ | train RMSE | test RMSE | test R² | 最大\|係數\| | 歸零係數數(/15) |
|---|---|---|---|---|---|
| 0.01 | 0.1985 | 0.2764 | 0.9777 | 7.6830 | 7 |
| 0.05 | 0.2038 | 0.2811 | 0.9769 | 6.4517 | 8 |
| 0.1 | 0.2093 | 0.2875 | 0.9759 | 6.0350 | 8 |
| 1 | 0.2837 | 0.3057 | 0.9727 | 5.0267 | 11 |
| 10 | 0.9012 | 0.9128 | 0.7565 | 2.4617 | 12 |

（對照：OLS／λ=0 基準線引用 Ridge 章節已發布數據 test RMSE=0.8024，不由 Lasso 求解器重算。）

## 章節內文

### 簡介

Lasso Regression 在線性回歸的損失函數中加入 L1 正則化項（係數絕對值之和），與 Ridge 的 L2 懲罰不同之處在於：L1 懲罰會把不重要的係數直接壓成恰好 0，等於在訓練模型的同時自動做「特徵選擇」。

**與 Ridge Regression 的關係**：兩者都是抑制係數過大的正則化手段，差異在懲罰項的形狀——Ridge 用平方項（處處可微），Lasso 用絕對值（在 0 處不可微），這個數學差異直接導致 Lasso 會把係數壓到恰好 0、Ridge 不會。本章案例延續 Ridge 章節同一組次數 15 多項式資料，在相同 λ 下直接對比兩者的係數收縮方式：同樣 λ=0.01，Ridge 保留全部 15 個係數，Lasso 則有 7 個係數恰好歸零。

### 分類方式

- 學習類型：監督式學習
- 任務類型：迴歸
- 模型類型：正則化線性模型

### 數學原理

$$J(\beta) = \sum_{i=1}^{n}(y_i - \hat y_i)^2 + \lambda \sum_{j=1}^{p}|\beta_j|$$

（懲罰項不含截距 $\beta_0$）

與 Ridge 不同，L1 懲罰項在 $\beta_j=0$ 處不可微分，**沒有閉式解**，需用迭代演算法求解。本站採用 coordinate descent，逐一更新每個係數：

$$\beta_j \leftarrow \frac{S(\rho_j,\ \lambda/2)}{\sum_i x_{ij}^2}$$

其中 $S(z,\gamma)=\text{sign}(z)\max(|z|-\gamma,0)$ 是軟門檻算子（soft-thresholding），$\rho_j$ 是排除 $\beta_j$ 貢獻後的殘差相關性。當 $|\rho_j|$ 小於門檻 $\lambda/2$ 時，$\beta_j$ 會被直接設為 0——這正是特徵選擇效果的數學來源。

- 使用前必須先將特徵標準化，理由與 Ridge 相同（見「與特徵工程與標準化的關係」，已由 Ridge 章節涵蓋）。

### 運用範例

- **高次多項式係數自動篩選**（本章案例）：延續 Ridge 資料，展示 L1 正則化不只收縮、還會篩掉冗餘的高次項
- **高維稀疏建模**：特徵數遠大於樣本數、且僅少數特徵真正有效的情境（如基因體學、文字特徵）
- **需要精簡模型、丟棄冗餘特徵以利解讀時**

### 適用情境與限制

**適合使用的情境：**
- 想自動做特徵選擇、精簡模型
- 特徵數多、懷疑許多特徵是雜訊或冗餘
- 需要可解釋性較高、係數較稀疏的模型

**限制與假設：**
- 沒有閉式解，需迭代求解（coordinate descent），計算成本較 Ridge 高，且在特徵高度相關時可能收斂緩慢
- 特徵間高度相關時，Lasso 傾向從相關的一群特徵中挑一個保留、其餘設為 0，換一批資料可能選到不同特徵，選擇結果不穩定
- 前提仍是特徵已標準化，否則懲罰力道被特徵尺度扭曲

### 評估指標

- R²（決定係數）
- RMSE（均方根誤差），train/test 雙集顯示
- 歸零係數數量（Lasso 特有，量化特徵選擇的效果）

### 常見誤區

- **誤以為 Lasso 和 Ridge 只是「換一個公式」、效果差不多**：L1/L2 的可微性差異直接導致行為質變（歸零 vs 平滑收縮），同一個 λ 值下兩者的模型結構可能完全不同
- **誤以為 Lasso 選出的特徵組合就是「真正重要」的特徵**：當特徵高度相關時，被選中或被歸零可能只是任意的（見上方限制）
- **忘記標準化就直接套用 Lasso**：與 Ridge 同理，懲罰力道會被特徵尺度扭曲

## 互動元件規劃

新元件 `LassoRegressionFit.tsx`，結構比照 `RidgeRegressionFit.tsx`（雙區塊設計），但依上方驗證結果做兩項關鍵調整：

- **上方**：Plotly 散佈圖＋配適曲線（次數固定 15，重用 `polynomialFit.ts` 的 `TRAIN_SET`/`TEST_SET`；`polynomialFeatures()` 依既有慣例局部複寫於元件內）。
- **下方**：係數條形圖，顯示標準化空間下的 $|\beta_1|,\ldots,|\beta_{15}|$（不含截距，取絕對值）。**改用線性座標**（不沿用 Ridge 的 log 軸——已驗證 Lasso 白名單內最大係數同一量級，無需 log 軸，且線性軸才能正確呈現「恰好為 0」的長條）。
  - **歸零係數（`|β|<1e-6`）以不同顏色（灰階，區別於非零係數的主色）標示**，並在圖表旁新增文字統計「N / 15 個係數已歸零」，讓「隨 λ 增加、越來越多特徵被剔除」的效果一眼可見。
- **λ 白名單按鈕**：`0.01, 0.05, 0.1, 1, 10`（5 個按鈕，與 Ridge 版面一致）。
- 下方數值顯示：train RMSE／test RMSE／歸零係數數量。
- **標準化流程**：與 Ridge 共用同一套（`computeStats`/`applyZScore`，訓練集算出的 mean/std 套用到訓練/測試/曲線取樣點）。
- **效能設計**：`LAMBDA_FITS` 於 module load 時一次算完全部 5 個 λ 的結果（比照 Ridge 的 `LAMBDA_FITS`/`polynomialFit.ts` 的 `CURVE_FITS` 模式），按鈕點擊只切換顯示、不即時運算。`fitLassoRegression` 使用 `maxIter=200000, tol=1e-12`，已驗證此參數下 5 個白名單值合計運算 227ms（cold start，不需要 warm start），無感知延遲。

## 資訊圖表規劃

Excalidraw 手繪風格，延續本站慣例，九大區塊範本的 6 個視覺區塊結構（`chapter_template_guide.md` 第 5 節）：

1. **簡介卡**：濃縮自章節簡介段落。
2. **模型公式卡**：$J(\beta)=\sum(y_i-\hat y_i)^2+\lambda\sum|\beta_j|$，並標註「無閉式解，需迭代求解」。
3. **適用情境卡**：想做特徵選擇時適用、特徵相關性高時選擇不穩定、需標準化。
4. **評估指標卡**：R²/RMSE/歸零係數數量。
5. **常見誤區卡**。
6. **案例分析**（深色 footer/黑板樣式，固定在最底部）：標題「案例分析：Ridge vs Lasso 係數收縮方式對比（多項式次數 15，λ=0.01）」，展示同一 λ=0.01 下 Ridge（test RMSE=0.3204、0/15 歸零，已發布數據）vs Lasso（test RMSE=0.2764、7/15 歸零，本次驗證數據）的對比。

## 技術規劃

| 檔案 | 動作 |
|---|---|
| `src/lib/regression.ts` + `.test.ts` | 新增 `fitLassoRegression(features, target, lambda, maxIter?, tol?)`：coordinate descent + soft-thresholding，懲罰項跳過截距；預設 `maxIter=200000, tol=1e-12`；新增測試驗證 soft-threshold 行為（小 rho 應歸零）、λ 增加時歸零係數數量不遞減、與已知簡單案例的解析解比對 |
| `src/components/charts/LassoRegressionFit.tsx` | 新增：雙區塊互動元件（配適曲線圖＋線性座標係數條形圖，歸零係數變色＋文字統計），λ 白名單按鈕 `0.01, 0.05, 0.1, 1, 10` |
| `src/content/chapters/lasso-regression.md` | 新增：frontmatter `title: Lasso 迴歸`、`stage: 監督式學習－迴歸`、`interactiveComponent: lasso-regression-fit`；內文依上方九大區塊；**`summary:` 區塊留到資訊圖表 PNG 產生的同一 commit 再寫入**（依第 22 階段既有規則，避免 build 時 `image()` schema 驗證失敗） |
| `src/pages/chapters/[slug].astro` | 修改：新增 `interactiveComponent === 'lasso-regression-fit'` 的字面 JSX 渲染分支 |
| `src/config/curriculum.ts` | 修改：「Lasso Regression」項目補上 `slug: 'lasso-regression'`、`relatedTo: ['Ridge Regression（Ridge 迴歸，正則化）']`；「Ridge Regression」項目的 `relatedTo` 補上 `'Lasso Regression（Lasso 迴歸，正則化）'`（雙向） |
| `src/config/chapters.ts` | 修改：`ridge-regression.nextSlug = 'lasso-regression'`；新增 `lasso-regression`（`prerequisiteSlug: 'ridge-regression'`，無 `nextSlug`，暫為鏈尾） |
| `src/content/chapters/ridge-regression.md` | 修改：簡介段落補上「與 Lasso Regression 的關係」關聯段落 |
| `src/config/curriculum.test.ts` | 修改：「恰好 N 個已建置章節」斷言 9→10，插入新章節名稱於正確位置 |
| `docs/specs/chapter_template_guide.md` | 修改：1.1 節核心關聯對照表新增 1 列（Ridge Regression↔Lasso Regression） |
| `docs/specs/assets-src/lasso-regression-summary.html` | 新增：Excalidraw 風格資訊圖表來源檔，引用共用 `rough-engine.js` |
| `scripts/render-lasso-regression-infographic.ps1` | 新增：比照既有渲染腳本模式（`$repoRoot = Split-Path -Parent $PSScriptRoot` 動態路徑）的專用渲染腳本 |
| `src/assets/chapters/lasso-regression-summary.png` | 新增（渲染輸出） |

**本次不需修改 `docs/specs/chapter_template_guide.md` 的範本結構本身**（第 1、5 節九大區塊定義不變），僅新增 1.1 節關聯對照表的 1 列。

## 驗證方式

- `npx astro check`：0 錯誤/0 警告
- `npm run build`：11 頁面成功產出（新增本章頁面）
- `npm run test`：`regression.test.ts` 新測試全過（含 `fitLassoRegression` 的 soft-threshold 行為、歸零單調性驗證）；`curriculum.test.ts` 更新後仍通過；既有測試不受影響
- 資訊圖表渲染後親自用 Read 工具開圖檢視（依既有規則，不可只靠子審查 subagent 通過就視為完成）
- 瀏覽器實測：新頁面九區塊正確渲染；互動元件 λ 白名單切換正確更新配適曲線、係數條形圖（線性軸、歸零係數變色）、train/test RMSE／歸零係數數量；元件掛載無感知延遲（驗證 227ms 運算不造成畫面凍結）；`chapterOrder` 接續 `ridge-regression` 後鏈結正確；頂部導覽列用 `curl` 核對順序（非截圖，因軌道可能裁切）；Ridge Regression 章節新增的關聯段落正確顯示、既有內容無回歸

## 風險與注意事項

- Ridge Regression 章節屬既有上線頁面的小幅編輯（新增一段關聯段落），需確認不影響既有內容與資訊圖表（資訊圖表本身不需要重新渲染）。
- 實作階段需以 TDD 重新驗證上方最終驗證數據表（本設計文件的數字來自設計階段的驗證腳本，正式 `fitLassoRegression` 實作完成後需用單元測試與元件內數值再次確認一致，特別留意 `maxIter`/`tol` 參數是否確實複用本文件驗證過的組合，避免重蹈設計階段「參數組合太寬鬆導致誤判歸零係數數量」的陷阱）。
- `applyZScore` 已在 Ridge 章節實作並測試過 `std === 0` 邊界情況，本章直接重用，不需重新處理。
- 建立 worktree 前依既有慣例先確認本機 main 已推送至 origin。
