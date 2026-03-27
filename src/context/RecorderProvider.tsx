import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import {
  RecorderContext,
  type RecorderContextType,
} from './RecorderContext.ts';
import { last } from 'lodash-es';
import { useYaegerLastMessage } from '../hooks/useYaeger.ts';
import type { YaegerMessageWrapper } from '../types/connection.ts';

type Props = {
  children: React.ReactNode;
};

export const RecorderProvider: React.FC<Props> = ({ children }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [records, setRecords] = useState<YaegerMessageWrapper[]>([]);
  const [startDate, setStartDate] = useState<DateTime | undefined>();

  const start = useCallback(() => {
    console.log('Starting recorder');
    setRecording(true);
    if (!startDate) setStartDate(DateTime.now());
  }, [startDate]);

  const stop = useCallback(() => {
    console.log('Stopping recorder');
    setRecording(false);
  }, []);

  const clear = useCallback(() => {
    console.log('Clearing recorder');
    setRecords([]);
    setStartDate(undefined);
  }, []);

  const record = useYaegerLastMessage();

  useEffect(() => {
    if (!record) return;
    if (!recording) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (last(records)?.time !== record.time) setRecords([...records, record]);
  }, [record, recording, records]);

  const providerProps = useMemo<RecorderContextType>(() => {
    return {
      records,
      startDate,
      recording,
      clear,
      stop,
      start,
    };
  }, [clear, recording, records, start, startDate, stop]);

  return (
    <RecorderContext.Provider value={providerProps}>
      {children}
    </RecorderContext.Provider>
  );
};
