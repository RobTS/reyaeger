export const timeToX = (
  time: number,
  maxTime: number,
  dimensions: { width: number; height: number },
  padding: { left: number; right: number; top: number; bottom: number },
) =>
  padding.left +
  (time / maxTime) * (dimensions.width - padding.left - padding.right);

export const xToTime = (
  x: number,
  maxTime: number,
  dimensions: { width: number; height: number },
  padding: { left: number; right: number; top: number; bottom: number },
) =>
  ((x - padding.left) / (dimensions.width - padding.left - padding.right)) *
  maxTime;

export const tempToY = (
  temp: number,
  maxTemp: number,
  dimensions: { width: number; height: number },
  padding: { left: number; right: number; top: number; bottom: number },
) =>
  padding.top +
  (1 - temp / maxTemp) * (dimensions.height - padding.top - padding.bottom);

export const yToTemp = (
  y: number,
  maxTemp: number,
  dimensions: { width: number; height: number },
  padding: { left: number; right: number; top: number; bottom: number },
) =>
  (1 - (y - padding.top) / (dimensions.height - padding.top - padding.bottom)) *
  maxTemp;

export const percentToY = (
  percent: number,
  maxPercent: number,
  dimensions: { width: number; height: number },
  padding: { left: number; right: number; top: number; bottom: number },
) =>
  padding.top +
  (1 - percent / maxPercent) *
    (dimensions.height - padding.top - padding.bottom);

export const yToPercent = (
  y: number,
  maxPercent: number,
  dimensions: { width: number; height: number },
  padding: { left: number; right: number; top: number; bottom: number },
) =>
  (1 - (y - padding.top) / (dimensions.height - padding.top - padding.bottom)) *
  maxPercent;
