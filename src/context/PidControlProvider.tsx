import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PidControlContext,
  type PidControlContextType,
} from './PidControlContext.ts';
import { PidController } from '../common/pid.ts';
import {
  useYaegerLastMessage,
  useYaegerCommands,
  useYaegerPidValues,
} from '../hooks/useYaeger.ts';
import type { PidData, PidReference } from '../types/pid.ts';
import { PidAutoTune } from '../common/pidTune.ts';

type Props = {
  children: React.ReactNode;
};

export const PidControlProvider: React.FC<Props> = ({ children }) => {
  const [setpoint, setSetpoint] = useState<number>(0);
  const [enabled, setEnabled] = useState(true);
  const [tuneEnabled, setTuneEnabled] = useState(false);
  const [tuningResult, setTuningResult] = useState<PidData | undefined>(
    undefined,
  );

  const [referenceValue, setReferenceValue] = useState<PidReference>('ET');
  const { sendCommand } = useYaegerCommands();
  const yaegerValues = useYaegerPidValues();
  const lastMessage = useYaegerLastMessage();

  const controller = useMemo(
    () =>
      new PidController({
        kp: yaegerValues?.pidKp || 0,
        ki: yaegerValues?.pidKi || 0,
        kd: yaegerValues?.pidKd || 0,
      }),
    [yaegerValues],
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
    if (setpoint === 0) {
      sendCommand({ BurnerVal: 0 });
      return;
    }
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
    ]);

  return (
    <PidControlContext.Provider value={providerProps}>
      {children}
    </PidControlContext.Provider>
  );
};
