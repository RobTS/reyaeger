// WebSocket message type
import type { DateTime } from 'luxon';

export type YaegerMessage = {
  ET: number;
  BT: number;
  Amb: number;
  FanVal: number;
  BurnerVal: number;
  id: number;
};

export type YaegerMessageWrapper = {
  message: YaegerMessage;
  extras?: { setpoint?: number };
  time: DateTime;
};

export type RoastEvent = {
  label: string;
  time: DateTime;
};
