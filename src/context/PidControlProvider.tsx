import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  PidControlContext,
  type PidControlContextType,
} from './PidControlContext.ts';
import { PidController } from '../common/pid.ts';
import {
  useYaegerLastMessage,
  useYaegerSendCommand,
} from '../hooks/useYaeger.ts';
import type { PidReference } from '../types/pid.ts';
import { PidAutoTune } from '../common/pidTune.ts';

type Props = {
  children: React.ReactNode;
};

// Dummy:   kp: 20.6860275711623,  ki: 0.2,  kd: 8,
export const PidControlProvider: React.FC<Props> = ({ children }) => {
  const [setpoint, setSetpoint] = useState<number>(0);
  const [enabled, setEnabled] = useState(true);
  const [tuneEnabled, setTuneEnabled] = useState(false);
  const [values, setValues] = useState({
    kp: 21,
    ki: 0.6,
    kd: 18,
  });
  const [referenceValue, setReferenceValue] = useState<PidReference>('ET');
  const sendCommand = useYaegerSendCommand();
  const lastMessage = useYaegerLastMessage();

  const controller = useMemo(() => new PidController(values), [values]);

  const pidTune = useMemo(() => {
    if (!tuneEnabled) return;
    return new PidAutoTune({
      setPidEnabled: setEnabled,
      setHeaterSetpoint: () => sendCommand({ BurnerVal: 100 }),
      calibrationTemp: 180,
    });
  }, [sendCommand, tuneEnabled]);

  useEffect(() => {
    if (!enabled) return;
    if (pidTune) return;
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
    pidTune.temperatureUpdate(
      lastMessage.time,
      lastMessage.message.ET,
      setpoint,
    );
    const result = pidTune.checkForCompletion();
    if (!result) return;
    console.log('Final result', result);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTuneEnabled(false);
  }, [lastMessage, pidTune, setpoint]);

  useEffect(() => {
    if (enabled) return;
    sendCommand({ BurnerVal: 0 });
  }, [enabled, sendCommand]);

  const providerProps =
    useMemo<PidControlContextType>((): PidControlContextType => {
      return {
        enabled,
        setEnabled,
        values,
        setValues,
        tuneEnabled,
        setTuneEnabled,
        setpoint,
        setSetpoint,
        referenceValue,
        setReferenceValue,
      };
    }, [enabled, referenceValue, setpoint, tuneEnabled, values]);

  return (
    <PidControlContext.Provider value={providerProps}>
      {children}
    </PidControlContext.Provider>
  );
};
