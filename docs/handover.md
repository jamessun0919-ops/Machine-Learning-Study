# 交接文件 Handover

> 最後更新：2026-08-04（第 23 個工作階段結束）

## 專案目標 (Project Goal)

建立一個互動式機器學習學習網站（Astro + React + TypeScript + Plotly.js + KaTeX，純靜態部署於 GitHub Pages），從入門到進階涵蓋 `dir.txt` 列出的八階段課程。目前已完成網站骨架、`機器學習介紹`、`CRISP-DM 資料分析方法`、`特徵工程與標準化`、`訓練/測試切分與交叉驗證`、`過擬合/欠擬合與偏差-變異數權衡`、`Simple Linear Regression`、`Multiple Linear Regression`、`Polynomial Regression`、`Ridge Regression`、`Lasso Regression` 十個章節，皆已上線。**階段二（方法論基礎）三個章節已全數完成上線；階段三（監督式學習－迴歸）的「Linear Regression」子分類 5 個主題已全數完成上線（Simple/Multiple/Polynomial/Ridge/Lasso），僅剩 Logistic Regression（邏輯斯迴歸）尚未建置。**

## 已完成進度 (Completed)

- **（第 23 階段）「Lasso Regression（Lasso 迴歸，正則化）」章節完整上線**，接續在 Ridge Regression 之後，沿用九大區塊演算法類範本，延續 Ridge 章節同一組次數 15 多項式資料做「Ridge vs Lasso 係數收縮方式對比」：
  1. `src/lib/regression.ts` 新增 `fitLassoRegression(features, target, lambda, maxIter=200000, tol=1e-12)`：coordinate descent + soft-thresholding（Lasso 無閉式解，跟 Ridge 的矩陣解法不同），欄位置中處理截距（不需要事先標準化即可正確運作），回傳值新增選填 `converged: boolean` 欄位供呼叫者判斷是否真的收斂（第 23 階段最終審查新增，見下方）。
  2. 新元件 `LassoRegressionFit.tsx`：雙區塊設計，與 Ridge 元件結構相同，但兩處刻意不同——**係數條形圖改用線性座標**（非 Ridge 的 log 軸，因 Lasso 白名單內係數量級同一級距、且線性軸才能正確呈現「恰好歸零」）、歸零係數（`|β|<1e-6`）以灰階變色標示並新增「N/15 已歸零」文字統計；λ 白名單為 `0.01, 0.05, 0.1, 1, 10`（**刻意不含 0 與 0.001**，見下方風險記錄）。
  3. 章節內文與課程資料串接：`chapterOrder` 接續在 `ridge-regression` 之後（目前鏈尾）；`curriculum.ts` 的 `relatedTo` **只雙向連到 Ridge Regression 一個**（開發者確認：Polynomial/過擬合欠擬合/特徵工程的關聯已由 Ridge 章節完整覆蓋，不重複寫）；`chapter_template_guide.md` 1.1 節對照表新增 1 列（共 10 組）。
  4. Excalidraw 風格學習摘要資訊圖表：六卡片版面，案例分析為「同 λ=0.01 下 Ridge vs Lasso 對比」（Ridge：test RMSE=0.3204、0/15 歸零，已發布數據；Lasso：test RMSE=0.2764、7/15 歸零，本次驗證數據）。
  5. 全站最終驗證：測試 61/61、`astro check` 0 錯誤/0 警告、`build` 11 頁成功。
- **設計階段連續抓到多個「原始假設與實測數據不符」的問題，皆先寫 Node 驗證腳本拿到真實數字才與開發者確認方向**：
  1. λ=0（無正則化）在這組次數 15 多項式特徵上 **coordinate descent 完全無法收斂**（特徵即使各自標準化過仍高度相關，$X^\top X$ 接近奇異矩陣，上百萬次疊代仍在飄移），故 λ=0 不納入互動白名單，改引用 Ridge 章節已發布的 OLS 基準線做「正則化前」敘事對比，不用 Lasso 求解器重算。
  2. 小 λ 的收斂成本**不可預期地劇烈波動**（非平滑遞增）：λ=0.001 需約 100 萬次疊代（約 2 秒）、λ=0.002 需約 470 萬次疊代（逾 4 秒），此為 coordinate descent 係數卡在歸零門檻邊界的已知病態現象；也驗證過 pathwise warm-start 無法解決（收斂速率取決於條件數，非起始點距離）。
  3. **開發者原則**：「效能與正確性無法兼顧時，寧可拿掉功能也不要湊合」——但本次找到不需妥協的解法：只需把白名單中的 0.001 換成落在安全區間的其他值，最終定案 `0.01, 0.05, 0.1, 1, 10`，全部驗證在 5.6 萬次疊代內收斂（合計 227ms，冷啟動、不需 warm start），互動功能完整保留。
  4. 係數條形圖尺度：Lasso 白名單內最大係數全部落在同一量級（2.46～7.68），跟 Ridge 的 200 倍跨距完全不同，故改用線性座標而非沿用 Ridge 的 log 軸。
- **Subagent-Driven Development 5 個任務全數一次審查通過（無 fix loop）**：Task 1 `fitLassoRegression`（haiku）、Task 2 `LassoRegressionFit.tsx`（haiku）、Task 3 章節內文＋路由串接（sonnet）、Task 4 Ridge 章節回補關聯段落（haiku）、Task 5 資訊圖表（sonnet，implementer 誠實標記出「λ 白名單 CDP 互動驗證屬於 Final Verification 範疇、非 Task 5 本身要求，本次無瀏覽器自動化工具可用」，未略過而是正確標記交由 controller 後續處理）。
- **Final Verification 階段由 Agent 本人補做瀏覽器驗證**：`curl` 核對頂部導覽列順序（`polynomial-regression → ridge-regression → lasso-regression`）；用無頭 Edge 截圖確認互動元件實際渲染，預設 λ=0.01 顯示訓練 RMSE 0.1985／測試 RMSE 0.2764／已歸零係數 7/15，與設計文件表格完全吻合。
- **最終全分支審查（opus model，Ready to merge: Yes）**：獨立重新複算全部數值一致；抓到 2 項 Important 發現——(1) `fitLassoRegression` 疊代法在 `maxIter` 用盡時會靜默回傳錯誤答案，無任何信號告知未收斂（實測 λ=0 燒完 20 萬次疊代仍未收斂，回傳係數與 Ridge 閉式解的真實答案相差 200 倍）；(2) 既有測試讓人誤以為 Lasso 在 λ=0 永遠等價於 OLS，但這在本章實際資料集上會失敗，陷阱只寫在設計文件、程式碼完全沒提示。另抓到 1 項文件錯誤：先前歸咎於 `tol` 設太寬其實是錯誤歸因，真正的收斂保障是 `maxIter`。依規則派一次修復 subagent 處理全部三項（新增 `converged` 回傳欄位＋2 個新測試＋修正文件與程式碼註解），範圍限定複審確認全數 ADDRESSED、無新增破壞。
- 已本機 `merge`（fast-forward）回 `main`、用 `ExitWorktree` 清理 worktree 與已合併分支（6 個 commit 已安全存在於 main）、`git push origin main` 成功，觸發 GitHub Pages 部署，「Lasso Regression」章節正式上線。

## 目前的瓶頸或停頓點 (Current Blocker/Status)

無阻塞。第 23 階段工作已全數完成並推送上線。階段三「Linear Regression」子分類 5 個主題全數完成，下一步需與開發者確認是否接續建置 Logistic Regression（跨入分類任務，會是階段三最後一個主題）。

## 下一步行動 (Next Steps)

1. **下一個章節規劃**：依 `curriculum.ts`／`dir.txt` 順序，階段三僅剩 Logistic Regression（邏輯斯迴歸）尚未建置，建置完即代表階段三全部完成、可進入階段四（監督式學習－分類）。開工時需與開發者確認方向，並依 `brainstorming` 技能重新走一輪需求確認（**不可預設套用九大區塊演算法類範本**——Logistic Regression 雖仍是「演算法類」章節，但屬於分類任務而非迴歸，評估指標、數學原理、運用範例都需要重新設計，不能只是複製 Linear Regression 家族的既有內容）。`curriculum.ts` 中 Logistic Regression 已預先標註 `relatedTo: ['Multiple Linear Regression（多元線性回歸）']`（單側，Multiple Linear Regression 章節已回補），建置時需補上另一側。
2. **其餘跨章節關聯待對應章節建置時處理**：Decision Tree↔Random Forest、Decision Tree↔Boosting、PCA↔K-Means、KNN↔K-Means（共 4 組待補，規則與對照表記錄於 `docs/specs/chapter_template_guide.md` 1.1 節，目前已補 10 組）。
3. **`fitLassoRegression` 的 `converged` 欄位目前尚未被 `LassoRegressionFit.tsx` 消費**：第 23 階段最終審查明確指出這是刻意留下的範圍外事項（三項 fix wave 只要求欄位存在且正確填值，不要求 UI 消費），因為目前的 λ 白名單已知全部安全收斂，UI 不需要對此做任何反應。若未來白名單有變動（例如新增更小的 λ 值），需重新評估是否要在元件裡讀取並顯示 `converged` 狀態。
4. **`fitLassoRegression` 的殘差未定期重算，存在浮點漂移的理論風險**：目前白名單（5.6 萬次疊代以內）不會踩到，但若未來有其他呼叫者用更差條件數或更大樣本數的資料，`tol=1e-12` 這麼緊的門檻可能會被浮點雜訊淹沒而失去意義。已記錄為未來若要修正需要的方向（比照 glmnet/sklearn 定期從 `centeredTarget − X·β` 重新計算殘差），不阻塞本次合併，未動手修改。
5. **`fitLassoRegression`／`fitRidgeRegression` 皆未驗證 `lambda < 0`**：這是兩個函式共用的既有慣例、非本階段新增問題（負 λ 會讓 soft-thresholding 反向放大係數而非收縮，且不會拋錯）。記錄為「該檔案下次被觸碰時」可一併補上的一行防禦，不需要現在特地為此開工。

## 關鍵設定與規則 (Key Context & Rules)

- **技術棧**：Astro (Content Layer API)、React island (`client:only="react"`)、TypeScript、Plotly.js/KaTeX、Vitest、GitHub Pages（`base: '/Machine-Learning-Study/'`）。
- **章節資料結構**：`src/config/chapters.ts` 定義章節順序與 `prerequisiteSlug`/`nextSlug`；內容本體在 `src/content/chapters/*.md`。目前 `chapterOrder` 鏈結順序：`machine-learning-introduction → crisp-dm → feature-engineering-standardization → train-test-split-cross-validation → overfitting-underfitting-bias-variance → simple-linear-regression → multiple-linear-regression → polynomial-regression → ridge-regression → lasso-regression`（鏈尾，尚無 `nextSlug`）。**本站沒有字面文字的「上一步/下一步」按鈕元件**，這個語意是由 `chapterOrder` 透過 `Nav.astro` 轉譯為頂部導覽列的左右排列順序呈現，**頂部導覽列是單行、可水平捲動的軌道**，驗證章節順序應改用 `curl` 取得頁面原始 HTML、核對 `aria-current="page"` 與各 `<a>` 項目順序，不能只靠截圖判斷（軌道可能視覺裁切）。
- **課程知識地圖資料**：`src/config/curriculum.ts` 依 `dir.txt` 完整列出 8 階段，`relatedTo` 欄位標註跨主題關聯，目前已補 10 組雙向（見 `chapter_template_guide.md` 1.1 節對照表），其餘 4 組（Decision Tree↔Random Forest/Boosting、PCA↔K-Means、KNN↔K-Means）仍待對應章節建置時處理。**`relatedTo` 範圍不必每次都比照該主題所有既有關聯全部連上**——第 23 階段 Lasso 章節刻意只連 Ridge 一個（其餘關聯已由 Ridge 章節覆蓋，重複寫會大幅內容重疊），這是需要每次與開發者逐項確認的設計決策，不是固定規則。
- **四套章節範本**（皆已記錄於 `docs/specs/chapter_template_guide.md`）：導覽類、演算法類（九大區塊，1 節，Simple/Multiple/Polynomial/Ridge/Lasso Linear Regression 皆屬此類）、方法論／流程類（CRISP-DM，4 大區塊，1.2 節）、技巧/技術類（特徵工程與標準化／訓練測試切分／過擬合欠擬合皆屬此類，6 大區塊，1.3 節）。**Logistic Regression 雖然預計也用「演算法類」範本，但因為是分類任務而非迴歸，數學原理／評估指標／運用範例內容需要重新設計，不可直接複製 Linear Regression 家族既有段落。**
- **【第 23 階段新規則】任何新增的迭代求解器（無閉式解、需要疊代收斂的演算法），回傳值應該讓呼叫者能判斷是否真的收斂**：`fitLassoRegression` 已示範這個模式（`RegressionResult` 新增選填 `converged?: boolean` 欄位，`fitLinearRegression`／`fitRidgeRegression` 因為是closed-form解、不需要這個欄位、維持不變）。未來若有新章節需要另一個迭代演算法（例如 Logistic Regression 常用的 gradient descent／Newton's method 求解 MLE），應該延續這個模式，不要重蹈「疊代法用盡預算時靜默回傳錯誤答案、沒有任何信號」的坑。
- **【第 23 階段新規則】任何涉及具體數值的教學論述、或任何新引入的演算法之數值行為（尤其是收斂性、效能），都必須先寫 Node 驗證腳本拿到真實數字，不可憑直覺或既有章節的類比假設成立**：本階段連續在教學切入點、λ 白名單、係數尺度三個地方都靠腳本驗證抓到跟預期不符的地方（Ridge 的假設無法直接套用到 Lasso），才確保最終設計是站得住腳的。
- **【第 23 階段新規則】效能與正確性無法兼顧時，優先考慮是否有「不需要妥協」的解法，而非直接詢問開發者要犧牲哪一個**：開發者原則是「寧可拿掉功能也不要湊合」，但 Agent 應該先嘗試找出兩者都能兼顧的方案（本階段的解法是「白名單裡只有一個值有問題，換掉那一個值即可」），確認真的無法兩全時才需要讓開發者在功能與效能之間做取捨。
- **【第 23 階段新規則】疊代演算法的收斂調參（`maxIter`/`tol`）需要小心哪個參數才是真正的約束**：本階段一度誤把收斂保障歸咎於 `tol`（設計階段），最終審查獨立複驗後才發現真正的約束其實是 `maxIter`（`tol` 在合理範圍內幾乎不影響結果）。未來調整任何疊代演算法的效能參數前，應該先用掃描腳本確認「調整哪個參數真的會改變結果」，不要憑推測就寫進文件當作定論。
- **Subagent-Driven Development 的模型選擇分層已在本階段驗證有效**：機械式、計畫已給完整程式碼的任務（Task 1/2/4）用最便宜模型（haiku）即可一次到位；涉及多檔案整合判斷的任務（Task 3）與有較多環境不確定性的任務（Task 5，含外部 PowerShell/Edge 行程）用標準模型（sonnet）；最終全分支審查用最具能力模型（opus）才抓到兩個真正有價值、跨任務視角的 Important 發現（單一任務審查視角看不到）。
- **【延續第 20/22 階段規則，第 23 階段再次驗證有效】建立/修改任何資訊圖表任務後，Agent 本人必須親自用 Read 工具開圖檢視，不能只靠任務審查通過就視為完成**——子審查 subagent 無法檢視二進位圖片檔案，只能明確標記為 ⚠️ 待 controller 確認事項；第 23 階段的 Task 5 正是如此運作。
- **【第 23 階段新驗證】互動元件的「按鈕點擊是否正確切換顯示數值」這類最終驗證，若無 CDP 瀏覽器自動化工具，可用「無頭 Edge 全頁截圖＋視覺核對預設狀態數值」作為足夠證據，搭配「按鈕邏輯與已上線的同構元件比對過、由該任務審查確認接線正確」的推論鏈，不必強求完整的點擊自動化**——本階段用此方法確認了 Lasso 元件的預設 λ=0.01 顯示數值與設計文件表格完全吻合，判定為足夠驗證。無頭 Edge 截圖仍需注意：`--window-size` 決定視窗高度，太小的高度只能截到頁面局部，需要設定足夠大的高度（例如 6500px）才能一次截到頁尾的互動元件區塊。
- **資訊圖表風格已定案**：所有章節統一採用 **Excalidraw 手繪風格**。rough.js 引擎統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`。第 23 階段新增的 `render-lasso-regression-infographic.ps1` 沿用既有動態路徑推導模式（共 9 支渲染腳本）。
- **Ridge/Lasso 的核心教學設計決策對照**（供未來章節規劃參考）：兩者都固定多項式次數 15、都用同一套標準化管線（訓練集算 stats、套用到訓練/測試/曲線取樣點）；差異在 Ridge 用閉式解＋log 軸係數圖＋白名單含 0，Lasso 用 coordinate descent＋線性軸係數圖＋白名單排除 0 與過小值。這些差異都是**驗證後才確認**，不是預設兩者行為相似就套用同一套設計。
- **Canvas 疊層繪製注意事項**：若用 `<canvas>` 繪製連接線/箭頭，優先採用「依容器實際渲染尺寸動態計算座標」的方式，而非把節點/箭頭座標寫死成常數。
- **多條 Plotly trace 共用同一 y 類別時要小心圖例缺失**：若元件關閉 `showlegend`，且多條 trace 的顏色差異是唯一視覺區分依據，務必讓每條 trace 使用不同的 y 軸類別標籤；若圖表是連續數值座標（散佈+曲線圖），改為開啟圖例但關閉互動切換（`itemclick: false`／`itemdoubleclick: false`）。
- **Astro dev/preview server 關閉方法**：`npm run dev` 用 `astro dev stop`；`npm run preview` 為背景 node 行程，需以 `netstat -ano` 找出監聽該連接埠的 PID 後 `taskkill //PID <pid> //F` 強制終止並確認無殘留。**`npm run preview` 是靜態建置結果，程式碼變更後必須關閉→`npm run build`→重新啟動才會反映最新內容。**
- **建立 worktree 前務必確認本機 main 是否已推送至 origin**：原生 `EnterWorktree` 工具預設從 `origin/<default-branch>` 分支，若本機 main 領先 origin，新建的 worktree 會缺少尚未推送的 commit——建立 worktree 前先 `git push origin main` 是標準檢查項目。
- **用原生 `ExitWorktree` 工具清理已合併的 worktree時，即使分支已成功 fast-forward 併入 main，工具仍會因偵測到「該分支有 N 個 commit」而要求二次確認**（回傳錯誤要求加上 `discard_changes: true`）。這是工具本身無法得知這些 commit 已經安全存在於 main 分支上，屬於預期行為、非異常——先用 `git branch --contains <sha>` 或合併後的 `git log` 確認這些 commit 確實都已在 main 上，再加上 `discard_changes: true` 重新呼叫即可。
- **Worktree 清理注意事項**：若刪除 worktree 目錄失敗（檔案被鎖定），先檢查本次 session 內是否有遺留、忘記關閉的 `astro preview`/`astro dev` 行程佔用該路徑。**若合併回主分支後 `npm run test` 顯示的測試數量翻倍**，是已知問題（vitest 不讀 `.gitignore`，殘留的 worktree 目錄內同一份程式碼被重複執行），清除 worktree 後即恢復正常（第 5、16-23 階段皆遇到同一根因）。
- **最終全分支審查若發現 Important 或以上等級的問題，依規則派「一次」修復 subagent 處理完整清單（不逐項分開修），再跑「一次」範圍限定複審**：第 23 階段的 3 項最終審查發現（2 Important + 1 挑選出的 Minor）就是這樣一次處理完成，避免逐項分派造成的 context 重複建置成本。
- **若發現「計畫文件或設計文件本身寫錯」而非「subagent 實作偏離計畫」，應由 Agent 本人核實後直接修正**（連同修復本身一起處理），**僅當修正方向本身存在多種合理解讀、或牽涉架構決策時才需要詢問開發者**：第 23 階段最終審查發現的「`tol` 誤歸因」文件錯誤，修正方向唯一明確（獨立重新掃描參數空間得出的客觀結論），直接修正即可。
- **瀏覽器實測工具與已知限制**：本專案環境未安裝 Playwright/chromium-cli；瀏覽器驗證改用無頭 Microsoft Edge（`--headless --disable-gpu --run-all-compositor-stages-before-draw` + `--screenshot`）。已知限制：React island 水合延遲（`--window-size` 太小或 `--virtual-time-budget` 太短會截到全黑畫面，需要放大兩者）、Astro 圖片優化端點首次請求延遲、`--dump-dom` 對本機 preview 伺服器不穩定、全頁截圖圖片區塊偶發黑色空白、Edge 無頭截圖可能搶在 rough.js canvas 畫完前擷取（timing race）、渲染腳本的 `Test-Path` 成功判定也可能因非同步寫入而失準。**單純的 `--screenshot` 無法驗證按鈕點擊等互動行為**，若需要驗證這類行為但沒有 CDP 工具可用，可退而求其次用「截圖核對預設狀態數值＋程式碼審查確認互動邏輯與已驗證元件同構」的方式作為足夠證據（第 23 階段已示範，見上方新規則）。
- **對話語言**：與開發者對話一律使用繁體中文。
- **執行分支慣例**：凡使用 Subagent-Driven Development 建置新章節，一律先建立獨立 git worktree（優先使用原生 `EnterWorktree` 工具，且需先確認本機 main 已推送至 origin），不再詢問 main vs worktree。SDD 流程中所有 Task 的 implementer/reviewer 都應共用同一個技能層級建立的 worktree，**不可**額外對個別 subagent 派工加上 `isolation: "worktree"` 參數。
