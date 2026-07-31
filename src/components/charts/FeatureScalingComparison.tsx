import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { startups, fieldLabels } from '../../lib/datasets';
import { computeStats, zScoreScale, minMaxScale } from '../../lib/scaling';

type ScalingMode = 'raw' | 'zscore' | 'minmax';

interface ScalingModeOption {
  id: ScalingMode;
  label: string;
  axisTitle: string;
  decimals: number;
}

const scalingModes: ScalingModeOption[] = [
  { id: 'raw', label: '原始值', axisTitle: '金額（美元）', decimals: 2 },
  { id: 'zscore', label: 'Z-score 標準化', axisTitle: 'Z-score', decimals: 4 },
  { id: 'minmax', label: 'Min-Max 縮放', axisTitle: 'Min-Max 縮放值（0–1）', decimals: 4 },
];

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

function scaleValues(mode: ScalingMode, values: number[]): number[] {
  if (mode === 'zscore') return zScoreScale(values);
  if (mode === 'minmax') return minMaxScale(values);
  return values;
}

export default function FeatureScalingComparison() {
  const [modeId, setModeId] = useState<ScalingMode>('raw');
  const mode = scalingModes.find((m) => m.id === modeId)!;

  const rdSpendRaw = useMemo(() => startups.map((row) => row.rdSpend), []);
  const marketingSpendRaw = useMemo(() => startups.map((row) => row.marketingSpend), []);

  const rdSpendScaled = useMemo(
    () => scaleValues(modeId, rdSpendRaw),
    [modeId, rdSpendRaw]
  );
  const marketingSpendScaled = useMemo(
    () => scaleValues(modeId, marketingSpendRaw),
    [modeId, marketingSpendRaw]
  );

  const rdStats = useMemo(() => computeStats(rdSpendScaled), [rdSpendScaled]);
  const marketingStats = useMemo(
    () => computeStats(marketingSpendScaled),
    [marketingSpendScaled]
  );

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        {scalingModes.map((m) => (
          <button
            key={m.id}
            type="button"
            className={m.id === modeId ? 'is-active' : ''}
            onClick={() => setModeId(m.id)}
          >
            {m.label}
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
              x: rdSpendScaled,
              y: rdSpendScaled.map(() => fieldLabels.rdSpend),
              marker: { size: 7, color: '#5ee6d0', opacity: 0.7 },
              name: fieldLabels.rdSpend,
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: marketingSpendScaled,
              y: marketingSpendScaled.map(() => fieldLabels.marketingSpend),
              marker: { size: 7, color: '#7c5ee6', opacity: 0.7 },
              name: fieldLabels.marketingSpend,
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
            xaxis: {
              title: mode.axisTitle,
              ...axisStyle,
            },
            yaxis: {
              ...axisStyle,
              automargin: true,
            },
            margin: { l: 140, r: 20, t: 30, b: 50 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '280px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>{fieldLabels.rdSpend} — 平均值</dt>
          <dd>{rdStats.mean.toFixed(mode.decimals)}</dd>
        </div>
        <div>
          <dt>{fieldLabels.rdSpend} — 標準差</dt>
          <dd>{rdStats.std.toFixed(mode.decimals)}</dd>
        </div>
        <div>
          <dt>{fieldLabels.rdSpend} — 範圍</dt>
          <dd>
            {rdStats.min.toFixed(mode.decimals)} ～ {rdStats.max.toFixed(mode.decimals)}
          </dd>
        </div>
        <div>
          <dt>{fieldLabels.marketingSpend} — 平均值</dt>
          <dd>{marketingStats.mean.toFixed(mode.decimals)}</dd>
        </div>
        <div>
          <dt>{fieldLabels.marketingSpend} — 標準差</dt>
          <dd>{marketingStats.std.toFixed(mode.decimals)}</dd>
        </div>
        <div>
          <dt>{fieldLabels.marketingSpend} — 範圍</dt>
          <dd>
            {marketingStats.min.toFixed(mode.decimals)} ～ {marketingStats.max.toFixed(mode.decimals)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
