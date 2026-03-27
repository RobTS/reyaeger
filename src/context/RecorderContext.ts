import { createContext } from 'react';
import type { YaegerMessage } from '../api/types.ts';
import { DateTime } from 'luxon';

export type RecorderContextType = {
  records: { message: YaegerMessage; time: DateTime }[];
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
