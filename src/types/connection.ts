// WebSocket message type
import type { DateTime } from 'luxon';
import type { PidData } from './pid.ts';

export type YaegerMessage = YaegerPidMessage | YaegerStatusMessage;

export type YaegerPidMessage = {
  type: 'pid';
  pidKp: number;
  pidKi: number;
  pidKd: number;
  id: number;
};

export type YaegerStatusMessage = {
  type: 'status';
  ET: number;
  BT: number;
  Amb: number;
  FanVal: number;
  BurnerVal: number;
  id: number;
};

export type YaegerMessageWrapper = {
  message: YaegerStatusMessage;
  extra?: { setpoint?: number; pidData?: PidData };
  time: DateTime;
};

export type RoastEvent = {
  label: string;
  time: DateTime;
};
