import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ProfileExecutionContext,
  type ProfileExecutionContextType,
} from './ProfileExecutionContext.ts';
import type { Profile } from '../types/profile.ts';
import { ProfileProcessor } from '../common/profileProcessor.ts';
import { DateTime } from 'luxon';
import {
  usePidControlCommands,
  usePidControlSetpoint,
  usePidControlStatus,
} from '../hooks/usePidControl.ts';
import { useYaegerCommands, useYaegerLastMessage } from '../hooks/useYaeger.ts';

type Props = {
  children: React.ReactNode;
};

export const ProfileExecutionProvider: React.FC<Props> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [startDate, setStartDate] = useState<DateTime | undefined>();
  const [enabled, setEnabled] = useState(false);
  const setSetpoint = usePidControlSetpoint()[1];
  const setPidEnabled = usePidControlStatus()[1];
  const { reset } = usePidControlCommands();
  const { sendCommand } = useYaegerCommands();
  const lastMessage = useYaegerLastMessage();

  const profileProcessor = useMemo(
    () => profile && new ProfileProcessor(profile),
    [profile],
  );

  useEffect(() => {
    if (!startDate) return;
    if (!enabled) return;

    const timeElapsed = -startDate.diffNow().as('milliseconds');
    const config = profileProcessor?.getConfigAtTime(timeElapsed);
    if (!config) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(false);
      return;
    }
    setSetpoint(config.setpoint);
    if (config.fanValue !== undefined) sendCommand({ FanVal: config.fanValue });
  }, [
    profileProcessor,
    sendCommand,
    setSetpoint,
    startDate,
    lastMessage,
    enabled,
  ]);

  const start = useCallback(() => {
    setPidEnabled(true);
    setStartDate(DateTime.now());
    setEnabled(true);
    reset();
  }, [reset, setPidEnabled]);

  const stop = useCallback(
    (cooldown?: boolean) => {
      setStartDate(undefined);
      if (cooldown) {
        setSetpoint(0);
        sendCommand({ FanVal: 65 });
      }
    },
    [sendCommand, setSetpoint],
  );

  const providerProps = useMemo((): ProfileExecutionContextType => {
    return {
      profile,
      setProfile,
      start,
      stop,
      enabled,
    };
  }, [profile, start, stop, enabled]);

  return (
    <ProfileExecutionContext.Provider value={providerProps}>
      {children}
    </ProfileExecutionContext.Provider>
  );
};
