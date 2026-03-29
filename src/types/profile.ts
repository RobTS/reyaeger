export type Profile = {
  steps: ProfileStep[];
};

export type ProfileStep = {
  interpolation?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  setpoint: number;
  duration: number;
  fanValue?: number;
};

export interface CurvePoint {
  time: number; // seconds
  temperature: number; // celsius
  controlX?: number; // bezier control point
  controlY?: number; // bezier control point
}

export interface FanCurvePoint {
  time: number; // seconds
  fanSpeed: number; // 0-100%
}

export interface NxProfile {
  id: string;
  name: string;
  targetTemperature: number;
  targetTime: number; // seconds
  curve: CurvePoint[];
  fanCurve?: FanCurvePoint[];
  fanStartSpeed?: number; // 0-100%
  fanEndSpeed?: number; // 0-100%
  createdAt: number;
}
