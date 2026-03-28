import { createContext } from 'react';
import { DateTime } from 'luxon';
import type { RoastEvent, YaegerMessageWrapper } from '../types/connection.ts';

export type RecorderContextType = {
  records: YaegerMessageWrapper[];
  start: () => void;
  stop: () => void;
  clear: () => void;
  recording: boolean;
  startDate?: DateTime;
  events: RoastEvent[];
  addEvent: (event: RoastEvent) => void;
};

export const RecorderContext = createContext<RecorderContextType>({
  records: [],
  events: [],
  start: () => {},
  stop: () => {},
  clear: () => {},
  addEvent: () => {},
  recording: false,
});
