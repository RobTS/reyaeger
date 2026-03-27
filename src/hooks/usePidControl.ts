import { useContext } from 'react';
import { PidControlContext } from '../context/PidControlContext.ts';

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

export const usePidControlValues = () => {
  const context = useContext(PidControlContext);
  if (context === undefined) {
    throw new Error('useYaeger must be used within a YaegerConnectionProvider');
  }
  return context.values;
};
