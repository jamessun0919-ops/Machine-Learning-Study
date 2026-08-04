import Plot from 'react-plotly.js';
import { loans, fieldLabels, trainIndices, testIndices } from '../../lib/loanDefault';
import { predict } from '../../lib/regression';
import {
  sigmoid,
  fitLogisticRegression,
  confusionMatrix,
  accuracy,
  precision,
  recall,
  f1Score,
} from '../../lib/classification';
import { computeStats, applyZScore, type ScalingStats } from '../../lib/scaling';

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

const legendStyle = {
  bgcolor: 'rgba(0,0,0,0)',
  x: 0.02,
  y: 0.98,
  itemclick: false as const,
  itemdoubleclick: false as const,
  font: { color: '#e4e6eb' },
};

function toRawFeatures(indices: number[]): number[][] {
  return indices.map((i) => [loans[i].debtToIncomeRatio, loans[i].creditScore]);
}

const trainRawFeatures = toRawFeatures(trainIndices);
const testRawFeatures = toRawFeatures(testIndices);
const trainTarget = trainIndices.map((i) => loans[i].isDefault);
const testTarget = testIndices.map((i) => loans[i].isDefault);

// 用訓練集算出的 mean/std 套用到訓練/測試/決策邊界端點，避免用測試集自己的統計量造成資訊洩漏
const DTI_STATS: ScalingStats = computeStats(trainRawFeatures.map((row) => row[0]));
const CREDIT_STATS: ScalingStats = computeStats(trainRawFeatures.map((row) => row[1]));

function standardizeRow(row: number[]): number[] {
  return [applyZScore(row[0], DTI_STATS), applyZScore(row[1], CREDIT_STATS)];
}

const trainStdFeatures = trainRawFeatures.map(standardizeRow);
const testStdFeatures = testRawFeatures.map(standardizeRow);

const FIT = fitLogisticRegression(trainStdFeatures, trainTarget);
// FIT.converged 目前未被消費——設計階段已用驗證腳本確認這組資料在預設超參數下
// 必定收斂（約 3576 次疊代內），元件不需要對此做任何反應。若未來資料集或超參數
// 調整，需要重新評估是否要在畫面上顯示這個狀態。

function classify(standardizedFeatures: number[]): 0 | 1 {
  return sigmoid(predict(FIT.coefficients, standardizedFeatures)) >= 0.5 ? 1 : 0;
}

const trainPredicted = trainStdFeatures.map(classify);
const testPredicted = testStdFeatures.map(classify);

const TRAIN_CM = confusionMatrix(trainTarget, trainPredicted);
const TEST_CM = confusionMatrix(testTarget, testPredicted);

const TRAIN_ACCURACY = accuracy(TRAIN_CM);
const TEST_ACCURACY = accuracy(TEST_CM);
const TEST_PRECISION = precision(TEST_CM);
const TEST_RECALL = recall(TEST_CM);
const TEST_F1 = f1Score(TEST_CM);

// 決策邊界線：標準化空間中 z=0 的等式解出 creditScore（依 dti 求解），在資料範圍
// 的兩端各算一個端點再換算回原始座標畫線，比照 Ridge/Lasso「用 min/max x 算兩個
// 端點」的既有手法。
function boundaryCreditScoreAt(rawDti: number): number {
  const standardizedDti = applyZScore(rawDti, DTI_STATS);
  const standardizedCredit =
    -(FIT.coefficients[0] + FIT.coefficients[1] * standardizedDti) / FIT.coefficients[2];
  return standardizedCredit * CREDIT_STATS.std + CREDIT_STATS.mean;
}

const ALL_DTI = loans.map((loan) => loan.debtToIncomeRatio);
const DTI_MIN = Math.min(...ALL_DTI);
const DTI_MAX = Math.max(...ALL_DTI);
const BOUNDARY_LINE = [
  { x: DTI_MIN, y: boundaryCreditScoreAt(DTI_MIN) },
  { x: DTI_MAX, y: boundaryCreditScoreAt(DTI_MAX) },
];

const DEFAULTED = loans.filter((loan) => loan.isDefault === 1);
const NOT_DEFAULTED = loans.filter((loan) => loan.isDefault === 0);

export default function LogisticRegressionFit() {
  return (
    <div className="regression-chart">
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto' }}
      >
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: NOT_DEFAULTED.map((loan) => loan.debtToIncomeRatio),
              y: NOT_DEFAULTED.map((loan) => loan.creditScore),
              marker: { size: 7, color: '#5ee6d0', opacity: 0.8 },
              name: '未違約',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: DEFAULTED.map((loan) => loan.debtToIncomeRatio),
              y: DEFAULTED.map((loan) => loan.creditScore),
              marker: { size: 7, color: '#e6a15e', opacity: 0.9 },
              name: '違約',
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: BOUNDARY_LINE.map((p) => p.x),
              y: BOUNDARY_LINE.map((p) => p.y),
              line: { color: '#7c5ee6', width: 3 },
              name: '決策邊界',
            },
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: '#0f1117',
            plot_bgcolor: '#0f1117',
            font: { color: '#e4e6eb' },
            hoverlabel: {
              bgcolor: '#161922',
              bordercolor: '#262a35',
              font: { color: '#e4e6eb' },
            },
            dragmode: false,
            legend: legendStyle,
            title: { text: '違約分類決策邊界', font: { color: '#e4e6eb', size: 14 } },
            xaxis: { title: fieldLabels.debtToIncomeRatio, ...axisStyle },
            yaxis: { title: fieldLabels.creditScore, ...axisStyle },
            margin: { l: 60, r: 20, t: 40, b: 50 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '480px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>訓練 Accuracy</dt>
          <dd>{TRAIN_ACCURACY.toFixed(4)}</dd>
        </div>
        <div>
          <dt>測試 Accuracy</dt>
          <dd>{TEST_ACCURACY.toFixed(4)}</dd>
        </div>
        <div>
          <dt>測試 Precision</dt>
          <dd>{TEST_PRECISION.toFixed(4)}</dd>
        </div>
        <div>
          <dt>測試 Recall</dt>
          <dd>{TEST_RECALL.toFixed(4)}</dd>
        </div>
        <div>
          <dt>測試 F1-Score</dt>
          <dd>{TEST_F1.toFixed(4)}</dd>
        </div>
      </dl>
      <table className="regression-chart__confusion-matrix">
        <caption>測試集混淆矩陣</caption>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">預測：違約</th>
            <th scope="col">預測：未違約</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">實際：違約</th>
            <td>{TEST_CM.tp}</td>
            <td>{TEST_CM.fn}</td>
          </tr>
          <tr>
            <th scope="row">實際：未違約</th>
            <td>{TEST_CM.fp}</td>
            <td>{TEST_CM.tn}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
