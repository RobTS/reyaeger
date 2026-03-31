import { combineReducers } from '@reduxjs/toolkit';
import { selectedProfileReducer } from './selectedProfile.ts';
import { storedProfilesReducer } from './savedProfiles.ts';

export const profileReducer = combineReducers({
  selectedProfile: selectedProfileReducer,
  storedProfiles: storedProfilesReducer,
});
