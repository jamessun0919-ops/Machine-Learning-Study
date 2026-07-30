import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import {
  startups,
  fixedRanges,
  fieldLabels,
  type StartupRecord,
} from '../../lib/datasets';
import { fitLinearRegression, predict, rSquared, rmse } from '../../lib/regression';

interface FeaturePreset2D {
  id: string;
  label: string;
  xKey: keyof Pick<StartupRecord, 'rdSpend' | 'administration' | 'marketingSpend'>;
  targetKey: keyof Pick<StartupRecord, 'profit'>;
}

const featurePresets2D: FeaturePreset2D[] = [
  {
    id: 'rd-profit',
    label: '研發支出（R&D Spend）',
    xKey: 'rdSpend',
    targetKey: 'profit',
  },
  {
    id: 'marketing-profit',
    label: '行銷支出（Marketing Spend）',
    xKey: 'marketingSpend',
    targetKey: 'profit',
  },
  {
    id: 'admin-profit',
    label: '行政支出（Administration）',
    xKey: 'administration',
    targetKey: 'profit',
  },
];

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

function computeForPreset(preset: FeaturePreset2D) {
  const points = startups.map((row) => ({
    x: row[preset.xKey],
    y: row[preset.targetKey],
  }));

  // Fit simple linear regression: features has 1 column
  const { coefficients } = fitLinearRegression(
    points.map((p) => [p.x]),
    points.map((p) => p.y)
  );

  const predicted = points.map((p) => predict(coefficients, [p.x]));
  const r2 = rSquared(points.map((p) => p.y), predicted);
  const rmseValue = rmse(points.map((p) => p.y), predicted);

  const minX = fixedRanges[preset.xKey].min;
  const maxX = fixedRanges[preset.xKey].max;
  const minY = predict(coefficients, [minX]);
  const maxY = predict(coefficients, [maxX]);

  return { points, coefficients, r2, rmseValue, minX, maxX, minY, maxY };
}

export default function RegressionScatter2D() {
  const [presetId, setPresetId] = useState(featurePresets2D[0].id);
  const preset = featurePresets2D.find((p) => p.id === presetId)!;
  
  const { points, r2, rmseValue, minX, maxX, minY, maxY } = useMemo(
    () => computeForPreset(preset),
    [preset]
  );

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {featurePresets2D.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === presetId ? 'is-active' : ''}
            onClick={() => setPresetId(p.id)}
          >
            {p.label.split('（')[0]} {/* 簡短顯示按鈕文字 */}
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
              x: points.map((p) => p.x),
              y: points.map((p) => p.y),
              marker: { size: 7, color: '#5ee6d0', opacity: 0.8 },
              name: '樣本資料',
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: [minX, maxX],
              y: [minY, maxY],
              line: { color: '#7c5ee6', width: 3 },
              name: '回歸線',
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
            legend: { bgcolor: 'rgba(0,0,0,0)', x: 0.02, y: 0.98 },
            xaxis: {
              title: fieldLabels[preset.xKey],
              range: [fixedRanges[preset.xKey].min * 0.9, fixedRanges[preset.xKey].max * 1.1],
              ...axisStyle,
            },
            yaxis: {
              title: fieldLabels[preset.targetKey],
              range: [fixedRanges[preset.targetKey].min * 0.9, fixedRanges[preset.targetKey].max * 1.1],
              ...axisStyle,
            },
            margin: { l: 60, r: 20, t: 30, b: 50 },
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
