// WebSocket message type
import type { DateTime } from 'luxon';

export type YaegerMessage = YaegerPreferencesMessage | YaegerStatusMessage;

export type HeaterMode = 'PID' | 'Tuning' | 'Manual';

export type TemperatureTarget = 'ET' | 'BT' | 'MAX';

export type YaegerPreferences = {
  pidKp: number;
  pidKi: number;
  pidKd: number;
  wifiSsid?: string;
  wifiPass?: string;
  cooldownFanSpeed?: number;
};

export type YaegerPreferencesMessage = YaegerPreferences & {
  type: 'preferences';
  id: number;
};

export type YaegerStatusMessage = {
  id: number;
  type: 'status';
  ET: number;
  BT: number;
  Amb: number;
  FanVal: number;
  BurnerVal: number;
  Setpoint: number;
  Target: TemperatureTarget;
  Mode: HeaterMode;
  pidKp: number;
  pidKi: number;
  pidKd: number;
  wifiStrength: number;
};

export type YaegerMessageWrapper = {
  message: YaegerStatusMessage;
  time: DateTime;
};

export type RoastEvent = {
  label: string;
  time: DateTime;
};
