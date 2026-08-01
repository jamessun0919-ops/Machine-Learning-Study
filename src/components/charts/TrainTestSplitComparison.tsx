import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { trainTestSplit, kFoldSplit } from '../../lib/dataSplit';

type ViewMode = 'split' | 'kfold';
type SplitRatio = 0.7 | 0.8 | 0.9;

const splitOptions: { ratio: SplitRatio; label: string }[] = [
  { ratio: 0.7, label: '70/30' },
  { ratio: 0.8, label: '80/20' },
  { ratio: 0.9, label: '90/10' },
];

const foldOptions = [0, 1, 2, 3, 4];

const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
};

export default function TrainTestSplitComparison() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitRatio, setSplitRatio] = useState<SplitRatio>(0.8);
  const [currentFold, setCurrentFold] = useState(0);

  const { trainIndices, secondaryIndices, secondaryLabel } = useMemo(() => {
    if (viewMode === 'split') {
      const { trainIndices, testIndices } = trainTestSplit(splitRatio);
      return { trainIndices, secondaryIndices: testIndices, secondaryLabel: '測試集' };
    }
    const { trainIndices, validationIndices } = kFoldSplit(currentFold);
    return {
      trainIndices,
      secondaryIndices: validationIndices,
      secondaryLabel: `驗證集（第 ${currentFold + 1} 折）`,
    };
  }, [viewMode, splitRatio, currentFold]);

  return (
    <div className="regression-chart">
      <div className="regression-chart__controls">
        <button
          type="button"
          className={viewMode === 'split' ? 'is-active' : ''}
          onClick={() => setViewMode('split')}
        >
          Train/Test Split
        </button>
        <button
          type="button"
          className={viewMode === 'kfold' ? 'is-active' : ''}
          onClick={() => setViewMode('kfold')}
        >
          k-fold 交叉驗證
        </button>
      </div>
      {viewMode === 'split' ? (
        <div className="regression-chart__controls">
          {splitOptions.map((opt) => (
            <button
              key={opt.ratio}
              type="button"
              className={opt.ratio === splitRatio ? 'is-active' : ''}
              onClick={() => setSplitRatio(opt.ratio)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="regression-chart__controls">
          {foldOptions.map((fold) => (
            <button
              key={fold}
              type="button"
              className={fold === currentFold ? 'is-active' : ''}
              onClick={() => setCurrentFold(fold)}
            >
              第 {fold + 1} 折
            </button>
          ))}
        </div>
      )}
      <div
        className="regression-chart__frame"
        style={{ cursor: 'default', touchAction: 'auto' }}
      >
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: trainIndices,
              y: trainIndices.map(() => '訓練集'),
              marker: { size: 8, color: '#5ee6d0', opacity: 0.8 },
              name: '訓練集',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: secondaryIndices,
              y: secondaryIndices.map(() => secondaryLabel),
              marker: { size: 8, color: '#e6a15e', opacity: 0.9 },
              name: secondaryLabel,
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
              title: '樣本編號（原始順序）',
              range: [-1, 50],
              ...axisStyle,
            },
            yaxis: {
              ...axisStyle,
              automargin: true,
            },
            margin: { l: 60, r: 20, t: 30, b: 50 },
          }}
          useResizeHandler
          style={{ width: '100%', height: '200px' }}
          config={{ displaylogo: false, displayModeBar: false }}
        />
      </div>
      <dl className="regression-chart__stats">
        <div>
          <dt>訓練集筆數</dt>
          <dd>{trainIndices.length}</dd>
        </div>
        <div>
          <dt>{secondaryLabel}筆數</dt>
          <dd>{secondaryIndices.length}</dd>
        </div>
      </dl>
    </div>
  );
}
