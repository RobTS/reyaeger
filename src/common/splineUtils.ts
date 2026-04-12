import {
  curveBasis,
  curveCatmullRom,
  curveMonotoneX,
  line,
  scaleLinear,
} from 'd3';
import { svgPathProperties } from 'svg-path-properties';
import { cloneDeep } from 'lodash-es';

export const calculateRoR = (values: [number, number][]): [number, number][] =>
  values.map(([time, value], i): [number, number] => {
    if (i === 0) return [0, 0];
    const deltaTime = time - values[i - 1]![0]!;
    const deltaTemp = value - values[i - 1]![1]!;
    return [time, deltaTime > 0 ? deltaTemp / deltaTime : 0];
  });

export const movingAverage = (
  values: [number, number][],
  N: number,
): [number, number][] => {
  let i = 0;
  let sum = 0;
  const means = cloneDeep(values);
  for (let n = Math.min(N - 1, values.length); i < n; ++i) {
    sum += values[i]![1];
  }
  for (let n = values.length; i < n; ++i) {
    sum += values[i]![1];
    means[i]![1] = sum / N;
    sum -= values[i - N + 1]![1];
  }
  return means;
};

export const getPathForPoints = (
  points: [number, number][],
  options: {
    scaleX?: { domain: [number, number]; range: [number, number] };
    scaleY?: { domain: [number, number]; range: [number, number] };
    curve?: 'monotone' | 'catmullRom' | 'basis';
  } = {},
): string | undefined => {
  const lineAlgo = line();

  if (options.scaleX) {
    const xScale = scaleLinear()
      .domain(options.scaleX.domain)
      .range(options.scaleX.range)
      .clamp(true);
    lineAlgo.x((d) => xScale(d[0]));
  }
  if (options.scaleY) {
    const yScale = scaleLinear()
      .domain(options.scaleY.domain)
      .range(options.scaleY.range)
      .clamp(true);
    lineAlgo.y((d) => yScale(d[1]));
  }

  if (!options.curve || options.curve === 'monotone') {
    lineAlgo.curve(curveMonotoneX);
  }
  if (options.curve === 'catmullRom') {
    lineAlgo.curve(curveCatmullRom);
  }
  if (options.curve === 'basis') {
    lineAlgo.curve(curveBasis);
  }

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
