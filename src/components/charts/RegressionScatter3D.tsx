import { useMemo, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import {
  startups,
  featurePresets,
  fixedRanges,
  fieldLabels,
  type FeaturePreset,
} from '../../lib/datasets';
import { fitLinearRegression, predict, rSquared, rmse } from '../../lib/regression';
import { buildScatterPlaneData } from '../../lib/regressionPlaneData';

// Keeps the 3D scene panes inside the page's dark palette instead of Plotly's
// default light-grey walls.
const axisStyle = {
  color: '#8b93a7',
  gridcolor: '#262a35',
  zerolinecolor: '#333949',
  backgroundcolor: '#0f1117',
  showbackground: true,
};

// Derived from Plotly's default scene camera eye (1.25, 1.25, 1.25) so the
// initial view is unchanged: radius = |eye|, elevation = asin(z / radius).
const CAMERA_RADIUS = Math.sqrt(3) * 1.25;
const DEFAULT_ELEVATION_DEG = (Math.asin(1.25 / CAMERA_RADIUS) * 180) / Math.PI;
const DEFAULT_AZIMUTH_DEG = 45;
const DRAG_SENSITIVITY = 0.4; // degrees of rotation per pixel of drag
const ELEVATION_RANGE_DEG = 30; // max tilt away from the default elevation, either direction

// Custom rotation: azimuth is free, elevation is clamped to +/-30 degrees
// around the default, so dragging can tilt the view a little but can never
// flip the scene upside down (unlike Plotly's built-in 'turntable' dragmode,
// which lets the camera swing all the way past vertical).
function cameraEyeFromAngles(azimuthDeg: number, elevationDeg: number) {
  const azimuthRad = (azimuthDeg * Math.PI) / 180;
  const elevationRad = (elevationDeg * Math.PI) / 180;
  const horizontalRadius = CAMERA_RADIUS * Math.cos(elevationRad);
  return {
    x: horizontalRadius * Math.cos(azimuthRad),
    y: horizontalRadius * Math.sin(azimuthRad),
    z: CAMERA_RADIUS * Math.sin(elevationRad),
  };
}

function clampElevation(elevationDeg: number) {
  const min = DEFAULT_ELEVATION_DEG - ELEVATION_RANGE_DEG;
  const max = DEFAULT_ELEVATION_DEG + ELEVATION_RANGE_DEG;
  return Math.min(max, Math.max(min, elevationDeg));
}

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
  const planeData = buildScatterPlaneData(
    points,
    coefficients,
    fixedRanges[preset.xKey],
    fixedRanges[preset.yKey]
  );

  return { coefficients, r2, rmseValue, planeData };
}

export default function RegressionScatter3D() {
  const [presetId, setPresetId] = useState(featurePresets[0].id);
  const preset = featurePresets.find((p) => p.id === presetId)!;
  const { r2, rmseValue, planeData } = useMemo(() => computeForPreset(preset), [preset]);

  const [azimuthDeg, setAzimuthDeg] = useState(DEFAULT_AZIMUTH_DEG);
  const [elevationDeg, setElevationDeg] = useState(DEFAULT_ELEVATION_DEG);
  const cameraEye = useMemo(
    () => cameraEyeFromAngles(azimuthDeg, elevationDeg),
    [azimuthDeg, elevationDeg]
  );
  const dragState = useRef<{
    startX: number;
    startY: number;
    startAzimuth: number;
    startElevation: number;
  } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startAzimuth: azimuthDeg,
      startElevation: elevationDeg,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;
    setAzimuthDeg(dragState.current.startAzimuth - deltaX * DRAG_SENSITIVITY);
    setElevationDeg(clampElevation(dragState.current.startElevation - deltaY * DRAG_SENSITIVITY));
  }

  function handlePointerUp() {
    dragState.current = null;
  }

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
      <div
        className="regression-chart__frame"
        role="img"
        aria-label="3D 迴歸圖表，可用滑鼠或觸控拖曳旋轉視角"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: 'grab', touchAction: 'none' }}
      >
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
          hoverlabel: {
            bgcolor: '#161922',
            bordercolor: '#262a35',
            font: { color: '#e4e6eb' },
          },
          legend: { bgcolor: 'rgba(0,0,0,0)' },
          scene: {
            dragmode: false,
            camera: { eye: cameraEye },
            aspectmode: 'manual',
            aspectratio: { x: 1.6, y: 1.6, z: 1 },
            xaxis: {
              title: preset.xKey,
              range: [fixedRanges[preset.xKey].min, fixedRanges[preset.xKey].max],
              ...axisStyle,
            },
            yaxis: {
              title: preset.yKey,
              range: [fixedRanges[preset.yKey].min, fixedRanges[preset.yKey].max],
              ...axisStyle,
            },
            zaxis: {
              title: preset.targetKey,
              range: [fixedRanges[preset.targetKey].min, fixedRanges[preset.targetKey].max],
              ...axisStyle,
            },
          },
          margin: { l: 0, r: 0, t: 20, b: 0 },
        }}
        useResizeHandler
        style={{ width: '100%', height: '480px' }}
        config={{ displaylogo: false, displayModeBar: false }}
      />
      </div>
      <ul className="regression-chart__axis-legend">
        <li>
          <span className="regression-chart__axis-badge" data-axis="x">X</span>
          {fieldLabels[preset.xKey]}
        </li>
        <li>
          <span className="regression-chart__axis-badge" data-axis="y">Y</span>
          {fieldLabels[preset.yKey]}
        </li>
        <li>
          <span className="regression-chart__axis-badge" data-axis="z">Z</span>
          {fieldLabels[preset.targetKey]}
        </li>
      </ul>
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
