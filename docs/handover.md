# 交接文件 Handover

> 最後更新：2026-08-04（第 24 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`機器學習介紹`、`CRISP-DM 資料分析方法`、`特徵工程與標準化`、`訓練/測試切分與交叉驗證`、`過擬合/欠擬合與偏差-變異數權衡`、`Simple Linear Regression`、`Multiple Linear Regression`、`Polynomial Regression`、`Ridge Regression`、`Lasso Regression`、`Logistic Regression` 十一個章節，皆已上線。**階段二（方法論基礎）三個章節、階段三（監督式學習－迴歸）六個主題（Simple/Multiple/Polynomial/Ridge/Lasso/Logistic）皆已全數完成上線。階段三全部完成，下一步進入階段四（監督式學習－分類）。**

## 已完成進度 (Completed)

- **（第 24 階段）「Logistic Regression（邏輯斯迴歸）」章節完整上線**——**本站第一個分類任務章節**，接續在 Lasso Regression 之後：
  1. **案例資料集決策過程**：開發者原選「經典公開分類資料集」，Agent 指出 Iris 等資料集單一特徵近乎完美線性可分、會讓梯度下降永遠無法收斂（與 Lasso 章節 λ=0 不收斂同一類陷阱），開發者改選「全新真實感合成資料」，定案「貸款違約預測（Loan Default）」情境。
  2. **`src/lib/loanDefault.ts` 新檔案**：200 筆合成貸款資料（`debtToIncomeRatio` 負債佔收入比、`creditScore` 信用分數、`isDefault` 0/1 標籤），比照本站既有 `polynomialFit.ts`（合成資料範例，非 `50-startups.json` 真實資料範例）的慣例——**直接在模組載入時用決定性亂數函式（seeded LCG + Box-Muller）生成，不落地成 JSON 檔、不另寫生成腳本**。刻意設計不平衡（違約約 25%）且非完美線性可分（避免 Iris 那類發散陷阱）。75/25 切分（150/50），因既有 `dataSplit.ts` 的 `SHUFFLED_INDICES` 寫死 50 筆長度、不適用此章節，`loanDefault.ts` 內另外提供一組獨立的 200 筆固定仿射排列 `(i*97+13) mod 200`。
  3. **`src/lib/classification.ts` 新檔案**（不塞進既有 `regression.ts`，關注點不同）：`sigmoid`、`fitLogisticRegression`（批次梯度下降求解 Cross-Entropy Loss，無閉式解，回傳 `{coefficients, converged}`，沿用第 23 階段訂下的「迭代法必須有 converged 信號」規則）、`confusionMatrix`、`accuracy`、`precision`、`recall`、`f1Score`。生產參數 `learningRate=0.3, maxIter=20000, tol=1e-6`，已用驗證腳本確認此章節資料在約 3576 次疊代內收斂。
  4. **`LogisticRegressionFit.tsx` 新元件**：**純靜態展示，無任何控制項**（無按鈕、無下拉選單、無門檻滑桿）——不同於 Ridge/Lasso 的 λ 白名單按鈕或 Multiple LR 的特徵切換下拉，這是開發者明確的 YAGNI 範圍決定。單一 2D 決策邊界散佈圖（全部 200 筆點依實際類別上色，決策邊界只用訓練集 150 筆配適），下方顯示訓練/測試 Accuracy、測試 Precision/Recall/F1、測試集混淆矩陣小表格。
  5. 章節內文九大區塊全部為分類任務原生內容（Sigmoid、Cross-Entropy Loss、混淆矩陣、Accuracy/Precision/Recall/F1），**非**改寫自 Linear Regression 家族既有段落。`chapterOrder` 接續在 `lasso-regression` 之後（目前鏈尾）；`curriculum.ts` 的雙向 `relatedTo` 早已預埋（Multiple LR 側上階段已補），本次只需補上 `slug`。
  6. Excalidraw 風格學習摘要資訊圖表：六卡片版面，案例分析為「Loan Default（貸款違約預測）」，凸顯「測試 Accuracy 88% 看似不錯，但 Recall 只有 66.7%」的 Accuracy 陷阱敘事。
  7. 全站最終驗證：測試 78/78（含新增的 pipeline 釘樁整合測試）、`astro check` 0 錯誤/0 警告、`build` 12 頁成功。
- **設計階段連續用 Node 驗證腳本拿到真實數字才與開發者確認方向**：首次生成的合成資料模型太弱（test recall 僅 16.7%，近乎無用模型），調整真實生成關係的係數強度後重跑，得到 test accuracy 0.88／recall 0.6667——同時滿足「模型本身要夠好用」與「Accuracy 陷阱要有具體數字可談」兩個教學需求，非任意數字。
- **Subagent-Driven Development 5 個任務全數一次審查通過（無 fix loop）**：Task 1 `loanDefault.ts`（haiku，65/65 測試）、Task 2 `classification.ts`（haiku，74/74 測試）、Task 3 `LogisticRegressionFit.tsx`（sonnet，無自動化測試，用暫時性 Vitest 腳本手算驗證數字，因元件尚未掛載頁面、`react-plotly.js` 無法在 Node 獨立解析）、Task 4 章節內文＋路由/設定串接（sonnet，12 頁建置成功、確認 `multiple-linear-regression.md` 確實未被誤觸）、Task 5 Excalidraw 資訊圖表（sonnet，implementer 誠實標記 case study 版面因既有 CSS 造成的文字換行瑕疵，Agent 本人親自開圖＋核對 HTML 原始碼確認為視覺換行、非內容錯誤）。
- **最終全分支審查（opus model，獨立重新執行完整 pipeline 驗證全部發布數字一致）**：抓到 2 項 Important + 1 項需開發者裁決的 plan-mandated 設計問題——
  1. **Important #1**：三處手動維護同一組數字（章節內文、資訊圖表 HTML、程式註解），沒有任何測試釘住，未來若改動 RNG 種子/真實模型係數/超參數預設值，74 個既有測試仍會全綠但文字與已渲染 PNG 會悄悄失真。已修復：新增 `src/lib/loanDefault.classification.integration.test.ts`，直接斷言真實 pipeline 算出的訓練/測試混淆矩陣與四項指標。
  2. **Important #2**：「不收斂」測試只證明 `maxIter` 太小時 `converged` 回傳 false，沒有真正證明「完美可分資料會發散」（換成收斂良好的資料、同樣設定太小的 `maxIter`，斷言一樣會通過）。已修復：新測試比較兩種疊代預算下係數量級的成長倍數（50 vs 5000 次疊代，約 2.67 倍成長），證明真發散而非單純提前中斷。
  3. **需開發者裁決**：決策邊界圖畫全部 200 點（訓練+測試皆有），但下方指標只描述測試集 50 點，視覺與數字不完全對應——這是計畫本身明確規定的做法（非實作偏離），依規則詢問開發者三選項後**裁定保持現狀不修改**（記入帳本：已確認為刻意設計）。
  4. 其餘 4 項 Minor（LaTeX $n$/$p$ 符號局部衝突、缺少「完美可分發散」常見誤區、`DTI_MIN`/`DTI_MAX` 涵蓋全部 200 筆的註解缺失、`regression-chart` CSS class 名稱沿用到非迴歸章節）記入帳本延後，不阻塞合併。
  依規則派一次修復 subagent（不逐項分開修）處理兩項 Important，範圍限定複審確認全數 ADDRESSED、無新增破壞。
- 已本機 `merge`（fast-forward）回 `main`、用 `ExitWorktree` 清理 worktree 與已合併分支（`git branch --contains` 確認 6 個 commit 已安全存在於 main）、`git push origin main` 成功，觸發 GitHub Pages 部署，「Logistic Regression」章節正式上線。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。第 24 階段工作已全數完成並推送上線。**階段三「監督式學習－迴歸」全部完成**，下一步需與開發者確認是否開始階段四（監督式學習－分類：KNN、Naive Bayes、SVM、Decision Tree）。

## 下一步行動 (Next Steps)

1. **下一個章節規劃**：依 `curriculum.ts`／`dir.txt` 順序，階段四「監督式學習－分類」第一個主題是 **KNN（K 最近鄰）**（`curriculum.ts` 中已預先標註 `relatedTo: ['K-Means']`，屬單側，K-Means 建置時需補上另一側）。開工時需與開發者確認方向，並依 `brainstorming` 技能重新走一輪需求確認——KNN 是非參數、無需訓練（lazy learning）的分類演算法，數學原理（距離度量、多數決）、適用情境（K 值選擇、維度詛咒）都與 Logistic Regression 這類參數模型截然不同，**不可預設套用任何既有章節內容**。
2. **Logistic Regression 決策邊界圖的視覺-數字不對應問題已由開發者裁定保持現狀**：決策邊界圖畫全部 200 點、下方指標只描述測試集 50 點，這是刻意設計、非待修事項，未來若有類似「散佈圖範圍 vs 指標範圍不一致」的情境，可參考此次裁決（不視為預設缺陷，需視教學目的個案判斷）。
3. **其餘跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means（共 4 組待補，規則與對照表記錄於 `docs/specs/chapter_template_guide.md` 1.1 節）。
4. **`fitLassoRegression` 既有的技術債仍未處理**（第 23 階段記錄，非本階段新增）：`converged` 欄位未被 UI 消費（刻意，因白名單已知安全收斂）、殘差未定期重算的浮點漂移理論風險、`lambda<0` 未驗證。不阻塞、不需要現在處理。
5. **`classification.ts` 的 `precision`/`recall`/`f1Score` 無零分母防護**（第 24 階段最終審查記錄的 Minor，非阻塞）：若分子分母皆為 0 會產生 `NaN`，目前資料集不會踩到，未來若有新呼叫者用極端不平衡或極小測試集的資料，才需要評估是否補上防護。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`。目前 `chapterOrder` 鏈結順序：`machine-learning-introduction → crisp-dm → feature-engineering-standardization → train-test-split-cross-validation → overfitting-underfitting-bias-variance → simple-linear-regression → multiple-linear-regression → polynomial-regression → ridge-regression → lasso-regression → logistic-regression`（鏈尾，尚無 `nextSlug`）。**本站沒有字面文字的「上一步/下一步」按鈕元件**，這個語意是由 `chapterOrder` 透過 `Nav.astro` 轉譯為頂部導覽列的左右排列順序呈現，**頂部導覽列是單行、可水平捲動的軌道**，驗證章節順序應改用 `curl` 取得頁面原始 HTML、核對 `aria-current="page"` 與各 `<a>` 項目順序，不能只靠截圖判斷（軌道可能視覺裁切）。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，`relatedTo` 欄位標註跨主題關聯。**`relatedTo` 範圍不必每次都比照該主題所有既有關聯全部連上**——這是需要每次與開發者逐項確認的設計決策，不是固定規則。
- **四套章節範本**（皆已記錄於 `docs/specs/chapter_template_guide.md`）：導覽類、演算法類（九大區塊，1 節，Simple/Multiple/Polynomial/Ridge/Lasso/**Logistic** Linear/Logistic Regression 皆屬此類）、方法論／流程類（CRISP-DM，4 大區塊，1.2 節）、技巧/技術類（特徵工程與標準化／訓練測試切分／過擬合欠擬合皆屬此類，6 大區塊，1.3 節）。**Logistic Regression 雖沿用「演算法類」範本結構，但數學原理／評估指標／運用範例內容是分類任務原生設計（Sigmoid、Cross-Entropy Loss、混淆矩陣、Accuracy/Precision/Recall/F1），未複製 Linear Regression 家族既有段落**——這個先例確立了「同範本結構、不同任務類型時內容必須重新設計」的模式，KNN 等後續分類章節開工時應延續此原則。
- **【第 24 階段新規則】合成資料集的存放方式，依「真實資料 vs 合成資料」分兩種既有慣例，寫計畫前務必先查證**：真實資料（如 `50-startups.json`）用靜態 JSON 檔存放（`src/lib/datasets.ts` 匯入）；**合成資料**（本站教學設計出來、非真實世界蒐集的資料）比照 `polynomialFit.ts`／本階段新增的 `loanDefault.ts`，**直接在 TypeScript 模組載入時用決定性亂數函式（非 `Math.random()`）生成，不落地成 JSON、不另寫生成腳本**。第 24 階段設計文件原規劃合成資料要用「JSON 檔＋一次性生成腳本」，寫計畫階段才發現這個更簡單、更貼近既有慣例的做法，已主動修正並告知開發者。
- **【第 24 階段新規則】迭代求解器測試「是否會發散」時，只斷言 `converged === false` 證明力不足**：小 `maxIter` 會讓任何資料（不論是否真的病態）都回傳 `converged: false`，無法區分「真的發散」與「只是提前中斷」。正確做法是比較同一組資料在不同疊代預算下的係數量級成長（例如疊代 50 次 vs 5000 次的係數絕對值比值），量化證明係數持續成長而非收斂到某個有界值。第 24 階段最終審查抓到此問題，修復後的範例見 `src/lib/classification.test.ts`。
- **【第 24 階段新規則】任何教學論述會反覆出現在多處（章節內文、資訊圖表、程式碼註解）的具體數字，若沒有任何測試釘住，是一個未來維護風險**：這類數字即使當下正確，未來只要底層資料生成邏輯或求解器超參數被改動，74 個既有測試可能全數維持綠燈，但散落各處的手動維護數字會悄悄失真而無人察覺。第 24 階段最終審查抓到此問題後，新增 `loanDefault.classification.integration.test.ts` 直接對真實 pipeline 的輸出做端到端斷言，把這類「隱性教學論述正確性」轉換成可自動化驗證的測試。未來任何章節若有類似「案例分析數字」的設計，應在最終審查前主動考慮是否需要這類 pipeline 釘樁測試，不用等審查抓到才補。
- **【第 24 階段新規則】最終全分支審查若抓到「計畫本身明確規定、實作只是忠實執行」的設計問題（plan-mandated finding），不可由 Agent 逕自決定是否修改，必須詢問開發者**：本階段的「決策邊界圖畫 200 點但指標只描述 50 點」正是此類——審查報告本身也明確標記「this is plan-conformant... flagging for confirmation rather than as a coding error」。依規則詢問開發者三個選項（保持現狀／改成四組 trace／只畫測試集），開發者裁定保持現狀後，記入帳本裁決、不修改程式碼即可結案，不需要為了「消除審查發現」而強行修改一個已經是刻意設計的行為。
- **【延續前幾階段規則】任何涉及具體數值的教學論述、或任何新引入的演算法之數值行為，都必須先寫 Node 驗證腳本拿到真實數字，不可憑直覺假設成立**：本階段案例資料集的真實生成關係係數強度第一次設計得太弱（test recall 僅 16.7%），驗證後重新調整才得到「模型可用且教學論述有意義」的平衡點。
- **Subagent-Driven Development 的模型選擇分層持續驗證有效**：資料/求解器等有完整程式碼可直接轉錄的任務用最便宜模型（haiku）；涉及多檔案整合判斷或有外部工具不確定性的任務（元件掛載驗證、章節內容原生性判斷、PowerShell/Edge 渲染）用標準模型（sonnet）；最終全分支審查用最具能力模型（opus）才抓到跨任務視角的深度發現（獨立重跑整個 pipeline 驗證數字，而非只看 diff）。
- **【延續第 20/22/23 階段規則，第 24 階段再次驗證有效】建立/修改任何資訊圖表任務後，Agent 本人必須親自用 Read 工具開圖檢視，不能只靠任務審查通過就視為完成**——子審查 subagent 無法檢視二進位圖片檔案。第 24 階段進一步示範：親眼看圖懷疑某欄位文字疑似重複時，直接核對 HTML 原始碼確認是視覺換行而非內容錯誤，比單純用肉眼判斷更可靠。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`。第 24 階段新增的 `render-logistic-regression-infographic.ps1` 沿用既有動態路徑推導模式（共 10 支渲染腳本，已達到可考慮收斂成單一參數化腳本的規模，最終審查已記錄為未來可做的重構、非本次範圍）。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`；`npm run preview` 為背景 node 行程，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止並確認無殘留。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容。**
- **建立 worktree 前務必確認本機 main 是否已推送至 origin**：原生 `EnterWorktree` 工具預設從 `origin/<default-branch>` 分支，若本機 main 領先 origin，新建的 worktree 會缺少尚未推送的 commit。
- **用原生 `ExitWorktree` 工具清理已合併的 worktree時，即使分支已成功 fast-forward 併入 main，工具仍會因偵測到「該分支有 N 個 commit」而要求二次確認**——先用 `git branch --contains <sha>` 確認這些 commit 確實都已在 main 上，再加上 `discard_changes: true` 重新呼叫即可。
- **若合併回主分支後 `npm run test` 顯示的測試數量翻倍，是已知問題**（vitest 不讀 `.gitignore`，殘留的 worktree 目錄內同一份程式碼被重複執行），清除 worktree 後即恢復正常（第 5、16-24 階段皆遇到同一根因）。
- **最終全分支審查若發現 Important 或以上等級的問題，依規則派「一次」修復 subagent 處理完整清單（不逐項分開修），再跑「一次」範圍限定複審**。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用無頭 Microsoft Edge。React island 元件若尚未掛載到任何頁面（例如仍在早期任務、頁面串接是後續任務才做），無法用 `astro build`/dev mode 驗證計算數字，可改用「暫時性 Vitest 腳本、邏輯與元件完全一致，驗證完刪除」的方式手算驗證（第 24 階段 Task 3 示範，審查已確認此為合理適應而非偏離）。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：凡使用 Subagent-Driven Development 建置新章節，一律先建立獨立 git worktree（優先使用原生 `EnterWorktree` 工具，且需先確認本機 main 已推送至 origin），不再詢問 main vs worktree。
