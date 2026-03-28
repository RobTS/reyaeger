import { useContext } from 'react';
import { ProfileExecutionContext } from '../context/ProfileExecutionContext.ts';
import type { Profile } from '../types/profile.ts';

export const useProfileExecutionEnabled = () => {
  const context = useContext(ProfileExecutionContext);
  if (context === undefined) {
    throw new Error(
      'useProfileExecution must be used within a ProfileExecutionProvider',
    );
  }
  return context.enabled;
};

export const useProfileExecutionCommands = () => {
  const context = useContext(ProfileExecutionContext);
  if (context === undefined) {
    throw new Error(
      'useProfileExecution must be used within a ProfileExecutionProvider',
    );
  }
  return {
    start: context.start,
    stop: context.stop,
  };
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
