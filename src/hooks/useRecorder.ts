import { useState } from 'react';
import type { YaegerMessage } from '../api/types.ts';
import { DateTime } from 'luxon';
import { last } from 'lodash-es';

export const useRecorder = (): {
  addRecord: (record: { message: YaegerMessage; time: DateTime }) => void;
  records: { message: YaegerMessage; time: DateTime }[];
  start: () => void;
  stop: () => void;
  clear: () => void;
  recording: boolean;
  startDate?: DateTime;
} => {
  const [recording, setRecording] = useState<boolean>(false);
  const [records, setRecords] = useState<
    {
      message: YaegerMessage;
      time: DateTime;
    }[]
  >([]);
  const [startDate, setStartDate] = useState<DateTime | undefined>();
  return {
    records,
    recording,
    start: () => {
      setRecording(true);
      setStartDate(DateTime.now);
    },
    stop: () => {
      setRecording(false);
    },
    clear: () => {
      setRecords([]);
      setStartDate(undefined);
    },
    addRecord: (record) => {
      if (!recording) return;
      if (last(records)?.time !== record.time) setRecords([...records, record]);
    },
    startDate,
  };
};
