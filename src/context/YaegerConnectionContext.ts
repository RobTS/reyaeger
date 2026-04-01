import { createContext } from 'react';
import type {
  YaegerMessageWrapper,
  YaegerPreferences,
  YaegerPreferencesMessage,
} from '../types/connection.ts';

export type WsStatus = 'disconnected' | 'error' | 'pending' | 'connected';

export type ConnectionContextType = {
  status: WsStatus;
  clientId: number | undefined;
  lastMessage: YaegerMessageWrapper | undefined;
  sendCommand: (command: { BurnerVal?: number; FanVal?: number }) => void;
  error: Error | undefined;
  preferences: YaegerPreferencesMessage | undefined;
  setPreferences: (preferences: Partial<YaegerPreferences>) => void;
};

export const YaegerConnectionContext = createContext<ConnectionContextType>({
  status: 'disconnected',
  clientId: undefined,
  lastMessage: undefined,
  sendCommand: () => {
    throw new Error('ConnectionContextProvider not found');
  },
  error: undefined,
  preferences: undefined,
  setPreferences: () => {
    throw new Error('ConnectionContextProvider not found');
  },
});
