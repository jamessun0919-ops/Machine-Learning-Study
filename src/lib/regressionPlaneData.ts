export interface DataPoint {
  x1: number;
  x2: number;
  y: number;
}

export interface ScatterPlaneData {
  scatter: { x: number[]; y: number[]; z: number[] };
  plane: { x: number[]; y: number[]; z: number[][] };
}

export function buildScatterPlaneData(
  points: DataPoint[],
  coefficients: number[],
  gridSize = 10
): ScatterPlaneData {
  const scatter = {
    x: points.map((p) => p.x1),
    y: points.map((p) => p.x2),
    z: points.map((p) => p.y),
  };

  const x1Min = Math.min(...scatter.x);
  const x1Max = Math.max(...scatter.x);
  const x2Min = Math.min(...scatter.y);
  const x2Max = Math.max(...scatter.y);

  const xAxis: number[] = [];
  const yAxis: number[] = [];
  for (let i = 0; i <= gridSize; i++) {
    xAxis.push(x1Min + ((x1Max - x1Min) * i) / gridSize);
    yAxis.push(x2Min + ((x2Max - x2Min) * i) / gridSize);
  }

  const zGrid: number[][] = yAxis.map((x2) =>
    xAxis.map((x1) => coefficients[0] + coefficients[1] * x1 + coefficients[2] * x2)
  );

  return { scatter, plane: { x: xAxis, y: yAxis, z: zGrid } };
}
