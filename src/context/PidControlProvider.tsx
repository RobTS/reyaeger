import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PidControlContext,
  type PidControlContextType,
} from './PidControlContext.ts';
import {
  useYaegerCommands,
  useYaegerLastMessage,
  useYaegerPidValues,
} from '../hooks/useYaeger.ts';
import type { PidData, PidReference } from '../types/pid.ts';
import { PidAutoTune2 } from '../common/pidControl.ts';

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

  const controller = useMemo(() => {
    const pid = new PidAutoTune2(0, 100, 'ZieglerNichols');
    pid.setManualGains(
      yaegerValues?.pidKp || 1,
      yaegerValues?.pidKi || 0,
      yaegerValues?.pidKd || 0,
    );
    pid.enableAntiWindup(true, 0.8);
    pid.setOscillationMode('Normal');
    pid.setOperationalMode('Normal');
    return pid;
  }, [yaegerValues]);

  useEffect(() => {
    controller.setSetpoint(setpoint);
  }, [controller, setpoint]);

  useEffect(() => {
    if (!enabled) return;
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
    controller.update(temp);
    const newBurnerVal = controller.getOutput();
    sendCommand({ BurnerVal: newBurnerVal });
  }, [controller, enabled, lastMessage, referenceValue, sendCommand]);

  useEffect(() => {
    if (!tuneEnabled) return;
    if (controller.getOperationalMode() === 'Tune') return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTuningResult({
      kp: controller.getKp(),
      ki: controller.getKi(),
      kd: controller.getKd(),
    });
    setTuneEnabled(false);
    sendCommand({ BurnerVal: 0 });
  }, [controller, sendCommand, tuneEnabled, lastMessage]);

  useEffect(() => {
    if (enabled) return;
    sendCommand({ BurnerVal: 0 });
  }, [enabled, sendCommand]);

  const resetPid = useCallback(() => {
    controller.setOperationalMode('Hold');
    controller.setOperationalMode('Normal');
  }, [controller]);

  const enableTune = useCallback(
    (enabled: boolean) => {
      setTuneEnabled(enabled);
      if (enabled) {
        sendCommand({ FanVal: 65 });
        setSetpoint(160);
        controller.setSetpoint(160);
        controller.setOperationalMode('Tune');
      } else {
        sendCommand({ FanVal: 50 });
        setSetpoint(0);
        controller.setSetpoint(0);
        controller.setOperationalMode('Normal');
      }
    },
    [controller, sendCommand],
  );

  const providerProps =
    useMemo<PidControlContextType>((): PidControlContextType => {
      return {
        enabled,
        setEnabled,
        tuneEnabled,
        setTuneEnabled: enableTune,
        resetPid,
        tuningResult,
        setpoint,
        setSetpoint,
        referenceValue,
        setReferenceValue,
      };
    }, [
      enableTune,
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
