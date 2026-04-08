import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ProfileExecutionContext,
  type ProfileExecutionContextType,
} from './ProfileExecutionContext.ts';
import { ProfileProcessor } from '../common/profileProcessor.ts';
import { DateTime } from 'luxon';
import { useYaegerCommands, useYaegerLastMessage } from '../hooks/useYaeger.ts';
import { useAppSelector } from '../state/store.ts';

type Props = {
  children: React.ReactNode;
};

export const ProfileExecutionProvider: React.FC<Props> = ({ children }) => {
  const profile = useAppSelector((s) => s.profile.selectedProfile.profile);
  const [startDate, setStartDate] = useState<DateTime | undefined>();
  const { sendCommand } = useYaegerCommands();
  const lastMessage = useYaegerLastMessage();

  const profileProcessor = useMemo(
    () => profile && new ProfileProcessor(profile),
    [profile],
  );

  useEffect(() => {
    if (!startDate) return;

    const timeElapsed = -startDate.diffNow().as('milliseconds');
    const config = profileProcessor?.getConfigAtTime(timeElapsed);
    if (!config) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStartDate(undefined);
      return;
    }
    sendCommand({ Setpoint: config.setpoint });
    if (config.fanValue !== undefined) sendCommand({ FanVal: config.fanValue });
  }, [profileProcessor, sendCommand, startDate, lastMessage]);

  const start = useCallback(() => {
    setStartDate(DateTime.now());
    sendCommand({ Mode: 'PID' });
  }, [sendCommand]);

  const stop = useCallback(
    (cooldown?: boolean) => {
      setStartDate(undefined);
      if (cooldown) {
        sendCommand({ FanVal: 65, Setpoint: 0 });
      }
    },
    [sendCommand],
  );

  const providerProps = useMemo((): ProfileExecutionContextType => {
    return {
      start,
      stop,
      enabled: !!startDate,
    };
  }, [start, startDate, stop]);

  return (
    <ProfileExecutionContext.Provider value={providerProps}>
      {children}
    </ProfileExecutionContext.Provider>
  );
};
