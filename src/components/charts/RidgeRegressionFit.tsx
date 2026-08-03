import { useState } from 'react';
import Plot from 'react-plotly.js';
import { TRAIN_SET, TEST_SET } from '../../lib/polynomialFit';
import { fitRidgeRegression, predict, rmse } from '../../lib/regression';
import { computeStats, applyZScore, type ScalingStats } from '../../lib/scaling';

const DEGREE = 15;
const LAMBDA_OPTIONS = [0, 0.01, 0.1, 1, 10] as const;
type Lambda = (typeof LAMBDA_OPTIONS)[number];

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

function polynomialFeatures(x: number, degree: number): number[] {
  const features: number[] = [];
  for (let d = 1; d <= degree; d++) features.push(x ** d);
  return features;
}

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};
function toSuperscript(n: number): string {
  return String(n)
    .split('')
    .map((digit) => SUPERSCRIPT_DIGITS[digit])
    .join('');
}
const FEATURE_LABELS: string[] = Array.from({ length: DEGREE }, (_, i) => `x${toSuperscript(i + 1)}`);

const ALL_X = [...TRAIN_SET, ...TEST_SET].map((p) => p.x);
const X_MIN = Math.min(...ALL_X);
const X_MAX = Math.max(...ALL_X);
const CURVE_SAMPLE_COUNT = 61;
const CURVE_SAMPLE_X: number[] = Array.from(
  { length: CURVE_SAMPLE_COUNT },
  (_, i) => X_MIN + (X_MAX - X_MIN) * (i / (CURVE_SAMPLE_COUNT - 1))
);

const trainRawFeatures = TRAIN_SET.map((p) => polynomialFeatures(p.x, DEGREE));
const testRawFeatures = TEST_SET.map((p) => polynomialFeatures(p.x, DEGREE));
const trainY = TRAIN_SET.map((p) => p.y);
const testY = TEST_SET.map((p) => p.y);

// 用「訓練集」算出的每一欄 mean/std，套用到訓練/測試/曲線取樣點，避免用測試集自己的統計量（那會造成資訊洩漏）
const COLUMN_STATS: ScalingStats[] = Array.from({ length: DEGREE }, (_, col) =>
  computeStats(trainRawFeatures.map((row) => row[col]))
);

function standardizeRow(row: number[]): number[] {
  return row.map((v, col) => applyZScore(v, COLUMN_STATS[col]));
}

const trainStdFeatures = trainRawFeatures.map(standardizeRow);
const testStdFeatures = testRawFeatures.map(standardizeRow);

interface LambdaFit {
  lambda: Lambda;
  curve: { x: number; y: number }[];
  trainRmse: number;
  testRmse: number;
  coefficients: number[]; // 標準化空間下的 β₁..β₁₅（不含截距）
}

function computeForLambda(lambda: Lambda): LambdaFit {
  const { coefficients } = fitRidgeRegression(trainStdFeatures, trainY, lambda);
  const trainPredicted = trainStdFeatures.map((f) => predict(coefficients, f));
  const testPredicted = testStdFeatures.map((f) => predict(coefficients, f));
  const curve = CURVE_SAMPLE_X.map((x) => {
    const standardized = standardizeRow(polynomialFeatures(x, DEGREE));
    return { x, y: predict(coefficients, standardized) };
  });

  return {
    lambda,
    curve,
    trainRmse: rmse(trainY, trainPredicted),
    testRmse: rmse(testY, testPredicted),
    coefficients: coefficients.slice(1),
  };
}

const LAMBDA_FITS: Record<Lambda, LambdaFit> = Object.fromEntries(
  LAMBDA_OPTIONS.map((lambda) => [lambda, computeForLambda(lambda)])
) as Record<Lambda, LambdaFit>;

// log 座標無法顯示 0，且不同 λ 之間係數幅度可能相差超過 200 倍，取絕對值後設下限避免 log(0)
const MIN_BAR_VALUE = 0.001;
function safeAbsForLog(value: number): number {
  return Math.max(Math.abs(value), MIN_BAR_VALUE);
}

const maxAbsCoefficient = Math.max(
  ...LAMBDA_OPTIONS.flatMap((lambda) => LAMBDA_FITS[lambda].coefficients.map((c) => Math.abs(c)))
);
const BAR_Y_RANGE: [number, number] = [
  Math.log10(MIN_BAR_VALUE),
  Math.log10(maxAbsCoefficient * 1.2),
];

export default function RidgeRegressionFit() {
  const [lambda, setLambda] = useState<Lambda>(0);
  const fit = LAMBDA_FITS[lambda];

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {LAMBDA_OPTIONS.map((l) => (
          <button
            key={l}
            type="button"
            className={l === lambda ? 'is-active' : ''}
            onClick={() => setLambda(l)}
          >
            λ = {l}
          </button>
        ))}
      </div>
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto', marginBottom: '16px' }}
      >
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: TRAIN_SET.map((p) => p.x),
              y: TRAIN_SET.map((p) => p.y),
              marker: { size: 7, color: '#5ee6d0', opacity: 0.8 },
              name: '訓練集',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: TEST_SET.map((p) => p.x),
              y: TEST_SET.map((p) => p.y),
              marker: { size: 7, color: '#e6a15e', opacity: 0.9 },
              name: '測試集',
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: fit.curve.map((p) => p.x),
              y: fit.curve.map((p) => p.y),
              line: { color: '#7c5ee6', width: 3 },
              name: `λ=${lambda} 擬合曲線`,
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
            title: { text: '模型擬合曲線（次數 15）', font: { color: '#e4e6eb', size: 14 } },
            xaxis: { title: 'x', ...axisStyle },
            yaxis: { title: 'y', ...axisStyle },
            margin: { l: 50, r: 20, t: 40, b: 45 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '300px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto' }}
      >
        <Plot
          data={[
            {
              type: 'bar',
              x: FEATURE_LABELS,
              y: fit.coefficients.map(safeAbsForLog),
              marker: { color: '#7c5ee6' },
              name: `λ=${lambda} 標準化係數`,
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
            showlegend: false,
            title: {
              text: '標準化係數收縮（|βⱼ|，對數座標）',
              font: { color: '#e4e6eb', size: 14 },
            },
            xaxis: { title: '多項式特徵項', ...axisStyle },
            yaxis: { title: '係數絕對值（log）', type: 'log', range: BAR_Y_RANGE, ...axisStyle },
            margin: { l: 55, r: 20, t: 40, b: 45 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '260px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>λ={lambda} — 訓練 RMSE</dt>
          <dd>{fit.trainRmse.toFixed(4)}</dd>
        </div>
        <div>
          <dt>λ={lambda} — 測試 RMSE</dt>
          <dd>{fit.testRmse.toFixed(4)}</dd>
        </div>
      </dl>
    </div>
  );
}
