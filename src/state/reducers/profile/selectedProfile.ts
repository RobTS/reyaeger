import { createReducer } from '@reduxjs/toolkit';
import type { NxProfile } from '../../../types/profile.ts';
import { Actions } from '../../actions';

export type SelectedProfileReducerState = {
  profile?: NxProfile;
};

export const selectedProfileReducer =
  createReducer<SelectedProfileReducerState>({}, (builder) =>
    builder.addCase(Actions.setProfile, (state, action) => {
      state.profile = action.payload;
    }),
  );
