// WebSocket message type
import type { DateTime } from 'luxon';
import type { Profile } from './profile.ts';
import type { PidData } from './pid.ts';

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

export type Measurement = {
  timestamp: Date;
  message: YaegerMessage;
  extra?: MeasurementExtra;
};

export type MeasurementExtra = {
  setpoint: number;
  pidData?: PidData;
};

export type RoastState = {
  startDate: Date;
  measurements: Measurement[];
  events: RoastEvent[];
  commands: RoastCommand[];
  profile?: Profile;
};

export type RoastEvent = {
  label: string;
  measurement: Measurement;
};

export type RoastCommand = {
  type: 'fan' | 'heater';
  value: number;
  timestamp: Date;
};
