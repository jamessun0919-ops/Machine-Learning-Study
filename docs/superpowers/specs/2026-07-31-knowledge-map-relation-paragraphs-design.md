# 設計方案：移除概念關聯圖片，改以章節內文承載跨章節關聯

> 日期：2026-07-31（第 13 個工作階段）

## 背景與問題

「機器學習介紹」章節的「全課程知識地圖」區塊，原本包含一張 Excalidraw 手繪風格的概念關聯圖片（`ml-curriculum-concept-map.png`），展示 6 組演算法／學習典範間的核心關聯。開發者反饋此圖片展示效果不佳，且下方的 8 階段互動連結按鈕（`CourseKnowledgeMap.tsx`，已內建「相關：」連結顯示 `relatedTo` 關聯）已足以呈現關聯資訊，圖片本身是多餘的。

決議：移除該圖片，改為將關聯觀念以獨立段落文字方式，寫入相關演算法章節的「簡介」段落中。

## 範圍

**本階段實際修改**：
1. 移除「機器學習介紹」章節的概念關聯圖片，及其造成的所有相關程式碼／資產（schema 欄位、渲染程式碼、PNG、原始 HTML 資產檔、渲染腳本）。
2. 在 `multiple-linear-regression.md` 的「簡介」段落，新增與 Logistic Regression 關聯的獨立段落（唯一一組「有一側頁面已建置」的關聯）。
3. 在 `docs/specs/chapter_template_guide.md` 新增「跨章節關聯段落」規則與對照表，供其餘 4 組關聯（兩側頁面皆未建置）於未來建置對應章節時參考使用。

**不在本階段範圍**：
- 「監督式學習 ↔ 非監督式學習」這組關聯，因性質是課程學習典範分類（非兩個演算法頁面的關聯），且「機器學習介紹」章節「機器學習的分類」段落已涵蓋說明，故不適用本規則、不另外處理。
- `CourseKnowledgeMap.tsx` 元件、`curriculum.ts` 的 `relatedTo` 資料結構本身不變動。
- 交接文件列出的其他待辦項（3 項 Minor 外觀瑕疵已隨圖片移除而失效可忽略、simple-linear-regression 互動調整、下一章節規劃）不在本次範圍。

## 內容變更

### `src/content/chapters/multiple-linear-regression.md`

「簡介」段落現有內文後，新增一段：

> **與 Logistic Regression 的關係**：迴歸走向分類的橋樑。當預測目標從連續數值變成類別（例如「是否違約」）時，同樣的線性組合 $\beta_0+\beta_1x_1+\cdots+\beta_nx_n$ 搭配 Sigmoid 函數轉換成機率，就成為 Logistic Regression，也是本課程從迴歸過渡到分類的第一步。

### `src/content/chapters/machine-learning-introduction.md`

「全課程知識地圖」段落的引導句，移除提及圖片的敘述，改為：

> 下方清單依規劃的八個學習階段，列出完整課程主題——已完成的章節可以直接點擊前往，尚未建置的章節會標示「即將推出」；主題旁若標示「相關」，代表與其他主題間的核心概念關聯，同樣可以點擊查看。

同時移除 frontmatter 的 `conceptMapImage:` 欄位。

## 清理死碼與資產

以下項目因本次變更直接產生孤兒程式碼／檔案，一併清除：

| 檔案 | 動作 |
|---|---|
| `src/content.config.ts` | 移除 `conceptMapImage: image().optional()` schema 欄位 |
| `src/pages/chapters/[slug].astro` | 移除 `{chapter.data.conceptMapImage && (<Image .../>)}` 條件渲染區塊 |
| `src/content/chapters/machine-learning-introduction.md` | 移除 frontmatter 的 `conceptMapImage:` 行 |
| `src/assets/chapters/ml-curriculum-concept-map.png` | 刪除 |
| `docs/specs/assets-src/ml-curriculum-concept-map.html` | 刪除 |
| `scripts/render-ml-curriculum-concept-map.ps1` | 刪除（僅用於渲染此圖，無其他用途） |
| `docs/specs/chapter_template_guide.md` 第 5 節 | 移除對已刪除檔案 `ml-curriculum-concept-map.png` 的舉例引用，只保留 `simple-linear-regression-summary.png` 作為 Excalidraw 風格範例 |

**明確保留、不動**：
- `docs/specs/assets-src/rough-engine.js`（共用手繪引擎，`simple-linear-regression-summary.html` 仍在使用）
- `docs/superpowers/plans/2026-07-30-ml-introduction-chapter.md`、`docs/superpowers/specs/2026-07-30-ml-introduction-chapter-design.md`（歷史規劃紀錄，不回頭修改）
- `CourseKnowledgeMap.tsx`、`curriculum.ts` 的 `relatedTo` 資料與 8 階段互動連結按鈕機制

## `chapter_template_guide.md` 新增規則

在第 1 節「簡介」定義後，新增 1.1 小節：

> ### 1.1 跨章節關聯段落
>
> 若該主題在 `src/config/curriculum.ts` 中設有 `relatedTo`，「簡介」段落須在既有說明後，針對每個關聯主題各補一段獨立段落，格式比照：「**與 {主題} 的關係**：{一句核心比喻}。{1-2 句延伸說明}。」若對應頁面尚未建置，暫不需處理（等該主題本身被建置時再一併確認關聯段落）。
>
> **目前 6 組核心關聯對照表**（依原 `ml-curriculum-concept-map.html` 整理，監督式／非監督式學習分類已由「機器學習介紹」章節涵蓋，不適用此規則）：
>
> | 主題 A | 主題 B | 核心關聯 | 狀態 |
> |---|---|---|---|
> | Multiple Linear Regression | Logistic Regression | 迴歸走向分類的橋樑 | A 側已補充；B 側建置時補上 |
> | Decision Tree | Random Forest（Bagging） | Bagging：多顆 Decision Tree 組成 | 待兩側建置 |
> | Decision Tree | Boosting（AdaBoost/GB） | 弱學習器逐步疊加組成 | 待兩側建置 |
> | PCA | K-Means | 常作為分群前的前處理 | 待兩側建置 |
> | KNN | K-Means | 同屬距離基礎方法 | 待兩側建置 |

## 驗證方式

- `npm run test`：既有測試（含 `curriculum.test.ts`、content schema 相關測試）全數通過，且無新增測試需求（本次僅為內容/文件調整，無新邏輯分支）。
- `astro check`：0 錯誤/0 警告。
- `npm run build`：頁面成功產出，確認 `machine-learning-introduction` 頁面不再嘗試載入已刪除的 `conceptMapImage`。
- 瀏覽器實測（無頭 Edge）：確認「機器學習介紹」頁面「全課程知識地圖」區塊只剩 8 階段清單、無破圖或殘留空白區塊；確認「多元線性回歸」頁面「簡介」段落正確顯示新增段落與 KaTeX 公式渲染正常。

## 風險與注意事項

- 移除 `conceptMapImage` schema 欄位屬於 breaking change，若未來其他章節仍想用類似圖片承載跨章節關聯，需重新設計（但依開發者本次決策，此模式已停用，改採文字段落）。
- `chapter_template_guide.md` 對照表僅涵蓋目前 `curriculum.ts` 已定義的 `relatedTo` 邊；若未來新增主題或關聯，需同步更新此表。
