import { useState } from 'react';
import Plot from 'react-plotly.js';
import {
  TRAIN_SET,
  TEST_SET,
  CURVE_FITS,
  DEGREE_OPTIONS,
  Y_AXIS_RANGE,
  type PolynomialDegree,
} from '../../lib/polynomialFit';

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

export default function OverfittingUnderfittingComparison() {
  const [degree, setDegree] = useState<PolynomialDegree>(3);
  const fit = CURVE_FITS[degree];

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {DEGREE_OPTIONS.map((d) => (
          <button
            key={d}
            type="button"
            className={d === degree ? 'is-active' : ''}
            onClick={() => setDegree(d)}
          >
            次數 {d}
          </button>
        ))}
      </div>
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto' }}
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
              name: `次數 ${degree} 擬合曲線`,
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
            title: { text: '模型擬合曲線', font: { color: '#e4e6eb', size: 14 } },
            xaxis: { title: 'x', range: [-3.3, 3.3], ...axisStyle },
            yaxis: { title: 'y', range: Y_AXIS_RANGE, ...axisStyle },
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
              type: 'scatter',
              mode: 'lines+markers',
              x: DEGREE_OPTIONS.map(String),
              y: DEGREE_OPTIONS.map((d) => CURVE_FITS[d].trainRmse),
              line: { color: '#5ee6d0' },
              marker: { size: 8, color: '#5ee6d0' },
              name: '訓練誤差 RMSE',
            },
            {
              type: 'scatter',
              mode: 'lines+markers',
              x: DEGREE_OPTIONS.map(String),
              y: DEGREE_OPTIONS.map((d) => CURVE_FITS[d].testRmse),
              line: { color: '#e6a15e' },
              marker: { size: 8, color: '#e6a15e' },
              name: '測試誤差 RMSE',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: [String(degree)],
              y: [CURVE_FITS[degree].testRmse],
              marker: { size: 16, color: 'rgba(0,0,0,0)', line: { width: 2, color: '#ffffff' } },
              name: '目前選中次數',
              showlegend: false,
              hoverinfo: 'skip',
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
            title: {
              text: 'Train/Test 誤差 vs. 模型複雜度（多項式次數）',
              font: { color: '#e4e6eb', size: 14 },
            },
            xaxis: { title: '多項式次數', type: 'category', ...axisStyle },
            yaxis: { title: 'RMSE', ...axisStyle },
            margin: { l: 50, r: 20, t: 40, b: 45 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '240px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>次數 {degree} — 訓練 RMSE</dt>
          <dd>{fit.trainRmse.toFixed(4)}</dd>
        </div>
        <div>
          <dt>次數 {degree} — 測試 RMSE</dt>
          <dd>{fit.testRmse.toFixed(4)}</dd>
        </div>
      </dl>
    </div>
  );
}
