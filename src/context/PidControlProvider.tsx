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

type Props = {
  children: React.ReactNode;
};

// Dummy:  kp: 0.4, ki: 0.05, kd: 0.002,
export const PidControlProvider: React.FC<Props> = ({ children }) => {
  const [setpoint, setSetpoint] = useState<number>(0);
  const [enabled, setEnabled] = useState(true);
  const [tuneEnabled, setTuneEnabled] = useState(false);
  const [values, setValues] = useState({
    kp: 0.4,
    ki: 0.05,
    kd: 0.002,
  });
  const [referenceValue, setReferenceValue] = useState<PidReference>('ET');
  const sendCommand = useYaegerSendCommand();
  const lastMessage = useYaegerLastMessage();

  const controller = useMemo(() => new PidController(values), [values]);

  useEffect(() => {
    if (!enabled) return;
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
  }, [controller, enabled, lastMessage, referenceValue, sendCommand, setpoint]);

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
