import { createContext } from 'react';

export type ProfileExecutionContextType = {
  enabled: boolean;
  start: () => void;
  stop: (cooldown?: boolean) => void;
};

export const ProfileExecutionContext =
  createContext<ProfileExecutionContextType>({
    enabled: false,
    start: () => {},
    stop: () => {},
  });
