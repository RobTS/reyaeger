import { combineReducers } from '@reduxjs/toolkit';
import { profileDraftReducer } from './profileDraft.ts';

export const editorReducer = combineReducers({
  profileDraft: profileDraftReducer,
});
