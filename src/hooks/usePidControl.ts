import { useContext } from 'react';
import { PidControlContext } from '../context/PidControlContext.ts';
import type { PidReference } from '../types/pid.ts';

export const usePidControlSetpoint = (): [
  number,
  (setpoint: number) => void,
] => {
  const context = useContext(PidControlContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return [context.setpoint, context.setSetpoint];
};

export const usePidControlStatus = (): [
  boolean,
  (enabled: boolean) => void,
] => {
  const context = useContext(PidControlContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return [context.enabled, context.setEnabled];
};

export const usePidControlCommands = () => {
  const context = useContext(PidControlContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return { reset: context.resetPid };
};

export const usePidControlTuneStatus = (): [
  boolean,
  (enabled: boolean) => void,
] => {
  const context = useContext(PidControlContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return [context.tuneEnabled, context.setTuneEnabled];
};

export const usePidControlTuningResult = () => {
  const context = useContext(PidControlContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context.tuningResult;
};

export const usePidControlReferenceValue = (): [
  PidReference,
  (reference: PidReference) => void,
] => {
  const context = useContext(PidControlContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return [context.referenceValue, context.setReferenceValue];
};
