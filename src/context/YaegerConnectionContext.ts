import { createContext } from 'react';
import type {
  YaegerMessageWrapper,
  YaegerPidMessage,
} from '../types/connection.ts';
import type { PidData } from '../types/pid.ts';

export type WsStatus = 'disconnected' | 'error' | 'pending' | 'connected';

export type ConnectionContextType = {
  status: WsStatus;
  clientId: number | undefined;
  lastMessage: YaegerMessageWrapper | undefined;
  sendCommand: (command: { BurnerVal?: number; FanVal?: number }) => void;
  error: Error | undefined;
  pidInfo: YaegerPidMessage | undefined;
  updatePidInfo: (pidData: PidData) => void;
};

export const YaegerConnectionContext = createContext<ConnectionContextType>({
  status: 'disconnected',
  clientId: undefined,
  lastMessage: undefined,
  sendCommand: () => {
    throw new Error('ConnectionContextProvider not found');
  },
  error: undefined,
  pidInfo: undefined,
  updatePidInfo: () => {
    throw new Error('ConnectionContextProvider not found');
  },
});
