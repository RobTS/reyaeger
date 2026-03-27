import { createContext } from 'react';
import type { PidData, PidReference } from '../types/pid.ts';

export type PidControlContextType = {
  values: PidData;
  setValues: (values: PidData) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  tuneEnabled: boolean;
  setTuneEnabled: (enabled: boolean) => void;
  setpoint: number;
  setSetpoint: (setpoint: number) => void;
  referenceValue: PidReference;
  setReferenceValue: (referenceValue: PidReference) => void;
};

export const PidControlContext = createContext<PidControlContextType>({
  values: { ki: 1, kp: 0.1, kd: 0 },
  setValues: () => {},
  enabled: false,
  setEnabled: () => {},
  tuneEnabled: false,
  setTuneEnabled: () => {},
  setpoint: 0,
  setSetpoint: () => {},
  referenceValue: 'ET',
  setReferenceValue: () => {},
});
