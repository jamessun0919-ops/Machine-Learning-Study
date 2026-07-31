# 設計方案：多元線性回歸學習摘要圖表改為 Excalidraw 風格

> 日期：2026-07-31（第 13 個工作階段延伸工作）

## 背景與問題

「多元線性回歸」章節目前的學習摘要資訊圖表（`multiple-linear-regression-summary.png`）是白底向量風格，由開發者用外部圖像生成工具手動製作。專案已於本階段前定案：後續所有章節統一採用 Excalidraw 手繪風格（rough.js + HTML/CSS + 無頭瀏覽器渲染），白底向量風格已停用。開發者要求將此章節既有圖表補做成 Excalidraw 風格，與「簡介」介紹、「簡單線性回歸」章節一致。

## 範圍

- 新增 Excalidraw 風格資訊圖表來源檔與渲染腳本，取代既有白底向量風格 PNG。
- 更新 `multiple-linear-regression.md` frontmatter 的 `summary.image` 指向新圖片。
- 刪除舊的白底向量風格 PNG（換圖後已無引用，且開發者確認一併刪除）。
- 不變更 `summary.formulas`/`summary.keyStats`（schema 要求保留但圖片模式下不渲染，維持現狀不動）。
- 不變更 `ChapterSummaryCard.astro` 元件邏輯（既有的圖片/文字二選一渲染機制已支援本次需求，不需修改）。

## 執行順序（開發者要求）

1. 先建立資訊圖表來源檔並渲染成 PNG。
2. 交給開發者本機檢視確認畫面效果。
3. 開發者確認後，才將新圖片接入 `multiple-linear-regression.md` frontmatter，並刪除舊圖片。

## 資訊圖表內容規格

比照 `docs/specs/assets-src/simple-linear-regression-summary.html` 的版面與 CSS 風格（同一份 `rough-engine.js`），六個區塊依 `chapter_template_guide.md` 第 5 節固定順序：

### ①簡介
多元線性回歸是簡單線性回歸的延伸，用兩個以上自變數（特徵）預測一個連續目標變數；例如用研發、行政、行銷三項支出預測公司獲利。假設目標變數與各特徵間存在線性關係，只是這條「線」變成高維度的「平面」或「超平面」。
標籤：監督式學習／迴歸任務／最小平方法（常態方程式）

### ②模型公式
- `y = β₀ + β₁x₁ + β₂x₂ + ⋯ + βₙxₙ + ε`
- `β̂ = (XᵀX)⁻¹Xᵀy`

說明：β₀ 是截距、β₁...βₙ 是各特徵係數、ε 是誤差項；訓練目標是找到一組 β̂ 使殘差平方和最小，上式為對應的常態方程式閉式解。沿用簡單線性回歸卡片同款文字式公式排版（非真正矩陣格線圖，符號用 Unicode 上標／斜體呈現）。

### ③適用情境與假設限制（雙欄）
✓ 適合情境：
- 目標變數與特徵間大致呈線性關係
- 需要模型「可解釋」——每個係數代表對應特徵每增加一單位的邊際影響

⚠ 假設與限制：
- 線性關係假設：明顯非線性時應改用 Polynomial Regression
- 殘差獨立同分布：違反時標準誤與信賴區間不準確
- 多重共線性：特徵間高度相關時係數估計不穩定

### ④評估指標（雙格）
- R²（決定係數）：範圍 0～1，越接近 1 代表模型解釋力越強
- RMSE（均方根誤差）：單位與目標變數相同，越小代表預測越準

### ⑤常見誤區
- 把相關性當因果：R&D 支出與獲利高度相關，不代表花更多錢必然導致獲利提高，可能受第三個因素（如公司規模）影響
- 忽略多重共線性：某特徵係數小不代表不重要，可能只是共線性造成
- 外插推論：模型只在訓練資料數值範圍內可靠

### ⑥案例分析（黑板風格，固定最底部）
標題：案例分析：50 Startups（50 家新創公司財務資料及利潤預測）
副標：同時用「研發、行政、行銷」三項支出配適，示範多元線性回歸的常態方程式解

metabar：資料集＝50 Startups／樣本數＝50／特徵＝3 項支出／目標變數＝Profit／求解方式＝常態方程式

係數表（4 列 × 2 欄，直式——與簡單線性回歸的橫式 2 欄不同，因本例有 4 個係數而非 2 個）：

| 係數 | 估計值 |
|---|---|
| 截距 β₀ | 50122.19 |
| R&D Spend β₁ | 0.8057 |
| Administration β₂ | -0.0268 |
| Marketing Spend β₃ | 0.0272 |

大字統計：R²＝0.9507、RMSE＝8855.34

洞察文字：
- 研發支出每多花 1 元，預測獲利平均增加約 0.81 元
- 行銷支出邊際效應較小（約 0.03 元／元）；行政支出的邊際效應在控制其他變數後接近零甚至輕微為負，反映多重共線性下單一係數的不穩定性（呼應上方「常見誤區」）
- R²＝0.9507，模型解釋了約 95% 的獲利變異
- 本結果為全樣本配適（非留出測試集），用於教學示範常態方程式解

以上數值皆為對 `src/data/50-startups.json` 全部 3 個數值特徵（R&D Spend、Administration、Marketing Spend）實際執行與 `src/lib/regression.ts` 相同演算法（常態方程式）計算所得的真實結果，非虛構數字。

## 技術檔案規劃

| 檔案 | 動作 |
|---|---|
| `docs/specs/assets-src/multiple-linear-regression-summary.html` | 新增：Excalidraw 風格來源檔，引用共用 `rough-engine.js`，比照 `simple-linear-regression-summary.html` 的 CSS class 與 `data-sketch` 手繪畫框機制 |
| `scripts/render-mlr-infographic.ps1` | 新增：比照 `scripts/render-infographic.ps1` 模式的專用渲染腳本，`--window-size` 依實際內容高度調整（六區塊 + 案例分析黑板，預期比簡單線性回歸版本略高，因案例分析係數表多兩列） |
| `src/assets/chapters/multiple-linear-regression-summary.png` | 新增（渲染輸出，取代舊檔） |
| `src/content/chapters/multiple-linear-regression.md` | 修改：frontmatter `summary.image` 路徑改指向新 PNG（**待開發者確認畫面後才執行此步**） |
| 舊 `multiple-linear-regression-summary.png` | 刪除（**待開發者確認新圖後，與上一步同時執行**） |

## 驗證方式

- 渲染出的 PNG 由開發者本機開啟檢視確認（不透過自動化測試判斷視覺效果）。
- frontmatter 更新後執行 `npx astro check` + `npm run build`，確認 4 頁面成功產出、無型別錯誤。
- 瀏覽器實測 `multiple-linear-regression` 頁面「學習摘要」區塊，確認新圖正確顯示、點擊可放大（沿用既有 lightbox 機制）。

## 風險與注意事項

- Excalidraw 渲染需反覆調整 `.page` 容器高度與渲染腳本 `--window-size`，避免留白過多或裁切不全（比照 `chapter_template_guide.md` 第 5 節既有注意事項）。
- 係數表改為直式 4 列，需確認在 `board-grid`（1.1fr／1fr 雙欄）左側欄寬度下不會擠壓或溢出，必要時微調字級或欄寬。
