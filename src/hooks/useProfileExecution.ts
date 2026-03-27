import { useContext } from 'react';
import { ProfileExecutionContext } from '../context/ProfileExecutionContext.ts';
import type { Profile } from '../types/profile.ts';

export const useProfileExecutionEnabled = (): [
  boolean,
  (enabled: boolean) => void,
] => {
  const context = useContext(ProfileExecutionContext);
  if (context === undefined) {
    throw new Error(
      'useProfileExecution must be used within a ProfileExecutionProvider',
    );
  }
  return [context.enabled, context.setEnabled];
};

export const useProfileExecutionProfile = (): [
  Profile | undefined,
  (profile: Profile | undefined) => void,
] => {
  const context = useContext(ProfileExecutionContext);
  if (context === undefined) {
    throw new Error(
      'useProfileExecution must be used within a ProfileExecutionProvider',
    );
  }
  return [context.profile, context.setProfile];
};
