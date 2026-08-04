---
title: 邏輯斯迴歸
stage: 監督式學習－迴歸
category:
  - 監督式學習
  - 分類
interactiveComponent: logistic-regression-fit
---

## 簡介

Logistic Regression（邏輯斯迴歸）是一種分類演算法：用線性組合 $\beta_0+\beta_1x_1+\cdots+\beta_px_p$ 搭配 Sigmoid 函數，把預測值壓縮到 0~1 之間的機率，再以門檻切出類別。核心問題：當目標變數是類別（例如「是否違約」）而非連續數值時，線性回歸的輸出無界（可能小於 0 或大於 1），無法直接當機率解讀——這正是 Logistic Regression 要解決的問題。

**與 Multiple Linear Regression 的關係**：當預測目標從連續數值變成類別，同樣的線性組合 $\beta_0+\beta_1x_1+\cdots+\beta_nx_n$ 搭配 Sigmoid 函數轉換成機率，就成為 Logistic Regression，是本課程從迴歸過渡到分類的第一步——**這也是本站第一個分類任務章節**。

## 分類方式

- **學習類型**：監督式學習（Supervised Learning）
- **任務類型**：分類（Classification）——預測類別標籤，而非連續數值
- **模型類型**：廣義線性模型（Generalized Linear Model）

## 數學原理

$$
\sigma(z) = \frac{1}{1+e^{-z}}, \quad z = \beta_0+\beta_1x_1+\cdots+\beta_px_p
$$

Sigmoid 函數把線性組合 $z$（值域 $(-\infty,\infty)$）壓縮到 $(0,1)$，可解讀為「屬於正類別的機率」$\hat p = \sigma(z)$。

損失函數改用 Cross-Entropy Loss（而非線性回歸的平方誤差）：

$$
J(\beta) = -\frac{1}{n}\sum_{i=1}^n\left[y_i\log\hat p_i + (1-y_i)\log(1-\hat p_i)\right]
$$

這個損失函數對 $\beta$ 是非線性的，**沒有閉式解**，需用迭代法求解。本站採用批次梯度下降，每輪疊代用全部訓練資料計算梯度並更新：

$$
\beta \leftarrow \beta - \alpha \cdot \frac{1}{n}X^\top(\hat p - y)
$$

其中 $\alpha$ 是學習率。使用前需先標準化特徵（原始尺度差異過大會讓收斂極慢）。

## 運用範例

- **貸款違約預測**（本章案例）：依借款人財務特徵預測是否違約
- **醫療診斷**：依檢驗數值預測是否罹患某疾病
- **行銷轉換預測**：依使用者行為預測是否會點擊/購買

## 適用情境與限制

**適合使用的情境：**

- 目標變數是二元類別（是/否、有/無）
- 資料近似線性可分
- 需要可解釋的機率輸出（而非只有硬性分類標籤）

**限制與假設：**

- **決策邊界本質是線性的**：無法處理非線性可分的資料，需搭配特徵工程（如多項式特徵）或改用非線性模型
- **係數是 log-odds，不是直接的機率變化量**：不能像線性回歸那樣直接解讀「x 增加 1，y 增加 β」
- **類別不平衡時需搭配 Precision/Recall，不能只看 Accuracy**（本章案例即為示範）

## 評估指標

- **混淆矩陣**：TP（真陽性）/FP（偽陽性）/FN（偽陰性）/TN（真陰性）四格，是其餘指標的基礎
- **Accuracy（準確率）**：$(TP+TN)/n$，但類別不平衡時容易失真
- **Precision（精確率）**：$TP/(TP+FP)$，預測為正的樣本中有多少真的是正
- **Recall（召回率）**：$TP/(TP+FN)$，真正的正樣本中有多少被抓出來
- **F1-Score**：Precision 與 Recall 的調和平均，兩者需兼顧時的綜合指標

## 常見誤區

- **誤用 Accuracy 評估不平衡資料**：本章案例 Accuracy 高達 88%，但 Recall 只有 66.7%——高 Accuracy 可能只是模型傾向猜多數類別
- **把 Sigmoid 輸出的機率當成絕對真理**：機率是模型估計值，不代表校準良好（calibration 是獨立的議題）
- **誤以為決策邊界必然是複雜曲線**：Logistic Regression 本身的決策邊界就是線性的，能學到的分界只能是（超）平面
- **誤把未標準化的係數大小當「特徵重要性」解讀**：特徵尺度不同時，係數大小不可直接比較
