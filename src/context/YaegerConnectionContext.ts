import { createContext } from 'react';
import type { YaegerMessage } from '../api/types.ts';
import { DateTime } from 'luxon';

export type WsStatus = 'disconnected' | 'error' | 'pending' | 'connected';

export type ConnectionContextType = {
  status: WsStatus;
  clientId: number | undefined;
  lastMessage: { message: YaegerMessage; time: DateTime } | undefined;
  sendCommand: (command: { BurnerVal?: number; FanVal?: number }) => void;
  error: Error | undefined;
};

export const YaegerConnectionContext = createContext<ConnectionContextType>({
  status: 'disconnected',
  clientId: undefined,
  lastMessage: undefined,
  sendCommand: () => {
    throw new Error('ConnectionContextProvider not found');
  },
  error: undefined,
});
