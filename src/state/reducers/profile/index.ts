import { combineReducers } from '@reduxjs/toolkit';
import { storedProfilesReducer } from './savedProfiles.ts';

export const profileReducer = combineReducers({
  storedProfiles: storedProfilesReducer,
});
