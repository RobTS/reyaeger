import { createContext } from 'react';
import type { Profile } from '../types/profile.ts';

export type ProfileExecutionContextType = {
  profile: Profile | undefined;
  setProfile: (profile: Profile | undefined) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

export const ProfileExecutionContext =
  createContext<ProfileExecutionContextType>({
    profile: undefined,
    setProfile: () => {},
    enabled: false,
    setEnabled: () => {},
  });
