import { describe, it, expect } from 'vitest';
import { buildScatterPlaneData } from './regressionPlaneData';

describe('buildScatterPlaneData', () => {
  const points = [
    { x1: 0, x2: 0, y: 1 },
    { x1: 1, x2: 0, y: 3 },
    { x1: 0, x2: 1, y: 4 },
  ];
  const coefficients = [1, 2, 3]; // y = 1 + 2*x1 + 3*x2

  it('extracts raw scatter coordinates from points', () => {
    const { scatter } = buildScatterPlaneData(points, coefficients);
    expect(scatter.x).toEqual([0, 1, 0]);
    expect(scatter.y).toEqual([0, 0, 1]);
    expect(scatter.z).toEqual([1, 3, 4]);
  });

  it('builds a grid surface where every point satisfies the plane equation', () => {
    const { plane } = buildScatterPlaneData(points, coefficients, 4);
    expect(plane.x).toHaveLength(5);
    expect(plane.y).toHaveLength(5);
    expect(plane.z).toHaveLength(5);
    plane.z.forEach((row, yi) => {
      row.forEach((z, xi) => {
        const expected =
          coefficients[0] +
          coefficients[1] * plane.x[xi] +
          coefficients[2] * plane.y[yi];
        expect(z).toBeCloseTo(expected, 10);
      });
    });
  });
});
