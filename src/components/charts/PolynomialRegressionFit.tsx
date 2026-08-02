import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { positionSalaryData } from '../../lib/positionSalaryData';
import { fitLinearRegression, predict, rSquared, rmse } from '../../lib/regression';

const DEGREE_OPTIONS = [1, 2, 3, 4, 5] as const;
type Degree = (typeof DEGREE_OPTIONS)[number];

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

function polynomialFeatures(x: number, degree: number): number[] {
  const features: number[] = [];
  for (let d = 1; d <= degree; d++) features.push(x ** d);
  return features;
}

const LEVELS = positionSalaryData.map((r) => r.level);
const SALARIES = positionSalaryData.map((r) => r.salary);

const CURVE_SAMPLE_COUNT = 91;
const CURVE_SAMPLE_X: number[] = Array.from(
  { length: CURVE_SAMPLE_COUNT },
  (_, i) => 1 + (9 * i) / (CURVE_SAMPLE_COUNT - 1)
);

function computeForDegree(degree: Degree) {
  const { coefficients } = fitLinearRegression(
    LEVELS.map((x) => polynomialFeatures(x, degree)),
    SALARIES
  );

  const predicted = LEVELS.map((x) => predict(coefficients, polynomialFeatures(x, degree)));
  const r2 = rSquared(SALARIES, predicted);
  const rmseValue = rmse(SALARIES, predicted);
  const curve = CURVE_SAMPLE_X.map((x) => ({
    x,
    y: predict(coefficients, polynomialFeatures(x, degree)),
  }));

  return { curve, r2, rmseValue };
}

export default function PolynomialRegressionFit() {
  const [degree, setDegree] = useState<Degree>(4);
  const { curve, r2, rmseValue } = useMemo(() => computeForDegree(degree), [degree]);

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
              x: LEVELS,
              y: SALARIES,
              marker: { size: 9, color: '#5ee6d0', opacity: 0.85 },
              name: '樣本資料',
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: curve.map((p) => p.x),
              y: curve.map((p) => p.y),
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
            legend: {
              bgcolor: 'rgba(0,0,0,0)',
              x: 0.02,
              y: 0.98,
              itemclick: false,
              itemdoubleclick: false,
            },
            xaxis: { title: '職等（Level）', dtick: 1, ...axisStyle },
            yaxis: { title: '薪資（Salary）', ...axisStyle },
            margin: { l: 70, r: 20, t: 30, b: 50 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '480px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>決定係數 R²</dt>
          <dd>{r2.toFixed(4)}</dd>
        </div>
        <div>
          <dt>均方根誤差 RMSE</dt>
          <dd>{rmseValue.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
