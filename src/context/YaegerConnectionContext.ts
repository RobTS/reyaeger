import { createContext } from 'react';
import type {
  YaegerMessageWrapper,
  YaegerPreferences,
  YaegerPreferencesMessage,
} from '../types/connection.ts';

export type WsStatus = 'disconnected' | 'error' | 'pending' | 'connected';

export type HeatingMode = 'Manual' | 'PID';

export type TemperatureTarget = 'ET' | 'BT' | 'MAX';

export type YaegerCommand = {
  Mode?: HeatingMode;
  Target?: TemperatureTarget;
  BurnerVal?: number;
  Setpoint?: number;
  FanVal?: number;
};

export type ConnectionContextType = {
  status: WsStatus;
  clientId: number | undefined;
  lastMessage: YaegerMessageWrapper | undefined;
  sendCommand: (command: YaegerCommand) => void;
  startAutotune: () => void;
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
  startAutotune: () => {
    throw new Error('ConnectionContextProvider not found');
  },
});
