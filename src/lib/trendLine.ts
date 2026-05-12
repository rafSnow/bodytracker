export function linearRegression(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
  predict: (x: number) => number;
} {
  const n = points.length;
  if (n < 2) {
    return { slope: 0, intercept: 0, predict: (_x) => (points[0] ? points[0].y : 0) };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    predict: (x) => slope * x + intercept,
  };
}
