import { createReducer } from '@reduxjs/toolkit';
import type { NxProfile } from '../../../types/profile.ts';
import { Actions } from '../../actions';

export type SelectedProfileReducerState = Record<string, NxProfile>;

export const storedProfilesReducer = createReducer<SelectedProfileReducerState>(
  {},
  (builder) =>
    builder
      .addCase(Actions.setProfile, (state, action) => {
        if (action.payload) state[action.payload.name] = action.payload;
      })
      .addCase(Actions.removeStoredProfile, (state, action) => {
        delete state[action.payload.name];
      }),
);
