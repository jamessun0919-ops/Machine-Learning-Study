export interface DataPoint {
  x1: number;
  x2: number;
  y: number;
}

export interface AxisRange {
  min: number;
  max: number;
}

export interface ScatterPlaneData {
  scatter: { x: number[]; y: number[]; z: number[] };
  plane: { x: number[]; y: number[]; z: number[][] };
}

export function buildScatterPlaneData(
  points: DataPoint[],
  coefficients: number[],
  x1Range: AxisRange,
  x2Range: AxisRange,
  gridSize = 10
): ScatterPlaneData {
  const scatter = {
    x: points.map((p) => p.x1),
    y: points.map((p) => p.x2),
    z: points.map((p) => p.y),
  };

  const xAxis: number[] = [];
  const yAxis: number[] = [];
  for (let i = 0; i <= gridSize; i++) {
    xAxis.push(x1Range.min + ((x1Range.max - x1Range.min) * i) / gridSize);
    yAxis.push(x2Range.min + ((x2Range.max - x2Range.min) * i) / gridSize);
  }

  const zGrid: number[][] = yAxis.map((x2) =>
    xAxis.map((x1) => coefficients[0] + coefficients[1] * x1 + coefficients[2] * x2)
  );

  return { scatter, plane: { x: xAxis, y: yAxis, z: zGrid } };
}
