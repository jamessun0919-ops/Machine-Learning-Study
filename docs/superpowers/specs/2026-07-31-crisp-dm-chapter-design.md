# 設計方案：CRISP-DM 資料分析方法 章節

> 日期：2026-07-31（第 15 個工作階段）

## 背景與問題

依課程規劃（`dir.txt` 階段一），下一個章節是「CRISP-DM 資料分析方法」。開發者要求先分析此主題該沿用「機器學習介紹」章節的導覽式範本，還是需要建立新範本。

分析結論：兩者皆不適合。「機器學習介紹」範本的「機器學習的分類」「全課程知識地圖」兩區塊是針對課程首頁設計，CRISP-DM 是單一方法論主題不需要重複；9 區塊演算法範本的「數學原理」「評估指標」「運用範例」「互動式操作」則因 CRISP-DM 沒有公式、沒有要配適的模型、不需要互動元件而放不進去。因此建立第三種「方法論／流程類」章節範本。

技術面確認：`content.config.ts` 的 `interactiveComponent`／`summary` 皆為 optional，新章節不設定 `interactiveComponent` 即可讓 `[slug].astro` 自動不渲染互動區塊與其跳轉連結，不需修改任何既有程式碼。

## 範本結構（本次確認，供未來同類方法論主題參考）

4 個區塊：簡介／核心流程（依主題而定，此處為「CRISP-DM 六大階段」）／常見誤區／學習摘要資訊圖表。無「案例分析」統計結果區塊、無互動式操作區塊。

## 章節內文

### 簡介

> CRISP-DM（Cross-Industry Standard Process for Data Mining，跨產業資料探勘標準流程）是資料科學／機器學習專案最廣泛採用的標準作業流程，最早由多家企業於 1990 年代共同制定。它把一個資料分析專案拆解成六個階段，從釐清業務目標開始，一路到模型上線後的維護，提供一套可依循的檢查清單，避免專案「一頭栽進建模，卻忘了要解決什麼問題」。

### CRISP-DM 六大階段

範例情境（貫穿六階段，敘事性描述、不列具體數字，與「無案例分析」的決定協調——此範例僅用於說明流程本身，非統計建模結果展示）：一間新創加速器想用「50 Startups」財務資料集，預測新創公司的獲利，以篩選潛在投資標的。50 Startups 是本站既有資料集（`src/data/50-startups.json`），CRISP-DM 章節在課程順序上早於 Simple/Multiple Linear Regression，讀者會先在此處認識這份資料，後續學到回歸章節時會有既有印象。

六個階段，各階段標題＋定位句＋3 項子清單（常見產出／檢查重點，皆為敘事性描述）：

1. **Business Understanding（業務理解）**：將業務問題轉譯成資料科學問題（迴歸任務：用支出結構預測獲利）；定義可衡量的成功指標；初步評估手上是否有足夠資料支撐目標。
2. **Data Understanding（資料理解）**：盤點欄位（研發／行政／行銷支出、州別、獲利）；檢查資料品質（缺失值、異常值）；初步觀察哪些欄位與獲利較有關聯。
3. **Data Preparation（資料準備）**：處理類別欄位（州別編碼）；檢查並處理極端值；切分訓練／測試資料集。
4. **Modeling（建模）**：選擇線性回歸類模型；訓練模型估計各支出的影響程度；效果不理想時回頭調整 Data Preparation（與 Data Preparation 交替進行的反饋迴圈）。
5. **Evaluation（評估）**：不只看統計配適度，更要確認預測結果對投資決策實際有幫助；檢查特定類型公司上是否有系統性誤差；確認結果符合 Business Understanding 設定的目標才進入下一階段（與 Business Understanding 的反饋迴圈）。
6. **Deployment（部署）**：整合進投資篩選流程／決策儀表板；建立監控機制追蹤上線後表現；規劃定期重新訓練模型的維護週期。

### 常見誤區

- **把 CRISP-DM 當成單向線性流程**：實際上各階段（尤其 Data Preparation↔Modeling、Evaluation↔Business Understanding）經常需要反覆回頭調整，是一個循環，而非一次性通過的檢查清單。
- **跳過 Business Understanding 直接建模**：沒有先定義清楚業務目標與成功標準，容易做出「技術指標很好看，卻解決不了實際問題」的模型。
- **把 Deployment 當成專案終點**：模型上線後若沒有持續監控資料與模型表現的變化（Data Drift／Model Drift），預測品質會隨時間推移而劣化。

## 技術規劃

| 檔案 | 動作 |
|---|---|
| `src/content/chapters/crisp-dm.md` | 新增：frontmatter `title: CRISP-DM 資料分析方法`、`stage: 課程導覽`、`category: [課程導覽]`；**不設定** `interactiveComponent`；`summary.image` 指向新 PNG，`summary.formulas`/`summary.keyStats` 設為空陣列（schema 必填但圖片模式下不渲染，維持與 `ChapterSummaryCard.astro` 既有機制一致）；內文依上方三段落（簡介／六大階段／常見誤區） |
| `src/config/curriculum.ts` | 修改：「CRISP-DM 資料分析方法」主題項目補上 `slug: 'crisp-dm'`，使知識地圖可點擊前往 |
| `src/config/chapters.ts` | 修改：`chapterOrder` 陣列插入 crisp-dm 項目（`stage: '課程導覽'`），並依既有欄位慣例調整前後項目的 `prerequisiteSlug`/`nextSlug`：機器學習介紹 → CRISP-DM → 簡單線性回歸 → 多元線性回歸 |
| `docs/specs/assets-src/crisp-dm-summary.html` | 新增：Excalidraw 風格資訊圖表來源檔，引用共用 `rough-engine.js` |
| `scripts/render-crisp-dm-infographic.ps1` | 新增：比照既有渲染腳本模式的專用渲染腳本 |
| `src/assets/chapters/crisp-dm-summary.png` | 新增（渲染輸出） |

## 資訊圖表規劃

因無案例分析黑板區塊、也無公式/限制/指標卡，版面簡化為 3 個視覺區塊：

1. **簡介卡**：濃縮自章節簡介段落
2. **六大階段循環圖**（主視覺）：六階段圍繞「Data」中心排列、帶反饋箭頭的經典 CRISP-DM 循環圖，取代其他章節的公式卡位置
3. **常見誤區卡**：一般淺色卡片，比照其他章節風格，取代原本的深色黑板案例分析區塊（本章無數據案例可放）

## 驗證方式

- `npx astro check`：0 錯誤/0 警告
- `npm run build`：5 頁面成功產出（新增 crisp-dm 頁面）
- `npm run test`：既有測試不受影響（`curriculum.test.ts` 需確認新增 `slug` 欄位後仍通過）
- 資訊圖表渲染後由開發者本機檢視確認（沿用第 14 階段建立的 `.page` 高度精確量測校正法）
- 瀏覽器實測：新頁面「簡介／CRISP-DM 六大階段／常見誤區／學習摘要」四區塊正確渲染；知識地圖頁面確認 CRISP-DM 項目已可點擊；首頁導覽列與既有 3 章節的上一頁/下一頁鏈結未受影響

## 風險與注意事項

- `prerequisiteSlug`/`nextSlug` 欄位目前在程式碼中定義但未被實際消費（無 prev/next 導覽 UI），本次僅依既有陣列慣例填入，不影響現有渲染結果。
- 六大階段的 50 Startups 範例為敘事性描述、不含具體計算數字，避免與「無案例分析」的決定衝突；若之後開發者要求補充數字佐證，需重新確認是否要引用 Multiple Linear Regression 章節已算出的真實 R²/RMSE 等數值。
- 本次確立的「方法論／流程類」4 區塊範本可供未來同類主題（如「訓練/測試切分與交叉驗證」等階段二主題）參考，但個別章節內容仍需與開發者逐一確認，不可預設套用。
