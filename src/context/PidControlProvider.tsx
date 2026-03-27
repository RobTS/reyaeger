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

export const PidControlProvider: React.FC<Props> = ({ children }) => {
  const [setpoint, setSetpoint] = useState<number>(0);
  const [enabled, setEnabled] = useState(true);
  const [tuneEnabled, setTuneEnabled] = useState(false);
  const [values, setValues] = useState({
    ki: 5,
    kp: 0.01,
    kd: 15,
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

    const interval = setInterval(() => {
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
    }, 1000 / 30);

    return () => {
      clearInterval(interval);
    };
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
    if (enabled) return;
    sendCommand({ BurnerVal: 0 });
  }, [enabled, sendCommand]);

  useEffect(() => {
    if (!pidTune) return;
    if (!lastMessage) return;
    pidTune.temperatureUpdate(
      lastMessage.time,
      lastMessage.message.ET,
      setpoint,
    );
    const result = pidTune.checkForCompletion();
    console.log('Final result', result);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (result) setTuneEnabled(false);
  }, [lastMessage, pidTune, setpoint]);

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
