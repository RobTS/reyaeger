import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import {
  RecorderContext,
  type RecorderContextType,
} from './RecorderContext.ts';
import { last } from 'lodash-es';
import type { RoastEvent, YaegerMessageWrapper } from '../types/connection.ts';
import { usePidControlSetpoint } from '../hooks/usePidControl.ts';
import { useYaegerLastMessage } from '../hooks/useYaeger.ts';

type Props = {
  children: React.ReactNode;
};

export const RecorderProvider: React.FC<Props> = ({ children }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [records, setRecords] = useState<YaegerMessageWrapper[]>([]);
  const [events, setEvents] = useState<RoastEvent[]>([]);
  const [startDate, setStartDate] = useState<DateTime>();
  const [setpoint] = usePidControlSetpoint();
  const lastMessage = useYaegerLastMessage();

  const start = useCallback(() => {
    console.log('Starting recorder');
    setRecording(true);
    setRecords([]);
    setEvents([]);
    setStartDate(DateTime.now());
  }, []);

  const stop = useCallback(() => {
    console.log('Stopping recorder');
    setRecording(false);
  }, []);

  const clear = useCallback(() => {
    console.log('Clearing rec order');
    setRecords([]);
    setStartDate(DateTime.now());
  }, []);

  const addEvent = useCallback(
    (event: RoastEvent) => {
      setEvents([...events, event]);
    },
    [events],
  );

  useEffect(() => {
    if (!lastMessage) return;
    //if (!recording) return;

    if (last(records)?.time !== lastMessage.time)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecords([
        ...records,
        {
          ...lastMessage,
          extras: {
            setpoint,
          },
        },
      ]);
  }, [lastMessage, recording, records, setpoint]);

  const providerProps = useMemo<RecorderContextType>(() => {
    return {
      records,
      startDate,
      recording,
      clear,
      stop,
      start,
      events,
      addEvent,
    };
  }, [addEvent, clear, events, recording, records, start, startDate, stop]);

  return (
    <RecorderContext.Provider value={providerProps}>
      {children}
    </RecorderContext.Provider>
  );
};
