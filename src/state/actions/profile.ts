import { createAction } from '@reduxjs/toolkit';
import type { NxProfile } from '../../types/profile.ts';

export const setProfile = createAction<NxProfile | undefined, 'setProfile'>(
  'setProfile',
);

export const removeStoredProfile = createAction<
  { name: string },
  'removeStoredProfile'
>('removeStoredProfile');
