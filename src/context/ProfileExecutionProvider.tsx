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
} from '../hooks/usePidControl.ts';
import {
  useYaegerLastMessage,
  useYaegerSendCommand,
} from '../hooks/useYaeger.ts';

type Props = {
  children: React.ReactNode;
};

export const ProfileExecutionProvider: React.FC<Props> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [startDate, setStartDate] = useState<DateTime | undefined>();
  const setSetpoint = usePidControlSetpoint()[1];
  const { reset } = usePidControlCommands();
  const sendCommand = useYaegerSendCommand();
  const lastMessage = useYaegerLastMessage();

  const profileProcessor = useMemo(
    () => profile && new ProfileProcessor(profile),
    [profile],
  );

  useEffect(() => {
    if (!startDate) return;

    const timeElapsed = -startDate.diffNow().as('milliseconds');
    const config = profileProcessor?.getConfigAtTime(timeElapsed);
    if (config) {
      setSetpoint(config.setpoint);
      if (config.fanValue !== undefined)
        sendCommand({ FanVal: config.fanValue });
    }
  }, [profileProcessor, sendCommand, setSetpoint, startDate, lastMessage]);

  const start = useCallback(() => {
    setStartDate(DateTime.now());
    reset();
  }, [reset]);
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
      enabled: !!startDate,
    };
  }, [profile, start, stop, startDate]);

  return (
    <ProfileExecutionContext.Provider value={providerProps}>
      {children}
    </ProfileExecutionContext.Provider>
  );
};
