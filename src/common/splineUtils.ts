import { curveMonotoneX, line, scaleLinear } from 'd3';
import { svgPathProperties } from 'svg-path-properties';

export const getPathForPoints = (
  points: [number, number][],
  options: {
    scaleX?: { domain: [number, number]; range: [number, number] };
    scaleY?: { domain: [number, number]; range: [number, number] };
  } = {},
): string | undefined => {
  const lineAlgo = line();

  if (options.scaleX) {
    const xScale = scaleLinear()
      .domain(options.scaleX.domain)
      .range(options.scaleX.range);
    lineAlgo.x((d) => xScale(d[0]));
  }
  if (options.scaleY) {
    const yScale = scaleLinear()
      .domain(options.scaleY.domain)
      .range(options.scaleY.range);
    lineAlgo.y((d) => yScale(d[1]));
  }

  lineAlgo.curve(curveMonotoneX);

  return lineAlgo(points) || undefined;
};

export const getCurveForPoints = (
  points: [number, number][],
  steps: number,
): [number, number][] => {
  const path = getPathForPoints(points);
  if (!path) return [];

  const properties = new svgPathProperties(path);
  const length = properties.getTotalLength();
  const mappedPoints: [number, number][] = [];
  for (let i = 0; i <= steps - 1; i++) {
    const result = properties.getPointAtLength((i * length) / (steps - 1));
    mappedPoints.push([result.x, result.y]);
  }
  return mappedPoints;
};
