import { createContext } from 'react';
import type { PidData, PidReference } from '../types/pid.ts';

export type PidControlContextType = {
  enabled: boolean;
  resetPid: () => void;
  setEnabled: (enabled: boolean) => void;
  tuneEnabled: boolean;
  setTuneEnabled: (enabled: boolean) => void;
  setpoint: number;
  setSetpoint: (setpoint: number) => void;
  tuningResult: PidData | undefined;
  referenceValue: PidReference;
  setReferenceValue: (referenceValue: PidReference) => void;
};

export const PidControlContext = createContext<PidControlContextType>({
  enabled: false,
  setEnabled: () => {},
  resetPid: () => {},
  tuneEnabled: false,
  tuningResult: undefined,
  setTuneEnabled: () => {},
  setpoint: 0,
  setSetpoint: () => {},
  referenceValue: 'ET',
  setReferenceValue: () => {},
});
