import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PidControlContext,
  type PidControlContextType,
} from './PidControlContext.ts';
import { PidController } from '../common/pid.ts';
import {
  useYaegerLastMessage,
  useYaegerSendCommand,
} from '../hooks/useYaeger.ts';
import type { PidData, PidReference } from '../types/pid.ts';
import { PidAutoTune } from '../common/pidTune.ts';

type Props = {
  children: React.ReactNode;
};

const KP = parseInt(import.meta.env.VITE_PID_KP || '1');
const KI = parseInt(import.meta.env.VITE_PID_KI || '0');
const KD = parseInt(import.meta.env.VITE_PID_KD || '0.1');
// Dummy:  kp: 20, ki: 0.6, kd: 1,
// OwnMachine:  kp: 1.5, ki: 0.012, kd: 12
export const PidControlProvider: React.FC<Props> = ({ children }) => {
  const [setpoint, setSetpoint] = useState<number>(0);
  const [enabled, setEnabled] = useState(true);
  const [tuneEnabled, setTuneEnabled] = useState(false);
  const [tuningResult, setTuningResult] = useState<PidData | undefined>(
    undefined,
  );
  const [values, setValues] = useState({
    kp: KP,
    ki: KI,
    kd: KD,
  });
  const [referenceValue, setReferenceValue] = useState<PidReference>('ET');
  const sendCommand = useYaegerSendCommand();
  const lastMessage = useYaegerLastMessage();
  const hasSetpoint = !!setpoint;
  const controller = useMemo(
    () => (hasSetpoint ? new PidController(values) : undefined),
    [hasSetpoint, values],
  );

  const pidTune = useMemo(() => {
    if (!tuneEnabled) return;
    return new PidAutoTune({
      setPidEnabled: setEnabled,
      setHeaterPercentage: (temp) => sendCommand({ BurnerVal: temp }),
      setFanSpeed: (fanVal) => sendCommand({ FanVal: fanVal }),
      calibrationTemp: 140,
      calibrationFanSpeed: 85,
    });
  }, [sendCommand, tuneEnabled]);

  useEffect(() => {
    if (!enabled) return;
    if (pidTune) return;
    if (!controller) return;
    if (!lastMessage) return;
    const bt = lastMessage.message.BT;
    const et = lastMessage.message.ET;

    const temp =
      referenceValue === 'BT'
        ? bt
        : referenceValue === 'ET'
          ? et
          : Math.max(bt, et);
    const newBurnerVal = Math.max(
      Math.min(controller.compute(setpoint, temp), 100),
      0,
    );
    sendCommand({ BurnerVal: newBurnerVal });
  }, [
    controller,
    enabled,
    lastMessage,
    pidTune,
    referenceValue,
    sendCommand,
    setpoint,
  ]);

  useEffect(() => {
    if (!pidTune) return;
    if (!lastMessage) return;
    pidTune.temperatureUpdate(lastMessage.time, lastMessage.message.ET);
    const result = pidTune.checkForCompletion();
    if (!result) return;
    console.log('Final result', result);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTuningResult(result);
    setTuneEnabled(false);
  }, [lastMessage, pidTune, setpoint]);

  useEffect(() => {
    if (enabled) return;
    sendCommand({ BurnerVal: 0 });
  }, [enabled, sendCommand]);

  const resetPid = useCallback(() => {
    controller?.reset();
  }, [controller]);

  const providerProps =
    useMemo<PidControlContextType>((): PidControlContextType => {
      return {
        enabled,
        setEnabled,
        values,
        setValues,
        tuneEnabled,
        setTuneEnabled,
        resetPid,
        tuningResult,
        setpoint,
        setSetpoint,
        referenceValue,
        setReferenceValue,
      };
    }, [
      enabled,
      referenceValue,
      resetPid,
      setpoint,
      tuneEnabled,
      tuningResult,
      values,
    ]);

  return (
    <PidControlContext.Provider value={providerProps}>
      {children}
    </PidControlContext.Provider>
  );
};
