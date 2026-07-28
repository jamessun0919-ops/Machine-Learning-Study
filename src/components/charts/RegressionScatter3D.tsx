import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { startups, featurePresets, type FeaturePreset } from '../../lib/datasets';
import { fitLinearRegression, predict, rSquared, rmse } from '../../lib/regression';
import { buildScatterPlaneData } from '../../lib/regressionPlaneData';

function computeForPreset(preset: FeaturePreset) {
  const points = startups.map((row) => ({
    x1: row[preset.xKey],
    x2: row[preset.yKey],
    y: row[preset.targetKey],
  }));

  const { coefficients } = fitLinearRegression(
    points.map((p) => [p.x1, p.x2]),
    points.map((p) => p.y)
  );

  const predicted = points.map((p) => predict(coefficients, [p.x1, p.x2]));
  const r2 = rSquared(points.map((p) => p.y), predicted);
  const rmseValue = rmse(points.map((p) => p.y), predicted);
  const planeData = buildScatterPlaneData(points, coefficients);

  return { coefficients, r2, rmseValue, planeData };
}

export default function RegressionScatter3D() {
  const [presetId, setPresetId] = useState(featurePresets[0].id);
  const preset = featurePresets.find((p) => p.id === presetId)!;
  const { r2, rmseValue, planeData } = useMemo(() => computeForPreset(preset), [preset]);

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {featurePresets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === presetId ? 'is-active' : ''}
            onClick={() => setPresetId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Plot
        data={[
          {
            type: 'scatter3d',
            mode: 'markers',
            x: planeData.scatter.x,
            y: planeData.scatter.y,
            z: planeData.scatter.z,
            marker: { size: 4, color: '#5ee6d0' },
            name: '樣本資料',
          },
          {
            type: 'surface',
            x: planeData.plane.x,
            y: planeData.plane.y,
            z: planeData.plane.z,
            opacity: 0.5,
            showscale: false,
            colorscale: [
              [0, '#7c5ee6'],
              [1, '#7c5ee6'],
            ],
            name: '回歸平面',
          },
        ]}
        layout={{
          autosize: true,
          paper_bgcolor: '#0f1117',
          plot_bgcolor: '#0f1117',
          font: { color: '#e4e6eb' },
          scene: {
            xaxis: { title: preset.xKey },
            yaxis: { title: preset.yKey },
            zaxis: { title: preset.targetKey },
          },
          margin: { l: 0, r: 0, t: 20, b: 0 },
        }}
        useResizeHandler
        style={{ width: '100%', height: '480px' }}
        config={{ displaylogo: false }}
      />
      <dl className="regression-chart__stats">
        <div>
          <dt>R²</dt>
          <dd>{r2.toFixed(4)}</dd>
        </div>
        <div>
          <dt>RMSE</dt>
          <dd>{rmseValue.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
