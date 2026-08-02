# 機器學習互動學習網站 — 章節開發範本與架構指南

本指南旨在規範後續章節開發的檔案結構、內容區塊、互動元件，以及部署至 GitHub Pages 時的關鍵路徑規則，確保各章節的實作品質與全站風格一致。

---

## 1. 章節頁面結構與內容架構 (九大固定區塊)

每個新開發的演算法章節頁面，其 Markdown 內容必須嚴格依序包含以下九個區塊，不可遺漏或調換順序：

1. **簡介** (`## 簡介`)  
   定義該演算法是什麼，並說明其主要解決的核心問題。

   **1.1 跨章節關聯段落**：若該主題在 `src/config/curriculum.ts` 中設有 `relatedTo`，或被其他主題的 `relatedTo` 指向（關聯可能只單側標註，例如 Logistic Regression → Multiple Linear Regression），「簡介」段落須在既有說明後，針對每個關聯主題各補一段獨立段落，格式比照：「**與 {主題} 的關係**：{一句核心比喻}。{1-2 句延伸說明}。」若對應頁面尚未建置，暫不需處理（等該主題本身被建置時再一併確認關聯段落）。

   目前 6 組核心關聯對照表（依 `src/config/curriculum.ts` 的 `relatedTo` 定義整理；原概念關聯圖片另有「監督式↔非監督式學習」一組，但那是課程學習典範分類、非 `relatedTo` 邊，已由「機器學習介紹」章節涵蓋，不列入此表、不適用此規則）：

   | 主題 A | 主題 B | 核心關聯 | 狀態 |
   |---|---|---|---|
   | Multiple Linear Regression | Logistic Regression | 迴歸走向分類的橋樑 | A 側已補充；B 側建置時補上 |
   | Polynomial Regression | 過擬合/欠擬合與偏差-變異數權衡 | 次數選擇即 bias-variance 權衡 | 兩側已補 |
   | Decision Tree | Random Forest（Bagging） | Bagging：多顆 Decision Tree 組成 | 待兩側建置 |
   | Decision Tree | Boosting（AdaBoost/GB） | 弱學習器逐步疊加組成 | 待兩側建置 |
   | PCA | K-Means | 常作為分群前的前處理 | 待兩側建置 |
   | KNN | K-Means | 同屬距離基礎方法 | 待兩側建置 |

2. **分類方式** (`## 分類方式`)  
   使用無序清單列出模型定位（例如：監督式/非監督式學習、分類/迴歸任務、參數/非參數模型）。
3. **數學原理** (`## 數學原理`)  
   使用 KaTeX 公式（行內式如 `$x$`，獨立段落如 `$$A = B$$`）推導該演算法的核心數學機制（例如常態方程式、損失函數最佳化等）。
4. **運用範例** (`## 運用範例`)  
   列舉 2-3 個真實世界的應用場景（例如：房價預測、客戶分群、信用評分等）。
5. **適用情境與限制** (`## 適用情境與限制`)  
   詳細列出適合使用的情境、優點，以及該模型的底層假設與限制（例如多重共線性、非線性限制等）。
6. **評估指標** (`## 評估指標`)  
   說明如何評估該模型的表現（例如迴歸的 $R^2$ / RMSE，分類的 Accuracy / F1-Score，分群的 Silhouette Score 等）。
7. **常見誤區** (`## 常見誤區`)  
   列出學生或初學者常犯的錯誤或認知偏差（例如：相關性與因果性的混淆、過度外插等）。
8. **學習摘要資訊圖表** (`## 學習摘要`)  
   此區塊由 `ChapterSummaryCard.astro` 元件負責渲染。可選用靜態圖片（向量圖表風格，以 `summary.image` 指定）或文字式摘要（公式卡與關鍵統計數據）。
9. **互動式操作與演示** (`## 互動式操作與演示`)  
   在此區塊掛載專屬的 React island 元件，提供直觀的視覺化展示。

**1.2 方法論／流程類章節範本（4 大區塊）**：若該章節是**無公式、無需配適模型**的方法論／流程主題（例如 CRISP-DM 資料分析方法），改採此範本，而非上述九大區塊：

1. **簡介** (`## 簡介`)——與九大區塊範本相同，跨章節關聯段落規則（1.1 節）同樣適用。
2. **核心流程**（標題依主題定義，例如 CRISP-DM 為 `## CRISP-DM 六大階段`）——說明該方法論的核心步驟或流程。
3. **常見誤區** (`## 常見誤區`)
4. **學習摘要資訊圖表** (`## 學習摘要`)

不包含「分類方式」「數學原理」「運用範例」「適用情境與限制」「評估指標」「互動式操作與演示」等區塊；frontmatter **不設定** `interactiveComponent` 欄位。範例：CRISP-DM 資料分析方法（設計文件 `docs/superpowers/specs/2026-07-31-crisp-dm-chapter-design.md`）。此範本可供未來同類主題（如「訓練/測試切分與交叉驗證」等）參考，但個別章節內容仍需與開發者逐一確認，不可預設套用。

**1.3 技巧/技術類章節範本（6 大區塊）**：若該章節是**技巧/技術類**主題（非流程、非需配適評估的演算法，例如特徵工程與標準化），改採此範本：

1. **簡介** (`## 簡介`)——與九大區塊範本相同，跨章節關聯段落規則（1.1 節）同樣適用。
2. **常見方法**（標題依主題定義）——列出該主題下的具體技巧/方法，可包含 KaTeX 公式。
3. **適用情境與限制** (`## 適用情境與限制`)
4. **常見誤區** (`## 常見誤區`)
5. **學習摘要資訊圖表** (`## 學習摘要`)
6. **互動式操作與演示** (`## 互動式操作與演示`)——展示技巧效果的對比，例如轉換前後的數值分佈變化。

不包含「分類方式」「數學原理」（公式併入「常見方法」）「運用範例」「評估指標」「案例分析」等區塊。範例：特徵工程與標準化（設計文件 `docs/superpowers/specs/2026-08-01-feature-engineering-standardization-chapter-design.md`）。此範本可供未來同類技巧/技術主題參考，但個別章節內容仍需與開發者逐一確認，不可預設套用。

---

## 2. Astro 專案規範與內部連結規則

由於專案採用靜態部署於 GitHub Pages（具有子目錄前綴 `/Machine-Learning-Study/`），在處理所有內部連結與靜態資源路徑時，必須嚴格遵守以下規則：

* **禁用寫死的根路徑**：絕對不能使用 `/css/...` 或 `/chapters/...` 這種以 `/` 開頭的寫死絕對路徑，這會導致在 GitHub Pages 部署時產生 404 錯誤。
* **使用 Base URL 前綴**：對於所有靜態連結或跳轉，必須使用 `import.meta.env.BASE_URL` 前綴：
  ```astro
  <a href={`${import.meta.env.BASE_URL}chapters/${chapter.id}`}>
  ```
* **Astro `<Image>` 元件**：引入圖片資產時，請使用相對路徑，並透過 Astro 的 `Image` 元件進行優化：
  ```astro
  import myImage from '../../assets/my-image.png';
  <Image src={myImage} alt="說明文字" />
  ```

---

## 3. React Islands 互動圖表元件開發規範

* **客戶端渲染 (Client-Only)**：所有包含繪圖套件（如 Plotly.js）的 React 元件，必須在 Astro 中以 `client:only="react"` 方式掛載，避免在伺服器端（SSR）建置時因為 Node.js 解析瀏覽器特定 API 而出錯：
  ```astro
  <MyChartComponent client:only="react">
    <div slot="fallback" class="regression-chart__skeleton">圖表載入中……</div>
  </MyChartComponent>
  ```
* **字面 JSX 引用 (Literal JSX)**：Astro 模板中必須使用**字面 JSX** 直接引用 React 元件，禁止透過動態查找表或變數間接渲染，否則 Astro 的編譯器將無法正確打包該 island 資源。
* **教學導向 (YAGNI)**：互動元件的定位是「預先設計的展示」，並非自由調參的分析工具。資料集應採白名單制（打包在前端），參數調整應採預設選項（如預設特徵組合按鈕），避免給予使用者過大的自由度以保持學習焦點。

---

## 4. Plotly 3D 圖表水平旋轉控制邏輯

Plotly 內建的 3D 旋轉模式會允許相機翻轉至水平面以下，導致場景上下顛倒。本專案採用的標準旋轉控制方案如下：

1. **關閉內建旋轉**：在 `<Plot>` 的 `layout.scene` 設定 `dragmode: false`。
2. **手刻 Pointer 事件**：在外層的容器元素上綁定自訂的指標事件以擷取拖曳距離：
   ```tsx
   onPointerDown={handlePointerDown}
   onPointerMove={handlePointerMove}
   onPointerUp={handlePointerUp}
   ```
3. **仰角範圍限制**：使用三角函數將相機的水平方位角（Azimuth）保持自由旋轉，但限制仰角（Elevation）在預設視角上下 30 度（`±30°`）範圍內，避免視角顛倒：
   ```tsx
   function cameraEyeFromAngles(azimuthDeg: number, elevationDeg: number) {
     const azimuthRad = (azimuthDeg * Math.PI) / 180;
     const elevationRad = (elevationDeg * Math.PI) / 180;
     const horizontalRadius = CAMERA_RADIUS * Math.cos(elevationRad);
     return {
       x: horizontalRadius * Math.cos(azimuthRad),
       y: horizontalRadius * Math.sin(azimuthRad),
       z: CAMERA_RADIUS * Math.sin(elevationRad),
     };
   }
   ```

---

## 5. 學習摘要資訊圖表（Infographic）風格

各章節的摘要資訊圖表（PNG）應遵循以下規劃：

* **風格已定案為 Excalidraw 手繪風格，後續章節不再逐一詢問**：2026-07-31 與開發者確認，後續所有章節的資訊圖表統一採用 Excalidraw 手繪風格，不再選用白底向量風格，開工時無需重新詢問。
  1. **Excalidraw 手繪風格**（目前唯一採用的風格）：`simple-linear-regression-summary.png`、`multiple-linear-regression-summary.png` 皆採用此風格，實作方式是用 rough.js（Excalidraw 本身的手繪渲染引擎）搭配 HTML/CSS 排版、手寫字體（如 Segoe Print），寫成一頁網頁後，用無頭瀏覽器（headless msedge）渲染輸出成 PNG——**不是**用 AI 圖像生成模型直接畫。rough.js 引擎程式碼統一存放於共用檔 `docs/specs/assets-src/rough-engine.js`，各資產 HTML 以 `<script src="rough-engine.js"></script>` 引入，不再逐檔複製。
  2. **白底向量風格**（已停用）：`pic/Bayes.png` 為此風格的既有範例，由開發者用外部圖像生成工具手動製作；此風格不再用於新章節，既有檔案維持不變。`multiple-linear-regression-summary.png` 已於 2026-07-31 改為 Excalidraw 風格，不再屬於此類。
* **內容結構——九大區塊演算法範本專用（不論選用哪種風格皆適用）**：
  1. **簡介**：固定為第一區塊，濃縮自章節 `簡介` 段落。
  2. 模型公式
  3. 適用情境與假設限制
  4. 評估指標
  5. 常見誤區
  6. **案例分析**（固定放在最底部，與其餘區塊視覺區隔——例如深色 footer 或黑板樣式）：整合原本分散的「頂部案例 metabar」與「重點總結」，集中呈現資料集資訊、係數表、R²/RMSE 等數值、數據洞察文字。標題格式為「案例分析：{資料集英文名}（{資料集中文全稱翻譯}）」，例如「案例分析：50 Startups（50 家新創公司財務資料及利潤預測）」。
* **內容結構——方法論／流程類範本專用（1.2 節）**：此類章節無案例分析數據、無公式/限制/指標卡，資訊圖表改為 3 個視覺區塊：
  1. **簡介卡**：濃縮自章節簡介段落。
  2. **核心流程視覺化**（主視覺）：將該方法論的核心流程畫成對應的圖形（例如 CRISP-DM 的六階段循環圖），取代九大區塊範本的模型公式卡位置。
  3. **常見誤區卡**：一般淺色卡片，比照其他章節風格，**不用**深色黑板樣式（該樣式專屬於九大區塊範本的案例分析區塊）。
  範例：`crisp-dm-summary.png`（`docs/specs/assets-src/crisp-dm-summary.html`）。
* **內容結構——技巧/技術類範本專用（1.3 節）**：此類章節無案例分析數據、無單一模型指標，資訊圖表改為 4 個視覺區塊：
  1. **簡介卡**：濃縮自章節簡介段落。
  2. **方法卡**（主視覺）：該主題下具體技巧的公式或方法對比（例如 Z-score／Min-Max 公式並列）。
  3. **適用情境卡**：適合/不適合的模型或情境分類。
  4. **常見誤區卡**：一般淺色卡片，比照其他章節風格，不用深色黑板樣式。
  範例：`feature-engineering-standardization-summary.png`（`docs/specs/assets-src/feature-engineering-standardization-summary.html`）。
* **內容優先順序**：資訊圖表總結的是**學習/概念資訊**，案例的數字結果是次要佐證，不可讓案例數字主導版面或出現在案例分析區塊以外的地方（方法論／流程類範本本身無案例分析區塊，此規則不適用）。

---

## 6. 連續捲動與進入視野動態效果

* **跨瀏覽器相容性**：嚴禁使用 Chromium-only 的 CSS `animation-timeline` 屬性。
* **進入視野動態**：若需要元素（如章節標題底線）在進入視野時觸發一次性的漸入/展開動效，使用 `IntersectionObserver` 進行監聽，並在觸發後立即 `unobserve`。
* **連續比例動態**：若需要隨著滾動進度產生連續變化（如頂部閱讀進度條），使用 window 的 `scroll` 事件監聽，並使用 `requestAnimationFrame` 進行節流（throttle）計算以維持流暢度。
