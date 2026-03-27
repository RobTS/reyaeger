import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ProfileExecutionContext,
  type ProfileExecutionContextType,
} from './ProfileExecutionContext.ts';
import type { Profile } from '../types/profile.ts';
import { ProfileProcessor } from '../common/profileProcessor.ts';
import { DateTime } from 'luxon';
import { usePidControlSetpoint } from '../hooks/usePidControl.ts';
import { useYaegerSendCommand } from '../hooks/useYaeger.ts';

type Props = {
  children: React.ReactNode;
};

export const ProfileExecutionProvider: React.FC<Props> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [startDate, setStartDate] = useState<DateTime | undefined>();
  const setSetpoint = usePidControlSetpoint()[1];
  const sendCommand = useYaegerSendCommand();

  const profileProcessor = useMemo(
    () => profile && new ProfileProcessor(profile),
    [profile],
  );

  useEffect(() => {
    if (!startDate) return;

    const interval = setInterval(() => {
      const timeElapsed = -startDate.diffNow().as('milliseconds');
      const config = profileProcessor?.getConfigAtTime(timeElapsed);
      if (config) {
        setSetpoint(config.setpoint);
        if (config.fanValue !== undefined)
          sendCommand({ FanVal: config.fanValue });
      } else {
        setStartDate(undefined);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [profileProcessor, sendCommand, setSetpoint, startDate]);

  const providerProps = useMemo((): ProfileExecutionContextType => {
    return {
      profile,
      setProfile,
      setEnabled: (enabled) =>
        setStartDate(enabled ? DateTime.now() : undefined),
      enabled: !!startDate,
    };
  }, [startDate, profile]);

  return (
    <ProfileExecutionContext.Provider value={providerProps}>
      {children}
    </ProfileExecutionContext.Provider>
  );
};
