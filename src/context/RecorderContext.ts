import { createContext } from 'react';
import { DateTime } from 'luxon';
import type { YaegerMessageWrapper } from '../types/connection.ts';

export type RecorderContextType = {
  records: YaegerMessageWrapper[];
  start: () => void;
  stop: () => void;
  clear: () => void;
  recording: boolean;
  startDate?: DateTime;
};

export const RecorderContext = createContext<RecorderContextType>({
  records: [],
  start: () => {},
  stop: () => {},
  clear: () => {},
  recording: false,
});
